---
title: Quadres: planificacions enllaçades amb els objectes
summary: Quadres desats amb files de plantes, àrees plantades, paviments, murs, graons, modificadors del terreny o totes les quantitats; columnes i fórmules pròpies, grups i totals; CSV, XLSX i una taula als fulls, sempre al dia.
keywords: quadre, planificació, quadre de plantes, quadre de paviments, quantitats, columnes, fórmula, total, suma, recompte, grup, filtre, csv, xlsx, full de càlcul, taula al full
from: 11bc1bac
---

{{ui:Quadres}} (Paisatgisme › {{ui:Més}}) obre els quadres d'aquest projecte. La primera vegada es fan per a vosaltres el **quadre de plantes** i el **quadre de paviments i àrees**. Un quadre es calcula a partir dels objectes cada vegada que es mostra, s'escriu o es posa en un full: si canvieu un bancal, els seus recomptes canvien a tot arreu.

- **Files de**: plantes (una fila per espècie, cultivar i mida), àrees plantades, paviments, murs, graons, modificadors del terreny (desmunt i terraplè) o totes les quantitats.
- **Columnes**: un camp (`qty`, `area`, `botanical`, o un nom entre claudàtors com `[Net area]`) o una fórmula: `+ - * / ^ %`, `&` per unir text, `= <> < <= > >=`, i `round`, `ceil`, `floor`, `abs`, `sqrt`, `min`, `max`, `if`, `and`, `or`, `not`, `concat`, `upper`, `lower`, `len`, `text`. Una fórmula que no es pot calcular mostra `#ERR` (o `#DIV/0`) a la seva cel·la. Les fórmules les llegeix l'analitzador propi de CadCraft; res del que hi ha no s'executa com a codi.
- **Total** per columna (suma, recompte, mitjana, el més petit, el més gran), **Agrupa per** (subtotals per grup) i **Només les files on**.
- {{ui:Desa com a CSV}}, {{ui:Desa com a XLSX}}, i **Posa aquest quadre als fulls** (Fulls › Quadres el dibuixa com a taula, en tants fulls com calgui).

Les etiquetes de les plantes i de les àrees llegeixen els mateixos noms de camp (`{botanical}`, `{cultivar}`, `{size}`, `{qty}`).
