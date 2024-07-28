import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import {
  AccountBox as AccountIcon,
  Event as EventIcon,
  MenuBook as BookingsIcon,
  Group as AttendanceIcon,
  Loyalty as PointsIcon,
  Redeem as RewardIcon,
  Payment as PaymentIcon,
  MonetizationOn as RefundIcon,
  Email as MailingIcon,
  RateReview as ReviewIcon,
  Home as OverviewIcon,
  ExpandLess,
  ExpandMore,
  Menu as MenuIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useMediaQuery } from 'react-responsive';

const Sidebar = () => {
  const [openAccount, setOpenAccount] = useState(false);
  const [openReward, setOpenReward] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isMobile = useMediaQuery({ maxWidth: 960 });

  const handleAccountClick = () => {
    setOpenAccount(!openAccount);
    setOpenReward(false);
  };

  const handleRewardClick = () => {
    setOpenReward(!openReward);
    setOpenAccount(false);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const activeStyle = {
    color: 'lightgreen',
    textDecoration: 'underline',
  };

  return (
    <>
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            backgroundColor: '#14772B',
            color: 'white',
          },
        }}
      >
        <div className="ecohaven-background">
          <Link
            to="/"
            style={{
              textDecoration: 'none',
              color: 'white',
              display: 'block',
              textAlign: 'center',
              paddingTop: '20px',
              paddingBottom: '20px',
            }}
            onMouseEnter={(e) => e.target.style.color = 'black'} // Change color on hover
            onMouseLeave={(e) => e.target.style.color = 'white'} // Restore text color on hover out
          >
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>EcoHaven</span>
          </Link>
        </div>
        <List>
          <ListItem button component={Link} to="/staff/dashboard" selected={isActive('/staff/dashboard')} style={isActive('/staff/dashboard') ? activeStyle : {}}>
            <ListItemIcon style={{ color: 'white' }}>
              <OverviewIcon />
            </ListItemIcon>
            <ListItemText primary="Overview" />
          </ListItem>

          <ListItem button onClick={handleAccountClick}>
            <ListItemIcon style={{ color: 'white' }}>
              <AccountIcon />
            </ListItemIcon>
            <ListItemText primary="Account" />
            {openAccount ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={openAccount} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem button component={Link} to="/staff/usersaccounts" selected={isActive('/staff/usersaccounts')} style={isActive('/staff/usersaccounts') ? activeStyle : {}}>
                <ListItemText primary="Users" />
              </ListItem>
              <ListItem button component={Link} to="/staff/staffaccounts" selected={isActive('/staff/staffaccounts')} style={isActive('/staff/staffaccounts') ? activeStyle : {}}>
                <ListItemText primary="Staff" />
              </ListItem>
            </List>
          </Collapse>

          <ListItem button component={Link} to="/staff/eventbackend" selected={isActive('/staff/eventbackend')} style={isActive('/staff/eventbackend') ? activeStyle : {}}>
            <ListItemIcon style={{ color: 'white' }}>
              <EventIcon />
            </ListItemIcon>
            <ListItemText primary="Events" />
          </ListItem>

          <ListItem button component={Link} to="/staff/bookings" selected={isActive('/staff/bookings')} style={isActive('/staff/bookings') ? activeStyle : {}}>
            <ListItemIcon style={{ color: 'white' }}>
              <BookingsIcon />
            </ListItemIcon>
            <ListItemText primary="Bookings" />
          </ListItem>

          <ListItem button component={Link} to="/staff/attendance" selected={isActive('/staff/attendance')} style={isActive('/staff/attendance') ? activeStyle : {}}>
            <ListItemIcon style={{ color: 'white' }}>
              <AttendanceIcon />
            </ListItemIcon>
            <ListItemText primary="Attendance" />
          </ListItem>

          <ListItem button onClick={handleRewardClick}>
            <ListItemIcon style={{ color: 'white' }}>
              <RewardIcon />
            </ListItemIcon>
            <ListItemText primary="Reward" />
            {openReward ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={openReward} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem button component={Link} to="/staff/collectionproduct" selected={isActive('/staff/collectionproduct')} style={isActive('/staff/collectionproduct') ? activeStyle : {}}>
                <ListItemText primary="Collection" />
              </ListItem>
              <ListItem button component={Link} to="/staff/rewardproduct" selected={isActive('/staff/rewardproduct')} style={isActive('/staff/rewardproduct') ? activeStyle : {}}>
                <ListItemText primary="Shop" />
              </ListItem>
            </List>
          </Collapse>

          <ListItem button component={Link} to="/staff/historypayment" selected={isActive('/staff/historypayment')} style={isActive('/staff/historypayment') ? activeStyle : {}}>
            <ListItemIcon style={{ color: 'white' }}>
              <PaymentIcon />
            </ListItemIcon>
            <ListItemText primary="Payment" />
          </ListItem>

          {/* <ListItem button component={Link} to="/staff/refund" selected={isActive('/staff/refund')}>
            <ListItemIcon style={{ color: 'white' }}>
              <RefundIcon />
            </ListItemIcon>
            <ListItemText primary="Refund" />
          </ListItem> */}

          <ListItem button component={Link} to="/staff/mailing-list" selected={isActive('/staff/mailing-list')} style={isActive('/staff/mailing-list') ? activeStyle : {}}>
            <ListItemIcon style={{ color: 'white' }}>
              <MailingIcon />
            </ListItemIcon>
            <ListItemText primary="Mailing List" />
          </ListItem>

          <ListItem button component={Link} to="/staff/review" selected={isActive('/staff/review')} style={isActive('/staff/review') ? activeStyle : {}}>
            <ListItemIcon style={{ color: 'white' }}>
              <ReviewIcon />
            </ListItemIcon>
            <ListItemText primary="Review" />
          </ListItem>
        </List>
      </Drawer>

      {/* Mobile drawer toggle button */}
      {isMobile && (
        <IconButton
          onClick={handleDrawerToggle}
          style={{
            position: 'fixed',
            top: 10,
            right: 10,
            backgroundColor: 'green',
            zIndex: 999,
          }}
        >
          {mobileOpen ? <CloseIcon style={{ color: 'black', fontSize: 30 }} /> : <MenuIcon style={{ color: 'white', fontSize: 30 }} />}
        </IconButton>
      )}
    </>
  );
};

export default Sidebar;
