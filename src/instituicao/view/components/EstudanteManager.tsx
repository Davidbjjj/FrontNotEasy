import React, { useState } from 'react';
import { Form, Input, Button, DatePicker, Card, message } from 'antd';
import { instituicaoService } from '../../services/api/instituicao.service';

interface EstudanteManagerProps {
    instituicaoId: string;
}

const EstudanteManager: React.FC<EstudanteManagerProps> = ({ instituicaoId }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleCreateEstudante = async (values: any) => {
        setLoading(true);
        try {
            const payload = {
                ...values,
                dataNascimento: values.dataNascimento ? values.dataNascimento.format('YYYY-MM-DD') : '',
                instituicaoId,
            };
            await instituicaoService.registerEstudante(payload);
            message.success('Estudante criado com sucesso');
            form.resetFields();
        } catch (err: any) {
            const errorData = err?.response?.data;
            const errorMsg = typeof errorData === 'string' ? errorData : (errorData?.error || errorData?.message || String(err));
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="Gerenciar Estudantes" bordered={false}>
            <Card type="inner" title="Criar Novo Estudante" bodyStyle={{ padding: 0 }} style={{ background: 'transparent' }}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreateEstudante}
                >
                    <Form.Item
                        name="nome"
                        label="Nome"
                        rules={[{ required: true, message: 'Informe o nome do estudante' }]}
                    >
                        <Input placeholder="Nome completo" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Informe o email do estudante' },
                            { type: 'email', message: 'Email inválido' }
                        ]}
                    >
                        <Input placeholder="Email" />
                    </Form.Item>

                    <Form.Item
                        name="senha"
                        label="Senha"
                        rules={[
                            { required: true, message: 'Informe a senha' },
                            { min: 6, message: 'Senha deve ter ao menos 6 caracteres' }
                        ]}
                    >
                        <Input.Password placeholder="Senha" />
                    </Form.Item>

                    <Form.Item
                        name="dataNascimento"
                        label="Data de Nascimento"
                        rules={[{ required: true, message: 'Informe a data de nascimento' }]}
                    >
                        <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Criar Estudante
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </Card>
    );
};

export default EstudanteManager;
