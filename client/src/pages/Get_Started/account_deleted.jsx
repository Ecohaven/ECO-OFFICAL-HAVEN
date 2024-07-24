// This page is displayed when the user deletes their account.
import React from 'react'
import { Box, Grid, Button, Typography  } from '@mui/material';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import '../../style/loginandregister.css'

function Account_Deleted() {
  return (
    <Box>
        <Grid container spacing={2} className='login-register-elements'>
          <Grid item md={5} xs={12} className='image-container'>
            <img src="/src/assets/images/login_bg.png" alt="eco-haven" className='eco-haven-image'/>
          </Grid>
          <Grid item md={7} xs={12} className='login-register-forms' sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ my: 2, fontWeight: 'bold' }}>
                Your account has been deleted
            </Typography>
            <Typography variant='body1' sx={{ my: 2, mb: '3rem' }} id='delete_account_text'>
              We hope to see you again!
            </Typography>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <Button variant='contained'>
                Back to Home
              </Button>
            </Link>
          </Grid>
      </Grid>
    </Box>
  )
}

export default Account_Deleted;