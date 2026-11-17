---
title: Protegnite cestovni koridor
summary: Uključite koridor za os, postavite vrijednosti traka, bankina i bočnih nagiba te očitajte presjeke, linije nožice pokosa i zemljane radove koje stvara.
keywords: nadvišenje, super, nagib zavoja, runoff, runout, tablica stopa, poprečni nagib, rotacija, koridor, sklop, tipični presjek, cesta, traka, bankina, bočni nagib, nožica pokosa, iskop, nasip, presjeci, cilj, ciljevi, cilj širine, cilj kote, cilj odmaka, proširenje, rub kolnika, slijedi drugi koridor
from: 91303189
---

Koridor protegne jedan jednostavni tipični presjek (sklop) duž osi i njezina projektiranog profila, prilagodi ga postojećem terenu i dodaje rezultat projektiranoj površini. Os može nositi više koridora na različitim rasponima stacionaže, a koridor se može izgraditi od višekratnih predložaka po stacionaži ([Predlošci koridora](topic:corridor-templates)). Jednostavni sklop je isti s obje strane; za davanje vlastitih dijelova svakoj strani vidi [Izgradnja svake strane od dijelova](topic:corridor#build-each-side-from-parts).

## Sklop

Od osi prema van, s svake strane:

1. **traka** zadane širine koja se spušta od tjemena pri **nagibu trake**
2. **bankina** zadane širine pri **nagibu bankine**
3. **bočni nagib** od ruba bankine dok ne dodirne teren: **nagib iskopa** gdje je teren iznad, **nagib nasipa** gdje je ispod

Polazne vrijednosti su okvirne, nisu projektni standard:

| Vrijednost | US feet | Metri |
|---|---|---|
| Širina trake | 12 ft | 3.6 m |
| Nagib trake | 2% | 2% |
| Širina bankine | 4 ft | 1.2 m |
| Nagib bankine | 4% | 4% |
| Nagib iskopa | 2 : 1 | 2 : 1 |
| Nagib nasipa | 3 : 1 | 3 : 1 |
| Presjek svakih | 10 ft | 5 m |

Nagibi bočnih pokosa su horizontalni prema vertikalnom (H:V): 3 : 1 znači 3 vodoravno za 1 okomito.

## Izgradnja koridora

Potrebni su vam os bez pogrešaka i projektirani profil s najmanje dvije PVI-točke i bez pogrešaka.

1. Odaberite os.
2. U desnoj ploči, pod **Koridor**, označite **Protegni sklop duž projektiranog profila**.
   Polja se pojavljuju i koridor se odmah gradi. Plan prikazuje rubove trake i bankine te linije nožice pokosa; s odabranim {{ui:Proposed (graded)}} pod **Prikaz**, izohipse prikazuju novi teren.
3. Promijenite bilo koju vrijednost: **Širina trake**, **Nagib trake**, **Širina bankine**, **Nagib bankine**, **Nagib iskopa**, **Nagib nasipa**, **Presjek svakih**. Pritisnite {{key:Enter}} nakon svake. Nagib iskopa, nasipa i razmak presjeka moraju biti veći od 0.
4. Pročitajte redak ispod polja, na primjer „39 presjeka od 0+00.00 do 3+86.36; iskop 240.2 cu yd, nasip 556.0 cu yd.“

Presjeci se režu na svakom koraku **Presjek svakih**, na krajevima i na početku i kraju svake horizontalne i vertikalne krivulje. Svaki presjek i linije kroz njih (središnja os, rubovi trake i bankine, nožica pokosa) postaju prijelomnice projektirane površine.

Koridor isključite tako da odznačite okvir. Njegove vrijednosti se zadržavaju za sljedeći put.

## Kad se ne gradi

Crveni okvir ispod polja kaže zašto:

| Poruka | Što učiniti |
|---|---|
| „The corridor needs a design profile without errors.“ | Dodajte PVI-točke ili popravite preklapajuće vertikalne krivulje (vidi [Projektiranje vertikalnog profila](topic:profile)). |
| „The design profile does not overlap the alignment.“ | Pomaknite PVI-točke na raspon stacionaže osi. |
| „The corridor needs at least two sections on the surface.“ | Većina koridora je izvan postojećeg terena. |
| „4 side slopes run off the surface before meeting the ground.“ | Blizu ruba površine nagib ne može doseći teren. Držite cestu podalje od ruba ili smanjite visinu nasipa ili iskopa ondje. |
| „The corridor’s daylight lines cross (sections overlap, for example on the inside of a tight curve). Use a larger radius or narrower assembly.“ | Presjeci s unutarnje strane oštre krivine se preklapaju. Povećajte radijus ili suzite sklop. |

Koridor s problemom nije uključen u teren i ne ulazi u zemljane radove.

## Koridori i plato zajedno

Projektirana površina gradi se redom: prvo svi koridori, pa svi platoi. Gdje izravnavanje platoa prelazi preko koridora, plato pobjeđuje. Volumeni se računaju unutar svih linija nožice pokosa zajedno; vidi [Volumeni zemljanih radova](topic:volumes).

## Nadvišenje

Kroz krivinu cesta se može nagnuti prema unutrašnjoj strani, pa je promet manje gurnut prema vanjskoj. Označite **Nadvisi krivine** pod **Nadvišenje** u **Svojstvima** osi:

- Svaka kružna krivina dobiva stopu **e** iz tablice stopa: prvi redak čiji radijus krivina dosegne (redak s praznom stopom zadržava normalni tjeme). Tablica i **Najveći relativni nagib** (početno 0.5 %) su okvirne, nisu standard: postavite ih prema vlastitim projektnim kriterijima. Dodajte ili uklonite retke po potrebi.
- Trake se zakreću oko središnje osi. Prije krivine vanjska traka se izravnava preko **izlaza (runout)** (normalni tjeme ÷ e × runoff), zatim preko **prijelaza (runoff)** (širina trake × e ÷ nagib) vanjska traka nastavlja zakretati dok cijela cesta ne bude nagnuta za e prema unutra; dvije trećine prijelaza su prije krivine, a jedna trećina na njoj. Nakon krivine isto se događa obrnuto.
- Bankina na niskoj strani nikad nije ravnija od svoje trake; na visokoj strani zadržava svoj nagib (preko nje se valja).
- Tablica ispod navodi radijus, stopu, prijelaz i izlaz svake krivine te gdje počinje i završava puno nadvišenje. **Dijagram nadvišenja** crta poprečne nagibe obje trake duž stacionaže (lijeva traka puna, desna crtkana).
- Krivina prekratka da dosegne puno nadvišenje, ili dvije krivine čiji se prijelazi preklapaju, navodi se u okviru iznad tablice.

Presjeci, zemljani radovi, 3D prikaz i listovi svi prikazuju nagnutu cestu. Svaka promjena je jedan korak: {{key:Mod+Z}} je poništava.

## Ciljevi

Cilj pomiče jednu točku jedne strane ceste na liniju: **rub kolnika** ili **rub bankine**, na **lijevoj** ili **desnoj** strani. Svaki presjek sijeće liniju okomito na središnju os, idući van samo s te strane, pa cilj s desne strane nikad ne pomiče lijevu.

| Postavlja | Što se događa gdje presjek sijeće liniju |
|---|---|
| **Širinu** | Točka leži na liniji: traka (ili bankina) se širi ili sužava do nje, zadržavajući svoj poprečni nagib. |
| **Kotu** | Točka uzima kotu linije tu, na svom odmaku: slijedi poprečni nagib trake (ili bankine). |

Linija može biti linija značajke (bez obzira na njezinu **Namjenu**) ili linija drugog koridora: njegova središnja os, rubovi kolnika, rubovi bankine ili linije nožice pokosa. Linija koridora prati taj koridor: promijenite drugu cestu i ova je slijedi. CivilCraft gradi drugi koridor prvi; dva koridora koja bi ciljala jedan na drugog u krugu se odbijaju s jedne strane, a tablica kaže koji.

1. Odaberite os i uključite njen koridor.
2. Pod **Ciljevi** kliknite {{ui:Add a target}}.
3. Odaberite **Stranu**, **Točku**, što **Postavlja** i **Na liniju**. Svaka promjena je jedan korak poništavanja.

**Rezultat** kaže na koliko presjeka je linija dosegnuta. Presjeci koji je ne dosežu (izvan njezinih krajeva ili gdje je iza središnje osi) zadržavaju vrijednosti sklopa. Linija koja se izbriše ostavlja koridor kakav je bio prije cilja, a tablica to kaže. Jedna strana može imati jedan cilj širine i jedan cilj kote za svaku točku.

## Izgradnja svake strane od dijelova

Uključite **Izgradi svaku stranu od dijelova** pod postavkama koridora. Svaka strana tada ima vlastiti popis, od osi prema van: trake, bankina, odvodni žlijeb, rubnjak, zelena traka, nogostup i na kraju bočni nagib do terena (s vlastitim omjerima iskopa i nasipa). Počnite od {{ui:Rural road}} ili {{ui:Urban street}}, dodajte i uklonite dijelove, pomičite ih strelicama i {{ui:Copy}} kopirajte jednu stranu na drugu. Svaka promjena je jedan korak poništavanja.

Poprečni nagib je pad od ceste, pa je nogostup koji se odvodi prema cesti negativan. Rubnjak je ploha zadane visine, gornja ploha zadane širine i izborni pad na stražnjoj strani. Nadvišenje okreće svaku traku u prvom retku; odvodni žlijeb, rubnjak, zelena traka i nogostup vise od ruba izgrađenih traka. Ciljevi i dalje pomiču kraj traka i zadnji dio. Poprečni presjeci označavaju dno odvodnog žlijeba, vrh i stražnju stranu rubnjaka te ostalo. Na krivini sa spiralama prijelaz je spirala: ravni tjeme na TS, puno nadvišenje na SC.

## Slojevi kolnika

Traka, bankina, odvodni žlijeb, zelena traka ili nogostup mogu nositi svoj sastav: ispod dijela, {{ui:Add a course}} dodaje sloj s nazivom, materijalom, debljinom i vrstom (površinski, vezni, nosivi, posteljica, zaštitni ili drugo), odozgo prema dolje. Slojevi ne pomiču površinu ceste (njezin vrh je projektirana površina); svaki leži ispod svog dijela, a dubina se mjeri ravno prema dolje. Poprečni presjeci crtaju donju plohu svakog sloja kao crtkanu liniju, a {{ui:Pavement courses: quantities}} navodi površinu u tlocrtu i volumen svakog sloja (površina duž koridora iz njegovih presjeka, volumen = površina × debljina). IFC izvoz zapisuje svaki sloj kao vlastiti element s debljinom i materijalom (vidi [IFC izvoz i uvoz](topic:ifc)). Debljina koju upišete je vaša: CivilCraft ne dimenzionira kolnike.

## Što još nije izrađeno

Ciljevi za nožicu pokosa još nisu dostupni. Za koridor koji se mijenja duž ceste, s lijevom i desnom stranom odvojeno, koristite [Predlošci koridora](topic:corridor-templates). Vidi [Još nije izrađeno](topic:not-built-yet).
