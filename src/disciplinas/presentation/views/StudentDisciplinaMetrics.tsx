import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCurrentUser } from '../../../auth/auth';
import { dashboardService } from '../../services/api/dashboard.service';
import styles from './StudentDisciplinaMetrics.module.css';
import { Row, Col, Card, Statistic, Spin, Alert, Progress, Divider, Segmented, Empty } from 'antd';
import type { SegmentedValue } from 'antd/es/segmented';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList } from 'recharts';

const COLORS = ['#4caf50', '#ff9800', '#f44336', '#2196f3', '#9c27b0'];

type EventViewOption = 'top5' | 'top10' | 'all';

const EVENT_VIEW_OPTIONS: { label: string; value: EventViewOption }[] = [
  { label: 'Top 5', value: 'top5' },
  { label: 'Top 10', value: 'top10' },
  { label: 'Todos', value: 'all' },
];

const EVENT_VIEW_LIMITS: Record<EventViewOption, number> = {
  top5: 5,
  top10: 10,
  all: Number.POSITIVE_INFINITY,
};

const PERFORMANCE_BANDS = [
  { key: 'excelente', label: '≥ 85% Excelente', color: '#2e7d32', predicate: (value: number) => value >= 85 },
  { key: 'bom', label: '70% - 84% Bom', color: '#66bb6a', predicate: (value: number) => value >= 70 && value < 85 },
  { key: 'atencao', label: '50% - 69% Atenção', color: '#ffa726', predicate: (value: number) => value >= 50 && value < 70 },
  { key: 'critico', label: '< 50% Crítico', color: '#f44336', predicate: (value: number) => value < 50 },
];

interface EventBarEntry {
  name: string;
  fullName: string;
  percentual: number;
  nota: number;
  color: string;
  bandLabel: string;
}

function formatPercent(p: number | null | undefined) {
  if (p == null) return '—';
  return `${Number(p).toFixed(1)}%`;
}

function useWindowSize() {
  const [size, setSize] = React.useState({ width: window.innerWidth, height: window.innerHeight });
  React.useEffect(() => {
    const handler = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return size;
}

export default function StudentDisciplinaMetrics(): JSX.Element {
  const { disciplinaId } = useParams();
  const current = getCurrentUser();
  const alunoId = (current?.userId as string) || localStorage.getItem('userId') || '';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<any | null>(null);
  const [eventView, setEventView] = useState<EventViewOption>('top5');
  const handleEventViewChange = (value: SegmentedValue) => {
    setEventView((value as EventViewOption) ?? 'top5');
  };

  useEffect(() => {
    if (!disciplinaId) return;
    if (!alunoId) {
      setError('Aluno não identificado');
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);
    dashboardService.getAlunoMetricas(alunoId, disciplinaId)
      .then((data) => { if (mounted) setMetrics(data); })
      .catch((err) => { if (mounted) setError(err?.message || String(err)); })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, [disciplinaId, alunoId]);

  const pieData = useMemo(() => {
    if (!metrics) return [];
    const entregue = metrics.eventosEntregues ?? 0;
    const pendentes = metrics.eventosPendentes ?? Math.max((metrics.totalEventos ?? 0) - entregue, 0);
    return [
      { name: 'Entregues', value: entregue },
      { name: 'Pendentes', value: pendentes },
    ];
  }, [metrics]);

  const totalEventos = metrics?.totalEventos ?? 0;
  const entreguesCount = metrics?.eventosEntregues ?? 0;
  const entreguesPercent = totalEventos > 0 ? Number(((entreguesCount / totalEventos) * 100).toFixed(1)) : 0;
  const pendentesCount = pieData[1]?.value ?? 0;
  const pendentesPercent = totalEventos > 0 ? Number(((pendentesCount / totalEventos) * 100).toFixed(1)) : 0;

  const eventosBar = useMemo<EventBarEntry[]>(() => {
    if (!metrics || !Array.isArray(metrics.eventos)) return [];

    const mapped: EventBarEntry[] = metrics.eventos.map((ev: any) => {
      const percentual = Number(ev.percentual ?? 0);
      const nota = Number.isFinite(Number(ev.nota)) ? Number(ev.nota) : Number(ev.nota ?? 0);
      const band = PERFORMANCE_BANDS.find((item) => item.predicate(percentual)) ?? PERFORMANCE_BANDS[PERFORMANCE_BANDS.length - 1];
      const titulo = ev.titulo ?? 'Evento';

      return {
        name: titulo.length > 40 ? `${titulo.substring(0, 40)}...` : titulo,
        fullName: titulo,
        percentual,
        nota,
        color: band.color,
        bandLabel: band.label,
      };
    });

    mapped.sort((a: EventBarEntry, b: EventBarEntry) => (b.percentual ?? 0) - (a.percentual ?? 0));
    return mapped.slice(0, 50); // guardrail to avoid rendering excessively long lists
  }, [metrics]);

  const displayedEventos = useMemo<EventBarEntry[]>(() => {
    const limit = EVENT_VIEW_LIMITS[eventView] ?? EVENT_VIEW_LIMITS.top5;
    if (!limit || limit === Number.POSITIVE_INFINITY) {
      return eventosBar;
    }
    return eventosBar.slice(0, limit);
  }, [eventosBar, eventView]);

  const totalEventosAvaliados = eventosBar.length;
  const showingEventos = displayedEventos.length;
  const showSegmentedControl = totalEventosAvaliados > EVENT_VIEW_LIMITS.top5;
  const eventosSubtitle = showingEventos > 0
    ? `Mostrando ${showingEventos} de ${totalEventosAvaliados} eventos avaliados`
    : 'Nenhum evento avaliado ainda';

  // Responsive sizing melhorado
  const { width: viewportWidth } = useWindowSize();
  
  const pieHeight = React.useMemo(() => {
    if (viewportWidth < 600) return 280;
    if (viewportWidth < 900) return 320;
    if (viewportWidth < 1200) return 380;
    return 420;
  }, [viewportWidth]);

  const barHeight = React.useMemo(() => {
    const items = Math.max(displayedEventos.length, 3); // Mínimo de 3 itens para altura adequada
    if (viewportWidth < 600) return Math.max(300, items * 50);
    if (viewportWidth < 900) return Math.max(350, items * 45);
    return Math.max(400, items * 40);
  }, [viewportWidth, displayedEventos]);

  const yAxisWidth = React.useMemo(() => {
    if (viewportWidth < 480) return 100;
    if (viewportWidth < 768) return 140;
    if (viewportWidth < 1200) return 200;
    return 250;
  }, [viewportWidth]);

  if (loading) return <div className={styles.container}><Spin tip="Carregando métricas do aluno..." size="large" /></div>;
  if (error) return <div className={styles.container}><Alert message="Erro" description={error} type="error" showIcon /></div>;
  if (!metrics) return <div className={styles.container}><Alert message="Nenhuma métrica" description="Nenhuma métrica disponível para essa disciplina." type="info" showIcon /></div>;

  return (
    <div className={styles.container}>
      <Row gutter={[16, 16]} align="top">
        <Col span={24}>
          <h1 className={styles.title}>{metrics.nomeDisciplina ?? 'Disciplina'}</h1>
          <div className={styles.subtitle}>Aluno: {metrics.nomeAluno ?? alunoId}</div>
        </Col>

        {/* Cards de estatísticas - Layout melhorado */}
        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.card} bodyStyle={{ padding: '0' }}>
            <Statistic 
              title="Média Geral" 
              value={metrics.mediaGeral ?? '—'} 
              precision={2} 
              valueStyle={{ color: '#3f8600' }}
            />
            <div style={{ marginTop: 16 }}>
              <div className={styles.statLabel}>Taxa de Entrega</div>
              <Progress 
                percent={Number(metrics.taxaEntrega ?? 0)} 
                status={Number(metrics.taxaEntrega ?? 0) >= 70 ? 'normal' : 'exception'} 
                strokeColor={{ 
                  '0%': '#ff4d4f', 
                  '50%': '#faad14', 
                  '100%': '#52c41a' 
                }} 
                format={percent => `${percent?.toFixed(1)}%`}
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.card} bodyStyle={{ padding: '16px 20px' }}>
            <Statistic title="Total de Eventos" value={metrics.totalEventos ?? 0} />
            <div className={styles.statsRow}>
              <div className={styles.miniStat}>
                <div className={styles.miniStatValue}>{metrics.eventosEntregues ?? 0}</div>
                <div className={styles.miniStatLabel}>Entregues</div>
              </div>
              <div className={styles.miniStat}>
                <div className={styles.miniStatValue}>{metrics.eventosPendentes ?? 0}</div>
                <div className={styles.miniStatLabel}>Pendentes</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.card} bodyStyle={{ padding: '16px 20px' }}>
            <Statistic title="Total de Listas" value={metrics.totalListas ?? 0} />
            <div className={styles.statsRow}>
              <div className={styles.miniStat}>
                <div className={styles.miniStatValue}>{metrics.listasRespondidas ?? 0}</div>
                <div className={styles.miniStatLabel}>Respondidas</div>
              </div>
              <div className={styles.miniStat}>
                <div className={styles.miniStatValue}>{metrics.mediaListas ?? '—'}</div>
                <div className={styles.miniStatLabel}>Média</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.card} bodyStyle={{ padding: '16px 20px' }}>
            <div className={styles.statusCard}>
              <div className={styles.statusLabel}>Status</div>
              <div className={styles.statusValue}>{metrics.status ?? '—'}</div>
              <div className={styles.smallHelp}>
                Média eventos: {formatPercent(metrics.mediaPercentualEventos)}
              </div>
              <div className={styles.smallHelp}>
                Média listas: {formatPercent(metrics.mediaPercentualListas)}
              </div>
            </div>
          </Card>
        </Col>

        {/* Gráficos - Layout melhorado */}
        <Col xs={24} xl={10} className={styles.chartCol}>
          <Card 
            title="Distribuição de Entregas" 
            className={styles.cardLarge}
            bodyStyle={{ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <div className={styles.chartWrapper} style={{ minHeight: pieHeight }}>
              {totalEventos === 0 ? (
                <div className={styles.emptyChart}>
                  <Empty description="Nenhum evento cadastrado" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={pieHeight}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={viewportWidth < 768 ? '40%' : '50%'}
                      outerRadius={viewportWidth < 768 ? '70%' : '80%'}
                      label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(1)}%`}
                      labelLine={false}
                    >
                      {pieData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    {/* center summary */}
                    <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 28, fontWeight: 700, fill: '#222' }}>{entreguesPercent}%</text>
                    <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 12, fill: '#666' }}>{`${entreguesCount}/${totalEventos} entregues`}</text>
                    <Tooltip 
                      formatter={(val: any, name: any) => [val, name]}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      wrapperStyle={{ bottom: 0 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            {totalEventos > 0 && (
              <div className={styles.pieSummary}>
                <div className={styles.pieSummaryItem}>
                  <span className={styles.legendDot} style={{ backgroundColor: COLORS[0] }} />
                  <div>
                    <div className={styles.summaryLabel}>Entregues</div>
                    <div className={styles.summaryValue}>{entreguesCount}</div>
                    <div className={styles.summaryPercent}>{formatPercent(entreguesPercent)}</div>
                  </div>
                </div>
                <div className={styles.pieSummaryItem}>
                  <span className={styles.legendDot} style={{ backgroundColor: COLORS[1] }} />
                  <div>
                    <div className={styles.summaryLabel}>Pendentes</div>
                    <div className={styles.summaryValue}>{pendentesCount}</div>
                    <div className={styles.summaryPercent}>{formatPercent(pendentesPercent)}</div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} xl={14} className={styles.chartCol}>
          <Card 
            title="Desempenho por Evento (Percentual)" 
            className={styles.cardLarge}
            bodyStyle={{ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <div className={styles.chartHeader}>
              <div className={styles.chartSubtitle}>{eventosSubtitle}</div>
              {showSegmentedControl && (
                <Segmented
                  size="small"
                  value={eventView}
                  options={EVENT_VIEW_OPTIONS}
                  onChange={handleEventViewChange}
                />
              )}
            </div>
            <div className={styles.bandLegend}>
              {PERFORMANCE_BANDS.map(({ key, label, color }) => (
                <span key={key} className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ backgroundColor: color }} />
                  {label}
                </span>
              ))}
            </div>
            <div className={styles.chartWrapper} style={{ minHeight: barHeight }}>
              {showingEventos === 0 ? (
                <div className={styles.emptyChart}>
                  <Empty description="Nenhum evento avaliado" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={barHeight}>
                  <BarChart 
                    layout="vertical" 
                    data={displayedEventos} 
                    margin={{ 
                      top: 10, 
                      right: 30, 
                      left: yAxisWidth, 
                      bottom: displayedEventos.length > 8 ? 40 : 20 
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis 
                      type="number" 
                      domain={[0, 100]} 
                      tickFormatter={(value) => `${value}%`} 
                    />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={yAxisWidth}
                      tick={{ fontSize: viewportWidth < 768 ? 11 : 13 }}
                      interval={0}
                    />
                    <Tooltip 
                      formatter={(value: number | string, _name: string, props: any) => [`${value}%`, props?.payload?.bandLabel ?? 'Percentual']} 
                      labelFormatter={(label, payload) => {
                        try {
                          if (payload && payload[0] && payload[0].payload && payload[0].payload.fullName) {
                            return `Evento: ${payload[0].payload.fullName}`;
                          }
                        } catch (e) {}
                        return `Evento: ${label}`;
                      }}
                    />
                    <Bar 
                      dataKey="percentual" 
                      name="Percentual de Conclusão" 
                      radius={[0, 4, 4, 0]}
                    >
                      {displayedEventos.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                      <LabelList 
                        dataKey="percentual" 
                        position="right" 
                        formatter={(val: any) => `${val}%`} 
                        style={{ fontSize: viewportWidth < 768 ? 11 : 12 }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </Col>

        {/* Listas detalhadas - Layout melhorado */}
        <Col xs={24} className={styles.sectionFull}>
          <Divider />
          <h3 className={styles.sectionTitle}>Listas Detalhadas</h3>
          <div className={styles.listGrid}>
            {Array.isArray(metrics.listas) && metrics.listas.length > 0 ? 
              metrics.listas.slice(0, 12).map((l: any, index: number) => (
                <Card 
                  key={l.listaId || index} 
                  className={styles.listCard} 
                  size="small"
                  bodyStyle={{ padding: '12px 16px' }}
                >
                  <div className={styles.listTitle}>
                    {l.titulo?.length > 50 ? `${l.titulo.substring(0, 50)}...` : l.titulo}
                  </div>
                  <div className={styles.listMeta}>
                    <span className={styles.listStat}>
                      Nota: <strong>{l.nota ?? '—'}</strong>
                    </span>
                    <span className={styles.listStat}>
                      {l.percentual}% concluído
                    </span>
                    <span className={styles.listStat}>
                      {l.questoesRespondidas}/{l.totalQuestoes} questões
                    </span>
                  </div>
                </Card>
              )) : 
              <Card className={styles.listCard}>
                <div className={styles.emptyState}>Nenhuma lista registrada.</div>
              </Card>
            }
          </div>
        </Col>
      </Row>
    </div>
  );
}