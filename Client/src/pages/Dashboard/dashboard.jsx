import React from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale
);

const Dashboard = () => {
    // Dummy data for charts
    const eventsData = [
        { date: '2024-01-01', count: 10 },
        { date: '2024-01-02', count: 15 },
        { date: '2024-01-03', count: 8 },
    ];

    const revenueData = [
        { week: '2024-30', amount: 5000 },
        { week: '2024-31', amount: 6000 },
        { week: '2024-32', amount: 5500 },
    ];

    const topLeafAccounts = [
        { name: 'John Doe', email: 'john@example.com', phone: '1234567890' },
        { name: 'Jane Smith', email: 'jane@example.com', phone: '0987654321' },
    ];

    const latestVolunteer = {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        phone: '1122334455',
    };

    // Chart data
    const eventsChartData = {
        labels: eventsData.map(event => event.date),
        datasets: [
            {
                label: 'Events',
                data: eventsData.map(event => event.count),
                borderColor: 'blue',
                borderWidth: 2,
                fill: false,
            },
        ],
    };

    const revenueChartData = {
        labels: revenueData.map(revenue => revenue.week),
        datasets: [
            {
                label: 'Revenue',
                data: revenueData.map(revenue => revenue.amount),
                borderColor: 'green',
                borderWidth: 2,
                fill: false,
            },
        ],
    };

    return (
        <div style={{ padding: '20px' }}>
            <Typography variant="h4" gutterBottom>
                Dashboard
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{ backgroundColor: '#f0f0f0' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                New Account Sign Ups
                            </Typography>
                            <Typography variant="h4">120</Typography>
                            <Typography color="textSecondary">Sign ups</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Events by Date
                            </Typography>
                            <Line data={eventsChartData} />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Total Revenue by Week
                            </Typography>
                            <Line data={revenueChartData} />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{ backgroundColor: '#f0f0f0' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Top Leaf Point Accounts
                            </Typography>
                            {topLeafAccounts.map((account, index) => (
                                <Typography key={index} color="textSecondary">
                                    {index + 1}. {account.name} ({account.email}, {account.phone})
                                </Typography>
                            ))}
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Latest Volunteer Information
                            </Typography>
                            <Typography color="textSecondary">
                                Name: {latestVolunteer.name}
                            </Typography>
                            <Typography color="textSecondary">
                                Email: {latestVolunteer.email}
                            </Typography>
                            <Typography color="textSecondary">
                                Phone: {latestVolunteer.phone}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </div>
    );
};

export default Dashboard;
