import styled from 'styled-components';

export const Header = styled.div`
    width: 100%;
    display: flex;
    padding: 16px;
    height: 60px;
    align-items: center;
    justify-content: center;
    position: fixed;
    z-index: 1;
    background: white;
`;

export const Logo = styled.img`
    ${Header} & {
        margin-right: 16px;
        height: 14px;
    }
`;

export const Title = styled.div`
    ${Header} & {
        font-size: 20px;
        color: #222;
    }
`;
