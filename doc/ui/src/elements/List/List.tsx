import React, { memo } from 'react';
import { Item, List, Prefix } from './List.styled';

export type ListProps = {
    items: Array<React.ReactNode>;
};

const ListComponent = memo<ListProps>(({ items }) => {
    return (
        <List>
            {items.map((it, i) => (
                <li key={i}>
                    <Prefix>—</Prefix>
                    <Item>{it}</Item>
                </li>
            ))}
        </List>
    );
});

export { ListComponent as List };
