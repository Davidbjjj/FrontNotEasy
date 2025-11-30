import React, { useState } from 'react';
import { Form, Input, Button, Card, List, message, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { instituicaoService } from '../../services/api/instituicao.service';

interface ConfiguracaoManagerProps {
    instituicaoId: string;
    permittedEmails: string[];
    onUpdate: () => void;
}

const ConfiguracaoManager: React.FC<ConfiguracaoManagerProps> = ({ instituicaoId, permittedEmails, onUpdate }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleAddEmail = async (values: any) => {
        setLoading(true);
        try {
            await instituicaoService.addPermittedEmails(instituicaoId, [values.email]);
            message.success('Email adicionado com sucesso');
            form.resetFields();
            onUpdate();
        } catch (err: any) {
            const errorData = err?.response?.data;
            const errorMsg = typeof errorData === 'string' ? errorData : (errorData?.error || errorData?.message || String(err));
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleRemovePermittedEmail = async (emailToRemove: string) => {
        try {
            await instituicaoService.removePermittedEmail(instituicaoId, emailToRemove);
            message.success('Email removido com sucesso');
            onUpdate();
        } catch (err: any) {
            const errorData = err?.response?.data;
            const errorMsg = typeof errorData === 'string' ? errorData : (errorData?.error || errorData?.message || String(err));
            message.error(errorMsg);
        }
    };

    return (
        <div className="manager-container">
            <Card title="Configurações" bordered={false}>
                <Card type="inner" title="Permitir Email de Professor" style={{ marginBottom: 24, background: 'transparent' }} bodyStyle={{ padding: 0 }}>
                    <p style={{ color: '#666', marginBottom: 16 }}>
                        Adicione emails que podem ser usados para cadastro de professores nesta instituição.
                    </p>
                    <Form
                        form={form}
                        layout="inline"
                        onFinish={handleAddEmail}
                    >
                        <Form.Item
                            name="email"
                            rules={[
                                { required: true, message: 'Informe um email' },
                                { type: 'email', message: 'Email inválido' }
                            ]}
                            style={{ flex: 1 }}
                        >
                            <Input placeholder="email@dominio.edu.br" />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Adicionar Email
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>

                <Card type="inner" title="Emails Permitidos" style={{ background: 'transparent' }} bodyStyle={{ padding: 0 }}>
                    <List
                        bordered
                        dataSource={permittedEmails}
                        locale={{ emptyText: 'Nenhum email cadastrado' }}
                        renderItem={(item) => (
                            <List.Item
                                actions={[
                                    <Popconfirm
                                        title="Remover email"
                                        description="Tem certeza que deseja remover este email?"
                                        onConfirm={() => handleRemovePermittedEmail(item)}
                                        okText="Sim"
                                        cancelText="Não"
                                    >
                                        <Button type="text" danger icon={<DeleteOutlined />}>
                                            Remover
                                        </Button>
                                    </Popconfirm>
                                ]}
                            >
                                {item}
                            </List.Item>
                        )}
                    />
                </Card>
            </Card>
        </div>
    );
};

export default ConfiguracaoManager;
