---
title: Grafika biljaka po razmeri, sopstveni simboli i 3D biljke
summary: Kako se biljke crtaju u planu pri svakoj razmeri crteža i nivou detalja, i kako zapis biljke dobija sopstveni simbol (SVG ili DXF/DWG blok) i sopstveni 3D model (OBJ, STL ili GLB).
keywords: grafika biljaka, simbol biljke, simbol po razmeri, nivo detalja, stepen detalja, jednostavan krug, obris, detaljan simbol, sopstveni simbol, blok, svg, dxf, dwg, 3D biljka, sopstveni 3D model, obj, stl, glb, gltf, model drveta, biljke u 3D
from: 875837d9
---

## Simboli u planu po razmeri

Uređenje › {{ui:Više}} › {{ui:Grafika biljaka}} određuje kako se biljke crtaju u planu. **Automatski, po razmeri** bira jedan od tri nivoa prema razmeri crteža:

- **Jednostavan krug** (grublje od 1:500): krug po širini biljke.
- **Obris sa centrom** (od 1:500 do 1:200): krug i mali centralni krst.
- **Detaljan simbol** (finije od 1:200): sopstveni simbol zapisa ako ga ima, inače ugrađeni simbol.

Dve razmere menjate sa **Jednostavno od 1:** i **Obris od 1:**, ili birate jedan nivo za svaku razmeru. Svaki set listova u dijalogu Listovi ima sopstveni **Detalj biljaka u planu**, pa se plan lokacije 1:500 i plan sadnje 1:100 mogu razlikovati. Podešavanja se čuvaju uz projekat.

## Sopstveni simbol

Izaberite biljku u odeljku Biljke i pritisnite {{ui:Sopstveni simbol…}}. Učitava se SVG ili blok DXF ili DWG crteža (kada crtež ima više blokova, birate jedan). Simbol se prilagođava širini biljke i crta na detaljnom nivou. Čuva se u projektu, pa datoteka putuje sa njim.

- SVG se čita za linije, polilinije, poligone, pravougaonike, krugove, elipse i putanje. Skripte, stilovi, veze i slike u njemu se nikada ne čitaju. Transformacije se ne primenjuju: bićete obavešteni kada datoteka ih ima, pa ih prvo razložite u svom programu za crtanje.
- Ograničenja: 512 KB SVG-a i 2000 oblika. Veća datoteka se odbija uz navedeni razlog.

## Sopstvena 3D biljka

{{ui:Sopstveni 3D model…}} na istom zapisu čita datoteku **OBJ**, **STL** ili **GLB**. Zatim u odeljku „Grafika biljaka“ postavite **Biljke u 3D** na **Sopstveni model svakog zapisa**: svaka biljka tog zapisa prikazuje vaš model, razmeren na svoju visinu i širinu. Zapisi bez sopstvenog modela zadržavaju ugrađene oblike. Izaberite **Jednostavne mase** za brze prikaze velikih lokacija.

GLB se čita samo za oblik:

- Sve što model treba mora biti unutar .glb datoteke. Model koji upućuje na druge datoteke (poseban .bin ili slike po adresi) se odbija: ništa se ne preuzima.
- Kompresovana ili spakovana geometrija (Draco, meshopt, kvantizovane pozicije) se ne čita. Izvezite bez kompresije.
- Teksture i boje u datoteci se ne koriste: model se crta u sopstvenoj boji biljke. Teksture se ipak proveravaju, a tekstura veća od 4096 piksela po strani se odbija.
- Ograničenja: datoteka od 32 MB, 50 000 trouglova (brojeći svaku kopiju dela postavljenog više puta), 64 slike i 16 MB slika.

Svako ograničenje odbija datoteku uz navedeni razlog; ništa što je samo delimično pročitano se ne zadržava. Jedan korak {{ui:Opozovi}} vraća zapisu simbol ili model, a {{ui:Ukloni sopstveni simbol}} ili {{ui:Ukloni sopstveni 3D model}} ga ponovo uklanja.

Pogledajte [Zapisi biljaka](topic:plant-records) za sam zapis i [Pogled na lokaciju u 3D](topic:site-3d).
