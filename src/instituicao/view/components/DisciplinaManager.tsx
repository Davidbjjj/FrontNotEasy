import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Card, Table, message, Row, Col, Modal, Tabs, Popconfirm } from 'antd';
import { PlusOutlined, UnorderedListOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { instituicaoService } from '../../services/api/instituicao.service';
import { disciplinaService } from '../../../disciplinas/services/api/disciplina.service';

interface DisciplinaManagerProps {
    instituicaoId: string;
    professorOptions: { id: string; nome: string }[];
    disciplinasList: any[];
    onSuccess: () => void;
}

const DisciplinaManager: React.FC<DisciplinaManagerProps> = ({ instituicaoId, professorOptions, disciplinasList, onSuccess }) => {
    const [form] = Form.useForm();
    const [addStudentForm] = Form.useForm();
    const [editForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [addingStudent, setAddingStudent] = useState(false);
    const [estudantesList, setEstudantesList] = useState<any[]>([]);
    const [editingDisciplina, setEditingDisciplina] = useState<any>(null);
    const [editModalVisible, setEditModalVisible] = useState(false);

    useEffect(() => {
        loadEstudantes();
    }, [instituicaoId]);

    const loadEstudantes = async () => {
        try {
            if (!instituicaoId) return;
            // Busca estudantes da instituição usando o serviço de instituição
            const list = await instituicaoService.listEstudantes(instituicaoId);
            setEstudantesList(list || []);
        } catch (err) {
            console.error('Erro ao carregar estudantes:', err);
        }
    };

    const handleAddStudentToDisciplina = async (values: any) => {
        setAddingStudent(true);
        try {
            await disciplinaService.addStudentToDisciplina(values.disciplinaId, values.estudanteId);
            message.success('Estudante adicionado à disciplina com sucesso');
            addStudentForm.resetFields();
            onSuccess();
        } catch (err: any) {
            const errorData = err?.response?.data;
            const errorMsg = typeof errorData === 'string' ? errorData : (errorData?.error || errorData?.message || String(err));
            message.error(errorMsg);
        } finally {
            setAddingStudent(false);
        }
    };

    const handleEditClick = (disciplina: any) => {
        setEditingDisciplina(disciplina);
        editForm.setFieldsValue({
            nome: disciplina.nome,
            professorId: disciplina.professorId || disciplina.professor?.id,
        });
        setEditModalVisible(true);
    };

    const handleUpdateDisciplina = async (values: any) => {
        if (!editingDisciplina) return;
        setLoading(true);
        try {
            const payload = {
                nome: values.nome,
                professorId: values.professorId,
                instituicaoId: instituicaoId,
            };
            await instituicaoService.updateDisciplina(editingDisciplina.id, payload);
            message.success('Disciplina atualizada com sucesso');
            setEditModalVisible(false);
            setEditingDisciplina(null);
            editForm.resetFields();
            onSuccess();
        } catch (err: any) {
            const errorData = err?.response?.data;
            const errorMsg = typeof errorData === 'string' ? errorData : (errorData?.error || errorData?.message || String(err));
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteDisciplina = async (disciplinaId: string) => {
        try {
            await instituicaoService.deleteDisciplina(disciplinaId);
            message.success('Disciplina deletada com sucesso');
            onSuccess();
        } catch (err: any) {
            const errorData = err?.response?.data;
            const errorMsg = typeof errorData === 'string' ? errorData : (errorData?.error || errorData?.message || String(err));
            message.error(errorMsg);
        }
    };

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
        {
            title: 'Ações',
            key: 'actions',
            render: (text: any, record: any) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEditClick(record)}
                    >
                        Editar
                    </Button>
                    <Popconfirm
                        title="Deletar Disciplina"
                        description="Tem certeza que deseja deletar esta disciplina?"
                        onConfirm={() => handleDeleteDisciplina(record.id)}
                        okText="Sim"
                        cancelText="Não"
                    >
                        <Button
                            type="link"
                            danger
                            icon={<DeleteOutlined />}
                        >
                            Deletar
                        </Button>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    const tabItems = [
        {
            key: 'criar',
            label: (
                <span>
                    <PlusOutlined /> Criar Nova
                </span>
            ),
            children: (
                <Row gutter={[16, 16]}>
                    <Col xs={24} lg={12}>
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
                </Col>

                <Col xs={24} lg={12}>
                    <Card type="inner" title="Adicionar Estudante à Disciplina" style={{ marginBottom: 24, background: 'transparent' }} bodyStyle={{ padding: 0 }}>
                        <Form
                            form={addStudentForm}
                            layout="vertical"
                            onFinish={handleAddStudentToDisciplina}
                        >
                            <Form.Item
                                name="disciplinaId"
                                label="Disciplina"
                                rules={[{ required: true, message: 'Selecione a disciplina' }]}
                            >
                                <Select placeholder="-- Selecionar Disciplina --">
                                    {disciplinasList.map((d) => (
                                        <Select.Option key={d.id} value={d.id}>{d.nome}</Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="estudanteId"
                                label="Estudante"
                                rules={[{ required: true, message: 'Selecione o estudante' }]}
                            >
                                <Select 
                                    placeholder="-- Selecionar Estudante --"
                                    showSearch
                                    filterOption={(input, option) => {
                                        const label = option?.label || option?.children;
                                        return String(label).toLowerCase().includes(input.toLowerCase());
                                    }}
                                >
                                    {estudantesList.map((e) => (
                                        <Select.Option key={e.id} value={e.id}>{e.nome}</Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" loading={addingStudent}>
                                    Adicionar Estudante
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>
            </Row>
            ),
        },
        {
            key: 'listar',
            label: (
                <span>
                    <UnorderedListOutlined /> Lista de Disciplinas
                </span>
            ),
            children: (
                <Card type="inner" title="Disciplinas Cadastradas" style={{ background: 'transparent' }} bodyStyle={{ padding: 0 }}>
                    <Table
                        dataSource={disciplinasList}
                        columns={columns}
                        rowKey="id"
                        locale={{ emptyText: 'Nenhuma disciplina encontrada' }}
                        scroll={{ x: 'max-content' }}
                    />
                </Card>
            ),
        },
    ];

    return (
        <Card title="Gerenciar Disciplinas" bordered={false}>
            <Tabs defaultActiveKey="criar" items={tabItems} />

            <Modal
                title="Editar Disciplina"
                open={editModalVisible}
                onCancel={() => {
                    setEditModalVisible(false);
                    setEditingDisciplina(null);
                    editForm.resetFields();
                }}
                footer={null}
                destroyOnClose
            >
                <Form
                    form={editForm}
                    layout="vertical"
                    onFinish={handleUpdateDisciplina}
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
                        <Button type="primary" htmlType="submit" loading={loading} style={{ marginRight: 8 }}>
                            Atualizar
                        </Button>
                        <Button onClick={() => {
                            setEditModalVisible(false);
                            setEditingDisciplina(null);
                            editForm.resetFields();
                        }}>
                            Cancelar
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default DisciplinaManager;
