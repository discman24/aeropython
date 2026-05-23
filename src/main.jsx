import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.jsx';
import WorldMap from './components/WorldMap.jsx';
import RegionView from './components/RegionView.jsx';
import StageScreen from './components/StageScreen.jsx';
import MilestoneScreen from './components/MilestoneScreen.jsx';
import './index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <WorldMap /> },
      { path: 'region/:id', element: <RegionView /> },
      { path: 'stage/:id', element: <StageScreen /> },
      { path: 'milestone/:id', element: <MilestoneScreen /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
