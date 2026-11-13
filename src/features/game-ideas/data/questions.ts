import type { QuestionKey } from "../types";

export interface Question {
  label: string;
  hint: string;
  placeholder?: string;
  required: boolean;
  options?: ReadonlyArray<{ value: string; label: string }>;
}

export const QUESTIONS: Record<QuestionKey, Question> = {
  seed: {
    label: "Qual é a faísca da sua ideia?",
    hint: "Uma ou duas frases já bastam. Pode ser uma situação, um tema ou uma mecânica.",
    placeholder:
      "Um jogo sobre explorar ilhas e construir um barco com o que encontro pelo caminho.",
    required: true,
  },
  playerRole: {
    label: "Quem o jogador será?",
    hint: "Pense no papel que ele vai experimentar e no que poderá fazer.",
    placeholder:
      "Uma exploradora que transforma sucata em ferramentas para atravessar um arquipélago.",
    required: true,
  },
  feeling: {
    label: "O que você quer que o jogador sinta?",
    hint: "Escolha a experiência principal: curiosidade, tranquilidade, tensão, superação…",
    placeholder:
      "Curiosidade ao descobrir lugares e satisfação ao melhorar o barco.",
    required: true,
  },
  audience: {
    label: "Para quem você imagina esse jogo?",
    hint: "Opcional. Hábitos e preferências ajudam mais do que uma faixa etária genérica.",
    placeholder:
      "Pessoas que gostam de exploração, construção e partidas curtas.",
    required: false,
  },
  action: {
    label: "O que o jogador faz repetidamente?",
    hint: "Use verbos. Essa sequência será o ciclo principal de gameplay.",
    placeholder:
      "Explorar ilhas → coletar peças → melhorar o barco → alcançar novas ilhas.",
    required: true,
  },
  challenge: {
    label: "O que torna isso um desafio?",
    hint: "Uma decisão, um obstáculo ou uma limitação que exige uma resposta do jogador.",
    placeholder:
      "O espaço no barco é limitado: é preciso escolher quais peças levar.",
    required: true,
  },
  reward: {
    label: "O que faz o jogador querer continuar?",
    hint: "Pode ser uma descoberta, uma habilidade, uma melhoria ou superar o próprio resultado.",
    placeholder:
      "Cada melhoria permite chegar a uma ilha com novos recursos e histórias.",
    required: true,
  },
  twist: {
    label: "Qual detalhe torna sua ideia especial?",
    hint: "Opcional. Uma regra interessante pode dar mais identidade do que muitas funcionalidades.",
    placeholder:
      "As peças mudam o comportamento do barco, e não apenas seus atributos.",
    required: false,
  },
  platform: {
    label: "Onde o protótipo será jogado?",
    hint: "Escolha uma plataforma para a primeira versão.",
    required: true,
    options: [
      { value: "browser", label: "Navegador" },
      { value: "desktop", label: "PC / desktop" },
      { value: "mobile", label: "Celular" },
    ],
  },
  team: {
    label: "Quem vai construir o protótipo?",
    hint: "Isso ajuda a manter as primeiras entregas possíveis.",
    required: true,
    options: [
      { value: "solo", label: "Vou trabalhar sozinho(a)" },
      { value: "small", label: "Uma equipe pequena (2 a 4 pessoas)" },
      { value: "studio", label: "Uma equipe maior (5 ou mais pessoas)" },
    ],
  },
  timebox: {
    label: "Qual é o tempo reservado para experimentar?",
    hint: "É um limite para o protótipo, não uma estimativa de prazo do jogo completo.",
    required: true,
    options: [
      { value: "weekend", label: "Um fim de semana" },
      { value: "month", label: "Até um mês" },
      { value: "quarter", label: "Até três meses" },
    ],
  },
  prototype: {
    label: "O que a primeira versão precisa provar?",
    hint: "Descreva uma experiência pequena que alguém consiga jogar e avaliar.",
    placeholder:
      "Uma ilha, um barco e uma melhoria. Testar se escolher quais peças levar é divertido.",
    required: true,
  },
};

export const STEPS: Array<{
  title: string;
  description: string;
  fields: QuestionKey[];
}> = [
  {
    title: "Ponto de partida",
    description: "Toda ideia começa com uma faísca.",
    fields: ["seed"],
  },
  {
    title: "Experiência",
    description: "Dê ao jogador um papel e um motivo para entrar nesse mundo.",
    fields: ["playerRole", "feeling", "audience"],
  },
  {
    title: "Como se joga",
    description: "Encontre o ciclo que dá vontade de repetir.",
    fields: ["action", "challenge", "reward", "twist"],
  },
  {
    title: "Primeiro protótipo",
    description: "Transforme a ambição em um experimento possível.",
    fields: ["platform", "team", "timebox", "prototype"],
  },
  {
    title: "Revisão",
    description: "Reúna suas decisões e escolha o próximo passo.",
    fields: [],
  },
];
