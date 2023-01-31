import { ApiTwoTone } from '@ant-design/icons';
import { Card } from 'antd';
import React, { memo } from 'react';
import { ApiHostCard } from './ApiHostCard.styled';

export type ApiHostCardProps = {
    id: string;
    title: string;
    children: React.ReactNode;
};

const ApiHostCardComponent = memo<ApiHostCardProps>(({ id, title, children }) => {
    return (
        <ApiHostCard id={id}>
            <Card
                title={
                    <span>
                        <ApiTwoTone />
                        {` ${title}`}
                    </span>
                }
            >
                {children}
            </Card>
        </ApiHostCard>
    );
});

export { ApiHostCardComponent as ApiHostCard };
