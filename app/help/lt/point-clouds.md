---
title: Taškų debesys iš dronų ar skaitytuvų
summary: Su priedu Taškų debesys atidarykite LAS ar LAZ failą su milijonais taškų, apžiūrėkite visą jį, išvalykite, surūšiuokite į žemę, augmeniją ir pastatus bei iš jo sukurkite žemę, horizontales ir tūrius.
keywords: taškų debesis, las, laz, dronas, fotogrametrija, recap, lidaras, skenavimas, žemė, klasifikavimas, triukšmas, krūva, tūris, kasimas ir pylimas, horizontalės, lūžio linija, eye-dome, ortomozaika, ortho, uždengti, žemėlapio sluoksnis, eksportuoti las, eksportuoti laz, suspausti
from: e4a4901f
---

Daugeliui to nereikia, todėl tai yra priedas. Įjunkite {{ui:Taškų debesys}} skiltyje Parametrai › Priedai; dešiniajame skydelyje atsiranda skirtukas {{ui:Taškų debesys}}. Failas nuskaitomas jūsų naršyklėje ir suskaidomas į plyteles, kurios saugomos naršyklės saugykloje (arba jūsų pasirinktame aplanke). **Niekas neįkeliama.**

:::warning
Viskas, ką rodo šis skirtukas, yra skaičius iš jūsų duomenų, o ne sertifikatas. Jis išbandytas su išgalvota vietove, dar ne su tikru dronu atlikta nuotrauka: pirmuosius rezultatus vertinkite atsargiai ir praneškite, ką radote. Registruotas specialistas nusprendžia, kiek verti yra žemė, horizontalės ir tūriai.
:::

## Debesies atidarymas

Skiltyje {{ui:Atidaryti debesį}} pasirinkite LAS arba LAZ failą. Skirtuke nurodoma, kiek taškų jame yra, jo koordinačių sistema ir vienetai, bei kiek vietos reikia sukūrimui; paspauskite {{ui:Sukurti debesį}}. Sukūrimą galima sustabdyti ir tęsti su {{ui:Tęsti}} (vėl pasirinkite tą patį failą). Failas niekada nekeičiamas. 100 milijonų taškų failas darbo stotyje sukuriamas per kelias minutes ir užima maždaug tiek vietos, kiek pats failas.

Skiltyje {{ui:Debesys šiame kompiuteryje}} atidarote arba pašalinate debesį. {{ui:Laikyti debesis aplanke…}} (Chrome, Edge ir Studio programa) plyteles laiko jūsų pasirinktame aplanke, pavyzdžiui, CadCraft debesų aplanke Dokumentuose, todėl 10 GB debesis netelpa į naršyklės saugyklą; anksčiau sukurti debesys lieka ten, kur buvo sukurti. Po paleidimo iš naujo naršyklė vėl prašo leidimo: paspauskite {{ui:Vėl naudoti aplanką …}}.

## Žiūrėjimas į debesį

{{ui:Žiūrėti 3D}} piešia debesį iš stambių plytelių ir tikslina, kai priartėjate, bet vienu metu niekada daugiau nei {{ui:Daugiausia piešiamų taškų}} (2,5 milijono; telefone – 500 tūkstančių). Spalvinkite pagal failo pačių spalvą, aukštį, klasę, intensyvumą ar {{ui:Liekamoji paklaida}}. {{ui:Eye-dome apšvietimas}} nuspalvina kraštus pagal gylį, todėl forma atpažįstama be normalių (telefone išjungta); {{ui:Taškai mažėja su atstumu}} padaro tolimus taškus mažesnius, o artimus – didesnius; {{ui:Taško dydis}} nustato dydį. Plane debesis rodomas kaip rastras po jūsų brėžiniu ir **tikslinamas, kai priartinate** prie jo dalies.

## Valymas

Skiltyje {{ui:Valyti}} plane braižykite lasą, stačiakampį ar daugiakampį (arba 3D rodinyje iš viršaus: 3D rodinyje kontūras paimamas tiesiai žemyn, todėl jis tikslus tik iš viršaus). Skirtukas prieš taikant parodo, kiek taškų yra viduje: {{ui:Naikinti šiuos taškus}}, {{ui:Keisti jų klasę}}, {{ui:Atkurti panaikintus taškus}} arba {{ui:Apkarpyti pagal šią ribą}}. {{ui:Anuliuoti}} ir {{ui:Perdaryti}} naršo pakeitimų žurnalą; pats failas niekada nekeičiamas. {{ui:Triukšmo filtras…}} pažymi atsitiktinius taškus kaip žemus taškus (klasė 7) arba kaip didelį triukšmą (klasė 18).

## Rūšiavimas

{{ui:Rasti žemę}} dirba plytelė po plytelės ir pažymi žemę (klasė 2) bei žemus taškus; nuokrypis yra 0,15 m arba 0,08 m, jei įjungtas geodezinės klasės jungiklis. Pranešama apie plytelių sandūras, kurios nesutampa. Tada {{ui:Klasifikuoti augmeniją ir pastatus}} pažymi žemą, vidutinę ir aukštą augmeniją bei pastatus pagal aukštį virš žemės ir tai, kiek lygi aplinka. Mašininio mokymosi nėra, todėl plokščiu stogu pastogė po medžiais gali būti klasifikuota neteisingai: patikrinkite.

## Žemė, horizontalės, lūžio linijos

{{ui:Sukurti žemę}} sukuria esamą žemę iš žemės taškų ir prideda ją prie projekto taip pat, kaip atliekant LAS importą (vienas anuliavimo žingsnis). Tada taškai lyginami su ja: vidurkis, RMS, 95 procentilis, dalis nuokrypio ribose ir dešimt labiausiai besiskiriančių vietų, kiekviena su {{ui:Eiti ten}}. Spalvinimas pagal {{ui:Liekamoji paklaida}} rodo, kur žemė ir debesis nesutampa.

**Lūžio linija** (bordiūras, griovys ar šlaito viršus) pasirenkama ant debesies: {{ui:Pasirinkti lūžio liniją debesyje}} 3D rodinyje kiekvienu paspaudimu paima artimiausią nupieštą tašką, o {{ui:Pasirinkti lūžio liniją plane}} kiekvienu paspaudimu paima artimiausią debesies tašką (pirmiausia žemę) po paspaudimu; linija baigiama dukart spustelėjus arba paspaudus Enter. Kitas {{ui:Sukurti žemę}} ją naudoja. {{ui:Rodyti horizontales}} nubraižo horizontales virš debesies mažame paveikslėlyje ir nustato projekto intervalą.

## Tūriai

{{ui:Krūvos tūris…}} apskaičiuoja paviršiaus virš pagrindo tūrį ribos viduje, kurią braižote. Ribą braižykite ant lygios žemės aplink krūvą ir pasirinkite pagrindą: žemiausią ribos tašką, plokštumą, lygų įlinkusį pagrindą, per ribą einantį paviršių arba įvestą lygį. Ant nuožulnios ar įlinkusios žemės naudokite plokštumą arba įlinkusį pagrindą; žemiausias taškas parodys per aukštą reikšmę. Ribos taškai, kurie stovi aukščiau kitų (medis ant linijos), į pagrindą neįtraukiami. {{ui:Skrydis į skrydį}} pateikia iškasimą ir įpylimą tarp dviejų debesų. Abu galima įrašyti kaip CSV.

## Ortomozaika

Skiltyje {{ui:Ortomozaika (vaizdas iš viršaus)}} pasirinkite dronų ortomozaiką kartu su jos world failu ir `.prj`, jei jie yra: GeoTIFF arba PNG ar JPEG. Ji tampa **žemėlapio sluoksniu** projekte, todėl plane rodoma po jūsų brėžiniu, o 3D rodinys (spalva {{ui:Žemėlapis}}) ją uždeda ant jūsų sukurtos žemės, todėl pirmiausia atlikite {{ui:Sukurti žemę}}. Skirtuke nurodoma, kiek debesies apima vaizdas, ir įspėjama, jei jo neapima nė dalies: dažniausia priežastis – kita koordinačių sistema, todėl kartu pateikite `.prj` failą. Jei `.prj` nėra, programa klausia, kokios yra koordinatės. Vaizdas saugomas projekto faile; GeoTIFF, didesnis nei 200 MB, atmetamas, o labai didelė mozaika sumažinama iki 16 megapikselių, todėl dideliam matavimui pirmiausia iškirpkite mozaiką pagal vietovę.

## Eksportas

{{ui:Eksportuoti}} įrašo išvalytą, suklasifikuotą debesį kaip naują failą (visi taškai, išvalytos klasės arba tik žemė). Skiltyje {{ui:Failo tipas}} pasirinkite:

- **LAS 1.4 (nesuspaustas)**: taškų formatas 6 arba 7 su spalva.
- **LAZ (suspaustas)**: tie patys taškai suspausti be praradimų, todėl kiekvienas taškas atkuriamas tiksliai. Jis įrašomas kaip taškų formatas 0 arba 2 su spalva LAS 1.4 faile. Išgalvotoje 300 m vietovėje LAZ buvo maždaug penktadalis LAS 1.4 failo dydžio. LAZ formatai 0 ir 2 talpina tik klases nuo 0 iki 31: taškas su didesne klase atmetamas su pranešimu, todėl tokį debesį eksportuokite kaip LAS 1.4.

LAZ įrašo CadCraft savo suspaudimo įrankis, sukurtas pagal paskelbtą LAZ specifikaciją. Patikrinome, kad mūsų pačių skaitytuvas ir du nepriklausomi LAZ skaitytuvai (laz-perf, kurį programa naudoja LAZ failams atverti, ir laspy su lazrs) kiekvieną tašką perskaito tiksliai, o laspy sukurti LAZ failai, kai jų taškai įrašomi iš naujo, išeina baitas po baito tokie patys. Kitos programos dar nebandytos, todėl jei kuri nors neatveria failo, praneškite, kuri.

Jei naršyklė gali įrašyti failą jo kūrimo metu, pirmiausia pasirenkate failą, o labai didelis debesis į jį rašomas plytelė po plytelės, o ne kaupiamas atmintyje; kitu atveju failas surenkamas ir atsisiunčiamas, o tai tinka iki kelių šimtų megabaitų.

## Ko ji nedaro

Ji skaito tik LAS ir LAZ (E57, PLY ir PCD dar nejungti į šį skirtuką, o kelių to paties skrydžio failų ji nesujungia), debesies neperprojektuoja (laikoma, kad naudojama projekto sistema ir metrai), neskaito Autodesk RCP ar RCS failų, paviršiaus iš nuotraukų nekuria ir pati neranda stulpų, bordiūrų ar vamzdžių.
