---
title: Rješavanje problema
summary: Simptomi, uzroci i rješenja za probleme na koje se nailazi u CivilCraftu, uz tačne poruke koje aplikacija prikazuje.
keywords: problemi, greške, ne radi, popravka, pomoć, poruke, rješavanje problema, odbijeno, nedostaje, pogrešno, zamijenjeno, nedostaju izohipse
from: a9f7dedc
---

Poruke se pojavljuju u statusnoj traci dolje desno, u okvirima u lijevom i desnom panelu, i u dijalozima. Ovdje su navedene onako kako ih aplikacija prikazuje.

## Otvaranje datoteka

**"Ta datoteka je veća od 200 MB; CivilCraft još ne otvara datoteke ove veličine."**
Podijeli datoteku s tačkama ili smanji količinu podataka prije otvaranja.

**"Nije moguće otvoriti site.json: Ovo nije datoteka CivilCraft projekta."**
Datoteka se završava na `.json` ili počinje s `{`, ali nije CivilCraft projekat. Datoteke s tačkama ne smiju počinjati s `{`.

**"Nije moguće otvoriti … Ova datoteka projekta je iz novije verzije CivilCrafta (verzija 2)."**
Projekat je sačuvan u novijoj verziji. Otvori ga tamo ili iz njega izvezi LandXML.

**"Nije moguće otvoriti … Ovo je XML, ali ne LandXML (korijenski element je <…>)."**
Datoteka je druga vrsta XML-a. Izvezi LandXML iz drugog programa.

**"… nema tačaka, TIN površina ni osa trase koje CivilCraft može pročitati."**
Sve u datoteci je nešto što CivilCraft preskače (na primjer samo mrežne površine ili samo spiralne ose trase). Ostatak poruke kaže šta je tu bilo. Vidi [LandXML: što se čita i piše](topic:landxml-reference).

**"Primjer nije mogao biti učitan: …"**
{{ui:Otvori primjer lokacije}} čita datoteku s CadCraft sajta. Bez veze radi samo ako je CivilCraft sačuvan za rad van mreže (dugme u traci aplikacije prikazuje {{ui:Spremno za rad van mreže}}). Pređi na mrežu, klikni {{ui:Spasi za rad van mreže}} i od tada radi van mreže. Vidi [Rad van mreže](common:offline).

**{{ui:Spasi za rad van mreže}} prikazuje {{ui:Nije moguće spasiti}}.**
Neke datoteke nisu preuzete. Provjeri vezu i ponovo klikni dugme.

**{{ui:Spasi za rad van mreže}} prikazuje {{ui:Rad van mreže nije dostupan}}.**
Ovaj prozor pregledača ne može sačuvati kopiju za rad van mreže, obično zato što je privatni prozor ili je računar pod upravljanjem. Otvori CivilCraft u običnom prozoru.

**Van mreže se aplikacija uopće ne otvara.**
Nije sačuvan za rad van mreže u ovom pregledaču, ili je pregledač obrisao podatke stranice (Safari to radi za stranice koje nisu posjećene nekoliko sedmica). Pređi na mrežu, otvori CivilCraft i klikni {{ui:Spasi za rad van mreže}}.

**Kopija za rad van mreže je starija verzija.**
Klikni {{ui:Spremno za rad van mreže}}, pa {{ui:Spasi ponovo (preuzmi najnoviju verziju)}} dok si na mreži.

**Datoteka je zasivljena u prozoru za otvaranje.**
Prozor navodi samo datoteke s tačkama, LandXML i datoteke projekata po njihovim nastavcima. Umjesto toga prevuci datoteku na plan ili joj promijeni naziv u `.txt`.

## Uvoz tačaka

**"Iz ove datoteke nije bilo moguće pročitati tačke."**
Ručno odaberi redoslijed kolona u **Kolone**. Ako ništa ne radi, otvori datoteku u uređivaču teksta i provjeri da ima jednu tačku po redu, s brojevima u njemu.

**Lokacija izgleda zrcaljeno, rotirano ili rastegnuto u liniju.**
Sjever i istok su zamijenjeni. Sažetak je rekao „pogođeno iz broja kolona“. Odaberi PENZD umjesto PNEZD (ili obrnuto) u **Kolone**, ili uvezi ponovo.

**Tačke daleko od ostalih, a plan se zumirao na tačku.**
Red ima grešku u koordinati, ili datoteka miješa koordinatne sisteme. Nađi tačku (klikni je da vidiš njen broj) i ispravi datoteku.

**Redovi navedeni pod „Redovi nisu pročitani“.**
Vidi tabelu u [Uvoz geodetskih tačaka](topic:import-points#rows-that-are-not-read).

**Moje stare tačke su nestale.**
Uvoz datoteke s tačkama zamjenjuje sve tačke i briše poništavanje. Otvori sačuvani projekat da ih vratiš.

## Površina

**"Površina: Nije izgrađena" s crvenim okvirom.**
Okvir kaže zašto: "Površina treba najmanje tri tačke s kotama.", "Tačke su sve na jednoj liniji: nema trouglova.", "Nema tačaka s kotama.", "Granica se ne poklapa s tačkama." ili "Unutar granice nije ostao nijedan trougao." Provjeri redoslijed kolona, grupe tačaka (jesu li {{ui:Izostavljeno}}?) i granicu.

**Izohipse sijeku preko jarka ili grebena.**
Ta linija nije prelomna linija. Postavi njenu grupu na {{ui:Prelomna linija}}, ili je nacrtaj alatom {{ui:Prelomna linija}}. Vidi [Izgradi i doradi površinu](topic:build-surface).

**Grupa prelomne linije crta cik-cak.**
Grupa sadrži više od jedne linije, ili njene tačke nisu numerisane duž linije. Vrati grupu na {{ui:Tačke}} i nacrtaj svaku liniju alatom {{ui:Prelomna linija}}.

**Dugi tanki trouglovi duž spoljne strane.**
Nacrtaj granicu ({{key:O}}) ili postavi **Najduža vanjska ivica**.

**Nema izohipsi, iako je površina izgrađena.**
Ili je {{ui:Izohipse}} isključeno pod **Prikaz**, ili je razmak toliko mali da bi bilo više od 2.000 nivoa izohipsi. Izaberi veći razmak.

**Prelomne linije ili granica ništa ne mijenjaju.**
Površina je došla iz LandXML-a („Površina (iz LandXML-a)“). Koristi se onakva kakva je. Klikni {{ui:Ponovo izgradi površinu iz tačaka}} da se izgradi iz tačaka.

**"Površine još nema: prvo otvori geodetske tačke."**
Prelomnoj liniji, granici i platou treba postojeća površina terena. Prvo uvezi tačke.

**"Klikni geodetsku tačku s kotom: prelomna linija preuzima kote tačaka."**
Alat {{ui:Prelomna linija}} bira samo geodetske tačke. Uvećaj i klikni na tačku (narandžasti kvadrat pokazuje onu koju će uzeti).

## Crtanje

**Moja posljednja tačka je nestala kad sam dvaput kliknuo da završim.**
U ovoj verziji dvostruki klik završava osu trase, plato, prelomnu liniju ili granicu, ali odbacuje tačku na koju si dvaput kliknuo. Klikni posljednju tačku jednom i pritisni {{key:Enter}}. Ako se već desilo, koristi {{key:Mod+Z}}, pa ponovo nacrtaj.

**Ne mogu završiti crtež na tabletu.**
Završavanje treba {{key:Enter}}; još nema dugmeta na ekranu. Priključi tastaturu. Vidi [Miš, touchpad i dodir](topic:keyboard#mouse-trackpad-and-touch).

**Prevlačenje za postavljanje tačke pomjera pogled.**
Prevlačenje duže od nekoliko piksela pomjera plan u svakom alatu. Klikni bez pomjeranja.

**"Osa trase treba najmanje dvije tačke." / "Plato treba najmanje tri ugla." / "Dionica cijevi treba najmanje dva objekta."**
Pritisnuo si {{key:Enter}} prerano. Crtež se odbacuje; počni ponovo.

**Tipke poput A ili G ne rade ništa.**
Tekstualni okvir ili lista u panelu još ima fokus, pa slova idu u njega. Klikni jednom na plan, pa pritisni tipku. Na Macu je tipka za brisanje Backspace za pregledač: za brisanje odabira koristi Fn i delete.

## Osi trase i profili

**"Krivine u PI 2 i PI 3 se preklapaju: … Koristi manje poluprečnike."**
Dvije krivine trebaju više tangente nego što ima između njihovih PI. Smanji jedan ili oba poluprečnika u tabeli PI, ili razmakni PI.

**"PI 3 se vraća unazad; ne može primiti krivinu."**
Osa trase se u tom PI vraća sama na sebe. Pomjeri ili ukloni PI.

**"Ova osa trase nema tlo ispod sebe odakle bi počela."**
Osa je van površine. Pomjeri je na površinu, ili dodaj PVI klikom uz uključeno {{ui:Dodaj PVI}}.

**"Vertikalna krivina u PVI 3 (L = …) počinje prije krivine ili PVI prije nje završava." / "… prelazi preko sljedećeg PVI."**
Skrati dužinu krivine ili razmakni PVI.

**"Već postoji PVI u …"**
PVI postoji na toj stacionaži. Klikni drugdje, ili prevuci postojeći.

**Prikaz profila je prazan: "Nacrtaj osu trase da vidiš njen profil."**
Nema ose trase, ili odabrana ima greške.

## Koridori i platoi

**"Koridor treba projektovani profil bez grešaka."**
Započni projektovani profil ({{ui:Počni od terena}}) i popravi preklapanja krivina.

**"… bočni nagibi izlaze s površine prije nego što dostignu teren." / "… linije nagiba izlaze s površine prije nego što je dostignu …"**
Nivelacija dolazi do ivice površine prije nego što dostigne teren. Pomjeri projekat od ivice prema unutra, ili ga približi terenu. Novi plato nacrtan djelimično van površine može početi na koti 0: upiši stvarnu kotu.

**"Linije dnevnog svjetla koridora se sijeku …" / "Linija dnevnog svjetla siječe samu sebe …"**
Nagibi sa različitih strana se sudaraju: uske krivine, uski platoi, duboki usjeci ili visoki nasipi. Koristi veći poluprečnik, uži sklop, širi plato ili strmije nagibe.

**"Još nema zapremina: plato treba nivelisati bez problema."**
Popravi probleme navedene u crvenom okviru iznad.

**{{ui:Projektovano (nivelisano)}} je zasivljeno.**
Nijedan plato ili koridor još nije nivelisan.

## Cijevi

**"P2 još nema dna."**
Klikni {{ui:Postavi dna iz pravila}} ili upiši dna.

**"P1: nema terena kod S1 odakle bi počeo."**
Uzvodna konstrukcija je van površine i nema obod. Upiši obod za nju.

**Svaka cijev je označena nakon što sam pomjerio konstrukciju.**
Pomjeranje konstrukcije ne mijenja dna. Klikni {{ui:Postavi sva dna iz pravila}}.

Sve poruke mreže objašnjene su u [Postavljanje mreže gravitacionih cijevi](topic:pipe-network#read-and-fix-problems).

## Čuvanje i izvoz

**"Još nema šta izvesti." / "Još nema šta iscrtati."**
Projekat je prazan. Prvo uvezi tačke.

**Ne mogu pronaći sačuvanu datoteku.**
Nalazi se u preuzimanjima pregledača (obično u fascikli Downloads). Vidi [Datoteke koje možeš otvoriti, sačuvati i izvesti](topic:files#where-the-files-go).

**Razmjera PDF-a na papiru je pogrešna.**
Štampaj na 100% ili stvarnoj veličini, a ne na „prilagodi stranici“.

**Upitnici u tekstu PDF-a.**
Nazivi ili opisi koriste znakove izvan zapadnoevropskog skupa. Poruka o statusu ih broji. Preimenuj ih običnim znakovima.

**Iscrtavanje je odsječeno na ivicama.**
Razmjera je prevelika za list. Odaberi razmjeru označenu kao „(stane)“, veći list, ili {{ui:Što je na ekranu}}.

**{{key:Mod+P}} je otvorio dijalog za štampanje pregledača.**
Stranica nije imala fokus. Zatvori dijalog, klikni na plan i ponovo pritisni {{key:Mod+P}}, ili klikni {{ui:PDF}}.

## Sama aplikacija

**Ekran je prazan ili traka s alatima ne radi ništa.**
Koristi aktuelnu verziju Chromea, Edgea, Firefoxa ili Safarija, i osvježi stranicu. Vidi [Pregledači](common:browsers).

**Aplikacija je spora s velikom datotekom s tačkama.**
Isključi {{ui:Trouglovi}}, {{ui:Oznake tačaka}} i {{ui:Pojasi kota}}, i koristi veći razmak izohipsi. Vrlo velike površine trebaju trenutak da se ponovo izgrade nakon svake promjene.

**Pregledač pita „Napustiti stranicu?“**
Projekat ima nesačuvane promjene. Ostani, sačuvaj s {{key:Mod+S}}, pa napusti.
