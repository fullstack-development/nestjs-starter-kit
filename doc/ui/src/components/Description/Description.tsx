import { FileTextTwoTone } from '@ant-design/icons';
import { Card } from 'antd';
import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { config } from '../../config';
import * as Styled from './Description.styled';
import './Description.styled.ts';

const { DOC_DESCRIPTIONS } = config;

export const Description: React.FC = () => {
    const description = useMemo(() => atob(DOC_DESCRIPTIONS.description), []);

    return (
        <Styled.Description>
            <Card
                title={
                    <span>
                        <FileTextTwoTone />
                        {' Description'}
                    </span>
                }
            >
                <ReactMarkdown children={description} remarkPlugins={[remarkGfm]} />
            </Card>
        </Styled.Description>
    );
};
