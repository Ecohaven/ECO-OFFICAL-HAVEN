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
import { Alert, Snackbar } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
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
    navigate(`/staff/attendance?eventName=${encodeURIComponent(eventName)}`);

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
        // Update the event in the state
        setEvents((prevEvents) =>
            prevEvents.map((event) => (event.id === updatedEvent.id ? updatedEvent : event))
        );
        handleCloseEditEvent();
        handleShowAlert('success', 'Event updated successfully!');
        // Fetch updated events
        fetchEvents(); // Refresh the event list
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
        { field: 'id', headerName: 'ID', width: 50 },
        { field: 'description', headerName: 'Description', width: 200 },
        { field: 'location', headerName: 'Location', width: 150 },
        { field: 'startDate', headerName: 'Start Date', width: 120 },
        { field: 'endDate', headerName: 'End Date', width: 120 },
        { field: 'time', headerName: 'Time', width: 100 },
        { field: 'leafPoints', headerName: 'Leaf Points', width: 100 },
        { field: 'status', headerName: 'Status', width: 80 },
        { field: 'amount', headerName: 'Amount', width: 100 },
        { field: 'organiser', headerName: 'Organiser', width: 100 },
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
            color="primary"
            onClick={() => handleCheckIn(params.row.eventName)}
        >
            Check In to {params.row.eventName}
        </Button>
    ),
}


    ];

    return (
        <div className='event-list-container'>
            <Sidebar />
            <h2>Event's List</h2>

            {/*Event filter dropdown box */}
            <TextField
                id="eventNameFilter"
                select
                label="Filter by Event Name"
                value={eventNameFilter}
                onChange={handleEventNameFilterChange}
                variant="outlined"
                sx={{ mb: 2, width: '200px' }}
            >
                {events.map((event) => (
                    <MenuItem key={event.id} value={event.eventName}>
                        {event.eventName}
                    </MenuItem>
                ))}
            </TextField>
            <Button
                onClick={handleFilterEvents}
                variant="contained"
                color="primary"
                style={{ marginRight: '10px', height: '55px' }}
            >
                Filter
            </Button>
            <Button
                onClick={handleResetFilter}
                variant="contained"
                color="secondary"
                style={{ height: '55px' }}
            >
                Reset
            </Button>

            {/* Add Event Button */}
            <Button
                variant="contained"
                color="primary"
                onClick={handleAddEventRedirect}
                style={{ marginBottom: '10px', float: 'right', marginRight: '15px' }}
            >
                Add Event
            </Button>

            <Box sx={{ height: 400, width: '100%', mt: 2 }}>
                <DataGrid rows={events} columns={columns} pageSize={5} />
            </Box>

            {/* Edit Event Modal */}
           <Modal open={openAddEventModal} onClose={handleCloseEditEvent}>
    <Box sx={{
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: '600px',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    maxHeight: '80vh',  // Limits the height of the modal
    overflowY: 'auto', // Adds a scrollbar if content overflows
    borderRadius: '8px', // Optional: Adds rounded corners to the modal
}}>


                    <h2 style={{ color: 'green' }}>Edit Event</h2>
                    <form onSubmit={handleUpdateEvent}>
                        <TextField
                            label="Event Name"
                            name="eventName"
                            value={formValues.eventName}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                            required
                        />
                        <TextField
                            label="Description"
                            name="description"
                            value={formValues.description}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                            required
                        />
                        <TextField
                            label="Location"
                            name="location"
                            value={formValues.location}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                            required
                        />
                        <TextField
                            label="Start Date"
                            name="startDate"
                            value={formValues.startDate}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                            required
                        />
                        <TextField
                            label="End Date"
                            name="endDate"
                            value={formValues.endDate}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                            required
                        />
                        <TextField
                            label="Time"
                            name="time"
                            value={formValues.time}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                            required
                        />
                        <TextField
                            label="Leaf Points"
                            name="leafPoints"
                            value={formValues.leafPoints}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                            required
                        />
                        <TextField
                            label="Status"
                            name="status"
                            value={formValues.status}
                            onChange={handleInputChange}
                            select
                            fullWidth
                            margin="normal"
                            required
                        >
                            <MenuItem value="Free">Free</MenuItem>
                            <MenuItem value="Paid">Paid</MenuItem>
                        </TextField>
                        {formValues.status === 'Paid' && (
                            <TextField
                                label="Amount"
                                name="amount"
                                value={formValues.amount}
                                onChange={handleInputChange}
                                fullWidth
                                margin="normal"
                                required
                            />
                        )}
                        <TextField
                            label="Organiser"
                            name="organiser"
                            value={formValues.organiser}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                            required
                        />
                        <TextField
                            type="file"
                            onChange={handleFileChange}
                            fullWidth
                            margin="normal"
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                            <Button onClick={handleCloseEditEvent} color="secondary" variant="contained">Cancel</Button>
                            <Button type="submit" color="primary" variant="contained">Save</Button>
                        </Box>
                        {errorAdding && <Alert severity="error">{errorAdding}</Alert>}
                    </form>
                </Box>
            </Modal>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                open={!!deleteConfirmation}
                onClose={() => setDeleteConfirmation(null)}
                onConfirm={() => {
                    handleDeleteEvent(deleteConfirmation.id);
                    setDeleteConfirmation(null);
                }}
            />

            {/* Image Zoom Modal */}
            <Modal open={openZoomModal} onClose={handleCloseZoomModal}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 4,
                        outline: 'none',
                    }}
                >
                    <img
                        src={zoomedImageUrl}
                        alt="Zoomed Event"
                        style={{ width: '100%', maxHeight: '80vh' }}
                    />
                </Box>
            </Modal>

            {/* Alert Snackbar */}
            <Snackbar
                open={alertOpen}
                autoHideDuration={6000}
                onClose={handleCloseAlert}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseAlert} severity={alertType} sx={{ width: '100%' }}>
                    {alertMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default EventDataTable;
