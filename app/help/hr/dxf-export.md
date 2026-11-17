---
title: Izvoz tlocrta u DXF
summary: Zapisuje linije tlocrta kao R12 DXF na imenovanim slojevima, s izohipsama na njihovim visinama i prijelomnicama u 3D, za bilo koji CAD program.
keywords: dxf, dwg, cad, izvoz, linije, r12, 2000, 2004, 2007, 2010, 2013, 2018, slojevi, izohipse, razmjena crteža, podloga karte, pozadina
from: f2d8ede9
---

{{ui:DXF}} zapisuje ono što tlocrt prikazuje kao DXF datoteku u formatu R12, verziji koju otvara svaki CAD program. Ako ste koristili AutoCAD ili Civil 3D, otvorite ili umetnite je kao i svaku DXF datoteku.

## Izvoz

1. Postavite tlocrt onako kako želite da crtež izgleda: pod **Prikaz** odaberite teren (postojeći ili projektirani), razmak izohipsa te što je uključeno (izohipse, oznake, točke, oznake točaka, trokuti, prijelomnice, rub terena, cijevi, strelice nagiba).
2. Kliknite {{ui:DWG/DXF}} u skupini **Izvoz** i odaberite {{ui:DXF (R12, tekst) — obična razmjenska datoteka}}, zatim {{ui:Preuzmi}}.
3. Preglednik preuzima `<name>.dxf`. Statusna traka npr. kaže: „Izvezen R12 DXF: 2,140 objekata; oznake veličine za 1" = 40'. Pojasevi se ne izvoze.“

Koordinate se zapisuju u jedinicama vašeg projekta, u stvarnim vrijednostima (koordinate državne ravnine ostaju kakve jesu). Ništa se ne skalira niti pomiče.

## Što je u datoteci

| Stavka | DXF entitet | Sloj |
|---|---|---|
| Sporedne i glavne izohipse | 2D polilinije na svojoj visini | C-TOPO-MINR, C-TOPO-MAJR |
| Oznake izohipsa | Tekst | C-TOPO-TEXT |
| Trokuti | Polilinije | C-TOPO-TINN |
| Prijelomnice i granica | 3D polilinije | C-TOPO-BRKL |
| Rub terena | Polilinije | C-TOPO-BNDY |
| Strelice nagiba | Polilinije | C-TOPO-SLOP |
| Geodetske točke i njihove oznake | Točke (s visinom), tekst | V-NODE, V-NODE-TEXT |
| Linije iz kodova linija | 3D polilinije | V-NODE-LINE |
| Osi trasa | Linije i lukovi | C-ROAD-CNTR |
| Oznake stacionaže i oznake | Polilinije, tekst | C-ROAD-STAN |
| Rubovi koridora | Polilinije | C-ROAD-CORR |
| Linije uzorkovanja | Polilinije | C-ROAD-SCTN |
| Platoi, linije nožice pokosa, linije pokosa | Polilinije | C-GRAD-PADS, C-GRAD-DAYL, C-GRAD-SLOP |
| Značajne linije | 3D polilinije (lukovi kao dijelovi unutar 0.01; vidi [Značajne linije](topic:feature-lines)) | C-GRAD-FEAT |
| Putanje ophoda | Polilinije, tekst | C-ROAD-SWPT |
| Cijevi, građevine, oznake | Polilinije, tekst | C-STRM-PIPE, C-STRM-STRC, C-STRM-TEXT |
| Cijevi i građevine s problemima | Polilinije | C-STRM-PROB |

Svaki sloj ima boju. Cijeli popis nalazi se u [Slojevi tlocrta](topic:plan-layers).

## Veličina oznaka

Tekst mora imati veličinu u jedinicama crteža. CivilCraft određuje veličinu oznaka za mjerilo pri kojem se cijeli tlocrt uklapa na list Tabloid (stope) ili list A3 (metri) i u statusnoj poruci navodi koje je mjerilo. Ako ispisujete u drugom mjerilu u svom CAD programu, skalirajte tekst tamo.

## Što se ne izvozi

- Pojasevi visina (samo na zaslonu).
- Prikaz uzdužnog profila. Profili se izvoze kao LandXML, a ne kao crtež.
- Sam teren kao 3D objekt. Za TIN koristite LandXML ili uključite {{ui:Trokuti}} da dobijete njegove rubove kao linije.
- Sve što ste isključili pod **Prikaz**.

## DWG

{{ui:DWG/DXF}} zapisuje iste linije i kao DWG crtež. Njegov dijaloški okvir traži format: DXF ili DWG 2000, 2004, 2007, 2010, 2013 ili 2018. Format 2000 otvara gotovo svaki CAD program, stari i noviji; odaberite noviji kada to zatraži onaj tko dobiva crtež. Vaš izbor pamti se u ovom pregledniku.

1. Kliknite {{ui:DWG}} u skupini **Izvoz**.
2. Odaberite **Format** i kliknite **Preuzmi DWG**.
3. Preglednik preuzima `<name>.dwg`. Statusna traka pokazuje što je uključeno, npr. „Izvezen DWG (format 2018): 12 polilinija, 40 oznaka na 9 slojeva“.

DWG ima iste slojeve, boje, izohipse (kao polilinije na svojoj visini), 3D prijelomnice, oznake i točke kao DXF, u istim koordinatama. Nazivi slojeva koje DWG ne može sadržavati se mijenjaju, a statusna poruka to navodi. CivilCraft piše DWG vlastitim kodom, pa ništa ne napušta vaše računalo.

### Slojevi karte u DWG-u

DWG crtež ne može sadržavati sliku unutar sebe: CAD programi prikazuju sliku koja stoji uz crtež. Kada su slojevi karte prikazani, dijaloški okvir nudi **Slojevi karte kao slika uz crtež**. Kada je to označeno, preuzimanje je `.zip` datoteka koja sadrži `<name>.dwg`, `<name>-map.png` (slojevi karte preko cijelog crteža, do 4,096 piksela u širini) i `<name>-map.pgw` (njegova svjetska datoteka, za GIS programe). Crtež prikazuje sliku kao rastersku sliku na sloju G-MAP-IMAG, na mjestu. Raspakirajte datoteke u jednu mapu i držite ih zajedno.
