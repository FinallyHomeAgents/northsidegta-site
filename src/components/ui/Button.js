import React from 'react';
import classNames from 'classnames';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) {
  const base = 'font-medium rounded-md inline-block transition duration-200 text-center';
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5',
    lg: 'px-6 py-3 text-lg',
  };
  const variants = {
    primary: 'bg-green-600 text-white hover:bg-green-700',
    outline: 'border border-green-600 text-green-600 hover:bg-green-100',
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
