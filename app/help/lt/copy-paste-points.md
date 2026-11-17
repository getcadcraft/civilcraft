---
title: Pasirinkti, kopijuoti ir įklijuoti topografinius taškus
summary: Pasirinkite topografinius taškus spustelėdami, su Shift ir langeliu arba visus iš karto; kopijuokite, iškirpkite, įklijuokite, įklijuokite vietoje, dubliuokite ir naikinkite juos su nauju, niekada nesutampančiu numeriu; įklijuokite taškų eilutes iš skaičiuoklės ir į ją.
keywords: kopijuoti, įklijuoti, iškirpti, dubliuoti, naikinti taškus, pasirinkti taškus, pasirinkti visus, langelio pasirinkimas, langas, iškarpinė, skaičiuoklė, csv, pernumeravimas, taškų numeriai, įklijuoti vietoje, klonas, nužymėjimas
from: 78a6aea7
---

Topografinius taškus galima kopijuoti ir įklijuoti projekte, tarp projektų dviejuose naršyklės skirtukuose bei į skaičiuoklę ir iš jos. Kiekvienas pakeitimas – vienas anuliavimo žingsnis, o paviršius iš karto perskaičiuojamas pagal naujus taškus.

## Pasirinkti taškus

Su {{ui:Pasirinkti}} ({{key:V}}):

- **Spustelėkite** tašką, kad pasirinktumėte jį (tik jį). Jo numeriai rodomi skiltyje **Ypatybės**.
- {{key:Shift}} ir **spustelėkite** prideda tašką prie pasirinkimo arba jį išima.
- {{key:Shift}} ir **vilkite** nubrėžia langelį: langelyje esantys taškai pridedami prie pasirinkimo. Jei vilkite aplink taškus, tai tampa lasso; žr. [Topografinių taškų lasso pasirinkimas](topic:lasso-selection). Vilkimas be {{key:Shift}} slenka, kaip visada.
- {{key:Mod+A}} (arba {{ui:Daugiau}} › {{ui:Pasirinkti visus taškus}}) pasirenka visus taškus.
- {{key:Esc}} (arba {{ui:Daugiau}} › {{ui:Nieko nepasirinkti}}) panaikina pasirinkimą.

Pasirinkti taškai turi žiedą. Kai pasirinkta daugiau nei vienas, skiltyje **Ypatybės** rodoma, kiek jų yra, jų numeriai, aukščių intervalas ir grupės.

## Kopijuoti, iškirpti ir naikinti

- {{ui:Kopijuoti}} arba {{key:Mod+C}} nukopijuoja pasirinktus taškus. CivilCraft išsaugo kopiją ir taip pat įdeda ją į sistemos iškarpinę kaip taškų eilutes, kad galėtumėte ją tiesiai įklijuoti į skaičiuoklę ar teksto failą.
- {{ui:Daugiau}} › {{ui:Iškirpti}} arba {{key:Mod+X}} nukopijuoja juos ir ištrina vienu žingsniu.
- {{ui:Daugiau}} › {{ui:Naikinti}} arba {{key:Delete}} juos ištrina. {{key:Mod+Z}} juos grąžina.

Eilutės yra: taškas, šiaurinė koordinatė, rytinė koordinatė, aukštis, aprašymas (P,N,E,Z,D), atskirti kableliais, su trim skaitmenimis po kablelio. Kad rytinė koordinatė būtų prieš šiaurinę, nustatykite **Taškų eilutės** [CivilCraft nustatymuose](topic:settings). Aprašymas, kurį skaičiuoklė laikytų formule (pradedamas =, +, - arba @), gauna apostrofą priekyje, kad liktų tekstas.

## Įklijuoti

1. Paspauskite {{key:Mod+V}} arba spustelėkite {{ui:Įklijuoti}}. Taškai seka žymeklį kaip maži kryžiukai, o punktyrinė linija rodo atgal į vietą, iš kurios jie atėjo.
2. Spustelėkite, kur jie turi būti. Nukopijuotų taškų vidurys patenka į paspaudimo vietą.
3. Arba paspauskite {{key:Enter}}, kad jie būtų įdėti pagal savo koordinates, o {{key:Esc}} – atšaukti.

{{ui:Daugiau}} › {{ui:Įklijuoti vietoje}} arba {{key:Mod+Shift+V}} įklijuoja taškus pagal jų koordinates iš karto. Įklijuoti taškai po to pažymimi, todėl galite juos vėl kopijuoti, perkelti ar naikinti.

:::note
Spustelėjus {{ui:Įklijuoti}} įrankių juostoje skaitoma sistemos iškarpinė. Pirmą kartą naršyklė gali paklausti, ar CivilCraft gali matyti iškarpinę. Jei atsisakote, įrankių juostos mygtukas įklijuoja tik CivilCraft pačios kopiją; {{key:Mod+V}} vis dar įklijuoja eilutes iš skaičiuoklės be klausimo.
:::

## Taškų numeriai niekada nesutampa

Du taškai niekada neturi to paties numerio. Įklijuodami:

- Įklijuotas taškas išlaiko savo numerį, jei projekte nėra taško su tokiu numeriu. Todėl po **Iškirpti** taškai įklijuojami atgal su savo numeriais, o taškai, nukopijuoti iš kito projekto, išlaiko savo numerius, jei jie laisvi.
- Įklijuotas taškas, kurio numeris užimtas, gauna naują sveikąjį skaičių: vienu daugiau nei didžiausias naudojamas numeris, skaičiuojant aukštyn.
- Būsenos juostoje rodoma, kas nutiko, pavyzdžiui „1 išlaikė numerį; 9 gavo naujus numerius: 10–18 tapo 277–285“.

[CivilCraft nustatymuose](topic:settings) galite pasirinkti **Visada nauji numeriai** ir numerį, nuo kurio naujiems numeriams pradėti, pavyzdžiui 5000 projektavimo taškams.

:::warning
Taškų grupės, kurios paviršių sudaro kaip **lūžio liniją**, savo taškus jungia pagal numerių eilę. Įklijuotos taškų kopijos (pavyzdžiui, FL matavimai) gauna naujus, didesnius numerius ir prijungiamos prie tos lūžio linijos galo, galbūt su ilgu šuoliu. Po tokių taškų įklijavimo patikrinkite planą arba nustatykite jų grupę kaip {{ui:Taškai}}.
:::

## Dubliuoti

{{ui:Daugiau}} › {{ui:Dubliuoti}} arba {{key:Mod+D}} sukuria pasirinktų taškų kopiją, kuri seka žymeklį: spustelėkite, kur ji turi būti. Kopijos visada gauna naujus numerius, o CivilCraft iškarpinė paliekama tokia, kokia buvo.

## Iš skaičiuoklės arba teksto failo

Pasirinkite taškų eilutes skaičiuoklėje (taškas, šiaurinė koordinatė, rytinė koordinatė, aukštis, aprašymas) ir nukopijuokite jas. CivilCraft paspauskite {{key:Mod+V}} ir spustelėkite, kur jos turi būti, arba paspauskite {{key:Mod+Shift+V}}, kad jos būtų įdėtos pagal savo koordinates, o tai paprastai ir reikalinga tikriems topografiniams duomenims.

Eilutės skaitomos taip pat kaip [taškų failas](topic:point-file-formats): kableliai, tabuliacijos ar tarpai, antraštės eilutė, jei yra. Be antraštės stulpelių tvarką nustato **Taškų eilutės** [CivilCraft nustatymuose](topic:settings).

Kai yra abu, CivilCraft sprendžia pagal tai, kas naujesnė: iškarpinės eilutės, kurios skiriasi nuo paskutinės CivilCraft kopijos, nukopijuotos vėliau, todėl jos įklijuojamos. Tekstas be taškų ignoruojamas, o įklijuojama CivilCraft pačios kopija.

## Tarp projektų ir skirtukų

Kopija laikoma šioje naršyklėje, todėl antras CivilCraft skirtukas gali ją įklijuoti net uždarius pirmąjį skirtuką. Metrų projekte nukopijuoti taškai, įklijuoti į pėdų projektą, išlaiko savo numerius: niekas nekonvertuojama, o būsenos juostoje tai nurodoma.

## Kas nekopijuojama

Kol kas kopijuojami tik topografiniai taškai. Trasos, aikštelės, vamzdynų tinklai, lūžio linijos ir ribos dar negali būti kopijuojamos ar įklijuojamos. Įklijavimas negali perkelti esamų taškų: naudokite {{ui:Iškirpti}} ir įklijavimą arba perkelkite po vieną tašką ([Redaguoti topografinį tašką](topic:edit-points)).
