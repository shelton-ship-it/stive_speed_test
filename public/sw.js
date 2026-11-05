/*
 * Service worker da aplicação. Faz só três coisas, todas no mesmo domínio:
 *  1. guarda uma página de aviso para quando não há ligação;
 *  2. guarda os ficheiros estáticos com nome por conteúdo (assets) e a cabeça da marca;
 *  3. deixa a navegação sempre ir à rede primeiro, para o conteúdo nunca ficar desatualizado.
 * Nunca interceta pedidos a outros domínios: os pedidos de medição passam intactos.
 */
const VERSAO = "v1";
const CACHE = "stiveEstaticos" + VERSAO;
const PAGINA_OFFLINE = "/offline.html";

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll([PAGINA_OFFLINE, "/stive.svg"]))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((nomes) =>
        Promise.all(
          nomes.filter((n) => n.startsWith("stive") && n !== CACHE).map((n) => caches.delete(n)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const r = e.request;
  const url = new URL(r.url);
  if (r.method !== "GET" || url.origin !== self.location.origin) return;

  if (r.mode === "navigate") {
    e.respondWith(fetch(r).catch(() => caches.match(PAGINA_OFFLINE)));
    return;
  }

  if (
    url.pathname.startsWith("/assets/") ||
    url.pathname.startsWith("/cabeca/") ||
    url.pathname.startsWith("/icons/")
  ) {
    e.respondWith(
      caches.match(r).then(
        (guardado) =>
          guardado ||
          fetch(r).then((resposta) => {
            if (resposta.ok) {
              const copia = resposta.clone();
              caches.open(CACHE).then((c) => c.put(r, copia));
            }
            return resposta;
          }),
      ),
    );
  }
});
