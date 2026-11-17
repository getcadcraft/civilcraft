---
title: Profillinjer og tverrprofiler
summary: Kutt tverrprofiler vinkelrett på en veglinje, se terrenget, konstruksjonen og skjæring og fylling ved hvert profilnummer, og få volumer etter gjennomsnittlig endeareal.
keywords: massetransport, massediagram, balansepunkt, krymping, svelling, transportavstand, uttak, deponi, tverrprofilark, tverrprofilark, tverrprofiler, profillinjer, tverrprofil, tverrprofilvisning, skjæring, fylling, arealer, gjennomsnittlig endeareal, volum etter endeareal, massebevegelse, profilnummer, forskyvning, csv
from: 5060173c
---

Et tverrprofil viser veien slik den skal bygges: tvers over veglinjen ved ett profilnummer, det eksisterende terrenget, konstruksjonen (korridoren eller byggeplaten som er gravet inn) og skjæringen og fyllingen mellom dem.

## Legg til profillinjer

1. Velg en veglinje. Under **Egenskaper**, under **Profillinjer**, klikk {{ui:Legg til profillinjer}}.
2. Sett **Hver** (avstanden: 50 ft eller 20 m til å begynne med), **Venstre bredde** og **Høyre bredde** (hvor langt hvert tverrprofil strekker seg fra midtlinjen).
3. For å kutte et tverrprofil ved et bestemt profilnummer, skriv det inn i **Legg til et profilnummer** (for eksempel `2+35`) og trykk {{key:Enter}}.

Tverrprofiler kuttes ved hvert hele multiplum av avstanden, i begge ender av veglinjen, ved starten og slutten av hver kurve (PC og PT), og ved profilnumrene du legger til. Profillinjene vises i planen som grå linjer tvers over veglinjen; de går også ut i DXF, DWG og PDF på lag C-ROAD-SCTN. Hver endring er ett steg: {{key:Mod+Z}} angrer den.

## Tverrprofilvisningen

Åpne den med {{ui:Tverrprofilvisning}} i veglinjens **Egenskaper**, {{ui:Tverrprofiler}} under **Terrengmodell** › {{ui:Mer}}, eller {{key:X}}. Den tar plassen til profilvisningen under planen.

- Gå gjennom tverrprofilene med pilene i linjen, profilnummerlisten, eller {{key:Left}} og {{key:Right}} med tverrprofilvisningen i fokus ({{key:Home}} og {{key:End}} for det første og siste).
- Den grå linjen er det eksisterende terrenget, den røde linjen konstruksjonen. Skjæring er skravert oransje, fylling grønn. Konstruksjonspunkter er merket: CL (midtlinje), EOP (kant av kjørebane), SH (skulder) og DL (dagslinje).
- Hodet viser profilnummeret, dette tverrprofilets skjærings- og fyllingsarealer og den vertikale overdrivelsen. **Tilpass** fyller panelet; velg 1× for å se tverrprofilet i sann målestokk.
- Den tykke linjen i planen viser hvilket tverrprofil som er på skjermen.

## Tverrprofilark

{{ui:Tverrprofilark (PDF)}} under **Profillinjer** legger hvert tverrprofil på PDF-sider, i rader fra venstre til høyre og øverst til nederst i profilnummerrekkefølge. Velg **Papir**, **Planmålestokk** (den horisontale målestokken for tverrprofilene) og **Profiloverdrivelse** (1×, 2×, 5× eller 10×); dialogen sier hvor mange tverrprofiler som får plass på en side, og hvor mange sider det blir.

Hvert tverrprofil viser et rutenett med forskyvninger og koter, terrenget (stiplet), konstruksjonen, skjæring og fylling skravert (oransje og grønn), konstruksjonspunktene, og under det profilnummeret og dets skjærings- og fyllingsarealer. Alle tverrprofilene på arkene tegnes i samme størrelse, høye nok for det største; når det ikke får plass på siden ved din overdrivelse, bruker CivilCraft det største som gjør det, og sier det. Tittelstripen nevner veglinjen, profilnumrene på den siden, målestokkene og «Ark 1 av 3».

## Volumer etter gjennomsnittlig endeareal

Mellom to nabotverrprofiler er volumet gjennomsnittet av deres to arealer ganger avstanden mellom profilnumrene. Linjen viser summene for veglinjen, og {{ui:CSV}} laster ned alle tverrprofilenes arealer og volumer med løpende summer (kubikkyard for fotprosjekter, kubikkmeter for metriske).

**Egenskaper** viser de samme summene ved siden av rutenettmetodens volumer fra [Massevolumer](topic:volumes). De to er ulike tilnærminger: tettere tverrprofiler bringer dem nærmere, og på en rett vei i flatt terreng er de like.

:::note
Skjæring og fylling telles bare innenfor de konstruerte områdene (en korridors eller en byggeplates dagslinjer), slik rutenettmetoden gjør. Uten korridor eller byggeplate er konstruksjonen terrenget, så et tverrprofil viser ingen skjæring eller fylling.
:::

## Massetransport

**Massetransport** under **Profillinjer** tegner massetransportdiagrammet fra de samme endeareal-volumene: langs profilnumrene, den løpende summen av skjæring minus fylling.

- **Krymping (−) eller svelling (+) av skjæringen** sier hva en kubikkyard skjæring blir når den er lagt som fylling: −10 % (startverdien, en plassholder) betyr at den krymper til 0,9; stein som sveller kan være +5 %. Bruk tallet fra din geotekniske rapport.
- Der linjen stiger, er veien i skjæring; der den faller, i fylling. Over null (skravert oransje) flyttes jord oppover profilnummeret; under null (grønn), nedover.
- **Balansepunkter** er der linjen krysser null: mellom to av dem balanserer skjæring og fylling. Tabellen lister hver balansert strekning, volumet som flyttes (det høyeste eller laveste punktet) og den gjennomsnittlige transportavstanden (det skraverte arealet delt på det volumet).
- Der linjen ender ute av null, er det som står igjen **deponi** (over) eller **uttak** (under). På den siste strekningen teller bare jorden utenfor nivået den ender på som flyttet.

**CSV** lagrer massekoordinaten ved hvert tverrprofil, strekningene og faktoren.
