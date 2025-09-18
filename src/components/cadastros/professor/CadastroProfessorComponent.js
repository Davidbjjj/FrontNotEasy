import React from 'react';
import { Card, Space, Button, Checkbox, Form, Input } from 'antd';
import { useNavigate } from "react-router-dom";

const App = () => {
  const navigate = useNavigate(); 

  const onFinish = (values) => {
    console.log('Success:', values);
    navigate("/home"); 
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh'
    }}>
      <Space style={{ textAlign: 'center' }} direction="vertical" size={16}>
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
            <Form.Item
              label="Usuário"
              name="username"
              rules={[
                {
                  required: true,
                  message: 'Por favor, preencha o campo!',
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Matéria 01"
              name="materia01"
              rules={[
                {
                  required: true,
                  message: 'Por favor, preencha o campo!',
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Matéria 02"
              name="materia02"
              rules={[
                {
                  required: true,
                  message: 'Por favor, preencha o campo!',
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Instituição"
              name="institution"
              rules={[
                {
                  required: true,
                  message: 'Por favor, preencha o campo!',
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  message: 'Por favor, preencha o campo!',
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Senha"
              name="password"
              rules={[
                {
                  required: true,
                  message: 'Por favor, preencha o campo!',
                },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              name="remember"
              valuePropName="checked"
              wrapperCol={{
                offset: 0,
                span: 16,
              }}
            >
              <Checkbox
                style={{ position: 'relative', right: '-60px' }}
              >
                Aceito as políticas de privacidade
              </Checkbox>
            </Form.Item>

            <Form.Item
              wrapperCol={{
                offset: 0,
                span: 24,
              }}
              style={{ textAlign: 'center' }}
            >
              <Button type="primary" htmlType="submit">
                Cadastre-se
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Space>
    </div>
  );
};

export default App;
