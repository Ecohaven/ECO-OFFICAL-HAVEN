import React from 'react'
import { useNavigate } from 'react-router-dom';
import { useContext, useEffect } from 'react';
import AccountContext from '/src/contexts/AccountContext';
import { Button } from '@mui/material';

function Staffhome() {
  const { account, setAccount } = useContext(AccountContext);
  const navigate = useNavigate();

  const handleLogout = () => { 
    localStorage.removeItem('accessToken');
    localStorage.clear();
    setAccount(null);
    navigate('/staff/staff_login');
  }

  console.log("Account data:", account);

  return (
    <>
    <div>Staffhome</div>
    <div>{account.email}</div>
    <div>
      <Button onClick={handleLogout}>Logout</Button>
    </div>
    </>
  )
}

export default Staffhome;