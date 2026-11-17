---
title: Comprovacions de línies elèctriques
summary: Què comprova CivilCraft a cada línia i cable, sempre al dia: franquies, separacions, oscil·lació, arrencada, càrregues als suports i dimensionat, accessoris, tirants, fonamentacions, dades que falten, connexions, sobrecàrregues i caiguda de tensió.
keywords: comprovacions, franquia, franquia sobre el terreny, obstacle, encreuament, separació de fases, oscil·lació de l'aïllador, arrencada, càrrega del suport, càrrega nominal, dimensionat, fonamentació, tirant, braç transversal, accessori, caiguda de tensió, sobrecàrrega, dades que falten, desconnectat
from: e6a0da47
---

**Comprovacions** a la secció Línies elèctriques llista cada problema: en vermell el que no compleix i en ambre els avisos. Feu clic en una per seleccionar la línia, el suport, el cable o l'equip a què es refereix; els suports i els vans que no compleixen es ressalten amb un cercle vermell a la planta mentre l'espai de treball és obert.

:::warning
Eina d'ajuda al disseny: són comprovacions del vostre disseny segons les vostres pròpies regles, no una certificació.
:::

## Franquies

La fase més baixa del conductor se segueix al llarg de cada van en cada cas de càrrega. La seva franquia mínima sobre el terreny ha d'arribar a la **Regla de franquia** de la línia. Quan un van encreuï un **obstacle** (dibuixat amb {{ui:Obstacle}}: un punt o una línia, amb la seva alçada sobre el terreny i la seva pròpia regla de franquia), la franquia sobre la part superior de l'obstacle es comprova de la mateixa manera.

**El que l'espai de treball Paisatge posa per sobre del terreny també compta.** Les plantes soles (la copa a l'amplada i l'alçada adultes), les hedres i els massissos de plantació (l'espècie més alta d'entre elles) i els murs (la seva part superior) són obstacles sota una línia, sense necessitat de tornar-los a dibuixar. Mantenen les regles definides a {{ui:Casos de càrrega i límits…}}: **Plantes de paisatge sota una línia** (els conjunts d'exemple usen *Arbres i plantes*, 3 m) i **Murs de paisatge sota una línia** (*Edifici*); trieu **No comprovat** per deixar-los fora. La franquia es mesura en vertical des de la part superior de la planta o del mur fins al conductor on el van el creua; la distància lateral a una copa al costat de la línia no es comprova. Moure un arbre o aixecar un mur canvia les comprovacions de seguida.

Les vostres regles de franquia són pròpies: obriu-les amb **Regles…** al costat de qualsevol **Regla de franquia** (o amb {{ui:Casos de càrrega i límits…}}) per afegir-ne, reanomenar-ne, canviar-ne o eliminar-ne.

## Separacions i oscil·lació

- **Separació de fases** necessària: k·√(fletxa + longitud de l'aïllador) + U/150, amb la fletxa del cas de calor i la tensió U en kV (una forma habitual; k és la de les vostres regles). Es compara amb la separació de fases del braç transversal.
- **Oscil·lació de l'aïllador** als suports de suspensió, en el cas de vent: atan(càrrega transversal ÷ càrrega vertical), comparada amb la màxima oscil·lació de les regles.
- **Arrencada**: un suport de suspensió més baix que els seus veïns pot ser aixecat en fred; es marca.

## Càrregues als suports i dimensionat

Per a cada suport i cas de càrrega, amb tots els conductors de la línia:

- **Transversal**: vent per metre × el van de vent (la meitat dels dos vans), més 2·H·sin(gir ÷ 2) en un gir.
- **Al llarg de la línia**: la diferència de les tensions dels dos costats en un amarratge o un angle; en un suport de suspensió només amb gel en un costat (cada van es calcula per separat, cosa que va pel costat segur).
- **Vertical**: la càrrega vertical per metre × el van de pes (entre els punts més baixos a cada costat) més l'equip.

La càrrega horitzontal es porta al punt nominal del suport (càrrega equivalent = càrrega × alçada de fixació ÷ alçada del punt nominal) i es compara amb la seva **càrrega nominal** × el factor de les regles. Quan és massa feble, se suggereix el suport més petit del mateix material de la vostra biblioteca que la suporti. Un suport amb un **tirant** transmet la càrrega horitzontal al tirant, que suporta càrrega ÷ sin(angle del tirant) i es comprova amb la seva pròpia capacitat.

Els accessoris (abraçadores, aïlladors, braços transversals) es comproven contra la seva càrrega nominal: un accessori d'amarratge suporta la tensió del conductor, i un accessori de suspensió la seva part de la càrrega vertical i transversal. La **fonamentació** mostrada és la profunditat del suport al terreny i un forat una mica més ample que la seva base.

## Dades, connexions i corrent

- Un element amb un camp necessari buit, o una clau que no és a la biblioteca.
- Un extrem de traçat de cable, o un equip, que no està connectat a res.
- **Caiguda de tensió** i **corrent** des de cada font (equip marcat com a font) fins a les càrregues (kW i factor de potència a l'equip), al llarg de vans aeris i cables: √3·I·L·(R cos φ + X sin φ), amb R a 20 °C. Si se supera la capacitat de corrent del cable, o la caiguda és superior a la que permeten les regles, es marca.
