import React, { forwardRef } from 'react';
import { accessibleColors } from '@/lib/colors';

// Accessible Link Component
interface AccessibleLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export const AccessibleLink = forwardRef<HTMLAnchorElement, AccessibleLinkProps>(
  ({ children, variant = 'primary', size = 'md', className = '', ...props }, ref) => {
    const baseClasses = 'transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 rounded-sm';
    
    const variantClasses = {
      primary: 'text-[#a78bfa] hover:text-[#c4b5fd] underline decoration-2 underline-offset-2',
      secondary: 'text-[#cbd5e0] hover:text-[#e2e8f0] no-underline hover:underline',
    };

    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    };

    return (
      <a
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {children}
      </a>
    );
  }
);

AccessibleLink.displayName = 'AccessibleLink';

// Accessible Button Component
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ children, variant = 'primary', size = 'md', loading = false, className = '', disabled, ...props }, ref) => {
    const baseClasses = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantClasses = {
      primary: 'bg-[#7c3aed] text-white hover:bg-[#6d28d9] active:bg-[#5b21b6]',
      secondary: 'bg-[#4c1d95] text-white hover:bg-[#5b21b6] active:bg-[#6d28d9]',
      outline: 'border-2 border-[#7c3aed] text-[#a78bfa] hover:bg-[#7c3aed] hover:text-white',
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm min-h-[32px]',
      md: 'px-4 py-2 text-base min-h-[40px]',
      lg: 'px-6 py-3 text-lg min-h-[48px]',
    };

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';

// Accessible Input Component
interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const AccessibleInput = forwardRef<HTMLInputElement, AccessibleInputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;

    return (
      <div className="space-y-1">
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-[#e2e8f0]"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-3 py-2 
            bg-[#1e1332] 
            border border-[#4c1d95] 
            text-[#ffffff] 
            placeholder-[#9ca3af]
            rounded-lg 
            focus:outline-none 
            focus:ring-2 
            focus:ring-[#7c3aed] 
            focus:border-transparent
            disabled:opacity-50 
            disabled:cursor-not-allowed
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={[errorId, helperId].filter(Boolean).join(' ') || undefined}
          {...props}
        />
        {error && (
          <p id={errorId} className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="text-sm text-[#a0aec0]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

AccessibleInput.displayName = 'AccessibleInput';

// Accessible Card Component
interface AccessibleCardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  role?: string;
}

export const AccessibleCard: React.FC<AccessibleCardProps> = ({ 
  children, 
  title, 
  className = '', 
  role = 'region' 
}) => {
  return (
    <div 
      className={`
        bg-[#1e1332] 
        border border-[#4c1d95] 
        rounded-lg 
        p-6 
        shadow-lg
        ${className}
      `}
      role={role}
      aria-labelledby={title ? `card-title-${Math.random().toString(36).substr(2, 9)}` : undefined}
    >
      {title && (
        <h3 
          id={`card-title-${Math.random().toString(36).substr(2, 9)}`}
          className="text-lg font-semibold text-[#ffffff] mb-4"
        >
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

// Accessible Footer Component
interface AccessibleFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const AccessibleFooter: React.FC<AccessibleFooterProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <footer 
      className={`
        bg-[#0a0118] 
        text-[#e2e8f0] 
        py-6 
        px-4
        border-t 
        border-[#4c1d95]
        ${className}
      `}
      role="contentinfo"
    >
      {children}
    </footer>
  );
};

// Skip to main content link (for keyboard navigation)
export const SkipToMainContent: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="
        sr-only 
        focus:not-sr-only 
        focus:absolute 
        focus:top-4 
        focus:left-4 
        focus:z-50 
        bg-[#7c3aed] 
        text-white 
        px-4 
        py-2 
        rounded-lg 
        font-medium
        focus:outline-none 
        focus:ring-2 
        focus:ring-offset-2 
        focus:ring-purple-500
      "
    >
      Skip to main content
    </a>
  );
};
