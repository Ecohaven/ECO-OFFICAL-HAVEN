import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, TextField, Typography, Alert } from '@mui/material';

function SearchVolunteers() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:3001/search/volunteers/search', {
        params: { query }, // Send the single search query
      });
      setResults(response.data);
    } catch (error) {
      setError('Error fetching volunteers');
      console.error('Error fetching volunteers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h6">Search Volunteers</Typography>
      <TextField
        fullWidth
        label="Search by Name or Interest"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button variant="contained" onClick={handleSearch} fullWidth>
        Search
      </Button>

      {loading && <Typography>Loading...</Typography>}
      {error && <Alert severity="error">{error}</Alert>}
      {results.length === 0 && !loading && !error && <Typography>No results found.</Typography>}
      {results.length > 0 && (
        <Box>
          {results.map((volunteer) => (
            <Box key={volunteer.id} sx={{ mb: 2, p: 2, border: '1px solid #ddd' }}>
              <Typography variant="h6">{volunteer.name}</Typography>
              <Typography>Email: {volunteer.email}</Typography>
              <Typography>Phone: {volunteer.phone}</Typography>
              <Typography>Interest: {volunteer.interest}</Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default SearchVolunteers;
