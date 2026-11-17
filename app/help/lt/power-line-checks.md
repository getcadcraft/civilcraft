---
title: Elektros linijų patikros
summary: Ką CivilCraft tikrina kiekvienoje linijoje ir kabelyje, visada atnaujinta: atstumus, tarpus, svyravimą, kilimą, atramų apkrovas ir dydį, tvirtinimo detales, laikiklius, pamatus, trūkstamus duomenis, jungtis, perkrovas ir įtampos nuostolius.
keywords: patikros, atstumas, atstumas iki žemės, kliūtis, kirtimas, fazių tarpas, izoliatoriaus svyravimas, kilimas, atramos apkrova, nominalioji apkrova, dydis, pamatas, laikiklis, tvirtinimo detalė, skersinis, įtampos nuostolis, perkrova, trūkstami duomenys, atjungtas
from: e6a0da47
---

**Patikros** Elektros linijų skyriuje rodo kiekvieną problemą: raudonai – tai, kas neatitinka, gintarine spalva – įspėjimus. Spustelėkite vieną, kad pasirinktumėte liniją, atramą, kabelį ar įrangą, kurios ji susijusi; neatitinkančios atramos ir tarpai plane apibraukiami raudonai, kol darbo sritis atidaryta.

:::warning
Projektavimo pagalba: tai jūsų projekto patikros pagal jūsų pačių taisykles, o ne sertifikavimas.
:::

## Atstumai

Žemiausia laidininko fazė stebima visame tarpe kiekvienu apkrovos atveju. Jos mažiausias atstumas virš žemės turi pasiekti linijos **Atstumo taisyklę**. Kur tarpas kerta **kliūtį** (braižoma su {{ui:Kliūtis}}: taškas arba linija, su aukščiu virš žemės ir savo atstumo taisykle), atstumas virš kliūties viršaus tikrinamas tuo pačiu būdu.

**Tai, ką Kraštovaizdžio darbo sritis iškelia virš žemės, taip pat skaičiuojama.** Atskiri augalai (jų vainikas pilnai išaugusio pločio ir aukščio), gyvatvorės ir sodinimo lysvės (aukščiausios juose augusios rūšys) bei sienos (jų viršus) yra kliūtys po linija, nebraižant jų iš naujo. Jiems galioja taisyklės, nustatytos {{ui:Apkrovų atvejai ir ribos…}}: **Kraštovaizdžio augalai po linija** (pavyzdiniai rinkiniai naudoja *Medžiai ir augalai*, 3 m) ir **Kraštovaizdžio sienos po linija** (*Pastatas*); pasirinkite **Netikrinama**, kad jų neįtrauktumėte. Atstumas matuojamas tiesiai aukštyn nuo augalo ar sienos viršaus iki laidininko vietoje, kur tarpas kerta; atstumas į šoną iki šalia linijos esančio vainiko netikrinamas. Medžio perkėlimas ar sienos pakėlimas iš karto pakeičia patikras.

Atstumo taisyklės yra jūsų pačių: atverkite jas su **Taisyklės…** šalia bet kurios **Atstumo taisyklės** (arba {{ui:Apkrovų atvejai ir ribos…}}), kad galėtumėte jas pridėti, pervadinti, pakeisti ar pašalinti.

## Tarpai ir svyravimas

- Reikalingas **fazių tarpas**: k·√(įlinkis + izoliatoriaus ilgis) + U/150, kai įlinkis yra karščio atvejo, o įtampa U kilovoltais (dažnai naudojama forma; k priklauso nuo jūsų taisyklių rinkinio). Lyginama su skersinio fazių tarpu.
- **Izoliatoriaus svyravimas** kabamosiose atramose, esant vėjo atvejui: atan(skersinė apkrova ÷ vertikali apkrova), lyginamas su didžiausiu taisyklių rinkinio svyravimu.
- **Kilimas**: kabamoji atrama, žemesnė už kaimynines, šaltyje gali būti pakeliama; ji pažymima.

## Atramų apkrovos ir dydis

Kiekvienai atramai ir apkrovos atvejui, su visais linijos laidininkais:

- **Skersinė**: vėjo apkrova metrui × vėjo tarpas (pusė dviejų tarpų) plius 2·H·sin(posūkis ÷ 2) posūkyje.
- **Išilgai linijos**: abiejų pusių įtempimų skirtumas galinėje atramoje ar kampe; kabamojoje atramoje – tik esant ledui vienoje pusėje (kiekvienas tarpas skaičiuojamas atskirai, o tai klysta į saugią pusę).
- **Vertikali**: vertikali apkrova metrui × svorio tarpas (tarp žemiausių taškų abiejose pusėse) plius įranga.

Horizontali apkrova perkeliama į atramos nominalųjį tašką (ekvivalentinė apkrova = apkrova × pritvirtinimo aukštis ÷ nominaliojo taško aukštis) ir lyginama su jos **nominaliąja apkrova** × taisyklių rinkinio koeficientas. Jei ji per silpna, siūloma mažiausia tos pačios medžiagos atrama jūsų bibliotekoje, kuri ją atlaiko. Atrama su **laikikliu** perduoda horizontalią apkrovą laikikliui, kuris atlaiko apkrovą ÷ sin(laikiklio kampas) ir tikrinamas pagal savo nominaliąją apkrovą.

Tvirtinimo detalės (spaustukai, izoliatoriai, skersiniai) tikrinamos pagal savo nominaliąją apkrovą: įtvirtinimo detalė atlaiko laidininko įtempimą, kabamoji detalė – savo dalį vertikalios ir skersinės apkrovos. Rodomas **pamatas** yra atramos gylis žemėje ir duobė, šiek tiek platesnė už jos pėdą.

## Duomenys, jungtys ir srovė

- Elementas, kurio reikalingas laukas tuščias, arba raktas, kurio nėra bibliotekoje.
- Kabelio trasos galas ar įranga, nieko neprijungta.
- **Įtampos nuostoliai** ir **srovė** nuo kiekvieno šaltinio (įranga pažymėta kaip šaltinis) iki apkrovų (kW ir galios koeficientas įrangoje) palei oro tarpus ir kabelius: √3·I·L·(R cos φ + X sin φ), kai R yra 20 °C. Srovė, didesnė už kabelio nominaliąją srovę, arba didesni nuostoliai, nei leidžia taisyklių rinkinys, pažymimi.
