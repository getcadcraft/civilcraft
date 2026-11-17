---
title: Inženierkomunikāciju tīkli un OpenStreetMap
summary: Ūdens, kanalizācijas, lietus ūdens, gāzes, elektrības un sakaru posmi ar materiālu, izmēru, segumu un īpašnieku; OpenStreetMap dati no Overpass JSON faila; krustojumi, tranšeju griezumi un apjomi; pakalpojumu slāņi DWG, DXF un PDF formātos; IFC cauruļvadu un kabeļu segmenti.
keywords: komunikācijas, inženierkomunikācijas, tīkls, osm, openstreetmap, overpass, caurule, kabelis, gāze, kanalizācija, lietus ūdens, sakari, elektrība, ūdens, hidrants, revīzijas aka, tranšeja, krustojums, brīvais augstums, segums, dziļums, dwg, ifc, georeferencēts, slāņi
from: 8a85dace
---

Zīmējiet teritorijas apakšzemes pakalpojumus kā vienu tīklu katram pakalpojumam, pārbaudiet, kur tie krustojas, un eksportējiet tos rasējuma slāņos un IFC formātā.

## Veidot posmus

Atveriet **Virsma, Vairāk, Inženierkomunikāciju tīkli...**

- **Izveidot posmu no atlases** pārvērš atlasīto trasi, elementa līniju vai cauruli izvēlētā pakalpojuma posmā. Pēc tam tabulā aizpildiet materiālu, izmēru (mm), segumu (attālumu līdz caurules vai kabeļa augšējai daļai) un īpašnieku.
- **Nolasīt OpenStreetMap datus** nolasa jūsu saglabātu Overpass JSON failu (vaicājums ar `out geom;`). Projektam vispirms jābūt koordinātu sistēmai, jo OpenStreetMap pozīcijas ir platuma un garuma grādi. Tiek nolasīti cauruļvadi (pēc vielas), pazemes elektrības un sakaru kabeļi, hidranti, revīzijas akas un lietus ūdens notekas. Viss pārējais tiek uzskatīts par izlaistu, un par to ziņojumā ir paziņots. Gaisvadu līnijas tiek izlaistas.
- **Pievienot OpenStreetMap karti** pievieno OpenStreetMap karti zem plāna. Tā tiek zīmēta tikai tad, ja iestatījumos ir ieslēgti kartes slāņi no interneta.

## Pārbaudes un izvades

- **Krustojumi**: sarakstā ir uzskaitīti dažādu pakalpojumu posmi, kas krustojas plānā, ar brīvo augstumu starp tiem, ja ir zemes virsma. Minimālā vērtība ir jūsu iestatīta pagaidu vērtība, nevis standarta skaitlis.
- **Tranšeja**: katram posmam tiek izveidota tranšeja (caurules izmērs plus brīvā zona katrā pusē, nogāzes slīpums, gultne) ar tilpumu. Kopējais tilpums tiek rādīts logā un CSV failā.
- **Rasējums**: posmi un punkti atrodas pakalpojumu slāņos (piemēram, U-WATR-RUN, U-POWR-RUN), tāpēc tie nonāk PDF, DXF un DWG formātos.
- **IFC**: posmi tiek iekļauti IFC eksportā kā cauruļvadu segmenti un kabeļu segmenti, kā arī hidranti, vārsti un kameras, ar vienu sistēmu katram pakalpojumam projekta koordinātu sistēmā.

## OpenStreetMap dati

OpenStreetMap datu autortiesības pieder OpenStreetMap līdzstrādniekiem, un tie ir licencēti saskaņā ar ODbL. Atsauce tiek pievienota rasējumam, CSV failam un IFC failam. Ja kopīgojat failu, kurā ir OpenStreetMap dati, saglabājiet atsauci un ievērojiet licences nosacījumus par koplietošanu ar tādiem pašiem nosacījumiem.

## Kas vēl nav izdarīts

Posmus plānā vēl nevar zīmēt punktu pa punktam ar rīku, un krustojumi vēl netiek zīmēti profila skatā (aprēķins ir izveidots). Dziļumi, izmēri un brīvās zonas sākotnēji ir pagaidu vērtības: izmantojiet sava standarta skaitļus.
