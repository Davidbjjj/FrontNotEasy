import React, { useRef, useState } from "react";
import "./MinhasQuestoes.css";
import documentoImg from "../assets/documents.png";
import axios from "axios";

const MinhasQuestoesComponent = () => {
  const [mensagemSucesso, setMensagemSucesso] = useState(false);
  const fileInputRef = useRef(null);
  const questoes = Array(8).fill({
    nome: "Carlos Alberto",
    foto: "",
  });

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleUpload = (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const apiUrl = "https://bancodequestoes.onrender.com/serviceIA/processar-pdf";

    axios
      .post(apiUrl, formData)
      .then((response) => {
        setMensagemSucesso(true);
        console.log("Sucesso:", response.data);
        setTimeout(() => setMensagemSucesso(false), 3000); // Remove a mensagem após 3 segundos
      })
      .catch((error) => {
        console.error("Erro:", error.response || error.message || error);
      });
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="container">
      {mensagemSucesso && (
        <div className="alert-mensagem">
          Arquivo enviado com sucesso!
        </div>
      )}
      <div className="scanner">
        <img src={documentoImg} alt="Scanner Icon" className="scanner-icon" />
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          ref={fileInputRef}
          style={{ display: "none" }}
        />
        <button className="scanner-button" onClick={triggerFileInput}>
          Scannerar Documento
        </button>
      </div>
      <div className="questoes-container">
        {questoes.map((questao, index) => (
          <div key={index} className="questao-card">
            <p className="lista-de">Lista de</p>
            <div className="perfil">
              <img src={questao.foto} alt="Foto de perfil" className="foto" />
              <p className="nome">{questao.nome}</p>
            </div>
            <button className="acessar-button">Acessar</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MinhasQuestoesComponent;
