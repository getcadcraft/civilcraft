---
title: "Klimatske projekcije: poplave, vrućina i požar za 2050. i 2080."
summary: U Od adrese do lokacije podigni projektni nivo poplave lokacije za buduću klimu, procijeni izloženost požaru i prilagodi vremensku datoteku, sadašnju u buduću, iz paketa klimatskih podataka (SSP2-4.5 i SSP5-8.5, 2050. i 2080.).
keywords: klima, klimatska promjena, budućnost, 2050, 2080, ssp, cmip6, scenario, nivo mora, poplava, nivo bazne poplave, bfe, fema, vrućina, vremenska datoteka, epw, morph, požar, šumski požar
from: b0d2ee38
---

Klimatske brojke dolaze iz **paketa podataka**, a ne iz same aplikacije. Uključi dodatak {{ui:Klimatske projekcije}} u Postavke › Dodaci, ili učitaj paket datoteku po svom izboru u bloku {{ui:Klimatska projekcija}}.

:::warning
Paket koji dolazi uz dodatak je **uzorak**: tri mjesta (Denver, Miami, Johannesburg), jedan klimatski model, pet godina u svakom 20-godišnjem periodu. Tu je da isprobaš alate, **ne za projektovanje**. Puni paket gradi se sa `tools/climate/build-pack.mjs` iz NASA-inih NEX-GDDP-CMIP6 podataka.
:::

## Gdje je

Surface › More › Od adrese do lokacije. Postavi tačku, dodaj slojeve (FEMA sloj poplave daje nivo bazne poplave) i pritisni dugme koje čita lokaciju. Ispod redova lokacije nalazi se blok {{ui:Klimatska projekcija}}: izaberi **Scenario** (SSP2-4.5 ili SSP5-8.5) i **Godinu** (2050 = 2041–2060, 2080 = 2071–2090, oba u odnosu na 1995–2014). Koristi se mjesto paketa najbliže tački, ili ono koje izabereš; daleko od svih mjesta koriste se globalne prosječne promjene, i panel to kaže.

## Projektni nivo poplave

Sadašnji nivo je FEMA-in nivo bazne poplave kad sloj poplave ga ima (u stopama, NAVD 88), inače upiši svoj. Izaberi tip poplave (obalna, rječna ili jaka kiša, ili oba), dubinu poplave na lokaciji za dio sa kišom, i slobodnu visinu ako želiš. {{ui:Podigni nivo poplave}} prikazuje sadašnji i budući nivo jedan pored drugog, dijelove nivoa mora i kiše, i pretpostavke: cijeli porast nivoa mora dodaje se obalnom nivou; protok rijeke raste jedan naprema jedan sa kišom najmokrijeg dana, a dubina prati protok na snagu 0.6 (Manning, široki kanal); dijelovi se sabiraju.

:::warning
Procjena promjene, a ne studija poplave. Projektni nivo poplave je određuje nadležni organ ili tvoj inženjer.
:::

## Izloženost požaru (samo procjena)

Najbliža vegetacija, nagib uzbrdo od nje i udaljenost daju pojas od vrlo niskog do ekstremnog, sadašnji i budući (budući množi promjenu indeksa vremenskih uslova za požar iz paketa). **Samo procjena:** naša vlastita relativna skala da vidiš treba li lokaciji pravo ispitivanje izloženosti požaru; nije ocjena po propisu.

## Vrućina: buduća vremenska datoteka

Izaberi sadašnju `.epw` datoteku i {{ui:Napravi buduću vremensku datoteku}}: ona se prilagođava objavljenom metodom pomjeranja i rastezanja (Belcher, Hacker i Powell 2005), i vrućina se upoređuje (srednja i najtoplija temperatura, projektne temperature, sati iznad 30 °C i 35 °C, stepen-dani). {{ui:Spasi buduću vremensku datoteku}} je spašava za panel Okruženje, BimCraftovu provjeru energije ili tvoje vlastite alate.

## Odakle brojevi

NASA NEX-GDDP-CMIP6 (izlaz CMIP6 modela smanjen na lokalnu skalu, CC BY 4.0 po modelu) za temperaturu, vlažnost, sunčevu svjetlost, kišu i vremenske uslove za požar; globalni prosjek IPCC AR6 za porast nivoa mora, osim ako paket nosi lokalne podatke. Panel prikazuje izvor paketa, licencu i datum.
