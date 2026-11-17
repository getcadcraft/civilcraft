---
title: "Klimatske projekcije: poplava, toplota i šumski požar za 2050. i 2080."
summary: U Adresi do lokacije podignite nivo poplave lokacije za buduću klimu, proverite izloženost šumskom požaru i preoblikujte vremensku datoteku, prikažite sadašnje uz buduće, iz paketa klimatskih podataka (SSP2-4.5 i SSP5-8.5, 2050. i 2080.).
keywords: klima, klimatske promene, budućnost, 2050, 2080, ssp, cmip6, scenario, nivo mora, poplava, osnovna visina poplave, bfe, fema, toplota, vremenska datoteka, epw, morfovanje, šumski požar, požar u žbunju
from: b0d2ee38
---

Klimatski podaci dolaze iz **paketa podataka**, a ne iz aplikacije. Uključite dodatak {{ui:Klimatske projekcije}} u Podešavanja › Dodaci, ili učitajte sopstvenu datoteku paketa u bloku {{ui:Klimatska budućnost}}.

:::warning
Paket koji dolazi uz dodatak je **uzorak**: tri mesta (Denver, Majami, Johanesburg), jedan klimatski model, pet godina u svakom periodu od 20 godina. Namenjen je da isprobate alate, **ne za projektovanje**. Pun paket se pravi sa `tools/climate/build-pack.mjs` iz NASA-inih podataka NEX-GDDP-CMIP6.
:::

## Gde je

Površina › Više › Adresa do lokacije. Postavite tačku, dodajte slojeve (FEMA sloj poplave daje osnovnu visinu poplave) i pritisnite dugme koje čita lokaciju. Ispod redova lokacije nalazi se blok {{ui:Klimatska budućnost}}: izaberite **Scenario** (SSP2-4.5 ili SSP5-8.5) i **Godina** (2050 = 2041–2060, 2080 = 2071–2090, oba u odnosu na 1995–2014). Koristi se mesto iz paketa najbliže tački, ili ono koje izaberete; daleko od svakog mesta koriste se globalne prosečne promene, a panel to kaže.

## Projektni nivo poplave

Sadašnji nivo je FEMA-ina osnovna visina poplave kada je sloj poplave imao jednu (stope, NAVD 88), inače upišite svoju. Izaberite vrstu poplave (obalna, rečna ili jaka kiša, ili obe), dubinu poplave na lokaciji za deo koji se odnosi na kišu, i sigurnosnu visinu ako je želite. {{ui:Podigni nivo poplave}} prikazuje sadašnji i budući nivo jedan pored drugog, delove koji se odnose na nivo mora i na kišu, i pretpostavke: ceo porast nivoa mora dodaje se obalnom nivou; protok reke raste jedan prema jedan sa kišom na najkišniji dan, a dubina prati protok na stepen 0.6 (Manning, široki kanal); delovi se sabiraju.

:::warning
Procena promene, a ne studija poplave. Projektni nivo poplave je odluka nadležnog organa ili vašeg inženjera.
:::

## Izloženost šumskom požaru (samo procena)

Najbliža vegetacija, uspon terena od nje i rastojanje daju pojas od veoma niskog do ekstremnog, sadašnji i budući (budući množi promena indeksa vremena za požar iz paketa). **Samo procena:** naša sopstvena relativna skala da se vidi da li lokacija treba pravu procenu šumskog požara; nije kodna ocena.

## Toplota: buduća vremenska datoteka

Izaberite sadašnju `.epw` datoteku i kliknite {{ui:Napravi buduću vremensku datoteku}}: ona se preoblikuje objavljenim postupkom pomeranja i istezanja (Belcher, Hacker i Powell 2005), a toplota se poredi (srednja i najtoplija temperatura, projektne temperature, sati iznad 30 °C i 35 °C, stepen-dani). {{ui:Sačuvaj budućnu vremensku datoteku}} čuva je za panel Okruženje, BimCraft-ovu proveru energije ili vaše sopstvene alate.

## Odakle dolaze brojevi

NASA NEX-GDDP-CMIP6 (smanjeni izlaz CMIP6 modela, CC BY 4.0 po modelu) za temperaturu, vlažnost, sunčanje, kišu i vremenske uslove za požar; IPCC AR6 globalni prosek za porast nivoa mora, osim ako paket nosi lokalne podatke. Panel prikazuje izvor, licencu i datum paketa.
