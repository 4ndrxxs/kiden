import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { HomePage } from './pages/HomePage';
import { EnginePage } from './pages/EnginePage';
import { AISettingsPage } from './pages/AISettingsPage';
import { LogsPage } from './pages/LogsPage';
import { NetworkPage } from './pages/NetworkPage';
import { SystemPage } from './pages/SystemPage';

function App() {
  return (
    <BrowserRouter>
      <Sidebar />
      <main style={styles.main}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/engine" element={<EnginePage />} />
          <Route path="/ai" element={<AISettingsPage />} />
          <Route path="/logs" element={<LogsPage />} />
          <Route path="/network" element={<NetworkPage />} />
          <Route path="/settings" element={<SystemPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    flex: 1,
    padding: '28px 32px',
    overflowY: 'auto',
    maxHeight: '100vh',
  },
};

export default App;
