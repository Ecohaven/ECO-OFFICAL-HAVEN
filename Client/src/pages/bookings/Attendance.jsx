import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Button, Modal, Box, TextField, Typography, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../../../components/sidebar';
import QrScanner from 'react-qr-scanner';
import '../../style/attendance.css';

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
                if (!groupedCheckIns[checkIn.qrCodeText] || new Date(groupedCheckIns[checkIn.qrCodeText].checkInTime) < new Date(checkIn.checkInTime)) {
                    groupedCheckIns[checkIn.qrCodeText] = checkIn;
                }
            });

            Object.keys(groupedCheckIns).forEach(key => latestCheckIns.push(groupedCheckIns[key]));

            // Sort check-ins: "Not Checked" first (red), then "Checked-In" (green)
            latestCheckIns.sort((a, b) => {
                if (a.qrCodeStatus === 'Not Checked' && b.qrCodeStatus !== 'Not Checked') return -1;
                if (a.qrCodeStatus !== 'Not Checked' && b.qrCodeStatus === 'Not Checked') return 1;
                return 0;
            });

            setCheckIns(latestCheckIns);
            setAlertMessage(latestCheckIns.length === 0 ? 'No check-in records found.' : '');
        } catch (error) {
            console.error('Error fetching check-in records:', error);
            setAlertMessage('Failed to fetch check-in records.');
        }
    };

    const handleCheckInByText = async (e) => {
        e.preventDefault();

        if (!qrCodeText) {
            setError('QR Code Text is required');
            return;
        }
        setError('');

        // Data to send
        const dataToSend = { data: qrCodeText };

        try {
            const response = await axios.post('http://localhost:3001/checkin/checkin/text', dataToSend);

            if (response.status === 200) {
                const { message } = response.data;
                setModalMessage(message); // Show the success message from the response
                setModalType('success');
                setModalOpen(false); // Close the modal after successful check-in
                fetchCheckIns(selectedEventName); // Fetch check-ins after successful check-in
                navigate(`/staff/attendance?eventName=${encodeURIComponent(selectedEventName)}`);
            } else {
                setError('Unexpected response from server');
            }
        } catch (error) {
            console.error('Error during check-in:', error);
            setError('Failed to check-in');
        }
    };

    const handleScan = async (data) => {
        if (data && data.text) {
            const qrCodeData = data.text;

            setError('');

            try {
                const response = await axios.post('http://localhost:3001/checkin/checkin', { data: qrCodeData });

                if (response.status === 200) {
                    // Check the qrCodeStatus from the response data
                    if (response.data.qrCodeStatus === 'Checked-In') {
                        setModalMessage('This QR Code has already been checked in.');
                    } else {
                        setModalMessage('Check in successful ');
                        setModalType('success');
                        handleOpenModal('success'); 
                    }
                    fetchCheckIns(selectedEventName); // Refresh check-ins after successful scan
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

    return (
        <div className="checkin-page">
            <Sidebar />
            <div className="checkin-container">
                <div className="checkins-list">
                    <h2 style={{ marginTop: '5px', textAlign: 'left' }}>Check-In Records</h2>
                    <div className="filter-controls">
                        <FormControl variant="outlined" style={{ marginRight: '10px', marginTop: '5px', width: '200px' }}>
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
                        <Button variant="contained" onClick={() => fetchCheckIns(selectedEventName)} style={{ marginLeft: '10px', marginTop: '15px' ,backgroundColor:'grey'}}>
                            Refresh
                        </Button>
                        <Button variant="contained"  onClick={() => handleOpenModal('text')} style={{ marginLeft: '10px', marginTop: '15px', backgroundColor:'green' }}>
                            Check-In by Text 
                        </Button>
                        <Button variant="contained" onClick={() => handleOpenModal('scan')} style={{ marginLeft: '10px', marginTop: '15px' ,backgroundColor:'darkgreen'}}>
                            Scan QR Code
                        </Button>
                    </div>
                    {alertMessage && (
                        <Typography variant="body1" color="textSecondary" style={{ textAlign: 'center', marginTop: '10px' }}>
                            {alertMessage}
                        </Typography>
                    )}
                    <TableContainer component={Paper} sx={{ maxWidth: '100%', margin: 'auto' }}>
    <Table>
        <TableHead style={{ backgroundColor: 'green' }}>
            <TableRow>
                <TableCell style={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                <TableCell style={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                <TableCell style={{ color: 'white', fontWeight: 'bold' }}>QR Code Text</TableCell>
                <TableCell style={{ color: 'white', fontWeight: 'bold' }}>Event Name</TableCell>
                <TableCell style={{ color: 'white', fontWeight: 'bold' }}>Check-In Time</TableCell>
                <TableCell style={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                <TableCell style={{ color: 'white', fontWeight: 'bold' }}>Leaf Points</TableCell>
                <TableCell style={{ color: 'white', fontWeight: 'bold' }}>Guest</TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
            {checkIns.map((checkIn, index) => (
                <TableRow key={index}>
                    <TableCell>{checkIn.id || 'NA'}</TableCell>
                    <TableCell>{checkIn.Name || 'NA'}</TableCell>
                    <TableCell>{checkIn.qrCodeText || 'NA'}</TableCell>
                    <TableCell>{checkIn.eventName || 'NA'}</TableCell>
                    <TableCell>{checkIn.checkInTime || 'NA'}</TableCell>
                    <TableCell
                        style={{
                            color: checkIn.qrCodeStatus === 'Checked-In' ? 'green' : 'red'
                        }}
                    >
                        {checkIn.qrCodeStatus || 'NA'}
                    </TableCell>
                    <TableCell>{checkIn.leafPoints || 'NA'}</TableCell>
                    <TableCell>{checkIn.paxName || 'NA'}</TableCell> {/* Updated cell */}
                </TableRow>
            ))}
        </TableBody>
    </Table>
</TableContainer>
                </div>
{/*QR CODE SCANNER */}
 <Modal open={modalOpen} onClose={handleCloseModal}>
    <Box sx={{ width: 400, bgcolor: 'background.paper', p: 4, borderRadius: 2, margin: 'auto', marginTop: '100px' }}>
        <Typography variant="h6" component="h2">
            {modalType === 'text' ? 'Check-In by QR Code Text' : 'Scan QR Code'}
        </Typography>
        {modalType === 'text' ? (
            <Box component="form" onSubmit={handleCheckInByText} sx={{ mt: 2 }}>
                <TextField
                    fullWidth
                    label="QR Code Text"
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
            <QrScanner
                onScan={handleScan}
                onError={(error) => setError(`Scan Error: ${error.message}`)}
                style={{ width: '100%' }}
            />
        )}
        {modalMessage && (
            <Typography variant="body1" color={modalType === 'success' ? 'green' : modalType === 'warning' ? 'orange' : 'red'} sx={{ mt: 2 }}>
                {modalMessage}
            </Typography>
        )}
        <Button variant="outlined" onClick={handleCloseModal} sx={{ mt: 2 }} style={{backgroundColor:'red',color:'white'}}>
            Close
        </Button>
    </Box>
</Modal>




            </div>
        </div>
    );
};

export default CheckInPage;
