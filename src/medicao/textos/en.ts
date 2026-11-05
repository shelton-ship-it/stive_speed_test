import type { Chave } from "./pt";

/** English copy. Same editorial rule as Portuguese: no hyphens, dashes, middle dots, arrows or emoji. */
export const en: Record<Chave, string> = {
  "seo.titulo": "Internet speed test: download, upload and latency",
  "seo.descricao":
    "Measure your internet speed in under a minute. Download, upload, latency and jitter with a clear diagnosis and a private history on this device.",
  "seo.imagemAlt": "Internet speed meter showing download and upload readings",
  "pagina.h1": "Internet speed test",
  "pagina.lead":
    "Measure download, upload and latency in under a minute and see what your connection can handle for games, calls and video.",

  "nav.principal": "Main navigation",
  "nav.teste": "Test",
  "nav.historico": "History",
  "nav.comoFunciona": "How it works",
  "nav.perguntas": "Questions",
  "marca.inicio": "Home page",
  "a11y.saltar": "Skip to content",
  "controlo.unidade": "Speed unit",
  "controlo.idioma": "Language",
  "controlo.temaParaEscuro": "Switch to the dark theme",
  "controlo.temaParaClaro": "Switch to the light theme",

  "fase.inativa": "Ready to measure",
  "fase.verificando": "Checking the browser",
  "fase.pronta": "Ready to start",
  "fase.latencia": "Measuring latency",
  "fase.descida": "Measuring download",
  "fase.subida": "Measuring upload",
  "fase.perdaPacotes": "Measuring packet loss",
  "fase.processando": "Calculating results",
  "fase.concluida": "Test complete",
  "fase.pausada": "Test paused",
  "fase.cancelando": "Cancelling",
  "fase.cancelada": "Test cancelled",
  "fase.parcial": "Test interrupted, partial results",
  "fase.falhou": "The test failed",

  "acao.iniciar": "Start test",
  "acao.repetir": "Run again",
  "acao.pausar": "Pause",
  "acao.retomar": "Resume",
  "acao.cancelar": "Cancel",
  "acao.confirmarDados": "I understand the data usage and want to continue",
  "acao.imprimir": "Print or save as PDF",
  "acao.copiarResumo": "Copy summary",
  "acao.partilhar": "Share",
  "acao.exportarJson": "Export JSON",
  "acao.exportarCsv": "Export CSV",
  "acao.eliminarSessao": "Delete session",
  "acao.limparHistorico": "Delete all history",
  "acao.importarCopia": "Import backup",
  "acao.exportarCopia": "Export backup",
  "acao.verDetalhes": "View details",
  "acao.fechar": "Close",
  "acao.confirmarApagar": "Yes, delete",
  "acao.manter": "Keep",

  "instrumento.rotulo": "Speed meter",
  "instrumento.canalDescida": "Download",
  "instrumento.canalSubida": "Upload",
  "instrumento.escala": "Speed scale, logarithmic",
  "instrumento.acima": "{valor} or more",
  "instrumento.semLeitura": "No reading",

  "perfil.rotulo": "Test profile",
  "perfil.rapido.nome": "Quick",
  "perfil.rapido.descricao": "A brief check with fewer samples and less data.",
  "perfil.equilibrado.nome": "Balanced",
  "perfil.equilibrado.descricao": "A complete assessment for everyday use.",
  "perfil.preciso.nome": "Precise",
  "perfil.preciso.descricao": "More samples and more time. Uses more data.",
  "perfil.diagnostico.nome": "Diagnostic",
  "perfil.diagnostico.descricao":
    "Focuses on consistency, latency under load and detailed analysis.",
  "perfil.personalizado.nome": "Custom",
  "perfil.personalizado.descricao": "Choose the sampling level and accept the estimated usage.",
  "perfil.estimativa":
    "Worst case estimate: {pedidos} requests, up to {descida} of download and {subida} of upload, in about {duracao}.",
  "perfil.duracao": "{min} to {max} seconds",
  "perfil.aviso":
    "This profile transfers a significant amount of data. On metered connections, use it with care.",
  "perfil.nivel": "Sampling level",
  "perfil.nivel.leve": "Light",
  "perfil.nivel.padrao": "Standard",
  "perfil.nivel.intensivo": "Intensive",

  "progresso.fase": "Phase {feitas} of {total}",
  "progresso.transferidos": "{bytes} transferred",
  "progresso.restante": "about {segundos} s left, estimated",
  "progresso.rotulo": "Test progress",

  "metrica.descida": "Download",
  "metrica.subida": "Upload",
  "metrica.latenciaRepouso": "Idle latency",
  "metrica.jitterRepouso": "Idle jitter",
  "metrica.latenciaCargaDescida": "Latency during download",
  "metrica.jitterCargaDescida": "Jitter during download",
  "metrica.latenciaCargaSubida": "Latency during upload",
  "metrica.jitterCargaSubida": "Jitter during upload",
  "metrica.aumentoLatenciaDescida": "Latency increase on download",
  "metrica.aumentoLatenciaSubida": "Latency increase on upload",
  "metrica.perdaPacotes": "Packet loss",
  "metrica.duracao": "Total duration",
  "metrica.transferidos": "Data transferred",
  "metrica.pontuacaoMotor": "Measurement engine score",
  "metrica.curtaLatencia": "Latency",
  "metrica.curtaJitter": "Jitter",
  "metrica.origemMotor": "Measured directly",
  "metrica.origemDerivada": "Calculated from the samples",
  "unidade.mbps": "Mbps",
  "unidade.mbs": "MB/s",
  "unidade.indisponivel": "not measured",
  "unidade.naoSuportada": "not supported",
  "unidade.invalida": "invalid",
  "unidade.nota":
    "Mbps means megabits per second and MB/s means megabytes per second. A byte has eight bits.",
  "geral.semValor": "no value",

  "grafico.tempoReal": "Real time speed",
  "grafico.vazio": "Readings appear as soon as the test starts.",
  "grafico.tendencia": "Progress during the test",
  "grafico.latenciaTitulo": "Idle latency per sample",
  "grafico.larguraTitulo": "Speed per request",
  "grafico.cargaTitulo": "Idle and loaded latency",
  "grafico.segundos": "seconds",
  "grafico.amostra": "Sample {n}",
  "grafico.resumo": "Chart: {titulo}. Minimum {min}, maximum {max}, last value {ultimo}.",
  "grafico.amostras": "samples",
  "grafico.cargaDescida": "During download",
  "grafico.cargaSubida": "During upload",
  "grafico.repouso": "Idle",

  "ligacao.titulo": "Your connection",
  "ligacao.navegador": "Browser",
  "ligacao.sistema": "System",
  "ligacao.tipo": "Connection type",
  "ligacao.protocolo": "Protocol",
  "ligacao.perfil": "Profile",
  "ligacao.unidade": "Unit",
  "ligacao.naoIndicado": "not reported by the browser",

  "secao.relatorio": "Result",
  "secao.experiencia": "Quality for each use",
  "secao.diagnostico": "Connection analysis",
  "secao.contexto": "Test context",
  "secao.historico": "History",
  "secao.tecnica": "Technical details",
  "secao.bruto": "Sample counts",
  "secao.partilha": "Save and share",
  "secao.avisos": "Measurement notices",

  "uso.jogos.nome": "Online games",
  "uso.streaming.nome": "Video streaming",
  "uso.videochamadas.nome": "Video calls",
  "uso.navegacao.nome": "Everyday browsing",
  "uso.transferencias.nome": "File transfers",
  "uso.trabalhoRemoto.nome": "Remote work",
  "uso.jogos.explicacao": "Games depend mostly on low and stable latency under load.",
  "uso.streaming.explicacao": "Streaming depends on sustained download speed.",
  "uso.videochamadas.explicacao": "Calls need enough upload and controlled latency.",
  "uso.navegacao.explicacao": "Browsing needs moderate latency and a basic download speed.",
  "uso.transferencias.explicacao": "Transfers benefit from high download and upload speeds.",
  "uso.trabalhoRemoto.explicacao": "Remote work combines upload, latency and stability.",
  "uso.jogos.limite": "We did not measure a specific game. This is a suitability estimate.",
  "uso.streaming.limite": "We did not test specific streaming services.",
  "uso.videochamadas.limite": "We did not measure specific video call platforms.",
  "uso.navegacao.limite": "Estimate based on the characteristics of the connection.",
  "uso.transferencias.limite": "Real speeds vary with the remote server.",
  "uso.trabalhoRemoto.limite": "Estimate. It does not assess specific work applications.",
  "uso.limiteMotor": "Rating calculated by the measurement engine.",
  "nivel.excelente": "Excellent",
  "nivel.boa": "Good",
  "nivel.limitada": "Limited",
  "nivel.fraca": "Poor",
  "nivel.semDados": "Not enough data",
  "recomendacao.latencia":
    "To reduce latency, use a network cable or move closer to the router, and avoid competing traffic during sensitive activities.",
  "recomendacao.descida":
    "If your contracted speed is higher, check the WiFi, cables and other devices in use before contacting your provider.",
  "recomendacao.subida":
    "Low upload hurts video calls and file sharing. Confirm that your plan includes the upload you expect.",
  "uso.metricas": "Metrics considered",
  "uso.regras": "Rating rules, version {versao}",

  "estat.metrica": "Metric",
  "estat.amostras": "Samples",
  "estat.mediana": "Median",
  "estat.p95": "95th percentile",
  "estat.minimoMaximo": "Minimum and maximum",
  "estat.variabilidade": "Variability",
  "estat.atipicos": "Outliers",
  "estat.atipicosNota": "Outliers are flagged but never removed from the data.",
  "amostra.latenciaRepousoMs": "Idle latency",
  "amostra.latenciaCargaDescidaMs": "Latency on download",
  "amostra.latenciaCargaSubidaMs": "Latency on upload",
  "amostra.descidaMbps": "Download",
  "amostra.subidaMbps": "Upload",
  "amostra.validas": "valid",
  "amostra.descartadas": "discarded",

  "diagnostico.nota": "Note",
  "diagnostico.observado": "Observed",
  "diagnostico.paginaOculta":
    "The page was hidden during the test, so the browser may have limited the measurement.",
  "diagnostico.tipoLigacaoIndisponivel": "The browser does not report the connection type.",
  "diagnostico.perdaNaoMedida":
    "Packet loss is not measured, because it requires dedicated relay infrastructure.",
  "diagnostico.semAmostras": "No valid samples were collected.",
  "diagnostico.poucasAmostras": "Few speed samples, so the values are less reliable.",
  "diagnostico.obs.aumentoDescida": "Latency rose by {delta} ms during download.",
  "diagnostico.obs.aumentoSubida": "Latency rose by {delta} ms during upload.",
  "diagnostico.obs.variacaoDescida": "Large variation between download samples (CV of {cv}%).",
  "diagnostico.obs.latenciaAtipica":
    "{count} of {total} latency samples fell outside the typical range.",
  "diagnostico.obs.movel": "The browser reports a mobile connection.",
  "diagnostico.obs.paginaOculta": "The page was hidden during the measurement.",
  "diagnostico.obs.semAnomalias": "No relevant anomalies in the measured data.",
  "diagnostico.obs.nota":
    "These results describe this session and this path to the measurement servers.",
  "diagnostico.hip.filasExcessivas":
    "Possible cause: excessive queues in the router or the link, known as bufferbloat.",
  "diagnostico.hip.wifiOuCongestionamento":
    "Possible cause: unstable WiFi or congestion on the local network.",
  "diagnostico.hip.prioridadeDeTrafego":
    "Possible cause: limited traffic priority on the outbound side.",
  "diagnostico.hip.instabilidadeWifi":
    "Possible cause: interference or fluctuation of the WiFi signal.",
  "diagnostico.hip.trafegoConcorrente":
    "Possible cause: other devices or applications using the connection during the test.",
  "diagnostico.hip.interferenciaOuFila":
    "Possible cause: occasional drops, from WiFi or a queue in the equipment.",
  "diagnostico.hip.variacaoMovel": "Mobile connections naturally vary over time.",
  "diagnostico.hip.limitacaoEmSegundoPlano":
    "Browsers throttle background pages, and timing can lose precision.",
  "diagnostico.hip.ressalvasGerais":
    "VPNs, proxies, WiFi and competing traffic can affect any measurement.",
  "diagnostico.hip.vpnOuProxy":
    "If you use a VPN or proxy, the result reflects that path and not your direct connection.",

  "ambiente.navegador": "Browser",
  "ambiente.sistema": "Operating system",
  "ambiente.tipoLigacao": "Connection type reported by the browser",
  "ambiente.naoIndicado": "not reported",
  "ambiente.visibilidade": "Page visibility during the test",
  "ambiente.oculta": "hidden",
  "ambiente.visivel": "visible",

  "historico.vazio": "No saved results yet. Completed tests appear here.",
  "historico.nota":
    "History is stored only on this device and may disappear if you clear browser data. Nothing is synced.",
  "historico.comparar": "Compare sessions",
  "historico.compararDica": "Tick two or three sessions in the Compare column.",
  "historico.importadas": "{importadas} sessions imported, {rejeitadas} rejected by validation.",
  "historico.ficheiroInvalido": "The file is not a valid backup.",
  "historico.confirmarLimpar": "Permanently delete all history on this device?",
  "historico.carregando": "Loading history",
  "tabela.data": "Date",
  "tabela.descida": "Download",
  "tabela.subida": "Upload",
  "tabela.latencia": "Latency",
  "tabela.jitter": "Jitter",
  "tabela.duracao": "Duration",
  "tabela.perfil": "Profile",
  "tabela.estado": "Status",
  "tabela.acoes": "Actions",
  "tabela.comparar": "Compare",
  "estado.concluida": "Complete",
  "estado.parcial": "Partial",
  "estado.falhou": "Failed",
  "estado.cancelada": "Cancelled",

  "partilha.titulo": "Speed test result",
  "partilha.perfil": "Profile",
  "partilha.aviso":
    "A single session measurement. It is not a permanent guarantee of connection quality.",
  "partilha.copiado": "Summary copied to the clipboard.",
  "partilha.falhouCopia": "Could not copy. Select the text manually.",
  "partilha.semSuporte": "This browser has no native sharing. Use copy or export.",

  "erro.tempoEsgotado": "The test exceeded the profile time limit. You can try again.",
  "erro.rede": "Network failure during the measurement. Check your connection and try again.",
  "erro.bloqueio":
    "The browser blocked the measurement requests. Check extensions or corporate networks.",
  "erro.falhaDescida": "The download phase failed. You can run the test again.",
  "erro.falhaSubida": "The upload phase failed. A firewall or proxy may be blocking requests.",
  "erro.generico": "An error occurred during the test. You can run it again.",
  "erro.naoSuportado":
    "This browser does not support the required features. Try a recent version of another browser.",
  "erro.outroSeparador": "Another tab of this page is running a test. Avoid simultaneous tests.",

  "privacidade.nota": "Final results are sent to no one and stay on this device only.",
  "rodape.medicao": "Each test describes a single session, on this device and at this moment.",
  "rodape.idiomas": "Languages",

  "info.comoTitulo": "How the test works",
  "info.comoIntro":
    "The browser exchanges data directly with public measurement servers, in four steps.",
  "info.passo1":
    "Idle latency: the browser sends small requests and measures how long they take to return, with the connection free.",
  "info.passo2":
    "Download: blocks of data of growing size are received and the speed is calculated from the real time of each transfer.",
  "info.passo3":
    "Upload: the process is repeated in the opposite direction, with blocks of data sent from your device.",
  "info.passo4":
    "Latency under load: during download and upload, latency keeps being measured. It shows whether the connection handles heavy traffic without delays.",
  "info.medidasTitulo": "What each measure means",
  "info.medidaDescida":
    "How fast data reaches your device. It matters for watching video, opening pages and downloading files.",
  "info.medidaSubida":
    "How fast data leaves your device. It matters for video calls, backups and sending files.",
  "info.medidaLatencia":
    "Round trip time of a small request, in milliseconds, with the connection idle. The lower, the more responsive the connection.",
  "info.medidaJitter":
    "Variation in latency between consecutive requests. The lower, the more stable the connection.",
  "info.medidaCarga":
    "Latency measured while download or upload is active. A large increase points to queues in the router or the network, known as bufferbloat.",
  "info.faqTitulo": "Frequently asked questions",
  "faq.p1": "What is a good internet speed?",
  "faq.r1":
    "It depends on the use. For browsing and high definition video, 25 Mbps of download is usually enough. For several devices at once, online games or 4K video, aim for 100 Mbps or more. For video calls, upload and latency matter as much as download.",
  "faq.p2": "Why does the result change from one test to the next?",
  "faq.r2":
    "Speed depends on the time of day, the distance to the test server, your WiFi, other connected devices and the load on your provider's network. A test is a snapshot, not a guarantee. Repeat the measurement at different times for a fairer picture.",
  "faq.p3": "What is the difference between Mbps and MB/s?",
  "faq.r3":
    "Mbps measures megabits per second and is the unit providers use. MB/s measures megabytes per second and is what your computer shows when downloading a file. A byte has eight bits, so 100 Mbps equals 12.5 MB/s.",
  "faq.p4": "What is latency and why does it matter?",
  "faq.r4":
    "It is the time a small request takes to go and come back, measured in milliseconds. Low values make games, calls and browsing feel more responsive. Below 30 ms is very good and above 150 ms the delay is noticeable.",
  "faq.p5": "What is jitter?",
  "faq.r5":
    "It is the variation in latency from one request to the next. Even with good speed, high jitter causes dropouts in voice and video calls and stutter in games.",
  "faq.p6": "Does the test use a lot of data?",
  "faq.r6":
    "In the worst case, the Quick profile transfers about 9 MB and the Balanced profile about 105 MB. The Precise and Diagnostic profiles can exceed 200 MB. On limited data plans, prefer the Quick profile.",
  "faq.p7": "Are my results stored on a server?",
  "faq.r7":
    "No. History stays only in the browser on this device and can be deleted at any time. During the test the browser talks to measurement servers, which see your IP address like any site you visit.",
  "faq.p8": "How can I get a more reliable result?",
  "faq.r8":
    "Close other tabs and apps that use the network, use a network cable or stay near the router, turn off VPNs and proxies and keep this page open and visible until the end.",

  "erroPagina.titulo": "This page did not load",
  "erroPagina.texto": "Something went wrong on our side. Try again or go back to the start.",
  "erroPagina.tentar": "Try again",
  "naoEncontrada.titulo": "Page not found",
  "naoEncontrada.texto": "The address you opened does not exist or has moved.",
  "naoEncontrada.voltar": "Back to the test",

  "percurso.titulo": "Test route",
  "percurso.rotulo": "Globe showing the approximate location and the test server",
  "percurso.dica": "Drag the globe to rotate it.",
  "percurso.aguarda": "Your location and the test server appear when you start the test.",
  "percurso.obtendo": "Finding your location and the test server.",
  "percurso.indisponivel": "Could not get your location. The speed measurement is not affected.",
  "percurso.local": "Approximate location",
  "percurso.rede": "Network reported by the IP",
  "percurso.servidor": "Test server",
  "percurso.distancia": "Straight line distance",
  "percurso.minimoFibra": "Theoretical minimum on fibre",
  "percurso.latenciaMedida": "Measured latency",
  "percurso.fator": "Measured against the minimum",
  "percurso.fatorValor": "{n} times",
  "percurso.km": "{n} km",
  "percurso.notaLocal":
    "The location comes from the IP address and is approximate. It may point to the provider's headquarters and not to your home.",
  "percurso.notaFibra":
    "Light in fibre travels about 200 thousand kilometres per second. Real cables bend and pass through equipment, so measured latency is always above the minimum.",
  "percurso.legendaDescida": "Data arriving at your device",
  "percurso.legendaSubida": "Data leaving your device",
  "percurso.legendaLatencia": "Round trip requests to the server",
  "percurso.legendaRepouso": "No traffic in progress",

  // Marca, rodapé e políticas
  "marca.nome": "Stive Speed Test",
  "rodape.direitos": "© {ano} Stive. All rights reserved.",
  "rodape.navegacao": "Footer links",
  "rodape.politicas": "Policies",
  "rodape.contacto": "Contact",
  "rodape.suporte": "Support",
  "rodape.redes": "Social networks",
  "rodape.seguir": "Stive on {rede}",
  "rodape.poweredBy": "Powered by {marca} API",
  "politicas.seoTitulo": "Privacy, terms and cookies policies",
  "politicas.seoDescricao":
    "How Stive Speed Test handles your data: what stays on your device, what Cloudflare receives during the test and the rules of use.",
  "politicas.titulo": "Policies",
  "politicas.atualizado": "Last updated: 2 November 2026.",
  "politicas.indice": "On this page",
  "politicas.voltar": "Back to the test",
  "politicas.resumo.titulo": "In short",
  "politicas.resumo.p1":
    "Stive Speed Test measures your connection directly in your browser. It has no accounts, shows no ads and uses no analytics tools or tracking cookies.",
  "politicas.resumo.p2":
    "Results and preferences stay on this device only. During the test, your browser talks to Cloudflare infrastructure, which receives your IP address like any service you visit.",
  "politicas.recolha.titulo": "What data we handle",
  "politicas.recolha.p1":
    "We do not collect personal data. We do not ask for your name, email or any sign up, and we do not send your results to a server of ours.",
  "politicas.recolha.p2":
    "Stored on your device are the theme and speed unit you chose, your test history (result, date, profile, and the approximate location and test server used) and, if you install the app, a copy of the site files so it loads faster and shows a notice when you are offline.",
  "politicas.recolha.p3":
    "You can delete the history at any time in the History section, and everything else by clearing the site data in your browser.",
  "politicas.cloudflare.titulo": "What Cloudflare receives during the test",
  "politicas.cloudflare.p1":
    "The measurement uses Cloudflare APIs and servers. When you start a test, your browser connects directly to those servers to send and receive measurement data. As a result, Cloudflare receives your IP address and the usual technical data of any request, such as the browser type.",
  "politicas.cloudflare.p2":
    "According to the description Cloudflare itself publishes for its speed test service, it estimates the country and city from the IP address and identifies the network, meaning the provider. For studies on internet performance, it truncates the IP address to a network block (for example /24 for IPv4) and shares only anonymised information with measurement partners, without the IP address. Cloudflare states that it never sells data.",
  "politicas.cloudflare.p3":
    "We have not enabled the optional sending of full test results to Cloudflare analytics services, and our measurement requests are made without cookies or credentials. Cloudflare remains responsible for its own handling of those requests, which is governed by its privacy policy.",
  "politicas.cloudflare.p4":
    "The approximate location we show on the globe comes from the same service, is requested only when you start a test and stays on your device only. It may point to your provider's headquarters and not to your home.",
  "politicas.cloudflare.ligacao": "Read the Cloudflare privacy policy",
  "politicas.dados.titulo": "Data used by the test",
  "politicas.dados.p1":
    "A test transfers data on your connection, both downloading and uploading. The Quick profile uses up to about 9 MB, the Balanced profile up to about 105 MB, and the Precise and Diagnostic profiles can exceed 200 MB. On limited data plans, choose the Quick profile.",
  "politicas.armazenamento.titulo": "Cookies and local storage",
  "politicas.armazenamento.p1":
    "We do not set cookies. We use the browser's local storage for preferences (theme and unit), the local database for the history and the browser cache for the copy of the installed app files.",
  "politicas.armazenamento.p2":
    "The contact and support pages live on their own brand addresses and have their own rules.",
  "politicas.alojamento.titulo": "Hosting and technical logs",
  "politicas.alojamento.p1":
    "The server that delivers this page may log the requests it receives (IP address, date and requested page) for technical and security reasons, following the practices of the hosting provider.",
  "politicas.direitos.titulo": "Your rights",
  "politicas.direitos.p1":
    "Because we do not store your personal data, there is no data of yours in our hands to access, correct or delete. You can delete everything stored on your device whenever you like.",
  "politicas.direitos.p2":
    "To exercise rights over data handled by Cloudflare, such as access or deletion, use the channels listed in its privacy policy. Applicable law may give you these rights, for example under the GDPR in the European Union or the LGPD in Brazil.",
  "politicas.termos.titulo": "Terms of use",
  "politicas.termos.p1":
    "The service is free and provided as is, with no guarantee that it is always available or free of errors. Results are indicative: they describe a single session, on this device and at this moment, and do not guarantee the quality of your connection.",
  "politicas.termos.p2":
    "Use the service reasonably. Do not automate tests in bulk, try to overload the measurement servers or get around the limits of the service.",
  "politicas.termos.p3":
    "The Stive name and logo belong to Stive. Cloudflare, X, Facebook and TikTok are trademarks of their respective owners and are mentioned only to identify the provider and the links.",
  "politicas.termos.p4":
    "To the extent allowed by law, we are not liable for decisions made based on the results or for losses resulting from use of the service.",
  "politicas.alteracoes.titulo": "Changes and contact",
  "politicas.alteracoes.p1":
    "We may update these policies. The date of the last update is at the top of this page.",
  "politicas.alteracoes.p2":
    "For questions about privacy or these terms, use the contact page. For help using the service, use the support page.",
};
