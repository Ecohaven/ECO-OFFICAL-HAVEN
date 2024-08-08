import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Grid, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import '../../style/rewards/successcollect.css';

function Rewards() {
  const [collectionId, setCollectionId] = useState('');

  useEffect(() => {
    const fetchCollectionId = async () => {
      try {
        const response = await axios.get('http://localhost:3001/collect/collectionIds');
        console.log('Response from backend:', response.data);

        if (response.data && response.data.length > 0) {
          const latestCollectionId = response.data[response.data.length - 1]?.collectionId; // Get the latest collectionId
          console.log('Fetched Collection ID:', latestCollectionId);

          if (latestCollectionId) {
            setCollectionId(latestCollectionId.toString());
            localStorage.setItem('collectionId', latestCollectionId.toString());
          } else {
            console.error('No collection ID found in response data');
          }
        } else {
          console.error('No collection IDs found in response');
        }
      } catch (error) {
        console.error('Error fetching collection IDs:', error);
      }
    };

    fetchCollectionId();
  }, []);

  return (
    <div>
      {/* Banner */}
      <div className="rewardbanner">
        <img src="../../src/assets/images/successbanner.png" alt="Banner" />
      </div>

      <Grid container direction="column" spacing={4}>

        {/* collection id */}
        <Grid item className="collectionid">
          <div className="id-content">
            <h1 style={{ marginTop: "-30px" }}>Collection ID</h1>
            <h1 className="idnumber">{collectionId}</h1>
          </div>
        </Grid>

        {/* collection id */}
        <Grid item>
          <div>
            <p className='summarypage'>You can find all your collection details inside profile page, under 'Rewards'</p>
          </div>
        </Grid>

        {/* collection detail */}
        <Grid item className="detail">
          <div className="detail-content">
            <h2>Please remember the collection details</h2>
            <p>Potong Pasir Community Club</p>
            <p>6 Potong Pasir Ave 2, Singapore 358361</p>
            <p>Monday - Friday: <span className='time'>11:00am - 8:00pm</span></p>
            <p>Saturday & Sunday: <span className='time'>12:00pm - 4:00pm</span></p>
            <p className='extra'>*please collect within a week</p>

            {/* Google Maps Embed */}
            <div className="map-container" style={{ marginTop: '30px', height: '450px', marginBottom: '30px' }}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.7391384896086!2d103.864573974472!3d1.3326563616319074!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da17788fd6578d%3A0xe39820494864ff1c!2sPotong%20Pasir%20Community%20Club!5e0!3m2!1sen!2ssg!4v1723039673994!5m2!1sen!2ssg"
                width="50%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Map of Potong Pasir Community Club"
              ></iframe>
            </div>

            <button className='backtohome'><a href='/home'>Back to home</a></button>
          </div>
        </Grid>
      </Grid>
    </div>
  );
}

export default Rewards;
