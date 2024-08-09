import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { IconButton, TextField, Button, Box, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const ReviewListPage = () => {
  const [reviews, setReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [editForm, setEditForm] = useState({ reviewDescription: '', event: '' });

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get('http://localhost:3001/review/');
        setReviews(response.data);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      }
    };

    fetchReviews();
  }, []);

  const handleEditClick = (review) => {
    setSelectedReview(review);
    setEditForm({ reviewDescription: review.reviewDescription, event: review.event });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    if (!selectedReview) return;

    try {
      await axios.put(`http://localhost:3001/review/${selectedReview.id}`, {
        reviewDescription: editForm.reviewDescription,
        event: editForm.event,
      });
      setReviews(reviews.map(review =>
        review.id === selectedReview.id ? { ...review, ...editForm } : review
      ));
      setSelectedReview(null);
      setEditForm({ reviewDescription: '', event: '' });
    } catch (err) {
      console.error('Error updating review:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/review/${id}`);
      setReviews(reviews.filter(review => review.id !== id));
    } catch (err) {
      console.error('Error deleting review:', err);
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'firstName', headerName: 'First Name', width: 150 },
    { field: 'lastName', headerName: 'Last Name', width: 150 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'event', headerName: 'Event', width: 200 },
    { field: 'rating', headerName: 'Rating', width: 120 },
    { field: 'reviewDescription', headerName: 'Review', width: 300 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => (
        <>
          <IconButton style={{color:'blue'}} onClick={() => handleEditClick(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton style={{color:'red'}} onClick={() => handleDelete(params.row.id)}>
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.content}>
         <Typography variant="h4" style={{textAlign:'left',fontWeight:'bold'}}gutterBottom>
                Review List
            </Typography>
        <div style={styles.dataGridContainer}>
          <DataGrid rows={reviews} columns={columns} pageSize={10} autoHeight />
        </div>
        {selectedReview && (
          <Box component="form" sx={styles.editForm} noValidate autoComplete="off">
            <Typography variant="h6" gutterBottom>
              Edit Review
            </Typography>
            <TextField
              label="Review Description"
              name="reviewDescription"
              value={editForm.reviewDescription}
              onChange={handleEditChange}
              fullWidth
              multiline
              rows={4}
              margin="normal"
              variant="outlined"
            />
            <TextField
              label="Event"
              name="event"
              value={editForm.event}
              onChange={handleEditChange}
              fullWidth
              margin="normal"
              variant="outlined"
            />
            <Box sx={styles.buttonContainer}>
              <Button variant="contained" color="primary" onClick={handleUpdate}>
                Update Review
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => setSelectedReview(null)}
                sx={styles.cancelButton}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    marginLeft: '260px',
  },
  content: {
    flex: 1,
    padding: '20px',
  },
  dataGridContainer: {
    height: 'auto',
    width: '100%',
    maxHeight: 'calc(100vh - 200px)', // Adjust based on available space
  },
  editForm: {
    marginTop: '20px',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    backgroundColor: '#fff',
    width:'800px',
    marginLeft:'200px'
  },
  buttonContainer: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
  },
  cancelButton: {
    marginLeft: '10px',
    backgroundColor:'red',
    color:'white'
  },
};

export default ReviewListPage;
