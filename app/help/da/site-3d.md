---
title: Se byggepladsen i 3D
summary: Åbn 3D-visningen, drej rundt, panorér og zoom, angiv lodret overdrivelse og farvelægning, vælg hvad der vises, og klik på tracéer, byggepladser, feature-linjer, brudlinjer, rør, konstruktioner og punkter for at vælge dem.
keywords: etiketter, 3D-etiketter, vendt mod kameraet, etiketter der vender mod kameraet, stationsetiketter, højdekurveetiketter, punktetiketter, drapering, luftfoto, kortlag på overfladerne, 3D, tredimensionel, 3D-visning, ViewCube, kompas, drej rundt, perspektiv, parallel, isometrisk, iso, lodret overdrivelse, terræn, model, byggepladsmodel, kør rundt, visualisér, render, rør i 3D, konstruktioner, brønde, korridor i 3D, vej i 3D, vejoverflade, kørespor, kantsten, fortov, planter i 3D, træer i 3D, buske, hække, landskab i 3D, rampe i 3D, trin, mure, belægning, hårde anlæg i 3D
from: a16bafe1
---

3D-visningen viser byggepladsen som én model: det eksisterende terræn og den planerede overflade, højdekurver draperet over dem, brudlinjer og overfladens kant, hvert tracé på sit projekterede profil med stationsmærker, korridorens feature-linjer og selve vejen (kørespor, skuldre, rendesten, kantsten, striber og fortove i hver sin farve), byggeplateauer med deres skæringslinjer i terrænet, rørnettet med rør og konstruktioner i deres rigtige koter, og fra arbejdsområdet Landskab planterne, belægningen, stierne, murene, kantstenene, rampene og trinene. Den læser samme projekt som planen, så hver redigering vises i begge.

## Åbn 3D-visningen

1. Åbn opmålingspunkter (eller en LandXML- eller projektfil), så der findes en overflade. Planter, belægning eller rampe alene er nok til at åbne den også.
2. Tryk {{key:D}}, eller klik på {{ui:3D}} i gruppen {{ui:Visning}} på værktøjslinjen.
   3D-visningen åbnes over planen og kigger på hele byggepladsen fra sydøst. Første gang tager det et øjeblik at indlæse.
3. Tryk {{key:D}} igen, eller klik på {{ui:3D}} igen, for at vende tilbage til planen. Når du vælger et tegneværktøj som {{ui:Tracé}} eller {{ui:Byggeplateau}}, går det også tilbage til planen, da tegning sker der.

## Bevæg dig rundt

| For at | Gør dette |
|---|---|
| Dreje rundt | Træk med venstre eller midterste knap |
| Panorere | Træk med højre knap, eller hold {{key:Shift}} og træk |
| Zoome | Drej hjulet; det zoomer mod markøren |
| Dreje rundt på et touchpad | Stryg med to fingre ({{key:Shift}} og stryg panorerer) |
| Zoome på et touchpad | Knib |
| Touch | Én finger drejer rundt; to fingre knibes for at zoome og flyttes for at panorere |
| Taster (visningen har fokus) | {{key:Left}} {{key:Right}} {{key:Up}} {{key:Down}} drejer rundt, med {{key:Shift}} panorerer de; {{key:Plus}} og {{key:Minus}} zoomer |

Linjen over visningen rummer resten:

- Visningslisten: **Iso**, **Top**, **Bund**, **Forside** (kigger mod nord), **Bagside**, **Venstre**, **Højre**.
- {{ui:Perspektiv}}: trykket er en perspektivvisning; klik for en parallel projektion (ingen forkortning).
- {{ui:Udstrækning}}: viser alt igen. {{key:F}} gør det samme, mens 3D-visningen er åben.

## ViewCube

ViewCube i øverste højre hjørne drejer med visningen. Klik på en side, en kant eller et hjørne for at kigge på byggepladsen derfra (kameraet drejer blødt, medmindre dit system beder om reduceret bevægelse). Træk i terningen for at dreje rundt. Kompasringen under den viser nord (gitternord, +Y): træk i ringen for at dreje byggepladsen om den lodrette, eller klik på N, Ø, S eller V for at kigge fra den side. {{ui:Start}}, det lille hus øverst til venstre, går tilbage til isovisningen af hele byggepladsen. Med tastaturet: {{key:Tab}} til terningen, piltasterne vælger en side, en kant eller et hjørne, og {{key:Enter}} kigger derfra.

I planen viser den samme terning toppen. Klik på en anden side, kant eller et hjørne (eller træk i den) for at åbne 3D-visningen med kig derfra: det er den hurtigste vej ind i 3D fra en given retning. For at skifte terningen ud med et lille aksesymbol, eller skjule den, se **Hjørneindikator** i [CivilCraft-indstillinger](topic:settings).

## Overdriv koterne

Byggepladser er normalt meget bredere end høje, så koterne strækkes med **2×** til at starte med. Vælg **1×**, **2×**, **3×**, **5×** eller **10×** i listen på linjen, eller under **Lodret overdrivelse i 3D** i [CivilCraft-indstillinger](topic:settings) (de to er én indstilling). Kun visningen ændrer sig: volumener, profiler og eksporter bliver i sand skala.

## Farvelæg overfladerne

- **Kotebånd**: de samme bånd og farver som planens kotebånd (antallet af bånd sættes under **Vis** i venstre panel). Hver båndkant skæres præcist ved sin kote.
- **Én farve**: det eksisterende terræn og den planerede overflade hver i en ensfarvet farve.
- **Kortlag**: de kortlag, der vises under planen (et georefereret billede, kortfliser eller en kortservice; se [Kortlag](topic:map-layers)), lægges over overfladerne som et ark, så et luftfoto vises på bakkerne. Billeder, der stadig er på vej, udfyldes efterhånden. Vises intet kortlag, beholder overfladerne deres kotebånd, og visningen siger det. Billedet er til skærmen: GLB- og OBJ-eksporter medtager det ikke.

Når begge overflader vises, er det eksisterende terræn gennemsigtigt over den planerede overflade, så du kan se afgravningen (terræn over projekteringen) og opfyldningen.

## Vælg hvad der vises

Klik på {{ui:Vis}} på linjen, og sæt eller fjern fluebenene:

| Emne | Hvad det er |
|---|---|
| Eksisterende terræn | Overfladen bygget af opmålingspunkterne (eller læst fra LandXML) |
| Planeret overflade | Det eksisterende terræn med korridorerne og byggeplateauerne planeret ind (kun når der er nogen) |
| Trekantkanter | Hver TIN-kant, som linjer |
| Højdekurver | Mindre og hovedhøjdekurver for hver overflade, vist i planens interval |
| Overfladekant | Overfladens ydre kant for hver vist overflade, i dens koter |
| Brudlinjer | Hver brudlinje, i sine koter |
| Tracéer og stationer | Hvert tracé på sit projekterede profil (på terrænet hvor der ikke er noget profil), med mærker hver 50 ft eller 20 m |
| Korridorens feature-linjer | Belægningskant, skulder og skæring i terræn på begge sider |
| Vejoverflader | Vejen hver korridor bygger, ud fra dens tværsnit: kørespor, skuldre, rendesten, kantsten, striber og fortove, hver i sin farve, på den planerede overflade |
| Planter | Hver plante, og planterne i bede og hække, som enkle former efter størrelsen på plantelisten: et træ er en stamme og en rund krone (en kegle for et nåletræ, en top på en høj stamme for en palme), buske, hækplanter, stauder og jorddækkere er kupler, græsser tuer, slyngplanter tynde søjler. De står på den planerede overflade (eller det eksisterende terræn) i den størrelse planen viser: moden, eller ved plantning |
| Hårde anlæg | Belægning og stier med deres fald, mure, kantsten, trin og rampe, der stiger i løb med vandrette repos imellem |
| Byggeplateauer og skæring i terræn | Hver byggeplateaus omrids i sin kote og dens skæringslinje i terrænet |
| Rør og konstruktioner | Rør som runde rør mellem deres bundkoter, konstruktioner fra kant til sump |
| Opmålingspunkter | En prik ved hvert punkt med en kote (slået fra til at starte med) |
| GIS-lag | De GIS-lag, der vises på planen, i deres farver: linjer og omrids i deres egne koter, andre lagt på det eksisterende terræn (de følger det præcist); punkter som små kryds. Former uden koter uden for overfladen udelades, og visningen siger, hvor mange |
| Etiketter | Navne og værdier, der altid vender mod dig: hvert tracés navn ved begyndelsen og dets stationer hver 100 ft (eller 100 m), koten for hver hovedhøjdekurve, byggeplateauer, feature-linjer og konstruktioner efter navn, og med **Opmålingspunkter** sat hvert punkts nummer og kote |

Etiketter bevarer størrelsen og står lodret, uanset hvordan du drejer eller zoomer, og en bakke foran en etiket skjuler den. Hvor de ville hobe sig op, vises de vigtigste, og resten venter, til du zoomer ind: tracéer først, derefter konstruktioner, byggeplateauer, feature-linjer, stationer, højdekurver og punkter, de nærmeste først. De findes kun på skærmen; eksporter og plots udelader dem.

Dine valg, overdrivelsen og farvelægningen huskes i denne browser.

En vej bygges på det eksisterende terræn. Med et tracé og en korridor men ingen opmålingspunkter eller overflade endnu tegnes vejen på fladt stand-in-terræn for nu: i gennemsnitskoten af dens projekterede profil, eller vandret i kote 0, når der heller ikke er noget profil. En advarsel nederst i 3D-visningen og i korridorens egenskaber siger det. Det er kun et billede: der kommer ingen volumener eller tværprofiler fra det. Åbn opmålingspunkter eller en overflade, så flytter vejen sig af sig selv over på det rigtige terræn.

Den lodrette overdrivelse strækker terrænet, ikke planterne: de står på det overdrevne terræn i deres sande højde og udbredelse, så et træ ser ud som et træ ved enhver indstilling. Planter er enkle former, ikke detaljerede modeller: tusinder af dem forbliver hurtige at dreje og zoome i.

## Rør og konstruktioner

- Et rør tegnes med sin bund inde i de bundkoter, du har angivet, og sin top inde (kronen) en indvendig diameter højere. Diametre er i tommer i et fodprojekt og i millimeter i et meterprojekt, som i højre panel.
- En konstruktion går fra sin kant (indtastet, eller fra overfladen) ned til sin sump (den laveste bundkote minus sumpdybden). Uden nogen bundkote tegnes den 5 ft (1.5 m) dyb.
- Rør og konstruktioner med et problem (se netværkskontrollen i højre panel) tegnes i rødt.
- Et rør uden bundkoter tegnes ikke; en note nederst i visningen siger, hvor mange.

## Vælg fra 3D-visningen

Klik på et tracé (eller dets vej), et byggeplateau, en feature-linje, et rør, en konstruktion, et opmålingspunkt, en plante, en rampe eller et andet hårdt anlæg. Det vælges, præcis som hvis du havde klikket på det i planen: dets egenskaber åbnes i højre panel, hvor du kan redigere dem, og det tegnes i valgfarven oven på alt i 3D. Det, du vælger i planen, fremhæves også i 3D. Et tip ved siden af markøren navngiver det, du klikkede på, med dets øst, nord og kote. Rør og konstruktioner kan klikkes, selv hvor de ligger under jorden; en linje skjult bag en bakke kan ikke klikkes igennem den.

Klik på en brudlinje for at se, hvilken det er: den fremhæves, og statuslinjen navngiver den (brudlinjer har ingen egenskaber af deres egen).

Klik på terrænet for at læse øst, nord og kote dér i tippet.

## Kør langs et tracé

Klik på **Kør** på 3D-linjen og vælg et tracé. Visningen flytter sig til en førersæde: 3.5 ft (1.07 m) over vejen, på dets projekterede profil (på det eksisterende terræn langs midterlinjen, når der endnu ikke er noget profil), og kigger frem ad det.

- **Afspil** eller {{key:Space}} kører med den hastighed, du vælger (10 til 65 mph, eller 15 til 100 km/t); {{key:Space}} igen pauser. Den stopper ved enden; **Afspil** starter så forfra.
- Skyderen springer til enhver station; {{key:Left}} og {{key:Right}} går 10 ft (5 m) tilbage og frem.
- Træk i visningen pauser og lader dig kigge rundt.
- **Stop** eller {{key:Esc}} sætter visningen tilbage, hvor den var.

Den lodrette overdrivelse gælder også under kørslen: sæt den til 1× for at se vejen, som den bliver.

## Lys fra solen

Åbn **Sol** på 3D-linjen og sæt flueben ved **Lys fra solen**. Angiv en dato, et klokkeslæt og dets tidszone (forskellen til UTC: om sommeren den sommertid, der gælder), og byggepladsens breddegrad og længdegrad. Når projektet har et koordinatsystem, udfyldes de fra det.

Byggepladsen belyses så fra solens position, med **Skygger** hen over terrænet, korridoren og byggeplateauerne; menuen siger solens azimut og hvor højt den står, eller at den er under horisonten. Positionerne kommer fra NOAAs solligninger. Skyggerne falder den rigtige vej ved enhver overdrivelse, men de stopper ved byggepladsens kant: bakker og bygninger ud over den kaster ingen.

## Eksportér 3D-visningen

Klik på {{ui:GLB}} eller {{ui:OBJ}} på linjen. Det visningen viser, gemmes i sand skala (uden overdrivelse), i meter, med Y op. Detaljer: [Eksportér byggepladsen i 3D](topic:export-3d).
