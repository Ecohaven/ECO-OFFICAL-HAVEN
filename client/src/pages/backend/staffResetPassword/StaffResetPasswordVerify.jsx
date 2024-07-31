import React, { useEffect } from 'react'
import { Box, Typography, TextField, Button, Stepper, Step, StepLabel } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '/src/http';
import { useNavigate } from 'react-router-dom';


function StaffResetPasswordVerify() {
  const navigate = useNavigate();
  const storedToken = localStorage.getItem('resetTokenStaff');

  useEffect(() => {
    // if there is no reset token in the local storage, redirect to the reset password request page
    if (!storedToken) {
        navigate('/staff/staff_reset_password/request');
    }
  }, [storedToken, navigate]);

  const formik = useFormik({
      initialValues: {
        verificationCode: ''
      },
      validationSchema: yup.object({
        verificationCode: yup.string().required("This is a required field")
      }),
      onSubmit: (data) => {
          if (!storedToken) {
              navigate('/staff/staff_reset_password/request');
              return;
          }

          const tokenData = JSON.parse(storedToken); // Parse the token
          if (storedToken && Date.now() > tokenData.expires) {
              alert("Verification code has expired");
              localStorage.removeItem('resetToken');
              navigate('/staff/staff_reset_password/request');
              return;
          }

          const payload = {
              verificationCode: data.verificationCode.trim(),
              resetTokenStaff: tokenData.token
          };

          http.post('/reset_password/verify/staff', payload)
          .then(response => {
              navigate('/staff/staff_reset_password/reset');
          }).catch((err) => {
              const errorMessage = err.response?.data?.message || "An error occurred";
              formik.setFieldError('verificationCode', errorMessage);

              if (errorMessage === "Invalid verification code" || errorMessage === "Verification code has expired") {
                  formik.setFieldError('verificationCode', errorMessage);
                  if (errorMessage === "Verification code has expired") {
                      alert("Verification code has expired");
                      localStorage.removeItem('resetTokenStaff');
                      navigate('/staff/staff_reset_password/request');
                  }
              }
              else {
                  formik.setFieldError('verificationCode', errorMessage);
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
    <>
        <Typography variant="h4" align="center" fontWeight='bold'
            sx={{ position: 'absolute', top: '10px', left: '10px' }}>
                <span style={{ color: 'green' }}>Eco</span>
                <span style={{ color: 'black' }}>Haven</span>
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
            <Box className="login-register-forms-stepper">
                <Stepper activeStep={1} alternativeLabel>
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
                      Enter the verification code sent to your email
                    </Typography>
                    <Box component="form" onSubmit={formik.handleSubmit}>
                        <Box className="login-register-form-fields">
                            <TextField
                                fullWidth margin="dense" autoComplete="off"
                                label="Verification Code"
                                variant="outlined"
                                name="verificationCode"
                                value={formik.values.verificationCode}
                                onChange={formik.handleChange}
                                error={formik.touched.verificationCode && Boolean(formik.errors.verificationCode)}
                                helperText={formik.touched.verificationCode && formik.errors.verificationCode}
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
                            <Button variant="contained" type="submit" sx={{ backgroundColor: 'white', color: '#19682c',
                                "&:hover": { backgroundColor: 'grey', color: 'white' } }}>
                                Verify Code
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    </>
  )
}

export default StaffResetPasswordVerify