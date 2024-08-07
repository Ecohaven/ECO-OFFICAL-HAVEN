import React, { useEffect, useState } from 'react'
import { Box, Typography, TextField, Button, Stepper, Step, StepLabel } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '/src/http';
import { useNavigate } from 'react-router-dom';

function StaffResetPassword() {
  const navigate = useNavigate();
  const storedToken = localStorage.getItem('resetTokenStaff');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!storedToken) {
      navigate('/staff/staff_reset_password/request');
    }
    else {
      const tokenData = JSON.parse(storedToken); // Parse the token
      if (Date.now() > tokenData.expires) {
        alert("Verification code has expired.");
        localStorage.removeItem('resetTokenStaff');
        navigate('/staff/staff_reset_password/request');
      }
    }
  }, [storedToken, navigate]);

  const formik = useFormik({
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
      setLoading(true);

      const storedToken = localStorage.getItem('resetTokenStaff');
      if (!storedToken) {
        alert("Verification code has expired.");
        navigate('/staff/staff_reset_password/request');
        return;
      }

      const tokenData = JSON.parse(storedToken); // Parse the token
      if (Date.now() > tokenData.expires) {
        alert("Verification code has expired.");
        localStorage.removeItem('resetTokenStaff');
        navigate('/staff/staff_reset_password/request');
        return;
      }

      const payload = {
        newPassword: data.newPassword.trim(),
        resetTokenStaff: tokenData.token
      };

      http.post('/reset_password/reset/staff', payload)
      .then(response => {
        alert("Password updated successfully. You can now login with your new password.");
        localStorage.removeItem('resetTokenStaff');
        navigate('/staff/staff_login');
      }).catch((err) => {
        const errorMessage = err.response?.data?.message || "An error occurred";
        formik.setFieldError('newPassword', errorMessage);

        if (errorMessage === "Please Enter a new password") {
          formik.setFieldError('newPassword', errorMessage);
        }
        else if (errorMessage === "Verification code has expired") {
          alert("Verification code has expired");
          localStorage.removeItem('resetTokenStaff');
          navigate('/staff/staff_reset_password/request');
        }
        else {
          formik.setFieldError('newPassword', errorMessage);
        }
        console.log(errorMessage);
        setLoading(false);
      });
    }
  });

  const steps = [
    'Enter Email',
    'Verify Code',
    'Reset Password'
  ];

  return (
    <>
        <Typography variant="h4" align="center" fontWeight='bold'
            sx={{ position: 'absolute', top: '10px', left: '10px' }}>
                <span style={{ color: 'green' }}>Eco</span>
                <span style={{ color: 'black' }}>Haven</span>
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
            <Box className="login-register-forms-stepper">
                <Stepper activeStep={2} alternativeLabel>
                {steps.map((label) => (
                    <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
                </Stepper>
            </Box>
            <Box
            sx={{ backgroundColor: '#19682c', padding: '35px', borderRadius: '20px', boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.1)',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '35%' }}>
                <Box marginBottom="2rem">
                    <Typography variant="h5" align="left" fontWeight='bold' color="white" gutterBottom marginBottom="3rem">
                      Enter your new password
                    </Typography>
                    <Box component="form" onSubmit={formik.handleSubmit}>
                        <Box className="login-register-form-fields">
                            <TextField
                                fullWidth margin="dense" autoComplete="off"
                                label="New Password" variant="outlined" type="password"
                                name="newPassword" value={formik.values.newPassword}
                                onChange={formik.handleChange}
                                error={formik.touched.newPassword && Boolean(formik.errors.newPassword)}
                                helperText={formik.touched.newPassword && formik.errors.newPassword}
                                InputProps={{
                                    style: {
                                      backgroundColor: 'white'
                                    },
                                    notchedoutline: {
                                      borderColor: 'black'
                                    }
                                  }}
                                  InputLabelProps={{
                                    style: {
                                      color: 'black',
                                      backgroundColor: 'white',
                                      padding: '0px 5px',
                                      borderRadius: '5px',
                                    }
                                }}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                            {loading && (
                              <Button variant="contained" type="submit" sx={{ backgroundColor: 'white', color: '#19682c',
                                  "&:hover": { backgroundColor: 'grey', color: 'white' } }}>
                                  Reset Password
                              </Button>
                            )}
                            {!loading && (
                            <Button variant="contained" type="submit" sx={{ backgroundColor: 'white', color: '#19682c',
                                "&:hover": { backgroundColor: 'grey', color: 'white' } }}>
                                Reset Password
                            </Button>
                            )}
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    </>
  )
}

export default StaffResetPassword