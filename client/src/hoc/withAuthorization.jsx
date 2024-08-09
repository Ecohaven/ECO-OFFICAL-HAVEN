import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useContext, useState } from 'react';
import http from '/src/http';
import AccountContext from '/src/contexts/AccountContext';
import { set } from 'date-fns';

// This HOC is used to protect routes that require the user account to be authenticated
const WithAuthorization = ({ element: Component, allowedRoles, ...rest }) => {
        const { account, setAccount } = useContext(AccountContext);
        const [loading, setLoading] = useState(true);
        const token = localStorage.getItem('accessToken');
        const username = localStorage.getItem('username');
        const [status, setStatus] = useState(null);

        // If the user is guest, redirect to login
        if (!token) {
            localStorage.clear(); // Clear local storage
            return <Navigate to="/login" />;
        }
        // if the user is authenticated, but does not have the required role (is a staff), redirect to unauthorized
        if (token && !username) {
            return <Navigate to="/staff/unauthorized" />;
        }
        useEffect(() => {
            if (token && !account) {
                // Simulate fetching account data if token exists but account is not set
                fetchAccountData().finally(() => setLoading(false));
            } else {
                setLoading(false);
            }
        }, [account, token, setAccount, setStatus]);

        const fetchAccountData = async () => {
            try {
                const storedUsername = localStorage.getItem('username');
                const response = await http.get(`/account/${storedUsername}`);
                setAccount(response.data.user);
                setStatus(response.data.user.status);
            } catch (error) {
                console.error("Error fetching account:", error);
                localStorage.clear(); // Clear local storage
                setAccount(null);
                setStatus(null);
            }
        };
    
        if (loading) return <div>Loading...</div>;

        // If the user is authenticated, but does not have the required role (is a staff member), redirect to home
        if (allowedRoles && !allowedRoles.includes(account.role)) {
            setStatus(null);
            return <Navigate to="/staff/unauthorized" />;
        }

        // Check if user status is inactive
        if (account.status !== 'Active') {
            localStorage.clear(); // Clear local storage
            setAccount(null);
            return <Navigate to="/staff/staff_login" />;
        }

        // Render the wrapped component with the given props
        return <Component {...rest} />;
    }

export default WithAuthorization;