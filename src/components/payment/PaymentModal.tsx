import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { paymentApi } from '../../api/payment.api';

interface PaymentModalProps {
  jobId: string;
  amount: number;
  jobTitle?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (reference: string) => void;
  onError?: (error: string) => void;
}

type PaymentState = 'idle' | 'initializing' | 'awaiting' | 'verifying' | 'success' | 'error';

const formatAmount = (value: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(value);

const PaymentModal: React.FC<PaymentModalProps> = ({
  jobId,
  amount,
  jobTitle,
  isOpen,
  onClose,
  onSuccess,
  onError,
}) => {
  const [paymentState, setPaymentState] = useState<PaymentState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [reference, setReference] = useState('');

  const handleInitiatePayment = async () => {
    setPaymentState('initializing');
    setErrorMessage('');

    try {
      const response = await paymentApi.initializePayment({ jobId, amount });
      const data = response as any;

      const authorizationUrl =
        data?.data?.authorization_url ||
        data?.authorization_url ||
        data?.authorizationUrl;

      const ref =
        data?.data?.reference ||
        data?.reference ||
        data?.data?.data?.reference;

      if (!authorizationUrl) {
        throw new Error('Payment initialization failed — no redirect URL received.');
      }

      setReference(ref || '');
      setPaymentState('awaiting');
      window.open(authorizationUrl, '_blank', 'noopener,noreferrer');
    } catch (err: any) {
      const msg = err?.message || 'Failed to initialize payment. Please try again.';
      setErrorMessage(msg);
      setPaymentState('error');
      onError?.(msg);
    }
  };

  const handleVerifyPayment = async () => {
    if (!reference) {
      setErrorMessage('Payment reference not found. Please try again.');
      setPaymentState('error');
      return;
    }
    setPaymentState('verifying');
    setErrorMessage('');
    try {
      await paymentApi.verifyPayment(reference);
      setPaymentState('success');
      onSuccess(reference);
    } catch (err: any) {
      const msg = err?.message || 'Payment verification failed. Please try again.';
      setErrorMessage(msg);
      setPaymentState('error');
      onError?.(msg);
    }
  };

  const handleClose = () => {
    setPaymentState('idle');
    setErrorMessage('');
    setReference('');
    onClose();
  };

  const handleRetry = () => {
    setPaymentState('idle');
    setErrorMessage('');
    setReference('');
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Fund Escrow" size="sm">
      {paymentState === 'idle' && (
        <IdleView amount={amount} jobTitle={jobTitle} onPay={handleInitiatePayment} onCancel={handleClose} />
      )}
      {paymentState === 'initializing' && (
        <LoadingView message="Initializing payment..." />
      )}
      {paymentState === 'awaiting' && (
        <AwaitingView onVerify={handleVerifyPayment} onCancel={handleClose} />
      )}
      {paymentState === 'verifying' && (
        <LoadingView message="Confirming your payment..." />
      )}
      {paymentState === 'success' && (
        <SuccessView onClose={handleClose} />
      )}
      {paymentState === 'error' && (
        <ErrorView message={errorMessage} onRetry={handleRetry} onClose={handleClose} />
      )}
    </Modal>
  );
};

const IdleView: React.FC<{
  amount: number;
  jobTitle?: string;
  onPay: () => void;
  onCancel: () => void;
}> = ({ amount, jobTitle, onPay, onCancel }) => (
  <div className="space-y-4">
    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
      {jobTitle && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Job</span>
          <span className="font-medium text-gray-900 truncate max-w-[60%]">{jobTitle}</span>
        </div>
      )}
      <div className="flex justify-between">
        <span className="text-gray-500">Amount</span>
        <span className="text-lg font-bold text-gray-900">{formatAmount(amount)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Via</span>
        <span className="font-medium text-gray-900">Paystack (secure)</span>
      </div>
    </div>
    <p className="text-sm text-gray-500">
      You'll be taken to Paystack to pay. Once done, come back here and click <strong>"I've Paid"</strong> — we'll confirm automatically.
    </p>
    <div className="flex gap-3 pt-2">
      <Button variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
      <Button variant="primary" className="flex-1" onClick={onPay}>
        Pay {formatAmount(amount)}
      </Button>
    </div>
  </div>
);

const AwaitingView: React.FC<{
  onVerify: () => void;
  onCancel: () => void;
}> = ({ onVerify, onCancel }) => (
  <div className="space-y-4">
    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
      <span className="text-2xl">💳</span>
      <div>
        <p className="text-sm font-semibold text-blue-900">Paystack is open in a new tab</p>
        <p className="text-sm text-blue-700 mt-0.5">
          Complete the payment there, then come back here and tap the button below. We'll confirm it automatically — no reference code needed.
        </p>
      </div>
    </div>
    <div className="flex gap-3 pt-1">
      <Button variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
      <Button variant="primary" className="flex-1" onClick={onVerify}>
        I've Paid ✓
      </Button>
    </div>
  </div>
);

const LoadingView: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-8 space-y-3">
    <svg className="animate-spin h-10 w-10 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
    <p className="text-gray-600 text-sm">{message}</p>
  </div>
);

const SuccessView: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="flex flex-col items-center justify-center py-6 space-y-4 text-center">
    <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
      <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <div>
      <h3 className="text-lg font-semibold text-gray-900">Payment Confirmed!</h3>
      <p className="text-sm text-gray-500 mt-1">Funds are now held securely in escrow. The artisan can start work.</p>
    </div>
    <Button variant="primary" onClick={onClose} className="w-full">Done</Button>
  </div>
);

const ErrorView: React.FC<{ message: string; onRetry: () => void; onClose: () => void }> = ({ message, onRetry, onClose }) => (
  <div className="flex flex-col items-center justify-center py-6 space-y-4 text-center">
    <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
      <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>
    <div>
      <h3 className="text-lg font-semibold text-gray-900">Something went wrong</h3>
      <p className="text-sm text-gray-500 mt-1">{message}</p>
    </div>
    <div className="flex gap-3 w-full">
      <Button variant="outline" className="flex-1" onClick={onClose}>Close</Button>
      <Button variant="primary" className="flex-1" onClick={onRetry}>Try Again</Button>
    </div>
  </div>
);

export default PaymentModal;
