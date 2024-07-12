import React, {useEffect, useState, useContext} from 'react';
import './App.css';
import { Box, Container, AppBar, Toolbar, Typography, Button, Icon, IconButton, Popover,
  Input
 } from '@mui/material';
import { AccessTime, Search, Clear, Edit} from '@mui/icons-material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SearchIcon from '@mui/icons-material/Search';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate} from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import http from '/src/http';
import AccountContext from '/src/contexts/AccountContext';

import Get_Started from './pages/Get_Started/Get_Started';
import Register from './pages/Get_Started/Register';
import Login from './pages/Get_Started/Login';

import Account_Profile from './pages/Account_Profile/Account_Profile';
import Account_Profile_Events from './pages/Account_Profile/Events';
import Account_Profile_QR_Codes from './pages/Account_Profile/QR_Codes';
import Account_Profile_Payments from './pages/Account_Profile/Payments';
import Account_Profile_Rewards from './pages/Account_Profile/Rewards';

import About_Us from './pages/Nav_Links/About_Us';
import Events from './pages/Nav_Links/Events';
import Book_Now from './pages/Nav_Links/Book_Now';
import Rewards from './pages/Nav_Links/Rewards';
import Contact_Us from './pages/Nav_Links/Contact_Us';

import Account_Deleted from './pages/Get_Started/account_deleted';

{/* Rewards part */}
import RedemptionShop from './pages/Rewards/RedemptionShop';
import RedeemForm from './pages/Rewards/RedeemForm';
import SuccessCollect from './pages/Rewards/SuccessCollect';

import RewardProduct from './pages/Rewards/RewardProduct';
import CollectionProduct from './pages/Rewards/CollectionProduct';

function App() {
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [search, setSearch] = useState(''); // Search bar state
  const [anchorEl, setAnchorEl] = useState(null); // Anchor element for popover
  const location = useLocation();
  const showAppBar = !['/get_started', '/register', '/login', '/account_deleted'].includes(location.pathname); // Hide AppBar on these pages 

  const open = Boolean(anchorEl);
  const profilePic = account?.profile_pic;

  useEffect(() => { 
    async function fetchUserDataByUsername(username) {
      try {
        const response = await http.get(`/account/${username}`); // Fetch data based on username
        setAccount(response.data.user); // Update account state in context with fetched data - to display in url
      } catch (error) {
        console.error("Error fetching account:", error);
      }
    }

    async function validateToken() {
      // Check if token exists
      const token = localStorage.getItem('accessToken');
      //console.log("Before fetching:", account);
      if (token) { 
        try {
          const response = await http.get('/account/auth'); // Validate token
          const storedUsername = localStorage.getItem('username'); // Retrieve username from local storage
          console.log("Stored Username:", storedUsername);
          if (storedUsername) {
            // Use storedUsername to initialize state
            localStorage.setItem('username', storedUsername);
            fetchUserDataByUsername(storedUsername);
            // 
          }
          console.log("API Response:", response.data);
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

  useEffect(() => {
    // Redirect to unauthorized if user is already logged in
    if (['/get_started', '/register', '/login', '/account_deleted'].includes(location.pathname) && account) {
      navigate('/', { replace: true });
    }
  }, [account, location.pathname, navigate]); 

  const openSearch = () => {
    setSearch(true);
  }
  const closeSearch = () => {
    setSearch(false);
  }


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

  const handleOpen = (event) => { // Open Account Profile nav popup
    setAnchorEl(event.currentTarget); // Set anchor element to current target element of event object 
  };
  const handleClose = () => { // Close Account Profile nav popup
    setAnchorEl(null); // Set anchor element to null to close popup
  };

  return (
    <AccountContext.Provider value={{ account, setAccount }}>
    {showAppBar && (
      <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" className='AppBar' sx={{backgroundColor: '#ffffff', borderBottom: '1px solid #888888'}}>
          <Toolbar disableGutters={true}>
            {/* Elements on left side of appbar */}
            <Box sx={{ display: 'flex', flexGrow: 1, alignItems: 'center' }}>
              <Link to="/" style={{ textDecoration: 'none', margin: '0.5rem' }}>
                <Typography variant="h5" component="div" id='home_link' sx={{ fontWeight: 'bold', fontSize: { xs: '1rem', sm: '1.5rem', md: '2rem' } }}>
                  <span style={{ color: 'green' }}>Eco</span>
                  <span style={{ color: 'black' }}>Haven</span>
                </Typography>
              </Link>
                <Box sx={{ display: 'flex' }}>
                <Link to="/about_us" style={{ textDecoration: 'none', margin: '0.5rem' }}>
                  <Typography variant="h6" component="div" id='about_us_link' sx={{ fontSize: { xs: '0.7rem', sm: '1rem', md: '1.25rem' } }}>
                    About Us
                  </Typography>
                </Link>
                <Link to="/events" style={{ textDecoration: 'none', margin: '0.5rem' }}>
                  <Typography variant="h6" component="div" id='events_link' sx={{ fontSize: { xs: '0.7rem', sm: '1rem', md: '1.25rem' } }}>
                    Events
                  </Typography>
                </Link>
                <Link to="/book_now" style={{ textDecoration: 'none', margin: '0.5rem' }}>
                  <Typography variant="h6" component="div" id='book_now_link' sx={{ fontSize: { xs: '0.7rem', sm: '1rem', md: '1.25rem' } }}>
                    Book Now
                  </Typography>
                </Link>
                <Link to="/rewards" style={{ textDecoration: 'none', margin: '0.5rem' }}>
                  <Typography variant="h6" component="div" id='rewards_link' sx={{ fontSize: { xs: '0.7rem', sm: '1rem', md: '1.25rem' } }}>
                    Rewards
                  </Typography>
                </Link>
                <Link to="/contact_us" style={{ textDecoration: 'none', margin: '0.5rem' }}>
                  <Typography variant="h6" component="div" id='contact_us_link' sx={{ fontSize: { xs: '0.7rem', sm: '1rem', md: '1.25rem' } }}>
                    Contact Us
                  </Typography>
                </Link>
                </Box>
            </Box>
            {/* Elements on right side of appbar */}
            <Box sx={{ display: 'flex', ml: 'auto', alignItems: 'center' }}>
              <Box>
                {search ? ( // Display search bar
                  <Input
                    id="search"
                    placeholder="Search"
                    endAdornment={
                      <IconButton onClick={closeSearch}>
                        <Clear />
                      </IconButton>
                    }
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.7rem', md: '1.25rem' } }}
                  />
                ) : (
                  <IconButton onClick={openSearch}>
                    <Search />
                  </IconButton>
                )}
              </Box>
              {account ? (
                <>
                {profilePic ? (
                  <Box className="aspect-ratio-container-profile-pic-nav" sx={{ mt: 2 }} onClick={handleOpen}>
                    <img alt="profile-pic" className="aspect-ratio-item-profile-pic-nav"
                      src={`${import.meta.env.VITE_FILE_BASE_URL}${profilePic}`}>
                    </img>
                  </Box>
                ) : (
                  <IconButton id="account_profile_Button" onClick={handleOpen}>
                    <AccountCircleIcon sx={{ 
                            fontSize: 50,
                          }}/>
                  </IconButton>
                )}

                  {/* POPUP FOR ACCOUNT */}
                  <Popover 
                    open={open} // Open popup
                    anchorEl={anchorEl} // Set anchor element
                    onClose={handleClose} // Close popup
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} // Set anchor origin
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stetch' }}>
                      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: '1rem' }}> 
                        {profilePic ? (
                          <Box className="aspect-ratio-container-profile-pic" sx={{ mt: 2 }}>
                            <img alt="profile-pic" className="aspect-ratio-item-profile-pic"
                              src={`${import.meta.env.VITE_FILE_BASE_URL}${profilePic}`}>
                            </img>
                          </Box>
                        ) : (
                          <AccountCircleIcon sx={{ 
                            fontSize: 150,
                            opacity: 0.5
                          }}/>
                        )}
                        <div style={{ marginLeft: '1rem' }}>
                          <h2>{account.username}</h2>
                          <Link to={`/${account.username}`}>
                            <Typography variant="h6" component="div" id='account_profile_link'>
                              Manage Account
                            </Typography>
                          </Link>
                        </div>
                      </div>
                    </div>
                    <div style={{ marginTop: '1rem' }}>
                    <Link to="/" style={{ width: '100%' }}>
                      <Typography variant="h6" component="button" id='logout_button' onClick={handleLogout}
                      style={{ width: '100%', textAlign: 'center' }}>
                        Logout
                      </Typography>
                    </Link>
                    </div>
                  </Popover>
                </>
              ) : (
                <Link to="/get_started" style={{ textDecoration: 'none' }} >
                  <Button id='get_started_button' variant='contained'>
                    Get Started
                  </Button>
                </Link>
              )}
            </Box>
          </Toolbar>
      </AppBar>
      </Box>
    )}
    <Container>
      <Routes>
        <Route path="/" element={<div />} />
        <Route path={"/get_started"} element={<Get_Started/>} />
        <Route path={"/register"} element={<Register/>} />
        <Route path={"/login"} element={<Login/>} />

        <Route path={`/:username/`} element={<Account_Profile />} />
        <Route path={"/:username/events"} element={<Account_Profile_Events />} />
        <Route path={"/:username/qr_codes"} element={<Account_Profile_QR_Codes />} />
        <Route path={"/:username/payments"} element={<Account_Profile_Payments />} />
        <Route path={"/:username/rewards"} element={<Account_Profile_Rewards />} />

        <Route path={"/about_us"} element={<About_Us />} />
        <Route path={"/events"} element={<Events />} />
        <Route path={"/book_now"} element={<Book_Now />} />
        <Route path={"/rewards"} element={<Rewards />} />
        <Route path={"/contact_us"} element={<Contact_Us />} />

        <Route path={"/account_deleted"} element={<Account_Deleted/>} />

        {/* Rewards part */}
        <Route path={"/redemptionshop"} element={<RedemptionShop/>} />
        <Route path="/redeemform/:id" element={<RedeemForm />} />
        <Route path="/successcollect" element={<SuccessCollect />} />

        <Route path={"/rewardproduct"} element={<RewardProduct/>} />
        <Route path={"/collectionproduct"} element={<CollectionProduct/>} />

      </Routes>
    </Container>
  </AccountContext.Provider>
  );
}

export default App;
