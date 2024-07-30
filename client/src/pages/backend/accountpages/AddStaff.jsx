import React from 'react'
import { useState } from 'react';
import { Box, Button, Grid, TextField, Typography, Snackbar, Alert, Select, MenuItem, FormControl,
    Card, 
 } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import http from '/src/http';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import '../../../style/staffaccounts.css';

function AddStaff() {
    const navigate = useNavigate();
    const [addStaffSuccess, setAddStaffSuccess] = useState(false);
    
    const formik = useFormik({
        initialValues: {
            name: '',
            email: '',
            phone_no: '',
            birthdate: null,
            role: '',
            password: '',
            confirm_password: ''
        },
        validationSchema: yup.object({
            name: yup.string().trim().min(3).max(50).required("This is a required field")
                .matches(/^[a-zA-Z ]+$/,
                "Name only allows letters and spaces"),
            email: yup.string().trim().email("Invalid email format").required("This is a required field"),
            phone_no: yup.string().trim().min(8, "Phone number must be 8 digits long").max(8, "Phone number must be 8 digits long").required("This is a required field")
                .matches(/^\d+$/, "Phone Number must only contain numbers"), // only allow numbers,
            birthdate: yup.date("Invalid Birthdate").required("This is a required field")
                .max(new Date(), "Birthdate cannot be in the future") // Check if birthdate is in the future
                .test('age', 'Age must be between 18 and 100', (value) => { // Check if age is between 18 and 100
                    let birthdate = new Date(value);
                    let age = new Date().getFullYear() - birthdate.getFullYear();
                    return age >= 18 && age < 100;
                }),
            role: yup.string().required('This is a required field'),
            password: yup.string().trim().min(8).max(50).required("This is a required field")
                .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$/,
                "password must have a mix of lower and uppercase letters and at least 1 number"),
            confirm_password: yup.string().trim().oneOf([yup.ref('password'), null], 'Passwords must match').required("This is a required field"),
        }),
        onSubmit: (data) => {
            data.name = data.name.trim();
            data.email = data.email.trim();
            data.phone_no = data.phone_no.trim();
            data.role = data.role.trim();
            data.password = data.password.trim();
            data.confirm_password = data.confirm_password.trim();
            console.log(data);

            http.post('/staff/create_new_account', data)
                .then((res) => {
                    setAddStaffSuccess(true);
                    navigate('/staff/staffaccounts');
                }
            ).catch((err) => {
                const errorMessage = err.response.data.message; // Catch error response from backend API
                if (errorMessage === "Email already exists.") {
                    formik.setFieldError('email', errorMessage);
                } 
                else if (errorMessage === "Phone number already exists.") {
                    formik.setFieldError('phone_no', errorMessage);
                } 
                else { // Other errors
                    console.log(err.response.data);
                    formik.setFieldError('confirm_password', errorMessage); // Catch error response from backend API
                }
            });
        }
    });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#99ffcc', minHeight: '100vh' }}>
        <Box sx={{ flexGrow: 1, margin: 5, maxWidth: 1000, display: 'flex', flexDirection: 'column', 
            justifyContent: 'center' }}>
            <img src="../src/assets/images/staffbanner.jpg" alt="Event Banner" style={{ width: '100%', height: 'auto', borderRadius: '8px' }} />
                {/* <Typography variant="h4" sx={{ marginTop: '1.5rem' , marginBottom: '1rem' }}>Add Staff</Typography>  */}
            <span style={{ display: 'flex', alignItems: 'center', marginBottom: '1.2rem', marginTop: '1.5rem' }}>
                <Link to="/staff/staffaccounts" className="staffaccountslink">
                    Staff Accounts
                </Link>
                <p style={{ margin: '0 0 0 8px', fontWeight: 'bold' }}> / Add Staff</p>
            </span>
            
            <Card sx={{ padding: '1rem' }}>
            <Box component="form" onSubmit={formik.handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            id="name"
                            name="name"
                            label="Full Name"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            error={formik.touched.name && Boolean(formik.errors.name)}
                            helperText={formik.touched.name && formik.errors.name}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            id="email"
                            name="email"
                            label="Email"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            error={formik.touched.email && Boolean(formik.errors.email)}
                            helperText={formik.touched.email && formik.errors.email}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            id="phone_no"
                            name="phone_no"
                            label="Phone Number"
                            value={formik.values.phone_no}
                            onChange={formik.handleChange}
                            error={formik.touched.phone_no && Boolean(formik.errors.phone_no)}
                            helperText={formik.touched.phone_no && formik.errors.phone_no}
                            sx={{ mb: 2 }}
                        />
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                id="birthdate"
                                name="birthdate"
                                label="Birthdate"
                                format="LL"
                                value={formik.values.birthdate}
                                onChange={(newValue) => formik.setFieldValue('birthdate', newValue)}
                                slots={{
                                    textField: (params) => (
                                        <TextField 
                                            {...params} 
                                            error= {formik.touched.birthdate && Boolean(formik.errors.birthdate)}
                                            helperText={formik.touched.birthdate && formik.errors.birthdate}
                                        />
                                    ),
                                }}
                                sx={{ width: '100%', mb: 2 }}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth sx={{ mb: 2 }}> 
                            <Select
                                id="role"
                                name="role"
                                value={formik.values.role}
                                onChange={formik.handleChange}
                                error={formik.touched.role && Boolean(formik.errors.role)}
                                displayEmpty
                            >
                                <MenuItem value="" disabled>Select Role</MenuItem>
                                {[ 'Admin' ].map((role) => (
                                    <MenuItem key={role} value={role}>{role}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            id="password"
                            name="password"
                            label="Password"
                            type="password"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            error={formik.touched.password && Boolean(formik.errors.password)}
                            helperText={formik.touched.password && formik.errors.password}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            id="confirm_password"
                            name="confirm_password"
                            label="Confirm Password"
                            type="password"
                            value={formik.values.confirm_password}
                            onChange={formik.handleChange}
                            error={formik.touched.confirm_password && Boolean(formik.errors.confirm_password)}
                            helperText={formik.touched.confirm_password && formik.errors.confirm_password}
                            sx={{ mb: 2 }}
                        />
                    </Grid>
                </Grid>
                <Button type="submit" variant="contained" sx={{ marginTop: '3rem' }}>Add Staff</Button>
            </Box>
            </Card>

            {/* Add account Success Alert */}
            <Snackbar open={addStaffSuccess} autoHideDuration={6000} 
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            onClose={() => setAddStaffSuccess(false)}>
                <Alert onClose = {() => setAddStaffSuccess(false)} severity="success" sx={{ width: '100%' }}>
                    Staff Account added successfully!
                </Alert>
            </Snackbar>
        </Box>
    </Box>
  )
}

export default AddStaff;