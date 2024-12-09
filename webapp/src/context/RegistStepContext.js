// src/context/RegistStepContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import { checkUserSex } from '../utils/stepChecks/checkUserSex';
import { checkProfileSetup } from '../utils/stepChecks/checkProfileSetup';
import { checkIdentityVerification } from '../utils/stepChecks/checkIdentityVerification';

export const RegistStepContext = createContext();

export const RegistStepProvider = ({ children }) => {
  const { userProfile, loading, loggedIn } = useContext(AuthContext);
  const [steps, setSteps] = useState([]);
  const [redirectUrl, setRedirectUrl] = useState(null);

  const isUserSexSet = checkUserSex(userProfile);

  // 各ステップの初期化
  const initializeSteps = async () => {
    const profileSetup = await checkProfileSetup(userProfile);
    if (!profileSetup.completed) {
      setRedirectUrl(profileSetup.redirectUrl);
      return [{ label: "プロフィール設定", key: "profileSetup", completed: false }];
    }

    const identityVerification = await checkIdentityVerification(userProfile);
    if (!identityVerification.completed) {
      setRedirectUrl(identityVerification.redirectUrl);
      return [
        { label: "プロフィール設定", key: "profileSetup", completed: true },
        { label: "本人確認", key: "identityVerification", completed: false }
      ];
    }

    // すべてのステップが完了している場合
    setRedirectUrl(null);
    return [
      { label: "プロフィール設定", key: "profileSetup", completed: true },
      { label: "本人確認", key: "identityVerification", completed: true }
    ];
  };

  useEffect(() => {
    if (!loading && loggedIn && userProfile) {
      initializeSteps().then(setSteps);
    }
  }, [userProfile, loading, loggedIn]);

  // フッター表示の判断: 未完了のステップがある場合のみ表示
  const isFooterVisible = !loading && loggedIn && steps.some(step => !step.completed);

  return (
    <RegistStepContext.Provider value={{ steps, isFooterVisible, redirectUrl }}>
      {children}
    </RegistStepContext.Provider>
  );
};
