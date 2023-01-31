import { ProfileTwoTone } from '@ant-design/icons';
import { Card } from 'antd';
import React, { memo } from 'react';
import { HashLink } from 'react-router-hash-link';
import { CardWrapper, Item, Sidebar } from './Sidebar.styled';

export type SideBarItem = {
    title: JSX.Element;
    hash: string;
    items?: Array<SideBarItem>;
};

export type SidebarProps = {
    items: Array<SideBarItem>;
};

const SidebarComponent = memo<SidebarProps>(({ items }) => {
    return (
        <CardWrapper>
            <Card
                style={{
                    position: 'fixed',
                    height: 'calc(100% - 76px)',
                    width: 284,
                    marginTop: 60,
                    marginLeft: 16,
                    zIndex: 1,
                    padding: 0,
                }}
                title={
                    <span>
                        <ProfileTwoTone />
                        {' Menu'}
                    </span>
                }
            >
                <Sidebar>
                    {items.map((i) => (
                        <>
                            <HashLink key={i.hash} to={`/#${i.hash}`}>
                                <Item>{i.title}</Item>
                            </HashLink>
                            {i.items &&
                                i.items.map((i) => (
                                    <HashLink to={`/#${i.hash}`}>
                                        <Item key={i.hash} style={{ paddingLeft: 36 }}>
                                            {i.title}
                                        </Item>
                                    </HashLink>
                                ))}
                        </>
                    ))}
                </Sidebar>
            </Card>
        </CardWrapper>
    );
});

export { SidebarComponent as Sidebar };
