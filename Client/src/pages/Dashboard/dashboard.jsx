import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Grid, Box } from '@mui/material';
import axios from 'axios';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot, TimelineOppositeContent } from '@mui/lab';


const Dashboard = () => {
    const [newSignUpsToday, setNewSignUpsToday] = useState(0);
    const [revenueByDay, setRevenueByDay] = useState([]);
    const [highestUserLeafPoints, setHighestUserLeafPoints] = useState(null);
    const [events, setEvents] = useState([]);
    const [cancelledBookingsCount, setCancelledBookingsCount] = useState(0);
    const [totalVolunteers, setTotalVolunteers] = useState(0);

    useEffect(() => {
        axios.get('http://localhost:3001/dash/newSignUpsToday')
            .then(res => setNewSignUpsToday(res.data.newSignUpsToday.length))
            .catch(error => console.error('Error fetching new sign-ups for today:', error));

        axios.get('http://localhost:3001/dash/revenueByDay')
            .then(res => setRevenueByDay(res.data.dailyRevenue))
            .catch(error => console.error('Error fetching revenue by day:', error));

        axios.get('http://localhost:3001/dash/highestLeafPoints')
            .then(res => setHighestUserLeafPoints(res.data))
            .catch(error => console.error('Error fetching highest user leaf points:', error));

        axios.get('http://localhost:3001/dash/events')
            .then(res => setEvents(res.data.events))
            .catch(error => console.error('Error fetching events:', error));

        axios.get('http://localhost:3001/dash/cancelledBookingsCount')
            .then(res => setCancelledBookingsCount(res.data.cancelledBookingsCount))
            .catch(error => console.error('Error fetching cancelled bookings count:', error));

        axios.get('http://localhost:3001/dash/totalVolunteers')
            .then(res => setTotalVolunteers(res.data.totalVolunteers))
            .catch(error => console.error('Error fetching total volunteers:', error));
    }, []);



    return (
        <Box sx={{ padding: '20px', marginLeft: { xs: '0', md: '300px' } }}>
            <Typography variant="h4" style={{ textAlign: 'left', fontWeight: 'bold' }} gutterBottom>
                <span style={{color:'green'}}>Eco</span>Haven Dashboard
            </Typography>

            <Grid container spacing={3}>
                {/* New Account Sign Ups */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ backgroundColor: 'green', color: 'white' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                New Account Sign Ups
                            </Typography>
                            <Typography variant="h4">{newSignUpsToday}</Typography>
                            <Typography color="white">Sign ups</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Highest User Leaf Points */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ backgroundColor: 'navy', color: 'white' }}>
                        <CardContent>
                            <Typography variant="h6" style={{ color: 'white' }} gutterBottom>
                                Highest User Leaf Points
                            </Typography>
                            {highestUserLeafPoints ? (
                                <>
                                    <Typography variant="h4">{highestUserLeafPoints.name}</Typography>
                                    <Typography color="white" style={{ fontWeight: 'bold' }}>Points: {highestUserLeafPoints.leaf_points}</Typography>
                                </>
                            ) : (
                                <Typography variant="body1">Loading...</Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Cancelled Bookings Count */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ backgroundColor: 'darkred', color: 'white' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Cancelled Bookings
                            </Typography>
                            <Typography variant="h4">{cancelledBookingsCount}</Typography>
                            <Typography color="white">Users</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Volunteers count parts */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ backgroundColor: 'black', color: 'white' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Volunteers
                            </Typography>
                            <Typography variant="h4">{totalVolunteers}</Typography>
                            <Typography color="white">Users</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Line Chart for Revenue by Day */}
                <Grid item xs={12}>
                    <Card sx={{ backgroundColor: '#fff', boxShadow: 3, borderRadius: 2, p: 2 }}>
                        <CardContent>
                            <Typography variant="h5" style={{ color: 'black', fontWeight: 'bold' }} gutterBottom>
                                Revenue by Day
                            </Typography>
                            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                                Our Revenue earning by day
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart
                                    data={revenueByDay}
                                    margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                                >
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" label={{ value: 'Date', position: 'insideBottomRight', offset: -10 }} />
                                    <YAxis label={{ value: 'Revenue ($)', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="totalRevenue" stroke="#8884d8" fillOpacity={1} fill="url(#colorRevenue)" activeDot={{ r: 8 }} dot={{ r: 5, strokeWidth: 2 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Event timeline */}

                <Grid item xs={12}>
                    <Card sx={{ backgroundColor: '#fff', color: 'black', boxShadow: 3 }}>
                        <CardContent>
                            <Typography variant="h5" style={{ color: 'black', fontWeight: 'bold' }} gutterBottom>
                                Event Overview
                            </Typography>

                            {/* Legend Section */}
                            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', marginRight: '16px' }}>
                                    <TimelineDot sx={{ bgcolor: 'primary.main', width: '12px', height: '12px', marginRight: '8px' }} />
                                    <Typography variant="body2" sx={{ color: 'black', fontWeight: 'bold' }}>
                                        Active Event
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <TimelineDot sx={{ bgcolor: 'grey.500', width: '12px', height: '12px', marginRight: '8px' }} />
                                    <Typography variant="body2" sx={{ color: 'black', fontWeight: 'bold' }}>
                                        Past Event
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Events Timeline */}
                            <Timeline position="alternate">
                                {events.map((event, index) => {
                                    const eventDate = new Date(event.date);
                                    const isPastEvent = eventDate < new Date(); // Check if the event date has passed

                                    return (
                                        <TimelineItem key={index} sx={{ minHeight: '50px' }}>
                                            <TimelineOppositeContent sx={{ flex: 0.2, paddingTop: '10px', textAlign: 'center' }}>
                                                <Typography variant="body2" sx={{ color: isPastEvent ? 'grey.500' : 'primary.main', fontWeight: 'bold' }}>
                                                    {event.date}
                                                </Typography>
                                            </TimelineOppositeContent>
                                            <TimelineSeparator sx={{ flex: 'none' }}>
                                                <TimelineDot sx={{ bgcolor: isPastEvent ? 'grey.500' : 'primary.main', width: '12px', height: '12px' }} />
                                                {index < events.length - 1 && <TimelineConnector sx={{ bgcolor: isPastEvent ? 'grey.500' : 'inherit' }} />}
                                            </TimelineSeparator>
                                            <TimelineContent sx={{ flex: 0.8, padding: '5px 0' }}>
                                                <Card sx={{ backgroundColor: isPastEvent ? '#e0e0e0' : '#f5f5f5', padding: '5px', borderRadius: '8px' }}>
                                                    <Typography variant="subtitle1" style={{ color: isPastEvent ? 'grey' : 'black', fontSize: '1rem', fontWeight: 'bold' }}>
                                                        {event.eventName}
                                                    </Typography>
                                                </Card>
                                            </TimelineContent>
                                        </TimelineItem>
                                    );
                                })}
                            </Timeline>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;
