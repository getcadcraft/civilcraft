---
title: Datoteke koje možete otvoriti, spremiti i izvesti
summary: Datoteke s točkama, LandXML i CivilCraft projekti za uvoz; projekti, LandXML, DXF i PDF za izvoz; što svaka sadrži, gdje datoteke završavaju i što se mijenja izvan mreže.
keywords: otvori, spremi, izvezi, uvezi, formati datoteka, csv, txt, landxml, xml, dxf, pdf, json, preuzmi, datoteka projekta
from: 82bff559
---

CivilCraft otvara datoteke s vašeg računala, a sprema ih tako da ih preuzme natrag na računalo. Ništa se ne učitava i ništa se ne čuva na poslužitelju. Pogledajte i [Vaše datoteke](common:your-files).

## Što otvara

Kliknite {{ui:Open}} (ili pritisnite {{key:Mod+O}}) i odaberite datoteku, ili povucite datoteku iz {{pick:mac=Finder|windows=Istraživač datoteka|linux=upravitelj datoteka}} na tlocrt. Jedna po jedna datoteka; datoteke veće od 200 MB se odbijaju. LandXML ili datoteka projekta veća od 32 MB čita se u dijelovima od oko 4 MB, nikada kao jedan blok teksta; dok se LandXML otvara, očekujte da troši otprilike 13 puta veličinu datoteke u memoriji (datoteka od 69 MB koristila je oko 0,9 GB u našem testu).

| Vrsta | Nazivi datoteka | Što se događa |
|---|---|---|
| Datoteka s točkama | `.csv`, `.txt`, `.pnt`, `.xyz` (bilo koja tekstualna datoteka) | Otvara se dijaloški okvir **Uvoz točaka**. Točke zamjenjuju točke projekta; trase, podloge i cijevi ostaju. |
| LandXML | `.xml`, `.landxml` | Iz datoteke se izrađuje **novi projekt** (prvo ćete biti upitani ako trenutni ima nespremljene promjene). |
| Projekt CivilCraft | `.civilcraft.json` (bilo koji `.json`) | Projekt se otvara onakav kakav je spremljen (prvo ćete biti upitani ako trenutni ima nespremljene promjene). |

CivilCraft odlučuje prema nastavku datoteke, a zatim prema prvim znakovima: tekst koji počinje s `{` čita se kao projekt, tekst koji počinje s `<` kao LandXML, a sve ostalo kao datoteka s točkama. Datoteka koju dijaloški okvir za otvaranje sivi i dalje se može povući na tlocrt.

:::note
Uvoz datoteke s točkama u projekt koji već ima točke zamjenjuje ih bez pitanja i briše povijest poništavanja (otvaranje bilo koje datoteke početak je nove povijesti za poništavanje). Ako je površina nastala iz LandXML-a, uvoz točaka vraća je na površinu izrađenu iz točaka. Prvo spremite ako biste mogli poželjeti stare točke natrag.
:::

Pojedinosti: [Formati datoteka s točkama](topic:point-file-formats), [LandXML: što se čita i zapisuje](topic:landxml-reference).

## Što sprema

{{ui:Save}} ({{key:Mod+S}}) zapisuje dvije datoteke jednu uz drugu, nazvane prema **Naziv** u lijevoj ploči: `<naziv>.civilcraft.json`, projekt koji nastavljate uređivati, i `<naziv>.ifc`, isti nacrt kao IFC 4.3 za sve ostale (pogledajte [IFC izvoz i uvoz](topic:ifc)). Svaka datoteka upućuje na drugu, a IFC također sadrži komprimiranu kopiju projekta, pa se IFC poslan sam za sebe i dalje može otvoriti u potpuno uređivom obliku.

- **U Studiju** obje se datoteke zapisuju jedna uz drugu, na istom mjestu.
- **U Chromeu i Edgeu** prvo spremanje traži mapu i zapisuje obje u nju; sljedeća spremanja idu u istu mapu. Odustanite od pitanja o mapi da biste umjesto toga preuzeli obje datoteke.
- **U drugim preglednicima** obje se datoteke preuzimaju, prvo datoteka projekta.

Otvaranje bilo koje datoteke traži drugu. Otvorite obje zajedno (ili ih povucite obje) ili otvorite jednu: u Studiju se druga pronalazi u istoj mapi; u pregledniku CivilCraft vas pita želite li je dodati ili nastaviti s onom koju imate. Ako je IFC promijenio drugi program nakon što ga je CivilCraft spremio, ili je jedna datoteka starija od druge, projekt se otvara iz novijeg nacrta, a ploča Problemi kaže što se dogodilo, uz **Spremi odmah** (ponovno zapisuje obje datoteke) i **Prikaži geometriju IFC-a kao referencu**. IFC sam za sebe, koji je promijenio drugi program, otvara se iz svoje kopije projekta s onim što još odgovara: trase koje je promijenio preuzimaju njegovu geometriju, objekti koje je uklonio ispuštaju se, a ostale promjene navedene su, ali ne preuzimaju se. Datoteka projekta starija od 0.7.1 otvara se kao i prije.

Datoteka projekta sadrži:

- svaku točku (broj, koordinate, kotu, opis) i naziv datoteke s točkama iz koje potječu
- postavke površine: odabire skupina, nacrtane prijelomnice, granicu, najdulji vanjski rub i TIN pročitan iz LandXML-a
- postavke prikaza
- trase s njihovim PI-jevima, radijusima i početnom stacionažom, njihove projektirane uzdužne profile (PVI-jevi i duljine krivulja) i postavke koridora
- podloge i mrežu cijevi s njezinim pravilima

Ne sadrži povijest poništavanja. Površine, izohipse, linije iskopa i nasipa te volumeni se ne pohranjuju; ponovno se izrađuju iz spremljenih ulaza kada se projekt otvori. Datoteka projekta iz novije verzije CivilCraftа odbija se uz poruku koja navodi njezinu verziju.

## Što izvozi

| Gumb | Datoteka | Sadržaj |
|---|---|---|
| {{ui:LandXML}} | `<naziv>.xml` | LandXML 1.2: točke, postojeći teren (i izrađena površina kad postoji) kao TIN površine, trase, profili terena i projektirani profili, mreža cijevi |
| {{ui:DXF}} | `<naziv>.dxf` | R12 DXF linija tlocrta onakvih kakve se prikazuju, na imenovanim slojevima |
| {{ui:DWG}} | `<naziv>.dwg` | Iste linije kao DWG crtež, u formatu koji odaberete (2000 do 2018) |
| {{ui:PDF}} | `<naziv>.pdf` | Vektorski ispis tlocrta na listu, u mjerilu koje odaberete |
| {{ui:GLB}} ili {{ui:OBJ}} (na traci 3D prikaza) | `<naziv>-3d.glb`, `<naziv>-3d.obj` | Ono što 3D prikaz prikazuje kao 3D model: metri, Y prema gore, pravo mjerilo, oko zabilježenog lokalnog ishodišta |

Što svaki od njih izostavlja: [Izmjena LandXML](topic:landxml), [Izvoz tlocrta u DXF](topic:dxf-export) (i DWG), [Ispis tlocrta u PDF](topic:plot-pdf), [Izvoz lokacije u 3D](topic:export-3d).

## Gdje završavaju datoteke

Spremljene i izvezene datoteke idu gdje vaš preglednik sprema preuzimanja, obično u mapu Preuzimanja. Da birate mapu svaki put:

:::chromium
Otvorite **Postavke** preglednika, zatim **Preuzimanja**, i uključite **Pitaj gdje spremiti svaku datoteku prije preuzimanja**.
:::

:::firefox
Otvorite **Postavke**, zatim **Općenito**, i pod **Datoteke i aplikacije** odaberite **Uvijek pitaj gdje spremiti datoteke**.
:::

:::safari
Otvorite **Safari > Postavke > Općenito** i postavite **Lokacija preuzimanja datoteka** na **Pitaj za svako preuzimanje**.
:::

Ako dvaput spremite pod istim nazivom, preglednik može dodati broj drugoj datoteci, na primjer `Lokacija (1).civilcraft.json`. Sljedeći put otvorite najnoviju.

## Izvan mreže i na mreži

CivilCraft u oba slučaja radi samo na vašem računalu: otvaranje čita datoteku u pregledniku, a spremanje je preuzima. Da biste otvorili CivilCraft bez ikakve veze, prvo ga spremite za rad izvan mreže:

1. Dok ste na mreži, kliknite {{ui:Spremi za offline}} na traci aplikacije pri vrhu.
2. Gumb broji („Spremanje 12 od 30”) i zatim prikazuje {{ui:Spremno za offline}}. CivilCraft je mali (oko 0,6 MB), pa to traje trenutak. Spremljena kopija uključuje ovu pomoć i primjer lokacije.
3. Bez veze otvorite istu adresu (ili oznaku te adrese). Sve radi, uključujući {{ui:Otvori primjer lokacije}}.

Ostala stanja gumba:

- {{ui:Spremanje nije uspjelo}}: neke datoteke nisu se preuzele. Provjerite vezu i kliknite ga da pokušate ponovno.
- {{ui:Offline nije dostupan}}: ovaj prozor preglednika ne može čuvati kopiju za rad izvan mreže (privatni prozori i neka upravljana računala to blokiraju). Upotrijebite običan prozor.

Kliknite {{ui:Spremno za offline}} da vidite kada je kopija spremljena, uz dva izbora: {{ui:Spremi ponovno (preuzmi najnoviju verziju)}} i {{ui:Ukloni offline kopiju}}. Prije posjeta lokaciji spremite ponovno da kopija odgovara najnovijoj verziji. Više u [Offline](common:offline).

:::offline
Trenutno ste izvan mreže. Ako je CivilCraft spremljen za rad izvan mreže, sve radi, uključujući primjer lokacije. Ako nije, nastavite raditi u ovoj kartici, ali je nemojte ponovno učitavati dok ne budete na mreži; bez spremljene kopije, {{ui:Otvori primjer lokacije}} ne uspijeva s porukom „Primjer se nije mogao učitati”.
:::

:::tip
Za terenski rad spremite CivilCraft za rad izvan mreže i prenesite datoteke s točkama na samo prijenosno računalo. Projekti i izvozi spremaju se kao preuzimanja bez veze, pa možete uvesti mjerenja jednog dana, provjeriti površinu i spremiti projekt na terenu.
:::

Spremanje u oblak još nije dostupno, a desktop verzije još nisu objavljene. Trenutno su datoteke koje spremite jedina kopija: čuvajte ih na mjestu koje se sigurnosno kopira.

## Dodaci koje datoteka koristi

Kada spremite projekt koji sadrži podatke iz dodatka (oznake propisa o gradnji ili izvor lokacije Adresa), datoteka bilježi koji su dodaci i koje verzije. Otvorite je na računalu koje ga nema i traka iznad tlocrta to će reći i ponudit će dodavanje s popisa vašeg računa. Zapis je samo bilješka: datoteka se otvara u svakom slučaju.

## Poništavanje iz Studija

Unutar CadCraft Studija, svaki korak koji završite u CivilCraftu prijavljuje se Studiju, pa njegovo poništavanje na razini projekta može poništiti posljednji korak preko aplikacija. Studio poništava korak samo kada je CivilCraftov vlastiti niz poništavanja upravo onakav kakvog ga je taj korak ostavio; nakon što otvorite drugu datoteku, on preskače ovaj prozor.

## Zatvaranje s nespremljenim promjenama

Kada projekt ima nespremljene promjene i zatvorite karticu, ponovno učitate stranicu ili napustite stranicu, preglednik pita želite li otići. Njegov tekst i izgled pripadaju pregledniku i CivilCraft ih ne može mijenjati. {{ui:Novo}} te otvaranje projekta ili LandXML datoteke umjesto toga pitaju u CivilCraftovom vlastitom okviru **Nespremljene promjene**, uz {{ui:Odustani}}, {{ui:Ne spremaj}} i {{ui:Spremi kopiju}}.
