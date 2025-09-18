import React from "react";
import { Card, Col, Row } from "antd";

const SobreComponent = () => {
  return (
    <div
      style={{
        backgroundColor: "#0477bf",
        minHeight: "100vh",
        width: `calc(100% - 256px)`,
        position: "absolute",
        top: 0,
        left: 255,
        padding: "50px",
        boxSizing: "border-box",
        zIndex: 1,
      }}
    >
      <div
        className="titleDes"
        style={{ textAlign: "center", color: "white", marginBottom: "50px" }}
      >
        <h1>Sobre a Educa+</h1>
        <p style={{ maxWidth: "600px", margin: "0 auto", fontSize: "18px" }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
      </div>

      <Row gutter={[16, 16]} justify="center">
        <Col xs={24} sm={8}>
          <Card
            title="Nossa Missão"
            bordered={false}
            style={{ borderRadius: "45px", textAlign: "center" }}
          >
            <p>
              <b>
                <i>Compromisso:</i>
              </b>{" "}
              Educação de qualidade e acessível. <br />
              <b>
                <i>Inovação:</i>
              </b>{" "}
              Uso de tecnologia para aprimorar o ensino. <br />
              <b>
                <i>Inclusão:</i>
              </b>{" "}
              Um ambiente acolhedor e democrático. <br />
              <b>
                <i>Excelência:</i>
              </b>{" "}
              Ensino com professores qualificados. <br />
              <b>
                <i>Transparência:</i>
              </b>{" "}
              Relação de confiança com os alunos. <br />
            </p>
            <a href="#">Ler mais</a>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            title="Nossa Visão"
            bordered={false}
            style={{ borderRadius: "45px", textAlign: "center" }}
          >
            <p>
              Ser a plataforma de referência no Brasil em preparação para o ENEM
              e concursos, <br />
              reconhecida por democratizar o acesso ao ensino de qualidade e
              capacitar os alunos <br />a atingirem seus objetivos acadêmicos e
              profissionais.
            </p>
            <a href="#">Ler mais</a>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            title="Nossos Valores"
            bordered={false}
            style={{ borderRadius: "45px", textAlign: "center" }}
          >
            <p>
              Nossa missão é oferecer um ambiente de aprendizado completo e
              acessível, <br />
              combinando tecnologia, metodologia de ensino eficiente e o suporte
              de professores especializados e qualificados. <br /> 
            </p>
            <a href="#">Ler mais</a>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SobreComponent;
