import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useContext, useState } from 'react';
import http from '/src/http';
import AccountContext from '/src/contexts/AccountContext';

// This HOC is used to protect routes that require the user account to be authenticated
const WithAuthorization = ({ element: Component, allowedRoles, ...rest }) => {
        const { account, setAccount } = useContext(AccountContext);
        const [loading, setLoading] = useState(true);
        const token = localStorage.getItem('accessToken');

        // If the user is not authenticated, redirect to login
        if (!token) {
            localStorage.clear(); // Clear local storage
            return <Navigate to="/login" />;
        }
        useEffect(() => {
            if (token && !account) {
                // Simulate fetching account data if token exists but account is not set
                fetchAccountData().finally(() => setLoading(false));
            } else {
                setLoading(false);
            }
        }, [account, token]);

        // else {
        //     // Fetch user data when the app component mounts
        //     useEffect(() => {
        //         const validateTokenAndFetchUserData = async () => {
        //             try {
        //                 const response = await http.get(`/account/${account.username}`);
        //                 setAccount(response.data.user);
        //                 console.log("Account data fetched and set:", response.data.user);
        //             } catch (error) {
        //                 console.error("Error fetching account:", error);
        //                 localStorage.clear(); // Clear local storage
        //                 setAccount(null); // Update account state in context
        //                 return <Navigate to="/login" />;
        //             }
        //         };

        //         validateTokenAndFetchUserData();
        //     }, [setAccount]);
        // }

        const fetchAccountData = async () => {
            try {
                const storedUsername = localStorage.getItem('username');
                const response = await http.get(`/account/${storedUsername}`);
                setAccount(response.data.user);
            } catch (error) {
                console.error("Error fetching account:", error);
                handleLogout();
            }
        };
    
        const handleLogout = () => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('username');
            setAccount(null);
        };
    
        if (loading) return <div>Loading...</div>;
    
        if (!token || !account) {
            return <Navigate to="/login" />;
        }

        console.log("Account role:", account);

        // If the user is authenticated, but does not have the required role, redirect to home
        if (allowedRoles && !allowedRoles.includes(account.role)) {
            return <Navigate to="/" />;
        }

        // Render the wrapped component with the given props
        return <Component {...rest} />;
    }

export default WithAuthorization;