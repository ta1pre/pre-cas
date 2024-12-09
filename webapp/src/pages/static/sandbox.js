// src/pages/static/sandbox.js

import React, { useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Sandbox = () => {
  const { loggedIn, userProfile } = useContext(AuthContext);

  useEffect(() => {
    console.log("Sandbox - loggedIn:", loggedIn);
    console.log("Sandbox - userProfile:", userProfile);
  }, [loggedIn, userProfile]);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Sandbox - ユーザー情報確認</h2>
      <div>
        <strong>ログイン状態:</strong> {loggedIn ? "ログイン中" : "未ログイン"}
      </div>
      <div>
        <strong>ユーザープロファイル情報:</strong>
        <pre>{JSON.stringify(userProfile, null, 2)}</pre>
      </div>
    </div>
  );
};

export default Sandbox;
