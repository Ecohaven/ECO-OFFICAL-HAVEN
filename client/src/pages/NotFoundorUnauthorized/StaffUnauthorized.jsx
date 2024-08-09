import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Typography, Box, Container } from '@mui/material'

function StaffUnauthorized() {
  // This page is displayed when a staff tries to access a page they are not authorized to view

  const navigate = useNavigate()

  const navigateToDashboard = () => {
    navigate('/staff/dashboard')
  }

  return (
    <Box 
      sx={{
        height: '94vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f7f7f7',
        padding: 3,
      }}
    >
      <Container maxWidth="sm" sx={{ textAlign: 'center', backgroundColor: '#fff', padding: 4, borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          <span style={{ color: 'green' }}>Eco</span>
          <span style={{ color: 'black' }}>Haven</span>
        </Typography>
        <Typography variant="h4" fontWeight="300" gutterBottom>
          Sorry!
        </Typography>
        <Typography variant="body1" fontWeight="bold" paragraph>
          You are not authorized to view this page. Please contact the administrator for access.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={navigateToDashboard} 
          sx={{ mt: 2 }}
        >
          Back to Dashboard
        </Button>
      </Container>
    </Box>
  )
}

export default StaffUnauthorized;
