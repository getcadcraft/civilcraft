---
title: Izvoz plana u DXF
summary: Zapiše linije plana kao R12 DXF na imenovanim slojevima, sa izohipsama na njihovim kotama i linijama loma u 3D, za bilo koji CAD program.
keywords: dxf, dwg, cad, izvoz, linije, r12, 2000, 2004, 2007, 2010, 2013, 2018, slojevi, izohipse, razmena crteža, osnovna mapa, pozadina
from: f2d8ede9
---

{{ui:DXF}} upisuje ono što plan prikazuje kao DXF datoteku u formatu R12, verziji koju otvara svaki CAD program. Ako ste koristili AutoCAD ili Civil 3D, otvorite je ili umetnite kao bilo koju DXF datoteku.

## Izvoz

1. Podesite plan kako želite da izgleda crtež: pod **Prikaz** izaberite površ (postojeću ili projektovanu), interval izohipsi i šta je uključeno (izohipse, oznake, tačke, oznake tačaka, trouglovi, linije loma, ivica površi, cevi, strelice nagiba).
2. Kliknite {{ui:DWG/DXF}} u grupi **Izvoz** i izaberite {{ui:DXF (R12, tekst) — obična datoteka za razmenu}}, pa {{ui:Preuzmi}}.
3. Pregledač preuzima `<name>.dxf`. Statusna traka kaže, na primer, "Izvezen R12 DXF: 2,140 objekata; oznake su veličine za 1" = 40'. Pojasevi nisu izvezeni."

Koordinate se upisuju u jedinicama vašeg projekta, sa stvarnim vrednostima (koordinate ravni državnog sistema ostaju iste). Ništa se ne skalira niti pomera.

## Šta je u datoteci

| Stavka | DXF entitet | Sloj |
|---|---|---|
| Manje i glavne izohipse | 2D polilinije na svojoj koti | C-TOPO-MINR, C-TOPO-MAJR |
| Oznake izohipsi | Tekst | C-TOPO-TEXT |
| Trouglovi | Polilinije | C-TOPO-TINN |
| Linije loma i granica | 3D polilinije | C-TOPO-BRKL |
| Ivica površi | Polilinije | C-TOPO-BNDY |
| Strelice nagiba | Polilinije | C-TOPO-SLOP |
| Tačke snimanja i njihove oznake | Tačke (sa kotom), tekst | V-NODE, V-NODE-TEXT |
| Linije iz šifara linija | 3D polilinije | V-NODE-LINE |
| Osovine trase | Linije i lukovi | C-ROAD-CNTR |
| Podeoci i oznake stacionaže | Polilinije, tekst | C-ROAD-STAN |
| Ivice koridora | Polilinije | C-ROAD-CORR |
| Poprečni preseci | Polilinije | C-ROAD-SCTN |
| Platoi, linije dnevnog svetla, linije nagiba | Polilinije | C-GRAD-PADS, C-GRAD-DAYL, C-GRAD-SLOP |
| Linije obeležja | 3D polilinije (lukovi kao delovi unutar 0.01; videti [Linije obeležja](topic:feature-lines)) | C-GRAD-FEAT |
| Putanje vozila | Polilinije, tekst | C-ROAD-SWPT |
| Cevi, objekti, oznake | Polilinije, tekst | C-STRM-PIPE, C-STRM-STRC, C-STRM-TEXT |
| Cevi i objekti sa problemima | Polilinije | C-STRM-PROB |

Svaki sloj ima boju. Pun spisak je u [Slojevi plana](topic:plan-layers).

## Veličina oznaka

Tekst mora imati veličinu u jedinicama crteža. CivilCraft dimenzioniše oznake za razmeru pri kojoj ceo plan staje na list Tabloid (stope) ili A3 (metri), i u statusnoj poruci kaže koja je razmera. Ako štampate u drugoj razmeri u svom CAD programu, skalirajte tekst tamo.

## Šta se ne izvozi

- Visinski pojasevi (samo na ekranu).
- Pogled profila. Profili se izvoze kao LandXML, a ne kao crtež.
- Sama površ kao 3D objekat. Koristite LandXML za TIN ili uključite {{ui:Trouglovi}} da dobijete njene ivice kao linije.
- Sve što ste isključili pod **Prikaz**.

## DWG

{{ui:DWG/DXF}} upisuje iste linije i kao DWG crtež. Njegov dijalog traži format: DXF ili DWG 2000, 2004, 2007, 2010, 2013 ili 2018. Format 2000 otvara skoro svaki CAD program, stari i novi; izaberite noviji kada to zatraži onaj ko dobija crtež. Vaš izbor se pamti u ovom pregledaču.

1. Kliknite {{ui:DWG}} u grupi **Izvoz**.
2. Izaberite **Format** i kliknite **Preuzmi DWG**.
3. Pregledač preuzima `<name>.dwg`. Statusna traka kaže šta je upisano, na primer "Izvezen DWG (format 2018): 12 polilinija, 40 oznaka na 9 slojeva".

DWG ima iste slojeve, boje, izohipse (kao polilinije na svojoj koti), 3D linije loma, oznake i tačke kao DXF, u istim koordinatama. Nazivi slojeva koje DWG ne može da sadrži se menjaju, a statusna poruka to kaže. CivilCraft piše DWG sopstvenim kodom, pa ništa ne napušta vaš računar.

### Slojevi karte u DWG-u

DWG crtež ne može da sadrži sliku unutar sebe: CAD programi prikazuju sliku koja stoji pored crteža. Kada su slojevi karte uključeni, dijalog nudi **Slojevi karte kao slika pored crteža**. Kada je to označeno, preuzimanje je `.zip` koji sadrži `<name>.dwg`, `<name>-map.png` (slojevi karte preko celog crteža, do 4,096 piksela u širinu) i `<name>-map.pgw` (njegovu svetsku datoteku, za GIS programe). Crtež prikazuje sliku kao objekat na sloju G-MAP-IMAG, na svom mestu. Raspakujte datoteke u jednu fasciklu i držite ih zajedno.
