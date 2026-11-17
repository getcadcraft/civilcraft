---
title: Læg et tyngdekraftdrevet rørnetværk ud
summary: Tegn regn- eller spildevandsledninger konstruktion for konstruktion, angiv dit fald, din dækning og dine regler for kote, lad CivilCraft sætte bundkoterne, og ret de problemer, den lister.
keywords: konstruktionsbygger, konstruktionstype, rektangulær konstruktion, brønd, ramme, dæksel, vægtykkelse, biblioteksemne, rørnetværk, regnvand, spildevand, kloak, konstruktioner, brønde, indløb, bundkoter, dæksel, dækning, fald, kant, sump, tyngdekraftsrør
from: 10a3c14d
---

Et projekt har ét tyngdekraftdrevet rørnetværk, regnvand eller spildevand. Det består af konstruktioner (brønde, indløb) og lige rør mellem dem. Strømningen løber i den retning, du tegner. CivilCraft kontrollerer hvert rør og hver konstruktion mod tre regler, du angiver, og kan sætte alle bundkoter ud fra reglerne.

## Tegn et forløb

Du kan tegne rør uden en overflade, men kanter, dækning og automatiske bundkoter kræver en.

1. Tryk på {{key:P}}, eller klik på {{ui:Rør}} i gruppen **Design**.
   Hintet siger "Rør: klik på konstruktioner fra toppen af forløbet og nedad (klik på en eksisterende for at forbinde den). Enter afslutter."
2. Klik, hvor den opstrøms konstruktion skal ligge. En konstruktion placeres.
3. Klik på hver næste konstruktion nedstrøms. For at forbinde til en konstruktion, der allerede findes, klik på den: statuslinjen siger "Forbundet til S3."
4. Tryk på {{key:Enter}}.
   Rørene tegnes, deres bundkoter sættes ud fra reglerne, og statuslinjen siger fx "3 rør tegnet, 12 bundkoter sat ud fra reglerne; alle kontroller består."

Nye konstruktioner navngives S1, S2 … med en diameter på 48 in (1200 mm). Nye rør navngives P1, P2 … med en diameter på 12 in (300 mm). Diametre angives i tommer i et fodprojekt og i millimeter i et meterprojekt.

Afslut med {{key:Enter}}. Dobbeltklik virker også, men når du dobbeltklikker på en eksisterende konstruktion for at afslutte forløbet dér, bortfalder forbindelsen: klik én gang på den, og tryk derefter på {{key:Enter}}.

## Angiv dine regler

Når intet er valgt, har højre panel (**Projekt**) en blok **Rørnetværk**:

| Indstilling | Startværdi | Betydning |
|---|---|---|
| Type | Regnvand | {{ui:Regnvand}} eller {{ui:Spildevand}}; skrives til LandXML |
| Mindste fald | 0.50% | Hvert rør skal falde mindst så meget |
| Mindste dækning | 2 ft (0.6 m) | Terræn til rørets top (krone), hele vejen langs røret |
| Fald i konstruktioner | 0.10 ft (0.03 m) | Udløbets bundkote skal ligge mindst så langt under hver indløbs bundkote |

**Disse startværdier er pladsholdere, ikke en standard.** Angiv de værdier, din myndighed eller dit projekt kræver. Dækning måles fra terræn til kronen (bundkote plus indvendig diameter); vægtykkelse tælles ikke med. Hvor plateauer eller korridorer planeres, er det planerede terræn terrænet.

## Lad CivilCraft sætte bundkoterne

- {{ui:Sæt alle bundkoter ud fra reglerne}} (i blokken **Rørnetværk**) sætter alle rør.
- {{ui:Sæt dets bundkoter ud fra reglerne}} (med ét rør valgt) sætter kun det rør.

Når der arbejdes nedstrøms, starter hvert forløb mindst med dækning ved sin øverste konstruktion, falder mindst den mindste fald, falder mindst faldet gennem hver konstruktion og går dybere, hvor terrænet langs røret ville give mindre end den mindste dækning. Bundkoter afrundes nedad til 0.01, aldrig opad. Statuslinjen siger "Bundkoter sat: mindste dækning ved toppen af hvert forløb, mindst det mindste fald, mindst faldet i hver konstruktion." eller nævner, hvad den ikke kunne gøre.

## Redigér konstruktioner og rør

Klik på en konstruktion eller et rør med {{ui:Vælg}} for at se det i højre panel.

**Konstruktion**: **Navn**, **Kote**, **Sumpdybde**, **Diameter**, derefter **Brugt kote**, **Sump**, **Øst (E)** og **Nord (N)**, og rørene ind og ud med deres bundkoter.

- Lad **Kote** stå tom for at tage den fra overfladen; feltet viser så overfladeværdien i gråt. Skriv en værdi for at fastlåse koten.
- Træk konstruktionens greb i planen for at flytte den. Dens rør følger med; deres bundkoter bliver, som de var, så kontrollér problemerne bagefter.

**Type**: vælg en af netværkets konstruktionstyper (nedenfor), eller ingen for en rund konstruktion med sin egen diameter.

**Rør**: **Navn**, de konstruktioner det går mellem, **Diameter**, **Øvre bundkote**, **Nedre bundkote**, derefter **Længde**, **Fald** og **Mindste dækning**.

Tryk på {{key:Enter}} efter hver værdi.

## Læs og ret problemer

Blokken **Rørnetværk** lister hvert problem (op til 40); klik på et for at vælge røret eller konstruktionen. Et valgt rør eller en valgt konstruktion lister sine egne. Uden valg står der "Alle rør og konstruktioner opfylder reglerne."

| Besked (eksempler) | Hvad du gør |
|---|---|
| "P2 løber opad (-0.40%)." eller "… løber fladt …" | Byt bundkoterne, eller sæt dem ud fra reglerne. |
| "P2 med 0.30% er fladere end minimum 0.50%." | Sænk den nedstrøms bundkote, eller hæv den opstrøms. |
| "P3 har en dækning på 1.40 af 35 langs sig, mindre end minimum 2." | Sænk røret; sæt dets bundkoter ud fra reglerne. |
| "I S3 går P4 ud ved 245.20, mindre end 0.1 under P3, der kommer ind ved 245.25." | Sænk udløbsrørets øvre bundkote. |
| "P1's top er over S1's kote." | Røret er for højt for konstruktionen. |
| "S2 har 2 rør, der går ud fra den; et tyngdekraftnetværk bør have én vej ud af hver konstruktion." | Fjern ét udgående rør, eller tegn det igen i den rigtige retning. |
| "Rørene danner en sløjfe; strømningen skal ende i et udløb." | Et forløb blev tegnet tilbage i sig selv; slet et rør. |
| "S5 er uden for overfladen og har ingen kote for kanten." | Skriv en kote for kanten, eller flyt konstruktionen op på overfladen. |
| "P6 løber delvist uden for overfladen; dækningen der er ukendt." | Udvid overfladen, eller acceptér at dækningen ikke kontrolleres dér. |
| "P7 har endnu ingen bundkoter." | Skriv dem, eller sæt dem ud fra reglerne. |

Problemrør og -konstruktioner markeres også med rødt i planen.

## Konstruktionstyper

En konstruktionstype er en konstruktion bygget ud fra sine parametre: en brønd, et indløb, en samlebrønd eller et udløb, **rund** (indvendig diameter) eller **rektangulær** (indvendig bredde og længde), med sin **vægtykkelse**, **gulvplade**, en **sump** under det nederste rør og en **ramme og dæksel** (rund eller rektangulær åbning, rammehøjde). Typer hører til netværket, under **Konstruktionstyper** i projektets Egenskaber.

1. Klik på {{ui:Ny konstruktionstype}}. Dialogen tegner konstruktionen i plan og snit, mens du skriver.
2. Klik på {{ui:Tilføj typen}}.
3. Vælg en konstruktion, og vælg typen under **Type**. Den tager typens størrelse og sump; sin egen sump kan stadig ændres.

Redigér en type, og hver konstruktion af den type følger dens størrelser. Fjern en type, og dens konstruktioner bliver ved som runde konstruktioner med samme bredde. Hver ændring er ét trin: {{key:Mod+Z}} fortryder den.

En rektangulær konstruktion tegnes i planen, i DXF, DWG og PDF, og i 3D som et rektangel med sin længde langs dens udløbsrør; rør starter ved dens væg. LandXML skriver den som en rektangulær konstruktion (`RectStruct`) med sin vægtykkelse og læser sådanne konstruktioner tilbage som typer.

### Del en type via biblioteket

{{ui:Gem som biblioteksemne}} skriver typen som et CadCraft-biblioteksemne (en `.json`-fil): dens plansymbol, et 3D-legeme til en typisk dybde og alle størrelser. Upload det til biblioteket for at dele det. {{ui:Åbn et biblioteksemne}} læser en konstruktion gemt på denne måde tilbage ind i netværket, omregnet til projektets enheder. Biblioteksemner, der ikke er konstruktioner lavet i CivilCraft, afvises, med årsagen.

## Slet

Vælg et rør, og tryk på {{key:Delete}} for at fjerne det. Sletning af en konstruktion fjerner også de rør, der er forbundet til den. På en Mac: tryk på Fn og slet, eller klik på {{ui:Slet}}.

## Ikke lavet endnu

Flow, rørstørrelser og trykniveaulinjen står i [Regnvandsafledning](topic:storm-drainage). Rørkataloger, ikke-runde rør, rør i længdeprofilvisningen, buede rør og mere end ét netværk pr. projekt er endnu ikke tilgængelige. Se [Ikke lavet endnu](topic:not-built-yet).
