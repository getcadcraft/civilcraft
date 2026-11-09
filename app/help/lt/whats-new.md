---
title: Kas naujo 0.8 ir 0.8.1 versijoje
summary: CivilCraft 0.8 prideda Leisti lietui (audros bėgimą per jūsų vertikalųjį planavimą), žemės darbų balansavimą, geriausio maršruto paieškos įrankį, sulaikymo tvenkinius, eigą pagal matavimus, adreso į sklypą importavimo įrankį, kuris išlaiko sklypą projekte, ir langus gruntams ir šlaitams, sankryžoms ir ženklinimui, matavimų koregavimui, atviroms duobėms, radijo ryšio linijoms ir geležinkelio išvažiavimams. 0.8.1 ištaiso, kaip skaitomi DWG failai.
keywords: kas naujo, naujienos, išleidimo pastabos, keitimų žurnalas, pakeitimai, 0.8, 0.8.1, versija, naujos funkcijos, lietus, audra, tvenkimas, viršijimas, žemės darbai, balansas, įpylimas ir iškasimas, pervežimas, geriausias maršrutas, mažiausia kaina, trasa, sulaikymo tvenkinys, nutekėjimas, sumažėjimas, laisvasis aukštis, eiga, matavimas, dronas, sandėliavimo krūva, adresas į sklypą, sklypas, gruntas, potvynis, šlaito stabilumas, Bishop, nusėdimas, sankryža, ženklinimas, ženklai, regimasis atstumas, koregavimas, mažiausių kvadratų, poligonas, atvira duobė, blokų modelis, radijo ryšio linija, Fresnelio zona, išvažiavimas, kryžminimas, kalbos, problemos, live, dwg
from: b0932cf0
---

Tai, kas pasikeitė CivilCraft 0.8 (2026-11-01) ir 0.8.1 (2026-11-02) versijose, palyginti su 0.7. Didžiausios naujovės – įrankiai, kurie tikrina jūsų vertikalųjį planavimą ir sklypą (lietus, žemės darbai, maršrutai, tvenkiniai, eiga), bei šeši skaičiavimo langai gruntui, keliams, matavimams, kasykloms, ryšio linijoms ir geležinkeliui.

## Nauja

### Patikrinkite savo vertikalųjį planavimą

- **Leisti lietui.** {{ui:Make it rain…}} (skirsnyje {{ui:Surface}}) paleidžia audrą ant suplanuoto grunto. Stebite, kaip vanduo nuteka nuo aikštelių, susikaupia žemose vietose ir persilieja per per mažus tvenkinius. Bėgimas animuotas, pateikia tūrius, didžiausią nutekėjimo debitą ir CSV failą su kiekvienu tvenkiniu. Numatytoji langelio dydžio reikšmė yra didelė, todėl pirmas įvertinimas atliekamas greitai; smulkesnis langelis veikia lėčiau. Tvenkiniai, kurie persiliejo, taip pat rodomi skydelyje {{ui:Problems}}.
- **Žemės darbų balansavimas.** {{ui:Earthwork balancer…}} aukština arba žemina aikštelę, kol iškasimas prilygsta įpylimui, ir rodo pervežimo lentelę tarp jų.
- **Geriausias maršrutas.** {{ui:Best route…}}: pasirinkite pradžią ir pabaigą, o CivilCraft suras pigiausią kelią per reljefą, laikantis jūsų šlaito ir kreivės ribų, ir sukurs iš jo trasą.
- **Sulaikymo tvenkiniai.** {{ui:Detention ponds…}} apskaičiuoja lygį ir talpą pagal jūsų gruntą, priima nutekėjimo įrenginius (angą, pylimą, V formos pjūvį, perpylimo angą), praveda audrą per tvenkinį ir patikrina sulaikytą didžiausią debitą, nusausinimo laiką ir laisvąjį aukštį.
- **Eiga pagal matavimus.** {{ui:Progress from surveys…}} palygina skirtingomis datomis atliktus dronų ar skenavimo paviršius su gruntu, koks jis buvo, ir su projektu: atlikto darbo procentą pagal tūrį, per giliai iškastas ir per daug užpiltas sritis, sandėliavimo krūvas ir tai, kada darbai baigsis tokiu tempu (pažymėta kaip įvertinimas).

### Pažinkite sklypą

- **Adresas į sklypą.** {{ui:Address to site…}} sujungia atvirus žemės sklypo, pastatų, teritorijos planavimo, gruntų, potvynių ir reljefo duomenis į vieną sklypą. Sklypą galite išlaikyti projekto faile: įvestą adresą, kiekvieną šaltinį su data, kada jį atsisiuntėte, ir jo licenciją, bei tai, ką gavote. Atidarius ar bendrinant projektą sklypas vis dar yra, be naujo duomenų atsisiuntimo. Taip pat galite jį įrašyti kaip sklypo failą arba išsiųsti į BimCraft. Žr. [Adresas į sklypą](topic:address-to-site).

### Gruntai, keliai, matavimai, kasyklos, ryšio linijos ir geležinkelis

- **Gruntai ir šlaitai.** {{ui:Soils and slopes…}} nubraižo grunto profilį tarp jūsų įvestų gręžinių. Bishopo metodas tuomet ieško kritinio apskritimo jūsų grunte, įskaitant gruntinio vandens lygį, papildomą apkrovą ir žemės drebėjimo koeficientą; pamato nusėdimas apima konsolidaciją, momentinį nusėdimą ir laiką.
- **Sankryžos ir ženklinimas.** {{ui:Junctions and striping…}} sujungia šakas su bordiūrų lankais (vienas spindulys kiekvienai šakai arba trijų centrų lankai), projektinio greičio regimąjį atstumą, regimųjų trikampių patikrinimą, pėsčiųjų perėjas, sustojimo linijas, žymėjimą ir ženklus su ženklų žiniaraščiu. Jie nubraižomi plane ir įrašomi kaip .dxf failas su pavadintais sluoksniais.
- **Matavimų koregavimas.** {{ui:Survey adjustment…}} atlieka poligono ar tinklo mažiausių kvadratų koregavimą: koreguotas koordinates, paklaidų elipses, chi kvadrato testą ir žymę matavimui, kuris neatitinka. Įtraukti laisvieji tinklai, poligono uždarymas pagal kompaso taisyklę ir RW5, GSI, JobXML ar CSV lauko failai, o koreguoti taškai įrašomi kaip CSV.
- **Atviros duobės.** {{ui:Open pits…}} paverčia gręžinių mėginius blokų modeliu ir galutine duobe pagal jūsų šlaito kampą, su išklotinės santykiu, lentele pagal laiptelį ir kokybės bei tonažo kreive. Taip pat yra įdėtos duobės pagal pajamų koeficientą ir gamybos grafikas su diskontuotu pinigų srautu.
- **Radijo ryšio linijos.** {{ui:Radio links…}} tikrina matomumą per jūsų reljefą, atsižvelgiant į Žemės išgaubimą, pirmąją Fresnelio zoną, ryšio biudžetą, signalo silpimo rezervą ir daugiakelio sklidimo nutraukimą, bei pateikia stiebo aukštį, kuris išvalytų kelią. Taip pat atliekami optinio pluošto nuostolių biudžetai, maršruto kiekiai ir vėjo apkrova bokšte.
- **Geležinkelio išvažiavimai.** {{ui:Rail turnouts…}} sukuria išvažiavimą pagal jo kryžiaus numerį, perėjimus tarp lygiagrečių bėgių ir konstrukcijos įrėžį, pakreiptą pagal nuokrypį ir išplatintą kreivėje. Išvažiavimas gali būti trasos stotyje.

Žr. [Gruntai, sankryžos, matavimų koregavimas, duobės, radijo ryšio linijos ir išvažiavimai](topic:soils-roads-survey-mines-links).

## Visose programose

- **Kalbos.** 54 kalbos, iš jų dešimt naujų. Kalbos, kitos nei anglų, yra mašininiai juodraščiai, kol jas perskaito gimtąją kalbą mokantis žmogus. Pagalbos temos vis dar dažniausiai anglų kalba.
- **Įrankių juostos eilutės.** {{ui:Settings}} › {{ui:General}} › {{ui:Toolbar rows}}: Apvynioti (kaip anksčiau), 2 eilutės arba 1 eilutė. CivilCraft juostelė rodo dažniausiai naudojamą įrankį didelį, kiti – mažus, o likę – už grupės pavadinimo rodyklės.
- **Įvesties įrenginiai.** Jutiklinė dalis, rašiklis, 3D pelė, valdiklis ir MIDI gali valdyti programas.
- **Problemos.** Problemų skydelis, kuris įspėja visose programose, su patikrinimais, skaitančiais reglamentų paketus.
- **Live.** Kas kur yra Live sesijoje rodinys.
- **Priedai.** Priedų sąrašas, įskaitant apšvietimo priedus.
- **Prijunkite savo DI.** Bet koks prijungtas asistentas gali valdyti CivilCraft įrankius. Su juo pateikiama pastaba, kad vieno paspaudimo prijungimas CadCraft Studio viduje ir talpinamas jungtis dar nėra paruoštos. Žr. [Leiskite DI asistentui dirbti su jūsų sklypu](topic:assistants).

## Ištaisyta 0.8.1

- **DWG klasių skyrius.** Jis buvo skaitomas kaip netinkamas tipas (GitHub cadcraft#5). Ištaisyta CivilCraft kartu su CadCraft, BimCraft, ModelCraft ir TakeoffCraft.
- **Kalbos keitimas veikiant programai.** CadCraft Studio ir supakuotos laidos gali keisti kalbą veikimo metu. Anksčiau buvo tik anglų kalba. Dar neišbandyta visose platformose: praneškite, jei kalba nepasikeičia.

## Dar nėra šioje versijoje

- **Tai skaičiavimo pagalbinės priemonės.** Kiekvieną naujų langų rezultatą turi patikrinti inžinierius. Grunto stiprumai pradedami nuo tipinių verčių grunto grupei, ir langas tai nurodo.
- **Leisti lietui.** Bėgimas bandomame sklype naršyklėje smulkiame langelyje gali užtrukti daugiau nei du minutes. Jis patikrintas pagal rankinius atvejus ir V formos baseiną, bet dar ne tikrame suplanuotame sklype.
- **Adresas į sklypą.** Skaito jūsų atneštus atvirų duomenų failus ir išbandytas tik su mūsų pačių failais. Medžiai nėra šaltinis. Šaltinių gavimas jums laukia privatumo formuluotės.
- **Eiga pagal matavimus.** Išbandyta tik su išgalvotais matavimais. Eigos pagal lapus ir žymėjimus (MarkupCraft) bei skenavimo palyginimo su modeliu (BimCraft) dar nėra.
- **Gruntai ir šlaitai.** Tik apskritiminiai paviršiai: nėra pleišo ar blokų paieškos ir nėra tempimo įtrūkio.
- **Sankryžos.** Viena spindulio reikšmė kiekvienai šakai, nėra sunkvežimių išsukimo trajektorijų, ir jos dar nepatenka į koridorių.
- **Lauko failai.** Skaitytuvai parašyti pagal viešus formatų aprašymus ir išbandyti su mūsų sukurtais failais. Reikalingi tikri prietaisų failai.
- **Ryšio linijos ir geležinkelis.** Radijo ryšio linijos: tik laisvosios erdvės nuostoliai ir daugiakelis sklidimas (be lietaus silpimo ar antenų diagramų), ir jokio geležinkelio standarto: kiekviena geležinkelio riba yra vietos rezervas, su juodraštiniais skaičiais, kurių nė vienas geležinkelio inžinierius nepatikrino.
- **Windows ir macOS.** 0.8 nėra pasirašyta kodu. Windows gali įspėti, o macOS prašo dešiniuoju pelės klavišu spustelėti, tada Atidaryti.

Viskas kita yra [Dar nepadaryta](topic:not-built-yet). Ankstesnę laidą žr. [Kas naujo 0.7 versijoje](topic:whats-new-0-7).
