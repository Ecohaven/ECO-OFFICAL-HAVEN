import React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { Facebook, Instagram } from '@mui/icons-material'; // Import MUI icons
import '../src/style/footer.css';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '../src/http';

function Footer() {
    const subscribe = useFormik({
        initialValues: {
            email: ''
        },
        validationSchema: yup.object({
            email: yup.string().email().required("This is a required field")
        }),
        onSubmit: (data, { resetForm }) => {
            data.email = data.email.trim();

            const payload = {
                email: data.email
            };

            http.post('/subscribe/subscription', payload)
                .then(response => {
                    resetForm();
                    console.log(response.data);
                })
                .catch(error => {
                    console.error(error.response.data);
                });
        }
    });

    return (
        <footer className='footer-container'>
            <Box sx={{ flexGrow: 1 }} className='footer-content'>
                <Grid container spacing={2} justifyContent="space-between">
                    <Grid item xs={12} sm={4} md={3}>
                        <div className='col col1'>
                            <h6 className='section-title'>Overview</h6>
                            <a href='/about_us' className='links'>About Us</a>
                            <a href='/events' className='links'>Events</a>
                            <a href='/rewards' className='links'>Rewards</a>
                        </div>
                    </Grid>

                    <Grid item xs={12} sm={4} md={3}>
                        <div className='col col2'>
                            <h6 className='section-title'>Help & FAQs</h6>
                            <a href='/faq' className='links'>FAQs</a>
                            <a href='/volunteer' className='links'>Volunteer</a>
                        </div>
                    </Grid>

                    <Grid item xs={12} sm={4} md={4}>
                        <div className='col col3'>
                            <h6 className='section-title'>Subscribe to learn more:</h6>
                            <p className='contact'>
                                Be the first to get the latest news of events and workshops from us!
                            </p>

                            <div className="newsletter-form">
                                <form onSubmit={subscribe.handleSubmit}>
                                    <div>
                                        <div className="form-group">
                                            <input 
                                                type="email" 
                                                className="form-control" 
                                                id="newsletter-email" 
                                                name='email' 
                                                aria-describedby="emailHelp" 
                                                placeholder="Enter email here"
                                                value={subscribe.values.email}
                                                onChange={subscribe.handleChange}
                                                onBlur={subscribe.handleBlur}
                                            />
                                            <button type="submit" className="btn btn-primary">Subscribe</button>
                                        </div>
                                        {subscribe.touched.email && subscribe.errors.email ? (
                                            <div className="error-message" style={{ color: 'red', marginTop: '5px' }}>
                                                {subscribe.errors.email}
                                            </div>
                                        ) : null}
                                    </div>
                                </form>
                            </div>

                            <h6 className='section-title'>Connect with us!</h6>
                            <p className='social'>
                                <a href='https://www.facebook.com/MSEsingapore/' target="_blank" rel="noopener noreferrer">
                                    <Facebook style={{ color: 'white', fontSize: 35, margin: '0 10px' }} />
                                </a>
                                <a href='https://www.instagram.com/msesingapore/' target="_blank" rel="noopener noreferrer">
                                    <Instagram style={{ color: 'white', fontSize: 35, margin: '0 10px' }} />
                                </a>
                            </p>
                        </div>
                    </Grid>
                </Grid>
            </Box>
            <div className='copyright-text'>
                © 2024 EcoHaven. All rights Reserved
            </div>
        </footer>
    );
}

export default Footer;
