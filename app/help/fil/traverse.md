---
title: Maglagay ng traverse at i-adjust ito gamit ang compass rule
summary: I-type ang field angles o bearings at distances, tingnan ang angular at linear closure at ang precision, i-adjust gamit ang compass rule, at idagdag ang mga station bilang survey points o ang loop bilang parcel.
keywords: traverse, closed traverse, loop, anggulo pakanan, backsight, bearings, distansya, closure, misclosure, precision, compass rule, bowditch, adjustment, survey
from: 56ce5a8c
---

Ang traverse ay serye ng mga sinukat na leg: sa bawat station, may anggulo (o bearing) at distansya papunta sa susunod. I-click ang **Maglagay ng traverse** sa ilalim ng **Traverse** sa kanang panel kapag walang napiling object.

## Saan ito nagsisimula at nagtatapos

1. **Magsimula sa survey point**: ang numero nito. O i-type ang northing at easting.
2. **Mga leg bilang**: **Angles right at distances**, o **Bearings at distances**.
3. Sa mga anggulo, sabihin kung saan ito nagsisimula: isang **Backsight survey point**, o **ang azimuth nito** (mula sa unang station papunta sa backsight, clockwise mula sa north).
4. **Pagtatapos**: **pabalik sa simula (isang loop)**, o **sa survey point** at ang numero nito (isang open traverse sa pagitan ng mga kilalang punto).

## I-type ang mga leg

Isang leg bawat linya, sunod ang distansya, at kung gusto, pangalan ng station na inaabot nito:

- Angles right, na paikot clockwise sa station na pinanggagalingan ng leg, mula sa station sa likod papunta sa susunod: `270°00'10" 125.50 B`. Gumagana rin ang `270-00-10`, `270 00 10` at `270.0028`.
- Bearings: `N 45°30'15" E 125.50 B`, o azimuth bilang isang salita: `AZ 45-30-15 125.50 B`.
- Sa loop na may anggulo, tapusin sa `close` at ang anggulo sa simula ulit, na pinaikot mula sa huling station papunta sa ikalawa: `close 270°00'05"`. Ito ang nagche-check ng mga anggulo.

Ililista kasama ng kanilang line number ang mga linyang hindi mabasa. Ayos lang ang "feet", mga comma, at mga linyang comment na may `#`.

## Basahin ang closure

Habang nagta-type ka, ipinapakita ng dialog ang:

- **Angular misclosure**: gaano kalayo ang mga anggulo sa pagsasara, at ang bahaging kinukuha ng bawat anggulo. Kapag walang closing angle, hindi chine-check ang mga anggulo, at ang anumang error dito ay lalabas sa linear misclosure.
- **Linear misclosure**: gaano kalayo ang narating ng traverse mula sa kung saan dapat ito magtapos, at sa anong direksyon.
- **Precision**: ang haba ng traverse na hinati sa linear misclosure: ang 1 : 10,000 ay nangangahulugang 1 ft sa bawat 10,000 ft.
- Ang mga station pagkatapos ng adjustment, at kung gaano kalayo ang nagalaw ng bawat isa.

## Ang adjustment

Una, ang angular misclosure ay ikinakalat nang pantay sa mga anggulo. Pagkatapos, ang linear misclosure ay ikinakalat sa mga leg gamit ang compass rule (Bowditch): ang bawat station ay gumagalaw laban sa misclosure ayon sa haba ng nilakbay para marating ito, kaya eksaktong nagtatapos ang traverse kung saan ito dapat.

:::note
Ang compass rule ay karaniwang adjustment, hindi least-squares, at hindi nito tinitimbang ang mga anggulo laban sa mga distansya. Kung sapat ang precision, ang sarili mong pamantayan at ang sa iyong hurisdiksyon ang magpapasya.
:::

## Gamitin ang resulta

- **Idagdag bilang survey points**: ang mga adjusted station ay nagiging survey points na may mga pangalang ibinigay mo (kung wala, ang susunod na libreng numero), description `TRAV`, walang elevation. Ang huling station ng loop ay ang simula nito, kaya hindi ito idinadagdag nang dalawang beses. Isang hakbang lang: pindutin ang {{key:Mod+Z}} para i-undo ito.
- **Idagdag bilang parcel** (loops): ang mga adjusted station ay nagiging [parcel](topic:parcels), kasama ang mga label at legal description nito.
- **Report (CSV)**: ang mga linya ng closure, saka ang direksyon, distansya, unadjusted at adjusted na coordinates, at mga correction ng bawat station.
