// src/App.js

import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/common/Layout'; 
import ProtectedRoute from './components/common/ProtectedRoute';
import { routes } from './routes/routes';
import AuthCheck from './components/auth/AuthCheck';
import StepProgressBar from './components/common/StepProgressBar';
import { RegistStepProvider, RegistStepContext } from './context/RegistStepContext';

function AppRouter() {
  return (
    <AuthProvider>
      <RegistStepProvider>
        <Router>
          <Layout>
            <AuthCheck />
            <MainContentWithFooterMargin /> {/* フッターの状態を反映したmainコンテンツ */}
            <StepProgressBar /> {/* Layout内に配置 */}
          </Layout>
        </Router>
      </RegistStepProvider>
    </AuthProvider>
  );
}

export default AppRouter;

// mainコンテンツにフッターのマージンを反映するコンポーネント
const MainContentWithFooterMargin = () => {
  const { isFooterVisible } = useContext(RegistStepContext);

  return (
    <main style={{ marginBottom: isFooterVisible ? '110px' : '0' }}>
      <Routes>
        {routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              route.protected ? (
                <ProtectedRoute>
                  <route.element />
                </ProtectedRoute>
              ) : (
                <route.element />
              )
            }
          />
        ))}
      </Routes>
    </main>
  );
};
