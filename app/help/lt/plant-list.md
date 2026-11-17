---
title: Augalų sąrašas
summary: Apie 420 dažnų vidutinio klimato ir Viduržemio jūros regiono augalų su dydžiais, atsparumu, šviesos ir vandens poreikiais, ieškoma bet kuria kalba, bei jūsų sąrašas, įrašytas kartu su projektu.
keywords: augalų sąrašas, augalų duomenų bazė, rūšis, botaninis pavadinimas, bendras pavadinimas, augalų paletė, daigyno sąrašas, atsparumo zona, csv, augalų importas, augalų eksportas, mano augalai, medžių sąrašas, krūmų sąrašas, augalų biblioteka
from: 7ed09e7e
---

Kairiojo skydelio skiltyje **Augalai** pateikiami visi augalai, kuriuos galite įdėti. Spustelėkite vieną, kad pamatytumėte jo dydžius ir padarytumėte jį augalu, kurį naudoja **Augalas**, **Lysvė** ir **Gyvatvorė**.

## Paieška ir filtravimas

Įveskite **Paieška** laukelyje: bet kurį augalo pavadinimo žodį bet kuria kalba (anglų, ispanų, portugalų), jo botaninį pavadinimą, tipą ar žodį jo pastabose. Turi sutapti kiekvienas įvestas žodis, todėl `quercus evergreen` randa visžalius ąžuolus. Diakritiniai ženklai nesvarbūs.

Susiaurinkite sąrašą naudodami **Tipas**, **Šviesa**, **Vanduo** ir **Atsparumo zona** (JAV USDA zona, kurioje yra jūsų sklypas: augalas rodomas, kai zona patenka į jo intervalą).

## Ką turi augalas

| Laukas | Reikšmė |
|---|---|
| Tipas | Medis, krūmas, gyvatvorė, žolė (įskaitant vejas), daugiametis augalas, dengiantysis augalas ar vijoklis |
| Užaugus | Augalo, užauginto sode ar gatvėje, aukštis ir plotis metrais |
| Sodinant | Dydis, kuriuo augalas sodinamas, ir jo talpa |
| Atstumas | Atstumas tarp centrų lysvėje ar palei gyvatvorę |
| Atsparumo zona | USDA zonos, kuriose augalas paprastai atsparus |
| Šviesa, vanduo, dirvožemis | Ko augalui reikia |
| Pastabos | Naudojimas ir atsargumo priemonės, pavyzdžiui, nuodingos dalys ar augalas, kuris plinta |

:::note
Įmontuotas sąrašas CadCraft parengtas pagal bendrąsias sodininkystės žinias: tipiniai, suapvalinti dydžiai. Tai ne jokio daigyno katalogas. Dydžius ir atsparumą patikrinkite vietiniame daigyne. Tyčia neįtraukti geriausiai žinomi invaziniai Iberijos pusiasalio ir didelės dalies vidutinio klimato augalai, o keli augalai, kurie kur nors yra invaziniai, turi pastabą.
:::

## Jūsų augalai

- **Pridėti į šio projekto sąrašą** nukopijuoja augalą į projekto sąrašą, kur jis įrašomas kartu su projektu. Jūsų sąraše esantis augalas pakeičia įmontuotą augalą su tuo pačiu raktu, todėl galite pakeisti jo dydžius savo regionui.
- **Importuoti augalų sąrašą…** nuskaito CSV failą (ar augalų failą). CSV reikia stulpelio su botaniniu pavadinimu ir, idealiu atveju, tipu, aukščiu ir pločiu; tinka ir stulpelių pavadinimai jūsų kalba (pvz., Latin, Common name, Height, Spread, Width, Zone). Nuskaitomi kableliai, kabliataškiai ar tabuliacijos ir dešimtainiai kableliai. Tušti sodinimo dydžiai, atstumai ir talpos užpildomi pagal tipą.
- **Eksportuoti kaip CSV** įrašo jūsų sąrašą (o jei jo nėra – augalus, kuriuos rodo paieška), kad galėtumėte atidaryti skaičiuoklėje.

Augalų sąrašas nuskaitomas kaip bet koks išorinis failas: viskas, ko jis negali panaudoti, praleidžiama ir suskaičiuojama.

## Augalai kitose programose

Augalų sąrašas yra viena biblioteka visoms CadCraft programoms: BimCraft ir ModelCraft turi tą patį sąrašą, bet jų pačių **Įdėti iš bibliotekos** dar nesiūlo augalų. Šiandien augalai pasiekia BIM modelį per CivilCraft kraštovaizdžio IFC (kiekvienas augalas kaip `IfcGeographicElement`). Žr. [Sodinimas](topic:planting#ifc).
