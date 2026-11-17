---
title: Žemės modifikatoriai ir lygiai realiuoju laiku
summary: Viskas, kas formuoja projektinį gruntą, vienoje tvarkingoje sąraše (vėlesnis laimi, kai sutampa), iškasos ir pylimai pagal kiekvieną modifikatorių, sandūrų patikros Problemų skydelyje ir taškiniai lygiai bei nuolydžio rodyklės, kurie skaito gruntą tiesiogiai.
keywords: žemės modifikatoriai, krūva, tvarka, projektinis gruntas, esamas gruntas, persidengimas, iškasa ir pylimas, sandūra, atraminė siena, grindinio kraštas, pagrindo lygis, laiptų aikštelė, taškinis lygis, taško aukštis, nuolydžio rodyklė, nuolydžio žymė, nuolydžiai
from: 3998a5b0
---

Projektinis gruntas = esamas gruntas + modifikatoriai, eilės tvarka. Esamas gruntas niekada nekeičiamas.

## Sąrašas

{{ui:Lygiai}} › {{ui:Žemės modifikatoriai…}} rodo kiekvieną objektą, kuris formuoja gruntą: aikšteles, pylimėlius, griovelius, vertikalaus planavimo zonas, grindinį ir takus, apželdintas zonas su baigtiniu lygiu, taip pat laiptus ir nuolaidas, kurių langelis **Formuoja žemę** pažymėtas (su jų apatiniu ir viršutiniu lygiais). Kai du persidengia, **vėlesnis** laimi. Vilkite eilutę arba naudokite rodykles, kad pakeistumėte tvarką; gruntas iš karto perskaičiuojamas. Kiekvienoje eilutėje rodoma jos iškasa ir pylimas (ką ji formuoja po viršesnių), o bendra suma – po sąrašu.

## Sandūrų patikra

Problemų skydelyje su **Eiti į** rodoma:

- siena, kurios aukštoji pusė yra aukščiau už jos viršų (gruntas ant sienos), arba kurios žemoji pusė rodo jos pamatą;
- apželdinta zona, kurios baigtinis lygis yra aukščiau už grindinio kraštą, prie kurio ji prisiglaudžia, arba daugiau nei įprastai 150 mm žemiau jo;
- laiptai, kurių apačia ar viršus nesiliečia su grindiniu, ant kurio jie nusileidžia;
- du modifikatoriai, kurie persidengia (ten laimi vėlesnis).

Atraminės sienos viršus gali sekti aukštąją grunto pusę: jos aukštis perskaičiuojamas kiekvieną kartą, kai keičiasi gruntas.

## Atraminė siena, formuojanti gruntą

Pasirinkite atraminę sieną ir pažymėkite **Formuoja žemę**. Juosta po siena (tokio pločio, koks yra sienos storis) įtraukiama į sąrašą kaip modifikatorius:

- kraštas **aukštojoje pusėje** laikomas toje vietoje esančiame grunte, stotis po stoties, todėl sienos viršus seka aukštąją pusę (su viršutine danga viršuje). Jei įvesite **Viršaus** lygį, aukštoji pusė laikoma tame lygyje, atėmus viršutinę dangą;
- kraštas **žemojoje pusėje** laikomas lygyje **Žemojoje pusėje laikomas žemės lygis**, kurį įvedate, o jei laukelis tuščias – tos vietos grunte;
- aukštoji pusė yra ta, kurios gruntas viso sienos ilgio atžvilgiu yra aukštesnis, todėl ji niekada nepasikeičia išilgai sienos;
- gruntas už juostos nekeičiamas, o esamas gruntas niekada.

Kaip ir bet kuris modifikatorius, ji yra sąraše, ir vėlesnis modifikatorius laimi, kai jie persidengia. Sienos, kurios laikomas lygis kuriame nors gale yra daugiau nei įprastai 150 mm nuo esamo grunto, Problemų skydelyje gaunamas įspėjimas (su **Eiti į**). Laisvai stovinti siena gruntą nekeičia. Ankstesnių versijų failuose langelis išjungtas, todėl jie atsidaro tokie, kokie buvo.

## Taškiniai lygiai ir nuolydžio rodyklės

{{ui:Taškinis lygis}} (vienas spustelėjimas) ir {{ui:Nuolydžio rodyklė}} (du spustelėjimai) nuskaito gruntą kiekvieną kartą, kai jie nubrėžiami: perkelkite ar pertvarkykite objekto lygį – žymos seka paskui. Savybėse pasirinkite, ar žyma skaito projektinį, ar esamą gruntą; esamo grunto žymos rodomos laužtiniuose skliaustuose. Rodyklės rodo žemyn, į nuokalnę, ir rodo `1:20 (5.0 %)`.
