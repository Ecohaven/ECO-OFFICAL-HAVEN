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
import { Alert, Snackbar, MenuItem } from '@mui/material';
import Sidebar from '../../../components/sidebar';
import DeleteConfirmationModal from '../../../components/DeleteModal';
import '../../style/eventtable.css';

const EventDataTable = () => {
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
    // Redirect immediately
    navigate(`/attendance?eventName=${encodeURIComponent(eventName)}`);

    // Optional: Add any additional logic if needed
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

    const handleUpdateEvent = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

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
// stop here heheheeheh
    const columns = [
        {
            field: 'picture',
            headerName: 'Event Image',
            width: 150,
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
        { field: 'eventName', headerName: 'Event Name', width: 150 },
        { field: 'location', headerName: 'Location', width: 150 },
        { field: 'startDate', headerName: 'Start Date', width: 120 },
        { field: 'endDate', headerName: 'End Date', width: 120 },
        { field: 'time', headerName: 'Time', width: 100 },
        { field: 'status', headerName: 'Status', width: 80 },
        {
            field: 'edit',
            headerName: 'Edit',
            width: 80,
            renderCell: (params) => (
                <EditIcon
                    onClick={() => handleOpenEditEvent(params.row)}
                    className="edit-icon"
                    style={{ color: 'blue', cursor: 'pointer', marginLeft: '2px' }}
                />
            ),
        },
        {
            field: 'delete',
            headerName: 'Delete',
            width: 100,
            renderCell: (params) => (
                <DeleteIcon
                    onClick={() => setDeleteConfirmation(params.row)}
                    className="delete-icon"
                    style={{ color: 'red', cursor: 'pointer', marginLeft: '8px' }}
                />
            ),
        },
        {
            field: 'checkIn',
            headerName: 'Check In',
            width: 200,
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
            field: 'viewDetails',
            headerName: 'Details',
            width: 100,
            renderCell: (params) => (
                <Button
                    variant="contained"
                    style={{ backgroundColor: 'blue', color: 'white', cursor: 'pointer' }}
                    onClick={() => handleViewDetails(params.row)}
                >
                    View
                </Button>
            ),
        },
    ];

    return (
        <div className="event-list-container">
            <Sidebar />
            <div className="event-table">
                <h2 className="event-heading">Event List</h2>
                <div className="event-filter">
                    <TextField
                        label="Event Name"
                        value={eventNameFilter}
                        onChange={handleEventNameFilterChange}
                        variant="outlined"
                        size="small"
                    />
                    <Button variant="contained" onClick={handleFilterEvents}>
                        Filter
                    </Button>
                    <Button variant="contained" onClick={handleResetFilter}>
                        Reset
                    </Button>
                    <Button variant="contained" onClick={handleAddEventRedirect}>
                        Add Event
                    </Button>
                </div>
                <div className="event-data-grid-container">
                    <DataGrid rows={events} columns={columns} pageSize={10} />
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
                    <Button variant="contained" component="label">
                        Upload Picture
                        <input type="file" hidden onChange={handleFileChange} />
                    </Button>
                    {file && <p>{file.name}</p>}
                </div>
                <div className="form-field">
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
                    <img src={zoomedImageUrl} alt="Zoomed Event" style={{ width: '100%', height: '100%' }} />
                </Box>
            </Modal>
            <Modal open={viewDetailsModalOpen} onClose={handleCloseViewDetailsModal}>
                <Box className="modal-box">
                    <h2 className="modal-heading">Event Details</h2>
                    <p><strong>Event ID:</strong> {eventDetails.eventId}</p>
                    <p><strong>Description:</strong> {eventDetails.description}</p>
                    <p><strong>Organiser:</strong> {eventDetails.organiser}</p>
                    <p><strong>Leaf Points:</strong> {eventDetails.leafPoints}</p>
                    <p><strong>Amount:</strong> {eventDetails.amount}</p>
                    <Button variant="contained" onClick={handleCloseViewDetailsModal}>Close</Button>
                </Box>
            </Modal>
            {deleteConfirmation && (
                <DeleteConfirmationModal
                    open={!!deleteConfirmation}
                    onClose={() => setDeleteConfirmation(null)}
                    onConfirm={() => {
                        handleDeleteEvent(deleteConfirmation.id);
                        setDeleteConfirmation(null);
                    }}
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
