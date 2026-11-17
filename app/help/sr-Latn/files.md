---
title: Datoteke koje možete otvoriti, sačuvati i izvesti
summary: Datoteke sa tačkama, LandXML i CivilCraft projekti za uvoz; projekti, LandXML, DXF i PDF za izvoz; šta svaka čuva, gde datoteke odlaze i šta se menja van mreže.
keywords: otvori, sačuvaj, izvoz, uvoz, formati datoteka, csv, txt, landxml, xml, dxf, pdf, json, preuzimanje, datoteka projekta
from: 82bff559
---

CivilCraft otvara datoteke sa vašeg računara, a čuva ih tako što ih preuzima nazad na računar. Ništa se ne otprema i ništa se ne čuva na serveru. Pogledajte i [Vaše datoteke](common:your-files).

## Šta otvara

Kliknite {{ui:Open}} (ili pritisnite {{key:Mod+O}}) i izaberite datoteku, ili prevucite datoteku iz {{pick:mac=Finder|windows=Istraživač datoteka|linux=vašeg upravljača datotekama}} na plan. Jedna datoteka u jednom trenutku; datoteke veće od 200 MB se odbijaju. LandXML ili datoteka projekta veća od 32 MB čita se u delovima od oko 4 MB, nikada kao jedan blok teksta. Dok se LandXML otvara, očekujte da koristi oko 13 puta veličinu datoteke u memoriji (datoteka od 69 MB koristila je oko 0.9 GB u našem testu).

| Vrsta | Nazivi datoteka | Šta se dešava |
|---|---|---|
| Datoteka tačaka | `.csv`, `.txt`, `.pnt`, `.xyz` (bilo koja tekstualna datoteka) | Otvara se dijalog **Uvoz tačaka**. Tačke zamenjuju tačke projekta; osovine trase, platoi i cevi ostaju. |
| LandXML | `.xml`, `.landxml` | Od datoteke se pravi **novi projekat** (prvo ćete biti pitani ako trenutni ima nesačuvane izmene). |
| Projekat CivilCraft | `.civilcraft.json` (bilo koji `.json`) | Projekat se otvara onakav kakav je sačuvan (prvo ćete biti pitani ako trenutni ima nesačuvane izmene). |

CivilCraft odlučuje po nastavku datoteke, a zatim po prvim znakovima: tekst koji počinje sa `{` čita se kao projekat, tekst koji počinje sa `<` kao LandXML, a sve ostalo kao datoteka tačaka. Datoteku koju prozor za otvaranje prikazuje sivo i dalje možete prevući na plan.

:::note
Uvoz datoteke tačaka u projekat koji već ima tačke zamenjuje ih bez pitanja i briše istoriju opozivanja (otvaranje bilo koje datoteke je nov početak za opozivanje). Ako je površ nastala iz LandXML-a, uvoz tačaka je vraća na površ izgrađenu od tačaka. Prvo sačuvajte ako možda želite stare tačke nazad.
:::

Detalji: [Formati datoteka sa tačkama](topic:point-file-formats), [LandXML: šta se čita i piše](topic:landxml-reference).

## Šta čuva

{{ui:Save}} ({{key:Mod+S}}) upisuje dve datoteke jednu uz drugu, nazvane po **Naziv** u levom panelu: `<naziv>.civilcraft.json`, projekat koji nastavljate da uređujete, i `<naziv>.ifc`, isti projekat u IFC 4.3 za sve ostale (pogledajte [IFC izvoz i uvoz](topic:ifc)). Svaka datoteka pominje drugu, a IFC takođe nosi komprimovanu kopiju projekta, tako da se IFC poslat sam za sebe i dalje otvara potpuno izmenljiv.

- **U Studiju** obe datoteke se upisuju jedna pored druge, na istom mestu.
- **U Chrome-u i Edge-u** prvo čuvanje traži fasciklu i upisuje obe u nju; kasnija čuvanja idu u istu fasciklu. Otkažite pitanje o fascikli da biste umesto toga obe preuzeli.
- **U drugim pregledačima** obe datoteke se preuzimaju, prvo datoteka projekta.

Otvaranje bilo koje od njih traži drugu. Otvorite obe zajedno (ili prevucite obe), ili otvorite jednu: u Studiju se druga nalazi u istoj fascikli; u pregledaču CivilCraft pita da je dodate, ili da nastavite sa onom koju imate. Ako je IFC promenio drugi program nakon što ga je CivilCraft sačuvao, ili je jedna datoteka starija od druge, projekat se otvara iz novijeg crteža, a panel Problemi kaže šta se desilo, uz **Sačuvaj sada** (ponovo upisuje obe datoteke) i **Prikaži geometriju IFC-a kao referencu**. IFC sam za sebe koji je promenio drugi program otvara se iz svoje kopije projekta sa onim što i dalje odgovara: osovine koje je promenio uzimaju njenu geometriju, objekti koje je obrisao se izostavljaju, a ostale promene se navode, ali se ne preuzimaju. Datoteka projekta iz verzije pre 0.7.1 otvara se kao i ranije.

Projekat čuva:

- svaku tačku (broj, koordinate, kotu, opis) i naziv datoteke tačaka iz koje potiču
- podešavanja površi: izbore grupa, nacrtane prelomne linije, granicu, najdužu spoljnu ivicu i TIN pročitan iz LandXML-a
- podešavanja prikaza
- osovine trase sa PI tačkama, poluprečnicima i početnom stacionažom, njihove projektovane profile (PVI tačke i dužine krivina) i podešavanja koridora
- platoe i mrežu cevi sa njenim pravilima

Ne čuva istoriju opozivanja. Površi, izohipse, linije preseka sa terenom i zapremine se ne čuvaju; ponovo se grade iz sačuvanih ulaza kada se projekat otvori. Datoteka projekta iz novijeg CivilCraft-a se odbija uz poruku koja navodi njenu verziju.

## Šta izvozi

| Dugme | Datoteka | Sadržaj |
|---|---|---|
| {{ui:LandXML}} | `<naziv>.xml` | LandXML 1.2: tačke, postojeći teren (i projektovana površ kada postoji) kao TIN površi, osovine trase, profili terena i projektovani profili, mreža cevi |
| {{ui:DXF}} | `<naziv>.dxf` | R12 DXF linija plana onako kako se prikazuje, na imenovanim slojevima |
| {{ui:DWG}} | `<naziv>.dwg` | Iste linije kao DWG crtež, u formatu koji izaberete (2000 do 2018) |
| {{ui:PDF}} | `<naziv>.pdf` | Vektorski ispis plana na listu, u razmeri koju izaberete |
| {{ui:GLB}} ili {{ui:OBJ}} (na traci 3D prikaza) | `<naziv>-3d.glb`, `<naziv>-3d.obj` | Ono što 3D prikaz pokazuje kao 3D model: u metrima, Y gore, prava razmera, oko zabeležene lokalne tačke porekla |

Šta svaki izostavlja: [Razmena LandXML](topic:landxml), [Izvoz plana u DXF](topic:dxf-export) (i DWG), [Ispis plana u PDF](topic:plot-pdf), [Izvoz lokacije u 3D](topic:export-3d).

## Gde datoteke odlaze

Sačuvane i izvezene datoteke idu tamo gde pregledač smešta preuzimanja, obično u fasciklu Preuzimanja. Da biste svaki put birali fasciklu:

:::chromium
Otvorite **Podešavanja** pregledača, zatim **Preuzimanja**, i uključite **Pitaj gde da sačuvam svaku datoteku pre preuzimanja**.
:::

:::firefox
Otvorite **Podešavanja**, zatim **Opšte**, i pod **Datoteke i aplikacije** izaberite **Uvek me pitaj gde da sačuvam datoteke**.
:::

:::safari
Otvorite **Safari > Podešavanja > Opšte** i postavite **Lokacija za preuzimanje datoteka** na **Pitaj za svako preuzimanje**.
:::

Ako sačuvate dva puta istim imenom, pregledač drugoj datoteci može dodati broj, na primer `Lokacija (1).civilcraft.json`. Sledeći put otvorite najnoviju.

## Na mreži i van mreže

CivilCraft u oba slučaja radi samo na vašem računaru: otvaranje čita datoteku u pregledaču, a čuvanje je preuzima. Da biste otvorili CivilCraft bez ikakve veze, prvo ga sačuvajte za rad van mreže:

1. Dok ste na mreži, kliknite {{ui:Save for offline}} na traci aplikacije na vrhu.
2. Dugme broji („Čuva se 12 od 30“), a zatim prikazuje {{ui:Offline ready}}. CivilCraft je mali (oko 0.6 MB), pa ovo traje trenutak. Sačuvana kopija uključuje ovu pomoć i primer lokacije.
3. Bez veze otvorite istu adresu (ili obeleživač na nju). Sve radi, uključujući {{ui:Open the sample site}}.

Ostala stanja dugmeta:

- {{ui:Could not save}}: neke datoteke nisu preuzete. Proverite vezu i kliknite da pokušate ponovo.
- {{ui:Offline not available}}: ovaj prozor pregledača ne može da čuva kopiju za rad van mreže (privatni prozori i neki upravljani računari to blokiraju). Koristite običan prozor.

Kliknite {{ui:Offline ready}} da vidite kada je kopija sačuvana, uz dva izbora: {{ui:Save again (get the newest version)}} i {{ui:Remove the offline copy}}. Ponovo sačuvajte pre posete lokaciji, da kopija odgovara najnovijoj verziji. Više u [Van mreže](common:offline).

:::offline
Trenutno ste van mreže. Ako je CivilCraft sačuvan za rad van mreže, sve radi, uključujući primer lokacije. Ako nije, nastavite da radite u ovoj kartici, ali je ne osvežavajte dok ponovo ne budete na mreži; bez sačuvane kopije, {{ui:Open the sample site}} ne uspeva sa porukom „Primer nije mogao da se učita“.
:::

:::tip
Za rad na terenu sačuvajte CivilCraft za rad van mreže i donesite datoteke tačaka na sam laptop. Projekti i izvozi se čuvaju kao preuzimanja bez veze, pa možete da uvezete snimke jednog dana, proverite površ i sačuvate projekat na terenu.
:::

Usluga čuvanja u oblaku još nije dostupna, a desktop verzije još nisu izašle. Za sada su datoteke koje sačuvate jedina kopija: čuvajte ih na mestu koje se pravi rezervno.

## Dodaci koje datoteka koristi

Kada sačuvate projekat koji sadrži podatke iz dodatka (kvačice Propisi o zgradama ili izvor Adresa u lokaciju), datoteka beleži koji dodaci i koje verzije. Ako je otvorite na računaru koji ga nema, traka iznad plana to kaže i nudi da ga dodate sa spiska na vašem nalogu. Zapis je samo beleška: datoteka se otvara u svakom slučaju.

## Opozivanje iz Studija

Unutar CadCraft Studija svaki korak koji završite u CivilCraft-u se saopštava Studiju, pa njegovo opozivanje na nivou projekta može da vrati poslednji korak preko aplikacija. Studio opoziva korak samo kada je opozivni stek CivilCraft-a tačno onakav kakav ga je taj korak ostavio; posle otvaranja druge datoteke preskače ovaj prozor.

## Zatvaranje sa nesačuvanim izmenama

Kada projekat ima nesačuvane izmene i zatvorite karticu, osvežite stranicu ili napustite stranicu, pregledač pita da li želite da odete. Njegov tekst i izgled pripadaju pregledaču, a CivilCraft ih ne može promeniti. {{ui:New}}, kao i otvaranje projekta ili LandXML datoteke, pitaju u sopstvenom okviru CivilCraft-a **Nesačuvane izmene**, sa {{ui:Cancel}}, {{ui:Don’t save}} i {{ui:Save a copy}}.
