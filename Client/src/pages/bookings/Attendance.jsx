import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Button, Modal, Box, TextField, Typography, Select, MenuItem, FormControl, InputLabel, IconButton
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import QrScanner from 'react-qr-scanner';
import '../../style/attendance.css';
import { useNavigate, useLocation } from 'react-router-dom';

const CheckInPage = () => {
    const [checkIns, setCheckIns] = useState([]);
    const [qrCodeText, setQrCodeText] = useState('');
    const [error, setError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalType, setModalType] = useState('');
    const [eventNames, setEventNames] = useState([]);
    const [selectedEventName, setSelectedEventName] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [totalCheckedIn, setTotalCheckedIn] = useState(0);
    const [totalNotCheckedIn, setTotalNotCheckedIn] = useState(0);
    const [totalCancelled, setTotalCancelled] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const eventNameFromQuery = queryParams.get('eventName');
        if (eventNameFromQuery) {
            setSelectedEventName(eventNameFromQuery);
            fetchCheckIns(eventNameFromQuery);
        }
        fetchEventNames();
    }, [location.search]);

    const fetchEventNames = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/event-names');
            setEventNames(response.data.map(event => event.eventName));
        } catch (error) {
            console.error('Error fetching event names:', error);
        }
    };

   const fetchCheckIns = async (eventName) => {
    try {
        const response = await axios.get('http://localhost:3001/checkin/check-eventName', {
            params: { eventName }
        });

        const latestCheckIns = [];
        const groupedCheckIns = {};


        response.data.checkIns.forEach(checkIn => {
            if (!groupedCheckIns[checkIn.bookingId]) {
                groupedCheckIns[checkIn.bookingId] = [];
            }
            groupedCheckIns[checkIn.bookingId].push(checkIn);

        });

        // Flatten and sort the check-ins
        Object.values(groupedCheckIns).forEach(group => {
            group.sort((a, b) => {
                // Prioritize Not Checked-In status
                if (a.qrCodeStatus !== b.qrCodeStatus) {
                    return a.qrCodeStatus === 'Not Checked' ? -1 : 1;
                }
                // Sort by Check-In Time within the same status
                return new Date(b.checkInTime) - new Date(a.checkInTime);
            });
            latestCheckIns.push(...group);
        });

        setCheckIns(latestCheckIns);
        setAlertMessage(latestCheckIns.length === 0 ? 'No check-in records found.' : '');
        
        const checkedInCount = latestCheckIns.filter(c => c.qrCodeStatus === 'Checked-In').length;
        const notCheckedInCount = latestCheckIns.length - checkedInCount;
        setTotalCheckedIn(checkedInCount);
        setTotalNotCheckedIn(notCheckedInCount);


    } catch (error) {
        console.error('Error fetching check-in records:', error);
        setAlertMessage('Failed to fetch check-in records.');
    }
};

    const handleScan = async (data) => {
        if (data && data.text) {
            const qrCodeData = data.text;

            setError('');

            try {
                const response = await axios.post('http://localhost:3001/checkin/checkin', { data: qrCodeData });

                if (response.status === 200) {
                    const { qrCodeStatus } = response.data;
                    if (qrCodeStatus === 'Checked-In') {
                        setModalMessage('This QR Code has already been checked in.');
                    } else {
                        setModalMessage('Check in successful');
                        setModalType('success');
                        handleOpenModal('success'); 
                    }
                    fetchCheckIns(selectedEventName);
                } else {
                    setError('Unexpected response from server');
                }
            } catch (error) {
                console.error('Error during check-in:', error);

                if (error.response) {
                    if (error.response.status === 404) {
                        setError('Record not found. Please check the details.');
                    } else if (error.response.status === 400) {
                        setError('Invalid data provided. Please ensure all fields are correct.');
                    } else {
                        setError('An unexpected error occurred. Please try again later.');
                    }
                } else if (error.request) {
                    setError('Network error. Please check your connection and try again.');
                } else {
                    setError('An error occurred while processing the request.');
                }
            }
        } else {
            setError('Invalid QR Code data. Please try scanning again.');
        }
    };

    const handleOpenModal = (type) => {
        setError('');
        setModalType(type);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setQrCodeText('');
    };

    const handleDropdownChange = (event) => {
        const newEventName = event.target.value;
        setSelectedEventName(newEventName);
        fetchCheckIns(newEventName);
        navigate(`/staff/attendance?eventName=${encodeURIComponent(newEventName)}`);
    };

 
    const filteredCheckIns = checkIns.filter(checkIn => {
        return (
            checkIn.bookingId?.toLowerCase().includes(searchTerm) ||
            checkIn.paxName?.toLowerCase().includes(searchTerm) ||
            checkIn.qrCodeText?.toLowerCase().includes(searchTerm) ||
            checkIn.eventName?.toLowerCase().includes(searchTerm)
        );
    });

    return (
        <div className="checkin-page" style={{ padding: '20px' }}>
            <div className="checkin-container">
                <div className="checkins-list">
                  <h2 className="h2" style={{textAlign:'left'}}>Check In (Attendance)</h2>
                    <div className="filter-controls" style={{ marginBottom: '20px' }}>
                        <FormControl variant="outlined" style={{ marginRight: '10px', width: '200px' }}>
                            <InputLabel id="eventNameFilter-label">Event Name</InputLabel>
                            <Select
                                labelId="eventNameFilter-label"
                                id="eventNameFilter"
                                value={selectedEventName}
                                onChange={handleDropdownChange}
                                label="Event Name"
                            >
                                {eventNames.map((eventName, index) => (
                                    <MenuItem key={index} value={eventName}>
                                        {eventName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <IconButton onClick={() => fetchCheckIns(selectedEventName)} style={{ marginLeft: '10px',marginTop:'10px',color:'green' }}>
                            <RefreshIcon />
                        </IconButton>
                        <Button variant="contained" onClick={() => handleOpenModal('text')} style={{ marginLeft: '10px',marginTop:'10px', backgroundColor: 'green', color: 'white' }}>
                            Check-In by Text
                        </Button>
                        <Button variant="contained" onClick={() => handleOpenModal('scan')} style={{ marginLeft: '10px',marginTop:'10px', backgroundColor: 'darkgreen', color: 'white' }}>
                            Scan QR Code
                        </Button>
        
                    </div>
                    {alertMessage && (
                        <Typography variant="body1" color="textSecondary" style={{ textAlign: 'center', marginBottom: '20px' }}>
                            {alertMessage}
                        </Typography>
                    )}
                    <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 2,
                flexWrap: 'wrap',
                padding: 2,
                marginBottom: 2
            }}
        >
        <Box
                sx={{
                    padding: 2,
                    borderRadius: 1,
                    backgroundColor: 'red',
                    color:'white',
                    textAlign: 'center',
                    width: '200px',
                    boxShadow: 1
                }}
            >
                <Typography variant="body1">
                    <strong>Total Not Checked-In:</strong> {totalNotCheckedIn}
                </Typography>
            </Box>
            <Box
                sx={{
                    padding: 2,
                    borderRadius: 1,
                    backgroundColor: 'green',
                    color:'white',
                    textAlign: 'center',
                    width: '200px',
                    boxShadow: 1
                }}
            >
                <Typography variant="body1">
                    <strong>Total Checked-In:</strong> {totalCheckedIn}
                </Typography>
            </Box>
    
        </Box>
                   <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
   <i style={{color:"green"}}>Check in by Qr Code text or Guest Name, "-" represents no data  </i>
    <Table>
        <TableHead style={{ backgroundColor: 'green' }}>
            <TableRow>
                <TableCell style={{ color: 'white', fontWeight: 'bold' }}></TableCell>
                <TableCell style={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                <TableCell style={{ color: 'white', fontWeight: 'bold' }}>Account Name</TableCell>
                <TableCell style={{ color: 'white', fontWeight: 'bold' }}>Guest Name</TableCell>
                <TableCell style={{ color: 'white', fontWeight: 'bold' }}>Event Name</TableCell>
                <TableCell style={{ color: 'white', fontWeight: 'bold' }}>Leaf Points</TableCell>
                <TableCell style={{ color: 'white', fontWeight: 'bold' }}>QR Code Text</TableCell>
                <TableCell style={{ color: 'white', fontWeight: 'bold' }}>Check-In Time</TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
            {filteredCheckIns.map((checkIn, index) => (
                <TableRow key={index}>
                    <TableCell></TableCell>
                    <TableCell
                        style={{
                            color: checkIn.qrCodeStatus === 'Checked-In' ? 'green' : 'red',
                            fontWeight:'bold'
                        }}
                    >
                        {checkIn.qrCodeStatus || '-'}
                    </TableCell>
                    <TableCell>{checkIn.Name || '-'}</TableCell>
                    <TableCell>{checkIn.paxName || '-'}</TableCell>
                    <TableCell>{checkIn.eventName || '-'}</TableCell>
                    <TableCell>{checkIn.leafPoints || '-'}</TableCell>
                    <TableCell>{checkIn.qrCodeText || '-'}</TableCell>
                    {/* Conditionally render Check-In Time */}
                    {checkIn.qrCodeStatus === 'Checked-In' ? (
                        <TableCell style={{fontWeight:'bold'}}>{checkIn.checkInTime ? new Date(checkIn.checkInTime).toLocaleString() : '-'}</TableCell>
                    ) : (
                        <TableCell>-</TableCell>
                    )}
                </TableRow>
            ))}
        </TableBody>
    </Table>
</TableContainer>



                </div>
                {/* QR CODE SCANNER */}
                <Modal open={modalOpen} onClose={handleCloseModal}>
                    <Box sx={{ width: 400, bgcolor: 'background.paper', p: 4, borderRadius: 2, margin: 'auto', marginTop: '100px', textAlign: 'center' }}>
                        <Typography variant="h6" component="h2">
                            {modalType === 'text' ? 'Check-In by Text' : 'Scan QR Code'}
                        </Typography>
                        {modalType === 'text' ? (
                            <Box component="form" onSubmit={handleCheckInByText} sx={{ mt: 2 }}>
                                <TextField
                                    fullWidth
                                    label="QR Code Text / Guest Name"
                                    value={qrCodeText}
                                    onChange={(e) => setQrCodeText(e.target.value)}
                                    error={!!error}
                                    helperText={error}
                                />
                                <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
                                    Submit
                                </Button>
                            </Box>
                        ) : (
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <QrScanner
                                    onScan={handleScan}
                                    onError={(error) => setError(`Scan Error: ${error.message}`)}
                                    style={{ width: '100%' }}
                                />
                            </Box>
                        )}
                        {modalMessage && (
                            <Typography variant="body1" color={modalType === 'success' ? 'green' : modalType === 'warning' ? 'orange' : 'red'} sx={{ mt: 2 }}>
                                {modalMessage}
                            </Typography>
                        )}
                        <Button variant="outlined" onClick={handleCloseModal} sx={{ mt: 2 }} style={{ backgroundColor: 'red', color: 'white' }}>
                            Close
                        </Button>
                    </Box>
                </Modal>
            </div>
        </div>
    );
};

export default CheckInPage;
