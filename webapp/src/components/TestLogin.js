// src/components/TestLogin.js

import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';  // AuthContextをインポート

const TestAccountSwitcher = () => {
  const { setLoggedIn, setUserProfile } = useContext(AuthContext);  // コンテキストから関数を取得
  const [selectedAccount, setSelectedAccount] = useState(null);

  const testAccounts = [
    { lineId: 'testA', name: 'Test Account A' },
    { lineId: 'testB', name: 'Test Account B' }
  ];

  const handleLogin = async (account) => {
    setSelectedAccount(account);

    try {
      const response = await fetch(`https://5611-122-217-34-64.ngrok-free.app/api/user/mock_login?line_id=${account.lineId}`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setLoggedIn(true);  // ログイン状態をtrueに設定
        setUserProfile(data.user_profile);  // ユーザープロフィールをコンテキストに保存
        console.log('Login successful:', data);
      } else {
        console.error('Login failed:', response.statusText);
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  return (
    <div>
      <h2>Test Account Switcher</h2>
      <div>
        {testAccounts.map((account) => (
          <button key={account.lineId} onClick={() => handleLogin(account)}>
            Login as {account.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TestAccountSwitcher;
