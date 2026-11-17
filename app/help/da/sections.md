---
title: Snitlinjer og tværprofiler
summary: Skær tværprofiler vinkelret på et tracé, se terrænet, projekteringen og afgravning og opfyldning ved hver station, og få volumener efter gennemsnit af endearealer.
keywords: massediagram, massekurve, balancepunkt, svind, svulmning, transportafstand, lånegrav, deponi, tværprofilark, tværprofiler pdf, tværprofiler, snitlinjer, tværprofilvisning, afgravning, opfyldning, arealer, gennemsnit af endearealer, endearealvolumener, jordarbejde, station, forskydning, csv
from: 5060173c
---

Et tværprofil viser vejen, som den bliver bygget: på tværs af tracéet ved én station, det eksisterende terræn, projekteringen (korridoren eller byggeplateauet planeret ind) og afgravningen og opfyldningen mellem dem.

## Tilføj snitlinjer

1. Vælg et tracé. Under **Egenskaber** klikker du på {{ui:Tilføj snitlinjer}} under **Snitlinjer**.
2. Angiv **Hver** (afstanden: 50 ft eller 20 m til at starte med), **Venstre bredde** og **Højre bredde** (hvor langt hvert tværprofil rækker fra midterlinjen).
3. For at skære et tværprofil ved en bestemt station skriver du den i **Tilføj en station** (f.eks. `2+35`) og trykker {{key:Enter}}.

Tværprofiler skæres ved hvert helt multiplum af afstanden, i begge ender af tracéet, ved begyndelsen og slutningen af hver kurve (PC og PT) og ved de stationer, du tilføjer. Snitlinjerne vises i planen som grå linjer på tværs af tracéet; de går også ud i DXF, DWG og PDF på lag C-ROAD-SCTN. Hver ændring er ét trin: {{key:Mod+Z}} fortryder det.

## Tværprofilvisningen

Åbn den med {{ui:Tværprofilvisning}} i tracéets **Egenskaber**, med {{ui:Tværprofiler}} under **Overflade** › {{ui:Mere}}, eller med {{key:X}}. Den tager profilvisningens plads under planen.

- Gå gennem tværprofilerne med pilene i dens linje, stationslisten eller {{key:Left}} og {{key:Right}} når tværprofilvisningen har fokus ({{key:Home}} og {{key:End}} for det første og det sidste).
- Den grå linje er det eksisterende terræn, den røde linje projekteringen. Afgravning er skraveret orange, opfyldning grøn. Korridorpunkter er markeret: CL (midterlinje), EOP (belægningskant), SH (skulder) og DL (skæring i terræn).
- Hovedet angiver stationen, dette tværprofils afgravnings- og opfyldningsarealer og den lodrette overdrivelse. **Tilpas** fylder panelet; vælg 1× for at se tværprofilet i sand skala.
- Den tykke linje i planen viser, hvilket tværprofil der er på skærmen.

## Tværprofilark

{{ui:Tværprofilark (PDF)}} under **Snitlinjer** lægger hvert tværprofil på PDF-sider, i rækker fra venstre mod højre og oppefra og ned i stationsrækkefølge. Vælg **Papir**, **Planmålestok** (den vandrette skala for tværprofilerne) og **Profiloverdrivelse** (1×, 2×, 5× eller 10×); dialogen siger, hvor mange tværprofiler der får plads på en side, og hvor mange sider det giver.

Hvert tværprofil viser et net med forskydninger og koter, terrænet (stiplet), projekteringen, afgravning og opfyldning skraveret (orange og grøn), korridorpunkterne og under det sin station og sine afgravnings- og opfyldningsarealer. Alle tværprofiler på arkene tegnes lige store, høje nok til det største; når det ikke passer på siden ved din overdrivelse, bruger CivilCraft det største, der passer, og siger det. Titellinjen angiver tracéet, stationerne på siden, målestokkene og »Ark 1 af 3«.

## Volumener efter gennemsnit af endearealer

Mellem to nabotværprofiler er volumenet gennemsnittet af deres to arealer gange afstanden mellem stationerne. Linjen viser summerne for tracéet, og {{ui:CSV}} downloader hvert tværprofils arealer og volumener med løbende summer (kubikyard i fodprojekter, kubikmeter i metriske projekter).

**Egenskaber** viser de samme summer ved siden af volumenerne efter gittermetoden fra [Jordarbejdsvolumener](topic:volumes). De to er forskellige tilnærmelser: tættere tværprofiler bringer dem tættere sammen, og på en lige vej i fladt terræn er de ens.

:::note
Afgravning og opfyldning tælles kun inden for de planerede områder (en korridors eller et byggeplateaus skæringslinjer i terrænet), ligesom gittermetoden gør. Uden en korridor eller et byggeplateau er projekteringen terrænet, så et tværprofil viser ingen afgravning eller opfyldning.
:::

## Massediagram

**Massediagram** under **Snitlinjer** tegner massediagrammet ud fra de samme volumener efter endearealer: langs stationerne den løbende sum af afgravning minus opfyldning.

- **Svind (−) eller svulmning (+) af afgravningen** siger, hvad en kubikyard afgravning giver, når den er lagt som opfyldning: −10 % (startværdien, en pladsholder) betyder, at den svinder til 0.9; sten, der svulmer, kan være +5 %. Brug tallet fra din geotekniske rapport.
- Hvor linjen stiger, er vejen i afgravning; hvor den falder, i opfyldning. Over nul (skraveret orange) flytter jorden sig op ad stationeringen; under nul (grøn) ned ad den.
- **Balancepunkter** er der, hvor linjen krydser nul: mellem to af dem balancerer afgravning og opfyldning. Tabellen lister hver balanceret strækning, den flyttede mængde (dens højeste eller laveste punkt) og den gennemsnitlige transportafstand (det skraverede areal divideret med mængden).
- Hvor linjen slutter væk fra nul, er det overskydende **deponi** (over) eller **lånegrav** (under). På den sidste strækning tæller kun jorden ud over det niveau, den slutter på, som flyttet.

**CSV** gemmer massekoten ved hvert tværprofil, strækningerne og faktoren.
