import React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import '../src/style/footer.css';

export default function footer() { 
    return (
        <footer className='footer-container'>
                <Box sx={{ flexGrow: 1 }} className='footer-content'>
                    <Grid container spacing={2} justifyContent="space-between">
                        <Grid item xs={12} sm={4} md={3}>
                            <div className='col col1'>
                                <h6 className='section-title'>Overview</h6>
                                <a href='/about_us' className='text-reset'>About Us</a>
                                <a href='#!' className='text-reset'>Workshops</a>
                                <a href='/events' className='text-reset'>Events</a>
                                <a href='/rewards' className='text-reset'>Rewards</a>
                                <a href='/volunteer' className='text-reset'>Volunteer</a>
                            </div>
                        </Grid>

                        <Grid item xs={12} sm={4} md={3}>
                            <div className='col col2'>
                                <h6 className='section-title'>Help & FAQs</h6>
                                <a href='/faq' className='text-reset'>FAQs</a>
                                <a href='#!' className='text-reset'>Payment methods</a>
                                <a href='#!' className='text-reset'>Refunds</a>
                                <a href='#!' className='text-reset'>Terms & Conditions</a>
                            </div>
                        </Grid>

                        <Grid item xs={12} sm={4} md={3}>
                            <div className='col col3'>
                                <h6 className='section-title'>Subscribe to learn more:</h6>
                                <p className='contact'>
                                    Be the first to get the latest news of events and workshops from us!
                                </p>

                                <div className="newsletter-form">
                                    <form>
                                        <div className="form-group">
                                            <input type="email" className="form-control" id="newsletter-email" aria-describedby="emailHelp" placeholder="Enter email here" />
                                            <button type="submit" className="btn btn-primary">Subscribe</button>
                                        </div>
                                    </form>
                                </div>

                                <h6 className='section-title'>Connect with us!</h6>
                                <p className='social'>
                                    <a href='https://www.facebook.com/MSEsingapore/' target="_blank" rel="noopener noreferrer"><img src='./src/assets/icons/facebook.png' alt='facebook' /></a>
                                    <a href='https://www.instagram.com/msesingapore/' target="_blank" rel="noopener noreferrer"><img src='./src/assets/icons/instagram.png' alt='instagram' /></a>
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
// export default function App() {
//     return (
//         <footer className='footer-container'>
//             <Box sx={{ flexGrow: 1 }} className='footer-content'>
//                 <Grid container spacing={2} justifyContent="space-between">
//                     <Grid item xs={12} sm={4} md={3}>
//                         <div className='col col1'>
//                             <h6 className='section-title'>Overview</h6>
//                             <a href='/aboutus' className='text-reset'>About Us</a>
//                             <a href='#!' className='text-reset'>Workshops</a>
//                             <a href='#!' className='text-reset'>Events</a>
//                             <a href='/reward' className='text-reset'>Rewards</a>
//                             <a href='#!' className='text-reset'>Contact Us</a>
//                         </div>
//                     </Grid>

//                     <Grid item xs={12} sm={4} md={3}>
//                         <div className='col col2'>
//                             <h6 className='section-title'>Help & FAQs</h6>
//                             <a href='/faq' className='text-reset'>FAQs</a>
//                             <a href='#!' className='text-reset'>Payment methods</a>
//                             <a href='#!' className='text-reset'>Refunds</a>
//                             <a href='#!' className='text-reset'>Terms & Conditions</a>
//                         </div>
//                     </Grid>

//                     <Grid item xs={12} sm={4} md={3}>
//                         <div className='col col3'>
//                             <h6 className='section-title'>Subscribe to learn more:</h6>
//                             <p className='contact'>
//                                 Be the first to get the latest news of events and workshops from us!
//                             </p>

//                             <div className="newsletter-form">
//                                 <form>
//                                     <div className="form-group">
//                                         <input type="email" className="form-control" id="newsletter-email" aria-describedby="emailHelp" placeholder="Enter email here" />
//                                         <button type="submit" className="btn btn-primary">Subscribe</button>
//                                     </div>
//                                 </form>
//                             </div>

//                             <h6 className='section-title'>Connect with us!</h6>
//                             <p className='social'>
//                                 <a href='https://www.facebook.com/MSEsingapore/' target="_blank" rel="noopener noreferrer"><img src='./src/assets/images/facebook.png' alt='facebook' /></a>
//                                 <a href='https://www.instagram.com/msesingapore/' target="_blank" rel="noopener noreferrer"><img src='./src/assets/images/instagram.png' alt='instagram' /></a>
//                             </p>
//                         </div>
//                     </Grid>
//                 </Grid>
//             </Box>
//             <div className='copyright-text'>
//                 © 2024 EcoHaven. All rights Reserved
//             </div>
//         </footer>
//     );
// }