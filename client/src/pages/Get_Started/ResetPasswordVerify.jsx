import React from 'react'
import { Box, TextField, Button, Grid, Typography, Stepper, Step, StepLabel } from '@mui/material';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import '../../style/loginandregister.css'
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '/src/http';

function ResetPasswordVerify() {
    const navigate = useNavigate();
    const storedToken = localStorage.getItem('resetToken');

    useEffect(() => {
        // if there is no reset token in the local storage, redirect to the reset password request page
        if (!storedToken) {
            navigate('/reset_password/request');
        }
    }, [storedToken, navigate]);
 
    const handleVerifyCode = useFormik({
        initialValues: {
          verificationCode: ''
        },
        validationSchema: yup.object({
          verificationCode: yup.string().required("This is a required field")
        }),
        onSubmit: (data) => {
            if (!storedToken) {
                navigate('/reset_password/request');
                return;
            }

            const tokenData = JSON.parse(storedToken); // Parse the token
            if (storedToken && Date.now() > tokenData.expires) {
                alert("Verification code has expired");
                localStorage.removeItem('resetToken');
                navigate('/reset_password/request');
                return;
            }

            const payload = {
                verificationCode: data.verificationCode.trim(),
                resetToken: tokenData.token
            };

            http.post('/reset_password/verify', payload)
            .then(response => {
                navigate('/reset_password/reset');
            }).catch((err) => {
                const errorMessage = err.response?.data?.message || "An error occurred";
                handleVerifyCode.setFieldError('verificationCode', errorMessage);

                if (errorMessage === "Invalid verification code" || errorMessage === "Verification code has expired") {
                    handleVerifyCode.setFieldError('verificationCode', errorMessage);
                    if (errorMessage === "Verification code has expired") {
                        alert("Verification code has expired");
                        localStorage.removeItem('resetToken');
                        navigate('/reset_password/request');
                    }
                }
                else {
                    handleVerifyCode.setFieldError('verificationCode', errorMessage);
                }
            });
        }
    });

    const steps = [
      'Enter Email',
      'Verify Code',
      'Reset Password'
    ];

  return (
    <Box>
      <Grid container spacing={2} className='login-register-elements'>
        <Grid item md={5} xs={12} className='image-container'>
          <img src="/src/assets/images/register_bg.png" alt="eco-haven" className='eco-haven-image'/>
        </Grid>
        <Grid item md={7} xs={12} className='login-register-forms'>
          <Box className="login-register-forms-stepper">
            <Stepper activeStep={1} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
          <div className="login-register">
            <Typography variant="h5" sx={{ my: 2, textAlign: 'left', fontWeight: 'bold', mt: '4.5rem' }}>
              Enter the verification code sent to your email
            </Typography>
            <Box component="form" onSubmit={handleVerifyCode.handleSubmit}>
              <Box className="login-register-form-fields"
              style={{ marginTop: '3rem' }}>
                <TextField
                  fullWidth margin="dense" autoComplete="off"
                  label="Verification Code"
                  variant="outlined"
                  name="verificationCode"
                  value={handleVerifyCode.values.verificationCode}
                  onChange={handleVerifyCode.handleChange}
                  error={handleVerifyCode.touched.verificationCode && Boolean(handleVerifyCode.errors.verificationCode)}
                  helperText={handleVerifyCode.touched.verificationCode && handleVerifyCode.errors.verificationCode}
                />
              </Box>  
              <Box sx={{ mt: '5rem', textAlign: 'center', display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" type="submit" className='login-register-button'>
                  Verify Code
                </Button>
              </Box>
            </Box>
          </div>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ResetPasswordVerify;