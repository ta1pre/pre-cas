// webapp/src/pages/cast/CastProfileView.js
import React from 'react';
import { useParams } from 'react-router-dom';
import CastProfileContent from '../../components/cast/CastProfileContent';

const CastProfileView = () => {
    // React Router の useParams フックを利用して :cast_id を取得
    const { cast_id } = useParams();

    return (
        <div>
            {/* CastProfileContent に castId を渡す */}
            <CastProfileContent castId={cast_id} isOwner={false} loading={false} />
        </div>
    );
};

export default CastProfileView;
