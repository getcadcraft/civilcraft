---
title: Vanningsdesign
summary: Et beregningshjelpemiddel, ikke en godkjent design: hoder, grenrør, hovedledning, ventiler og dryppslanger på tomten; soner funnet fra rørene; trykktap etter Hazen–Williams, dimensjonerende hode, flyt og trykk mot forsyningen, nedbørintensitet, kjøretider, dekning og stykkliste.
keywords: vanning, sprinkler, sprinklere, sprøyte, rotor, roterende dyse, bobler, drypp, dryppslange, dripper, ventil, sone, stasjon, styreenhet, hovedledning, grenrør, tilkoblingspunkt, vannforsyning, trykk, psi, kpa, flyt, gpm, friksjonstap, hazen williams, nedbørintensitet, kjøretid, dekning, hode mot hode, stykkliste
from: 7d6342c1
---

:::warning
Dette er et beregningshjelpemiddel, ikke en godkjent design: en vanningsprosjekterende kontrollerer hvert resultat før noe bygges.
:::

## Legg ut systemet

1. I delen **{{ui:Vanning}}** til venstre velger du **Hode**, dets **Sektor** og hvor sektoren starter, samt rørdimensjonene for grenrør og hovedledning.
2. {{ui:Vanning}} › {{ui:Tilkoblingspunkt}}: klikk der vannforsyningen kobles inn. Sett **trykk**, tilgjengelig **flyt** og måler- og tilbakeslagstap i Egenskaper.
3. {{ui:Vanning}} › {{ui:Ventil}}: klikk der hver sones ventil skal være. En ventil starter en sone.
4. {{ui:Vanning}} › {{ui:Hode}}: klikk for å plassere hoder; hvert klikk plasserer ett.
5. {{ui:Vanning}} › {{ui:Grenrør}}: klikk fra en ventil gjennom hodene og trykk {{key:Enter}}. {{ui:Hovedledning}}: fra tilkoblingspunktet til hver ventil.

Rørender fester seg til hoder, ventiler, forsyningen og andre rørender, så nettverket henger sammen. En sone er alt som nås fra ventilen langs grenrørene; hovedledningen bærer én sone om gangen.

## Drypp

{{ui:Vanning}} › {{ui:Dryppslange}}: klikk langs linjen, og start der den mates (en grenrørsende eller en ventil). Sett **dryppflyt** og **avstand** i Egenskaper; flyten er summen av drypperne langs den.

## Kontrollen

{{ui:Vanning}} › {{ui:Kontroller anlegget…}} lister hver sone:

| Kolonne | Slik beregnes den |
|---|---|
| Flyt | Hodenes flyt (og dryppslangenes) lagt sammen |
| Ved ventilen | Dimensjonerende hode sitt arbeidstrykk pluss rørtapene dit (Hazen–Williams, rørets innvendige diameter, høydeendringen) og tapet gjennom ventilen |
| Ved forsyningen | Det samme pluss hovedledningens tap som bærer den sonen, og måler- og tilbakeslagstap |
| Nedbør | Hodenes flyt over arealet de vanner ved hode-mot-hode-avstand |
| Minutter per uke | For å bruke innstillingen **Vann per uke** |
| Problemer | Hastighet over grensen, et hode utenfor trykkområdet sitt, sprinklere og rotorer på én ventil, for lite trykk eller flyt ved forsyningen, hoder uten sone, sløyfer |

Velg en ventil for å se sonens tall og dens dimensjonerende hode ringet inn på planen. Stykklisten teller hoder etter type og sektor, rør etter dimensjon, ventiler, dryppslanger og dryppere, og styreenhetens stasjoner. **Lagre som CSV** tar med begge.

Innstillingene i delen Vanning er **Hazen–Williams C** (150 for nytt plastrør), den **raskeste flyten** i et rør (1.5 m/s), **tapet gjennom en ventil** og **vann per uke**. De er merkede standardverdier.

## Dekning

{{ui:Vanning}} › {{ui:Vis dekning}} viser hvor mye av arealet hodene lar være tørt, hvor mye to eller flere hoder vanner, og hvilke hoder som ikke når en nabo (hode-mot-hode-avstand).

## Hoder

Hodene som vises er **generiske** typer skrevet av CadCraft ut fra dimensjonerende nedbørintensitet (faste sprinkler, roterende dyser, tannhjulsrotorer, boblere, mikrosprinkler, dryppere), ikke noen produsents produkter. **Legg til hoder fra en fil…** leser dine egne hoder (en JSON-liste med kastlengde, flyt eller nedbørintensitet, og trykkområde for hvert hode); de lagres sammen med prosjektet. En produsents publiserte data legges inn bare med den produsentens registrerte tillatelse.

Under de generiske hodene har listen **typiske hoder** (navnene slutter på "typiske verdier"): dysestørrelser for faste sprinkler, roterende dyser og tannhjulsrotorer, mikrosprinkler, boblere og dryppere, med en radius, en flyt og et trykkområde. CadCraft beregner dem fra publisert matematikk (åpningsligningen for flyt, skaleringen av kastlengde for radius) og nominelle flytklasser, kun fra åpne kilder; ingen produsenttabell er kopiert. Velg ett, så viser velgeren grunnlaget og lisensen. Et prosjekt som bruker ett, beholder hodet og kilden i prosjektfilen. De er til planlegging: kontroller det virkelige hodets egne data før bygging.
