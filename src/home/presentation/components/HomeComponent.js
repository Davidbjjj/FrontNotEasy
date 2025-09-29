import React from 'react';
import ProfileCard from './ProfileCard';
import './HomeComponent.css';

const HomeComponent = ({ 
  profiles, 
  isToggleOn, 
  onToggleProfileSelection, 
  onToggleProfileDescription, 
  onToggleSwitch,
  loading,
  error 
}) => {
  const navItems = ['Home', 'Explore', 'Provas'];

  if (loading) {
    return <div className="loading">Carregando perfis...</div>;
  }

  if (error) {
    return <div className="error">Erro: {error}</div>;
  }

  return (
    <div className="home-container">
      <nav className="navbar">
        <ul>
          {navItems.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </nav>

      <div className="main-content">
        <div className='contentin'>
          <div className="text-section">
            <h1>Educa+</h1>
            <p>
              Lorem ipsum dolor sit amet et delectus accommodare his consul copiosae 
              legendos at vix ad putent delectus delicata usu. Vidit dissentiet eos 
              cu eum an brute copiosae hendrerit.
            </p>
          </div>

          <div className="card">
            <h2>Social Education</h2>
            <p>Lorem ipsum dolor sit amet et delectus</p>
            <button>Button</button>
          </div>
        </div>
      </div>

      <div className="toggle-switch">
        <span>Sample Text</span>
        <div className="switch" onClick={onToggleSwitch}>
          <div className={`toggle ${isToggleOn ? 'on' : ''}`}></div>
        </div>
      </div>
      
      <h1>Perfis</h1>
      <div className="profile-container">
        {profiles.map(profile => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            onToggleSelection={onToggleProfileSelection}
            onToggleDescription={onToggleProfileDescription}
          />
        ))}
      </div>
    </div>
  );
};

export default HomeComponent;