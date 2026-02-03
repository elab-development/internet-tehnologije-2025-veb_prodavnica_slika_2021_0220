import React from "react";
import { FaTimes } from "react-icons/fa";
import "./Modals.css"; 

const LogoutModal = ({ show,onClose, onConfirm }) => {
  
  if(!show){
    return null;
  }
  
  return (
    <div className="modal-overlay">
      <div className="auth-modal">

        {/* className="mb-2" */}
        <div className="auth-header">
          <h3 className="mb-2">Odjava</h3>
          <p>
            Da li ste sigurni da želite da se odjavite?
          </p>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="auth-body text-center">
          
          <div className="d-flex gap-2 justify-content-center">
            <button
                className="auth-btn"
                onClick={() => {
                onConfirm();   // logout
                onClose();     // zatvori modal
                // window.dispatchEvent(new Event("auth-change"));
                }}
            >
                Da, odjavi me
            </button>

            <button
                className="auth-btn"
                onClick={onClose}
            >
                Otkaži
            </button>
          </div>
          
        </div>

      </div>
    </div>
  );
};

export default LogoutModal;
