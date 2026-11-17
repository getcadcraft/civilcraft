---
title: Rešavanje problema
summary: Simptomi, uzroci i rešenja za probleme na koje se nailazi u CivilCraft-u, sa tačnim porukama koje aplikacija prikazuje.
keywords: problemi, greške, ne radi, rešenje, pomoć, poruke, rešavanje problema, odbijeno, nedostaje, pogrešno, zamenjeno, izohipse nedostaju
from: a9f7dedc
---

Poruke se pojavljuju u statusnoj traci dole desno, u okvirima u levom i desnom panelu i u dijalozima. Ovde su navedene onako kako ih aplikacija prikazuje.

## Otvaranje datoteka

**„Ova datoteka je veća od 200 MB; CivilCraft još ne otvara datoteke tolike veličine.“**
Podelite datoteku tačaka ili proredite podatke pre otvaranja.

**„Nije moguće otvoriti site.json: Ovo nije datoteka CivilCraft projekta.“**
Datoteka se završava sa `.json` ili počinje sa `{`, ali nije CivilCraft projekat. Datoteke tačaka ne smeju da počinju sa `{`.

**„Nije moguće otvoriti … Ova datoteka projekta je iz novije verzije CivilCraft-a (verzija 2).“**
Projekat je sačuvala novija verzija. Otvorite ga tamo ili izvezite LandXML iz njega.

**„Nije moguće otvoriti … Ovo je XML, ali nije LandXML (korenski element je <…>).“**
Datoteka je druga vrsta XML-a. Izvezite LandXML iz drugog programa.

**„… nema tačaka, TIN površi ni osovina trase koje CivilCraft može da pročita.“**
Sve u datoteci je nešto što CivilCraft preskače (na primer samo mrežaste površi ili samo spiralne osovine trase). Ostatak poruke kaže šta je bilo. Pogledajte [LandXML: šta se čita i piše](topic:landxml-reference).

**„Primer nije mogao da se učita: …“**
{{ui:Otvori primer lokacije}} čita datoteku sa sajta CadCraft. Bez veze radi samo ako je CivilCraft sačuvan za rad van mreže (dugme u traci aplikacije pokazuje {{ui:Spremno za rad van mreže}}). Pređite na mrežu, kliknite {{ui:Sačuvaj za rad van mreže}} i od tada radi van mreže. Pogledajte [Rad van mreže](common:offline).

**{{ui:Sačuvaj za rad van mreže}} prikazuje {{ui:Nije moguće sačuvati}}.**
Neke datoteke nisu preuzete. Proverite vezu i ponovo kliknite dugme.

**{{ui:Sačuvaj za rad van mreže}} prikazuje {{ui:Rad van mreže nije dostupan}}.**
Ovaj prozor pregledača ne može da čuva kopiju za rad van mreže, obično zato što je privatan prozor ili je računar pod nadzorom. Otvorite CivilCraft u običnom prozoru.

**Van mreže aplikacija se uopšte ne otvara.**
Nije sačuvana za rad van mreže u ovom pregledaču, ili je pregledač obrisao podatke sajta (Safari to radi za sajtove koji nisu posećivani nekoliko nedelja). Pređite na mrežu, otvorite CivilCraft i kliknite {{ui:Sačuvaj za rad van mreže}}.

**Kopija za rad van mreže je starija verzija.**
Kliknite {{ui:Spremno za rad van mreže}}, pa {{ui:Sačuvaj ponovo (preuzmi najnoviju verziju)}} dok ste na mreži.

**Datoteka je zasivljena u prozoru za otvaranje.**
Prozor prikazuje samo datoteke tačaka, LandXML i projekata prema nastavcima. Prevucite datoteku na plan, ili je preimenujte u `.txt`.

## Uvoz tačaka

**„Iz ove datoteke nije moguće pročitati nijednu tačku.“**
Ručno izaberite redosled kolona u **Kolone**. Ako ništa ne radi, otvorite datoteku u uređivaču teksta i proverite da je jedna tačka po redu i da ima brojeve.

**Lokacija izgleda ogledalski preslikano, zarotirano ili razvučeno u liniju.**
Sever i istok su zamenjeni. Rezime je rekao „pretpostavljeno prema broju kolona“. Izaberite PENZD umesto PNEZD (ili obrnuto) u **Kolone**, ili ponovo uvezite.

**Tačke su daleko od ostalih, a plan je umanjen do tačke.**
Red ima grešku u kucanju u koordinati, ili datoteka meša koordinatne sisteme. Pronađite tačku (kliknite je da vidite broj) i ispravite datoteku.

**Redovi navedeni pod „Redovi nisu pročitani“.**
Pogledajte tabelu u [Uvoz geodetskih tačaka](topic:import-points#rows-that-are-not-read).

**Stare tačke su nestale.**
Uvoz datoteke tačaka zamenjuje sve tačke i briše opozivanje. Otvorite sačuvani projekat da ih vratite.

## Površ

**„Površ: nije izgrađena“ sa crvenim okvirom.**
Okvir kaže zašto: „Površ je potrebna bar tri tačke sa kotama.“, „Sve tačke su na jednoj liniji: nema trouglova.“, „Nema tačaka sa kotama.“, „Granica se ne preklapa sa tačkama.“ ili „Unutar granice nema preostalih trouglova.“ Proverite redosled kolona, grupe tačaka (da li su {{ui:Izostavljeno}}?) i granicu.

**Izohipse seku ravno preko jarka ili grebena.**
Ta linija nije linija loma. Postavite njenu grupu na {{ui:Linija loma}} ili je nacrtajte alatom {{ui:Linija loma}}. Pogledajte [Izgradnja i doterivanje površi](topic:build-surface).

**Grupa linija loma crta cik-cak.**
Grupa sadrži više linija, ili tačke nisu numerisane duž linije. Vratite grupu na {{ui:Tačke}} i nacrtajte svaku liniju alatom {{ui:Linija loma}}.

**Dugi tanki trouglovi duž spoljne ivice.**
Nacrtajte granicu ({{key:O}}) ili postavite **Najduža spoljna ivica**.

**Nema izohipsi uopšte, iako je površ izgrađena.**
Ili je {{ui:Izohipse}} isključeno pod **Prikaz**, ili je interval toliko mali da bi bilo više od 2.000 nivoa izohipsi. Izaberite veći interval.

**Linije loma ili granica ne menjaju ništa.**
Površ je došla iz LandXML-a („Površ (iz LandXML-a)“). Koristi se onakva kakva jeste. Kliknite {{ui:Ponovo izgradi površinu iz tačaka}} da je umesto toga izgradite iz tačaka.

**„Još nema površi: prvo otvorite geodetske tačke.“**
Linija loma, granica i plato zahtevaju postojeću površ terena. Prvo uvezite tačke.

**„Kliknite geodetsku tačku sa kotom: linija loma preuzima kote tačaka.“**
Alat {{ui:Linija loma}} bira samo geodetske tačke. Uvećajte i kliknite na tačku (narandžasti kvadrat pokazuje tačku koju će uzeti).

## Crtanje

**Moja poslednja tačka je nestala kada sam duplo kliknuo da završim.**
U ovoj verziji duplim klikom se završavaju osovina trase, plato, linija loma ili granica, ali se tačka na koju ste duplo kliknuli ispušta. Kliknite poslednju tačku jednom i pritisnite {{key:Enter}}. Ako se to već desilo, koristite {{key:Mod+Z}}, pa ponovo nacrtajte.

**Ne mogu da završim crtež na tabletu.**
Završavanje zahteva {{key:Enter}}; dugme na ekranu još nema. Priključite tastaturu. Pogledajte [Miš, touchpad i dodir](topic:keyboard#mouse-trackpad-and-touch).

**Prevlačenje radi pomeranje umesto postavljanja tačke.**
Prevlačenje preko nekoliko piksela pomera plan u svakom alatu. Kliknite bez pomeranja.

**„Osovina trase treba da ima bar dve tačke.“ / „Plato treba da ima bar tri ugla.“ / „Deonica cevi treba da ima bar dva objekta.“**
Prerano ste pritisnuli {{key:Enter}}. Crtež je odbačen; počnite ponovo.

**Tasteri poput A ili G ne rade ništa.**
Tekstualno polje ili lista u panelu još ima fokus, pa slova idu tamo. Jednom kliknite plan, pa pritisnite taster. Na Mac-u taster za brisanje pregledaču šalje Backspace: za brisanje izbora koristite Fn i delete.

## Osovine trase i profili

**„Krivine u PI 2 i PI 3 se preklapaju: … Koristite manje poluprečnike.“**
Dve krivine traže više tangente nego što ima između njihovih PI tačaka. Smanjite jedan ili oba poluprečnika u tabeli PI, ili razmaknite PI tačke.

**„PI 3 se vraća pravo nazad; ne može da primi krivinu.“**
Osovina trase se u toj PI tački vraća sama na sebe. Pomerite ili uklonite PI.

**„Ova osovina trase nema teren ispod sebe od kog bi počela.“**
Osovina trase je van površi. Pomerite je na površ ili dodajte PVI klikom dok je {{ui:Dodaj PVI}} uključeno.

**„Vertikalna krivina u PVI 3 (L = …) počinje pre nego što se završi krivina ili PVI pre nje.“ / „… prelazi preko sledećeg PVI.“**
Skratite dužinu krivine ili razmaknite PVI.

**„Već postoji PVI na …“**
Na toj stanici već postoji PVI. Kliknite na drugo mesto ili prevucite postojeći.

**Prikaz profila je prazan: „Nacrtajte osovinu trase da vidite njen profil.“**
Nema osovine trase, ili izabrana ima greške.

## Koridori i platoi

**„Koridor treba projektni profil bez grešaka.“**
Započnite projektni profil ({{ui:Počni od terena}}) i ispravite preklapanja krivina.

**„… bočni nagibi izlaze sa površi pre nego što dodirnu teren.“ / „… linije nagiba izlaze sa površi pre nego što je dodirnu …“**
Nivelacija dođe do ivice površi pre nego što dodirne teren. Pomerite projekat od ivice ka unutra ili ga približite terenu. Novi plato nacrtan delom van površi može da počne na koti 0: unesite stvarnu kotu.

**„Linije preseka sa terenom koridora se ukrštaju …“ / „Linija preseka sa terenom seče samu sebe …“**
Nagibi sa različitih strana se sudaraju: uske krivine, uski platoi, duboki iskopi ili visoki nasipi. Upotrebite veći poluprečnik, uži sklop, širi plato ili strmije nagibe.

**„Još nema zapremina: plato mora da prođe nivelaciju bez problema.“**
Ispravite probleme navedene u crvenom okviru iznad.

**{{ui:Predloženo (sa nagibom)}} je zasivljeno.**
Još nijedan plato ili koridor nema nivelaciju.

## Cevi

**„P2 još nema dna.“**
Kliknite {{ui:Postavi njena dna prema pravilima}} ili unesite dna.

**„P1: nema terena kod S1 od kog bi počela.“**
Uzvodni objekat je van površi i nema ivicu. Unesite ivicu za njega.

**Svaka cev je označena posle pomeranja objekta.**
Pomeranje objekta ne menja dna. Kliknite {{ui:Postavi sva dna prema pravilima}}.

Sve poruke mreže objašnjene su u [Projektovanje gravitacione mreže cevi](topic:pipe-network#read-and-fix-problems).

## Čuvanje i izvoz

**„Još nema šta da se izveze.“ / „Još nema šta da se iscrta.“**
Projekat je prazan. Prvo uvezite tačke.

**Ne mogu da nađem sačuvanu datoteku.**
Nalazi se u preuzimanjima pregledača (obično u fascikli Preuzimanja). Pogledajte [Datoteke koje možete da otvorite, sačuvate i izvezete](topic:files#where-the-files-go).

**Razmera PDF-a na papiru nije tačna.**
Štampajte na 100% ili stvarnu veličinu, a ne „uklopi u stranicu“.

**Znaci pitanja u tekstu PDF-a.**
Nazivi ili opisi koriste znakove van zapadnoevropskog skupa. Poruka u statusnoj traci ih broji. Preimenujte ih običnim znacima.

**Crtež je odsečen na ivicama.**
Razmera je prevelika za list. Izaberite razmeru označenu „(uklapa se)“, veći list ili {{ui:Šta je na ekranu}}.

**{{key:Mod+P}} je otvorio dijalog za štampu pregledača.**
Stranica nije imala fokus. Zatvorite dijalog, kliknite plan i ponovo pritisnite {{key:Mod+P}}, ili kliknite {{ui:PDF}}.

## Sama aplikacija

**Ekran je prazan ili traka sa alatkama ne radi ništa.**
Koristite aktuelnu verziju Chrome-a, Edge-a, Firefox-a ili Safari-ja i osvežite stranicu. Pogledajte [Pregledači](common:browsers).

**Aplikacija je spora sa velikom datotekom tačaka.**
Isključite {{ui:Trouglovi}}, {{ui:Oznake tačaka}} i {{ui:Pojasevi kota}} i koristite veći interval izohipsi. Vrlo velike površi se posle svake promene ponovo grade neko vreme.

**Pregledač pita „Napustiti sajt?“**
Projekat ima nesačuvane izmene. Ostanite, sačuvajte sa {{key:Mod+S}}, pa izađite.
