import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Home from './pages/Home';
import CreateRoom from './pages/CreateRoom';
import JoinRoom from './pages/JoinRoom';
import Chat from './pages/Chat';
import ServerDown from './components/ServerDown';
import NotFound from './components/NotFound';
import useServerStatus from './hooks/useServerStatus';

function App() {
  const { isServerDown } = useServerStatus();

  // Se il server è down, mostra la pagina di errore
  if (isServerDown) {
    return <ServerDown />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-black from-gray-900 via-gray-800 to-black">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="min-h-screen"
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreateRoom />} />
            <Route path="/join" element={<JoinRoom />} />
            <Route path="/chat/:roomCode" element={<Chat />} />
            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </motion.div>
      </div>
    </Router>
  );
}

export default App;