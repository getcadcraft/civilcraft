---
title: Datoteke koje možeš otvoriti, spasiti i izvesti
summary: Ulazne datoteke: tačke, LandXML i projekti CivilCraft; izlazne: projekti, LandXML, DXF i PDF; šta se čuva, gdje završavaju datoteke i šta se mijenja van mreže.
keywords: otvori, spasi, izvezi, uvezi, formati datoteka, csv, txt, landxml, xml, dxf, pdf, json, preuzmi, datoteka projekta
from: 82bff559
---

CivilCraft otvara datoteke sa tvog računara, a spašava ih tako što ih preuzima nazad na računar. Ništa se ne šalje i ništa se ne čuva na serveru. Vidi i [Tvoje datoteke](common:your-files).

## Šta otvara

Klikni {{ui:Open}} (ili pritisni {{key:Mod+O}}) i odaberi datoteku, ili prevuci datoteku iz {{pick:mac=Finder|windows=File Explorer|linux=tvoj upravitelj datoteka}} na plan. Jedna po jedna datoteka; datoteke veće od 200 MB se odbijaju. LandXML ili datoteka projekta veća od 32 MB čita se u dijelovima od oko 4 MB, nikad kao jedan blok teksta. Dok se LandXML otvara, očekuj da koristi otprilike 13 puta veću memoriju od veličine datoteke (datoteka od 69 MB koristila je oko 0,9 GB u našem testu).

| Vrsta | Nazivi datoteka | Šta se dešava |
|---|---|---|
| Datoteka tačaka | `.csv`, `.txt`, `.pnt`, `.xyz` (bilo koja tekstualna datoteka) | Otvara se dijalog **Uvoz tačaka**. Tačke zamjenjuju tačke projekta; osi trase, platoi i cijevi ostaju. |
| LandXML | `.xml`, `.landxml` | Iz datoteke se pravi **novi projekat** (prvo ćeš biti upitan ako trenutni ima nespašene promjene). |
| Projekat CivilCraft | `.civilcraft.json` (bilo koji `.json`) | Projekat se otvara onako kako je spašen (prvo ćeš biti upitan ako trenutni ima nespašene promjene). |

CivilCraft odlučuje prema nastavku datoteke, pa prema prvim znakovima: tekst koji počinje znakom `{` čita se kao projekat, tekst koji počinje znakom `<` kao LandXML, a sve ostalo kao datoteka tačaka. Datoteka koju birač otvaranja sivi i dalje se može prevući na plan.

:::note
Uvoz datoteke tačaka u projekat koji već ima tačke zamjenjuje ih bez pitanja i briše istoriju poništavanja (otvaranje bilo koje datoteke je novi početak za poništavanje). Ako je površ nastala iz LandXML-a, uvoz tačaka je vraća na površ izgrađenu iz tačaka. Prvo spasi ako bi možda htio stare tačke nazad.
:::

Detalji: [Formati datoteka tačaka](topic:point-file-formats), [LandXML: šta se čita i piše](topic:landxml-reference).

## Šta spašava

{{ui:Save}} ({{key:Mod+S}}) piše dvije datoteke jednu uz drugu, nazvane po **Naziv** u lijevom panelu: `<naziv>.civilcraft.json`, projekat koji nastavljaš uređivati, i `<naziv>.ifc`, isti projekat u IFC 4.3 za sve ostale (vidi [IFC izvoz i uvoz](topic:ifc)). Svaka datoteka pamti drugu, a IFC također nosi komprimiranu kopiju projekta, pa se IFC poslan sam za sebe i dalje može otvoriti u punoj mogućnosti uređivanja.

- **U CadCraft Studiju** obje datoteke se pišu jedna pored druge, na istom mjestu.
- **U Chrome i Edge** prvo spašavanje traži folder i u njega piše obje datoteke; sljedeća spašavanja idu u isti folder. Otkaži pitanje o folderu da bi se obje umjesto toga preuzele.
- **U drugim preglednicima** obje datoteke se preuzimaju, prvo datoteka projekta.

Otvaranje bilo koje od njih traži drugu. Otvori obje zajedno (ili ih prevuci obje) ili otvori jednu: u Studiju se druga nalazi u istom folderu; u pregledniku CivilCraft te pita da je dodaš ili da nastaviš s onom koju imaš. Ako je IFC promijenio drugi program nakon što ga je CivilCraft spasio, ili je jedna datoteka starija od druge, projekat se otvara iz novijeg nacrta, a panel **Problemi** kaže šta se desilo, uz **Spasi sada** (piše obje datoteke ponovo) i **Prikaži geometriju IFC-a kao referencu**. IFC koji je sam promijenio drugi program otvara se iz svoje kopije projekta sa onim što i dalje odgovara: osi trase koje je promijenio uzimaju njegovu geometriju, objekti koje je uklonio se izostavljaju, a ostale promjene su navedene, ali se ne preuzimaju. Datoteka projekta starija od 0.7.1 otvara se kao i ranije.

Datoteka projekta čuva:

- svaku tačku (broj, koordinate, kotu, opis) i naziv datoteke tačaka iz koje potiču
- postavke površi: izbore grupa, nacrtane linije loma, granicu, najdužu vanjsku ivicu i TIN pročitan iz LandXML-a
- postavke prikaza
- osi trase sa njihovim PI-jevima, radijusima i početnom stacionažom, njihove projektovane profile (PVI-jevi i dužine krivina) i postavke koridora
- platoe i mrežu cijevi sa njenim pravilima

Ne čuva istoriju poništavanja. Površi, konture, linije dnevnog svjetla i zapremine se ne čuvaju; ponovo se grade iz spašenih ulaza kad se projekat otvori. Datoteka projekta iz novijeg CivilCraft-a se odbija uz poruku koja navodi njenu verziju.

## Šta izvozi

| Dugme | Datoteka | Sadržaj |
|---|---|---|
| {{ui:LandXML}} | `<naziv>.xml` | LandXML 1.2: tačke, postojeći teren (i izgrađena površ kad postoji) kao TIN površi, osi trase, teren i projektovani profili, mreža cijevi |
| {{ui:DXF}} | `<naziv>.dxf` | R12 DXF linija plana kakve se prikazuju, na imenovanim slojevima |
| {{ui:DWG}} | `<naziv>.dwg` | Iste linije kao DWG crtež, u formatu koji odabereš (2000 do 2018) |
| {{ui:PDF}} | `<naziv>.pdf` | Vektorski ispis plana na listu, u razmjeri koju odabereš |
| {{ui:GLB}} ili {{ui:OBJ}} (na traci 3D pogleda) | `<naziv>-3d.glb`, `<naziv>-3d.obj` | Ono što 3D pogled prikazuje kao 3D model: metri, Y prema gore, prava razmjera, oko zabilježenog lokalnog ishodišta |

Šta svaki izostavlja: [Razmjena LandXML](topic:landxml), [Izvoz plana u DXF](topic:dxf-export) (DWG također), [Ispis plana u PDF](topic:plot-pdf), [Izvoz lokacije u 3D](topic:export-3d).

## Gdje završavaju datoteke

Spašene i izvezene datoteke idu gdje tvoj preglednik stavlja preuzimanja, obično u folder Preuzimanja. Da svaki put odabereš folder:

:::chromium
Otvori **Postavke** preglednika, zatim **Preuzimanja**, i uključi **Pitaj gdje da spasim svaku datoteku prije preuzimanja**.
:::

:::firefox
Otvori **Postavke**, zatim **Općenito**, i pod **Datoteke i aplikacije** odaberi **Uvijek pitaj gdje da spasim datoteke**.
:::

:::safari
Otvori **Safari > Postavke > Općenito** i postavi **Lokacija preuzimanja datoteka** na **Pitaj za svako preuzimanje**.
:::

Ako spašavaš dvaput istim nazivom, preglednik može dodati broj drugoj datoteci, na primjer `Lokacija (1).civilcraft.json`. Sljedeći put otvori najnoviju.

## Online i offline

CivilCraft u oba slučaja radi samo na tvom računaru: otvaranje čita datoteku u pregledniku, a spašavanje je preuzima. Da otvoriš CivilCraft bez ikakve veze, prvo ga spasi za rad van mreže:

1. Dok si na mreži, klikni {{ui:Save for offline}} na traci aplikacije na vrhu.
2. Dugme broji ("Spašavanje 12 od 30") i zatim prikazuje {{ui:Offline ready}}. CivilCraft je mali (oko 0,6 MB), pa to traje tren. Spašena kopija uključuje ovu pomoć i primjer lokacije.
3. Bez veze otvori istu adresu (ili oznaku te adrese). Sve radi, uključujući {{ui:Open the sample site}}.

Ostala stanja dugmeta:

- {{ui:Could not save}}: neke datoteke se nisu preuzele. Provjeri vezu i klikni da pokušaš ponovo.
- {{ui:Offline not available}}: ovaj prozor preglednika ne može čuvati kopiju za rad van mreže (privatni prozori i neki upravljani računari to blokiraju). Koristi običan prozor.

Klikni {{ui:Offline ready}} da vidiš kad je kopija spašena, uz dva izbora: {{ui:Save again (get the newest version)}} i {{ui:Remove the offline copy}}. Spasi ponovo prije posjete lokaciji da kopija odgovara najnovijoj verziji. Više u [Rad van mreže](common:offline).

:::offline
Van mreže si sada. Ako je CivilCraft spašen za rad van mreže, sve radi, uključujući primjer lokacije. Ako nije, nastavi raditi u ovoj kartici, ali je ne ponovo učitavaj dok nisi ponovo na mreži; bez spašene kopije, {{ui:Open the sample site}} ne uspijeva s porukom "Primjer lokacije nije mogao biti učitan".
:::

:::tip
Za rad na terenu spasi CivilCraft za rad van mreže i nosi datoteke tačaka na sam laptop. Projekti i izvozi se bez veze spašavaju kao preuzimanja, pa možeš uvesti snimke jednog dana, provjeriti površ i spasiti projekat na terenu.
:::

Spašavanje u oblaku još nije dostupno, a desktop verzije još nisu izašle. Za sada su datoteke koje spasiš jedina kopija: čuvaj ih negdje gdje se pravi sigurnosna kopija.

## Dodaci koje datoteka koristi

Kad spasiš projekat koji sadrži podatke iz dodatka (kvačice Građevinski propisi ili izvor Adresa do lokacije), datoteka bilježi koji su dodaci i koje verzije. Otvori je na računaru koji nema neki od njih i traka iznad plana to kaže i nudi da ga doda sa liste tvog računa. Zapis je samo bilješka: datoteka se otvara u svakom slučaju.

## Poništavanje iz Studija

Unutar CadCraft Studija svaki korak koji završiš u CivilCraftu javlja se Studiju, pa njegovo poništavanje na nivou projekta može poništiti posljednji korak u svim aplikacijama. Studio poništava korak samo kad je CivilCraftov stog poništavanja tačno u stanju u kojem ga je taj korak ostavio; nakon što otvoriš drugu datoteku, preskače ovaj prozor.

## Zatvaranje sa nespašenim promjenama

Kad projekat ima nespašene promjene, a ti zatvoriš karticu, osvježiš stranicu ili napustiš stranicu, preglednik pita želiš li otići. Njegov tekst i izgled pripadaju pregledniku i CivilCraft ih ne može mijenjati. {{ui:New}} i otvaranje projekta ili LandXML datoteke pitaju u CivilCraftovom vlastitom okviru **Nespašene promjene**, s dugmadima {{ui:Cancel}}, {{ui:Don’t save}} i {{ui:Save a copy}}.
