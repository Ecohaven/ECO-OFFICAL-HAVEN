import React from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const ModalComponent = ({ isOpen, onRequestClose, message }) => (
  <Modal
    isOpen={isOpen}
    onRequestClose={onRequestClose}
    contentLabel="Completion Message"
    className="modal"
    overlayClassName="modal-overlay"
  >
    <h2>Refund Request Status</h2>
    <div>{message}</div>
    <button onClick={onRequestClose}>Close</button>
  </Modal>
);

export default ModalComponent;
