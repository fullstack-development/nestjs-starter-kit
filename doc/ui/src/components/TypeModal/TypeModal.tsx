import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { config } from '../../config';
import { parseTypeWithSourceMap, renderType } from '../../parser';
import { Modal } from '../Modal/Modal';

const typeRegexp = () => new RegExp(/#\/modal\/source_map\/(.*)/);
const libsRepositoryTypeRegexp = () => new RegExp(/#\/modal\/source_map_lib_repository\/(.*)/);

const TypeModalComponent: React.FC = () => {
    const location = useLocation();
    const [content, setContent] = useState<{ data: React.ReactNode; name: string } | undefined>(
        undefined,
    );

    useEffect(() => {
        const typeRes = location.hash.match(typeRegexp());
        if (typeRes) {
            const { body, name } = config.DOC_GENERATED.sourceMap[typeRes[1]];
            setContent({ data: renderType(parseTypeWithSourceMap(body)), name });
            return;
        }

        const libRepositoryTypeRes = location.hash.match(libsRepositoryTypeRegexp());
        if (libRepositoryTypeRes) {
            const name = libRepositoryTypeRes[1];
            const { body } = config.DOC_GENERATED.libs.repository[name];
            setContent({ data: renderType(parseTypeWithSourceMap(body)), name });
            return;
        }

        setContent(undefined);
    }, [location, setContent]);

    return <>{!!content && <Modal title={<span>{content.name}</span>}>{content.data}</Modal>}</>;
};

export { TypeModalComponent as TypeModal };
