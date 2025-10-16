import React, { useState, useEffect } from "react";
import { DataGrid } from '@mui/x-data-grid';
import { Button, Dialog, DialogActions, DialogContent, Tooltip, Card, CardContent, Typography, Grid, Snackbar, Alert } from '@mui/material';
import axios from "axios";
import FilterDropdown from '../../../components/BookingFilter';
import '../../style/bookingtable.css';

const BookingList = () => {
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertType, setAlertType] = useState("");
    const [bookings, setBookings] = useState([]);
    const [summaryData, setSummaryData] = useState({ newBookingsToday: 0, totalBookings: 0 });
    const [page, setPage] = useState(0);
    const [openCancelDialog, setOpenCancelDialog] = useState(false);
    const [cancelBookingId, setCancelBookingId] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchBookings = async () => {
        try {
            const bookingsResponse = await axios.get('http://localhost:3001/api/bookings');
            const totalResponse = await axios.get('http://localhost:3001/api/booking-summary/totalbookings');
            const newBookingsTodayResponse = await axios.get('http://localhost:3001/api/booking-summary/new-bookings-today');
            const eventsResponse = await axios.get('http://localhost:3001/api/events');

            const eventDeletionStatus = new Map(eventsResponse.data.map(event => [event.id, event.isDeleted]));

            const updatedBookings = bookingsResponse.data.map(booking => ({
                ...booking,
                status: booking.status || 'Active',
                isEventNameDeleted: eventDeletionStatus.get(booking.eventId) || false
            }));

            setBookings(updatedBookings);
            setSummaryData({
                newBookingsToday: newBookingsTodayResponse.data.newBookingsToday,
                totalBookings: totalResponse.data.totalBookings
            });
        } catch (error) {
            console.error('Error fetching data:', error);
            handleShowAlert('Error fetching data. Please try again later.', 'error');
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleShowAlert = (message, type = 'info') => {
        setAlertMessage(message);
        setAlertType(type);
        setShowAlert(true);
    };

    const handleCancelBooking = (id) => {
        setCancelBookingId(id);
        setOpenCancelDialog(true);
    };

    const confirmCancelBooking = () => {
        axios.put(`http://localhost:3001/api/bookings/cancel/${cancelBookingId}`)
            .then(() => {
                fetchBookings();
                handleShowAlert('Booking has been cancelled successfully.', 'success');
            })
            .catch((error) => {
                console.error('Error cancelling booking:', error);
                handleShowAlert('An error occurred while cancelling the booking.', 'error');
            })
            .finally(() => {
                setCancelBookingId(null);
                setOpenCancelDialog(false);
            });
    };

    const handleFilter = async ({ date, status, numberOfPax, eventName }) => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:3001/api/filter', {
                params: { date, status, numberOfPax, eventName }
            });
            setBookings(response.data);
        } catch (error) {
            console.error('Error filtering bookings:', error);
            handleShowAlert('No Available data for the filter selected.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        fetchBookings();
    };

    const columns = [
        {
            field: 'status',
            headerName: 'Status',
            width: 100,
            renderCell: (params) => (
                <div style={{
                    borderRadius: '4px',
                    color: params.row.status === 'Active' ? 'green' :
                        (params.row.status === 'Cancelled' ? 'red' :
                        (params.row.status === 'Attended' ? 'blue' : 'inherit')),
                    fontWeight: 'bold',
                    textAlign: 'center'
                }}>
                    {params.row.status}
                </div>
            ),
        },
        { field: 'id', headerName: 'Booking ID', width: 100 },
        { field: 'bookingDate', headerName: 'Booking Date', width: 130 },
        { field: 'Name', headerName: 'Name', width: 100 },
        { field: 'eventName', headerName: 'Event Name', width: 200 },
        { field: 'numberOfPax', headerName: 'No.of Pax', width: 80 },
        { field: 'phoneNumber', headerName: 'Phone Number', width: 120 },
        { field: 'email', headerName: 'Email', width: 200 },
        { field: 'amount', headerName: 'Event Amount', width: 110 },
        { field: 'qrCodeText', headerName: 'QRCode-Text', width: 120 },
        {
            field: 'cancel',
            headerName: 'Cancel Booking',
            width: 150,
            renderCell: (params) => (
                <Tooltip
                    title={
                        params.row.isEventNameDeleted
                            ? "Event is deleted"
                            : params.row.status === 'Cancelled'
                                ? "Booking is already cancelled"
                                : params.row.status === 'Attended'
                                    ? "Booking has been attended"
                                    : "Cancel Booking"
                    }
                >
                    <Button
                        onClick={() => {
                            if (!params.row.isEventNameDeleted && params.row.status !== 'Cancelled' && params.row.status !== 'Attended') {
                                handleCancelBooking(params.row.id);
                            }
                        }}
                        style={{
                            backgroundColor: params.row.isEventNameDeleted || params.row.status === 'Cancelled' || params.row.status === 'Attended' ? 'grey' : 'red',
                            fontWeight: 'bold',
                            color: 'white',
                            cursor: params.row.isEventNameDeleted || params.row.status === 'Cancelled' || params.row.status === 'Attended' ? 'not-allowed' : 'pointer',
                        }}
                        disabled={params.row.isEventNameDeleted || params.row.status === 'Cancelled' || params.row.status === 'Attended'}
                    >
                        Cancel
                    </Button>
                </Tooltip>
            ),
        },
    ];

    return (
        <div className="booking-list-container">
            <Typography variant="h4" style={{ textAlign: 'left', fontWeight: 'bold' }} gutterBottom>
                Bookings
            </Typography>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                    <Card sx={{ backgroundColor: 'green', color: 'white' }}>
                        <CardContent>
                            <Typography variant="h6" color="white" gutterBottom>
                                New Bookings Today
                            </Typography>
                            <Typography variant="h4">
                                {summaryData.newBookingsToday}
                            </Typography>
                            <Typography color="white">Sign ups</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Card sx={{ backgroundColor: 'green', color: 'white' }}>
                        <CardContent>
                            <Typography variant="h6" color="white" gutterBottom>
                                Total Bookings
                            </Typography>
                            <Typography variant="h4">
                                {summaryData.totalBookings}
                            </Typography>
                            <Typography color="white">bookings</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <FilterDropdown handleFilter={handleFilter} handleReset={handleReset} />

            <div className="data-grid-container">
                <DataGrid
                    rows={bookings}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10, 20, 30]}
                    pagination
                    loading={loading}
                    disableSelectionOnClick
                    getRowId={(row) => row.id}
                    sx={{ textAlign: 'left' }}
                />
            </div>

            <Dialog open={openCancelDialog} onClose={() => setOpenCancelDialog(false)}>
                <DialogContent>
                    <Typography variant="h6" style={{ color: 'black' }}>
                        Are you sure you want to cancel this booking?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenCancelDialog(false)} style={{ color: 'white', backgroundColor: 'red' }}>No</Button>
                    <Button onClick={confirmCancelBooking} style={{ color: 'white', backgroundColor: 'green' }}>Yes</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={showAlert} autoHideDuration={6000} onClose={() => setShowAlert(false)}>
                <Alert onClose={() => setShowAlert(false)} severity={alertType}>
                    {alertMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default BookingList;
