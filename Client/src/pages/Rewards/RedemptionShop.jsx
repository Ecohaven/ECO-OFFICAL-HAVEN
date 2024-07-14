import React, { useState, useEffect } from 'react';
import '../../style/rewards/redemptionshop.css';
// import Navbar from '../../components/Navbar';
// import Footer from '../../components/footer';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

function RedemptionShop() {
  const [products, setProducts] = useState([]);
  const [sortedProducts, setSortedProducts] = useState([]);
  const [sortOption, setSortOption] = useState('lowestToHighest'); // Set default sorting option

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:3001/eco/product-detail');
      if (Array.isArray(response.data)) {
        const sortedProducts = response.data.sort((a, b) => a.leaves - b.leaves);
        setProducts(sortedProducts);
        setSortedProducts(sortedProducts); // Initialize sorted products
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
      sortProducts('desc', 'createdAt'); // Assuming createdAt is the field indicating product addition date
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
      {/* <Navbar /> */}

      <div className="headbanner">
        <img src="../../src/assets/images/rewardbanner.png" alt="Banner" />
        <h1>Redemption Shop</h1>
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
        <h1><span className='total'>150</span> leaves</h1>
        <div className='summary'>
          <p>View <a href='/:username/rewards'>leaves summary</a></p>
        </div>
      </div>

      <hr className="divider" />

      <div className='shop'>
        <h1>Shop:</h1>

        {/* Filter Dropdown */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, mr: 8 }}>
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

        {/* Product Grid */}
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
                <p><b>{product.leaves}</b> Leaves</p>
                <Link to={`/redeemform/${product.id}`} state={{ product }} className='redeembutton'>Redeem</Link>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </div>

      {/* <Footer /> */}
    </div>
  );
}

export default RedemptionShop;
