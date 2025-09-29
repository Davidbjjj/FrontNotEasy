import React from 'react';
import { Card, Space, Button, Checkbox, Form, Input, Alert } from 'antd';

const TeacherRegistrationComponent = ({ onRegister, loading, error }) => {
  const onFinish = (values) => {
    if (onRegister) {
      onRegister(values);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <div className="teacher-registration-container">
      <Space style={{ textAlign: 'center' }} direction="vertical" size={16}>
        <Card
          className="teacher-registration-card"
          headStyle={{
            borderBottom: "2px solid black",
            textAlign: "center",
          }}
        >
          {error && (
            <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />
          )}

          <Form
            name="teacherRegistration"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            style={{ maxWidth: 600 }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            disabled={loading}
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
                {
                  type: 'email',
                  message: 'Por favor, insira um email válido!',
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
                {
                  min: 6,
                  message: 'A senha deve ter pelo menos 6 caracteres!',
                },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              name="remember"
              valuePropName="checked"
              wrapperCol={{ offset: 0, span: 16 }}
              rules={[
                {
                  validator: (_, value) =>
                    value ? Promise.resolve() : Promise.reject(new Error('Você deve aceitar as políticas de privacidade')),
                },
              ]}
            >
              <Checkbox className="privacy-checkbox">
                Aceito as políticas de privacidade
              </Checkbox>
            </Form.Item>

            <Form.Item
              wrapperCol={{ offset: 0, span: 24 }}
              style={{ textAlign: 'center' }}
            >
              <Button 
                type="primary" 
                htmlType="submit"
                loading={loading}
                className="submit-button"
              >
                Cadastre-se
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Space>
    </div>
  );
};

export default TeacherRegistrationComponent;