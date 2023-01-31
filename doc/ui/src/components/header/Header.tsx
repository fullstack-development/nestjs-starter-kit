import React from 'react';
import { Header, Logo, Title } from './Header.styled';
import logo from './img/logo.png';

const HeaderComponent: React.FC = () => {
    return (
        <Header>
            <Logo src={logo} />
            <Title>NestJS Starter Kit Api</Title>
        </Header>
    );
};

export { HeaderComponent as Header };
