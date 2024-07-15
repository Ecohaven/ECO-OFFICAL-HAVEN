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
import AddEvent from '../Events/AddEvent';
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
                const eventsWithIds = response.data.map((event, index) => ({
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
                    amount: '', // Clear amount if status is Free
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
        navigate('/eventbackend'); 
    };

    const handleUpdateEvent = async () => {
        try {
            const response = await axios.put(`http://localhost:3001/api/events/${selectedEvent.id}`, formValues);
            const updatedEvent = response.data.event;
            const updatedEvents = events.map((event) => (event.id === updatedEvent.id ? updatedEvent : event));
            setEvents(updatedEvents);
            handleCloseEditEvent();
            handleShowAlert('success', 'Event updated successfully!');
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
                SelectProps={{
                    MenuProps: {
                        PaperProps: {
                            style: {
                                width: '200px',
                                textAlign: 'left',
                            },
                        },
                    },
                }}
            >
                <MenuItem value="">All Events</MenuItem>
                {events.map((event) => (
                    <MenuItem key={event.id} value={event.eventName}>
                        {event.eventName}
                    </MenuItem>
                ))}
            </TextField>

            {/*Event filter button  */}
            <Button
                variant="contained"
                onClick={handleFilterEvents}
                sx={{
                    mb: 2,
                    ml: 2,
                    backgroundColor: 'blue',
                    height: '45px',
                    marginTop: '5px',
                    '&:hover': {
                        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)'
                    }
                }}
            >
                Filter Events
            </Button>
            <Button
                variant="contained"
                onClick={handleResetFilter}
                sx={{
                    mb: 2,
                    ml: 2,
                    backgroundColor: 'red',
                    height: '45px',
                    marginTop: '5px',
                    '&:hover': {
                        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)'
                    }
                }}
            >
                Reset
            </Button>


            {/* event table data*/}
            <DataGrid
                rows={events}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
            />

            {/* Delete Confirmation Modal */}
            {deleteConfirmation && (
                <DeleteConfirmationModal
                    open={!!deleteConfirmation}
                    onClose={() => setDeleteConfirmation(null)}
                    onDelete={() => {
                        handleDeleteEvent(deleteConfirmation.id);
                        setDeleteConfirmation(null);
                    }}
                    itemName={deleteConfirmation.eventName}
                />
            )}

            {/* Snackbar for Alerts */}
            <Snackbar
                open={alertOpen}
                autoHideDuration={5000}
                onClose={handleCloseAlert}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseAlert} severity={alertType}>
                    {alertMessage}
                </Alert>
            </Snackbar>

            {/* Zoomed Image Modal */}
            <Modal
                open={openZoomModal}
                onClose={handleCloseZoomModal}
                aria-labelledby="zoomed-image-modal-title"
                aria-describedby="zoomed-image-modal-description"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Box className="zoomed-image-modal">
                    <img
                        src={zoomedImageUrl}
                        alt="Zoomed Event Image"
                        style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }}
                    />
                </Box>
            </Modal>

            {/* Edit Event Modal */}
            <Modal
                open={openAddEventModal}
                onClose={handleCloseEditEvent}
                aria-labelledby="edit-event-modal-title"
                aria-describedby="edit-event-modal-description"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '30px 400px',
                }}
            >
                <Box
                    className="edit-event-modal"
                    sx={{
                        backgroundColor: 'white',
                        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                        borderRadius: '8px',
                        padding: '20px 40px',
                        width: '80%',
                        maxWidth: '600px',
                        overflowY: 'auto',
                        maxHeight: '90vh',
                    }}
                >
                    <h2 style={{ color: 'black', textAlign: 'center', marginBottom: '20px', marginTop: '-10px', fontSize: '35px' }}>
                        Edit Event: {selectedEvent?.eventName || 'Event'}
                    </h2>
                    <form className="edit-event-form" onSubmit={handleUpdateEvent}>
                        {[
                            { id: 'eventName', label: 'Event Name', type: 'text' },
                            { id: 'description', label: 'Description', type: 'text', multiline: true, rows: 4 },
                            { id: 'location', label: 'Location', type: 'text' },
                            { id: 'startDate', label: 'Start Date', type: 'date' },
                            { id: 'endDate', label: 'End Date', type: 'date' },
                            { id: 'time', label: 'Time', type: 'text' },
                            { id: 'leafPoints', label: 'Leaf Points', type: 'text' },
                        ].map((field) => (
                            <TextField
                                key={field.id}
                                id={field.id}
                                name={field.id}
                                label={field.label}
                                type={field.type}
                                variant="outlined"
                                fullWidth
                                value={formValues[field.id]}
                                onChange={handleInputChange}
                                className="form-input"
                                style={{ marginBottom: '16px', color: 'black' }}
                                multiline={field.multiline || false}
                                rows={field.rows || 1}
                            />
                        ))}

                        <TextField
                            id="status"
                            name="status"
                            label="status"
                            select
                            variant="outlined"
                            fullWidth
                            value={formValues.status}
                            onChange={handleInputChange}
                            className="form-input"
                            style={{ marginBottom: '16px' }}
                        >
                            <MenuItem value="Free">Free</MenuItem>
                            <MenuItem value="Payment">Payment</MenuItem>
                        </TextField>

                        <TextField
                            id="amount"
                            name="amount"
                            label="Amount"
                            type="text"
                            variant="outlined"
                            fullWidth
                            value={formValues.amount}
                            onChange={handleInputChange}
                            className="form-input"
                            style={{ marginBottom: '16px' }}
                            disabled={formValues.status === 'Free'} // Disable if status is Free
                        />


                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            className="submit-button"
                            style={{ marginTop: '16px', backgroundColor: 'green', fontWeight: 'bold', width: '30%', textAlign: 'center', marginLeft: '120px', height: '50px' }}
                        >
                            Update Event
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            fullWidth
                            className="cancel-button"
                            style={{ marginTop: '16px', backgroundColor: 'red', fontWeight: 'bold', width: '30%', textAlign: 'center', marginLeft: '20px', height: '50px' }}
                            onClick={handleCloseEditEvent}
                        >
                            Cancel
                        </Button>

                        {errorAdding && <p className="error-message" style={{ color: 'red', marginTop: '16px' }}>{errorAdding}</p>}
                    </form>
                </Box>
            </Modal>


            {/* Add Event Redirect Button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button
                    variant="contained"
                    Color="green"
                    onClick={handleAddEventRedirect}
                    className="add-event-button"
                >
                    Add Event
                </Button>
            </Box>
        </div>

    );
};

export default EventDataTable;
