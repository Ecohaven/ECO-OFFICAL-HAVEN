import React, {useEffect, useState, useContext} from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useLocation, Navigate } from 'react-router-dom';
import http from '/src/http';

import AccountContext from '/src/contexts/AccountContext';

{/* Components */}
import AccountNavbar from '../components/accountnavbar';
import footer from '../components/footer';
import Sidebar from '../components/sidebar';

import Get_Started from './pages/Get_Started/Get_Started';
import Register from './pages/Get_Started/Register';
import Login from './pages/Get_Started/Login';
import Account_Deleted from './pages/Get_Started/account_deleted';

{/* Account_Profile  part */}
import Account_Profile from './pages/Account_Profile/Account_Profile';
import Account_Profile_Events from './pages/Account_Profile/Events';
import Account_Profile_QR_Codes from './pages/Account_Profile/QR_Codes';
import Account_Profile_Payments from './pages/Account_Profile/Payments';
import Account_Profile_Rewards from './pages/Account_Profile/Rewards';

{/* FrontEnd Navigation Links  */}
import Homepage from './pages/Nav_Links/homepage';
import About_Us from './pages/Nav_Links/About_Us';
import Events from './pages/Nav_Links/Events';
import Book_Now from './pages/Nav_Links/Book_Now';
import Rewards from './pages/Nav_Links/Rewards';
import Volunteer from './pages/Nav_Links/Volunteer';
{/* ^ Frontend Navigation Links ^ */}

{/* Rewards part */}
import RedemptionShop from './pages/Rewards/RedemptionShop';
import RedeemForm from './pages/Rewards/RedeemForm';
import SuccessCollect from './pages/Rewards/SuccessCollect';

import RewardProduct from './pages/Rewards/RewardProduct';
import CollectionProduct from './pages/Rewards/CollectionProduct';

{/* Events Part  */}
import EventsBackend from './pages/Events/events(backend)';
import AddEventBackend from './pages/Events/AddEvent';

{/* Bookings Part  */}
import Attendance from './pages/bookings/Attendance';
import Bookings from './pages/bookings/bookings';
import BookingForm from './pages/bookings/bookingForm';


{/* Payment part */}
import Payment from './pages/Payment/PaymentPage';
import Refund from './pages/Payment/RefundPage';
import Paymenthistory from './pages/Payment/StaffPayHistoryPage';
import PaymentSucess from './pages/Payment/SuccessPage';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  // Define initial state for user and staff account
  const [account, setAccount] = useState(null);

  // Define the paths where AppBar and Footer should not be rendered
  const noAppBarFooterPaths = ['/get_started', '/login', '/register', '/account_deleted','/collectionproduct', '/rewardproduct','/attendance','/bookings','/eventbackend','/AddEvent'];
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
      {/* ^End of authenticated users only^ */}

      {/* Routes available for guests only */}
      <Route path="/get_started" element={<Get_Started />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/account_deleted" element={<Account_Deleted />} />
      {/* ^ End of guests only ^ */}
      
      {/* Routes available for users and guests  */}
      <Route path="/about_us" element={<About_Us />} />
      <Route path="/events" element={<Events />} />
      <Route path="/book_now" element={<Book_Now />} />
      <Route path="/rewards" element={<Rewards />} />
      <Route path="/volunteer" element={<Volunteer />} />
      <Route path="/" element={<Homepage />} />
      <Route path="*" element={<Navigate to="/" />} />
        {/* ^ End of users and guests ^*/}

      {/* Rewards part */}
      <Route path={"/redemptionshop"} element={<RedemptionShop/>} />
      <Route path="/redeemform/:id" element={<RedeemForm />} />
      <Route path="/successcollect" element={<SuccessCollect />} />

      <Route path={"/rewardproduct"} element={<RewardProduct/>} />
      <Route path={"/collectionproduct"} element={<CollectionProduct/>} />

      {/* ^ End of Rewards part ^*/}


      {/* Events part */}
       <Route path={"/eventbackend"} element={<EventsBackend/>} />
       <Route path={"/AddEvent"} element={<AddEventBackend/>} />
      {/* ^ End of Events part ^*/}

      {/* Payments  part */}
      <Route path={"/payment"} element={<Payment/>} />
      <Route path={"/refund"} element={<Refund/>} />
      <Route path={"/historypayment"} element={<Paymenthistory/>} />
      <Route path={"/paymentsucess"} element={<PaymentSucess/>} />

      {/* ^ End of Payments part ^*/}

      {/* Bookings  part */}
         <Route path={"/bookings"} element={<Bookings/>} />
          <Route path={"/BookingForm"} element={<BookingForm/>} />

      {/* ^ End of Bookings part ^*/}


       {/* Check-in part-backend */}
        <Route path={"/attendance"} element={<Attendance/>} />

       {/* End of check-In part */}




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
