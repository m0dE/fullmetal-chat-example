import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GuestHome from './pages/guest.home';
import Login from './pages/login';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import { ToastContainer } from 'react-toastify';
import NPCChat from './pages/npc.chat';

export default function App() {
  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route path="/" element={<GuestHome />} />
        <Route
          path="/npc-chat"
          element={
            <PrivateRoute>
              <NPCChat />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}
