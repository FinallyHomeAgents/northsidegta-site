import React from 'react';
import classNames from 'classnames';

export default function Card({ children, className = '', ...props }) {
  return (
    <div
      {...props}
      className={classNames(
        'bg-white rounded-lg shadow-md p-6 md:p-8 transition hover:shadow-lg',
        className
      )}
    >
      {children}
    </div>
  );
}
