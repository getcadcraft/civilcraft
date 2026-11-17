---
title: Layout ng parking lot
summary: Ilatag ang stalls, aisles, accessible at van spaces at islands sa loob ng outline, i-grade ang lot na may falls papunta sa drains laban sa umiiral na lupa, saka pavein at tamnan ito. Available din sa assistant.
keywords: parking, lot, stall, aisle, accessible, ada, van, island, drain, fall, grade, cut, fill, paving, pavers, planting, puno, lupa, point cloud, mcp, assistant
from: 06c14da9
---

Ilagay ang parking lot sa loob ng parcel, pad o saradong feature line, at makuha ang bilang, grading at paving sa iisang hakbang.

## Ilatag ito

1. Pumili ng parcel, pad o saradong feature line sa plano.
2. Buksan ang **Surface, More, Parking lot...**
3. Piliin ang mga patakaran, ang stall angle (90, 75, 60, 45, 30 degrees o parallel) at one-way o two-way aisles. Nagsisimula ang laki ng stall, aisle at island sa talahanayan, at maaaring i-type over ang bawat isa.
4. Piliin ang **Lay out**.

Tatakbo ang mga hilera sa gilid ng outline na nagbibigay ng pinakamaraming stalls (o sa anggulong itatype mo). Binibilang lang ang stall kung nasa loob nang buo ng outline. Kapag may natirang espasyo para sa isang hilera at isang aisle, may idinadagdag na single-loaded band. Inilalista ng window ang spaces, accessible at van spaces, islands, drains at ang lawak bawat space, at ipinapakita ng plano ang stalls, accessible spaces kasama ang kanilang hatched access aisles, islands, aisle centre lines at drains sa sarili nilang layer (C-PARK-...), kaya napupunta sila sa PDF, DXF at DWG.

## Accessible spaces

Sa United States rules, sinusunod ng bilang ang 2010 ADA Standards table 208.2 para sa spaces na inilagay (isa sa bawat anim, pataas na bilugan, ay van space), nakalagay malapit sa unang sulok ng outline (ang pasukan), bawat isa ay may access aisle; dalawa ang nagbabahagi ng isa. Lumalabas na problema ang stall na mas makitid sa accessible width, o fall na mas matarik sa 1:48 sa accessible spaces. **Ang mga numerong ito ay tinype mula sa standard ayon sa pagkaka-alala at hindi pa nasusuri laban sa nakalimbag na standard.** Ang karaniwang laki ng stall at aisle ay galing sa mga parking design guide at hindi pa rin nasusuri. Suriin ang dalawa, at ang iyong lokal na code, bago umasa rito. Piliin ang **Custom** para ilagay ang sarili mong bilang ng accessible.

## Falls papunta sa drains, cut at fill

Maliban kung i-off mo ito, ang lot ay nagiging grading area sa Landscape workspace. Inilalagay ang drains sa aisle centre lines bawat mga 100 feet (30 m); tumataas ang surface mula sa bawat drain sa fall na ibibigay mo (1.5 percent sa simula), kaya bumababa ang bawat punto papunta sa pinakamalapit nitong drain. Pinipili ang level para magbalanse ang cut at fill ng lot sa umiiral na lupa. Ang umiiral na lupa ay ang umiiral na surface ng project, na maaaring galing sa survey points, LandXML, lidar o scan point cloud na ginawang surface, o contours. Ipinapakita ng window ang tantiya ng cut at fill; ang sariling volumes ng project ang magpapakita ng eksaktong bilang pagkatapos. Pinananatili ng grading area ang gilid nito sa umiiral na lupa, kaya kapag iba ang bagong surface sa lupa sa gilid, magkakaroon ng step, at sinasabi ng window kung gaano ito kalaki.

## Paving at planting

Nakakakuha ang buong outline ng paver paving (stretcher pattern na maaari mong baguhin sa ilalim ng Landscape, Hardscape), at nakakakuha ang bawat island ng shrub bed at, kung sapat ang lapad nito, isang puno mula sa plant list. Ordinaryong Landscape object na ang lahat pagkatapos nito: i-edit ito, o piliin ang **Lay out again** para palitan ang ginawa ng lot. Ang pagtanggal ng lot ay nag-aalis ng ginawa nito.

## Mula sa assistant

Maaaring hingin ang parehong lot sa pamamagitan ng MCP: nagpapakita ng preview ang `parking_layout`, nagsusulat ang `parking_build`, at tinatanggal ng `parking_remove` ang lot. Humingi ayon sa pangalan ng parcel, o ipadala ang outline.

## Hindi pa ginagawa

Hindi sinusuri kung umaabot ang aisles sa kalsada. Sakop ng paving ang buong outline, kaya kasama sa lawak nito ang mga island. Hindi pa nagagawa ang pagpili ng paving material mula sa Library at isang Library type para sa stalls; ang paving pattern ay ang Hardscape. Wala pang patakaran ng ibang bansa.
