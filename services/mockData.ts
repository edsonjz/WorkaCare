
import { KPIMetric, ChartDataPoint, Survey, SwotItem, StrategicGoal, DepartmentData, Observation, Session, Resource, Alert, StrategicResource } from '../types';

// KPIs Zerados para início de testes
export const MOCK_KPIS: KPIMetric[] = [
  { id: '1', label: 'Participação', value: 0, unit: '%', change: 0, trend: 'neutral', color: 'text-slate-600' },
  { id: '2', label: 'Bem-Estar Geral', value: 0, unit: '/10', change: 0, trend: 'neutral', color: 'text-slate-600' },
  { id: '3', label: 'Nível de Stress', value: 0, unit: '%', change: 0, trend: 'neutral', color: 'text-slate-600' },
  { id: '4', label: 'NPS Interno', value: 0, unit: '', change: 0, trend: 'neutral', color: 'text-slate-600' },
];

// Sem alertas iniciais
export const MOCK_ALERTS: Alert[] = [];

// Gráficos vazios
export const MOCK_CHART_DATA: ChartDataPoint[] = [];

// Dados de departamento zerados
export const MOCK_DEPT_DATA: DepartmentData[] = [];

/* LABELS DE ESCALA PADRONIZADAS */
const SCALE_FREQ = { start: 'Nunca', end: 'Sempre' };
const SCALE_SATISF = { start: 'Muito Insatisfeito', end: 'Muito Satisfeito' };
const SCALE_AGREE = { start: 'Discordo Totalmente', end: 'Concordo Totalmente' };
const SCALE_QUALITY = { start: 'Muito Ruim', end: 'Excelente' };
const SCALE_MOOD = { start: 'Muito Baixo/Cansado', end: 'Excelente/Energizado' };

export const MOCK_SURVEYS: Survey[] = [
  // 1. Questionário: Avaliação de Liderança e Suporte
  {
    id: 'F-leadership',
    title: 'F) Liderança e Suporte Gerencial',
    description: 'Avalie a qualidade da liderança e o suporte oferecido pela sua chefia direta.',
    category: 'org',
    estimatedTime: '5 min',
    questions: [
      { id: 'f1', text: '1. O meu gestor direto trata-me com respeito e dignidade.', type: 'scale', scaleLabels: SCALE_AGREE, category: 'org' },
      { id: 'f2', text: '2. O meu gestor fornece feedback útil e regular sobre o meu trabalho.', type: 'scale', scaleLabels: SCALE_FREQ, category: 'org' },
      { id: 'f3', text: '3. Sinto que o meu gestor se preocupa genuinamente com o meu bem-estar pessoal.', type: 'scale', scaleLabels: SCALE_AGREE, category: 'org' },
      { id: 'f4', text: '4. O meu gestor comunica as metas e expectativas de forma clara.', type: 'scale', scaleLabels: SCALE_AGREE, category: 'org' },
      { id: 'f5', text: '5. Sinto-me confortável para pedir ajuda ao meu gestor quando tenho dificuldades.', type: 'scale', scaleLabels: SCALE_AGREE, category: 'org' },
      { id: 'f6', text: '6. O meu gestor reconhece o meu bom desempenho e as minhas conquistas.', type: 'scale', scaleLabels: SCALE_FREQ, category: 'org' },
      { id: 'f7', text: '7. O meu gestor está aberto a receber sugestões e opiniões da equipe.', type: 'scale', scaleLabels: SCALE_AGREE, category: 'org' },
      { id: 'f8', text: '8. O meu gestor ajuda a remover obstáculos que atrapalham o meu trabalho.', type: 'scale', scaleLabels: SCALE_FREQ, category: 'org' },
      { id: 'f9', text: 'Espaço para sugestões ou observações ao seu gestor:', type: 'text', category: 'org' },
    ]
  },

  // 2. Questionário: Gestão e Práticas de Bem-Estar na organização
  {
    id: 'D-org-practices',
    title: 'D) Gestão e Práticas Organizacionais',
    description: 'Avaliação da capacidade da empresa de promover o bem-estar no local de trabalho.',
    category: 'org',
    estimatedTime: '10 min',
    questions: [
      // Mental
      { id: 'd1', text: '1) A minha carga de trabalho é gerenciável e favorável à execução do trabalho.', type: 'scale', scaleLabels: SCALE_AGREE, category: 'org' },
      { id: 'd2', text: '2) A empresa valoriza e promove a conciliação saudável entre a vida pessoal e profissional.', type: 'scale', scaleLabels: SCALE_AGREE, category: 'org' },
      { id: 'd3', text: '3) Os meus esforços e contribuições são reconhecidos e valorizados pela empresa.', type: 'scale', scaleLabels: SCALE_AGREE, category: 'org' },
      { id: 'd4', text: '4) Tenho a autonomia necessária para tomar decisões e tenho liberdade para exercer as minhas funções.', type: 'scale', scaleLabels: SCALE_AGREE, category: 'org' },
      { id: 'd5', text: '5) A empresa oferece oportunidades suficientes de crescimento profissional e aprendizagem.', type: 'scale', scaleLabels: SCALE_AGREE, category: 'org' },
      { id: 'd6', text: '6) Em geral, sinto que o ambiente de trabalho é saudável e de baixo/moderado stress.', type: 'scale', scaleLabels: SCALE_AGREE, category: 'org' },
      // Físico
      { id: 'd7', text: '7) A temperatura, iluminação e ventilação do local de trabalho é adequada e confortável.', type: 'scale', scaleLabels: SCALE_AGREE, category: 'org' },
      { id: 'd8', text: '8) Os equipamentos de trabalho e o mobiliário são confortáveis e permitem manter uma boa postura.', type: 'scale', scaleLabels: SCALE_AGREE, category: 'org' },
      { id: 'd9', text: '9) O nível de ruído no local de trabalho não interfere com a minha concentração.', type: 'scale', scaleLabels: SCALE_AGREE, category: 'org' },
      { id: 'd10', text: '10) As condições de higiene são adequadas (limpeza, banheiros, copa).', type: 'scale', scaleLabels: SCALE_AGREE, category: 'org' },
      { id: 'd11', text: '11) A empresa incentiva pausas para movimentação durante o horário de trabalho.', type: 'scale', scaleLabels: SCALE_AGREE, category: 'org' },
      { id: 'd12', text: '12) A empresa oferece/incentiva opções de alimentação saudável.', type: 'scale', scaleLabels: SCALE_AGREE, category: 'org' },
      // Social e Apoio
      { id: 'd14', text: '13) A empresa valoriza a diversidade e inclusão.', type: 'scale', scaleLabels: SCALE_AGREE, category: 'org' },
      { id: 'd15', text: '14) A comunicação interna é clara, aberta e transparente.', type: 'scale', scaleLabels: SCALE_AGREE, category: 'org' },
      { id: 'd16', text: '15) Os relacionamentos entre colegas são positivos e saudáveis.', type: 'scale', scaleLabels: SCALE_AGREE, category: 'org' },
      { id: 'd19', text: '16) Sinto-me confortável em falar da minha saúde/sentimentos com o RH ou gestão.', type: 'scale', scaleLabels: SCALE_AGREE, category: 'org' },
      { id: 'd22', text: 'Comentários Adicionais ou Sugestões para a Organização:', type: 'text', category: 'org' },
    ]
  },

  // 3. Questionário: Saúde e Bem-estar Físico no Trabalho (REVISADO)
  {
    id: 'B-physical-wellbeing',
    title: 'B) Saúde e Bem-estar Físico',
    description: 'Avaliação da saúde física, ergonomia e nível de energia corporal.',
    category: 'physical',
    estimatedTime: '5 min',
    questions: [
      { id: 'b1', text: '1. Sinto-me fisicamente confortável e sem dores corporais (costas, pescoço, pulsos) durante a jornada.', type: 'scale', scaleLabels: SCALE_AGREE, category: 'physical' },
      { id: 'b2', text: '2. O meu posto de trabalho e equipamentos permitem-me manter uma postura correta e saudável.', type: 'scale', scaleLabels: SCALE_AGREE, category: 'physical' },
      { id: 'b3', text: '3. Consigo realizar pausas ativas (levantar, alongar) regularmente durante o dia.', type: 'scale', scaleLabels: SCALE_FREQ, category: 'physical' },
      { id: 'b4', text: '4. Sinto que a minha visão descansa adequadamente e não tenho fadiga visual excessiva.', type: 'scale', scaleLabels: SCALE_AGREE, category: 'physical' },
      { id: 'b5', text: '5. Consigo manter uma hidratação e alimentação adequadas durante o horário de trabalho.', type: 'scale', scaleLabels: SCALE_FREQ, category: 'physical' },
      { id: 'b6', text: '6. As condições ambientais (iluminação, temperatura, ruído) favorecem o meu conforto físico.', type: 'scale', scaleLabels: SCALE_AGREE, category: 'physical' },
      { id: 'b7', text: '7. Chego ao final do dia com energia física suficiente (sem exaustão extrema).', type: 'scale', scaleLabels: SCALE_AGREE, category: 'physical' },
      { id: 'b8', text: '8. Sinto que o meu ambiente de trabalho é seguro e higienizado.', type: 'scale', scaleLabels: SCALE_AGREE, category: 'physical' },
      { id: 'b9', text: 'Espaço para relatar desconfortos físicos específicos ou necessidades ergonômicas:', type: 'text', category: 'physical' },
    ]
  },

  // 4. Questionário: Bem-estar Social no Trabalho
  {
    id: 'C-social-wellbeing',
    title: 'C) Bem-estar Social',
    description: 'Avaliação da inclusão, relacionamentos e cultura de equipe.',
    category: 'social',
    estimatedTime: '8 min',
    questions: [
      { id: 'c1', text: '1. Sinto que pertenço e sou valorizado(a) na minha equipe.', type: 'scale', scaleLabels: SCALE_AGREE, category: 'social' },
      { id: 'c2', text: '2. Sinto-me apoiado(a) pelos meus colegas quando preciso de ajuda.', type: 'scale', scaleLabels: SCALE_AGREE, category: 'social' },
      { id: 'c3', text: '3. Como avaliaria o nível de colaboração no seu departamento?', type: 'scale', scaleLabels: SCALE_QUALITY, category: 'social' },
      { id: 'c4', text: '4. Tenho relacionamentos construtivos e respeitosos com meus colegas.', type: 'scale', scaleLabels: SCALE_AGREE, category: 'social' },
      { id: 'c5', text: '5. Tenho oportunidades de interagir socialmente com colegas (almoços, cafés, eventos).', type: 'scale', scaleLabels: SCALE_FREQ, category: 'social' },
      { id: 'c7', text: '6. Sinto-me ouvido(a) quando expresso minhas opiniões em reuniões.', type: 'scale', scaleLabels: SCALE_FREQ, category: 'social' },
      { id: 'c8', text: '7. A liderança demonstra empatia pelas situações pessoais dos colaboradores.', type: 'scale', scaleLabels: SCALE_AGREE, category: 'social' },
      { id: 'c9', text: '8. No geral, como classificaria o clima social da empresa?', type: 'scale', scaleLabels: SCALE_QUALITY, category: 'social' },
      { id: 'c10', text: 'Sugestões para melhorar a integração e o clima social:', type: 'text', category: 'social' },
    ]
  },

  // 5. Questionário: Saúde e Bem-estar Mental no Trabalho
  {
    id: 'A-mental-wellbeing',
    title: 'A) Saúde e Bem-estar Mental',
    description: 'Diagnóstico de stress, ansiedade e satisfação mental.',
    category: 'mental',
    estimatedTime: '9 min',
    questions: [
      { id: 'a1', text: '1. Com que frequência sente ansiedade ou nervosismo por causa do trabalho?', type: 'scale', scaleLabels: SCALE_FREQ, category: 'mental' },
      { id: 'a2', text: '2. Sinto-me sobrecarregado(a) com o volume de tarefas/metas.', type: 'scale', scaleLabels: SCALE_FREQ, category: 'mental' },
      { id: 'a3', text: '3. Tenho autonomia suficiente para decidir como executar meu trabalho.', type: 'scale', scaleLabels: SCALE_AGREE, category: 'mental' },
      { id: 'a4', text: '4. Sinto segurança psicológica para admitir erros sem medo de punição.', type: 'scale', scaleLabels: SCALE_AGREE, category: 'mental' },
      { id: 'a5', text: '5. Estou satisfeito(a) com o reconhecimento que recebo.', type: 'scale', scaleLabels: SCALE_SATISF, category: 'mental' },
      { id: 'a6', text: '6. Vejo oportunidades claras de crescimento e aprendizado na empresa.', type: 'scale', scaleLabels: SCALE_AGREE, category: 'mental' },
      { id: 'a7', text: '7. Consigo "desligar" do trabalho quando estou em casa/folga.', type: 'scale', scaleLabels: SCALE_FREQ, category: 'mental' },
      { id: 'a8', text: '8. Como classificaria o ambiente de trabalho em termos de positividade?', type: 'scale', scaleLabels: { start: 'Tóxico', end: 'Muito Positivo' }, category: 'mental' },
      { id: 'a10', text: '9. No geral, como classificaria sua saúde mental atual?', type: 'scale', scaleLabels: SCALE_QUALITY, category: 'mental' },
      { id: 'a11', text: 'Sugestões para reduzir o estresse e melhorar a saúde mental:', type: 'text', category: 'mental' },
    ]
  },

  // 6. Preferências de Trabalho
  {
    id: 'E-work-preferences',
    title: 'E) Satisfação com Modelo de Trabalho',
    description: 'Avaliação do alinhamento entre suas preferências e o modelo atual.',
    category: 'preferences',
    estimatedTime: '5 min',
    questions: [
      { id: 'e1', text: '1. Estou satisfeito com meu horário de trabalho atual.', type: 'scale', scaleLabels: SCALE_SATISF, category: 'preferences' },
      { id: 'e2', text: '2. Estou satisfeito com o modelo (presencial/híbrido/remoto) atual.', type: 'scale', scaleLabels: SCALE_SATISF, category: 'preferences' },
      { id: 'e3', text: '3. As ferramentas de comunicação utilizadas são eficientes.', type: 'scale', scaleLabels: SCALE_AGREE, category: 'preferences' },
      { id: 'e4', text: '4. O ambiente físico permite que eu me concentre adequadamente.', type: 'scale', scaleLabels: SCALE_AGREE, category: 'preferences' },
      { id: 'e5', text: '5. Tenho o nível de autonomia que desejo para minhas tarefas.', type: 'scale', scaleLabels: SCALE_AGREE, category: 'preferences' },
      { id: 'e6', text: '6. Estou satisfeito com a frequência de feedbacks que recebo.', type: 'scale', scaleLabels: SCALE_SATISF, category: 'preferences' },
      { id: 'e7', text: '7. Sinto que minhas preferências de desenvolvimento profissional são atendidas.', type: 'scale', scaleLabels: SCALE_AGREE, category: 'preferences' },
      { id: 'e8', text: 'Quais seriam suas preferências ideais (Horário/Modelo/Ferramentas)?', type: 'text', category: 'preferences' },
    ]
  },

  // 7. Acompanhamento Contínuo (Check-in de Clima) - NOVO
  {
    id: 'G-checkin',
    title: 'G) Acompanhamento Contínuo (Check-in de Clima)',
    description: 'Check-in rápido semanal para medir humor e energia da equipe.',
    category: 'mental',
    estimatedTime: '2 min',
    questions: [
      { id: 'g1', text: '1. Termômetro de Humor: Como você classificaria seu estado de ânimo hoje?', type: 'scale', scaleLabels: SCALE_MOOD, category: 'mental' },
      { id: 'g2', text: '2. Nível de Energia: Sinto-me com energia para realizar minhas tarefas.', type: 'scale', scaleLabels: SCALE_AGREE, category: 'mental' },
      { id: 'g3', text: '3. Fluxo de Trabalho: Senti que meu trabalho fluiu bem esta semana.', type: 'scale', scaleLabels: SCALE_AGREE, category: 'mental' },
      { id: 'g4', text: '4. Apoio: Senti-me apoiado(a) pela minha equipe/gestão nos últimos dias.', type: 'scale', scaleLabels: SCALE_AGREE, category: 'mental' },
      { id: 'g5', text: 'Tem algum obstáculo ("bloqueio") ou vitória recente que gostaria de compartilhar?', type: 'text', category: 'mental' },
    ]
  },

  // 8. Bem-estar Financeiro
  {
    id: 'H-financial',
    title: 'H) Bem-estar Financeiro',
    description: 'Avaliação sobre como a vida financeira impacta o seu bem-estar.',
    category: 'org',
    estimatedTime: '5 min',
    questions: [
      { id: 'h1', text: '1. Sinto-me seguro(a) em relação à minha situação financeira atual.', type: 'scale', scaleLabels: SCALE_AGREE, category: 'org' },
      { id: 'h2', text: '2. Minhas preocupações financeiras afetam meu foco no trabalho.', type: 'scale', scaleLabels: SCALE_FREQ, category: 'org' },
      { id: 'h3', text: '3. Tenho capacidade de lidar com despesas inesperadas (emergências).', type: 'scale', scaleLabels: SCALE_AGREE, category: 'org' },
      { id: 'h4', text: '4. Estou satisfeito(a) com os benefícios (ex: plano saúde, vale) da empresa.', type: 'scale', scaleLabels: SCALE_SATISF, category: 'org' },
      { id: 'h5', text: '5. Acredito que minha remuneração é justa em relação ao mercado.', type: 'scale', scaleLabels: SCALE_AGREE, category: 'org' },
      { id: 'h6', text: 'Sugestões de benefícios ou suporte financeiro que a empresa poderia oferecer:', type: 'text', category: 'org' },
    ]
  },

  // 9. Diversidade, Equidade e Inclusão
  {
    id: 'I-dei',
    title: 'I) Diversidade, Equidade e Inclusão',
    description: 'Avaliação do ambiente de respeito e igualdade.',
    category: 'social',
    estimatedTime: '6 min',
    questions: [
      { id: 'i1', text: '1. Sinto que posso ser eu mesmo(a) no trabalho sem receio de julgamento.', type: 'scale', scaleLabels: SCALE_AGREE, category: 'social' },
      { id: 'i2', text: '2. A empresa valoriza e respeita pessoas de diferentes origens e identidades.', type: 'scale', scaleLabels: SCALE_AGREE, category: 'social' },
      { id: 'i3', text: '3. Acredito que as oportunidades de promoção são justas para todos.', type: 'scale', scaleLabels: SCALE_AGREE, category: 'social' },
      { id: 'i4', text: '4. Sinto-me seguro(a) para reportar discriminação se ela ocorrer.', type: 'scale', scaleLabels: SCALE_AGREE, category: 'social' },
      { id: 'i5', text: '5. A liderança demonstra compromisso real com a inclusão.', type: 'scale', scaleLabels: SCALE_AGREE, category: 'social' },
      { id: 'i6', text: 'Sugestões para tornar a empresa mais inclusiva:', type: 'text', category: 'social' },
    ]
  }
];

// SWOT e Objetivos Vazios
export const MOCK_SWOT: SwotItem[] = [];
export const MOCK_GOALS: StrategicGoal[] = [];
export const MOCK_RESOURCES_STRATEGY: StrategicResource[] = [];

// Observações
export const MOCK_OBSERVATIONS: Observation[] = [];

// Sessões com estrutura enriquecida e atualizada para o novo guião
export const MOCK_SESSIONS: Session[] = [
  {
    id: 's1',
    type: 'individual',
    date: '2023-11-15',
    participantOrGroup: 'Ana Silva',
    status: 'completed',
    privateNotes: 'A Ana relatou sentir-se sobrecarregada com o novo projeto. Demonstrou sinais de cansaço visual. Recomendei uso da regra 20-20-20.',
    actionPlan: [
      { id: 'ap1', goal: 'Fazer pausas de 5min a cada hora', deadline: '2023-11-22', status: 'in_progress' },
      { id: 'ap2', goal: 'Delegar tarefas administrativas', deadline: '2023-11-30', status: 'done' }
    ],
    guideAnswers: {
      'discuss_1': 'Tem se sentido bem, mas um pouco cansada à tarde.',
      'discuss_2': 'Carga horária excessiva no último projeto.',
      'discuss_3': 'Gosta da equipe, mas o barulho no open space incomoda.',
      'resources_1': 'Conhece o programa de ginástica laboral.'
    }
  },
  {
    id: 's2',
    type: 'individual',
    date: '2023-11-20',
    participantOrGroup: 'Carlos Mendes',
    status: 'scheduled',
    actionPlan: [],
    privateNotes: '',
    guideAnswers: {}
  }
];

// Biblioteca de Recursos COMPLETA e ENRIQUECIDA
export const MOCK_RESOURCES_LIB: Resource[] = [
  // MENTAL
  {
    id: 'res_m1', title: 'Técnica de Respiração 4-7-8', type: 'guide', category: 'mental', duration: '5 min', thumbnail: '🌬️',
    content: `**O que é:**\nUma técnica simples de respiração para acalmar o sistema nervoso rapidamente, ideal para momentos de alta ansiedade ou antes de dormir.\n\n**Como fazer:**\n1. **Inspire** pelo nariz silenciosamente contando até 4.\n2. **Segure** a respiração contando até 7.\n3. **Expire** pela boca fazendo um som de "sopro" contando até 8.\n\nRepita este ciclo por 4 vezes.\n\n**Dica:** Mantenha a ponta da língua no céu da boca, logo atrás dos dentes da frente, durante todo o exercício.`
  },
  {
    id: 'res_m2', title: 'Mindfulness: Escaneamento Corporal', type: 'guide', category: 'mental', duration: '10 min', thumbnail: '🧘',
    content: `**O que é:**\nUma prática de atenção plena onde você foca a atenção em diferentes partes do corpo, notando tensões sem julgamento.\n\n**Benefícios:**\n* Reduz o stress físico e mental.\n* Melhora a consciência corporal.\n* Ajuda a adormecer.\n\n**Prática:**\nComece pelos dedos dos pés e vá subindo lentamente (tornozelos, pernas, joelhos...) até o topo da cabeça. Apenas observe: está quente? Frio? Tenso? Relaxado?`
  },
  {
    id: 'res_m3', title: 'Detox Digital no Trabalho', type: 'article', category: 'mental', duration: '4 min leitura', thumbnail: '📵',
    content: `**Sinais que você precisa de um detox:**\n* Checa o e-mail compulsivamente.\n* Sente "vibrações fantasmas" no bolso.\n* Dificuldade de concentração por mais de 15 minutos.\n\n**Estratégias:**\n1. **Blocos de Foco:** Trabalhe 50min com celular em modo avião.\n2. **Sem Telas no Almoço:** Use esse tempo para saborear a comida e conversar.\n3. **Notificações:** Desative todas as notificações não essenciais (redes sociais, apps de compras).`
  },

  // FÍSICO / ERGONOMIA
  {
    id: 'res_p1', title: 'Alongamentos de Mesa (Desk Yoga)', type: 'video', category: 'physical', duration: '8 min', thumbnail: '🪑',
    content: `**Sequência Rápida para Alívio:**\n\n1. **Pescoço:** Incline a cabeça para a direita, segure 15s. Repita para a esquerda.\n2. **Ombros:** Gire os ombros para trás 10 vezes lentamente.\n3. **Coluna:** Sentado, gire o tronco para a direita segurando no encosto da cadeira. Repita para o outro lado.\n4. **Punhos:** Estique o braço à frente e puxe os dedos para trás suavemente.\n\n**Faça isso a cada 2 horas!**`
  },
  {
    id: 'res_p2', title: 'Regra 20-20-20 para Olhos', type: 'guide', category: 'physical', duration: '2 min', thumbnail: '👁️',
    content: `**Combata a Fadiga Visual Digital:**\n\nA cada **20 minutos** olhando para uma tela...\nOlhe para algo a **20 pés (6 metros)** de distância...\nPor pelo menos **20 segundos**.\n\nIsso relaxa o músculo ciliar do olho e previne dores de cabeça e visão turva.`
  },
  {
    id: 'res_p3', title: 'Checklist de Ergonomia', type: 'guide', category: 'ergonomics', duration: '5 min', thumbnail: '📏',
    content: `**Configure sua estação:**\n\n* **Monitor:** O topo da tela deve estar na altura dos olhos.\n* **Cotovelos:** Devem formar um ângulo de 90º ao digitar.\n* **Pés:** Apoiados totalmente no chão ou em um apoio.\n* **Lombar:** Use uma cadeira com suporte lombar ou uma almofada pequena.\n* **Iluminação:** Evite reflexos na tela (luz vindo de trás ou de cima, não diretamente na frente).`
  },

  // NUTRIÇÃO
  {
    id: 'res_n1', title: 'Lanches Energéticos vs. Picos de Açúcar', type: 'article', category: 'nutrition', duration: '3 min leitura', thumbnail: '🍎',
    content: `**Evite:** Bolachas, refrigerantes, doces. Eles dão energia rápida, mas causam um "crash" (queda brusca) logo depois, gerando sono e fome.\n\n**Prefira:**\n* **Nozes e Castanhas:** Gorduras boas para o cérebro.\n* **Iogurte Natural:** Proteína.\n* **Fruta com Aveia:** Fibras que liberam energia lentamente.\n* **Chocolate Amargo (70%+):** Rico em antioxidantes e pouco açúcar.`
  },
  {
    id: 'res_n2', title: 'Hidratação e Cognição', type: 'article', category: 'nutrition', duration: '2 min leitura', thumbnail: '💧',
    content: `Você sabia que apenas 2% de desidratação já reduz a atenção, memória e tempo de reação?\n\n**Dica:** Mantenha uma garrafa de água na mesa. Se sentir sede, você já está desidratado. A cor da urina deve ser amarelo claro, quase transparente.`
  }
];
