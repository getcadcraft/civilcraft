---
title: Mga unit, station, at format ng numero
summary: Mga project sa feet at metro, kung paano isinusulat at tinatype ang mga station, grade, side slope, bearing, lawak, volume, at laki ng tubo, at ang epekto ng pagpapalit ng unit.
keywords: mag-type ng haba, arithmetic, calculator, sum, fraction, feet at inches, 4+7/16, units, feet, us survey feet, metro, meters, metric, imperial, station format, stationing, grade, percent, side slope, h:v, bearing, cubic yards, diameter
from: 0b9b5b6b
---

## Mga unit ng project

Ang project ay nasa **US feet** o **metro** (**Mga unit** sa kaliwang panel). Bawat coordinate, elevation, haba, at station sa project ay nasa unit na iyon.

:::warning
Ang pagpapalit ng **Mga unit** ay nagpapalit ng mga label, ng station format, ng mga default, at ng paraan ng pagsulat ng mga file. **Hindi** nito kinokonberte ang anumang numero. Ang site na sinurvey sa feet at pinalitan sa metro ay mananatili ang parehong numero, ngayo'y binabasa bilang metro. Ang status bar ay nagsasabing "Metro na ang mga unit. Hindi na-convert ang mga coordinate." Itakda ang mga unit para tumugma sa iyong data bago mag-design.
:::

Ang mga bagay na nakadepende sa mga unit:

| | US feet | Metro |
|---|---|---|
| Station format | `12+34.56` (mga station na 100 ft) | `1+234.567` (mga station na 1000 m) |
| Mga contour interval na inaalok | 0.25 hanggang 20 ft | 0.1 hanggang 10 m |
| Area | sq ft | sq m |
| Volume | cu yd | cu m |
| Diameter ng pipe at structure | inches | millimetro |
| Default na radius ng curve | 100 ft | 30 m |
| Mga tick ng stationing sa plano | bawat 50 ft, label bawat 100 ft | bawat 20 m, label bawat 100 m |
| Plot scales | 1" = 5' hanggang 1" = 1000' | 1:50 hanggang 1:10000 |
| LandXML linear unit | USSurveyFoot | meter |

Ang bagong project ay nagsisimula sa feet, o sa metro kapag metric ang length unit na may bituin sa {{ui:Mga setting}} › {{ui:Pangkalahatan}} › {{ui:Mga unit}}. Ipinapakita ng listahan ng **Mga unit** ang mga unit na naka-on doon, at palagi ang sariling unit ng project. Kapag may area o volume unit na may bituin doon (acres, hectares, acre-feet …), iniuulat doon ang mga lawak at volume sa halip na nasa column sa itaas. Tingnan ang [Mga unit, typed values, at mga listahan ng unit](common:unit-lists).

Kapag nagbukas ka ng LandXML, kukunin ng project ang mga unit ng file. Ang file sa international feet ay magbubukas bilang feet project; hindi binabago ang mga numero.

## Pag-type ng mga haba at sum

Ang anumang box na tumatanggap ng haba o elevation ay bumabasa nang higit pa sa simpleng numero: pindutin ang {{key:Enter}} at ipapakita ng box ang resulta sa mga unit ng project.

| Ang i-type mo | Sa feet project | Sa metro project |
|---|---|---|
| `12.5` | 12.5 ft | 12.5 m |
| `12'6"`, `12' 6 1/2"`, `6"`, `3 ft 6 in` | 12.5 ft, 12.54 ft, 0.5 ft, 3.5 ft | ang parehong haba sa metro |
| `4 7/16`, `4-7/16` | 4.4375 ft | 4.4375 m |
| `450 mm`, `1.2 m`, `90 cm` | sa feet | 0.45 m, 1.2 m, 0.9 m |
| `10 US ft`, `3 ch`, `2 rd`, `0.5 mi`, `1 km` | 10 ft, at ang iba sa US survey feet | ang parehong haba sa metro |
| `4+7/16`, `12'6" + 3/4"`, `(24'-0")/3`, `2*450mm` | ang sum, sa feet | ang sum, sa metro |

Gumagana ang anumang marka ng haba mula sa shared unit table, na may eksaktong sukat nito: ang feet ng project ay US survey feet, kaya ang `10 US ft` ay 10 at ang `3 ch` (ang international-foot chain) ay 197.9996. Gamitin ang `+ - * /` at mga bracket, pati ang `abs`, `round`, `ceil`, at `floor`. Ang dash na isinulat sa loob ng haba ay bahagi nito (`24'-6"`, `6-1/2`); kapag may space sa paligid, ibinabawas ito (`24' - 6"` = 23.5 ft). Ang plain na numero ay nagmu-multiply o nagdi-divide ng haba, at nagiging haba sa unit ng project kapag idinagdag sa isa. Kapag hindi mabasa ng CivilCraft ang na-type mo, mamarkahan ang box at sasabihin ng status bar kung nasaan ang problema.

Ang mga station ay hindi sum: ang `10+00` sa station box ay station 10+00. Ang mga grade sa percent, mga numero ng point, at mga description ay binabasa nang gaya ng mga ito.

## Mga station

Ang station ay distansya sa kahabaan ng alignment, isinusulat na may plus sign:

- Feet: ang bahaging bago ang plus ay daan-daang feet. `12+34.56` ay 1,234.56 ft.
- Metro: ang bahaging bago ang plus ay libu-libong metro. `1+234.567` ay 1,234.567 m.
- Ang negatibong station ay nananatili ang sign sa harap: `-0+50.00`.

Saan ka man mag-type ng station (ang **Simulang station**, ang **Station** ng PVI), puwede mo itong i-type na may plus (`12+34.56`) o bilang plain na numero (`1234.56`). Hindi pinapansin ang mga space.

## Mga grade at slope

- **Grades** (profile, pipe, lane at shoulder slope) ay nasa percent: ang `+1.25%` ay tumataas pataas ng station, ang `-0.50%` ay bumababa.
- **Side slopes** (pad cut at fill, corridor cut at fill) ay pahalang sa patayo: ang `3` ay 3 : 1, tatlo pahalang para sa isang pataas o pababa.
- **K** para sa vertical curve ay haba nito na hinati sa pagbabago ng grade sa percent.

## Bearing at anggulo

Ang bearing ay quadrant bearing sa degrees, minutes, at seconds: `N 63°12'05" E`. Ang curve deflections (Δ) ay gumagamit ng parehong degrees, minutes, at seconds, na may "left" o "right".

## Offset

Ang offset mula sa alignment ay mga distansyang patayo rito, minarkahan ng **L** (left) o **R** (right) habang nakatingin pataas ng station.

## Pagpapakita ng numero

- Ang coordinate at elevation ay nagpapakita ng 2 decimal sa mga panel at sa status bar (3 para sa napiling survey point).
- Ang mga lawak at volume ay pinagpapangkat ayon sa libo: `128,250 sq ft`, `454.9 cu yd`.
- Hindi kailanman pinagpapangkat ang mga coordinate, para makopya ang mga ito gaya ng mga ito.

## Coordinates

Ang CivilCraft ay gumagana sa flat na plane: easting pakanan, northing pataas. Laging nasa projected coordinates ang design work (state plane, UTM, o local grid). Puwede mong sabihin sa CivilCraft kung anong coordinate system ang gamit nila, at kung grid, ground, o local ang mga coordinate; ipapakita nito ang latitude at longitude at ilalagay ang mga GIS file at map layer, pero hindi nito kailanman babaguhin ang mga unit o ililipat ang iyong mga coordinate nang kusa. Tingnan ang [Itakda ang coordinate system ng project](topic:coordinate-systems) at [Ground at local coordinates](topic:ground-and-local-coordinates). Ayos lang ang malalaking state plane value (milyon-milyong feet); gumagana ang CivilCraft nang kamag-anak sa site sa loob upang mapanatili ang katumpakan.
