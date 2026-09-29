# orkmind-site

Website oficial do [OrkMind](https://orkmind.com), a camada
de memória para sistemas agênticos: Biblioteca governada, 23 coleções de
memória, tipos ontológicos explícitos, busca determinística e proveniência.

Conteúdo em pt-BR, extraído do repositório real do produto
([orkastery/orkmind](https://github.com/orkastery/orkmind)).

## Docs para usuários

A rota `/docs/` reúne instalação, primeiras memórias, organização por tags, recuperação, governança, integração direta e uso pelo Orkastery. Está acessível nos menus e no rodapé.

## Stack

- Astro 5 estático, TypeScript, CSS nativo com design tokens
- Hero em WebGL2 puro (campo de partículas que se organiza na ontologia)
- GSAP + ScrollTrigger para o scrolltelling do recall determinístico
- Ícones Phosphor, tipografia Clash Display + Geist + Geist Mono
- Tema escuro único herdado da identidade do produto, contraste AA verificado

## Comandos

```bash
npm ci            # dependências
npm run dev       # desenvolvimento
npm run build     # build estático em dist/
npm run serve     # serve dist/ localmente
```

## Publicação: teste, aprovação e produção

Dois ambientes servem o mesmo build:

| Ambiente | Onde | Quando muda |
|---|---|---|
| Teste | Servidor interno da org | Sozinho, a cada merge na `main` |
| Produção | https://orkmind.com (GitHub Pages) | Só quando uma versão aprovada no teste é promovida |

- **Versão:** todo build publica `/versao.json` com o SHA e a data do commit. É assim que se
  confere que a produção recebeu exatamente o que foi aprovado no teste.
- **Promover:** criar a tag `producao-AAAAMMDD-HHMM` no commit aprovado. O workflow
  `.github/workflows/publicar.yml` compila esse commit, confere o `/versao.json` e publica.
  Um push na `main` não publica nada.
- **Desfazer:** promover de novo o commit da promoção anterior (tag nova apontando para ele),
  ou rodar o workflow à mão com o `ref` desejado.
- **Links ainda fechados:** os repositórios do OrkMind aparecem como "em breve" até abrirem. A
  chave fica em `src/data/externos.ts`.

## Licença

O site é do produto OrkMind, da organização Orkastery. O OrkMind é MIT.
