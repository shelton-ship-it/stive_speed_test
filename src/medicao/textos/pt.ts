/**
 * Textos em português. É o dicionário de referência: o inglês tem de cobrir
 * exatamente as mesmas chaves (garantido pelo tipo e por um teste).
 * Regra editorial do projeto: sem hífens, travessões, pontos médios, setas ou emojis.
 */
export const pt = {
  // Página e SEO
  "seo.titulo": "Teste de velocidade da internet: download, upload e latência",
  "seo.descricao":
    "Meça a velocidade da sua internet em menos de um minuto. Download, upload, latência e jitter com diagnóstico claro e histórico privado neste dispositivo.",
  "seo.imagemAlt": "Medidor de velocidade da internet com leituras de download e upload",
  "pagina.h1": "Teste de velocidade da internet",
  "pagina.lead":
    "Meça download, upload e latência em menos de um minuto e perceba o que a sua ligação aguenta em jogos, chamadas e vídeo.",

  // Navegação e controlos globais
  "nav.principal": "Navegação principal",
  "nav.teste": "Teste",
  "nav.historico": "Histórico",
  "nav.comoFunciona": "Como funciona",
  "nav.perguntas": "Perguntas",
  "marca.inicio": "Página inicial",
  "a11y.saltar": "Saltar para o conteúdo",
  "controlo.unidade": "Unidade de velocidade",
  "controlo.idioma": "Idioma",
  "controlo.temaParaEscuro": "Mudar para o tema escuro",
  "controlo.temaParaClaro": "Mudar para o tema claro",

  // Fases do teste
  "fase.inativa": "Pronto para medir",
  "fase.verificando": "A verificar o navegador",
  "fase.pronta": "Pronto para iniciar",
  "fase.latencia": "A medir a latência",
  "fase.descida": "A medir o download",
  "fase.subida": "A medir o upload",
  "fase.perdaPacotes": "A medir a perda de pacotes",
  "fase.processando": "A calcular os resultados",
  "fase.concluida": "Teste concluído",
  "fase.pausada": "Teste em pausa",
  "fase.cancelando": "A cancelar",
  "fase.cancelada": "Teste cancelado",
  "fase.parcial": "Teste interrompido, com resultados parciais",
  "fase.falhou": "O teste falhou",

  // Ações
  "acao.iniciar": "Iniciar teste",
  "acao.repetir": "Repetir teste",
  "acao.pausar": "Pausar",
  "acao.retomar": "Retomar",
  "acao.cancelar": "Cancelar",
  "acao.confirmarDados": "Entendo o consumo de dados e quero continuar",
  "acao.imprimir": "Imprimir ou guardar em PDF",
  "acao.copiarResumo": "Copiar resumo",
  "acao.partilhar": "Partilhar",
  "acao.exportarJson": "Exportar JSON",
  "acao.exportarCsv": "Exportar CSV",
  "acao.eliminarSessao": "Eliminar sessão",
  "acao.limparHistorico": "Apagar todo o histórico",
  "acao.importarCopia": "Importar cópia de segurança",
  "acao.exportarCopia": "Exportar cópia de segurança",
  "acao.verDetalhes": "Ver detalhes",
  "acao.fechar": "Fechar",
  "acao.confirmarApagar": "Sim, apagar",
  "acao.manter": "Manter",

  // Instrumento
  "instrumento.rotulo": "Medidor de velocidade",
  "instrumento.canalDescida": "Download",
  "instrumento.canalSubida": "Upload",
  "instrumento.escala": "Escala de velocidade, logarítmica",
  "instrumento.acima": "{valor} ou mais",
  "instrumento.semLeitura": "Sem leitura",

  // Perfis
  "perfil.rotulo": "Perfil do teste",
  "perfil.rapido.nome": "Rápido",
  "perfil.rapido.descricao": "Verificação breve, com menos amostras e menos dados.",
  "perfil.equilibrado.nome": "Equilibrado",
  "perfil.equilibrado.descricao": "Avaliação completa para o uso diário.",
  "perfil.preciso.nome": "Preciso",
  "perfil.preciso.descricao": "Mais amostras e mais tempo. Consome mais dados.",
  "perfil.diagnostico.nome": "Diagnóstico",
  "perfil.diagnostico.descricao":
    "Prioriza a consistência, a latência sob carga e a análise detalhada.",
  "perfil.personalizado.nome": "Personalizado",
  "perfil.personalizado.descricao": "Escolha o nível de amostragem e aceite o consumo estimado.",
  "perfil.estimativa":
    "Estimativa no pior caso: {pedidos} pedidos, até {descida} de download e {subida} de upload, em cerca de {duracao}.",
  "perfil.duracao": "{min} a {max} segundos",
  "perfil.aviso":
    "Este perfil transfere uma quantidade significativa de dados. Em ligações com tarifa por volume, use com cuidado.",
  "perfil.nivel": "Nível de amostragem",
  "perfil.nivel.leve": "Leve",
  "perfil.nivel.padrao": "Padrão",
  "perfil.nivel.intensivo": "Intensivo",

  // Progresso
  "progresso.fase": "Fase {feitas} de {total}",
  "progresso.transferidos": "{bytes} transferidos",
  "progresso.restante": "restam cerca de {segundos} s, em estimativa",
  "progresso.rotulo": "Progresso do teste",

  // Métricas
  "metrica.descida": "Download",
  "metrica.subida": "Upload",
  "metrica.latenciaRepouso": "Latência em repouso",
  "metrica.jitterRepouso": "Jitter em repouso",
  "metrica.latenciaCargaDescida": "Latência durante o download",
  "metrica.jitterCargaDescida": "Jitter durante o download",
  "metrica.latenciaCargaSubida": "Latência durante o upload",
  "metrica.jitterCargaSubida": "Jitter durante o upload",
  "metrica.aumentoLatenciaDescida": "Aumento da latência no download",
  "metrica.aumentoLatenciaSubida": "Aumento da latência no upload",
  "metrica.perdaPacotes": "Perda de pacotes",
  "metrica.duracao": "Duração total",
  "metrica.transferidos": "Dados transferidos",
  "metrica.pontuacaoMotor": "Pontuação do motor de medição",
  "metrica.curtaLatencia": "Latência",
  "metrica.curtaJitter": "Jitter",
  "metrica.origemMotor": "Medida diretamente",
  "metrica.origemDerivada": "Calculada a partir das amostras",
  "unidade.mbps": "Mbps",
  "unidade.mbs": "MB/s",
  "unidade.indisponivel": "não medido",
  "unidade.naoSuportada": "não suportado",
  "unidade.invalida": "inválido",
  "unidade.nota":
    "Mbps são megabits por segundo e MB/s são megabytes por segundo. Um byte tem oito bits.",
  "geral.semValor": "sem valor",

  // Gráficos
  "grafico.tempoReal": "Velocidade em tempo real",
  "grafico.vazio": "As leituras aparecem assim que o teste começar.",
  "grafico.tendencia": "Evolução durante o teste",
  "grafico.latenciaTitulo": "Latência em repouso por amostra",
  "grafico.larguraTitulo": "Velocidade por pedido",
  "grafico.cargaTitulo": "Latência em repouso e sob carga",
  "grafico.segundos": "segundos",
  "grafico.amostra": "Amostra {n}",
  "grafico.resumo": "Gráfico: {titulo}. Mínimo {min}, máximo {max}, último valor {ultimo}.",
  "grafico.amostras": "amostras",
  "grafico.cargaDescida": "Durante o download",
  "grafico.cargaSubida": "Durante o upload",
  "grafico.repouso": "Em repouso",

  // Ligação
  "ligacao.titulo": "A sua ligação",
  "ligacao.navegador": "Navegador",
  "ligacao.sistema": "Sistema",
  "ligacao.tipo": "Tipo de ligação",
  "ligacao.protocolo": "Protocolo",
  "ligacao.perfil": "Perfil",
  "ligacao.unidade": "Unidade",
  "ligacao.naoIndicado": "não indicado pelo navegador",

  // Secções do relatório
  "secao.relatorio": "Resultado",
  "secao.experiencia": "Qualidade para cada uso",
  "secao.diagnostico": "Análise da ligação",
  "secao.contexto": "Contexto do teste",
  "secao.historico": "Histórico",
  "secao.tecnica": "Detalhes técnicos",
  "secao.bruto": "Contagem de amostras",
  "secao.partilha": "Guardar e partilhar",
  "secao.avisos": "Avisos da medição",

  // Qualidade por uso
  "uso.jogos.nome": "Jogos online",
  "uso.streaming.nome": "Streaming de vídeo",
  "uso.videochamadas.nome": "Videochamadas",
  "uso.navegacao.nome": "Navegação diária",
  "uso.transferencias.nome": "Transferência de ficheiros",
  "uso.trabalhoRemoto.nome": "Trabalho remoto",
  "uso.jogos.explicacao": "Os jogos dependem sobretudo de uma latência baixa e estável sob carga.",
  "uso.streaming.explicacao": "O streaming depende de uma velocidade de download sustentada.",
  "uso.videochamadas.explicacao": "As chamadas exigem upload suficiente e latência controlada.",
  "uso.navegacao.explicacao": "Navegar precisa de latência moderada e de um download básico.",
  "uso.transferencias.explicacao": "As transferências aproveitam um download e um upload elevados.",
  "uso.trabalhoRemoto.explicacao": "O trabalho remoto combina upload, latência e estabilidade.",
  "uso.jogos.limite": "Não medimos um jogo concreto. É uma estimativa de adequação.",
  "uso.streaming.limite": "Não testámos serviços de streaming concretos.",
  "uso.videochamadas.limite": "Não medimos plataformas de videochamada concretas.",
  "uso.navegacao.limite": "Estimativa baseada nas características da ligação.",
  "uso.transferencias.limite": "As velocidades reais variam com o servidor remoto.",
  "uso.trabalhoRemoto.limite": "Estimativa. Não avalia aplicações de trabalho concretas.",
  "uso.limiteMotor": "Classificação calculada pelo motor de medição.",
  "nivel.excelente": "Excelente",
  "nivel.boa": "Boa",
  "nivel.limitada": "Limitada",
  "nivel.fraca": "Fraca",
  "nivel.semDados": "Sem dados suficientes",
  "recomendacao.latencia":
    "Para reduzir a latência, use cabo de rede ou chegue mais perto do router, e evite tráfego concorrente durante atividades sensíveis.",
  "recomendacao.descida":
    "Se a velocidade contratada for superior, verifique o WiFi, os cabos e os outros dispositivos em uso antes de contactar o operador.",
  "recomendacao.subida":
    "Um upload baixo prejudica videochamadas e o envio de ficheiros. Confirme se o plano inclui o upload esperado.",
  "uso.metricas": "Métricas consideradas",
  "uso.regras": "Regras de classificação, versão {versao}",

  // Estatísticas
  "estat.metrica": "Métrica",
  "estat.amostras": "Amostras",
  "estat.mediana": "Mediana",
  "estat.p95": "Percentil 95",
  "estat.minimoMaximo": "Mínimo e máximo",
  "estat.variabilidade": "Variabilidade",
  "estat.atipicos": "Atípicos",
  "estat.atipicosNota": "Os valores atípicos são assinalados, mas nunca removidos dos dados.",
  "amostra.latenciaRepousoMs": "Latência em repouso",
  "amostra.latenciaCargaDescidaMs": "Latência no download",
  "amostra.latenciaCargaSubidaMs": "Latência no upload",
  "amostra.descidaMbps": "Download",
  "amostra.subidaMbps": "Upload",
  "amostra.validas": "válidas",
  "amostra.descartadas": "descartadas",

  // Diagnóstico
  "diagnostico.nota": "Nota",
  "diagnostico.observado": "Observado",
  "diagnostico.paginaOculta":
    "A página esteve oculta durante o teste, por isso o navegador pode ter limitado a medição.",
  "diagnostico.tipoLigacaoIndisponivel": "O navegador não indica o tipo de ligação.",
  "diagnostico.perdaNaoMedida":
    "A perda de pacotes não é medida, porque exige uma infraestrutura de relé própria.",
  "diagnostico.semAmostras": "Nenhuma amostra válida foi recolhida.",
  "diagnostico.poucasAmostras":
    "Poucas amostras de velocidade, por isso os valores têm menos confiança.",
  "diagnostico.obs.aumentoDescida": "A latência aumentou {delta} ms durante o download.",
  "diagnostico.obs.aumentoSubida": "A latência aumentou {delta} ms durante o upload.",
  "diagnostico.obs.variacaoDescida": "Grande variação entre as amostras de download (CV de {cv}%).",
  "diagnostico.obs.latenciaAtipica":
    "{count} de {total} amostras de latência ficaram fora do intervalo típico.",
  "diagnostico.obs.movel": "O navegador indica uma ligação móvel.",
  "diagnostico.obs.paginaOculta": "A página ficou oculta durante a medição.",
  "diagnostico.obs.semAnomalias": "Nenhuma anomalia relevante nos dados medidos.",
  "diagnostico.obs.nota":
    "Os resultados descrevem esta sessão e este trajeto até aos servidores de medição.",
  "diagnostico.hip.filasExcessivas":
    "Causa possível: filas excessivas no router ou na ligação, conhecidas por bufferbloat.",
  "diagnostico.hip.wifiOuCongestionamento":
    "Causa possível: WiFi instável ou congestionamento na rede local.",
  "diagnostico.hip.prioridadeDeTrafego":
    "Causa possível: prioridade de tráfego limitada no sentido de saída.",
  "diagnostico.hip.instabilidadeWifi": "Causa possível: interferência ou oscilação do sinal WiFi.",
  "diagnostico.hip.trafegoConcorrente":
    "Causa possível: outros dispositivos ou aplicações a usar a ligação durante o teste.",
  "diagnostico.hip.interferenciaOuFila":
    "Causa possível: intermitência pontual, por WiFi ou fila no equipamento.",
  "diagnostico.hip.variacaoMovel": "As ligações móveis variam naturalmente ao longo do tempo.",
  "diagnostico.hip.limitacaoEmSegundoPlano":
    "Os navegadores limitam páginas em segundo plano, e as contagens de tempo podem perder precisão.",
  "diagnostico.hip.ressalvasGerais":
    "VPN, proxy, WiFi e tráfego concorrente podem afetar qualquer medição.",
  "diagnostico.hip.vpnOuProxy":
    "Se usa VPN ou proxy, o resultado reflete esse caminho e não a ligação direta.",

  // Ambiente
  "ambiente.navegador": "Navegador",
  "ambiente.sistema": "Sistema operativo",
  "ambiente.tipoLigacao": "Tipo de ligação indicado pelo navegador",
  "ambiente.naoIndicado": "não indicado",
  "ambiente.visibilidade": "Visibilidade da página durante o teste",
  "ambiente.oculta": "oculta",
  "ambiente.visivel": "visível",

  // Histórico
  "historico.vazio": "Ainda não há resultados guardados. Os testes concluídos aparecem aqui.",
  "historico.nota":
    "O histórico fica guardado apenas neste dispositivo e pode desaparecer se limpar os dados do navegador. Nada é sincronizado.",
  "historico.comparar": "Comparar sessões",
  "historico.compararDica": "Marque duas ou três sessões na coluna Comparar.",
  "historico.importadas":
    "{importadas} sessões importadas, {rejeitadas} rejeitadas pela validação.",
  "historico.ficheiroInvalido": "O ficheiro não é uma cópia de segurança válida.",
  "historico.confirmarLimpar": "Apagar definitivamente todo o histórico deste dispositivo?",
  "historico.carregando": "A carregar o histórico",
  "tabela.data": "Data",
  "tabela.descida": "Download",
  "tabela.subida": "Upload",
  "tabela.latencia": "Latência",
  "tabela.jitter": "Jitter",
  "tabela.duracao": "Duração",
  "tabela.perfil": "Perfil",
  "tabela.estado": "Estado",
  "tabela.acoes": "Ações",
  "tabela.comparar": "Comparar",
  "estado.concluida": "Concluída",
  "estado.parcial": "Parcial",
  "estado.falhou": "Falhou",
  "estado.cancelada": "Cancelada",

  // Partilha
  "partilha.titulo": "Resultado do teste de velocidade",
  "partilha.perfil": "Perfil",
  "partilha.aviso":
    "Medição de uma única sessão. Não é uma garantia permanente da qualidade da ligação.",
  "partilha.copiado": "Resumo copiado para a área de transferência.",
  "partilha.falhouCopia": "Não foi possível copiar. Selecione o texto manualmente.",
  "partilha.semSuporte": "Este navegador não tem partilha nativa. Use copiar ou exportar.",

  // Erros do teste
  "erro.tempoEsgotado": "O teste excedeu o tempo limite do perfil. Pode tentar de novo.",
  "erro.rede": "Falha de rede durante a medição. Verifique a ligação e tente de novo.",
  "erro.bloqueio":
    "O navegador bloqueou os pedidos de medição. Verifique extensões ou redes empresariais.",
  "erro.falhaDescida": "A fase de download falhou. Pode repetir o teste.",
  "erro.falhaSubida":
    "A fase de upload falhou. Uma firewall ou um proxy podem estar a bloquear pedidos.",
  "erro.generico": "Ocorreu um erro durante o teste. Pode repetir.",
  "erro.naoSuportado":
    "Este navegador não suporta as funções necessárias. Experimente uma versão recente de outro navegador.",
  "erro.outroSeparador":
    "Outro separador desta página tem um teste em curso. Evite testes simultâneos.",

  // Privacidade e rodapé
  "privacidade.nota":
    "Os resultados finais não são enviados a ninguém e ficam guardados apenas neste dispositivo.",
  "rodape.medicao": "Cada teste descreve uma única sessão, neste dispositivo e neste momento.",
  "rodape.idiomas": "Idiomas",

  // Conteúdo informativo (SEO)
  "info.comoTitulo": "Como funciona o teste",
  "info.comoIntro":
    "O navegador troca dados diretamente com servidores públicos de medição, em quatro passos.",
  "info.passo1":
    "Latência em repouso: o navegador envia pequenos pedidos e mede quanto tempo demoram a voltar, com a ligação livre.",
  "info.passo2":
    "Download: são recebidos blocos de dados de tamanho crescente e a velocidade é calculada com o tempo real de cada transferência.",
  "info.passo3":
    "Upload: o processo é repetido no sentido contrário, com blocos de dados enviados do seu dispositivo.",
  "info.passo4":
    "Latência sob carga: durante o download e o upload a latência continua a ser medida. Mostra se a ligação aguenta tráfego intenso sem atrasos.",
  "info.medidasTitulo": "O que significa cada medida",
  "info.medidaDescida":
    "Velocidade com que os dados chegam ao seu dispositivo. Conta para ver vídeo, abrir páginas e descarregar ficheiros.",
  "info.medidaSubida":
    "Velocidade com que os dados saem do seu dispositivo. Conta para videochamadas, cópias de segurança e envio de ficheiros.",
  "info.medidaLatencia":
    "Tempo de ida e volta de um pedido pequeno, em milissegundos, com a ligação livre. Quanto menor, mais reativa é a ligação.",
  "info.medidaJitter":
    "Variação da latência entre pedidos consecutivos. Quanto menor, mais estável é a ligação.",
  "info.medidaCarga":
    "Latência medida enquanto o download ou o upload estão ativos. Um aumento grande indica filas no router ou na rede, conhecidas por bufferbloat.",
  "info.faqTitulo": "Perguntas frequentes",
  "faq.p1": "Qual é uma boa velocidade de internet?",
  "faq.r1":
    "Depende do uso. Para navegar e ver vídeo em alta definição, 25 Mbps de download costumam bastar. Para vários dispositivos em simultâneo, jogos online ou vídeo em 4K, convém ter 100 Mbps ou mais. Nas videochamadas, o upload e a latência pesam tanto como o download.",
  "faq.p2": "Porque é que o resultado muda de um teste para outro?",
  "faq.r2":
    "A velocidade depende do momento, da distância até ao servidor de teste, do WiFi, dos outros dispositivos ligados e da carga da rede do operador. Um teste é uma fotografia, não uma garantia. Repita a medição em horas diferentes para ter uma ideia mais fiel.",
  "faq.p3": "Qual é a diferença entre Mbps e MB/s?",
  "faq.r3":
    "Mbps mede megabits por segundo e é a unidade usada pelos operadores. MB/s mede megabytes por segundo e é a que o computador mostra ao descarregar um ficheiro. Um byte tem oito bits, por isso 100 Mbps correspondem a 12,5 MB/s.",
  "faq.p4": "O que é a latência e porque é que importa?",
  "faq.r4":
    "É o tempo que um pequeno pedido demora a ir e voltar, medido em milissegundos. Valores baixos tornam os jogos, as chamadas e a navegação mais reativos. Abaixo de 30 ms é muito bom e acima de 150 ms o atraso é percetível.",
  "faq.p5": "O que é o jitter?",
  "faq.r5":
    "É a variação da latência de um pedido para o seguinte. Mesmo com boa velocidade, um jitter alto causa cortes em chamadas de voz e vídeo e saltos nos jogos.",
  "faq.p6": "O teste gasta muitos dados?",
  "faq.r6":
    "No pior caso, o perfil Rápido transfere cerca de 9 MB e o Equilibrado cerca de 105 MB. Os perfis Preciso e Diagnóstico podem ultrapassar os 200 MB. Em ligações com dados limitados, prefira o perfil Rápido.",
  "faq.p7": "Os meus resultados ficam guardados num servidor?",
  "faq.r7":
    "Não. O histórico fica apenas no navegador deste dispositivo e pode ser apagado a qualquer momento. Durante o teste o navegador comunica com servidores de medição, que veem o seu endereço IP como qualquer site que visite.",
  "faq.p8": "Como obter um resultado mais fiável?",
  "faq.r8":
    "Feche outros separadores e aplicações que usem a rede, use cabo de rede ou fique perto do router, desative VPN e proxy e mantenha esta página aberta e visível até ao fim.",

  // Páginas de erro
  "erroPagina.titulo": "Esta página não carregou",
  "erroPagina.texto": "Ocorreu um problema do nosso lado. Tente de novo ou volte ao início.",
  "erroPagina.tentar": "Tentar de novo",
  "naoEncontrada.titulo": "Página não encontrada",
  "naoEncontrada.texto": "O endereço que abriu não existe ou foi movido.",
  "naoEncontrada.voltar": "Voltar ao teste",

  // Percurso do teste (globo)
  "percurso.titulo": "Percurso do teste",
  "percurso.rotulo": "Globo com o local aproximado e o servidor de teste",
  "percurso.dica": "Arraste o globo para o rodar.",
  "percurso.aguarda": "O local e o servidor de teste aparecem quando iniciar o teste.",
  "percurso.obtendo": "A obter o local e o servidor de teste.",
  "percurso.indisponivel": "Não foi possível obter o local. A medição de velocidade não é afetada.",
  "percurso.local": "Local aproximado",
  "percurso.rede": "Rede indicada pelo IP",
  "percurso.servidor": "Servidor de teste",
  "percurso.distancia": "Distância em linha reta",
  "percurso.minimoFibra": "Mínimo teórico na fibra",
  "percurso.latenciaMedida": "Latência medida",
  "percurso.fator": "Medida face ao mínimo",
  "percurso.fatorValor": "{n} vezes",
  "percurso.km": "{n} km",
  "percurso.notaLocal":
    "O local vem do endereço IP e é aproximado. Pode indicar a sede do operador e não a sua casa.",
  "percurso.notaFibra":
    "A luz na fibra percorre cerca de 200 mil quilómetros por segundo. Os cabos reais fazem curvas e passam por equipamentos, por isso a latência medida fica sempre acima do mínimo.",
  "percurso.legendaDescida": "Dados a chegar ao seu dispositivo",
  "percurso.legendaSubida": "Dados a sair do seu dispositivo",
  "percurso.legendaLatencia": "Pedidos de ida e volta ao servidor",
  "percurso.legendaRepouso": "Sem tráfego em curso",

  // Marca, rodapé e políticas
  "marca.nome": "Stive Teste de Velocidade",
  "rodape.direitos": "© {ano} Stive. Todos os direitos reservados.",
  "rodape.navegacao": "Ligações do rodapé",
  "rodape.politicas": "Políticas",
  "rodape.contacto": "Contacto",
  "rodape.suporte": "Suporte",
  "rodape.redes": "Redes sociais",
  "rodape.seguir": "Stive no {rede}",
  "rodape.poweredBy": "Com tecnologia da API da {marca}",
  "politicas.seoTitulo": "Políticas de privacidade, termos e cookies",
  "politicas.seoDescricao":
    "Como o Stive Teste de Velocidade trata os seus dados: o que fica no seu dispositivo, o que a Cloudflare recebe no teste e as regras de uso.",
  "politicas.titulo": "Políticas",
  "politicas.atualizado": "Última atualização: 2 de novembro de 2026.",
  "politicas.indice": "Nesta página",
  "politicas.voltar": "Voltar ao teste",
  "politicas.resumo.titulo": "Em resumo",
  "politicas.resumo.p1":
    "O Stive Teste de Velocidade mede a sua ligação diretamente no seu navegador. Não tem contas, não mostra anúncios e não usa ferramentas de análise nem cookies de rastreio.",
  "politicas.resumo.p2":
    "Os resultados e as preferências ficam só neste dispositivo. Durante o teste, o seu navegador comunica com a infraestrutura da Cloudflare, que recebe o seu endereço IP como qualquer serviço que visite.",
  "politicas.recolha.titulo": "Que dados tratamos",
  "politicas.recolha.p1":
    "Nós não recolhemos dados pessoais. Não pedimos nome, email nem qualquer registo, e não enviamos os seus resultados para um servidor nosso.",
  "politicas.recolha.p2":
    "No seu dispositivo ficam guardados o tema e a unidade de velocidade que escolheu, o histórico dos seus testes (resultado, data, perfil, e o local aproximado e o servidor de teste usados) e, se instalar a aplicação, uma cópia dos ficheiros do site para funcionar mais depressa e mostrar um aviso quando não há ligação.",
  "politicas.recolha.p3":
    "Pode apagar o histórico a qualquer momento na secção Histórico, e tudo o resto limpando os dados do site no navegador.",
  "politicas.cloudflare.titulo": "O que a Cloudflare recebe durante o teste",
  "politicas.cloudflare.p1":
    "A medição usa as APIs e os servidores da Cloudflare. Quando inicia um teste, o seu navegador liga se diretamente a esses servidores para enviar e receber dados de medição. Por isso a Cloudflare recebe o seu endereço IP e os dados técnicos habituais de qualquer pedido, como o tipo de navegador.",
  "politicas.cloudflare.p2":
    "Segundo a descrição publicada pela própria Cloudflare para o seu serviço de teste de velocidade, a partir do endereço IP ela estima o país e a cidade e identifica a rede, ou seja, o operador. Para estudos sobre o desempenho da internet, reduz o endereço IP a um bloco de rede (por exemplo /24 em IPv4) e partilha com parceiros de medição apenas informação anonimizada, sem o endereço IP. A Cloudflare afirma que nunca vende dados.",
  "politicas.cloudflare.p3":
    "Não ativámos o envio opcional dos resultados completos do teste para os serviços de análise da Cloudflare, e os nossos pedidos de medição são feitos sem cookies nem credenciais. A Cloudflare continua responsável pelo seu próprio tratamento desses pedidos, que se rege pela política de privacidade dela.",
  "politicas.cloudflare.p4":
    "O local aproximado que mostramos no globo vem do mesmo serviço, é pedido apenas quando inicia um teste e fica só no seu dispositivo. Pode indicar a sede do operador e não a sua casa.",
  "politicas.cloudflare.ligacao": "Ler a política de privacidade da Cloudflare",
  "politicas.dados.titulo": "Consumo de dados do teste",
  "politicas.dados.p1":
    "Um teste transfere dados na sua ligação, em receção e em envio. O perfil Rápido usa até cerca de 9 MB, o Equilibrado até cerca de 105 MB e os perfis Preciso e Diagnóstico podem ultrapassar 200 MB. Em ligações com dados limitados, escolha o perfil Rápido.",
  "politicas.armazenamento.titulo": "Cookies e armazenamento local",
  "politicas.armazenamento.p1":
    "Não definimos cookies. Usamos o armazenamento local do navegador para as preferências (tema e unidade), a base de dados local para o histórico e a memória do navegador para a cópia dos ficheiros da aplicação instalada.",
  "politicas.armazenamento.p2":
    "As páginas de contacto e de suporte ficam em endereços próprios da marca e têm as suas próprias regras.",
  "politicas.alojamento.titulo": "Alojamento e registos técnicos",
  "politicas.alojamento.p1":
    "O servidor que entrega esta página pode registar os pedidos recebidos (endereço IP, data e página pedida) por razões técnicas e de segurança, de acordo com as práticas do fornecedor de alojamento.",
  "politicas.direitos.titulo": "Os seus direitos",
  "politicas.direitos.p1":
    "Como não guardamos os seus dados pessoais, não há dados seus em nosso poder para consultar, corrigir ou apagar. Pode apagar tudo o que fica no seu dispositivo quando quiser.",
  "politicas.direitos.p2":
    "Para exercer direitos sobre os dados tratados pela Cloudflare, como o acesso ou o apagamento, use os canais indicados na política de privacidade dela. A lei aplicável pode dar lhe estes direitos, por exemplo ao abrigo do RGPD na União Europeia ou da LGPD no Brasil.",
  "politicas.termos.titulo": "Termos de uso",
  "politicas.termos.p1":
    "O serviço é gratuito e fornecido como está, sem garantia de que esteja sempre disponível ou livre de erros. Os resultados são indicativos: descrevem uma única sessão, neste dispositivo e neste momento, e não garantem a qualidade da sua ligação.",
  "politicas.termos.p2":
    "Use o serviço de forma razoável. Não automatize testes em volume, não tente sobrecarregar os servidores de medição nem contornar os limites do serviço.",
  "politicas.termos.p3":
    "O nome e o logótipo Stive pertencem à Stive. A Cloudflare, o X, o Facebook e o TikTok são marcas dos respetivos donos e são mencionados só para identificar o fornecedor e as ligações.",
  "politicas.termos.p4":
    "Na medida permitida pela lei, não nos responsabilizamos por decisões tomadas com base nos resultados nem por perdas resultantes do uso do serviço.",
  "politicas.alteracoes.titulo": "Alterações e contacto",
  "politicas.alteracoes.p1":
    "Podemos atualizar estas políticas. A data da última atualização está no topo desta página.",
  "politicas.alteracoes.p2":
    "Para dúvidas sobre privacidade ou sobre estes termos, use a página de contacto. Para ajuda com o uso do serviço, use a página de suporte.",
} as const;

export type Chave = keyof typeof pt;
