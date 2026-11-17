---
title: Grafika biljaka po razmjeri, vlastiti simboli i 3D biljke
summary: Kako se biljke crtaju u planu pri svakoj razmjeri crtanja i stupnju detalja, te kako zapis biljke dobija vlastiti simbol (SVG, ili blok DXF/DWG) i vlastiti 3D model (OBJ, STL ili GLB).
keywords: grafika biljaka, simbol biljke, simbol po razmjeri, stupanj detalja, nivo detalja, jednostavan krug, obris, detaljan simbol, vlastiti simbol, blok, svg, dxf, dwg, 3D biljka, vlastiti 3D model, obj, stl, glb, gltf, model drveta, biljke u 3D
from: 875837d9
---

## Simboli u planu po razmjeri

Pejzaž › {{ui:More}} › {{ui:Plant graphics}} postavlja kako se biljke crtaju u planu. **Automatski, po razmjeri** bira jedan od tri nivoa prema razmjeri crtanja:

- **Jednostavan krug** (grublje od 1:500): krug po širini biljke.
- **Obris sa središtem** (od 1:500 do 1:200): krug i mali križ u središtu.
- **Detaljan simbol** (finije od 1:200): vlastiti simbol zapisa ako ga ima, inače ugrađeni simbol.

Promijenite dvije razmjere pomoću **Jednostavno od 1:** i **Obris od 1:**, ili odaberite jedan nivo za svaku razmjeru. Svaki set listova u dijalogu Listovi ima svoj **Detalj biljaka u planu**, pa se plan lokacije 1:500 i plan sadnje 1:100 mogu razlikovati. Postavke se čuvaju uz projekat.

## Vlastiti simbol

Odaberite biljku u odjeljku Biljke i pritisnite {{ui:Own symbol…}}. Čita se SVG ili blok crteža DXF ili DWG (ako crtež ima više blokova, birate jedan). Simbol se prilagodi širini biljke i crta se na detaljnom nivou. Čuva se u projektu, pa datoteka putuje s njim.

- SVG se čita za svoje linije, polilinije, poligone, pravougaonike, krugove, elipse i putanje. Skripte, stilovi, veze i slike u njemu se nikad ne razmatraju. Transformacije se ne primjenjuju: bićete obaviješteni kad ih datoteka ima, pa ih prije izvezite ravnima u svom programu za crtanje.
- Ograničenja: 512 KB SVG-a i 2000 oblika. Veća datoteka se odbija uz razlog.

## Vlastita 3D biljka

{{ui:Own 3D model…}} na istom zapisu čita datoteku **OBJ**, **STL** ili **GLB**. Zatim u Grafika biljaka postavite **Biljke u 3D** na **Vlastiti model svakog zapisa**: svaka biljka tog zapisa prikazuje vaš model, skaliran na svoju visinu i širinu. Zapisi bez vlastitog modela zadržavaju ugrađene oblike. Odaberite **Jednostavne mase** za brze preglede velikih lokacija.

GLB se čita samo za oblik:

- Sve što model treba mora biti unutar .glb datoteke. Model koji upućuje na druge datoteke (zaseban .bin ili slike po adresi) se odbija: ništa se ne preuzima.
- Komprimirana ili pakovana geometrija (Draco, meshopt, kvantizirane pozicije) se ne čita. Izvezite bez kompresije.
- Teksture i boje u datoteci se ne koriste: model se crta u vlastitoj boji biljke. Teksture se i dalje provjeravaju, a tekstura veća od 4096 piksela po stranici se odbija.
- Ograničenja: datoteka od 32 MB, 50 000 trouglova (brojeći svaku kopiju dijela koji je postavljen više puta), 64 slike i 16 MB slika.

Svako ograničenje odbija datoteku uz razlog; ništa djelimično pročitano se ne čuva. Jedan korak poništavanja zapisu vraća simbol ili model, a {{ui:Remove own symbol}} ili {{ui:Remove own 3D model}} ga ponovo uklanja.

Vidi [Zapisi biljaka](topic:plant-records) za sam zapis i [Pregled lokacije u 3D](topic:site-3d).
