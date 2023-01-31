import React, { memo } from 'react';

type SidebarRootProps = {
    text: string;
};

export const SidebarRoot = memo<SidebarRootProps>(({ text }) => {
    return <span style={{ fontWeight: '600' }}>{text}</span>;
});
