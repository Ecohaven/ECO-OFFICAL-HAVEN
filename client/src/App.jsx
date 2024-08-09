import React, {useEffect, useState, useContext} from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useLocation, Navigate } from 'react-router-dom';
import http from '/src/http';

import AccountContext from '/src/contexts/AccountContext';
import WithAuthorization from '/src/hoc/withAuthorization';
import GuestRoute from '/src/hoc/GuestRoute';
import UserAndGuestRoute from './hoc/UserAndGuestRoute';
import StaffAuthorization from '/src/hoc/staffAuthorization';

{/* Components */}
import AccountNavbar from '../components/accountnavbar';
import Footer from '../components/footer';
import Sidebar from '../components/sidebar';

{/* Error Pages */}
import Unauthorized from './pages/NotFoundorUnauthorized/Unauthorized';
import StaffUnauthorized from './pages/NotFoundorUnauthorized/StaffUnauthorized';

import Get_Started from './pages/Get_Started/Get_Started';
import Register from './pages/Get_Started/Register';
import Login from './pages/Get_Started/Login';
import Account_Deleted from './pages/Get_Started/account_deleted';
import ResetPasswordRequest from './pages/Get_Started/ResetPasswordRequest';
import ResetPasswordVerify from './pages/Get_Started/ResetPasswordVerify';
import ResetPassword from './pages/Get_Started/ResetPassword';
import StaffResetPasswordRequest from './pages/backend/staffResetPassword/StaffResetPasswordRequest';
import StaffResetPasswordVerify from './pages/backend/staffResetPassword/StaffResetPasswordVerify';
import StaffResetPassword from './pages/backend/staffResetPassword/StaffResetPassword';

{/* Account_Profile part */}
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


{/* Dashboard Part  */}
import dashboard from './pages/Dashboard/dashboard';

{/* Bookings Part  */}
import Attendance from './pages/bookings/Attendance';
import Bookings from './pages/bookings/bookings';
import BookingForm from './pages/bookings/bookingForm';


{/* Payment part */}
import Payment from './pages/Payment/PaymentPage';
import Refund from './pages/Payment/RefundPage';
import Paymenthistory from './pages/Payment/StaffPayHistoryPage';
import PaymentSucess from './pages/Payment/SuccessPage';

{/* Staff pages part */}
import StaffLogin from './pages/backend/StaffLogin';
import Staff_Account_Profile from './pages/backend/Staff_Account_Profile';

import UserAccounts from './pages/backend/accountpages/UserAccounts';
import StaffAccounts from './pages/backend/accountpages/StaffAccounts';
import AddStaff from './pages/backend/accountpages/AddStaff';

{/* additional */}
import Faq from './pages/FAQ/faq';
import FaqBackend from './pages/FAQ/faqbackend';
import VolunteerList from './pages/volunteerList/VolunteerList';
import reviewlist from './pages/Review/reviewlist';

{/* Reviews Part  */}
import reviews from './pages/Review/review';


function App() {
  const location = useLocation();
  const navigate = useNavigate();
  // Define initial state for user and staff account
  const [account, setAccount] = useState(null);


  // Define the paths where AppBar and Footer should not be rendered
  const noAppBarFooterPaths = ['/get_started', '/login', '/register', '/account_deleted', '/reset_password/request', '/reset_password/verify', '/reset_password/reset', '/unauthorized'
                              ,'/collectionproduct', '/rewardproduct','/attendance','/bookings','/eventbackend','/AddEvent','/historypayment'];
  const shouldShowAppBarFooter = !noAppBarFooterPaths.includes(location.pathname);

  // Define the paths where Sidebar should not be rendered (Staff pages)
  const noSideBarPaths = ['/staff/staff_login', '/staff/AddEvent', '/staff/addstaff', '/staff/staff_reset_password/request', '/staff/staff_reset_password/verify', '/staff/staff_reset_password/reset', '/staff/unauthorized'];
  const shouldShowSideBar = !noSideBarPaths.includes(location.pathname);

  useEffect(() => { // Fetch user data when the app component mounts
    const validateTokenAndFetchUserData = async () => {
      const token = localStorage.getItem('accessToken');
      const storedUsername = localStorage.getItem('username');

      if (token && storedUsername) {
        try {
          const response = await http.get(`/account/${storedUsername}`);
          setAccount(response.data.user);
          console.log("Account data fetched and set:", response.data.user);
        } catch (error) {
          console.error("Error fetching account:", error);
          handleLogout();
        }
      }
    };

    validateTokenAndFetchUserData();
  }, [setAccount]);

  const handleLogout = async () => { // Handle logout
    try {
      await http.post('/account/logout'); // Send logout request to server
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('username');
      localStorage.clear(); // Clear local storage
      setAccount(null); // Update account state in context
      navigate('/login', { replace: true }); // Redirect to login page
    }
  };

  const userRoutes = (  
    <Routes>
      {/* Routes available for authenticated users only */}
      <Route path="/account/events" element={<WithAuthorization element={Account_Profile_Events} allowedRoles={['User']} />} />
      <Route path="/account/qr_codes" element={<WithAuthorization element={Account_Profile_QR_Codes} allowedRoles={['User']} />} />
      <Route path="/account/payments" element={<WithAuthorization element={Account_Profile_Payments} allowedRoles={['User']} />} />
      <Route path="/account/rewards" element={<WithAuthorization element={Account_Profile_Rewards} allowedRoles={['User']} />} />
      <Route path="/account" element={<WithAuthorization element={Account_Profile} allowedRoles={['User']} />} />
      {/* ^End of authenticated users only^ */}

      {/* Routes available for guests only */}
      <Route path="/get_started" element={<GuestRoute element={Get_Started} />} />
      <Route path="/login" element={<GuestRoute element={Login} />} />
      <Route path="/register" element={<GuestRoute element={Register} />} />
      <Route path="/account_deleted" element={<GuestRoute element={Account_Deleted} />} />
      <Route path="/reset_password/request" element={<GuestRoute element={ResetPasswordRequest} />} />
      <Route path="/reset_password/verify" element={<GuestRoute element={ResetPasswordVerify} />} />
      <Route path="/reset_password/reset" element={<GuestRoute element={ResetPassword} />} />
      {/* ^ End of guests only ^ */}
      
      {/* Routes available for users and guests  */}
      <Route path="/unauthorized" element={<UserAndGuestRoute element={Unauthorized} />} />

      <Route path="/about_us" element={<UserAndGuestRoute element={About_Us} />} />
      <Route path="/events" element={<UserAndGuestRoute element={Events} />} />
      <Route path="/book_now" element={<UserAndGuestRoute element={Book_Now} />} />
      <Route path="/rewards" element={<UserAndGuestRoute element={Rewards} />} />
      <Route path="/volunteer" element={<UserAndGuestRoute element={Volunteer} />} />
      <Route path="/" element={<UserAndGuestRoute element={Homepage} />} />
      <Route path="*" element={<Navigate to="/" />} />
        {/* ^ End of users and guests ^*/}

      {/* Rewards part */}
      <Route path="/redemptionshop" element={<WithAuthorization element={RedemptionShop} allowedRoles={['User']} />} />
      <Route path="/redeemform/:id" element={<WithAuthorization element={RedeemForm} allowedRoles={['User']} />} />
      <Route path="/successcollect" element={<WithAuthorization element={SuccessCollect} allowedRoles={['User']} />} />

      {/* <Route path={"/rewardproduct"} element={<RewardProduct/>} /> */}
      {/* <Route path={"/collectionproduct"} element={<CollectionProduct/>} /> */}

      {/* ^ End of Rewards part ^*/}


      {/* Payments  part */}
      <Route path={"/payment"} element={<WithAuthorization element={Payment} allowedRoles={['User']} />} />
      <Route path={"/refund"} element={<WithAuthorization element={Refund} allowedRoles={['User']} />} />
      {/* <Route path={"/historypayment"} element={<Paymenthistory/>} /> */}
      <Route path={"/paymentsuccess"} element={<WithAuthorization element={PaymentSucess} allowedRoles={['User']} />} />

      {/* ^ End of Payments part ^*/}

      {/* Bookings  part */}
         {/* <Route path={"/bookings"} element={<Bookings/>} /> */}
         <Route path={"/BookingForm"} element={<WithAuthorization element={BookingForm} allowedRoles={['User']} />} />

      {/* ^ End of Bookings part ^*/}


       {/* Check-in part-backend */}
        {/* <Route path={"/attendance"} element={<Attendance/>} /> */}

       {/* End of check-In part */}

       <Route path="/faq" element={<UserAndGuestRoute element={Faq} />} />
       <Route path="/review" element={<UserAndGuestRoute element={reviews} />} />
 


    </Routes>
  );

  const staffRoutes = ( // Staff routes are protected by StaffAuthorization HOC
    // Staff routes start with "/staff" e.g. "/staff/staff_login"
    <Routes>
      <Route path="/unauthorized" element={<StaffAuthorization element={StaffUnauthorized} allowedRoles={['Admin', 'Staff']} />} />

      <Route path="*" element={<Navigate to="/staff/dashboard" />} /> {/* Redirect to dashboard if invalid path */}
      <Route path="/staff_login" element={<GuestRoute element={StaffLogin} />} />
      <Route path="/staff_reset_password/request" element={<GuestRoute element={StaffResetPasswordRequest} />} />
      <Route path="/staff_reset_password/verify" element={<GuestRoute element={StaffResetPasswordVerify} />} />
      <Route path="/staff_reset_password/reset" element={<GuestRoute element={StaffResetPassword} />} />

      <Route path={"/account"} element={<StaffAuthorization element={Staff_Account_Profile} allowedRoles={['Admin', 'Staff']} />} />

      <Route path={"/usersaccounts"} element={<StaffAuthorization element={UserAccounts} allowedRoles={['Admin']} />} />
      <Route path={"/staffaccounts"} element={<StaffAuthorization element={StaffAccounts} allowedRoles={['Admin']} />} />
      <Route path={"/addstaff"} element={<StaffAuthorization element={AddStaff} allowedRoles={['Admin']} />} />

      <Route path={"/dashboard"} element={<StaffAuthorization element={dashboard} allowedRoles={['Admin', 'Staff']} />} />

      <Route path={"/rewardproduct"} element={<StaffAuthorization element={RewardProduct} allowedRoles={['Admin', 'Staff']} />} />
      <Route path={"/collectionproduct"} element={<StaffAuthorization element={CollectionProduct} allowedRoles={['Admin', 'Staff']} />} />

      <Route path={"/eventbackend"} element={<StaffAuthorization element={EventsBackend} allowedRoles={['Admin', 'Staff']} />} />
      <Route path={"/AddEvent"} element={<StaffAuthorization element={AddEventBackend} allowedRoles={['Admin', 'Staff']} />} />

      <Route path={"/historypayment"} element={<StaffAuthorization element={Paymenthistory} allowedRoles={['Admin', 'Staff']} />} />

      <Route path={"/volunteerlist"} element={<StaffAuthorization element={VolunteerList} allowedRoles={['Admin', 'Staff']} />} />


      <Route path={"/bookings"} element={<StaffAuthorization element={Bookings} allowedRoles={['Admin', 'Staff']} />} />

      <Route path={"/attendance"} element={<StaffAuthorization element={Attendance} allowedRoles={['Admin', 'Staff']} />} />

      <Route path={"/reviewlist"} element={<StaffAuthorization element={reviewlist} allowedRoles={['Admin', 'Staff']} />} />

      <Route path={"/faqbackend"} element={<StaffAuthorization element={FaqBackend} allowedRoles={['Admin', 'Staff']}/>} />
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
                  {shouldShowAppBarFooter && <Footer />
                  }
                </>
            }
          />

          {/* Staff routes start with "/staff" */}
          <Route path="/staff/*" 
            element={
              <>
                {shouldShowSideBar && <Sidebar />}
                {staffRoutes}
              </>
            }
          />
        </Routes>
      </AccountContext.Provider>
  );
}

export default App;
