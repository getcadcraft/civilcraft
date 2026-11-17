---
title: Podešavanje koordinatnog sistema projekta
summary: Reci u kom je koordinatnom sistemu geodetski snimak da CivilCraft prikaže geografsku širinu i dužinu, smesti GIS datoteke i slojeve karte i upiše .prj datoteke. Izaberi po kodu, po imenu, po samim koordinatama ili iz .prj datoteke.
keywords: koordinatni sistem, crs, epsg, srid, state plane, spcs, utm, nad83, wgs 84, projekcija, prj, wkt, datum, geografska širina, geografska dužina, lat long, geografski, mreža, georeferenciranje, georeferenciranje, dodeli koordinatni sistem
from: 964250e2
---

Koordinate projekta su obični brojevi dok ne kažeš šta znače. Podešavanje koordinatnog sistema **nikad ništa ne pomera**: CivilCraft samo saznaje da su, na primer, E 6,150,000 N 2,080,000 koordinate zone 6 Kalifornije (state plane) u američkim geodetskim stopama. Kad to sazna:

- statusna traka prikazuje geografsku širinu i dužinu pokazivača,
- GIS datoteke u drugim sistemima (shapefile, GeoJSON, GeoPackage, mreže kota, LiDAR) pretvaraju se u projekat pri otvaranju,
- slojevi karte mogu da se crtaju ispod plana ([Prikaz slojeva karte ispod plana](topic:map-layers)),
- izvozi u GIS formate nose sistem (`.prj` za shapefile, EPSG kod za GeoPackage i GeoTIFF).

## Izbor sistema

1. Izaberi {{ui:Koordinate}} u grupi {{ui:GIS}} na traci sa alatkama. Otvara se dijalog **Koordinatni sistem**. Na vrhu piše u kom je sistemu projekat sada, ili **Nema — koordinate su samo brojevi**.
2. Pronađi sistem na jedan od ovih načina:
   - **Pretraga**: unesi EPSG kod (`2277`, `EPSG:2277`) ili reči iz naziva (`texas central`, `utm 14n`, `lambert-93`). Kodovi se nabrajaju od onoga što si ukucao; reči nabrajaju sisteme čiji naziv sadrži sve reči.
   - {{ui:Sistemi kojima odgovaraju ove koordinate}} (kad projekat ima tačke ili površ): CivilCraft očitava sredinu projekta u svakom sistemu iste porodice jedinica i nabraja one čije područje primene je obuhvata. Koordinate state plane obično odgovaraju samo nekoliko zona: projekat u Teksasu na E 3,115,000 N 10,070,000 američkih geodetskih stopa odgovara četirima varijantama Texas Central (NAD83, NAD83(2011), HARN, NSRS2007). Svaki unos pokazuje gde bi bila sredina tvog projekta.
   - **Blizu (geografska širina, dužina)** i {{ui:Predloži}}: unesi gde je lokacija, na primer `30.27, -97.74` ili `30°16′N 97°44′W`, i CivilCraft nabraja projektovane sisteme čije područje je obuhvata, prvo nacionalne i državne mreže.
   - {{ui:Pročitaj .prj datoteku…}}: otvori `.prj` koji ide uz shapefile ili crtež. CivilCraft ga upoređuje sa svojim spiskom po proračunu projekcije (tako da `.prj` koji drugačije imenuje datum i dalje nađe pravi sistem) i kaže koji je; kad se ništa ne poklopi tačno, koristi se sopstveni opis datoteke. Možeš i da prevučeš `.prj` na dijalog ili da ga otvoriš ili prevučeš na sam plan.
3. Klikni sistem u spisku. Pod **Izabrano** prikazuje se naziv, EPSG kod, jedinica, koliko je dobro njegov datum vezan za WGS 84, područje primene u geografskoj širini i dužini i gde se u njemu nalazi sredina tvog projekta.
4. Ostavi izabrano **Mreža** (većina projekata; za ostale videti [Teren i lokalne koordinate](topic:ground-and-local-coordinates)) i izaberi {{ui:Primeni}}.

Statusna traka sada pored E i N prikazuje geografsku širinu i dužinu pokazivača. Podešavanje sistema je jedan korak za opozivanje: {{key:Mod+Z}} ga vraća.

:::note
Jedinice moraju da se poklapaju: projekat u stopama uzima sisteme u američkim geodetskim stopama ili međunarodnim stopama, a projekat u metrima uzima sisteme u metrima. CivilCraft objašnjava odbijanje („Projekat je u stopama, a ovaj sistem je u metrima…“). Projekat u stopama sa sistemom u američkim geodetskim stopama koristi geodetske stope: „ft“ projekta znači stopu sistema. Geografski sistemi (geografska širina i dužina, kao sam WGS 84) ne mogu biti sistem projekta: crteži traže istočne i severne koordinate.
:::

## Promena ili uklanjanje sistema

Ponovo otvori {{ui:Koordinate}}, izaberi drugi sistem i izaberi {{ui:Primeni}}. Kad projekat ima tačke ili projekat, CivilCraft pita **Da li su koordinate već u …?**

- {{ui:Da, ništa se ne pomera}}: brojevi ostaju kakvi jesu i menja se samo njihovo značenje. Koristi to kad je stari sistem izabran greškom.
- {{ui:Ne, pretvori ih}}: svaka geodetska tačka, linija loma, granica, PI trase, ugao plata i objekat pretvaraju se iz starog sistema u novi, u jednom koraku za opozivanje. Površ učitana iz LandXML-a kao trouglovi ne može da se pretvori; prvo je ponovo izgradi iz tačaka.

{{ui:Ukloni sistem}} uklanja sistem (ništa se ne pomera). GIS slojevi koji su već u projektu ostaju gde jesu.

## Geografska širina i dužina u statusnoj traci

Dok projekat ima sistem, statusna traka prikazuje geografsku širinu i dužinu pokazivača u WGS 84, na primer `30°18′00.00″ N  97°42′00.00″ W`. Umesto toga izaberi decimalne stepene pod {{ui:Podešavanja}}, {{ui:CivilCraft}}, **Geografska širina i dužina** ([podešavanja CivilCraft-a](topic:settings)). Uz teren ili lokalne koordinate, očitavanje prvo prolazi kroz taj korak, pa je tačno za tačku ispod pokazivača.

## Koliko je dobar pomak datuma

Geografska širina, dužina, GeoJSON i slojevi karte su svi u WGS 84. Vezu svakog sistema sa WGS 84 dijalog prikazuje ovako:

| Šta dijalog kaže | Šta to znači |
|---|---|
| WGS 84 itself | Nema nikakvog pomaka. |
| NAD83 is taken as WGS 84 | Njih dvoje se razlikuju za metar ili dva na većini Severne Amerike, najviše nekoliko metara. Dobro za slojeve karte i kontekst lokacije; nije za geodetsku mrežu. |
| Known to about *n* m (EPSG's figure) | Objavljen pomak; slojevi karte i GeoJSON mogu biti tačni do otprilike toliko. |
| Not known for this datum | Nema objavljenog pomaka bez datoteke mreže: slojevi karte i GeoJSON mogu biti pogrešni za stotine metara. |
| From the grid shift file … | Koristi se datoteka pomaka mreže (dole): unutar mreže do oko 10 cm od NAD83. |

Sopstvene koordinate projekta nikad ne prolaze kroz pomak datuma: prolazi samo ono što se pretvara u geografsku širinu i dužinu ili iz nje. Vertikalni datumi i modeli geoida nisu obrađeni (kote se nikad ne pretvaraju). Gde najbolji pomak zahteva datoteku mreže, spisak nosi grublji objavljeni pomak, a dijalog pokazuje njegovu tačnost (na primer, sistemi NAD27 oko 20 m), dok ne dodaš mrežu.

## Datoteke pomaka mreže

Za sistem NAD27, **Datoteka pomaka mreže** u dijalogu koordinatnog sistema dovodi geografsku širinu i dužinu, GIS datoteke i slojeve karte do oko 10 cm od NAD83, umesto oko 20 m:

- **Preuzmi** mrežu koju predlaže za područje sistema (NADCON5 za kontinentalne SAD, NADCON za Aljasku, NTv2 za Kanadu) sa cdn.proj.org, javnog servera mreža PROJ-a. Šalje se samo ime datoteke mreže.
- Ili **Dodaj datoteku mreže…** koju već imaš: NTv2 (`.gsb`) ili PROJ GeoTIFF mrežu (`.tif`), do 20 MB.

Mreža se čuva u datoteci projekta, pa putuje sa projektom. Odeljak kaže da li je sredina projekta unutar mreže: van nje se uopšte ne primenjuje pomak, zato koristi mrežu koja pokriva lokaciju. **Prestani da koristiš mrežu** vraća grubi pomak. Svaka promena je jedan korak: {{key:Mod+Z}} je poništava.

GIS slojevi koji su već u projektu ostaju gde jesu kad se mreža promeni; ponovo ih uvezi da bi bili smešteni preko mreže. Sopstvene koordinate projekta nikad se ne pomeraju.

## Šta je provereno

- Svako pretvaranje je upoređeno sa PROJ-om (pyproj 3.7.1 sa PROJ 9.5.1), koordinatnom bibliotekom koju koristi većina GIS programa, na preko 330 sistema: state plane u američkim geodetskim stopama i stopama, UTM sever i jug, Lambert-93, British National Grid, GDA2020 MGA, novozelandska poprečna Merkatorova i web Merkatorova, među ostalima. Istočne i severne koordinate se slažu do 1 cm uz isti pomak datuma (većina dobro ispod 1 mm), a proračuni projekcije se slažu sa PROJ-ovim sopstvenim definicijama do 1 cm.
- `.prj` datoteke koje je napisao PROJ u oba uobičajena oblika (ESRI i OGC) pročitane su nazad za 105 sistema: 208 od 210 se poklopilo sa tačnim EPSG kodom, a druga dva sa sistemom istih proračuna na istom elipsoidu. `.prj` datoteke koje CivilCraft piše PROJ čita kao isti sistem. ESRI `.prj` datoteke za polarne stereografske sisteme (UPS, polarna Aljaska) ne mogu da se pročitaju; takve sisteme biraj po kodu.
- Geografska širina i dužina u statusnoj traci poklapaju se sa PROJ-om do 0.01″ u pregledaču.
