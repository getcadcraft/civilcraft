---
title: Planlegging av parkeringsanlegg
summary: Legg ut parkeringsplasser, kjørefelt, plasser for funksjonshemmede og varebiler, og øyer innenfor en omriss; bygg terrenget med fall til sluk mot eksisterende terreng; belegg og beplant det deretter. Også tilgjengelig for en assistent.
keywords: parkering, parkeringsanlegg, parkeringsplass, kjørefelt, funksjonshemmede, ada, varebil, øy, sluk, fall, terrengforming, skjæring, fylling, belegning, steinbelegg, beplantning, trær, terreng, punktsky, mcp, assistent
from: 06c14da9
---

Tilpass et parkeringsanlegg til en eiendom, en byggeplate eller en lukket bruddlinje, og få tellingene, terrengformingen og belegget i ett trinn.

## Planlegg det

1. Velg en eiendom, en byggeplate eller en lukket bruddlinje på planen.
2. Åpne **Terrengmodell, Mer, Parkeringsplass...**
3. Velg reglene, parkeringsvinkelen (90, 75, 60, 45, 30 grader eller parallell) og enveis- eller toveis kjørefelt. Størrelsene på parkeringsplassene, kjørefeltene og øyene starter fra tabellen, og hver av dem kan skrives over.
4. Velg **Planlegg**.

Radene går langs den kanten av omrisset som gir flest parkeringsplasser (eller i vinkelen du skriver inn). En parkeringsplass teller bare hvis den ligger helt innenfor omrisset. Der det er plass til én rad og et kjørefelt, legges et enkeltbelastet bånd til. Vinduet lister opp parkeringsplasser, plasser for funksjonshemmede og varebiler, øyer, sluk og arealet per plass. Planen viser parkeringsplassene, plassene for funksjonshemmede med sine skraverte atkomstfelt, øyene, senterlinjene for kjørefeltene og slukene på egne lag (C-PARK-...), slik at de kommer med til PDF, DXF og DWG.

## Plasser for funksjonshemmede

Med de amerikanske reglene følger antallet tabell 208.2 i 2010 ADA Standards for de plassene som tilbys (én av seks, avrundet oppover, er en varebilplass), plassert nærmest det første hjørnet i omrisset (inngangen), hver med et atkomstfelt; to deler ett. En parkeringsplass smalere enn bredden for funksjonshemmede, eller et fall brattere enn 1:48 på plasser for funksjonshemmede, vises som et problem. **Disse tallene ble skrevet inn fra standarden slik vi husker den, og er ikke kontrollert mot den trykte standarden.** Vanlige størrelser for parkeringsplasser og kjørefelt kommer fra veiledninger for parkeringsdesign og er like lite kontrollert. Kontroller begge, og din lokale forskrift, før du stoler på dem. Velg **Egendefinert** for å skrive inn ditt eget antall plasser for funksjonshemmede.

## Fall til sluk, skjæring og fylling

Med mindre du slår det av, blir anlegget et terrengformingsområde i Landskap-arbeidsområdet. Sluk settes på senterlinjene for kjørefeltene omtrent hver 100 fot (30 m); overflaten stiger fra hvert sluk med fallet du angir (1.5 prosent til å begynne med), slik at hvert punkt faller til sitt nærmeste sluk. Nivået velges slik at anleggets skjæring og fylling går i balanse mot det eksisterende terrenget. Eksisterende terreng er prosjektets eksisterende terrengmodell, som kan komme fra punkter, LandXML, en lidar- eller skannepunktsky gjort om til en terrengmodell, eller høydekurver. Vinduet viser anslaget for skjæring og fylling; prosjektets egne volumer viser det nøyaktige tallet etterpå. Terrengformingsområdet holder kanten sin på det eksisterende terrenget, så der den nye overflaten avviker fra terrenget ved kanten, får du et trinn, og vinduet sier hvor stort det er.

## Belegg og beplantning

Hele omrisset får et steinbelegg (et løpermønster som du kan endre under Landskap, Hardscape), og hver øy får et buskbed og, der den er bred nok, et tre, hentet fra plantelisten. Alt er et vanlig landskapsobjekt etter det: rediger det, eller velg **Planlegg på nytt** for å erstatte det anlegget laget. Fjerner du anlegget, fjernes det det laget.

## Fra en assistent

Det samme anlegget kan bes om over MCP: `parking_layout` forhåndsviser, `parking_build` skriver, og `parking_remove` fjerner et anlegg. Be om det etter eiendomsnavn, eller send omrisset.

## Hva som ikke er gjort

Det sjekkes ikke om kjørefeltene når en vei. Belegget dekker hele omrisset, så arealet inkluderer øyene. Beleggmaterialer fra biblioteket og en bibliotekstype for parkeringsplasser er ikke bygget; mønsteret for belegget er Hardscape-mønsteret. Ingen andre lands regler er bygget.
