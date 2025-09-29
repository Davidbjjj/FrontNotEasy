import React from "react";
import { Card, Space, Button, Checkbox, Form, Input, Alert } from "antd";

const RegistrationComponent = ({ onRegister, loading, error, success }) => {
  const onFinish = (values) => {
    if (onRegister) {
      onRegister(values);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div className="registration-container">
      <Space direction="vertical" size={16}>
        <Card className="registration-card">
          {error && (
            <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />
          )}
          
          {success && (
            <Alert message="Cadastro realizado com sucesso!" type="success" showIcon style={{ marginBottom: 16 }} />
          )}

          <div className="registration-content">
            <div className="registration-form">
              <h2 className="registration-title">Cadastre-se</h2>

              <Form
                name="registration"
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
                layout="vertical"
                disabled={loading || success}
              >
                <Form.Item
                  label="Usuário"
                  name="nome"
                  rules={[
                    { required: true, message: "Por favor, preencha o campo!" },
                  ]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  label="Instituição"
                  name="instituicao"
                  rules={[
                    { required: true, message: "Por favor, preencha o campo!" },
                  ]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: "Por favor, preencha o campo!" },
                    { type: 'email', message: 'Por favor, insira um email válido!' }
                  ]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  label="Senha"
                  name="senha"
                  rules={[
                    { required: true, message: "Por favor, preencha o campo!" },
                    { min: 6, message: 'A senha deve ter pelo menos 6 caracteres!' }
                  ]}
                >
                  <Input.Password />
                </Form.Item>

                <Form.Item
                  label="Confirmar senha"
                  name="confirmarSenha"
                  dependencies={['senha']}
                  rules={[
                    { required: true, message: "Por favor, confirme sua senha!" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('senha') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('As senhas não coincidem!'));
                      },
                    }),
                  ]}
                >
                  <Input.Password />
                </Form.Item>

                <Form.Item
                  name="politicas"
                  valuePropName="checked"
                  rules={[
                    {
                      validator: (_, value) =>
                        value ? Promise.resolve() : Promise.reject(new Error('Você deve aceitar as políticas de privacidade')),
                    },
                  ]}
                >
                  <Checkbox>Aceito as políticas de privacidade</Checkbox>
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    className="registration-button"
                  >
                    Confirmar
                  </Button>
                </Form.Item>
              </Form>
            </div>

            <div className="registration-image">
              <img
                src="/cadAluno.jpg"
                alt="Cadastro"
                className="registration-img"
              />
            </div>
          </div>
        </Card>
      </Space>
    </div>
  );
};

export default RegistrationComponent;