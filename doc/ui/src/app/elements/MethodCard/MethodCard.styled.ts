import styled from 'styled-components';

export const MethodCard = styled.div<{ color: string }>`
    & .ant-card-head {
        background: ${({ color }) => color};
    }
`;
