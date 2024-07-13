import React, {useEffect, useState, useContext} from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useLocation, Navigate } from 'react-router-dom';
import http from '/src/http';

import AccountContext from '/src/contexts/AccountContext';

import AccountNavbar from '../components/accountnavbar';
import footer from '../components/footer';
import Sidebar from '../components/sidebar';

import Get_Started from './pages/Get_Started/Get_Started';
import Register from './pages/Get_Started/Register';
import Login from './pages/Get_Started/Login';
import Account_Deleted from './pages/Get_Started/account_deleted';

import Account_Profile from './pages/Account_Profile/Account_Profile';
import Account_Profile_Events from './pages/Account_Profile/Events';
import Account_Profile_QR_Codes from './pages/Account_Profile/QR_Codes';
import Account_Profile_Payments from './pages/Account_Profile/Payments';
import Account_Profile_Rewards from './pages/Account_Profile/Rewards';

import Homepage from './pages/Nav_Links/homepage';
import About_Us from './pages/Nav_Links/About_Us';
import Events from './pages/Nav_Links/Events';
import Book_Now from './pages/Nav_Links/Book_Now';
import Rewards from './pages/Nav_Links/Rewards';
import Volunteer from './pages/Nav_Links/Volunteer';


function App() {
  const location = useLocation();
  const navigate = useNavigate();
  // Define initial state for user and staff account
  const [account, setAccount] = useState(null);

  // Define the paths where AppBar and Footer should not be rendered
  const noAppBarFooterPaths = ['/get_started', '/login', '/register', '/account_deleted'];
  const shouldShowAppBarFooter = !noAppBarFooterPaths.includes(location.pathname);

  useEffect(() => { 
    async function fetchUserDataByUsername(username) {
      try {
        const response = await http.get(`/account/${username}`); // Fetch data based on username
        setAccount(response.data.user); // Update account state in context with fetched data - to display in url
        console.log("Account data fetched:", response.data.user);
      } catch (error) {
        console.error("Error fetching account:", error);
      }
    }

    async function validateToken() {
      // Check if token exists
      const token = localStorage.getItem('accessToken');
      if (token) { 
        try {
          const response = await http.get('/account/auth'); // Validate token
          const storedUsername = localStorage.getItem('username'); // Retrieve username from local storage
          if (storedUsername) {
            // Use storedUsername to initialize state
            localStorage.setItem('username', storedUsername);
            fetchUserDataByUsername(storedUsername);
            // 
          }
          setAccount(response.data.user); // Update the account state in the context
        } 
        catch (error) {
          if (error.response?.status === 401) {
            handleLogout();
          }
          else if (error.response?.status === 403) {
            console.error("Forbidden:", error);
          }
          else {
            console.error("Error fetching account:", error);
          }
        }
      }
      else {
        handleLogout();
      }
    }
    validateToken();
  }, []);

  const handleLogout = () => { 
    if (!account) {
      return;
    }
    else {
      http.post('/account/logout').then(() => { // Send logout request to server
        localStorage.removeItem('accessToken');
        localStorage.removeItem('username');
        localStorage.clear(); // Clear local storage
        handleClose(); // Close popup
        setAccount(null); // Update account state in context
        navigate('/', { replace: true }); // Redirect to home page after logout 
        });
    }
  };

  const userRoutes = (  
    <Routes>
      {/* Routes available for authenticated users only */}
      <Route path="/account/events" element={<Account_Profile_Events />} />
      <Route path="/account/qr_codes" element={<Account_Profile_QR_Codes />} />
      <Route path="/account/payments" element={<Account_Profile_Payments />} />
      <Route path="/account/rewards" element={<Account_Profile_Rewards />} />
      <Route path="/account" element={<Account_Profile />} />

      {/* Routes available for guests only */}
      <Route path="/get_started" element={<Get_Started />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/account_deleted" element={<Account_Deleted />} />
      
      {/* Routes available for users and guests  */}
      <Route path="/about_us" element={<About_Us />} />
      <Route path="/events" element={<Events />} />
      <Route path="/book_now" element={<Book_Now />} />
      <Route path="/rewards" element={<Rewards />} />
      <Route path="/volunteer" element={<Volunteer />} />
      <Route path="/" element={<Homepage />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );

  return (
      <AccountContext.Provider value={{ account, setAccount }}>
        <Routes>
          <Route path="*"
            element={
                <>
                  {shouldShowAppBarFooter && <AccountNavbar />}
                  {userRoutes}
                  {shouldShowAppBarFooter && 
                    <footer>
                      {footer()}
                    </footer>
                  }
                </>
            }
          />
        </Routes>
      </AccountContext.Provider>
  );
}

export default App;
