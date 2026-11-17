---
title: I-edit ang survey point
summary: Baguhin ang numero, coordinates, elevation o description ng isang point, o i-drag ito sa bagong lugar sa plano.
keywords: edit point, move point, baguhin ang elevation, renumber, point number, description, drag, northing, easting, ayusin ang point, bust
from: 375ae2e9
---

Isang sirang shot, maling taas ng rod, description na na-type nang mali: ayusin ang isang point, at susunod ang surface.

## Baguhin ang values ng isang point

1. Gamit ang {{ui:Select}}, i-click ang point sa plano. Ipinapakita ng **Properties** ang number, easting, northing, elevation at description nito sa mga box.
2. I-type ang bagong value at pindutin ang {{key:Enter}} (o i-click sa labas). Iwanang walang laman ang **Elevation** para sa point na walang elevation.
3. Sabay-sabay na mag-a-update ang surface, contours at lahat ng nakabatay sa mga ito.

Isang hakbang ang bawat pagbabago: binabawi ito ng {{key:Mod+Z}} at ibinabalik ng {{key:Mod+Y}}. Tinatanggihan ang value na hindi kayang gamitin ng CivilCraft (numerong mayroon nang ibang point, mga letra sa coordinate): naka-outline ang kahon, at sinasabi ng status bar kung bakit.

Ang bagong description code ay gumagawa ng bagong point group, gaya ng ginagawa ng import (tingnan ang [Gumawa ng surface](topic:build-surface)).

## Ilipat ang point sa plano

1. Piliin ang point (magkakaroon ito ng ring).
2. I-drag ang ring. Ipinapakita ng status bar ang easting at northing kung saan ito pupunta.
3. Bitawan para ilipat ito; mananatili ang elevation nito. Pindutin ang {{key:Esc}} bago bitawan para ibalik ito.

## Sumusunod ang breaklines sa point

Ang breakline na iginuhit gamit ang {{ui:Breakline}} tool ay kinokopya ang mga point na dinaraanan nito. Kapag inilipat mo ang point o binago ang elevation nito, gumagalaw kasama nito ang mga corner ng breakline, sa parehong hakbang. Palaging muling binubuo mula sa mga point ang breakline groups na galing sa descriptions.

:::note
Ang surface na binasa mula sa LandXML file ay nananatili sa sarili nitong triangles: nagbabago lamang ito pagkatapos ng {{ui:Rebuild the surface from the points}} kapag in-edit mo ang mga point.
:::
