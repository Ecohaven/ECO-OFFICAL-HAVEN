import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AccountContext from '/src/contexts/AccountContext';

// This HOC is used to protect routes that are not for staff members
const UserAndGuestRoute = ({ element: Component, ...rest }) => {
    const { account } = useContext(AccountContext);
    const isStaff = account && account.role && account.role !== 'User';

    // Redirect staff members to their homepage if they are logged in
    if (isStaff) {
        return <Navigate to="/staff/staffhome" />;
    }

    return <Component {...rest} />;
};

export default UserAndGuestRoute;