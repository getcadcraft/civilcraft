---
title: La en KI-assistent jobbe med tomten
summary: Slå på assistenter i Innstillinger, slik at en assistent på datamaskinen din kan lese den åpne tomten (punkter, terrengmodeller, volumer, profiler, eiendommer), legge til oppmålingspunkter, lagre og eksportere LandXML eller DWG, gjennom CadCraft Studio. Av til du slår den på.
keywords: ki, assistent, mcp, skript, automatisering, studio, punkter, høyde, profilnummer, forskyvning, veglinje, volum, skjæring, fylling, lengdeprofil, eiendom, landxml, dwg, usd, mapper, tillatelser, koble fra, aktivitet
from: d0356582
---

## Hva dette dekker

Hvordan en KI-assistent (enhver assistent som snakker MCP) kan jobbe med tomten som er åpen, hva den kan og ikke kan gjøre, og hvordan den stoppes.

## Hva en assistent kan gjøre i CivilCraft

| Den ber om | Den får | Krever |
|---|---|---|
| Tomten | Navn, enheter, koordinatsystem, punktgrupper, veglinjer, terrengmodeller, byggeplater, eiendommer og rør | Lese |
| Oppmålingspunkter | Nummer, øst, nord, høyde og beskrivelse, etter gruppe, etter beskrivelse eller innenfor en boks | Lese |
| Terrenghøyder | Det eksisterende terrenget (eller det planerte) i alle punktene den nevner | Lese |
| Profilnummer og forskyvning | Profilnummer og forskyvning for punkter langs en veglinje, eller koordinatene og terrenghøyden for profilnumre | Lese |
| En profil | Høyder for terreng, prosjektert profil og planert terreng langs en veglinje, hver så mange fot eller meter | Lese |
| Skjæring og fylling | Volumer mellom eksisterende terreng og planert terreng (hver byggeplate og korridor også), eller mellom terrenget og et nivå | Lese |
| Eiendommer | Hjørner, areal (med acres eller hektar), omkrets og den juridiske beskrivelsen | Lese |
| Et utvalg | Punktene den nevner velges i planen, som om du hadde valgt dem | Redigere |
| Nye oppmålingspunkter | Punkter lagt til med nummerene den gir, eller de neste ledige. Hvert kall er ett steg du kan angre | Redigere |
| Lagre | CivilCraft sin egen {{ui:Lagre}} | Lagre |
| LandXML eller DWG | De samme filene som knappene {{ui:LandXML}} og {{ui:DWG}} | Eksporter |
| Tomten i 3D | OpenUSD (.usdz, .usda eller .usdc) av terrenget, det planerte terrenget, byggeplatene og rørene, slik 3D-visningen eksporterer dem | Eksporter |
| Planter og planteliste | Planter som finnes i plantelisten under et hvilket som helst navn, og antallene i planteliste | Lese |
| Planting og terrengforming | Planter, et bed eller en hekk plassert, eller en plattform, voll, grøft eller et terrengområde lagt til, hver ett steg du kan angre, med dens skjæring og fylling | Redigere |
| En vanningskontroll | Hver sones vannføring, trykket som trengs ved ventilen og ved forsyningen, den verste trykkhøyden, kjøretider, problemer og materialliste, som en beregningshjelp som en vanningsprosjekterer kontrollerer | Lese |

Den virker med tomten som er åpen. I Studio kan den også lagre og eksportere til mapper du velger (se under); uten en mappe lastes filene ned slik knappene gjør.

## Slå den på

Assistenter når CivilCraft via CadCraft Studio på datamaskinen din; den vanlige nettleseren har ingen vei inn.

1. Åpne {{ui:Innstillinger}} og velg fanen **CivilCraft**.
2. Under **Assistenter** krysser du av for **La KI-assistenter og skript bruke CivilCraft**.
3. **Lese** er avkrysset for deg. Kryss av for **Redigere**, **Lagre** eller **Eksporter** bare når assistenten trenger dem.
4. For å la den lagre og eksportere til en mappe, velg {{ui:Legg til en mappe…}} under **Mapper den kan bruke** og velg mappen i Studios dialogboks. {{ui:Fjern}} tar den tilbake med én gang; enhver annen bane avvises.
5. Koble assistenten til i Studio. Studio viser adressen og innstillingene som skal limes inn i den.

## Mens en assistent er koblet til

En merknad øverst i høyre panel sier hvilken assistent som er koblet til, og hva den kan gjøre. Klikk {{ui:Koble fra}} for å avslutte økten med én gang; den må koble til på nytt for å fortsette.

**Aktivitet**, under **Assistenter** i Innstillinger, lister hvert kall assistenten gjorde, nyeste først, med om det virket.

:::tip
Spør med vanlige ord, for eksempel «hva er terrenghøyden hver 50. fot langs Main Street?», «hvor mye skjæring og fylling trenger byggeplatene?» eller «legg til et kontrollpunkt på disse koordinatene». Assistenten leser tomten og svarer, eller gjør endringen som ett steg du kan angre.
:::

## Uten å åpne CivilCraft

CadCraft-filserveren for assistenter (`npx @getcadcraft/mcp`) og kommandolinjen `cadcraft` åpner lagrede CivilCraft-prosjekter (`.civilcraft.json`) og punktfiler med CivilCrafts egen kode, uten vindu: de samme lesverktøyene, å legge til punkter, lagre prosjektet, LandXML og tomten i 3D som OpenUSD. `cadcraft convert site.civilcraft.json site.xml` skriver LandXML fra kommandolinjen. Åpning av LandXML, DWG-eksporten og verktøyene i arbeidsområdet Landskap krever fortsatt CivilCraft-vinduet.

## Slå den av

Fjern haken for **La KI-assistenter og skript bruke CivilCraft**. Hver assistent kobles fra med én gang, og innstillingen lagres til neste gang.

## Se også

- [Oppskrifter for KI-assistenter](common:assistants-recipes): arbeidseksempler, hver med verktøyene den kaller.
- [Legg ut en horisontal veglinje](topic:alignment)
- [Bygg og finjuster terrengmodellen](topic:build-surface)
- [Velg, kopier og lim inn oppmålingspunkter](topic:copy-paste-points)
- [CivilCraft-innstillinger](topic:settings)
