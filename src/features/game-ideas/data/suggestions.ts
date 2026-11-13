import type { QuestionKey } from "../types";

const SUGGESTIONS: Partial<Record<QuestionKey, string[]>> = {
  seed: [
    "Explorar um arquipélago e construir um barco com peças encontradas em cada ilha.",
    "Cuidar de uma pequena livraria onde organizar os livros muda as histórias dos visitantes.",
    "Resolver enigmas em uma estação espacial usando apenas os sons que atravessam suas paredes.",
    "Entregar cartas em uma cidade que muda de forma a cada amanhecer.",
    "Cultivar um jardim em que cada planta altera uma regra do ambiente.",
    "Montar caminhos para guiar um grupo de criaturas que só consegue enxergar cores diferentes.",
  ],
  playerRole: [
    "Uma exploradora que inventa ferramentas com os recursos que encontra.",
    "Um guardião que aprende a transformar o ambiente para ajudar seus habitantes.",
    "Uma aprendiz que resolve situações difíceis observando padrões e experimentando combinações.",
  ],
  feeling: [
    "Curiosidade e prazer de descobrir algo inesperado.",
    "Tranquilidade e satisfação ao ver o ambiente evoluir.",
    "Superação e domínio gradual de uma habilidade.",
  ],
  audience: [
    "Pessoas que gostam de explorar e experimentar sem pressão de tempo.",
    "Jogadores que preferem desafios curtos, com regras simples e espaço para dominar a mecânica.",
    "Pessoas que gostam de histórias e decisões com consequências visíveis.",
  ],
  action: [
    "Explorar → encontrar recursos → criar uma melhoria → acessar um novo desafio.",
    "Observar um padrão → experimentar uma combinação → resolver um enigma → descobrir uma nova regra.",
    "Planejar uma rota → executar uma tentativa → aprender com o resultado → melhorar a próxima tentativa.",
  ],
  challenge: [
    "Poucos recursos obrigam o jogador a escolher entre avançar agora ou se preparar melhor.",
    "Cada ação altera o ambiente e exige adaptar a estratégia.",
    "Informações incompletas incentivam observar, criar hipóteses e experimentar.",
  ],
  reward: [
    "Descobrir uma nova área com possibilidades de interação diferentes.",
    "Ver as consequências das próprias escolhas transformarem o cenário.",
    "Dominar uma habilidade e conseguir resolver o mesmo desafio de novas formas.",
  ],
  twist: [
    "A ferramenta principal também transforma o obstáculo que o jogador precisa superar.",
    "Cada melhoria oferece uma nova possibilidade, mas exige abrir mão de outra.",
    "O ambiente guarda as consequências das tentativas anteriores e passa a fazer parte da solução.",
  ],
};

export function getSuggestions(field: QuestionKey, page = 0): string[] {
  const options = SUGGESTIONS[field] ?? [];
  if (!options.length) return [];
  const offset = (page * 3) % options.length;
  return Array.from(
    { length: Math.min(3, options.length) },
    (_, index) => options[(offset + index) % options.length],
  );
}

export function hasMoreSuggestions(field: QuestionKey): boolean {
  return (SUGGESTIONS[field]?.length ?? 0) > 3;
}
