// src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider } from '@mui/material/styles'; // 追加
import reportWebVitals from './reportWebVitals';
import theme from './theme'; // テーマのインポート

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}> {/* ThemeProviderでAppをラップ */}
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

reportWebVitals();
