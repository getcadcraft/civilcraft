---
title: Izvoz plana u DXF
summary: Zapiše linije plana kao R12 DXF na imenovanim slojevima, s izohipsama na njihovim kotama i prelomnim linijama u 3D, za bilo koji CAD program.
keywords: dxf, dwg, cad, izvoz, linije, r12, 2000, 2004, 2007, 2010, 2013, 2018, slojevi, izohipse, razmjena crteža, osnovna karta, pozadina
from: f2d8ede9
---

{{ui:DXF}} zapisuje ono što plan prikazuje kao DXF datoteku u formatu R12, verziji koju otvara svaki CAD program. Ako ste koristili AutoCAD ili Civil 3D, otvorite ili umetnite je kao i svaku DXF datoteku.

## Izvoz

1. Postavite plan kako želite crtež: pod **Prikaz** odaberite površinu (postojeću ili projektovanu), razmak izohipsi i šta je uključeno (izohipse, oznake, tačke, oznake tačaka, trouglovi, prelomne linije, rub površine, cijevi, strelice nagiba).
2. Kliknite {{ui:DWG/DXF}} u grupi **Izvoz** i odaberite {{ui:DXF (R12, text) — the plain exchange file}}, zatim {{ui:Download}}.
3. Preglednik preuzima `<name>.dxf`. Statusna traka kaže, na primjer, "Exported R12 DXF: 2,140 objects; labels sized for 1" = 40'. Bands are not exported."

Koordinate se zapisuju u jedinicama vašeg projekta, u stvarnim vrijednostima (koordinate državne projekcije ostaju kakve jesu). Ništa se ne skalira niti pomjera.

## Šta je u datoteci

| Stavka | DXF entitet | Sloj |
|---|---|---|
| Sporedne i glavne izohipse | 2D polilinije na svojoj koti | C-TOPO-MINR, C-TOPO-MAJR |
| Oznake izohipsi | Tekst | C-TOPO-TEXT |
| Trouglovi | Polilinije | C-TOPO-TINN |
| Prelomne linije i granica | 3D polilinije | C-TOPO-BRKL |
| Rub površine | Polilinije | C-TOPO-BNDY |
| Strelice nagiba | Polilinije | C-TOPO-SLOP |
| Tačke snimanja i njihove oznake | Tačke (s kotom), tekst | V-NODE, V-NODE-TEXT |
| Linije iz šifri linija | 3D polilinije | V-NODE-LINE |
| Osovine trase | Linije i lukovi | C-ROAD-CNTR |
| Oznake stacionaže i tekst | Polilinije, tekst | C-ROAD-STAN |
| Rubovi koridora | Polilinije | C-ROAD-CORR |
| Poprečni presjeci | Polilinije | C-ROAD-SCTN |
| Platoi, linije presijecanja, linije nagiba | Polilinije | C-GRAD-PADS, C-GRAD-DAYL, C-GRAD-SLOP |
| Linije obilježja | 3D polilinije (lukovi kao dijelovi unutar 0.01; vidi [Linije obilježja](topic:feature-lines)) | C-GRAD-FEAT |
| Putanje vožnje | Polilinije, tekst | C-ROAD-SWPT |
| Cijevi, objekti, oznake | Polilinije, tekst | C-STRM-PIPE, C-STRM-STRC, C-STRM-TEXT |
| Cijevi i objekti s problemima | Polilinije | C-STRM-PROB |

Svaki sloj ima boju. Potpuni spisak je u [Slojevi plana](topic:plan-layers).

## Veličina oznaka

Tekst mora imati veličinu u jedinicama crteža. CivilCraft određuje veličinu oznaka za razmjeru pri kojoj cijeli plan staje na list Tabloid (stope) ili A3 (metri), i u statusnoj poruci kaže koja je razmjera. Ako štampate u drugoj razmjeri u vašem CAD programu, u njemu skalirajte tekst.

## Šta se ne izvozi

- Pojasi kota (samo na ekranu).
- Pogled profila. Profili se izvoze kao LandXML, ne kao crtež.
- Sama površina kao 3D objekt. Koristite LandXML za TIN, ili uključite {{ui:Triangles}} da dobijete njene rubove kao linije.
- Sve što ste isključili pod **Prikaz**.

## DWG

{{ui:DWG/DXF}} zapisuje istu linijsku grafiku i kao DWG crtež. Njegov dijalog traži format: DXF, ili DWG 2000, 2004, 2007, 2010, 2013 ili 2018. Verzija 2000 se otvara u gotovo svakom CAD programu, starom i novom; odaberite noviju kad to zatraži onaj ko dobije crtež. Vaš izbor se pamti u ovom pregledaču.

1. Kliknite {{ui:DWG}} u grupi **Izvoz**.
2. Odaberite **Format** i kliknite **Preuzmi DWG**.
3. Preglednik preuzima `<name>.dwg`. Statusna traka kaže šta je uneseno, na primjer "Exported DWG (2018 format): 12 polylines, 40 labels on 9 layers".

DWG ima iste slojeve, boje, izohipse (kao polilinije na svojoj koti), 3D prelomne linije, oznake i tačke kao i DXF, u istim koordinatama. Nazivi slojeva koje DWG ne može sadržati se mijenjaju, a statusna poruka to kaže. CivilCraft piše DWG vlastitim kodom, tako da ništa ne napušta vaš računar.

### Slojevi karte u DWG

DWG crtež ne može sadržati sliku unutar sebe: CAD programi prikazuju sliku koja stoji pored crteža. Kad su slojevi karte prikazani, dijalog nudi **Slojevi karte kao slika pored crteža**. Kad je to označeno, preuzimanje je `.zip` koji sadrži `<name>.dwg`, `<name>-map.png` (slojevi karte preko cijelog crteža, do 4,096 piksela u širini) i `<name>-map.pgw` (njegova svjetska datoteka, za GIS programe). Crtež prikazuje sliku kao sliku na sloju G-MAP-IMAG, na mjestu. Raspakujte datoteke u jednu fasciklu i držite ih zajedno.
