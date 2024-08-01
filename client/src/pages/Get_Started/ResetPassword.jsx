import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TextField, Button, Typography, Box, Grid, Stepper, Step, StepLabel } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '/src/http';
import { Link } from 'react-router-dom';
import '../../style/loginandregister.css';

function ResetPassword() {
  const navigate = useNavigate();
  const storedToken = localStorage.getItem('resetToken');

  useEffect(() => {
    if (!storedToken) {
      navigate('/reset_password/request');
    }
    else {
      const tokenData = JSON.parse(storedToken); // Parse the token
      if (Date.now() > tokenData.expires) {
        localStorage.removeItem('resetToken');
        navigate('/reset_password/request');
      }
      else {
        const tokenData = JSON.parse(storedToken); // Parse the token
        if (Date.now() > tokenData.expires) {
          localStorage.removeItem('resetToken');
          navigate('/reset_password/request');
        }
      }
    }
  }, [storedToken, navigate]);

  const handleResetPassword = useFormik({
    initialValues: {
      newPassword: ''
    },
    validationSchema: yup.object({
      newPassword: yup.string().trim().min(8).max(50).required("This is a required field")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$/,
        "Password must have a mix of lower and uppercase letters and at least 1 number")
    }),
    onSubmit: (data) => {
      // Include the reset token in the request body

      const storedToken = localStorage.getItem('resetToken');
      if (!storedToken) {
        alert("Verification code has expired.");
        navigate('/reset_password/request');
        return;
      }
      
      const tokenData = JSON.parse(storedToken); // Parse the token
      if (Date.now() > tokenData.expires) {
        alert("Verification code has expired.");
        localStorage.removeItem('resetToken');
        navigate('/reset_password/request');
        return;
      }

      const payload = {
        newPassword: data.newPassword.trim(),
        resetToken: tokenData.token 
      };

      http.post('/reset_password/reset', payload)
      .then(response => {
        alert("Password updated successfully. You can now login with your new password.");
        localStorage.removeItem('resetToken');
        navigate('/login');
        
      }).catch((err) => {
        const errorMessage = err.response?.data?.message || "Internal server error";
        handleResetPassword.setFieldError('newPassword', errorMessage);

        if (errorMessage === "Please Enter a new password") {
          handleResetPassword.setFieldError('newPassword', errorMessage);
        }
        else if (errorMessage === "Verification code has expired") {
          alert("Verification code has expired.");
          localStorage.removeItem('resetToken');
          navigate('/reset_password/request');
        }
        else {
            handleResetPassword.setFieldError('newPassword', errorMessage);
        }
        console.log(errorMessage);
      });
    }
  });

  const steps = [
    'Enter Email',
    'Verify Code',
    'Reset Password'
  ];

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Grid container spacing={2} className='login-register-elements'>
        <Grid item md={5} xs={12} className='image-container'>
          <img src="/src/assets/images/register_bg.png" alt="eco-haven" className='eco-haven-image'/>
        </Grid>
        <Grid item md={7} xs={12} className='login-register-forms'>
          <Box className="login-register-forms-stepper">
            <Stepper activeStep={2} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
          <div className="login-register">
            
            <Typography variant="h5" sx={{ my: 2, textAlign: 'left', fontWeight: 'bold', mt: '2rem' }}>
              Enter your new password
            </Typography>
            <Box component="form" onSubmit={handleResetPassword.handleSubmit}>
              <Box className="login-register-form-fields"
              style={{ marginTop: '3rem' }}>
                <TextField
                  fullWidth margin="dense" autoComplete="off"
                  label="New Password"
                  variant="outlined"
                  type="password"
                  name="newPassword"
                  value={handleResetPassword.values.newPassword}
                  onChange={handleResetPassword.handleChange}
                  error={handleResetPassword.touched.newPassword && Boolean(handleResetPassword.errors.newPassword)}
                  helperText={handleResetPassword.touched.newPassword && handleResetPassword.errors.newPassword}
                />
              </Box>  
              <Box sx={{ mt: '5rem', textAlign: 'center', display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" type="submit" className='login-register-button'>
                  Reset Password
                </Button>
              </Box>
            </Box>
          </div>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ResetPassword;