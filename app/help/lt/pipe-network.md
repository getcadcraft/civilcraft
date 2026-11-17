---
title: Gravitacinio vamzdynų tinklo išdėstymas
summary: Braižykite lietaus ar buitinių nuotekų vamzdžių ruožus konstrukcija po konstrukcijos, nustatykite nuolydžio, uždengimo ir nuleidimo taisykles, leiskite CivilCraft nustatyti dugnų aukščius ir ištaisykite jo nurodytas problemas.
keywords: konstrukcijų kūrėjas, konstrukcijos tipas, stačiakampė konstrukcija, įleidimo šulinys, rėmas, gaubtas, sienelės storis, bibliotekos elementas, vamzdynų tinklas, lietaus, buitinės, nuotekos, konstrukcijos, šachtos, įtakos, dugnai, nuolydis, nuleidimas, viršutinis kraštas, duobė, gravitaciniai vamzdžiai
from: 10a3c14d
---

Projekte yra vienas gravitacinis vamzdynų tinklas: lietaus ar buitinis. Jį sudaro konstrukcijos (šachtos, įtakos) ir tiesūs vamzdžiai tarp jų. Srautas teka ta kryptimi, kuria braižote. CivilCraft kiekvieną vamzdį ir konstrukciją tikrina pagal tris jūsų nustatytas taisykles ir gali nustatyti visus dugnų aukščius iš tų taisyklių.

## Nubrėžkite ruožą

Vamzdžius galite braižyti be paviršiaus, bet viršutiniai kraštai, uždengimas ir automatiniai dugnų aukščiai reikalauja paviršiaus.

1. Paspauskite {{key:P}} arba spustelėkite {{ui:Vamzdžiai}} grupėje **Projektavimas**.
   Užuomina sako: „Vamzdžiai: spustelėkite konstrukcijas nuo ruožo viršaus žemyn (spustelėkite esamą, kad prisijungtumėte). Enter baigia.“
2. Spustelėkite, kur turi būti aukštutinė konstrukcija. Konstrukcija įdedama.
3. Spustelėkite kiekvieną kitą konstrukciją žemiau srauto. Norėdami prisijungti prie jau esančios konstrukcijos, spustelėkite ją: būsenos juostoje rašoma „Prijungta S3.“
4. Paspauskite {{key:Enter}}.
   Vamzdžiai nubrėžiami, jų dugnų aukščiai nustatomi pagal taisykles, o būsenos juostoje rašoma, pavyzdžiui: „3 vamzdžiai nubrėžti, 12 dugnų aukščių nustatyta pagal taisykles; visi patikrinimai praėjo.“

Naujos konstrukcijos pavadinamos S1, S2 … su 48 in (1200 mm) skersmeniu. Nauji vamzdžiai pavadinami P1, P2 … su 12 in (300 mm) skersmeniu. Skersmenys išreiškiami coliais pėdų projekte ir milimetrais metrų projekte.

Baigti paspauskite {{key:Enter}}. Dukart spustelėjimas taip pat veikia, bet kai dukart spustelėjate esamą konstrukciją, kad ruožą čia baigtumėte, prisijungimas nukrenta: spustelėkite ją vieną kartą, tada paspauskite {{key:Enter}}.

## Nustatykite taisykles

Kai nieko nepasirinkta, dešiniajame skydelyje (**Projektas**) yra **Vamzdynų tinklo** blokas:

| Nustatymas | Pradinė reikšmė | Ką reiškia |
|---|---|---|
| Tipas | Lietaus | {{ui:Lietaus}} arba {{ui:Buitinis}}; įrašoma į LandXML |
| Mažiausias nuolydis | 0.50% | Kiekvienas vamzdis turi nusileisti bent tiek |
| Mažiausias uždengimas | 2 ft (0.6 m) | Nuo grunto iki vamzdžio viršaus visu vamzdžio ilgiu |
| Nuleidimas konstrukcijose | 0.10 ft (0.03 m) | Išleidimo dugno aukštis turi būti bent tiek žemiau kiekvieno įtakos dugno aukščio |

**Šios pradinės reikšmės yra laikinos, ne standartas.** Nustatykite reikšmes, kurių reikalauja jūsų agentūra ar projektas. Uždengimas matuojamas nuo grunto iki viršaus (dugnas plius vidinis skersmuo); sienelės storis neskaičiuojamas. Kur aikštelės ar koridoriai suformuoti, formuotas paviršius yra gruntas.

## Leiskite CivilCraft nustatyti dugnų aukščius

- {{ui:Nustatyti visus dugnų aukščius pagal taisykles}} (**Vamzdynų tinklo** bloke) nustato visus vamzdžius.
- {{ui:Nustatyti jo dugnų aukščius pagal taisykles}} (pasirinkus vieną vamzdį) nustato tik tą vamzdį.

Dirbdamas žemyn pagal srautą, kiekvienas ruožas pradeda bent uždengimu savo viršutinėje konstrukcijoje, nusileidžia bent mažiausiu nuolydžiu, nuleidžia bent tiek, kiek nuleidžiama per kiekvieną konstrukciją, ir eina giliau tose vietose, kur grunto lygis išilgai vamzdžio paliktų mažiau nei mažiausią uždengimą. Dugnų aukščiai apvalinami žemyn iki 0.01, niekada aukštyn. Būsenos juostoje rašoma „Dugnų aukščiai nustatyti: mažiausias uždengimas kiekvieno ruožo viršuje, bent mažiausias nuolydis, bent nuleidimas kiekvienoje konstrukcijoje.“ arba nurodoma, ko nepavyko padaryti.

## Redaguokite konstrukcijas ir vamzdžius

Spustelėkite konstrukciją ar vamzdį su {{ui:Pasirinkti}}, kad pamatytumėte jį dešiniajame skydelyje.

**Konstrukcija**: **Pavadinimas**, **Viršutinis kraštas**, **Duobės gylis**, **Skersmuo**, tada **Naudojamas kraštas**, **Duobė**, **Rytų koordinatė** ir **Šiaurės koordinatė**, ir įeinantys bei išeinantys vamzdžiai su jų dugnų aukščiais.

- Palikite **Viršutinį kraštą** tuščią, kad jis būtų paimtas iš paviršiaus; laukelis tada rodo paviršiaus reikšmę pilka spalva. Įveskite reikšmę, kad fiksuotumėte kraštą.
- Vilkite konstrukcijos rankenėlę plane, kad ją perkeltumėte. Jos vamzdžiai seka; jų dugnų aukščiai lieka tokie, kokie buvo, todėl vėliau patikrinkite problemas.

**Tipas**: pasirinkite vieną iš tinklo konstrukcijų tipų (žemiau) arba „nėra“ apvaliai konstrukcijai su jos skersmeniu.

**Vamzdis**: **Pavadinimas**, konstrukcijos, tarp kurių jis eina, **Skersmuo**, **Viršutinis dugnas**, **Apatinis dugnas**, tada **Ilgis**, **Nuolydis** ir **Mažiausias uždengimas**.

Paspauskite {{key:Enter}} po kiekvienos reikšmės.

## Skaitykite ir taisykite problemas

**Vamzdynų tinklo** blokas išvardija kiekvieną problemą (iki 40); spustelėkite vieną, kad pasirinktumėte vamzdį ar konstrukciją. Pasirinkus vamzdį ar konstrukciją, ji išvardija savo problemas. Kai nieko nepasirinkta, rodoma: „Visi vamzdžiai ir konstrukcijos atitinka taisykles.“

| Pranešimas (pavyzdžiai) | Ką daryti |
|---|---|
| „P2 teka į kalną (-0.40%).“ arba „… beveik horizontalus …“ | Sukeiskite dugnų aukščius arba nustatykite juos pagal taisykles. |
| „P2 su 0.30% yra lėtesnis nei mažiausias 0.50%.“ | Nuleiskite žemutinį dugną arba pakelkite viršutinį. |
| „P3 turi 1.40 uždengimo palei save, mažiau nei mažiausias 2.“ | Nuleiskite vamzdį; nustatykite jo dugnų aukščius pagal taisykles. |
| „S3 konstrukcijoje P4 išeina 245.20, mažiau nei 0.1 žemiau P3, įeinančio 245.25.“ | Nuleiskite išleidimo vamzdžio viršutinį dugną. |
| „P1 viršutinis taškas aukščiau nei S1 viršutinis kraštas.“ | Vamzdis per aukštas konstrukcijai. |
| „S2 turi 2 išeinančius vamzdžius; gravitaciniame tinkle iš kiekvienos konstrukcijos turi išeiti vienas.“ | Pašalinkite vieną išeinantį vamzdį arba nubrėžkite jį teisinga kryptimi. |
| „Vamzdžiai sudaro kilpą; srautas turi baigtis išleidimo vietoje.“ | Ruožas nubrėžtas atgal į save; ištrinkite vamzdį. |
| „S5 nėra paviršiuje ir neturi viršutinio krašto aukščio.“ | Įveskite kraštą arba perkelkite konstrukciją ant paviršiaus. |
| „P6 iš dalies išeina už paviršiaus ribų; uždengimas ten nežinomas.“ | Pratęskite paviršių arba sutikite, kad uždengimas ten netikrinamas. |
| „P7 dar neturi dugnų aukščių.“ | Įveskite juos arba nustatykite pagal taisykles. |

Problematiški vamzdžiai ir konstrukcijos plane taip pat pažymėti raudonai.

## Konstrukcijų tipai

Konstrukcijos tipas yra konstrukcija, sudaryta pagal jos parametrus: šachta, įtaka, jungties dėžė ar išleidimas, **apvali** (vidinis skersmuo) arba **stačiakampė** (vidinis plotis ir ilgis), su jos **sienelės storiu**, **grindų plokšte**, **duobe** žemiau žemiausio vamzdžio ir **rėmu bei gaubtu** (apvala ar stačiakampė anga, rėmo aukštis). Tipai priklauso tinklui, skiltyje **Konstrukcijų tipai** projekto Ypatybėse.

1. Spustelėkite {{ui:Naujas konstrukcijos tipas}}. Dialogas piešia konstrukciją plane ir pjūvyje, kai rašote.
2. Spustelėkite {{ui:Pridėti tipą}}.
3. Pasirinkite konstrukciją ir tipą pasirinkite skiltyje **Tipas**. Ji perima tipo dydį ir duobę; jos pačios duobę dar galima keisti.

Redaguokite tipą, ir kiekviena to tipo konstrukcija seka jo dydžius. Pašalinus tipą, jo konstrukcijos lieka apvaliomis konstrukcijomis to paties pločio. Kiekvienas pakeitimas yra vienas žingsnis: {{key:Mod+Z}} jį atšaukia.

Stačiakampė konstrukcija nupiešiama plane, DXF, DWG ir PDF, o 3D vaizde – kaip stačiakampis, kurio ilgis išilgai jos išleidimo vamzdžio; vamzdžiai prasideda nuo jos sienos. LandXML ją įrašo kaip stačiakampę konstrukciją (`RectStruct`) su jos sienelės storiu ir tokias konstrukcijas skaito atgal kaip tipus.

### Bendrinkite tipą per biblioteką

{{ui:Įrašyti kaip bibliotekos elementą}} įrašo tipą kaip CadCraft bibliotekos elementą (`.json` failą): jo planų simbolį, 3D kūną iki tipinio gylio ir visus dydžius. Įkelkite jį į biblioteką, kad bendrintumėte. {{ui:Atidaryti bibliotekos elementą}} nuskaito taip įrašytą konstrukciją atgal į tinklą, konvertuotą į projekto vienetus. Bibliotekos elementai, kurie nėra CivilCraft sukurtos konstrukcijos, atmetami, nurodant priežastį.

## Naikinimas

Pasirinkite vamzdį ir paspauskite {{key:Delete}}, kad jį pašalintumėte. Ištrynus konstrukciją, pašalinami ir su ja sujungti vamzdžiai. Mac kompiuteryje paspauskite Fn ir delete arba spustelėkite {{ui:Naikinti}}.

## Dar neįgyvendinta

Srautai, vamzdžių dydžiai ir hidraulinė energijos linija yra [Lietaus nuotekos](topic:storm-drainage). Vamzdžių katalogai, nenuapvalinti vamzdžiai, vamzdžiai profilio vaizde, išlenkti vamzdžiai ir daugiau nei vienas tinklas viename projekte dar neprieinami. Žr. [Dar neįgyvendinta](topic:not-built-yet).
