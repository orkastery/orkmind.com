// Tipografia do texto técnico no build. No texto editorial (catálogos das docs, home e
// diagramas), a crase marca o código: comando, caminho, flag e identificador. O resto sai
// como prosa, escapado. A auditoria independente do HTML gerado fica em scripts/check-code.mjs.

// Crase abre e fecha um trecho de código. Crase sem par, trecho vazio ou com espaço na
// borda reprovam o build com o texto, em vez de virar prosa com crase solta.
export function codeParts(text) {
  const value = String(text ?? '');
  const pieces = value.split('`');
  if (pieces.length % 2 === 0) throw Error('Unbalanced backtick in: ' + value);
  const parts = [];
  pieces.forEach((piece, i) => {
    if (i % 2) {
      if (!piece || piece !== piece.trim()) throw Error('Empty or padded code span in: ' + value);
      parts.push({text: piece, code: true});
    } else if (piece) parts.push({text: piece, code: false});
  });
  return parts;
}

// Texto sem marcação, para title, meta description, atributos e o title/desc do SVG.
export const plainText = text => codeParts(text).map(part => part.text).join('');

export const escapeText = text => String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

// O chip do código é atômico, e o Chrome abre quebra antes e depois dele mesmo colado a
// pontuação ou parêntese. A unidade sem quebra leva junto a sequência não branca vizinha.
const opening = /\S+$/, closing = /^\S+/;
// Folga do chip dentro da unidade, na medida do que foi colado: pontuação estreita pesa 0,6
// do caractere do código, o resto pesa 1, com teto de 12. O check:code reprova colagem maior.
const narrow = /[.,:;!?()[\]'"]/;
export const unitStyle = (open, close) => `--folga:${Math.min(Math.round([...open + close].reduce((sum, ch) => sum + (narrow.test(ch) ? 0.6 : 1), 0) * 10) / 10, 12)}ch`;

export function technicalUnits(text) {
  const parts = codeParts(text).map(part => ({...part})), units = [];
  parts.forEach((part, i) => {
    if (!part.code) { if (part.text) units.push({text: part.text}); return; }
    const before = units.at(-1), open = before && 'text' in before ? before.text.match(opening)?.[0] || '' : '';
    if (open) before.text = before.text.slice(0, -open.length);
    const after = parts[i + 1], close = after && !after.code ? after.text.match(closing)?.[0] || '' : '';
    if (close) after.text = after.text.slice(close.length);
    units.push({open, code: part.text, close});
  });
  return units.filter(unit => !('text' in unit) || unit.text);
}

// Pontos de quebra dentro do código, para o chip maior que a coluna: depois de separador
// precedido de letra ou número, e na troca de minúscula para maiúscula, mas nunca antes do
// último pedaço curto (extensão, versão, URL). O chip que cabe na coluna continua inteiro;
// o <wbr> não vira caractere ao copiar.
export const codeSegments = code => code.split(/(?:(?<=[\p{L}\p{N}][/._\-=:])(?=[\p{L}\p{N}<])|(?<=[\p{Ll}\p{N}])(?=\p{Lu}))(?![\p{L}\p{N}]{1,5}$)/u);
export const codeHtml = code => `<code>${codeSegments(code).map(escapeText).join('<wbr>')}</code>`;

const unitOpen = (open, close) => `<span class="code-unit" style="${unitStyle(open, close)}">`;
export const technicalHtml = text => technicalUnits(text).map(unit => 'text' in unit
  ? escapeText(unit.text)
  : unit.open || unit.close
    ? `${unitOpen(unit.open, unit.close)}${escapeText(unit.open)}${codeHtml(unit.code)}${escapeText(unit.close)}</span>`
    : codeHtml(unit.code)).join('');

// No SVG não há quebra de linha nem code: o trecho vira tspan.code, em fonte monoespaçada.
export const technicalSvg = text => codeParts(text).map(part => part.code ? `<tspan class="code">${escapeText(part.text)}</tspan>` : escapeText(part.text)).join('');
