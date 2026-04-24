import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import NavigationBar from './components/NavigationBar';
import BackgroundAudio from './components/BackgroundAudio';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Entries from './pages/Entries';
import Statistics from './pages/Statistics';
import Settings from './pages/Settings';
import ManageTags from './pages/ManageTags';
import { SettingsProvider } from './contexts/SettingsContext';
import './App.css';

function AppContent() {
  const location = useLocation();
  const showBackgroundAudio = location.pathname !== '/settings';

  return (
    <>
      <NavigationBar />
      {showBackgroundAudio && <BackgroundAudio compact={true} />}
      <Routes>
          <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/entries" element={<Entries />} />
        <Route path="/stats" element={<Statistics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/tags" element={<ManageTags />} />
        <Route
          path="/"
          element={
            <div className="home-container">
              <h1>Welcome to JournalKeeper</h1>
              <p>Start your journaling journey today. Login or register to get started.</p>
            </div>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <SettingsProvider>
      <Router>
        <AppContent />
      </Router>
    </SettingsProvider>
  );
}

export default App
