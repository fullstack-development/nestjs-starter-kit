import styled from 'styled-components';

export const App = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;

    & .ant-card {
        border-color: #ddd;
    }
`;

export const Content = styled.div`
    ${App} & {
        display: flex;
        flex: 1;
        width: 100%;
    }
`;

export const Body = styled.div`
    ${App} & {
        display: flex;
        flex-direction: column;
        flex: 1;
        padding: 16px;
        margin-left: 300px;
        margin-top: 44px;
        overflow-wrap: break-word;
        max-width: calc(100% - 300px);
    }
`;
