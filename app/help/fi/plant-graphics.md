---
title: Kasvien grafiikka mittakaavan mukaan, omat symbolit ja 3D-kasvit
summary: Miten kasvit piirretään pohjakuvassa kullakin piirrosmittakaavalla ja yksityiskohtatasolla, ja miten kasvitietueeseen saa oman symbolin (SVG tai DXF/DWG-lohko) ja oman 3D-mallin (OBJ, STL tai GLB).
keywords: kasvien grafiikka, kasvisymboli, symboli mittakaavan mukaan, yksityiskohtataso, taso, yksinkertainen ympyrä, ääriviiva, yksityiskohtainen symboli, oma symboli, lohko, svg, dxf, dwg, 3D-kasvi, oma 3D-malli, obj, stl, glb, gltf, puumalli, kasvit 3D:nä
from: 875837d9
---

## Pohjakuvan symbolit mittakaavan mukaan

Maisema › {{ui:Lisää}} › {{ui:Kasvien grafiikka}} määrittää, miten kasvit piirretään pohjakuvassa. **Automaattinen mittakaavan mukaan** valitsee yhden kolmesta tasosta piirrosmittakaavan perusteella:

- **Yksinkertainen ympyrä** (karkeampi kuin 1:500): ympyrä kasvin leviämän kokoisena.
- **Ääriviiva keskipisteellä** (välillä 1:500–1:200): ympyrä ja pieni keskiristi.
- **Yksityiskohtainen symboli** (tarkempi kuin 1:200): tietueen oma symboli, jos sellainen on, muuten sisäänrakennettu symboli.

Vaihda kahta mittakaavaa kentissä **Yksinkertainen alkaen 1:** ja **Ääriviiva alkaen 1:**, tai valitse yksi taso kaikille mittakaaville. Arkkisarjat-valintaikkunan jokaisella arkkisarjalla on oma **Kasvien yksityiskohtaisuus pohjakuvassa**, joten 1:500 tonttikartta ja 1:100 istutussuunnitelma voivat erota. Asetukset tallennetaan projektin mukana.

## Oma symboli

Valitse kasvi Kasvit-osiosta ja paina {{ui:Oma symboli…}}. Se lukee SVG-tiedoston tai DXF- tai DWG-piirroksen lohkon (jos piirroksessa on useita lohkoja, valitset yhden). Symboli sovitetaan kasvin leviämään ja piirretään yksityiskohtaisella tasolla. Se säilytetään projektissa, joten tiedosto kulkee sen mukana.

- SVG:stä luetaan viivat, murtoviivat, monikulmiot, suorakulmiot, ympyrät, ellipsit ja polut. Komentosarjoja, tyylejä, linkkejä ja kuvia ei lueta lainkaan. Muunnoksia ei sovelleta: sinulle kerrotaan, jos tiedostossa on niitä, joten litistä ne ensin piirto-ohjelmassa.
- Rajat: 512 KB SVG-dataa ja 2000 muotoa. Liian suuri tiedosto hylätään ja syy ilmoitetaan.

## Oma 3D-kasvi

{{ui:Oma 3D-malli…}} samassa tietueessa lukee **OBJ**-, **STL**- tai **GLB**-tiedoston. Sitten Kasvien grafiikka -kohdassa aseta **Kasvit 3D:nä** arvoon **Tietueen oma malli**: jokainen tietueen kasvi näyttää omaa malliasi, skaalattuna sen korkeuteen ja leviämään. Tietueet ilman omaa mallia säilyttävät sisäänrakennetut muodot. Valitse **Yksinkertaiset massat** nopeisiin näkymiin suurilla alueilla.

GLB luetaan vain muodon osalta:

- Kaiken mallin tarvitsema on oltava .glb-tiedoston sisällä. Malli, joka viittaa muihin tiedostoihin (erillinen .bin tai kuvat osoitteen mukaan), hylätään: mitään ei ladata.
- Pakattua tai kvantisoitua geometriaa (Draco, meshopt, kvantisoidut sijainnit) ei lueta. Vie ilman pakkausta.
- Tiedoston tekstuureja ja värejä ei käytetä: malli piirretään kasvin omalla värillä. Tekstuurit tarkistetaan silti, ja tekstuuri, jonka sivu on yli 4096 pikseliä, hylätään.
- Rajat: 32 MB tiedosto, 50 000 kolmiota (laskien jokaisen useammin sijoitetun osan jokainen kopio), 64 kuvaa ja 16 MB kuvia.

Jokainen raja hylkää tiedoston syyn kanssa, eikä osittain luettua säilytetä. Yksi kumoamisvaihe antaa tietueelle symbolin tai mallin. {{ui:Poista oma symboli}} tai {{ui:Poista oma 3D-malli}} poistaa sen taas.

Katso [Kasvitietueet](topic:plant-records) tietueesta itsestään ja [Tarkastele aluetta 3D:nä](topic:site-3d).
