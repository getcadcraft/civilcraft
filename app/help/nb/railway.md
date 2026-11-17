---
title: Tegn et jernbanespor
summary: Gjør en veglinje til et jernbanespor: overgangskurver (klotoide, kubisk parabel, Bloss, Helmert, sinus halvbølge, sinus), overhøyde i hver kurve med likevektsoverhøyde, overhøydeunderskudd og overhøydeoverskudd, grenser for overhøyde og sporgeometri som advarsler, sporveksler og sporforbindelser etter stasjonering, en frirom-omhylling som sveipes langs linjen, og et spor med skinner, sviller og ballastseng bygget som korridoren, i plan, snitt, lengdeprofil, 3D og mengder.
keywords: jernbane, skinne, jernbanespor, spor, tog, t-bane, sporvei, overhøyde, superelevasjon, overhøydeunderskudd, overhøydeoverskudd, likevektsoverhøyde, overgang, overgangskurve, klotoide, kubisk parabel, bloss, helmert, sinus halvbølge, cosinus, sportvidde, normalsportvidde, bredsporvidde, meterspor, smalspor, sville, ballast, underballast, planum, sidestripe, sporavstand, 60E1, 54E1, UIC60, 115RE, 136RE, endring av overhøyde, endringshastighet for overhøyde, sporveksel, tunge, sporforbindelse, hjertestykke, ledelengde, avslutningskurve, avgreningshastighet, frirom, frirom-omhylling, lastprofil, perrong, perronggap, sporavstand, stigning, vertikalkurve, minste radius, LandXML-overhøyde
from: 99de9745
---

Enhver veglinje kan være et jernbanespor. Kurvene får da overgangskurver og en overhøyde (skinnenes superelevasjon), og korridoren bygges som et spor: skinner på sviller over en ballastseng, og terrenget formes inn mot bakken slik som for en vei. Sporveksler og sporforbindelser legges på etter stasjonering, og en frirom-omhylling kan sveipes langs sporet og kontrolleres mot det som står ved siden av.

Alle tall nedenfor er **plassholdere**, ikke standarder. Jernbaner setter sine grenser etter linjehastighet, sportype og land; sett dem ut fra din egen jernbanes standard. CivilCraft inneholder ingen nasjonal tabell.

## Gjør veglinjen til et jernbanespor

1. Velg veglinjen og finn **Jernbane** under Egenskaper.
2. Kryss av for **Denne veglinjen er et jernbanespor**. Hver endring er ett trinn i angre.
3. Angi **Dimensjonerende hastighet** øverst i veglinjens egenskaper: det er linjehastigheten overhøyden kontrolleres mot. **Langsomste tog** (i Jernbane-blokken) er hastigheten overhøydeoverskuddet kontrolleres mot.

## Overganger

Gi hver kurve en overgangslengde i begge ender i PI-tabellen (**Overgang inn**, **Overgang ut**), og velg deretter type i kurvetabellen i Jernbane-blokken, eller **Overgang for hver kurve**:

| Type | Krumning langs overgangen |
|---|---|
| Klotoide | vokser jevnt (veispiralen) |
| Kubisk parabel | y = x³ / (6·R·L), med L målt langs tangenten; selve kurven er litt lengre |
| Bloss | 3u² − 2u³ av full krumning (u = andelen av lengden): starter og slutter mykt |
| Helmert | to parabler, 2u² og deretter 1 − 2(1 − u)² |
| Sinus halvbølge | (1 − cos πu) / 2 |
| Sinus | u − sin(2πu) / 2π |

Alle unntatt den kubiske parabelen drar seg L / 2R, som klotoiden. Stasjonering går langs virkelig lengde. LandXML beholder typen (spiType clothoid, cubicParabola, bloss, biquadratic, cosine, sinusoid).

## Overhøyde

Skriv inn **Overhøyde** for hver kurve i millimeter. Tabellen viser for hver kurve:

- **Likevektsoverhøyde** = G·v² / (g·R), der G er avstanden mellom skinnenes akser (**Skinneakse-avstand**, sportvidden pluss skinnehodets bredde hvis du ikke skriver inn noe annet). Med G = 1500 mm blir dette den kjente 11,8·V² / R (V i km/t, R i m).
- **Underskudd** = likevekt ved linjehastigheten − påført overhøyde.
- **Overskudd** = påført overhøyde − likevekt ved de langsomste togenes hastighet.
- **Rampe**: den bratteste overhøydestigningen langs rampene, i mm per meter.

Overhøyden stiger opp over hver overgang, formet etter krumningen: rett for klotoide eller kubisk parabel, Bloss-formet for Bloss, og så videre. En kurveende uten overgang får rampen på rett strekning før den, så lang som grensen for overhøydestigning krever, og det står oppgitt. Overhøyden endrer seg da der krumningen ikke gjør det.

**Overhøyde dreies om** angir hvilken skinne som beholder den dimensjonerende profilen: **lavskinnen** (vanlig), **innerskinnen** eller **sporaksen** (hver skinne flytter seg halvparten av overhøyden). Den dimensjonerende profilen er skinnetoppen der.

**Overhøydediagrammet** tegner hver skinnes høyde over profilen langs stasjonene; lengdeprofilvisningen og plan- og profilarkene får det samme som et bånd under profilen.

## Grenser og advarsler for overhøyde

**Størst påført overhøyde**, **Størst overhøydeunderskudd**, **Størst overhøydeoverskudd**, **Brattest overhøydestigning** og **Raskest endring av overhøyde** (stigningen ved linjehastighet, mm/s) kontrolleres i hver kurve. En verdi over en grense gir en advarsel i Jernbane-blokken og i Problemer-panelet, med grensen og verdien som ble funnet. Uten dimensjonerende hastighet kontrolleres ikke underskudd og endringshastighet (en merknad sier det).

## Sporet

Angi **Sportvidde** (standard 1435 mm, bred-, meter- eller smalsporforvalg, eller din egen), **Skinneprofil** (60E1, 54E1, 49E1, 115RE, 136RE: bare deres publiserte mål), antall **Spor** og deres **Sporavstand**, og deretter **Sviller og ballast**: svillemateriale, lengde, bredde, høyde og avstand; ballastdybde under sville (ved lavskinnen), skulder, skråning, hvor langt toppen ligger under svillene; underballastdybde, sidestripen utenfor ballastens tå, og planumets fall på tvers.

Trykk **Bygg sporet**. Det slår på korridoren for veglinjen, bygget som et spor langs den dimensjonerende profilen: skinnene og svillene kantes med overhøyden, planumet gjør det ikke. Dagslinje-skråninger går fra sidestripens kant ved korridorens skjærings- og fyllingsskråninger, og sporet går inn i ferdig terreng som en vei.

- **Plan**: begge skinnene i hvert spor (lag C-RAIL-TRAK) og, med mer enn ett spor, hvert sporets akse (C-RAIL-CNTR), på skjerm, i DXF, DWG, PDF og i plan- og profilark.
- **Snitt**: svillene, skinnene, og bunnen av ballasten og underballasten i alle snitt.
- **3D**: skinnene, hver sville og ballastsengen (Vis › Spor), også i GLB, OBJ og USD.
- **Mengder**: sporlengde, skinner (begge skinnene i hvert spor, langs hvert sporets egen linje), sviller, ballastsengen og ballasten minus svillene, og underballasten, etter gjennomsnittlig endeareal mellom snitt.

## Kontroller av sporgeometri

I tillegg til overhøyden kontrollerer Jernbane-blokken selve linjen mot seks grenser til (alle er plassholdere, alle dine å sette):

- **Brattest stigning** i den dimensjonerende profilen, i mm per meter.
- **Minste radius for vertikalkurve**, som en faktor k i R ≥ k·V² (R i meter, V i km/t). En parabolsk vertikalkurve med lengde L mellom to stigninger har radius L delt på endringen i stigning.
- **Korteste vertikalkurve**.
- **Minste kurveradius** i plan (0 slår kontrollen av).
- **Korteste bue eller rett strekning**, som sekunder reisetid ved linjehastighet: en sirkelbue, eller den rette strekningen mellom to kurver, som er kortere enn den avstanden, får advarsel. 1,8 s er det kjente «halve hastigheten i km/t, i meter».
- **Endringshastighet for overhøydeunderskudd** langs hver overgang, i mm/s ved linjehastighet.

**Sporgeometri** lister den brattest stigningen som ble funnet og hver vertikalkurve med sin radius og radiusen linjehastigheten krever. En vertikalkurve som ligger på en overgang eller en overhøydestigning får en merknad. Uten dimensjonerende profil eller dimensjonerende hastighet hoppes kontrollene som krever dem over, og en merknad sier det.

## Sporveksler og sporforbindelser

Under **Sporveksler og sporforbindelser** trykker du **Legg til en sporveksel**. Den plasseres på den lengste rette strekningen; still inn i tabellen:

- **Stasjonering av tungespiss**: der sporveksleren starter på denne veglinjen.
- **Hjertestykke**: hjertestykkenummeret N (1:N). Hjertestykkevinkelen er 2·atan(1 / 2N).
- **Side**: venstre eller høyre, sett i retning av stigende stasjonering.
- **Sporforbindelse-avstand** i meter: over 0 blir sporveksleren en sporforbindelse til et parallelt spor så langt unna (to sporveksler og den rette strekningen mellom dem).

Tabellen viser **Ledelengde** (tungespiss til hjertestykke), avslutningskurvens **Radius** og **Avgreningshastighet** som den radiusen tillater med din grense for overhøydeunderskudd og uten overhøyde. **Lag sporet** gjør den avgrenende ruten om til en egen veglinje (sporveksleren, avslutningskurven, og deretter rett fram i hjertestykkevinkelen) med de samme jernbaneinnstillingene, klar til å forlenges.

Planen tegner de to avgrenende skinnene til hver sporveksel, senterlinjen, en strek ved tungespissen og ved hjertestykket, og «1:N» (lag C-RAIL-TURN), på skjerm og i DXF, DWG, PDF og ark. 3D-visningen tegner de avgrenende skinnene på hovedsporets nivå.

Formen er en **plassholder**: en rett sporveksel og én avslutningskurve ut fra hjertestykkenummeret. En bygget sporveksel følger jernbanens standard og produsentens tegning. Advarsler: en sporveksel som går utenfor veglinjen, ligger på en kurve, en overgang, en overhøyde eller en vertikalkurve, eller overlapper en annen; og en merknad når linjehastigheten er over sporvekselens avgreningshastighet.

## Frirom-omhylling

Kryss av for **Sveip en frirom-omhylling langs dette sporet**. Velg **Kontur** (to plassholderformer, eller **Din egen kontur** skrevet som ett punkt per linje: forskyvning fra sporaksen, deretter høyde over skinnetoppen, i meter), **Kjøretøylengde** og **Boggiavstand**, og, hvis det finnes, en **Perrongkant** (side, avstand fra sporaksen, høyde over skinnen).

Ved hver stasjon kantes konturen med overhøyden om lavskinnen og utvides av kurven: midten av kjøretøyet flytter seg innover med b² / 8R, endene utover med (L² − b²) / 8R (b boggiavstanden, L kjøretøylengden, R radiusen der, etter overgangen). Blokken tegner snittet på den rette strekningen og der det er bredest, og lister:

- den **bredeste omhyllingen** og hvor,
- **sporavstanden** satt mot avstandene to nabo-omhyllinger krever,
- rommet som er igjen ved **perrongkanten**, eller hvor mye som står innenfor,
- hver formlinje, rørkonstruksjon og annen jernbaneveglinje som ligger **innenfor omhyllingen**.

En formlinje med høydeangivelser vurderes mot konturen i sin høyde over skinnen; uten dimensjonerende profil, eller for et punkt uten høyde, vurderes den bare i plan, og listen sier det. Planen viser omhyllingens to kanter (lag C-RAIL-CLRN) med et kryss ved hver ting som ligger innenfor.

Konturene som tilbys er **plassholdere, ikke noen jernbanes sportvidde**. Skriv inn din jernbanes lastprofil før du stoler på et resultat.

## I andre programmer

- **LandXML**: en jernbaneveglinje skrives med sine overganger (spiType) og en `Cant`-blokk: sportvidden, rotasjonspunktet, linjehastigheten, og en stasjon der hver overhøydestigning starter og slutter, med påført overhøyde, likevektsoverhøyde og underskudd. Å åpne en LandXML-fil med en `Cant`-blokk gjør den veglinjen til et jernbanespor med disse overhøydene.
- **IFC**: veglinjen med sine overhøydesegmenter, skinnene, svillene, ballasten og underballasten.

## Ikke bygget ennå

Sporveksler i IFC-eksporten, sporvekselfamilier utover den enkelte avslutningskurven (buede tunger, svingtunger, kryssinger, diamanter), regler for kinematisk profil (omhyllingen er en fast kontur med kurveutslag), kjøreledninger og signalanlegg.

**Hvilken standard.** I Jernbane-blokken tar «Standard å henvise til» enten Ingen eller Europeisk (UIC og EN). Velger du Europeisk, nevnes de dokumentene et europeisk prosjekt henviser til (EN 13803 for veglinjeparametrene, EN 13232 for sporveksler og kryssinger, EN 15273 for profiler, EN 13848 for sporgeometrisk kvalitet), og hver grense får en boks for paragrafen den kommer fra. Ingen tall fra noen standard er innebygd: grensene for overhøyde, underskudd, overskudd, stigning og endring, geometrien til sporveksler og frirom-profilen er alle fortsatt plassholdere, og vinduet sier det. En jernbaneingeniør kontrollerer hver verdi mot standardens egen tekst og skriver inn paragrafen ved siden av, før noe bygges. Sør-Afrika og AREMA-tabellene er ikke med i denne utgivelsen.
