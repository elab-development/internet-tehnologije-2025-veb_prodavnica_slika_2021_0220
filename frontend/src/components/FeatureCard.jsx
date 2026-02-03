import React from 'react'

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="feature-card h-100 d-flex flex-column align-items-center text-center">
      <div className="icon-wrapper mb-3">
        <span className="icon-svg-container">
            {icon}
        </span>
      </div>
      <h5 className="feature-title mb-2">{title}</h5>
      <p className="feature-text text-muted mb-0">{description}</p>
    </div>
  )
}

export default FeatureCard