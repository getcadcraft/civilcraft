---
title: Automobilių stovėjimo aikštelės planavimas
summary: Išdėstykite stovėjimo vietas, važiavimo juostas, specialias vietas ir salas kontūro viduje, sureguliuokite aikštelės nuolydžius į nuleidimus pagal esamą žemę, tada įrengkite dangą ir apželdinkite. Pasiekiama ir per asistentą.
keywords: stovėjimas, aikštelė, vieta, važiavimo juosta, neįgaliesiems, ada, mikroautobusas, sala, nuleidimas, nuolydis, kasimas, pylimas, danga, plytelės, apželdinimas, medžiai, reljefas, taškų debesis, mcp, asistentas
from: 06c14da9
---

Sutalpinkite automobilių stovėjimo aikštelę į sklypą, aikštelę ar uždarą elemento liniją ir gaukite vietų skaičių, vertikalųjį planavimą bei dangą vienu žingsniu.

## Išdėstyti

1. Plane pasirinkite sklypą, aikštelę ar uždarą elemento liniją.
2. Atidarykite **Paviršius, Daugiau, Automobilių stovėjimo aikštelė...**
3. Pasirinkite taisykles, vietos kampą (90, 75, 60, 45, 30 laipsnių arba lygiagrečią) ir vienpuses ar dvipuses važiavimo juostas. Vietų, važiavimo juostų ir salelių dydžiai pradedami nuo lentelės, o kiekvieną galima perrašyti.
4. Spustelėkite **Išdėstyti**.

Eilės lygiuojamos palei kontūro kraštą, kuris suteikia daugiausia vietų (arba pagal jūsų įvestą kampą). Vieta skaičiuojama tik tada, jei ji visa telpa į kontūrą. Jei liko vietos vienai eilei ir važiavimo juostai, pridedama vienpusė juosta. Langas išvardija vietas, specialias vietas neįgaliesiems ir mikroautobusams, salas, nuleidimus ir plotą vienai vietai. Plane stovėjimo vietos, vietos neįgaliesiems su brūkšniuotomis privažiavimo juostomis, salos, važiavimo juostų ašys ir nuleidimai rodomi savo sluoksniuose (C-PARK-...), todėl patenka į PDF, DXF ir DWG.

## Vietos neįgaliesiems

Pagal JAV taisykles skaičius seka 2010 ADA Standards 208.2 lentelę, pagal numatytas vietas (viena iš šešių, suapvalinta į viršų, yra vieta mikroautobusui). Vietos išdėstomos arčiausiai pirmojo kontūro kampo (įėjimo), kiekviena su privažiavimo juosta; dvi gali naudoti vieną juostą. Vieta, siauresnė už plotį neįgaliesiems, arba nuolydis, statesnis nei 1:48 vietose neįgaliesiems, rodomas kaip problema. **Šie skaičiai buvo įvesti iš standarto pagal atmintį ir nebuvo patikrinti pagal spausdintą standartą.** Įprasti vietų ir važiavimo juostų dydžiai paimti iš stovėjimo projektavimo vadovų ir taip pat nepatikrinti. Prieš pasikliaudami, patikrinkite abu ir savo vietinius reikalavimus. Pasirinkite **Pasirinktinis**, jei norite įvesti savo neįgaliesiems skirtų vietų skaičių.

## Nuolydžiai į nuleidimus, kasimas ir pylimas

Jei neišjungiate, aikštelė tampa grunto darbų plotu **Kraštovaizdžio** darbo srityje. Nuleidimai dedami ant važiavimo juostų ašių maždaug kas 100 feet (30 m); paviršius kyla nuo kiekvieno nuleidimo jūsų nurodytu nuolydžiu (pradžioje 1.5 procento), todėl kiekvienas taškas nuteka į artimiausią nuleidimą. Lygis parenkamas taip, kad aikštelės kasimas ir pylimas susibalansuotų su esama žeme. Esama žemė – tai esamas projekto paviršius, kuris gali būti sudarytas iš geodezinių taškų, LandXML, lidaro ar skenavimo taškų debesies, paverstos paviršiumi, arba iš horizontalių. Langas rodo kasimo ir pylimo įvertinimą; tikslią reikšmę vėliau rodo paties projekto tūriai. Grunto darbų plotas išlaiko savo kraštą ant esamos žemės, todėl jei naujas paviršius kraštu skiriasi nuo žemės, susidaro laiptas, o langas parodo, koks jis didelis.

## Danga ir apželdinimas

Visas kontūras gauna plytelių dangą (ruoželinį raštą, keičiamą **Kraštovaizdyje**, skiltyje **Kietoji danga**), o kiekviena sala gauna krūmų lysvę, o jei ji pakankamai plati – medį, pasirinktą iš augalų sąrašo. Po to viskas yra įprastas **Kraštovaizdžio** elementas: redaguokite jį arba pasirinkite **Išdėstyti iš naujo**, kad pakeistumėte tai, ką aikštelė sukūrė. Pašalinus aikštelę, pašalinami ir jos sukurti elementai.

## Iš asistento

Tą pačią aikštelę galima užsakyti per MCP: `parking_layout` rodo peržiūrą, `parking_build` įrašo, `parking_remove` ją pašalina. Nurodykite pagal sklypo pavadinimą arba pateikite kontūrą.

## Ko dar nėra

Ar važiavimo juostos pasiekia gatvę, netikrinama. Danga apima visą kontūrą, todėl jos plotas įskaito ir salas. Dangos medžiagų pasirinkimas iš Bibliotekos ir Bibliotekos tipas stovėjimo vietoms dar neįgyvendinti; dangos raštas – tas, kuris nustatytas **Kietojoje dangoje**. Kitų šalių taisyklių nėra.
