---
title: Mėginių linijos ir skerspjūviai
summary: Pjaukite skerspjūvius statmenai trasai, matykite žemę, projektą ir iškasą bei pylimą kiekviename pikete, o tūrius gaukite vidutinių galų plotų metodu.
keywords: masių diagrama, masių perskirstymas, balanso taškas, susitraukimas, išsipūtimas, pervežimo atstumas, skolinys, atliekos, pjūvių lapai, skerspjūvių lapai, pjūvių PDF, pjūviai, skerspjūviai, mėginių linijos, pjūvio rodinys, iškasa, pylimas, plotai, vidutinio galo plotas, tūriai pagal galo plotus, žemės darbai, pikietas, nuokrypis, csv
from: 5060173c
---

Skerspjūvis rodo kelią taip, kaip jis bus nutiestas: statmenai trasai vienu pikete, esamą žemę, projektą (koridorius ar aikštelė, išlyginta) ir iškasą bei pylimą tarp jų.

## Pridėkite mėginių linijas

1. Pasirinkite trasą. **Savybėse**, skyriuje **Mėginių linijos**, spauskite {{ui:Pridėti mėginių linijas}}.
2. Nustatykite **Kas** (tarpą: pradžioje 50 ft arba 20 m), **Kairės plotis** ir **Dešinės plotis** (kiek toli kiekvienas pjūvis siekia nuo ašies).
3. Norėdami pjauti pjūvį konkrečiame pikete, įveskite jį į **Pridėti pikietą** (pavyzdžiui, `2+35`) ir spauskite {{key:Enter}}.

Pjūviai pjaunami kiekvieno sveikojo tarpo kartotinio, abiejuose trasos galuose, kiekvienos kreivės pradžioje ir gale (PC ir PT) bei pikietuose, kuriuos pridedate. Mėginių linijos rodomos plane kaip pilkos linijos skersai trasos; jos taip pat išeina į DXF, DWG ir PDF sluoksnyje C-ROAD-SCTN. Kiekvienas pakeitimas yra vienas žingsnis: {{key:Mod+Z}} jį anuliuoja.

## Pjūvio rodinys

Atverkite jį su {{ui:Pjūvio rodinys}} trasos **Savybėse**, {{ui:Pjūviai}} skyriuje **Paviršius** › {{ui:Daugiau}}, arba {{key:X}}. Jis pakeičia profilio vaizdą po planu.

- Pereikite per pjūvius rodyklėmis jo juostoje, pikietų sąraše arba {{key:Left}} ir {{key:Right}}, kai pjūvio rodinys fokusuojamas ({{key:Home}} ir {{key:End}} – pirmam ir paskutiniam).
- Pilka linija yra esama žemė, raudona – projektas. Iškasa nuspalvinta oranžine, pylimas – žalia. Koridoriaus taškai pažymėti: CL (ašis), EOP (važiuojamosios dalies kraštas), SH (pečius) ir DL (dienos linija).
- Antraštėje nurodomas pikietas, šio pjūvio iškasos ir pylimo plotai bei vertikalus perdėjimas. **Pritaikyti** užpildo skydelį; pasirinkite 1× norėdami pamatyti pjūvį tikru mastu.
- Storoji linija plane rodo, kuris pjūvis matomas ekrane.

## Pjūvių lapai

{{ui:Pjūvių lapai (PDF)}} skyriuje **Mėginių linijos** deda kiekvieną pjūvį į PDF puslapius, eilėmis iš kairės į dešinę ir iš viršaus į apačią pagal pikietų tvarką. Pasirinkite **Popierius**, **Plano mastelis** (horizontalus pjūvių mastelis) ir **Profilio perdėjimas** (1×, 2×, 5× arba 10×); dialogas nurodo, kiek pjūvių telpa puslapyje ir kiek puslapių tai sudaro.

Kiekvienas pjūvis rodo tinklelį su nuokrypiais ir aukščiais, žemę (brūkšniuota), projektą, iškasą ir pylimą nuspalvintus (oranžine ir žalia), koridoriaus taškus, o po juo – jo pikietą ir jo iškasos bei pylimo plotus. Kiekvienas pjūvis lapuose nubraižytas tokio paties dydžio, pakankamai aukštas didžiausiam. Kai tai netelpa puslapyje su jūsų perdėjimu, CivilCraft naudoja didžiausią, kuris telpa, ir tai nurodo. Antraštės juosta nurodo trasą, pikietus tame puslapyje, mastelius ir „Lapas 1 iš 3“.

## Tūriai pagal vidutinius galų plotus

Tarp dviejų gretimų pjūvių tūris yra jų dviejų plotų vidurkis, padaugintas iš atstumo tarp jų pikietų. Juosta rodo trasos sumas, o {{ui:CSV}} atsisiunčia kiekvieno pjūvio plotus ir tūrius su bėgančiomis sumomis (kubiniais jardais pėdų projektams, kubiniais metrais metriniams).

**Savybėse** rodomos tos pačios sumos šalia tinklelio metodo tūrių iš [Žemės darbų tūriai](topic:volumes). Jie yra skirtingi apytiksliai įverčiai: artimesni pjūviai juos suartina, o tiesiame kelyje lygioje vietovėje jie sutampa.

:::note
Iškasa ir pylimas skaičiuojami tik išlygintose zonose (koridoriaus ar aikštelės dienos linijose), kaip ir tinklelio metode. Be koridoriaus ar aikštelės projektas yra žemė, todėl pjūvis nerodo nei iškasos, nei pylimo.
:::

## Masių perskirstymas

**Masių perskirstymas** skyriuje **Mėginių linijos** nubraižo masių diagramą pagal tuos pačius galų plotų tūrius: išilgai pikietų, bėgančią iškasos sumą atėmus pylimą.

- **Iškasos susitraukimas (−) arba išsipūtimas (+)** nurodo, ką kubinis jardas iškasos duoda, kai jis sudedamas kaip pylimas: −10 % (pradinė reikšmė, vietos rezervuotė) reiškia, kad jis susitraukia iki 0.9; išsipūtusi uola gali būti +5 %. Naudokite savo geotechninės ataskaitos skaičių.
- Kur linija kyla, kelias yra iškasoje; kur leidžiasi – pylime. Virš nulio (nuspalvinta oranžine) žemė juda pagal pikietą aukštyn; žemiau nulio (žalia) – žemyn.
- **Balanso taškai** yra ten, kur linija kerta nulį: tarp dviejų jų iškasa ir pylimas subalansuoti. Lentelėje išvardijamas kiekvienas subalansuotas ruožas, pernešamas tūris (jo aukščiausias arba žemiausias taškas) ir vidutinis pervežimo atstumas (nuspalvintas plotas, padalytas iš to tūrio).
- Kur linija baigiasi ne nulyje, likusi dalis yra **atliekos** (viršuje) arba **skolinys** (apačioje). Tame paskutiniame ruože skaičiuojama tik žemė, esanti už lygio, kuriame ji baigiasi.

**CSV** įrašo masės ordinatę kiekviename pjūvyje, ruožus ir koeficientą.
