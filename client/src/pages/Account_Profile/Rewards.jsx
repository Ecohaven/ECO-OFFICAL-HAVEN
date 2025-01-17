import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Container, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import Account_Nav from './Account_Nav';
import { tableCellClasses } from '@mui/material/TableCell';
import '../../style/rewards/rewardsprofile.css';
import AccountContext from '../../contexts/AccountContext';

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
  const { account } = useContext(AccountContext);

  useEffect(() => {
    if (account && account.name) {
      fetchCollectionRows(account.name);
    }
  }, [account]);

  const fetchCollectionRows = async (accountName) => {
    try {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        console.error('Access token not found');
        return;
      }

      const response = await axios.get(`http://localhost:3001/collect/byAccount/${accountName}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (Array.isArray(response.data)) {
        // Limit to the latest 5 collection rows
        const updatedRows = response.data.slice(-5).map((row, index) => ({
          id: index + 1,
          collectionId: row.collectionId,
          phoneNumber: row.phoneNumber,
          email: row.email,
          product: row.product,
          status: row.status,
        }));
        setCollectionRows(updatedRows);

        if (updatedRows.length > 0) {
          fetchCollectionDetail(accountName, updatedRows[0].collectionId);
        }
      } else {
        console.error('Expected an array from the API response');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchCollectionDetail = async (accountName, collectionId) => {
    try {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        console.error('Access token not found');
        return;
      }

      const response = await axios.get(`http://localhost:3001/collect/${collectionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data) {
        const detail = response.data;
        setCollectionDetail({
          collectionId: detail.collectionId,
          phoneNumber: detail.phoneNumber,
          email: detail.email,
          product: detail.product,
          status: detail.status,
        });
      } else {
        console.error('Expected an object with collection detail from the API response');
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
          <div className="table-container" style={{ marginBottom: '80px' }}>

            {/* leaves summary */}
            <h3 className='header'>Leaves summary</h3>
            <hr></hr>
            <div className="summary-rectangle">
              <div className="summary-rectangle-content">
                <h3 className="balance">Your balance:</h3>
                <h3 className="leaf-points">
                  {account?.leaf_points} 🍃
                </h3>
                <p className="total-leaves">Total leaves</p>
                <p className="as-of-today">As of today</p>
              </div>
            </div>

            {/* Collection of rewards */}
            <h3 className='header'>Latest collection of rewards</h3>
            <hr></hr>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 700 }} aria-label="customized table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell>No.</StyledTableCell>
                    <StyledTableCell align="right">Collection ID</StyledTableCell>
                    <StyledTableCell align="right">Product</StyledTableCell>
                    <StyledTableCell align="right">Status</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {collectionRows.map((row) => (
                    <StyledTableRow key={row.id}>
                      <StyledTableCell component="th" scope="row">
                        {row.id}
                      </StyledTableCell>
                      <StyledTableCell align="right">{row.collectionId}</StyledTableCell>
                      <StyledTableCell align="right">{row.product}</StyledTableCell>
                      <StyledTableCell align="right">{row.status}</StyledTableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>

          {/* collection detail */}
          <div className='collectiondetail' style={{ marginTop: '-40px'}}>
            <h2>Please remember the collection details</h2>
            <p>Potong Pasir Community Club</p>
            <p>6 Potong Pasir Ave 2, Singapore 358361</p>
            <p>Monday - Friday: <span className='time'>11:00am - 8:00pm</span></p>
            <p>Saturday & Sunday: <span className='time'>12:00pm - 4:00pm</span></p>
            <p className='extra'>*please collect within a week</p>
          </div>

          {/* Google Maps Embed */}
          <div className="mapcontainer" style={{ marginTop: '30px', height: '450px', marginBottom: '30px' }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.7391384896086!2d103.864573974472!3d1.3326563616319074!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da17788fd6578d%3A0xe39820494864ff1c!2sPotong%20Pasir%20Community%20Club!5e0!3m2!1sen!2ssg!4v1723039673994!5m2!1sen!2ssg"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Map of Potong Pasir Community Club"
            ></iframe>
          </div>

        </Grid>
      </Grid>
    </Container>
  );
}

export default Account_Profile_Rewards;
