import React, { useState } from 'react';
import { Form, Input, Button, DatePicker, Select, Card, message, Modal } from 'antd';
import { instituicaoService } from '../../services/api/instituicao.service';
import { Materia } from '../../services/api/materia.service';

interface ProfessorManagerProps {
    instituicaoId: string;
    materiasList: Materia[];
    onSuccess: () => void;
}

const ProfessorManager: React.FC<ProfessorManagerProps> = ({ instituicaoId, materiasList, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleCreateProfessor = async (values: any) => {
        setLoading(true);
        try {
            const payload = {
                ...values,
                dataNascimento: values.dataNascimento ? values.dataNascimento.format('YYYY-MM-DD') : '',
                instituicaoId,
            };
            await instituicaoService.registerProfessor(payload);
            message.success('Professor criado com sucesso');
            form.resetFields();
            onSuccess();
        } catch (err: any) {
            const errorData = err?.response?.data;
            const msg = typeof errorData === 'string' ? errorData : (errorData?.error || errorData?.message || String(err));

            if (err?.response?.status === 400 && String(msg).toLowerCase().includes('email não autorizado')) {
                Modal.confirm({
                    title: 'Email não autorizado',
                    content: 'Deseja adicionar este e-mail à lista de permitidos?',
                    onOk: async () => {
                        try {
                            await instituicaoService.addPermittedEmails(instituicaoId, [values.email]);
                            message.success('Email adicionado. Tente criar o professor novamente.');
                        } catch (addErr: any) {
                            message.error(addErr?.response?.data || String(addErr));
                        }
                    }
                });
            } else {
                message.error(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="Gerenciar Professores" bordered={false}>
            <Card type="inner" title="Criar Novo Professor" bodyStyle={{ padding: 0 }} style={{ background: 'transparent', marginBottom: 24 }}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreateProfessor}
                >
                    <Form.Item
                        name="nome"
                        label="Nome"
                        rules={[{ required: true, message: 'Informe o nome do professor' }]}
                    >
                        <Input placeholder="Nome completo" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Informe o email do professor' },
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
                    >
                        <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                    </Form.Item>

                    <Form.Item
                        name="materia1Id"
                        label="Matéria Principal"
                        rules={[{ required: true, message: 'Informe a matéria principal' }]}
                    >
                        <Select placeholder="-- Selecionar --">
                            {materiasList.map((m) => (
                                <Select.Option key={m.id} value={m.id}>{m.nome}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="materia2Id"
                        label="Matéria Secundária (Opcional)"
                    >
                        <Select placeholder="-- Selecionar --">
                            {materiasList.map((m) => (
                                <Select.Option key={m.id} value={m.id}>{m.nome}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Criar Professor
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </Card >
    );
};

export default ProfessorManager;
