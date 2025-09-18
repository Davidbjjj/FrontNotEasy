import React from "react";
import { useNavigate } from "react-router-dom";
import "./Ocupacao.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="container">
      <h1 className="title">Escolha o tipo de conta abaixo</h1>

      <div className="cardContainer">
        <div className="ant-card">
          <img
            src={`${process.env.PUBLIC_URL}/ALUNO.png`}
            alt="Aluno"
            className="card-image"
          />
          <button
            className="btn-aluno"
            onClick={() => navigate("/formaluno")}
          >
            Estou aqui pra aprender
          </button>
        </div>

        <div className="ant-card">
          <img
            src={`${process.env.PUBLIC_URL}/PROFESSOR.png`}
            alt="Professor"
            className="card-image"
          />
          <button
            className="btn-professor"
            onClick={() => navigate("/formprofessor")}
          >
            Estou aqui para ensinar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
