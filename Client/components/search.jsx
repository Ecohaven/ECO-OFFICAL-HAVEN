import React, { useState, useCallback } from 'react';
import { Input, IconButton, CircularProgress, List, ListItem, ListItemText, Divider, Paper, Box, Typography, Link } from '@mui/material';
import { Clear } from '@mui/icons-material';
import axios from 'axios';

// Array for menu items
const menuItems = [
  { text: 'Home', path: '/' },
  { text: 'About Us', path: '/about_us' },
  { text: 'Events', path: '/events' },
  { text: 'Book Now', path: '/book_now' },
  { text: 'Rewards', path: '/rewards' },
  { text: 'Volunteer', path: '/volunteer' },
];

const SearchComponent = () => {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [noResults, setNoResults] = useState(false);
  const [scrollBlocked, setScrollBlocked] = useState(false); // New state to track scroll blocking

  const openSearch = useCallback(async () => {
    if (search.trim() === '') {
      setResults([]);
      setSelectedResult(null);
      setNoResults(false);
      return;
    }
    setLoading(true);
    setScrollBlocked(true); // Block scrolling when search is opened
    try {
      const [productsResponse, eventsResponse] = await Promise.all([
        axios.get(`http://localhost:3001/api/filter-products?itemName=${search}`),
        axios.get(`http://localhost:3001/api/filter-events?eventName=${search}`)
      ]);
      const products = productsResponse.data;
      const events = eventsResponse.data;
      const combinedResults = [
        ...products.map(item => ({ type: 'Product', ...item })),
        ...events.map(item => ({ type: 'Event', ...item }))
      ];

      const menuMatch = menuItems.find(menuItem => menuItem.text.toLowerCase() === search.trim().toLowerCase());

      if (menuMatch) {
        setNoResults(false);
        setResults([]);
        setSelectedResult({ type: 'Menu', ...menuMatch });
      } else if (combinedResults.length === 0) {
        setNoResults(true);
        setSelectedResult(null);
      } else {
        setNoResults(false);
        setResults(combinedResults);
        setSelectedResult(combinedResults[0]);  // Optionally, set the first result as selected
      }
    } catch (error) {
      console.error("Error performing search:", error);
      setResults([]);
      setNoResults(true);
      setSelectedResult(null);  // Set selectedResult to null on error
    } finally {
      setLoading(false);
    }
  }, [search]);

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      openSearch();
    }
  };

  const closeSearch = () => {
    setSearch('');
    setResults([]);
    setSelectedResult(null);
    setNoResults(false);
    setScrollBlocked(false); // Allow scrolling when modal is closed
  };

  const handleResultClick = (result) => {
    setSelectedResult(result);
  };

  React.useEffect(() => {
    if (scrollBlocked) {
      document.body.style.overflow = 'hidden'; // Disable scrolling
    } else {
      document.body.style.overflow = ''; // Re-enable scrolling
    }
  }, [scrollBlocked]);

  return (
    <div style={{ position: 'relative' }}>
      <Input
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={handleKeyPress}
        endAdornment={
          loading ? <CircularProgress size={24} /> : (
            <IconButton onClick={closeSearch}><Clear /></IconButton>
          )
        }
        sx={{ marginBottom: '1rem', marginTop: '10px',
          maxWidth: { xs: '150px', sm: '250px', md: '160px', lg: '200px'}
        }}
      />
      {results.length > 0 && !noResults && (
        <Paper style={{ maxHeight: 400, overflow: 'auto', width: '100%', position: 'absolute', top: '100%', left: 0, zIndex: 10 }}>
          <List>
            {results.map((result, index) => (
              <React.Fragment key={index}>
                <ListItem button onClick={() => handleResultClick(result)}>
                  <ListItemText
                    primary={<strong>{result.type}</strong>}
                    secondary={result.name}
                  />
                </ListItem>
                {index < results.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
      {(results.length > 0 || noResults || selectedResult) && (
        <Box
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 20,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '1rem'
          }}
          onScroll={(e) => {
            if (scrollBlocked) {
              e.preventDefault();
              e.stopPropagation();
              alert('Please press the X above to close the search');
            }
          }}
        >
          <Paper style={{ padding: '2rem', maxWidth: '600px', width: '100%', position: 'relative' }}>
            <IconButton
              onClick={closeSearch}
              style={{ position: 'absolute', top: 10, right: 10 }}
            >
              <Clear />
            </IconButton>
            <h2 style={{ fontSize: '1.5rem' }}>Details for {selectedResult ? selectedResult.type : 'Search'}</h2>
            {noResults && (
              <Typography variant="body1" color="textSecondary" align="center">
                No data relevant found for "{search}". 
              </Typography>
            )}
            {!noResults && selectedResult && selectedResult.type === 'Product' && (
              <div>
                <strong>Leaf points to redeem:</strong> {selectedResult.itemName}
                <br />
                <strong>Leaf points:</strong> {selectedResult.leaves}
                <br />
                <strong><a href='http://localhost:3000/rewards'>View more Information at Rewards page</a></strong>  
              </div>
            )}
            {!noResults && selectedResult && selectedResult.type === 'Event' && (
              <div>
              <strong>Our Current Event:</strong> {selectedResult.eventName}
                <br />
                <strong>Date:</strong> {selectedResult.startDate}
                <br />
                <strong>Location:</strong> {selectedResult.location}
                <br />
                <strong>Description:</strong> {selectedResult.description}
                <br />
                <strong><a href='http://localhost:3000/events'>View more Information at Event page</a></strong> 
              </div>
            )}
            {!noResults && selectedResult && selectedResult.type === 'Menu' && (
              <Typography variant="body1" align="center">
                <strong>URL:</strong> <Link href={selectedResult.path}>{selectedResult.path}</Link>
              </Typography>
            )}
          </Paper>
        </Box>
      )}
    </div>
  );
};

export default SearchComponent;
