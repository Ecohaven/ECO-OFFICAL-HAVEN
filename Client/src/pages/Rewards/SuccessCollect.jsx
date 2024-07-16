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
        console.log('Response from backend:', response.data); // Log the response data

        if (response.data && response.data.length > 0) {
          const latestCollectionId = response.data[response.data.length - 1]?.collectionId; // Get the latest collectionId
          console.log('Fetched Collection ID:', latestCollectionId); // Log fetched collectionId

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
    <Grid container direction="column" spacing={4}>
      {/* banner */}
      <Grid item className="headbanner">
        <div className="banner-content">
          <img src="../../src/assets/images/rewardbanner.png" alt="Banner" />
          <h1>Thank you!</h1>
        </div>
      </Grid>

      {/* collection id */}
      <Grid item className="collectionid">
        <div className="id-content">
          <h1>Collection ID</h1>
          <h1 className="idnumber">{collectionId}</h1>
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
          <button className='backtohome'><a href='/home'>Back to home</a></button> {/* Adjust link as needed */}
        </div>
      </Grid>
    </Grid>
  );
}

export default Rewards;
