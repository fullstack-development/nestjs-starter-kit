import { ConfigProvider } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { Scrollbars } from 'react-custom-scrollbars-2';
import { Description } from '../components/Description/Description';
import { GuardModal } from '../components/GuardModal/GuardModal';
import { Header } from '../components/header/Header';
import { Sidebar, SideBarItem } from '../components/Sidebar/Sidebar';
import { TypeModal } from '../components/TypeModal/TypeModal';
import { config, DocMethod } from '../config';
import { App, Body, Content } from './App.styled';
import { ApiHostCard } from './elements/ApiHostCard/ApiHostCard';
import { MethodCard } from './elements/MethodCard/MethodCard';
import { SidebarMethod } from './elements/SidebarMethod/SidebarMethod';
import { SidebarRoot } from './elements/SidebarRoot/SidebarRoot';

type MethodsGroup = Record<string, Array<DocMethod>>;

const groupMethods = () => {
    const methods: MethodsGroup = {};
    config.DOC_GENERATED.methods.forEach((m) => {
        if (!methods[m.apiHost]) {
            methods[m.apiHost] = [m];
        } else {
            methods[m.apiHost].push(m);
        }
    });
    return methods;
};

const AppComponent: React.FC = () => {
    const [methods, setMethods] = useState<MethodsGroup>({});
    const [sidebarItems, setSidebarItems] = useState<Array<SideBarItem>>([]);
    const items = useMemo(
        () => [
            {
                title: <span style={{ fontWeight: '600' }}>Description</span>,
                hash: 'description',
            },
            ...sidebarItems,
        ],
        [sidebarItems],
    );

    useEffect(() => {
        const methods = groupMethods();
        setSidebarItems(
            Object.keys(methods).map((k) => ({
                title: <SidebarRoot text={k} />,
                hash: k.replace('/', '_'),
                items: methods[k].map((m) => ({
                    title: <SidebarMethod method={m} />,
                    hash: `${m.apiHost.replace('/', '_')}__${m.address}`,
                })),
            })),
        );
        setMethods(methods);
    }, []);

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#333',
                },
            }}
        >
            <App>
                <Header />
                <Content>
                    <Sidebar items={items} />
                    <Body>
                        <Scrollbars id="scroll">
                            <div id="description">
                                <Description />
                            </div>
                            {Object.keys(methods).map((k) => (
                                <ApiHostCard key={k} title={k} id={k.replace('/', '_')}>
                                    {methods[k].map((m, i) => (
                                        <MethodCard isFirst={i === 0} method={m} />
                                    ))}
                                </ApiHostCard>
                            ))}
                        </Scrollbars>
                    </Body>
                </Content>
                <GuardModal />
                <TypeModal />
            </App>
        </ConfigProvider>
    );
};

export { AppComponent as App };
