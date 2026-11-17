---
title: Beregn regnafstrømninger, rørdimensioner og trykniveaulinjen
summary: Tegn oplandene, der løber til hvert bygværk, læg afstrømningerne sammen nedstrøms i nettet med den rationelle metode, dimensionér rørene med Mannings formel, og se hvor trykniveaulinjen løber fuld eller når terrænet.
keywords: regnvandsafledning, opland, afvandingsareal, rationel metode, afstrømningskoefficient, koncentrationstid, regnintensitet, idf, manning, rørdimensionering, trykniveaulinje, hgl, energilinje, egl, overbelastning, oversvømmelse, udløbsvandstand
from: e44872ec
---

Regnvandsafledning arbejder på [rørnettet](topic:pipe-network): tegn nettet først, og derefter de områder, der afvander til det. Alt vises under **Regnvandsafledning** i højre panel, når intet er valgt.

## Tegn et opland

1. Klik på **Tegn et opland** under **Regnvandsafledning**.
2. Klik på hjørnerne af området, der afvander til ét bygværk. {{key:Enter}} eller et dobbeltklik afslutter; {{key:Backspace}} fjerner det sidste hjørne, {{key:Esc}} stopper.
3. Oplandet afvander til et bygværk inde i det, ellers til det nærmeste. Dets **Egenskaber** åbnes: sæt navn, **Afstrømningskoefficient C** (den andel af regnen, der løber af, 0 til 1), **Koncentrationstid** i minutter og hvilket bygværk det **Afvander til**.

**Tegn et andet opland** i dets Egenskaber starter det næste. Klik inde i et opland på planen for at vælge det; {{key:Delete}} fjerner det. Hver ændring er ét trin: {{key:Mod+Z}} fortryder den.

## Angiv dimensionerende regn

Regnintensiteten er i = a ÷ (tc + b) opløftet i c, i tommer pr. time for et projekt i fod og i millimeter pr. time for et projekt i meter. Tilpas **Intensitet a**, **b** og **c** til din egen intensitet-varighed-frekvenskurve for den gentagelsesperiode, du dimensionerer for.

:::warning
Startkurven for intensiteten, Manning n (0.013) og brøndtab (0.5) er pladsholdere, ikke en standard. Angiv dem ud fra dine egne regndata og dimensioneringskriterier.
:::

- **Kortest koncentrationstid**: intet rør beregnes ved en kortere tid (10 minutter til at starte med).
- **Manning n**: rørenes ruhed.
- **Brøndtab**: det tab af trykhøjde, der sker i hvert bygværk, som en andel af hastighedshøjden V²/2g for røret, der forlader det.
- **Vandstand ved udløbet**: udløbsvandstanden, hvor det sidste rør tømmer sig. Lad feltet stå tomt, når udløbet løber frit.

## Sådan lægges flowene sammen

Hvert rør fører alle oplande ovenfor det. Q = C × i × A, hvor C × A lægges sammen nedstrøms i nettet, og i er intensiteten ved den længste koncentrationstid for det vand, der kommer til: oplandets egen tid, eller tiden fra et opland opstrøms plus gennemløbstiden gennem rørene (længde ÷ hastigheden ved fuld strømning). Q er i kubikfod pr. sekund (A i acres) eller kubikmeter pr. sekund (A i hektar).

## Dimensionér rørene

Tabellen under **Flow og trykniveaulinjer** viser for hvert rør flowet, hvad det fører ved fuld strømning ved sit fald, hastigheden, trykniveauet i dets top og fod, og hvor dybt det strømmer.

**Dimensionér rørene for disse flow** giver hvert rør den mindste standarddimension, der fører dets flow ved sit eget fald (12 til 72 in, eller 300 til 1800 mm). Det er ét trin. Bundkoterne bliver, hvor de er: hvis dimensionerne ændres, brug **Sæt alle bundkoter ud fra reglerne** for at bevare dækningen, og kontrollér derefter tabellen igen.

## Læs trykniveaulinjerne

Trykniveaulinjen (HGL) beregnes fra udløbet og opstrøms:

- Et rør, der strømmer delvist fuldt, har sin HGL ved vandoverfladen: bundkoten plus normaldybden.
- Når vandet nedenfor står højere end rørtoppen, eller røret fører mere, end det kan ved fuld strømning, strømmer det fuldt (overbelastet), og dets HGL stiger med friktionsfaldet over længden.
- Ved hvert bygværk er HGL lig med det afgående rørs HGL i toppen plus brøndtabet.
- Energilinjen (EGL) er HGL plus hastighedshøjden.

Et rør, der strømmer fuldt, er med på listen, og det samme gælder ethvert bygværk, hvor HGL ligger over randen: vandet når op til overfladen dér, og bygværket er markeret med en rød ring på planen. Vælg et rør eller et bygværk for at se dets flow, dybde, hastighed og begge trykniveaulinjer i dets Egenskaber.

## Gennemregn en regnhændelse

Den rationelle metode giver én top for hvert rør. {{ui:Beregn regnhændelsen}} (under resultaterne, i nettets Egenskaber) beregner i stedet hele regnhændelsen: hvert oplands afstrømning over tid, ført ned gennem rørene med deres gennemløbstid og magasinering, og lagt sammen dér, hvor de mødes.

1. Lad {{ui:Regnen varer}} og {{ui:Regnintensitet}} stå tomme for at bruge den længste koncentrationstid og regnkurven ovenfor, eller skriv dine egne.
2. Tryk på {{ui:Beregn regnhændelsen}}. Tabellen viser for hvert rør det højeste flow ind og ud, hvor meget lavere den udgående top er, hvor stor en del af rørets fulde kapacitet det udnytter, og det minut, det topper.
3. Hvert udløb får en lille graf over flow over tid og {{ui:Hent hydrografen (CSV)}}.

Et opland afgiver regnen som et gennemsnit over sin koncentrationstid, så en regn, der er kortere end den, topper lavere end C × i × A. Hvert rør gennemregnes med Muskingum–Cunge-metoden ved brug af den flowdybde, den rationelle metode allerede har fundet. To grene med forskellige koncentrationstider topper ikke samtidig, så deres sum er lavere end summen af deres toppe.

Dette modellerer ikke overbelastning, opstuvning, magasinering i bygværker eller oversvømmelse. Et rør, hvis beregnede top er over dets fulde kapacitet, er med på listen, og dets vand videreføres, som om det passede. Brug det til at se timing og dæmpning, ikke til at dimensionere røret. Det er et beregningsredskab: en ingeniør kontrollerer det.

## Gemt med projektet

Oplande og regnindstillingerne gemmes i projektfilen. De er endnu ikke med i PDF-plottet, i DWG eller DXF eller i LandXML: se [Ikke lavet endnu](topic:not-built-yet).
