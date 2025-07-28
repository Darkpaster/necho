import * as React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  styles?: string;
  children?: React.ReactNode;
}

export default function Button({ styles, children, ...rest }: ButtonProps) {
  return (
    <button
      className={`w-full py-2 px-4 rounded-md font-medium bg-blue-300 hover:bg-blue-400 dark:bg-blue-600 dark:hover:bg-blue-500
       dark:text-blue-200 text-blue-500 transition-colors duration-200 ${styles || ''}`}
      {...rest}
    >
      {children}
    </button>
  );
}
