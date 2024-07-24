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
                navigate('/staff/staffhome');
            })
            .catch((err) => {
                const errorMessage = err.response.data.message;
                formik.setFieldError('password', errorMessage);
                console.log(err.response.data);
            });
        }
    });


    return(
        <Box component="form" onSubmit={formik.handleSubmit}>
            <Box>
                <Typography variant="h4" align="center">Staff Login</Typography>
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
            </Box>
            <Box>
                <Button variant="contained" type="submit">Sign In</Button>
            </Box>
        </Box>
  )
}

export default StaffLogin;