import React from 'react';
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

// Ovo je tvoja reusable komponenta
const FaqItem = ({ question, answer, isOpen, onClick }) => {
  return (
    <div 
      className={`faq-card mb-3 ${isOpen ? 'active' : ''}`}
      onClick={onClick}
    >
      {/* Pitanje (Header) */}
      <div className="faq-header d-flex justify-content-between align-items-center p-4">
        <h5 className="m-0 font-serif question-text">{question}</h5>
        <span className="faq-icon"> <FiChevronDown /> 
          {/* {isOpen ? <FiChevronUp /> : <FiChevronDown />} */}
        </span>
      </div>

      {/* Odgovor (Body) */}
      <div className="faq-body">
        <div className="p-4 pt-0 text-muted">
          {answer}
        </div>
      </div>
    </div>
  );
};

export default FaqItem;