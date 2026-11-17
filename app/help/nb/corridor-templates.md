---
title: Korridormaler og terrengmaler
summary: Lag små gjenbrukbare maler (kantstein og renne, fortau, mur, grøft), bygg en korridor av dem etter stasjon med venstre og høyre side hver for seg, del en veglinje i flere korridorer, og legg lagdelte materialer over et terreng.
keywords: mal, maler, malbibliotek, malopprettelse, typisk tverrprofil, sammenstilling, delsammenstilling, komponenter, punktkoder, sluttbetingelse, dagslinje, grøft, støttemur, kantstein, renne, fortau, områder, stasjonsområde, flere korridorer, venstre og høyre, terrengmal, toppjord, overbygning, underlag, legge over, materialer, mengder
from: ce70e58b
---

En **mal** er et lite tverrsnitt du tegner én gang og gjenbruker: punkter med forskyvninger, helninger og punktkoder, og komponenter med materialer. En korridor kan bygges av maler etter stasjon, der hver side har sine egne overbygningsmaler og sin egen sluttbetingelse, og de samme malene kan legges over et terreng.

:::warning
Eksempelmalene er plassholdere å starte fra. Tallene deres er ikke hentet fra noen standard eller etat. En ingeniør må kontrollere hver mal, og hver verdi du gir den, før den brukes i en prosjektering.
:::

## Åpne malene

Åpne {{ui:Terrengmodell}} › {{ui:Mer}} › {{ui:Korridormaler…}} (eller skriv {{cmd:TEMPLATES}}). Vinduet har tre lister:

- **I dette prosjektet**: malene prosjektets korridorer og terrengmaler bruker. De lagres i prosjektfilen.
- **Mitt bibliotek**: maler som ligger i denne nettleseren og tilbys i alle prosjekter. Bruk {{ui:Lagre i Mitt bibliotek}} på en prosjektmal for å beholde den.
- **Eksempler**: to kjørefelt med lag, kantstein og renne, fortau, dagslinje, grøft, støttemur, toppjord under terrenget, og overbygning på terrenget. Hver er merket «For kontroll av en ingeniør».

{{ui:Bruk i dette prosjektet}} kopierer en bibliotek- eller eksempelmal inn i prosjektet. {{ui:Eksporter malene i dette prosjektet}} lagrer dem som en `.cctemplates.json`-fil, og {{ui:Importer en fil}} leser en slik fil inn i prosjektet og i Mitt bibliotek. Bruk filen til å dele maler eller flytte dem til en annen datamaskin.

## Lag en mal

{{ui:Ny mal}} (eller {{ui:Rediger}} på en prosjektmal) åpner malredigeringen. Tegn høyre side, utover fra malens 0,0-punkt. Venstre side bruker samme mal utover til venstre.

1. Gi den et navn og en type: **Overbygning** (neste mal fester seg i enden), **Sluttbetingelse** (den møter terrenget) eller **Terrengmal**.
2. Legg til **verdier**: navngitte tall, for eksempel en bredde `w` eller en helning `s`. Et tallfelt hvor som helst i malen tar et tall eller navnet på en verdi. `-t` er verdien `t` gjort negativ. En korridor kan gi hver bruk av malen egne verdier, slik at én kantsteinsmal dekker alle kantsteinshøyder.
3. Legg til **punkter** i rekkefølge. Hvert plasseres fra et tidligere punkt (eller 0,0-punktet) etter sin betingelse:

| Betingelse | Plasserer punktet |
|---|---|
| Forskyvning i en helning | En forskyvning utover og en helning (stigning per lengde; −0.02 faller 2 %) |
| Forskyvning og stigning | En forskyvning og en stigning |
| Rett opp eller ned | Bare en stigning |
| Sideskråning til terrenget | Ut fra punktet til terrenget, med skjæringsforholdet der terrenget er over og fyllingsforholdet der det er under |
| Til terrenget | En forskyvning, deretter rett opp eller ned til terrenget |
| Støttemur | En mur med tykkelsen du gir: i skjæring møter toppen terrenget ved veikanten, i fylling går veien over den og den ytre flaten faller ned til terrenget |

   Kryss av **Topp** for punktene den ferdige overflaten går gjennom. Det siste toppunktet er der neste mal på den siden starter. Et **Mål** lar en korridor flytte punktet: forskyvningen eller høyden kommer fra en linje.
4. Legg til **komponenter**: lukkede figurer gjennom punktkoder (`0` er 0,0-punktet), hver med et navn, et materiale og en type. Arealene deres gir volumene.

Tegningen følger hver endring i riktig målestokk, og listen under den sier hva som er galt: et punkt som møter terrenget før slutten, en verdi malen ikke har, en komponent uten areal. {{ui:Legg til i dette prosjektet}} eller {{ui:Lagre}} beholder den, som én angrehandling.

## Bygg en korridor av maler

Velg en veglinje med en korridor, og slå på {{ui:Bygg etter maler per stasjon}} i egenskapene. Korridoren starter med eksemplene for to kjørefelt og dagslinje på begge sider.

- **Områder.** Hvert område starter ved en stasjon og går til neste områdes start. {{ui:Legg til et område}} legger til ett; endre startstasjonen i boksen.
- **Venstre og høyre hver for seg.** Hver side i hvert område har sin egen liste **Overbygning**, fra senterlinjen utover, og sin egen **Sluttbetingelse**: dagslinje, en grøft, en mur, eller en hvilken som helst mal som møter terrenget. Uten sluttbetingelse ender siden i korridorens skjærings- og fyllingshelninger. {{ui:Kopier fra venstre til høyre}} kopierer en side.
- **Verdier og mål.** Under hver mal på en side: en boks per verdi (tom = malens egen verdi), og for et punkt som tar et mål, linjen (formlinjen eller en annen korridors linje) som flytter det.
- **Fra og Til** begrenser korridoren til en del av veglinjen.

Snitt, planlinjene for hver punktkode, den prosjekterte terrengmodellen, utsetting og jordarbeider følger alle med. Egenskaper lister hver komponents volum per side og område (gjennomsnittlig endeareal langs senterlinjen). Overhøyde og korridorens kantmål brukes ikke mens korridoren bygges av maler.

## Flere korridorer på én veglinje

Under **Korridorer på denne veglinjen** legger {{ui:Legg til en korridor}} til en korridor på resten av veglinjen. Den første korridoren får en sluttstasjon i midten (eller beholder sin egen), og den nye starter der med den første korridorens siste område av maler. Hver korridor har sitt eget navn, stasjonsområde, maler og jordarbeider. Slå av en med boksen {{ui:På}}. Der to områder overlapper, legger den senere korridoren seg over den tidligere.

## Terrengmaler

En terrengmal legger lagene i en mal over et terreng fra 0,0-punktet: et lag under 0,0-punktet går ned i terrenget (toppjord som skal fjernes), et lag over det ligger på terrenget (underlag og overbygning på en parkeringsplass). Bredder og helninger betyr ikke noe, bare dybden over eller under 0,0-punktet for hver komponent.

Åpne {{ui:Terrengmodell}} › {{ui:Mer}} › {{ui:Terrengmaler…}} (eller skriv {{cmd:TERRAINTEMPLATES}}). Blokken finnes også i prosjektets egenskaper. {{ui:Legg til en terrengmal}} legger til en med toppjordeksemplet. For hver velger du:

- **malen** (verdiene kan endres for denne)
- **terrenget**: det eksisterende terrenget eller den prosjekterte terrengmodellen
- **formen** som klipper den: hele terrenget, en eiendom, en byggeplate eller en lukket formlinje. Flere terrengmaler kan bruke ulike former på samme terreng.

Hvert lag lister tykkelse, planareal og volum. Volumet er planarealet ganger tykkelsen, der tykkelsen måles rett ned. Arealet måles på et rutenett, og det skråstilte arealet oppgis også. Formene tegnes på planen på laget C-TOPO-TMPL. Terrengmaler endrer ikke den prosjekterte terrengmodellen.

## Materialer og mengder

Prosjektets **Jordarbeider**-blokk lister **Materialer fra maler**: hver korridorkomponent og hvert terrengmallag, med sitt volum. {{ui:Send til TakeoffCraft}} skriver dem inn i mengdefilen etter skjæring og fylling, ett punkt hver, i kubikkyard (fotprosjekter) eller kubikkmeter.

## Filer

Maler, områder, de ekstra korridorene og terrengmalene lagres i prosjektfilen. Et prosjekt som ikke bruker noen av dem, lagres akkurat som før. Eldre CivilCraft-versjoner åpner et prosjekt som bruker dem (de ignorerer malene og bygger korridorens egen sammenstilling).
