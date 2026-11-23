---
title: Snitlinjer og tværprofiler
summary: Skær tværprofiler vinkelret på et tracé, se terrænet, det projekterede og afgravningen og opfyldet ved hver station, og få volumener efter gennemsnit af endearealer.
keywords: massediagram, balancepunkt, sammentrykning, udvidelse, transportafstand, lånegrav, deponi, tværprofilark, snit-ark, tværprofiler, snitlinjer, tværprofilvisning, afgravning, opfyld, arealer, gennemsnit af endearealer, endearealsvolumener, jordarbejde, station, forskydning, csv
from: 09639ce2
---

Et tværprofil viser vejen, som den bliver bygget: på tværs af tracéet ved én station, det eksisterende terræn, det projekterede (korridoren eller plateauet planeret ind) og afgravningen og opfyldet mellem dem.

## Tilføj snitlinjer

1. Vælg et tracé. I **Egenskaber**, under **Snitlinjer**, klik på {{ui:Tilføj snitlinjer}}.
2. Angiv **Hver** (afstanden: 50 ft eller 20 m til start) og **Venstre bredde** og **Højre bredde** (hvor langt hvert snit rækker fra midterlinjen).
3. For at skære et snit ved en bestemt station, skriv den i **Tilføj en station** (for eksempel `2+35`) og tryk {{key:Enter}}.

Snit skæres ved hvert helt multiplum af intervallet, i begge ender af tracéet, ved start og slut på hver kurve (PC og PT) og ved de stationer, du tilføjer. Snitlinjerne vises i planen som grå linjer på tværs af tracéet; de går også ud i DXF, DWG og PDF på lag C-ROAD-SCTN. Hver ændring er ét trin: {{key:Mod+Z}} fortryder den.

## Tværprofilvisningen

Åbn den med {{ui:Tværprofilvisning}} i tracéets **Egenskaber**, {{ui:Tværprofiler}} under **Overflade** › {{ui:Mere}}, eller {{key:X}}. Den erstatter længdeprofilvisningen under planen.

- Gå gennem snittene med pilene i bjælken, stationslisten eller {{key:Left}} og {{key:Right}}, når tværprofilvisningen har fokus ({{key:Home}} og {{key:End}} for det første og sidste).
- Den grå linje er det eksisterende terræn, den røde linje det projekterede. Afgravning er skraveret orange, opfyld grøn. Korridorpunkter er markeret: CL (midterlinje), EOP (kant af kørebane), SH (skulder) og DL (dagslinje).
- Overskriften angiver stationen, dette snits afgravnings- og opfyldsarealer og den lodrette overdrivelse. **Tilpas** fylder panelet; vælg 1× for at se snittet i sand skala.
- Den tykke linje i planen viser, hvilket snit der er på skærmen.
- **Zoom og panorér:** hjulet zoomer om markøren, og træk flytter visningen. {{ui:Tilpas}} (eller {{key:F}}, eller et dobbeltklik) tilpasser hele snittet igen.

## Mål i et snit

1. Klik på {{ui:Mål}} i snitbjælken, eller tryk {{key:M}}. Hintet siger »Klik på det første punkt, og derefter det andet.«
2. Klik på to punkter. Hvert fanger til enden af en linje eller et korridorpunkt (CL, EOP, SH, DL); hold {{key:Alt}} for et frit punkt.
3. Aflæsningen giver den vandrette afstand (ΔH), den lodrette afstand (ΔV), hældningen i procent med dens forhold og den lige længde, i projektets enheder.

Klik igen for at starte en ny måling. {{key:Esc}} rydder den, og {{key:M}} slukker for Mål.

## Tværprofilark

{{ui:Tværprofilark (PDF)}} under **Snitlinjer** lægger hvert snit på PDF-sider, i rækker fra venstre mod højre og oppefra og ned i stationsrækkefølge. Vælg **Papir**, **Målestok i plan** (snittenes vandrette målestok) og **Profiloverdrivelse** (1×, 2×, 5× eller 10×); dialogen siger, hvor mange snit der passer på en side, og hvor mange sider det giver.

Hvert snit viser et net med forskydninger og koter, terrænet (stiplet), det projekterede, afgravning og opfyld skraveret (orange og grøn), korridorpunkterne og under det sin station og sine afgravnings- og opfyldsarealer. Alle snit på arkene tegnes i samme størrelse, høje nok til det største; når det ikke passer på siden ved din overdrivelse, bruger CivilCraft den største, der passer, og siger det. Titelstrimlen angiver tracéet, stationerne på den side, målestokkene og »Ark 1 af 3«.

## Hvad afgravning og opfyld måles til

En korridor kan have lag under belægningen: belægningslag, skabelonkomponenter, spor. Vælg **Volumen måles til** i snitbjælken, og det bestemmer, hvor afgravning og opfyld går til:

- **Bundflade** (standard): til bunden af disse komponenter, så afgravningen inkluderer dybden af belægningsopbygningen.
- **Topflade**: kun til toppen af det projekterede, som før komponenterne blev regnet med.

Arealerne i overskriften, volumenerne nedenfor, CSV-filen og massediagrammet følger alle dette valg, og det gemmes med projektet.

## Volumener efter gennemsnit af endearealer

Mellem to nabosnit er volumen gennemsnittet af deres to arealer gange afstanden mellem deres stationer. Bjælken viser summerne for tracéet, og {{ui:CSV}} henter hvert snits arealer og volumener med løbende summer (kubikyard for projekter i fod, kubikmeter for metriske).

**Egenskaber** viser de samme summer ved siden af gittermetodens volumener fra [Jordarbejdsmængder](topic:volumes). De to er forskellige tilnærmelser: tættere snit bringer dem tættere sammen, og på en lige vej på fladt terræn er de ens.

:::note
Afgravning og opfyld tælles kun inden for de planerede områder (en korridors eller et plateaus dagslinjer), ligesom gittermetoden gør. Uden en korridor eller et plateau er det projekterede terrænet, så et snit viser ingen afgravning eller opfyld.
:::

## Massediagram

**Massediagram** under **Snitlinjer** tegner massediagrammet ud fra de samme endearealvolumener: langs stationerne den løbende sum af afgravning minus opfyld.

- **Sammentrykning (−) eller udvidelse (+) af afgravningen** angiver, hvad en kubikyard afgravning giver, når den er lagt som opfyld: −10 % (startværdien, en pladsholder) betyder, at den trækker sig sammen til 0.9; sten, der udvider sig, kan være +5 %. Brug værdien fra din geotekniske rapport.
- Hvor linjen stiger, er vejen i afgravning; hvor den falder, i opfyld. Over nul (skraveret orange) flyttes jord op ad stationerne; under nul (grøn) ned ad stationerne.
- **Balancepunkter** er, hvor linjen krydser nul: mellem to af dem balancerer afgravning og opfyld. Tabellen lister hver balanceret strækning, det flyttede volumen (dets højeste eller laveste punkt) og den gennemsnitlige transportafstand (det skraverede areal divideret med volumenet).
- Hvor linjen slutter ved siden af nul, er det overskydende **deponi** (over) eller **lånegrav** (under). På den sidste strækning tæller kun jorden ud over det niveau, den ender på, som flyttet.

**CSV** gemmer massekoten ved hvert snit, strækningerne og faktoren.
