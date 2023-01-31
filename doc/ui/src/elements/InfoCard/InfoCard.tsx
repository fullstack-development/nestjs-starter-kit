import { ProjectTwoTone } from '@ant-design/icons';
import { AntdIconProps } from '@ant-design/icons/lib/components/AntdIcon';
import React, { memo } from 'react';
import { Separator } from '../Separator/Separator';
import { Content } from './InfoCard.styled';

export type InfoCardProps = {
    children: React.ReactNode;
    icon: React.FC<AntdIconProps>;
    iconColor: string;
    title: string;
};

export const InfoCardComponent = memo<InfoCardProps>(
    ({ icon: Icon, title, children, iconColor }) => {
        return (
            <div>
                <h3>
                    <Icon twoToneColor={iconColor} />
                    {` ${title}`}
                </h3>
                <Separator />
                <Content>{children}</Content>
                <br />
            </div>
        );
    },
);

export { InfoCardComponent as InfoCard };
