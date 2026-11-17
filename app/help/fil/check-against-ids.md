---
title: Suriin ang IFC export laban sa IDS ng kliyente
summary: I-load ang .ids file na ibinigay sa iyo ng kliyente o road authority at tingnan sa Problems ang bawat na-export na elemento na hindi ito tinutugunan.
keywords: ids, information delivery specification, buildingsmart, requirements, delivery, check, validation, qa, ifc export, ifc 4.3, alignment, road, procurement
from: 183d9a0e
---

## Ang gagawin mo

Ang IDS (Information Delivery Specification, isang pamantayan ng buildingSMART) ang listahan ng dapat laman ng isang IFC. Madalas magpadala ng isa ang public procurement kasama ng trabaho. Sinusuri ng CivilCraft ang IFC na ini-export ng proyektong ito, sa bersyon ng IFC na pinili mo para sa export, laban dito, at inililista ang bawat elementong kulang.

## Mga hakbang

1. Buksan ang proyekto mo.
2. I-click ang {{ui:IFC}} sa grupong Export ng toolbar. Sa dialog, piliin ang bersyon ng IFC na ihahatid mo.
3. I-click ang {{ui:Tingnan laban sa IDS…}}.
4. I-click ang {{ui:Mag-load ng .ids file…}} at piliin ang file. Walang ina-upload.
5. Basahin ang resulta: bawat specification na may {{ui:Pumasa}} o {{ui:Pumalya}} at kung ilang elemento ang sakop nito.
6. Buksan ang Problems ({{key:Ctrl+Shift+M}}) at i-click ang isang pagkabigo para piliin ang alignment, pad, pipe, structure o building mass na pinanggalingan nito.

## Ano ang dapat mong makita

- Isang babala bawat na-export na elemento at kinakailangang hindi nito natutugunan, kasama ang pangalan ng specification, ang hinihingi ng IDS at ang mayroon sa export.
- Nagsisimula ang ulat ng pagsusuri (sa Problems) sa IDS: ang pamagat, bersyon, may-akda at bilang ng bawat specification.

## Mabuting malaman

- Sine-save ang IDS sa project file, kaya muling sinusuri ito kapag binuksan mo ang proyekto. Ang pag-load o pagkalimot dito ay isang hakbang na maaari mong i-undo.
- Muling sinusuri ang bawat pagbabago pagkaraan ng sandali. Matagal isulat ang malalaking surface, kaya mas matagal maghintay ang pagsusuri sa pagitan ng mga takbo.
- Ang ginagamit na file ng pagsusuri ay ang parehong isinusulat ng {{ui:IFC}} export, sa huling bersyong pinili doon (IFC 4.3 kapag wala kang pinili).
- Inihahambing ang mga numero sa SI unit: ang proyektong nasa feet ay kino-convert muna sa metro.

- Binabasa ang mga pattern sa IDS bilang buong halaga. Ang `^` sa simula at ang `$` sa dulo ay itinuturing ding "ang buong halaga", gaya ng kadalasang ibig sabihin ng mga IDS file.

## Susunod

- [I-export ang IFC](topic:ifc)
