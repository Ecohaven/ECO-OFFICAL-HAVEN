import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import http from '/src/http';
import AccountContext from '/src/contexts/AccountContext';

// This HOC is used to protect routes that require the staff account to be authenticated
const StaffAuthorization = ({ element: Component, allowedRoles, ...rest }) => {
    const { account, setAccount } = useContext(AccountContext);
    const [role, setRole] = useState(null);
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('accessToken');
    const username = localStorage.getItem('username');
    const navigate = useNavigate();

    if (!token) {
        localStorage.clear(); // Clear local storage
        return <Navigate to="/staff/staff_login" />;
    }
    if (token && username) {
        return <Navigate to="/unauthorized" />;
    }

    useEffect(() => {
        const fetchAccountData = async () => {
            try {
                const response = await http.get('/staff/get_account', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log('Account:', response.data.account);
                setAccount(response.data.account);
                setRole(response.data.account.role);
                setStatus(response.data.account.status);
            } catch (error) {
                console.error("Error fetching account:", error);
                // check error message
                if (error.response.data.message === 'Your account has been deactivated. Please contact the administrator for support.') {
                    localStorage.removeItem('accessToken');
                    localStorage.clear();
                    setAccount(null);
                    setRole(null);
                    setStatus(null);
                    console.log('Logged out');
                    navigate('/staff/staff_login');
                }
            } finally {
                setLoading(false);
            }
        };
        
        fetchAccountData();
    }, [token, setAccount]);

    // If user is authenticated, but does not have the required role, redirect to unauthorized
    if (role && !allowedRoles.includes(role)) {
        console.log('Unauthorized');
        return <Navigate to="/staff/unauthorized" />;
    }

    // if (account && account.status !== 'Active') {
    //     console.log('Inactive');
    //     localStorage.removeItem('accessToken');
    //     localStorage.clear();
    //     setAccount(null);
    //     setRole(null);
    //     setStatus(null);
    //     console.log('Logged out');
    //     return <Navigate to="/staff/staff_login" />;
    // }

    if (loading) {
        return <div>Loading...</div>;
    }

        return <Component {...rest} />;
}

export default StaffAuthorization;