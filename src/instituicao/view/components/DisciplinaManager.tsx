import React, { useState } from 'react';
import { Form, Input, Button, Select, Card, Table, message } from 'antd';
import { instituicaoService } from '../../services/api/instituicao.service';

interface DisciplinaManagerProps {
    instituicaoId: string;
    professorOptions: { id: string; nome: string }[];
    disciplinasList: any[];
    onSuccess: () => void;
}

const DisciplinaManager: React.FC<DisciplinaManagerProps> = ({ instituicaoId, professorOptions, disciplinasList, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleCreateDisciplina = async (values: any) => {
        setLoading(true);
        try {
            const payload = { ...values, instituicaoId };
            await instituicaoService.createDisciplina(payload);
            message.success('Disciplina criada com sucesso');
            form.resetFields();
            onSuccess();
        } catch (err: any) {
            const errorData = err?.response?.data;
            const errorMsg = typeof errorData === 'string' ? errorData : (errorData?.error || errorData?.message || String(err));
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Nome',
            dataIndex: 'nome',
            key: 'nome',
        },
        {
            title: 'Professor',
            key: 'professor',
            render: (text: any, record: any) => record.nomeProfessor || (record.professor && record.professor.nome) || '-',
        },
    ];

    return (
        <Card title="Gerenciar Disciplinas" bordered={false}>
            <Card type="inner" title="Criar Nova Disciplina" style={{ marginBottom: 24, background: 'transparent' }} bodyStyle={{ padding: 0 }}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreateDisciplina}
                >
                    <Form.Item
                        name="nome"
                        label="Nome da Disciplina"
                        rules={[{ required: true, message: 'Informe o nome da disciplina' }]}
                    >
                        <Input placeholder="Ex: Matemática Avançada" />
                    </Form.Item>

                    <Form.Item
                        name="professorId"
                        label="Professor Responsável (Opcional)"
                    >
                        <Select placeholder="-- Selecionar Professor --">
                            {professorOptions.map((p) => (
                                <Select.Option key={p.id} value={p.id}>{p.nome}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Criar Disciplina
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            <Card type="inner" title="Disciplinas Cadastradas" style={{ background: 'transparent' }} bodyStyle={{ padding: 0 }}>
                <Table
                    dataSource={disciplinasList}
                    columns={columns}
                    rowKey="id"
                    locale={{ emptyText: 'Nenhuma disciplina encontrada' }}
                    scroll={{ x: 'max-content' }}
                />
            </Card>
        </Card>
    );
};

export default DisciplinaManager;
