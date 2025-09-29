import React from 'react';
import './ProfileCard.css';

const ProfileCard = ({ 
  profile, 
  onToggleSelection, 
  onToggleDescription 
}) => {
  const { id, name, job, description, imgSrc, isSelected, isExpanded } = profile;

  const handleCardClick = () => {
    onToggleSelection(id);
  };

  const handleReadMoreClick = (e) => {
    e.stopPropagation();
    onToggleDescription(id);
  };

  return (
    <div
      className={`profile-card ${isSelected ? "selected" : ""}`}
      onClick={handleCardClick}
    >
      <img src={imgSrc} alt={`${name} profile`} className="profile-img" />
      <h2>{name}</h2>
      <h4>{job}</h4>
      <p>
        {isExpanded ? description : `${description.substring(0, 50)}...`}{" "}
        <button onClick={handleReadMoreClick} className="read-more">
          {isExpanded ? "Read Less" : "Read More"}
        </button>
      </p>
    </div>
  );
};

export default ProfileCard;