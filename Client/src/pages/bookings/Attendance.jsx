import React, { useState, useEffect ,useRef} from 'react';
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
const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
const scannerRef = useRef(null);
const [isScanning, setIsScanning] = useState(false);
const SCAN_DELAY = 2000; // Delay in milliseconds (e.g., 2 seconds)



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
    if (isScanning) {
        // If a scan is already in progress, ignore this scan
        return;
    }

    if (!data || !data.text) {
        setModalMessage('Please scan a QR Code.');
        setModalType('');
        setOpenConfirmationModal(false); 
        return;
    }

    setIsScanning(true); // Set the scanning flag to true

    const qrCodeDataArray = data.text.split(','); // Assume QR codes are comma-separated

    setModalMessage(''); // Clear the modal message
    // Do not close the modal initially, wait for user action

    const successMessages = [];
    const alreadyCheckedInMessages = [];
    const invalidQrCodes = [];
    let anySuccessfulCheckIns = false;

    try {
        // Flag to determine if we have successfully checked in a QR code
        let successfullyCheckedIn = false;

        // Process each QR code one by one
        for (const qrCodeData of qrCodeDataArray) {
            if (successfullyCheckedIn) break; // Stop processing if a successful check-in is already done

            try {
                const response = await axios.post('http://localhost:3001/checkin/checkin', { data: qrCodeData });
                if (response.status === 200) {
                    const { qrCodeStatus } = response.data;

                    if (qrCodeStatus === 'Checked-In') {
                        alreadyCheckedInMessages.push(`QR Code "${qrCodeData}" has already been checked in.`);
                    } else {
                        successMessages.push(`QR Code "${qrCodeData}" check-in successful.`);
                        anySuccessfulCheckIns = true;
                        successfullyCheckedIn = true; 
                    }
                } else {
                    // If the QR code is invalid, push it to the list of invalid QR codes
                    invalidQrCodes.push(qrCodeData);
                }
            } catch (error) {
                console.error('Error during individual check-in:', error);
                invalidQrCodes.push(qrCodeData); // Consider QR code invalid if there's an error
            }
        }

        let messageToDisplay = '';
        let modalType = '';

        if (anySuccessfulCheckIns) {
            messageToDisplay = successMessages.join('\n'); 
            modalType = 'success';
        } else if (invalidQrCodes.length > 0) {
            messageToDisplay = invalidQrCodes.length === qrCodeDataArray.length
                ? 'Invalid QR Codes. Please try scanning again.'
                : 'Some QR Codes are invalid.';
            modalType = 'error';
        } else if (alreadyCheckedInMessages.length > 0) {
            messageToDisplay = alreadyCheckedInMessages.join('\n'); // Combine all already checked-in messages
            modalType = 'warning';
        } else {
            messageToDisplay = 'No valid check-ins or unexpected responses.';
            modalType = 'error';
        }

        // Update the modal
        setModalMessage(messageToDisplay);
        setModalType(modalType);
        setOpenConfirmationModal(true);

        // Fetch updated check-ins data
        fetchCheckIns(selectedEventName);

    } catch (error) {
        console.error('Error during check-in:', error);

        let errorMessage = 'An error occurred while processing the request.';

        if (error.response) {
            switch (error.response.status) {
                case 404:
                    errorMessage = 'Record not found. Please check the details.';
                    break;
                case 400:
                    errorMessage = 'Invalid QR Code provided. Please ensure that it has not been checked in before.';
                    break;
                default:
                    errorMessage = 'An unexpected error occurred. Please try again later.';
                    break;
            }
        } else if (error.request) {
            errorMessage = 'Network error. Please check your connection and try again.';
        }

        // Update the modal for error
        setModalMessage(errorMessage);
        setModalType('error');
        setOpenConfirmationModal(true);
    } finally {
        // Reset the scanning flag after a delay
        setTimeout(() => {
            setIsScanning(false);
        }, SCAN_DELAY);
    }
};


// Function to reset the QR scanner
const resetScanner = () => {
    if (scannerRef.current) {
        scannerRef.current.reset();
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
            setModalOpen(false); 

            // Reset qrCodeText field
            setQrCodeText('');

            fetchCheckIns(selectedEventName); // Fetch check-ins after successful check-in
            navigate(`/staff/attendance?eventName=${encodeURIComponent(selectedEventName)}`);
        } else {
            setError('Unexpected response from server');
        }
    } catch (error) {
        console.error('Error during check-in:', error);
        setError('Failed to check-in, Check if it have been checked in already');
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
        resetScanner();
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
                  <Typography variant="h4" style={{textAlign:'left',fontWeight:'bold'}}gutterBottom>
                Check In (Attendance)
            </Typography>
{!selectedEventName && (
    <Typography variant="body1" sx={{ mt: 2, color: 'black',backgroundColor:'yellow',fontWeight:'bold',width:'50%', marginLeft: '230px',textAlign:'center',marginBottom:'20px' }}>
        Please select an event before proceeding.
    </Typography>
)}
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
                        <Button
    variant="contained"
    onClick={() => handleOpenModal('text')}
    style={{ marginLeft: '10px', marginTop: '10px', backgroundColor: 'green', color: 'white' }}
    disabled={!selectedEventName}
>
    Check-In by Text
</Button>
<Button
    variant="contained"
    onClick={() => handleOpenModal('scan')}
    style={{ marginLeft: '10px', marginTop: '10px', backgroundColor: 'darkgreen', color: 'white' }}
    disabled={!selectedEventName}
>
    Scan QR Code
</Button>


                    </div>

 {/* Confirmation modal for QR code scanning */}
<Modal
    open={openConfirmationModal}
    onClose={() => setOpenConfirmationModal(false)}
    sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
>
    <Box
        sx={{
            width: 350,
            bgcolor: 'background.paper',
            p: 4,
            borderRadius: 2,
            textAlign: 'center',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        }}
    >
        <Typography variant="h6" component="h2">
            {modalType === 'success'
                ? `QR Code "${successMessages[0]}" has been scanned successfully!`
                : modalType === 'error'
                ? modalMessage
                : modalMessage}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
            {modalType === 'success' ? (
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        // Close the modal and reopen the scanning modal
                        setOpenConfirmationModal(false);
                        handleCloseModal(); // Close any existing modals
                        resetScanner(); // Open the scanning modal
                    }}
                    sx={{ backgroundColor: 'green', color: 'white' }}
                >
                    Close
                </Button>
            ) : (
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        // Close the modal and reset the scanner
                        setOpenConfirmationModal(false);
                        handleCloseModal(); // Handle any other modal or UI changes
                        resetScanner(); // Ensure the scanner is reset
                    }}
                    sx={{ backgroundColor: 'red', color: 'white' }}
                >
                    Close
                </Button>
            )}
        </Box>
    </Box>
</Modal>



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
              <Modal open={modalOpen} onClose={handleCloseModal} >
    <Box
        sx={{
            width: 400,
            bgcolor: 'background.paper',
            p: 4,
            borderRadius: 2,
            margin: 'auto',
            marginTop: '100px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        }}
    >
        <Typography variant="h6" component="h2">
            {modalType === 'text' ? 'Check-In by Text' : 'Scan QR Code'}
        </Typography>
        {modalType === 'text' ? (
            <Box component="form" onSubmit={handleCheckInByText} sx={{ mt: 2, width: '100%' }}>
                <TextField
                    fullWidth
                    label="QR Code Text / Guest Name"
                    value={qrCodeText}
                    onChange={(e) => setQrCodeText(e.target.value)}
                    error={!!error}
                    helperText={error}
                    disabled={!selectedEventName}
                />
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2 }}
                    disabled={!selectedEventName}
                >
                    Submit
                </Button>
           
 <Button
                variant="outlined"
                onClick={handleCloseModal}
                sx={{
                    mt: 2,
                    ml:2,
                    backgroundColor: 'red',
                    color: 'white',
                    '&:hover': {
                        backgroundColor: 'darkred',
                    },
                }}
            >
                Close
            </Button>
      </Box>
        ) : (
            <Box sx={{ mb: 2, width: '100%', maxWidth: 600, textAlign: 'center' }}>
                <QrScanner
                    onScan={handleScan}
                    onError={(error) => setError(`Scan Error: ${error.message}`)}
                    className="successMessages"
                    style={{
                        width: '100%',
                        borderRadius: 2,
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                        border: '1px solid rgba(0, 0, 0, 0.2)',
                        backgroundColor: 'background.paper',
                    }}
                />

<Button
                variant="outlined"
                onClick={handleCloseModal}
                sx={{
                    mt: 2,
                    ml:2,
                    backgroundColor: 'red',
                    color: 'white',
                    '&:hover': {
                        backgroundColor: 'darkred',
                    },
                }}
            >
                Close
            </Button>

            </Box>
        )}
      
    </Box>
</Modal>


            </div>
        </div>
    );
};

export default CheckInPage;
