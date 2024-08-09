import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box } from '@mui/material';

const ReviewListPage = () => {
  const [reviews, setReviews] = useState([]);

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

  return (
    <Box style={styles.container}>
      <Box style={styles.content}>
        <Typography variant="h4" style={{ textAlign: 'left', fontWeight: 'bold' }} gutterBottom>
          Review List
        </Typography>
        <TableContainer component={Paper} style={styles.tableContainer}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>First Name</TableCell>
                <TableCell>Last Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Event</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Review Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>{review.id}</TableCell>
                  <TableCell>{review.firstName}</TableCell>
                  <TableCell>{review.lastName}</TableCell>
                  <TableCell>{review.email}</TableCell>
                  <TableCell>{review.event}</TableCell>
                  <TableCell>{review.rating}</TableCell>
                  <TableCell>{review.reviewDescription}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
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
  tableContainer: {
    marginTop: '20px',
  },
};

export default ReviewListPage;
