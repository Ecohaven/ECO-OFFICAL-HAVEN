import React from 'react'
import { useContext, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import AccountContext from '/src/contexts/AccountContext';
import dayjs from 'dayjs';
import '../../style/staffaccounts.css';

function Staff_Account_Profile() {
    const { account, setAccount } = useContext(AccountContext);
  
    console.log("Account data:", account);

    return (
      <>
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',  // full viewport height
        }}
      >
        <Box
          sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '80%', maxWidth: 1000,
            margin: 5, padding: 2, border: 1, borderRadius: 2, borderColor: 'grey.500'
           }}>
            <h2>Account Profile</h2>
            <Box sx={{ padding: 4, margin: 2 }}>
            <p className='account-field'>
              Name: 
              <span className='account-details'>{account.name}</span>
            </p>
            <p className='account-field'>
              Email: 
              <span className='account-details'>{account.email}</span>
            </p>
            <p className='account-field'>
              Phone Number: 
              <span className='account-details'>{account.phone_no}</span>
            </p>
            <p className='account-field'>
              Role: 
              <span className='account-details'>{account.role}</span>
            </p>
            <p className='account-field'>
              Birthdate: 
              <span className='account-details'>{ dayjs(account.birthdate).format('LL') }</span>
            </p>

            </Box>
        </Box>
      </Box>
      </>
    )
}

export default Staff_Account_Profile;