import React from 'react';
import { Modal, Box, Button, Typography } from '@mui/material';
import ExclamationMarkIcon from '../src/assets/icons/exclamation-mark.png';

const DeleteConfirmationModal = ({ open, onClose, onDelete }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="delete-modal-title"
      aria-describedby="delete-modal-description"
    >
      <Box sx={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%',
        transform: 'translate(-50%, -50%)', 
        width: 400, 
        bgcolor: 'background.paper', 
        boxShadow: 24, 
        p: 4, 
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <img 
          src={ExclamationMarkIcon} 
          alt='Exclamation Mark' 
          width={'70px'} 
          height={'70px'} 
          style={{ marginBottom: '16px' }} 
        />
        <Typography id="delete-modal-description" variant="h6" component="p" sx={{ mb: 3 }}>
          Are you sure you want to delete this event?
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button 
            variant="contained" 
            color="success" 
            onClick={onDelete} 
            sx={{ 
              width: '100px', 
              borderColor: 'black', 
              border: '2px solid black',
              backgroundColor: '#28a745', 
              color: 'white',
              '&:hover': {
                backgroundColor: '#218838',
              }
            }}
          >
            Yes
          </Button>
          <Button 
            variant="contained" 
            onClick={onClose} 
            sx={{ 
              width: '100px', 
              borderColor: 'black', 
              border: '2px solid black',
              backgroundColor: '#dc3545', 
              color: 'white',
              '&:hover': {
                backgroundColor: '#c82333',
              }
            }}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default DeleteConfirmationModal;
