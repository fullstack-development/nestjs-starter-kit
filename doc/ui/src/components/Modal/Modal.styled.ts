import styled from 'styled-components';

export const Modal = styled.div`
    position: fixed;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.2);
    z-index: 2;
`;

export const Content = styled.div`
    ${Modal} & {
        min-width: 350px;
        min-height: 250px;
        max-width: 700px;
        max-height: 500px;
    }
`;

export const Title = styled.div`
    ${Modal} & {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
`;
