import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import Account_Nav from './Account_Nav';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${theme.breakpoints.up('sm')} .MuiTableCell-head`]: {
    fontSize: '1.2rem',
  },
  [`&.${theme.breakpoints.up('sm')} .MuiTableCell-body`]: {
    fontSize: '1.2rem',
  },
}));

function Account_Profile_Rewards() {
  const [collectionRows, setCollectionRows] = useState([]);

  useEffect(() => {
    fetchCollectionRows();
  }, []);

  const fetchCollectionRows = async () => {
    try {
      const token = localStorage.getItem('accessToken'); // Retrieve token from local storage

      if (!token) {
        console.error('Access token not found');
        return;
      }

      const response = await axios.get('http://localhost:3001/collect/collections', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (Array.isArray(response.data)) {
        setCollectionRows(response.data.map((row, index) => ({
          id: index + 1,
          product: row.product,
          collectionId: row.collectionId,
          status: row.status,
        })));
      } else {
        console.error('Expected an array from the API response');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const navigate = useNavigate();

  // check if user is not logged in
  useEffect(() => {
      if (!localStorage.getItem('accessToken')) {
          navigate('/login');
      }
  }, [navigate]);

  return (
    <Container>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Account_Nav />
        </Grid>
        <Grid item xs={12} md={9}>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 700 }} aria-label="customized table">
              <TableHead>
                <TableRow>
                  <StyledTableCell>No.</StyledTableCell>
                  <StyledTableCell align="right">Item</StyledTableCell>
                  <StyledTableCell align="right">Collection ID</StyledTableCell>
                  <StyledTableCell align="right">Status</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {collectionRows.map((row) => (
                  <TableRow key={row.id}>
                    <StyledTableCell component="th" scope="row">
                      {row.id}
                    </StyledTableCell>
                    <StyledTableCell align="right">{row.product}</StyledTableCell>
                    <StyledTableCell align="right">{row.collectionId}</StyledTableCell>
                    <StyledTableCell align="right">{row.status}</StyledTableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Account_Profile_Rewards;
