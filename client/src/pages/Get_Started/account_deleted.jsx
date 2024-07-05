// This page is displayed when the user deletes their account.
import React from 'react'
import { Box, Button, Typography  } from '@mui/material';
import { Link } from 'react-router-dom';

function Account_Deleted() {
  return (
    <Box>
        <div>
        <Typography variant="h5" sx={{ my: 2 }}>
            Your account has been deleted
        </Typography>
        <Typography variant='body1' sx={{ my: 2 }} id='delete_account_text'>
          We hope to see you again!
        </Typography>
        <Link to="/" style={{ textDecoration: 'none' }}>
            <Button variant='contained'>
                Back to Home
            </Button>
        </Link>
        </div>
    </Box>
  )
}

export default Account_Deleted;