import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import axios from 'axios';
import { Alert, Snackbar, MenuItem, Typography } from '@mui/material';
import DeleteConfirmationModal from '../../../components/DeleteModal';
import '../../style/eventtable.css';
import EventCountList from '../../../components/EventCount';
import { useMediaQuery } from '@mui/material';

const EventDataTable = () => {

    const isMobile = useMediaQuery('(max-width:768px)');

    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [openAddEventModal, setOpenAddEventModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [formValues, setFormValues] = useState({
        eventName: '',
        description: '',
        location: '',
        startDate: '',
        endDate: '',
        time: '',
        leafPoints: '',
        status: '',
        picture: '',
    });
    const [file, setFile] = useState(null);
    const [errorAdding, setErrorAdding] = useState('');
    const [deleteConfirmation, setDeleteConfirmation] = useState(null);
    const [alertType, setAlertType] = useState('success');
    const [alertMessage, setAlertMessage] = useState('');
    const [alertOpen, setAlertOpen] = useState(false);
    const [openZoomModal, setOpenZoomModal] = useState(false);
    const [zoomedImageUrl, setZoomedImageUrl] = useState('');
    const [eventNameFilter, setEventNameFilter] = useState('');
    const [viewDetailsModalOpen, setViewDetailsModalOpen] = useState(false);
    const [eventDetails, setEventDetails] = useState({
        eventId: '',
        description: '',
        organiser: '',
        leafPoints: '',
        amount: '',
    });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/events');
            if (Array.isArray(response.data)) {
                const eventsWithIds = response.data.map((event) => ({
                    ...event,
                    id: event.eventId,
                }));
                setEvents(eventsWithIds);
            } else {
                console.error('Expected an array from the API response');
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    useEffect(() => {
        if (alertOpen) {
            const timer = setTimeout(() => {
                handleCloseAlert();
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [alertOpen]);


    const handleCheckIn = (eventName) => {
        try {
            // Navigate to the attendance page with the event name as a query parameter
            navigate(`/staff/attendance?eventName=${encodeURIComponent(eventName)}`);
        } catch (error) {
            console.error('Navigation error:', error);
            handleShowAlert('error', 'Unable to navigate to check-in page. Please try again.');
        }
    };



    const handleOpenEditEvent = (event) => {
        setSelectedEvent(event);
        setFormValues(event);
        setFile(null);
        setOpenAddEventModal(true);
    };

    const handleCloseEditEvent = () => {
        setSelectedEvent(null);
        setFormValues({
            eventName: '',
            description: '',
            location: '',
            startDate: '',
            endDate: '',
            time: '',
            leafPoints: '',
            status: '',
            amount: '',
            picture: '',
        });
        setFile(null);
        setOpenAddEventModal(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'status') {
            if (value === 'Free') {
                setFormValues((prevValues) => ({
                    ...prevValues,
                    status: value,
                    amount: '',
                }));
            } else {
                setFormValues((prevValues) => ({
                    ...prevValues,
                    status: value,
                }));
            }
        } else {
            setFormValues((prevValues) => ({
                ...prevValues,
                [name]: value,
            }));
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleCloseAlert = () => {
        setAlertOpen(false);
    };

    const handleShowAlert = (type, message) => {
        setAlertType(type);
        setAlertMessage(message);
        setAlertOpen(true);
    };

    const validateForm = () => {
        const { leafPoints } = formValues;

        if (leafPoints && isNaN(Number(leafPoints))) {
            setErrorAdding('Leaf Points must be a valid number.');
            return false;
        }

        return true;
    };

    const handleDeleteEvent = async (id) => {
        try {
            await axios.delete(`http://localhost:3001/api/events/${id}`);
            setEvents(events.filter((event) => event.id !== id));
            handleShowAlert('success', 'Event deleted successfully!');
        } catch (error) {
            console.error('Error deleting event:', error);
            handleShowAlert('error', 'Error deleting event. Please try again.');
        }
    };

    const handleZoomImage = (imageUrl) => {
        setZoomedImageUrl(imageUrl);
        setOpenZoomModal(true);
    };

    const handleCloseZoomModal = () => {
        setOpenZoomModal(false);
        setZoomedImageUrl('');
    };

    const handleAddEventRedirect = () => {
        navigate('/staff/AddEvent');
    };

    const validateDates = (startDate, endDate) => {
        // Convert dates to Date objects if they are strings
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Check if the end date is before the start date
        return end >= start;
    };

    const handleUpdateEvent = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        // Extract dates from form values
        const { startDate, endDate } = formValues;

        // Validate the date range
        if (!validateDates(startDate, endDate)) {
            handleShowAlert('error', 'End date cannot be before start date.');
            return;
        }

        try {
            const response = await axios.put(`http://localhost:3001/api/events/${selectedEvent.id}`, formValues);
            const updatedEvent = response.data.event;
            setEvents((prevEvents) =>
                prevEvents.map((event) => (event.id === updatedEvent.id ? updatedEvent : event))
            );
            handleCloseEditEvent();
            handleShowAlert('success', 'Event updated successfully!');
            fetchEvents();
        } catch (error) {
            console.error('Error updating event:', error);
            handleShowAlert('error', 'Error updating event. Please try again.');
        }
    };

    const handleOpenDeleteConfirmation = (event) => {
        setDeleteConfirmation(event);
    };

    const handleCloseDeleteConfirmation = () => {
        setDeleteConfirmation(null);
    };

    const handleConfirmDelete = () => {
        if (deleteConfirmation) {
            handleDeleteEvent(deleteConfirmation.id);
            handleCloseDeleteConfirmation();
        }
    };

    const handleEventNameFilterChange = (e) => {
        setEventNameFilter(e.target.value);
    };

    const handleFilterEvents = () => {
        if (eventNameFilter === '') {
            setEvents([]);
            fetchEvents();
        } else {
            const filtered = events.filter(
                (event) => event.eventName.toLowerCase() === eventNameFilter.toLowerCase()
            );
            setEvents(filtered);
        }
    };

    const handleResetFilter = () => {
        setEventNameFilter('');
        fetchEvents();
    };

    const handleViewDetails = (event) => {
        setEventDetails({
            eventId: event.id,
            description: event.description,
            organiser: event.organiser,
            leafPoints: event.leafPoints,
            amount: event.amount,
        });
        setViewDetailsModalOpen(true);
    };

    const handleCloseViewDetailsModal = () => {
        setViewDetailsModalOpen(false);
    };
    const columns = [
        {
            field: 'picture',
            headerName: 'Event Image',
            width: isMobile ? 120 : 150,
            renderCell: (params) => (

                <div style={{ textAlign: 'center', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                        src={`http://localhost:3001/api/event-picture/${params.row.id}`}
                        alt="Event"
                        style={{ width: 60, height: 60, cursor: 'pointer' }}
                        onClick={() => handleZoomImage(`http://localhost:3001/api/event-picture/${params.row.id}`)}
                    />
                </div>
            ),
        },
        { field: 'eventName', headerName: 'Event Name', width: isMobile ? 100 : 150 },
        { field: 'startDate', headerName: 'Start Date', width: isMobile ? 90 : 120 },
        { field: 'endDate', headerName: 'End Date', width: isMobile ? 90 : 120 },
        { field: 'time', headerName: 'Time', width: isMobile ? 90 : 120 },
        { field: 'location', headerName: 'Location', width: isMobile ? 70 : 90 },
        { field: 'status', headerName: 'Type', width: isMobile ? 60 : 70 },
        {
            field: 'checkIn',
            headerName: 'Check In',
            width: isMobile ? 160 : 160,
            renderCell: (params) => (
                <Button
                    variant="contained"
                    style={{ backgroundColor: 'green', color: 'white', cursor: 'pointer' }}
                    onClick={() => handleCheckIn(params.row.eventName)}
                >
                    Check In
                </Button>
            ),
        },
        {
            field: 'edit',
            headerName: 'Edit',
            width: isMobile ? 60 : 60,
            renderCell: (params) => (
                <EditIcon
                    onClick={() => handleOpenEditEvent(params.row)}
                    className="edit-icon"
                    style={{ color: 'blue', cursor: 'pointer', marginLeft: '2px', marginTop: '10px' }}
                />
            ),
        },
        {
            field: 'delete',
            headerName: 'Delete',
            width: isMobile ? 70 : 70,
            renderCell: (params) => (
                <DeleteIcon
                    onClick={() => handleOpenDeleteConfirmation(params.row)}
                    className="delete-icon"
                    style={{ color: 'red', cursor: 'pointer', marginLeft: '8px', marginTop: '10px' }}
                />
            ),
        },
        {
            field: 'viewDetails',
            headerName: 'Details',
            width: isMobile ? 75 : 100,
            renderCell: (params) => (
                <Button
                    variant="text"
                    sx={{
                        color: 'blue',
                        textDecoration: 'underline', 
                        cursor: 'pointer',
                        marginTop: '-10px'
                    }}
                    onClick={() => handleViewDetails(params.row)}
                >
                    View
                </Button>
            ),
        },
    ];

    return (
        <div className="event-list-container">
            <div className="event-table">
                <Typography variant="h4" style={{ textAlign: isMobile ? 'left' : 'left', fontWeight: 'bold', marginTop: '30px' }} gutterBottom>
                    Event List
                </Typography>
                <Typography
                    variant="h5"
                    style={{
                        textAlign: isMobile ? 'left' : 'center',
                        fontWeight: '800',
                        marginTop: '30px',
                        fontFamily: 'Arial'
                    }}
                    gutterBottom
                >
                    Top 5 recent event bookings
                    <EventCountList />
                </Typography>
                <div className="event-filter">
                    <TextField
                        label="Event Name"
                        value={eventNameFilter}
                        onChange={handleEventNameFilterChange}
                        variant="outlined"
                        size="small"
                        style={{ marginLeft: '12px' }}
                        InputProps={{
                            sx: {
                                color: 'black', // Text color
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'green', // Green border
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'darkgreen', // Darker green border on hover
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'green', // Green border when focused
                                },
                            },
                        }}
                        InputLabelProps={{
                            sx: {
                                color: 'black',
                                '&.Mui-focused': {
                                    color: 'green', 
                                },
                            },
                        }}
                    />

                    <Button variant="contained" onClick={handleFilterEvents} >
                        Filter
                    </Button>
                    <Button variant="contained" onClick={handleResetFilter} style={{ backgroundColor: 'red' }}>
                        Reset
                    </Button>
                    <Button variant="contained" onClick={handleAddEventRedirect} className='addbtn' style={{ width: '20%' }}>
                        Add Event
                    </Button>
                </div>

                <div className="event-data-grid-container">
                    <DataGrid rows={events} columns={columns} pageSize={10}
                        sx={{ textAlign: 'left' }} />
                </div>
            </div>
            <Modal open={openAddEventModal} onClose={handleCloseEditEvent}>
                <Box className="modal-box">
                    <h2 className="modal-heading">{selectedEvent ? 'Edit Event' : 'Add Event'}</h2>
                    <form onSubmit={selectedEvent ? handleUpdateEvent : handleAddEventRedirect}>
                        <div className="form-field">
                            <TextField
                                label="Event Name"
                                name="eventName"
                                value={formValues.eventName}
                                onChange={handleInputChange}
                                fullWidth
                                required
                            />
                        </div>
                        <div className="form-field">
                            <TextField
                                label="Description"
                                name="description"
                                value={formValues.description}
                                onChange={handleInputChange}
                                fullWidth
                                required
                                multiline
                                rows={3} // Adjust the number of rows to make the TextField taller

                            />
                        </div>
                        <div className="form-field">
                            <TextField
                                label="Location"
                                name="location"
                                value={formValues.location}
                                onChange={handleInputChange}
                                fullWidth
                                required
                            />
                        </div>
                        <div className="date-fields-container">
                            <TextField
                                label="Start Date"
                                name="startDate"
                                value={formValues.startDate}
                                onChange={handleInputChange}
                                fullWidth
                                required
                            />
                            <TextField
                                label="End Date"
                                name="endDate"
                                value={formValues.endDate}
                                onChange={handleInputChange}
                                fullWidth
                                required
                            />
                        </div>
                        <div className="form-field">
                            <TextField
                                label="Time"
                                name="time"
                                value={formValues.time}
                                onChange={handleInputChange}
                                fullWidth
                                required
                                style={{ marginTop: '20px' }}
                            />
                        </div>
                        <div className="leaf-status-container">
                            <div className="form-field">
                                <TextField
                                    label="Leaf Points"
                                    name="leafPoints"
                                    value={formValues.leafPoints}
                                    onChange={handleInputChange}
                                    fullWidth
                                />
                            </div>
                            <div className="form-field">
                                <TextField
                                    label="Status"
                                    name="status"
                                    value={formValues.status}
                                    onChange={handleInputChange}
                                    fullWidth
                                    required
                                    select
                                >
                                    <MenuItem value="Free">Free</MenuItem>
                                    <MenuItem value="Paid">Paid</MenuItem>
                                </TextField>
                            </div>
                        </div>
                        {formValues.status === 'Paid' && (
                            <div className="form-field">
                                <TextField
                                    label="Amount"
                                    name="amount"
                                    value={formValues.amount}
                                    onChange={handleInputChange}
                                    fullWidth
                                    required
                                />
                            </div>
                        )}
                        <div className="actions-container">
                            <div className="form-field">
                                <button
                                    className="editcloseBtn"
                                    aria-label="Close"
                                    onClick={handleCloseEditEvent}
                                >
                                    ×
                                </button>
                                <Button variant="contained" type="submit" className="modal-submit-button">
                                    {selectedEvent ? 'Update Event' : 'Add Event'}
                                </Button>
                            </div>
                        </div>
                        {errorAdding && <p className="error-text">{errorAdding}</p>}
                    </form>
                </Box>
            </Modal>
            <Modal open={openZoomModal} onClose={handleCloseZoomModal}>
                <Box className="zoom-modal-box">
                    <button
                        className="closeBtn"
                        aria-label="Close"
                        onClick={handleCloseZoomModal}
                    >
                        ×
                    </button>
                    <img
                        src={zoomedImageUrl}
                        alt="Zoomed Event"
                    />
                </Box>
            </Modal>
            <Modal open={viewDetailsModalOpen} onClose={handleCloseViewDetailsModal}>
                <Box className="modal-box">
                    <h2 className="modal-heading" style={{ fontSize: '32px' }}>Event Details</h2>
                    <p><strong>Event ID:</strong> {eventDetails.eventId}</p>
                    <p><strong>Description:</strong> {eventDetails.description}</p>
                    <p><strong>Amount:</strong> {eventDetails.amount}</p>
                    <p><strong>Organiser:</strong> {eventDetails.organiser}</p>
                    <p><strong>Leaf Points:</strong> {eventDetails.leafPoints}</p>
                    <Button variant="contained" onClick={handleCloseViewDetailsModal}>Close</Button>
                </Box>
            </Modal>
            {/* Delete Confirmation Modal */}
            {deleteConfirmation && (
                <DeleteConfirmationModal
                    open={Boolean(deleteConfirmation)}
                    onClose={handleCloseDeleteConfirmation}
                    onDelete={handleConfirmDelete}
                />
            )}

            <Snackbar open={alertOpen} autoHideDuration={6000} onClose={handleCloseAlert}>
                <Alert onClose={handleCloseAlert} severity={alertType}>
                    {alertMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default EventDataTable;