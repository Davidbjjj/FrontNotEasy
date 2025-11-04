import React, { useState } from "react";
import { Card, Space, Button, Checkbox, Form, Input } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Cadastro = () => {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [instituicao, setInstituicao] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const handleEnviar = async () => {
    const data = {
      nome: nome.toString(),
      email: email.toString(),
      senha: senha.toString(),
      instituicao: instituicao.toString(),
    };

    try {
      const response = await axios.post(
        "https://backnoteasy-production.up.railway.app/usuarios/cadastro",
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        console.log("Cadastrado com sucesso");
        navigate("/home");
      } else {
        console.error("Erro ao cadastrar");
      }
    } catch (error) {
      console.error("Erro na requisição", error);
    }
  };

  const onFinish = () => {
    handleEnviar();
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#011C40",
        padding: 0,
        margin: 0,
        height: "100%",
        overflow: "hidden",
      }}
    >
      <Space direction="vertical" size={16}>
        <Card
          style={{
            top: "-4 px",
            width: "600px",
            height: "640px",
            borderRadius: "15px",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.3)",
            background: "linear-gradient(145deg, #0349A6, #011C40)",
            border: "2px solid white",
            padding: "10px",
            margin: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px",
            }}
          >
            <div style={{ flex: 1 }}>
              <h2
                style={{
                  color: "white",
                  textAlign: "center",
                  marginBottom: "10px",
                  position: "relative",
                  right: "-110px",
                  top: "-25px",
                }}
              >
                Cadastre-se
              </h2>

              <Form
                name="basic"
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
                layout="vertical"
              >
                <Form.Item
                  label="Usuário"
                  name="username"
                  rules={[
                    { required: true, message: "Por favor, preencha o campo!" },
                  ]}
                >
                  <Input
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                  />
                </Form.Item>

                <Form.Item
                  label="Instituição"
                  name="institution"
                  rules={[
                    { required: true, message: "Por favor, preencha o campo!" },
                  ]}
                >
                  <Input
                    value={instituicao}
                    onChange={(e) => setInstituicao(e.target.value)}
                  />
                </Form.Item>

                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: "Por favor, preencha o campo!" },
                  ]}
                >
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Form.Item>

                <Form.Item
                  label="Senha"
                  name="password"
                  rules={[
                    { required: true, message: "Por favor, preencha o campo!" },
                  ]}
                >
                  <Input.Password
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                  />
                </Form.Item>

                <Form.Item
                  label="Confirmar senha"
                  name="confirm-password"
                  rules={[
                    {
                      required: true,
                      message: "Por favor, confirme sua senha!",
                    },
                  ]}
                >
                  <Input.Password
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                  />
                </Form.Item>

                <Form.Item>
                  <Checkbox>Aceito as políticas de privacidade</Checkbox>
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    style={{
                      width: "100%",
                      position: "relative",
                      right: "-320px",
                      top: "-175px",
                      width: "150px",
                    }}
                  >
                    Confirmar
                  </Button>
                </Form.Item>
              </Form>
            </div>

            <div style={{ flex: 1, textAlign: "center" }}>
              <img
                src="/cadAluno.jpg"
                alt="Cadastro"
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  borderRadius: "15px",
                  position: "relative",
                  right: "-29px",
                  borderRadius: "75px",
                  top: "-75px",
                }}
              />
            </div>
          </div>
        </Card>
      </Space>
    </div>
  );
};

export default Cadastro;
