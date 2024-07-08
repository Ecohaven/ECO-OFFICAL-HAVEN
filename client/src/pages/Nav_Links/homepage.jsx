import React from 'react';
import { Box, Grid, Button, Typography } from '@mui/material';
import { styled } from '@mui/system';
import '../../src/assets/style/frontend/homepage.css';
import '../../src/assets/images/Reviews_Bg.jpg';
import Navbar from '../../components/navbar';
import Footer from '../../components/footer';
import Avatar from '@mui/material/Avatar';


const Item = styled(Box)(({ theme }) => ({
  backgroundColor: '#fff',
  padding: theme.spacing(2),
  borderRadius: '12px',
  textAlign: 'center',
  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
width:'300px',
  height: '400px',
}));

const EventCard = ({image, title, date, details }) => (
  <Item>
    <img src={image} alt={title} style={{ width: '100%', borderRadius: '8px 8px 0 0', objectFit: 'cover', height: '200px' }} />
    <Typography variant="h6" gutterBottom>{title}</Typography>
    <Typography variant="body2" gutterBottom>{date}</Typography>
    <Typography variant="body2" gutterBottom>{details}</Typography>
    <Button variant="contained" className="view">View</Button>
  </Item>
);

/* Defining instance for three column image */
const LogoItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100px', 
}));

function Homepage() {
  return (
    <div className="container">
      <div className='stylebar'>
        <Navbar />
        <div className="ban">
          <h1 style={{color:'white',fontWeight:'bold',marginLeft:'30px',marginTop:'40px'}}>EcoHaven, your Ecofriendly Event Space.</h1>
        </div>
        <section className='latestEvents'>
          <h2>The Newest Events & Workshops</h2>
          <span>Here are the latest events / workshops happening in Singapore!</span>
        </section>

        {/* Content for the latest events happening */}
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' ,marginLeft:'400px',marginTop:'40px',marginBottom:'150px'}}>
          <Grid container spacing={10} justifyContent="center" alignItems="center" >
            <Grid item xs={12} sm={6} md={7}>
              <EventCard 
                image="https://via.placeholder.com/150" 
                title="Event 1" 
                date="June 24, 2024" 
                details="Details of Event 1" 
              />
            </Grid>
            <Grid item xs={12} sm={6} md={5}>
                <EventCard 
                image="https://via.placeholder.com/150" 
                title="Event 2" 
                date="June 24, 2024" 
                details="Details of Event 1" 
              />
            </Grid>
            <Grid item xs={12} sm={6} md={7}>
                  <EventCard 
                image="https://via.placeholder.com/150" 
                title="Event 3" 
                date="June 24, 2024" 
                details="Details of Event 1" 
              />
            </Grid>
            <Grid item xs={12} sm={8} md={5}>
                   <EventCard 
                image="https://via.placeholder.com/150" 
                title="Event 4" 
                date="June 24, 2024" 
                details="Details of Event 1" 
              />
            </Grid>
          </Grid>
        </Box>
 {/* Content for the "why us" section */}
<section className='whyus'>
  <div className="chooseus">
    <h1 style={{ fontWeight: 'bold', marginLeft: '240px', marginTop: '70px', color: 'black',textAlign:'center' }}>Why choose us?</h1>
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '200px'}}>
      <div className="bubble" style={{marginRight:'40px'}}>
        <Avatar
          alt="Remy Sharp"
          src="/static/images/avatar/1.jpg"
          sx={{ width: 80, height: 80 }}
        />
        <p className="bubble-text">Expert Team</p>
      </div>
      <div className="bubble" style={{marginRight:'40px'}}>
        <Avatar
          alt="Remy Sharp"
          src="/static/images/avatar/1.jpg"
          sx={{ width: 80, height: 80 }}
        />
        <p className="bubble-text">Quality Service</p>
      </div>
      <div className="bubble" style={{marginRight:'50px'}}>
        <Avatar
          alt="Remy Sharp"
          src="/static/images/avatar/1.jpg"
          sx={{ width: 80, height: 80 }}
        />
        <p className="bubble-text">Customer Satisfaction</p>
      </div>
      <div className="bubble" style={{marginRight:'50px'}}>
        <Avatar
          alt="Remy Sharp"
          src="/static/images/avatar/1.jpg"
          sx={{ width: 80, height: 80 }}
        />
        <p className="bubble-text">Innovation</p>
      </div>
    </div>
  </div>
</section>



 {/* Content for the "Customer reviews " section */}
        <section className='customerreviews'>
<section className='whyus'>
 <h2 style={{color:'green',fontWeight:'bold',marginLeft:'-90px',width:'500px',textAlign:'center',marginTop:'-90px',fontSize:'40px'}}>Customer Reviews</h2>
<i style={{textAlign:'center',marginLeft:'-20px'}}>What does our customer think about us?</i>  
<div className="review">
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '200px'}}>
      <div className="bubble" style={{marginRight:'40px'}}>
        <Avatar
          alt="Remy Sharp"
          src="/static/images/avatar/1.jpg"
          sx={{ width: 80, height: 80 }}
        />
        <p className="bubble-text">Expert Team</p>
      </div>
      <div className="bubble" style={{marginRight:'40px'}}>
        <Avatar
          alt="Remy Sharp"
          src="/static/images/avatar/1.jpg"
          sx={{ width: 80, height: 80 }}
        />
        <p className="bubble-text">Quality Service</p>
      </div>
      <div className="bubble" style={{marginRight:'50px'}}>
        <Avatar
          alt="Remy Sharp"
          src="/static/images/avatar/1.jpg"
          sx={{ width: 80, height: 80 }}
        />
        <p className="bubble-text">Customer Satisfaction</p>
      </div>
      <div className="bubble" style={{marginRight:'50px'}}>
        <Avatar
          alt="Remy Sharp"
          src="/static/images/avatar/1.jpg"
          sx={{ width: 80, height: 80 }}
        />
        <p className="bubble-text">Innovation</p>
      </div>
    </div>
  </div>
</section>
</section>

 {/* Content for the "Our Partners" section */}
    <section className='ourpartners'>
          <h2 style={{color:'green',fontWeight:'bold',marginLeft:'220px',width:'500px',textAlign:'center',marginTop:'-90px',fontSize:'40px'}}>Our Partners</h2>
          <p style={{marginLeft:'200px',textAlign:'center',width:'500px',marginBottom:'50px'}}>Special thanks to all!</p>
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center',marginBottom:'50px' }}>
            <Grid container spacing={3} justifyContent="center" className='logo'>
              <Grid item xs={30} sm={4}>
                <LogoItem>
                  <img src="../src/assets/icons/cc_logo.png" alt="Logo 1" style={{ maxWidth: '150%', height: 'auto',marginRight:'100px' }} />
                </LogoItem>
<br></br>
              </Grid>
              <Grid item xs={30} sm={4}>
                <LogoItem>
                  <img src="../src/assets/icons/rc_logo.png" alt="Logo 2" style={{ maxWidth: '150%', height: 'auto',marginLeft:'100px'}} />
                </LogoItem>
              </Grid>
              <Grid item xs={30} sm={4}>
                <LogoItem>
                  <img src="../src/assets/icons/rn_logo.png" alt="Logo 3" style={{ maxWidth: '150%', height: 'auto',marginLeft:'300px' }} />
                </LogoItem>
              </Grid>
            </Grid>
          </Box>
        </section>
      </div>
      <Footer />
    </div>
  );
}

export default Homepage;
