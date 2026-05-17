import apiClient from './client';

export const walletApi = {
    getWallet: () => apiClient.get('/wallet'),
    getTransactions: (params?: any) => apiClient.get('/wallet/transactions', { params }),
    getBanks: () => apiClient.get('/wallet/banks'),
    requestWithdrawal: (data: {
        amount: number;
        accountNumber: string;
        bankCode: string;
        bankName: string;
        accountName: string;
    }) => apiClient.post('/wallet/withdraw', data),
};
