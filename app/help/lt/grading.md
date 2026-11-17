---
title: Pastato aikštelės vertikalusis planavimas
summary: Nubrėžkite lygią aikštelę, nustatykite jos aukštį ir įpjovos bei įpylimo nuolydžius, o CivilCraft leiskite surasti nuolydžio sankirtą su esamu gruntu ir įtraukti aikštelę į projektuojamą paviršių.
keywords: atraminė siena, atraminės sienos, vertikalus šonas, siena vietoj nuolydžio, nuolydis pagal šoną, pylimas, vertikalusis planavimas, aikštelė, pastato aikštelė, nuolydžio sankirta, įpjovos nuolydis, įpylimo nuolydis, galutinis lygis, projektuojamas paviršius, planavimo grupė, charakteringa linija, nuolydžio linija
from: 482319a6
---

Aikštelė yra lygi plotas vienu aukščiu. Nuo jos kraštų CivilCraft formuoja nuolydį į išorę: pagal jūsų įpjovos nuolydį, kur gruntas aukštesnis už aikštelę, ir pagal įpylimo nuolydį, kur jis žemesnis, kol nuolydis susikerta su esamu gruntu. Ta susikirtimo linija yra nuolydžio sankirtos linija. Aikštelė ir jos nuolydžiai pakeičia esamą gruntą sankirtos linijos viduje ir sudaro projektuojamą paviršių.

## Nubrėžti aikštelę

Pirmiausia reikia esamo žemės paviršiaus.

1. Paspauskite {{key:G}} arba spustelėkite {{ui:Aikštelė}} **Projektavimas** grupėje.
   Užuomina sako: "Aikštelė: spustelėkite jos kampus. Enter arba dukart spustelėjimas baigia, Backspace pašalina paskutinį, Esc atšaukia."
2. Spustelėkite aikštelės kampus eilės tvarka, bet kuria kryptimi. Mėlynas kontūras seka žymeklį.
3. Paspauskite {{key:Enter}} po paskutinio kampo (bent trys).
   Aikštelė nubrėžiama ir pažymima. Ji prasideda ties žemės aukščiu jos viduryje, suapvalintu iki 0.1, su 2 : 1 įpjovos nuolydžiu ir 3 : 1 įpylimo nuolydžiu. Būsenos juosta pasako, pavyzdžiui: "Aikštelė 1 aukštyje 254.3 (žemė jos viduryje), įpjova 2:1, įpylimas 3:1. Pakeiskite juos savybėse."

:::warning
Baikite su {{key:Enter}}. Dukart spustelėjimas taip pat baigia, bet šioje versijoje nuo jo išmetamas dukart spustelėtas kampas. Kartą spustelėkite paskutinį kampą, tada paspauskite {{key:Enter}}.
:::

Aikštelės kontūras negali kirstis pats su savimi ("Aikštelės kontūras kertasi pats su savimi.").

## Nustatyti aukštį ir nuolydžius

Kai aikštelė pažymėta, dešinysis skydelis rodo **Aikštelė**:

1. **Pavadinimas**.
2. **Aukštis**: lygus aikštelės aukštis.
3. **Įpjovos nuolydis** ir **Įpylimo nuolydis**, kaip H:V (2 reiškia 2 : 1). Abu turi būti didesni už 0.
4. **Aikštelės plotas** ir **Kampai** rodomi informacijai.

Po kiekvienos reikšmės paspauskite {{key:Enter}}. Nuolydžio sankirtos linija, projektuojamas paviršius ir tūriai atsinaujina iš karto.

Po laukais rodoma eilutė, pavyzdžiui: "Nuolydžio sankirtos linija: 48 nuolydžio linijos (20 įpjovoje, 28 įpylime), toliausiai 31.20 ft." Plane nuolydžio sankirtos linija ir nuolydžio linijos rodomos magenta spalva.

## Kaip randama sankirta

- Nuolydžio linijos išeina iš kiekvieno krašto statmenai, maždaug kas dvidešimtą aikštelės dydžio dalį.
- Išoriniuose kampuose jos išsiskiria kas 10°, kad nuolydis apsuktų kampą.
- Vidiniuose kampuose viena linija eina per pusiausvyros liniją, kur susitinka dviejų kraštų nuolydžiai.
- Kiekviena linija kyla įpjovos nuolydžiu arba leidžiasi įpylimo nuolydžiu, kol pasiekia gruntą.

## Nuolydžiai pagal šoną ir atraminės sienos

Aikštelės, aikštelės ar pylimo savybėse, skiltyje **Šonai ir atraminės sienos**, kiekvieną šoną galima formuoti savaip. 1 šonas eina nuo pirmo jūsų spustelėto kampo iki antro, 2 šonas nuo antro iki trečio, ir taip toliau.

- **Visi šonai**: **Nuolydinis** naudoja aukščiau nurodytus įpjovos ir įpylimo nuolydžius visuose šonuose; **Vertikalūs: atraminės sienos** deda sieną kiekvienam šonui.
- Pagal šoną: **Nuolydžiai aukščiau**, **Savi nuolydžiai** (įveskite įpjovos ir įpylimo nuolydį tam šonui) arba **Vertikalus (atraminė siena)**.
- Nuolydį įveskite kaip `3` arba `3:1` (horizontaliai ir 1 vertikaliai), `33%` arba `18.4°`; jis rodomas kaip H:1. Paties aikštelės **Įpjovos nuolydis** ir **Įpylimo nuolydis** priima tą patį.
- Vertikalus šonas neturi pylimo: atraminė siena eina išilgai krašto, nuo aikštelės žemyn iki esamo grunto (įpylime) arba nuo grunto žemyn iki aikštelės (įpjovoje). **Sienos storis** (pradžioje 0.3 m arba 1 ft) yra atstumas, per kurį gruntas žingsniuoja nuo aikštelės krašto iki esamo grunto. Įpjovos ir įpylimo tūriuose neįskaičiuojamas pylimas, kurio tas šonas nebeturi.
- Kur siena susitinka su nuolydiniu šonu, nuolydis apsuka sienos galą; dvi sienos susitinka pjūviu.
- Po laukais rodoma: sienų ilgis, atviras paviršius (aukštis × ilgis), aukščiausias ir vidutinis aukštis.

Plane kiekvieno sienos išorinis paviršius nubrėžiamas trumpais brūkšniais per jį, o jos aukštis rodomas abiejuose galuose ir aukščiausioje vietoje (atraminių sienų sluoksnyje, kuris taip pat patenka į DXF ir DWG). 3D vaizde sienos rodomos kaip kietieji kūnai (Rodyti › Atraminės sienos), o GLB, OBJ ir USD eksportai jas apima. Pjūviai per kraštą rodo pakopą.

**Įspėjimai** (savybėse ir Problemų skydelyje): siena aukštesnė už **Įspėti, kai sienos aukštis viršija** (pradžioje 1.0 m arba 3.3 ft) reikšmę „gali reikėti inžinerinės sienos ar leidimo; patikrinkite vietines taisykles“, ir, kai įvedate **Didžiausias nuolydis, kurį laiko gruntas**, bet kuris šonas, kurio įpjovos ar įpylimo nuolydis statesnis nei tai. Tai įspėjimai: planavimas vis tiek sukuriamas. Kiekvienas pakeitimas yra vienas {{key:Mod+Z}} žingsnis.

## Perkelti kampus

Pažymėkite aikštelę, tada vilkite kvadratinę rankenėlę kampe. Kiekvienas vilkimas yra vienas anuliavimo žingsnis. Kampų pridėti ar pašalinti dar negalima: ištrinkite aikštelę ir nubrėžkite iš naujo.

## Kai neplanuojama

Raudona dėžutė skiltyje **Žemės darbai** nurodo aikštelę ir problemą:

| Pranešimas | Ką daryti |
|---|---|
| "3 nuolydžio linijos išeina už paviršiaus, prieš jį pasiekdamos: aikštelė per arti paviršiaus krašto arba per aukštai / per žemai." | Perkelkite aikštelę nuo paviršiaus krašto arba priartinkite jos aukštį prie grunto. |
| "Nuolydžio sankirtos linija kertasi pati su savimi (nuolydžiai iš skirtingų aikštelės pusių susiliečia). Pertvarkykite aikštelę arba pakeiskite nuolydžius." | Dažniausiai siaurose arba L formos aikštelėse giliame įpjovoje ar aukštame įpylime. Padidinkite aikštelę, sumažinkite skirtumą arba padarykite nuolydžius statesnius. |
| "Aikštelės kontūras kertasi pats su savimi." | Iš naujo nubrėžkite kampus aikštelės aplink eilės tvarka. |

Aikštelė su problema paliekama iš projektuojamo paviršiaus ir tūrių, kol ji nepataisoma.

## Žiūrėti rezultatą

1. Skiltyje **Rodymas** nustatykite **Paviršius** į {{ui:Projektuojamas (su nuolydžiais)}}. Horizontalės dabar eina lygiai per aikštelę ir seka nuolydžius iki nuolydžio sankirtos linijos.
2. Užveskite žymeklį ant aikštelės: būsenos juosta rodo **Gruntas** ir **Su nuolydžiais** aukščius.
3. Įpjovą ir įpylimą perskaitykite skiltyje **Žemės darbai**; žr. [Žemės darbų apimtys](topic:volumes).

Aikštelės planuojamos po koridorių, eilės tvarka, kuria buvo nubrėžtos. Vėlesnė aikštelė pakeičia viską, kas ankstesnė, jos pačios nuolydžio sankirtos linijos viduje.

## Ištrinti aikštelę

Pažymėkite ją ir paspauskite {{key:Delete}} (Mac kompiuteryje Fn ir delete) arba spustelėkite {{ui:Naikinti}}.

## Dar neįgyvendinta

Aikštelės yra lygios: nuolydžio aikštelės, charakteringos linijos su kintamu nuolydžiu, pakopos ir planavimas iki nurodyto atstumo ar aukščio tikslo dar nepasiekiami. Žr. [Dar neįgyvendinta](topic:not-built-yet).
