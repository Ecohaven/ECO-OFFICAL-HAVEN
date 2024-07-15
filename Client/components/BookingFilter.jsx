import React, { useState, useEffect } from 'react';
import { Grid, InputLabel, Select, MenuItem, Button, FormControl, TextField } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import ClearIcon from '@mui/icons-material/Clear';
import axios from 'axios';
import '../src/style/alert.css';

const FilterDropdown = ({ handleFilter }) => {
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedEventName, setSelectedEventName] = useState('');
    const [eventNames, setEventNames] = useState([]); // State to store event names
    const [alertMessage, setAlertMessage] = useState('');
    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
        let timeout;
        if (showAlert) {
            timeout = setTimeout(() => {
                setShowAlert(false);
            }, 3000);
        }
        return () => clearTimeout(timeout);
    }, [showAlert]);

    useEffect(() => {
        // Fetch event names from API
        const fetchEventNames = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/event-names');
                setEventNames(response.data.map(event => event.eventName)); 
            } catch (error) {
                console.error('Error fetching event names:', error);
    
            }
        };

        fetchEventNames();
    }, []); 

    const handleApplyFilter = () => {
        if (!selectedDate && !selectedStatus && !selectedEventName) {
            setAlertMessage('Please select at least one filter criteria.');
            setShowAlert(true);
            return;
        }

        handleFilter({
            date: selectedDate,
            status: selectedStatus,
            eventName: selectedEventName
        });
    };

    const handleResetFilters = async () => {
        setSelectedDate('');
        setSelectedStatus('');
        setSelectedEventName('');

        try {
            const response = await axios.get('http://localhost:3001/api/event-names');
            setEventNames(response.data.map(event => event.eventName));
        } catch (error) {
            console.error('Error fetching event names after reset:', error);
            // Handle error or set default event names
        }

        handleFilter({
            date: '',
            status: '',
            eventName: ''
        });
    };

    const handleCloseAlert = () => {
        setShowAlert(false);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid container spacing={2} alignItems="center" style={{ justifyContent: 'flex-start', display: 'flex', width: '80%', marginTop: '30px', marginBottom: '-70px', marginLeft: '170px' }}>
                <Grid item xs={12} sm={6} md={3}>
                    <FormControl style={{width:'150px',textAlign:'left'}}>
                        <TextField
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            inputProps={{ pattern: '\\d{4}-\\d{2}-\\d{2}', title: 'DD-MM-YYYY' }}
                        />
                    </FormControl>
                </Grid>

                <Grid item xs={12} sm={5} md={2.5}>
                    <FormControl style={{width:'120px',textAlign:'left',marginLeft:'-50px'}}>
                        <InputLabel id="event-name-filter-label">Event Name</InputLabel>
                        <Select
                            labelId="event-name-filter-label"
                            id="event-name-filter"
                            value={selectedEventName}
                            onChange={(e) => setSelectedEventName(e.target.value)}
                            style={{ minWidth: '170px' }}
                            fullWidth
                            MenuProps={{ PaperProps: { style: { maxWidth: 120 } } }} // Ensure vertical display
                        >
                            {eventNames.map((eventName) => (
                                <MenuItem key={eventName} value={eventName}>{eventName}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} sm={5} md={2}>
                    <FormControl style={{width:'150px',textAlign:'left',marginLeft:'-50px'}}>
                        <InputLabel id="status-filter-label">Status</InputLabel>
                        <Select
                            labelId="status-filter-label"
                            id="status-filter"
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            style={{ minWidth: '130px' }}
                            fullWidth
                            MenuProps={{ PaperProps: { style: { maxWidth: 150 } } }} // Ensure vertical display
                        >

                            <MenuItem value="Active">Active</MenuItem>
                            <MenuItem value="Cancelled">Cancelled</MenuItem>
                            <MenuItem value="Attended">Attended</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item style={{marginTop:'-70px',marginLeft:'530px'}}>
                    <Button
                        variant="contained"
                        onClick={handleApplyFilter}
                        style={{ backgroundColor: 'blue', color: 'white', fontWeight: 'bold', textTransform: 'none', marginRight: '10px',height:'50px' }}
                    >
                        Apply Filter
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleResetFilters}
                        style={{ backgroundColor: 'red', color: 'white', fontWeight: 'bold', textTransform: 'none',height:'50px' }}
                    >
                        Reset
                    </Button>
                </Grid>

                {showAlert && (
                    <div className={`alert`}>
                        <span className="message">{alertMessage}</span>
                        <button className="close-button" onClick={handleCloseAlert}><ClearIcon fontSize="small" /></button>
                    </div>
                )}
            </Grid>
        </LocalizationProvider>
    );
};

export default FilterDropdown;
