import React from 'react'
import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import http from '/src/http';
import dayjs from 'dayjs';
import { Box, Grid, IconButton, Typography, Button, Link, Dialog, Alert, Snackbar, Divider, TextField, Select, MenuItem, FormControl, Switch } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useFormik } from 'formik';
import * as yup from 'yup';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { DataGrid } from '@mui/x-data-grid';
import AccountContext from '../../../contexts/AccountContext';
import '../../../style/staffaccounts.css';

import ExclamationMarkIcon from '../../../assets/icons/exclamation-mark.png';

function StaffAccounts() {
    const { account } = useContext(AccountContext);
    const loggedInAdminId = account ? account.id : null;

    const navigate = useNavigate();
    const [staffAccounts, setStaffAccounts] = useState([]);

    const [editPopup, setEditPopup] = useState(false);
    const [staffIdtoEdit, setStaffIdtoEdit] = useState('');
    const [editFormData, setEditFormData] = useState({
        name: '',
        email: '',
        phone_no: '',
        birthdate: '',
        role: '',
    });
    const [editConfirmation, setEditConfirmation] = useState(false);

    const [deletePopup, setDeletePopup] = useState(false);
    const [staffIdtoDelete, setStaffIdtoDelete] = useState('');
    const [deleteConfirmation, setDeleteConfirmation] = useState(false);

    const [statusChangePopup, setStatusChangePopup] = useState(false);
    const [statusChangeDetails, setStatusChangeDetails] = useState({ staffId: null, status: '' });
    const [statusChangeConfirmation, setStatusChangeConfirmation] = useState(false);
  

    const [search, setSearch] = useState('');

    // fetch all staff accounts
    async function fetchStaffAccounts() {
        try {
            const response = await http.get('/staff/get_staff_accounts');
            console.log("API Response:", response.data); // Log API response
            if (Array.isArray(response.data.accounts)) {
                const staffAccountID = response.data.accounts.map((staff) => {
                    return {
                        id: staff.id,
                        name: staff.name,
                        email: staff.email,
                        phone_no: staff.phone_no,
                        birthdate: staff.birthdate? dayjs(staff.birthdate).format('DD/MM/YYYY') : 'NA',
                        role: staff.role,
                        status: staff.status,
                        createdAt: staff.createdAt? dayjs(staff.createdAt).format('DD/MM/YYYY HH:mm:ss') : 'NA',
                        lastLogin: staff.last_login? dayjs(staff.last_login).format('DD/MM/YYYY HH:mm:ss') : 'NA',
                        updatedAt: staff.updatedAt? dayjs(staff.updatedAt).format('DD/MM/YYYY HH:mm:ss') : 'NA',
                    };
                });
                console.log("Setting Staff Accounts:", staffAccountID);
                setStaffAccounts(staffAccountID);
            }
            console.log(response.data);
        } catch (error) {
            console.error(error);
        }
    }

    // search staff accounts
    const searchStaffAccounts = async () => {
        try {
            const query = event.target.value.trim();
            setSearch(query);

            // check if there are no results
            const filteredStaffAccounts = staffAccounts.filter((staff) => {
                return staff.name.toLowerCase().includes(query.toLowerCase()) ||
                    staff.email.toLowerCase().includes(query.toLowerCase()) ||
                    staff.phone_no.includes(query) ||
                    staff.birthdate.includes(query) ||
                    staff.status.toLowerCase().includes(query.toLowerCase()) ||
                    staff.role.toLowerCase().includes(query.toLowerCase())

            });

            if (query === '') {
                fetchStaffAccounts();
            }
            else if (filteredStaffAccounts.length === 0) {
                setStaffAccounts([]);
            }
            else {
                setStaffAccounts(filteredStaffAccounts);
            }
        }
        catch (error) {
            console.error(error);
        }
    }
    // clear search
    const clearSearch = () => {
        setSearch('');
        fetchStaffAccounts();
    }

    // open edit popup
    const openEditPopup = async (staffId) => {
        try {
            // fetch user account details
            const response = await http.get(`/staff/get_staff_account/${staffId}`);
            setEditFormData({
                id: response.data.account.id,
                name: response.data.account.name,
                email: response.data.account.email,
                phone_no: response.data.account.phone_no,
                birthdate: response.data.account.birthdate? dayjs(response.data.account.birthdate) : '',
                role: response.data.account.role,
            })
            setStaffIdtoEdit(staffId);
            setEditPopup(true);
        } catch (error) {
            console.error(error);
        }
    }
    const closeEditPopup = () => {
        setEditPopup(false);
        setEditFormData({
            id: '',
            name: '',
            email: '',
            phone_no: '',
            birthdate: '',
            role: '',
        });
        setStaffIdtoEdit(null);
    }
    // edit staff account
    const handleEditStaffAccount = useFormik({
        initialValues: editFormData,
        enableReinitialize: true, // Reinitialize form values when initialValues change
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
            role: yup.string().required('Role is required'),
        }),
        onSubmit: async (values) => {
            if (!staffIdtoEdit) {
                console.error("Staff ID not found!");
                return;
            }
            http.put(`/staff/update_staff_account/${staffIdtoEdit}`, values)
            .then((response) => {
                console.log("API Response:", response.data); // Log API response
                setEditPopup(false);
                setStaffIdtoEdit(null);
                setEditFormData({
                    id: '',
                    name: '',
                    email: '',
                    phone_no: '',
                    birthdate: '',
                    role: '',
                });
                fetchStaffAccounts();
                setEditConfirmation(true);
            })
            .catch((error) => {
                if (error.response) {
                    const errorMessage = error.response.data.message;
                    if (errorMessage === "Email already exists.") {
                        handleEditStaffAccount.setFieldError('email', errorMessage);
                    }
                    else if (errorMessage === "Phone number already exists.") {
                        handleEditStaffAccount.setFieldError('phone_no', errorMessage);
                    }
                    else {
                        handleEditStaffAccount.setFieldError('phone_no', errorMessage);
                    }
                }
                else {
                    handleEditStaffAccount.setFieldError('phone_no', "An error occurred. Please try again later.");
                }   
            });
        }
    });

    const openDeletePopup = (staffId) => {
        setDeletePopup(true);
        setStaffIdtoDelete(staffId);
        // check if the staff account to delete is the logged-in admin account
        if (staffId === loggedInAdminId) {
            console.log("Cannot delete your own account!");
            setDeletePopup(false);
            return;
        }
    }
    const closeDeletePopup = () => {
        setDeletePopup(false);
        setStaffIdtoDelete(null);
    }
    // delete staff account
    const handleDeleteStaffAccount = async () => {
        try {
            const response = await http.delete(`/staff/delete_staff_account/${staffIdtoDelete}`);
            console.log("API Response:", response.data); // Log API response
            // Update the staff accounts list to remove deleted account
            const updatedStaffAccounts = staffAccounts.filter((staff) => staff.id !== staffIdtoDelete);
            setStaffAccounts(updatedStaffAccounts);
            closeDeletePopup();
            setDeleteConfirmation(true);
        } catch (error) {
            console.error(error);
        }
    }

    // handle status change
    const handleStatusChange = async (staffId, status) => {
        try {
            // check if account is activated or deactivated
            if (staffId === loggedInAdminId) {
                console.log("Cannot deactivate your own account!");
                return;
            }

            if (status === 'Activated') {
                const response = await http.put(`/staff/deactivate_staff_account/${staffId}`);
                console.log("API Response:", response.data); // Log API response

            }
            else if (status === 'Deactivated') {
                const response = await http.put(`/staff/activate_staff_account/${staffId}`);
                console.log("API Response:", response.data); // Log API response
            }
            // Update the staff accounts list to reflect the status change
            const updatedStaffAccounts = staffAccounts.map((staff) => {
                if (staff.id === staffId) {
                    staff.status = status === 'Activated' ? 'Deactivated' : 'Activated';
                }
                return staff;
            });
            setStaffAccounts(updatedStaffAccounts);
            setStatusChangePopup(false);
            setStatusChangeConfirmation(true);
        } catch (error) {
            console.error(error);
        }
    }

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'name', headerName: 'Name', width: 150 },
        { field: 'email', headerName: 'Email', width: 250 },
        { field: 'phone_no', headerName: 'Phone No', width: 110 },
        { field: 'birthdate', headerName: 'Birthdate', width: 150 },
        { field: 'role', headerName: 'Role', width: 160 },
        { field: 'createdAt', headerName: 'Created At', width: 190 },
        { field: 'lastLogin', headerName: 'Last Login', width: 190 },
        { field: 'updatedAt', headerName: 'Updated At', width: 190 },
        { field: 'status', headerName: 'Status', width: 160, renderCell: (params) => (
            // Do not allow staff to deactivate their own account
            <>
                <Switch disabled={params.row.id === loggedInAdminId}
                checked={params.row.status === 'Activated'}
                onChange={() => {
                    setStatusChangeDetails({ staffId: params.row.id, status: params.row.status });
                    setStatusChangePopup(true);
                }}
                />
                <Typography variant="body2" 
                    color={params.row.status === 'Activated' ? 'green' : 'text.secondary'}
                    component="span">
                    {params.row.status}
                </Typography>
            </>
        )},

        { field: 'edit', headerName: 'Edit', width: 70, renderCell: (params) => (
            <IconButton sx={{ color: 'blue' }} onClick={() => openEditPopup(params.row.id)}><EditIcon /></IconButton>
        )},
        { field: 'delete', headerName: 'Delete', width: 70, renderCell: (params) => (
            // do not allow user to delete their own account
            <IconButton sx={{ color: 'red' }} onClick={() => openDeletePopup(params.row.id)}
            disabled={params.row.id === loggedInAdminId} // Disable button if the row ID matches the logged-in admin ID
            ><DeleteIcon /></IconButton>
        )},
    ];

    const handleAddStaffRedirect = () => {
        navigate('/staff/addstaff');
    }


    useEffect(() => {
        fetchStaffAccounts();
    }, []);

    return (
        <Box className='staff-account-profile-box'>
                <div style={{ maxWidth: '1400px', margin: '10px' }}>
                    <Typography variant="h4" sx={{ textAlign: 'left', marginBottom: 2, fontWeight: 'bold' }}>Staff Accounts</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <Box  sx={{ display: 'flex', justifyContent: 'left' }}>
                        <TextField id="search" variant="outlined" 
                            size="small"
                            placeholder="Search..."
                            value={search}
                            onChange={searchStaffAccounts} 
                            sx={{
                                width: 300, textAlign: 'left',
                                '& .MuiOutlinedInput-root': {
                                  '& fieldset': {
                                    borderColor: 'green', // Default border color
                                  },
                                  '&:hover fieldset': {
                                    borderColor: 'darkgreen', // Border color on hover
                                  },
                                  '&.Mui-focused fieldset': {
                                    borderColor: 'green', // Border color when focused
                                  },
                                },
                                '& .MuiOutlinedInput-input::placeholder': {
                                  color: 'black', // Placeholder text color
                                  opacity: 1, // Placeholder text opacity
                                },
                            }}
                            className='searchbar'
                        />
                        <Button variant="contained" onClick={clearSearch}
                            sx={{ marginLeft: 2, paddingLeft: 4, paddingRight: 4 }}
                            style={{ backgroundColor: 'red' }}>
                            Clear
                        </Button>
                    </Box>    
                        <Button variant='contained' color='primary' onClick={handleAddStaffRedirect}
                        sx={{ paddingLeft: 3, paddingRight: 3 }}>
                            Add Staff
                        </Button>
                    </Box>

                    <DataGrid rows={staffAccounts} columns={columns} pageSize={5} 
                    sx={{ display: 'flex', minHeight: 400, width: '100%', margin: 'auto', textAlign: 'left',
                        // remove the border around a selected data grid cell using :focus and :focus-within
                        '& .MuiDataGrid-cell:focus': { outline: 'none' },
                        '& .MuiDataGrid-cell:focus-within': { outline: 'none' }
                    }}
                    />
                </div>

            {/* Status Change Confirmation popup */}
            {statusChangePopup && (
                <Dialog open={statusChangePopup} onClose={() => setStatusChangePopup(false)}
                maxWidth="sm" // Set the desired maxWidth
                PaperProps={{
                sx: { borderRadius: '20px', boxShadow: 5, textAlign: 'center' }
                }}>
                <Box sx={{ width: 300, p: 3 }}>
                    <img src={ExclamationMarkIcon} alt='Exclamation Mark' width={'70px'} height={'70px'} className='icon'
                    style={{ display: 'flex', margin: 'auto' }} />
                    <p>Are you sure you want to {staffAccounts.find((staff) => staff.id === statusChangeDetails.staffId).status === 'Activated' ? 'deactivate' : 'activate'} ID #{statusChangeDetails.staffId}?</p>
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                    <Button variant="contained" className='deletebutton' onClick={() => handleStatusChange(statusChangeDetails.staffId, statusChangeDetails.status)}
                        sx={{ paddingLeft: 3, paddingRight: 3 }}>
                        Yes
                    </Button>
                    <Button variant="contained" className='cancelbutton' onClick={() => setStatusChangePopup(false)}>
                        Cancel
                    </Button>
                    </div>
                </Box>
                </Dialog>
            )}

            {/* Status Change Confirmation Alert */}
            <Snackbar
                open={statusChangeConfirmation}
                autoHideDuration={6000}
                onClose={() => setStatusChangeConfirmation(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Alert onClose={() => setStatusChangeConfirmation(false)} severity="success" sx={{ width: '100%' }}>
                    Staff account status changed successfully!
                </Alert>
            </Snackbar>

            {/* Edit Staff Account popup */}
            {editPopup && (
                <Dialog open={editPopup} onClose={closeEditPopup} sx={{ margin: 'auto' }} 
                fullWidth 
                maxWidth="md"
                PaperProps={{
                sx: { borderRadius: '20px', boxShadow: 5, textAlign: 'center' }
                }}>
                    <Box component="form" onSubmit={handleEditStaffAccount.handleSubmit} sx={{ p: 3 }}>
                        <Box>
                        <Typography variant="h4" style={{ color: 'green', marginBottom: 0, marginTop: 30, textAlign: 'left', fontWeight: 'bold' }}>Edit {editFormData.name}'s Account</Typography>
                            <Divider sx={{ marginBottom: 5 }}/>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' , gap: 2 }}>
                            <TextField
                                id="name"
                                name="name"
                                label="Name"
                                variant="outlined"
                                value={handleEditStaffAccount.values.name}
                                onChange={handleEditStaffAccount.handleChange}
                                error={handleEditStaffAccount.touched.name && Boolean(handleEditStaffAccount.errors.name)}
                                helperText={handleEditStaffAccount.touched.name && handleEditStaffAccount.errors.name}
                            />
                            <TextField
                                id="email"
                                name="email"
                                label="Email"
                                variant="outlined"
                                value={handleEditStaffAccount.values.email}
                                onChange={handleEditStaffAccount.handleChange}
                                error={handleEditStaffAccount.touched.email && Boolean(handleEditStaffAccount.errors.email)}
                                helperText={handleEditStaffAccount.touched.email && handleEditStaffAccount.errors.email}
                            />
                            <TextField
                                id="phone_no"
                                name="phone_no"
                                label="Phone No."
                                variant="outlined"
                                value={handleEditStaffAccount.values.phone_no}
                                onChange={handleEditStaffAccount.handleChange}
                                error={handleEditStaffAccount.touched.phone_no && Boolean(handleEditStaffAccount.errors.phone_no)}
                                helperText={handleEditStaffAccount.touched.phone_no && handleEditStaffAccount.errors.phone_no}
                            />
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                id="birthdate"
                                name="birthdate"
                                label="Birthdate"
                                format="LL"
                                value={editFormData.birthdate}
                                onChange={(date) => handleEditStaffAccount.setFieldValue('birthdate', date)}
                                slots={{
                                    textField: (params) => (
                                        <TextField
                                            {...params}
                                            error={Boolean(handleEditStaffAccount.errors.birthdate)}
                                            helperText={handleEditStaffAccount.errors.birthdate}
                                        />
                                    )
                                }}
                            />
                            </LocalizationProvider>
                            <FormControl variant="outlined" error={handleEditStaffAccount.touched.role && Boolean(handleEditStaffAccount.errors.role)}>
                            {/* Disable the role field if the staff account is the logged-in admin account */}
                            {/* This prevents the admin from changing their own role */}
                            <Select
                                labelId="role"
                                id="role"
                                name="role"
                                label="Role"
                                variant="outlined"
                                disabled={staffIdtoEdit === loggedInAdminId}
                                value={handleEditStaffAccount.values.role}
                                onChange={handleEditStaffAccount.handleChange}
                                error={handleEditStaffAccount.touched.role && Boolean(handleEditStaffAccount.errors.role)}
                                // helperText={handleEditStaffAccount.touched.role && handleEditStaffAccount.errors.role}
                                inputProps={{ sx: { textAlign: 'left' } }} // Ensures text is aligned to the left
                                sx={{ display: 'absolute' }}
                            >
                                {[ 'Admin', 'Event Manager', 'Rewards Manager', 'Customer Support', 'Staff' ].map((role) => (
                                    <MenuItem key={role} value={role}>{role}</MenuItem>
                                ))}
                            </Select>
                            </FormControl>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                                <Button variant="contained" color='secondary' onClick={closeEditPopup}>Cancel</Button>
                                <Button variant="contained" type='submit' >Save Changes</Button>
                            </Box>
                        </Box>
                    </Box>
                </Dialog>
            )}

            {/* Edit Success Alert */}
            <Snackbar
                open={editConfirmation}
                autoHideDuration={6000}
                onClose={() => setEditConfirmation(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Alert onClose={() => setEditConfirmation(false)} severity="success" sx={{ width: '100%' }}>
                    Staff account updated successfully!
                </Alert>
            </Snackbar>     

            {/* Delete Confirmation popup */}
            {deletePopup && (
                <Dialog open={deletePopup} onClose={closeDeletePopup}
                maxWidth="sm" // Set the desired maxWidth, 'md'
                PaperProps={{
                sx: { borderRadius: '20px', boxShadow: 5, textAlign: 'center' }
                }}>
                <Box sx={{ width: 300, p: 3 }}>
                    <img src={ExclamationMarkIcon} alt='Exclamation Mark' width={'70px'} height={'70px'} className='icon' 
                    style={{ display: 'flex', margin: 'auto' }} />
                    <p>Are you sure you want to delete ID #{staffIdtoDelete}?</p>
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                    <Button variant="contained" className='deletebutton' onClick={handleDeleteStaffAccount}
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
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Alert onClose={() => setDeleteConfirmation(false)} severity="success" sx={{ width: '100%' }}>
                Staff account deleted successfully!
                </Alert>
            </Snackbar>
        </Box>
    )
}

export default StaffAccounts;