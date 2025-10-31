import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Typography,
  Button,
  Space,
  Form,
  Input,
  message,
} from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import styles from "./Login.module.css";
import { authService } from "../../services/api/authService"; 


const { Title, Text } = Typography;
const BRAND_LOGO = "/LogoGGE.svg";
const HERO_IMAGE = "/Alunos.svg";

export default function LoginPage({ onSubmit, onForgotPassword, onRegister }) {
  const [form] = Form.useForm();
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  const handleValuesChange = (_, allValues) => {
    const hasEmpty = !allValues.email || !allValues.password;
    setIsButtonDisabled(hasEmpty);
  };


const handleFinish = async (values) => {
  try {
    await authService.login(values);
    message.success("Login realizado com sucesso!");
    navigate("/listas"); // redirecione para onde quiser após o login
  } catch (error) {
    message.error(error.message || "Erro ao fazer login. Tente novamente.");
  }
};


  const handleFinishFailed = ({ errorFields }) => {
    if (errorFields.length > 0) {
      message.error(errorFields[0].errors[0]);
    }
  };

  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <Row gutter={0} className={styles.wrapper}>
        <Col xs={0} md={12} className={styles.leftCol}>
          <div className={styles.leftSide}>
            <div className={styles.heroContainer}>
              <img
                src={HERO_IMAGE}
                alt="Estudantes e professor com tablets"
                className={styles.heroImage}
              />
              <div className={styles.logoOverlay}>
                <img src={BRAND_LOGO} alt="Logo GGE" />
                <Text className={styles.bubbleText}>
                  Aqui, enquanto <br /> o(a) aluno(a) pratica, <br /> o(a)
                  professor(a) <br /> descobre onde focar.
                </Text>
              </div>
            </div>
          </div>
        </Col>

        <Col xs={24} md={12} className={styles.rightCol}>
          <div className={styles.formHolder}>
            <Card className={styles.card} bordered={false}>
              <Title level={2} className={styles.cardTitle}>
                Acessar
              </Title>

              <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                onFinishFailed={handleFinishFailed}
                onValuesChange={handleValuesChange}
                autoComplete="off"
              >
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: "Informe seu e-mail" },
                    { type: "email", message: "E-mail inválido" },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="E-mail"
                    prefix={<MailOutlined />}
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[{ required: true, message: "Informe sua senha" }]}
                >
                  <Input.Password
                    size="large"
                    placeholder="Senha"
                    prefix={<LockOutlined />}
                  />
                </Form.Item>

                <div className={styles.forgotRow}>
                  <Button
                    type="link"
                    className={styles.forgotLink}
                    onClick={()=> navigate("/redefinir-senha")}
                  >
                    Recuperar senha
                  </Button>
                </div>

                <Form.Item>
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      block
                      className={styles.primaryBtn}
                      disabled={isButtonDisabled}
                    >
                      ENTRAR
                    </Button>

                    <div className={styles.signupHint}>
                      <Text>Ainda não possui cadastro?</Text>
                    </div>

                    <Button
                      size="large"
                      className={styles.secondaryBtn}
                      onClick={() => navigate("/Cadastros")}
                      block
                    >
                      REALIZAR CADASTRO
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
}
