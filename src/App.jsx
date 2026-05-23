import React from 'react';
import { Outlet } from 'react-router-dom';
import { GameProvider } from './context/GameContext.jsx';
import HUD from './components/HUD.jsx';

export default function App() {
  return (
    <GameProvider>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
        <HUD />
        <main style={{ flex: 1, paddingTop: '60px', overflow: 'hidden' }}>
          <Outlet />
        </main>
      </div>
    </GameProvider>
  );
}
