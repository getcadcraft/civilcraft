---
title: Mag-draft gamit ang snaps, mga napiling sulok, at ilipat, kopyahin, i-rotate
summary: Ilagay ang alignments, pads, parcels at feature lines nang eksakto sa mga punto at sulok na mayroon ka na, i-type o piliin ang easting at northing ng sulok, ipaling ang tangent patungo sa dalawang punto, at ilipat, kopyahin o i-rotate ang bagay ayon sa distansya o anggulo.
keywords: snap, snaps, osnap, snap sa punto, snap sa sulok, pi, vertex, corner, pick, crosshair, easting, northing, coordinates, na-type na coordinates, tangent, direction, bearing, move, copy, rotate, transform, copy rotated, duplicate, alt, malayang punto, drafting
from: 49864dda
---

Bago sa 0.9: kapag gumuguhit ka, lumalapag ang cursor sa mga punto at sulok na nasa plano na, at maaaring i-type o piliin ang sulok ng pad, parcel o feature line. Tinatalakay ng topic na ito ang tatlong tool.

## Ano ang gagawin mo

- Gumuhit gamit ang snaps, para ang bagong alignment, pad, parcel o linya ay magsimula at magtapos nang eksakto sa isang bagay na umiiral na.
- Itakda ang easting at northing ng sulok sa pamamagitan ng pag-type nito o pagpili ng lugar sa plano.
- Ipaling ang alignment tangent patungo sa dalawang napiling punto.
- Ilipat, kopyahin o i-rotate ang buong bagay.

## Mga hakbang

1. Pumili ng drawing tool, halimbawa {{ui:Alignment}}, {{ui:Pad}}, {{ui:Parcel}} o {{ui:Feature line}}. Ilapit ang pointer sa survey point, PI ng alignment, sulok ng pad, parcel o mass, vertex ng feature line, o storm structure. Lumilitaw ang isang marker na may label (PI, Corner, Vertex, Structure o Point at ang numero nito) at ang easting at northing kung saan ito lalapag. I-click para ilagay ang punto roon.
2. Para malayang ilagay ang punto, pindutin nang hawak ang {{key:Alt}} habang nag-click. Naka-off ang snap.
3. Pumili ng pad, parcel o feature line. Sa Properties, ipinapakita ng block na {{ui:Corners}} ang bawat sulok na may kahon na Easting at kahon na Northing. Mag-type ng bagong numero, o pindutin ang crosshair button sa tabi ng sulok at i-click ang lugar sa plano. Kinukuha ng sulok ang easting at northing na iyon. Pindutin ang {{key:Esc}} para kanselahin ang pagpili. Gumagana lamang ang crosshair sa plano: isara muna ang 3D view.
4. Para ipaling ang tangent, pumili ng alignment. Sa Properties, sa ilalim ng {{ui:Tangent from two points}}, piliin ang tangent, pindutin ang {{ui:First point}} at i-click sa plano, pindutin ang {{ui:Second point}} at i-click muli, saka pindutin ang {{ui:Set direction}}. Tatakbo ang tangent mula sa unang punto patungo sa ikalawa, at mananatili ang haba nito.
5. Para ilipat, kopyahin o i-rotate, pumili ng alignment, pad, parcel o feature line. Sa Properties, sa ilalim ng {{ui:Move, copy and rotate}}, i-type ang {{ui:Move east}} at {{ui:Move north}} (ang negatibong numero ay pupunta sa kanluran at timog) at pindutin ang {{ui:Move}} o {{ui:Copy}}. O pindutin ang {{ui:Distance from two points}} at i-click ang punto na pagmumulan at ang punto na pupuntahan.
6. Para i-rotate, i-type ang anggulo sa {{ui:Rotate counter-clockwise}} (degrees), saka pindutin ang {{ui:Rotate}} o {{ui:Copy rotated}}. Iikot ito sa gitna ng mga sulok nito maliban kung pipili ka ng punto na iikutan gamit ang crosshair sa tabi ng anggulo.

## Mga tala

- Nananatili sa dati nitong lugar ang kopya, at ito ang napipili pagkatapos.
- Bawat move, copy, rotate, napiling sulok at naipaling tangent ay isang undo step.
- Umaabot ang snaps ng 10 screen pixels mula sa cursor. Nag-aalok lamang ng lugar ang snap marker; walang nababago hangga't hindi ka nag-click.
- Pareho ang crosshair sa mga row ng PI ng alignment. Tingnan ang [Alignments](topic:alignment), [Parcels](topic:parcels) at [Feature lines](topic:feature-lines).
