---
title: Zapisi rastlin, sorte in dobavljene velikosti
summary: Lastni seznam rastlin projekta kot tabela: sorte, dobavljene velikosti (posoda, koreninska gruda, obseg, prosto deblo), gostota, opombe specifikacije, uvoz in izvoz CSV; vsaka postavljena rastlina navede velikost; simboli rastlin glede na merilo ter lastni simboli in 3D modeli.
keywords: tabela rastlin, zbirka rastlin, sorta, sorta, dobavljena velikost, posoda, koreninska gruda, koreninska gruda, gola korenina, obseg debla, prosto deblo, gostota, rastlin na kvadratni meter, specifikacija, opombe specifikacije, simbol rastline, blok, lasten simbol, 3D rastlina, stopnja podrobnosti, merilo
from: 12251beb
---

Odprite {{ui:Plant table}} iz skupine Krajinska ureditev, iz menija {{ui:More}} ali iz razdelka Rastline. Vsaka vrstica je zapis rastline v lastnem seznamu tega projekta (zapis s seznama rastlin se ob dodajanju kopira). Vsaka sprememba se preveri tako kot uvožena datoteka in je en korak razveljavitve.

## Stolpci

- **Botanično ime**, **Splošno ime**, **Vrsta**, **Višina** in **Širina** pri zrelosti (v metrih).
- **Razmik** (od središča do središča) ali **Gostota** (rastlin na m²). Gredica zapisa z gostoto in brez razmika se napolni s to gostoto, za svoj vzorec (trikotni ali kvadratni).
- **Dobavljene velikosti**: ena postavka za vsako velikost, ločena s `;`. Vsaka postavka je ID, vrsta (`container`, `rootball`, `wrapped`, `bareroot`, `plug`, `seed`) in nato katero koli od: prostornina `10L`, višina `h0.6`, širina `s0.4`, obseg `g14-16` (cm), prosto deblo `st1.8`. Primer: `c10 container 10L h0.6; rb rootball h3 g14-16 st1.8`.
- **Sorte**: imena, ločena s `;`. Sorta ohrani svoje velikosti in opombe, če jih je imela uvožena datoteka.
- **Opombe specifikacije**.

{{ui:Duplicate}} kopira vrstico pod novim ključem; {{ui:Save as CSV}} in {{ui:Save as a plants file}} zapišeta seznam (vrstice CSV za sorte so pod svojo vrsto, z `cultivar_of`). Uvoz datoteke CSV ali datoteke rastlin jo združi vanj.

## Vaš lastni seznam rastlin v Knjižnici

Prijavite se v svoj račun CadCraft (Nastavitve, Vaši dodatki, Prijava), tabela rastlin pa lahko uporabi seznam, ki ga hranite v Knjižnici:

- {{ui:From my Library list}} prinese vaše lastne postavke rastlin (tudi tiste, ki še čakajo na pregled). Rastlina, ki jo že imate tukaj, se posodobi iz Knjižnice; sorte, dobavljene velikosti, gostota in specifikacija, ki ste jih dodali tukaj, se ohranijo.
- {{ui:Save as a plant list}} shrani vsako vrstico kot vašo postavko rastline v Knjižnici, ena postavka na vrsto: nova rastlina je nova postavka, spremenjena rastlina je nova različica, nespremenjena pa ostane pri miru. Najprej označite potrditveno polje: shranjevanje da rastline javno pod CC0. Prvo javno nalaganje od osebe, ki ji še ne zaupamo, pregleda človek, preden se pojavi, kot vsako nalaganje.

Knjižnica hrani osnovni zapis rastline. Sorte, dobavljene velikosti, gostota in opombe specifikacije ostanejo v projektu in v datoteki rastlin ({{ui:Save as a plants file}}); pogovorno okno pove, koliko vrstic to zadeva, vsakič ko shranite.

## Postavljena rastlina navede velikost

Izberite rastlino, žive meje ali vrstico mešanice gredice ali zasajene površine: kadar zapis ima sorte ali dobavljene velikosti, {{ui:Cultivar and size}} izbere eno. Razpredelnica rastlin nato šteje po vrsti, sorti in velikosti, oznaka pa jih lahko prikaže: `{botanical} '{cultivar}' {size}` ali `{full}`.

## Simboli rastlin glede na merilo

{{ui:Plant graphics}} (Krajinska ureditev › Več) določa, kako so rastline narisane v tlorisu: **samodejno** (grobljejše od 1:500 krog v širini, med 1:200 in 1:500 obris s središčem, natančneje podrobni simbol; obe meji lahko spremenite) ali ena stopnja za vsa merila. Pogovorno okno Listi ima svojo **Podrobnost rastlin v tlorisu** za ta komplet.

Na zapisu v razdelku Rastline {{ui:Own symbol…}} prebere SVG ali blok risbe DXF/DWG in ga nariše v širini rastline na podrobni stopnji. {{ui:Own 3D model…}} prebere OBJ, STL ali GLB; v {{ui:Plant graphics}} izberite **Lastni model vsakega zapisa**, da ga vidite v 3D. Datoteke so omejene (512 KB SVG, 2000 oblik, 50 000 trikotnikov) in shranjene v projektu. Transformacije SVG se ne uporabijo (obveščeni boste, če jih datoteka ima). Glejte [Grafika rastlin, lastni simboli in rastline v 3D](topic:plant-graphics) za stopnje, omejitve in to, kaj sme vsebovati GLB.
