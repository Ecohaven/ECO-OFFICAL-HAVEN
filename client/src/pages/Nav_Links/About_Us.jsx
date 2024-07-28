import React from 'react';
import { Box, Typography, Container, Grid } from '@mui/material';

import HeadingImage from '../../assets/images/aboutus.png';
import WelcomeImage from '../../assets/images/aboutus_event.jpg';
import MissionImage from '../../assets/images/aboutus_mission.jpg';

const AboutUs = () => {
    return (
        <div>

            {/* banner */}
            <div className="headbanner">
                <img src="../../src/assets/images/aboutusbanner.png" alt="Banner" />
                <h1>About Us</h1>
            </div>

            {/* heading */}
            <Container sx={{ mt: 5 }}>
                <Grid container spacing={4} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <div className="aboutus-text">
                            <Box>
                                <Typography variant="body1" paragraph style={{ textAlign: 'left' }}>
                                    About EcoHaven
                                </Typography>

                                <Typography variant="h4" component="h1" gutterBottom style={{ textAlign: 'left', color: '#14772B', fontWeight: 'bold' }}>
                                    Explore, Connect, Grow: <br></br> EcoHaven
                                </Typography>
                                <Typography variant="body1" paragraph style={{ textAlign: 'left' }}>
                                    Join workshops and events with ease. Discover new skills, meet like-minded individuals, and
                                    engage in community activities. EcoHaven bridges the gap, offering seamless connections to local clubs and vibrant,
                                    eco-friendly communities. Sign up today and explore a variety of events—all in one accessible online space.
                                </Typography>
                            </Box>
                        </div>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <div className="aboutus-image">
                            <Box display="flex" justifyContent="center">
                                <img src={HeadingImage} alt="Heading" style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }} />
                            </Box>
                        </div>
                    </Grid>
                </Grid>
            </Container>

            {/* divider */}
            <hr className="divider" />

            {/* about ecohaven */}
            <Container sx={{ mt: 5 }}>
                <Grid container spacing={4} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <div className="aboutus-image">
                            <Box display="flex" justifyContent="center">
                                <img src={WelcomeImage} alt="welcome" style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }} />
                            </Box>
                        </div>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <div className="aboutus-text">
                            <Box>
                                <Typography variant="h4" component="h1" gutterBottom style={{ textAlign: 'left', color: '#14772B', fontWeight: 'bold' }}>
                                    Welcome to EcoHaven
                                </Typography>
                                <Typography variant="body1" paragraph style={{ textAlign: 'left' }}>
                                    your go-to platform for connecting with community and resident clubs. At EcoHaven, we make
                                    it simple and convenient for you to join workshops and events hosted by local clubs. Whether
                                    you're looking to learn a new skill, meet like-minded individuals, or participate in community activities,
                                    EcoHaven is here to bridge the gap.
                                </Typography>
                            </Box>
                        </div>
                    </Grid>
                </Grid>
            </Container>

            {/* our mission */}
            <Container sx={{ mt: 5 }}>
                <Grid container spacing={4} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <div className="aboutus-text">
                            <Box>
                                <Typography variant="h4" component="h1" gutterBottom style={{ textAlign: 'left', color: '#14772B', fontWeight: 'bold' }}>
                                    Our mission
                                </Typography>
                                <Typography variant="body1" paragraph style={{ textAlign: 'left' }}>
                                    Our mission is to enhance community engagement by providing an accessible online space where you can explore
                                    a variety of events and workshops. As a trusted middleman, we facilitate seamless connections between you and
                                    the clubs, ensuring you never miss out on exciting opportunities. Join us at EcoHaven and become a part of a vibrant,
                                    eco-friendly community dedicated to growth, learning, and sustainable living.
                                </Typography>
                            </Box>
                        </div>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <div className="aboutus-image">
                            <Box display="flex" justifyContent="center">
                                <img src={MissionImage} alt="mission" style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', marginBottom: '50px' }} />
                            </Box>
                        </div>
                    </Grid>
                </Grid>
            </Container>
        </div>
    );
};

export default AboutUs;
