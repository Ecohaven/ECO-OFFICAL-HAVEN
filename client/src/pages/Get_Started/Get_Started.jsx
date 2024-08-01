import React from 'react'
import { Box, Container, Typography, TextField, Button, Grid } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import '../../style/loginandregister.css'
import { Margin } from '@mui/icons-material';

function Get_Started() {
  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Grid container spacing={2} className='login-register-elements'>
            <Grid item md={5} xs={12} className='image-container'>
                <img src="../src/assets/images/login_bg.png" alt="eco-haven" className='eco-haven-image'/>
            </Grid>
            <Grid item md={7} xs={12} className='login-register-forms'>
            <div className='get-started'>
                <Link to="/" className='get-started-link'>&lt; Back</Link>
            </div>
            <Typography variant="h5" component="div" sx={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '4rem' }}>
                <span style={{ color: 'green' }}>Eco</span>
                <span style={{ color: 'black' }}>Haven</span>
            </Typography>
            <div style={{ margin: '2rem' }}>
            <Link to="/register">
                <Button variant='contained' sx={{ fontSize: '1.2rem', paddingLeft: '5rem', paddingRight: '5rem' }}>
                    Register
                </Button>
            </Link>
            </div>
            <div style={{ margin: '2rem' }}>
            <Link to="/login">
                <Button variant='contained' color='secondary' sx={{ fontSize: '1.2rem', paddingLeft: '6rem', paddingRight: '6rem' }}>
                    Login
                </Button>
            </Link>
            </div>
            <div style={{ margin: '50px' }}>
            <Link to="/">
                <Typography variant="h7" component="div" color='secondary' className='login-register-link'>
                    Continue Without Account
                </Typography>
            </Link>
            </div>
            </Grid>
        </Grid>
    </Box>
  )
}

export default Get_Started