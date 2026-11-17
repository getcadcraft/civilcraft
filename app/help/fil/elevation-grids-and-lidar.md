---
title: Elevation grids at LiDAR
summary: Buuin ang umiiral na lupa mula sa DEM (GeoTIFF o ASCII grid) o LiDAR points (LAS, LAZ) — piliin ang area, manipis ang data, pumili ng classes at suriin ang elevation units — at magbalik ng surface bilang GeoTIFF elevation grid.
keywords: dem, dtm, elevation grid, geotiff, tif, ascii grid, asc, lidar, las, laz, point cloud, classes, ground, pagmanipis, nodata, raster, i-export geotiff, gis
from: c8b2d18a
---

Dalawa ang paraan ng pagkuha ng public elevation data: **elevation grids** (isang DEM: isang elevation bawat square cell, karaniwang GeoTIFF `.tif` o ASCII grid `.asc`) at **LiDAR points** (milyon-milyong laser return sa `.las` file, o `.laz` kapag compressed). Ginagawang survey points o surface ng CivilCraft ang alinman sa mga ito, sa loob ng browser: walang ina-upload.

## Buksan ang file

1. I-click ang {{ui:Open}} (o {{ui:Import}} sa GIS group) at piliin ang file, o i-drag ito sa plano. Para sa ASCII grid, piliin din ang `.prj` file nito, para malaman ng CivilCraft ang coordinate system nito.
2. Ipinapakita ng import dialog ang sinasabi ng file tungkol sa sarili nito: laki nito, cells o points, coordinate system, lokasyon nito sa latitude at longitude, at saklaw ng elevation nito. Para sa LiDAR, binabasa muna nito ang bawat point nang isang beses para bilangin ang **classes** (may progress bar kung gaano na ito kalayo; pinapahinto ito ng {{ui:Cancel}}).

Ang GeoTIFF na may tatlo o apat na band (red, green, blue) ay larawan, hindi elevation: napupunta ito sa map layers.

## Piliin kung ano ang ii-import

- **Area**: {{ui:The project’s extents and a margin}} (i-type ang margin), {{ui:What the plan shows now}}, o {{ui:The whole file}}. Ang bahaging iyon lamang ng file ang binabasa.
- **Thin to**: ang layo ng mga point na makukuha mo, sa units ng proyekto. Ipinapakita ng linyang nasa ilalim ng settings kung ilang point ang makukuha habang tina-type mo. Para sa grid, pinapanatili ng CivilCraft ang bawat ikalawa, ikatlo … cell, kaya nananatiling eksakto ang elevation ng file; hindi nito ina-average ang mga cell. Para sa LiDAR, hinahati ang area sa mga square na may ganoong laki at isang point ang itinatabi sa bawat square: {{ui:The point nearest each cell’s center}} (ang default), {{ui:The lowest point in each cell}} (mainam kapag walang ground class ang file: nasa ilalim ng mga puno ang lupa) o {{ui:The average of each cell’s points}}.
- **Classes** (LiDAR): naka-tick ang ground (class 2) kapag mayroon nito ang file; hindi isinasama ang buildings, trees at noise. Kapag walang ground class, naka-tick ang lahat ng class at sinasabi ito ng dialog.
- **Ground** (LiDAR, 0.8): walang ground class ang drone cloud. Kapag wala ito sa file, nagsisimula ang dialog sa {{ui:Find the ground myself (drone clouds, no ground class)}}: binabasa ang bawat class maliban sa noise, itinatabi ang pinakamababang point sa bawat cell, at pagkatapos ay tinatanggal ng CivilCraft ang buildings, trees at mga naligaw na mababang point gamit ang progressive morphological filter (Zhang at iba pa, 2003) na maaari mong i-adjust: **Pinakamalaking bagay na tatanggalin** (ang lapad ng pinakamalaking building; lumalaki ang windows hanggang matakpan ito; ang 0 ay nangangahulugang 20 cells) at **Pinakamatarik na ground slope**. Ginagawa ang trabaho sa grid ng pinakamababang point, kaya ang cloud na may sampu-sampung milyong point ay hindi lalampas sa bilang ng cell nito (isang streaming pass ang thinning). Ang spacing ay ang cell: ang mas magaspang ay mas mabilis at mas kaunting nakakaligtaang maliliit na bagay kaysa sa inaasahan mo; ang mas pino ay nagpapanatili ng mas maraming detalye ng ground. Sinasabi ng report kung ilang point ang naitabing ground, ilang cell ang tinanggal bilang mga bagay, at ilang naligaw na mababang point ang itinapon. Sa isang gawa-gawang 300 m drone survey na may limang building, 70 puno at 200 mababang outlier, nasa loob ng 3 cm mula sa tunay na terrain ang naitabing point, at walang roof o canopy na naitabi.
- **Elevations sa file**: meters, feet o US survey feet. Kapag sinasabi ito ng file, napili na ang unit nito. Kapag hindi, kailangan mong pumili: ipinapakita ng dialog ang saklaw ng elevation sa parehong paraan para malaman mo kung alin ang makatuwiran para sa site.
- **I-import bilang** (grid lamang): {{ui:Survey points (description DEM)}}, o {{ui:The surface itself (a grid of triangles)}}.

Hanggang 500,000 point lamang ang isang import. Kapag lalampas doon ang pinili mo, sinasabi ng dialog kung gaano kalaki ang sobra at anong spacing ang kasya, at nananatiling naka-off ang {{ui:Import}}.

I-click ang {{ui:Import}}. Ipinapakita ng progress bar ang pagbabasa; pinapahinto ito ng {{ui:Cancel}} at walang magbabago.

:::warning
Madalas maging bitag ang vertical units. Maraming state plane DEM ang may easting at northing sa feet pero elevation sa meters. Ihambing ang saklaw na ipinapakita ng dialog sa alam mo tungkol sa site.
:::

## Ano ang makukuha mo

- **Survey points**: nakanumero kasunod ng pinakamataas mong point number, na may description na `DEM` (grids) o `LIDAR`, kaya bumubuo sila ng isang point group sa ilalim ng **Points** at gumagawa ng surface gaya ng anumang point. Isang hakbang ang pag-import nila: binubura sila ng {{key:Mod+Z}}.
- **Ang mismong surface**: isang grid TIN, dalawang triangle bawat cell, hinati sa diagonal mula southwest hanggang northeast. Tinatanggal ang triangle na may corner na walang data, kaya nananatiling butas ang mga butas sa data. Eksakto ang surface sa bawat grid point at isang patag na eroplano sa loob ng bawat triangle sa pagitan nila. Pinapalitan nito ang surface ng proyekto (nagtatanong muna ang dialog); ibinabalik ng {{key:Mod+Z}} ang naunang surface. Ang heading ng left panel ay nagsasabing **Surface (mula sa elevation grid)**.

## Coordinate systems

- Kung may coordinate system ang proyekto at iba ang pinangalanan ng file, ang bawat point ay kino-convert sa system ng proyekto (at sa ground o local coordinates nito kung mayroon).
- Kung wala ito at nasa units ng proyekto (feet o meters) ang system ng file, nag-aalok ang dialog na gawin itong coordinate system ng proyekto, sa parehong undo step ng mga point.
- Kung nasa latitude at longitude ang file, o nasa meters para sa feet na proyekto, hinihiling ng dialog na pumili ka muna ng coordinate system ng proyekto.
- Kung hindi sinasabi ng file, kukunin ang mga numero nito bilang coordinates ng proyekto. Maaari mong piliin ang system ng file sa halip.

## I-export ang surface bilang GeoTIFF

1. I-click ang {{ui:Export}} sa GIS group.
2. Sa GeoTIFF part, piliin ang surface (umiiral na ground o ang graded surface) at ang cell size. Galing sa average triangle edge ng surface ang default. Ipinapakita ng dialog ang laki ng grid na isusulat nito.
3. I-click ang {{ui:Download GeoTIFF}}.

Isang band ng 32-bit floating point elevations sa units ng proyekto ang file, sa lawak ng surface; ang mga cell sa labas ng surface ay "walang data" (−3.4028235e38). Ang value ng bawat cell ay ang elevation ng surface sa center ng cell. Ang coordinates ay **grid** coordinates: ang proyektong nasa ground o local coordinates ay ibinabalik sa grid. Pinapangalanan ng file ang coordinate system ng proyekto sa pamamagitan ng EPSG code nito; ang system na walang EPSG code ay hindi isinusulat, at binabalaan ka ng dialog na sabihin sa GIS department kung aling system iyon.

## Ano ang sinuri

- Sinuri ang mga GeoTIFF at ASCII grid reader laban sa GDAL (sa pamamagitan ng rasterio), ang library na ginagamit ng karamihan sa GIS program sa pagbasa ng mga file na ito: 32-bit float at 16-bit integer grid, tiled at stripped, DEFLATE at LZW, nodata, scale at offset, pixel-is-point, isang UTM grid, isang state plane grid sa US survey feet at isang latitude/longitude grid. Pantay ang bawat value.
- Sinuri ang mga LAS at LAZ reader laban sa laspy: LAS 1.2 at 1.4, point formats 0, 1, 3, 6, 7 at 8, may at walang coordinate system, at LAZ na isinulat ng LASzip-compatible backend nito. Pantay ang bawat point.
- Sinuri ang na-convert na coordinates laban sa PROJ hanggang 1 mm.
- Binasa muli ng GDAL ang mga na-export na GeoTIFF: coordinate system, posisyon ng cell, nodata, units, at mga value na pantay sa surface hanggang 0.0001.
- Walang nabuksan dito sa ibang GIS o CAD program.

## Hindi pa nagagawa

- Pagbabago ng vertical datum (geoid models): ginagamit ang elevation gaya ng pagkakasulat nito sa file.
- Waveform data, LiDAR returns maliban sa class, colors at intensities.
- Maraming band, overview, o file na lampas 200 MB.
- Pagsulat ng LAS o LAZ mula sa surface o sa tool na ito (ang add-on na [Point clouds](topic:point-clouds) ang nagsusulat ng nalinis na cloud bilang LAS 1.4 o LAZ).
