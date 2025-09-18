import React, {useState} from 'react';
import './Home.css';

const ProfileCard = ({ name, job, description, imgSrc }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  const toggleDescription = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleSelection = () => {
    setIsSelected(!isSelected);
  };

  return (
    <div
      className={`profile-card ${isSelected ? "selected" : ""}`}
      onClick={toggleSelection}
    >
      <img src={imgSrc} alt={`${name} profile`} className="profile-img" />
      <h2>{name}</h2>
      <h4>{job}</h4>
      <p>
        {isExpanded ? description : `${description.substring(0, 50)}...`}{" "}
        <button onClick={toggleDescription} className="read-more">
          {isExpanded ? "Read Less" : "Read More"}
        </button>
      </p>
    </div>
  );
};

const HomeComponent = () => {
  return (
    <div className="home-container">
      <nav className="navbar">
        <ul>
          <li>Home</li>
          <li>Explore</li>
          <li>Provas</li>
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
        <div className="switch">
          <div className="toggle"></div>
        </div>
      </div>
      <h1>Perfis</h1>
      <div className="profile-container">
        <ProfileCard
          name="Jose Almeida"
          job="ETE PORTO DIGITAL"
          description=" Lorem ipsum dolor sit amet et delectus accommodare his consul copiosae 
            legendos at vix ad putent delectus delicata usu. Vidit dissentiet eos 
            cu eum an brute copiosae hendrerit."
          imgSrc="https://static.vecteezy.com/ti/vetor-gratis/p1/11186876-simbolo-de-foto-de-perfil-masculino-vetor.jpg"
        />
        <ProfileCard
          name="Jose Almeida"
          job="ETE PORTO DIGITAL"
          description=" Lorem ipsum dolor sit amet et delectus accommodare his consul copiosae 
            legendos at vix ad putent delectus delicata usu. Vidit dissentiet eos 
            cu eum an brute copiosae hendrerit."
          imgSrc="https://static.vecteezy.com/ti/vetor-gratis/p1/11186876-simbolo-de-foto-de-perfil-masculino-vetor.jpg"
        />

        <ProfileCard
          name="Jose Almeida"
          job="ETE PORTO DIGITAL"
          description=" Lorem ipsum dolor sit amet et delectus accommodare his consul copiosae 
            legendos at vix ad putent delectus delicata usu. Vidit dissentiet eos 
            cu eum an brute copiosae hendrerit."
          imgSrc="https://static.vecteezy.com/ti/vetor-gratis/p1/11186876-simbolo-de-foto-de-perfil-masculino-vetor.jpg"
        />

        <ProfileCard
          name="Jose Almeida"
          job="ETE PORTO DIGITAL"
          description=" Lorem ipsum dolor sit amet et delectus accommodare his consul copiosae 
            legendos at vix ad putent delectus delicata usu. Vidit dissentiet eos 
            cu eum an brute copiosae hendrerit."
          imgSrc="https://static.vecteezy.com/ti/vetor-gratis/p1/11186876-simbolo-de-foto-de-perfil-masculino-vetor.jpg"
        />

        <ProfileCard
          name="Jose Almeida"
          job="ETE PORTO DIGITAL"
          description=" Lorem ipsum dolor sit amet et delectus accommodare his consul copiosae 
            legendos at vix ad putent delectus delicata usu. Vidit dissentiet eos 
            cu eum an brute copiosae hendrerit."
          imgSrc="https://static.vecteezy.com/ti/vetor-gratis/p1/11186876-simbolo-de-foto-de-perfil-masculino-vetor.jpg"
        />

        <ProfileCard
          name="Jose Almeida"
          job="ETE PORTO DIGITAL"
          description=" Lorem ipsum dolor sit amet et delectus accommodare his consul copiosae 
            legendos at vix ad putent delectus delicata usu. Vidit dissentiet eos 
            cu eum an brute copiosae hendrerit."
          imgSrc="https://static.vecteezy.com/ti/vetor-gratis/p1/11186876-simbolo-de-foto-de-perfil-masculino-vetor.jpg"
        />

      </div>

    </div>
  );
};

export default HomeComponent;
