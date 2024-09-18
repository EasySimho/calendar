import { Route, Navigate, Routes } from 'react-router-dom';
import { useUser, UserProvider } from './components/UserContext'; // Import UserProvider and useUser from UserContext
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import CalendarView from './pages/CalendarView';
import PartnerCalendar from './pages/PartnerCalendar';
import PersonalCalendar from './pages/PersonalCalendar';

const PrivateRoute = ({ children }) => {
  const { user } = useUser();
  return user?.token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <UserProvider>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Rotta protetta */}
          <Route
            path="/calendar"
            element={
              <PrivateRoute>
                <CalendarView />
              </PrivateRoute>
            }
          />
    
          <Route
            path="/partner-calendar"
            element={
              <PrivateRoute>
                <PartnerCalendar />
              </PrivateRoute>
            }
          />

          <Route
            path="/personal-calendar"
            element={
              <PrivateRoute>
                <PersonalCalendar />
              </PrivateRoute>
            }
          />
          {/* Fallback per tutte le altre rotte */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </UserProvider>
  );
}

export default App;