---
title: Oblikovanje vrta, od početka do kraja
summary: Deset koraka arhitekta krajobraza, od snimke do objavljenog skupa, s onim što radni prostor Krajobraz danas čini za svaki korak i što još ne čini.
keywords: vodič, vodič korak po korak, kako, oblikovanje krajobraza, dizajn vrta, početak rada, primjer, uzorak, korak po korak, snimka, linije, teren, sadnja, popis, listovi, objava, jedan projekt
from: 87900bf5
---

Projekt krajobraza kruži: snimka, skica, linije, teren, površine, kote, sadnja, popisi, listovi, pa natrag. Evo deset koraka s onim što za svaki postoji. Gdje korak ima nedostatak, on je naveden u **Još nije izrađeno** na kraju, a ne skriven unutar koraka.

Možete pratiti na primjeru lokaliteta ili na vlastitoj snimci. S vlastitom snimkom počnite od koraka 1.

## 1. Uvezite snimku

{{ui:Teren}} › {{ui:Linije iz crteža…}}: odaberite crtež snimke (DWG 2000–2018 ili DXF). Provjerite jedinice, uzmite izohipse, 3D polilinije i granicu za teren, a blokove točaka kao točke snimke. Odjeljak **Kote snimke i provjera** čita kote zapisane kao tekst ili atribut i popisuje što izgleda neispravno (jedinice, koordinatni sustav, udaljenost od nule, ravne izohipse, neobične kote, dvostruke točke) prije nego što išta dodate. Pogledajte [Provjera snimke pri uvozu](topic:survey-check) i [Otvaranje DWG ili DXF datoteke kao linija](topic:open-dwg-dxf). Koordinatni sustav postavite s {{ui:Koordinatni sustav…}}.

## 2. Skice iz ruke

List na papiru, poput stare snimke ili označenog otiska, ulazi s {{ui:Skeniraj…}} (Počni od skeniranja): postavlja se u mjerilu ili na poznate koordinate ispod plana i može se prenijeti u linije. ModelCraft čita fotografiju skice iz ruke (Datoteka › Uvezi fotografiju skice…). Sam CivilCraft nema alat za skicu iz ruke: postavite list ispod plana i crtajte preko njega.

## 3. Od skice do linija

Crtajte značajne linije i obrise preko snimke u CivilCraftu ili ih crtajte u 2D crtežu. Krajobraz › {{ui:Više}} › {{ui:S linije}} pretvara liniju u popločenje, zasađenu površinu, zid, stube, značajnu liniju i još ponešto, ostajući povezano: pomaknete li liniju, objekt slijedi. Pogledajte [Objekti iz linija](topic:objects-from-lines). U SuperCad Studio otvorite lokalitet, crtež i model zgrade u jednom projektu: radni prostor **Krajobraz** ima alate svih njih, a linija odabrana u 2D crtežu može postati objekt krajobraza koji je prati (Ctrl+K, Objekt krajobraza iz odabrane linije crteža).

## 4. Projektirani teren

Otvorite {{ui:Teren}} › {{ui:Više}} › {{ui:Radni prostor Krajobraz}}. Izradite projektirani teren pomoću {{ui:Platforma}}, {{ui:Nasipić (berma)}}, {{ui:Zaravnjeni jarak (swale)}} i površina uređenja s kotama točaka i izohipsama; popločenja, staze, zidovi, rampe i stube koje dodate uklapaju se u istu projektiranu površinu. Postojeći teren se nikad ne mijenja. {{ui:Kote}} › {{ui:Modifikatori terena…}} navodi sve što oblikuje teren, u jednom poretku, sa iskopom i nasipom za svaki. Pogledajte [Uređenje terena](topic:landscape-grading) i [Modifikatori terena i žive kote](topic:ground-modifiers).

## 5. Popločenja i zasađene površine

{{ui:Popločenje i građevinski uređeni elementi}} › {{ui:Popločenje}}, {{ui:Staza}}, {{ui:Zid}}, {{ui:Rubnjak}}, {{ui:Rampa}} i {{ui:Stube}}. {{ui:Površine}} crta travnjak, gredicu, livadu ili pokrovnicu s njezinim slojevima, a sama se izrezuje oko popločenja, zidova i stuba. {{ui:Gredica}} ispunjava površinu razmakom biljaka iz mješavine biljaka. Pogledajte [Popločenje i građevinski uređeni elementi](topic:hardscape), [Zasađene površine](topic:planted-areas) i [Sadnja](topic:planting).

## 6. Kote, nagibi i spojevi

Pod **Provjere uređenja terena** označite **Analiza nagiba** i **Strelice tečenja i zadržavanje vode**. Ako se voda zadržava uz terasu, dodajte {{ui:Zaravnjeni jarak (swale)}} oko nje. Svojstva kažu koliko čela stuba trebaju i odgovaraju li, te gdje je staza strmija od svoje granice. Ploča Problemi navodi mjesta gdje se objekti loše spajaju: zid je previsok, gredica je iznad popločenja, stube ne pogađaju svoj podest. {{ui:Kota točke}} i {{ui:Strelica nagiba}} označavaju teren i ažuriraju se same.

## 7. Sadnja

U **Biljkama** pretražite popis biljaka (nekoliko stotina vrsta ili vlastiti popis), odaberite jednu i postavite {{ui:Biljka}}, {{ui:Gredica}} ili {{ui:Živica}}. Veličinu biljke i oznake postavite iz {{ui:Više}}. {{ui:Više}} › {{ui:Tablica biljaka}} uređuje vaše zapise: sorte, dostupne veličine, gustoću, napomene o specifikaciji. Svaki zapis može nositi vlastiti simbol i 3D model (OBJ, STL ili GLB), a {{ui:Više}} › {{ui:Grafika biljaka}} crta biljke jednostavnije pri krupnijim mjerilima. Pogledajte [Popis biljaka](topic:plant-list), [Zapisi biljaka](topic:plant-records) i [Grafika biljaka](topic:plant-graphics).

## 8. Količine i popisi

{{ui:Više}} › {{ui:Radne tablice}}: popisi biljaka i popločenja, i vaši vlastiti, ostaju povezani s objektima; spremite ih kao CSV ili XLSX ili ih stavite na listove (pogledajte [Radne tablice](topic:worksheets)). {{ui:Više}} › {{ui:Popis biljaka…}} šalje brojeve u TakeoffCraft. Količine popločenja su u svojstvima popločenja, zidova i stuba. {{ui:Navodnjavanje}} ima vlastitu sastavnicu materijala: {{ui:Navodnjavanje}} › **Provjeri sustav…**. Pogledajte [Navodnjavanje](topic:irrigation).

## 9. Crteži i listovi

{{ui:Više}} › {{ui:Listovi krajobraza…}}: planovi sadnje, uređenja terena i navodnjavanja, s detaljima. {{ui:Kote}} › {{ui:Linija presjeka}} crta presjeke kroz teren, zidove, slojeve, stube i biljke. Pogledajte [Listovi krajobraza](topic:landscape-sheets) i [Presjeci krajobraza i skup za objavu](topic:landscape-sections).

## 10. Objava

{{ui:Skup za objavu (.zip)}} u dijaloškom okviru Listovi izrađuje jedan PDF s popisom listova i DWG za svaki list. {{ui:Više}} › {{ui:Izvezi IFC krajobraza}} daje BimCraftu biljke i popločenja. Spremite projekt: sve je u jednoj datoteci.

## Promijenite jednu stvar: stube

Smisao držanja svega u jednom projektu je u tome da se promjena prenosi. Probajte s krakom stuba između dviju terasa:

1. Nacrtajte liniju kraka kao značajnu liniju (ili liniju u crtežu), zatim Krajobraz › {{ui:Više}} › {{ui:S linije}} › {{ui:Stube}}. U svojstvima stuba označite **Oblikuje teren** i postavite donju i gornju kotu na dvije terase.
2. Nacrtajte zasađenu gredicu pored i ispod kraka s {{ui:Površine}}, i popločenje na terasama. Gredica se sama izrezuje oko stuba i popločenja, a popis biljaka broji samo ono što je posađeno.
3. Podignite gornju kotu kraka u svojstvima. Projektirani teren, kote točaka, strelice nagiba te iskop i nasip odmah se mijenjaju. Ako krak više ne dodiruje gornju terasu, ploča Problemi kaže za koliko.
4. Pomaknite liniju kraka. Stube slijede svoju liniju u istom koraku poništavanja; gredica se ponovno izrezuje i ponovno broji, a radne tablice i popisi pokazuju nove brojeve.
5. Pritisnite Ctrl+Z jednom: linija, stube, teren i gredica se vraćaju zajedno.

Pogledajte [Modifikatori terena i žive kote](topic:ground-modifiers), [Zasađene površine](topic:planted-areas) i [Radne tablice](topic:worksheets).

## Još nije izrađeno

Ovo se traži i nije u ovoj verziji:

- Zidovi koji oblikuju teren (prijavljuju gdje ga dodiruju, a njihov vrh ga može slijediti).
- Uređivanje vlastitog popisa biljaka iz knjižnice u aplikaciji (uredite popis projekta i spremite ga kao datoteku biljaka).
- Teksture i boje vlastitih GLB modela biljaka (oblik se čita; koristi se boja biljke).

Pogledajte [Radni prostor Krajobraz](topic:landscape) za svaki alat.
