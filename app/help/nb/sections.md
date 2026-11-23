---
title: Profillinjer og tverrprofiler
summary: Kutt tverrprofiler vinkelrett på en veglinje, se terrenget, det prosjekterte og skjæring og fylling ved hvert profilnummer, og få volumer etter gjennomsnittlige endearealer.
keywords: massekurve, massediagram, balansepunkt, krymp, svell, transportavstand, uttak, deponi, tverrprofilark, tverrprofiler pdf, tverrprofiler, profillinjer, tverrprofilvisning, skjæring, fylling, arealer, gjennomsnittlig endeareal, endearealvolumer, jordarbeider, profilnummer, forskyvning, csv
from: 09639ce2
---

Et tverrprofil viser veien slik den skal bygges: tvers over veglinjen ved ett profilnummer, det eksisterende terrenget, det prosjekterte (korridoren eller byggeplaten formet inn) og skjæringen og fyllingen mellom dem.

## Legg til profillinjer

1. Velg en veglinje. I **Egenskaper**, under **Profillinjer**, klikk {{ui:Legg til profillinjer}}.
2. Angi **Hver** (avstanden: 50 ft eller 20 m til å begynne med), **Venstre bredde** og **Høyre bredde** (hvor langt hvert tverrprofil går ut fra senterlinjen).
3. For å kutte et tverrprofil ved et bestemt profilnummer, skriv det inn i **Legg til et profilnummer** (for eksempel `2+35`) og trykk {{key:Enter}}.

Tverrprofiler tas ut ved hvert hele multiplum av avstanden, i begge ender av veglinjen, ved start og slutt på hver kurve (PC og PT), og ved profilnumrene du legger til. Profillinjene vises i planen som grå linjer tvers over veglinjen; de går også ut i DXF, DWG og PDF på laget C-ROAD-SCTN. Hver endring er ett steg: {{key:Mod+Z}} angrer den.

## Tverrprofilvisningen

Åpne den med {{ui:Tverrprofilvisning}} i veglinjens **Egenskaper**, {{ui:Tverrprofiler}} under **Terrengmodell** › {{ui:Mer}}, eller med {{key:X}}. Den tar plassen til lengdeprofilvisningen under planen.

- Gå gjennom tverrprofilene med pilene i raden, profilnummerlisten, eller med {{key:Left}} og {{key:Right}} når tverrprofilvisningen har fokus ({{key:Home}} og {{key:End}} for første og siste).
- Den grå linjen er eksisterende terreng, den røde linjen det prosjekterte. Skjæring er skravert oransje, fylling grønn. Korridorpunktene er merket: CL (senterlinje), EOP (kjørebanekant), SH (skulder) og DL (dagslinje).
- Overskriften viser profilnummeret, dette tverrprofilets skjærings- og fyllingsarealer og den vertikale overdrivelsen. **Tilpass** fyller panelet; velg 1× for å se tverrprofilet i riktig målestokk.
- Den tykke linjen i planen viser hvilket tverrprofil som vises på skjermen.
- **Zoom og panorering:** hjulet zoomer om pekeren, og dra flytter visningen. {{ui:Tilpass}} (eller {{key:F}}, eller et dobbeltklikk) tilpasser hele tverrprofilet igjen.

## Mål i et tverrprofil

1. Klikk {{ui:Mål}} i tverrprofilraden, eller trykk {{key:M}}. Hintet sier «Klikk første punkt, deretter det andre.»
2. Klikk to punkter. Hvert av dem fester seg til enden av en linje eller et korridorpunkt (CL, EOP, SH, DL); hold {{key:Alt}} for et fritt punkt.
3. Avlesningen gir horisontal avstand (ΔH), vertikal avstand (ΔV), helningen i prosent med forholdet, og den rette lengden, i prosjektets enheter.

Klikk igjen for å starte en ny måling. {{key:Esc}} fjerner den, og {{key:M}} slår av {{ui:Mål}}.

## Tverrprofilark

{{ui:Tverrprofilark (PDF)}} under **Profillinjer** legger hvert tverrprofil på PDF-sider, i rader fra venstre til høyre og fra topp til bunn i profilnummerrekkefølge. Velg **Papir**, **Planmålestokk** (tverrprofilenes horisontale målestokk) og **Profiloverdrivelse** (1×, 2×, 5× eller 10×); dialogen sier hvor mange tverrprofiler som får plass på en side, og hvor mange sider det blir.

Hvert tverrprofil viser et rutenett med forskyvninger og høyder, terrenget (stiplet), det prosjekterte, skjæring og fylling skravert (oransje og grønn), korridorpunktene, og under det profilnummeret og skjærings- og fyllingsarealene. Alle tverrprofiler på arkene tegnes i samme størrelse, høye nok for det største; når det ikke får plass på siden med din overdrivelse, bruker CivilCraft det største som får plass, og sier fra om det. Tittelstripen angir veglinjen, profilnumrene på siden, målestokkene og «Ark 1 av 3».

## Hva skjæring og fylling måles til

En korridor kan ha lag under kjørebanen: overbygningslag, malkomponenter, spor. Velg **Volumer målt til** i tverrprofilraden for å velge hva skjæring og fylling går til:

- **Underflate** (start): til underkanten av disse komponentene, slik at skjæringen inkluderer dybden på oppbygningen av kjørebanen.
- **Overflate**: bare til toppen av det prosjekterte, slik det var før komponenter ble regnet med.

Arealene i overskriften, volumene under, CSV-filen og massetransporten følger dette valget, og det lagres med prosjektet.

## Volumer etter gjennomsnittlige endearealer

Mellom to naboer tverrprofiler er volumet gjennomsnittet av de to arealene ganget med avstanden mellom profilnumrene. Raden viser summene for veglinjen, og {{ui:CSV}} laster ned hvert tverrprofils arealer og volumer med løpende summer (kubikkyard for prosjekter i fot, kubikkmeter for metriske).

**Egenskaper** viser de samme summene ved siden av rutenettmetodens volumer fra [Jordarbeidsvolumer](topic:volumes). De to er ulike tilnærminger: tettere tverrprofiler gjør dem nærmere, og på en rett vei i flatt terreng er de like.

:::note
Skjæring og fylling telles bare innenfor de formede områdene (en korridors eller byggeplates dagslinjer), slik rutenettmetoden gjør. Uten korridor eller byggeplate er det prosjekterte terrenget, så et tverrprofil viser ingen skjæring eller fylling.
:::

## Massetransport

**Massetransport** under **Profillinjer** tegner massetransportdiagrammet fra de samme endearealvolumene: langs profilnumrene, den løpende summen av skjæring minus fylling.

- **Krymp (−) eller svell (+) av skjæringen** sier hva en kubikkyard skjæring blir når den legges som fylling: −10 % (startverdien, en plassholder) betyr at den krymper til 0.9; fjell som sveller kan være +5 %. Bruk tallet fra din geotekniske rapport.
- Der linjen stiger, er veien i skjæring; der den faller, i fylling. Over null (skravert oransje) flyttes masse oppover i profilnummer; under null (grønn), nedover i profilnummer.
- **Balansepunkter** er der linjen krysser null: mellom to av dem balanserer skjæring og fylling. Tabellen lister hver balansert strekning, volumet som flyttes (dets høyeste eller laveste punkt) og gjennomsnittlig transportavstand (det skraverte arealet delt på det volumet).
- Der linjen ender utenfor null, er det som blir igjen **deponi** (over) eller **uttak** (under). På den siste strekningen telles bare massen utover nivået den ender på som flyttet.

**CSV** lagrer massekoordinaten ved hvert tverrprofil, strekningene og faktoren.
