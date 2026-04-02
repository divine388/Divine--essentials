import React from 'react';

const Layout: React.FC = ({ children }) => {
  return (
    <div className="min-h-screen">
      <header>
        <h1>Divine Essentials</h1>
      </header>
      <main>{children}</main>
      <footer>© 2026 Divine Essentials</footer>
    </div>
  );
};

export default Layout;
