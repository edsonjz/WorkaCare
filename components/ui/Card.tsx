import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    subtitle?: string;
    headerAction?: React.ReactNode;
    footer?: React.ReactNode;
    noPadding?: boolean;
}

const Card: React.FC<CardProps> = ({
    children,
    className = '',
    title,
    subtitle,
    headerAction,
    footer,
    noPadding = false,
}) => {
    return (
        <div className={`bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden ${className}`}>
            {(title || subtitle || headerAction) && (
                <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                    <div>
                        {title && <h3 className="font-semibold text-slate-800">{title}</h3>}
                        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
                    </div>
                    {headerAction && <div>{headerAction}</div>}
                </div>
            )}
            <div className={noPadding ? '' : 'p-6'}>
                {children}
            </div>
            {footer && (
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
                    {footer}
                </div>
            )}
        </div>
    );
};

export default Card;
