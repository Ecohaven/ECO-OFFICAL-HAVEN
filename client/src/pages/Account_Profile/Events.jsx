import React, { useEffect, useState } from 'react'
import { useParams, BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import http from '/src/http';
import { Grid, List, ListItem, ListItemText, TextField, Container, Button, Divider, Dialog, DialogTitle, DialogContent, DialogContentText } from '@mui/material';
import Account_Nav from './Account_Nav';

function Account_Profile_Events() {
  return (
    <Container>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Account_Nav />
        </Grid>
        <Grid item xs={12} md={9}>
          <div>events</div>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Account_Profile_Events;