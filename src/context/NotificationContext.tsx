import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface DialogOptions {
    title: string;
    message: string;
    type?: NotificationType;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void | Promise<void>;
    onCancel?: () => void;
    isAlert?: boolean; // If true, only show "OK" button
}

interface ToastOptions {
    message: string;
    type: NotificationType;
    duration?: number;
}

interface NotificationContextType {
    showToast: (options: ToastOptions | string) => void;
    showDialog: (options: DialogOptions) => void;
    showAlert: (title: string, message: string, type?: NotificationType, onConfirm?: () => void) => void;
    showConfirm: (title: string, message: string, onConfirm: () => void | Promise<void>, options?: Partial<DialogOptions>) => void;
    setLoading: (isLoading: boolean) => void;

    // Internal state for Overlay
    toast: ToastOptions | null;
    dialog: DialogOptions | null;
    isLoading: boolean;
    hideToast: () => void;
    hideDialog: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toast, setToast] = useState<ToastOptions | null>(null);
    const [dialog, setDialog] = useState<DialogOptions | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const hideToast = useCallback(() => setToast(null), []);
    const hideDialog = useCallback(() => setDialog(null), []);

    const showToast = useCallback((options: ToastOptions | string) => {
        if (typeof options === 'string') {
            setToast({ message: options, type: 'info', duration: 3000 });
        } else {
            setToast({ duration: 3000, ...options });
        }
    }, []);

    const showDialog = useCallback((options: DialogOptions) => {
        setDialog(options);
    }, []);

    const showAlert = useCallback((title: string, message: string, type: NotificationType = 'info', onConfirm?: () => void) => {
        setDialog({
            title,
            message,
            type,
            isAlert: true,
            confirmText: 'OK',
            onConfirm: () => {
                hideDialog();
                if (onConfirm) onConfirm();
            }
        });
    }, [hideDialog]);

    const showConfirm = useCallback((title: string, message: string, onConfirm: () => void | Promise<void>, options?: Partial<DialogOptions>) => {
        setDialog({
            title,
            message,
            type: 'warning',
            confirmText: 'Подтвердить',
            cancelText: 'Отмена',
            ...options,
            onConfirm: async () => {
                hideDialog();
                await onConfirm();
            },
            onCancel: () => {
                hideDialog();
                if (options?.onCancel) options.onCancel();
            }
        });
    }, [hideDialog]);

    const setLoading = useCallback((loading: boolean) => {
        setIsLoading(loading);
    }, []);

    return (
        <NotificationContext.Provider value={{
            showToast,
            showDialog,
            showAlert,
            showConfirm,
            setLoading,
            toast,
            dialog,
            isLoading,
            hideToast,
            hideDialog
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};
