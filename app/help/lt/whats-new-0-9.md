---
title: Kas naujo 0.9 versijoje
summary: Koridorių ir reljefo šablonai, prisegimai ir pasirinkimo mygtukai braižant, GIS analizė su atributų lentele, šešėlio, saulės energijos, komforto ir vėjo tyrimai vietovei, 3D atvaizdavimo vaizdas, bei Taškų debesų ir WaterCraft priedai.
keywords: kas naujo, 0.9, versijų pastabos, koridoriaus šablonai, reljefo šablonai, šablonų redaktorius, tipinis skerspjūvis, keli koridoriai, prisegimas, prisegimai, pasirinkimas, perkelti, kopijuoti, sukti, liestinė, atvaizdavimas, 3d atvaizdavimas, gis analizė, buferis, perdengimas, erdvinis sujungimas, atributų lentelė, stilius pagal atributą, šešėlio tyrimas, saulės derlius, utci, lauko komfortas, vėjo tyrimas, openfoam, taškų debesys, las, laz, watercraft, gaisrinis debitas, hidrantas, vandens amžius, chloras, poreikiai, patarimai, išdėstymas, pakeitimų žurnalas, pakeitimai, 0.8, 0.8.1, versija, naujos funkcijos, lietus, lietaus nuotekos, užliejimas, žemės darbai, balansas, iškasa ir pylimas, transportavimas, geriausias maršrutas, mažiausia kaina, trasa, sulaikymo tvenkinys, nutekėjimas, išsekimas, laisvasis aukštis, pažanga, apklausa, dronas, sandėlis, adresas į vietovę, sklypas, gruntas, potvynis, šlaito stabilumas, Bišopas, nuosėdos, sankryža, ženklinimas, ženklai, regėjimo atstumas, koregavimas, mažiausių kvadratų, poligonas, atvira duobė, blokų modelis, radijo ryšio linija, Fresnelio zona, išvažiavimas, kryžminimas, kalbos, problemos, gyvai, dwg
from: d7ac5b14
---

Tai, kas pasikeitė CivilCraft 0.9 versijoje, palyginti su 0.8.1. CivilCraft 0.9 yra CadCraft Studio 0.9 dalis ir jos aštuonios programos. Didžiausios dalys – koridorių ir reljefo šablonai, prisegimai braižant, GIS analizė, vietovės saulės, saulės energijos, komforto ir vėjo tyrimai bei du priedai: Taškų debesys ir WaterCraft.

## Naujovės

### Koridorių ir reljefo šablonai

- **Koridoriaus šablonai.** Atidarykite {{ui:Paviršius}} › {{ui:Daugiau}} › {{ui:Koridoriaus šablonai…}} (arba įveskite {{cmd:TEMPLATES}}). Šablonas yra mažas skerspjūvis su komponentais, poslinkiais, nuolydžiais, medžiagomis ir taškų kodais. Laikykite juos projekte, {{ui:Mano biblioteka}} arba kaip `.cctemplates.json` failą. Šablonų redaktorius rodo tikro mastu brėžinį ir rašant nurodo problemas.
- **Kurti pagal šablonus pagal stotį.** Pasirinkite trasą ir savybėse įjunkite {{ui:Kurti pagal šablonus pagal stotį}}. Kiekviena kiekvieno ruožo pusė turi savo dangos sąrašą ir savo galo sąlygą. {{ui:Pridėti koridorių}} skyriuje {{ui:Koridoriai šioje trasoje}} sudeda kelis koridorius į vieną trasą.
- **Reljefo šablonai.** {{ui:Paviršius}} › {{ui:Daugiau}} › {{ui:Reljefo šablonai…}} (arba įveskite {{cmd:TERRAINTEMPLATES}}) uždeda sluoksniuotas medžiagas, pavyzdžiui, viršutinį dirvožemį ar dangą ir pagrindą, ant reljefo, su plotu ir tūriu kiekviename sluoksnyje. Žr. [Koridorių šablonai ir reljefo šablonai](topic:corridor-templates).

### Braižymas

- **Prisegimai.** Trasos, aikštelės, parcelio, masės, objekto linijos, matavimo, ribos ir baseino įrankiai prisega prie matavimo taškų, PI, kampų, viršūnių ir statinių, su žymele prie žymeklio. Laikykite {{key:Alt}} laisvam taškui.
- **Pasirinkimo mygtukai, liestinė, perkelti, kopijuoti, sukti.** Aikštelės, parcelio ir objekto linijos kampai turi įvedamus Rytų ir Šiaurės langelius bei kryželio formos {{ui:Pasirinkti}} mygtuką. Savybėse taip pat yra {{ui:Liestinė pagal du taškus}} trasoms ir {{ui:Perkelti, kopijuoti ir sukti}} trasoms, aikštelėms, parceliams ir objekto linijoms. Žr. [Braižykite su prisegimais, pasirinktais kampais ir perkelti, kopijuoti, sukti](topic:draft-with-snaps).
- **Atvaizdavimo vaizdas 3D.** 3D juostos mygtukas {{ui:Atvaizdavimas}} nubraižo žemę natūraliomis spalvomis, dangų, rūką ir švelnius šešėlius. Modelio jis nekeičia. {{ui:Saulė}} meniu dabar turi mygtukus {{ui:Taikyti}} ir {{ui:Uždaryti}}. Žr. [Vietovės peržiūra 3D](topic:site-3d).
- **Skydeliai atsidaro po vieną skyrių.** Kairysis skydelis ir Savybių skydelis atveria vieną skyrių ir uždaro kitus, o Kraštovaizdžio juostos plytelės su keliais įrankiais yra padalintieji mygtukai.

### GIS analizė

- **Analizė.** {{ui:Paviršius}} › {{ui:Daugiau}} › {{ui:Analizė}} siūlo buferį, perdengimą, erdvinį sujungimą, pasirinkimą pagal atributą ar formą ir matavimą. Kiekvienas įrankis sukuria naują sluoksnį viename atšaukimo žingsnyje.
- **Atributų lentelė.** Sluoksnio meniu su trimis taškais yra {{ui:Atributų lentelė…}} ir {{ui:Stilius pagal atributą…}}. Žr. [Analizuokite GIS sluoksnius](topic:gis-analysis) ir [Dirbkite su sluoksnio atributų lentele](topic:gis-table).

### Vietovė: saulė, saulės energija, komfortas ir vėjas

- **Aplinkos skyrius.** Pasirinkite masę: skyrius {{ui:Aplinka}} yra po {{ui:Saulės valandos}} jos savybėse. Jame yra šešėlio tyrimas (žemėlapis, lentelė, animacija, CSV), saulės energijos derlius pagal tipinių metų orų failą (.epw) ir lauko komfortas (UTCI).
- **Vėjas, tik atrankai.** {{ui:Atlikti vėjo tyrimą}} nudažo žemę nuo sėdėjimo iki nepatogumo kiekvienai vėjo krypčiai iš orų failo. Jis nepatvirtintas, ir skydelis tai nurodo.
- **Pėsčiųjų vėjas (OpenFOAM) priedas.** Išjungtas, kol jį įjungsite {{ui:Parametrai}} › {{ui:Priedai}}. OpenFOAM yra programa, kurią įdiegiate patys. Žr. [Šešėlis, saulės energija ir lauko komfortas](topic:environment).

### Taškų debesys (priedas)

- Įjunkite {{ui:Taškų debesys}} skyriuje {{ui:Parametrai}} › {{ui:Priedai}}; dešiniajame skydelyje atsiranda skirtukas Taškų debesys. Atidarykite LAS ar LAZ failą, išvalykite jį, surūšiuokite į žemę, augmeniją ir pastatus, sukurkite žemę, horizontales ir tūrius bei eksportuokite LAS ar LAZ. Žr. [Taškų debesys iš drono ar skaitytuvo](topic:point-clouds).

### WaterCraft (priedas)

- Įjunkite {{ui:WaterCraft (vandens paskirstymas)}} skyriuje {{ui:Parametrai}} › {{ui:Priedai}}; atsiranda skirtukas WaterCraft. Jame yra vartotojų poreikiai, gaisrinis debitas prie kiekvieno hidranto, kurio magistralės atjungimas svarbiausias, ir vandens amžius bei chloras, kiekvienas įrašomas kaip CSV. Žr. [WaterCraft: poreikiai, gaisrinis debitas, atjungimai ir vandens amžius](topic:watercraft).

### Bendradarbiavimas

- Live sesijoje matote kiekvieno kitų žymeklius ir vardus plane. Bibliotekos augalai: CivilCraft kraštovaizdis pradeda nuo savo numatytosios bibliotekos kolekcijos, {{ui:CivilCraft kraštovaizdis}}.

## Visose programose

- Patarimai rodomi kaip Bootstrap įrankių patarimai, o pradžios patarimą galima uždaryti.
- Skirtukų juosta, kuri netelpa skydelyje, slenka, o ne nukerpama.
- Naršyklės skirtukų pavadinimai yra `<dokumentas> - CivilCraft | CadCraft`.
- {{ui:Parametrai}} turi išdėstymo skyrių, kur išdėstymai pateikiami išskleidžiamajame sąraše su dviejų eilučių pasirinkimais.
- Svorio ir temperatūros vienetai yra {{ui:Parametrai}} › {{ui:Visuotiniai}} › {{ui:Vienetai}}.
- Kalbų sąraše rodomos kalbos, kurioms versija turi failus. Kalbos, išskyrus anglų, yra mašininiai juodraščiai.

## Ištaisyta

- Adreso paieškos ir EnergyPlus patikros priedų nebuvo galima įjungti; dabar galima.
- Pagalba dabar nurodo, kad Taškų debesų priedas įrašo išvalytą debesį kaip LAS 1.4 arba LAZ.
- Paspaudus pasirinkto objekto paties rankenėlę, nebeprasideda rankenėlės vilkimas, kuris sustabdydavo laukiamą Pasirinkimą.

## Ribos, kurias reikia žinoti

- Koridorių šablonai pavyzdžiai yra vietos laikikliai, neparemti jokiu standartu; inžinierius turi juos patikrinti. Reljefo šablonai nepridedia paviršiaus ir nėra nubraižomi 3D ar pjūvio vaizde. Antrasis koridorius trasoje nėra IFC eksporte. Tarp dviejų šablonų pagal stotį nėra sklandaus perėjimo.
- Taškų debesys išbandyti su išgalvotais failais, ne su tikru dronų matavimu. Skaitomi tik LAS ir LAZ.
- GIS analizė išbandyta su išgalvotais sluoksniais.
- Šešėlis, saulės energija ir komfortas yra planavimo įvertinimai; vėjas yra nepatvirtinta atranka. Nė vienas iš jų nėra projektinė vertė.
- WaterCraft yra skaičiavimo pagalbinė priemonė, patikrinta išgalvotuose tinkluose. Vandens inžinierius nusprendžia, kiek verti yra skaičiai.
- Kalbos, išskyrus anglų, yra mašininiai juodraščiai.
- Windows diegimo programos nepasirašytos kodu, o macOS diskų vaizdas nėra notarizuotas.

## Ankstesnė: 0.8 ir 0.8.1

Tai, kas pasikeitė CivilCraft 0.8 (2026-11-01) ir 0.8.1 (2026-11-02) versijose, palyginti su 0.7. Didžiausios naujos dalys – įrankiai, testuojantys jūsų planiravimą ir vietovę (lietus, žemės darbai, maršrutai, tvenkiniai, pažanga), ir šeši skaičiavimo langai žemei, keliams, apklausai, kasykloms, ryšiams ir geležinkeliams.

### Naujovės

**Išbandykite savo planiravimą**

- **Leisti lietui.** {{ui:Leisti lietui…}} ({{ui:Paviršius}} skyriuje) numeta liūtį ant planiruotos žemės. Matote, kaip vanduo nuteka nuo aikštelių, susitelkia žemumose ir persilieja per per mažus tvenkinius. Eiga animuota, ir pateikiami tūriai, didžiausias nutekėjimas ir CSV kiekvienam tvenkiniui. Numatytasis langelis yra stambus, kad pirmasis žvilgsnis būtų greitas; smulkesnis langelis lėtesnis. Persiliejantys tvenkiniai rodomi ir Problemų skydelyje.
- **Žemės darbų balansavimas.** {{ui:Žemės darbų balansavimas…}} pakelia arba nuleidžia aikštelę, kol iškasa lygi pylimui, ir rodo transportavimo lentelę tarp jų.
- **Geriausias maršrutas.** {{ui:Geriausias maršrutas…}}: pasirinkite pradžią ir pabaigą, o CivilCraft suranda pigiausią kelią per reljefą, laikantis jūsų nuolydžio ir kreivės ribų, ir iš jo sukuria trasą.
- **Sulaikymo tvenkiniai.** {{ui:Sulaikymo tvenkiniai…}} apskaičiuoja lygį ir talpą pagal jūsų žemę, priima išleidimo įrenginius (angą, pylimą, V formos pylimą, perpylimo kanalą), nukreipia liūtį per tvenkinį ir tikrina sulaikomą smailę, nusekimo laiką ir laisvąjį aukštį.
- **Pažanga pagal matavimus.** {{ui:Pažanga pagal matavimus…}} palygina dronų ar skenavimo paviršius iš skirtingų datų su žeme, kokia ji buvo, ir su projektu: procentas atlikta pagal tūrį, per giliai iškastos ir per daug užpiltos sritys, sandėliai ir kada darbai baigsis tokiu tempu (pažymėta kaip įvertinimas).

**Pažinkite vietovę**

- **Adresas į vietovę.** {{ui:Adresas į vietovę…}} sujungia atvirus parcelių, pastatų, zonavimo, dirvožemio, potvynių ir reljefo duomenis vienoje vietovėje. Vietovę galite laikyti projekto faile: įvestą adresą, kiekvieną šaltinį su diena, kurią jį gavote, ir jo licenciją, bei tai, kas grįžo. Atidarę ar bendrindami projektą vėl matote vietovę, be naujo duomenų atsisiuntimo. Taip pat galite ją įrašyti kaip vietovės failą arba siųsti į BimCraft. Žr. [Adresas į vietovę](topic:address-to-site).

**Gruntas, keliai, matavimai, kasyklos, ryšiai ir geležinkeliai**

- **Gruntai ir šlaitai.** {{ui:Gruntai ir šlaitai…}} nubraižo dirvožemio profilį tarp jūsų įvestų gręžinių. Bišopo metodas tada ieško kritinio apskritimo jūsų žemėje, su gruntinio vandens lygiu, papildoma apkrova ir žemės drebėjimo koeficientu; pamatų nusėdimas apima konsolidaciją, tuojaus nusėdimą ir laiką.
- **Sankryžos ir ženklinimas.** {{ui:Sankryžos ir ženklinimas…}} sujungia kojas su bordiūrų lankais (vienas spindulys kiekvienai kojai arba trijų centrų lankai), regėjimo atstumą projektiniam greičiui, regėjimo trikampių patikrą, pėsčiųjų perėjas, stabdymo linijas, ženklinimą ir ženklus su ženklų sąrašu. Jos nubraižomos plane ir įrašomos kaip .dxf su pavadintais sluoksniais.
- **Matavimų koregavimas.** {{ui:Matavimų koregavimas…}} atlieka trasos ar tinklo mažiausių kvadratų koregavimą: koreguotos koordinatės, paklaidų elipsės, chi kvadrato testas ir žymė matavimui, kuris netinka. Įtraukti laisvi tinklai, trasos uždarymas kompaso taisykle ir RW5, GSI, JobXML ar CSV lauko failai, o koreguoti taškai įrašomi kaip CSV.
- **Atviros duobės.** {{ui:Atviros duobės…}} paverčia gręžinio mėginius blokų modeliu ir ribine duobe jūsų nuolydžio kampo ribose, su išplovimo santykiu, lentele pagal pakopą ir kreive pagal sąlygą bei tonažą. Yra ir įdėtos duobės pagal pajamų koeficientą bei gamybos grafikas su diskontuotu pinigų srautu.
- **Radijo ryšio linijos.** {{ui:Radijo ryšio linijos…}} tikrina matomumą per jūsų žemę su Žemės išlinkimu, pirmąja Fresnelio zona, ryšio biudžetu, rezervu nuo užgesimo ir daugiakelio kelio nutrūkimu, ir nurodo stiebo aukštį, kuris leistų praeiti per kelią. Taip pat yra optinio pluošto nuostolių biudžetai, maršruto kiekiai ir vėjo apkrova bokštui.
- **Geležinkelio išvažiavimai.** {{ui:Geležinkelio išvažiavimai…}} sukuria išvažiavimą pagal jo kryžiaus numerį, kryžminimus tarp lygiagrečių kelių ir konstrukcijos matmenis, pasvirusius dėl posvyrio ir platėjančius kreivėje. Išvažiavimas gali būti trasos stotyje.

Žr. [Gruntai, sankryžos, matavimų koregavimas, kasyklos, radijo ryšio linijos ir išvažiavimai](topic:soils-roads-survey-mines-links).

### Visose programose

- **Kalbos.** 54 kalbos, dešimt iš jų naujos. Kalbos, išskyrus anglų, yra mašininiai juodraščiai, kol jų neperskaito gimtosios kalbos specialistas. Pagalbos temos daugiausia anglų kalba.
- **Įrankių juostos eilutės.** {{ui:Parametrai}} › {{ui:Bendra}} › {{ui:Įrankių juostos eilutės}}: Perkelti (kaip anksčiau), 2 eilutės arba 1 eilutė. CivilCraft juosta rodo dažniausiai naudojamą įrankį didelį, kiti – maži, o likę – už grupės pavadinimo rodyklės.
- **Įvesties įrenginiai.** Jutiklinis kilimėlis, rašiklis, 3D pelė, valdiklis ir MIDI gali valdyti programas.
- **Problemos.** Problemų skydelis, įspėjantis visose programose, su patikromis, kurios skaito reglamentų paketus.
- **Live.** Vaizdas, kas kur yra Live sesijoje.
- **Priedai.** Priedų sąrašas su apšvietimo priedais.
- **Prijunkite savo DI.** Bet kuris prijungtas asistentas gali valdyti CivilCraft įrankius. Jis pridedamas su pastaba, kad vieno paspaudimo prijungimas CadCraft Studio viduje ir talpinamas jungtis dar nėra paruoštos. Žr. [Leiskite DI asistentui dirbti su jūsų vietove](topic:assistants).

### Ištaisyta 0.8.1

- **DWG klasių skyrius.** Jis buvo skaitomas kaip neteisingas tipas (GitHub cadcraft#5). Ištaisyta CivilCraft kartu su CadCraft, BimCraft, ModelCraft ir TakeoffCraft.
- **Kalbos keitimas veikiant.** CadCraft Studio ir supakuoti leidimai gali keisti kalbą veikimo metu. Anksčiau buvo tik anglų kalba. Dar neišbandyta visose platformose: praneškite, jei kalba nepasikeičia.

### Dar nėra šioje versijoje

- **Tai skaičiavimo pagalbinės priemonės.** Kiekvieną naujų langų rezultatą turi patikrinti inžinierius. Gruntų stiprumai pradeda nuo tipinių grupės verčių, ir langas tai nurodo.
- **Lietus.** Paleidimas pavyzdinėje vietovėje naršyklėje gali užtrukti daugiau nei dvi minutes su smulkiu langeliu. Patikrinta su rankiniais atvejais ir V formos baseinu, dar ne su tikra planuota vietove.
- **Adresas į vietovę.** Skaito atviras duomenų failus, kuriuos atsinešate; išbandyta tik su mūsų failais. Medžiai nėra šaltinis. Šaltinių gavimas jūsų vardu laukia privatumo formuluotės.
- **Pažanga pagal matavimus.** Išbandyta tik su išgalvotais matavimais. Pažanga pagal lapus ir žymėjimus (MarkupCraft) bei palyginimas su modeliu (BimCraft) nėra sukurti.
- **Gruntai ir šlaitai.** Tik apskritiminiai paviršiai: nėra pleišinės ar blokinės paieškos ir nėra įtrūkimo.
- **Sankryžos.** Vienas spindulys kiekvienai kojai, nėra sunkvežimių apsisukimo kelių, ir jos dar nepatenka į koridorių.
- **Lauko failai.** Skaitikliai parašyti pagal viešus formatų aprašymus ir išbandyti su mūsų failais. Reikia tikrų prietaisų failų.
- **Ryšiai ir geležinkeliai.** Radijo ryšio linijos: tik laisvos erdvės nuostoliai ir daugiakelis kelias (be lietaus užgesimo ar antenų diagramų), ir jokio geležinkelio standarto: kiekviena geležinkelio riba yra vietos laikiklis, su juodraščio skaičiais, kurių nė vienas geležinkelių inžinierius nepatikrino.
- **Windows ir macOS.** 0.8 nepasirašyta kodu. Windows gali įspėti, o macOS reikalauja dešiniojo klavišo, tada Atidaryti.

Viskas kita yra [Dar neįgyvendinta](topic:not-built-yet). Ankstesnę versiją žr. [Kas naujo 0.7](topic:whats-new-0-7).
