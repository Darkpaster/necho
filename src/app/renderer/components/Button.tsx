import * as React from 'react';

interface props extends React.HTMLProps<HTMLDivElement> {
  styles?: string;
  children?: React.ReactNode;
}

export default function Button({ styles, children, ...rest }: props) {
  return (
    <div
      className={`p-6 bg-gradient-to-r bg-blue-300 dark:bg-blue-600 hover:animate-ping ${styles}`}
    >
      {children}
    </div>
  );
}
