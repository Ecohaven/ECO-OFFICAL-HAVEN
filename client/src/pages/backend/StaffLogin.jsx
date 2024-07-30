import React, {useContext} from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Typography, TextField, Button } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '/src/http';
import AccountContext from '/src/contexts/AccountContext';

function StaffLogin() {
    const navigate = useNavigate();
    const { setAccount } = useContext(AccountContext);

    const formik = useFormik({
        initialValues: {
            email: '',
            password: ''
        },
        validationSchema: yup.object({
            email: yup.string().trim().email("Invalid email format").required("This is a required field"),
            password: yup.string().trim().required("This is a required field")
        }),
        onSubmit: (data) => {
            data.email = data.email.trim();
            data.password = data.password.trim();

            http.post('/staff/login', data)
            .then(response => {
                const accessToken = response.data.accessToken;
                localStorage.setItem('accessToken', accessToken);
                setAccount(response.data.account);
                console.log(response.data.account);
                navigate('/staff/dashboard');
            })
            .catch((err) => {
                const errorMessage = err.response.data.message;
                formik.setFieldError('password', errorMessage);
                console.log(err.response.data);
            });
        }
    });


    return(
        <>
        <Typography variant="h4" align="center" fontWeight='bold'
            sx={{ position: 'absolute', top: '10px', left: '10px' }}>
                <span style={{ color: 'green' }}>Eco</span>
                <span style={{ color: 'black' }}>Haven</span>
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Box component="form" onSubmit={formik.handleSubmit}
         sx={{ backgroundColor: '#19682c', padding: '35px', borderRadius: '20px', boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.1)',
            maxWidth: {xs: '85%', sm: '70%', md: '60%', lg: '50%'},
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
          }}>
            <Box>
                <Typography variant="h4" align="left" color='white' fontWeight='bold'
                marginBottom='30px'
                 >Staff Login</Typography>
                <TextField
                    fullWidth margin="dense" autoComplete="off"
                    label="Email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                    InputProps={{
                        style: {
                          backgroundColor: 'white'
                        },
                        notchedOutline: {
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
                <TextField
                  fullWidth margin="dense" autoComplete="off"
                  label="Password"
                  type="password"
                  name="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                  InputProps={{
                    style: {
                      backgroundColor: 'white'
                    },
                    notchedOutline: {
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
            <Box>
                <Button variant="contained" type="submit" color='secondary'
                sx={{ marginTop: '60px', marginBottom: '10px' }}
                >Sign In</Button>
            </Box>
        </Box>
        </Box>
        </>
  )
}

export default StaffLogin;