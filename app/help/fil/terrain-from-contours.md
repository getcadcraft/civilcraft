---
title: Terrain mula sa contour lines
summary: Gumawa ng ibabaw ng lupa mula sa contour map: piliin ang mga layer ng linya, sabihin kung saan galing ang elevation ng bawat linya, i-check ang mga tawiran at duplicate, saka buuin. Nagiging breakline ang mga contour line, at naaayos ang mga flat triangle sa ridge at valley. Maaaring i-scale at ilagay ang mapang iginuhit mula sa larawan o PDF gamit ang dalawang kilalang punto.
keywords: contours, contour lines, terrain from contours, surface from contours, topographic map, survey map, walang coordinates, breaklines, flat triangles, ridge, valley, hilltop, nagtatawiran na contours, duplicate contours, contour interval, i-scale ang mapa, dalawang punto, ilagay ang mapa, DXF, DWG, shapefile
from: e6161653
---

Minsan nagpapadala ang surveyor ng contour map: mga linyang may elevation, pero walang punto. Gumagawa ang CivilCraft ng umiiral na lupa mula sa mga linyang iyon.

## Dalhin ang mga contour

Buksan ang mapa bilang linework: isang DXF o DWG drawing, shapefile o GeoJSON (**GIS** › {{ui:I-import}}, o i-drop ang file sa plan). Pumapasok ang mga linya bilang **map layers**. Sa ilalim ng **Surface** › {{ui:Higit pa}}, piliin ang {{ui:Terrain mula sa contours}}.

## Sabihin kung saan galing ang bawat elevation

Lagyan ng tsek ang mga layer na may contours, saka piliin ang **Elevation mula sa**:

- {{ui:Ang sariling elevation ng mga linya}}: linyang ang lahat ng vertex ay may parehong elevation (3D polyline, o polyline na may elevation). Ang linyang nasa 0 ay plan linework at walang level.
- Isang **number field** ng layer (halimbawa ELEV), kung may dalang ganito ang mapa.
- {{ui:Isang start at isang interval, ayon sa pagkakasunod ng mga linya sa listahan}}: para sa mga linyang walang elevation kahit isa. Ang unang nakalistang linya ay makakakuha ng **Elevation ng unang linya**, ang sumunod ay iyon plus ang **Contour interval**, at iba pa. Ilista ang mga linya mula sa pinakamababa paakyat (o ayusin muli sa layer).

## I-check, saka buuin

{{ui:Suriin}} ang naglilista kung ano ang mali, sa salita, bago magbago ang anuman:

- linyang **walang elevation** o may kulang sa dalawang point;
- isang **duplicate** na linya (parehong hugis na dalawang beses, kahit iginuhit sa kabaligtaran);
- dalawang linyang **nagtatawiran**, sa magkaibang elevation o sa iisang elevation (may linyang tumatawid din sa sarili), kasama ang lugar;
- isang elevation na **wala sa interval** (pagkakamali sa pag-type gaya ng 105.5 sa mapang may 1 m na interval).

Lagyan ng tsek ang {{ui:Huwag isama ang mga linyang tumatawid sa iba}} para itapon ang linyang tumatawid sa pinakamaraming iba (saka ang susunod, hanggang walang tumatawid): ang ligaw na linyang humihiwa sa bawat contour ang aalisin, hindi ang mga contour. Ang **Pasimplehin ang mga linya sa loob ng** ay nagpapanipis ng mga vertex na mas malapit sa tuwid na takbo kaysa sa distansyang iyon.

{{ui:Buuin ang ground}} ay idinadagdag ang mga linya sa umiiral na lupa bilang breakline (isang undo step), kaya dumadaan ang surface sa bawat contour nang eksakto. Kapag naka-tsek ang {{ui:Ayusin ang mga flat triangle sa ridges, valleys at hilltops}} at may ibinigay na interval, dinadagdagan din ng CivilCraft ng point ang loob ng bawat flat triangle (triangle na ang lahat ng sulok ay nasa iisang contour) sa taas na ipinagpapatuloy ng katabing slope, at hindi kailanman lalampas sa kalahating interval mula sa contour. Kung wala ito, lalabas ang mga tuktok ng ridge, ilalim ng valley at taluktok bilang patag na plato. Sa isang test hill, bumaba ng isang-kapat ang error laban sa totoong surface; sa ridge, bumaba ito ng 40 %.

## Mapang walang coordinates

Para sa contour map na iginuhit mula sa larawan o PDF, buksan ang **I-scale at ilagay ang mga layer gamit ang dalawang kilalang punto**. Magbigay ng dalawang punto sa mapa at kung nasaan talaga ang mga ito; ang mga naka-tsek na layer ay isinasaklaw, iniikot at inililipat para magkasya (isang undo step; hindi binabago ang mga taas). Ang parehong dalawang punto ang nagbibigay ng scale (ipinapakita sa mensahe) at ng rotation.

Kasing-husay ng mapa ang surface: sa pagitan ng dalawang contour ay isang plane, kaya hindi kilala ang totoong lupa sa pagitan nila. I-check ang resulta laban sa spot heights bago ito pagkatiwalaan.
