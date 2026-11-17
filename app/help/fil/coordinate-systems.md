---
title: Itakda ang coordinate system ng project
summary: Sabihin kung nasaang coordinate system ang survey, para maipakita ng CivilCraft ang latitude at longitude, mailagay ang GIS files at map layers, at makasulat ng .prj files. Pumili ayon sa code, pangalan, mismong coordinates, o mula sa .prj file.
keywords: coordinate system, sistema ng coordinates, crs, epsg, srid, state plane, spcs, utm, nad83, wgs 84, projection, prj, wkt, datum, latitude, longitude, lat long, geographic, grid, georeference, georeferencing, magtakda ng coordinate system
from: 964250e2
---

Simpleng numero lamang ang coordinates ng project hangga't hindi mo sinasabi kung ano ang ibig sabihin ng mga ito. Hindi kailanman gumagalaw ng anuman ang pagtatakda ng coordinate system: sinasabi nito sa CivilCraft na, halimbawa, ang E 6,150,000 N 2,080,000 ay California zone 6 state plane coordinates sa US survey feet. Kapag alam na nito:

- ipinapakita ng status bar ang latitude at longitude ng pointer,
- ang GIS files sa ibang sistema (shapefiles, GeoJSON, GeoPackage, elevation grids, LiDAR) ay kino-convert papasok sa project habang nagbubukas,
- maaaring iguhit ang map layers sa ilalim ng plano ([Ipakita ang map layers sa ilalim ng plano](topic:map-layers)),
- ang exports sa GIS formats ay nagdadala ng sistema (isang `.prj` para sa shapefiles, ang EPSG code para sa GeoPackage at GeoTIFF).

## Piliin ang sistema

1. Piliin ang {{ui:Coordinates}} sa {{ui:GIS}} group ng toolbar. Bubukas ang **Coordinate system** dialog. Sa itaas nito, sinasabi kung nasaang sistema ang project ngayon, o **Wala — mga numero lang ang coordinates**.
2. Hanapin ang sistema sa isa sa mga paraang ito:
   - **Search**: mag-type ng EPSG code (`2277`, `EPSG:2277`) o mga salita mula sa pangalan (`texas central`, `utm 14n`, `lambert-93`). Nagsisimulang ilista ang codes mula sa tinype mo; inililista ng mga salita ang mga sistemang may lahat ng salita sa pangalan.
   - {{ui:Systems these coordinates fit}} (kapag may punto o surface ang project): binabasa ng CivilCraft ang gitna ng project sa bawat sistema ng unit family ng project at inililista ang mga sistemang sakop ang lugar nito. Karaniwang akma ang state plane coordinates sa iilang zone lamang: ang project sa Texas sa E 3,115,000 N 10,070,000 US survey feet ay akma sa apat na Texas Central variants (NAD83, NAD83(2011), HARN, NSRS2007). Ipinapakita ng bawat entry kung saan mapupunta ang gitna ng project.
   - **Near (lat, long)** at {{ui:Suggest}}: mag-type kung nasaan ang site, halimbawa `30.27, -97.74` o `30°16′N 97°44′W`, at inililista ng CivilCraft ang projected systems na sakop ang lugar, nauuna ang national at state grids.
   - {{ui:Read a .prj file…}}: buksan ang `.prj` na kasama ng shapefile o drawing. Itinutugma ito ng CivilCraft sa listahan nito ayon sa projection maths (kaya ang `.prj` na iba ang pangalan ng datum ay makikita pa rin ang tamang sistema) at sinasabi kung alin ito; kapag walang eksaktong tugma, ginagamit ang sariling deskripsyon ng file. Maaari ka ring mag-drop ng `.prj` sa dialog, o buksan o i-drop ito sa plano mismo.
3. I-click ang isang sistema sa listahan. Sa ilalim ng **Chosen**, ipinapakita nito ang pangalan, EPSG code, unit, kung gaano kahusay nakatali ang datum nito sa WGS 84, ang sakop na lugar sa latitude at longitude, at kung saan nahuhulog ang gitna ng project dito.
4. Iwanang nakapili ang **Grid** (para sa karamihan ng project; tingnan ang [Ground at local coordinates](topic:ground-and-local-coordinates) para sa iba) at piliin ang {{ui:Apply}}.

Ipinapakita na ngayon ng status bar ang latitude at longitude ng pointer sa tabi ng E at N. Isang undo step ang pagtatakda ng sistema: ibinabalik ito ng {{key:Mod+Z}}.

:::note
Dapat magtugma ang mga unit: ang project sa feet ay tumatanggap ng sistemang nasa US survey feet o international feet, ang project sa metro ay tumatanggap ng sistemang nasa metro. Ipinapaliwanag ng CivilCraft ang pagtanggi ("Ang project ay nasa feet pero ang sistemang ito ay nasa meters…"). Ang feet project na may US survey foot system ay gumagamit ng survey feet: ang "ft" ng project ay ang foot ng sistema. Hindi maaaring maging sistema ng project ang geographic systems (latitude at longitude, gaya ng mismong WGS 84): kailangan ng drawings ang easting at northing.
:::

## Palitan o alisin ang sistema

Buksan muli ang {{ui:Coordinates}}, pumili ng ibang sistema at piliin ang {{ui:Apply}}. Kapag may punto o disenyo ang project, nagtatanong ang CivilCraft: **Nasa … na ba ang coordinates?**

- {{ui:Yes — nothing moves}}: nananatili ang mga numero at tanging kahulugan nila ang nagbabago. Gamitin ito kapag mali ang napiling lumang sistema.
- {{ui:No — convert them}}: bawat survey point, breakline, hangganan, alignment PI, pad corner at structure ay kino-convert mula sa lumang sistema papunta sa bago, sa isang undo step. Hindi maaaring i-convert ang surface na nabasa mula sa LandXML bilang triangles; buuin muna ito mula sa mga punto.

Inaalis ng {{ui:Remove the system}} ang sistema (walang gumagalaw). Mananatili sa kinalalagyan nila ang GIS layers na nasa project na.

## Latitude at longitude sa status bar

Habang may sistema ang project, ipinapakita ng status bar ang latitude at longitude ng pointer sa WGS 84, halimbawa `30°18′00.00″ N  97°42′00.00″ W`. Pumili ng decimal degrees sa halip sa ilalim ng {{ui:Settings}}, {{ui:CivilCraft}}, **Latitude and longitude** ([Mga setting ng CivilCraft](topic:settings)). Kapag ground o local coordinates ang gamit, dumadaan muna sa hakbang na iyon ang readout, kaya tama ito para sa puntong nasa ilalim ng pointer.

## Gaano kahusay ang datum shift

Ang latitude, longitude, GeoJSON at map layers ay lahat nasa WGS 84. Ipinapakita sa dialog ang tali ng bawat sistema sa WGS 84:

| Sinasabi ng dialog | Ang ibig sabihin nito |
|---|---|
| WGS 84 itself | Walang shift. |
| NAD83 is taken as WGS 84 | Magkaiba ang dalawa ng isa o dalawang metro sa karamihan ng North America, ilang metro man lang. Mabuti para sa map layers at site context; hindi para sa survey control. |
| Known to about *n* m (EPSG's figure) | Isang nailathalang shift; maaaring mali ng halos ganoon ang map layers at GeoJSON. |
| Not known for this datum | Walang nailathalang shift kung walang grid file: maaaring mali ng daan-daang metro ang map layers at GeoJSON. |
| From the grid shift file … | Ginagamit ang grid shift file (sa ibaba): nasa loob ng halos 10 cm mula sa NAD83 sa loob ng grid. |

Hindi kailanman dumadaan sa datum shift ang sariling coordinates ng project: tanging ang kino-convert papunta o mula sa latitude at longitude ang dumadaan. Hindi hinahawakan ang vertical datums at geoid models (hindi kailanman kino-convert ang elevations). Kapag ang pinakamahusay na shift ay nangangailangan ng grid file, may dalang mas magaspang na nailathalang shift ang listahan at ipinapakita ng dialog ang accuracy nito (halimbawa, mga 20 m para sa NAD27 systems), hanggang madagdagan mo ang grid.

## Grid shift files

Para sa NAD27 system, inilalapit ng **Grid shift file** sa coordinate system dialog ang latitude at longitude, GIS files at map layers sa loob ng halos 10 cm mula sa NAD83, sa halip na halos 20 m:

- **Download** ng grid na iminumungkahi nito para sa lugar ng sistema (NADCON5 para sa conterminous United States, NADCON para sa Alaska, NTv2 para sa Canada) mula sa cdn.proj.org, ang public grid server ng PROJ. Ang pangalan lamang ng file ng grid ang ipinapadala.
- O **Add a grid file…** kung mayroon ka na: NTv2 (`.gsb`) o PROJ GeoTIFF grid (`.tif`), hanggang 20 MB.

Naka-save ang grid sa project file, kaya kasama ito sa project. Sinasabi ng seksyon kung nasa loob ng grid ang gitna ng project: kapag nasa labas, walang shift na ilalapat, kaya gumamit ng grid na sumasaklaw sa site. Ang **Stop using the grid** ay bumabalik sa magaspang na shift. Bawat pagbabago ay isang hakbang: iuundo ito ng {{key:Mod+Z}}.

Mananatili sa kinalalagyan nila ang GIS layers na nasa project kapag nagbago ang grid; i-import silang muli para mailagay sila sa pamamagitan ng grid. Hindi kailanman gumagalaw ang sariling coordinates ng project.

## Ano ang sinuri

- Bawat conversion ay inihambing sa PROJ (pyproj 3.7.1 kasama ang PROJ 9.5.1), ang coordinate library na karamihang ginagamit ng GIS programs, sa higit sa 330 sistema: state plane sa US survey feet at feet, UTM north at south, Lambert-93, British National Grid, GDA2020 MGA, New Zealand Transverse Mercator at web Mercator, kasama ang iba. Nagkakasundo ang easting at northing sa loob ng 1 cm na may parehong datum shift (karamihan ay mas mababa pa sa 1 mm), at nagkakasundo ang projection maths sa sariling depinisyon ng PROJ sa loob ng 1 cm.
- Ang mga `.prj` file na isinulat ng PROJ sa dalawang karaniwang anyo (ESRI at OGC) ay binasa pabalik para sa 105 sistema: 208 sa 210 ang tumugma sa eksaktong EPSG code nila, at ang dalawa ay sa sistemang may parehong maths sa parehong ellipsoid. Ang mga `.prj` file na isinusulat ng CivilCraft ay binabasa ng PROJ bilang parehong sistema. Hindi mabasa ang ESRI `.prj` files para sa polar stereographic systems (UPS, Alaska polar); piliin ang mga sistemang iyon sa pamamagitan ng code.
- Ang latitude at longitude sa status bar ay tumugma sa PROJ sa loob ng 0.01″ sa browser.
