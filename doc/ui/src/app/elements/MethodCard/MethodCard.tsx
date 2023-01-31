import {
    CheckCircleTwoTone,
    CloseCircleTwoTone,
    ControlTwoTone,
    LockTwoTone,
    ProfileTwoTone,
    ProjectTwoTone,
} from '@ant-design/icons';
import { Card } from 'antd';
import React, { memo, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DocMethod } from '../../../config';
import { CodeCard } from '../../../elements/CodeCard/CodeCard';
import { InfoCard } from '../../../elements/InfoCard/InfoCard';
import { List } from '../../../elements/List/List';
import { Separator } from '../../../elements/Separator/Separator';
import { controllerMethodColor } from '../../../utils';
import {
    getMethodDescription,
    renderBodyInput,
    renderErrors,
    renderGuards,
    renderParamInputs,
    renderQueryInput,
    renderResponse,
} from './MethodCard.model';
import { MethodCard } from './MethodCard.styled';

export type MethodCardProps = {
    method: DocMethod;
    isFirst: boolean;
};

const MethodCardComponent = memo<MethodCardProps>(({ method, isFirst }) => {
    const title = useMemo(
        () => (
            <>
                <span
                    style={{
                        color: controllerMethodColor(method.controllerMethod),
                    }}
                >
                    {method.controllerMethod.toUpperCase()}
                </span>{' '}
                <span>{method.address}</span>
            </>
        ),
        [method],
    );
    const description = useMemo(() => getMethodDescription(method), [method]);

    const errors = useMemo(() => Object.entries(renderErrors(method.return)), [method]);

    return (
        <MethodCard color={`${controllerMethodColor(method.controllerMethod)}11`}>
            <Card
                id={`${method.apiHost.replace('/', '_')}__${method.address}`}
                type="inner"
                title={title}
                style={{ marginTop: isFirst ? 0 : 16 }}
            >
                <>
                    {!!description && (
                        <>
                            <ReactMarkdown children={description} remarkPlugins={[remarkGfm]} />
                            <br />
                        </>
                    )}

                    {!!method.guard && method.guard.length > 0 && (
                        <InfoCard title="Guards" icon={LockTwoTone} iconColor="#d67c00">
                            {renderGuards(method.guard)}
                        </InfoCard>
                    )}

                    {!!method.paramInput && (
                        <InfoCard title="Parameters" icon={ControlTwoTone} iconColor="#666">
                            {renderParamInputs(method.paramInput)}
                        </InfoCard>
                    )}

                    {!!method.queryInput && (
                        <InfoCard title="Query" icon={ProfileTwoTone} iconColor="#666">
                            {renderQueryInput(method.queryInput)}
                        </InfoCard>
                    )}

                    {!!method.bodyInput && (
                        <InfoCard title="Request body" icon={ProjectTwoTone} iconColor="#666">
                            {renderBodyInput(method.bodyInput)}
                        </InfoCard>
                    )}

                    {errors && errors.length > 0 && (
                        <InfoCard title="Errors" icon={CloseCircleTwoTone} iconColor="#C9262B">
                            {errors.map(([k, v], i) => (
                                <CodeCard title={k} key={k} style={{ marginTop: i !== 0 ? 8 : 0 }}>
                                    <List
                                        items={v.map((e) => (
                                            <span key={e}>{e}</span>
                                        ))}
                                    />
                                </CodeCard>
                            ))}
                        </InfoCard>
                    )}

                    <InfoCard title="Response" iconColor="#13C658" icon={CheckCircleTwoTone}>
                        {renderResponse(method.return)}
                    </InfoCard>
                </>
            </Card>
        </MethodCard>
    );
});

export { MethodCardComponent as MethodCard };
