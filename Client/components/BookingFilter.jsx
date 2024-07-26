import React, { useState } from "react";
import { Button, Grid, TextField, MenuItem, InputLabel, FormControl, Select, Typography, CircularProgress } from '@mui/material';

const FilterDropdown = ({ handleFilter, handleReset, dataAvailable }) => {
    const [date, setDate] = useState('');
    const [status, setStatus] = useState('');
    const [numberOfPax, setNumberOfPax] = useState('');
    const [loading, setLoading] = useState(false);
    const [filtersApplied, setFiltersApplied] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(true); // To track if data is loaded

    const applyFilters = async () => {
        setLoading(true);
        setFiltersApplied(true);
        setDataLoaded(false); // Set to false while data is being fetched
        try {
            const params = {
                date: date || '',
                status: status || '',
                numberOfPax: numberOfPax || ''
            };
            const result = await handleFilter(params);
            // Assume handleFilter returns data or some status indicating availability
            setDataLoaded(result.dataAvailable); // Set based on actual result
        } catch (error) {
            console.error('Error filtering bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetFilters = () => {
        setDate('');
        setStatus('');
        setNumberOfPax('');
        handleReset();
        setFiltersApplied(false);
        setDataLoaded(true); // Reset data loaded state
    };

    return (
        <div style={{ padding: '16px', borderRadius: '8px', marginTop: '20px' }}>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4} md={3}>
                    <TextField
                        type="date"
                        label="Date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        fullWidth
                        sx={{ maxWidth: 250 }}
                        InputLabelProps={{ shrink: true }}
                        variant="outlined"
                        InputProps={{
                            sx: {
                                border: '1px solid #ccc',
                                padding: '0',
                                height: '56px',
                            }
                        }}
                    />
                </Grid>
                <Grid item xs={12} sm={4} md={3}>
                    <FormControl fullWidth sx={{ maxWidth: 250 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            variant="outlined"
                            sx={{
                                fontSize: '1rem',
                                padding: '8px',
                                border: '1px solid #ccc',
                                boxShadow: 'none',
                                height: '56px',
                            }}
                        >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="Active">Active</MenuItem>
                            <MenuItem value="Cancelled">Cancelled</MenuItem>
                            <MenuItem value="Attended">Attended</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={4} md={3}>
                    <FormControl fullWidth sx={{ maxWidth: 250 }}>
                        <InputLabel>Number of Pax</InputLabel>
                        <Select
                            value={numberOfPax}
                            onChange={(e) => setNumberOfPax(e.target.value)}
                            variant="outlined"
                            sx={{
                                fontSize: '1rem',
                                padding: '8px',
                                border: '1px solid #ccc',
                                boxShadow: 'none',
                                height: '56px',
                            }}
                        >
                            <MenuItem value="">Select</MenuItem>
                            {[1, 2, 3, 4, 5].map(num => (
                                <MenuItem key={num} value={num}>
                                    {num}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={3} style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <Button
                        onClick={applyFilters}
                        variant="contained"
                        sx={{
                            backgroundColor: '#007bff',
                            color: 'white',
                            borderRadius: '4px',
                            padding: '8px 16px',
                            fontSize: '0.875rem',
                            '&:hover': {
                                backgroundColor: '#0056b3',
                            },
                        }}
                    >
                        {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Apply Filter'}
                    </Button>
                    <Button
                        onClick={resetFilters}
                        variant="outlined"
                        sx={{
                            borderColor: '#ddd',
                            color: '#333',
                            borderRadius: '4px',
                            padding: '8px 16px',
                            fontSize: '0.875rem',
                            '&:hover': {
                                borderColor: '#bbb',
                            },
                        }}
                    >
                        Reset
                    </Button>
                </Grid>
            </Grid>
            {filtersApplied && !dataLoaded && (
                <Typography variant="body2" color="textSecondary" sx={{ marginTop: '16px' }}>
                    No data is available for the selected filters.
                </Typography>
            )}
        </div>
    );
};

export default FilterDropdown;
