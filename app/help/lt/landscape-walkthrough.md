---
title: Sodo projektavimas nuo pradžios iki galo
summary: Kraštovaizdžio architekto dešimt žingsnių nuo geodezinės nuotraukos iki paskelbto rinkinio, su tuo, ką kiekvienam žingsniui šiandien atlieka Kraštovaizdžio darbo sritis ir ko ji dar nedaro.
keywords: vadovas, žingsnis po žingsnio, kaip atlikti, sodo projektavimas, kraštovaizdžio projektavimas, pradžia, pavyzdys, pavyzdinis, geodezinė nuotrauka, linijos, reljefas, sodinimas, žiniaraštis, lapai, paskelbimas, vienas projektas
from: 87900bf5
---

Kraštovaizdžio projektas eina ratu: geodezinė nuotrauka, eskizas, linijos, gruntas, plotai, lygiai, sodinimas, žiniaraščiai, lapai ir vėl iš naujo. Štai dešimt žingsnių ir tai, kas šiuo metu yra kiekvienam iš jų. Kai žingsnyje yra spraga, ji nurodoma **Dar nesukurta** pabaigoje, o ne paslepiama žingsnyje.

Galite sekti pavyzdinę vietovę arba savo geodezinės nuotraukos brėžinį. Su savuoju pradėkite nuo 1 žingsnio.

## 1. Įkelkite geodezinę nuotrauką

{{ui:Paviršius}} › {{ui:Linijos iš brėžinio…}}, pasirinkite geodezinės nuotraukos brėžinį (DWG 2000–2018 arba DXF). Patikrinkite vienetus, paimkite horizontales, 3D polilinijas ir ribą paviršiui, o taškų blokus – kaip geodezinius taškus. Skyrius **Geodezinių lygių patikra** nuskaito tekstu arba atributu užrašytus lygius ir išvardija, kas atrodo neteisingai (vienetai, koordinačių sistema, atstumas nuo nulio, plokščios horizontalės, keisti lygiai, dvigubi taškai), prieš ką nors pridedant. Žr. [Patikrinkite geodezinės nuotraukos brėžinį importuojant](topic:survey-check) ir [Atidarykite DWG arba DXF kaip linijas](topic:open-dwg-dxf). Koordinačių sistemą nustatykite su {{ui:Koordinačių sistema…}}.

## 2. Ranka piešti eskizai

Popierinis lapas, pavyzdžiui, sena geodezinė nuotrauka ar pažymėta kopija, įkeliamas su {{ui:Skenuoti…}} (Pradėti nuo skenavimo): jis padedamas pagal mastelį arba žinomas koordinates po planu ir gali būti perbraižytas į linijas. ModelCraft nuskaito rankinio eskizo nuotrauką (Failas › Importuoti eskizo nuotrauką…). Pats CivilCraft neturi įrankio ranka pieštam eskizui: padėkite lapą po planu ir braižykite virš jo.

## 3. Eskizas į linijas

Braižykite charakteringas linijas ir kontūrus virš geodezinės nuotraukos CivilCraft programoje arba dvimačiame brėžinyje. Kraštovaizdis › Daugiau › {{ui:Iš linijos}} paverčia liniją į grindinį, sodinamą plotą, sieną, laiptus, charakteringą liniją ir dar daugiau, išlaikant ryšį: pajudinus liniją, objektas ją seka. Žr. [Objektai iš linijų](topic:objects-from-lines). SuperCad Studio programoje atverkite vietovę, brėžinį ir pastato modelį viename projekte: **Kraštovaizdžio** darbo sritis turi visų jų įrankius, o dvimačiame brėžinyje pasirinkta linija gali tapti kraštovaizdžio objektu, kuris ją seka (Ctrl+K, {{ui:Kraštovaizdžio objektas iš pasirinktos brėžinio linijos}}).

## 4. Projektuojamas gruntas

Atverkite {{ui:Paviršius}} › {{ui:Daugiau}} › {{ui:Kraštovaizdžio darbo sritis}}. Projektuojamą gruntą sudarykite su {{ui:Platforma}}, {{ui:Pylimėlis}}, {{ui:Griovelis}} ir vertikaliojo planavimo plotais su taškiniais lygiais ir horizontalėmis; grindinys, takai, sienos, pandusai ir laiptai, kuriuos pridedate, įsilieja į tą patį projektuojamą paviršių. Esamas gruntas niekada nesikeičia. {{ui:Lygiai}} › {{ui:Žemės modifikatoriai…}} išvardija visa, kas formuoja gruntą, vienoje eilės tvarkoje, su iškasimu ir užpylimu kiekvienam. Žr. [Vertikalusis planavimas](topic:landscape-grading) ir [Žemės modifikatoriai ir tiesioginiai lygiai](topic:ground-modifiers).

## 5. Grindinys ir sodinami plotai

{{ui:Kietosios dangos}} › {{ui:Grindinys}}, {{ui:Takas}}, {{ui:Siena}}, {{ui:Bordiūras}}, {{ui:Pandusas}} ir {{ui:Laiptai}}. {{ui:Plotai}} piešia veją, lysvę, pievą ar žemą augmeniją su jos sluoksniais; jis pats apkerpa aplink grindinį, sienas ir laiptus. {{ui:Lysvė}} užpildo plotą augalams tinkamu tarpu iš augalų mišinio. Žr. [Kietosios dangos](topic:hardscape), [Sodinami plotai](topic:planted-areas) ir [Sodinimas](topic:planting).

## 6. Lygiai, nuolydžiai ir sandūros

Skiltyje **Vertikaliojo planavimo patikros** pažymėkite **Nuolydžio analizė** ir **Tėkmės rodyklės ir vandens telkimasis**. Jei vanduo telkiasi prie terasos, aplink ją pridėkite {{ui:Griovelis}}. Savybės parodo, kiek laiptams reikia pakopų ir ar jos telpa, ir kur takas yra stačiau nei jo riba. Problemų skydelyje išvardijama, kur objektai blogai susiduria: siena per aukšta, lysvė virš grindinio, laiptai, kurie nepasiekia savo aikštelės. {{ui:Taškinis lygis}} ir {{ui:Nuolydžio rodyklė}} pažymi gruntą ir atsinaujina patys.

## 7. Sodinimas

Skiltyje **Augalai** ieškokite augalų sąraše (keli šimtai rūšių arba jūsų sąrašas), pasirinkite vieną ir spauskite {{ui:Augalas}}, {{ui:Lysvė}} arba {{ui:Gyvatvorė}}. Augalo dydį ir žymas nustatykite iš Daugiau. Daugiau › {{ui:Augalų lentelė}} redaguoja jūsų įrašus: veisles, tiekiamus dydžius, tankį, specifikacijų pastabas. Kiekvienas įrašas gali turėti jūsų simbolį ir 3D modelį (OBJ, STL arba GLB), o Daugiau › {{ui:Augalų grafika}} piešia augalus paprasčiau stambesniais mastelio lygiais. Žr. [Augalų sąrašas](topic:plant-list), [Augalų įrašai](topic:plant-records) ir [Augalų grafika](topic:plant-graphics).

## 8. Kiekiai ir žiniaraščiai

Daugiau › {{ui:Žiniaraščiai}}: augalų ir kietųjų dangų žiniaraščiai bei jūsų pačių lieka susieti su objektais; išsaugokite juos kaip CSV arba XLSX arba įdėkite į lapus (žr. [Žiniaraščiai](topic:worksheets)). Daugiau › {{ui:Augalų žiniaraštis…}} perduoda kiekius į TakeoffCraft. Kietųjų dangų kiekiai yra grindinio, sienų ir laiptų savybėse. Laistymas turi savo medžiagų sąrašą: {{ui:Laistymas}} › **Patikrinti sistemą…**. Žr. [Laistymas](topic:irrigation).

## 9. Brėžiniai ir lapai

Daugiau › {{ui:Kraštovaizdžio lapai…}}: sodinimo, nuolydžių ir laistymo planai su detalėmis. {{ui:Lygiai}} › {{ui:Pjūvio linija}} piešia pjūvius per gruntą, sienas, sluoksnius, laiptus ir augalus. Žr. [Kraštovaizdžio lapai](topic:landscape-sheets) ir [Pjūviai ir leidybos rinkinys](topic:landscape-sections).

## 10. Leidyba

{{ui:Lapų rinkinys (.zip)}} lapų lange sukuria vieną PDF su lapų sąrašu ir DWG kiekvienam lapui. Daugiau › {{ui:Eksportuoti kraštovaizdžio IFC}} perduoda BimCraft augalus ir kietąsias dangas. Išsaugokite projektą: viskas yra viename faile.

## Pakeiskite vieną dalyką: laiptus

Visa laikymas viename projekte reiškia, kad pakeitimas perduodamas visur. Išbandykite tai su laiptų ruožu tarp dviejų terasų:

1. Nubrėžkite ruožo liniją kaip charakteringą liniją (arba liniją brėžinyje), tada Kraštovaizdis › Daugiau › {{ui:Iš linijos}} › {{ui:Laiptai}}. Laiptų savybėse pažymėkite **Formuoja gruntą** ir nustatykite apatinį bei viršutinį lygius į dvi terasas.
2. Nubrėžkite sodinamą lysvę šalia ir po ruožu su {{ui:Plotai}}, o grindinį – ant terasų. Lysvė pati apkerpa save aplink laiptus ir grindinį, o augalų žiniaraštis skaičiuoja tik tai, kas pasodinta.
3. Savybėse padidinkite viršutinį ruožo lygį. Projektuojamas gruntas, taškiniai lygiai, nuolydžio rodyklės ir iškasimas bei užpylimas pakinta iš karto. Jei ruožas nebepasiekia viršutinės terasos, Problemų skydelis nurodo, kiek.
4. Pajudinkite ruožo liniją. Laiptai seka savo liniją tuo pačiu atšaukimo žingsniu; lysvė vėl apkerpama ir perskaičiuojama, o žiniaraščiai ir augalų žiniaraštis rodo naujus skaičius.
5. Vieną kartą paspauskite Ctrl+Z: linija, laiptai, gruntas ir lysvė grįžta kartu.

Žr. [Žemės modifikatoriai ir tiesioginiai lygiai](topic:ground-modifiers), [Sodinami plotai](topic:planted-areas) ir [Žiniaraščiai](topic:worksheets).

## Dar nesukurta

Tai pageidaujama, bet šioje versijoje dar nėra:

- Sienos, formuojančios gruntą (jos praneša, kur susitinka su gruntu, o viršus gali jį sekti).
- Savo bibliotekos augalų sąrašo redagavimas programoje (redaguokite projekto sąrašą ir išsaugokite jį kaip augalų failą).
- Savo GLB augalų modelių tekstūros ir spalvos (forma nuskaitoma; naudojama augalo spalva).

Visus įrankius žr. [Kraštovaizdžio darbo sritis](topic:landscape).
