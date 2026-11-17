---
title: "Lad en AI-assistent arbejde med din byggegrund"
summary: "Slå assistenter til i Indstillinger, så en assistent på din computer kan læse den åbne byggegrund (punkter, overflader, mængder, længdeprofiler, matrikler), tilføje opmålingspunkter, gemme og eksportere LandXML eller DWG, via CadCraft Studio. Fra, indtil du slår den til."
keywords: ai, assistent, mcp, script, automatisering, studio, punkter, kote, station, forskydning, tracé, mængde, udgravning, opfyld, længdeprofil, matrikel, landxml, dwg, usd, mapper, rettigheder, afbryd, aktivitet
from: d0356582
---

## Hvad du lærer

Hvordan du lader en AI-assistent (enhver assistent der taler MCP) arbejde med den byggegrund du har åben, hvad den kan og ikke kan, og hvordan du stopper den.

## Hvad en assistent kan i CivilCraft

| Den beder om | Det den får | Kræver |
|---|---|---|
| Byggegrunden | Navn, enheder, koordinatsystem, punktgrupper, tracéer, overflader, byggeplateauer, matrikler og rør | Læs |
| Opmålingspunkter | Nummer, øst, nord, kote og beskrivelse, efter gruppe, efter beskrivelse eller inde i en boks | Læs |
| Overfladekoter | Det eksisterende terræn (eller den planerede overflade) i de punkter den nævner | Læs |
| Stationer og forskydninger | Stationen og forskydningen af punkter langs et tracé, eller koordinater og terrænkote for stationer | Læs |
| En længdeprofil | Terræn-, designprofil- og planerede overfladekoter langs et tracé, hver så mange fod eller meter | Læs |
| Udgravning og opfyld | Mængder mellem det eksisterende terræn og den planerede overflade (også hvert byggeplateau og korridor), eller mellem terrænet og et niveau | Læs |
| Matrikler | Hjørner, areal (med acres eller hektar), omkreds og matrikelbeskrivelsen | Læs |
| Et valg | De punkter den nævner vælges på planen, som om du havde valgt dem selv | Rediger |
| Nye opmålingspunkter | Punkter tilføjet med de numre den angiver, eller de næste ledige. Hvert kald er ét trin du kan fortryde | Rediger |
| Gem | CivilCraft's egen {{ui:Gem}} | Gem |
| LandXML eller DWG | De samme filer som knapperne {{ui:LandXML}} og {{ui:DWG}} | Eksportér |
| Byggegrunden i 3D | OpenUSD (.usdz, .usda eller .usdc) af terrænet, den planerede overflade, byggeplateauer og rør, som 3D-visningen eksporterer dem | Eksportér |
| Planter og plantelisten | Planter fundet i plantelisten under et hvilket som helst navn, og plantelistens antal | Læs |
| Beplantning og planering | Planter, et bed eller en hæk placeret, eller en platform, banket, grøft eller planeringsområde tilføjet, hvert trin kan fortrydes, med dets udgravning og opfyld | Rediger |
| En vandingskontrol | Hver zones flow, trykket der kræves ved dens ventil og ved forsyningen, den værste trykhøjde, køretider, problemer og stykliste, som et beregningshjælpemiddel som en vandingsdesigner kontrollerer | Læs |

Den arbejder med den åbne byggegrund. I Studio kan den også gemme og eksportere til mapper du vælger (nedenfor); uden en mappe downloades dens filer, ligesom knapperne gør.

## Slå den til

Assistenter når CivilCraft via CadCraft Studio på din computer; almindelig browser har ingen adgang.

1. Åbn {{ui:Indstillinger}} og vælg fanen **CivilCraft**.
2. Under **Assistenter** sæt flueben i **Lad AI-assistenter og scripts bruge CivilCraft**.
3. **Læs** er sat til dig. Sæt flueben i **Rediger**, **Gem** eller **Eksportér** kun når assistenten har brug for det.
4. For at lade den gemme og eksportere til en mappe, vælg {{ui:Tilføj en mappe…}} under **Mapper den må bruge** og vælg mappen i Studios dialog. {{ui:Fjern}} tager den tilbage med det samme; enhver anden sti afvises.
5. Forbind assistenten i Studio (Studio viser adressen og de indstillinger du indsætter i den).

## Mens en assistent er forbundet

En note øverst i højre panel siger hvilken assistent der er forbundet, og hvad den kan. Klik på {{ui:Afbryd}} for at afslutte dens session med det samme; den skal forbinde igen for at fortsætte.

**Aktivitet**, under **Assistenter** i Indstillinger, viser hvert kald assistenten har lavet, nyeste først, og om det lykkedes.

:::tip
Spørg med almindelige ord, for eksempel »hvad er terrænkoten hver 50 fod langs Hovedgaden?«, »hvor meget udgravning og opfyld har byggeplateauerne brug for?« eller »tilføj et kontrolpunkt på disse koordinater«. Assistenten læser byggegrunden og svarer, eller foretager ændringen som ét trin du kan fortryde.
:::

## Uden at åbne CivilCraft

CadCraft-filserveren for assistenter (`npx @getcadcraft/mcp`) og kommandolinjen `cadcraft` åbner gemte CivilCraft-projekter (`.civilcraft.json`) og punktfiler med CivilCraft's egen kode, uden vindue: de samme læseværktøjer, tilføjelse af punkter, gemning af projektet, LandXML og byggegrunden i 3D som OpenUSD. `cadcraft convert site.civilcraft.json site.xml` skriver LandXML fra kommandolinjen. Åbning af LandXML, DWG-eksporten og Landskabs-arbejdsområdets værktøjer kræver stadig CivilCraft-vinduet.

## Slå den fra

Fjern fluebenet i **Lad AI-assistenter og scripts bruge CivilCraft**. Hver assistent afbrydes med det samme, og indstillingen gemmes til næste gang.

## Se også

- [Opskrifter til AI-assistenter](common:assistants-recipes): arbejdseksempler, hvert med de værktøjer det kalder.
- [Læg et vandret tracé ud](topic:alignment)
- [Opbyg og finjustér overfladen](topic:build-surface)
- [Vælg, kopiér og indsæt opmålingspunkter](topic:copy-paste-points)
- [CivilCraft-indstillinger](topic:settings)
