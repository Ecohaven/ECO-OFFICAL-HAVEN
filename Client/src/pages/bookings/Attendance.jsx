import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Button, Modal, Box, TextField, Typography, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
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
    const [eventNameFilter, setEventNameFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [eventIdFilter, setEventIdFilter] = useState('');
    const [qrCodeStatusFilter, setQrCodeStatusFilter] = useState(''); // Corrected state name
    const [alertMessage, setAlertMessage] = useState('');

    useEffect(() => {
        fetchEventNames();
        fetchCheckIns();
    }, [eventNameFilter, dateFilter, eventIdFilter, qrCodeStatusFilter]);

    const fetchEventNames = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/event-names');
            setEventNames(response.data.map(event => event.eventName));
        } catch (error) {
            console.error('Error fetching event names:', error);
        }
    };

    const fetchCheckIns = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/api/filter-records`, {
                params: {
                    eventName: eventNameFilter,
                    date: dateFilter,
                    eventId: eventIdFilter,
                    qrCodeStatus: qrCodeStatusFilter
                }
            });

            // Group check-ins by QR code text and keep only the latest checked record
            const latestCheckIns = [];
            const groupedCheckIns = {};

            response.data.checkIns.forEach(checkIn => {
                if (!groupedCheckIns[checkIn.qrCodeText] || new Date(groupedCheckIns[checkIn.qrCodeText].checkInTime) < new Date(checkIn.checkInTime)) {
                    groupedCheckIns[checkIn.qrCodeText] = checkIn;
                }
            });

            Object.keys(groupedCheckIns).forEach(key => latestCheckIns.push(groupedCheckIns[key]));

            setCheckIns(latestCheckIns);

            if (latestCheckIns.length === 0) {
                setAlertMessage('No check-in records found.');
            } else {
                setAlertMessage('');
            }
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

        try {
            const response = await axios.post(`http://localhost:3001/checkin/check-in/${qrCodeText}`);
            setModalMessage('Check-in by QR Code Text successful');
            setModalOpen(false);

            fetchCheckIns();
        } catch (error) {
            console.error('Error during check-in:', error);
            setError('Failed to check-in');
        }
    };

    const handleScan = async (data) => {
        if (data) {
            setQrCodeText(data.text);
            setError('');

            try {
                const response = await axios.post(`http://localhost:3001/checkin/checkinbycam`, { qrCodeText: data.text });
                setModalMessage('Check-in by QR Code successful');
                setModalOpen(false);

                fetchCheckIns();
            } catch (error) {
                console.error('Error during check-in:', error);
                setError('Qr Code invalid, Staff please check booking records');
            }
        }
    };

    const handleError = (err) => {
        console.error('Error during QR code scan:', err);
        setError('Failed to scan QR code');
        setQrCodeText(''); // Reset qrCodeText state on error
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

    const handleResetFilters = () => {
        setEventNameFilter('');
        setDateFilter('');
        setEventIdFilter('');
        setQrCodeStatusFilter(''); // Reset qrCodeStatusFilter
    };

    const handleSearchEvent = (event) => {
        setEventNameFilter(event.target.value);
    };

    const handleStatusChange = (event) => {
        setQrCodeStatusFilter(event.target.value); // Corrected to setQrCodeStatusFilter
    };

    const handleCancelModal = () => {
        setModalOpen(false);
        setQrCodeText('');
    };

    return (
        <div className="checkin-page">
            <Sidebar />
            <div className="checkin-container">
                <div className="checkins-list">
                    <h2 style={{ marginTop: '5px', textAlign: 'left' }}>Check-In Records</h2>
                    <div className="filter-controls">
                        <TextField
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            variant="outlined"
                            style={{ marginRight: '10px', marginTop: '5px', marginBottom: '10px', height: '45px' }}
                        />
                        <TextField
                            value={eventNameFilter}
                            onChange={handleSearchEvent}
                            label="Search Event"
                            variant="outlined"
                            style={{ marginRight: '10px', marginTop: '5px', height: '45px' }}
                        />
                        <FormControl variant="outlined" style={{ height: '45px', textAlign: 'center' }} >
                            <InputLabel id="qrCodeStatusFilter-label" style={{ marginTop: '5px' }}>Status</InputLabel>
                            <Select
                                labelId="qrCodeStatusFilter-label"
                                id="qrCodeStatusFilter"
                                value={qrCodeStatusFilter}
                                onChange={handleStatusChange}
                                label="Status"
                                sx={{ mb: 1, width: '110px', marginRight: '10px', marginTop: '5px' }}
                                MenuProps={{
                                    PaperProps: {
                                        style: {
                                            width: '120px',
                                            textAlign: 'left',
                                        },
                                    },
                                }}
                            >
                                <MenuItem value="Checked">Checked</MenuItem>
                                <MenuItem value="Not Checked">Not Checked</MenuItem>
                                <MenuItem value="Cancelled">Cancelled</MenuItem>
                            </Select>
                        </FormControl>

                        <Button variant="contained" color="secondary" onClick={handleResetFilters} style={{ marginLeft: '10px', backgroundColor: 'red', marginTop: '15px' }}>
                            Reset
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
                                    <TableCell style={{ color: 'white', fontWeight: 'bold' }}>QR Code Text</TableCell>
                                    <TableCell style={{ color: 'white', fontWeight: 'bold' }}>Check-In Time</TableCell>
                                    <TableCell style={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                                    <TableCell style={{ color: 'white', fontWeight: 'bold' }}>Associated Booking ID</TableCell>
                                    <TableCell style={{ color: 'white', fontWeight: 'bold' }}>Leaf Points</TableCell>
                                    <TableCell style={{ color: 'white', fontWeight: 'bold' }}>Event Name</TableCell>
                                    <TableCell style={{ color: 'white', fontWeight: 'bold' }}>Event Id</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {checkIns.length > 0 ? (
                                    checkIns.map((checkIn) => (
                                        <TableRow key={checkIn.id}>
                                            <TableCell>{checkIn.id}</TableCell>
                                            <TableCell>{checkIn.qrCodeText}</TableCell>
                                            <TableCell>{new Date(checkIn.checkInTime).toLocaleString()}</TableCell>
                                            <TableCell>
                                                <span style={{ fontWeight: 'bold', color: checkIn.qrCodeStatus === 'Checked' ? 'green' : (checkIn.qrCodeStatus === 'Cancelled' ? 'red' : 'inherit') }}>
                                                    {checkIn.qrCodeStatus}
                                                </span>
                                            </TableCell>
                                            <TableCell>{checkIn.bookingId}</TableCell>
                                            <TableCell>{checkIn.leafPoints}</TableCell>
                                            <TableCell>{checkIn.eventName}</TableCell>
                                            <TableCell>{checkIn.eventId}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>No check-in records found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
                <div className="button-group" style={{ textAlign: 'center', marginTop: '20px', height: '45px' }}>
                    <Button variant="contained" color="primary" onClick={() => handleOpenModal('text')} style={{ backgroundColor: 'green' }}>
                        Check-In by QR Code Text
                    </Button>
                    <Button variant="contained" onClick={() => handleOpenModal('picture')} style={{ marginLeft: '10px', backgroundColor: 'blue' }}>
                        Check-In by Camera Scanning
                    </Button>
                </div>
                <Modal open={modalOpen} onClose={handleCloseModal}>
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
                        <Typography variant="h6" component="h2" style={{ color: 'green', marginBottom: '20px' }}>
                            {modalType === 'text' ? 'Check-In by QR Code Text' : 'Check-In by Camera Scanning'}
                        </Typography>
                        {modalType === 'text' ? (
                            <form onSubmit={handleCheckInByText}>
                                <TextField
                                    label="QR Code Text"
                                    variant="outlined"
                                    fullWidth
                                    required
                                    value={qrCodeText}
                                    onChange={(e) => setQrCodeText(e.target.value)}
                                    error={error !== ''}
                                    helperText={error}
                                    style={{ marginBottom: '20px' }}
                                />
                                <Button type="submit" variant="contained" color="primary" onClick={handleCancelModal} style={{ backgroundColor: 'red', float: 'right', marginLeft: '10px' }}>
                                    Cancel
                                </Button>

                                <Button type="submit" variant="contained" color="primary" style={{ backgroundColor: 'green', float: 'right' }}>
                                    Check-In
                                </Button>
                            </form>
                        ) : (
                            <QrScanner
                                delay={300}
                                onError={handleError}
                                onScan={handleScan}
                                style={{ width: '100%' }}
                            />
                        )}
                    </Box>
                </Modal>
            </div>
        </div>
    );
};

export default CheckInPage;
