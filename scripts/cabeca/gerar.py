#!/usr/bin/env python3
"""
Gera public/cabeca/cabeca.js a partir do ficheiro original da cabeça (HTML com o
script embutido). O código original fica intacto: só se aplicam substituições
exatas, cada uma verificada. Se uma não acertar o número esperado de vezes, pára.

Uso: python3 scripts/cabeca/gerar.py caminho/do/original.html
"""
import sys, pathlib

origem = pathlib.Path(sys.argv[1]).read_text(encoding="utf8", errors="ignore")
i = origem.index(">", origem.index("<script")) + 1
js = origem[i : origem.rindex("</script>")]

PATCHES = [
    ("nomes dos elementos", 'Bm=Zn(".limbo-root"),Jc=Zn(".head"),$c=Zn("#eyeL"),Kc=Zn("#eyeR"),zm=Zn(".limbo-input"),Vm=Zn(".cur"),km=Zn(".caption"),jo=Zn(".limbo-scene")',
     'Bm=Zn(".cabeca"),Jc=Zn(".cabecaCorpo"),$c=Zn("#cabecaOlhoE"),Kc=Zn("#cabecaOlhoD"),zm=null,Vm=null,km=null,jo=Zn(".cabecaCena")', 1),
    ("variável de cor do corpo", 'n("--limbo-body")', 'n("--cabecaCorpo")', 1),
    ("variável de cor do olho", 'n("--limbo-eye")', 'n("--cabecaOlho")', 1),
    ("variável de cor da moldura", 'n("--limbo-frame")', 'n("--cabecaMoldura")', 1),
    ("variável de cor da luz", 'n("--limbo-light")', 'n("--cabecaLuz")', 1),
    ("cursor desenhado removido", ',r.style.left=m+"px",r.style.top=d+"px"', "", 1),
    ("legenda removida (gesto)", ',a.textContent=F.name,a.classList.add("active");try{', ";try{", 1),
    ("legenda removida (fim do gesto)", 'a.textContent="it watches",a.classList.remove("active"),', "", 1),
    ("o clique não rouba o foco", "x.target!==s&&s.focus(),", "", 1),
    ("escrita em qualquer campo de texto", "ue=()=>{T=performance.now(),",
     'ue=x=>{if(!(x.target&&x.target.matches&&x.target.matches("input:not([type]),input[type=text],input[type=search],input[type=email],input[type=url],input[type=tel],input[type=password],input[type=number],textarea,[contenteditable=true]")))return;T=performance.now(),', 1),
    ("escuta a escrita no documento", 's.addEventListener("input",ue)', 'document.addEventListener("input",ue,!0)', 1),
    ("remove a escuta da escrita", 's.removeEventListener("input",ue)', 'document.removeEventListener("input",ue,!0)', 1),
    ("olha para o campo em foco", "let zt=s.getBoundingClientRect();", "let zt=(document.activeElement||document.body).getBoundingClientRect();", 1),
    ("sem foco automático inicial", "window.setTimeout(()=>s.focus(),400)", "0", 1),
    ("ponteiro (rato, toque, caneta)", '"mousemove"', '"pointermove"', 2),
    ("enquadramento fixo", "ai.left=-i/2,ai.right=i/2,ai.top=t/2,ai.bottom=-t/2", "ai.left=-172,ai.right=172,ai.top=172,ai.bottom=-172", 1),
    ("canvas nítido", "Math.min(devicePixelRatio||1,1.5)", "Math.min(devicePixelRatio||1,2)", 1),
    ("sem gestos aleatórios com movimento reduzido", "l(ge,2500);", 'window.matchMedia("(prefers-reduced-motion: reduce)").matches||l(ge,2500);', 1),
]
for nome, a, b, n in PATCHES:
    c = js.count(a)
    assert c == n, f"{nome}: esperava {n}, encontrei {c}"
    js = js.replace(a, b)

CABECALHO = """/*
 * Cabeça da marca (cena Three.js, licença MIT no fim do ficheiro).
 * Código original mantido. Alterações feitas apenas para integrar no cabeçalho:
 *  1. elementos e variáveis de cor com nomes próprios;
 *  2. removidos o cursor desenhado, a legenda e o campo de texto visível;
 *  3. o clique e o arranque já não dão foco a nenhum campo;
 *  4. a escrita é detetada em qualquer campo de texto da página;
 *  5. o ponteiro (rato, toque, caneta) é seguido em toda a página;
 *  6. a câmara usa um enquadramento fixo, para a cabeça caber num canto;
 *  7. sem gestos aleatórios quando o sistema pede movimento reduzido.
 * Gerado por scripts/cabeca/gerar.py. Não editar à mão nem reformatar.
 */
"""
destino = pathlib.Path(__file__).resolve().parents[2] / "public/cabeca/cabeca.js"
destino.write_text(CABECALHO + js.strip() + "\n", encoding="utf8")
print(f"ok: {destino} ({destino.stat().st_size // 1024} KB, {len(PATCHES)} alterações)")
