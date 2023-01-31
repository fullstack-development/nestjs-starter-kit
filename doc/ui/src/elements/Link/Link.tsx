import React, { memo } from 'react';
import { Link } from './Link.styled';

export type LinkTextProps = {
    title: string;
    href: string;
};

const LinkTextComponent = memo<LinkTextProps>(({ title, href }) => {
    return <Link href={href}>{title}</Link>;
});

export { LinkTextComponent as LinkText };
