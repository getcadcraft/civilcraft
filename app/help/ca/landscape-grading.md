---
title: Anivellament per al paisatgisme
summary: Plataformes, bermes, rases i anivellament lliure amb cotes puntuals i corbes de nivell que arrossegueu, desmunt i terraplè en directe, anàlisi de pendents, fletxes de flux i embassaments, tot dins la superfície projectada de CivilCraft.
keywords: mur de contenció, murs de contenció, costat vertical, mur en lloc de pendent, pendent per costat, terraplè, anivellament, plataforma, terrassa, berma, pujol, rasa de drenatge, cota puntual, corbes de nivell, editar corbes de nivell, desmunt i terraplè, moviment de terres, anàlisi de pendents, accessibilitat, pendents pronunciats, fletxes de flux, drenatge, embassament
from: e1559eb9
---

Tot aquí s'anivella dins la **superfície projectada** amb el mateix anivellament que les plataformes i els corredors. El **terreny actual** mai no es canvia, i el Moviment de terres el compta tot. El menú {{ui:Explanació}} és al grup Paisatgisme.

## Plataformes

{{ui:Explanació}} › {{ui:Plataforma}}, després feu clic als cantons i premeu {{key:Enter}}. La plataforma comença a l'elevació mitjana del terreny que hi ha sota; escriviu una **Elevació** per definir-la, o buideu-la per tornar a seguir el terreny. Un **Pendent** en % i una **Direcció del pendent** en graus (0 = est, 90 = nord) la inclinen. Els seus costats s'anivellen fins al terreny amb el **Talús de desmunt** i el **Talús de terraplè** (horitzontal a 1).

## Talussos per costat i murs de contenció

A **Costats i murs de contenció** a les propietats d'una plataforma o d'una berma, cada costat es pot anivellar a la seva manera. El costat 1 va del primer cantó on heu fet clic al segon, el costat 2 del segon al tercer, i així successivament.

- **Tots els costats**: **Inclinat** fa servir a cada costat els talussos de desmunt i terraplè de dalt; **Vertical: murs de contenció** posa un mur a cada costat.
- Per costat: **Talussos generals**, **Talussos propis** (escriviu un talús de desmunt i un de terraplè per a aquell costat) o **Vertical (mur de contenció)**.
- Escriviu un talús com a `3` o `3:1` (horitzontal a 1 vertical), `33%` o `18.4°`; es mostra com a H:1. El **Talús de desmunt** i el **Talús de terraplè** de la plataforma accepten el mateix.
- Un costat vertical no té terraplè: un mur de contenció corre al llarg de la vora, de la plataforma fins al terreny actual (en terraplè) o del terreny fins a la plataforma (en desmunt). L'**Amplada del mur** (0.3 m o 1 ft com a punt de partida) és quant s'escala el terreny des de la vora de la plataforma fins al terreny actual. Els volums de desmunt i terraplè deixen fora el terraplè que aquell costat ja no té.
- On un mur troba un costat inclinat, el talús es doblega al voltant de l'extrem del mur; dos murs es troben en una unió a inglet.
- Sota els camps: la longitud dels murs, la cara exposada (alçada × longitud), l'alçada més gran i la mitjana.

El pla dibuixa la cara exterior de cada mur amb traços curts transversals i la seva alçada als dos extrems i a la més alta (a la capa dels murs de contenció, que també va a DXF i DWG). La vista 3D mostra els murs com a sòlids (Mostra › Murs de contenció), i les exportacions GLB, OBJ i USD els inclouen. Les seccions a través de la vora mostren el graó.

**Avisos** (a Propietats i al tauler Problemes): un mur més alt que **Avisa per sobre d'una alçada de mur de** (1.0 m o 3.3 ft com a punt de partida) "pot necessitar un mur d'enginyeria o un permís; comproveu les normes locals", i, quan escriviu el **Pendent més fort que aguanta el terreny**, qualsevol costat el talús de desmunt o de terraplè del qual sigui més pronunciat. Són avisos: l'anivellament es construeix igualment. Cada canvi és un sol pas per a {{key:Mod+Z}}.

## Bermes

{{ui:Explanació}} › {{ui:Berma}}: un pujol la part de dalt del qual és la seva **Alçada** per sobre de l'elevació mitjana del terreny que hi ha sota, amb els costats anivellats.

## Rases

{{ui:Explanació}} › {{ui:Rasa de drenatge}}, després feu clic al llarg de la rasa **en el sentit en què corre l'aigua** i premeu {{key:Enter}}. Definiu-ne la **Profunditat**, l'**Amplada del fons** (0 per a una V) i el **Pendent del costat**. Sense **Pendent**, el fons segueix el terreny, a la seva profunditat per sota, i mai no puja; escriviu un pendent per donar-li un de constant des del seu inici.

## Cotes puntuals i corbes de nivell

1. {{ui:Explanació}} › {{ui:Àrea d'explanació}}: feu clic al contorn de l'àrea que voleu modelar.
2. {{ui:Explanació}} › {{ui:Cota puntual}}: feu clic dins l'àrea. Escriviu-ne l'elevació a Propietats, o useu els botons ▲ ▼.
3. {{ui:Explanació}} › {{ui:Edita una corba de nivell}}: feu clic en una corba de nivell dins l'àrea per prendre-la com una línia que podeu remodelar.

Seleccioneu una cota puntual o una corba de nivell i **arrossegueu-la** (o els seus punts) al pla: la superfície es mou quan la deixeu anar, en un sol pas per desfer. Dins de l'àrea, el terreny es reconstrueix a partir de la seva vora (on troba el terreny actual), de les cotes puntuals i de les corbes de nivell editades.

## Desmunt i terraplè en directe

Les propietats de cada objecte d'anivellament mostren el seu **Desmunt** i **Terraplè**, i els de tot el lloc, pel mètode de quadrícula que usa Moviment de terres, a mesura que ho canvieu. Els problemes (fora de la superfície, un contorn que es creua amb si mateix) hi apareixen llistats.

## Comprovacions d'anivellament

A la secció **Comprovacions d'anivellament** al panell esquerre:

- **L'anàlisi de pendents** acoloreix la superfície per gradient: fins al límit suau, entre els dos, i més dret que el límit pronunciat (5 % i 33.3 % com a punt de partida: l'1:20 habitual per a recorreguts accessibles i l'1:3 per a segar). La llegenda indica quina part de l'àrea cau a cada categoria. Les àrees pronunciades també s'imprimeixen als fulls.
- **Les fletxes de flux i els embassaments** dibuixen per on corre l'aigua i ressalten cada lloc on s'embassaria, amb la seva profunditat; la secció diu quants llocs hi ha, quin és el més fondo i quanta aigua retenen.

Les comprovacions llegeixen la superfície projectada quan s'ha anivellat alguna cosa, i si no, el terreny actual.
