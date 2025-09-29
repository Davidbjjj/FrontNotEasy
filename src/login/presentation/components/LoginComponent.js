import React from "react";
import { Card, Space, Button, Checkbox, Form, Input, Alert } from "antd";
import { Link } from "react-router-dom";

const LoginComponent = ({ onLogin, loading, error }) => {
  const onFinish = (values) => {
    if (onLogin) {
      onLogin(values);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (  
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Space style={{ textAlign: "center" }} direction="vertical" size={16}>
        <Card
          headStyle={{
            borderBottom: "2px solid black",
            textAlign: "center",
          }}
          style={{
            width: 400,
            textAlign: "center",
            border: "2px solid black",
            padding: "20px",
          }}
        >
          {error && (
            <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />
          )}
          
          <Form
            name="basic"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            style={{ maxWidth: 600 }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
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
              name="password"
              rules={[
                { required: true, message: "Por favor, preencha o campo!" },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              name="remember"
              valuePropName="checked"
              wrapperCol={{ offset: 0, span: 16 }}
            >
              <Checkbox style={{ position: "relative", right: "-60px" }}>
                Aceito as políticas de privacidade
              </Checkbox>
            </Form.Item>

            <Form.Item
              wrapperCol={{ offset: 0, span: 24 }}
              style={{ textAlign: "center" }}
            >
              <Button type="primary" htmlType="submit" loading={loading}>
                Login
              </Button> 
              <br /><br /><br />    
              <Link to="/redefinir">Esqueceu a senha?</Link>
            </Form.Item>
          </Form>
        </Card>
      </Space>
    </div>
  );
};

export default LoginComponent;