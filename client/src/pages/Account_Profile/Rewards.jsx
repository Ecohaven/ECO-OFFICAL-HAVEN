import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import Account_Nav from './Account_Nav';
import { tableCellClasses } from '@mui/material/TableCell';
import '../../style/rewards/rewardsprofile.css';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: '#14772B',
    color: theme.palette.common.white,
    fontSize: '1.2rem',
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: '1.2rem',
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: '#91E1A3',
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

function Account_Profile_Rewards() {
  const [collectionRows, setCollectionRows] = useState([]);
  const [collectionDetail, setCollectionDetail] = useState({});

  useEffect(() => {
    fetchCollectionRows();
    fetchCollectionDetail();
  }, []);

  const fetchCollectionRows = async () => {
    try {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        console.error('Access token not found');
        return;
      }

      const accountName = 'Cody'; // Replace with the actual account name or fetch dynamically
      const response = await axios.get(`http://localhost:3001/collect/byAccount/${accountName}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (Array.isArray(response.data)) {
        const updatedRows = response.data.map((row, index) => ({
          id: index + 1,
          product: row.product,
          collectionId: row.collectionId,
          status: row.status,
        }));
        setCollectionRows(updatedRows);
      } else {
        console.error('Expected an array from the API response');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchCollectionDetail = async () => {
    try {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        console.error('Access token not found');
        return;
      }

      const accountName = 'Cody'; // Replace with the actual account name or fetch dynamically
      const response = await axios.get(`http://localhost:3001/collect/byAccount/${accountName}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (Array.isArray(response.data) && response.data.length > 0) {
        const detail = response.data[0]; // Assuming only one collection detail is fetched
        setCollectionDetail({
          name: detail.name,
          address: detail.address,
          openingHours: detail.openingHours,
          extraInfo: detail.extraInfo,
        });
      } else {
        console.error('Expected an array with collection detail from the API response');
      }
    } catch (error) {
      console.error('Error fetching collection detail:', error);
    }
  };

  return (
    <Container>
      <Grid container spacing={3}>

        <Grid item xs={12} md={3}>
          <Account_Nav />
        </Grid>

        <Grid item xs={12} md={9}>
          <div className="table-container">
            {/* leaves summary */}
            <h3 className='header'>Leaves summary</h3>
            <hr></hr>
            <div className="grey-rectangle"></div>

            {/* Collection of rewards */}
            <h3 className='header'>Collection of rewards</h3>
            <hr></hr>
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
                    <StyledTableRow key={row.id}>
                      <StyledTableCell component="th" scope="row">
                        {row.id}
                      </StyledTableCell>
                      <StyledTableCell align="right">{row.product}</StyledTableCell>
                      <StyledTableCell align="right">{row.collectionId}</StyledTableCell>
                      <StyledTableCell align="right">{row.status}</StyledTableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>

          {/* collection detail */}
          <div className='collectiondetail'>
            <h2>Please remember the collection details</h2>
            <p>Potong Pasir Community Club</p>
            <p>6 Potong Pasir Ave 2, Singapore 358361</p>
            <p>Monday - Friday: <span className='time'>11:00am - 8:00pm</span></p>
            <p>Saturday & Sunday: <span className='time'>12:00pm - 4:00pm</span></p>
          </div>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Account_Profile_Rewards;
