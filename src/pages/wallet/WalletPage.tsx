import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { walletApi } from '../../api/wallet.api';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import { Wallet, Transaction, TransactionType, TransactionStatus } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils/formatting';
import { PAGINATION } from '../../utils/constants';

// ── Transaction type icon/label config ───────────────────────────────────────

const TRANSACTION_CONFIG: Record<
  TransactionType,
  { label: string; icon: string; colorClass: string; amountClass: string }
> = {
  CREDIT: {
    label: 'Credit',
    icon: '↓',
    colorClass: 'bg-green-100 text-green-700',
    amountClass: 'text-green-700',
  },
  DEBIT: {
    label: 'Debit',
    icon: '↑',
    colorClass: 'bg-red-100 text-red-700',
    amountClass: 'text-red-700',
  },
  ESCROW_HOLD: {
    label: 'Escrow Hold',
    icon: '🔒',
    colorClass: 'bg-yellow-100 text-yellow-700',
    amountClass: 'text-yellow-700',
  },
  ESCROW_RELEASE: {
    label: 'Escrow Release',
    icon: '🔓',
    colorClass: 'bg-blue-100 text-blue-700',
    amountClass: 'text-blue-700',
  },
  REFERRAL_COMMISSION: {
    label: 'Referral Commission',
    icon: '🎁',
    colorClass: 'bg-purple-100 text-purple-700',
    amountClass: 'text-purple-700',
  },
  WITHDRAWAL: {
    label: 'Withdrawal',
    icon: '💸',
    colorClass: 'bg-gray-100 text-gray-700',
    amountClass: 'text-gray-700',
  },
};

const STATUS_CONFIG: Record<TransactionStatus, { label: string; classes: string }> = {
  PENDING: { label: 'Pending', classes: 'bg-yellow-100 text-yellow-700' },
  COMPLETED: { label: 'Completed', classes: 'bg-green-100 text-green-700' },
  FAILED: { label: 'Failed', classes: 'bg-red-100 text-red-700' },
};

// ── Sub-components ────────────────────────────────────────────────────────────

const TransactionTypeBadge: React.FC<{ type: TransactionType }> = ({ type }) => {
  const config = TRANSACTION_CONFIG[type] ?? {
    label: type,
    icon: '•',
    colorClass: 'bg-gray-100 text-gray-700',
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.colorClass}`}
    >
      <span aria-hidden="true">{config.icon}</span>
      {config.label}
    </span>
  );
};

const TransactionStatusBadge: React.FC<{ status: TransactionStatus }> = ({ status }) => {
  const config = STATUS_CONFIG[status] ?? { label: status, classes: 'bg-gray-100 text-gray-700' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.classes}`}>
      {config.label}
    </span>
  );
};

// ── Withdrawal Form ───────────────────────────────────────────────────────────

interface Bank { id: number; name: string; code: string; }

interface WithdrawalFormProps {
  walletBalance: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const inputClass = (hasError: boolean) =>
  `w-full px-3 py-3 border rounded-[10px] text-base focus:outline-none focus:ring-2 focus:ring-primary-600/10 focus:border-primary-600 min-h-[44px] ${hasError ? 'border-red-400' : 'border-line'}`;

const WithdrawalForm: React.FC<WithdrawalFormProps> = ({ walletBalance, onSuccess, onCancel }) => {
  const [amount, setAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [bankSearch, setBankSearch] = useState('');
  const [showBankList, setShowBankList] = useState(false);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');

  const { data: banksData } = useQuery<{ banks: Bank[] }>({
    queryKey: ['banks'],
    queryFn: async () => {
      const res = await walletApi.getBanks() as any;
      return res?.data ?? res;
    },
    staleTime: 10 * 60 * 1000,
  });

  const banks: Bank[] = banksData?.banks ?? [];
  const filteredBanks = banks.filter((b) =>
    b.name.toLowerCase().includes(bankSearch.toLowerCase())
  );

  const mutation = useMutation({
    mutationFn: (data: Parameters<typeof walletApi.requestWithdrawal>[0]) =>
      walletApi.requestWithdrawal(data),
    onSuccess: (res: any) => {
      const msg = res?.data?.message ?? 'Withdrawal initiated successfully';
      setSuccess(msg);
      toast.success(msg);
      setTimeout(() => onSuccess(), 1800);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error ?? err?.message ?? 'Withdrawal failed';
      toast.error(msg);
    },
  });

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Enter a valid amount';
    } else if (numAmount > walletBalance) {
      newErrors.amount = `Amount exceeds available balance (${formatCurrency(walletBalance)})`;
    }
    if (!selectedBank) newErrors.bank = 'Select your bank';
    if (!accountNumber.trim() || !/^\d{10}$/.test(accountNumber.trim())) {
      newErrors.accountNumber = 'Enter a valid 10-digit account number';
    }
    if (!accountName.trim()) newErrors.accountName = 'Account name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !selectedBank) return;
    mutation.mutate({
      amount: parseFloat(amount),
      accountNumber: accountNumber.trim(),
      bankCode: selectedBank.code,
      bankName: selectedBank.name,
      accountName: accountName.trim(),
    });
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-800">{success}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <h3 className="text-base font-display font-semibold text-ink">Withdraw Funds</h3>

      {/* Amount */}
      <div>
        <label htmlFor="withdrawal-amount" className="block text-sm font-medium text-ink mb-1">Amount (NGN)</label>
        <input
          id="withdrawal-amount" type="number" min="1" step="1"
          value={amount} onChange={(e) => setAmount(e.target.value)}
          className={inputClass(!!errors.amount)} placeholder="0"
        />
        {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount}</p>}
        <div className="flex justify-between mt-1">
          <p className="text-xs text-slate">Available: {formatCurrency(walletBalance)}</p>
          <button type="button" className="text-xs text-primary-600 hover:underline"
            onClick={() => setAmount(String(walletBalance))}>
            Withdraw all
          </button>
        </div>
      </div>

      {/* Bank selector */}
      <div className="relative">
        <label className="block text-sm font-medium text-ink mb-1">Bank</label>
        <button
          type="button"
          onClick={() => setShowBankList((v) => !v)}
          className={`w-full text-left px-3 py-3 border rounded-[10px] text-base min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary-600/10 focus:border-primary-600 ${errors.bank ? 'border-red-400' : 'border-line'}`}
        >
          {selectedBank ? selectedBank.name : <span className="text-gray-400">Select bank…</span>}
        </button>
        {errors.bank && <p className="mt-1 text-xs text-red-600">{errors.bank}</p>}
        {showBankList && (
          <div className="absolute z-20 mt-1 w-full bg-white border border-line rounded-xl shadow-lg">
            <div className="p-2 border-b border-line">
              <input
                autoFocus
                type="text"
                placeholder="Search bank…"
                value={bankSearch}
                onChange={(e) => setBankSearch(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600/10"
              />
            </div>
            <ul className="max-h-52 overflow-y-auto divide-y divide-line">
              {filteredBanks.length === 0 ? (
                <li className="px-3 py-3 text-sm text-slate text-center">No banks found</li>
              ) : filteredBanks.map((b) => (
                <li key={b.code}>
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2.5 text-sm hover:bg-primary-50 transition-colors"
                    onClick={() => { setSelectedBank(b); setShowBankList(false); setBankSearch(''); }}
                  >
                    {b.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Account number */}
      <div>
        <label htmlFor="account-number" className="block text-sm font-medium text-ink mb-1">Account Number</label>
        <input
          id="account-number" type="text" inputMode="numeric" maxLength={10}
          value={accountNumber} onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
          className={inputClass(!!errors.accountNumber)} placeholder="10-digit account number"
        />
        {errors.accountNumber && <p className="mt-1 text-xs text-red-600">{errors.accountNumber}</p>}
      </div>

      {/* Account name */}
      <div>
        <label htmlFor="account-name" className="block text-sm font-medium text-ink mb-1">Account Name</label>
        <input
          id="account-name" type="text"
          value={accountName} onChange={(e) => setAccountName(e.target.value)}
          className={inputClass(!!errors.accountName)} placeholder="Name on the account"
        />
        {errors.accountName && <p className="mt-1 text-xs text-red-600">{errors.accountName}</p>}
      </div>

      <p className="text-xs text-slate bg-gray-50 rounded-lg p-3">
        Funds are sent via Paystack and typically arrive within a few minutes. A small Paystack transfer fee may apply.
      </p>

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary" className="flex-1" isLoading={mutation.isPending} disabled={mutation.isPending}>
          Withdraw {amount ? formatCurrency(parseFloat(amount) || 0) : 'Funds'}
        </Button>
      </div>
    </form>
  );
};

// ── Main WalletPage ───────────────────────────────────────────────────────────

/**
 * WalletPage — displays wallet balance, transaction history with pagination,
 * and a withdrawal request form.
 * Requirements: 12.1, 12.2, 12.3, 12.4, 12.5
 */
export default function WalletPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [showWithdrawal, setShowWithdrawal] = useState(false);
  const pageSize = PAGINATION.DEFAULT_PAGE_SIZE;

  // Fetch wallet balance
  const {
    data: wallet,
    isLoading: walletLoading,
    error: walletError,
    refetch: refetchWallet,
  } = useQuery<Wallet>({
    queryKey: ['wallet'],
    queryFn: async () => {
      const res = await walletApi.getWallet() as any;
      return res?.data?.wallet ?? res?.data ?? res;
    },
  });

  // Fetch transactions with pagination
  const {
    data: txData,
    isLoading: txLoading,
    error: txError,
    refetch: refetchTx,
  } = useQuery<{ transactions: Transaction[]; total: number; totalPages: number }>({
    queryKey: ['wallet-transactions', page],
    queryFn: async () => {
      const res = await walletApi.getTransactions({ page, pageSize }) as any;
      const raw = res?.data ?? res;
      // Handle both paginated and array responses
      if (Array.isArray(raw)) {
        return { transactions: raw, total: raw.length, totalPages: 1 };
      }
      const transactions = raw?.transactions ?? raw?.data ?? [];
      const total = raw?.total ?? transactions.length;
      const totalPages = (raw?.totalPages ?? Math.ceil(total / pageSize)) || 1;
      return { transactions, total, totalPages };
    },
    placeholderData: (prev) => prev,
  });

  const handleWithdrawalSuccess = () => {
    setShowWithdrawal(false);
    queryClient.invalidateQueries({ queryKey: ['wallet'] });
    queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
  };

  const isLoading = walletLoading || txLoading;

  if (isLoading && !wallet) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (walletError && !wallet) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 text-center">
        <p className="text-red-600 mb-4">Failed to load wallet information.</p>
        <Button onClick={() => refetchWallet()}>Retry</Button>
      </div>
    );
  }

  const transactions = txData?.transactions ?? [];
  const totalPages = txData?.totalPages ?? 1;
  const total = txData?.total ?? 0;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-ink">Wallet</h1>
        <p className="text-slate mt-1">Manage your balance and transactions</p>
      </div>

      {/* Balance card */}
      {wallet && (
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 text-white shadow-md">
          <p className="text-sm font-medium text-primary-100">Available Balance</p>
          <p className="text-4xl font-bold mt-1">{formatCurrency(wallet.balance)}</p>
          {wallet.ledger !== wallet.balance && (
            <p className="text-sm text-primary-200 mt-2">
              Ledger balance: {formatCurrency(wallet.ledger)}
            </p>
          )}
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              className="border-white text-white hover:bg-white hover:text-primary-700 focus:ring-white"
              onClick={() => setShowWithdrawal((v) => !v)}
            >
              {showWithdrawal ? 'Cancel Withdrawal' : 'Request Withdrawal'}
            </Button>
          </div>
        </div>
      )}

      {/* Withdrawal form */}
      {showWithdrawal && wallet && (
        <div className="bg-white rounded-xl border border-line p-6 shadow-sm">
          <WithdrawalForm walletBalance={wallet.balance} onSuccess={handleWithdrawalSuccess} onCancel={() => setShowWithdrawal(false)} />
        </div>
      )}

      {/* Transaction history */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-semibold text-ink">Transaction History</h2>
          {total > 0 && (
            <span className="text-sm text-slate">{total} transaction{total !== 1 ? 's' : ''}</span>
          )}
        </div>

        {txLoading && transactions.length === 0 ? (
          <div className="flex justify-center py-10">
            <Spinner size="md" />
          </div>
        ) : txError ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-3">Failed to load transactions.</p>
            <Button variant="outline" size="sm" onClick={() => refetchTx()}>
              Retry
            </Button>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-400 text-lg">No transactions yet.</p>
          </div>
        ) : (
          <>
            {/* Mobile: card list; Desktop: table */}
        <div className="bg-white rounded-xl border border-line overflow-hidden">
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full divide-y divide-line">
                  <thead className="bg-primary-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate uppercase tracking-wider hidden sm:table-cell">Description</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-slate uppercase tracking-wider hidden md:table-cell">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate uppercase tracking-wider hidden lg:table-cell">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {transactions.map((tx) => {
                      const config = TRANSACTION_CONFIG[tx.type];
                      return (
                        <tr key={tx.id} className="hover:bg-primary-50 transition-colors">
                          <td className="px-4 py-3"><TransactionTypeBadge type={tx.type} /></td>
                          <td className="px-4 py-3 text-sm text-slate hidden sm:table-cell max-w-[200px] truncate">{tx.description ?? tx.reference}</td>
                          <td className={`px-4 py-3 text-sm font-semibold text-right ${config?.amountClass ?? 'text-ink'}`}>{formatCurrency(tx.amount)}</td>
                          <td className="px-4 py-3 text-center hidden md:table-cell"><TransactionStatusBadge status={tx.status} /></td>
                          <td className="px-4 py-3 text-sm text-slate hidden lg:table-cell whitespace-nowrap">{formatDateTime(tx.createdAt)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* Mobile card list */}
              <div className="sm:hidden divide-y divide-line">
                {transactions.map((tx) => {
                  const config = TRANSACTION_CONFIG[tx.type];
                  return (
                    <div key={tx.id} className="px-4 py-3 flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <TransactionTypeBadge type={tx.type} />
                        <p className="text-xs text-slate mt-1 truncate">{tx.description ?? tx.reference}</p>
                        <p className="text-xs text-slate/60 mt-0.5">{formatDateTime(tx.createdAt)}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-sm font-semibold ${config?.amountClass ?? 'text-ink'}`}>{formatCurrency(tx.amount)}</p>
                        <TransactionStatusBadge status={tx.status} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    aria-label="Previous page"
                  >
                    ← Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    aria-label="Next page"
                  >
                    Next →
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
