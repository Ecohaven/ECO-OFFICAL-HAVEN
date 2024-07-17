import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Container, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
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
  const { account } = useContext(AccountContext); // Use context to get the account details

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
        const updatedRows = response.data.map((row, index) => ({
          id: index + 1,
          collectionId: row.collectionId,
          phoneNumber: row.phoneNumber,
          email: row.email,
          product: row.product,
          status: row.status,
        }));
        setCollectionRows(updatedRows);

        if (response.data.length > 0) {
          // Fetch details for the first collection in the list
          fetchCollectionDetail(accountName, response.data[0].collectionId);
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
        const detail = response.data; // Assuming only one collection detail is fetched
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
          <div className="table-container" style={{marginBottom:'80px'}}>
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
         
        </Grid>
      </Grid>
    </Container>
  );
}

export default Account_Profile_Rewards;
