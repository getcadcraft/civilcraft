---
title: Explana una plataforma d'edifici
summary: Dibuixa una plataforma plana, defineix-ne l'elevació i els talussos de desmunt i de terraplè, i deixa que CivilCraft la integri al terreny existent i l'afegeixi a la superfície projectada.
keywords: mur de contenció, murs de contenció, costat vertical, mur en lloc de talús, talús per costat, terraplè, explanació, plataforma, plataforma d'edifici, línia de tall, línia característica, grup d'explanació, talús de desmunt, talús de terraplè, rasant final, superfície projectada, explanació del terreny
from: 482319a6
---

Una plataforma és una àrea plana a una elevació. Des de la seva vora, CivilCraft explana cap a fora amb el vostre talús de desmunt on el terreny és més alt que la plataforma, i amb el vostre talús de terraplè on és més baix, fins que el talús troba el terreny existent. Aquesta línia de trobada és la línia de tall. La plataforma i els seus talussos substitueixen el terreny existent dins de la línia de tall per fer la superfície projectada.

## Dibuixa la plataforma

Cal que hi hagi abans una superfície de terreny existent.

1. Premeu {{key:G}}, o feu clic a {{ui:Plataforma}} al grup **Disseny**.
   La indicació diu "Plataforma: feu clic a les seves cantonades. Enter o doble clic acaba, Backspace elimina l'última, Esc cancel·la."
2. Feu clic a les cantonades de la plataforma en ordre, en qualsevol sentit. Un contorn blau segueix el punter.
3. Premeu {{key:Enter}} després de l'última cantonada (com a mínim tres).
   La plataforma es dibuixa i queda seleccionada. Comença a l'elevació del terreny al seu centre, arrodonida a 0.1, amb un talús de desmunt de 2:1 i un talús de terraplè de 3:1. La barra d'estat diu, per exemple, "Plataforma 1 a l'elevació 254.3 (el terreny al seu centre), desmunt 2:1, terraplè 3:1. Canvieu-los a Propietats."

:::warning
Acabeu amb {{key:Enter}}. El doble clic també acaba, però en aquesta versió elimina la cantonada on heu fet doble clic. Feu clic una vegada a l'última cantonada i després premeu {{key:Enter}}.
:::

El contorn de la plataforma no es pot creuar amb si mateix ("El contorn de la plataforma es creua amb si mateix.").

## Defineix l'elevació i els talussos

Amb la plataforma seleccionada, el panell de la dreta mostra **Plataforma**:

1. **Nom**.
2. **Elevació**: l'elevació plana de la plataforma.
3. **Talús de desmunt** i **Talús de terraplè**, com a H:V (2 vol dir 2:1). Tots dos han de ser més grans que 0.
4. **Àrea de la plataforma** i **Cantonades** es mostren a títol de referència.

Premeu {{key:Enter}} després de cada valor. La línia de tall, la superfície projectada i els volums s'actualitzen de seguida.

Sota els camps hi ha una línia que diu, per exemple, "Línia de tall: 48 línies de talús (20 en desmunt, 28 en terraplè), la més llunyana a 31.20 ft." El plànol mostra la línia de tall i les línies de talús en magenta.

## Com es troba la línia de tall

- Les línies de talús surten de cada aresta perpendicularment, aproximadament cada vintena part de la mida de la plataforma.
- A les cantonades exteriors s'obren en ventall cada 10°, de manera que el talús envolta la cantonada.
- A les cantonades interiors, una línia segueix la bisectriu, on es troben els talussos dels dos costats.
- Cada línia puja al talús de desmunt o baixa al talús de terraplè fins que arriba al terreny.

## Talussos per costat i murs de contenció

Sota **Costats i murs de contenció** a les Propietats d'una plataforma o d'una berma, cada costat es pot explanar de la seva manera. El costat 1 va de la primera cantonada que heu fet clic a la segona, el costat 2 de la segona a la tercera, i així successivament.

- **Tots els costats**: **Inclinat** aplica els talussos de desmunt i de terraplè de dalt a tots els costats; **Vertical: murs de contenció** posa un mur a cada costat.
- Per costat: **Talussos de dalt**, **Talussos propis** (escriviu un talús de desmunt i un de terraplè per a aquell costat) o **Vertical (mur de contenció)**.
- Escriviu un talús com `3` o `3:1` (horitzontal a 1 vertical), `33%` o `18.4°`; es mostra com a H:1. Els propis **Talús de desmunt** i **Talús de terraplè** de la plataforma accepten el mateix.
- Un costat vertical no té terraplè: un mur de contenció corre al llarg de la vora, des de la plataforma fins al terreny existent (en terraplè) o des del terreny fins a la plataforma (en desmunt). **Gruix del mur** (inicialment 0.3 m o 1 ft) és quant s'enfila el terreny des de la vora de la plataforma fins al terreny existent. Els volums de desmunt i de terraplè deixen fora el terraplè que aquell costat ja no té.
- On un mur es troba amb un costat inclinat, el talús envolta l'extrem del mur; dos murs es troben en ingletat.
- Sota els camps: la longitud dels murs, la cara exposada (alçada × longitud), l'alçada més alta i l'alçada mitjana.

El plànol dibuixa la cara exterior de cada mur amb traços curts i la seva alçada als dos extrems i a la més alta (a la capa de murs de contenció, que també va a DXF i DWG). La vista 3D mostra els murs com a sòlids (Mostra › Murs de contenció), i les exportacions GLB, OBJ i USD els inclouen. Les seccions a través de la vora mostren l'escaló.

**Avisos** (al panell Propietats, i al panell **Problemes**): un mur més alt que **Avisa a partir d'una alçada de mur de** (inicialment 1.0 m o 3.3 ft) "pot necessitar un mur dissenyat per un enginyer o un permís; comproveu les normes locals", i, quan escriviu **Pendent més fort que el terreny aguanta**, qualsevol costat el talús de desmunt o de terraplè del qual sigui més pronunciat. Són avisos: l'explanació es construeix igualment. Cada canvi és un pas per a {{key:Mod+Z}}.

## Mou les cantonades

Seleccioneu la plataforma i arrossegueu una nansa quadrada en una cantonada. Cada arrossegament és un pas de desfer. Afegir o treure cantonades encara no està disponible: elimineu la plataforma i dibuixeu-la de nou.

## Quan no explana

Un quadre vermell sota **Moviment de terres** indica la plataforma i el problema:

| Missatge | Què fer |
|---|---|
| "3 línies de talús surten de la superfície abans de trobar-la: la plataforma és massa a prop de la vora de la superfície o massa alta/baixa." | Mogueu la plataforma cap a dins, lluny de la vora de la superfície, o apropeu-ne l'elevació al terreny. |
| "La línia de tall es creua amb si mateixa (els talussos de costats diferents de la plataforma xoquen entre ells). Redissenyeu la plataforma o canvieu els talussos." | Típic de plataformes estretes o en L en desmunt profund o terraplè alt. Amplieu la plataforma, aplaneu la diferència o feu els talussos més pronunciats. |
| "El contorn de la plataforma es creua amb si mateix." | Torneu a dibuixar les cantonades en ordre al voltant de la plataforma. |

Una plataforma amb un problema queda fora de la superfície projectada i dels volums fins que es corregeixi.

## Vegeu el resultat

1. Sota **Visualització**, poseu **Superfície** a {{ui:Projectat (explanat)}}. Les corbes de nivell ara passen planes per la plataforma i segueixen els talussos fins a la línia de tall.
2. Moveu el punter sobre la plataforma: la barra d'estat mostra les elevacions de **Terreny** i **Explanat**.
3. Llegiu el desmunt i el terraplè sota **Moviment de terres**; vegeu [Volums de moviment de terres](topic:volumes).

Les plataformes s'exploren després dels corredors, en l'ordre en què es van dibuixar. Una plataforma posterior substitueix qualsevol cosa anterior dins de la seva pròpia línia de tall.

## Elimina una plataforma

Seleccioneu-la i premeu {{key:Delete}} (en un Mac, Fn i suprimeix), o feu clic a {{ui:Suprimeix}}.

## Encara no implementat

Les plataformes són planes: plataformes inclinades, línies característiques amb pendent variable, bancals, i explanació fins a una distància o una elevació objectiu encara no estan disponibles. Vegeu [Encara no implementat](topic:not-built-yet).
