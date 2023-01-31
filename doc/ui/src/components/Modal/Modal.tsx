import { CloseCircleTwoTone } from '@ant-design/icons';
import { Card } from 'antd';
import React, { memo } from 'react';
import { useNavigate } from 'react-router';
import { Content, Modal, Title } from './Modal.styled';

type ModalProps = {
    title: React.ReactNode;
    children: React.ReactNode;
    onClose?: () => void;
};

const ModalComponent = memo<ModalProps>(({ children, title, onClose }) => {
    const navigate = useNavigate();

    return (
        <Modal>
            <Content>
                <Card
                    title={
                        <Title>
                            {title}
                            <CloseCircleTwoTone
                                style={{ cursor: 'pointer' }}
                                twoToneColor={'#C9262B'}
                                onClick={() => {
                                    navigate('/#');
                                    onClose && onClose();
                                }}
                            />
                        </Title>
                    }
                >
                    {children}
                </Card>
            </Content>
        </Modal>
    );
});

export { ModalComponent as Modal };
