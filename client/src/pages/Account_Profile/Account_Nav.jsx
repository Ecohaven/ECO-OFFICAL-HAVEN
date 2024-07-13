import React from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Grid, List, ListItem, ListItemText, ListItemButton, Divider} from '@mui/material';
import { styled } from '@mui/material/styles';

// Styling for nav in Account Pages
const ActiveListItem = styled(ListItemButton)(({ selected }) =>({
    color: selected ? '#4CAF50' : 'black', // Green text color for active link
    borderLeft: selected ? '3px solid #4CAF50' : 'none', // Green bar beside the text for active link
    textDecoration: 'none', // Remove underline from links
}));

const StyledLink = styled(Link)({
    textDecoration: 'none', // Remove underline from links
    color: 'inherit', // Inherit color from the ActiveListItem
});  

function Account_Nav() {
  const location = useLocation();

  return (
    <Grid>
      <List>
        <div>
            <StyledLink to={`/account`}>
                <ActiveListItem selected={location.pathname === `/account`}>
                    <ListItemText primary="Account" />
                </ActiveListItem>
            </StyledLink>
            {location.pathname === `/account` && <Divider sx={{ backgroundColor: '#4CAF50' }} />} {/* Green colored divider */}
            <Divider />
        </div>
        <div>
            <StyledLink to={`/account/events`}>
                <ActiveListItem selected={location.pathname === `/account/events`}>
                    <ListItemText primary="Events" />
                </ActiveListItem>
            </StyledLink>
            {location.pathname === `/account/events` && <Divider sx={{ backgroundColor: '#4CAF50' }} />}
            <Divider />
        </div>
        <div>
            <StyledLink to={`/account/qr_codes`}>
                <ActiveListItem selected={location.pathname === `/account/qr_codes`}>
                    <ListItemText primary="QR_Codes" />
                </ActiveListItem>
            </StyledLink>
            {location.pathname === `/account/qr_codes` && <Divider sx={{ backgroundColor: '#4CAF50' }} />}
            <Divider />
        </div>
        <div>
            <StyledLink to={`/account/payments`}>
                <ActiveListItem selected={location.pathname === `/account/payments`}>
                    <ListItemText primary="Payments" />
                </ActiveListItem>
            </StyledLink>
            {location.pathname === `/account/payments` && <Divider sx={{ backgroundColor: '#4CAF50' }} />}
            <Divider />
        </div>
        <div>
            <StyledLink to={`/account/rewards`}>
                <ActiveListItem selected={location.pathname === `/account/rewards`}>
                    <ListItemText primary="Rewards" />
                </ActiveListItem>
            </StyledLink>
            {location.pathname === `/account/rewards` && <Divider sx={{ backgroundColor: '#4CAF50' }} />}
            <Divider />
        </div>
      </List>
    </Grid>
  );
}

export default Account_Nav;