import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import TextField from '@mui/material/TextField';
import { Alert, AlertTitle, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import '../../style/rewards/collectionproduct.css';

const CollectionProduct = () => {
  const [rows, setRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertOpen, setAlertOpen] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [filteredRows, setFilteredRows] = useState([]);
  const [itemFilter, setItemFilter] = useState('All');
  const [uniqueItems, setUniqueItems] = useState([]);
  const [totalCollection, setTotalCollection] = useState(0);
  const [editFormData, setEditFormData] = useState({
    id: '',
    name: '',
    email: '',
    phoneNumber: '',
    status: 'Not collected'
  });

  useEffect(() => {
    fetchRows();
  }, []);

  useEffect(() => {
    if (alertOpen) {
      const timer = setTimeout(() => {
        handleCloseAlert();
      }, 5000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [alertOpen]);

  useEffect(() => {
    filterRows(rows, searchQuery, statusFilter);
  }, [statusFilter, searchQuery, rows]);



  const fetchRows = async () => {
    try {
      const response = await axios.get('http://localhost:3001/collect/collections');
      if (Array.isArray(response.data)) {
        setRows(response.data);
        filterRows(response.data, searchQuery, statusFilter, itemFilter);

        const items = Array.from(new Set(response.data.map(row => row.product)));
        setUniqueItems(['All', ...items]);

        // Calculate initial total collection count
        const total = response.data.filter(row => row.product === itemFilter).length;
        setTotalCollection(total);
      } else {
        console.error('Expected an array from the API response');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };



  const handleResetSearch = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setItemFilter('All');
    fetchRows();
    setSearchError(false);
  };

  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    filterRows(rows, query, statusFilter);
  };

  const filterRows = (rowsToFilter, search = searchQuery, status = statusFilter, item = itemFilter) => {
    let filtered = rowsToFilter;

    if (search) {
      filtered = filtered.filter(
        (row) =>
          Object.values(row).some(value =>
            value.toString().toLowerCase().includes(search.toLowerCase())
          )
      );
    }

    if (status && status !== 'All') {
      filtered = filtered.filter(row => row.status === status);
    }

    if (item && item !== 'All') {
      filtered = filtered.filter(row => row.product === item);
    }

    setFilteredRows(filtered);

    // Update total collection count based on the selected item
    const total = filtered.filter(row => row.product === item).length;
    setTotalCollection(total);

    if (filtered.length === 0 && search.trim() !== '') {
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

  const handleStatusFilterChange = (event) => {
    const value = event.target.value;
    console.log('Selected status:', value);
    setStatusFilter(value);
    filterRows(rows, searchQuery, value);
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
        status: selected.status === 'Collected' ? 'Collected' : 'Not collected'
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
      await axios.put(`http://localhost:3001/collect/collections/${editFormData.id}`, {
        ...editFormData,
      });

      const updatedRows = rows.map(row =>
        row.id === editFormData.id ? { ...row, ...editFormData } : row
      );
      setRows(updatedRows);

      setEditDialogOpen(false);

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
      <div className="header">
        <h2 className='collectionitem'>Collection Items</h2>
        <div className="header-controls">

          {/* search */}
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

          {/* reset button */}
          <Button
            className='resetbutton'
            variant="contained"
            onClick={handleResetSearch}
            sx={{ marginRight: '1rem' }}
          >
            Reset
          </Button>

          {/* status filter */}
          <FormControl variant="outlined" className="filtercollection" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              label="Status"
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Collected">Collected</MenuItem>
              <MenuItem value="Not collected">Not collected</MenuItem>
            </Select>
          </FormControl>

          {/* item filter */}
          <FormControl
            variant="outlined"
            className="itemfilter"
            sx={{ minWidth: 120, marginLeft: '20px' }}
          >
            <InputLabel>Item</InputLabel>
            <Select
              value={itemFilter}
              onChange={(e) => {
                setItemFilter(e.target.value);
                filterRows(rows, searchQuery, statusFilter, e.target.value);
              }}
              label="Item"
            >
              {uniqueItems.map(item => (
                <MenuItem key={item} value={item}>{item}</MenuItem>
              ))}
            </Select>
          </FormControl>

        </div>
        {itemFilter !== 'All' && (
          <div className="totalcollection" style={{marginTop: '30px', marginBottom: '-20px'}}>
            <h3>Total {itemFilter} collections: <span style={{color: '#14772B', fontSize: '24px'}}>{totalCollection}</span></h3>
          </div>
        )}
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

      {/* edit popup */}
      <Dialog open={editDialogOpen} onClose={handleEditDialogClose}>
        <DialogTitle
          style={{
            color: '#14772B',
            textAlign: 'center',
            fontSize: '40px',
            fontWeight: 'bold'

          }}>Edit Collection</DialogTitle>
        <hr style={{ border: '1px solid #ddd', margin: '0 20px' }} />
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
          <Button onClick={handleEditFormSubmit} color="primary" className='save-button' style={{ color: 'white', marginRight: '-10px' }}>
            Save
          </Button>
          <Button onClick={handleEditDialogClose} color="primary" className='cancelbutton' style={{ color: 'white' }}>
            Cancel
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
            sx={{ textAlign: 'left' }}
          />
        </div>
      </div>
    </div>
  );
};

export default CollectionProduct;
