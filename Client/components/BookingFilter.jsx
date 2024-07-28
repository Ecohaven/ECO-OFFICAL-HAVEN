import React, { useState } from "react";
import { Button, Grid, TextField, MenuItem, InputLabel, FormControl, Select, Typography, CircularProgress } from '@mui/material';

const FilterDropdown = ({ handleFilter, handleReset }) => {
    const [status, setStatus] = useState('');
    const [numberOfPax, setNumberOfPax] = useState('');
    const [eventName, setEventName] = useState('');
    const [loading, setLoading] = useState(false);
    const [filtersApplied, setFiltersApplied] = useState(false);
    const [selectFilterMessage, setSelectFilterMessage] = useState(false);
    const [noDataMessages, setNoDataMessages] = useState([]);

    const applyFilters = async () => {
        if (!status && !numberOfPax && !eventName) {
            setSelectFilterMessage(true);
            return;
        }

        setLoading(true);
        setFiltersApplied(true);
        setSelectFilterMessage(false);
        setNoDataMessages([]);

        try {
            const params = {
                status: status || '',
                numberOfPax: numberOfPax || '',
                eventName: eventName || ''
            };
            const result = await handleFilter(params);

            const noDataMessages = [];

            if (status && !result.some(item => item.status === status)) {
                noDataMessages.push("No data available for the selected status.");
            }
            if (numberOfPax && !result.some(item => item.numberOfPax === numberOfPax)) {
                noDataMessages.push("No data available for the selected number of pax.");
            }
            if (eventName && !result.some(item => item.eventName === eventName)) {
                noDataMessages.push("No data available for the selected event name.");
            }

            setNoDataMessages(noDataMessages);

            const isDataAvailable = result.some(item =>
                (!status || item.status === status) &&
                (!numberOfPax || item.numberOfPax === numberOfPax) &&
                (!eventName || item.eventName === eventName)
            );

            setDataLoaded(isDataAvailable);
        } catch (error) {
            console.error('Error filtering bookings:', error);
            setDataLoaded(false);
        } finally {
            setLoading(false);
        }
    };

    const resetFilters = () => {
        setStatus('');
        setNumberOfPax('');
        setEventName('');
        handleReset();
        setFiltersApplied(false);
        setSelectFilterMessage(false);
        setNoDataMessages([]);
    };

    return (
        <div style={{ padding: '16px', borderRadius: '8px', marginTop: '20px' }}>
            <Grid container spacing={2} alignItems="center">
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
                <Grid item xs={12} sm={4} md={3}>
                    <TextField
                        label="Event Name"
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                        fullWidth
                        sx={{ maxWidth: 250 }}
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
            {selectFilterMessage && (
                <Typography variant="body2" color="red" sx={{ marginTop: '16px' }}>
                    Please select at least one filter to apply.
                </Typography>
            )}
            {filtersApplied && noDataMessages.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                    {noDataMessages.map((message, index) => (
                        <Typography key={index} variant="body2" color="textSecondary">
                            {message}
                        </Typography>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FilterDropdown;
