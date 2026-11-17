---
title: Preverite izvoz IFC glede na IDS naročnika
summary: Naložite datoteko .ids, ki vam jo je dal naročnik ali cestna uprava, in v Težavah poglejte vsak izvoženi element, ki ji ne ustreza.
keywords: ids, specifikacija za dostavo informacij, buildingsmart, zahteve, dostava, preverjanje, validacija, qa, izvoz ifc, ifc 4.3, trasa, cesta, javno naročanje
from: 183d9a0e
---

## Kaj boste naredili

IDS (Information Delivery Specification, specifikacija za dostavo informacij, standard buildingSMART) je seznam tega, kaj mora vsebovati IFC. Javna naročila pogosto pošljejo eno skupaj z delom. CivilCraft preveri IFC, ki ga ta projekt izvozi, v različici IFC, ki ste jo izbrali za izvoz, in navede vsak element, ki ne dosega zahtev.

## Koraki

1. Odprite svoj projekt.
2. Kliknite {{ui:IFC}} v skupini Izvoz na orodni vrstici. V pogovornem oknu izberite različico IFC, ki jo boste dostavili.
3. Kliknite {{ui:Preveri po IDS …}}.
4. Kliknite {{ui:Naloži datoteko .ids …}} in izberite datoteko. Nič se ne pošlje nikamor.
5. Preberite rezultat: vsaka specifikacija z {{ui:Ustreza}} ali {{ui:Ne ustreza}} in koliko elementov se nanjo nanaša.
6. Odprite Težave ({{key:Ctrl+Shift+M}}) in kliknite napako, da izberete trasu, ploščad, cev, konstrukcijo ali stavbno maso, iz katere izhaja.

## Kaj mora biti vidno

- Eno opozorilo na vsak izvoženi element in zahtevo, ki je ne dosega, z imenom specifikacije, s tem, kaj zahteva IDS, in s tem, kar ima izvoz.
- Poročilo o preverjanju (v Težavah) se začne z IDS: njegovim naslovom, različico, avtorjem in števili za vsako specifikacijo.

## Dobro je vedeti

- IDS se shrani v datoteko projekta, zato se ob odprtju projekta znova preveri. Naložitev ali odstranitev je en korak, ki ga lahko razveljavite.
- Vsaka sprememba se preveri znova čez trenutek. Veliki površji se zapisujejo dlje, zato preverjanje takrat med zagoni malo dlje počaka.
- Preverjanje uporablja isto datoteko, ki jo zapiše izvoz {{ui:IFC}}, v zadnji izbrani različici tam (IFC 4.3, če različice niste izbrali).
- Številke se primerjajo v enotah SI: projekt v čevljih se najprej pretvori v metre.

- Vzorci v IDS se berejo kot celotna vrednost. Znak `^` na začetku in `$` na koncu se prav tako štejeta kot „celotna vrednost“, kot to pomeni večina datotek IDS.

## Naprej

- [Izvoz IFC](topic:ifc)
