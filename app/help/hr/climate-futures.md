---
title: "Klimatske projekcije: poplave, vrućina i šumski požari 2050. i 2080."
summary: U Teren › Više › Od adrese do lokacije postavite razinu poplave za buduću klimu, procijenite izloženost šumskom požaru i preoblikujte vremensku datoteku te prikažite sadašnje uz buduće, iz paketa klimatskih podataka (SSP2-4.5 i SSP5-8.5, 2050. i 2080.).
keywords: klima, klimatske promjene, budućnost, 2050, 2080, ssp, cmip6, scenarij, razina mora, poplava, bazna kota poplave, bfe, fema, vrućina, vremenska datoteka, epw, morph, požar, šumski požar
from: b0d2ee38
---

Klimatske brojke dolaze iz **paketa podataka**, a ne iz aplikacije. Uključite dodatak {{ui:Klimatske projekcije}} u Postavke › Dodaci ili učitajte vlastitu datoteku paketa u bloku {{ui:Klimatska budućnost}}.

:::warning
Paket koji dolazi uz dodatak je **uzorak**: tri mjesta (Denver, Miami, Johannesburg), jedan klimatski model i pet godina u svakom 20-godišnjem razdoblju. Služi za isprobavanje alata, **ne za projektiranje**. Potpuni paket izrađuje se alatom `tools/climate/build-pack.mjs` iz podataka NASA NEX-GDDP-CMIP6.
:::

## Gdje je

Teren › Više › Od adrese do lokacije. Postavite točku, dodajte slojeve (FEMA sloj poplave daje baznu kotu poplave) i pritisnite gumb koji čita lokaciju. Ispod redaka lokacije nalazi se blok {{ui:Klimatska budućnost}}: odaberite **Scenarij** (SSP2-4.5 ili SSP5-8.5) i **Godinu** (2050 = 2041-2060, 2080 = 2071-2090, obje u odnosu na 1995-2014). Koristi se mjesto iz paketa najbliže točki ili ono koje odaberete; daleko od svih mjesta koriste se globalne prosječne promjene, a ploča to kaže.

## Projektna razina poplave

Sadašnja razina je FEMA-ina bazna kota poplave ako je sloj poplave imao jednu (stope, NAVD 88), inače upišite vlastitu. Odaberite vrstu poplave (obalna, rječna ili jaka kiša, ili obje), dubinu poplave na lokaciji za dio od oborina te slobodnu visinu (freeboard) ako želite. {{ui:Podigni razinu poplave}} prikazuje sadašnju i buduću razinu jednu uz drugu, dijelove od razine mora i oborina te pretpostavke: cijeli porast razine mora dodaje se obalnoj razini; protok rijeke raste jedan prema jedan s oborinama najkišovitijeg dana, a dubina slijedi protok na potenciju 0.6 (Manning, široko korito); dijelovi se zbrajaju.

:::warning
Procjena promjene, a ne studija poplava. Projektnu razinu poplave određuje nadležno tijelo ili vaš inženjer.
:::

## Izloženost šumskom požaru (samo procjena)

Najbliža vegetacija, nagib uzbrdo od nje i udaljenost daju pojas od vrlo niskog do ekstremnog, sadašnji i budući (budući množi promjenu indeksa vremena za požar iz paketa). **Samo procjena:** naša vlastita relativna ljestvica kojom se vidi treba li lokacija pravu procjenu šumskog požara; nije ocjena prema propisu.

## Vrućina: buduća vremenska datoteka

Odaberite sadašnju `.epw` datoteku i {{ui:Izradi buduću vremensku datoteku}}: ona se preoblikuje objavljenom metodom pomaka i rastezanja (Belcher, Hacker i Powell 2005) te se vrućina uspoređuje (srednja i najviša temperatura, projektne temperature, sati iznad 30 °C i 35 °C, stupanj-dani). {{ui:Spremi buduću vremensku datoteku}} sprema je za ploču Okoliš, za provjeru energije u programu BimCraft ili za vaše vlastite alate.

## Odakle brojke

NASA NEX-GDDP-CMIP6 (smanjeni prostorni prikaz izlaza CMIP6 modela, CC BY 4.0 po modelu) za temperaturu, vlažnost, sunčevo zračenje, oborine i vremenske uvjete za požar; globalna srednja vrijednost IPCC AR6 za porast razine mora, osim ako paket nosi lokalne podatke. Ploča prikazuje izvor, licenciju i datum paketa.
