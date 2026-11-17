---
title: Projektovanje bašte, od početka do kraja
summary: Deset koraka pejzažnog arhitekta, od geodetskog snimanja do objavljenog seta, sa onim što radni prostor za pejzaž danas radi za svaki korak i onim što još ne radi.
keywords: vodič, korak po korak, kako, projektovanje pejzaža, projektovanje bašte, početak rada, primjer, uzorak, geodetsko snimanje, linije, teren, sadnja, spisak, listovi, objava, jedan projekat
from: 87900bf5
---

Pejzažni projekat ide u krug: geodetsko snimanje, skica, linije, teren, površine, nivoi, sadnja, spiskovi, listovi, pa natrag. Ovo je deset koraka, sa onim što postoji za svaki. Gdje korak ima prazninu, ona je navedena u **Još nije izgrađeno** na kraju, a ne sakrivena u koraku.

Možete pratiti na uzorku lokacije ili na vlastitom crtežu geodetskog snimanja. Sa vlastitim počnite od koraka 1.

## 1. Uvezite geodetsko snimanje

{{ui:Površina}} › {{ui:Linije iz crteža…}}, izaberite crtež geodetskog snimanja (DWG 2000–2018 ili DXF). Provjerite jedinice, uzmite izohipse, 3D polilinije i granicu za površinu, te blokove tačaka kao tačke geodetskog snimanja. Odjeljak **Nivoi geodetskog snimanja i provjera** čita nivoe zapisane kao tekst ili kao atribut i navodi šta izgleda pogrešno (jedinice, koordinatni sistem, udaljenost od nule, ravne izohipse, neobični nivoi, udvostručene tačke) prije nego što išta dodate. Pogledajte [Provjera crteža geodetskog snimanja pri uvozu](topic:survey-check) i [Otvaranje DWG ili DXF kao linija](topic:open-dwg-dxf). Postavite koordinatni sistem pomoću {{ui:Koordinatni sistem…}}.

## 2. Ručne skice

List na papiru, kao stari snimak ili označena kopija, uvozi se pomoću {{ui:Skeniraj…}} (Počni od skena): postavlja se u razmjeri ili na poznate koordinate ispod plana i može se preneti u linije. ModelCraft čita fotografiju ručne skice (Datoteka › Uvezi fotografiju skice…). Sam CivilCraft nema alat za ručnu skicu: postavite list ispod plana i crtajte preko njega.

## 3. Od skice do linija

Crtajte karakteristične linije i obrise preko geodetskog snimanja u CivilCraft-u, ili ih nacrtajte u 2D crtežu. Pejzaž › Više › {{ui:Iz linije}} pretvara liniju u popločavanje, uređenu površinu, zid, stepenice, karakterističnu liniju i još, zadržavajući vezu: pomjerite liniju i objekat prati. Pogledajte [Objekti iz linija](topic:objects-from-lines). U SuperCad Studio-u otvorite lokaciju, crtež i model zgrade u jednom projektu: radni prostor za pejzaž ima alate svih njih, a linija izabrana u 2D crtežu može postati objekat pejzaža koji je prati (Ctrl+K, {{ui:Objekt pejzaža iz izabrane linije crteža}}).

## 4. Projektovani teren

Otvorite {{ui:Površina}} › {{ui:Više}} › {{ui:Radni prostor za pejzaž}}. Izgradite projektovani teren pomoću {{ui:Platforma}}, {{ui:Nasip}}, {{ui:Jarak za odvodnju}} i površina nivelacije sa tačkastim nivoima i izohipsama; popločavanje, staze, zidovi, rampe i stepenice koje dodate se uklapaju u istu projektovanu površinu. Postojeći teren se nikada ne mijenja. {{ui:Nivoi}} › {{ui:Modifikatori terena…}} navodi sve što oblikuje teren, u jednom redu, sa iskopom i nasipom za svaki. Pogledajte [Nivelacija](topic:landscape-grading) i [Modifikatori terena i živi nivoi](topic:ground-modifiers).

## 5. Popločavanje i uređene površine

{{ui:Tvrdo uređenje}} › {{ui:Popločavanje}}, {{ui:Staza}}, {{ui:Zid}}, {{ui:Ivičnjak}}, {{ui:Rampa}} i {{ui:Stepenice}}. {{ui:Površine}} crta travnjak, gredicu, livadu ili pokrivač tla sa slojevima ispod; sam se odsijeca oko popločavanja, zidova i stepenica. {{ui:Gredica}} popunjava površinu razmakom biljaka, iz mješavine biljaka. Pogledajte [Tvrdo uređenje](topic:hardscape), [Uređene površine](topic:planted-areas) i [Sadnja](topic:planting).

## 6. Nivoi, nagibi i spojevi

Pod **Provjere nivelacije** označite **Analiza nagiba** i **Strelice toka i zadržavanje vode**. Ako se voda zadržava uz terasu, dodajte {{ui:Jarak za odvodnju}} oko nje. Svojstva vam kažu koliko uspona stepenice trebaju i da li stanu, te gdje je staza strmija od svoje granice. Panel Problemi navodi mjesta gdje se objekti loše sastaju: zid koji je previsok, gredica iznad popločavanja, stepenice koje ne pogađaju podest. {{ui:Tačkasti nivo}} i {{ui:Strelica nagiba}} označavaju teren i sami se ažuriraju.

## 7. Sadnja

U **Biljke**, pretražite spisak biljaka (nekoliko stotina vrsta, ili vlastiti spisak), izaberite jednu i kliknite {{ui:Biljka}}, {{ui:Gredica}} ili {{ui:Živica}}. Podesite veličinu i oznake biljke iz Više. Više › {{ui:Tabela biljaka}} uređuje vaše vlastite zapise: sorte, dostavljene veličine, gustinu, napomene o specifikaciji. Svaki zapis može imati vlastiti simbol i 3D model (OBJ, STL ili GLB), a Više › {{ui:Grafika biljaka}} crta biljke jednostavnije pri grubljim razmjerama. Pogledajte [Spisak biljaka](topic:plant-list), [Zapisi o biljkama](topic:plant-records) i [Grafika biljaka](topic:plant-graphics).

## 8. Količine i spiskovi

Više › {{ui:Radni listovi}}: spiskovi biljaka i tvrdog uređenja, kao i vlastiti, ostaju povezani sa objektima; spasite ih kao CSV ili XLSX ili ih stavite na listove (vidi [Radni listovi](topic:worksheets)). Više › {{ui:Spisak biljaka…}} šalje brojeve u TakeoffCraft. Količine tvrdog uređenja su u Svojstvima popločavanja, zida i stepenica. Navodnjavanje ima sopstveni spisak materijala: {{ui:Navodnjavanje}} › **Provjeri sistem…**. Pogledajte [Navodnjavanje](topic:irrigation).

## 9. Crteži i listovi

Više › {{ui:Listovi za pejzaž…}}: planovi sadnje, nivelacije i navodnjavanja, sa detaljima. {{ui:Nivoi}} › {{ui:Linija presjeka}} crta presjeke kroz teren, zidove, slojeve, stepenice i biljke. Pogledajte [Listovi za pejzaž](topic:landscape-sheets) i [Presjeci i set za objavu](topic:landscape-sections).

## 10. Objava

{{ui:Set za objavu (.zip)}} u dijalogu listova pravi jedan PDF sa spiskom listova i DWG po listu. Više › {{ui:Izvezi pejzaž IFC}} daje BimCraft-u biljke i tvrdo uređenje. Spasite projekat: sve je u jednoj datoteci.

## Promijenite jednu stvar: stepenice

Smisao držanja svega u jednom projektu je u tome da se promjena prenosi. Probajte sa krakom stepenica između dvije terase:

1. Nacrtajte liniju kraka kao karakterističnu liniju (ili liniju u crtežu), zatim Pejzaž › Više › {{ui:Iz linije}} › {{ui:Stepenice}}. U Svojstvima stepenica označite **Oblikuje teren**, i postavite donji i gornji nivo na dvije terase.
2. Nacrtajte uređenu gredicu pored i ispod kraka pomoću {{ui:Površine}}, i popločavanje na terasama. Gredica se sama odsijeca oko stepenica i popločavanja, a spisak biljaka broji samo ono što je posađeno.
3. U Svojstvima podignite gornji nivo kraka. Projektovani teren, tačkasti nivoi, strelice nagiba, te iskop i nasip se odmah mijenjaju. Ako krak više ne dopire do gornje terase, panel Problemi kaže za koliko.
4. Pomjerite liniju kraka. Stepenice prate svoju liniju u istom koraku poništavanja; gredica se ponovo odsijeca i ponovo broji, a radni listovi i spiskovi pokazuju nove brojeve.
5. Pritisnite Ctrl+Z jednom: linija, stepenice, teren i gredica se vraćaju zajedno.

Pogledajte [Modifikatori terena i živi nivoi](topic:ground-modifiers), [Uređene površine](topic:planted-areas) i [Radni listovi](topic:worksheets).

## Još nije izgrađeno

Ovo se traži, a nije u ovoj verziji:

- Zidovi koji oblikuju teren (prijavljuju gdje ga dodiruju, a vrh im može pratiti teren).
- Uređivanje vlastitog spiska biljaka iz Biblioteke u aplikaciji (uredite spisak projekta i spasite ga kao datoteku biljaka).
- Teksture i boje vlastitih GLB 3D modela biljaka (oblik se čita; koristi se boja biljke).

Pogledajte [Radni prostor za pejzaž](topic:landscape) za svaki alat.
