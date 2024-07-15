import React, { useState, useEffect } from "react";
import { DataGrid } from '@mui/x-data-grid';
import { Button, Dialog, DialogActions, DialogContent, Tooltip, Card, CardContent, Typography, Grid } from '@mui/material';
import axios from "axios";
import CustomAlert from '../../../components/alert';
import Sidebar from '../../../components/sidebar';
import ExclamationIcon from '../../../src/assets/icons/exclamation-mark.png';
import FilterDropdown from '../../../components/BookingFilter';
import '../../style/bookingtable.css';

const BookingList = () => {
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertType, setAlertType] = useState("");
    const [bookings, setBookings] = useState([]);
    const [summaryData, setSummaryData] = useState({ newBookingsToday: 0, totalBookings: 0, totalRevenue: 0 });
    const [page, setPage] = useState(0);
    const [openCancelDialog, setOpenCancelDialog] = useState(false);
    const [cancelBookingId, setCancelBookingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('');

    const fetchBookings = async () => {
        try {
            const bookingsResponse = await axios.get('http://localhost:3001/api/bookings');
            const totalResponse = await axios.get('http://localhost:3001/api/booking-summary/totalbookings');
            const newBookingsTodayResponse = await axios.get('http://localhost:3001/api/booking-summary/new-bookings-today');

            const updatedBookings = bookingsResponse.data.map(booking => ({
                ...booking,
                status: booking.status || 'Active'
            }));

            setBookings(updatedBookings);
            setSummaryData({
                newBookingsToday: newBookingsTodayResponse.data.newBookingsToday,
                totalBookings: totalResponse.data.totalBookings,
                totalRevenue: totalResponse.data.totalRevenue
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

    const handleFilter = async ({ date, status, numberOfPax, event }) => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:3001/api/filter', {
                params: {
                    date,
                    status,
                    numberOfPax,
                    event
                }
            });
            setBookings(response.data);
        } catch (error) {
            console.error('Error filtering bookings:', error);
            handleShowAlert('Error filtering bookings. Please try again later.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const SearchBox = ({ handleSearchResults }) => {
        const [query, setQuery] = useState('');
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState('');

        const handleSearch = async (e) => {
            e.preventDefault();
            setLoading(true);
            setError('');

            try {
                const response = await axios.get(`http://localhost:3001/search`, {
                    params: { search: query }
                });
                handleSearchResults(response.data);
            } catch (error) {
                setError('Error fetching search results');
                console.error('Error fetching search results:', error);
            } finally {
                setLoading(false);
            }
        };

        const resetSearch = () => {
            setQuery('');
            fetchBookings();
        };

        return (
            <form onSubmit={handleSearch} style={{ marginBottom: '-30px', alignItems: 'center', justifyContent: 'flex-start', display: 'flex',marginTop:'10px' }}>
                <input
                    type="text"
                    placeholder="Search..."
                    className="searchbox"
                    value={query}
                    variant="contained"
                    onChange={(e) => setQuery(e.target.value)}
                    style={{ flex: 1, marginRight: '10px', height: '50px', maxWidth: '200px' }}
                />
                <Button
                    variant="contained"
                    onClick={resetSearch}
                    disabled={loading}
                    style={{
                        backgroundColor:'transparent',
                        border: ' 2px solid green',
                        color: 'black',
                        fontWeight: '600',
                        textTransform: 'none',
                        height:'50px',
                        marginLeft: '15px',
                    }}
                >
                    Reset Table
                </Button>
                {loading && <span style={{ marginLeft: '10px' }}>Loading...</span>}
                {error && <span style={{ color: 'red', marginLeft: '10px' }}>{error}</span>}
            </form>
        );
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
       (params.row.status === 'Cancelled' ? 'red' : 'inherit'),
                    fontWeight: 'bold',
                    textAlign: 'center'
                }}>
                    {params.row.status}
                </div>
            ),
        },
         {
            field: 'bookingDate',
            headerName: 'Booking Date',
            width: 130,
            cellClassName: (params) => {
                const today = new Date().setHours(0, 0, 0, 0);
                const bookingDate = new Date(params.value).setHours(0, 0, 0, 0);
                if (bookingDate < today) {
                    return 'pastDateRow';
                } else if (bookingDate === today) {
                    return 'currentDateRow';
                } else {
                    return '';
                }
            },
        },
        { field: 'Name', headerName: 'Name', width: 130 },
        { field: 'id', headerName: 'Booking ID', width: 100 },
        { field: 'eventId', headerName: 'Event ID', width: 120 },
        { field: 'eventName', headerName: 'Event Name', width: 120 },
        { field: 'numberOfPax', headerName: 'No.of Pax', width: 80 },
        { field: 'phoneNumber', headerName: 'Phone Number', width: 150 },
        { field: 'email', headerName: 'Email', width: 200 },
        { field: 'leafPoints', headerName: 'leafpoints', width: 30 },
        { field: 'amount', headerName: 'Amount', width: 30 },
        { field: 'qrCodeText', headerName: 'QRCode-Text', width: 150 },
        {
            field: 'cancel',
            headerName: 'Cancel Booking',
            width: 150,
            renderCell: (params) => (
                <Tooltip title="Cancel Booking">
                    <Button onClick={() => handleCancelBooking(params.row.id)}
                         style={{ backgroundColor: "red", fontWeight: "bold", color: "white" }}>
                        Cancel
                    </Button>
                </Tooltip>
            ),
        },
    ];

    return (
        <div className="booking-list-container">
            <h2 className="h2">Bookings</h2>
            <Sidebar />
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{ backgroundColor: 'green', color: 'white' }}>
                        <CardContent>
                            <Typography variant="h6" color="white" gutterBottom>
                                New Bookings Today
                            </Typography>
                            <Typography variant="h4">
                                {summaryData.newBookingsToday}
                            </Typography>
                            <Typography color="white">
                                Sign ups
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{ backgroundColor: 'green', color: 'white' }}>
                        <CardContent>
                            <Typography variant="h6" color="white" gutterBottom>
                                Total Bookings
                            </Typography>
                            <Typography variant="h4">
                                {summaryData.totalBookings}
                            </Typography>
                            <Typography color="white">
                                bookings
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{ backgroundColor: 'green', color: 'white' }}>
                        <CardContent>
                            <Typography variant="h6" color="white" gutterBottom>
                                Total Revenue
                            </Typography>
                            <Typography variant="h4">
                                ${summaryData.totalRevenue}
                            </Typography>
                            <Typography color="white">
                                bookings
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12}>
                    <SearchBox handleSearchResults={(results) => setBookings(results)} />
                </Grid>
  <Grid item xs={12} style={{marginTop:'5px',marginBottom:'80px',marginLeft:'-190px'}}>
                    <FilterDropdown handleFilter={handleFilter} />
                </Grid>

                <Grid item xs={12}>
                    <div style={{ height: 400, width: '100%', overflowX: 'auto',overflowY:'auto' }} className="table">
                        <DataGrid
                            rows={bookings}
                            columns={columns}
                            pageSize={10}
                            rowsPerPageOptions={[10]}
                            checkboxSelection
                            disableSelectionOnClick
                        />
                    </div>
                </Grid>

                <Dialog open={openCancelDialog} onClose={() => setOpenCancelDialog(false)}>
                    <DialogContent>
                        <img src={ExclamationIcon} alt="Exclamation Mark" style={{ width: '70px', height: '70px', margin: '10 auto', display: 'block' }} />
                        <Typography align="center" gutterBottom>
                            Are you sure you want to cancel this booking?
                        </Typography>
                    </DialogContent>
                    <DialogActions style={{ justifyContent: 'center' }}>
                        <Button onClick={confirmCancelBooking} style={{ color: 'white', backgroundColor: 'green', fontWeight: 'bold', marginLeft: '10px' }}>Confirm</Button>
                        <Button onClick={() => setOpenCancelDialog(false)} style={{ color: 'white', backgroundColor: 'red', fontWeight: 'bold', marginRight: '10px' }}>Cancel</Button>
                    </DialogActions>
                </Dialog>

                {showAlert && (
                    <CustomAlert message={alertMessage} type={alertType} onClose={() => setShowAlert(false)} />
                )}
            </Grid>
        </div>
    );
};

export default BookingList;
