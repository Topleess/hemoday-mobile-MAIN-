import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X, Loader2 } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { Button } from './Button';

export const NotificationOverlay: React.FC = () => {
    const { toast, dialog, isLoading, hideToast, hideDialog } = useNotification();

    // Auto-hide toast
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => {
                hideToast();
            }, toast.duration || 3000);
            return () => clearTimeout(timer);
        }
    }, [toast, hideToast]);

    const getIcon = (type: string, size = 20) => {
        switch (type) {
            case 'success': return <CheckCircle2 size={size} className="text-green-500" />;
            case 'error': return <AlertCircle size={size} className="text-red-500" />;
            case 'warning': return <AlertTriangle size={size} className="text-amber-500" />;
            default: return <Info size={size} className="text-blue-500" />;
        }
    };

    const getToastBg = (type: string) => {
        switch (type) {
            case 'success': return 'bg-green-50 border-green-100';
            case 'error': return 'bg-red-50 border-red-100';
            case 'warning': return 'bg-amber-50 border-amber-100';
            default: return 'bg-white border-gray-100';
        }
    };

    return (
        <>
            {/* Global Loader */}
            {isLoading && (
                <div className="fixed inset-0 bg-white/60 backdrop-blur-[2px] z-[100] flex items-center justify-center animate-in fade-in duration-200">
                    <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-3">
                        <Loader2 size={40} className="text-red-500 animate-spin" />
                        <span className="text-sm font-medium text-gray-600">Загрузка...</span>
                    </div>
                </div>
            )}

            {/* Toasts */}
            {toast && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-[110] animate-in slide-in-from-top duration-300">
                    <div className={`flex items-center gap-3 p-4 rounded-2xl border shadow-lg ${getToastBg(toast.type)}`}>
                        {getIcon(toast.type)}
                        <p className="text-sm font-medium text-gray-800 flex-1">{toast.message}</p>
                        <button onClick={hideToast} className="text-gray-400 hover:text-gray-600">
                            <X size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* Dialogs / Modals */}
            {dialog && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-[120] flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-8 text-center">
                            <div className={`w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center ${dialog.type === 'error' ? 'bg-red-50' :
                                    dialog.type === 'success' ? 'bg-green-50' :
                                        dialog.type === 'warning' ? 'bg-amber-50' : 'bg-blue-50'
                                }`}>
                                {getIcon(dialog.type || 'info', 32)}
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-2">{dialog.title}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">{dialog.message}</p>
                        </div>

                        <div className="p-4 bg-gray-50 flex gap-3">
                            {!dialog.isAlert && (
                                <Button
                                    variant="outline"
                                    fullWidth
                                    onClick={() => {
                                        if (dialog.onCancel) dialog.onCancel();
                                        hideDialog();
                                    }}
                                    className="bg-white border-gray-200 text-gray-600 h-14"
                                >
                                    {dialog.cancelText || 'Отмена'}
                                </Button>
                            )}
                            <Button
                                fullWidth
                                onClick={async () => {
                                    if (dialog.onConfirm) {
                                        await dialog.onConfirm();
                                    }
                                    hideDialog();
                                }}
                                className={`h-14 font-bold ${dialog.type === 'error' ? 'bg-red-500 hover:bg-red-600' :
                                        dialog.type === 'warning' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-gray-900'
                                    }`}
                            >
                                {dialog.confirmText || 'OK'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
