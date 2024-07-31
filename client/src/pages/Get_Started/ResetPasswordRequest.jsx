import React from 'react'
import { Box, TextField, Button, Grid, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import '../../style/loginandregister.css'
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '/src/http';

function ResetPasswordRequest() {
  const navigate = useNavigate();
  const storedToken = localStorage.getItem('resetToken');

  useEffect(() => {
    if (storedToken) {
      const tokenData = JSON.parse(storedToken); // Parse the token
      // if token is expired, remove it from local storage
      if (Date.now() > tokenData.expires) {
        localStorage.removeItem('resetToken');
      }
      else {
        navigate('/reset_password/verify');
      }
    }
    else {
      localStorage.removeItem('resetToken');
      navigate('/reset_password/request');
    }
  }, [storedToken, navigate]);

  const handleSubmitRequest = useFormik({
    initialValues: {
      email: ''
    },
    validationSchema: yup.object({
      email: yup.string().trim().email("Invalid email format").required("This is a required field")
    }),
    onSubmit: (data) => {
      data.email = data.email.trim();
      http.post('/reset_password/request', data)
      .then(response => {
        const { resetToken } = response.data;
          localStorage.setItem('resetToken', JSON.stringify({
            token: resetToken,
            // expires: Date.now() + 600000 // 10 minutes from now
            expires: Date.now() + 60000 // 1 minute from now
          })); 
        navigate('/reset_password/verify'); // Redirect to verify page with email
      }).catch((err) => {
        const errorMessage = err.response.data.message;

        if (errorMessage === "Account not found") {
          handleSubmitRequest.setFieldError('email', errorMessage);
        }
        else {
          console.log(err.response.data);
        }
      });
    }
  });

  return (
    <Box>
      <Grid container spacing={2} className='login-register-elements'>
        <Grid item md={5} xs={12} className='image-container'>
          <img src="/src/assets/images/register_bg.png" alt="eco-haven" className='eco-haven-image'/>
        </Grid>
        <Grid item md={7} xs={12} className='login-register-forms'>
          <div className='get-started'>
            <Link to="/login" className='get-started-link'>&lt; Back to Login</Link>
          </div>
          <div className="login-register">
            <Typography variant="h5" sx={{ my: 2, textAlign: 'left', fontWeight: 'bold', mt: '4.5rem' }}>
              Enter your email to reset your password
            </Typography>
            <Box component="form" onSubmit={handleSubmitRequest.handleSubmit}>
              <Box className="login-register-form-fields"
              style={{ marginTop: '3rem' }}>
                <TextField
                  fullWidth margin="dense" autoComplete="off"
                  label="Email"
                  variant="outlined"
                  name='email'
                  value={handleSubmitRequest.values.email}
                  onChange={handleSubmitRequest.handleChange}
                  error={handleSubmitRequest.touched.email && Boolean(handleSubmitRequest.errors.email)}
                  helperText={handleSubmitRequest.touched.email && handleSubmitRequest.errors.email}
                />
              </Box>  
              <Box sx={{ mt: '5rem', textAlign: 'center', display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" type="submit" className='login-register-button'>
                  Send Verification Code
                </Button>
              </Box>
            </Box>
          </div>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ResetPasswordRequest;