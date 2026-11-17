---
title: Perėjimas iš kitos inžinerinės programos
summary: Kaip įprasti inžinerinio projektavimo darbo srautai atitinka CivilCraft ir skirtumai, kurie pirmąją valandą klaidina patyrusius vartotojus.
keywords: perjungimas, migracija, įprasta, skirtumai, darbo eiga, komandos, atitikmenys, cogo, koridorius, formavimas, vamzdynų tinklas, stiliai, komandinė eilutė
from: feae37d6
---

Jei naudojote Civil 3D, jau žinote CivilCraft idėjas: taškus ir taškų grupes, TIN paviršius su lūžio linijomis ir ribomis, trasas pagal PI, profilius pagal PVI, surinkimus, išvedamus į koridorius, formavimą iki atviro grunto, gravitacinius vamzdynų tinklus, LandXML. Skiriasi beveik viskas aplink jas: nėra brėžinio failo, nėra komandinės eilutės (nebent pasirinkote {{ui:Klasikinis braižymas}} meniu stilių), nėra stilių, nėra Prospector ir nėra parametrų dialogų. CivilCraft yra nedidelis, specializuotas įrankis naršyklėje, ir šioje versijoje atlieka tik dalį to, ką daro pilnas inžinerinis paketas. Šiame puslapyje surašoma, ką žinote ir kas čia yra.

:::tip
Jei patinka Civil 3D juosta, pasirinkite meniu stilių {{ui:Civilinių darbų juosta}} skyriuje {{ui:Parametrai}} › {{ui:CivilCraft}} › {{ui:Meniu, klavišai ir pelė}}: skirtukai Pagrindinis, Paviršiai, Keitimas, Geolokacija, Vaizdas ir Išvestis, vidurinis mygtukas slenka vaizdą, o {{key:Shift}} su vidurinio mygtuko pagalba sukasi aplink 3D vaizdą. Jei rašote komandas, {{ui:Klasikinis braižymas}} prideda komandinę eilutę (ALIGNMENT, PAD, PROFILE, ZOOM …). Žr. [Meniu, klavišai ir pelė](topic:menus-keys-and-mouse).
:::

## Atitikimų lentelė

| Ką norite padaryti | Įprastas būdas | CivilCraft |
|---|---|---|
| Įkelti geodezinės nuotraukos taškus | Importuoti taškus taškų failo formatu | {{ui:Atidaryti}}, tada patikrinkite stulpelių tvarką **Importuoti taškus** ([Importuokite geodezinės nuotraukos taškus](topic:import-points)) |
| Rūšiuoti taškus | Taškų grupės, aprašymo raktai | Automatinės grupės pagal pirmąjį aprašymo žodį; aprašymo raktų nėra |
| Redaguoti tašką | Taško redaktorius, valdikliai | Spustelėkite jį ir įveskite **Ypatybėse**, arba vilkite ([Redaguokite geodezinės nuotraukos tašką](topic:edit-points)) |
| Sudaryti esamą gruntą | Sukurti paviršių, pridėti taškų grupes kaip duomenis | Automatiškai: paviršius perskaičiuojamas, kai pasikeičia jo įvestys |
| Pridėti lūžio linijas | Pridėti lūžio linijas iš polilinijų arba objektų linijų | Nustatykite taškų grupę į {{ui:Lūžio linija}} arba spustelėkite taškus įrankiu {{ui:Lūžio linija}} ({{key:B}}) |
| Apkirpti paviršių | Išorinė riba, paslėpta riba, didžiausias trikampio ilgis | {{ui:Riba}} ({{key:O}}, tik išorinė) ir **Ilgiausia išorinė kraštinė** |
| Rodyti horizontales | Paviršiaus stilius | **Rodymas** kairiajame skydelyje: intervalas, pagrindinė kas, žymos, juostos, nuolydžio rodyklės |
| Išdėstyti ašinę liniją | Trasų kūrimo įrankiai, lankų ir spiralių nustatymai | {{ui:Trasa}} ({{key:A}}): spustelėkite PI, {{key:Enter}}; spindulius ir spiralių ilgius nustatykite PI lentelėje |
| Sukurti profilio vaizdą | Profilio vaizdo vedlys, juostos | {{ui:Profilis}} ({{key:R}}): vienas profilio vaizdas po planu, visada pritaikytas |
| Projektuoti nuolydį | Profilio išdėstymo įrankiai | {{ui:Pradėti nuo grunto}}, {{ui:Pridėti PVI}} ({{key:I}}), vilkti PVI, įvesti **Lanko L** |
| Sudaryti kelią | Surinkimas, posurinkimai, koridorius, tikslai, regionai | Pažymėkite **Išvesti surinkimą palei projektinį profilį** po trasa; kiekvienoje pusėje – juosta, pakraštys ir šoninis šlaitas, arba kiekviena pusė sudaryta iš dalių (griovelis, bordiūras, šaligatvis …) |
| Formuoti aikštelę | Objektų linijos, grunto formavimo grupės, formavimo kriterijai | {{ui:Aikštelė}} ({{key:G}}): plokščia aikštelė su iškasų ir pylimų nuolydžiais iki atviro grunto |
| Skaičiuoti žemės darbus | Tūrių paviršiai, tūrių suvestinė | **Žemės darbai** dešiniajame skydelyje, tinklelio metodas, atnaujinama gyvai |
| Išdėstyti lietaus ar nuotekų tinklą | Vamzdynų tinklas su detalių sąrašu, taisyklės | {{ui:Vamzdžiai}} ({{key:P}}): spustelėkite konstrukcijas pasroviui; trys jūsų nustatytos taisyklės; automatiniai dugno aukščiai |
| Keistis su kitais | LandXML importas ir eksportas | {{ui:Atidaryti}} LandXML failą; {{ui:LandXML}}, kad eksportuotumėte ([Keitimasis LandXML](topic:landxml)) |
| Siųsti linijas į CAD | Eksportas į DWG | {{ui:DWG}} (2000 iki 2018 formatas) arba {{ui:DXF}} (R12) |
| Spausdinti | Maketai, vaizdo langai, lapų rinkiniai | {{ui:PDF}}: vienas horizontalus planas pasirinktu mastelio lapu; plano ir profilio lapai bei pjūvių lapai kaip PDF |
| Bendrinti darbą tarp failų | Duomenų nuorodos, išorinės nuorodos | Nepasiekiama: vienas projektas viename faile |
| Anuliuoti | Anuliuoti | {{key:Mod+Z}} ir {{key:Mod+Y}}, 200 žingsnių; rodymo nustatymai nėra atšaukimo žingsniai |

## Skirtumai, kurie klaidina žmones

**Komandinės eilutės nėra**, nebent pasirinkote meniu stilių {{ui:Klasikinis braižymas}}. Įrankiai yra įrankių juostos mygtukai ir vienos raidės: {{key:A}} trasa, {{key:G}} aikštelė, {{key:P}} vamzdžiai, {{key:B}} lūžio linija, {{key:O}} riba, {{key:R}} profilis, {{key:I}} pridėti PVI, {{key:V}} pasirinkti, {{key:F}} pritaikyti vaizdą. Kituose meniu stiliuose komandos pavadinimo įrašymas nieko nedaro. Žr. [Klavišai ir pelė](topic:keyboard).

**Enter baigia; dukart spustelėjimas rizikingas.** Paskutinį tašką spustelėkite vieną kartą, tada paspauskite {{key:Enter}}. Šioje versijoje dukart spustelėjimas taip pat baigia, bet pašalina dukart spustelėtą tašką. Dešinysis mygtukas nei baigia, nei kartoja; jis tik slenka, kai vilkate su juo.

**Viskas nuolat dinamiška.** Pakeiskite taškų grupę, spindulį, PVI ar aikštelės nuolydį, ir paviršius, horizontalės, koridorius, atviro grunto linijos ir tūriai atsinaujina iš karto. Nieko neperstatoma ir nieko nepasensta.

**Niekas nėra brėžinio objektas.** Planas yra projekto vaizdas, o ne brėžinys, kurį galima redaguoti CAD komandomis. Negalite pridėti savo linijų ar teksto, pakeisti sluoksnio spalvos ar suskaidyti objektų. Eksportuokite į DXF ir baikite brėžinį CAD programoje.

**Stilių nėra.** Spalvos, linijų storiai, žymų dydžiai ir sluoksnių pavadinimai yra fiksuoti (žr. [Plano sluoksniai](topic:plan-layers)). Programos juostoje **Popierius** ir **Modelis** perjungia šviesų ir tamsų ekraną.

**Po vieną.** Vienas esamo grunto paviršius, vienas suformuotas rezultatas, vienas vamzdynų tinklas projekte. Daug trasų ir aikštelių – gerai.

**Vienetai – tik žymos.** Pasirinkus {{ui:JAV pėdos}} arba {{ui:Metrai}}, nieko neperskaičiuojama. Brėžinio mastelio nėra. Koordinačių sistema yra neprivaloma: nustatykite ją skiltyje {{ui:Koordinatės}} ir nieko nepajuda, tik nurodoma, ką reiškia skaičiai (žr. [Nustatykite projekto koordinačių sistemą](topic:coordinate-systems)). Pėdos rašomos į LandXML kaip JAV geodezinės pėdos.

**Lūžio linijų grupės jungiamos pagal taško numerio tvarką.** Grupė, nustatyta į {{ui:Lūžio linija}}, tampa viena linija per visus jos taškus pagal numerius. Bendri kodai (dvi tėkmės linijos, abi pažymėtos „FL“) sudaro vieną zigzagą; tokias braižykite ranka.

**Pikietai atrodo vienodai, metrai skiriasi.** Pėdose naudojami 100 ft pikietai (12+34.56); metruose – 1000 m pikietai (1+234.567).

**Naikinimas Mac kompiuteryje.** Klavišas, pažymėtas delete Mac kompiuteryje, naršyklei yra Backspace. Pasirinkimui pašalinti naudokite Fn ir delete arba mygtuką {{ui:Naikinti}}.

**Failai yra atsisiuntimai.** {{ui:Įrašyti}} kiekvieną kartą atsisiunčia `.civilcraft.json` failą; nėra „įrašyti virš atidaryto failo“. Neįrašyto darbo atkūrimo kopija laikoma šioje naršyklėje ([Atkurkite neįrašytą darbą](common:recover)). Atidarant taškų failą, taškai pakeičiami nieko neklausiant. Žr. [Failai, kuriuos galite atidaryti, įrašyti ir eksportuoti](topic:files).

**Taisyklės jūsų.** Vamzdynų tinklo taisyklės ir koridoriaus surinkimas prasideda pradinėmis (laikinomis) reikšmėmis, kurios nėra standartas. Prieš pasitikėdami bet kuriuo patikrinimu, nustatykite savo.

**Tūriai skaičiuojami pagal tinklelį.** Iškasos ir pylimai gaunami iš smulkaus tinklelio tarp dviejų paviršių, atviro grunto linijų viduje, be išsipūtimo ar susitraukimo. Jie artimi, bet nėra tokie patys kaip TIN–TIN tūris.

## Kas dar nepadaryta

Spiralės, kitos nei klotoidinė, surinkimai, kurie keičiasi palei kelią, nuolydžio aikštelės, įtakos (inlet) talpa ir sulaikymas, detalių katalogai, vamzdžiai profilyje, sklypų išdėstymas ir sklypų dydžiai, mažiausių kvadratų išlyginimas ir geodezinės nuotraukos duomenų bazės, DWG atidarymas ir daugiau. Pilnas sąrašas su tuo, ką šiandien daryti vietoj, yra [Dar nepadaryta](topic:not-built-yet).
