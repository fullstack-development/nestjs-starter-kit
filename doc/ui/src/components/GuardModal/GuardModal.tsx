import React, { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useLocation } from 'react-router';
import remarkGfm from 'remark-gfm';
import { config } from '../../config';
import { Modal } from '../Modal/Modal';

const guardRegexp = new RegExp(/#\/modal\/guard\/(.*)/);

const GuardModalComponent: React.FC = () => {
    const location = useLocation();
    const [guard, setGuard] = useState<string | undefined>(undefined);

    const description = useMemo(() => {
        if (guard) {
            return atob(config.DOC_DESCRIPTIONS.guards[guard]);
        }
        return '';
    }, [guard]);

    useEffect(() => {
        const res = location.hash.match(guardRegexp);
        setGuard(!!res ? res[1] : undefined);
    }, [location, setGuard]);

    return (
        <>
            {!!guard && (
                <Modal title={<span>{guard}</span>}>
                    <ReactMarkdown children={description} remarkPlugins={[remarkGfm]} />
                </Modal>
            )}
        </>
    );
};

export { GuardModalComponent as GuardModal };
