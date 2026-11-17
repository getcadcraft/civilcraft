---
title: Vodovodne mreže: tlakovi, protoci i protupožarni protok
summary: Nacrtajte mrežu tlaka od čvorova, rezervoara, spremnika, cijevi, crpki i redukcijskih ventila na planu; CivilCraft izračunava visine, tlakove i protoke (Hazen–Williams, prstenaste mreže), protok dostupan za požar i dan potrošnje. Laboratorijska značajka; svaki rezultat treba provjeru inženjera.
keywords: voda, vodovodna mreža, distribucija vode, mreža tlaka, cijev pod tlakom, prstenasta mreža, Hazen-Williams, C faktor, gubitak visine, preostali tlak, protupožarni protok, hidrant, potrošnja, čvor, rezervoar, spremnik, crpka, krivulja crpke, redukcijski ventil, PRV, nepovratni ventil, produženo razdoblje, epanet, inp, brzina
from: df46bf6d
---

Vodovodne mreže su tlačna strana lokacije: cijevi koje su uvijek pune, a vodu tjera rezervoar, spremnik ili crpka. CivilCraft izračunava visinu i tlak na svakom čvoru te protok u svakoj cijevi, uključujući prstenaste mreže u kojima voda ima više od jednog puta. Značajka je u laboratoriju dok se provjerava.

**Samo pomoćno sredstvo za izračun.** Svaki broj treba provjeru ovlaštenog inženjera: odgovor je dobar koliko i potrošnja, kote, dimenzije cijevi i vrijednosti hrapavosti koje ste unijeli, a model stacionarnog stanja ne zna ništa o vodnom udaru, kakvoći vode ili stvarnom ponašanju protupožarne crpke.

## Nacrtajte mrežu

1. Pod **Teren** › {{ui:Više}} odaberite {{ui:Vodovodne mreže…}}. Prozor ostaje otvoren dok radite na planu.
2. Odaberite {{ui:Rezervoar}} i kliknite plan gdje je opskrba. Njegova visina počinje 100 ft (30 m) iznad terena; promijenite je u Svojstvima.
3. Odaberite {{ui:Čvor}} i kliknite svako mjesto gdje se voda uzima ili se cijevi spajaju. Čvor preuzima kotu od terena; upišite drugu u Svojstvima da je zamijenite.
4. Odaberite {{ui:Cijev}}, kliknite čvor, zatim čvor s kojim se spaja. Alat ostaje uključen za sljedeću cijev. {{ui:Crpka}} i {{ui:Redukcijski ventil}} crtaju se na isti način, od čvora na usisu (ili uzvodno) do čvora na tlačnoj strani (ili nizvodno). {{ui:Spremnik}} se postavlja kao čvor.
5. Odaberite čvor i upišite njegovu {{ui:Potrošnju}} (gpm, ili L/s u projektu u metrima). Odaberite cijev i postavite njezin {{ui:Promjer}} (in, ili mm) i, ako ga znate, njezin Hazen–Williams C.

Svaka promjena je jedan korak poništavanja. Tipka Delete uklanja čvor i cijevi koje na njemu završavaju.

## Što znači svaki dio

- **Cijev.** Duljina se mjeri duž plana osim ako je ne upišete. C je Hazen–Williams hrapavost (na početku 130, zadanu vrijednost promijenite u prozoru). Koeficijent lokalnih gubitaka K zbraja gubitke savijanja i spojnih elemenata. Označite **Nepovratni ventil** za cijev koja ne smije voditi vodu unatrag; **Zatvoreno** cijev ne propušta ništa.
- **Rezervoar.** Izvor stalne visine, razina vode koju drži iznad referentne ravnine. Daje ili prima onoliko koliko mreža treba.
- **Spremnik.** Razina koja se mijenja tijekom dana. U stacionarnim rezultatima to je izvor na svojoj trenutnoj razini.
- **Crpka.** Jedna projektna točka (protok i visina) daje uobičajenu krivulju kroz nju: visina pri nultom protoku je 133 % projektne visine, a visina je nula pri dvostrukom projektnom protoku. Crpka nikada ne tjera vodu unatrag.
- **Redukcijski ventil.** Održava tlak koji postavite nizvodno dok je opskrba viša. Kada je opskrba niža, otvoren je i ništa ne održava; ako bi voda tekla unatrag, zatvara se.

## Čitanje rezultata

Prozor prikazuje visinu i tlak svakog čvora te protok, brzinu i gubitak visine po 1,000 ft (ili po km) za svaku vezu, a čvorovi su obojeni na planu: zeleno je između vašeg najnižeg i najvišeg tlaka, crveno ispod, jantarno iznad. Strelice protoka pokazuju smjer. Odaberite čvor ili cijev da pročitate njezine brojeve u Svojstvima.

Ispod tablica nalazi se popis onoga na što treba paziti: nizak ili visok tlak, cijev brža od vaše granice, čvor odsječen od svakog izvora ili rješavač koji se nije ustalio. Isti nalazi su na ploči Problemi. Granice postavite u prozoru (na početku 20 psi, 100 psi i 10 ft/s; 140 kPa, 700 kPa i 3 m/s u projektu u metrima).

## Protupožarni protok

{{ui:Protupožarni protok…}} zadaje protok na jednom čvoru i prikazuje tlak tamo i najniži tlak bilo gdje u mreži. Također pronalazi protok dostupan na tom čvoru dok najslabiji čvor u mreži održava preostali tlak koji zadate. Ostale potrošnje ostaju kakve jesu.

## Dan potrošnje

{{ui:Dan potrošnje…}} pokreće mrežu sat po sat. Zadajte uzorak potrošnje u postavkama datoteke (popis množitelja koji se ponavlja); spremnici se pune i prazne s protokom na ulazu i izlazu, a crpka može pratiti uzorak uklj./isklj. Spremnik koji dosegne svoju najvišu ili najnižu razinu navodi se na popisu: CivilCraft za vas ne zatvara njegov ulaz ili izlaz, pa to čitajte kao „ovaj spremnik je premalen ili je crpka prevelika“.

## Tekst EPANET

{{ui:Spremi kao EPANET tekst (.inp)}} zapisuje mrežu u tekstualnom formatu koji čita mnogo programa za vodu, a {{ui:Otvori EPANET tekst (.inp)…}} čita jedan takav. Prenosi se samo ono što CivilCraft modelira: čvorovi, rezervoari, spremnici, cijevi, crpke s krivuljom visine, redukcijski ventili, uzorci potrošnje i vremena. Ostale vrste ventila, crpke zadane snagom i druge formule gubitka visine navode se i izostavljaju. Datoteka mora koristiti iste jedinice kao projekt.

## Hidranti, ventili i spojni elementi

Odaberite čvor i označite **Hidrant** da ga postavite tamo; odaberite glavni vod i pritisnite **Dodaj na sredini** da na njemu postavite ventil, zračni ventil, ispust ili brojilo. To su objekti mreže: pomiču se s njom, a jedan korak poništavanja ih uklanja.

Raspored također podrazumijeva spojne elemente, a CivilCraft ih navodi bez traženja: **T-komad** gdje se spajaju tri voda, **križ** gdje se spajaju četiri, **koljeno** (s kutom) gdje dva voda skreću za 5° ili više, **redukcija** gdje se spajaju dvije dimenzije i **čep** na slijepom kraju. {{ui:Specifikacija spojnih elemenata (CSV)}} ih broji, kao i vodove po dimenziji. To je ono što raspored podrazumijeva, predmjer za provjeru prema vlastitim detaljima, a ne popis za naručivanje.

Vodovi se polažu na teren umanjen za pokrov (4 ft ili 1.2 m) kako bi se mogli crtati i modelirati u 3D; tlakovi iznad nikada o tome ne ovise.

## Na planu i u datotekama

Plan, PDF i DWG ili DXF nose vodove na **C-WATR-MAIN** s njihovim dimenzijama na **C-WATR-TEXT**, hidrante na **C-WATR-HYDR**, ventile na **C-WATR-VALV** i spojne elemente na **C-WATR-FITT**. Izvoz u LandXML zapisuje vodovodnu mrežu cijevi (građevina za svaki čvor, cijev za svaki vod, imenovani hidranti); uvoz iz LandXML-a čita je natrag kao vodovodne mreže, bez potrošnji, crpki i ventila, koje LandXML ne nosi. IFC izvoz zapisuje vodove kao segmente cijevi, hidrante, ventile i spojne elemente u jednom vodovodnom sustavu. Ove datoteke provjerene su našim vlastitim čitačima i pisačima; isprobajte ih u drugim programima i javite nam što kažu.

## Što još nije dostupno

Kakvoća i starost vode, upravljanje i pravila izvan uklj./isklj. uzorka crpke, ostale vrste ventila, potrošnja prema tlaku, cijevi s promjenjivim promjerom i tokovi kanalizacije tijekom vremena. Vidi [Još nije izrađeno](topic:not-built-yet). Projektni sanitarni protoci, koji su drugačiji izračun, nalaze se u [Projektni sanitarni protoci](topic:sanitary-design).
