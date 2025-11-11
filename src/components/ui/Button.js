import React from 'react';
import classNames from 'classnames';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) {
  const base = 'font-medium rounded-md inline-block transition-colors duration-200 text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 focus-visible:ring-offset-2';
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5',
    lg: 'px-6 py-3 text-lg',
  };
  const variants = {
    primary:
      'bg-brand-green text-white shadow-sm hover:bg-[linear-gradient(90deg,#32610E_0%,#22440A_100%)] hover:text-white focus:bg-[linear-gradient(90deg,#32610E_0%,#22440A_100%)] active:bg-brand-green-dark',
    outline:
      'border border-brand-green text-brand-green hover:bg-brand-green/10 focus:bg-brand-green/10',
  };

  return (
    <button
      {...props}
      className={classNames(base, sizes[size], variants[variant], className)}
    >
      {children}
    </button>
  );
}
