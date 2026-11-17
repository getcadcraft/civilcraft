---
title: Charakteristinės linijos
summary: Braižykite 3D linijas, kurias formuojate viršūnė po viršūnės, darykite jų laiptuotus poslinkius ir naudokite jas kaip esamo paviršiaus lūžio linijas arba kaip nuolydžio aikštelių kraštus projekte.
keywords: lankas, kreivė, spindulys, 3D lankas, spiralė, kreivas bordiūras, nuolydžio perdanga, kotų perdanga, nuolydžio rodyklės, charakteristinė linija, nuolydis, kota, laiptuotas poslinkis, poslinkis, lūžio linija, bordiūras, griovys, pylimas, nuolydžio aikštelė, dienos šviesa, vertikalusis planavimas, 3D polilinija
from: d55b25fb
---

Charakteristinė linija – tai linija su kota kiekvienoje viršūnėje: bordiūras, griovio tėkmės linija, pylimo viršus, nuolydžio aikštelės kraštas. Nustatote jos kotas skaičiais ar nuolydžiais, kopijuojate ją į šoną su žingsniu aukštyn ar žemyn ir pasirenkate, ką paviršiai su ja daro.

## Nubrėžti vieną

1. Pasirinkite **Paviršius** › {{ui:More}} › {{ui:Feature line}}, arba paspauskite {{key:L}}.
2. Spustelėkite jos viršūnes plane. Spustelėjimas ant geodezinio taško perima to taško vietą ir kotą; kitur viršūnė perima esamo paviršiaus kotą toje vietoje.
3. Paspauskite {{key:Enter}}, kad užbaigtumėte atvirą liniją, arba dar kartą spustelėkite pirmą viršūnę, kad ją uždarytumėte.

Nauja linija pasirenkama ir pradeda kaip esamo paviršiaus lūžio linija, gulinti ant žemės.

## Lankai

Atkarpa plane gali būti lankas, kurio galai yra skirtingose kotose: bordiūro lankas, lenktas griovys, rampa, kuri pasisuka. Jos nuolydis tolygiai eina per lanką, o ilgis matuojamas išilgai kreivės.

- **Braižant:** paspauskite {{key:C}} (jutiklinis ekranas – {{ui:Arc}} juostoje virš plano), kad įjungtumėte lankus. Po viršūnės spustelėkite tašką ant kreivės, tada spustelėkite, kur lankas baigiasi. Dar kartą paspauskite {{key:C}} tiesioms atkarpoms. {{key:Backspace}} pirmiausia pašalina tašką ant kreivės.
- **Vėliau:** **Ypatybėse** įveskite spindulį ir pasukimo kryptį viršūnės laukelyje **Lankas**, pavyzdžiui `50 L` arba `50 R` (kairėn ar dešinėn, einant linija), ir paspauskite {{key:Enter}}. Ištuštinkite laukelį, kad atkarpa vėl taptų tiesi. Spindulys, mažesnis nei pusė atkarpos, atmetamas.

Pasirinkta linija parodo kiekvieno lanko spindulį šalia jo nuolydžio. **Ilgis** – išilgai lankų plane; **3D ilgis** skaičiuoja ir pakilimą bei nuokritį. Laiptuoti poslinkiai išlaiko lankus: lankas lenkimo išorėje auga, vidinėje – mažėja, o poslinkis, kuris peržengia lanko centrą, atmetamas.

Paviršiai, 3D vaizdas, DXF ir DWG kiekvieną lanką priima kaip trumpas tiesias dalis, kurios lieka ne toliau kaip 0,01 nuo kreivės. LandXML išlaiko juos kaip lankus (žr. **Lankai kituose failuose** žemiau).

## Nustatyti kotas ir nuolydžius

**Ypatybėse** išvardytos viršūnės su atstumu išilgai linijos, jų **Kota** ir **Nuolydis iki kito** (procentais). Įveskite bet kurį ir paspauskite {{key:Enter}}:

- Kota perkelia tik tą viršūnę.
- Nuolydis nustato kotą atkarpos toliau esančiame gale; po jo esančios viršūnės lieka vietoje, todėl kitos atkarpos nuolydis pasikeičia.

Taip pat **Ypatybėse**:

| Veiksmas | Ką daro |
|---|---|
| **Pakelti ar nuleisti visas per** | Prideda įvestą aukštį prie kiekvienos viršūnės. |
| {{ui:Elevations from the ground}} | Kiekvieną viršūnę grąžina ant esamo paviršiaus (viršūnės, nesančios paviršiuje, palieka savo kotas ir yra išvardytos). |
| {{ui:One grade, first to last}} | Palieka pirmą ir paskutinę kotas, o tarpines viršūnes išdėsto vienodu nuolydžiu. |

Pasirinkta linija plane rodo savo kotas viršūnėse ir nuolydžius išilgai atkarpų. Vilkite viršūnę su {{ui:Select}}, kad ją perkeltumėte; jos kota lieka.

## Laiptuoti poslinkiai

Skiltyje **Laiptuotas poslinkis** įveskite **Atstumą** (teigiamas – dešinėn nuo linijos krypties, neigiamas – kairėn), tada aukštį (aukštyn ar žemyn per) arba nuolydį procentais, ir spustelėkite {{ui:Make the offset line}}. Kopija yra nauja charakteristinė linija: pavyzdžiui, bordiūro nugarėlė 0,5 ft į šoną ir 0,5 ft aukščiau arba griovio kraštas 6 ft į išorę 2 % nuolydžiu. Atstumas, dėl kurio kopija persidengtų per siaurą posūkį, atmetamas.

## Nuolydžiai ir kotos ekrane

Paspauskite {{key:E}} arba pažymėkite **Nuolydžiai ir kotos charakteristinėse linijose** skiltyje Rodymas, kad pamatytumėte kiekvienos charakteristinės linijos nuolydį išilgai atkarpos (su maža rodykle, nukreipta žemyn) ir jos kotas viršūnėse. Jie rodomi tik ekrane: į brėžinį nieko nepridedama, o PDF, DXF ir DWG lieka tokie patys. Trumpos atkarpos ir susispaudusios viršūnės lieka be žymų, kol nepriartinate. Pasirinkta linija visada rodo savo nuolydžius ir kotas.

## Profilio vaize

Charakteristinė linija, kertanti trasą, rodoma tos trasos profilio vaize su savo pavadinimu ir kota kirtimosi vietoje; greta jos einančias linijas galima rodyti taip pat. Žr. [Projektuoti vertikalų profilį](topic:profile).

## Ką su ja daro paviršiai

Pasirinkite **Naudoti**:

| Naudojimas | Kas vyksta |
|---|---|
| Esamo paviršiaus lūžio linija | Esamas paviršius eina per liniją jos kotose, kaip nubrėžta lūžio linija. |
| Suformuota projekte | **Uždara** linija tampa nuolydžio aikštele: projektuojamas paviršius joje formuojamas iki jos krašto. Įjunkite **Dienos šviesa iki žemės**, kad nuo jos krašto iki žemės eitų iškasų ir pylimų šlaitai (horizontaliai iki vertikaliai 1:1), kaip ir aikštelės atveju; kiekvienas šlaitas prasideda nuo paties krašto kotos. |
| Tik nubrėžta | Ji lieka plane ir patenka į DXF, DWG ir PDF (sluoksnis C-GRAD-FEAT, 3D polilinijos), bet paviršiai ją ignoruoja. |

Tūriai, pjūviai ir 3D vaizdas apima charakteristines linijas, suformuotas projekte, kaip aikšteles. Kiekvienas pakeitimas – vienas žingsnis: {{key:Mod+Z}} jį anuliuoja.

## Linijų dalijimasis su komanda

Brėžinyje, atidarytame iš jūsų debesies failų CadCraft Studio programoje, komandos prenumeratoje, projekto Ypatybėse (kai nieko nepasirinkta) yra skyrius **Komanda** su {{ui:Team lines…}}: jūsų komandos bendrinamos linijos, kiekviena su revizija, be charakteristinės linijos pasirinkimo. Pasirinkite liniją, kad ją bendrintumėte, paskelbtumėte naują reviziją, atsisiųstumėte komandos versiją ar nustotumėte bendrinti. Be šio nustatymo skyriuje nurodoma, ko jam reikia.

## Lankai kituose failuose

| Failas | Kas nutinka charakteristinei linijai su lankais |
|---|---|
| CivilCraft projektas | Išlaikoma tiksliai. |
| LandXML | Įrašoma kaip plano charakteristinė linija su tiesėmis ir lankais bei jų kotomis, ir skaitoma atgal su lankais. Charakteristinė linija iš kitos programos patenka kaip **Tik nubrėžta**: pasirinkite jos **Naudoti**, kad įdėtumėte ją į paviršių. |
| DWG ir DXF | 3D polilinija negali talpinti lanko, todėl linija įrašoma kaip trumpos dalys, ne toliau kaip 0,01 nuo kiekvieno lanko. CivilCraft brėžinyje taip pat pažymi, kurios dalys buvo lankai: atidarius brėžinį kaip linijas, {{ui:Feature lines}} grąžina linijas kaip charakteristines linijas su jų lankais. Kitos programos mato įprastą 3D polilinija. |
