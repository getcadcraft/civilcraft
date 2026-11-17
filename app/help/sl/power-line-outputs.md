---
title: Tabele daljnovodov, količine, listi in GIS
summary: Tabele napenjanja in podpor, količine materiala za preglednico ali TakeoffCraft, tlorisni in vzdolžni listi s študijskim poročilom kot en PDF ter plasti GIS s podatki vsakega sredstva.
keywords: tabela napenjanja, tabela podpor, količine, kosovnica, takeoffcraft, listi, poročilo, pdf, vzdolžni list, gis, geopackage, shapefile, geojson, kml
from: bee6fb2d
---

Vse tukaj je pod {{ui:Več}} v skupini Daljnovodi.

| Izhod | Kaj dobite |
|---|---|
| {{ui:Tabele napenjanja …}} | Za vsak odsek vodoravna napetost in povesanje vsakega razpona pri vsaki temperaturi; shranite kot CSV. {{ui:Shrani tabelo drogov (CSV)}}: vloga vsake podpore, element, teren, pritrditev, največja obremenitev, nazivna, OK, predlog, temelj, zanihanje, dvig |
| {{ui:Količine …}} | Vodnik (dolžine verižnice × vodniki × tokokrogi + 2 % za premostitve in končne podpore), podpore in oprema po elementu knjižnice, kabel, jarek, izkop, kabelske cevi, spojke. CSV, Excel ali datoteka količin TakeoffCraft |
| {{ui:Listi in poročilo …}} | En PDF: tloris; vzdolžni list za vsako linijo z vodnikom pri obtežnih primerih, ki jih izberete, in trak dolžin razponov, povesanj in najnižjih odmikov; ter študijsko poročilo (nabor pravil, odseki, tabele napenjanja, podpore, vsa preverjanja) |
| {{ui:Izvozi v GIS …}} | Podpore, razponi, kabelske trase, oprema in ovire kot plasti s svojimi podatki (višine, obremenitve, povesanja, odmiki, kar ne ustreza), kot GeoPackage, shapefile, GeoJSON, KML ali KMZ |

GeoJSON in KML potrebujeta koordinatni sistem projekta ([Koordinatni sistemi](topic:coordinate-systems)); brez njega GeoPackage in shapefile nosita lastne številke projekta.
