---
title: Pregled orodne vrstice
summary: Vsak gumb orodne vrstice v CivilCraftu, kaj počne, njegova bližnjica ter kdaj je zatemnjen ali zavrne delovanje.
keywords: orodna vrstica, gumbi, ukazi, orodja, datoteka, izvoz, površje, zasnova, urejanje, pogled, meni
from: 4c4352bc
---

Orodna vrstica teče čez vrh programa v sedmih skupinah. Vsak gumb ob premiku miške nad njim prikaže svoj namig in bližnjico.

## Datoteka

| Gumb | Bližnjica | Kaj naredi |
|---|---|---|
| {{ui:Novo}} | ni | Začne prazen projekt. Če so neshranjene spremembe, najprej vpraša. |
| {{ui:Odpri}} | {{key:Mod+O}} | Odpre datoteko točk (CSV, TXT), LandXML ali projekt CivilCraft. |
| {{ui:Shrani}} | {{key:Mod+S}} | Prenese projekt kot `<name>.civilcraft.json`. |

## Izvoz

| Gumb | Bližnjica | Kaj naredi |
|---|---|---|
| {{ui:LandXML}} | ni | Prenese `<name>.xml`: točke, površja, trase, profile in omrežje cevi kot LandXML 1.2. „Za izvoz še ni ničesar.“ ob praznem projektu. |
| {{ui:DXF}} | ni | Prenese `<name>.dxf`: črtovje tlorisa kot R12 DXF. |
| {{ui:PDF}} | {{key:Mod+P}} | Odpre **Izris tlorisa v PDF**. „Za izris še ni ničesar.“ ob praznem projektu. |

## Površje

| Gumb | Bližnjica | Kaj naredi |
|---|---|---|
| {{ui:Prelomnica}} | {{key:B}} | Kliknite geodetske točke po vrsti, {{key:Enter}} zaključi. Prelomnica prevzame višine točk. |
| {{ui:Meja}} | {{key:O}} | Kliknite oglišča zunanje meje, {{key:Enter}} zaključi. Nadomesti katero koli mejo. |

Obe ob odsotnosti površja prikažeta „Površja še ni: najprej odprite geodetske točke.“

## Zasnova

| Gumb | Bližnjica | Kaj naredi |
|---|---|---|
| {{ui:Trasa}} | {{key:A}} | Kliknite lomne točke (PI) po vrsti, {{key:Enter}} zaključi. |
| {{ui:Ploščad}} | {{key:G}} | Kliknite oglišča ploščadi, {{key:Enter}} zaključi. Kot orodja za površje opozarja, kadar površja ni; ploščad se izravnava le na površju. |
| {{ui:Cevi}} | {{key:P}} | Klikajte objekte od zgornjega toka navzdol (klik na obstoječi se ga pridruži), {{key:Enter}} zaključi. |
| {{ui:Vzdolžni profil}} | {{key:R}} | Prikaže ali skrije pogled profila pod tlorisom. |

## Urejanje

| Gumb | Bližnjica | Kaj naredi |
|---|---|---|
| {{ui:Razveljavi}} | {{key:Mod+Z}} | Razveljavi zadnjo spremembo (do 200). Zatemnjeno, kadar ni ničesar za razveljavitev. |
| {{ui:Uveljavi}} | {{key:Mod+Y}} | Uveljavi, kar je bilo razveljavljeno. Zatemnjeno, kadar ni ničesar za uveljavitev. |
| {{ui:Kopiraj}} | {{key:Mod+C}} | Kopira izbrane geodetske točke in jih da na odložišče kot vrstice točk, ki jih lahko sprejme preglednica. Zatemnjeno, dokler točke niso izbrane. |
| {{ui:Prilepi}} | {{key:Mod+V}} | Prilepi točke: sledijo kazalcu, klik jih odloži s številkami, ki jih nobena druga točka nima. Vrstice točk, kopirane v preglednici, se prav tako prilepijo. |
| {{ui:Več}} | ni | Odpre spodnji meni. |

Meni {{ui:Več}}:

| Postavka | Bližnjica | Kaj naredi |
|---|---|---|
| {{ui:Izreži}} | {{key:Mod+X}} | Kopira izbrane točke in jih izbriše (en korak razveljavitve). |
| {{ui:Kopiraj}} | {{key:Mod+C}} | Kot gumb {{ui:Kopiraj}}. |
| {{ui:Prilepi}} | {{key:Mod+V}} | Kot gumb {{ui:Prilepi}}. |
| {{ui:Prilepi na isto mesto}} | {{key:Mod+Shift+V}} | Prilepi točke na njihove lastne koordinate s številkami, ki jih nobena druga točka nima. |
| {{ui:Podvoji}} | {{key:Mod+D}} | Kopija izbranih točk sledi kazalcu; kliknite, kamor naj gre. Odložišče ostane nedotaknjeno. |
| {{ui:Izbriši}} | {{key:Delete}} | Izbriše izbrane geodetske točke ali izbrano trasa, ploščad, objekt (z njegovimi cevmi), cev ali PVI. |
| {{ui:Izberi vse točke}} | {{key:Mod+A}} | Izbere vse geodetske točke. |
| {{ui:Prekliči izbor}} | {{key:Esc}} | Počisti izbor. |

Postavka, ki zdaj ne more delovati, je zatemnjena, njen namig pa pove, zakaj. Podrobnosti: [Izbira, kopiranje in lepljenje geodetskih točk](topic:copy-paste-points).

Razveljavitev zajema urejanje zasnove, nastavitev površja in geodetskih točk (prilepi, izreži, podvoji, izbriši). Ne zajema nastavitev prikaza; odpiranje ali uvoz katere koli datoteke pa jo izbriše.

## GIS

| Gumb | Bližnjica | Kaj naredi |
|---|---|---|
| {{ui:Koordinate}} | ni | Odpre pogovorno okno **Koordinatni sistem**: povejte, v katerem sistemu je projekt, ali uporabite terenske ali lokalne koordinate. Glejte [Nastavitev koordinatnega sistema projekta](topic:coordinate-systems) in [Terenske in lokalne koordinate](topic:ground-and-local-coordinates). |
| {{ui:Uvozi}} | ni | Uvozi podatke GIS: shapefile, GeoJSON, GeoPackage, mreže višin in LiDAR. Glejte [Uvoz podatkov GIS](topic:gis-import). |
| {{ui:Izvozi}} | ni | Izvozi podatke izvedenega stanja za oddelek GIS. Glejte [Izvoz podatkov izvedenega stanja za GIS](topic:gis-export). |
| {{ui:Analiziraj}} | ni | Odpre podokno analize GIS: pas okoli (buffer), prekrivanje, prostorsko združevanje, izbira po atributu, merjenje. Glejte [Analiza slojev GIS](topic:gis-analysis). |
| {{ui:Tabela atributov}} | ni | V Površje › Več. Odpre tabelo atributov sloja GIS: razvrščanje, filtriranje, izbira, urejanje, dodajanje polj, računanje, shranjevanje kot CSV. Glejte [Delo s tabelo atributov sloja](topic:gis-table). |
| {{ui:Zemljevid}} | ni | Odpre pogovorno okno **Kartni sloji**: georeferencirano sliko ali strežnike zemljevidov, ki jih dodate, narisane pod tlorisom. Glejte [Prikaz kartnih slojev pod tlorisom](topic:map-layers). |

Orodja GIS se naložijo ob prvi uporabi teh gumbov, ob odprtju datoteke GIS ali ob odprtju projekta, ki ima koordinatni sistem ali sloje GIS.

## Pogled

| Gumb | Bližnjica | Kaj naredi |
|---|---|---|
| {{ui:Izberi}} | {{key:V}} ali {{key:Esc}} | Kliknite za izbiro tras, ploščad, objektov, cevi in točk ({{key:Shift}} in klik ali vlečenje dodata točke); povlecite ročice, da premaknete PI, oglišča ploščadi in objekte. |
| {{ui:Prilagodi}} | {{key:F}} | Poveča tloris, da prikaže površje, točke, trase in ploščadi (v pogledu 3D: prikaže vse). |
| {{ui:3D}} | {{key:D}} | Prikaže lokacijo v 3D nad tlorisom ali se vrne na tloris. Vrstica nad pogledom 3D nastavi pogled, navpično povečavo, barvanje in to, kaj se prikaže, ter izvozi GLB ali OBJ. Glejte [Ogled lokacije v 3D](topic:site-3d). |

## Gumbi v podoknih

| Gumb | Kje | Kaj naredi |
|---|---|---|
| {{ui:Odpri vzorčno lokacijo}} | Okvir na praznem tlorisu | Naloži vzorčni geodetski posnetek (potrebuje povezavo, razen če je CivilCraft shranjen za delo brez povezave) |
| {{ui:Odstrani mejo}} | Levo podokno, Površje | Odstrani zunanjo mejo |
| {{ui:Odstrani narisane prelomnice}} | Levo podokno, Površje | Odstrani vse prelomnice, narisane z orodjem (ne skupin prelomnic) |
| {{ui:Obnovi površje iz točk}} | Levo podokno, Površje (samo površje LandXML) | Opusti TIN LandXML in zgradi iz točk; ni mogoče razveljaviti |
| {{ui:Začni s terena}} | Desno podokno, Trasa | Začne projektni profil z lomno točko vzdolžnega profila (PVI) na terenu na vsakem koncu |
| {{ui:Pogled profila}} | Desno podokno, Trasa | Odpre pogled profila za to trasa |
| {{ui:Dodaj lomne točke}} | Vrstica profila | Dokler je pritisnjeno, klik v profilu doda PVI |
| {{ui:Nastavi vsa dna cevi po pravilih}} | Desno podokno, Omrežje cevi | Nastavi dna vseh cevi po pravilih |
| {{ui:Nastavi njena dna po pravilih}} | Desno podokno, Cev | Nastavi dna te cevi po pravilih |
