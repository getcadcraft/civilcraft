---
title: Maglatag ng solar arrays sa lupa
summary: Maglagay ng ground-mounted na solar table sa loob ng parcel o pad, na may row spacing na akma sa lupang tinatayuan ng bawat row, iwanang walang laman ang matarik na lupa, kalkulahin ang enerhiya ng taon, at ipakita ang mga table sa plan at sa 3D.
keywords: solar, pv, photovoltaic, array, ground mount, mga table, mga row, row spacing, anino, terrain, slope, piles, output, kWp, enerhiya, horizon
from: 95593fd6
---

## Ano ang matututunan mo

Paano maglatag ng field ng solar table sa site na hindi patag, at ano ang ibig sabihin ng mga numero. Buksan ito mula sa Surface › {{ui:Higit pa}} › Solar arrays.

## Ilatag ang mga table

1. Piliin ang **Saan**: isang parcel o pad ng project, o i-type ang mga sulok ng isang lugar. Lagyan ng tsek ang anumang pad o parcel na dapat manatiling **walang laman** (gusali, lawa).
2. I-type ang **latitude at longitude** ng site. Nakadepende rito ang araw; walang hinuhulaan. Kung may coordinate system ang project, pupunan ang mga ito ng **Ilagay mula sa coordinate system**.
3. Itakda ang tilt, ang facing (kapag blangko, patungo sa equator), kung ilang module ang bumubuo sa isang table, at ang power at laki ng module. Nagsisimula sa generic na halaga ang mga numero ng module at may label na ganoon; i-type ang sarili mong numero.
4. Pindutin ang **Ilatag ang mga table**. Ibinibigay ng window ang bilang ng table at module, ang laki sa kWp, at ang row-to-row distance.

Bawat table ay isang column sa area, inilalagay mula sa harap at inuurong pabalik. Inilalagay lang ang table kung saan ang lupa sa ilalim nito ay nasa loob ng slope limit, nasa loob ng area at setback, at kung saan ang piles na kailangan nito ay hindi mas mataas sa limit na itinakda mo. Ang mga lugar na hindi pumasa ay iiwang walang laman, at sinasabi ng window kung ilan ang mga ito at kung bakit.

## Ang mga row ay may spacing ayon sa lupa

Sa patag na lupa, magkakalayo ang mga row ayon sa karaniwang no-shade rule: ang anino ng isang row sa tanghali ng winter solstice ay hindi dapat umabot sa mas mababang gilid ng row sa likod nito. Sa slope, ina-apply ng CivilCraft ang parehong rule sa lupang talagang tinatayuan ng susunod na row. Kung tumataas ang lupa sa likod ng isang table, maaaring mas malapit ang mga row; kung bumababa ito, mas malayo ang pagitan nila. Ipinapakita ng window ang pinakamalapit, pinakamalayo at average na spacing, kasama ang spacing sa patag na lupa, para makita mo kung ano ang nagawa ng terrain.

Itinataas ang plane ng table sa piles hanggang malampasan ng bawat sample sa ilalim nito ang lupa ng clearance na itinakda mo. Makikita sa resulta ang pinakamataas na pile.

## Ang enerhiya ng taon

**Enerhiya ng taon** ay kinakalkula ang liwanag sa nakatagilid na plane para sa isang representative na araw ng bawat buwan, ang cell temperature, ang mga loss na itinype mo, ang mga table na nagtatabing sa isa't isa, at ang mga burol sa horizon na kumukuha ng araw na natatakpan nila. Clear sky ang langit kaya upper bound ang sagot; mas kaunti ang makukuha sa totoong panahon. Early-design estimate ito, hindi yield report.

## Itago ito

**I-save sa project** ay itinatago ang mga input at numero sa project file. Muling kinakalkula ang mga table mula sa lupa kapag binuksan ang file, kaya kapag nagbago ang surface, gumagalaw din ang mga ito. Ipinapakita ang mga ito sa plan at sa 3D (Ipakita › Solar arrays). Dina-download ang listahan ng table bilang CSV. Isang undo step ang nag-aalis o nagbabalik ng isang array.

## Hindi pa ginagawa

Datos ng panahon sa halip na clear sky, mga table na sumusunod sa lupa sa east–west na direksyon, trackers, at electrical design (strings, wire, inverters) sa CivilCraft. May Solar PV pane ang BimCraft para sa strings at one-line para sa roofs.
