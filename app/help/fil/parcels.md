---
title: Gumuhit ng parcels at isulat ang legal description nito
summary: Gumuhit ng parcel sa pamamagitan ng mga sulok nito, o ilagay ang calls mula sa deed o plat, suriin kung gaano kahusay magsara ang calls, lagyan ng label ang bearings at distances sa plano, gawing curve ang anumang course, at kopyahin ang draft na legal description.
keywords: parcels, lots, property lines, boundary, deed, plat, metes and bounds, bearing, distance, closure, misclosure, precision, legal description, point of beginning, curve, radius, area, acres
from: 6793d6ce
---

Nasa plano ang mga parcel na may bearing at distance sa bawat tuwid na course (ang curve ay nagpapakita ng radius, haba at central angle) at ang pangalan at lawak nila sa gitna. Kasama sila sa PDF plot at sa DWG at DXF exports, sa mga layer `V-PROP` (linya) at `V-PROP-TEXT` (labels). Nasa ilalim ng **Parcels** sa kanang panel ang lahat kapag walang napiling bagay.

## Gumuhit ng parcel

1. I-click ang **Draw a parcel**.
2. I-click ang mga sulok, simula sa point of beginning. Ang click na malapit sa survey point ay kumukuha ng eksaktong lugar ng point na iyon.
3. I-click muli ang unang sulok, o pindutin ang {{key:Enter}}, para tapusin. Binabawi ng {{key:Backspace}} ang huling sulok; dine-drop ng {{key:Esc}} ang mga sulok na nagawa na; pindutin ulit ito para lumabas sa tool.

## Ilagay ang calls mula sa deed

1. I-click ang **Enter deed calls**.
2. Sabihin kung saan magsisimula ang calls: numero ng survey point, o northing at easting.
3. I-type o i-paste ang calls, isa bawat linya:
   - linya: isang bearing at distance, tulad ng `N 45°30'15" E 125.50`. Gumagana rin ang `N45-30-15E`, `N 45 30 15 E`, `N 45.5 E` at azimuths (`AZ 45°30'15"`), at binabalewala ang "thence", kuwit at "feet".
   - curve: `C R 300 L 52.36 right` (radius at haba ng arc), o `C R 300 D 10°00'00" left` (radius at central angle). Sumusunod ang curve sa course bago ito; kapag hindi, idagdag ang chord bearing nito: `C R 300 L 52.36 right CB N 50 00 00 E`.
   - Ang `#` ay nagsisimula ng comment line.
4. Habang nagta-type, ipinapakita ng dialog ang haba ng calls, ang **misclosure** (gaano kalayo ang narating mula sa simula, at saang direksyon), ang **precision** (haba na hinati sa misclosure, 1 : 10,000 at iba pa) at ang lawak. Nakalista ang mga linyang hindi nito mabasa, kasama ang kanilang line number.
5. **Add the parcel**. Kapag hindi nagsasara ang calls, nagsasara ang parcel sa isang tuwid na course sa ibabaw ng agwat: itugma ang calls sa deed. Para ipamahagi ang error ng field traverse sa mga course nito, i-adjust muna ito.

## Curves

Sa **Properties** ng parcel, may **Radius** ang bawat course. I-type ito para gawing curve ang course na iyon sa pamamagitan ng parehong dalawang sulok (hindi aabot ang radius na mas maliit sa kalahati ng distansya ng mga sulok, kaya tinatanggihan ito), at piliin ang **Right** o **Left** sa **Curves**: ang curve pakanan ay may center sa kanan ng direksyon ng pagdaan, gaya ng sa deed. I-clear ang radius para maging tuwid muli. Isang hakbang ang bawat pagbabago: binabawi ito ng {{key:Mod+Z}}.

## Ang legal description

Nagtatapos ang Properties ng parcel sa legal description nito, isinulat mula sa drawing:

- "Beginning at" ang **Point of beginning** na itinype mo (halimbawa "the northeast corner of Lot 4"), kung wala, ang northing at easting ng unang sulok, o ang survey point na pinagmulan ng calls.
- "thence" ang bawat course: bearing at distance, o curve na may radius, haba ng arc, central angle, at chord bearing at distance.
- "Containing" ang lawak nito sa square feet at acres (square meters at hectares sa meter project).

**Copy** ilalagay ito sa clipboard; ang **Download as text** ay sine-save ito bilang `.txt` file.

:::warning
Ang legal description ay draft mula sa drawing, hindi survey. Kailangang suriin ito ng lisensyadong surveyor laban sa record at pirmahan bago ito pagkatiwalaan ng sinuman.
:::

I-click sa loob ng parcel sa plano para piliin ito; tinatanggal ito ng {{key:Delete}}. Naka-save ang mga parcel sa project file.
