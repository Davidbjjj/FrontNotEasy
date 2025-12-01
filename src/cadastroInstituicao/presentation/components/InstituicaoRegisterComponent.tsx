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
import { 
  BankOutlined, 
  MailOutlined, 
  LockOutlined, 
  EnvironmentOutlined 
} from "@ant-design/icons";
import styles from "./InstituicaoRegister.module.css";

const { Title, Text } = Typography;
const BRAND_LOGO = "/LogoGGE.svg";
const HERO_IMAGE = "/Alunos.svg";

interface InstituicaoRegisterComponentProps {
  onRegister: (data: any) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export default function InstituicaoRegisterComponent({ 
  onRegister, 
  loading, 
  error 
}: InstituicaoRegisterComponentProps) {
  const [form] = Form.useForm();
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const navigate = useNavigate();

  const handleValuesChange = (_: any, allValues: any) => {
    const hasEmpty = !allValues.nome || !allValues.email || !allValues.senha || !allValues.endereco;
    setIsButtonDisabled(hasEmpty);
  };

  const handleFinish = async (values: any) => {
    try {
      await onRegister({
        nome: values.nome,
        email: values.email.toLowerCase().trim(),
        senha: values.senha,
        endereco: values.endereco,
      });
      message.success("Instituição cadastrada com sucesso!");
      navigate("/login");
    } catch (err: any) {
      message.error(err.message || "Erro ao cadastrar instituição");
    }
  };

  const handleFinishFailed = ({ errorFields }: any) => {
    if (errorFields.length > 0) {
      message.error(errorFields[0].errors[0]);
    }
  };

  return (
    <div className={styles.page}>
      <Row gutter={0} className={styles.wrapper}>
        <Col xs={0} md={12} className={styles.leftCol}>
          <div className={styles.leftSide}>
            <div className={styles.heroContainer}>
              <img
                src={HERO_IMAGE}
                alt="Estudantes e professor"
                className={styles.heroImage}
              />
              <div className={styles.logoOverlay}>
                <img src={BRAND_LOGO} alt="Logo GGE" />
                <Text className={styles.bubbleText}>
                  Cadastre sua instituição <br />
                  e comece a gerenciar <br />
                  professores e alunos <br />
                  de forma eficiente.
                </Text>
              </div>
            </div>
          </div>
        </Col>

        <Col xs={24} md={12} className={styles.rightCol}>
          <div className={styles.formHolder}>
            <Card className={styles.card} bordered={false}>
              <Title level={2} className={styles.cardTitle}>
                Cadastrar Instituição
              </Title>

              {error && (
                <div style={{ marginBottom: '1rem', color: '#ff4d4f', textAlign: 'center' }}>
                  {error}
                </div>
              )}

              <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                onFinishFailed={handleFinishFailed}
                onValuesChange={handleValuesChange}
                autoComplete="off"
              >
                <Form.Item
                  name="nome"
                  rules={[
                    { required: true, message: "Informe o nome da instituição" },
                    { min: 3, message: "Nome deve ter no mínimo 3 caracteres" },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="Nome da Instituição"
                    prefix={<BankOutlined />}
                  />
                </Form.Item>

                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: "Informe o e-mail" },
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
                  name="senha"
                  rules={[
                    { required: true, message: "Informe a senha" },
                    { min: 6, message: "Senha deve ter no mínimo 6 caracteres" },
                  ]}
                >
                  <Input.Password
                    size="large"
                    placeholder="Senha"
                    prefix={<LockOutlined />}
                  />
                </Form.Item>

                <Form.Item
                  name="endereco"
                  rules={[
                    { required: true, message: "Informe o endereço" },
                    { min: 5, message: "Endereço deve ter no mínimo 5 caracteres" },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="Endereço"
                    prefix={<EnvironmentOutlined />}
                  />
                </Form.Item>

                <Form.Item>
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      block
                      className={styles.primaryBtn}
                      disabled={isButtonDisabled || loading}
                      loading={loading}
                    >
                      CADASTRAR
                    </Button>

                    <div className={styles.loginHint}>
                      <Text>Já possui cadastro?</Text>
                    </div>

                    <Button
                      size="large"
                      className={styles.secondaryBtn}
                      onClick={() => navigate("/login")}
                      block
                    >
                      FAZER LOGIN
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
