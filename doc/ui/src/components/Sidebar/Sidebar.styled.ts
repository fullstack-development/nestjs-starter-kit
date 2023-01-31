import styled from 'styled-components';

export const Sidebar = styled.div`
    width: 100%;
    height: 100%;
`;

export const CardWrapper = styled.div`
    & div.ant-card-body {
        padding-left: 0;
        padding-right: 0;
        padding-top: 18px;
        height: calc(100% - 76px);
    }
`;

export const Item = styled.div`
    ${Sidebar} & {
        color: white;
        text-decoration: none;
        width: 100%;
        height: 32px;
        cursor: pointer;
        display: flex;
        align-items: center;
        padding: 0 24px;

        & a:active,
        & a:link,
        & a:visited,
        & a:hover {
            text-decoration: none;
            color: #222;
        }

        &:hover {
            background-color: #eee;
        }

        &_active {
            background-color: #f4f4f4;
        }
    }
`;
