import React, { useState, useEffect } from 'react';
import { Form, Input, Button, DatePicker, Card, message, Modal, Table, Tabs, Popconfirm } from 'antd';
import { Select } from '../../../ui/AccessibleSelect/AccessibleSelect';
import { EditOutlined, PlusOutlined, UnorderedListOutlined, DeleteOutlined } from '@ant-design/icons';
import { instituicaoService } from '../../services/api/instituicao.service';
import { Materia } from '../../services/api/materia.service';
import dayjs from 'dayjs';
import { DataTable, Column } from '../../../ui/DataTable/DataTable';
import { FilterBar } from '../../../ui/FilterBar/FilterBar';

interface ProfessorManagerProps {
    instituicaoId: string;
    materiasList: Materia[];
    onSuccess: () => void;
}

const ProfessorManager: React.FC<ProfessorManagerProps> = ({ instituicaoId, materiasList, onSuccess }) => {
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [professoresList, setProfessoresList] = useState<any[]>([]);
    const [editingProfessor, setEditingProfessor] = useState<any>(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [activeTab, setActiveTab] = useState('criar');
    const [filters, setFilters] = useState<Record<string, string>>({ busca: '' });

    useEffect(() => {
        loadProfessores();
    }, [instituicaoId]);

    const loadProfessores = async () => {
        try {
            if (!instituicaoId) return;
            const list = await instituicaoService.listProfessores(instituicaoId);
            setProfessoresList(list || []);
        } catch (err) {
            console.error('Erro ao carregar professores:', err);
        }
    };

    const handleEditClick = (professor: any) => {
        setEditingProfessor(professor);
        editForm.setFieldsValue({
            nome: professor.nome,
            email: professor.email,
            dataNascimento: professor.dataNascimento ? dayjs(professor.dataNascimento) : null,
            materia1Id: professor.materia1Id || professor.materia1?.id,
            materia2Id: professor.materia2Id || professor.materia2?.id,
        });
        setEditModalVisible(true);
    };

    const handleUpdateProfessor = async (values: any) => {
        if (!editingProfessor) return;
        setLoading(true);
        try {
            const payload = {
                nome: values.nome,
                dataNascimento: values.dataNascimento ? values.dataNascimento.toISOString() : '',
                materia1Id: values.materia1Id,
                materia2Id: values.materia2Id,
                instituicaoId: instituicaoId,
            };
            await instituicaoService.updateProfessor(editingProfessor.id, payload);
            message.success('Professor atualizado com sucesso');
            setEditModalVisible(false);
            setEditingProfessor(null);
            editForm.resetFields();
            loadProfessores();
            onSuccess();
        } catch (err: any) {
            const errorData = err?.response?.data;
            const errorMsg = typeof errorData === 'string' ? errorData : (errorData?.error || errorData?.message || String(err));
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProfessor = async (professorId: string) => {
        try {
            await instituicaoService.deleteProfessor(professorId);
            message.success('Professor deletado com sucesso');
            loadProfessores();
            onSuccess();
        } catch (err: any) {
            const errorData = err?.response?.data;
            const errorMsg = typeof errorData === 'string' ? errorData : (errorData?.error || errorData?.message || String(err));
            message.error(errorMsg);
        }
    };

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
            loadProfessores();
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

    const columns: Column<any>[] = [
        { key: 'nome', header: 'Nome', sortable: true },
        { key: 'email', header: 'Email', sortable: true },
        {
            key: 'dataNascimento',
            header: 'Data Nascimento',
            sortable: true,
            accessor: (row) => row.dataNascimento || null,
            render: (row) => row.dataNascimento ? dayjs(row.dataNascimento).format('DD/MM/YYYY') : '-',
        },
        {
            key: 'actions',
            header: 'Ações',
            render: (record: any) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEditClick(record)}
                    >
                        Editar
                    </Button>
                    <Popconfirm
                        title="Deletar Professor"
                        description="Tem certeza que deseja deletar este professor?"
                        onConfirm={() => handleDeleteProfessor(record.id)}
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

    const termo = (filters.busca || '').trim().toLowerCase();
    const professoresFiltrados = termo
        ? professoresList.filter((p) => `${p.nome ?? ''} ${p.email ?? ''}`.toLowerCase().includes(termo))
        : professoresList;

    const tabItems = [
        {
            key: 'criar',
            label: (
                <span>
                    <PlusOutlined /> Criar Novo
                </span>
            ),
            children: (
                <Card type="inner" title="Criar Novo Professor" bodyStyle={{ padding: 0 }} style={{ background: 'transparent' }}>
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
            ),
        },
        {
            key: 'listar',
            label: (
                <span>
                    <UnorderedListOutlined /> Lista de Professores
                </span>
            ),
            children: (
                <Card type="inner" title="Professores Cadastrados" style={{ background: 'transparent' }} bodyStyle={{ padding: 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', padding: 'var(--space-3)' }}>
                        <FilterBar
                            fields={[{ type: 'search', name: 'busca', label: 'Buscar professor', placeholder: 'Nome ou email' }]}
                            values={filters}
                            onChange={(name, value) => setFilters((f) => ({ ...f, [name]: value }))}
                            onClear={() => setFilters({ busca: '' })}
                        />
                        <DataTable
                            caption="Professores cadastrados"
                            columns={columns}
                            rows={professoresFiltrados}
                            rowKey={(row) => row.id}
                            emptyTitle={termo ? 'Nenhum professor encontrado' : 'Nenhum professor cadastrado'}
                            emptyDescription={termo ? 'Ajuste a busca ou limpe os filtros.' : 'Cadastre o primeiro professor da instituição para começar.'}
                            emptyAction={!termo && <Button type="primary" onClick={() => setActiveTab('criar')}>Cadastrar professor</Button>}
                        />
                    </div>
                </Card>
            ),
        },
    ];

    return (
        <Card title="Gerenciar Professores" bordered={false}>
            <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

            <Modal
                title="Editar Professor"
                open={editModalVisible}
                onCancel={() => {
                    setEditModalVisible(false);
                    setEditingProfessor(null);
                    editForm.resetFields();
                }}
                footer={null}
                destroyOnClose
            >
                <Form
                    form={editForm}
                    layout="vertical"
                    onFinish={handleUpdateProfessor}
                >
                    <Form.Item
                        name="nome"
                        label="Nome"
                        rules={[{ required: true, message: 'Informe o nome do professor' }]}
                    >
                        <Input placeholder="Nome completo" />
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
                        <Button type="primary" htmlType="submit" loading={loading} style={{ marginRight: 8 }}>
                            Atualizar
                        </Button>
                        <Button onClick={() => {
                            setEditModalVisible(false);
                            setEditingProfessor(null);
                            editForm.resetFields();
                        }}>
                            Cancelar
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </Card >
    );
};

export default ProfessorManager;
