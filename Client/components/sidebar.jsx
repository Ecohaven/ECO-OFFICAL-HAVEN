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

  const isMobile = useMediaQuery({ maxWidth: 960 }); // Adjust the breakpoint as needed

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
          <Link to="/" style={{ textDecoration: 'none', color: 'white', display: 'block', textAlign: 'center', paddingTop: '20px', paddingBottom: '20px' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Eco</span><span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'black' }}>Haven</span>
          </Link>
        </div>
        <List>
          <ListItem button component={Link} to="/overview" selected={isActive('/overview')}>
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
              <ListItem button component={Link} to="/users" selected={isActive('/users')}>
                <ListItemText primary="Users" />
              </ListItem>
              <ListItem button component={Link} to="/staff" selected={isActive('/staff')}>
                <ListItemText primary="Staff" />
              </ListItem>
            </List>
          </Collapse>

          <ListItem button component={Link} to="/events" selected={isActive('/events')}>
            <ListItemIcon style={{ color: 'white' }}>
              <EventIcon />
            </ListItemIcon>
            <ListItemText primary="Events" />
          </ListItem>

          <ListItem button component={Link} to="/bookings" selected={isActive('/bookings')}>
            <ListItemIcon style={{ color: 'white' }}>
              <BookingsIcon />
            </ListItemIcon>
            <ListItemText primary="Bookings" />
          </ListItem>

          <ListItem button component={Link} to="/attendance" selected={isActive('/attendance')}>
            <ListItemIcon style={{ color: 'white' }}>
              <AttendanceIcon />
            </ListItemIcon>
            <ListItemText primary="Attendance" />
          </ListItem>

          <ListItem button component={Link} to="/points" selected={isActive('/points')}>
            <ListItemIcon style={{ color: 'white' }}>
              <PointsIcon />
            </ListItemIcon>
            <ListItemText primary="Points" />
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
              <ListItem button component={Link} to="/collectionproduct" selected={isActive('/collection')}>
                <ListItemText primary="Collection" />
              </ListItem>
              <ListItem button component={Link} to="/rewardproduct" selected={isActive('/shop')}>
                <ListItemText primary="Shop" />
              </ListItem>
            </List>
          </Collapse>

          <ListItem button component={Link} to="/payment" selected={isActive('/payment')}>
            <ListItemIcon style={{ color: 'white' }}>
              <PaymentIcon />
            </ListItemIcon>
            <ListItemText primary="Payment" />
          </ListItem>

          <ListItem button component={Link} to="/refund" selected={isActive('/refund')}>
            <ListItemIcon style={{ color: 'white' }}>
              <RefundIcon />
            </ListItemIcon>
            <ListItemText primary="Refund" />
          </ListItem>

          <ListItem button component={Link} to="/mailing-list" selected={isActive('/mailing-list')}>
            <ListItemIcon style={{ color: 'white' }}>
              <MailingIcon />
            </ListItemIcon>
            <ListItemText primary="Mailing List" />
          </ListItem>

          <ListItem button component={Link} to="/review" selected={isActive('/review')}>
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
