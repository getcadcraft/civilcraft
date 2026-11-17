---
title: Nastavitev koordinatnega sistema projekta
summary: Določite, v katerem koordinatnem sistemu je izmera, da CivilCraft prikaže zemljepisno širino in dolžino, postavi datoteke GIS in kartne plasti ter zapisuje datoteke .prj. Sistem izberite po kodi, imenu, samih koordinatah ali iz datoteke .prj.
keywords: koordinatni sistem, crs, epsg, srid, državna ravninska mreža, spcs, utm, nad83, wgs 84, projekcija, prj, wkt, datum, zemljepisna širina, zemljepisna dolžina, lat long, zemljepisni, mreža, georeferenciranje, georeference, dodelitev koordinatnega sistema
from: 964250e2
---

Koordinate projekta so zgolj številke, dokler ne povete, kaj pomenijo. Nastavitev koordinatnega sistema **ničesar ne premakne**: CivilCraft samo ve, da so na primer E 6,150,000 N 2,080,000 koordinate državne ravninske mreže cone 6 v Kaliforniji v ameriških geodetskih čevljih (US survey feet). Ko to ve:

- vrstica stanja prikaže zemljepisno širino in dolžino kazalca,
- datoteke GIS v drugih sistemih (shapefile, GeoJSON, GeoPackage, mreže višin, LiDAR) se ob odprtju pretvorijo v projekt,
- kartne plasti se lahko izrišejo pod načrtom ([Prikaz kartnih plasti pod načrtom](topic:map-layers)),
- izvozi v formate GIS nosijo sistem (`.prj` za shapefile, koda EPSG za GeoPackage in GeoTIFF).

## Izberite sistem

1. Na orodni vrstici v skupini {{ui:GIS}} izberite {{ui:Koordinate}}. Odpre se pogovorno okno Koordinatni sistem. Na vrhu piše, v katerem sistemu je projekt zdaj, ali **Brez — koordinate so le številke**.
2. Sistem poiščite na enega od teh načinov:
   - **Iskanje**: vpišite kodo EPSG (`2277`, `EPSG:2277`) ali besede iz imena (`texas central`, `utm 14n`, `lambert-93`). Kode se seznamijo glede na to, kar ste vpisali; besede izpišejo sisteme, katerih ime vsebuje vse besede.
   - {{ui:Sistemi, ki ustrezajo tem koordinatam}} (ko ima projekt točke ali površje): CivilCraft prebere sredino vašega projekta v vseh sistemih enote projekta in navede tiste, na območju katerih ta leži. Koordinate državne ravninske mreže običajno ustrezajo le nekaterim conam: projekt v Teksasu pri E 3,115,000 N 10,070,000 ameriških geodetskih čevljih ustreza štirim različicam Texas Central (NAD83, NAD83(2011), HARN, NSRS2007). Vsak vnos prikaže, kje bi bila sredina vašega projekta.
   - **Blizu (zem. širina, dolžina)** in {{ui:Predlagaj}}: vpišite, kje je lokacija, na primer `30.27, -97.74` ali `30°16′N 97°44′W`, in CivilCraft navede projekcijske sisteme, na območju katerih leži; najprej nacionalne in državne mreže.
   - {{ui:Preberi datoteko .prj …}}: odprite `.prj`, ki je prišel s shapefile ali risbo. CivilCraft ga ujame v seznamu po projekcijskih izračunih (tako da datoteka `.prj`, ki datum poimenuje drugače, vseeno najde pravi sistem) in pove, kateri je; ko se nič ne ujema natančno, se uporabi lastni opis datoteke. Datoteko `.prj` lahko tudi povlečete na pogovorno okno ali pa jo odprete ali povlečete na sam načrt.
3. Kliknite sistem v seznamu. Pod **Izbrano** so prikazani ime, koda EPSG, enota, kako dobro je njegov datum vezan na WGS 84, območje uporabe v zemljepisni širini in dolžini ter kje v njem leži sredina vašega projekta.
4. Pustite izbrano **Mreža** (večina projektov; za druge glejte [Teren in lokalne koordinate](topic:ground-and-local-coordinates)) in izberite {{ui:Uporabi}}.

Vrstica stanja zdaj poleg E in N prikazuje zemljepisno širino in dolžino kazalca. Nastavitev sistema je en korak razveljavitve: {{key:Mod+Z}} jo razveljavi.

:::note
Enote morajo ujemati: projekt v čevljih sprejme sisteme v ameriških geodetskih čevljih ali mednarodnih čevljih, projekt v metrih pa sisteme v metrih. CivilCraft razloži zavrnitev ("Projekt je v čevljih, ta sistem pa je v metrih …"). Projekt v čevljih z ameriškim geodetskim čevljem uporablja geodetske čevlje: "ft" v projektu pomeni čevelj sistema. Zemljepisni sistemi (zemljepisna širina in dolžina, kot sam WGS 84) ne morejo biti sistem projekta: risbe potrebujejo vzhodne in severne koordinate.
:::

## Spremenite ali odstranite sistem

Ponovno odprite {{ui:Koordinate}}, izberite drug sistem in izberite {{ui:Uporabi}}. Kadar ima projekt točke ali načrt, CivilCraft vpraša **So koordinate že v …?**

- {{ui:Da — nič se ne premakne}}: številke ostanejo take, kot so, spremeni se le njihov pomen. Uporabite, ko je bil stari sistem izbran pomotoma.
- {{ui:Ne — pretvori jih}}: vsaka geodetska točka, prelomnica, meja, PI trase, oglišče ploščadi in objekt se pretvorijo iz starega v novi sistem v enem koraku razveljavitve. Površja, prebranega iz LandXML kot trikotniki, ni mogoče pretvoriti; najprej ga znova izdelajte iz točk.

{{ui:Odstrani sistem}} odstrani sistem (nič se ne premakne). Sloji GIS, ki so že v projektu, ostanejo tam, kjer so.

## Zemljepisna širina in dolžina v vrstici stanja

Dokler ima projekt sistem, vrstica stanja prikazuje zemljepisno širino in dolžino kazalca v WGS 84, na primer `30°18′00.00″ N  97°42′00.00″ W`. Namesto tega izberite decimalne stopinje pod {{ui:Nastavitve}}, {{ui:CivilCraft}}, **Zemljepisna širina in dolžina** ([Nastavitve CivilCraft](topic:settings)). Pri terenskih ali lokalnih koordinatah odčitek najprej opravi ta korak, zato je pravilen za točko pod kazalcem.

## Kako dober je premik datuma

Zemljepisna širina, dolžina, GeoJSON in kartne plasti so vsi v WGS 84. Vezava vsakega sistema na WGS 84 je prikazana v pogovornem oknu:

| Kaj piše v pogovornem oknu | Kaj to pomeni |
|---|---|
| WGS 84 sam | Premika ni. |
| NAD83 je vzet kot WGS 84 | Oba se razlikujeta za meter ali dva na večini Severne Amerike, največ nekaj metrov. Primerno za kartne plasti in kontekst lokacije; ne za geodetsko kontrolo. |
| Znano na približno *n* m (podatek EPSG) | Objavljen premik; kartne plasti in GeoJSON se lahko razlikujejo za približno toliko. |
| Za ta datum ni znano | Brez datoteke mreže premika ni objavljenega premika: kartne plasti in GeoJSON se lahko razlikujejo za stotine metrov. |
| Iz datoteke premika mreže … | Uporablja se datoteka premika mreže (spodaj): znotraj mreže v približno 10 cm od NAD83. |

Lastne koordinate projekta nikoli ne gredo skozi premik datuma: gre le tisto, kar se pretvarja v zemljepisno širino in dolžino ali iz nje. Navpični datumi in modeli geoida niso obravnavani (višine se nikoli ne pretvarjajo). Kjer najboljši premik potrebuje datoteko mreže, seznam prinaša grobejši objavljeni premik, pogovorno okno pa prikaže njegovo natančnost (na primer za sisteme NAD27 približno 20 m), dokler ne dodate mreže.

## Datoteke premika mreže

Za sistem NAD27 **Datoteka premika mreže** v pogovornem oknu koordinatnega sistema postavi zemljepisno širino, dolžino, datoteke GIS in kartne plasti v približno 10 cm od NAD83 namesto približno 20 m:

- **Prenesite** mrežo, ki jo predlaga za območje sistema (NADCON5 za sklenjeni del ZDA, NADCON za Aljasko, NTv2 za Kanado), s cdn.proj.org, javnega strežnika mrež PROJ. Pošlje se le ime datoteke mreže.
- Ali **Dodajte datoteko mreže …**, ki jo že imate: NTv2 (`.gsb`) ali mreža PROJ GeoTIFF (`.tif`), do 20 MB.

Mreža se shrani v datoteko projekta, zato potuje s projektom. Razdelek pove, ali je sredina projekta znotraj mreže: zunaj nje se premik sploh ne uporabi, zato uporabite mrežo, ki pokriva lokacijo. **Nehajte uporabljati mrežo** se vrne na grob premik. Vsaka sprememba je en korak: {{key:Mod+Z}} jo razveljavi.

Sloji GIS, ki so že v projektu, ostanejo tam, kjer so, ko se mreža spremeni; uvozite jih znova, da jih postavite prek mreže. Lastne koordinate projekta se nikoli ne premaknejo.

## Kaj je bilo preverjeno

- Vsaka pretvorba je bila primerjana s PROJ (pyproj 3.7.1 s PROJ 9.5.1), knjižnico koordinat, ki jo uporablja večina programov GIS, na več kot 330 sistemih: državna ravninska mreža v ameriških geodetskih čevljih in čevljih, UTM sever in jug, Lambert-93, British National Grid, GDA2020 MGA, New Zealand Transverse Mercator in spletni Mercator, med drugimi. Vzhodne in severne koordinate se ujemajo na 1 cm z istim premikom datuma (večina na dobro pod 1 mm), projekcijski izračuni pa se ujemajo z lastnimi definicijami PROJ na 1 cm.
- Datoteke `.prj`, ki jih PROJ zapiše v obeh običajnih oblikah (ESRI in OGC), so bile prebrane nazaj za 105 sistemov: 208 od 210 se je ujelo z natančno kodo EPSG, drugi dve pa s sistemom z enakimi izračuni na istem elipsoidu. Datoteke `.prj`, ki jih zapiše CivilCraft, PROJ prebere kot isti sistem. Datotek ESRI `.prj` za polarne stereografske sisteme (UPS, polarna Aljaska) ni mogoče prebrati; take sisteme izberite po kodi.
- Zemljepisna širina in dolžina v vrstici stanja sta se v brskalniku ujemali s PROJ na 0.01″.
