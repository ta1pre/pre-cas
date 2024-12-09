//src/comoinents/common/Layout.js
import React from 'react';
import Header from './Header';
import Footer from './Footer';

function Layout({ children }) {
  return (
    <div>
      <Header />
      <main style={{ 
        marginTop: '55px', // ヘッダーの高さ分のマージン
      }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default Layout;