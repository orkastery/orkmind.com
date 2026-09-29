// Destinos fora do site que ainda podem estar fechados ao publico.
// Enquanto `aberto` for false, o site mostra "em breve" no lugar do link, sem mandar
// ninguem para um 404. Quando o repositorio abrir, troque para true e publique uma versao
// nova pelo fluxo de teste e aprovacao.
export const externos = {
  orkastery: { url: "https://github.com/orkastery/orkastery", aberto: true },
  orkmind: { url: "https://github.com/orkastery/orkmind", aberto: true },
} as const;

export type Destino = keyof typeof externos;
