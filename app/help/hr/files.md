---
title: Datoteke koje možete otvoriti, spremiti i izvesti
summary: Ulazne datoteke s točkama, LandXML i CivilCraft projekti; izlazno: projekti, LandXML, DXF i PDF; što se sprema, gdje datoteke završavaju i što se mijenja offline.
keywords: otvori, spremi, izvezi, uvezi, formati datoteka, csv, txt, landxml, xml, dxf, pdf, json, preuzmi, datoteka projekta
from: a7debb61
---

CivilCraft otvara datoteke s vašeg računala, a spremanje znači preuzimanje datoteka natrag na računalo. Ništa se ne šalje na poslužitelj i ništa se ne čuva na poslužitelju. Pogledajte i [Vaše datoteke](common:your-files).

## Što se otvara

Kliknite {{ui:Otvori}} (ili pritisnite {{key:Mod+O}}) i odaberite datoteku, ili povucite datoteku iz aplikacije {{pick:mac=Finder|windows=File Explorer|linux=upravitelj datoteka}} na tlocrt. Jedna po jedna datoteka; datoteke veće od 200 MB se odbijaju.

| Vrsta | Nazivi datoteka | Što se događa |
|---|---|---|
| Datoteka s točkama | `.csv`, `.txt`, `.pnt`, `.xyz` (bilo koja tekstualna datoteka) | Otvara se dijaloški okvir **Uvoz točaka**. Točke zamjenjuju točke projekta; trase, platoi i cijevi ostaju. |
| LandXML | `.xml`, `.landxml` | Iz datoteke se stvara **novi projekt**. Prije toga vas se pita ako trenutni projekt ima nespremljene promjene. |
| CivilCraft projekt | `.civilcraft.json` (bilo koji `.json`) | Projekt se otvara kako je bio spremljen. Prije toga vas se pita ako trenutni projekt ima nespremljene promjene. |

CivilCraft odlučuje prema nastavku datoteke, pa prema prvim znakovima: tekst koji počinje s `{` čita se kao projekt, tekst koji počinje s `<` kao LandXML, a sve ostalo kao datoteka s točkama. Datoteku koju dijaloški okvir za otvaranje prikazuje sivo i dalje možete ispustiti na tlocrt.

:::note
Uvoz datoteke s točkama u projekt koji već ima točke zamjenjuje ih bez pitanja i briše povijest poništavanja (otvaranje bilo koje datoteke je nov početak za poništavanje). Ako je površina nastala iz LandXML-a, uvoz točaka vraća je na površinu izgrađenu iz točaka. Spremite prije toga ako biste kasnije htjeli stare točke natrag.
:::

Pojedinosti: [Formati datoteka s točkama](topic:point-file-formats), [LandXML: što se čita i zapisuje](topic:landxml-reference).

## Što se sprema

{{ui:Spremi}} ({{key:Mod+S}}) zapisuje dvije datoteke jednu uz drugu, nazvane prema **Naziv** u lijevoj ploči: `<name>.civilcraft.json`, projekt koji nastavljate uređivati, i `<name>.ifc`, isti nacrt u IFC 4.3 za sve ostale (vidi [Izvoz i uvoz IFC-a](topic:ifc)). Svaka datoteka upućuje na drugu. IFC također nosi komprimiranu kopiju projekta, pa se IFC poslan sam za sebe i dalje može u potpunosti otvoriti i uređivati.

- **U aplikaciji Studio** obje se datoteke zapisuju jedna uz drugu, na istom mjestu.
- **U pregledniku Chrome ili Edge** prvo spremanje traži mapu i u nju zapisuje obje datoteke; kasnija spremanja idu u istu mapu. Odustanite od pitanja o mapi da biste umjesto toga preuzeli obje datoteke.
- **U drugim preglednicima** obje se datoteke preuzimaju, prvo projektna datoteka.

Otvaranje bilo koje datoteke traži drugu. Otvorite obje zajedno (ili ih povucite obje) ili otvorite jednu: u aplikaciji Studio druga se pronalazi u istoj mapi; u pregledniku vas CivilCraft pita želite li je dodati ili nastaviti samo s jednom. Ako je IFC promijenio drugi program nakon što ga je CivilCraft spremio ili je jedna datoteka starija od druge, projekt se otvara iz novijeg modela, a ploča Problemi kaže što se dogodilo, uz **Spremi odmah** (ponovno zapisuje obje datoteke) i **Prikaži geometriju IFC-a kao referencu**. IFC sam za sebe koji je promijenio drugi program otvara se iz svoje kopije projekta s onim što se još podudara: trase koje je promijenio uzimaju njegovu geometriju, objekti koje je uklonio izostavljaju se, a ostale promjene navode se, ali se ne preuzimaju. Projektna datoteka iz verzije prije 0.7.1 otvara se kao i prije.

Datoteka projekta čuva:

- svaku točku (broj, koordinate, kotu, opis) i naziv datoteke s točkama iz koje potječe
- postavke površine: odabir skupina, nacrtane prijelomnice, granicu, najdulji vanjski rub i TIN pročitan iz LandXML-a
- postavke prikaza
- trase s njihovim PI-jevima, radijusima i početnom stacionažom, njihove projektirane profile (PVI-jeve i duljine lukova) i postavke koridora
- platoe i mrežu cijevi s njezinim pravilima

Ne čuva povijest poništavanja. Površine, izohipse, nožice pokosa i volumeni se ne pohranjuju; ponovno se izrađuju iz spremljenih ulaznih podataka kad se projekt otvori. Projektna datoteka iz novijeg CivilCraft-a odbija se uz poruku koja navodi njezinu verziju.

## Što se izvozi

| Gumb | Datoteka | Sadržaj |
|---|---|---|
| {{ui:LandXML}} | `<name>.xml` | LandXML 1.2: točke, postojeći teren (i projektirana površina ako postoji) kao TIN površine, trase, profili terena i projektirani profili, mreža cijevi |
| {{ui:DXF}} | `<name>.dxf` | R12 DXF linija tlocrta kako se prikazuju, na imenovanim slojevima |
| {{ui:DWG}} | `<name>.dwg` | Iste linije kao DWG crtež, u formatu koji odaberete (2000 do 2018) |
| {{ui:PDF}} | `<name>.pdf` | Vektorski ispis tlocrta na listu, u mjerilu koje odaberete |
| {{ui:GLB}} ili {{ui:OBJ}} (na traci 3D prikaza) | `<name>-3d.glb`, `<name>-3d.obj` | Ono što 3D prikaz prikazuje kao 3D model: metri, Y prema gore, stvarno mjerilo, oko zabilježenog lokalnog ishodišta |

Što svaki izostavlja: [Razmjena LandXML-a](topic:landxml), [Izvoz tlocrta u DXF](topic:dxf-export) (DWG također), [Ispis tlocrta u PDF](topic:plot-pdf), [Izvoz lokacije u 3D](topic:export-3d).

## Gdje završavaju datoteke

Spremljene i izvezene datoteke idu tamo gdje vaš preglednik sprema preuzimanja, obično u mapu Preuzimanja. Da svaki put birate mapu:

:::chromium
Otvorite **Postavke** preglednika, zatim **Preuzimanja**, i uključite **Pitaj gdje spremiti svaku datoteku prije preuzimanja**.
:::

:::firefox
Otvorite **Postavke**, zatim **Općenito**, i pod **Datoteke i aplikacije** odaberite **Uvijek pitaj gdje spremiti datoteke**.
:::

:::safari
Otvorite **Safari > Postavke > Općenito** i postavite **Lokacija za preuzimanje datoteka** na **Pitaj za svako preuzimanje**.
:::

Ako spremite dvaput s istim nazivom, preglednik drugoj datoteci može dodati broj, na primjer `Site (1).civilcraft.json`. Sljedeći put otvorite najnoviju.

## Online i offline

CivilCraft u oba slučaja radi samo na vašem računalu: otvaranje čita datoteku u pregledniku, a spremanje je preuzima. Da biste otvorili CivilCraft bez ikakve veze, najprije ga spremite za offline rad:

1. Dok ste na mreži, kliknite {{ui:Spremi za offline}} u traci aplikacije na vrhu.
2. Gumb broji ("Spremanje 12 od 30") i zatim prikazuje {{ui:Spremno za offline}}. CivilCraft je mali (oko 0.6 MB), pa to potraje trenutak. Spremljena kopija uključuje ovu pomoć i primjer lokacije.
3. Bez veze otvorite istu adresu (ili oznaku te adrese). Sve radi, uključujući {{ui:Otvorite primjer lokacije}}.

Ostala stanja gumba:

- {{ui:Spremanje nije uspjelo}}: neke datoteke nisu preuzete. Provjerite vezu i kliknite gumb da pokušate ponovno.
- {{ui:Offline nije dostupan}}: ovaj prozor preglednika ne može zadržati offline kopiju (privatni prozori i neka upravljana računala to blokiraju). Upotrijebite običan prozor.

Kliknite {{ui:Spremno za offline}} da vidite kada je kopija spremljena, uz dva izbora: {{ui:Spremi ponovno (preuzmi najnoviju verziju)}} i {{ui:Ukloni offline kopiju}}. Spremite ponovno prije posjeta lokaciji da se kopija podudara s najnovijom verzijom. Više u [Offline](common:offline).

:::offline
Sada ste offline. Ako je CivilCraft spremljen za offline rad, sve radi, uključujući primjer lokacije. Ako nije, nastavite raditi u ovoj kartici, ali je ne ponovno učitavajte dok ne budete opet na mreži; bez spremljene kopije {{ui:Otvorite primjer lokacije}} ne uspijeva s porukom „Uzorak se nije mogao učitati“.
:::

:::tip
Za terenski rad spremite CivilCraft za offline rad i donesite datoteke s točkama na sam laptop. Projekti i izvozi spremaju se kao preuzimanja bez veze, pa možete uvesti snimke jednog dana, provjeriti površinu i spremiti projekt na terenu.
:::

Spremanje u oblak još nije dostupno, a desktop verzije još nisu izašle. Za sada su datoteke koje spremite jedina kopija: čuvajte ih na mjestu koje se sigurnosno kopira.

## Dodaci koje datoteka koristi

Kad spremite projekt koji sadrži podatke iz dodatka (kvačice Propisa o gradnji ili izvor Adresa do lokacije), datoteka bilježi koji su dodaci i koje verzije. Otvorite je na računalu koje ih nema: traka iznad tlocrta to kaže i nudi dodavanje s popisa vašeg računa. Zapis je samo bilješka; datoteka se otvara u svakom slučaju.

## Poništavanje u aplikaciji CadCraft Studio

Unutar aplikacije CadCraft Studio svaki korak koji dovršite u CivilCraftu javlja se aplikaciji Studio, pa njezino poništavanje na razini projekta može vratiti zadnji korak preko svih aplikacija. Studio poništava korak samo kad je CivilCraftov vlastiti stog poništavanja upravo u stanju koje je korak ostavio; nakon što otvorite drugu datoteku, preskače ovaj prozor.

## Zatvaranje uz nespremljene promjene

Kad projekt ima nespremljene promjene, a zatvorite karticu, ponovno učitate stranicu ili napustite stranicu, preglednik pita želite li otići. Njegov tekst i izgled pripadaju pregledniku i CivilCraft ih ne može mijenjati. {{ui:Novo}} te otvaranje projekta ili LandXML datoteke pitaju u vlastitom okviru aplikacije CivilCraft **Nespremljene promjene**, s {{ui:Odustani}}, {{ui:Ne spremaj}} i {{ui:Spremi kopiju}}.
