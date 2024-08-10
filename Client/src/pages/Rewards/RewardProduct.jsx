import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import axios from 'axios';
import { Alert, AlertTitle, Typography } from '@mui/material';

import '../../style/rewards/rewardproduct.css';

import ExclamationMarkIcon from '../../assets/icons/exclamation-mark.png';
import { MenuItem, FormControl, InputLabel, Select } from '@mui/material';

const RewardTable = () => {
  const [rows, setRows] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [formValues, setFormValues] = useState({ itemName: '', leaves: '', stock: '', code: '', category: '' });
  const [file, setFile] = useState(null);
  const [productDetail, setProductDetail] = useState(null);
  const [errorAdding, setErrorAdding] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  const [alertType, setAlertType] = useState('success');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertOpen, setAlertOpen] = useState(false);


  const [openZoomModal, setOpenZoomModal] = useState(false);
  const [zoomedImageUrl, setZoomedImageUrl] = useState('');

  const [sortBy, setSortBy] = useState('lowest-leaves');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState(false);

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

  const fetchRows = async () => {
    try {
      const response = await axios.get('http://localhost:3001/eco/product-detail');
      if (Array.isArray(response.data)) {
        let sortedData = response.data.sort((a, b) => a.leaves - b.leaves); // Default to lowest leaves
        setRows(sortedData);
      } else {
        console.error('Expected an array from the API response');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchProductDetail = async (id) => {
    try {
      const response = await axios.get(`http://localhost:3001/eco/product-detail/${id}`);
      setProductDetail(response.data);
      setOpenDetail(true);
    } catch (error) {
      console.error('Error fetching item detail:', error);
    }
  };

  const handleOpenAdd = () => {
    setFormValues({ itemdName: '', leaves: '', stock: '', code: '', category: '' });
    setFile(null);
    setOpenAdd(true);
    setErrorAdding('');
  };

  const handleCloseAdd = () => {
    setOpenAdd(false);
    setErrorAdding('');
  };

  const handleOpenEdit = (row) => {
    setSelectedRow(row);
    setFormValues(row);
    setFile(null);
    setOpenEdit(true);
  };

  const handleCloseEdit = () => {
    setSelectedRow(null);
    setFormValues({ itemName: '', leaves: '', stock: '', code: '', category: '' });
    setFile(null);
    setOpenEdit(false);
  };

  const handleCloseDetail = () => {
    setProductDetail(null);
    setOpenDetail(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleCloseAlert = () => {
    setAlertOpen(false);
  };

  const handleShowAlert = (type, message) => {
    setAlertType(type);
    setAlertMessage(message);
    setAlertOpen(true);
  };

  const validateForm = () => {
    if (!formValues.itemName || !formValues.leaves || !formValues.stock || !formValues.code || !formValues.category) {
      setErrorAdding('Please fill out all fields.');
      return false;
    }

    if (isNaN(Number(formValues.leaves)) || isNaN(Number(formValues.stock))) {
      setErrorAdding('Leaves and Stock must be valid numbers.');
      return false;
    }

    return true;
  };

  const handleSaveAdd = async () => {
    if (!validateForm()) {
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('itemName', formValues.itemName);
    formData.append('leaves', formValues.leaves);
    formData.append('stock', formValues.stock);
    formData.append('code', formValues.code);
    formData.append('category', formValues.category);

    try {
      const response = await axios.post('http://localhost:3001/eco/product-detail', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 201) {
        setRows([...rows, response.data]);
        handleCloseAdd();
        handleShowAlert('success', 'Item added successfully!');
      } else {
        setErrorAdding('Error adding item. Please try again.');
      }
    } catch (error) {
      console.error('Error adding item:', error);
      setErrorAdding('Error adding item. Please try again.');
    }
  };

  const handleSaveEdit = async () => {
    if (!validateForm()) {
      return;
    }

    const formData = new FormData();
    formData.append('itemName', formValues.itemName);
    formData.append('leaves', formValues.leaves);
    formData.append('stock', formValues.stock);
    formData.append('code', formValues.code);
    formData.append('category', formValues.category);

    if (file) {
      formData.append('file', file);
    }

    try {
      const response = await axios.put(`http://localhost:3001/eco/product-detail/${selectedRow.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 200) {
        const updatedItem = response.data.item;
        const updatedRows = rows.map(row => (row.id === updatedItem.id ? updatedItem : row));
        setRows(updatedRows);
        handleCloseEdit();
        handleShowAlert('success', 'Item updated successfully!');
      } else {
        console.error('Invalid response from the server');
      }
    } catch (error) {
      console.error('Error editing item:', error);
      setErrorAdding('Error editing item. Please try again.');
    }
  };


  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/eco/product-detail/${id}`);
      setRows(rows.filter(row => row.id !== id));
      handleShowAlert('success', 'Item deleted successfully!');
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleViewDetail = (id) => {
    fetchProductDetail(id);
  };

  const handleZoomImage = (imageUrl) => {
    setZoomedImageUrl(imageUrl);
    setOpenZoomModal(true);
  };

  const handleCloseZoomModal = () => {
    setOpenZoomModal(false);
    setZoomedImageUrl('');
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);

    switch (event.target.value) {
      case 'highest-leaves':
        setRows([...rows].sort((a, b) => b.leaves - a.leaves));
        break;
      case 'lowest-leaves':
        setRows([...rows].sort((a, b) => a.leaves - b.leaves));
        break;
      case 'highest-stock':
        setRows([...rows].sort((a, b) => b.stock - a.stock));
        break;
      case 'lowest-stock':
        setRows([...rows].sort((a, b) => a.stock - b.stock));
        break;
      default:
        break;
    }
  };

  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    // Check if there are no results
    const filtered = rows.filter(
      (row) =>
        row.itemName.toLowerCase().includes(query) ||
        row.code.toString().includes(query) ||  // Include numbers by converting to string
        row.leaves.toString().includes(query) ||  // Include leaves (numbers) by converting to string
        row.stock.toString().includes(query)  // Include stock (numbers) by converting to string
    );

    if (filtered.length === 0 && query.trim() !== '') {
      setSearchError(true);
    } else {
      setSearchError(false);
    }
  };

  const handleResetClick = () => {
    setSearchQuery('');
    setSortBy('lowest-leaves');
  setRows([...rows].sort((a, b) => a.leaves - b.leaves));
  };

  const filteredRows = rows.filter(row =>
    row.itemName.toLowerCase().includes(searchQuery) ||
    row.code.toLowerCase().includes(searchQuery)
  );

  const highlightText = (text, query) => {
    if (!query) {
      return text;
    }
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

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'itemName',
      headerName: 'Item Name',
      width: 130,
      renderCell: (params) => (
        <div>
          {highlightText(params.value, searchQuery)}
        </div>
      ),
    },
    {
      field: 'leaves',
      headerName: 'Leaves',
      type: 'number',
      width: 90,
      renderCell: (params) => (
        <div>
          {highlightText(params.value.toString(), searchQuery)}
        </div>
      ),
    },
    {
      field: 'stock',
      headerName: 'Stock',
      type: 'number',
      width: 90,
      renderCell: (params) => (
        <div>
          {highlightText(params.value.toString(), searchQuery)}
        </div>
      ),
    },
    {
      field: 'code',
      headerName: 'Code',
      type: 'number',
      width: 90,
      renderCell: (params) => (
        <div>
          {highlightText(params.value, searchQuery)}
        </div>
      ),
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 130,
      renderCell: (params) => (
        <div>
          {highlightText(params.value, searchQuery)}
        </div>
      ),
    },
    {
      field: 'itemimg',
      headerName: 'Item Image',
      width: 130,
      renderCell: (params) => (
        <div style={{ textAlign: 'center' }}>
          <img
            src={`http://localhost:3001/eco/product-images/${params.value}`}
            alt="item"
            style={{ width: 50, height: 50, cursor: 'pointer' }}
            onClick={() => handleZoomImage(`http://localhost:3001/eco/product-images/${params.value}`)}
          />
        </div>
      ),
    },
    {
      field: 'edit',
      headerName: 'Edit',
      width: 130,
      renderCell: (params) => (
        <div>
          <EditIcon
            style={{ cursor: 'pointer', color: 'blue' }}
            onClick={() => handleOpenEdit(params.row)}
          />
        </div>
      ),
    },
    {
      field: 'delete',
      headerName: 'Delete',
      width: 130,
      renderCell: (params) => (
        <div>
          <DeleteIcon style={{ cursor: 'pointer', color: 'red' }} onClick={() => setDeleteConfirmation(params.row.id)} />
        </div>
      ),
    },
  ];


  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
  };

  const deleteModalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    minWidth: 300,
    maxWidth: 500,
    width: '30%',
    textAlign: 'center',
  };

  return (
    <div className="rewardshopback">


      <div className='header'>
        <h2 className='rewardproducts'>Reward Products</h2>

{/* Search bar */}
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
        borderColor: 'green',
      },
      '&:hover fieldset': {
        borderColor: 'green',
      },
      '&.Mui-focused fieldset': {
        borderColor: 'green',
      },
      '& input::placeholder': {
        color: 'black', 
        opacity: 1, 
      },
    },
  }}
/>



        {/* Reset button added here */}
        <Button className='resetbutton'
          variant="contained"
          onClick={handleResetClick}
          sx={{
            marginLeft: '0.5rem',
          }}
        >
          Reset
        </Button>

        {/* Filter dropdown */}
        <FormControl
          variant="outlined"
          className="filter-dropdown"
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'green',
              },
              '&:hover fieldset': {
                borderColor: 'green',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'green',
              },
            },
          }}
        >
          <InputLabel>Filter</InputLabel>
          <Select
            value={sortBy}
            onChange={handleSortChange}
            displayEmpty
            inputProps={{ 'aria-label': 'Sort by' }}
            label="Filter"
          >
            <MenuItem value="lowest-leaves">Lowest Leaves</MenuItem>
            <MenuItem value="highest-leaves">Highest Leaves</MenuItem>
            <MenuItem value="lowest-stock">Lowest Stock</MenuItem>
            <MenuItem value="highest-stock">Highest Stock</MenuItem>
          </Select>
        </FormControl>

        <Button variant="contained" onClick={handleOpenAdd} className='addnewproductbutton'>
          Add New Item
        </Button>
      </div>

      {searchError && (
        <Alert severity="error" onClose={() => setSearchError(false)} sx={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '50%' }}>
          <AlertTitle>Error</AlertTitle>
          No results found for "{searchQuery}"
        </Alert>
      )}

      {/* alert for displaying messages */}
      {alertOpen && (
        <Alert severity={alertType} onClose={handleCloseAlert} sx={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '50%' }}>
          <AlertTitle>{alertType === 'success' ? 'Success' : alertType === 'info' ? 'Info' : alertType === 'warning' ? 'Warning' : 'Error'}</AlertTitle>
          {alertMessage}
        </Alert>
      )}

      <div>
        {/* fields */}
        <DataGrid
          rows={filteredRows}
          columns={columns}
          getRowId={(row) => row.id}
          pageSize={5}
          checkboxSelection
          className="data-grid"
          sx={{ textAlign: 'left' }}
        />
      </div>

      {/* Add popup modal */}
      <Modal
        open={openAdd}
        onClose={handleCloseAdd}
      >
        <Box sx={{ ...style, width: 400 }}>
          <h2 className='popup'>Add New Item</h2>
          <hr />

          {/* Form Fields */}
          <TextField
            label="Item Name*"
            name="itemName"
            value={formValues.itemName}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Leaves*"
            name="leaves"
            value={formValues.leaves}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            type="number"
          />
          <TextField
            label="Stock*"
            name="stock"
            value={formValues.stock}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            type="number"
          />
          <TextField
            label="Code*"
            name="code"
            value={formValues.code}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Category*</InputLabel>
            <Select
              name="category"
              value={formValues.category}
              onChange={handleInputChange}
            >
              <MenuItem value="bags and accessories">Bags and Accessories</MenuItem>
              <MenuItem value="lifestyle">Lifestyle</MenuItem>
              <MenuItem value="craft and hobbies">Craft and Hobbies</MenuItem>
              <MenuItem value="household">Household</MenuItem>
              <MenuItem value="electronics">Electronics</MenuItem>
              <MenuItem value="Others/Miscellaneous">Others/Miscellaneous</MenuItem>
            </Select>
          </FormControl>
          <input type="file" onChange={handleFileChange} />

          {/* Popup Buttons */}
          <Button variant="contained" className='save-button' onClick={handleSaveAdd} style={{ marginTop: '10px', marginRight: '10px'}}>
            Save
          </Button>
          <Button variant="contained" className='cancel-button' onClick={handleCloseAdd} style={{ marginTop: '10px' }}>
            Cancel
          </Button>

          {/* Error Message */}
          {errorAdding && <p style={{ color: 'red' }}>{errorAdding}</p>}
        </Box>
      </Modal>


      {/* edit popup */}
      <Modal open={openEdit} onClose={handleCloseEdit}>
        <Box sx={{ ...style, width: 400 }}>
          <h2 className='popup'>Edit Item</h2>
          <hr></hr>
          <TextField fullWidth margin="normal" label="Item Name" name="itemName" value={formValues.itemName} onChange={handleInputChange} />
          <TextField fullWidth margin="normal" label="Leaves" name="leaves" type="number" value={formValues.leaves} onChange={handleInputChange} />
          <TextField fullWidth margin="normal" label="Stock" name="stock" type="number" value={formValues.stock} onChange={handleInputChange} />
          <TextField fullWidth margin="normal" label="Code" name="code" value={formValues.code} onChange={handleInputChange} />
          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={formValues.category}
              onChange={handleInputChange}
            >
              <MenuItem value="Bags and Acessories">Bags and Accessories</MenuItem>
              <MenuItem value="Household">Household</MenuItem>
              <MenuItem value="Craft and Hobbies">Craft and Hobbies</MenuItem>
              <MenuItem value="Electronics">Electronics</MenuItem>
              <MenuItem value="Lifestyle">Lifestyle</MenuItem>
              <MenuItem value="Others/Miscellaneous">Others/Miscellaneous</MenuItem>
            </Select>
          </FormControl>
          <input type="file" onChange={handleFileChange} />
          <Button variant="contained" className='savechangesbutton' onClick={handleSaveEdit} style={{ marginTop: '10px', marginRight: '10px' }}>
            Save Changes
          </Button>
          <Button variant="contained" className='cancel-button' onClick={handleCloseEdit} style={{ marginTop: '10px' }}>
            Cancel
          </Button>
          {errorAdding && <p style={{ color: 'red' }}>{errorAdding}</p>}
        </Box>
      </Modal>


      {/* delete confirmation */}
      <Modal open={deleteConfirmation !== null} onClose={() => setDeleteConfirmation(null)}>
        <Box sx={deleteModalStyle}>
          <img src={ExclamationMarkIcon} alt='Exclamation Mark' width={'70px'} height={'70px'} className='icon' />
          <p>Are you sure you want to delete this item?</p>
          <Button variant="contained" className='deletebutton' onClick={() => { handleDelete(deleteConfirmation); setDeleteConfirmation(null); }}>
            Delete
          </Button>
          <Button variant="contained" className='cancel-button' onClick={() => setDeleteConfirmation(null)}>
            Cancel
          </Button>
        </Box>
      </Modal>

      {/* zoom product image */}
      <Modal open={openZoomModal} onClose={handleCloseZoomModal}>
        <Box sx={{ ...style, width: '40%', maxWidth: '400px', position: 'relative' }}>
          <IconButton
            onClick={handleCloseZoomModal}
            sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
          >
            <CloseIcon style={{ color: 'red' }} />
          </IconButton>
          <Box sx={{ width: '100%', paddingTop: '100%', position: 'relative' }}>
            <img src={zoomedImageUrl} alt="Zoomed Item"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default RewardTable;
