---
title: La llista de plantes
summary: Unes 420 plantes comunes de clima temperat i mediterrani amb les seves mides, rusticitat, llum i aigua, cercables en qualsevol idioma, més la vostra llista desada amb el projecte.
keywords: llista de plantes, base de dades de plantes, espècies, nom botànic, nom comú, paleta de plantes, llista de vivers, zona de rusticitat, csv, importa plantes, exporta plantes, les meves plantes, llista d'arbres, llista d'arbustos, biblioteca de plantes
from: 7ed09e7e
---

La secció **Plantes** del panell esquerre llista totes les plantes que podeu col·locar. Feu clic a una per veure'n les mides i per fer-la la planta que usen {{ui:Planta}}, {{ui:Bancal}} i {{ui:Seto}}.

## Cerca i filtre

Escriviu a **Cerca**: qualsevol paraula del nom d'una planta en qualsevol idioma (anglès, castellà, portuguès), el seu nom botànic, el seu tipus o una paraula de les seves notes. Cada paraula que escriviu ha de coincidir, així que `quercus evergreen` troba les alzines perennes. Els accents no hi importen.

Reduïu la llista amb **Tipus**, **Llum**, **Aigua** i **Zona de rusticitat** (la zona USDA on es troba el vostre emplaçament: una planta apareix quan la zona és dins del seu interval).

## Què conté una planta

| Camp | Significat |
|---|---|
| Tipus | Arbre, arbust, seto, herba (inclosos els gespats), perenne, cobridora o enfiladissa |
| Mida a la maduresa | Alçada i amplada de la planta crescuda en un jardí o carrer, en metres |
| Mida a la plantació | La mida amb què es planta, i el seu contenidor |
| Separació | De centre a centre en un bancal o al llarg d'un seto |
| Zona de rusticitat | Les zones USDA on sol ser resistent |
| Llum, aigua, sòl | Què necessita |
| Notes | Usos i precaucions, com parts tòxiques o una planta que s'expandeix |

:::note
La llista integrada es va escriure per a CadCraft a partir de coneixements hortícoles generals: mides típiques, arrodonides. No és el catàleg de cap viver. Verifiqueu les mides i la rusticitat amb un viver local. Les plantes invasores més conegudes de la península Ibèrica i de gran part del món temperat s'han deixat fora a propòsit, i algunes que són invasores en algun lloc porten una nota.
:::

## Les vostres plantes

- **Afegeix a la llista d'aquest projecte** copia una planta a la llista pròpia del projecte, on es desa amb el projecte. Una planta de la vostra llista substitueix la integrada amb la mateixa clau, de manera que podeu canviar-ne les mides per a la vostra regió.
- **Importa una llista de plantes…** llegeix un CSV (o un fitxer de plantes). El CSV necessita una columna amb el nom botànic i, idealment, el tipus, l'alçada i l'amplada; els noms de columna amb les vostres pròpies paraules funcionen (Llatí, Nom comú, Alçada, Extensió, Amplada, Zona). Es llegeixen les comes, els punts i coma o les tabulacions, i les comes decimals. Les mides de plantació, la separació i els contenidors buits prenen valors per defecte raonables segons el tipus.
- **Exporta com a CSV** desa la vostra llista (o, si no n'hi ha, les plantes que mostra la cerca) per obrir-la en un full de càlcul.

Una llista de plantes es llegeix com qualsevol fitxer de fora: tot el que no es pot usar es deixa de costat i se'n fa recompte.

## Plantes en altres aplicacions

La llista de plantes és una única biblioteca per a totes les aplicacions de CadCraft: BimCraft i ModelCraft tenen la mateixa llista, però el seu propi **Col·loca des de la biblioteca** encara no ofereix plantes. Avui les plantes arriben a un model BIM a través del model IFC de paisatgisme de CivilCraft (cada planta és un `IfcGeographicElement`). Vegeu [Plantació](topic:planting#ifc).
