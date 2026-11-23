---
title: Kas naujo 0.9 (ankstesnė versija)
summary: Koridoriaus ir reljefo šablonai, prisitraukimai ir pasirinkimo mygtukai braižant, GIS analizė su atributų lentele, šešėlio, saulės energijos derliaus, komforto ir vėjo tyrimai vietovei, 3D atvaizdavimo rodinys bei taškų debesų ir WaterCraft priedai.
keywords: kas naujo 0.9, ankstesnė versija, kas naujo, 0.9, išleidimo pastabos, koridoriaus šablonai, reljefo šablonai, šablonų redaktorius, tipinis skyrius, keli koridoriai, prisitraukimas, prisitraukimai, pasirinkti, perkelti, kopijuoti, sukti, liestinė, atvaizdavimas, 3d atvaizdavimas, gis analizė, buferis, perdengimas, erdvinis sujungimas, atributų lentelė, stilius pagal atributą, šešėlio tyrimas, saulės energijos derlius, utci, lauko komfortas, vėjo tyrimas, openfoam, taškų debesys, las, laz, watercraft, gaisrinis debitas, hidrantas, vandens amžius, chloras, paklausos, patarimai, išdėstymas, pakeitimai, 0.8, 0.8.1, versija, naujos funkcijos, lietus, gruntų darbai, balansas, pylimas ir iškasa, vežimas, geriausias maršrutas, mažiausia kaina, trasa, sulaikymo tvenkinys, išleidimo anga, nuleidimas, laisvasis bortas, eiga, apklausa, dronas, krūva, adresas į vietovę, sklypas, dirvožemis, potvynis, nuolydžio stabilumas, bishop, nusėdimas, sankryža, ženklinimas, ženklai, matomumo atstumas, koregavimas, mažiausių kvadratų, traversa, atviras karjeras, blokinis modelis, radijo ryšys, fresnelio zona, išvažiavimas, kalbos, problemos, gyvai, dwg
from: 4664522c
---

Tai, kas pasikeitė CivilCraft 0.9 versijoje, palyginti su 0.8.1. CivilCraft 0.9 yra CadCraft Studio 0.9 ir jos aštuonių programų dalis. Pagrindinės dalys: koridoriaus ir reljefo šablonai, prisitraukimas braižant, GIS analizė, vietovės saulės, saulės energijos derliaus, komforto ir vėjo tyrimai bei du priedai: Taškų debesys ir WaterCraft.

## Naujovės

### Koridoriaus ir reljefo šablonai

- **Koridoriaus šablonai.** Atidarykite {{ui:Paviršius}} › {{ui:Daugiau}} › {{ui:Koridoriaus šablonai…}} (arba įveskite {{cmd:TEMPLATES}}). Šablonas yra mažas skersinis pjūvis su komponentais, poslinkiais, nuolydžiais, medžiagomis ir taškų kodais. Laikykite juos projekte, {{ui:Mano biblioteka}} arba kaip `.cctemplates.json` failą. Šablonų redaktorius rodo tikro mastelio brėžinį ir rašant išvardija problemas.
- **Statyba pagal šablonus pagal stacionažą.** Pasirinkite trasą ir jos Ypatybėse įjunkite {{ui:Statyti pagal šablonus pagal stotį}}. Kiekviena regiono pusė turi savo dangos sąrašą ir savo galo sąlygą. Skiltyje {{ui:Koridoriai šioje trasoje}} {{ui:Pridėti koridorių}} įdeda kelis koridorius į vieną trasą.
- **Reljefo šablonai.** {{ui:Paviršius}} › {{ui:Daugiau}} › {{ui:Reljefo šablonai…}} (arba įveskite {{cmd:TERRAINTEMPLATES}}) uždeda sluoksniuotas medžiagas, pavyzdžiui, dirvožemį ar dangą ir pagrindą, ant reljefo, su plotu ir tūriu kiekvienam sluoksniui. Žr. [Koridoriaus šablonai ir reljefo šablonai](topic:corridor-templates).

### Braižymas

- **Prisitraukimai.** Trasos, aikštelės, sklypo, masės, charakteristinės linijos, matavimo, ribos ir baseino įrankiai prisitraukia prie matavimo taškų, PI, kampų, viršūnių ir konstrukcijų, šalia žymeklio rodoma žymė. Laisvam taškui laikykite {{key:Alt}}.
- **Pasirinkimo mygtukai, liestinė ir perkelti, kopijuoti, sukti.** Aikštelių, sklypų ir charakteristinių linijų kampai turi įvedamus Rytų (E) ir Šiaurės (N) laukus bei kryžminį mygtuką Pasirinkti. Ypatybėse taip pat yra {{ui:Liestinė pagal du taškus}} trasoms ir {{ui:Perkelti, kopijuoti ir sukti}} trasoms, aikštelėms, sklypams ir charakteristinėms linijoms. Žr. [Braižykite su prisitraukimais, pasirinktais kampais ir perkeliant, kopijuojant, sukant](topic:draft-with-snaps).
- **Atvaizdavimo rodinys 3D.** Mygtukas {{ui:Atvaizdavimas}} 3D juostoje piešia žemę natūraliomis spalvomis, dangumu, rūku ir minkštais šešėliais. Modelio jis nekeičia. Meniu {{ui:Saulė}} dabar turi mygtukus {{ui:Taikyti}} ir {{ui:Uždaryti}}. Žr. [Žiūrėti vietovę 3D](topic:site-3d).
- **Skydeliai atsidaro po vieną skiltį.** Kairysis skydelis ir Ypatybių skydelis atveria vieną skiltį ir uždaro kitas, o Kraštovaizdžio juostos plytelės, turinčios kelis įrankius, yra padalyti mygtukai.

### GIS analizė

- **Analizė.** {{ui:Paviršius}} › {{ui:Daugiau}} › {{ui:Analizė}} siūlo buferį, perdengimą, erdvinį sujungimą, pasirinkimą pagal atributą ar formą ir matavimą. Kiekvienas įrankis sukuria naują sluoksnį per vieną anuliavimo žingsnį.
- **Atributų lentelė.** Sluoksnio trijų taškų meniu turi {{ui:Atributų lentelė…}} ir {{ui:Stilius pagal atributą…}}. Žr. [GIS sluoksnių analizė](topic:gis-analysis) ir [Dirbkite su sluoksnio atributų lentele](topic:gis-table).

### Vietovė: saulė, saulės energija, komfortas ir vėjas

- **Aplinkos skiltis.** Pasirinkite masę: {{ui:Aplinka}} skiltis yra po {{ui:Saulės valandos}} jos Ypatybėse. Joje yra šešėlio tyrimas (žemėlapis, lentelė, animacija, CSV), saulės energijos derlius pagal tipinių metų orų failą (.epw) ir lauko komfortas (UTCI).
- **Vėjas, tik patikra.** {{ui:Paleisti vėjo tyrimą}} nuspalvina žemę nuo tinkamos sėdėti iki nepatogios kiekvienai vėjo krypčiai orų faile. Jis nepatvirtintas, ir skydelyje tai nurodyta.
- **Pėsčiųjų vėjo (OpenFOAM) priedas.** Išjungtas, kol neįjungsite {{ui:Parametrai}} › {{ui:Priedai}}. OpenFOAM yra programinė įranga, kurią įdiegiate patys. Žr. [Šešėlis, saulės energijos derlius ir lauko komfortas](topic:environment).

### Taškų debesys (priedas)

- Įjunkite {{ui:Taškų debesys}} skiltyje {{ui:Parametrai}} › {{ui:Priedai}}; dešiniajame skydelyje atsiras skirtukas Taškų debesys. Atidarykite LAS ar LAZ failą, išvalykite jį, surūšiuokite į žemę, augmeniją ir pastatus, sukurkite gruntą, kontūrus ir apimtis bei eksportuokite LAS ar LAZ. Žr. [Taškų debesys iš drono ar skenerio](topic:point-clouds).

### WaterCraft (priedas)

- Įjunkite {{ui:WaterCraft (vandens paskirstymas)}} skiltyje {{ui:Parametrai}} › {{ui:Priedai}}; atsiras skirtukas WaterCraft. Jame yra vartotojų paklausa, gaisrinis debitas kiekviename hidrante, kurio magistralės nutraukimas svarbiausias, ir vandens amžius bei chloras; kiekvienas įrašomas kaip CSV. Žr. [WaterCraft: paklausa, gaisrinis debitas, nutraukimai ir vandens amžius](topic:watercraft).

### Dirbame kartu

- Gyvoje sesijoje matote vienas kito žymeklius ir vardus plane. Bibliotekos augalai: {{ui:CivilCraft kraštovaizdis}} pradedamas nuo numatytosios bibliotekos kolekcijos.

## Visose programose

- Užuominos rodomos kaip Bootstrap įrankių patarimai, o pradžios patarimą galima uždaryti.
- Skydelio skirtukų juosta, kuri netelpa, slenka vietoj to, kad būtų nukirsta.
- Naršyklės skirtukų pavadinimai rodo `<dokumentas> - CivilCraft | CadCraft`.
- {{ui:Parametrai}} turi skiltį Išdėstymas, kurioje išdėstymai yra išskleidžiamasis sąrašas su dviejų eilučių pasirinkimais.
- Svorio ir temperatūros vienetai yra {{ui:Parametrai}} › {{ui:Visuotiniai}} › {{ui:Vienetai}}.
- Kalbų sąraše rodomos kalbos, kurioms versija turi failų. Kalbos, išskyrus anglų, yra mašininiai juodraščiai.

## Ištaisyta

- Adreso paieškos ir EnergyPlus patikros priedų nebuvo galima įjungti; dabar galima.
- Žinyne dabar nurodyta, kad taškų debesų priedas išvalytą debesį įrašo kaip LAS 1.4 ar LAZ.
- Spustelėjus pažymėto objekto savo rankenėlę, nebeprasideda rankenėlės tempimas, kuris sustabdydavo laukiantį pasirinkimą.

## Sąžiningi apribojimai

- Koridoriaus šablonų pavyzdžiai yra vietos rezervuotojai, neparemti jokiu standartu; juos turi patikrinti inžinierius. Reljefo šablonai nepridedami jokio paviršiaus ir nebraižomi 3D ar pjūvio rodinyje. Antras koridorius trasoje nėra IFC eksporte. Tarp dviejų šablonų pagal stacionažą nėra susiaurėjimo.
- Taškų debesys išbandyti su išgalvotais failais, o ne tikra dronų apklausa. Skaitomi tik LAS ir LAZ failai.
- GIS analizė išbandyta su išgalvotais sluoksniais.
- Šešėlis, saulė ir komfortas – planavimo įverčiai; vėjas – nepatvirtinta patikra. Nė vienas iš jų nėra projektinė reikšmė.
- WaterCraft – skaičiavimo pagalbinė priemonė, patikrinta išgalvotuose tinkluose. Vandens inžinierius nusprendžia, kiek skaičiai vertingi.
- Kalbos, išskyrus anglų, yra mašininiai juodraščiai.
- Windows diegimo programos nepasirašytos kodu, o macOS diskų vaizdas nėra notarizuotas.

## Anksčiau: 0.8 ir 0.8.1

Tai, kas pasikeitė CivilCraft 0.8 (2026-11-01) ir 0.8.1 (2026-11-02) versijose, palyginti su 0.7. Pagrindinės naujos dalys – įrankiai, kurie tikrina jūsų suvedimą ir vietovę (lietus, gruntų darbai, maršrutai, tvenkiniai, eiga), ir šeši skaičiavimo langai gruntui, keliams, matavimams, kasykloms, ryšiams ir geležinkeliams.

### Naujovės

**Patikrinkite savo suvedimą**

- **Tegul lyja.** {{ui:Leisti lietui…}} ({{ui:Paviršius}} skiltyje) ant suvesto grunto užpila audrą. Stebite, kaip vanduo nuteka nuo aikštelių, kaupiasi žemose vietose ir perpildo per mažus tvenkinius. Eiga animuota ir pateikia apimtis, didžiausią ištekėjimo debitą ir kiekvieno tvenkinio CSV. Numatytasis langelis yra stambus, todėl pirmas įvertinimas greitas; smulkesnis langelis lėtesnis. Perpildantys tvenkiniai rodomi ir Problemų skydelyje.
- **Žemės darbų balansavimas.** {{ui:Žemės darbų balansavimas…}} kelia arba leidžia aikštelę, kol iškasa lygi įpylimui, ir rodo vežimo lentelę tarp jų.
- **Geriausias maršrutas.** {{ui:Geriausias maršrutas…}}: pasirinkite pradžią ir pabaigą, o CivilCraft suranda pigiausią kelią per reljefą, laikantis jūsų nuolydžio ir kreivės ribų, tada iš jo sukuria trasą.
- **Sulaikymo tvenkiniai.** {{ui:Sulaikymo tvenkiniai…}} apskaičiuoja lygį ir talpą pagal jūsų gruntą, priima išleidimo įrenginius (ištakos anga, slenkstis, V formos slenkstis, perpylimo kanalas), nukreipia audrą per tvenkinį ir tikrina sulaikytą pikinį debitą, nuleidimo laiką ir laisvąjį bortą.
- **Eiga pagal apklausas.** {{ui:Eigą pagal matavimus…}} lygina skirtingomis datomis gautus dronų ar skenavimo paviršius su gruntu, koks jis buvo, ir su projektu: užbaigtumas procentais pagal tūrį, perkasti ir perpilti plotai, krūvos ir kada darbai baigsis tokiu tempu (pažymėta kaip įvertis).

**Žinokite vietovę**

- **Adresas į vietovę.** {{ui:Adresas į sklypą…}} sulygina atviruosius sklypo, pastatų, zonavimo, dirvožemio, potvynių ir reljefo duomenis vienoje vietoje. Vietovę galite laikyti projekto faile: įvestą adresą, kiekvieną šaltinį su diena, kada jį parsisiuntėte, ir licenciją, bei gautus rezultatus. Vėl atidarius ar bendrinant projektą vietovė išlieka, be naujo parsisiuntimo. Taip pat galite ją įrašyti kaip vietovės failą arba siųsti į BimCraft. Žr. [Adresas į vietovę](topic:address-to-site).

**Gruntas, keliai, matavimai, kasyklos, ryšiai ir geležinkeliai**

- **Gruntai ir šlaitai.** {{ui:Gruntai ir šlaitai…}} braižo dirvožemio profilį tarp jūsų įvestų gręžinių. Bishop metodas tada ieško kritinio apskritimo jūsų grunte, su gruntinio vandens lygiu, papildoma apkrova ir žemės drebėjimo koeficientu; pamato nusėdimas apima konsolidaciją, momentinį nusėdimą ir laiką.
- **Sankryžos ir ženklinimas.** {{ui:Sankryžos ir ženklinimas…}} sujungia šakas su bordiūrų lankais (vienas spindulys kiekvienai šakai arba trijų centrų lankai), matomumo atstumą projektiniam greičiui, matomumo trikampių patikrą, pėsčiųjų perėjas, sustojimo linijas, žymėjimą ir ženklus su ženklų žiniaraščiu. Jie braižomi plane ir įrašomi kaip .dxf su pavadintais sluoksniais.
- **Matavimų koregavimas.** {{ui:Matavimų koregavimas…}} atlieka traversos ar tinklo mažiausių kvadratų koregavimą: koreguotos koordinatės, paklaidų elipsės, chi kvadrato testas ir žymė matavimui, kuris neatitinka. Įtraukti laisvieji tinklai, traversos uždarymas kompaso taisykle, bei RW5, GSI, JobXML ar CSV lauko failai, o koreguoti taškai įrašomi kaip CSV.
- **Atviros duobės.** {{ui:Atviros duobės…}} paverčia gręžinių mėginius blokiniu modeliu ir galutine duobe jūsų nuolydžio kampo ribose, su nuodengos santykiu, lentele pagal laiptą ir kokybės bei tonažo kreive. Įdėtosios duobės pagal pajamų koeficientą ir gamybos grafikas su diskontuotu pinigų srautu taip pat yra.
- **Radijo ryšiai.** {{ui:Radijo ryšio linijos…}} tikrina matomumą virš jūsų grunto su Žemės išgaubimu, pirmąja Fresnelio zona, ryšio biudžetu, užgesimo rezervu ir daugiakelio sklidimo nutraukimu, ir nurodo stiebo aukštį, kuris išlaisvintų kelią. Taip pat atlieka šviesolaidžio nuostolių biudžetus, maršruto kiekius ir vėjo apkrovą bokštui.
- **Geležinkelio išvažiavimai.** {{ui:Geležinkelio išvažiavimai…}} sudaro išvažiavimą pagal jo kryžmės numerį, perėjimus tarp lygiagrečių bėgių ir konstrukcijos tarpą, pasvirusį dėl pakreipimo ir praplatintą kreivėje. Išvažiavimas gali būti trasos stacionaže.

Žr. [Gruntai, sankryžos, matavimų koregavimas, duobės, radijo ryšiai ir išvažiavimai](topic:soils-roads-survey-mines-links).

### Visose programose

- **Kalbos.** 54 kalbos, iš jų dešimt naujos. Kalbos, išskyrus anglų, yra mašininiai juodraščiai, kol jas perskaito gimtakalbis. Žinyno temos vis dar daugiausia anglų kalba.
- **Įrankių juostos eilutės.** {{ui:Parametrai}} › {{ui:Bendra}} › {{ui:Įrankių juostos eilutės}}: Laužyti (kaip anksčiau), 2 eilutės arba 1 eilutė. CivilCraft juosta rodo dažniausiai naudojamą įrankį didelį, kiti – maži, o likusieji – už grupės pavadinimo rodyklės.
- **Įvesties įrenginiai.** Jutiklinė dalis, rašiklis, 3D pelė, valdiklis ir MIDI gali valdyti programas.
- **Problemos.** Problemų skydelis, kuris perspėja kiekvienoje programoje, su tikrinimais, kurie skaito reglamentų paketus.
- **Gyvai.** Rodinys, kas kur yra gyvoje sesijoje.
- **Priedai.** Priedų sąrašas, su apšvietimo priedais.
- **Prijunkite savo DI.** Bet kuris prijungtas asistentas gali valdyti CivilCraft įrankius. Su juo pateikiama pastaba, kad prijungimas vienu spustelėjimu CadCraft Studio viduje ir talpinamas jungtis dar neparuoštos. Žr. [Leiskite DI asistentui dirbti su jūsų vietove](topic:assistants).

### Ištaisyta 0.8.1

- **DWG klasių skiltis.** Ji buvo nuskaitoma kaip neteisingas tipas (GitHub cadcraft#5). Ištaisyta CivilCraft kartu su CadCraft, BimCraft, ModelCraft ir TakeoffCraft.
- **Kalbos keitimas veikiant.** CadCraft Studio ir supakuotos versijos gali keisti kalbą veikiant programai. Anksčiau jos buvo tik anglų kalba. Dar neišbandyta visose platformose: praneškite, jei kalba nepasikeičia.

### Dar neįtraukta šioje versijoje

- **Tai skaičiavimo pagalbinės priemonės.** Kiekvieną naujų langų rezultatą turi patikrinti inžinierius. Grunto stiprumai pradedami nuo dirvožemio grupės tipinių reikšmių, ir langas tai nurodo.
- **Tegul lyja.** Paleidimas pavyzdinėje vietovėje naršyklėje smulkiame langelyje gali užtrukti daugiau nei dvi minutes. Jis patikrintas rankiniais atvejais ir V formos baseinu, bet dar ne tikroje suvestoje vietovėje.
- **Adresas į vietovę.** Jis skaito jūsų atviruosius duomenų failus ir išbandytas tik su mūsų failais. Medžiai nėra šaltinis. Šaltinių parsisiuntimas laukia privatumo formuluotės.
- **Eiga pagal apklausas.** Išbandyta tik su išgalvotomis apklausomis. Eiga pagal lapus ir žymėjimus (MarkupCraft) bei skenavimas prieš modelį (BimCraft) dar nesukurti.
- **Gruntai ir šlaitai.** Tik apskritiminiai paviršiai: nėra pleišto ar bloko paieškos ir nėra įtempių įtrūkimo.
- **Sankryžos.** Vienas spindulys kiekvienai šakai, nėra sunkvežimių važiavimo kreivių, ir jos dar nepatenka į koridorių.
- **Lauko failai.** Skaitikliai parašyti pagal viešus formatų aprašymus ir išbandyti su mūsų sukurtais failais. Reikalingi tikri prietaisų failai.
- **Ryšiai ir geležinkeliai.** Radijo ryšiai: tik laisvosios erdvės nuostoliai ir daugiakelis sklidimas (nėra lietaus užgesimo ar antenų diagramų), ir nėra geležinkelių standarto: kiekviena geležinkelio riba yra vietos rezervuotojas su juodraščio skaičiais, kurių nė vienas geležinkelių inžinierius nepatikrino.
- **Windows ir macOS.** 0.8 nepasirašyta kodu. Windows gali įspėti, o macOS prašo dešiniuoju pelės klavišu, tada Atidaryti.

Visa kita – [Dar neįgyvendinta](topic:not-built-yet). Ankstesnei versijai žr. [Kas naujo 0.7](topic:whats-new-0-7).
