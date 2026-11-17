---
title: Grafika biljaka prema mjerilu, vlastiti simboli i 3D biljke
summary: Kako se biljke crtaju u tlocrtu pri svakom mjerilu i razini detalja te kako zapis biljke dobiva vlastiti simbol (SVG ili blok DXF/DWG) i vlastiti 3D model (OBJ, STL ili GLB).
keywords: grafika biljaka, simbol biljke, simbol prema mjerilu, razina detalja, detaljnost, jednostavna kružnica, obris, detaljan simbol, vlastiti simbol, blok, svg, dxf, dwg, 3d biljka, vlastiti 3D model, obj, stl, glb, gltf, model stabla, biljke u 3D
from: 875837d9
---

## Simboli u tlocrtu prema mjerilu

Krajobraz › {{ui:Više}} › {{ui:Grafika biljaka}} određuje kako se biljke crtaju u tlocrtu. **Automatski, prema mjerilu** bira jednu od tri razine prema mjerilu crteža:

- **Jednostavna kružnica** (grublje od 1:500): kružnica prema širini biljke.
- **Obris sa središtem** (od 1:500 do 1:200): kružnica i mali križić u središtu.
- **Detaljan simbol** (sitnije od 1:200): vlastiti simbol zapisa ako ga ima, inače ugrađeni simbol.

Dva mjerila mijenjate poljima **Jednostavno od 1:** i **Obris od 1:**, ili odaberete jednu razinu za sva mjerila. Svaki skup listova u dijaloškom okviru Listovi ima vlastitu **Detaljnost biljke u tlocrtu**, pa se situacijski plan 1:500 i plan sadnje 1:100 mogu razlikovati. Postavke se spremaju uz projekt.

## Vlastiti simbol

Odaberite biljku u odjeljku Biljke i pritisnite {{ui:Vlastiti simbol…}}. Čita SVG ili blok iz DXF ili DWG crteža (ako crtež ima više blokova, birate jedan). Simbol se prilagođava širini biljke i crta na detaljnoj razini. Pohranjen je u projektu pa se s projektom prenosi i datoteka.

- SVG se čita za linije, polilinije, poligone, pravokutnike, kružnice, elipse i putanje. Skripte, stilovi, poveznice i slike u njemu se nikad ne obrađuju. Transformacije se ne primjenjuju: bit ćete obaviješteni ako ih datoteka ima, pa ih prvo spljoštite u svom programu za crtanje.
- Ograničenja: 512 KB SVG-a i 2000 oblika. Veća datoteka se odbija uz navod razloga.

## Vlastita 3D biljka

{{ui:Vlastiti 3D model…}} na istom zapisu čita datoteku **OBJ**, **STL** ili **GLB**. Zatim u {{ui:Grafika biljaka}} postavite **Biljke u 3D** na **Vlastiti model svakog zapisa**: svaka biljka tog zapisa prikazuje vaš model, skaliran na svoju visinu i širinu. Zapisi bez vlastitog modela zadržavaju ugrađene oblike. Za brze prikaze velikih lokacija odaberite **Jednostavne mase**.

GLB se čita samo za oblik:

- Sve što model treba mora biti u .glb datoteci. Model koji upućuje na druge datoteke (zasebnu .bin ili slike po adresi) odbija se: ništa se ne preuzima.
- Komprimirana ili pakirana geometrija (Draco, meshopt, kvantizirani položaji) se ne čita. Izvezite bez kompresije.
- Teksture i boje u datoteci se ne koriste: model se crta vlastitom bojom biljke. Teksture se ipak provjeravaju, a tekstura veća od 4096 piksela po stranici se odbija.
- Ograničenja: datoteka od 32 MB, 50 000 trokuta (računajući svaku kopiju dijela postavljenog više puta), 64 slike i 16 MB slika.

Svako ograničenje odbija datoteku uz navod razloga; ništa djelomično pročitano se ne zadržava. Jedan korak poništavanja daje zapisu simbol ili model, a {{ui:Ukloni vlastiti simbol}} ili {{ui:Ukloni vlastiti 3D model}} ga ponovno uklanja.

Vidi [Zapisi biljaka](topic:plant-records) za sam zapis i [Pregled lokacije u 3D](topic:site-3d).
