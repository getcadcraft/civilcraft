---
title: Vodovodne mreže: pritisci, protoci i protok za gašenje požara
summary: Nacrtajte mrežu pod pritiskom od čvorova, rezervoara, cisterni, cevi, pumpi i redukcionih ventila pritiska na planu; CivilCraft računa visine, pritiske i protoke (Hazen–Williams, prstenaste mreže), protok dostupan za gašenje požara i dan potrošnje. Laboratorijska funkcija; svaki rezultat zahteva proveru inženjera.
keywords: vodovod, vodovodna mreža, distributivna mreža, mreža pod pritiskom, cev pod pritiskom, prstenasta mreža, hazen-williams, C faktor, gubitak visine, preostali pritisak, protok za gašenje požara, hidrant, potrošnja, čvor, rezervoar, cisterna, pumpa, kriva pumpe, redukcioni ventil pritiska, PRV, nepovratni ventil, produženi period, epanet, inp, brzina
from: df46bf6d
---

Vodovodne mreže su pritisna strana lokacije: cevi koje su uvek pune, sa vodom koju tera rezervoar, cisterna ili pumpa. CivilCraft računa visinu i pritisak u svakom čvoru i protok u svakoj cevi, uključujući prstenaste mreže u kojima voda ima više od jednog puta. Ova funkcija je u laboratoriji dok se proverava.

**Samo pomoćna računica.** Svaki broj zahteva proveru kvalifikovanog inženjera: odgovor je dobar samo koliko su dobre potrošnje, kote, dimenzije cevi i vrednosti hrapavosti koje ste uneli, a stacionarni model ne zna ništa o vodenom udaru, kvalitetu vode ili stvarnom ponašanju protivpožarne pumpe.

## Nacrtajte mrežu

1. Pod **Površ** › {{ui:Više}} izaberite {{ui:Vodovodne mreže…}}. Prozor ostaje otvoren dok radite na planu.
2. Izaberite {{ui:Rezervoar}} i kliknite na plan gde je izvor. Njegova visina počinje 100 ft (30 m) iznad terena; promenite je u Svojstvima.
3. Izaberite {{ui:Čvor}} i kliknite na svako mesto gde se voda uzima ili se cevi spajaju. Čvor preuzima kotu od terena; unesite drugu u Svojstvima da je prepišete.
4. Izaberite {{ui:Cev}}, kliknite čvor, pa čvor koji spaja. Alat ostaje uključen za sledeću cev. {{ui:Pumpa}} i {{ui:Redukcioni ventil pritiska}} crtaju se na isti način, od čvora na usisu (ili uzvodnog) do čvora na potisu (ili nizvodnog). {{ui:Cisterna}} se postavlja kao čvor.
5. Izaberite čvor i unesite njegovu {{ui:Potrošnju}} (gpm, ili L/s u projektu u metrima). Izaberite cev i podesite njen {{ui:Prečnik}} (in, ili mm) i, ako ga znate, njen Hazen–Williams C.

Svaka promena je jedan korak opozivanja. Taster Delete uklanja čvor i cevi koje se u njemu završavaju.

## Šta znači svaki deo

- **Cev.** Dužina se meri duž plana osim ako je ne unesete. C je Hazen–Williams hrapavost (130 za početak; podrazumevanu vrednost menjate u prozoru). Koeficijent lokalnog gubitka K dodaje gubitke krivina i fitinga. Označite **Nepovratni ventil** za cev koja ne sme da vodi vodu unazad; **Zatvorena** cev ne nosi ništa.
- **Rezervoar.** Izvor na stalnoj visini, odnosno nivo vode koji drži iznad referentne ravni. Daje ili uzima koliko mreža treba.
- **Cisterna.** Nivo koji se menja tokom dana. U stacionarnim rezultatima je izvor na svom trenutnom nivou.
- **Pumpa.** Jedna projektna tačka (protok i visina) daje uobičajenu krivu kroz nju: visina pri nultom protoku je 133 % projektne visine, a visina je nula pri dvostrukom projektnom protoku. Pumpa nikada ne tera vodu unazad.
- **Redukcioni ventil pritiska.** Drži pritisak koji podesite nizvodno dok je snabdevanje više. Kada je snabdevanje niže, otvoren je i ništa ne drži; ako bi voda išla unazad, zatvara se.

## Pročitajte rezultate

Prozor prikazuje visinu i pritisak svakog čvora i protok, brzinu i gubitak visine po 1,000 ft (ili po km) za svaku vezu, sa čvorovima obojenim na planu: zeleno je između vašeg najnižeg i najvišeg pritiska, crveno ispod, narandžasto iznad. Strelice protoka pokazuju smer. Izaberite čvor ili cev da pročitate njihove brojeve u Svojstvima.

Ispod tabela je spisak onoga na šta treba obratiti pažnju: nizak ili visok pritisak, cev brža od vaše granice, čvor odsečen od svakog izvora, ili rešavač koji se nije smirio. Iste nalaze imate u panelu Problemi. Granice postavite u prozoru (20 psi, 100 psi i 10 ft/s za početak; 140 kPa, 700 kPa i 3 m/s u projektu u metrima).

## Protok za gašenje požara

{{ui:Protok za gašenje požara…}} crta protok na jednom čvoru i prikazuje pritisak tamo i najniži pritisak bilo gde u mreži. Takođe nalazi protok dostupan na tom čvoru dok najslabiji čvor u mreži zadržava preostali pritisak koji unesete. Ostale potrošnje ostaju kakve jesu.

## Dan potrošnje

{{ui:Dan potrošnje…}} pokreće mrežu sat po sat. Unesite obrazac potrošnje u podešavanjima datoteke (lista množilaca koja se ponavlja); cisterne se pune i prazne sa protokom ulaza i izlaza, a pumpa može da prati obrazac uključeno/isključeno. Cisterna koja dostigne svoj najviši ili najniži nivo imenovana je na listi: CivilCraft ne zatvara njen ulaz ili izlaz umesto vas, pa to čitajte kao „ova cisterna je premala ili je pumpa prevelika“.

## EPANET tekst

{{ui:Sačuvaj kao EPANET tekst (.inp)}} upisuje mrežu u običan tekstualni format koji čitaju mnogi programi za vodu, a {{ui:Otvori EPANET tekst (.inp)…}} čita jedan. Prelazi samo ono što CivilCraft modeluje: čvorove, rezervoare, cisterne, cevi, pumpe sa krivom visine, redukcione ventile pritiska, obrasce potrošnje i vremena. Drugi tipovi ventila, pumpe zadate snagom i druge formule gubitka su navedene i ispuštene. Datoteka mora da koristi iste jedinice kao projekat.

## Hidranti, ventili i fitinzi

Izaberite čvor i označite **Hidrant** da ga postavite tamo; izaberite glavnu cev i pritisnite **Dodaj na sredini** da stavite ventil, vazdušni ventil, ispust ili merač na nju. Oni su objekti mreže: pomeraju se sa njom, a jedan korak opozivanja ih uklanja.

Raspored takođe podrazumeva fitinge, a CivilCraft ih navodi bez traženja: **T-komad** gde se spajaju tri glavne cevi, **krst** gde se spajaju četiri, **koleno** (sa svojim uglom) gde se dve glavne cevi okreću za 5° ili više, **redukcija** gde se spajaju dve veličine i **kapa** na slepom kraju. {{ui:Specifikacija fazonskih komada (CSV)}} ih broji, kao i glavne cevi po veličini. Ovo je ono što raspored podrazumeva, popis za proveru sa vašim sopstvenim detaljima, a ne spisak za naručivanje.

Glavne cevi se polažu na teren umanjen za pokrivenost (4 ft ili 1.2 m) da bi mogle da se nacrtaju i modeluju u 3D; pritisci iznad nikada od toga ne zavise.

## Na planu i u datotekama

Plan, PDF i DWG ili DXF nose glavne cevi na **C-WATR-MAIN**, njihove dimenzije na **C-WATR-TEXT**, hidrante na **C-WATR-HYDR**, ventile na **C-WATR-VALV**, a fitinge na **C-WATR-FITT**. LandXML izvoz upisuje vodovodnu mrežu cevi (objekat za svaki čvor, cev za svaku glavnu cev, hidranti imenovani); LandXML uvoz je čita nazad kao vodovodne mreže bez potrošnji, pumpi ili ventila, koje LandXML ne nosi. IFC izvoz upisuje glavne cevi kao segmente cevi, hidrante, ventile i fitinge u jednom vodovodnom sistemu. Ove datoteke su provereni našim sopstvenim čitačem i pisačima; isprobajte ih u drugim programima i recite nam šta kažu.

## Šta još nije ovde

Kvalitet i starost vode, kontrole i pravila izvan uključivanja i isključivanja pumpe, drugi tipovi ventila, potrošnja zavisna od pritiska, cevi sa promenljivim prečnikom i protoci kanalizacije tokom vremena. Pogledajte [Još nije izgrađeno](topic:not-built-yet). Sanitarni projektni protoci, što je drugi proračun, nalaze se u [Sanitarni projektni protoci](topic:sanitary-design).
