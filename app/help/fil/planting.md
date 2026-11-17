---
title: Mga planting plan at iskedyul
summary: Maglagay ng magkakahiwalay na halaman, planting bed na pinupuno sa spacing ng mga halaman na may halong halaman ayon sa porsyento, at hedge; lagyan sila ng label; bilangin sila sa plant schedule para sa spreadsheet o TakeoffCraft.
keywords: planting plan, plant schedule, planting bed, mass planting, hedge, puno, shrub, groundcover, spacing, triangular spacing, bilang ng halaman, dami, labels, canopy, simbolo ng halaman, ifc, takeoff
from: ab49eab5
---

## Maglagay ng halaman

1. Pumili ng halaman sa **Plants** sa kaliwa.
2. I-click ang {{ui:Plant}}, pagkatapos i-click ang plano: bawat click ay naglalagay ng isang halaman. Pindutin ang {{key:Esc}} para tumigil.

Iginuguhit ang simbolo ng halaman sa spread nito sa maturity; ang More › {{ui:Show at planting size}} ay nagguguhit ng bawat halaman sa sukat na itinatanim. Nakapatong sa lupa ang mga puno: kapag na-grade mo ang site sa susunod, sumusunod sila rito. Para ayusin ang halaman sa isang elevation, i-type ito sa **Elevation** sa Properties.

## Planting bed

1. Piliin ang pangunahing halaman, i-click ang {{ui:Bed}}, at i-click ang mga sulok ng bed. Pindutin ang {{key:Enter}} (o i-click muli ang unang sulok) para isara ito.
2. Pupunuin ng bed ang halamang iyon sa spacing nito, sa **triangular** na pattern (ang karaniwan: bawat halaman ay magkakapareho ang layo sa anim na iba pa), kalahating spacing papasok mula sa gilid.
3. Sa Properties, ang **Add a plant** ay naghahalo ng halamang pinili sa kaliwa. Itakda ang **Share %** ng bawat halaman: eksaktong ganoong bilang ang kukunin ng bed sa bawat isa, ikakalat sa buong bed. Ang **Mix again** ay nag-iiba-iba ng lugar nila.

Ang **Spacing** na walang laman ay gumagamit ng sariling spacing ng mga halaman (may timbang ayon sa share nila); mag-type ng isa para gamitin ito sa bawat halaman. Maaaring square ang **Pattern**, at pinaiikot ng **Rows at** ang mga hilera.

## Hedge

Piliin ang halaman ng hedge, i-click ang {{ui:Hedge}}, i-click sa kahabaan ng hedge, at pindutin ang {{key:Enter}}. Inilalagay ang mga halaman sa linya sa kanilang spacing, nakasentro para pareho ang margin sa magkabilang dulo. Maaaring **two rows, staggered** ang hedge, sa itinakdang layo.

## Labels

Nilalagyan ng label ang magkakahiwalay na halaman ayon sa setting ng label (`{name}` bilang default); mag-type ng sarili mong label para sa isang halaman sa Properties. Nilalagyan ng label ang mga bed ng bilang ng bawat halaman, at ang mga hedge ng sa kanila. Ang More › {{ui:Plant labels}} ay nagbubukas at nagsasara ng mga label. Mga field ng label: `{name}`, `{botanical}`, `{size}` (ang container), `{qty}`, `{height}`, `{spread}`, `{container}`.

## Ang plant schedule

More › {{ui:Plant schedule…}} ay binibilang ang bawat halaman ayon sa species, mula sa magkakahiwalay na halaman, bed at hedge nang magkakasama, kasama ang planting size nito. I-save ito bilang **CSV** o **XLSX**, o **Send to TakeoffCraft**: isang quantities file na binubuksan ng TakeoffCraft para i-price ang mga halaman (kasama ang hardscape at irrigation quantity sa tabi nila).

## IFC

More › {{ui:Export landscape IFC}} ay nagse-save ng landscape bilang IFC file (IFC 4.3) na maaaring taglayin ng BIM model: bawat halaman ay isang `IfcGeographicElement` na uri VEGETATION, tinype ayon sa species nito kasama ang mga property ng halaman (botanical name, sukat, hardiness, tubig, liwanag); bawat bed at hedge ay isang elemento na may sarili nitong bilang, sa site. Binubuksan ito ng BimCraft sa tabi ng gusali.
