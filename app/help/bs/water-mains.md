---
title: Vodovodne mreže: pritisci, protoci i protok za gašenje požara
summary: Nacrtaj mrežu pod pritiskom od čvorova, rezervoara, tankova, cijevi, pumpi i ventila za smanjenje pritiska na planu; CivilCraft računa visine, pritiske i protoke (Hazen–Williams, petljaste mreže), protok dostupan za požar i dan potrošnje. Laboratorijska funkcija; svaki rezultat treba provjeru inženjera.
keywords: voda, vodovodna mreža, distribucija vode, mreža pod pritiskom, cijev pod pritiskom, petljasta mreža, hazen-williams, C faktor, gubitak visine, preostali pritisak, protok za požar, hidrant, potrošnja, čvor, rezervoar, tank, pumpa, kriva pumpe, ventil za smanjenje pritiska, prv, nepovratni ventil, produženi period, epanet, inp, brzina
from: df46bf6d
---

Vodovodne mreže su pritisna strana lokacije: cijevi koje su uvijek pune, a vodu tjera rezervoar, tank ili pumpa. CivilCraft računa visinu i pritisak u svakom čvoru i protok u svakoj cijevi, uključujući petljaste mreže u kojima voda ima više od jednog puta. Dok se provjerava, nalazi se u laboratoriji.

**Samo pomoćno sredstvo za proračun.** Svaki broj treba provjeru ovlaštenog inženjera: odgovor je dobar samo koliko su dobri potrošnja, kote, prečnici cijevi i vrijednosti hrapavosti koje si unio, a model stacionarnog stanja ne zna ništa o udaru vode, kvaliteti vode niti o stvarnom ponašanju požarne pumpe.

## Nacrtaj mrežu

1. Pod **Površina** › {{ui:Više}}, izaberi {{ui:Vodovodne mreže…}}. Prozor ostaje otvoren dok radiš na planu.
2. Izaberi {{ui:Rezervoar}} i klikni na plan gdje je izvor. Njegova visina počinje 100 ft (30 m) iznad terena; promijeni je u Svojstvima.
3. Izaberi {{ui:Čvor}} i klikni na svako mjesto gdje se voda uzima ili se cijevi sastaju. Čvor preuzima kotu iz terena; upiši drugu u Svojstvima da je zamijeniš.
4. Izaberi {{ui:Cijev}}, klikni čvor, pa čvor s kojim se spaja. Alat ostaje uključen za sljedeću cijev. {{ui:Pumpa}} i {{ui:Ventil za smanjenje pritiska}} crtaju se na isti način, od usisnog (ili uzvodnog) čvora do potisnog (ili nizvodnog) čvora. {{ui:Tank}} se postavlja kao čvor.
5. Odaberi čvor i upiši njegovu {{ui:Potrošnju}} (gpm, ili L/s u projektu u metrima). Odaberi cijev i postavi njen {{ui:Prečnik}} (in, ili mm) i, ako ga znaš, njen Hazen–Williams C.

Svaka promjena je jedan korak poništavanja. Brisanje uklanja čvor i cijevi koje se u njemu završavaju.

## Šta znači svaki dio

- **Cijev.** Dužina se mjeri po planu osim ako je ne upišeš. C je Hazen–Williams hrapavost (130 za početak; standardnu vrijednost mijenjaš u prozoru). Koeficijent lokalnih gubitaka K dodaje gubitke krivina i spojnica. Označi **Nepovratni ventil** za cijev koja ne smije voditi vodu unazad; **Zatvorena** cijev ne nosi ništa.
- **Rezervoar.** Izvor na stalnoj visini, nivo vode koji drži iznad referentne ravni. Daje ili uzima koliko mreža treba.
- **Tank.** Nivo koji se mijenja tokom dana. U stalnim rezultatima je izvor na svom trenutnom nivou.
- **Pumpa.** Jedna projektna tačka (protok i visina) daje uobičajenu krivu kroz nju: visina pri nultom protoku je 133 % projektne visine, a visina je nula pri dvostrukom projektnom protoku. Pumpa nikad ne tjera vodu unazad.
- **Ventil za smanjenje pritiska.** Održava pritisak koji postaviš nizvodno dok je dovod viši. Kad je dovod niži, otvoren je i ništa ne drži; ako bi voda tekla unazad, zatvara se.

## Čitanje rezultata

Prozor prikazuje visinu i pritisak svakog čvora i protok, brzinu i gubitak visine po 1,000 ft (ili po km) za svaku vezu, a čvorovi su obojeni na planu: zeleno je između tvog najnižeg i najvišeg pritiska, crveno ispod, žuto iznad. Strelice protoka pokazuju smjer. Odaberi čvor ili cijev da pročitaš njihove brojeve u Svojstvima.

Ispod tabela je spisak onoga na šta treba paziti: nizak ili visok pritisak, cijev brža od tvoje granice, čvor odsječen od svih izvora, ili rješavač koji se nije smirio. Isti nalazi su u panelu Problemi. Granice postavljaš u prozoru (20 psi, 100 psi i 10 ft/s na početku; 140 kPa, 700 kPa i 3 m/s u projektu u metrima).

## Protok za požar

{{ui:Protok za gašenje požara…}} crta protok u jednom čvoru i prikazuje pritisak tamo i najniži pritisak bilo gdje u mreži. Također nalazi protok dostupan u tom čvoru dok najslabiji čvor u mreži zadržava preostali pritisak koji unese. Ostale potrošnje ostaju kakve jesu.

## Dan potrošnje

{{ui:Dan potrošnje…}} pokreće mrežu sat po sat. Unesi obrazac potrošnje u postavkama datoteke (lista množilaca koja se ponavlja); tankovi se pune i prazne prema protoku unutra i van, a pumpa može pratiti obrazac uključeno/isključeno. Tank koji dostigne svoj najviši ili najniži nivo imenovan je u spisku: CivilCraft ne zatvara njegov ulaz ili izlaz umjesto tebe, pa to čitaj kao „ovaj tank je premali ili je pumpa prevelika“.

## EPANET tekst

{{ui:Spasi kao EPANET tekst (.inp)}} zapisuje mrežu u formatu običnog teksta koji čitaju mnogi programi za vodu, a {{ui:Otvori EPANET tekst (.inp)…}} čita jedan takav. Prenosi se samo ono što CivilCraft modeluje: čvorovi, rezervoari, tankovi, cijevi, pumpe s krivom visine, ventili za smanjenje pritiska, obrasci potrošnje i vremena. Drugi tipovi ventila, pumpe zadane snagom i druge formule gubitaka se navode i izostavljaju. Datoteka mora koristiti iste jedinice kao projekat.

## Hidranti, ventili i spojnice

Odaberi čvor i označi **Hidrant** da postaviš jedan tu; odaberi glavnu cijev i pritisni **Dodaj u sredini** da na nju staviš ventil, zračni ventil, ispust ili mjerač. Oni su dio mreže: pomjeraju se s njom, a jedan korak poništavanja ih uklanja.

Raspored također podrazumijeva spojnice, a CivilCraft ih navodi bez traženja: **T-komad** gdje se sastaju tri glavne cijevi, **križ** gdje se sastaju četiri, **koljeno** (s uglom) gdje se dvije glavne cijevi okrenu za 5° ili više, **redukcija** gdje se sastaju dvije veličine, i **zaglavak** na slijepom kraju. {{ui:Specifikacija fitinga (CSV)}} ih broji, kao i glavne cijevi po veličini. Ovo je ono što raspored podrazumijeva, predmjer za provjeru prema tvojim detaljima, a ne spisak za naručivanje.

Glavne cijevi se polažu na teren umanjen za pokrivenost (4 ft ili 1.2 m) kako bi se mogle nacrtati i modelirati u 3D; gornji pritisci nikad ne zavise od toga.

## Na planu i u datotekama

Plan, PDF i DWG ili DXF nose glavne cijevi na **C-WATR-MAIN**, s njihovim veličinama na **C-WATR-TEXT**, hidrante na **C-WATR-HYDR**, ventile na **C-WATR-VALV**, a spojnice na **C-WATR-FITT**. LandXML izlaz zapisuje mrežu vodovodnih cijevi (konstrukcija za svaki čvor, cijev za svaku glavnu cijev, hidranti imenovani); LandXML ulaz je čita nazad kao vodovodne mreže, bez potrošnji, pumpi i ventila, koje LandXML ne prenosi. IFC izvoz zapisuje glavne cijevi kao segmente cijevi, hidrante, ventile i spojnice u jednom vodovodnom sistemu. Ove datoteke su provjerene našim vlastitim čitačima i pisačima; isprobaj ih u drugim programima i javi nam šta kažu.

## Šta još nije ovdje

Kvalitet i starost vode, upravljanje i pravila izvan uključivanja i isključivanja pumpe, drugi tipovi ventila, potrošnja zavisna od pritiska, cijevi s promjenjivim prečnikom i protoci kanalizacije tokom vremena. Vidi [Još nije izgrađeno](topic:not-built-yet). Projektni protoci sanitarne kanalizacije, koji su drugačiji proračun, nalaze se u [Sanitarni projektni protoci](topic:sanitary-design).
