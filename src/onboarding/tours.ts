export type TourRole = 'ALUNO' | 'PROFESSOR' | 'INSTITUICAO';

export interface TourStep {
  /** Valor do atributo data-tour do elemento real da tela; sem alvo, o passo fica centralizado */
  target?: string;
  title: string;
  body: string;
}

export const TOURS: Record<TourRole, TourStep[]> = {
  ALUNO: [
    {
      target: 'nav-inicio',
      title: 'Bem-vindo ao NotEasy! Este é o seu início',
      body: 'Aqui você vê o que fazer agora: próximas listas e prazos, últimas notas, sua sequência de estudo e o atalho para continuar de onde parou.',
    },
    {
      target: 'nav-disciplinas',
      title: 'Suas disciplinas',
      body: 'Veja as disciplinas em que você está matriculado e acompanhe seu desempenho em cada uma.',
    },
    {
      target: 'nav-listas',
      title: 'Listas de questões',
      body: 'Aqui ficam as listas que seus professores liberaram. Responda e confira o resultado.',
    },
    {
      target: 'nav-atividades',
      title: 'Atividades',
      body: 'Consulte prazos e notas das atividades avaliativas.',
    },
    {
      target: 'notifications',
      title: 'Notificações',
      body: 'Avisos de novas listas, atividades e correções aparecem no sino.',
    },
    {
      target: 'help-menu',
      title: 'Precisa de ajuda?',
      body: 'Neste menu você pode rever este tour quando quiser.',
    },
  ],
  PROFESSOR: [
    {
      title: 'Bem-vindo ao NotEasy!',
      body: 'Vamos conhecer as ferramentas para montar e acompanhar suas turmas.',
    },
    {
      target: 'nav-disciplinas',
      title: 'Suas disciplinas',
      body: 'Acesse as turmas, adicione alunos e veja a análise de desempenho da disciplina.',
    },
    {
      target: 'nav-questoes',
      title: 'Banco de questões',
      body: 'Cadastre e organize as questões que serão usadas nas listas.',
    },
    {
      target: 'nav-listas',
      title: 'Listas de questões',
      body: 'Monte listas com as questões do banco e disponibilize para os alunos.',
    },
    {
      target: 'nav-atividades',
      title: 'Atividades',
      body: 'Crie atividades, corrija as respostas e lance as notas.',
    },
    {
      target: 'help-menu',
      title: 'Precisa de ajuda?',
      body: 'Neste menu você pode rever este tour quando quiser.',
    },
  ],
  INSTITUICAO: [
    {
      title: 'Bem-vindo ao NotEasy!',
      body: 'Este tour mostra como administrar a sua instituição.',
    },
    {
      target: 'nav-instituicao',
      title: 'Área da instituição',
      body: 'Cadastre professores, estudantes e disciplinas e gerencie as associações entre eles.',
    },
    {
      target: 'nav-disciplinas',
      title: 'Disciplinas',
      body: 'Acompanhe as disciplinas ativas e o desempenho de cada uma.',
    },
    {
      target: 'notifications',
      title: 'Notificações',
      body: 'Acompanhe aqui os avisos importantes da instituição.',
    },
    {
      target: 'nav-config',
      title: 'Configuração',
      body: 'Atualize seu perfil, sua senha e suas preferências de notificação.',
    },
    {
      target: 'help-menu',
      title: 'Precisa de ajuda?',
      body: 'Neste menu você pode rever este tour quando quiser.',
    },
  ],
};

export function getTourForRole(role: string | null | undefined): TourStep[] | null {
  const key = (role ?? '').toString().toUpperCase() as TourRole;
  return TOURS[key] ?? null;
}
