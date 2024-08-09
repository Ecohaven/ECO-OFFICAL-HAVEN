import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import AccountContext from '/src/contexts/AccountContext';

// This HOC is used to protect routes that are only for guests (not logged in)
const GuestRoute = ({ element: Component, ...rest }) => { // rest is a variable that will hold the remaining props
  const { account } = useContext(AccountContext);
  const token = localStorage.getItem('accessToken');
  const username = localStorage.getItem('username');

  // check for authorization
    if (token) {
      // check if username is null
      if (!username) {
        // if it is, redirect to the unauthorized page
        return <Navigate to="/staff/unauthorized" />;
      }
      // if it isn't, redirect to the login page
      return <Navigate to="/unauthorized" />;
    }

  return <Component {...rest} />;
};

export default GuestRoute;