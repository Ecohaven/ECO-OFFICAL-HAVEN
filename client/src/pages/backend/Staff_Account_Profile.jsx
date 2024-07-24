import React from 'react'
import { useContext, useEffect } from 'react';
import AccountContext from '/src/contexts/AccountContext';

function Staff_Account_Profile() {
    const { account, setAccount } = useContext(AccountContext);
  
    console.log("Account data:", account);

    return (
      <>
        <div>
            <h1>Staff Account Profile</h1>
            <p>Name: {account.name}</p>
            <p>birthdate: {account.birthdate}</p>
            <p>Phone: {account.phone_no}</p> 
            <p>Email: {account.email}</p>
            <p>Role: {account.role}</p>
        </div>
      </>
    )
}

export default Staff_Account_Profile;