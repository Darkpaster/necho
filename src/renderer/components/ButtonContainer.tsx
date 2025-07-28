import * as React from 'react';

interface props extends React.HTMLProps<HTMLDivElement> {
  styles?: string;
  children?: React.ReactNode;
}

export default function ButtonContainer({ styles, children, ...rest }: props) {
  return (
    <div
      className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${styles}`}
      {...rest}
    >
      {children}
    </div>
  );
}
