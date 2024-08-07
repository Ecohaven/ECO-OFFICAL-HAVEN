import React, { useEffect, useState } from 'react'
import { Box, Typography, TextField, Button, Stepper, Step, StepLabel, CircularProgress } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '/src/http';
import { useNavigate } from 'react-router-dom';


function StaffResetPasswordRequest() {
    const navigate = useNavigate();
    const storedToken = localStorage.getItem('resetTokenStaff');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (storedToken) {
            const tokenData = JSON.parse(storedToken); // Parse the token
            
            // if token is expired, remove it from local storage
            if (Date.now() > tokenData.expires) {
                localStorage.removeItem('resetTokenStaff');
            }
            else {
                navigate('/staff/staff_reset_password/verify');
            }
        }
        else {
            localStorage.removeItem('resetTokenStaff');
            navigate('/staff/staff_reset_password/request');
        }
    }, [storedToken, navigate]);


    const formik = useFormik({
        initialValues: {
            email: ''
        },
        validationSchema: yup.object({
            email: yup.string().trim().email("Invalid email format").required("This is a required field")
        }),
        onSubmit: (data) => {
            setLoading(true);
            data.email = data.email.trim();
            http.post('/reset_password/request/staff', data)
            .then(response => {
                const { resetTokenStaff } = response.data;
                localStorage.setItem('resetTokenStaff', JSON.stringify({
                    token: resetTokenStaff,
                    expires: Date.now() + 600000 // 10 minutes from now
                }));
                navigate('/staff/staff_reset_password/verify');
            })
            .catch((err) => {
                const errorMessage = err.response.data.message;

                if (errorMessage === "Account not found") {
                    formik.setFieldError('email', errorMessage);
                }
                else {
                    console.log(err.response.data);
                }
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
                <Stepper activeStep={0} alternativeLabel>
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
                        Enter your email to reset your password
                    </Typography>
                    <Box component="form" onSubmit={formik.handleSubmit}>
                        <Box className="login-register-form-fields">
                            <TextField
                                fullWidth
                                id="email"
                                name="email"
                                label="Email"
                                variant="outlined"
                                margin="normal"
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                error={formik.touched.email && Boolean(formik.errors.email)}
                                helperText={formik.touched.email && formik.errors.email}
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
                            <Button variant="contained" sx={{ backgroundColor: 'white', color: '#19682c',
                                "&:hover": { backgroundColor: 'grey', color: 'white' } }}>
                                <CircularProgress size={24} color='primary' />
                                <Typography variant="button" sx={{ ml: 1 }}>  
                                    Sending
                                </Typography>
                            </Button>
                        )}
                        {!loading &&
                            <Button variant="contained" type="submit" sx={{ backgroundColor: 'white', color: '#19682c',
                                "&:hover": { backgroundColor: 'grey', color: 'white' } }}>
                                Send Verification Code
                            </Button>
                        }
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    </>
  )
}

export default StaffResetPasswordRequest;