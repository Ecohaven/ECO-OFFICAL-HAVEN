import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import TextField from '@mui/material/TextField';
import { Alert, AlertTitle, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import Sidebar from '../../../components/sidebar';
import EditIcon from '@mui/icons-material/Edit';
import '../../style/rewards/collectionproduct.css'; // Importing CSS file for styling

const CollectionProduct = () => {
  const [rows, setRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertOpen, setAlertOpen] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [filteredRows, setFilteredRows] = useState([]);
  const [editFormData, setEditFormData] = useState({
    id: '',
    name: '',
    email: '',
    phoneNumber: '',
    status: 'Not Collected'
  });

  useEffect(() => {
    fetchRows();
  }, []);

  useEffect(() => {
    if (alertOpen) {
      const timer = setTimeout(() => {
        handleCloseAlert();
      }, 5000); // set timeout for 5 seconds

      return () => {
        clearTimeout(timer); // clean up timer on unmount or re-render
      };
    }
  }, [alertOpen]);

  const fetchRows = async () => {
    try {
      const response = await axios.get('http://localhost:3001/collect/collections');
      if (Array.isArray(response.data)) {
        setRows(response.data);
      } else {
        console.error('Expected an array from the API response');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleResetSearch = () => {
    setSearchQuery('');
    fetchRows(); // Fetch rows again to reset the table to its original state
    setSearchError(false);
  };

  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = rows.filter(
      (row) =>
        Object.values(row).some(value =>
          value.toString().toLowerCase().includes(query)
        )
    );

    setFilteredRows(filtered);

    if (filtered.length === 0 && query.trim() !== '') {
      setSearchError(true);
    } else {
      setSearchError(false);
    }
  };

  const highlightText = (text, query) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={index} style={{ backgroundColor: 'yellow' }}>
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const getFilteredColumns = () => {
    return columns.map(column => ({
      ...column,
      renderCell: (params) => (
        <div>
          {highlightText(params.value.toString(), searchQuery)}
        </div>
      ),
      hide: !rows.some(row => highlightText(row[column.field], searchQuery) !== row[column.field])
    }));
  };

  const handleEditClick = (id) => {
    const selected = rows.find(row => row.id === id);
    if (selected) {
      setSelectedRow(selected);
      setEditFormData({
        id: selected.id,
        name: selected.name,
        email: selected.email,
        phoneNumber: selected.phoneNumber,
        status: selected.status === 'Collected' ? 'Collected' : 'Not Collected'
      });
      setEditDialogOpen(true);
    }
  };

  const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  const handleEditFormSubmit = async () => {
    try {
      // Perform update API call with editFormData
      await axios.put(`http://localhost:3001/collect/collections/${editFormData.id}`, {
        ...editFormData,
      });

      // Update local state
      const updatedRows = rows.map(row =>
        row.id === editFormData.id ? { ...row, ...editFormData } : row
      );
      setRows(updatedRows);

      // Close edit dialog after successful update
      setEditDialogOpen(false);

      // Show success alert
      setAlertType('success');
      setAlertMessage('Collection updated successfully.');
      setAlertOpen(true);
    } catch (error) {
      console.error('Error updating collection:', error);
      setAlertType('error');
      setAlertMessage('Error updating collection. Please try again.');
      setAlertOpen(true);
    }
  };

  const handleCloseAlert = () => {
    setAlertOpen(false);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'name',
      headerName: 'Name',
      width: 130,
      renderCell: (params) => (
        <div>
          {highlightText(params.value, searchQuery)}
        </div>
      ),
    },
    {
      field: 'phoneNumber',
      headerName: 'Phone Number',
      width: 130,
      renderCell: (params) => (
        <div>
          {highlightText(params.value, searchQuery)}
        </div>
      ),
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 200,
      renderCell: (params) => (
        <div>
          {highlightText(params.value, searchQuery)}
        </div>
      ),
    },
    {
      field: 'product',
      headerName: 'Item',
      width: 200,
      renderCell: (params) => (
        <div>
          {highlightText(params.value, searchQuery)}
        </div>
      ),
    },
    {
      field: 'collectionId',
      headerName: 'Collection ID',
      width: 150,
      renderCell: (params) => (
        <div>
          {highlightText(params.value, searchQuery)}
        </div>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params) => (
        <div style={{ color: params.value === 'Collected' ? 'green' : 'red' }}>
          {params.value}
        </div>
      ),
    },
    {
      field: 'edit',
      headerName: 'Edit',
      width: 100,
      renderCell: (params) => (
        <Button onClick={() => handleEditClick(params.id)}>
          <EditIcon style={{ color: 'blue' }} />
        </Button>
      ),
    }
  ];

  return (
    <div className="rewardshopback">
      <Sidebar />
      <div className='header'>
        <h2>Collection Items</h2>
        <TextField
          variant="outlined"
          className="search"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{
            marginRight: '1rem',
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'grey',
              },
              '&:hover fieldset': {
                borderColor: 'green',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'green',
              },
            },
          }}
        />

        <Button
          variant="outlined"
          onClick={handleResetSearch}
          sx={{ marginLeft: '1rem' }}
        >
          Reset
        </Button>
      </div>

      {searchError && (
        <Alert severity="error" onClose={() => setSearchError(false)} sx={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '50%' }}>
          <AlertTitle>Error</AlertTitle>
          No results found for "{searchQuery}"
        </Alert>
      )}

      {alertOpen && (
        <Alert severity={alertType} onClose={handleCloseAlert} sx={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '50%' }}>
          <AlertTitle>{alertType === 'success' ? 'Success' : alertType === 'info' ? 'Info' : alertType === 'warning' ? 'Warning' : 'Error'}</AlertTitle>
          {alertMessage}
        </Alert>
      )}

      <Dialog open={editDialogOpen} onClose={handleEditDialogClose}>
        <DialogTitle>Edit Row</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Name"
            name="name"
            value={editFormData.name}
            onChange={handleEditFormChange}
            variant="outlined"
          />
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            name="email"
            value={editFormData.email}
            onChange={handleEditFormChange}
            variant="outlined"
          />
          <TextField
            fullWidth
            margin="normal"
            label="Phone Number"
            name="phoneNumber"
            value={editFormData.phoneNumber}
            onChange={handleEditFormChange}
            variant="outlined"
          />
          <FormControl fullWidth margin="normal" variant="outlined">
            <InputLabel>Status</InputLabel>
            <Select
              value={editFormData.status}
              onChange={handleEditFormChange}
              label="Status"
              name="status"
            >
              <MenuItem value="Not collected">Not collected</MenuItem>
              <MenuItem value="Collected">Collected</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleEditFormSubmit} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <div className="table-container">
        <div style={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={filteredRows.length > 0 ? filteredRows : rows}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10]}
            disableSelectionOnClick
          />
        </div>
      </div>
    </div>
  );
};

export default CollectionProduct;
