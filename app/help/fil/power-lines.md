---
title: Ang Power lines workspace
summary: Mga overhead line at underground cable sa site mo, may sarili mong library, sag at tension sa ilalim ng mga load case mo, mga check ng clearance at lakas, stringing table, quantity, sheet at GIS export.
keywords: power line, overhead line, electrical, distribution, poles, supports, conductor, sag, tension, stringing, clearance, underground cable, trench, workspace, utility
from: 638dd856
---

Inilalagay ng Power lines workspace ang mga overhead line at underground cable sa CivilCraft site na mayroon ka na: ang parehong survey point, ang parehong ground, ang parehong project file.

:::warning
Design aid ito. Kinukuwenta ng workspace ang sag, tension, clearance at load mula sa **iyong** mga load case at limit; walang pamantayan ng anumang bansa na nakabuo na rito. Sinusuri ng isang engineer ang bawat resulta laban sa pamantayang naaangkop bago magtayo ng anuman.
:::

## Buksan ito

Piliin ang {{ui:Surface}} › {{ui:More}} › {{ui:Power lines workspace}}, o ang **Power lines** sa ilalim ng Workspace. Lilitaw ang grupong **Power lines** sa toolbar; aatras ang mga grupong Design at GIS. Piliin ang **Civil** sa ilalim ng Workspace para bumalik. Naaalala ng CivilCraft ang workspace na huli mong ginamit sa computer na ito.

Sa itaas ng kaliwang panel, dalawang seksyon ang nadadagdag:

- **Power lines**: ang iyong mga load case at limit, ang mga linya at kable sa project, at ang **Checks**, laging up to date. I-click ang isang check para piliin ang tinutukoy nito.
- **Library**: ang sarili mong conductor, kable, support, kagamitan at uri ng trench. Tingnan ang [Ang iyong power-line library](topic:power-line-library).

## Ano ang nasa grupong Power lines

| Tool | Ano ang ginagawa nito | Paksa |
|---|---|---|
| **Line** | Isang overhead line: i-click ang bawat support | [Mag-draw ng overhead line](topic:overhead-line) |
| **Support** | Magdagdag ng support sa isang span | [Mag-draw ng overhead line](topic:overhead-line) |
| **Cable** | Isang underground cable route sa trench | [Underground cables](topic:underground-cables) |
| **Equipment** | Isang cabinet, transformer, joint, o ang source na pinagmumulan ng network | [Underground cables](topic:underground-cables) |
| **Obstacle** | Anumang tinatawid ng linya: kalsada, gusali, ibang linya | [Mga check](topic:power-line-checks) |
| **Profile** | Ang profile ng linya: ground, support at conductor sa bawat load case | [Mag-draw ng overhead line](topic:overhead-line#the-line-profile) |
| **More** | Mga load case at limit, stringing tables, quantity, sheet at report, GIS, study file | [Sag at tension](topic:sag-and-tension), [Outputs](topic:power-line-outputs), [Study files](topic:power-line-study-file) |

Ang bawat idinagdag mo ay isang undo step, nase-save sa project file, at iginuguhit sa plan sa mga layer na pinangalanang `C-POWR-…`, kaya dala rin ito ng DXF, DWG at PDF exports.
