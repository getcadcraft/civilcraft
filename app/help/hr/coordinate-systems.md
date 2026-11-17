---
title: Postavljanje koordinatnog sustava projekta
summary: Recite u kojem je koordinatnom sustavu snimka, pa CivilCraft prikazuje zemljopisnu širinu i dužinu, smješta GIS datoteke i slojeve karte te piše .prj datoteke. Odaberite po kodu, po nazivu, prema samim koordinatama ili iz .prj datoteke.
keywords: koordinatni sustav, crs, epsg, srid, state plane, spcs, utm, nad83, wgs 84, projekcija, prj, wkt, datum, zemljopisna širina, zemljopisna dužina, lat long, geografski, mreža, georeferenciranje, georeferenca, dodjela koordinatnog sustava
from: 964250e2
---

Koordinate projekta su obični brojevi dok ne kažete što znače. Postavljanje koordinatnog sustava **nikad ništa ne pomiče**: samo CivilCraftu kaže da su, na primjer, E 6,150,000 N 2,080,000 koordinate State Plane zone 6 u Kaliforniji u US survey feet. Kad to zna:

- statusna traka prikazuje zemljopisnu širinu i dužinu pokazivača,
- GIS datoteke u drugim sustavima (shapefile, GeoJSON, GeoPackage, mreže visina, LiDAR) pretvaraju se u projekt pri otvaranju,
- slojevi karte mogu se ucrtati ispod plana ([Prikaz slojeva karte ispod plana](topic:map-layers)),
- izvozi u GIS formate nose sustav (`.prj` za shapefile, EPSG kod za GeoPackage i GeoTIFF).

## Odabir sustava

1. Odaberite {{ui:Coordinates}} u grupi {{ui:GIS}} alatne trake. Otvara se dijaloški okvir **Koordinatni sustav**. Na vrhu piše u kojem je sustavu projekt sada, ili **Nema — koordinate su samo brojevi**.
2. Pronađite sustav na jedan od ovih načina:
   - **Pretraga**: upišite EPSG kod (`2277`, `EPSG:2277`) ili riječi iz naziva (`texas central`, `utm 14n`, `lambert-93`). Kodovi se nižu od onog koji ste upisali; riječi nabrajaju sustave čiji naziv ima sve riječi.
   - {{ui:Systems these coordinates fit}} (kad projekt ima točke ili teren): CivilCraft čita sredinu projekta u svakom sustavu iz iste obitelji jedinica i navodi one čije područje primjene ju obuhvaća. Koordinate državne projekcije obično odgovaraju samo nekolicini zona: projekt u Teksasu na E 3,115,000 N 10,070,000 US survey feet odgovara četirima varijantama Texas Central (NAD83, NAD83(2011), HARN, NSRS2007). Svaki unos pokazuje gdje bi bila sredina vašeg projekta.
   - **Blizu (zemljopisna širina, dužina)** i {{ui:Suggest}}: upišite gdje je lokacija, na primjer `30.27, -97.74` ili `30°16′N 97°44′W`, i CivilCraft navodi projicirane sustave čije područje je obuhvaća, prvo državne i regionalne mreže.
   - {{ui:Read a .prj file…}}: otvorite `.prj` koji ide uz shapefile ili crtež. CivilCraft ga uspoređuje s popisom prema matematici projekcije (pa `.prj` koji drugačije navodi datum i dalje nalazi pravi sustav) i kaže koji je; kad se ništa ne poklopi točno, koristi se vlastiti opis datoteke. Možete i povući `.prj` na dijaloški okvir, ili ga otvoriti ili povući na sam plan.
3. Kliknite sustav na popisu. Pod **Odabrano** prikazuje se naziv, EPSG kod, jedinica, koliko je njegov datum dobro vezan za WGS 84, njegovo područje primjene u zemljopisnoj širini i dužini te gdje je sredina vašeg projekta u njemu.
4. Ostavite odabrano **Mreža** (većina projekata; za ostale vidi [Teren i lokalne koordinate](topic:ground-and-local-coordinates)) i odaberite {{ui:Apply}}.

Statusna traka sada prikazuje zemljopisnu širinu i dužinu pokazivača uz E i N. Postavljanje sustava je jedan korak poništavanja: {{key:Mod+Z}} ga vraća.

:::note
Jedinice se moraju podudarati: projekt u stopama prima sustave u US survey feet ili međunarodnim stopama, a projekt u metrima prima sustave u metrima. CivilCraft objašnjava odbijanje („Projekt je u stopama, ali ovaj sustav je u metrima…“). Projekt u stopama sa sustavom u US survey feet koristi geodetske stope: „ft“ projekta znači stopu sustava. Geografski sustavi (zemljopisna širina i dužina, kao sam WGS 84) ne mogu biti sustav projekta: crteži trebaju istočne i sjeverne koordinate.
:::

## Promjena ili uklanjanje sustava

Ponovno otvorite {{ui:Coordinates}}, odaberite drugi sustav i odaberite {{ui:Apply}}. Kad projekt ima točke ili projekt, CivilCraft pita **Jesu li koordinate već u sustavu …?**

- {{ui:Yes — nothing moves}}: brojevi ostaju isti i mijenja se samo njihovo značenje. Koristite kad je stari sustav odabran greškom.
- {{ui:No — convert them}}: svaka geodetska točka, prijelomnica, granica, PI osi, kut platoa i građevina pretvara se iz starog u novi sustav, u jednom koraku poništavanja. Teren učitan iz LandXML-a kao trokuti ne može se pretvoriti; prvo ga izgradite iz točaka.

{{ui:Remove the system}} uklanja sustav (ništa se ne pomiče). GIS slojevi koji su već u projektu ostaju gdje jesu.

## Zemljopisna širina i dužina u statusnoj traci

Dok projekt ima sustav, statusna traka prikazuje zemljopisnu širinu i dužinu pokazivača na WGS 84, na primjer `30°18′00.00″ N  97°42′00.00″ W`. Decimalne stupnjeve umjesto toga birate pod {{ui:Settings}}, {{ui:CivilCraft}}, **Zemljopisna širina i dužina** ([CivilCraft postavke](topic:settings)). S terenskim ili lokalnim koordinatama očitanje prolazi kroz taj korak prvo, pa je točno za točku pod pokazivačem.

## Koliko je dobar pomak datuma

Zemljopisna širina, dužina, GeoJSON i slojevi karte svi su na WGS 84. Veza svakog sustava s WGS 84 prikazana je u dijaloškom okviru:

| Što dijaloški okvir kaže | Što to znači |
|---|---|
| WGS 84 sam | Nema nikakvog pomaka. |
| NAD83 se uzima kao WGS 84 | Njih dvoje se razlikuju za metar ili dva u većini Sjeverne Amerike, najviše nekoliko metara. Dobro za slojeve karte i kontekst lokacije; ne za geodetsku osnovu. |
| Poznato na oko *n* m (EPSG-ova vrijednost) | Objavljen pomak; slojevi karte i GeoJSON mogu biti odmaknuti za otprilike toliko. |
| Nepoznato za ovaj datum | Nema objavljenog pomaka bez datoteke mreže: slojevi karte i GeoJSON mogu biti odmaknuti za stotine metara. |
| Iz datoteke pomaka mreže … | U upotrebi je datoteka pomaka mreže (u nastavku): unutar mreže unutar oko 10 cm od NAD83. |

Vlastite koordinate vašeg projekta nikad ne prolaze kroz pomak datuma: prolazi samo ono što se pretvara u zemljopisnu širinu i dužinu i iz nje. Vertikalni datumi i modeli geoida nisu obrađeni (kote se nikad ne pretvaraju). Gdje najbolji pomak treba datoteku mreže, popis nosi grublji objavljeni pomak, a dijaloški okvir pokazuje njegovu točnost (za NAD27 sustave, na primjer, oko 20 m), dok ne dodate mrežu.

## Datoteke pomaka mreže

Za NAD27 sustav, **Datoteka pomaka mreže** u dijaloškom okviru koordinatnog sustava stavlja zemljopisnu širinu i dužinu, GIS datoteke i slojeve karte unutar oko 10 cm od NAD83, umjesto oko 20 m:

- **Preuzmite** mrežu koju predlaže za područje sustava (NADCON5 za kontinentalne Sjedinjene Države, NADCON za Aljasku, NTv2 za Kanadu) s cdn.proj.org, javnog poslužitelja PROJ-ovih mreža. Šalje se samo naziv datoteke mreže.
- Ili **Dodajte datoteku mreže…** koju već imate: NTv2 (`.gsb`) ili PROJ GeoTIFF mrežu (`.tif`), do 20 MB.

Mrežna datoteka sprema se u datoteci projekta, pa putuje s projektom. Odjeljak kaže je li sredina projekta unutar mreže: izvan nje ne primjenjuje se nikakav pomak, pa koristite mrežu koja pokriva lokaciju. **Prestani koristiti mrežu** vraća grubi pomak. Svaka promjena je jedan korak: {{key:Mod+Z}} je poništava.

GIS slojevi koji su već u projektu ostaju gdje jesu kad se mreža promijeni; ponovno ih uvezite da ih smjestite kroz mrežu. Vlastite koordinate projekta nikad se ne pomiču.

## Što je provjereno

- Svaka pretvorba uspoređena je s PROJ-om (pyproj 3.7.1 s PROJ 9.5.1), koordinatnom bibliotekom koju koristi većina GIS programa, na preko 330 sustava: državne projekcije u US survey feet i stopama, UTM sjever i jug, Lambert-93, British National Grid, GDA2020 MGA, New Zealand Transverse Mercator i web Mercator, među ostalima. Istočne i sjeverne koordinate slažu se unutar 1 cm uz isti pomak datuma (većina ispod 1 mm), a matematika projekcija slaže se s PROJ-ovim vlastitim definicijama unutar 1 cm.
- `.prj` datoteke koje je pisao PROJ u oba česta oblika (ESRI i OGC) pročitane su natrag za 105 sustava: 208 od 210 se točno poklopilo s njihovim EPSG kodom, a druga dva s sustavom iste matematike na istom elipsoidu. `.prj` datoteke koje CivilCraft piše PROJ čita kao isti sustav. ESRI `.prj` datoteke za polarne stereografske sustave (UPS, polarna Aljaska) ne mogu se pročitati; te sustave birajte po kodu.
- Zemljopisna širina i dužina u statusnoj traci poklopile su se s PROJ-om do 0.01″ u pregledniku.
