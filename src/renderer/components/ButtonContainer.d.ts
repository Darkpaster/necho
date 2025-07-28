import * as React from 'react';
interface props extends React.HTMLProps<HTMLDivElement> {
    styles?: string;
    children?: React.ReactNode;
}
export default function ButtonContainer({ styles, children, ...rest }: props): import("react/jsx-runtime").JSX.Element;
export {};
