import React, { useEffect, useState, useContext } from 'react';
import '../src/App.css';
import {
  Box, Container, AppBar, Toolbar, Typography, Button, Icon, IconButton, Popover, Input,
  List, ListItem, ListItemText, Divider, Drawer, Badge
} from '@mui/material';
import { AccessTime, Search, Clear, Edit, Notifications, Style, Margin } from '@mui/icons-material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { styled } from '@mui/system';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import http from '/src/http';
import AccountContext from '/src/contexts/AccountContext';
import axios from 'axios';
import SearchComponent from '../components/search';

function AccountNavbar() {
  const navigate = useNavigate();
  const { account, setAccount } = useContext(AccountContext);
  const [search, setSearch] = useState(''); // Search bar state
  const [anchorEl, setAnchorEl] = useState(null); // Anchor element for popover
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null); // Anchor element for notifications popover
  const [notifications, setNotifications] = useState([]); // Notifications state
  const [showNotificationIcon, setShowNotificationIcon] = useState(true);
  const [leafPointsMessage, setLeafPointsMessage] = useState('');
  const location = useLocation();

  const open = Boolean(anchorEl);
  const openNotifications = Boolean(notificationAnchorEl);
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

  useEffect(() => {
    // Redirect to unauthorized if user is already logged in
    if (['/get_started', '/register', '/login', '/account_deleted'].includes(location.pathname) && account) {
      navigate('/', { replace: true });
    }
  }, [account, location.pathname, navigate]);



  useEffect(() => {
    async function fetchNotifications() {
      if (account && account.name) {
        try {
          const response = await axios.get(`http://localhost:3001/api/bookings/account/${account.name}/notify`);
          setNotifications(response.data.upcomingEvents);
          setLeafPointsMessage(response.data.leafPointsMessage || '');
          setShowNotificationIcon(true); // Show icon if user is logged in
        } catch (error) {
          console.error("Error fetching notifications:", error);
        }
      } else {
        // Hide notification icon if no account
        setNotifications([]);
        setLeafPointsMessage('');
        setShowNotificationIcon(false);
      }
    }

    fetchNotifications();
  }, [account]);

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  }
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  }

  const handleNotificationClick = (event) => {

    setNotificationAnchorEl(event.currentTarget); // Open notifications popover

  }

  const handleNotificationClose = () => {

    setNotificationAnchorEl(null); // Close notifications popover

  }

  const menuItems = [
    { text: 'Home', path: '/' },
    { text: 'About Us', path: '/about_us' },
    { text: 'Events', path: '/events' },
    { text: 'Book Now', path: '/book_now' },
    { text: 'Rewards', path: '/rewards' },
    { text: 'Volunteer', path: '/volunteer' },
  ];

  const StyledLink = styled(Link)(({ selected }) => ({
    textDecoration: 'none',
    '@media (min-width: 900px)': {
      marginRight: '0.3rem',
      fontSize: '1rem', 
    },
    '@media (min-width: 925px)': {
      marginRight: '0.5rem',
      fontSize: '1rem', 
    },
    '@media (min-width: 1000px)': {
      marginRight: '0.8rem',
      fontSize: '1.1rem', 
    },
    '@media (min-width: 1050px)': {
      marginRight: '0.57rem',
      fontSize: '1.15rem', 
    },
    '@media (min-width: 1260px)': {
      marginRight: '1.4rem', 
      fontSize: '1.25rem', 
    },
    '@media (min-width: 1600px)': {
      marginRight: '2rem', 
      fontSize: '1.3rem', 
    },
    color: selected ? '#4CAF50' : 'black', 
    '&:hover': {
      color: '#4CAF50', 
      transition: 'color 0.3s', 
      textDecoration: 'underline', 
    },
  }));

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" className='AppBar' sx={{ backgroundColor: '#ffffff', borderBottom: '1px solid #888888' }}>
        <Toolbar disableGutters={true}>
          {/* Elements on left side of appbar */}
          <Box sx={{ display: 'flex', flexGrow: 1, alignItems: 'center' }}>
            { /* Display this box when browser site is sm */}
            <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
              <IconButton sx={{ marginLeft: '0.5rem' }} onClick={handleOpenNavMenu}>
                <Icon>
                  <MenuIcon />
                </Icon>
              </IconButton>
              <Drawer
                anchor="top"
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                PaperProps={{
                  sx: { width: '100vw', padding: '1rem' },
                }}
              >
                <List>
                  {menuItems.map((item, index) => (
                    <React.Fragment key={item.text}>
                      <ListItem onClick={handleCloseNavMenu}
                        sx={{
                          transition: 'background-color 0.3s',
                          '&:hover': {
                            backgroundColor: '#f0f0f0',
                            '& .MuiListItemText-root': {
                              color: 'green',
                            },
                          },
                        }}
                      >
                        <Link
                          to={item.path}
                          style={{ textDecoration: 'none', width: '100%' }}
                        >
                          <ListItemText
                            primary={item.text}
                            sx={{
                              color: 'black',
                              '&:hover': {
                                color: 'green',
                                transition: 'color 0.3s',
                              },
                            }}
                          />
                        </Link>
                      </ListItem>
                      {index < menuItems.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                  <Box sx={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
                    <IconButton onClick={handleCloseNavMenu}>
                      <ExpandLessIcon fontSize="large" />
                    </IconButton>
                  </Box>
                </List>
              </Drawer>
            </Box>
            <Link to="/" style={{ textDecoration: 'none', margin: '0.5rem' }}>
              <Typography variant="h5" component="div" id='home_link' sx={{
                fontWeight: 'bold', fontSize: { xs: '1.5rem', sm: '1.7rem', md: '1.5rem', lg: '2rem', xl: '2rem' },
                marginRight: { xs: '0rem', sm: '0rem', md: '0.3rem', lg: '2.5rem', xl: '3rem' }
              }}>
                <span style={{ color: 'green' }}>Eco</span>
                <span style={{ color: 'black' }}>Haven</span>
              </Typography>
            </Link>
            { /* Display this box when browser site is md */}
            <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
              <StyledLink to="/" selected={window.location.pathname === '/'} >
                Home
              </StyledLink>
              <StyledLink to="/about_us" selected={window.location.pathname === '/about_us'}>
                About Us
              </StyledLink>
              <StyledLink to="/events" selected={window.location.pathname === '/events'} >
                Events
              </StyledLink>
              <StyledLink to="/book_now" selected={window.location.pathname === '/book_now'} >
                Book Now
              </StyledLink>
              <StyledLink to="/rewards" selected={window.location.pathname === '/rewards'} >
                Rewards
              </StyledLink>
              <StyledLink to="/volunteer" selected={window.location.pathname === '/volunteer'} >
                Volunteer
              </StyledLink>
            <StyledLink to="/review" selected={window.location.pathname === '/review'} >
                Review
              </StyledLink>
            </Box>
          </Box>
          {/* Elements on right side of appbar */}
          <Box sx={{ display: 'flex', ml: 'auto', alignItems: 'center' }}>
            <SearchComponent search={search} openSearch={openSearch} closeSearch={closeSearch} />
            {/* If logged in */}
            {account ? (
              <>

                {/* Notification Bell Icon + Popup */}
                <IconButton
                  color="inherit"
                  onClick={handleNotificationClick}
                  sx={{ marginLeft: { xs: '0.5rem', md: '1rem', color: 'green' } }}
                >
                  <Badge badgeContent={notifications ? notifications.length : 0} color="black" >
                    <Notifications />
                  </Badge>
                </IconButton>
                <Popover
                  open={openNotifications}
                  anchorEl={notificationAnchorEl}
                  onClose={handleNotificationClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',

                  }}
                  PaperProps={{ sx: { minWidth: '300px' } }}
                >
                  <Box sx={{ p: 2 }} >
                    <Typography variant="h6" color="textPrimary">Notifications</Typography>
                    {leafPointsMessage && <Typography style={{textWrap:'wrap',width:'280px',textAlign:'left',color:'grey',fontStyle:'italic'}} color="textSecondary">{leafPointsMessage}</Typography>} {/* Display the leafPointsMessage if it exists */}
                      {notifications && notifications.length > 0 ? (
                        <List>
                          {notifications.map((event) => (
                            <ListItem key={event.id}>
                              <ListItemText 
                                primary={
                                  <Typography sx={{ color: 'green', fontWeight: 'bold', textAlign: 'left' }}>
                                    {`A Reminder for ${event.eventName} `}
                                  </Typography>
                                }
                                secondary={
                                  <Typography sx={{ color: 'black', textAlign: 'left' }}>
                                    {`Upcoming event on: ${formatDate(event.startDate)}`}
                                  </Typography>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body1" style={{color:'green'}}>No new notifications</Typography>
                      )}

                  </Box>
                </Popover>

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
                    }} />
                  </IconButton>
                )}

                {/* POPUP FOR ACCOUNT */}
                <Popover
                  open={open} // Open popup
                  anchorEl={anchorEl} // Set anchor element
                  onClose={handleClose} // Close popup
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} // Set anchor origin
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stetch', margin: '0.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
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
                        }} />
                      )}
                      <div style={{ marginLeft: '1rem', marginTop: '-3rem' }}>
                        <Typography variant='h4' style={{ marginRight: '2rem', fontWeight: 'bold' }}>{account.username}</Typography>
                        <Link to={`/account`} id='manage_account_link' >
                          <Typography variant="h6" component="div" id='account_profile_link' onClick={handleClose} style={{ margin: 0, marginRight: '3rem', padding: 0 }}>
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
              <>
                <Link to="/get_started">
                  <Button id='get_started_button' variant='contained'
                    sx={{
                      fontSize: { xs: '0.9rem', sm: '0.9rem', md: '0.85rem', lg: '1rem' },
                      padding: { xs: '0.5rem 0.5rem', sm: '0.5rem 0.7rem', md: '0.5rem 0.7rem' },
                    }}
                  >
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default AccountNavbar;