---
title: Horizontaliosios trasos išdėstymas
summary: Nubraižykite trasą pagal jos PI (sankirtos taškus), nustatykite lankų spindulius ir pradžios pikietą, perkelkite PI, skaitykite lankų duomenis, pikietą ir poslinkį.
keywords: trasa, sprendinio nėra, lankas netelpa, didžiausias spindulys, mažiausias spindulys, minimalus spindulys, projektinis greitis, persidengimas, ašinė linija, PI, horizontalusis lankas, spindulys, pikietažas, tangentė, sukurti trasą, trasos išdėstymas, PC, PT, pikietas poslinkis
from: 8c5df4aa
---

Trasa CivilCraft yra tiesiųjų ruožų grandinė per sankirtos taškus (PI), o bet kuriame vidiniame PI, turinčiame spindulį, įrašomas apskritiminis lankas. Trasa pikietuojama nuo pasirinkto pradžios pikieto. Projekte gali būti daug trasų.

## Nubraižyti trasą

1. Paspauskite {{key:A}} arba spustelėkite {{ui:Trasa}} grupėje **Projektavimas**.
   Užuomina sako: „Trasa: spustelėkite PI eilės tvarka. Enter arba dukart spustelėjimas baigia, Backspace pašalina paskutinį, Esc atšaukia.“
2. Spustelėkite pirmąjį PI (trasos pradžią).
3. Spustelėkite kiekvieną sekantį PI eilės tvarka. Raudona linija seka žymeklį ir rodo braižomo tiesiojo ruožo ilgį bei kryptį, pavyzdžiui „212.40 ft  N 63°12'05" E“.
4. Spustelėkite paskutinį PI (trasos pabaigą).
5. Paspauskite {{key:Enter}}.
   Trasa nubraižoma su pikietažu ir pažymima. Būsenos juostoje rašoma, pavyzdžiui: „Trasa 1: 386.36 ft, lankai 100 ft spindulio, kur telpa. Spindulius keiskite Ypatybėse; Profilis (R) – nuolydžiui projektuoti.“

Braižant: {{key:Backspace}} pašalina paskutinį PI, {{key:Esc}} atšaukia, o vilkimas tuščioje vietoje slenka vaizdą, nepridedant PI.

:::warning
Baikite su {{key:Enter}}. Dukart spustelėjus taip pat baigiama, bet šioje versijoje pašalinamas dukart spustelėtas PI. Paskutinį PI spustelėkite vieną kartą, tada paspauskite {{key:Enter}}.
:::

Kiekvienas vidinis PI gauna 100 ft (30 m metrų projekte) lanką arba didžiausią sveikąjį spindulį, kuris telpa pusėje kiekvieno tiesiojo ruožo, jei 100 ft netelpa. Labai aštrūs arba tiesiai praeinantys PI lanko negauna.

## Nustatyti spindulius ir koordinates

Pasirinkus trasą, dešiniajame skydelyje rodoma **Trasa**:

1. **Pavadinimas** ir **Pradžios pikietas**. Įveskite pikietą kaip `10+00` (ft) arba `0+500` (m), arba kaip paprastą skaičių. Žr. [Vienetai, pikietai ir skaičių formatai](topic:units-and-stations).
2. **Ilgis** ir **Galinis pikietas** apskaičiuojami jums.
3. **PI** lentelėje pateikiami kiekvieno PI **Rytai** ir **Šiaurė** bei **Spindulys** kiekvienam vidiniam PI. Įveskite naują reikšmę ir paspauskite {{key:Enter}}.
   - Spindulys 0 sukuria kampinį tašką be lanko.
   - Pirmasis ir paskutinis PI niekada neturi spindulio.
   - Mažas x eilutės gale pašalina tą PI (trasoje lieka bent du).
4. Skaitykite **Lankų** sąrašą: kiekvienam lankui – jo PC ir PT pikietus, spindulį R, posūkio kampą Δ ir kryptį (kairėn arba dešinėn), ilgį L, tangentę T, išorinį atstumą E ir stygą.
5. Eilutė po lankais nurodo pirmojo tiesiojo ruožo kryptį.

## Kai lankas netelpa

Jei lankams reikia daugiau tangentės, nei yra tarp jų PI, trasa neturi sprendinio: ji nebraižoma teisingai, kol jos nepataisysite, ir ji neįtraukiama į LandXML eksportus. Raudonas langelis skaičiais parodo priežastį ir pasiūlo, kas tilptų:

- „Lankams PI 2 ir PI 3 tarp jų reikia 240.00 ft tangentės (130.00 + 110.00), bet PI yra 180.00 ft atstumu.“ – arba, kai tik vienas iš jų turi lanką: „Lankui PI 2 reikia 240.00 ft tangentės link PI 1 …“.
- Kiekvieno PI mygtukas nustato **didžiausią tilpstantį spindulį** toje vietoje, paliekant kitą lanką nepakeistą (jis taip pat turi tilpti į kitą PI tiesiąjį ruožą). Kai abiejuose PI yra lankai, **Abu** proporcingai sumažina abu spindulius, kad vos susilygiuotų.
- Kai vienas lankas pats ilgesnis už tangentę, langelis sako, kad kitame PI joks lankas netelpa, kol jis toks didelis.
- PI, kuris pasisuka tiesiai atgal, lankui netinka; langelis siūlo **Be lanko PI n**.

Kiekvienas mygtukas atlieka vieną žingsnį: {{key:Mod+Z}} grąžina spindulius. Siūlomi spinduliai suapvalinami žemyn iki 0.01, kad visada tilptų.

### Projektinis mažiausias spindulys

Įveskite **Projektinį mažiausią spindulį** (pavyzdžiui, pagal projektinį greitį), kad kiekvienas lankas būtų tikrinamas pagal jį; jei nereikia, palikite tuščią. Lankas, mažesnis už jį, rodomas su mygtuku **mažiausiam spinduliui, atitinkančiam minimumą**, kai tas spindulys telpa. Kai jis netelpa, langelis tai nurodo ir pateikia didžiausią spindulį, kurį leidžia tiesieji ruožai, kad žinotumėte, jog reikia perkelti PI arba sumažinti minimumą.

## Perkelti PI plane

1. Su aktyviu {{ui:Pasirinkti}} spustelėkite trasą, kad ją pasirinktumėte. Jos PI atsiranda kvadratiniai valdikliai.
2. Vilkite valdiklį. Trasa, jos pikietažas, profilis ir koridorius seka paskui.
3. Atleiskite. Perkėlimas – vienas atšaukimo žingsnis.

Įterpti PI tarp dviejų esamų dar negalima: pašalinkite trasą ir nubraižykite iš naujo arba įveskite naujas turimų PI koordinates.

## Skaityti pikietą ir poslinkį

Perkelkite žymeklį per planą. Būsenos juostoje rodoma artimiausia trasa (arba pasirinkta) su pikietu ir poslinkiu: **L** arba **R**, žiūrint link didėjančio pikieto, pavyzdžiui, „Trasa 1: Pik. 2+15.30, poslinkis 18.42 R“. Už bet kurio galo pridedama „(už galo)“.

## Ką rodo brėžinys

Plane, DXF ir PDF rodoma: ašinė linija (tangentės kaip linijos, lankai kaip tikri lankai), žymė kas 50 ft (20 m), ilgesnė žymė ir pikieto žymė kas 100 vienetų, o PC ir PT žymės pažymėtos jų pikietais.

## Ištrinti trasą

Pasirinkite ją ir paspauskite {{key:Delete}}, arba spustelėkite {{ui:Naikinti}} įrankių juostoje arba dešiniojo skydelio apačioje. Kartu pašalinamas ir jos profilis bei koridorius. {{key:Mod+Z}} ją grąžina.

:::mac
Mac klaviatūroje klavišas, pažymėtas **delete**, naršyklei yra {{key:Backspace}} ir nepašalina pasirinkimo. Paspauskite {{key:Delete}} (Fn ir delete) arba naudokite {{ui:Naikinti}} mygtuką.
:::

## Kita

- [Suprojektuokite vertikalųjį profilį](topic:profile).
## Projektinis greitis ir klasė

Trasos ypatybėse **Projektinis greitis** (km/h arba mph) ir **Projektinė klasė** saugomi kartu su trasa, įrašomi projekte ir rašomi į IFC (Pset_RoadDesignCriteriaCommon). CivilCraft neturi lentelės, siejančios greitį su mažiausiu spinduliu, todėl pagal juos nieko netikrinama: **Mažiausią spindulį** nustatykite pagal savo projektavimo standartą.

## Spiralės

Lankas gali turėti klotoidinę spiralę bet kuriame gale: tangentė, spiralė, lankas, spiralė, tangentė. PI lentelėje įveskite ilgį laukuose **Spiralė įeinant** ir **Spiralė išeinant** PI, kuris turi spindulį. PI lieka vietoje; lankas pasislenka į vidų, kad sudarytų vietos, todėl tangentės atstumas padidėja per spiralės poslinkį. Abu ilgiai gali skirtis, o PI su vienu ilgiu gauna spiralę tik tame gale.

Lankų sąraše tuomet rodomi TS, SC, CS ir ST (tangentė–spiralė, spiralė–lankas, lankas–spiralė, spiralė–tangentė) su spiralės kampu θs, tangentės atstumais ir išoriniu atstumu. Pikietai eina palei spirales kaip visur kitur. Spiralės, kartu pasisukančios daugiau nei lankas, atmetamos su nurodytu PI; spiralė, ilgesnė nei leidžia tangentė, yra persidengimas, kaip ir bet kuriam lankui. Viražas naudoja spiralę kaip išlyginimo ruožą (žr. [Koridorius](topic:corridor)).
