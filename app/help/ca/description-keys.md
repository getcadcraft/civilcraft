---
title: Claus de descripció i codis de línia
summary: Convertiu codis de camp en grups de punts amb descripcions, i uniu els punts codificats en línies (inici, final, tancament) que esdevenen línies de ruptura.
keywords: claus de descripció, codis de camp, codis de línia, figures, dibuix lineal, inici, final, tancament, grups de punts, codis, codis d'aixecament, col·lector de dades, línies de ruptura, vorada, vora del paviment
from: b3d1af8d
---

Les colles d'aixecament codifiquen cada mesura al camp: `EP` per a la vora del paviment, `TC` per a la part superior de la vorada, `BLDG` per a una cantonada d'edifici. El codi és la primera paraula de la descripció del punt. CivilCraft agrupa els punts segons aquest codi i converteix en línies els codis de línia que hi ha després.

## Codis de línia

Un codi de línia és la paraula just després del codi de camp:

| Descripció | Significat |
|---|---|
| `EP B` | Comença una nova línia de vora de paviment en aquest punt |
| `EP` | Continua la línia EP actual |
| `EP E` | Acaba la línia EP actual en aquest punt |
| `BLDG C` | Tanca l'edifici: uneix aquest punt amb el primer punt de la línia |

Els punts amb el mateix codi s'uneixen en ordre de número de punt. Codis diferents són línies diferents encara que comparteixin un grup, de manera que `EP1` i `EP2` donen dues vores alhora. Un codi que mai no usa un codi de línia s'uneix a través de tots els seus punts, com en versions anteriors.

Les línies d'un grup usat com a **Línia de ruptura** esdevenen línies de ruptura, una per línia, de manera que una vorada amb un buit no s'estira a través del buit. Les línies d'altres grups es dibuixen al plànol (capa V-NODE-LINE) i surten a DXF, DWG i PDF.

Les paraules per a inici, final i tancament són `B`, `BEG`, `START`; `E`, `END`; i `C`, `CLO`, `CLOSE`. Canvieu-les, o desactiveu els codis de línia, al diàleg següent.

## Claus de descripció

Una clau de descripció converteix un codi en un grup de punts, un ús i una descripció llarga.

1. Sota **Punts**, feu clic a {{ui:Claus de descripció i codis de línia}}.
2. Feu clic a {{ui:Afegeix una clau}} i ompliu la fila:
   - **Codi**: el codi de camp a fer coincidir. `*` representa qualsevol caràcter i `?` un de sol, de manera que `EP*` atrapa EP, EP1 i EP12.
   - **Grup**: el grup de punts on s'uneixen aquests punts (buit = el mateix codi). `EP*` amb grup `EP` posa EP1 i EP2 en un sol grup mentre són línies separades.
   - **Ús**: Punts, Línia de ruptura o Exclòs, per quan el grup apareix per primera vegada (o deixeu-ho a la taula de **Punts**).
   - **Descripció**: el nom llarg, que es mostra a les **Propietats** d'un punt.
3. La columna **Punts** compta els punts que atrapa cada clau mentre escriviu. La primera clau que coincideix amb un codi guanya.
4. Feu clic a {{ui:Aplica}}. Els grups, la superfície i el plànol se segueixen en un sol pas: {{key:Mod+Z}} ho desfà.

Un grup conserva l'ús que li heu donat a la taula de **Punts**; l'ús d'una clau només l'estableix per a un grup nou. Les claus i els codis de línia es desen al fitxer del projecte.
