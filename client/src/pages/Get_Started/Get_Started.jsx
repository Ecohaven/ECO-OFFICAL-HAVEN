import React from 'react'
import { Box, Container, Typography, TextField, Button } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom';

function Get_Started() {
  return (
    <Box>
        <Link to="/" style={{ textDecoration: 'none' }}>&lt;</Link>
        <Typography variant="h5" sx={{ my: 2 }}>
            EcoHaven
        </Typography>
        <div>
        <Link to="/register" style={{ textDecoration: 'none' }}>
            <Button variant='contained'>
                Register
            </Button>
        </Link>
        </div>
        <div>
        <Link to="/login" style={{ textDecoration: 'none' }}>
            <Button variant='contained' color='secondary'>
                Login
            </Button>
        </Link>
        </div>
        <Link to="/">
            <Typography variant="h6" component="div" color='secondary'>
                Continue Without Account
            </Typography>
        </Link>
    </Box>
  )
}

export default Get_Started