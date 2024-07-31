import React from 'react'
import { useContext, useEffect, useState } from 'react';
import { Box, Typography, Grid, Button, TextField, Snackbar, Alert } from '@mui/material';
import AccountContext from '/src/contexts/AccountContext';
import dayjs from 'dayjs';
import '../../style/staffaccounts.css';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '/src/http';
import { useNavigate } from 'react-router-dom';

function Staff_Account_Profile() {
    const { account, setAccount } = useContext(AccountContext);
    const { navigate } = useNavigate();
    const accessToken = localStorage.getItem('accessToken');
    const [updatePasswordSuccess, setUpdatePasswordSuccess] = useState(false);

    // Fetch account data
    useEffect(() => {
      async function fetchAccountData() {
        const token = localStorage.getItem('accessToken');
        if (token) {
          try {
            const response = await http.get('/staff/get_account');
            console.log(response.data);
            setAccount(response.data.account);
          } catch (error) {
            console.error(error);
          }
        }
        else {
          console.error("Access token not found in local storage");
          navigate('staff/staff_login');
        }
      }
      fetchAccountData();
    }, []);

    console.log(account);

    const passwordFormik = useFormik({
      initialValues: {
        current_password: '',
        new_password: '',
        confirmNewPassword: ''
      },
      validationSchema: yup.object({
        current_password: yup.string().trim().required("This is a required field"),
        new_password: yup.string().trim().min(8).max(50).required("This is a required field")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$/,
        "password must have a mix of lower and uppercase letters and at least 1 number")
        // new password must be different from old password
        .test('passwords-match', 'New password cannot be the same as the old password', function(value) {
          return value !== this.parent.current_password; // Check if new password is different from old password
        }),
        confirmNewPassword: yup.string().trim().oneOf([yup.ref('new_password'), null], 'Passwords must match').required("This is a required field")
      }),
      onSubmit: (data) => {
        data.current_password = data.current_password.trim();
        data.new_password = data.new_password.trim();
        data.confirmNewPassword = data.confirmNewPassword.trim();

        const id = account.id;
        console.log(id);

        http.put(`/staff/update_password/${id}`, data)
        .then(response => {
          console.log(response.data);
          passwordFormik.resetForm(); // Clear form fields
          setUpdatePasswordSuccess(true);
        })
        .catch(error => {
          console.error(error);
          const errorMessage = error.response.data.message;
          if (errorMessage === "Password is not correct") {
            passwordFormik.setFieldError('current_password', errorMessage);
          }
          else {
            passwordFormik.setFieldError('confirmNewPassword', errorMessage);
          }
        });
      }
    });

    return (
      <>
      <Box className='staff-account-profile-box'
        sx={{ 
          display: 'flex',
          justifyContent: 'center', 
        }}
      >
        <Box
          sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '80%', maxWidth: 1000,
            margin: 5, padding: 2, border: 1, borderRadius: 2, borderColor: 'grey.500',
            backgroundColor: '#19682c', boxShadow: 5
          }}>
            <Typography variant="h3" align="center" fontWeight='bold'>
                <span style={{ color: 'white' }}>Eco</span>
                <span style={{ color: 'black' }}>Haven</span>
            </Typography>
            <Typography variant='h4' sx={{ textAlign: 'left', margin: 2, marginTop: 5, marginBottom: 0, color: 'white' }}><span style={{ fontWeight: 'bold' }} >{account.name}'s</span> Account</Typography>
            <Box sx={{ padding: 4, margin: 2, color: 'white' }}>
            <p className='account-field'>
              Name: 
              <span className='account-details'>{account.name}</span>
            </p>
            <p className='account-field'>
              Email: 
              <span className='account-details'>{account.email}</span>
            </p>
            <p className='account-field'>
              Phone Number: 
              <span className='account-details'>{account.phone_no}</span>
            </p>
            <p className='account-field'>
              Role: 
              <span className='account-details'>{account.role}</span>
            </p>
            <p className='account-field'>
              Birthdate: 
              <span className='account-details'>{ dayjs(account.birthdate).format('LL') }</span>
            </p>
            </Box>
        </Box>
      </Box>
      <Box className='staff-account-profile-box' sx={{ 
          display: 'flex',
          justifyContent: 'center', 
        }}>
      <Box
        sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '80%', maxWidth: 1000,
          margin: 5, marginTop: 2, padding: 2, border: 1, borderRadius: 2, borderColor: '#19682c',
          backgroundColor: 'white', boxShadow: 5
        }}>
        {/* Change password form */}
        <Box sx={{ padding: 4, margin: 2, color: 'white' }}>
          <Typography variant='h4' sx={{ textAlign: 'left', marginTop: 5, marginBottom: 5, color: '#19682c' }}>Change Password</Typography>
          <Box component='form' onSubmit={passwordFormik.handleSubmit}>
            <TextField
                fullWidth
                  id="current_password"
                  name="current_password"
                  label="Current Password"
                  type="password"
                  variant="outlined"
                  margin="normal"
                  value={passwordFormik.values.current_password}
                  onChange={passwordFormik.handleChange}
                  error={passwordFormik.touched.current_password && Boolean(passwordFormik.errors.current_password)}
                  helperText={passwordFormik.touched.current_password && passwordFormik.errors.current_password}
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
            <TextField
                fullWidth
                  id="new_password"
                  name="new_password"
                  label="New Password"
                  type="password"
                  variant="outlined"
                  margin="normal"
                  value={passwordFormik.values.new_password}
                  onChange={passwordFormik.handleChange}
                  error={passwordFormik.touched.new_password && Boolean(passwordFormik.errors.new_password)}
                  helperText={passwordFormik.touched.new_password && passwordFormik.errors.new_password}
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
            <TextField
                fullWidth
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  label="Confirm New Password"
                  type="password"
                  variant="outlined"
                  margin="normal"
                  value={passwordFormik.values.confirmNewPassword}
                  onChange={passwordFormik.handleChange}
                  error={passwordFormik.touched.confirmNewPassword && Boolean(passwordFormik.errors.confirmNewPassword)}
                  helperText={passwordFormik.touched.confirmNewPassword && passwordFormik.errors.confirmNewPassword}
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
            <Box sx={{ mt: 5 }}>
              <Button
                variant="contained"
                color="secondary"
                onClick={passwordFormik.resetForm}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ marginLeft: 1 }}
              >
                Update Password
              </Button>
            </Box>
          </Box>
          </Box>
        </Box>
      </Box>

      {/* Update password Success Alert */}
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        open={updatePasswordSuccess}
        autoHideDuration={6000}
        onClose={() => setUpdatePasswordSuccess(false)}
      >
        <Alert onClose={() => setUpdatePasswordSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Password updated successfully!
        </Alert>
      </Snackbar>

      </>
    )
}

export default Staff_Account_Profile;