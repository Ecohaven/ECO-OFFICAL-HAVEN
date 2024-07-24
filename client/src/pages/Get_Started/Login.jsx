import React, {useEffect, useState, useContext} from 'react';
import { Box, Grid, Typography, TextField, Button } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '/src/http';
import AccountContext from '/src/contexts/AccountContext';
import '../../style/loginandregister.css'

function Login() {
  const navigate = useNavigate();
  const { setAccount } = useContext(AccountContext);
  
  const formik = useFormik({
    initialValues: {
      usernameoremail: '',
      password: ''
    },
    validationSchema: yup.object({
      usernameoremail: yup.string().trim().required("This is a required field"), // Allow email or username
      password: yup.string().trim().required("This is a required field")
    }),
    onSubmit: (data) => {
      data.usernameoremail = data.usernameoremail.trim();
      data.password = data.password.trim();

      http.post('/account/login', data) // Send data to server
      .then(response => {
        const accessToken = response.data.accessToken; // Get accessToken from response
        localStorage.setItem('accessToken', accessToken); // Store accessToken in localStorage
        localStorage.setItem('username', response.data.account.username); // Store username in localStorage
        setAccount(response.data.account); // Set account data in context
        navigate('/'); // Redirect to home page
      }).catch((err) => {
        const errorMessage = err.response.data.message; // Catch error response from backend API
        formik.setFieldError('password', errorMessage);
        console.log(err.response.data);
      });
    }
  });


  return (
    <Box>
      <Grid container spacing={2} className='login-register-elements'>
        <Grid item md={5} xs={12} className='image-container'>
          <img src="/src/assets/images/login_bg.png" alt="eco-haven" className='eco-haven-image'/>
        </Grid>
        <Grid item md={7} xs={12} className='login-register-forms'>
          <div className='get-started'>
            <Link to="/get_started" className='get-started-link'>&lt; Back</Link>
          </div>
          <div className="login-register">
            <Typography variant="h5" sx={{ my: 2, textAlign: 'left', fontWeight: 'bold' }}>
              Login
            </Typography>
            <Box component="form" onSubmit={formik.handleSubmit}>
              <Box className="login-register-form-fields">
                <TextField
                  fullWidth margin="dense" autoComplete="off"
                  label="Username or Email"
                  name="usernameoremail"
                  value={formik.values.usernameoremail}
                  onChange={formik.handleChange}
                  error={formik.touched.usernameoremail && Boolean(formik.errors.usernameoremail)}
                  helperText={formik.touched.usernameoremail && formik.errors.usernameoremail}
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
                />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Button variant="contained" type="submit">
                  Sign In
                </Button>
              </Box>
            </Box>
            <p>Don't have an account?<Link to="/register" className='login-register-link'>Register</Link></p>
          </div>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Login;