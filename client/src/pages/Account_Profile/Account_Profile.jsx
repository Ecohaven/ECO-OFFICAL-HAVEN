import React, { useEffect, useState, useContext } from 'react'
import { BrowserRouter as useLocation, useNavigate, useParams } from 'react-router-dom';
import http from '/src/http';
import { Box, Grid, TextField, Container, Button, Divider, Dialog, DialogTitle, DialogContent, DialogContentText, Typography } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useFormik } from 'formik';
import * as yup from 'yup';
import '../../style/account_profile.css';
import AccountContext from '/src/contexts/AccountContext';
import Account_Nav from './Account_Nav';

function Account_Profile() {
  const navigate = useNavigate();
  const { account, setAccount } = useContext(AccountContext);
  const [formData, setFormData] = useState({ // Update form data state
    name: '',
    username: '',
    phone_no: '',
    email: ''
  });
  let profilePic = account?.profile_pic;

  const accessToken = localStorage.getItem('accessToken');
  const username = localStorage.getItem('username');

  const [anchorEl, setAnchorEl] = useState(null); // Anchor element for popover
  const [open, setOpen] = useState(false);
  const [isEditAccount, setIsEditAccount] = useState(false); // Edit account state
  const [successAccountMessage, setSuccessAccountMessage] = useState(''); // Success message for account change
  const [isEditPassword, setIsEditPassword] = useState(false); // Edit password state
  const [successPasswordMessage, setSuccessPasswordMessage] = useState(''); // Success message for password change
  const [errorProfilePic, seterrorProfilePic] = useState(null); // Error state
  const [successProfilePic, setSuccessProfilePic] = useState(null); // Success state

  // Fetch account data
  useEffect(() => {
    async function fetchAccountData() {
      const token = localStorage.getItem('accessToken');
      const username = localStorage.getItem('username');
      if (token && username) {
        try {
          const response = await http.get(`/account/${username}`);
          setAccount(response.data.user);
          setFormData(response.data.user);
          console.log("Account data fetched:", account);
        } catch (error) {
          console.error("Error fetching account:", error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('username');
          localStorage.clear();
          navigate('/login'); // Navigate to login if there's an error fetching the account
        }
      } else {
        navigate('/login');
      }
    }
    fetchAccountData();
  }, [accessToken, username, navigate, setAccount]);

  const editAccount = () => { // enable edit account form
    setSuccessAccountMessage(''); // Clear success message
    setSuccessPasswordMessage('');
    seterrorProfilePic('');
    setSuccessProfilePic('');
    formik.setValues({ // Set form values to account values
      username: account.username,
      name: account.name,
      email: account.email,
      phone_no: account.phone_no
    });
    setIsEditAccount(true); // Toggle edit account state
  };
  const cancelChanges = () => { // disable edit account form
    setSuccessAccountMessage(''); // Clear success message
    setSuccessPasswordMessage('');
    seterrorProfilePic('');
    setSuccessProfilePic('');
    formik.setValues({ // Set form values to account values
      username: account.username,
      name: account.name,
      email: account.email,
      phone_no: account.phone_no
    });
    setIsEditAccount(false); // Toggle edit account state
  };
  const formik = useFormik({ // form for account
    initialValues: formData,
    enableReinitialize: true, // Reinitialize form values when initialValues change
    validationSchema: yup.object({
      name: yup.string().trim().min(3).max(50).required("This is a required field")
        .matches(/^[a-zA-Z ]+$/,
        "Name only allows letters and spaces"),
      username: yup.string().trim().min(3, "Username must be at least 3 characters long").max(50, "Username must be at most 50 characters long").required("This is a required field")
        .matches(/^[a-zA-Z0-9]+$/, "Username only allows letters and numbers"),
      phone_no: yup.string().trim().min(8, "Phone number must be 8 digits long").max(8, "Phone number must be 8 digits long").required("This is a required field")
        .matches(/^\d+$/, "Phone Number must only contain numbers"), // only allow numbers,
      email: yup.string().trim().email("Invalid email format").required("This is a required field")
    }),
    onSubmit: async (data) => {
      data.name = data.name.trim();
      data.username = data.username.trim();
      data.phone_no = data.phone_no.trim();
      data.email = data.email.trim();

      try {
        console.log(data.username);
        const res = await http.put(`/account/${username}`, data);
        if (res.data.message === 'Account updated successfully') {
          const updatedAccount = { ...account, ...data };
          setAccount(updatedAccount);
          setFormData(updatedAccount);
          localStorage.setItem('username', data.username);
          setSuccessAccountMessage('Account updated successfully!');
          setIsEditAccount(false); // Toggle edit account state
        }
      }
      catch (err) {
        if (err.response) {
          const errorMessage = err.response.data.message;
          if (errorMessage === "Email already exists.") {
            formik.setFieldError('email', errorMessage);
          }
          else if (errorMessage === "Username already exists.") {
            formik.setFieldError('username', errorMessage);
          }
          else if (errorMessage === "Your account has been deactivated. Please contact the administrator for support.") {
            formik.setFieldError('email', errorMessage);
            // Redirect to login page after a short delay
            setTimeout(() => {
              localStorage.removeItem('accessToken');
              localStorage.clear();
              navigate('/login');
            }, 2000);
          }
          else {
            console.log(err.response.data);
            formik.setFieldError('email', errorMessage);
          }
        }
        else {
          console.log(err);
          formik.setFieldError('email', 'Server did not respond');
        }
      }
    }
  });

  const showPasswordForm = () => { // Open password form
    setSuccessAccountMessage(''); // Clear success message
    setSuccessPasswordMessage(''); 
    seterrorProfilePic('');
    setSuccessProfilePic('');
    setIsEditPassword(true); // Toggle edit password state
  };
  const passwordFormik = useFormik({ // form for updating password
    initialValues: {
      current_password: '',
      new_password: '',
      confirm_new_password: ''
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
      confirm_new_password: yup.string().trim().oneOf([yup.ref('new_password'), null], 'Passwords must match').required("This is a required field")
    }),
    onSubmit: (data) => {
      data.current_password = data.current_password.trim();
      data.new_password = data.new_password.trim();
      data.confirm_new_password = data.confirm_new_password.trim();

      http.put(`/account/${username}/password`, data)
        .then((res) => {
          console.log(res.data);
          passwordFormik.resetForm(); // Reset form
          setIsEditPassword(false); // Toggle edit password state
          setSuccessPasswordMessage('Password updated successfully!'); // confirmation message
        }).catch((err) => {
          const errorMessage = err.response.data.message;
          if (errorMessage === "Password is not correct") {
            passwordFormik.setFieldError('current_password', errorMessage);
          }
          else if (errorMessage === "New password cannot be the same as the old password") {
            passwordFormik.setFieldError('new_password', errorMessage);
          }
          else if (errorMessage === "Your account has been deactivated. Please contact the administrator for support.") {
            passwordFormik.setFieldError('confirm_new_password', errorMessage);
            // Redirect to login page after a short delay
            setTimeout(() => {
              localStorage.removeItem('accessToken');
              localStorage.clear();
              navigate('/login');
            }, 2000);
          }
          else {
            console.log(errorMessage);
          }
        });
    }
  });

  const handleOpen = (event) => { // Open popup
    setSuccessAccountMessage(''); // Clear success message
    setSuccessPasswordMessage(''); 
    seterrorProfilePic('');
    setSuccessProfilePic('');
    setAnchorEl(event.currentTarget); // Set anchor element to current target element of event object 
    setOpen(true); // Open popup
  };
  const handleClose = () => { // Close popup
    setSuccessAccountMessage(''); // Clear success message
    setSuccessPasswordMessage('');
    seterrorProfilePic('');
    setSuccessProfilePic('');
    setAnchorEl(null); // Set anchor element to null to close popup
    setOpen(false); // Close popup
  };
  const handleDeleteAccount = useFormik({ // form for delete account
    initialValues: {
      password: ''
    },
    validationSchema: yup.object({
      password: yup.string().trim().required("This is a required field")
    }),
    onSubmit: (data) => {
      http.delete(`/account/${username}`, { data: data }) // Send data to server
      .then(() => {
        setAccount(null); // Update account state in context
        localStorage.clear(); // Clear local storage
        navigate('/account_deleted', { replace: true }); // Redirect
      })
      .catch((err) => {
        if (err.response) {
          // Server responded with an error
          const errorMessage = err.response.data.message; // Catch error response from backend API
          if (errorMessage === 'Your account has been deactivated. Please contact the administrator for support.') {
            handleDeleteAccount.setFieldError('password', errorMessage);
            // Redirect to login page after a short delay
            setTimeout(() => {
              localStorage.removeItem('accessToken');
              localStorage.clear();
              navigate('/login');
            }, 2000); 
          }
          else if (err.response.status === 400) { // Error
            handleDeleteAccount.setFieldError('password', errorMessage);
          }
          else { // Other errors
            console.log(err.response.data);
            handleDeleteAccount.setFieldError('password','Unknown error');
          }
        } 
        else {
          // Server did not respond
          console.log('No response from server');
          handleDeleteAccount.setFieldError('password', 'Server did not respond');
          }
      })
    }
  });

  const updateProfile = (event) => { // update profile pic
    let file = event.target.files[0]; // Get file
    if (file) { 
      let formData = new FormData(); // Create form data
      formData.append('file', file); // Append file to form data
      http.post('/file/upload_profile_pic', formData, { // Send form data to server
        headers: {
          'Content-Type': 'multipart/form-data', // Set content type
        }
      })
      .then((response) => {
        // Update profile picture
        setSuccessAccountMessage('');
        setSuccessPasswordMessage('');
        seterrorProfilePic(null); // Clear error
        setSuccessProfilePic('Profile picture uploaded successfully');

        // Reload the page after a short delay to display the success message
        setTimeout(() => {
          window.location.reload();
        }, 500);
      })
      .catch((err) => {
        setSuccessAccountMessage('');
        setSuccessPasswordMessage('');
        if (err.response && err.response.status === 400) {
          if (err.response.data.message === 'No file uploaded') {
            seterrorProfilePic(err.response.data.message);
          }
          else if (err.response.data.message === 'File too large') {
            seterrorProfilePic('File size must be 1MB or less');
          }
        }
        else {
          seterrorProfilePic('An unknown error occurred');
        }
        console.log(err);
      });
    }
  };
  const deleteProfile = () => { // delete profile pic
      http.delete('/file/delete_profile_pic') // Send request to server to delete profile picture
      .then(() => {
        // check if profile pic is null
        if (profilePic === null) {
          seterrorProfilePic('Profile picture does not exist');
          return;
        }
        // Update profile picture display
        setSuccessAccountMessage('');
        setSuccessPasswordMessage('');
        seterrorProfilePic('');
        setSuccessProfilePic('Profile picture deleted successfully');
        setTimeout(() => {
          window.location.reload();
        }, 500);
      })
      .catch((err) => {
        seterrorProfilePic('An unknown error occurred');
        console.log(err);
      });
  }

  return (
    // container is on the left side of the page
    <Container>
      <Grid container spacing={2}> 
        <Grid item xs={12} md={3}>
          <Account_Nav />
        </Grid>
        <Grid item xs={12} md={9} sx={{ marginTop: '30px', marginBottom: '50px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={7} sx={{ order: { xs: 2, md: 1 } }}>
              <Typography variant="h5" sx={{ my: 0, textAlign: 'left' }}>
                Account
              </Typography>
                <Divider />
                  <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 6, mb: '3rem' }}>
                    <TextField
                    fullWidth margin="dense" autoComplete="off"
                    label="Name"
                    name="name"
                    value={formik.values.name}
                    disabled={!isEditAccount}
                    onChange={formik.handleChange}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                    />
                    <TextField
                    fullWidth margin="dense" autoComplete="off"
                    label="Username"
                    name="username"
                    value={formik.values.username}
                    disabled={!isEditAccount}
                    onChange={formik.handleChange}
                    error={formik.touched.username && Boolean(formik.errors.username)}
                    helperText={formik.touched.username && formik.errors.username}
                    />
                    <TextField
                    fullWidth margin="dense" autoComplete="off"
                    label="Phone Number"
                    name="phone_no"
                    value={formik.values.phone_no}
                    disabled={!isEditAccount}
                    onChange={formik.handleChange}
                    error={formik.touched.phone_no && Boolean(formik.errors.phone_no)}
                    helperText={formik.touched.phone_no && formik.errors.phone_no}
                    />
                    <TextField
                    fullWidth margin="dense" autoComplete="off"
                    label="Email"
                    name="email"
                    value={formik.values.email}
                    disabled={!isEditAccount}
                    onChange={formik.handleChange}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                    />
                    {!isEditAccount && (
                      <Button id='edit_account_button' variant='contained' onClick={editAccount}
                      sx={{ my: 3 }}>
                        Edit Profile Info
                      </Button>
                    )}
                    {isEditAccount && (
                      <div>
                        <Button id='cancel_changes_button' variant='contained' color='secondary' onClick={cancelChanges}
                        sx={{ my: 3, margin:'5px' }}>
                          Cancel Changes
                        </Button>
                        <Button id='update_profile_button' variant='contained' onClick={formik.handleSubmit}
                        sx={{ my: 3 }}>
                          Update Profile
                        </Button>
                      </div>
                    )}
                    {successAccountMessage && (
                        <div style={{ color: 'green' }}>
                          <Typography variant="body1" gutterBottom>
                          {successAccountMessage}
                          </Typography>
                        </div>
                    )}
                  </Box>
                <div>
                  <Typography variant="h5" sx={{ my: 0, textAlign: 'left' }}>
                    Change Password
                  </Typography>
                  <Divider />
                  {!isEditPassword && (
                    <Box>
                    <Button id='show_password_form_button' variant='contained' onClick={showPasswordForm} 
                    sx={{ my: 3, mb: '4rem'}}>
                      Change Password
                    </Button>
                    </Box>
                  )}
                  {isEditPassword && (
                    <Box component="form" onSubmit={passwordFormik.handleSubmit} sx={{ mt: 6, mb: '3rem' }}>
                      <TextField
                        fullWidth margin="dense" autoComplete="off"
                        label="Current Password"
                        type="password"
                        name="current_password"
                        value={passwordFormik.values.current_password}
                        onChange={passwordFormik.handleChange}
                        error={passwordFormik.touched.current_password && Boolean(passwordFormik.errors.current_password)}
                        helperText={passwordFormik.touched.current_password && passwordFormik.errors.current_password}
                      />
                      <TextField
                        fullWidth margin="dense" autoComplete="off"
                        label="New Password"
                        type="password"
                        name="new_password"
                        value={passwordFormik.values.new_password}
                        onChange={passwordFormik.handleChange}
                        error={passwordFormik.touched.new_password && Boolean(passwordFormik.errors.new_password)}
                        helperText={passwordFormik.touched.new_password && passwordFormik.errors.new_password}
                      />
                      <TextField
                        fullWidth margin="dense" autoComplete="off"
                        label="Confirm New Password"
                        type="password"
                        name="confirm_new_password"
                        value={passwordFormik.values.confirm_new_password}
                        onChange={passwordFormik.handleChange}
                        error={passwordFormik.touched.confirm_new_password && Boolean(passwordFormik.errors.confirm_new_password)}
                        helperText={passwordFormik.touched.confirm_new_password && passwordFormik.errors.confirm_new_password}
                      />
                      <Box sx={{ mt: 2 }}>
                        <Button id='cancel_password_button' variant='contained' color='secondary' onClick={() => setIsEditPassword(false)}
                          sx={{ my: 2, margin:'5px' }}>
                          Cancel
                        </Button>
                        <Button variant="contained" type="submit"
                        sx={{ my: 2 }}>
                          Update Password
                        </Button>
                      </Box>
                    </Box>
                  )}
                  {successPasswordMessage && (
                    <div style={{ color: 'green' }}>
                      <Typography variant="body1" gutterBottom>
                      {successPasswordMessage}
                      </Typography>
                    </div>
                  )}
              </div>
              <div>
                <Typography variant="h5" sx={{ my: 0, textAlign: 'left' }}>
                  Delete Your Account
                </Typography>
                <Divider sx={{ my: 0 }}/>
                <Typography variant='body1' sx={{ my: 3 }} id='delete_account_text'>
                  Once you delete your account, all of your data will be lost. Please be certain. 
                </Typography>
                <Button variant="contained" color="error" onClick={handleOpen}
                sx={{ my: 2, mb: '3rem' }}>
                  Delete Account
                </Button>

                <Dialog open={open} onClose={handleClose} >
                  <DialogTitle>Account Deletion</DialogTitle>
                  <DialogContent>
                    <DialogContentText>Please enter your password to delete your account.</DialogContentText>
                  </DialogContent>
                  <div style={{ margin: '10px' }}>
                    <TextField 
                      fullWidth margin="dense" autoComplete="off"
                      label="Password"
                      type="password"
                      name="password"
                      value={handleDeleteAccount.values.password}
                      onChange={handleDeleteAccount.handleChange}
                      error={handleDeleteAccount.touched.password && Boolean(handleDeleteAccount.errors.password)}
                      helperText={handleDeleteAccount.touched.password && handleDeleteAccount.errors.password}
                    />
                    <div style={{ display: 'flex', margin: '10px'}}>
                      <Button id='cancel_button' variant='contained' color='secondary' onClick={handleClose}
                      sx={{ margin:'5px' }}>
                        Cancel
                      </Button>
                      <Button id='delete_account_button' variant='contained' color="error" onClick={handleDeleteAccount.handleSubmit}
                      sx={{ margin:'5px' }}>
                        Delete my Account
                      </Button>
                    </div>  
                  </div>
                </Dialog>
              </div>
            </Grid>
            <Grid item xs={12} md={5} sx={{ order: { xs: 1, md: 2 } }}>
              {profilePic && (
                <Box className="aspect-ratio-container" sx={{ mt: 2 }}>
                  <img alt="profile-pic" className="aspect-ratio-item"
                    src={`${import.meta.env.VITE_FILE_BASE_URL}${profilePic}`}>
                  </img>
                </Box>
              )}
              {!profilePic && (
                <AccountCircleIcon sx={{ 
                  fontSize: 235,
                  opacity: 0.5
                }}/>
              )}
              <Typography variant='h4' style={{ fontWeight: 'bold' }}>{username}</Typography>
              <Button id='upload_profile_pic_button' variant='contained' component="label" sx={{ marginRight:'5px', fontSize: 'small' }}>
                Edit Photo
                <input hidden accept="image/*" multiple type="file" onChange={updateProfile} name="file"/>
              </Button>
              <Button id='delete_profile_pic_button' variant='contained' color="error" onClick={deleteProfile} sx={{ fontSize: 'small' }}>
                Delete Photo
              </Button>
              {errorProfilePic && (
                <Typography variant="body2" color="error" gutterBottom>
                  {errorProfilePic}
                </Typography>
              )}
              {successProfilePic && (
                <div style={{ color: 'green' }}>
                  {successProfilePic}
                </div>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  )
}

export default Account_Profile;