import React, { useState } from 'react';
import { Form, Input, Button, Select, Card, message, Row, Col } from 'antd';
import { instituicaoService } from '../../services/api/instituicao.service';

interface AssociacaoManagerProps {
    disciplinasList: any[];
    professorOptions: { id: string; nome: string }[];
}

const AssociacaoManager: React.FC<AssociacaoManagerProps> = ({ disciplinasList, professorOptions }) => {
    const [formEstudante] = Form.useForm();
    const [formProfessor] = Form.useForm();
    const [loadingAddEst, setLoadingAddEst] = useState(false);
    const [loadingAssociateProf, setLoadingAssociateProf] = useState(false);

    const handleAddEstudanteToDisciplina = async (values: any) => {
        setLoadingAddEst(true);
        try {
            const payload = { estudanteId: values.estudanteId, disciplinaId: values.disciplinaId };
            await instituicaoService.addEstudanteToDisciplina(payload);
            message.success('Estudante matriculado com sucesso');
            formEstudante.resetFields();
        } catch (err: any) {
            const errorData = err?.response?.data;
            const errorMsg = typeof errorData === 'string' ? errorData : (errorData?.error || errorData?.message || String(err));
            message.error(errorMsg);
        } finally {
            setLoadingAddEst(false);
        }
    };

    const handleAssociateProfessor = async (values: any) => {
        setLoadingAssociateProf(true);
        try {
            await instituicaoService.associateProfessorToDisciplina(values.disciplinaId, values.professorId);
            message.success('Professor associado com sucesso');
            formProfessor.resetFields();
        } catch (err: any) {
            const errorData = err?.response?.data;
            const errorMsg = typeof errorData === 'string' ? errorData : (errorData?.message || errorData?.error || String(err));
            message.error(errorMsg);
        } finally {
            setLoadingAssociateProf(false);
        }
    };

    return (
        <div className="manager-container">
            <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                    <Card title="Adicionar Estudante a Disciplina" bordered={false} style={{ background: 'transparent' }} bodyStyle={{ padding: 0 }}>
                        <Form
                            form={formEstudante}
                            layout="vertical"
                            onFinish={handleAddEstudanteToDisciplina}
                        >
                            <Form.Item
                                name="disciplinaId"
                                label="Disciplina"
                                rules={[{ required: true, message: 'Selecione a disciplina' }]}
                            >
                                <Select placeholder="-- Selecionar --">
                                    {disciplinasList.map((d) => (
                                        <Select.Option key={d.id} value={d.id}>
                                            {d.nome}{d.nomeProfessor ? ` — ${d.nomeProfessor} ` : ''}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="estudanteId"
                                label="ID do Estudante"
                                rules={[{ required: true, message: 'Informe o ID do estudante' }]}
                            >
                                <Input placeholder="EstudanteId" />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" loading={loadingAddEst}>
                                    Adicionar Estudante
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>

                <Col xs={24} md={12}>
                    <Card title="Associar Professor a Disciplina" bordered={false} style={{ background: 'transparent' }} bodyStyle={{ padding: 0 }}>
                        <Form
                            form={formProfessor}
                            layout="vertical"
                            onFinish={handleAssociateProfessor}
                        >
                            <Form.Item
                                name="disciplinaId"
                                label="Disciplina"
                                rules={[{ required: true, message: 'Selecione a disciplina' }]}
                            >
                                <Select placeholder="-- Selecionar --">
                                    {disciplinasList.map((d) => (
                                        <Select.Option key={d.id} value={d.id}>{d.nome}</Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="professorId"
                                label="Professor"
                                rules={[{ required: true, message: 'Selecione o professor' }]}
                            >
                                <Select placeholder="-- Selecionar --">
                                    {professorOptions.map((p) => (
                                        <Select.Option key={p.id} value={p.id}>{p.nome}</Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" loading={loadingAssociateProf}>
                                    Associar Professor
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AssociacaoManager;
