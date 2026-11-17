---
title: Postavite koordinatni sistem projekta
summary: Navedite u kojem je koordinatnom sistemu geodetsko snimanje, da CivilCraft prikaže geografsku širinu i dužinu, postavi GIS datoteke i slojeve karte te upisuje .prj datoteke. Birajte po šifri, po nazivu, po samim koordinatama ili iz .prj datoteke.
keywords: koordinatni sistem, crs, epsg, srid, državna ravnina, spcs, utm, nad83, wgs 84, projekcija, prj, wkt, datum, geografska širina, geografska dužina, geografski, mreža, georeferenciranje, dodjela koordinatnog sistema
from: 964250e2
---

Koordinate projekta su obični brojevi dok ne kažete šta znače. Postavljanje koordinatnog sistema **nikad ništa ne pomjera**: samo CivilCraft-u kaže da su, na primjer, E 6,150,000 N 2,080,000 koordinate državne ravnine, zona 6 za Kaliforniju, u američkim geodetskim stopama. Kad to zna:

- statusna traka prikazuje geografsku širinu i dužinu pokazivača,
- GIS datoteke u drugim sistemima (shapefile, GeoJSON, GeoPackage, mreže kota, LiDAR) pretvaraju se u projekat čim se otvore,
- slojevi karte mogu se crtati ispod plana ([Prikaz slojeva karte ispod plana](topic:map-layers)),
- izvozi u GIS formate nose sistem (`.prj` za shapefile, EPSG šifra za GeoPackage i GeoTIFF).

## Odaberite sistem

1. Odaberite {{ui:Koordinate}} u grupi {{ui:GIS}} na alatnoj traci. Otvara se dijalog **Koordinatni sistem**. Na vrhu piše u kojem je sistemu projekat sada, ili **Nema — koordinate su samo brojevi**.
2. Pronađite sistem na jedan od ovih načina:
   - **Pretraga**: upišite EPSG šifru (`2277`, `EPSG:2277`) ili riječi iz naziva (`texas central`, `utm 14n`, `lambert-93`). Šifre se navode od onoga što ste upisali; riječi navode sisteme čiji naziv sadrži sve riječi.
   - {{ui:Sistemi kojima odgovaraju ove koordinate}} (kad projekat ima tačke ili površinu): CivilCraft čita sredinu vašeg projekta u svakom sistemu iz porodice jedinica projekta i navodi one čije područje primjene je obuhvata. Koordinate državne ravnine obično odgovaraju samo nekoliko zona: projekat u Teksasu na E 3,115,000 N 10,070,000 američkih geodetskih stopa odgovara četirima varijantama Texas Central (NAD83, NAD83(2011), HARN, NSRS2007). Svaki unos pokazuje gdje bi bila sredina vašeg projekta.
   - **Blizu (geografska širina, dužina)** i {{ui:Predloži}}: upišite gdje je lokacija, na primjer `30.27, -97.74` ili `30°16′N 97°44′W`, i CivilCraft navodi projicirane sisteme čije područje ju obuhvata, prvo nacionalne i državne mreže.
   - {{ui:Učitaj .prj datoteku…}}: otvorite `.prj` koji je došao uz shapefile ili crtež. CivilCraft ga upoređuje s listom prema matematici projekcije (tako da `.prj` koji drugačije navodi datum i dalje nađe pravi sistem) i kaže koji je; kad ništa ne odgovara tačno, koristi se sam opis datoteke. Možete i prevući `.prj` na dijalog, ili ga otvoriti ili prevući na sam plan.
3. Kliknite sistem u listi. Pod **Odabrano** prikazuje se naziv, EPSG šifra, jedinica, koliko je njegov datum dobro vezan za WGS 84, njegovo područje primjene u geografskoj širini i dužini, i gdje pada sredina vašeg projekta.
4. Ostavite označeno **Mreža** (za većinu projekata; za ostale vidi [Teren i lokalne koordinate](topic:ground-and-local-coordinates)) i odaberite {{ui:Primijeni}}.

Statusna traka sada prikazuje geografsku širinu i dužinu pokazivača pored E i N. Postavljanje sistema je jedan korak poništavanja: {{key:Mod+Z}} ga vraća.

:::note
Jedinice se moraju poklapati: projekat u stopama prima sisteme u američkim geodetskim stopama ili međunarodnim stopama, projekat u metrima prima sisteme u metrima. CivilCraft objašnjava odbijanje ("Projekat je u stopama, a ovaj sistem je u metrima…"). Projekat u stopama sa sistemom u američkim geodetskim stopama koristi geodetske stope: "ft" projekta znači stopu sistema. Geografski sistemi (geografska širina i dužina, kao sam WGS 84) ne mogu biti sistem projekta: crteži trebaju istočne i sjeverne koordinate.
:::

## Promijenite ili uklonite sistem

Ponovo otvorite {{ui:Koordinate}}, odaberite drugi sistem i odaberite {{ui:Primijeni}}. Kad projekat ima tačke ili projekat, CivilCraft pita **Jesu li koordinate u … već?**

- {{ui:Da — ništa se ne pomjera}}: brojevi ostaju isti, mijenja se samo njihovo značenje. Koristite ovo kad je stari sistem pogrešno odabran.
- {{ui:Ne — pretvori ih}}: svaka geodetska tačka, linija prijeloma, granica, PI trase, ugao platoa i objekat pretvara se iz starog sistema u novi, u jednom koraku poništavanja. Površina pročitana iz LandXML-a kao trouglovi ne može se pretvoriti; prvo je ponovo izgradite iz tačaka.

{{ui:Ukloni sistem}} uklanja sistem (ništa se ne pomjera). GIS slojevi koji su već u projektu ostaju gdje jesu.

## Geografska širina i dužina u statusnoj traci

Dok projekat ima sistem, statusna traka prikazuje geografsku širinu i dužinu pokazivača na WGS 84, na primjer `30°18′00.00″ N  97°42′00.00″ W`. Za decimalne stepene odaberite drugačije pod {{ui:Postavke}}, {{ui:CivilCraft}}, **Geografska širina i dužina** ([Postavke programa CivilCraft](topic:settings)). Uz teren ili lokalne koordinate, očitavanje prvo prolazi kroz taj korak, pa je tačno za tačku ispod pokazivača.

## Koliko je dobar pomak datuma

Geografska širina i dužina, GeoJSON i slojevi karte svi su na WGS 84. Vezanost svakog sistema za WGS 84 prikazana je u dijalogu:

| Šta dijalog kaže | Šta to znači |
|---|---|
| WGS 84 sam | Nema nikakvog pomaka. |
| NAD83 se uzima kao WGS 84 | Njih dvoje se razlikuju za metar ili dva u većem dijelu Sjeverne Amerike, najviše nekoliko metara. Dobro za slojeve karte i kontekst lokacije; ne za geodetsku mrežu. |
| Poznato na oko *n* m (EPSG-ova vrijednost) | Objavljeni pomak; slojevi karte i GeoJSON mogu odstupati za otprilike toliko. |
| Nepoznato za ovaj datum | Nema objavljenog pomaka bez datoteke mreže: slojevi karte i GeoJSON mogu odstupati za stotine metara. |
| Iz datoteke pomaka mreže … | Koristi se datoteka pomaka mreže (dolje): unutar mreže, unutar oko 10 cm od NAD83. |

Koordinate vašeg projekta nikad ne prolaze kroz pomak datuma: samo ono što se pretvara u geografsku širinu i dužinu i iz nje. Vertikalni datumi i modeli geoida se ne obrađuju (kote se nikad ne pretvaraju). Gdje najbolji pomak zahtijeva datoteku mreže, lista nosi grublji objavljeni pomak, a dijalog prikazuje njegovu tačnost (npr. NAD27 sistemi oko 20 m), dok ne dodate mrežu.

## Datoteke pomaka mreže

Za NAD27 sistem, **Datoteka pomaka mreže** u dijalogu koordinatnog sistema stavlja geografsku širinu i dužinu, GIS datoteke i slojeve karte unutar oko 10 cm od NAD83, umjesto oko 20 m:

- **Preuzmite** mrežu koju predloži za područje sistema (NADCON5 za sjedinjene američke države, NADCON za Aljasku, NTv2 za Kanadu) sa cdn.proj.org, javnog servera mreža PROJ-a. Šalje se samo naziv datoteke mreže.
- Ili **Dodajte datoteku mreže…** koju već imate: NTv2 (`.gsb`) ili PROJ GeoTIFF mrežu (`.tif`), do 20 MB.

Mreža se čuva u datoteci projekta, pa putuje s projektom. Odjeljak kaže da li je sredina projekta unutar mreže: van nje se uopšte ne primjenjuje pomak, zato koristite mrežu koja pokriva lokaciju. **Prestanite koristiti mrežu** vraća grubi pomak. Svaka promjena je jedan korak: {{key:Mod+Z}} je poništava.

GIS slojevi koji su već u projektu ostaju gdje jesu kad se mreža promijeni; ponovo ih uvezite da bi se postavili kroz mrežu. Koordinate projekta se nikad ne pomjeraju.

## Šta je provjereno

- Svaka pretvorba je upoređena s PROJ-om (pyproj 3.7.1 s PROJ 9.5.1), koordinatnom bibliotekom koju koristi većina GIS programa, na preko 330 sistema: državne ravnine u američkim geodetskim stopama i stopama, UTM sjever i jug, Lambert-93, British National Grid, GDA2020 MGA, New Zealand Transverse Mercator i web Mercator među njima. Istočne i sjeverne koordinate se slažu do 1 cm uz isti pomak datuma (većina znatno ispod 1 mm), a matematika projekcije se slaže s PROJ-ovim vlastitim definicijama do 1 cm.
- `.prj` datoteke koje je napisao PROJ u oba uobičajena oblika (ESRI i OGC) pročitane su nazad za 105 sistema: 208 od 210 odgovaralo je tačno njihovoj EPSG šifri, a druga dva sistemu s istom matematikom na istom elipsoidu. `.prj` datoteke koje piše CivilCraft PROJ čita kao isti sistem. ESRI `.prj` datoteke za polarne stereografske sisteme (UPS, Aljaska polarna) ne mogu se pročitati; birajte te sisteme po šifri.
- Geografska širina i dužina u statusnoj traci odgovarale su PROJ-u do 0.01″ u pregledniku.
