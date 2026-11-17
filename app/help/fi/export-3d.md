---
title: Vie kohde 3D-muodossa
summary: Tallenna 3D-näkymän sisältö GLB- tai OBJ-tiedostoksi muihin 3D-ohjelmiin, metreinä ja Y ylöspäin, paikallisen origon ympärillä, jonka tiedosto tallentaa.
keywords: glb, gltf, obj, 3D-vienti, vie 3D, mallin vienti, pelimoottori, visualisointi, 3D-katselin, metrit, y ylöspäin, origo, paikallinen origo, tasokoordinaatisto
from: 07d23992
---

3D-näkymä vie näkemänsä 3D-mallina, jonka toinen ohjelma voi avata: 3D-katselimen, mallinnusohjelman, pelimoottorin tai visualisointityökalun.

## Vienti

1. Avaa 3D-näkymä ({{key:D}}) ja valitse, mitä näkyy, {{ui:Näytä}}-kohdasta. Piilotettua ei viedä.
2. Napsauta palkissa {{ui:GLB}}- tai {{ui:OBJ}}-painiketta.
   Tiedosto latautuu nimellä ”*projektin nimi*-3d.glb” tai ”-3d.obj”, ja tilarivi kertoo origon.

## Mitä tiedostot sisältävät

| | GLB | OBJ |
|---|---|---|
| Pinnat | Verkot normaaleilla sekä kaistojen tai pintojen väreillä | Verkot normaaleilla (ei värejä) |
| Putket ja rakenteet | Pyöreät verkot, ongelmalliset punaisina | Pyöreät verkot |
| Korkeuskäyrät, taitelinjat, linjaukset, paalutusmerkit, käytävän ja tasanteiden viivat | Viivat, kukin joukko omassa värissään | Viivatietueet (`l`) |
| Mittauspisteet | Pisteet | Pistetietueet (`p`) |

Jokainen joukko säilyttää nimensä (”Nykyinen maanpinta”, ”Putket”, ”Pääkorkeuskäyrät” ja niin edelleen), joten voit piilottaa sen tai muotoilla sen toisessa ohjelmassa.

## Yksiköt, akselit ja origo

- **Metreinä.** Jalkaprojekti muunnetaan US survey -jaloista (1 ft = 1200/3937 m).
- **Y ylöspäin**, näiden muotojen tavallinen käytäntö: itä muuttuu +X:ksi, korkeus +Y:ksi ja pohjoinen −Z:ksi.
- **Todellinen mittakaava.** Näkymän pystysuuntaista liioittelua ei sovelleta.
- **Paikallinen origo.** Tasokoordinaatit ovat miljoonia jalkoja, liian suuria näiden muotojen tallentamille yksinkertaisille liukuluvuille, joten tiedosto kirjoitetaan suhteessa lähellä olevaan origoon: maanpinnan oman origon itä- ja pohjoiskoordinaateille sekä sen alimman korkeuden pyöristettynä alaspäin. Origo projektin yksiköissä tallennetaan tiedostoon: GLB:ssä `extras`-kenttänä kohtaukselle ja sen ylimmälle solmulle, OBJ:ssä kommenttirivinä lähellä alkua (`# origin easting … northing … elevation …`). Sijoittaaksesi mallin takaisin projektin koordinaatteihin lisää origo (muunnettuna metreistä takaisin jaloiksi jalkaprojektilla).

## Ei vielä toteutettu

- Liioitellun näkymän tai projektiyksiköiden vieminen metrien sijaan.
- Tekstuurit, OBJ:n materiaalitiedosto (.mtl) ja kohdekohtaiset ominaisuudet (putkien ja rakenteiden nimet ovat vain CivilCraftissa).
- Käytävän vieminen erillisinä kappaleina tai pituusleikkausnäkymän vieminen 3D:nä.
