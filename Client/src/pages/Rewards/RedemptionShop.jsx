import React, { useState, useEffect, useContext } from 'react';
import '../../style/rewards/redemptionshop.css';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import AccountContext from '../../contexts/AccountContext';

function RedemptionShop() {
  const [products, setProducts] = useState([]);
  const [sortedProducts, setSortedProducts] = useState([]);
  const [sortOption, setSortOption] = useState('lowestToHighest');
  const { account } = useContext(AccountContext);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:3001/eco/product-detail');
      if (Array.isArray(response.data)) {
        const sortedProducts = response.data.sort((a, b) => a.leaves - b.leaves);
        setProducts(sortedProducts);
        setSortedProducts(sortedProducts);
      } else {
        console.error('Expected an array from the API response');
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const handleSortChange = (event) => {
    const value = event.target.value;
    setSortOption(value);
    if (value === 'lowestToHighest') {
      sortProducts('asc', 'leaves');
    } else if (value === 'highestToLowest') {
      sortProducts('desc', 'leaves');
    } else if (value === 'AtoZ') {
      sortProducts('asc', 'itemName');
    } else if (value === 'ZtoA') {
      sortProducts('desc', 'itemName');
    } else if (value === 'newest') {
      sortProducts('desc', 'createdAt');
    }
  };

  const sortProducts = (order, sortBy) => {
    const sorted = [...products].sort((a, b) => {
      if (sortBy === 'leaves') {
        return order === 'asc' ? a.leaves - b.leaves : b.leaves - a.leaves;
      } else if (sortBy === 'itemName') {
        return order === 'asc' ? a.itemName.localeCompare(b.itemName) : b.itemName.localeCompare(a.itemName);
      } else if (sortBy === 'createdAt') {
        return order === 'asc' ? new Date(a.createdAt) - new Date(b.createdAt) : new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    });
    setSortedProducts(sorted);
  };

  return (
    <div>

      {/* banner */}
      <div className="rewardbanner">
        <img src="../../src/assets/images/redemptionbanner.png" alt="Banner" />
      </div>

      {/* back */}
      <Grid item xs={12} className="back">
        <a href='/rewards'>
          <img src="../../src/assets/images/icons/back.png" alt="back" />
        </a>
        <p><a href='/rewards'>Back to rewards</a></p>
      </Grid>

      <div className='balance'>
        <h1>Your balance:</h1>
        <h3 className="leaf-points">
          <h1>{account?.leaf_points} 🍃</h1>
        </h3>
        <div className='summary'>
          <p>View <a href='/account/rewards'>leaves summary</a></p>
        </div>
      </div>

      {/* divider */}
      <hr className="divider" />

      {/* shop */}
      <div className='shop'>
        <h1>Shop:</h1>

        {/* filter dropdown */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, mr: 15 }}>
          <FormControl
            variant="outlined"
            className="filter-dropdown"
            sx={{
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
          >
            <Select
              value={sortOption}
              onChange={handleSortChange}
              displayEmpty
              inputProps={{ 'aria-label': 'Sort by' }}
            >
              <MenuItem value="lowestToHighest">Leaves: Low → High</MenuItem>
              <MenuItem value="highestToLowest">Leaves: High → Low </MenuItem>
              <MenuItem value="AtoZ">A → Z</MenuItem>
              <MenuItem value="ZtoA">Z → A</MenuItem>
              <MenuItem value="newest">Newest Items</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* products */}
        <Grid container spacing={2} justifyContent="center" className="products">
          {sortedProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Paper
                sx={{
                  padding: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%',
                  boxShadow: 'none',
                  border: 'none',
                  marginBottom: '10px',
                }}
                className="product-item"
              >
                <h2>{product.itemName}</h2>
                <Box
                  component="img"
                  src={`http://localhost:3001/eco/product-images/${product.itemimg}`}
                  alt={product.itemName}
                  sx={{
                    width: '250px',
                    height: '250px',
                    maxWidth: '100%',
                    border: '5px solid #14772B',
                    marginBottom: '10px',
                    borderRadius: '15px'
                  }}
                />
                <p><b>{product.leaves}</b> 🍃</p>
                <Button
                  component={Link}
                  to={`/redeemform/${product.id}`}
                  state={{ product }}
                  className='redeembutton'
                  disabled={account?.leaf_points < product.leaves}
                  variant="contained"
                  color="primary"
                  sx={{
                    backgroundColor: '#14772B',
                    color: '#fff',
                    '&:hover': {
                      backgroundColor: '#105c24',
                    },
                    '&:disabled': {
                      backgroundColor: '#ccc',
                      color: '#888',
                    },
                    borderRadius: '8px',
                    padding: '10px 20px',
                    textTransform: 'none',
                    fontWeight: 'bold',
                  }}
                >
                  Redeem
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </div>
    </div>
  );
}

export default RedemptionShop;
