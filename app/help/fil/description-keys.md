---
title: Description keys at line codes
summary: Gawing point groups na may deskripsyon ang field codes, at pagdugtungin ang mga coded na punto sa linya (begin, end, close) na nagiging breaklines.
keywords: description keys, field codes, line codes, figures, linework, begin, end, close, point groups, codes, survey codes, data collector, breaklines, curb, gilid ng pavement, edge of pavement
from: b3d1af8d
---

Kinikodigo ng mga survey crew ang bawat shot sa field: `EP` para sa edge of pavement, `TC` para sa top of curb, `BLDG` para sa building corner. Ang code ang unang salita ng description ng punto. Pinapangkat ng CivilCraft ang mga punto ayon dito, at ginagawang linya ang line codes na nasa sunod nito.

## Line codes

Ang line code ay ang salitang nasa tabi mismo ng field code:

| Description | Kahulugan |
|---|---|
| `EP B` | Simulan ang bagong edge-of-pavement line sa punto na ito |
| `EP` | Ituloy ang kasalukuyang EP line |
| `EP E` | Tapusin ang kasalukuyang EP line sa punto na ito |
| `BLDG C` | Isara ang gusali: idugtong ang punto na ito pabalik sa unang punto ng linya |

Dinudugtong ang mga punto na may parehong code ayon sa pagkakasunod ng numero ng punto. Magkaibang linya ang magkaibang code kahit magkakapareho ang group, kaya ang `EP1` at `EP2` ay nagbibigay ng dalawang gilid nang sabay. Ang code na hindi gumagamit ng line code ay dinudugtong sa lahat ng punto nito, gaya ng sa mga naunang bersyon.

Ang mga linya sa group na ginamit na **Breakline** ay nagiging breaklines, isa kada linya, kaya ang curb na may puwang ay hindi hinihila sa ibabaw ng puwang. Ang mga linya sa ibang group ay iginuguhit sa plano (layer V-NODE-LINE) at napupunta sa DXF, DWG at PDF.

Ang mga salita para sa begin, end at close ay `B`, `BEG`, `START`; `E`, `END`; at `C`, `CLO`, `CLOSE`. Baguhin ang mga ito, o i-off ang line codes, sa dialog sa ibaba.

## Description keys

Ang description key ay ginagawang point group, gamit, at mahabang deskripsyon ang isang code.

1. Sa ilalim ng **Points**, i-click ang {{ui:Description keys and line codes}}.
2. I-click ang {{ui:Add a key}} at punan ang row:
   - **Code**: ang field code na itutugma. Ang `*` ay kumakatawan sa anumang karakter at ang `?` sa isa, kaya ang `EP*` ay sumasalo sa EP, EP1 at EP12.
   - **Group**: ang point group na sasalihan ng mga punto (walang laman = ang mismong code). Ang `EP*` na may group na `EP` ay naglalagay ng EP1 at EP2 sa iisang group habang nananatili silang magkahiwalay na linya.
   - **Use**: Points, Breakline o Left out, para sa sandaling lumitaw ang group (o iwan ito sa talaang **Points**).
   - **Description**: ang mahabang pangalan, na ipinapakita sa **Properties** ng punto.
3. Binibilang ng column na **Points** ang mga punto na sinasalo ng bawat key habang nagta-type ka. Ang unang key na tumutugma sa isang code ang nananalo.
4. I-click ang {{ui:Apply}}. Ang mga group, ang surface at ang plano ay sumusunod sa isang hakbang: iuundo ito ng {{key:Mod+Z}}.

Pinananatili ng group ang gamit na ibinigay mo rito sa talaang **Points**; ang gamit ng key ay itinatakda lamang para sa group na bago pa. Naka-save sa project file ang mga key at line codes.
