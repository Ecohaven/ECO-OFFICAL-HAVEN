import React, { useState, useEffect } from 'react';
import { Button, Grid, TextField, MenuItem, InputLabel, FormControl, Select } from '@mui/material';
import axios from 'axios';

const FilterDropdown = ({ handleFilter, handleReset }) => {
    const [date, setDate] = useState('');
    const [status, setStatus] = useState('');
    const [numberOfPax, setNumberOfPax] = useState('');
    const [selectedEventName, setSelectedEventName] = useState('');
    const [loading, setLoading] = useState(false);
    const [eventNames, setEventNames] = useState([]);

    // Fetch event names from the API
    useEffect(() => {
        const fetchEventNames = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/filter/event-names/');
                setEventNames(response.data); // Assuming response.data contains the list of event names
            } catch (error) {
                console.error('Error fetching event names:', error);
            }
        };

        fetchEventNames();
    }, []);

    const applyFilters = async () => {
        setLoading(true);
        try {
            const params = {
                date: date || '',
                status: status || '',
                numberOfPax: numberOfPax || '',
                eventName: selectedEventName || ''
            };

            await handleFilter(params);
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
        setSelectedEventName('');
        handleReset();
    };

    const handleDropdownChange = (event) => {
        setSelectedEventName(event.target.value);
    };

    return (
        <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'white', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', color: 'black' }}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        type="date"
                        label="Date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        fullWidth
                        sx={{ maxWidth: 250 }}
                        InputLabelProps={{ shrink: true }}
                        variant="outlined"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth sx={{ maxWidth: 250 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            variant="outlined"
                        >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="Active">Active</MenuItem>
                            <MenuItem value="Cancelled">Cancelled</MenuItem>
                            <MenuItem value="Attended">Attended</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth sx={{ maxWidth: 250 }}>
                        <InputLabel>Number of Pax</InputLabel>
                        <Select
                            value={numberOfPax}
                            onChange={(e) => setNumberOfPax(e.target.value)}
                            variant="outlined"
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
                <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth sx={{ maxWidth: 250 }}>
                        <InputLabel id="eventNameFilter-label">Event Name</InputLabel>
                        <Select
                            labelId="eventNameFilter-label"
                            id="eventNameFilter"
                            value={selectedEventName}
                            onChange={handleDropdownChange}
                            label="Event Name"
                        >
                            <MenuItem value="">All</MenuItem>
                            {eventNames.map((eventName, index) => (
                                <MenuItem key={index} value={eventName}>
                                    {eventName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
            <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
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
                    Apply Filter
                </Button>
            </div>
        </div>
    );
};

export default FilterDropdown;
