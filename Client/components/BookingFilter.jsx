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
                noDataMessages.push(`No data available for ${numberOfPax} pax.`);
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
            handleShowAlert('No Available data for the filter selected:', error);
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
                <Grid item xs={5} sm={3.5} md={2}>
                    <FormControl fullWidth sx={{ maxWidth: 250 }}>
                        <InputLabel style={{color:'black',fontWeight:'400'}}>Status</InputLabel>
                        <Select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            variant="outlined"
                            sx={{
                                fontSize: '1rem',
                                padding: '8px',
                                border: '1px solid green',
                                boxShadow: 'none',
                                height: '56px',
                            }}
                        >
                            <MenuItem value="Active" sx={{ '&:hover': { backgroundColor: 'lightgreen' } }}>Active</MenuItem>
                            <MenuItem value="Cancelled" sx={{ '&:hover': { backgroundColor: 'lightgreen' } }}>Cancelled</MenuItem>
                            <MenuItem value="Attended" sx={{ '&:hover': { backgroundColor: 'lightgreen' } }}>Attended</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={4} sm={4} md={2}>
                    <FormControl fullWidth sx={{ maxWidth: 250 }}>
                        <InputLabel style={{color:'black',fontWeight:'400'}} >Number of Pax</InputLabel>
                        <Select
                            value={numberOfPax}
                            onChange={(e) => setNumberOfPax(e.target.value)}
                            variant="outlined"
                            sx={{
                                fontSize: '1rem',
                                padding: '8px',
                                border: '1px solid green',
                                boxShadow: 'none',
                                height: '56px',
                            }}
                        >
                            <MenuItem value="" sx={{ '&:hover': { backgroundColor: 'lightgreen' } }}>Select</MenuItem>
                            {[1, 2, 3, 4, 5].map(num => (
                                <MenuItem key={num} value={num} sx={{ '&:hover': { backgroundColor: 'lightgreen' } }}>
                                    {num}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={5} sm={4} md={2}>
                    <TextField
                        label="Event Name"
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                        fullWidth
                        sx={{ maxWidth: 250, color: 'black' }}
                        variant="outlined"
                        InputProps={{
                            sx: {
                                border: '1px solid green',
                                padding: '0',
                                height: '56px',
                                color: 'black',
                            },
                        }}
                        InputLabelProps={{
                            sx: {
                                color: 'black', 
                            },
                        }}
                    />
                </Grid>
                <Grid item xs={8} md={3} style={{ display: 'flex', gap: '12px', justifyContent: 'flex-start' }}>
                    <Button
                        onClick={applyFilters}
                        variant="contained"
                        sx={{
                            backgroundColor: 'blue',
                            color: 'white',
                            borderRadius: '4px',
                            padding: '8px 16px',
                            fontSize: '0.875rem',
                            '&:hover': {
                                backgroundColor: 'green',
                            },
                        }}
                    >
                        {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Apply Filter'}
                    </Button>
                    <Button
                        onClick={resetFilters}
                        sx={{
                            backgroundColor: 'red',
                            color: 'white',
                            borderRadius: '4px',
                            padding: '8px 16px',
                            fontSize: '0.875rem',
                            '&:hover': {
                                backgroundColor: 'green',
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
