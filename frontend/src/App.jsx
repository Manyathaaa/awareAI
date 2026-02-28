import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Layout from './components/Layout.jsx';

import Login       from './pages/Login.jsx';
import Register    from './pages/Register.jsx';
import Dashboard   from './pages/Dashboard.jsx';
import Campaigns   from './pages/Campaigns.jsx';
import Phishing    from './pages/Phishing.jsx';
import Training    from './pages/Training.jsx';
import Risk        from './pages/Risk.jsx';
import AIAssistant from './pages/AIAssistant.jsx';

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected (any authenticated user) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/training"  element={<Training />} />
            <Route path="/risk"      element={<Risk />} />
            <Route path="/ai"        element={<AIAssistant />} />

            {/* Manager / Admin only */}
            <Route element={<ProtectedRoute roles={['manager', 'admin']} />}>
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/phishing"  element={<Phishing />} />
            </Route>
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
