import { useState, useRef } from "react";
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
import RecaptchaComponent from "./RecaptchaComponent";
import SocialLoginButtons from "./SocialLoginButtons"; 


const { Title, Text } = Typography;
const BRAND_LOGO = "/LogoGGE.svg";
const HERO_IMAGE = "/Alunos.svg";

export default function LoginPage({ onSubmit, onForgotPassword, onRegister }) {
  const [form] = Form.useForm();
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const recaptchaRef = useRef(null);
  const navigate = useNavigate();

  const handleValuesChange = (_, allValues) => {
    const hasEmpty = !allValues.email || !allValues.password;
    setIsButtonDisabled(hasEmpty);
  };

  const handleFinish = async (values) => {
    try {
      setIsSubmitting(true);
      
      // Executa ReCAPTCHA
      let recaptchaToken = null;
      if (recaptchaRef.current?.executeRecaptcha) {
        recaptchaToken = await recaptchaRef.current.executeRecaptcha();
        if (!recaptchaToken) {
          message.error("Validação ReCAPTCHA falhou. Tente novamente.");
          return;
        }
      }

      // Envia credenciais + token ReCAPTCHA para o backend
      const loginData = {
        ...values,
        // force email to lowercase as backend expects
        email: values.email ? String(values.email).toLowerCase().trim() : values.email,
        recaptchaToken,
      };
      
      // DEBUG: log do token para verificar envio (remover em produção)
      // eslint-disable-next-line no-console
      console.log('DEBUG loginData (will be sent to backend):', loginData);

      await authService.login(loginData);
      message.success("Login realizado com sucesso!");
      navigate("/listas");
    } catch (error) {
      message.error(error.message || "Erro ao fazer login. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishFailed = ({ errorFields }) => {
    if (errorFields.length > 0) {
      message.error(errorFields[0].errors[0]);
    }
  };

  const handleGoogleSuccess = (token) => {
    // Enviar token do Google para o backend
    message.loading({ content: 'Autenticando com Google...', key: 'social-login' });
    authService.loginWithGoogle(token)
      .then(() => {
        message.success({ content: 'Login com Google realizado!', key: 'social-login' });
        navigate("/listas");
      })
      .catch(error => {
        message.error({ 
          content: error.message || 'Erro ao fazer login com Google', 
          key: 'social-login' 
        });
      });
  };

  const handleGitHubSuccess = () => {
    message.loading({ content: 'Autenticando com GitHub...', key: 'social-login' });
  };

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
                  getValueFromEvent={(e) => (e && e.target ? String(e.target.value).toLowerCase() : e)}
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
                      disabled={isButtonDisabled || isSubmitting}
                      loading={isSubmitting}
                    >
                      ENTRAR
                    </Button>

                    <div className={styles.signupHint}>
                      <Text>Ainda não possui cadastro?</Text>
                    </div>

                    <Button
                      size="large"
                      className={styles.secondaryBtn}
                      onClick={() => navigate("/cadastro-instituicao")}
                      block
                    >
                      REALIZAR CADASTRO
                    </Button>
                  </Space>
                </Form.Item>

                {/* Social Login Buttons */}
                <SocialLoginButtons
                  onGoogleSuccess={handleGoogleSuccess}
                  onGitHubClick={handleGitHubSuccess}
                />
              </Form>

              {/* ReCAPTCHA (invisível) */}
              <RecaptchaComponent ref={recaptchaRef} />
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
}
