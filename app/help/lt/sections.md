---
title: Mėginių linijos ir skersiniai pjūviai
summary: Pjaukite pjūvius statmenai trasai, matykite gruntą, projektą ir iškasą bei įpylimą kiekviename stacionaže ir gaukite apimtis pagal vidutinius galų plotus.
keywords: masių pervežimo diagrama, masių kreivė, balanso taškas, susitraukimas, išbrinkimas, vežimo atstumas, pasiskolinimas, atliekos, pjūvių lapai, skersinių pjūvių lapai, pjūvių pdf, pjūviai, skersiniai pjūviai, mėginių linijos, pjūvio rodinys, iškasa, įpylimas, plotai, vidutinio galo plotas, galų plotų apimtys, gruntų darbai, stacionažas, poslinkis, csv
from: 09639ce2
---

Skersinis pjūvis rodo kelią taip, kaip jis bus pastatytas: statmenai trasai viename stacionaže – esamas gruntas, projektas (koridorius ar aikštelė, suvesta į gruntą) ir iškasa bei įpylimas tarp jų.

## Pridėkite mėginių linijas

1. Pasirinkite trasą. **Ypatybėse**, skiltyje **Mėginių linijos**, spustelėkite {{ui:Pridėti mėginių linijas}}.
2. Nustatykite **Kas** (žingsnį: pradžioje 50 ft arba 20 m), **Kairįjį plotį** ir **Dešinįjį plotį** (kiek toli kiekvienas pjūvis siekia nuo ašies).
3. Norėdami pjauti pjūvį tam tikrame stacionaže, įveskite jį lauke **Pridėti stacionažą** (pavyzdžiui `2+35`) ir paspauskite {{key:Enter}}.

Pjūviai pjaunami kas kiekvieną žingsnio kartotinį, abiejuose trasos galuose, kiekvienos kreivės pradžioje ir pabaigoje (PC ir PT) bei jūsų pridėtuose stacionažuose. Mėginių linijos plane rodomos pilkomis linijomis per trasą; jos taip pat eksportuojamos į DXF, DWG ir PDF sluoksnyje C-ROAD-SCTN. Kiekvienas pakeitimas yra vienas žingsnis: {{key:Mod+Z}} jį anuliuoja.

## Pjūvio rodinys

Atidarykite jį su {{ui:Pjūvio rodinys}} trasos **Ypatybėse**, su {{ui:Pjūviai}} skiltyje **Paviršius** › {{ui:Daugiau}} arba {{key:X}}. Jis užima profilio rodinio vietą po planu.

- Pjūvius pereinate rodyklėmis jo juostoje, stacionažų sąrašu arba {{key:Left}} ir {{key:Right}}, kai pjūvio rodinys aktyvus ({{key:Home}} ir {{key:End}} – pirmam ir paskutiniam).
- Pilka linija – esamas gruntas, raudona – projektas. Iškasa nuspalvinta oranžine, įpylimas – žalia. Koridoriaus taškai pažymėti: CL (ašis), EOP (dangos kraštas), SH (pakraštys) ir DL (ribinė linija).
- Antraštėje nurodomas stacionažas, šio pjūvio iškasos ir įpylimo plotai bei vertikalus išdidinimas. **Pritaikyti** užpildo skydelį; pasirinkite 1×, kad pjūvis būtų matomas tikru mastu.
- Storesnė linija plane rodo, koks pjūvis matomas ekrane.
- **Mastelis ir slinkimas:** ratukas keičia mastelį apie žymeklį, o tempimas perkelia vaizdą. {{ui:Pritaikyti}} (arba {{key:F}}, arba dukart spustelėjimas) vėl pritaiko visą pjūvį.

## Matavimas pjūvyje

1. Pjūvio juostoje spustelėkite {{ui:Matuoti}} arba paspauskite {{key:M}}. Užuomina sako: „Spustelėkite pirmą tašką, tada antrą.“
2. Spustelėkite du taškus. Kiekvienas prisitraukia prie linijos galo ar koridoriaus taško (CL, EOP, SH, DL); laisvam taškui laikykite {{key:Alt}}.
3. Rodmenyje nurodomas horizontalusis atstumas (ΔH), vertikalusis atstumas (ΔV), nuolydis procentais su santykiu ir tiesi ilgis projekto vienetais.

Spustelėkite dar kartą, kad pradėtumėte naują matavimą. {{key:Esc}} jį išvalo, o {{key:M}} išjungia Matavimą.

## Pjūvių lapai

{{ui:Pjūvių lapai (PDF)}} skiltyje **Mėginių linijos** kiekvieną pjūvį sudeda į PDF puslapius, eilėmis iš kairės į dešinę ir iš viršaus žemyn stacionažų tvarka. Pasirinkite **Popierių**, **Plano mastelį** (horizontalų pjūvių mastelį) ir **Profilio išdidinimą** (1×, 2×, 5× arba 10×); dialogas nurodo, kiek pjūvių telpa puslapyje ir kiek puslapių tai sudaro.

Kiekvienas pjūvis rodo tinklelį su poslinkiais ir aukščiais, gruntą (brūkšniuotai), projektą, nuspalvintą iškasą ir įpylimą (oranžine ir žalia), koridoriaus taškus, o po juo – stacionažą ir iškasos bei įpylimo plotus. Visi lapų pjūviai braižomi tokio pat dydžio, pakankamai aukšti didžiausiam; jei tai netelpa puslapyje pasirinktu išdidinimu, CivilCraft naudoja didžiausią tinkantį ir apie tai praneša. Antraštės juostoje nurodoma trasa, šio puslapio stacionažai, mastelis ir „Lapas 1 iš 3“.

## Iki ko matuojama iškasa ir įpylimas

Koridorius gali turėti sluoksnių po danga: dangos sluoksnius, šablono komponentus, vėžę (track). Pjūvio juostoje pasirinkite **Apimtis matuoti iki** – ką iškasa ir įpylimas pasiekia:

- **Apatinis paviršius** (numatytasis): iki tų komponentų apačios, todėl iškasa apima dangos konstrukcijos gylį.
- **Viršutinis paviršius**: tik iki projekto viršaus, kaip anksčiau, kai komponentai nebuvo skaičiuojami.

Antraštės plotai, apačioje esančios apimtys, CSV ir masių pervežimas visi seka šį pasirinkimą, ir jis išsaugomas kartu su projektu.

## Apimtys pagal vidutinius galų plotus

Tarp dviejų gretimų pjūvių apimtis yra jų dviejų plotų vidurkis, padaugintas iš atstumo tarp jų stacionažų. Juosta rodo trasos sumas, o {{ui:CSV}} atsisiunčia kiekvieno pjūvio plotus ir apimtis su kaupiamosiomis sumomis (kubiniai jardai projektams pėdomis, kubiniai metrai metriniams).

**Ypatybėse** rodomos tos pačios sumos šalia tinklelio metodo apimčių iš [Gruntų darbų apimtys](topic:volumes). Tai du skirtingi apytiksliai skaičiavimai: arčiau išdėstyti pjūviai juos suartina, o tiesiame kelyje lygiame grunte jie sutampa.

:::note
Iškasa ir įpylimas skaičiuojami tik suvestų plotų viduje (koridoriaus ar aikštelės ribinių linijų), kaip ir tinklelio metode. Be koridoriaus ar aikštelės projektas yra gruntas, todėl pjūvis neparodo nei iškasos, nei įpylimo.
:::

## Masių pervežimas

**Masių pervežimas** skiltyje **Mėginių linijos** braižo masių pervežimo diagramą pagal tas pačias galų plotų apimtis: išilgai stacionažų – kaupiamąją iškasos minus įpylimo sumą.

- **Susitraukimas (−) arba išbrinkimas (+) iškasoje** nurodo, kiek kubinio jardo iškasos tampa, kai įdėta kaip įpylimas: −10 % (pradinė reikšmė, vietos rezervuotojas) reiškia, kad ji susitraukia iki 0.9; uolienos, kurios brinksta, gali būti +5 %. Naudokite savo geotechninės ataskaitos reikšmę.
- Kur linija kyla, kelias yra iškasoje; kur leidžiasi – įpylime. Virš nulio (nuspalvinta oranžine) žemė pernešama didėjančio stacionažo kryptimi; žemiau nulio (žalia) – mažėjančio stacionažo kryptimi.
- **Balanso taškai** yra vietos, kur linija kerta nulį: tarp dviejų jų iškasa ir įpylimas subalansuoti. Lentelėje išvardijamas kiekvienas subalansuotas ruožas, perkeltas tūris (jo aukščiausias ar žemiausias taškas) ir vidutinis vežimo atstumas (nuspalvintas plotas, padalytas iš to tūrio).
- Kur linija baigiasi ne ties nuliu, likutis yra **atliekos** (viršuje) arba **pasiskolinimas** (apačioje). Tame paskutiniame ruože kaip perkeltas skaičiuojamas tik gruntas, viršijantis lygį, kuriame jis baigiasi.

**CSV** įrašo masių ordinatę kiekviename pjūvyje, ruožus ir koeficientą.
