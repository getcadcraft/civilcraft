---
title: Laistymo projektavimas
summary: Skaičiavimo priemonė, o ne patvirtintas projektas: purkštukai, šoniniai vamzdžiai, magistralė, vožtuvai ir lašinimo linijos vietovėje; zonos, rastos pagal vamzdžius; slėgio nuostoliai pagal Hazen–Williams, blogiausias purkštukas, debitas ir slėgis, palyginti su tiekimu, kritulių intensyvumas, veikimo trukmė, aprėptis ir medžiagų sąrašas.
keywords: laistymas, laistytuvas, purkštukas, purškimas, sukamasis purkštukas, rotorius, sukamasis antgalis, burbuliuotuvas, lašinimas, lašinimo linija, lašintuvas, vožtuvas, zona, stotis, valdiklis, magistralė, šoninis vamzdis, prijungimo taškas, vandens tiekimas, slėgis, psi, kpa, debitas, gpm, trinties nuostoliai, hazen williams, kritulių intensyvumas, veikimo trukmė, aprėptis, galva prie galvos, medžiagų sąrašas
from: 7d6342c1
---

:::warning
Tai skaičiavimo priemonė, o ne patvirtintas projektas: laistymo sistemos projektuotojas patikrina kiekvieną rezultatą prieš bet ką statant.
:::

## Sudarykite sistemą

1. Kairiajame skydelyje skiltyje **Laistymas** pasirinkite **Purkštukas**, jo **Lankas** ir kur lankas prasideda, taip pat šoninių ir magistralės vamzdžių dydžius.
2. {{ui:Laistymas}} › {{ui:Prijungimo taškas}}: spustelėkite, kur prisijungia vandens tiekimas. Savybėse nustatykite jo **slėgį**, **turimą debitą** ir skaitiklio bei atbulinio vožtuvo nuostolį.
3. {{ui:Laistymas}} › {{ui:Vožtuvas}}: spustelėkite, kur eina kiekvienos zonos vožtuvas. Vožtuvas pradeda zoną.
4. {{ui:Laistymas}} › {{ui:Purkštukas}}: spustelėkite, kad padėtumėte purkštukus; kiekvienas spustelėjimas padeda vieną.
5. {{ui:Laistymas}} › {{ui:Šoninis vamzdis}}: spustelėkite nuo vožtuvo per jo purkštukus ir paspauskite {{key:Enter}}. {{ui:Magistralė}}: nuo prijungimo taško iki kiekvieno vožtuvo.

Vamzdžių galai prisitraukia prie purkštukų, vožtuvų, tiekimo ir kitų vamzdžių galų, todėl tinklas susijungia. Zona – tai viskas, kas pasiekiama nuo jos vožtuvo šoniniais vamzdžiais; magistralė vienu metu neša vieną zoną.

## Lašinimas

{{ui:Laistymas}} › {{ui:Lašinimo linija}}: spustelėkite palei liniją, pradėdami ten, kur ji maitinama (šoninio vamzdžio galas arba vožtuvas). Savybėse nustatykite **lašintuvo debitą** ir **tarpą**; linijos debitas – išilgai jos esančių lašintuvų debitų suma.

## Patikra

{{ui:Laistymas}} › {{ui:Patikrinti sistemą…}} išvardija kiekvieną zoną:

| Stulpelis | Kaip apskaičiuojama |
|---|---|
| Debitas | Purkštukų debitų (ir lašinimo linijų) suma |
| Prie vožtuvo | Blogiausio purkštuko darbinis slėgis plius vamzdžių nuostoliai iki jo (Hazen–Williams, vamzdžio vidinis skersmuo, aukščių skirtumas) ir nuostolis per vožtuvą |
| Prie tiekimo | Tas pats plius magistralės, nešančios tą zoną, nuostolis, ir skaitiklio bei atbulinio vožtuvo nuostolis |
| Kritulių intensyvumas | Purkštukų debitas, padalytas iš ploto, kurį jie laisto esant tarpui galva prie galvos |
| Minutės per savaitę | Pagal nustatymą **Laistyti per savaitę** |
| Problemos | Greitis viršija ribą, purkštukas už savo slėgio diapazono ribų, purškikliai ir rotoriai ant vieno vožtuvo, tiekimo vietoje nepakanka slėgio ar debito, purkštukai neprijungti prie jokios zonos, kilpos |

Pasirinkite vožtuvą, kad pamatytumėte jo zonos skaičius ir blogiausią purkštuką, apibrėžtą plane apskritimu. Medžiagų sąrašas suskaičiuoja purkštukus pagal rūšį ir lanką, vamzdžius pagal dydį, vožtuvus, lašinimo liniją ir lašintuvus bei valdiklio stotis. **Įrašyti kaip CSV** išsaugo abu.

Laistymo skiltyje esantys parametrai: **Hazen–Williams C** (150 naujiems plastikiniams vamzdžiams), **didžiausias debitas** vamzdyje (1.5 m/s), **nuostolis per vožtuvą** ir **laistyti per savaitę**. Jie pažymėti kaip numatytosios reikšmės.

## Aprėptis

{{ui:Laistymas}} › {{ui:Rodyti aprėptį}} parodo, kiek ploto purkštukai palieka sausą, kiek ploto laisto du ar daugiau purkštukų ir kurie purkštukai nepasiekia kaimyno (tarpas galva prie galvos).

## Purkštukai

Purkštukų sąraše nurodyti purkštukai yra **bendri** tipai, kuriuos CadCraft sudarė pagal projektinius kritulių intensyvumus (fiksuoti purkštukai, sukamieji antgaliai, pavarų rotoriai, burbuliuotuvai, mikropurkštukai, lašintuvai), o ne kieno nors gaminiai. **Pridėti purkštukus iš failo…** nuskaito jūsų pačių purkštukus (JSON sąrašas su kiekvieno purkštuko nuotoliu, debitu ar kritulių intensyvumu ir slėgio diapazonu); jie išsaugomi kartu su projektu. Gamintojo paskelbti duomenys įtraukiami tik su to gamintojo įrašytu leidimu.

Po bendrais purkštukais sąraše yra **tipiniai purkštukai** (jų pavadinimai baigiasi "tipinės reikšmės"): fiksuotų purkštukų antgalių dydžiai, sukamieji antgaliai ir pavarų rotoriai, mikropurkštukai, burbuliuotuvai bei lašintuvai, su nuotoliu, debitu ir slėgio diapazonu. CadCraft juos apskaičiuoja pagal paskelbtas matematines formules (debitui – angos lygtis, nuotoliui – srovės nuotolio mastelis) ir nominalias debito klases, tik iš atvirųjų šaltinių; jokia gamintojo lentelė nekopijuojama. Pasirinkite vieną, ir parinkiklis parodys jo pagrindą ir licenciją. Projektas, kuris naudoja tokį purkštuką, išsaugo purkštuką ir jo šaltinį projekto faile. Jie skirti planavimui: prieš statant patikrinkite tikrųjų purkštukų duomenis.
