---
title: Provlačenje koridora ceste
summary: Uključite koridor za os trase, postavite vrijednosti prometnih traka, bankina i bočnih pokosa te pročitajte presjeke, linije pokosa i zemljane radove koje on stvara.
keywords: raskrižje, križanje, cesta spaja cestu, sporedna cesta, T-raskrižje, križanje, razina platoa, spoj, priključak, nadvišenje, super, nagib u zavoju, izlazna dionica, prijelazna dionica, tablica stopa, poprečni nagib, rotacija, koridor, sklop, tipični poprečni presjek, cesta, prometna traka, bankina, bočni pokos, linija pokosa, presjeci, iskop, nasip, cilj, ciljevi, cilj širine, cilj kote, cilj odmaka, proširenje, rub kolnika, slijedi drugi koridor
from: 6dcb92b3
---

Koridor provlači jedan jednostavan tipični poprečni presjek (sklop) duž osi trase i njezina projektiranog uzdužnog profila, prilagođava ga terenu i dodaje rezultat projektiranoj površini. Na jednoj osi trase može biti više koridora na različitim rasponima stacionaža, a koridor se može izraditi od višekratnih predložaka po stacionaži ([Predlošci koridora](topic:corridor-templates)). Jednostavan sklop u nastavku isti je s obje strane; ako želite da svaka strana ima vlastite dijelove, pogledajte [Izrada svake strane od dijelova](topic:corridor#build-each-side-from-parts).

## Sklop

Od osi prema van, na svakoj strani:

1. **prometna traka** zadane širine, koja se od tjemena kolnika spušta **nagibom trake**
2. **bankina** zadane širine na **nagibu bankine**
3. **bočni pokos** od ruba bankine do mjesta gdje dodiruje teren: **iskopni pokos** gdje je teren iznad, **nasipni pokos** gdje je ispod

Početne vrijednosti su orijentacijske, a ne projektna norma:

| Vrijednost | US stope | Metri |
|---|---|---|
| Širina trake | 12 ft | 3.6 m |
| Nagib trake | 2% | 2% |
| Širina bankine | 4 ft | 1.2 m |
| Nagib bankine | 4% | 4% |
| Iskopni pokos | 2 : 1 | 2 : 1 |
| Nasipni pokos | 3 : 1 | 3 : 1 |
| Presjek svakih | 10 ft | 5 m |

Nagibi bočnih pokosa zadaju se horizontalno prema vertikalno (H:V): 3 : 1 znači 3 jedinice vodoravno za 1 okomito.

## Izrada koridora

Potrebna vam je os trase bez pogrešaka i projektirani uzdužni profil s najmanje dva PVI-ja i bez pogrešaka.

1. Odaberite os trase.
2. U desnom panelu, pod **Koridor**, označite **Provuci sklop duž projektiranog profila**.
   Polja se pojavljuju i koridor se odmah izrađuje. Plan prikazuje rubove trake i bankine te linije pokosa; s {{ui:Projektirano (planirano)}} odabranim pod **Prikaz** izohipse prikazuju novi teren.
3. Promijenite bilo koju vrijednost: **Širina trake**, **Nagib trake**, **Širina bankine**, **Nagib bankine**, **Iskopni pokos**, **Nasipni pokos**, **Presjek svakih**. Nakon svake pritisnite {{key:Enter}}. Iskop, nasip i razmak presjeka moraju biti veći od 0.
4. Pročitajte redak ispod polja, na primjer „39 presjeka od 0+00.00 do 3+86.36; iskop 240.2 cu yd, nasip 556.0 cu yd.“

Presjeci se režu na svakom koraku **Presjek svakih**, na krajevima te na početku i kraju svakog horizontalnog i vertikalnog zaobljenja. Svaki presjek i linije kroz njih (os, rubovi trake i bankine, linije pokosa) postaju prijelomnice projektirane površine.

Za isključivanje koridora odznačite okvir. Njegove vrijednosti se čuvaju za sljedeći put.

## Kada se ne izrađuje

Crveni okvir ispod polja kaže zašto:

| Poruka | Što učiniti |
|---|---|
| „Koridor treba projektirani profil bez pogrešaka.“ | Dodajte PVI-je ili ispravite preklapajuća vertikalna zaobljenja (vidi [Projektiranje uzdužnog profila](topic:profile)). |
| „Projektirani profil ne preklapa os trase.“ | Premjestite PVI-je na raspon stacionaža osi trase. |
| „Koridor treba najmanje dva presjeka na površini.“ | Veći dio koridora je izvan postojećeg terena. |
| „Bočnih pokosa koji izlaze iz terena prije dodira s tlom: 4“ | Blizu ruba površine pokos ne može doseći teren. Držite cestu podalje od ruba ili smanjite visinu nasipa ili iskopa tamo. |
| „Linije pokosa koridora se sijeku (presjeci se preklapaju, na primjer s unutarnje strane uskog zavoja). Upotrijebite veći radijus ili uži sklop.“ | Presjeci s unutarnje strane oštrog zavoja se preklapaju. Povećajte radijus ili suzite sklop. |

Koridor s problemom nije uzdužno obrađen i ne ulazi u zemljane radove.

## Koridori i platoi zajedno

Projektirana površina se izrađuje redom: prvo svi koridori, zatim svi platoi. Gdje se obrada platoa preklapa s koridorom, plato ima prednost. Gdje kasnija stavka preklapa cestu, zamjenjuje se samo dio ceste unutar linije pokosa kasnije stavke; ostatak ceste i svaka prijelomnica terena koju cesta siječe zadržava svoj oblik. Volumeni se računaju unutar svih linija pokosa zajedno; vidi [Volumeni zemljanih radova](topic:volumes).

## Nadvišenje

Kroz zavoj cesta se može nagnuti prema unutrašnjosti, tako da je promet manje potisnut prema vanjskoj strani. Označite **Nadvisi zavoje** pod **Nadvišenje** u **Svojstvima** osi trase:

- Svaki kružni zavoj uzima stupanj **e** iz tablice stopa: prvi redak čiji radijus zavoj doseže (redak s praznom stopom zadržava normalni poprečni nagib tjemena). Tablica i **Najveći relativni nagib** (0.5 % za početak) su orijentacijske vrijednosti, a ne norma: postavite ih prema vlastitim projektnim kriterijima. Dodajte ili uklonite retke prema potrebi.
- Trake se zakreću oko osi. Prije zavoja vanjska traka se izravnava kroz **izlaznu dionicu** (normalni poprečni nagib ÷ e × prijelazna dionica), zatim kroz **prijelaznu dionicu** (širina trake × e ÷ nagib): vanjska traka nastavlja se zakretati dok cijela cesta ne bude nagnuta za e prema unutrašnjosti. Dvije trećine prijelazne dionice leže prije zavoja, a jedna trećina na zavoju. Nakon zavoja isto se događa obrnutim redoslijedom.
- Bankina na nižoj strani nikad nije ravnija od svoje trake; na višoj strani zadržava vlastiti nagib (preko nje se prevrće).
- Tablica ispod navodi radijus, stopu, prijelaznu i izlaznu dionicu svakog zavoja te gdje potpuno nadvišenje počinje i završava. **Dijagram nadvišenja** crta poprečne nagibe obiju traka uzduž stacionaža (lijeva traka puna linija, desna crtkana).
- Zavoj prekratak za potpuno nadvišenje ili dva zavoja čiji se prijelazi preklapaju prijavljuju se u okviru iznad tablice.

Presjeci, volumeni, 3D prikaz i listovi prikazuju nagnutu cestu. Svaka promjena je jedan korak: {{key:Mod+Z}} je poništava.

## Ciljevi

Cilj pomiče jednu točku jedne strane ceste na liniju: **rub kolnika** ili **rub bankine**, na **lijevoj** ili **desnoj** strani. Svaki presjek dodiruje liniju okomito na os, ide van samo na toj strani, tako da cilj na desnoj strani nikad ne pomiče lijevu stranu.

| Postavlja | Što se događa tamo gdje presjek dodiruje liniju |
|---|---|
| **Širina** | Točka leži na liniji: traka (ili bankina) se širi ili sužava do nje, zadržavajući svoj poprečni nagib. |
| **Kota** | Točka uzima visinu linije na tom mjestu, na vlastitom odmaku: poprečni nagib trake (ili bankine) slijedi ga. |

Linija može biti značajna linija (bez obzira na njezinu **Namjenu**) ili linija drugog koridora: njegova os, rubovi kolnika, rubovi bankina ili linije pokosa. Linija koridora prati taj koridor: promijenite drugu cestu i ova prati. CivilCraft izrađuje drugi koridor prvi; dva koridora koja bi ciljala jedan na drugog u petlji odbijaju se s jedne strane, a tablica kaže koja.

1. Odaberite os trase i uključite njezin koridor.
2. Pod **Ciljevi** kliknite {{ui:Dodaj cilj}}.
3. Odaberite **Stranu**, **Točku**, što **Postavlja** i **Do linije**. Svaka promjena je jedan korak poništavanja.

**Rezultat** kaže na koliko je presjeka linija dosegnuta. Presjeci koji je ne dosežu (izvan njezinih krajeva ili gdje je iza osi) zadržavaju vrijednosti sklopa. Linija koja se izbriše ostavlja koridor kakav je bio prije cilja, a tablica to kaže. Jedna strana može imati jednu širinu i jednu kotu cilja za svaku točku.

## Izrada svake strane od dijelova

Uključite **Izradi svaku stranu od dijelova** pod postavkama koridora. Svaka strana tada ima vlastiti popis, od osi prema van: trake, bankinu, odvodni kanal, rubnjak, zelenu traku, nogostup i, na kraju, bočni pokos do terena (s vlastitim omjerima iskopa i nasipa). Počnite od {{ui:Cesta izvan naselja}} ili {{ui:Gradska ulica}}, dodajte i uklonite dijelove, pomičite ih strelicama i {{ui:Kopiraj}} jednu stranu na drugu. Svaka promjena je jedan korak poništavanja.

Poprečni nagib je pad od ceste, pa je nogostup koji se odvodi prema cesti negativan. Rubnjak je ploha zadane visine, gornja ploha zadane širine i izborni pad na stražnjoj strani. Nadvišenje zakreće sve trake u prvom retku; odvodni kanal, rubnjak, zelena traka i nogostup vise s ruba izgrađenih traka. Ciljevi i dalje pomiču kraj traka i zadnji dio. Poprečni presjeci označavaju dno odvodnog kanala, gornju i stražnju plohu rubnjaka te ostalo. Na zavoju sa spiralama prijelazna dionica je spirala: ravni poprečni nagib na TS, puno nadvišenje na SC.

## Slojevi kolnika

Traka, bankina, odvodni kanal, zelena traka ili nogostup mogu nositi svoj sastav: ispod dijela {{ui:Dodaj sloj}} dodaje sloj s imenom, materijalom, debljinom i vrstom (površinski, vezni, nosivi, posteljica, zaštitni ili drugi), od vrha prema dnu. Slojevi ne pomiču površinu ceste (njezin vrh je projektirana površina); svaki leži ispod svog dijela, a dubina se mjeri ravno prema dolje. Poprečni presjeci crtaju dno svakog sloja crtkanom linijom, a {{ui:Slojevi kolnika: količine}} navodi tlocrtnu površinu i volumen svakog sloja (površina uzduž koridora iz njegovih presjeka, volumen = površina × debljina). IFC izvoz zapisuje svaki sloj kao vlastiti element s debljinom i materijalom (vidi [IFC izvoz i uvoz](topic:ifc)). Debljinu koju upišete određujete vi: CivilCraft ne dimenzionira kolnike.

## Gdje se ceste spajaju s cestama, platoima i stazama

Uz uključeno {{ui:Spoji ceste i platoe koje dodiruje}} (uključeno je za svaki koridor), CivilCraft spaja koridor s onim što dodiruje u tlocrtu:

- **Cesta koja završava na drugoj cesti** (kraj njezine osi leži na drugoj cesti ili unutar otprilike polovice vlastite širine kolnika od ruba te ceste) je sporedna cesta raskrižja. Cesta na koju nailazi otvara svoj rub za kolnik sporedne ceste: preko ušća bankina, rubnjak, zelena traka i nogostup polažu se na poprečni nagib trake i crtaju kao kolnik. Sporedna cesta polaže se na površinu glavne ceste tamo gdje se preklapaju i postupno se podiže ili spušta na nju kroz prilaz.
- **Dvije ceste koje se križaju** spajaju se na isti način s obje strane. Cesta navedena prva pod Trase je prolazna; druga slijedi njezinu površinu preko križanja.
- **Cesta koja završava na platou** (unutar njega ili unutar otprilike polovice širine kolnika od njegova ruba) dolazi na razinu platoa i postupno se na nju spušta kroz prilaz.
- **Staza** (Krajobraz › Popločenje i građevinski uređeni elementi) staje na vanjskom rubu ceste, na razini nogostupa ili bankine tamo, umjesto da leži preko ceste. Staza koja presijeca cestu postaje dva dijela. Kraj nacrtan malo prije ceste (unutar dvostruke širine staze) produžuje se do njezina ruba.

Svojstva kažu što je svaki koridor spojio, za koliko je tamo podignut ili spušten i na kojoj duljini. Ta duljina je veća od 10 m (30 ft) i dvadeset puta veće promjene te nikad nije više od 45 % koridora. **Projektirani profil se ne mijenja**: prikaz profila i dalje pokazuje nacrtanu niveletu, a presjeci, projektirana površina, volumeni i 3D prikaz pokazuju cestu kakva je spojena. Da bi spoj bio točan projektom, pomaknite posljednji PVI na razinu koju Svojstva navode.

Isključite prekidač na koridoru da ga ostavite točno kakav ga određuju profil i sklop; tada ne sudjeluje ni u jednom raskrižju, ni kao sporedna ni kao prolazna cesta. Ceste koje se spajaju gotovo u pravcu (pod otprilike 20°) ostavljaju se netaknute, kao i staze.

Što raskrižje još ne radi: nema zaobljenja rubnjaka na uglovima (uglovi su pravokutni), nema skretnih traka ni otočića, kraj sporedne ceste reže se okomito na vlastitu os, a koridor izrađen od predložaka otvara svoj rub na isti jednostavan način (jarak ili zid u završnom stanju izravnava se preko ušća, bez propusta). Za zaobljenja rubnjaka u tlocrtu, trokute preglednosti i označavanje vidi [Tla, ceste, izmjera, rudnici i veze](topic:soils-roads-survey-mines-links).

## Što još nije izrađeno

Ciljevi za nagib pokosa nisu još dostupni. Za koridor koji se mijenja uzduž ceste, s lijevom i desnom stranom odvojeno, upotrijebite [Predlošci koridora](topic:corridor-templates). Vidi [Još nije izrađeno](topic:not-built-yet).
