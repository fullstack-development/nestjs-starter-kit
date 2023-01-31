import React, { memo } from 'react';
import { Content, Title } from './CodeCard.styled';

type CodeCardProps = {
    children: React.ReactNode;
    title?: string;
    style?: React.CSSProperties;
};

const CodeCardComponent = memo<CodeCardProps>(({ children, style, title }) => {
    return (
        <div style={style}>
            {title && <Title>{title}</Title>}
            <Content hasTitle={!!title}>{children}</Content>
        </div>
    );
});

export { CodeCardComponent as CodeCard };
