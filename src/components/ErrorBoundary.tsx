import React, { Component, ErrorInfo, ReactNode, Key } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    key?: Key;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return (
                <div className="p-4 mb-3 bg-red-50 text-red-500 rounded-xl border border-red-100">
                    <p className="font-bold text-xs mb-1">Ошибка компонента:</p>
                    <p className="text-xs font-mono break-all">{this.state.error?.message || 'Неизвестная ошибка'}</p>
                </div>
            );
        }

        return this.props.children;
    }
}
