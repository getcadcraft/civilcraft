---
title: Legg ut et tyngdedrevet rørnett
summary: Tegn overvanns- eller spillvannsrør kum for kum, sett regler for fall, dekning og senk, la CivilCraft sette bunnkotene, og rett problemene den lister.
keywords: kumbygger, konstruksjonstype, rektangulær konstruksjon, sluk, ramme, dekning, veggtykkelse, bibliotekselement, rørnett, overvann, spillvann, kloakk, konstruksjoner, kummer, innløp, bunnkoter, fall, senk, overkant, sandfang, tyngdedrevne rør
from: 10a3c14d
---

Et prosjekt har ett tyngdedrevet rørnett, overvann eller spillvann. Det består av konstruksjoner (kummer, innløp) og rette rør mellom dem. Strømmen går i retningen du tegner. CivilCraft kontrollerer hvert rør og hver konstruksjon mot tre regler du setter, og kan sette hver bunnkote fra disse reglene.

## Tegn en strekning

Du kan tegne rør uten terrengmodell, men overkanter, dekning og automatiske bunnkoter trenger en.

1. Trykk {{key:P}}, eller klikk {{ui:Rør}} i gruppen **Design**.
   Hintet sier «Rør: klikk konstruksjoner fra toppen av strekningen og nedover (klikk en eksisterende for å koble til). Enter avslutter.»
2. Klikk der den oppstrøms konstruksjonen skal stå. En konstruksjon plasseres.
3. Klikk hver neste konstruksjon nedstrøms. For å koble til en konstruksjon som allerede finnes, klikk på den: statuslinjen sier «Koblet til S3.»
4. Trykk {{key:Enter}}.
   Rørene tegnes, bunnkotene settes fra reglene, og statuslinjen sier for eksempel «3 rør tegnet, 12 bunnkoter satt fra reglene; alle kontroller består.»

Nye konstruksjoner får navnene S1, S2 … med en diameter på 48 in (1200 mm). Nye rør får navnene P1, P2 … med en diameter på 12 in (300 mm). Diametre er i tommer i et prosjekt i fot og i millimeter i et prosjekt i meter.

Avslutt med {{key:Enter}}. Dobbeltklikk fungerer også, men når du dobbeltklikker på en eksisterende konstruksjon for å avslutte strekningen der, forkastes koblingen: klikk den én gang, og trykk deretter {{key:Enter}}.

## Sett reglene dine

Når ingenting er valgt, har det høyre panelet (**Prosjekt**) en blokk **Rørnett**:

| Innstilling | Startverdi | Betydning |
|---|---|---|
| Type | Overvann | {{ui:Overvann}} eller {{ui:Spillvann}}; skrives til LandXML |
| Minste fall | 0.50% | Hvert rør må falle minst så mye |
| Minste dekning | 2 ft (0.6 m) | Terreng til rørets topp, hele veien langs røret |
| Senk i konstruksjoner | 0.10 ft (0.03 m) | Utløpets bunnkote må være minst så langt under hver innløpsbunnkote |

**Disse startverdiene er plassholdere, ikke en standard.** Sett verdiene som din etat eller ditt prosjekt krever. Dekning måles fra terrenget til toppen (bunnkote pluss innvendig diameter); veggtykkelse telles ikke. Der byggeplater eller korridorer er planert, er den planerte flaten terrenget.

## La CivilCraft sette bunnkotene

- {{ui:Sett alle bunnkoter fra reglene}} (i blokken **Rørnett**) setter alle rør.
- {{ui:Sett bunnkotene fra reglene}} (med ett rør valgt) setter bare det røret.

Nedstrøms regnet starter hver strekning med minst dekning ved toppkonstruksjonen, faller minst minste fall, får minst senken gjennom hver konstruksjon, og går dypere der terrenget langs røret ville gi mindre enn minste dekning. Bunnkoter avrundes nedover til 0.01, aldri oppover. Statuslinjen sier «Bunnkoter satt: minste dekning øverst i hver strekning, minst minste fall, minst senken i hver konstruksjon.» eller nevner det den ikke kunne gjøre.

## Rediger konstruksjoner og rør

Klikk en konstruksjon eller et rør med {{ui:Velg}} for å se det i høyre panel.

**Konstruksjon**: **Navn**, **Overkant**, **Sandfangsdybde**, **Diameter**, deretter **Overkant brukt**, **Sandfang**, **Øst** og **Nord**, og rørene inn og ut med bunnkotene sine.

- La **Overkant** stå tom for å hente den fra terrengmodellen; boksen viser da terrengverdien i grått. Skriv inn en verdi for å låse overkanten.
- Dra konstruksjonens håndtak på planen for å flytte den. Rørene følger; bunnkotene deres blir som de var, så kontroller problemene etterpå.

**Type**: velg en av nettets konstruksjonstyper (under), eller ingen for en rund konstruksjon med sin egen diameter.

**Rør**: **Navn**, konstruksjonene det går mellom, **Diameter**, **Øvre bunnkote**, **Nedre bunnkote**, deretter **Lengde**, **Fall** og **Minste dekning**.

Trykk {{key:Enter}} etter hver verdi.

## Les og rett problemer

Blokken **Rørnett** lister hvert problem (opptil 40); klikk ett for å velge røret eller konstruksjonen. Et valgt rør eller en valgt konstruksjon lister sine egne. Uten valg står det «Alle rør og konstruksjoner består reglene.»

| Melding (eksempler) | Hva du gjør |
|---|---|
| «P2 går oppover (-0.40%).» eller «… går flatt …» | Bytt bunnkotene, eller sett dem fra reglene. |
| «P2 med 0.30% er flatere enn minimum 0.50%.» | Senk den nedstrøms bunnkoten, eller hev den oppstrøms. |
| «P3 har 1.40 dekning 35 langs seg, mindre enn minimum 2.» | Senk røret; sett bunnkotene fra reglene. |
| «I S3 går P4 ut på 245.20, mindre enn 0.1 under P3 som kommer inn på 245.25.» | Senk utløpsrørets øvre bunnkote. |
| «P1s topp er over S1s overkant.» | Røret er for høyt for konstruksjonen. |
| «S2 har 2 rør som går ut fra den; et tyngdedrevet nett bør ha én utgang fra hver konstruksjon.» | Fjern ett utgående rør, eller tegn det på nytt i riktig retning. |
| «Rørene danner en sløyfe; strømmen må ende i et utløp.» | En strekning ble tegnet tilbake inn i seg selv; slett et rør. |
| «S5 er utenfor terrengmodellen og har ingen overkantkote.» | Skriv inn en overkant, eller flytt konstruksjonen inn på terrengmodellen. |
| «P6 går delvis utenfor terrengmodellen; dekningen der er ukjent.» | Utvid terrengmodellen, eller godta at dekningen ikke kontrolleres der. |
| «P7 har ingen bunnkoter ennå.» | Skriv dem inn, eller sett dem fra reglene. |

Problemrør og -konstruksjoner er også merket i rødt på planen.

## Konstruksjonstyper

En konstruksjonstype er en konstruksjon bygget ut fra sine parametere: en kum, et innløp, en koblingsboks eller et utløp, **rund** (innvendig diameter) eller **rektangulær** (innvendig bredde og lengde), med **veggtykkelse**, **gulvplate**, et **sandfang** under det laveste røret og en **ramme og lokk** (rund eller rektangulær åpning, rammehøyde). Typer hører til nettet, under **Konstruksjonstyper** i prosjektets Egenskaper.

1. Klikk {{ui:Ny konstruksjonstype}}. Dialogen tegner konstruksjonen i plan og snitt mens du skriver.
2. Klikk {{ui:Legg til typen}}.
3. Velg en konstruksjon og velg typen under **Type**. Den tar typens størrelse og sandfang; dets eget sandfang kan fortsatt endres.

Rediger en type, så følger hver konstruksjon av den typen dens størrelser. Fjern en type, og dens konstruksjoner blir som runde konstruksjoner med samme bredde. Hver endring er ett trinn: {{key:Mod+Z}} angrer den.

En rektangulær konstruksjon tegnes på planen, i DXF, DWG og PDF, og i 3D som et rektangel med lengden langs utløpsrøret; rør starter ved veggen. LandXML skriver den som en rektangulær konstruksjon (`RectStruct`) med veggtykkelsen sin, og leser slike konstruksjoner tilbake som typer.

### Del en type gjennom biblioteket

{{ui:Lagre som bibliotekselement}} skriver typen som et CadCraft-bibliotekselement (en `.json`-fil): plansymbolet, et 3D-legeme ned til en typisk dybde, og alle størrelsene. Last den opp til biblioteket for å dele den. {{ui:Åpne et bibliotekselement}} leser en konstruksjon lagret slik tilbake inn i nettet, konvertert til prosjektets enheter. Bibliotekselementer som ikke er konstruksjoner laget i CivilCraft, avvises, med årsaken.

## Slett

Velg et rør og trykk {{key:Delete}} for å fjerne det. Sletting av en konstruksjon fjerner også rørene som er koblet til den. På en Mac trykker du Fn og slett, eller klikker {{ui:Slett}}.

## Ikke bygget ennå

Vannføring, rørdimensjoner og trykklinjen ligger i [Overvannsdrenering](topic:storm-drainage). Rørkataloger, ikke-runde rør, rør i lengdeprofilvisningen, krumme rør og mer enn ett nett per prosjekt er ikke tilgjengelig ennå. Se [Ikke bygget ennå](topic:not-built-yet).
