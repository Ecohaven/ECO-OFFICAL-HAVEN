import React from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Grid, List, ListItem, ListItemText, ListItemButton, Divider} from '@mui/material';
import { styled } from '@mui/material/styles';

// Styling for nav in Account Pages
const ActiveListItem = styled(ListItemButton)(({ selected }) =>({
  color: selected ? '#4CAF50' : 'inherit', // Green text color for active link
  borderLeft: selected ? '3px solid #4CAF50' : 'none', // Green bar beside the text for active link
}));

function Account_Nav() {
  const { username } = useParams();
  const location = useLocation();

  return (
    <Grid>
      <List>
        <div>
            <Link to={`/${username}`}>
                <ActiveListItem selected={location.pathname === `/${username}`}>
                    <ListItemText primary="Account" />
                </ActiveListItem>
            </Link>
            {location.pathname === `/${username}` && <Divider sx={{ backgroundColor: '#4CAF50' }} />} {/* Green colored divider */}
        </div>
        <div>
            <Link to={`/${username}/events`}>
                <ActiveListItem selected={location.pathname === `/${username}/events`}>
                    <ListItemText primary="Events" />
                </ActiveListItem>
            </Link>
            {location.pathname === `/${username}/events` && <Divider sx={{ backgroundColor: '#4CAF50' }} />}
        </div>
        <div>
            <Link to={`/${username}/qr_codes`}>
                <ActiveListItem selected={location.pathname === `/${username}/qr_codes`}>
                    <ListItemText primary="QR_Codes" />
                </ActiveListItem>
            </Link>
            {location.pathname === `/${username}/qr_codes` && <Divider sx={{ backgroundColor: '#4CAF50' }} />}
        </div>
        <div>
            <Link to={`/${username}/payments`}>
                <ActiveListItem selected={location.pathname === `/${username}/payments`}>
                    <ListItemText primary="Payments" />
                </ActiveListItem>
            </Link>
            {location.pathname === `/${username}/payments` && <Divider sx={{ backgroundColor: '#4CAF50' }} />}
        </div>
        <div>
            <Link to={`/${username}/rewards`}>
                <ActiveListItem selected={location.pathname === `/${username}/settings`}>
                    <ListItemText primary="Rewards" />
                </ActiveListItem>
            </Link>
            {location.pathname === `/${username}/rewards` && <Divider sx={{ backgroundColor: '#4CAF50' }} />}
        </div>
      </List>
    </Grid>
  );
}

export default Account_Nav;