---
title: Projektovanje bašte, od početka do kraja
summary: Deset koraka pejzažnog arhitekte, od geodetskog snimanja do objavljenog skupa, sa tim šta radni prostor Pejzažno uređenje radi za svaki korak danas i šta još ne radi.
keywords: uputstvo, vodič, kako da, projektovanje pejzaža, projektovanje bašte, početak rada, primer, uzorak, korak po korak, geodetsko snimanje, linije crteža, teren, sadnja, spisak, listovi, objavljivanje, jedan projekat
from: 87900bf5
---

Pejzažni projekat ide u krug: geodetsko snimanje, skica, linije crteža, teren, površine, kote, sadnja, spiskovi, listovi, pa opet nazad. Ovo je deset koraka, sa onim što postoji za svaki. Gde korak ima prazninu, ona je navedena pod **Još nije izgrađeno** na kraju, a ne sakrivena u koraku.

Možete pratiti na uzorku lokaliteta ili na sopstvenom crtežu geodetskog snimanja. Sa sopstvenim, počnite od koraka 1.

## 1. Uvezite geodetsko snimanje

{{ui:Površ}} › {{ui:Linije iz crteža…}}, izaberite crtež geodetskog snimanja (DWG 2000–2018 ili DXF). Proverite jedinice, uzmite izohipse, 3D polilinije i granicu za površ, a blokove tačaka kao tačke snimanja. Odeljak **Kote snimanja i provera** čita kote napisane kao tekst ili atribut i navodi šta izgleda pogrešno (jedinice, koordinatni sistem, udaljenost od nule, ravne izohipse, neobične kote, udvostručene tačke) pre nego što išta dodate. Pogledajte [Provera crteža geodetskog snimanja pri uvozu](topic:survey-check) i [Otvaranje DWG ili DXF kao linija crteža](topic:open-dwg-dxf). Koordinatni sistem postavite sa {{ui:Koordinatni sistem…}}.

## 2. Ručne skice

List na papiru, kao stari snimak ili označen otisak, unosi se sa {{ui:Skeniraj…}} (Počni od skeniranja): postavlja se u razmeri ili na poznate koordinate ispod plana i može se preneti u linije crteža. ModelCraft čita fotografiju ručne skice (Datoteka › Uvezi fotografiju skice…). Sam CivilCraft nema alat za ručnu skicu: postavite list ispod plana i crtajte preko njega.

## 3. Od skice do linija crteža

Crtajte linije karakteristika i obrise preko snimka u CivilCraft-u ili ih nacrtajte u 2D crtežu. Pejzažno uređenje › Više › {{ui:Iz linije}} pretvara liniju u popločavanje, zasađenu površinu, zid, stepenice, liniju karakteristike i još mnogo toga. Ostaju povezani: pomerite liniju i objekat je prati. Pogledajte [Objekti iz linija crteža](topic:objects-from-lines). U SuperCad Studio-u otvorite lokalitet, crtež i model zgrade u jednom projektu: radni prostor **Pejzažno uređenje** ima alate svih njih, a linija izabrana u 2D crtežu može postati objekat pejzaža koji je prati (Ctrl+K, {{ui:Objekat pejzaža iz izabrane linije crteža}}).

## 4. Projektovani teren

Otvorite {{ui:Površ}} › {{ui:Više}} › {{ui:Radni prostor za pejzažno uređenje}}. Izgradite projektovani teren sa {{ui:Platforma}}, {{ui:Nasip}}, {{ui:Odvodni jarak}} i površinama nivelacije sa kotama tačaka i izohipsama; popločavanje, staze, zidovi, rampe i stepenice koje dodate nivelišu se u istu projektovanu površ. Postojeći teren se nikad ne menja. {{ui:Kote}} › {{ui:Modifikatori terena…}} navodi sve što oblikuje teren u jednom redosledu, sa iskopom i nasipom za svaki. Pogledajte [Nivelacija](topic:landscape-grading) i [Modifikatori terena i žive kote](topic:ground-modifiers).

## 5. Popločavanje i zasađene površine

{{ui:Tvrdo uređenje}} › {{ui:Popločavanje}}, {{ui:Staza}}, {{ui:Zid}}, {{ui:Ivičnjak}}, {{ui:Rampa}} i {{ui:Stepenice}}. {{ui:Površine}} crta travnjak, gredicu, livadu ili pokrivač tla sa njihovim slojevima; sam se isecа oko popločavanja, zidova i stepenica. {{ui:Gredica}} popunjava površinu na razmaku biljaka, iz mešavine biljaka. Pogledajte [Tvrdo uređenje](topic:hardscape), [Zasađene površine](topic:planted-areas) i [Sadnja](topic:planting).

## 6. Kote, nagibi i spojevi

Pod **Provere nivelacije** označite **Analiza nagiba** i **Strelice toka i zadržavanje vode**. Ako se voda zadržava uz terasu, dodajte {{ui:Odvodni jarak}} oko nje. Svojstva kažu koliko podizanja treba stepenicama i da li stanu, kao i gde je staza strmija od svog ograničenja. Panel Problemi navodi gde se objekti loše spajaju: zid previsok, gredica iznad popločavanja, stepenice koje promašuju svoje odmorište. {{ui:Kota tačke}} i {{ui:Strelica nagiba}} obeležavaju teren i ažuriraju se sami.

## 7. Sadnja

U **Biljkama** pretražite spisak biljaka (nekoliko stotina vrsta, ili vaš spisak), izaberite jednu i kliknite {{ui:Biljka}}, {{ui:Gredica}} ili {{ui:Živica}}. Podesite veličinu i oznake biljke iz {{ui:Više}}. {{ui:Tabela biljaka}} uređuje vaše sopstvene zapise: sorte, isporučene veličine, gustinu, napomene o specifikaciji. Svaki zapis može nositi vaš simbol i 3D model (OBJ, STL ili GLB), a {{ui:Grafika biljaka}} crta biljke jednostavnije na krupnijim razmerama. Pogledajte [Spisak biljaka](topic:plant-list), [Zapisi biljaka](topic:plant-records) i [Grafika biljaka](topic:plant-graphics).

## 8. Količine i spiskovi

{{ui:Više}} › {{ui:Radni listovi}}: spiskovi biljaka i tvrdog uređenja, kao i vaši, ostaju povezani sa objektima; sačuvajte ih kao CSV ili XLSX ili ih stavite na listove (pogledajte [Radni listovi](topic:worksheets)). {{ui:Spisak biljaka…}} šalje brojeve u TakeoffCraft. Količine tvrdog uređenja su u Svojstvima popločavanja, zidova i stepenica. Navodnjavanje ima sopstveni spisak materijala: {{ui:Navodnjavanje}} › **Proveri sistem…**. Pogledajte [Navodnjavanje](topic:irrigation).

## 9. Crteži i listovi

{{ui:Više}} › {{ui:Listovi za pejzaž…}}: planovi sadnje, nivelacije i navodnjavanja, sa detaljima. {{ui:Kote}} › {{ui:Linija preseka}} crta preseke kroz teren, zidove, slojeve, stepenice i biljke. Pogledajte [Listovi pejzaža](topic:landscape-sheets) i [Preseci i skup za objavljivanje](topic:landscape-sections).

## 10. Objavljivanje

{{ui:Skup za objavljivanje (.zip)}} u prozoru Listovi pravi jedan PDF sa spiskom listova i DWG po listu. {{ui:Više}} › {{ui:Izvezi IFC za uređenje}} daje BimCraft-u biljke i tvrdo uređenje. Sačuvajte projekat: sve je u jednoj datoteci.

## Promenite jednu stvar: stepenice

Svrha čuvanja svega u jednom projektu je da se promena prenese. Probajte sa krakom stepenica između dve terase:

1. Nacrtajte liniju kraka kao liniju karakteristike (ili liniju u crtežu), zatim Pejzažno uređenje › Više › {{ui:Iz linije}} › {{ui:Stepenice}}. U Svojstvima stepenica označite **Oblikuje teren** i postavite donju i gornju kotu na dve terase.
2. Nacrtajte zasađenu gredicu uz i ispod kraka sa {{ui:Površine}}, i popločavanje na terasama. Gredica se sama isecа oko stepenica i popločavanja, a spisak biljaka broji samo ono što je zasađeno.
3. Podignite gornju kotu kraka u Svojstvima. Projektovani teren, kote tačaka, strelice nagiba i iskop i nasip menjaju se odmah. Ako krak više ne dodiruje gornju terasu, panel Problemi kaže za koliko.
4. Pomerite liniju kraka. Stepenice prate svoju liniju u istom koraku opozivanja; gredica se ponovo isecа i ponovo broji, a radni listovi i spiskovi pokazuju nove brojeve.
5. Pritisnite Ctrl+Z jednom: linija, stepenice, teren i gredica se vraćaju zajedno.

Pogledajte [Modifikatori terena i žive kote](topic:ground-modifiers), [Zasađene površine](topic:planted-areas) i [Radni listovi](topic:worksheets).

## Još nije izgrađeno

Ovo se traži i nije u ovoj verziji:

- Zidovi koji oblikuju teren (prijavljuju gde ga dodiruju, a njihov vrh može da ga prati).
- Uređivanje sopstvenog spiska biljaka iz Biblioteke u aplikaciji (izmenite spisak projekta i sačuvajte ga kao datoteku biljaka).
- Teksture i boje sopstvenih GLB modela biljaka (oblik se čita; koristi se boja biljke).

Pogledajte [Radni prostor Pejzažno uređenje](topic:landscape) za svaki alat.
