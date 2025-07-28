import * as React from 'react';
interface props extends React.HTMLProps<HTMLDivElement> {
    styles?: string;
    children?: React.ReactNode;
}
export default function Button({ styles, children, ...rest }: props): import("react/jsx-runtime").JSX.Element;
export {};
