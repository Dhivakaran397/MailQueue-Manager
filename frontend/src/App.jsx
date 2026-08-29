import React from 'react';
import { useAuth } from './context/AuthContext.jsx';
import Auth from './components/Auth.jsx';
import Dashboard from './components/Dashboard.jsx';

function App() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans antialiased">
      <Dashboard />
    </div>
  );
}

export default App;
