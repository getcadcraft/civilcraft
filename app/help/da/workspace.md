---
title: Skærmen, del for del
summary: En rundvisning i hver linje og hvert panel i CivilCraft ved deres navn på skærmen, fra værktøjslinjen til statuslinjen.
keywords: brugerflade, skærm, værktøjslinje, paneler, egenskaber, statuslinje, profilvisning, layout, rundvisning, ui
from: 76272010
---

CivilCraft har én skærm. Der er ingen faner og ingen layouts. Sidepanelerne kan flyttes, frigøres eller lægges i et vindue for sig: se [Ordn panelerne, og brug en anden skærm](common:arrange-panels). Oppefra og ned og fra venstre mod højre:

- **appfeltet** (CadCraft-mærket, appens navn, version, Om, skærmtilstand, Hjælp, Gem til offline brug, Papir og Model)
- **værktøjslinjen** med syv grupper af knapper
- **panelet til venstre**: Område, Punkter, Overflade, Visning og, når du har importeret nogle, GIS-lag
- **planen** i midten, med **profilvisningen** under sig, når den er åben
- **panelet til højre**: Egenskaber for det, der er markeret
- **statuslinjen** langs bunden

## Appfeltet

Den tynde linje helt øverst hører til CadCraft-webstedet, ikke til CivilCraft selv.

- Versionsmenuen viser, hvilket build du kører.
- {{ui:Om CivilCraft}} åbner appens side på webstedet.
- {{ui:Fuld skærm}} skifter mellem skærmtilstandene: fuld skærm, derefter fuld skærm med skjulte linjer og så tilbage til normal. {{key:Ctrl+Shift+F}} gør det samme på alle platforme, også på en Mac (dér er det Control-tasten, ikke Command). Med skjulte linjer fører du markøren til den øverste kant for at få dem tilbage.
- {{ui:Hjælp}} (eller {{key:F1}}) åbner denne hjælp i et sidepanel; {{key:F1}} eller {{key:Esc}} lukker det.
- {{ui:Gem til offline brug}} beholder CivilCraft i denne browser, så den åbnes uden forbindelse; den viser så {{ui:Klar offline}}. Se [Filer, du kan åbne, gemme og eksportere](topic:files#online-and-offline).
- {{ui:Papir}} og {{ui:Model}} skifter mellem et lyst og et mørkt tema. Planen og profilen følger temaet; PDF'er udskrives altid på hvidt.

## Værktøjslinjen

Hver gruppe har en lille etiket over sine knapper. Hold markøren over en knap for at se dens værktøjstip og tast.

| Gruppe | Knapper | Det de gør |
|---|---|---|
| Fil | {{ui:Ny}}, {{ui:Åbn}}, {{ui:Gem}} | Begynd forfra, åbn en punktfil, LandXML eller et projekt, gem projektet som en download |
| Eksportér | {{ui:LandXML}}, {{ui:DXF}}, {{ui:DWG}}, {{ui:PDF}} | Skriv LandXML 1.2, en R12-DXF eller en DWG af planen, eller plot planen til PDF |
| Overflade | {{ui:Brudlinje}}, {{ui:Afgrænsning}} | Tegn en brudlinje gennem opmålingspunkter; tegn den ydre afgrænsning |
| Design | {{ui:Tracé}}, {{ui:Plateau}}, {{ui:Rør}}, {{ui:Længdeprofil}} | Tegn et tracé, et plateau, et rørforløb; vis eller skjul profilvisningen |
| Redigér | {{ui:Fortryd}}, {{ui:Gentag}}, {{ui:Kopiér}}, {{ui:Sæt ind}}, {{ui:Mere}} | Fortryd, gentag, kopiér og sæt opmålingspunkter ind; {{ui:Mere}} rummer Klip, Sæt ind på samme sted, Duplikér, Slet, Vælg alle punkter og Fravælg alle |
| GIS | {{ui:Koordinater}}, {{ui:Importér}}, {{ui:Eksportér}}, {{ui:Kort}} | Angiv koordinatsystemet, importér og eksportér GIS-filer, vis kortlag under planen |
| Visning | {{ui:Vælg}}, {{ui:Tilpas}}, {{ui:3D}} | Vælg og flyt ting; zoom for at vise alt; vis området i 3D ([Se området i 3D](topic:site-3d)) |

Et tegneværktøj forbliver nedtrykt, mens det er aktivt. Hvis du klikker på det igen, trykker på {{key:Esc}} eller trykker på {{key:V}}, vender du tilbage til {{ui:Vælg}}. {{ui:Fortryd}}, {{ui:Gentag}}, {{ui:Kopiér}} og punkterne i {{ui:Mere}} er grå, når de ikke kan gøre noget; værktøjstippet siger hvorfor (for eksempel "Vælg først opmålingspunkter"). Hver knap står på listen i [Værktøjslinjereference](topic:toolbar).

I et smalt vindue ruller værktøjslinjen sidelæns.

## Panelet til venstre

### Område

- **Navn**: projektets navn. Det navngiver hver fil, du gemmer eller eksporterer, og står i PDF'ens titelstrimmel.
- **Enheder**: {{ui:Amerikanske fod}} eller {{ui:Meter}}. Det siger, hvad tallene betyder. At ændre det konverterer **ikke** koordinater; se [Enheder, stationer og talformater](topic:units-and-stations).

### Punkter

Når det er tomt, fortæller det dig, hvordan du åbner en punktfil. Med punkter viser det filens navn, antallet af punkter og hvor mange der har en kote, derefter en tabel over **punktgrupper**: én række pr. første ord i beskrivelsen (GRD, FL, TBS …), med et antal og et valg i **Overflade**:

- {{ui:Punkter}}: punkterne indgår i overfladen (standard for hver gruppe).
- {{ui:Brudlinje}}: gruppens punkter forbindes, i punktnummerorden, til én brudlinje.
- {{ui:Udeladt}}: gruppen rører ikke overfladen.

### Overflade

Fakta om det eksisterende terræn: punkter, trekanter, laveste og højeste kote, middelkote, 2D- og 3D-areal, brudlinjer og om der er en afgrænsning. Under fakta lister en boks alt, overfladebyggeren måtte rette eller ikke kunne gøre. Derefter:

- **Længste ydre kant**: 0 beholder hver ydre trekant; et tal fjerner lange smalle trekanter udefra.
- Links, der vises, når de gælder: {{ui:Fjern afgrænsningen}}, {{ui:Fjern tegnede brudlinjer}} og, for en overflade læst fra LandXML, {{ui:Genopbyg overfladen fra punkterne}}.

### Visning

- **Overflade**: {{ui:Eksisterende terræn}} eller {{ui:Projekteret (planeret)}}. Den anden er tilgængelig, når et plateau eller en korridor planerer uden problemer.
- **Højdekurver for hver**, **Hovedkurve for hver** og **Bånd** (antallet af farvebånd).
- Afkrydsningsfelter: {{ui:Højdekurver}}, {{ui:Kurveetiketter}}, {{ui:Trekanter}}, {{ui:Kotebånd}}, {{ui:Faldpile}}, {{ui:Punkter}}, {{ui:Punktetiketter}}, {{ui:Brudlinjer}}, {{ui:Overfladekant}}, {{ui:Rør}}.
- En signaturforklaring med båndenes koter vises, når bånd er slået til.

Visningsindstillinger gemmes med projektet, men er ikke fortrydelsestrin: {{key:Mod+Z}} slår aldrig et afkrydsningsfelt tilbage.

## Planen

Planen viser punkterne, overfladen og alt, du projekterer, i planvisning med nord opad. Hjul zoomer ved markøren, træk i tom plads panorerer. Hele listen står i [Taster og mus](topic:keyboard).

- På et tomt projekt viser en boks med titlen **Start med opmålingspunkter** de første trin og tilbyder {{ui:Åbn eksempelområdet}}.
- Mens et tegneværktøj er aktivt, siger et hint øverst på planen, hvad du skal klikke på, og hvordan du afslutter.
- At trække en fil hen over planen viser "Slip en punktfil, LandXML eller et projekt".
- Markerede ting fremhæves. Et markeret tracé eller plateau viser firkantede greb ved sine PI'er eller hjørner; en markeret konstruktion viser ét greb. Træk i et greb for at flytte det.
- Markerede opmålingspunkter har en ring. {{key:Shift}} og et klik tilføjer eller fjerner et punkt; {{key:Shift}} og et træk tegner en boks (eller, trukket rundt om dem, et lasso), der tilføjer punkterne indeni. Se [Vælg, kopiér og sæt opmålingspunkter ind](topic:copy-paste-points).

## Profilvisningen

Tryk på {{key:R}} eller klik på {{ui:Længdeprofil}} for at åbne den under planen. Dens linje har:

- en liste over tracéer (aktiv, når der er to eller flere tracéer)
- {{ui:Tilføj PVI'er}}: mens den er nedtrykt, tilføjer et klik i profilen en PVI ({{key:I}} slår den til og fra)
- en aflæsning af station, terræn, projekteret kote, fald og afgravning eller opfyld under markøren
- en lukkeknap

Profilen viser det eksisterende terræn, den projekterede profil, fald på hver ret linje, hver PVI's station og kote, hver lodret kurves L og K med dens BVC og EVC, høje og lave punkter og den lodrette overdrivelse. Den tilpasser sig altid hele tracéet: den zoomer eller panorerer ikke. Når markøren flyttes langs den, sættes en prik på tracéet i planen.

## Panelet til højre: Egenskaber

Dets overskrift siger, hvad det viser.

- **Projekt** (intet markeret): tracéerne og plateauerne som links, blokken **Jordarbejde** og blokken **Rørnet** med dets regler og problemer.
- **Tracé**: navn, startstation, længde, PI-tabellen, kurverne, den projekterede profils PVI-tabel og fakta og indstillingerne for **Korridor**.
- **Plateau**: navn, kote, skråninger i afgravning og opfyld, areal, fakta om skæring i terræn og jordarbejde.
- **Konstruktion** eller **Rør**: størrelser, kanter, bundkoter, fald, overdækning og eventuelle problemer.
- **Punkt** og dets nummer: punktets koordinater, kote, beskrivelse og gruppe (skrivebeskyttet).

Felter træder i kraft, når du trykker på {{key:Enter}} eller forlader feltet. En værdi, der ikke accepteres, markeres som ugyldig, og intet ændrer sig.

## Statuslinjen

- **E** og **N**: øst- og nordkoordinat under markøren.
- **Terræn**-koten dér (og **Planeret**, hvor et plateau eller en korridor ændrede den), eller "Uden for overfladen".
- Det nærmeste tracé (eller det markerede) med **Sta** og afstanden (**L** eller **R**) under markøren.
- Til højre beskeder: hvad der lige skete, eller hvorfor noget blev afvist. En besked rydder sig selv efter nogle sekunder.

## Dialogbokse

- **Importér punkter**: åbner med hver punktfil. Se [Importér opmålingspunkter](topic:import-points).
- **Plot planen til PDF**: se [Plot planen til PDF](topic:plot-pdf).
- **Ikke-gemte ændringer**: spørger, før {{ui:Ny}} eller åbning af et projekt eller en LandXML-fil kasserer ugemt arbejde. {{ui:Gem en kopi}} downloader projektet først.

## Små skærme

Op til 760 pixel i bredden, som på en telefon, beholder planen skærmen: værktøjslinjen er én række, der ruller sidelæns, og panelerne åbner som ark fra en linje nederst. {{ui:Værktøjer}} skjuler værktøjslinjen, og {{ui:Flyt}} lægger den nederst.
