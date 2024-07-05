import React, {useEffect, useState, useContext} from 'react';
import { Box, Typography, TextField, Button, FormControl, Checkbox, FormHelperText, FormControlLabel } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '/src/http';
import AccountContext from '/src/contexts/AccountContext';

function Register() {
  const navigate = useNavigate();
  const { setAccount } = useContext(AccountContext);

  const formik = useFormik({
    initialValues: {
      name: '',
      username: '',
      phone_no: '',
      email: '',
      password: '',
      confirm_password: '',
      termsandconditions: false
    },
    validationSchema: yup.object({
      name: yup.string().trim().min(3).max(50).required("This is a required field")
        .matches(/^[a-zA-Z ]+$/,
        "Name only allows letters and spaces"),
      username: yup.string().trim().min(3, "Username must be at least 3 characters long").max(50, "Username must be at most 50 characters long").required("This is a required field")
        .matches(/^[a-zA-Z0-9]+$/, "Username only allows letters and numbers"),
      phone_no: yup.string().trim().min(8, "Phone number must be 8 digits long").max(8, "Phone number must be 8 digits long").required("This is a required field")
        .matches(/^\d+$/, "Phone Number must only contain numbers"), // only allow numbers,
      email: yup.string().trim().email("Invalid email format").required("This is a required field"),
      password: yup.string().trim().min(8).max(50).required("This is a required field")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$/,
        "password must have a mix of lower and uppercase letters and at least 1 number"),
      confirm_password: yup.string().trim().oneOf([yup.ref('password'), null], 'Passwords must match').required("This is a required field"),
      termsandconditions: yup.boolean().oneOf([true], 'You must agree to the terms and conditions')
    }),
    onSubmit: (data) => {
      data.name = data.name.trim();
      data.username = data.username.trim();
      data.phone_no = data.phone_no.trim();
      data.email = data.email.trim();
      data.password = data.password.trim();
      data.confirm_password = data.confirm_password.trim();

      http.post('/account/register', data)
        .then((res) => {
            const accessToken = res.data.accessToken; // Get accessToken from response
            localStorage.setItem('accessToken', accessToken); // Store accessToken in localStorage
            localStorage.setItem('username', res.data.account.username); // Store username in localStorage
            setAccount(res.data.account); // Set account data in context
            navigate('/'); // Redirect to home page
        }).catch((err) => {
            const errorMessage = err.response.data.message; // Catch error response from backend API
            if (errorMessage === "Email already exists.") {
              formik.setFieldError('email', errorMessage);
            } 
            else if (errorMessage === "Username already exists.") {
              formik.setFieldError('username', errorMessage);
            } 
            else { // Other errors
              console.log(err.response.data);
              formik.setFieldError('confirm_password', errorMessage); // Catch error response from backend API
            }
          });
      }
  });

  return (
    <Box>
      <Link to="/get_started" style={{ textDecoration: 'none' }}>&lt;</Link>
      <Typography variant="h5" sx={{ my: 2, textAlign: 'left', fontWeight: 'bold' }}>
        Register  
      </Typography>
      <Box component="form" onSubmit={formik.handleSubmit}> 
        <TextField
          fullWidth margin="dense" autoComplete="off"
          label="Name"
          name="name"
          value={formik.values.name}
          onChange={formik.handleChange}
          error={formik.touched.name && Boolean(formik.errors.name)}
          helperText={formik.touched.name && formik.errors.name}
        />
        <TextField
          fullWidth margin="dense" autoComplete="off"
          label="Username"
          name="username"
          value={formik.values.username}
          onChange={formik.handleChange}
          error={formik.touched.username && Boolean(formik.errors.username)}
          helperText={formik.touched.username && formik.errors.username}
        />
        <TextField
          fullWidth margin="dense" autoComplete="off"
          label="Phone Number"
          name="phone_no"
          placeholder='98765432'
          value={formik.values.phone_no}
          onChange={formik.handleChange}
          error={formik.touched.phone_no && Boolean(formik.errors.phone_no)}
          helperText={formik.touched.phone_no && formik.errors.phone_no}
        />
        <TextField
          fullWidth margin="dense" autoComplete="off"
          label="Email"
          name="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
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
        <TextField
          fullWidth margin="dense" autoComplete="off"
          label="Confirm Password"
          type="password"
          name="confirm_password"
          value={formik.values.confirm_password}
          onChange={formik.handleChange}
          error={formik.touched.confirm_password && Boolean(formik.errors.confirm_password)}
          helperText={formik.touched.confirm_password && formik.errors.confirm_password}
        />
        <FormControl 
          fullWidth margin="dense"
          error={formik.touched.termsandconditions && Boolean(formik.errors.termsandconditions)}>
          <FormControlLabel control={
              <Checkbox name="termsandconditions"
              checked={formik.values.termsandconditions}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur} />
            } label="I agree with EcoHaven's Terms of Service & Privacy Policy" />
          <FormHelperText>{formik.touched.termsandconditions && formik.errors.termsandconditions}</FormHelperText>
        </FormControl>
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" type="submit">
            Sign Up
          </Button>
        </Box>
      </Box>
      <p>Already have an account?<Link to="/login">Login</Link></p>
    </Box>
  )
}

export default Register;