import React from 'react';
import './Modal.css'; // Importa o CSS para estilização

const Modal = ({ message, isOpen, closeModal }) => {
  if (!isOpen) return null; // Se o modal não estiver aberto, ele não renderiza nada

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={closeModal}>&times;</span>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default Modal;
