import React, { useEffect, useState } from 'react'
import http from '/src/http';
import dayjs from 'dayjs';
import { Box, Typography, Button, Grid, IconButton, TextField, Dialog, Alert, Snackbar, Divider } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { DataGrid } from '@mui/x-data-grid';

import ExclamationMarkIcon from '../../../assets/icons/exclamation-mark.png';

const dateformat = {
  date: 'DD/MM/YYYY HH:mm:ss',
}

function UserAccounts() {
  const [userAccounts, setUserAccounts] = useState([]);

  const [editPopup, setEditPopup] = useState(false);
  const [userIdToEdit, setUserIdToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({
    username: '',
    name: '',
    email: '',
    phone_no: '',
  });
  const [editConfirmation, setEditConfirmation] = useState(false);

  const [deletePopup, setDeletePopup] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);

  // for search bar
  const [search, setSearch] = useState(''); // search keyword
  

  async function fetchUserAccounts() {
    try {
      const response = await http.get('/staff/get_user_accounts');
      console.log(response.data);
      if (Array.isArray(response.data.accounts)) {
        const userAccountID = response.data.accounts.map((user) => {
          return {
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
            phone_no: user.phone_no,
            createdAt: user.createdAt ? dayjs(user.createdAt).format(dateformat.date) : 'NA',
            last_login: user.last_login ? dayjs(user.last_login).format(dateformat.date) : 'NA',
            updatedAt: user.updatedAt ? dayjs(user.updatedAt).format(dateformat.date) : 'NA',
          };
        });
        console.log("Setting User Accounts:", userAccountID);
        setUserAccounts(userAccountID);
        setEditPopup(false);
        setDeletePopup(false);
        setDeleteConfirmation(false);
        setUserIdToDelete(null);
        setUserIdToEdit(null);
      }
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  const searchUserAccounts = async () => {
    try {
      const query = event.target.value.trim();
      setSearch(query);

      // check if there are no results
      const filtered = userAccounts.filter((user) => {
        return user.username.toLowerCase().includes(query.toLowerCase()) ||
          user.name.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase()) ||
          user.phone_no.toLowerCase().includes(query.toLowerCase());
      });

      // if search query is empty, display all user accounts
      if (query === '') {
        fetchUserAccounts();
      }
      else if (filtered.length === 0) {
        // display no results found in the table
        setUserAccounts([]);
      }
      else {
        setUserAccounts(filtered);
      }
    } catch (error) {
      console.error(error);
    }
  }

  const clearSearch = () => {
    setSearch('');
    fetchUserAccounts();
  }

  const openEditPopup = async (id) => {
    try {
      // fetch user account details
      const response = await http.get(`/staff/get_user_account/${id}`);
      setEditFormData({
        username: response.data.account.username,
        name: response.data.account.name,
        email: response.data.account.email,
        phone_no: response.data.account.phone_no
      });
      setUserIdToEdit(id);
      setEditPopup(true);
    } catch (error) {
      console.error(error);
    }
  }
  const closeEditPopup = () => {
    setEditPopup(false);
    setEditFormData({
      username: '',
      name: '',
      email: '',
      phone_no: ''
    });
    setUserIdToEdit(null);
  }
  // edit user account
  const handleEdit = useFormik({
    // get account data from userIdToEdit
    initialValues: editFormData,
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
    onSubmit: (data) => {
      if (!userIdToEdit) return; // Ensure there's a user ID to edit
      http.put(`/staff/update_user_account/${userIdToEdit}`, data)
        .then((response) => {
          console.log(response.data);
          setEditPopup(false);
          setUserIdToEdit(null);
          setEditFormData({
            username: '',
            name: '',
            email: '',
            phone_no: ''
          });
          fetchUserAccounts();
          setEditConfirmation(true);
        })
        .catch((err) => {
        if (err.response) {
          const errorMessage = err.response.data.message; // Catch error response from backend API
          console.error(errorMessage);
          if (errorMessage === "Email already exists.") {
            handleEdit.setFieldError('email', errorMessage);
          }
          else if (errorMessage === "Username already exists.") {
            handleEdit.setFieldError('username', errorMessage);
          }
          else {
            handleEdit.setFieldError('phone_no', errorMessage);
          }
        }
        else {
          handleEdit.setFieldError('phone_no', 'An error occurred. Please try again later.');
        }
      });
    }
  });

  const openDeletePopup = (id) => {
    setUserIdToDelete(id);
    setDeletePopup(true);
  }
  const closeDeletePopup = () => {
    setDeletePopup(false);
    setUserIdToDelete(null);
  }
  // delete user account
  const handleDelete = async () => {
    if (!userIdToDelete) return; // Ensure there's a user ID to delete
    try {
      const response = await http.delete(`/staff/delete_user_account/${userIdToDelete}`);
      console.log(response.data);
      // Update state to remove the deleted account
      setUserAccounts(userAccounts.filter((user) => user.id !== userIdToDelete));
      closeDeletePopup();
      setDeleteConfirmation(true);
    } catch (error) {
      console.error(error);
    }
  }

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'username', headerName: 'Username', width: 150 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'phone_no', headerName: 'Phone No', width: 110 },
    { field: 'createdAt', headerName: 'Registration Date', width: 190 },
    { field: 'last_login', headerName: 'Last Login', width: 190 },
    { field: 'updatedAt', headerName: 'Last Updated', width: 190 },
    // { field: 'status', headerName: 'Status', width: 150 },
    { field: 'edit', headerName: 'Edit', width: 70, renderCell: (params) => (
      <IconButton sx={{ color: 'blue' }} onClick={() => openEditPopup(params.row.id)}><EditIcon /></IconButton>
    )},
    { field: 'delete', headerName: 'Delete', width: 70, renderCell: (params) => (
      <IconButton sx={{ color: 'red' }} onClick={() => openDeletePopup(params.row.id)}><DeleteIcon /></IconButton>
    )},
  ];

  // fetch all user accounts
  useEffect(() => {
    fetchUserAccounts();
  }
  , []);


  return (
    <Grid container spacing={2}>
      <Grid item xxl={1} xl={2} md={3} sm={0}>
      </Grid>
      <Grid item xxl={11} xl={10} md={9} sm={12}>
      <div
      style={{ maxWidth: '1400px', margin: '10px' }}
      >
        <Typography variant="h4" sx={{ textAlign: 'left', marginBottom: 2 }}>User Accounts</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'left', marginBottom: 2 }}>
          <TextField id="search" variant="outlined"
            sx={{ width: 300, textAlign: 'left' }}
            placeholder="Search..."
            value={search}
            onChange={searchUserAccounts}
          />
          <Button variant="contained" color="secondary" onClick={clearSearch}
            sx={{ marginLeft: 2, paddingLeft: 4, paddingRight: 4 }}
            style={{ backgroundColor: 'red' }}>
              Clear
          </Button>
        </Box>

        <DataGrid rows={userAccounts} columns={columns} pageSize={5}
          sx={{ display: 'flex', minHeight: 400, width: '100%', margin: 'auto',
            // remove the border around a selected data grid cell using :focus and :focus-within
            '& .MuiDataGrid-cell:focus': { outline: 'none' },
            '& .MuiDataGrid-cell:focus-within': { outline: 'none' }
          }}
        />
      </div>
      </Grid>

      {/* Edit User Account popup Form */}
      {editPopup && (
        <Dialog open={editPopup} onClose={closeEditPopup} sx={{ margin: 'auto' }} 
        fullWidth 
        maxWidth="sm" // Set the desired maxWidth, 'md' stands for medium, you can use 'sm', 'md', 'lg', 'xl'
        PaperProps={{
          sx: { borderRadius: '20px', boxShadow: 5, textAlign: 'center' }
        }}>
          <Box component="form" onSubmit={handleEdit.handleSubmit} sx={{ p: 3 }}>
            <Box>
              <Typography variant="h4" style={{ color: 'green', marginBottom: 0, marginTop: 30, textAlign: 'left', fontWeight: 'bold' }}>Edit {editFormData.username}</Typography>
              <Divider sx={{ marginBottom: 5 }}/>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                id="username"
                name="username"
                label="Username"
                value={handleEdit.values.username}
                onChange={handleEdit.handleChange}
                error={handleEdit.touched.username && Boolean(handleEdit.errors.username)}
                helperText={handleEdit.touched.username && handleEdit.errors.username}
              />
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Name"
                value={handleEdit.values.name}
                onChange={handleEdit.handleChange}
                error={handleEdit.touched.name && Boolean(handleEdit.errors.name)}
                helperText={handleEdit.touched.name && handleEdit.errors.name}
              />
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email"
                value={handleEdit.values.email}
                onChange={handleEdit.handleChange}
                error={handleEdit.touched.email && Boolean(handleEdit.errors.email)}
                helperText={handleEdit.touched.email && handleEdit.errors.email}
              />
              <TextField
                fullWidth
                id="phone_no"
                name="phone_no"
                label="Phone No"
                value={handleEdit.values.phone_no}
                onChange={handleEdit.handleChange}
                error={handleEdit.touched.phone_no && Boolean(handleEdit.errors.phone_no)}
                helperText={handleEdit.touched.phone_no && handleEdit.errors.phone_no}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
              <Button variant="contained" color='secondary' onClick={closeEditPopup}>Cancel</Button>
              <Button variant="contained" type='submit' >Save</Button>
            </Box>
          </Box>
        </Dialog>
      )}

      {/* Edit Account Success Alert */}
      <Snackbar
        open={editConfirmation}
        autoHideDuration={6000}
        onClose={() => setEditConfirmation(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setEditConfirmation(false)} severity="success" sx={{ width: '100%' }}>
          User account updated successfully!
        </Alert>
      </Snackbar>
        

      {/* Delete Confirmation popup */}
      {deletePopup && (
        <Dialog open={deletePopup} onClose={closeDeletePopup}
        maxWidth="sm" // Set the desired maxWidth, 'md' stands for medium, you can use 'sm', 'md', 'lg', 'xl'
        PaperProps={{
          sx: { borderRadius: '20px', boxShadow: 5, textAlign: 'center' }
        }}>
          <Box sx={{ width: 300, p: 3 }}>
            <img src={ExclamationMarkIcon} alt='Exclamation Mark' width={'70px'} height={'70px'} className='icon' 
              style={{ display: 'flex', margin: 'auto' }} />
            <p>Are you sure you want to delete ID #{userIdToDelete}?</p>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
              <Button variant="contained" className='deletebutton' onClick={handleDelete} 
                sx={{ paddingLeft: 3, paddingRight: 3 }}>
                Yes
              </Button>
              <Button variant="contained" className='cancelbutton' onClick={closeDeletePopup}>
                Cancel
              </Button>
            </div>
          </Box>
        </Dialog>
      )}

      {/* Delete Success Alert */}
      <Snackbar 
        open={deleteConfirmation} 
        autoHideDuration={6000} 
        onClose={() => setDeleteConfirmation(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setDeleteConfirmation(false)} severity="success" sx={{ width: '100%' }}>
          User account deleted successfully!
        </Alert>
      </Snackbar>
    </Grid>
  )
}

export default UserAccounts;