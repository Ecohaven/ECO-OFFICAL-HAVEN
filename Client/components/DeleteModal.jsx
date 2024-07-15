import React from 'react';
import { Modal, Box, Button } from '@mui/material';
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
        borderRadius:'30px',
        transform: 'translate(-50%, -50%)', 
        width: 500, 
        bgcolor: 'background.paper', 
        boxShadow: 24, 
        p: 4, 
        textAlign: 'center' 
      }}>
 <img src={ExclamationMarkIcon} alt='Exclamation Mark' width={'70px'} height={'70px'} style={{marginTop:'10px'}}/>
     
        <p id="delete-modal-description" style={{fontSize:'20px'}}>Are you sure you want to delete this event?</p>
        <Button variant="contained" color="error" onClick={onDelete} sx={{ m: 1 }} style={{backgroundColor:'green',width:'100px',borderColor:'2px solid black'}}>
          Yes
        </Button>
        <Button variant="contained" onClick={onClose} sx={{ m: 1 }} style={{backgroundColor:'red',width:'100px',borderColor:'2px solid black'}}>
          Cancel
        </Button>
      </Box>
    </Modal>
  );
};

export default DeleteConfirmationModal;
