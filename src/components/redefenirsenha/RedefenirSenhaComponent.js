import React from "react";
import { Card, Space, Button, Form, Input } from "antd";
import { useNavigate } from "react-router-dom";

const RedefenirSenha = () => {
  const navigate = useNavigate();

  const onFinish = (values) => {
    console.log("Success:", values);
    navigate("/home");
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
          <Form
            name="basic"
            labelCol={{
              span: 8,
            }}
            wrapperCol={{
              span: 16,
            }}
            style={{
              maxWidth: 600,
            }}
            initialValues={{
              remember: true,
            }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <div className="aviso">
                <h4>Insira seu email para a recuperação</h4>
            </div>

            <Form.Item
              label="Email"
              style={{position: 'relative', top: '30px', right: '50px'}}
              name="email"
              rules={[
                {
                  required: true,
                  message: "Por favor, preencha o campo!",
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              wrapperCol={{
                offset: 0,
                span: 24,
              }}
              style={{ textAlign: "center" }}
            >
              <Button style={{position: 'relative', top: '50px'}} type="primary" htmlType="submit">
                Enviar email
              </Button> 
              <br /><br /><br />    
              
              
            </Form.Item>
          </Form>
        </Card>
      </Space>
    </div>
  );
};

export default RedefenirSenha;
