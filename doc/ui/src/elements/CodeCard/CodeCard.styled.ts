import styled from 'styled-components';

export const Content = styled.div<{ hasTitle: boolean }>`
    padding: 1em;
    background: rgba(0, 0, 0, 0.025);
    border-radius: 6px;

    border-top-left-radius: ${({ hasTitle }) => (hasTitle ? 0 : '6px')};
`;

export const Title = styled.div`
    padding: 0 1em;
    font-weight: 600;
    font-size: 14;
    background: rgba(0, 0, 0, 0.025);
    width: fit-content;
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
`;
