import React from 'react';
import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import AccountContext from '/src/contexts/AccountContext';

// This HOC is used to protect routes that are only for guests (not logged in)
const GuestRoute = ({ element: Component, ...rest }) => { // rest is a variable that will hold the remaining props
  const { account } = useContext(AccountContext);
  const token = localStorage.getItem('accessToken');


  // If the user is authenticated, redirect to home or another route
  if (token) {
    return <Navigate to="/account" />;
  }
  else if (account) {
    return <Navigate to="/" />;
  }

  return <Component {...rest} />;
};

export default GuestRoute;