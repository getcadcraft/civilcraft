---
title: Lejo një asistent AI të punojë me vendin tënd
summary: Ndiz asistentët te Cilësimet, që një asistent në kompjuterin tënd të lexojë vendin e hapur (pika, sipërfaqe, vëllime, profile, parcela), të shtojë pika matjeje, të ruajë dhe eksportojë LandXML ose DWG, përmes CadCraft Studio. Joaktiv derisa ta ndezësh.
keywords: ai, asistent, mcp, skript, automatizim, studio, pika, kota, stacion, shmangie, aks, vëllim, prerje, mbushje, profil, parcelë, landxml, dwg, usd, dosje, leje, shkëput, aktivitet
from: d0356582
---

## Çfarë do të mësosh

Si të lejosh një asistent AI (çdo asistent që flet MCP) të punojë me vendin që ke hapur, çfarë mund dhe çfarë nuk mund të bëjë, dhe si ta ndalosh.

## Çfarë mund të bëjë një asistent në CivilCraft

| Kërkon | Çfarë merr | Ka nevojë për |
|---|---|---|
| Vendin | Emrin, njësitë, sistemin e koordinatave, grupet e pikave, aksët, sipërfaqet, platformat, parcelat dhe tubat | Lexim |
| Pikat e matjes | Numrin, lindjen, veriun, kotën dhe përshkrimin, sipas grupit, sipas përshkrimit ose brenda një kutie | Lexim |
| Kotat e sipërfaqes | Terreni ekzistues (ose sipërfaqja e niveluar) në çdo pikë që emëron | Lexim |
| Stacionet dhe shmangiet | Stacioni dhe shmangia e pikave përgjatë një aksi, ose koordinatat dhe kota e terrenit të stacioneve | Lexim |
| Një profil | Kotat e terrenit, të profilit të projektimit dhe të sipërfaqes së niveluar përgjatë një aksi, çdo sa këmbë ose metra | Lexim |
| Prerje dhe mbushje | Vëllimet midis terrenit ekzistues dhe sipërfaqes së niveluar (çdo platformë dhe korridor gjithashtu), ose midis terrenit dhe një niveli | Lexim |
| Parcelat | Qoshet, sipërfaqja (me akra ose hektarë), perimetri dhe përshkrimi ligjor | Lexim |
| Një zgjedhje | Pikat që emëron zgjidhen në plan, sikur t'i kishe zgjedhur ti | Redaktim |
| Pika të reja matjeje | Pika të shtuara me numrat që jep, ose numrat e lirë të radhës. Çdo thirrje është një hap që mund ta zhbësh | Redaktim |
| Ruaj | {{ui:Ruaj}} i vetë CivilCraft | Ruaj |
| LandXML ose DWG | Të njëjtët skedarë si butonat {{ui:LandXML}} dhe {{ui:DWG}} | Eksport |
| Vendi në 3D | OpenUSD (.usdz, .usda ose .usdc) i terrenit, sipërfaqes së niveluar, platformave dhe tubave, siç e eksporton pamja 3D | Eksport |
| Bimët dhe lista e bimëve | Bimët e gjetura në listën e bimëve me çfarëdo emri, dhe numrat e listës së bimëve | Lexim |
| Mbjellje dhe nivelim | Bimë, një shtrat ose një gardh i vendosur, ose një platformë, ledh, kanal ose zonë nivelimi e shtuar, çdo gjë një hap që mund ta zhbësh, me prerjen dhe mbushjen e saj | Redaktim |
| Kontroll ujitjeje | Rrjedha e çdo zone, presioni i nevojshëm te valvula e saj dhe te furnizimi, koka më e keqe, kohët e punës, problemet dhe lista e materialeve, si ndihmë llogaritjeje që një projektues ujitjeje e kontrollon | Lexim |

Ai punon me vendin që është i hapur. Në Studio mund të ruajë dhe të eksportojë edhe në dosje që zgjedh ti (më poshtë); pa dosje, skedarët e tij shkarkohen si ata të butonave.

## Ndize

Asistentët arrijnë te CivilCraft përmes CadCraft Studio në kompjuterin tënd; shfletuesi i thjeshtë nuk ka rrugë hyrjeje.

1. Hap {{ui:Cilësimet}} dhe zgjidh skedën **CivilCraft**.
2. Nën **Asistentët**, shëno **Lejo asistentët AI dhe skriptet të përdorin CivilCraft**.
3. **Lexim** është i shënuar për ty. Shëno **Redaktim**, **Ruaj** ose **Eksport** vetëm kur asistenti i duhet.
4. Për ta lejuar të ruajë dhe të eksportojë në një dosje, zgjidh {{ui:Shto një dosje…}} nën **Dosjet që mund t'i përdorë**, dhe zgjidh dosjen te dialogu i Studio. {{ui:Hiq}} e merr përsëri menjëherë; çdo cak tjetër refuzohet.
5. Lidh asistentin në Studio (Studio tregon adresën dhe cilësimet që duhen ngjitur).

## Ndërsa një asistent është i lidhur

Një shënim në krye të panelit të djathtë thotë cili asistent është i lidhur dhe çfarë mund të bëjë. Kliko {{ui:Shkëput}} për ta mbyllur sesionin e tij menjëherë; duhet të lidhet përsëri për të vazhduar.

**Aktiviteti**, nën **Asistentët** në Cilësimet, liston çdo thirrje që bëri asistenti, më të rejat e para, dhe nëse funksionoi.

:::tip
Pyet me fjalë të thjeshta, për shembull "sa është kota e terrenit çdo 50 ft përgjatë Rrugës Kryesore?", "sa prerje dhe mbushje kanë nevojë platformat?" ose "shto një pikë kontrolli te këto koordinata". Asistenti lexon vendin dhe përgjigjet, ose e bën ndryshimin si një hap që mund ta zhbësh.
:::

## Pa hapur CivilCraft

Serveri i skedarëve të CadCraft për asistentët (`npx @getcadcraft/mcp`) dhe komanda `cadcraft` hapin projektet e ruajtura të CivilCraft (`.civilcraft.json`) dhe skedarët e pikave me kodin e vetë CivilCraft, pa dritare: të njëjtat vegla leximi, shtimi i pikave, ruajtja e projektit, LandXML dhe vendi në 3D si OpenUSD. `cadcraft convert site.civilcraft.json site.xml` shkruan LandXML nga komanda. Hapja e LandXML, eksporti DWG dhe veglat e hapësirës së punës Landscape ende kërkojnë dritaren e CivilCraft.

## Fik

Hiq shenjën nga **Lejo asistentët AI dhe skriptet të përdorin CivilCraft**. Çdo asistent shkëputet menjëherë, dhe cilësimi mbahet për herën tjetër.

## Shih edhe

- [Recetat për asistentët AI](common:assistants-recipes): shembuj të punuar, secili me veglat që thërret.
- [Vendos një aks rrugor horizontal](topic:alignment)
- [Ndërto dhe rafino sipërfaqen](topic:build-surface)
- [Zgjidh, kopjo dhe ngjit pikat e matjes](topic:copy-paste-points)
- [Cilësimet e CivilCraft](topic:settings)
