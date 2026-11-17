---
title: Fejlfinding
summary: Symptomer, årsager og løsninger på de problemer, man støder på i CivilCraft, med de præcise meddelelser appen viser.
keywords: problemer, fejl, virker ikke, løsning, hjælp, meddelelser, fejlfinding, afvist, mangler, forkert, byttet om, højdekurver mangler
from: a9f7dedc
---

Meddelelser vises i statuslinjen nederst til højre, i felter i venstre og højre panel og i dialogbokse. De er citeret her, som appen viser dem.

## Åbning af filer

**»Filen er over 200 MB; CivilCraft kan ikke åbne så store filer endnu.«**
Del punktfilen op, eller reducér data, før du åbner den.

**»Kunne ikke åbne site.json: Dette er ikke en CivilCraft-projektfil.«**
Filen slutter på `.json` eller starter med `{`, men er ikke et CivilCraft-projekt. Punktfiler må ikke starte med `{`.

**»Kunne ikke åbne … Denne projektfil er fra en nyere CivilCraft (version 2).«**
Projektet er gemt af en nyere version. Åbn det dér, eller eksportér LandXML fra det.

**»Kunne ikke åbne … Dette er XML, men ikke LandXML (rodelementet er <…>).«**
Filen er en anden type XML. Eksportér LandXML fra det andet program.

**»… har ingen punkter, TIN-overflader eller tracéer, som CivilCraft kan læse.«**
Alt i filen springes over af CivilCraft (for eksempel kun gitteroverflader eller kun overgangskurve-tracéer). Resten af meddelelsen siger, hvad der var der. Se [LandXML: hvad der læses og skrives](topic:landxml-reference).

**»Eksemplet kunne ikke indlæses: …«**
{{ui:Åbn eksempelprojektet}} læser en fil fra CadCraft-webstedet. Uden forbindelse virker den kun, hvis CivilCraft er gemt til offline brug (knappen i appens bjælke viser {{ui:Klar offline}}). Gå online, klik på {{ui:Gem til offline brug}}, og så virker den offline herefter. Se [Offline](common:offline).

**{{ui:Gem til offline brug}} viser {{ui:Kunne ikke gemme}}.**
Nogle filer blev ikke hentet. Kontrollér forbindelsen, og klik på knappen igen.

**{{ui:Gem til offline brug}} viser {{ui:Offline er ikke tilgængelig}}.**
Dette browservindue kan ikke gemme en offlinekopi, typisk fordi det er et privat vindue, eller fordi computeren administreres. Åbn CivilCraft i et almindeligt vindue.

**Offline åbner appen slet ikke.**
Den blev ikke gemt til offline brug i denne browser, eller browseren ryddede sine webstedsdata (Safari gør det for websteder, der ikke er besøgt i flere uger). Gå online, åbn CivilCraft, og klik på {{ui:Gem til offline brug}}.

**Offlinekopien er en ældre version.**
Klik på {{ui:Klar offline}}, og derefter på {{ui:Gem igen (hent den nyeste version)}} mens du er online.

**En fil er nedtonet i åbn-dialogen.**
Dialogen viser kun punktfiler, LandXML og projektfiler ud fra deres endelser. Træk filen over på planen i stedet, eller omdøb den til `.txt`.

## Import af punkter

**»Der kunne ikke læses nogen punkter fra denne fil.«**
Vælg kolonnerækkefølgen under **Kolonner** manuelt. Hvis intet virker, åbn filen i en teksteditor og kontrollér, at der er ét punkt pr. linje med tal i.

**Projektet ser spejlvendt, roteret eller strakt ud til en linje.**
Nord og øst er byttet om. Oversigten sagde »gættet ud fra antal kolonner«. Vælg PENZD i stedet for PNEZD (eller omvendt) under **Kolonner**, eller importér igen.

**Punkter langt fra resten, og planen er zoomet ud til en prik.**
En række har en tastefejl i en koordinat, eller filen blander koordinatsystemer. Find punktet (klik på det for at se dets nummer), og ret filen.

**Rækker, der står under »Rækker, der ikke blev læst«.**
Se tabellen i [Importér punkter](topic:import-points#rows-that-are-not-read).

**Mine gamle punkter er væk.**
Import af en punktfil erstatter alle punkter og rydder fortryd. Åbn dit gemte projekt for at få dem tilbage.

## Overfladen

**»Overflade: Ikke bygget« med en rød boks.**
Boksen siger hvorfor: »En overflade kræver mindst tre punkter med koter.«, »Punkterne ligger alle på én linje: ingen trekanter.«, »Ingen punkter med koter.«, »Afgrænsningen overlapper ikke punkterne.« eller »Der er ingen trekanter tilbage inden for afgrænsningen.« Kontrollér kolonnerækkefølgen, punktgrupperne (er de {{ui:Udeladt}}?) og afgrænsningen.

**Højdekurver skærer lige hen over en grøft eller en højderygg.**
Den linje er ikke en brudlinje. Sæt dens gruppe til {{ui:Brudlinje}}, eller tegn den med værktøjet {{ui:Brudlinje}}. Se [Opbyg og finjustér overfladen](topic:build-surface).

**En brudlinjegruppe tegner et zig-zag.**
Gruppen indeholder mere end én linje, eller dens punkter er ikke nummereret langs linjen. Sæt gruppen tilbage til {{ui:Punkter}}, og tegn hver linje med værktøjet {{ui:Brudlinje}}.

**Lange, tynde trekanter langs ydersiden.**
Tegn en afgrænsning ({{key:O}}), eller angiv **Længste ydre kant**.

**Ingen højdekurver overhovedet, selvom overfladen er bygget.**
Enten er {{ui:Højdekurver}} slået fra under **Visning**, eller intervallet er så lille, at der ville blive mere end 2,000 højdekurveniveauer. Vælg et større interval.

**Brudlinjer eller en afgrænsning ændrer ingenting.**
Overfladen kommer fra LandXML (»Overflade (fra LandXML)«). Den bruges, som den er. Klik på {{ui:Genopbyg overfladen fra punkterne}} for i stedet at bygge den ud fra punkterne.

**»Der er endnu ingen overflade: åbn punkterne først.«**
Brudlinje, afgrænsning og byggeplateau kræver en eksisterende terrænoverflade. Importér punkter først.

**»Klik på et punkt med kote: en brudlinje overtager punkternes koter.«**
Værktøjet {{ui:Brudlinje}} vælger kun punkter. Zoom ind, og klik på et punkt (en orange firkant viser det, det vil tage).

## Tegning

**Mit sidste punkt forsvandt, da jeg dobbeltklikkede for at afslutte.**
I denne version afslutter dobbeltklik tracéet, byggeplateauet, brudlinjen eller afgrænsningen, men fjerner det punkt, du dobbeltklikkede på. Klik én gang på det sidste punkt, og tryk på {{key:Enter}}. Brug {{key:Mod+Z}}, hvis det allerede er sket, og tegn så igen.

**Jeg kan ikke afslutte en tegning på en tablet.**
Afslutning kræver {{key:Enter}}; der er endnu ingen knap på skærmen. Tilslut et tastatur. Se [Mus, trackpad og touch](topic:keyboard#mouse-trackpad-and-touch).

**Træk for at placere et punkt panorerer i stedet.**
Et træk på mere end få pixels panorerer planen i alle værktøjer. Klik uden at flytte.

**»Et tracé kræver mindst to punkter.« / »Et byggeplateau kræver mindst tre hjørner.« / »Et rørforløb kræver mindst to konstruktioner.«**
Du trykkede på {{key:Enter}} for tidligt. Tegningen kasseres; start forfra.

**Taster som A eller G gør ingenting.**
Et tekstfelt eller en liste i et panel har stadig fokus, så bogstaverne går dertil. Klik én gang på planen, og tryk derefter på tasten. På en Mac er slettetasten Backspace for browseren: brug Fn og Delete for at slette et valg.

## Tracéer og profiler

**»Kurverne ved PI 2 og PI 3 overlapper: … Brug mindre radier.«**
To kurver kræver mere tangent, end der er mellem deres PI'er. Sænk den ene eller begge radier i PI-tabellen, eller flyt PI'erne fra hinanden.

**»PI 3 drejer lige tilbage; der kan ikke laves en kurve.«**
Tracéet vender tilbage mod sig selv ved det PI. Flyt eller fjern PI'et.

**»Dette tracé har ingen terræn under sig at starte fra.«**
Tracéet ligger uden for overfladen. Flyt det op på overfladen, eller tilføj PVI'er ved at klikke, mens {{ui:Tilføj PVI'er}} er slået til.

**»Den lodrette kurve ved PVI 3 (L = …) starter, før kurven eller PVI'et før den slutter.« / »… løber forbi det næste PVI.«**
Forkort kurvelængden, eller flyt PVI'erne fra hinanden.

**»Der er allerede et PVI ved …«**
Der findes et PVI ved den station. Klik et andet sted, eller træk det eksisterende.

**Profilvisningen er tom: »Tegn et tracé for at se dets profil.«**
Der er intet tracé, eller det valgte har fejl.

## Korridorer og byggeplateauer

**»Korridoren kræver en projekteringsprofil uden fejl.«**
Start en projekteringsprofil ({{ui:Start fra terrænet}}), og ret eventuelle kurveoverlapninger.

**»… sideskråninger løber ud over overfladen, før de møder terrænet.« / »… skråningslinjer løber ud over overfladen, før de møder den …«**
Planeringen når overfladens kant, før den møder terrænet. Flyt projektet ind fra kanten, eller før det tættere på terrænet. Et nyt byggeplateau, der er tegnet delvist uden for overfladen, kan starte på kote 0: skriv en reel kote.

**»Korridorens skæringslinjer krydser …« / »Skæringslinjen krydser sig selv …«**
Skråninger fra forskellige sider løber ind i hinanden: snævre kurver, smalle byggeplateauer, dybe afgravninger eller høje opfyldninger. Brug en større radius, en smallere tværsnitsopbygning, et bredere byggeplateau eller stejlere skråninger.

**»Ingen mængder endnu: et byggeplateau skal kunne planeres uden problemer.«**
Ret de problemer, der er angivet i den røde boks ovenfor.

**{{ui:Projekteret (planeret)}} er nedtonet.**
Intet byggeplateau eller korridor er planeret endnu.

## Rør

**»P2 har endnu ingen bundkoter.«**
Klik på {{ui:Sæt dets bundkoter ud fra reglerne}}, eller skriv bundkoterne.

**»P1: intet terræn ved S1 at starte fra.«**
Den opstrøms konstruktion ligger uden for overfladen og har ingen kant. Skriv en kant for den.

**Alle rør markeres, efter jeg flyttede en konstruktion.**
Flytning af en konstruktion ændrer ikke bundkoterne. Klik på {{ui:Sæt alle bundkoter ud fra reglerne}}.

Alle netværksmeddelelser er forklaret i [Planlæg et gravitationsrørnet](topic:pipe-network#read-and-fix-problems).

## Gem og eksport

**»Intet at eksportere endnu.« / »Intet at plotte endnu.«**
Projektet er tomt. Importér punkter først.

**Jeg kan ikke finde den gemte fil.**
Den ligger i browserens downloads (normalt mappen Downloads). Se [Filer, du kan åbne, gemme og eksportere](topic:files#where-the-files-go).

**PDF-målestokken er forkert på papiret.**
Udskriv med 100 % eller i faktisk størrelse, ikke »tilpas til side«.

**Spørgsmålstegn i PDF-teksten.**
Navne eller beskrivelser bruger tegn uden for det vesteuropæiske sæt. Statusmeddelelsen tæller dem. Omdøb med almindelige tegn.

**Plottet er beskåret i kanterne.**
Målestoken er for stor til arket. Vælg målestoken markeret »(passer)«, et større ark, eller {{ui:Det, der er på skærmen}}.

**{{key:Mod+P}} åbnede browserens udskriftsdialog.**
Siden havde ikke fokus. Luk dialogen, klik på planen, og tryk på {{key:Mod+P}} igen, eller klik på {{ui:PDF}}.

## Selve appen

**Skærmen er tom, eller værktøjslinjen gør ingenting.**
Brug en aktuel version af Chrome, Edge, Firefox eller Safari, og genindlæs siden. Se [Browsere](common:browsers).

**Appen er langsom med en stor punktfil.**
Slå {{ui:Trekanter}}, {{ui:Punktetiketter}} og {{ui:Kotebånd}} fra, og brug et større højdekurveinterval. Meget store overflader bruger et øjeblik på at genopbygges efter hver ændring.

**Browseren spørger »Forlad siden?«**
Projektet har ikke-gemte ændringer. Bliv, gem med {{key:Mod+S}}, og forlad så siden.
