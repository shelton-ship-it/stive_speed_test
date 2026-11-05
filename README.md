# Stive Speed Test

Teste de velocidade da internet em português e inglês: download, upload, latência e jitter, com diagnóstico, histórico privado no dispositivo e conteúdo preparado para motores de pesquisa.

## Arranque

```bash
npm install
npm run dev        # desenvolvimento
npm run build      # produção, gera .output
npm start          # serve a build
npm test           # testes
npm run typecheck  # tipos
npm run lint       # lint
```

## Marca e ficheiros a fornecer

A marca é **Stive** e nunca é traduzida. O nome completo é "Stive" mais "Speed Test" no idioma de cada página (`marca.nome` nos dicionários): "Stive Speed Test" em inglês, "Stive Teste de Velocidade" em português. Vai nos metadados, no `og:site_name`, nos dados estruturados e no manifesto.

Coloque em `public`:

1. `stive.svg`, o logótipo do cabeçalho (já referenciado; há um espaço reservado enquanto não existir).
2. `icons/icon-192.png`, `icons/icon-512.png`, `icons/icon-maskable-512.png` e `icons/apple-touch-icon.png`, os ícones oficiais da aplicação instalável (ver `public/icons/LEIAME.txt`).
3. Os endereços das redes sociais em `.env`: `VITE_REDE_X`, `VITE_REDE_FACEBOOK` e `VITE_REDE_TIKTOK`. Uma rede sem endereço não mostra ícone.

## Variáveis de ambiente

Veja `.env.example`.

| Variável                                                | Para que serve                                                                                                                                                                      |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SITE_URL`                                              | Endereço público sem barra final. Alimenta canonical, hreflang, Open Graph, `robots.txt` e `sitemap.xml`. Se ficar vazio, é deduzido do pedido, respeitando os cabeçalhos do proxy. |
| `VITE_REDE_X`, `VITE_REDE_FACEBOOK`, `VITE_REDE_TIKTOK` | Endereços das redes sociais do rodapé.                                                                                                                                              |
| `NITRO_PRESET`                                          | Força o destino de publicação. Por omissão é detetado pelo ambiente de build.                                                                                                       |

## SEO

- Todo o conteúdo é renderizado no servidor: `h1`, secções informativas e perguntas frequentes chegam no HTML inicial.
- Duas páginas indexáveis, `/` em português e `/en` em inglês, ligadas por `hreflang`.
- Metadados completos: título, descrição, canonical, Open Graph, Twitter, `theme-color`.
- Dados estruturados `WebApplication` e `FAQPage`, gerados a partir dos mesmos textos visíveis.
- `robots.txt` e `sitemap.xml` dinâmicos, com alternativas de idioma.
- Imagem de partilha em `public/og.png` (1200 por 630).
- Fontes servidas pelo próprio site, numerais tabulares, sem pedidos a terceiros para estilos.

Para alterar os textos, edite `src/medicao/textos/pt.ts` e `en.ts`. Um teste garante que ambos têm as mesmas chaves e que nenhum texto usa hífen, travessão, ponto médio, seta ou emoji.

## Estrutura

```
src/
  componentes/     cabeçalho, rodapé, marca, botão, páginas de erro
  estilos/         tokens de cor e tipografia (global.css)
  paginas/         composição da página e conteúdo informativo
  routes/          rotas, robots.txt e sitemap.xml
  seo/             metadados e dados estruturados
  medicao/
    motor/         contrato do motor, perfis de teste, adaptador
    dominio/       normalização, estatística, classificação, diagnóstico
    estado/        controlador do teste e preferências
    armazenamento/ histórico em IndexedDB
    exportar/      JSON, CSV, resumo
    textos/        dicionários e formatação
    ui/            instrumento, gráficos, relatório, histórico
  test/            testes e motor simulado
scripts/
  traduzir.ts      pipeline de tradução automática
  palavras.ts      pipeline de palavras chave
  seo/             conceitos, mapa de chaves, fontes, pontuação e travões
dados/seo/         candidatos, mapa por idioma, CSV a importar e relatório
  i18n/            prompt, cliente de IA, validador e lógica incremental
```

## Fases desta entrega

1. **Sistema visual.** Fundo profundo e azulado, nunca preto puro. Linhas brancas finas com transparência no tema escuro e linhas de tinta no claro (decisão: brancas e não vermelhas, porque o vermelho fica reservado a erros). O laranja da marca só aparece em ação e estado ativo. O tema segue o navegador por omissão, ao vivo e sem gravar nada, e só uma escolha explícita passa a mandar.
2. **Cabeçalho e cabeça da marca.** Logótipo à esquerda e a cabeça no canto superior direito, de fundo transparente. A cabeça é o script original, mantido, e segue o ponteiro (rato, toque ou caneta) por toda a página. Ver a secção seguinte.
3. **Rodapé e políticas.** Rodapé fino e fixo com políticas, contacto, suporte, redes sociais e "Com tecnologia da API da Cloudflare". Página de políticas com privacidade, o que a Cloudflare recebe, armazenamento, direitos e termos de uso.
4. **Marca nos metadados.** Nome da marca vindo do dicionário, `Organization` e `WebApplication` nos dados estruturados, glossário de tradução a proteger "Stive" e "Cloudflare".
5. **Todos os ecrãs e aplicação instalável.** Telemóvel, deitado, tablet, computador, ecrã grande, ultra largo e televisão (deteção, escala, anel de foco grosso e navegação por setas). Manifesto, service worker e página sem ligação.
6. **Verificação.** Tipos, lint, testes, validação das traduções e das palavras chave, e build em CI (`.github/workflows`).

## Cabeça da marca

O comportamento, a cena 3D e os 26 gestos são do script original, em `public/cabeca/cabeca.js`. Não foi reescrito. Foi alterado só o necessário para integrar, em 18 substituições exatas e verificadas por `scripts/cabeca/gerar.py`: nomes próprios nos elementos, removidos o cursor desenhado, a legenda e o campo de texto visível, o clique já não dá foco a nenhum campo, a escrita é detetada em qualquer campo da página, o ponteiro inclui toque e caneta, a câmara tem um enquadramento fixo e não há gestos aleatórios quando o sistema pede movimento reduzido.

O fundo é transparente: o canvas tem alfa zero e o CSS não põe fundo, borda, sombra nem moldura. É carregada só no navegador, depois de a página estar pronta, e não é carregada com a opção de poupar dados. Para a regenerar a partir do ficheiro original: `python3 scripts/cabeca/gerar.py caminho/do/original.html`. Não reformate este ficheiro (está no `.prettierignore`).

## Políticas

O texto sobre a Cloudflare segue o que ela própria publica para o seu serviço de teste de velocidade (estima país e cidade pelo IP, identifica a rede, reduz o IP a um bloco /24 ou /48 para estudos, partilha só informação anonimizada com parceiros, não vende dados) e o que este código realmente faz (o envio opcional de resultados está desligado e os pedidos de medição vão sem credenciais). O texto é um ponto de partida e não substitui aconselhamento jurídico. As políticas só são indexadas em português e inglês; nos outros idiomas mostram o inglês até a tradução automática ser gerada.

## SEO e palavras chave

O objetivo é ranquear, e para isso o número de palavras chave importa menos do que cobrir as intenções de pesquisa de cada idioma com respostas úteis. O pipeline trabalha com ordens de grandeza que um motor de pesquisa considera naturais: 25 conceitos de pesquisa por idioma, cerca de 17 termos escolhidos por conceito (1 principal, 4 secundários, até 12 de cauda longa), ou seja, umas 400 palavras chave por idioma, num conjunto de candidatos guardado de até 1500 por idioma. Repetir termos em massa ou gerar milhares de páginas quase iguais viola as políticas de spam dos motores de pesquisa e é a forma mais rápida de perder posições, por isso este projeto não o faz.

**Mapa de chaves** (`scripts/seo/mapa.ts`). Cada chave de texto do site é classificada: tem um papel de SEO (título, descrição, `h1`, pergunta frequente, definição e outros) e responde a um conceito de pesquisa, ou é interface e nunca recebe palavras chave. Um teste falha quando surge uma chave nova por classificar. Os conceitos (`scripts/seo/conceitos.ts`) são intenções neutras em relação ao idioma, como "quantos Mbps preciso" ou "porque é que a minha internet é lenta".

**Lacunas de conteúdo.** Um conceito sem nenhuma chave que o responda é procura que o site ainda não satisfaz. Hoje são 11, entre eles dois de prioridade máxima: `quantosMbps` e `internetLenta`. O relatório mostra em quantos idiomas há procura confirmada para cada lacuna, e é a lista do que escrever a seguir.

**Pipeline** (`npm run palavras -- tudo`):

1. `propor`: a IA sugere termos escritos na língua e no mercado de cada idioma, em vez de traduções literais. Em francês, por exemplo, as pessoas procuram "test de débit" e não "test de vitesse". São hipóteses, com evidência baixa.
2. `expandir` (opcional): sugestões do autocompletar do motor de pesquisa. Prova que se pesquisa o termo, mas não diz quanto. Fica desligado por omissão, porque automatizar pedidos a um motor de pesquisa pode violar os seus termos de uso. É lento, tem limite de pedidos e pára ao primeiro bloqueio.
3. `importar`: lê CSV de ferramentas reais em `dados/seo/importar`. Aceita Google Keyword Planner (inclui UTF 16, linhas de título e intervalos como "1K a 10K"), Search Console, Semrush e Ahrefs, com cabeçalhos em vários idiomas. Nomeie os ficheiros `es.csv` ou `es_semrush.csv`. É a única fonte de volume e de dificuldade.
4. `classificar`: a IA atribui cada termo a um conceito. Respostas fora da lista ficam sem conceito.
5. `mapear`: pontua (fórmula documentada em `scripts/seo/pontuar.ts`), escolhe as palavras chave de cada conceito, evita quase duplicados, exclui marcas de terceiros (`scripts/seo/marcas.json`) e escreve `dados/seo/RELATORIO.md`.

`npm run palavras:verificar` valida os dados e corre no CI: falha se um termo tiver volume sem origem numa ferramenta real, ou se uma marca de terceiros for escolhida.

**O que a evidência significa.** Alta: volume vindo de uma exportação real. Média: o termo aparece nas sugestões do motor de pesquisa. Baixa: proposta da IA ainda por confirmar. A IA nunca produz volumes. Sem exportações reais, nenhum termo passa de evidência média.

**Travões anti spam** (`scripts/seo/guardas.ts`). Funções puras, prontas para o passo que aplica palavras chave aos textos: título até 60 caracteres, descrição até 160, `h1` até 70, palavra principal no máximo uma ou duas vezes por texto, limite de secundárias, densidade abaixo de 3% nas respostas, e deteção de listas de palavras chave.

**Automação.** `.github/workflows/palavras.yml` corre todos os meses, quando se acrescentam CSV ou à mão, e abre um pull request com os dados e o relatório.

**Mercados.** A mesma língua pesquisa de forma diferente em países diferentes. `scripts/seo/mercados.ts` define o mercado de cada idioma (por exemplo, `pt` em Moçambique, `ptbr` no Brasil, `es419` no México). Confirme que o mercado principal de cada um é o que quer. Em chinês, coreano, russo e checo domina um motor local (Baidu, Naver, Yandex, Seznam), por isso os dados do Google subestimam a procura: complete com exportações dessas ferramentas.

**O que ainda não existe (próximos passos).**

- Aplicar as palavras chave aos textos de cada idioma, só em chaves mapeadas e dentro dos travões acima.
- Escrever o conteúdo das lacunas: um guia real sobre quantos Mbps cada uso precisa e outro sobre como resolver uma internet lenta.
- Comparar com os concorrentes que aparecem nos resultados, página a página.
- Fechar o ciclo com dados reais do Search Console depois da publicação.
- O motor de pesquisa mostra o seu próprio teste de velocidade no topo dos resultados e há concorrentes muito fortes. A cabeça da pesquisa ("teste de velocidade") é difícil. O terreno ganhável é a cauda longa, o idioma e o mercado local, e responder melhor às perguntas.

## Internacionalização

O site suporta 44 idiomas. Só dois são escritos à mão: `pt.ts` (a origem, onde o significado é decidido) e `en.ts` (referência e reserva). Os outros 42 são gerados por IA e guardados como ficheiros JSON em `src/medicao/textos/gerado`.

**Como funciona**

- Cada idioma vive em `/{slug}`: `/es`, `/ptbr`, `/zhhant`. Os slugs não têm hífen. Os códigos `pt-BR`, `es-419` e `zh-Hant` existem só nos atributos `lang` e `hreflang`, onde a norma os exige.
- Um idioma passa a existir no site quando o seu ficheiro gerado existe e a cobertura validada atinge 95% (`_ativos.json`). Antes disso devolve 404 e não aparece no sitemap nem nos `hreflang`. Não é preciso mexer no código.
- Cada idioma é um ficheiro separado, descarregado só quando alguém o usa. Uma chave em falta mostra o inglês em vez de partir a página.
- Árabe, hebraico, persa e urdu usam `dir="rtl"`. A régua e os gráficos mantêm a escala numérica da esquerda para a direita. Escritas não latinas usam fontes do sistema.

**Gerar traduções**

1. Crie `.env.local` com as variáveis `TRADUCAO_*` (ver `.env.example`).
2. `npm run i18n` traduz só o que falta ou mudou. `npm run i18n -- --locale es,fr` limita a idiomas. `--forcar` retraduz tudo. `--max-chamadas N` limita o custo.
3. `npm run i18n:verificar` valida sem rede. Com `--estrito` falha também se faltar ou estiver desatualizado.

Mudar uma frase em `pt.ts` retraduz só essa chave, em todos os idiomas (a cache usa um hash da frase, da referência em inglês e do glossário).

**Automação**

- `.github/workflows/traduzir.yml` corre quando `pt.ts`, `en.ts`, `locais.ts` ou o glossário mudam, ou à mão. Gera, valida, testa e abre um pull request.
- `.github/workflows/verificar.yml` corre tipos, lint, validação das traduções, testes e build em cada pull request.
- Configure o ambiente `traducao` no repositório (com aprovação manual, se quiser) com os segredos `TRADUCAO_CONTA` e `TRADUCAO_TOKEN` e as variáveis `TRADUCAO_ENDPOINT` e `TRADUCAO_MODELO`.
- Pull requests criados com o token por omissão não disparam outros fluxos. Por isso o fluxo de tradução corre ele próprio a validação e os testes antes de abrir o pull request.

**Blindagem**

- A IA nunca corre no site. Só corre em scripts e no CI, por isso não há custo por visitante, a chave nunca chega ao navegador e o conteúdo é estável para os motores de pesquisa.
- Toda a resposta da IA é tratada como não confiável. Só entra se passar o validador (`scripts/i18n/validar.ts`): marcadores `{n}` intactos, termos protegidos, escrita correta para o idioma, sem hífen, travessão, ponto médio, seta, emoji, marcação, links nem caracteres invisíveis de direção.
- O texto a traduzir segue como dados, com a ordem de nunca obedecer a instruções dentro das cadeias.
- O token só vai no cabeçalho, nunca no corpo, e é apagado de qualquer mensagem de erro.
- Erros de credenciais ou de pedido param tudo à primeira chamada. Falhas temporárias são repetidas com espera crescente. Há um limite de chamadas por execução.
- Uma tradução rejeitada nunca é escrita. Um idioma incompleto nunca é publicado.
- No fluxo do CI: sem permissões por omissão, uma execução de cada vez, entradas passadas por variáveis de ambiente e não coladas no comando. Use um token com permissão apenas para executar modelos de IA.

**Limites a ter em conta**

- A regra de não usar hífen obriga a IA a reformular frases em idiomas onde o hífen é comum (francês, tagalo, indonésio, malaio). O resultado pode ser menos natural. Se preferir, ponha `permitirHifen: true` nesses idiomas em `locais.ts`.
- O sérvio é gerado em cirílico. Para adicionar escrita latina seria preciso um idioma novo no registo.
- O modelo por omissão é configurável (`TRADUCAO_MODELO`). O catálogo de modelos muda, por isso confirme o nome atual antes da primeira execução.

**Adicionar um idioma**: acrescente uma linha em `src/medicao/textos/locais.ts` e corra `npm run i18n -- --locale slug`.

## Design

Sistema visual próprio, em CSS Modules, sem biblioteca de componentes. Dois temas (claro e escuro) com contraste de texto acima de 4,5 para 1. Tipografia: Bricolage Grotesque para títulos e leituras, Instrument Sans para texto. Cada canal de medição tem cor própria e o nível de qualidade nunca depende só da cor.

## Motor de medição

A interface depende apenas do contrato em `src/medicao/motor/contrato.ts`. O adaptador `motorPrincipal.ts` é a única camada que conhece o pacote de medição, instalado em `package.json` sob o nome interno `nucleo`. Para trocar de motor ou usar servidores próprios, implemente o mesmo contrato.

O envio de resultados para serviços de análise do fornecedor do pacote está desligado.

## Privacidade

Os resultados ficam só no navegador (IndexedDB). Não há contas, cookies nem análise de utilização.
