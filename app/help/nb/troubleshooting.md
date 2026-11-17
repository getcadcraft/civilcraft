---
title: Feilsøking
summary: Symptomer, årsaker og løsninger for problemene folk møter i CivilCraft, med de nøyaktige meldingene appen viser.
keywords: problemer, feil, virker ikke, løsning, hjelp, meldinger, feilsøking, avvist, mangler, galt, byttet om, konturer mangler
from: a9f7dedc
---

Meldinger vises i statuslinjen nederst til høyre, i bokser i venstre og høyre panel, og i dialogene. De er sitert her slik appen viser dem.

## Åpne filer

**"Filen er over 200 MB; CivilCraft åpner ikke så store filer ennå."**
Del punktfilen, eller reduser datamengden før du åpner den.

**"Kunne ikke åpne site.json: Dette er ikke en CivilCraft-prosjektfil."**
Filen slutter på `.json` eller starter med `{`, men er ikke et CivilCraft-prosjekt. Punktfiler må ikke starte med `{`.

**"Kunne ikke åpne … Denne prosjektfilen er fra en nyere CivilCraft (versjon 2)."**
Prosjektet ble lagret av en nyere versjon. Åpne det der, eller eksporter LandXML fra det.

**"Kunne ikke åpne … Dette er XML, men ikke LandXML (rotelementet er <…>)."**
Filen er en annen type XML. Eksporter LandXML fra det andre programmet.

**"… har ingen punkter, TIN-flater eller veglinjer som CivilCraft kan lese."**
Alt i filen er noe CivilCraft hopper over (for eksempel bare rutenettflater, eller bare spiralveglinjer). Resten av meldingen sier hva som var der. Se [LandXML: hva som leses og skrives](topic:landxml-reference).

**"Eksempelet kunne ikke lastes: …"**
{{ui:Åpne eksempelområdet}} leser en fil fra CadCraft-nettstedet. Uten tilkobling fungerer det bare hvis CivilCraft er lagret for frakoblet bruk (knappen øverst i appen viser {{ui:Klar frakoblet}}). Gå på nett, klikk {{ui:Lagre for frakoblet bruk}}, så fungerer det frakoblet fra da av. Se [Frakoblet bruk](common:offline).

**{{ui:Lagre for frakoblet bruk}} viser {{ui:Kunne ikke lagre}}.**
Noen filer ble ikke lastet ned. Sjekk tilkoblingen og klikk knappen igjen.

**{{ui:Lagre for frakoblet bruk}} viser {{ui:Frakoblet bruk er ikke tilgjengelig}}.**
Dette nettleservinduet kan ikke ta vare på en frakoblet kopi, vanligvis fordi det er et privat vindu, eller fordi datamaskinen er administrert. Åpne CivilCraft i et vanlig vindu.

**Frakoblet: appen åpnes ikke i det hele tatt.**
Den ble ikke lagret for frakoblet bruk i denne nettleseren, eller nettleseren tømte nettstedsdataene sine (Safari gjør dette for nettsteder som ikke er besøkt på flere uker). Gå på nett, åpne CivilCraft og klikk {{ui:Lagre for frakoblet bruk}}.

**Den frakoblede kopien er en eldre versjon.**
Klikk {{ui:Klar frakoblet}}, og deretter {{ui:Lagre på nytt (hent nyeste versjon)}} mens du er på nett.

**En fil er gråtonet i åpne-dialogen.**
Dialogen viser bare punktfiler, LandXML og prosjektfiler etter filendelse. Dra filen over planen i stedet, eller gi den nytt navn til `.txt`.

## Importere punkter

**"Ingen punkter kunne leses fra denne filen."**
Velg kolonnerekkefølgen under **Kolonner** manuelt. Hvis ingenting virker, åpne filen i et tekstredigeringsprogram og kontroller at det er ett punkt per linje, med tall i.

**Området ser speilvendt, dreid eller strukket ut til en linje.**
Nord og øst er byttet om. Oppsummeringen sa "gjettet ut fra antall kolonner". Velg PENZD i stedet for PNEZD (eller omvendt) under **Kolonner**, eller importer på nytt.

**Punkter langt unna resten, og planen zoomet ut til en prikk.**
En rad har en skrivefeil i en koordinat, eller filen blander koordinatsystemer. Finn punktet (klikk på det for å se nummeret) og rett filen.

**Rader oppført under "Rader som ikke ble lest".**
Se tabellen i [Importer oppmålingspunkter](topic:import-points#rows-that-are-not-read).

**De gamle punktene mine er borte.**
Å importere en punktfil erstatter alle punkter og tømmer angrehistorikken. Åpne det lagrede prosjektet for å få dem tilbake.

## Terrengmodellen

**"Terrengmodell: Ikke bygget" med en rød boks.**
Boksen sier hvorfor: "En terrengmodell trenger minst tre punkter med koter.", "Punktene ligger alle på én linje: ingen trekanter.", "Ingen punkter med koter.", "Avgrensningen overlapper ikke punktene." eller "Ingen trekanter er igjen innenfor avgrensningen." Sjekk kolonnerekkefølgen, punktgruppene (er de {{ui:Utelatt}}?) og avgrensningen.

**Høydekurvene skjærer rett over en grøft eller en rygg.**
Den linjen er ikke en bruddlinje. Sett gruppen til {{ui:Bruddlinje}}, eller tegn den med verktøyet {{ui:Bruddlinje}}. Se [Bygg og finjuster terrengmodellen](topic:build-surface).

**En bruddlinjegruppe tegner en sikksakk.**
Gruppen inneholder mer enn én linje, eller punktene er ikke nummerert langs linjen. Sett gruppen tilbake til {{ui:Punkter}} og tegn hver linje med verktøyet {{ui:Bruddlinje}}.

**Lange, tynne trekanter langs ytterkanten.**
Tegn en avgrensning ({{key:O}}) eller sett **Lengste ytterkant**.

**Ingen høydekurver i det hele tatt, selv om terrengmodellen er bygget.**
Enten er {{ui:Høydekurver}} av under **Visning**, eller intervallet er så lite at det ville blitt mer enn 2,000 høydekurvenivåer. Velg et større intervall.

**Bruddlinjer eller en avgrensning endrer ingenting.**
Terrengmodellen kommer fra LandXML ("Terrengmodell (fra LandXML)"). Den brukes slik den er. Klikk {{ui:Bygg terrengmodellen på nytt fra punktene}} for å bygge den fra punktene i stedet.

**"Det finnes ingen terrengmodell ennå: importer punkter først."**
Bruddlinje, avgrensning og byggeplate trenger en eksisterende terrengmodell. Importer punkter først.

**"Klikk på et oppmålingspunkt med kote: en bruddlinje tar punktenes koter."**
Verktøyet {{ui:Bruddlinje}} velger bare oppmålingspunkter. Zoom inn og klikk på et punkt (en oransje firkant viser hvilket det vil ta).

## Tegning

**Det siste punktet mitt forsvant da jeg dobbeltklikket for å avslutte.**
I denne versjonen avslutter dobbeltklikk veglinjen, byggeplaten, bruddlinjen eller avgrensningen, men fjerner punktet du dobbeltklikket på. Klikk på siste punkt én gang og trykk {{key:Enter}}. Bruk {{key:Mod+Z}} hvis det allerede har skjedd, og tegn på nytt.

**Jeg kan ikke avslutte en tegning på nettbrettet.**
Avslutning krever {{key:Enter}}; det finnes ingen knapp på skjermen ennå. Koble til et tastatur. Se [Mus, styreflate og berøring](topic:keyboard#mouse-trackpad-and-touch).

**Å dra for å plassere et punkt panorerer i stedet.**
Et drag på mer enn noen få piksler panorerer planen i alle verktøy. Klikk uten å flytte.

**"En veglinje trenger minst to punkter." / "En byggeplate trenger minst tre hjørner." / "En rørstrekning trenger minst to konstruksjoner."**
Du trykket {{key:Enter}} for tidlig. Tegningen forkastes; start på nytt.

**Taster som A eller G gjør ingenting.**
Et tekstfelt eller en liste i et panel har fortsatt fokus, så bokstavene går dit. Klikk på planen én gang, og trykk deretter tasten. På en Mac er slettetasten Backspace for nettleseren: bruk Fn og delete for å slette et utvalg.

## Veglinjer og profiler

**"Kurvene ved PI 2 og PI 3 overlapper: … Bruk mindre radier."**
To kurver trenger mer tangent enn det som finnes mellom PI-ene. Senk én eller begge radiene i PI-tabellen, eller flytt PI-ene fra hverandre.

**"PI 3 snur rett tilbake; den kan ikke ta en kurve."**
Veglinjen går tilbake på seg selv ved det PI-punktet. Flytt eller fjern PI-en.

**"Denne veglinjen har ingen terreng under seg å starte fra."**
Veglinjen ligger utenfor terrengmodellen. Flytt den over terrengmodellen, eller legg til PVI-er ved å klikke med {{ui:Legg til PVI-er}} på.

**"Vertikalkurven ved PVI 3 (L = …) starter før kurven eller PVI-en før den slutter." / "… går forbi neste PVI."**
Forkort kurvelengden, eller flytt PVI-ene fra hverandre.

**"Det finnes allerede en PVI ved …"**
Det finnes en PVI ved det profilnummeret. Klikk et annet sted, eller dra den eksisterende.

**Profilvisningen er tom: "Tegn en veglinje for å se profilen."**
Det finnes ingen veglinje, eller den valgte har feil.

## Korridorer og byggeplater

**"Korridoren trenger en prosjektert profil uten feil."**
Start en prosjektert profil ({{ui:Start fra terrenget}}) og rett eventuelle overlappende kurver.

**"… sideskråningene går av terrengmodellen før de møter terrenget." / "… skråningslinjene går av terrengmodellen før de møter den …"**
Terrengformingen når kanten av terrengmodellen før den møter terrenget. Flytt prosjektet innover fra kanten, eller før det nærmere terrenget. En ny byggeplate som tegnes delvis utenfor terrengmodellen, kan starte på kote 0: skriv inn en reell kote.

**"Korridorens dagslinjer krysser …" / "Dagslinjen krysser seg selv …"**
Skråninger fra ulike sider løper inn i hverandre: trange kurver, smale byggeplater, dype skjæringer eller høye fyllinger. Bruk en større radius, et smalere tverrsnitt, en bredere byggeplate eller brattere skråninger.

**"Ingen volumer ennå: en byggeplate må formes uten problemer."**
Rett problemene som er oppført i den røde boksen over.

**{{ui:Prosjektert (formet)}} er gråtonet.**
Ingen byggeplate eller korridor er formet ennå.

## Rør

**"P2 har ingen bunnkoter ennå."**
Klikk {{ui:Sett bunnkotene fra reglene}} eller skriv inn bunnkotene.

**"P1: ingen terreng ved S1 å starte fra."**
Konstruksjonen oppstrøms ligger utenfor terrengmodellen og har ingen rimkote. Skriv inn en rimkote for den.

**Alle rør er markert etter at jeg flyttet en konstruksjon.**
Å flytte en konstruksjon endrer ikke bunnkotene. Klikk {{ui:Sett alle bunnkoter fra reglene}}.

Alle meldinger om nettverket forklares i [Legg ut et selvfallsnett for rør](topic:pipe-network#read-and-fix-problems).

## Lagring og eksport

**"Ingenting å eksportere ennå." / "Ingenting å plotte ennå."**
Prosjektet er tomt. Importer punkter først.

**Jeg finner ikke den lagrede filen.**
Den ligger i nettleserens nedlastinger (vanligvis mappen Nedlastinger). Se [Filer du kan åpne, lagre og eksportere](topic:files#where-the-files-go).

**PDF-målestokken er feil på papiret.**
Skriv ut med 100 % eller faktisk størrelse, ikke "Tilpass til side".

**Spørsmålstegn i PDF-teksten.**
Navn eller beskrivelser bruker tegn utenfor det vesteuropeiske tegnsettet. Statusmeldingen teller dem. Gi nytt navn med vanlige tegn.

**Plottet er avskåret i kantene.**
Målestokken er for stor for arket. Velg målestokken merket "(passer)", et større ark, eller {{ui:Det som er på skjermen}}.

**{{key:Mod+P}} åpnet nettleserens utskriftsdialog.**
Siden hadde ikke fokus. Lukk dialogen, klikk på planen, og trykk {{key:Mod+P}} igjen, eller klikk {{ui:PDF}}.

## Selve appen

**Skjermen er tom, eller verktøylinjen gjør ingenting.**
Bruk en oppdatert versjon av Chrome, Edge, Firefox eller Safari, og last siden på nytt. Se [Nettlesere](common:browsers).

**Appen er treg med en stor punktfil.**
Slå av {{ui:Trekanter}}, {{ui:Punktetiketter}} og {{ui:Høydebånd}}, og bruk et større høydekurveintervall. Svært store terrengmodeller bruker en stund på å bygges på nytt etter hver endring.

**Nettleseren spør "Forlate siden?"**
Prosjektet har ulagrede endringer. Bli, lagre med {{key:Mod+S}}, og forlat deretter siden.
