import React from "react";
import '../src/style/alert.css'; 


const CustomAlert = ({ message, type, onClose, onConfirm, id }) => {
    const handleDelete = () => {
        onConfirm(id); // Pass the id to the onConfirm function
    };

    return (
        <div className="alert-container">
            <div className={`alert ${type}`}>
                <span className="message">{message}</span>
                {type === 'confirm' && (
                    <div className="button-group">
                        <button className="confirm-button" onClick={handleDelete}>Yes</button>
                        <button className="cancel-button" onClick={onClose}>Cancel</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomAlert;
