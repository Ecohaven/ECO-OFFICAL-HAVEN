import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useContext, useState } from 'react';
import http from '/src/http';
import AccountContext from '/src/contexts/AccountContext';

// This HOC is used to protect routes that require the staff account to be authenticated
const StaffAuthorization = ({ element: Component, allowedRoles, ...rest }) => {
        const { account, setAccount } = useContext(AccountContext);
        const [loading, setLoading] = useState(true);
        const token = localStorage.getItem('accessToken');

        const handleLogout = () => {
            localStorage.removeItem('accessToken');
            localStorage.clear();
            setAccount(null);
        };

        useEffect(() => {
            const fetchAccountData = async () => {
                try {
                    const response = await http.get('/staff/get_account', {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    setAccount(response.data.account);
                } catch (error) {
                    console.error("Error fetching account:", error);
                    handleLogout();
                } finally {
                    setLoading(false);
                }
            };
    
            if (token && !account) {
                fetchAccountData();
            } else {
                setLoading(false);
            }
        }, [account, token, setAccount]);

        // If the user is not authenticated, redirect to login
    if (!token) {
        localStorage.clear(); // Clear local storage
        return <Navigate to="/staff/staff_login" />;
    }

    if (loading) {
        return <div>Loading...</div>;
    }

        return <Component {...rest} />;
}

export default StaffAuthorization;