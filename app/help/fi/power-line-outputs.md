---
title: Voimalinjojen taulukot, määrät, arkit ja GIS
summary: Vetotaulukot ja tukitaulukot, materiaalimäärät laskentataulukkoon tai TakeoffCraftiin, pohja- ja pituusleikkausarkit yhtenä PDF-tiedostona sekä GIS-tasot kaikkien kohteiden tiedoilla.
keywords: vetotaulukko, tukitaulukko, määrät, määräluettelo, takeoffcraft, arkit, raportti, pdf, pituusleikkausarkki, gis, geopackage, shapefile, geojson, kml
from: bee6fb2d
---

Kaikki tässä on kohdassa {{ui:Lisää}} Voimalinjat-ryhmässä.

| Tuloste | Mitä saat |
|---|---|
| {{ui:Vetotaulukot…}} | Osuuksittain vaakasuuntainen jännitys ja kunkin välin riippuma jokaisessa lämpötilassa; tallenna CSV:nä. {{ui:Tallenna pylväistaulukko (CSV)}}: kunkin tuen rooli, kohde, maanpinta, kiinnityspiste, suurin kuorma, nimellis, OK, ehdotus, perustus, heilahdus, nosto |
| {{ui:Määrät…}} | Johdin (riippukäyrän pituudet × johtimet × piirit + 2 % hyppyjohtimille ja päätetuille), tuet ja laitteet kirjastokohteittain, kaapeli, kaivanto, kaivu, suojaputket, liitokset. CSV, Excel tai TakeoffCraftin määrätiedosto |
| {{ui:Arkit ja raportti…}} | Yksi PDF: pohjakuva; pituusleikkausarkki jokaiselle linjalle, johon johdin on valittujen kuormitustapausten mukaan, sekä kaista välien pituuksista, riipumista ja alimmista selvityksistä; ja selvitysraportti (sääntöjoukko, osuudet, vetotaulukot, tuet, jokainen tarkistus) |
| {{ui:Vie GIS:lle…}} | Tuet, välit, kaapelireitit, laitteet ja esteet tasoina niiden tietoineen (korkeudet, kuormat, riippumat, selvitykset, mikä epäonnistuu), GeoPackage-, shapefile-, GeoJSON-, KML- tai KMZ-muodossa |

GeoJSON ja KML tarvitsevat projektin koordinaatistojärjestelmän ([Koordinaatistot](topic:coordinate-systems)). Ilman sitä GeoPackage- ja shapefile-tiedostot kantavat projektin omat luvut.
