import React, { memo } from 'react';
import { DocMethod } from '../../../config';
import { controllerMethodColor } from '../../../utils';

type SidebarMethodProps = {
    method: DocMethod;
};

export const SidebarMethod = memo<SidebarMethodProps>(({ method }) => {
    return (
        <div>
            <span
                style={{
                    color: controllerMethodColor(method.controllerMethod),
                    fontWeight: '600',
                }}
            >
                {method.controllerMethod.toUpperCase()}
            </span>{' '}
            <span>{method.address}</span>
        </div>
    );
});
