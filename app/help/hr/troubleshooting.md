---
title: Rješavanje problema
summary: Simptomi, uzroci i rješenja za probleme na koje se nailazi u programu CivilCraft, uz točne poruke koje aplikacija prikazuje.
keywords: problemi, pogreške, ne radi, popravak, pomoć, poruke, rješavanje problema, odbijeno, nedostaje, pogrešno, zamijenjeno, nedostaju izohipse
from: a9f7dedc
---

Poruke se pojavljuju u statusnoj traci u donjem desnom kutu, u okvirima na lijevoj i desnoj ploči te u dijaloškim okvirima. Ovdje su navedene onako kako ih aplikacija prikazuje.

## Otvaranje datoteka

**„Ta datoteka je veća od 200 MB; CivilCraft još ne otvara datoteke ove veličine.“**
Podijelite datoteku točaka ili smanjite broj podataka prije otvaranja.

**„Nije moguće otvoriti site.json: Ovo nije datoteka projekta programa CivilCraft.“**
Datoteka završava s `.json` ili počinje s `{`, ali nije projekt programa CivilCraft. Datoteke točaka ne smiju počinjati s `{`.

**„Nije moguće otvoriti … Ova datoteka projekta potječe iz novije verzije programa CivilCraft (verzija 2).“**
Projekt je spremljen novijom verzijom. Otvorite ga u njoj ili iz njega izvezite LandXML.

**„Nije moguće otvoriti … Ovo je XML, ali ne LandXML (korijenski element je <…>).“**
Datoteka je drugi tip XML-a. Izvezite LandXML iz drugog programa.

**„… nema točaka, TIN tereni ni osi koje CivilCraft može pročitati.“**
Sve u datoteci CivilCraft preskače (na primjer samo mrežaste terene ili samo spiralne osi). Ostatak poruke kaže što je u datoteci bilo. Vidi [LandXML: što se čita i zapisuje](topic:landxml-reference).

**„Uzorak nije moguće učitati: …“**
{{ui:Otvori primjer lokacije}} čita datoteku s web-stranice CadCraft. Bez veze radi samo ako je CivilCraft spremljen za offline korištenje (gumb na traci aplikacije prikazuje {{ui:Spremno za offline}}). Spojite se na internet, kliknite {{ui:Spremi za offline}} i od tada radi i bez veze. Vidi [Offline](common:offline).

**{{ui:Spremi za offline}} prikazuje {{ui:Spremanje nije uspjelo}}.**
Neke datoteke nisu preuzete. Provjerite vezu i ponovno kliknite gumb.

**{{ui:Spremi za offline}} prikazuje {{ui:Offline nije dostupan}}.**
Ovaj prozor preglednika ne može zadržati kopiju za offline, obično zato što je privatni prozor ili je računalo pod upravljanjem. Otvorite CivilCraft u običnom prozoru.

**Offline, aplikacija se uopće ne otvara.**
Nije spremljena za offline korištenje u ovom pregledniku ili je preglednik obrisao podatke web-stranice (Safari to radi za stranice koje nisu posjećene nekoliko tjedana). Spojite se na internet, otvorite CivilCraft i kliknite {{ui:Spremi za offline}}.

**Kopija za offline je starija verzija.**
Kliknite {{ui:Spremno za offline}}, zatim {{ui:Spremi ponovno (preuzmi najnoviju verziju)}} dok ste na internetu.

**Datoteka je zasivljena u okviru za otvaranje.**
Okvir navodi samo datoteke točaka, LandXML i datoteke projekta prema nastavku. Umjesto toga povucite datoteku na plan ili je preimenujte u `.txt`.

## Uvoz točaka

**„Iz ove datoteke nije bilo moguće pročitati točke.“**
Ručno odaberite redoslijed stupaca u **Stupci**. Ako ništa ne pomaže, otvorite datoteku u uređivaču teksta i provjerite ima li svaki redak jednu točku s brojevima.

**Lokacija izgleda zrcaljena, zakrenuta ili razvučena u liniju.**
Sjever i istok su zamijenjeni. Sažetak je rekao „pogođeno prema broju stupaca“. Odaberite PENZD umjesto PNEZD (ili obrnuto) u **Stupci** ili ponovno uvezite.

**Točke daleko od ostalih, a plan je umanjen na točku.**
Redak ima pogrešku u koordinati ili datoteka miješa koordinatne sustave. Pronađite točku (kliknite je da vidite njezin broj) i ispravite datoteku.

**Retci navedeni pod „Retci nisu pročitani“.**
Vidi tablicu u [Uvoz geodetskih točaka](topic:import-points#rows-that-are-not-read).

**Nestale su moje stare točke.**
Uvoz datoteke točaka zamjenjuje sve točke i briše poništavanje. Otvorite spremljeni projekt da ih vratite.

## Teren

**„Teren: Nije izrađeno“ s crvenim okvirom.**
Okvir kaže zašto: „Teren treba barem tri točke s kotama.“, „Sve točke su na jednoj liniji: nema trokuta.“, „Nema točaka s kotama.“, „Granica se ne preklapa s točkama.“ ili „Unutar granice nema trokuta.“ Provjerite redoslijed stupaca, skupine točaka (jesu li **{{ui:Izostavljeno}}?**) i granicu.

**Izohipse prelaze ravno preko jarka ili grebena.**
Ta linija nije prijelomnica. Postavite njezinu skupinu na {{ui:Prijelomnica}} ili je nacrtajte alatom {{ui:Prijelomnica}}. Vidi [Izrada i doradba terena](topic:build-surface).

**Skupina prijelomnica crta cik-cak.**
Skupina sadrži više linija ili njezine točke nisu numerirane duž linije. Vratite skupinu na {{ui:Točke}} i nacrtajte svaku liniju alatom {{ui:Prijelomnica}}.

**Dugi tanki trokuti uz vanjski rub.**
Nacrtajte granicu ({{key:O}}) ili postavite **Najdulji vanjski brid**.

**Nema izohipsi, iako je teren izrađen.**
Ili je {{ui:Izohipse}} isključeno pod **Prikaz**, ili je razmak toliko malen da bi bilo više od 2,000 razina izohipsi. Odaberite veći razmak.

**Prijelomnice ili granica ništa ne mijenjaju.**
Teren je došao iz LandXML-a („Teren (iz LandXML-a)“). Koristi se kakav jest. Kliknite {{ui:Ponovno izradi teren iz točaka}} da umjesto toga izradite teren iz točaka.

**„Teren još ne postoji: prvo otvorite točke.“**
Za prijelomnicu, granicu i platou potreban je postojeći teren. Prvo uvezite točke.

**„Kliknite geodetsku točku s kotom: prijelomnica preuzima kote točaka.“**
Alat {{ui:Prijelomnica}} bira samo geodetske točke. Uvećajte prikaz i kliknite točku (narančasti kvadrat pokazuje onu koju će uzeti).

## Crtanje

**Moja zadnja točka nestala je kad sam dvaput kliknuo za završetak.**
U ovoj verziji dvostruki klik završava os, plato, prijelomnicu ili granicu, ali ispušta točku na koju ste dvaput kliknuli. Jednom kliknite zadnju točku i pritisnite {{key:Enter}}. Ako se to već dogodilo, upotrijebite {{key:Mod+Z}}, pa ponovno nacrtajte.

**Na tabletu ne mogu završiti crtež.**
Završetak zahtijeva {{key:Enter}}; gumb na zaslonu još ne postoji. Priključite tipkovnicu. Vidi [Miš, dodirna ploča i dodir](topic:keyboard#mouse-trackpad-and-touch).

**Povlačenje za postavljanje točke umjesto toga pomiče prikaz.**
Povlačenje za više od nekoliko piksela pomiče plan u svakom alatu. Kliknite bez pomicanja.

**„Os treba barem dvije točke.“ / „Platou treba barem tri kuta.“ / „Dionica cijevi treba barem dvije građevine.“**
Prerano ste pritisnuli {{key:Enter}}. Crtež je odbačen; počnite ponovno.

**Tipke poput A ili G ne rade ništa.**
Tekstni okvir ili popis na ploči još ima fokus, pa slova idu u njega. Jednom kliknite plan, zatim pritisnite tipku. Na Macu tipka za brisanje u pregledniku djeluje kao Backspace: za brisanje odabira upotrijebite Fn i Delete.

## Osi i profili

**„Krivulje na PI 2 i PI 3 se preklapaju: … Upotrijebite manje radijuse.“**
Dvjema krivuljama treba više tangente nego što ima između njihovih PI točaka. Smanjite jedan ili oba radijusa u tablici PI ili razmaknite PI točke.

**„PI 3 se vraća ravno unatrag; na njemu nije moguća krivulja.“**
Os se na toj PI točki vraća sama na sebe. Pomaknite ili uklonite PI.

**„Ispod ove osi nema terena od kojeg bi počela.“**
Os je izvan terena. Pomaknite je na teren ili dodajte PVI klikom dok je {{ui:Dodaj PVI}} uključeno.

**„Vertikalna krivulja na PVI 3 (L = …) počinje prije nego što završi prethodna krivulja ili PVI.“ / „… prelazi preko sljedećeg PVI-ja.“**
Skratite duljinu krivulje ili razmaknite PVI-jeve.

**„Na … već postoji PVI.“**
Na toj stacionaži već postoji PVI. Kliknite drugdje ili povucite postojeći.

**Prikaz profila je prazan: „Nacrtajte os da vidite njezin profil.“**
Nema osi ili odabrana os ima pogreške.

## Koridori i platoi

**„Koridor treba projektni profil bez pogrešaka.“**
Započnite projektni profil ({{ui:Započni od terena}}) i ispravite preklapanja krivulja.

**„… bočni pokosi izlaze iz terena prije nego što dosegnu postojeći teren.“ / „… linije pokosa izlaze iz terena prije nego što ga dosegnu …“**
Planiranje dosegne rub terena prije nego što dosegne postojeći teren. Pomaknite projekt od ruba prema unutra ili ga približite postojećem terenu. Novi plato nacrtan djelomično izvan terena može početi na koti 0: upišite stvarnu kotu.

**„Linije nožice pokosa koridora sijeku se …“ / „Linija nožice pokosa siječe samu sebe …“**
Pokosi s različitih strana sudaraju se: uske krivulje, uski platoi, duboki iskopi ili visoki nasipi. Upotrijebite veći radijus, uži sklop poprečnog presjeka, širi plato ili strmije pokose.

**„Još nema volumena: plato se mora planirati bez problema.“**
Ispravite probleme navedene u crvenom okviru iznad.

**{{ui:Projektirano (planirano)}} je zasivljeno.**
Još nijedan plato ni koridor nije isplaniran.

## Cijevi

**„P2 još nema dna cijevi.“**
Kliknite {{ui:Postavi njezina dna prema pravilima}} ili upišite dna cijevi.

**„P1: na S1 nema terena od kojeg bi se krenulo.“**
Uzvodna građevina je izvan terena i nema ruba. Upišite za nju rub.

**Nakon pomicanja građevine označena je svaka cijev.**
Pomicanje građevine ne mijenja dna cijevi. Kliknite {{ui:Postavi svako dno cijevi prema pravilima}}.

Sve poruke mreže objašnjene su u [Projektiranje gravitacijske mreže cijevi](topic:pipe-network#read-and-fix-problems).

## Spremanje i izvoz

**„Još nema što izvesti.“ / „Još nema što plotati.“**
Projekt je prazan. Prvo uvezite točke.

**Ne mogu pronaći spremljenu datoteku.**
Nalazi se u preuzimanjima preglednika (obično u mapi Preuzimanja). Vidi [Datoteke koje možete otvoriti, spremiti i izvesti](topic:files#where-the-files-go).

**Mjerilo PDF-a na papiru je pogrešno.**
Ispišite na 100% ili stvarnoj veličini, a ne „Prilagodi stranici“.

**Znakovi pitanja u tekstu PDF-a.**
Nazivi ili opisi koriste znakove izvan zapadnoeuropskog skupa. Statusna poruka ih broji. Preimenujte ih običnim znakovima.

**Ispis je odrezan na rubovima.**
Mjerilo je preveliko za list. Odaberite mjerilo označeno „(stane)“, veći list ili {{ui:Ono što je na zaslonu}}.

**{{key:Mod+P}} otvorio je dijaloški okvir za ispis preglednika.**
Stranica nije imala fokus. Zatvorite dijaloški okvir, kliknite plan i ponovno pritisnite {{key:Mod+P}}, ili kliknite {{ui:PDF}}.

## Sama aplikacija

**Zaslon je prazan ili alatna traka ne radi ništa.**
Upotrijebite noviju verziju preglednika Chrome, Edge, Firefox ili Safari i osvježite stranicu. Vidi [Preglednici](common:browsers).

**Aplikacija je spora s velikom datotekom točaka.**
Isključite {{ui:Trokuti}}, {{ui:Oznake točaka}} i {{ui:Visinski pojasevi}} te upotrijebite veći razmak izohipsi. Vrlo veliki tereni trebaju trenutak da se ponovno izrade nakon svake promjene.

**Preglednik pita „Napustiti stranicu?“**
Projekt ima nespremljene promjene. Ostanite, spremite pomoću {{key:Mod+S}}, zatim izađite.
