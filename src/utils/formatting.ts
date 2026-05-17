import { format, formatDistanceToNow } from 'date-fns';

export const formatCurrency = (amount: number | undefined | null): string => {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
    }).format(amount ?? 0);
};

export const formatDate = (date: string | Date | undefined | null): string => {
    if (!date) return 'N/A';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'N/A';
    return format(d, 'MMM dd, yyyy');
};

export const formatDateTime = (date: string | Date | undefined | null): string => {
    if (!date) return 'N/A';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'N/A';
    return format(d, 'MMM dd, yyyy HH:mm');
};

export const formatRelativeTime = (date: string | Date | undefined | null): string => {
    if (!date) return 'N/A';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'N/A';
    return formatDistanceToNow(d, { addSuffix: true });
};

export const formatPhoneNumber = (phoneNumber: string | undefined | null): string => {
    if (!phoneNumber) return 'N/A';
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.startsWith('234')) {
        return `+234 ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
    }
    if (cleaned.startsWith('0')) {
        return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }
    return phoneNumber;
};

export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}...`;
};

export const getInitials = (name: string | undefined | null): string => {
    if (!name) return '?';
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};
