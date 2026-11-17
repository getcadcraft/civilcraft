---
title: Paviršiaus sudarymas ir tobulinimas
summary: Kaip CivilCraft triangliuoja esamą gruntą ir kaip jį formuoti naudojant lūžio linijų grupes, nubrėžtas lūžio linijas, išorinę ribą ir ilgiausią išorinę kraštinę.
keywords: tin, paviršius, triangliavimas, lūžio linija, riba, esamas gruntas, eg, sukurti paviršių, delaunay, trikampiai, didžiausia kraštinė, išorinė riba
from: b9eea3f3
---

CivilCraft projektui turi vieną esamo grunto paviršių. Tai TIN (trikampių nereguliarus tinklas), sudarytas iš jūsų taškų; jis automatiškai perskaičiuojamas kiekvieną kartą, kai pasikeičia kuri nors įvestis. Nėra komandos „perskaičiuoti“ ir nėra pasenusio paviršiaus.

## Kas patenka į paviršių

- Kiekvienas taškas su aukščiu grupėje, nustatytoje į {{ui:Taškai}}.
- Kiekviena grupė, nustatyta į {{ui:Lūžio linija}}, sujungta pagal taškų numerių tvarką.
- Kiekviena lūžio linija, nubrėžta įrankiu {{ui:Lūžio linija}}.
- Išorinė riba, jei nubrėžiate.
- Nustatymas **Ilgiausia išorinė kraštinė**.

Trikampiai niekada nekerta lūžio linijos: paviršius priverčiamas ją sekti, o aplink ją padaromas kiek įmanoma tolygesnis (visur kitur – Delaunay).

## Pakeiskite kodu pažymėtas linijas į lūžio linijas

1. Kairiajame skydelyje, skyriuje **Taškai**, raskite grupę (pavyzdžiui, FL).
2. Nustatykite jos **Paviršius** pasirinkimą į {{ui:Lūžio linija}}.
   Paviršius perskaičiuojamas, linija nubrėžiama oranžine spalva (su įjungta {{ui:Lūžio linijos}} skyriuje **Rodymas**), o paviršiaus duomenyse **Lūžio linijos** padidėja vienu.
3. Patikrinkite liniją plane. Ji turi eiti nuo taško prie taško ta tvarka, kuria linija buvo išmatuota. Jei ji zigzaguoja, grupėje yra daugiau nei viena linija arba taškai nesunumeruoti eilės tvarka: nustatykite grupę atgal į {{ui:Taškai}} ir braižykite linijas ranka (kitame skyriuje).

## Nubrėžkite lūžio liniją per taškus

1. Paspauskite {{key:B}} arba spustelėkite {{ui:Lūžio linija}} grupėje **Paviršius**.
   Užuomina sako: „Lūžio linija: spustelėkite geodezinės nuotraukos taškus eilės tvarka (ji paima jų aukščius). Enter baigia.“
2. Priartinkite žymeklį prie taško. Mažas oranžinis kvadratas žymi tašką, kurį ji paims.
3. Spustelėkite linijos taškus vieną po kito. Kiekvienas paspaudimas būsenos juostoje pavadina tašką ir nurodo jo aukštį.
4. Paspauskite {{key:Enter}}, kad baigtumėte.
   Būsenos juostoje rašoma: „Lūžio linija 1 pridėta; paviršius perskaičiuotas.“

Spustelėjimai turi pataikyti į geodezinės nuotraukos tašką, turintį aukštį; spustelėjimas kitur atmetamas su pranešimu „Spustelėkite geodezinės nuotraukos tašką su aukščiu: lūžio linija paima taškų aukščius.“ {{key:Backspace}} pašalina paskutinį tašką; {{key:Esc}} atšaukia visą liniją.

:::warning
Baikite su {{key:Enter}}. Dukart spustelėjus taip pat baigiama, bet šioje versijoje pašalinamas dukart spustelėtas taškas. Paskutinį tašką spustelėkite vieną kartą, tada paspauskite {{key:Enter}}.
:::

Norėdami iš karto pašalinti visas nubrėžtas lūžio linijas, spustelėkite {{ui:Pašalinti nubrėžtas lūžio linijas}} skyriuje **Paviršius**. Norėdami pašalinti tik paskutinę, naudokite {{key:Mod+Z}}. Nubrėžtų lūžio linijų kol kas negalima pasirinkti ar redaguoti po vieną.

## Nubrėžkite išorinę ribą

Riba apkerpa paviršių iki srities, kuria pasitikite, pavyzdžiui, geodezinės nuotraukos ribų, kad ilgi trikampiai per neišmatuotus kampus dingtų.

1. Paspauskite {{key:O}} arba spustelėkite {{ui:Riba}}.
2. Spustelėkite kampus eilės tvarka aplink plotą. Punktyrinė linija rodo formą.
3. Paspauskite {{key:Enter}}.
   Būsenos juostoje rašoma: „Riba nustatyta; trikampiai už jos pašalinti.“ **Riba** paviršiaus duomenyse rodo „Taip“ ir kampų skaičių.

Verta žinoti:

- Riba yra viena. Nubrėžus kitą, ji pakeičiama. {{ui:Pašalinti ribą}} ją pašalina.
- Ji gali tik atimti: riba, kuri išeina už taškų, apkerpama iki jų kontūro su pastaba „Riba išeina už taškų; ji apkirpta iki jų kontūro.“
- Jos kampai paima aukščius iš paviršiaus, todėl kraštinė tiksliai seka gruntą.
- Paslėptos (vidinės) ribos dar nepasiekiamos.

## Apkirskite ilgus išorinius trikampius

Be ribos paviršius užpildo visą taškų kontūrą, įskaitant ilgus siaurus trikampius per įgaubtas kraštines.

1. Skyriuje **Paviršius** įveskite ilgį laukelyje **Ilgiausia išorinė kraštinė** ir paspauskite {{key:Enter}}. Pradėkite maždaug nuo dviejų ar trijų tipinio matavimo žingsnio.
2. Išoriniai trikampiai, kurių išorinė kraštinė ilgesnė už tai, pašalinami, žingsniuojant į vidų, kol kiekviena išorinė kraštinė tampa pakankamai trumpa. Lūžio linijos kraštinė niekada nenuimama.
3. Įveskite 0, kad vėl palaikytumėte visus trikampius.

## Skaitykite paviršiaus ataskaitą

Paviršiaus duomenų apačioje langelyje išvardijama, ką padarė sudarytojas. Su ochros spalvos juosta kairėje tai informacija; su raudona juosta jame yra klaida ir paviršiaus nėra.

| Pranešimas | Reikšmė |
|---|---|
| „3 taškai buvo toje pačioje vietoje kaip kitas ir prisijungė prie jo.“ | Taškai, artimesni nei 0.0001 plane, tapo viena viršūne (paliekamas pirmasis). |
| „2 vietose yra du skirtingi aukščiai …“ | Vienas ant kito esantys taškai arba kertančios lūžio linijos nesutampa aukščiu. Pirmenybė teikiama lūžio linijos aukščiui, tada pirmajam. |
| „1 lūžio linijos dalies nepavyko įtraukti į paviršių.“ | Labai trumpa arba beveik persidengianti lūžio linijos dalis netilpo; patikrinkite tą vietą. |
| „Paviršiui reikia bent trijų taškų su aukščiais.“ | Per mažai taškų: patikrinkite stulpelių tvarką ir grupes. |
| „Visi taškai yra vienoje linijoje: trikampių nėra.“ | Taškai neturi pločio, pavyzdžiui, viena poligonometrijos linija. |
| „Riba nesutampa su taškais.“ | Riba yra kitur, dažnai dėl vienetų ar koordinačių painiavos. |
| „Ribos viduje trikampių neliko.“ | Riba per maža arba neteisingai padėta. |

## Paviršius, nuskaitytas iš LandXML

Atidarius LandXML, naudojamas pirmasis jos TIN paviršius, kaip jis yra: antraštė **Paviršius** rodo „Paviršius (iš LandXML)“, o **Ilgiausia išorinė kraštinė** išjungta. Kol šis paviršius naudojamas, lūžio linijų grupės, nubrėžtos lūžio linijos ir nauja riba jo nekeičia. Norėdami vietoj to sudaryti paviršių iš failo taškų, spustelėkite {{ui:Atkurti paviršių iš taškų}}. {{key:Mod+Z}} grąžina LandXML paviršių.

## Susiję

- [Skaitykite horizontales, aukščius ir nuolydžius](topic:contours).
- [Importuokite geodezinės nuotraukos taškus](topic:import-points).
