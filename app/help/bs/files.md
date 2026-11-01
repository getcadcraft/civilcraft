---
title: Datoteke koje možete otvoriti, spasiti i izvesti
summary: Ulaz: datoteke tačaka, LandXML i CivilCraft projekti; izlaz: projekti, LandXML, DXF i PDF; šta se čuva, gdje datoteke idu i šta se mijenja van mreže.
keywords: otvori, spasi, izvezi, uvezi, formati datoteka, csv, txt, landxml, xml, dxf, pdf, json, preuzimanje, datoteka projekta
from: a7debb61
---

CivilCraft otvara datoteke sa vašeg računara i čuva ih preuzimanjem nazad na računar. Ništa se ne otprema i ništa se ne čuva na serveru. Pogledajte i [Vaše datoteke](common:your-files).

## Šta otvara

Kliknite {{ui:Otvori}} (ili pritisnite {{key:Mod+O}}) i odaberite datoteku, ili prevucite datoteku iz {{pick:mac=Finder|windows=File Explorer|linux=vašeg upravljača datotekama}} na plan. Jedna datoteka u jednom trenutku; datoteke veće od 200 MB se odbijaju.

| Vrsta | Nazivi datoteka | Šta se dešava |
|---|---|---|
| Datoteka tačaka | `.csv`, `.txt`, `.pnt`, `.xyz` (bilo koja tekstualna datoteka) | Otvara se dijalog **Uvezi tačke**. Tačke zamjenjuju tačke projekta; trase, platoi i cijevi ostaju. |
| LandXML | `.xml`, `.landxml` | Iz datoteke se pravi **novi projekat** (prvo se pita ako trenutni ima nespašene promjene). |
| CivilCraft projekat | `.civilcraft.json` (bilo koji `.json`) | Projekat se otvara onakav kakav je spašen (prvo se pita ako trenutni ima nespašene promjene). |

CivilCraft odlučuje prema nastavku datoteke, pa zatim prema prvim znakovima: tekst koji počinje sa `{` čita se kao projekat, tekst koji počinje sa `<` kao LandXML, a sve ostalo kao datoteka tačaka. Datoteka koju prozor za otvaranje sivi i dalje se može prevući na plan.

:::note
Uvoz datoteke tačaka u projekat koji već ima tačke zamjenjuje ih bez pitanja i briše istoriju poništavanja (otvaranje bilo koje datoteke je nov početak za poništavanje). Ako je površina došla iz LandXML-a, uvoz tačaka je vraća na površinu izgrađenu iz tačaka. Prvo spasite ako biste možda htjeli stare tačke nazad.
:::

Detalji: [Formati datoteka tačaka](topic:point-file-formats), [LandXML: šta se čita i piše](topic:landxml-reference).

## Šta se čuva

{{ui:Spasi}} ({{key:Mod+S}}) upisuje dvije datoteke jednu pored druge, nazvane prema polju **Naziv** u lijevom panelu: `<naziv>.civilcraft.json`, projekat koji nastavljate da uređujete, i `<naziv>.ifc`, isti projekat kao IFC 4.3 za sve ostale (vidi [IFC izvoz i uvoz](topic:ifc)). Svaka datoteka pamti drugu, a IFC takođe nosi kompresovanu kopiju projekta, pa se IFC poslan samostalno i dalje može otvoriti kao potpuno izmjenjiv.

- **U Studio-u** obje datoteke se upisuju jedna pored druge, na istom mjestu.
- **U Chrome-u i Edge-u** prvo spašavanje traži folder i upisuje obje datoteke u njega; kasnija spašavanja idu u isti folder. Otkažite pitanje o folderu da biste umjesto toga preuzeli obje datoteke.
- **U drugim pregledačima** obje datoteke se preuzimaju, prvo datoteka projekta.

Otvaranje bilo koje datoteke traži drugu. Otvorite obje zajedno (ili ih obje prevucite) ili otvorite jednu: u Studio-u se druga pronalazi u istom folderu; u pregledaču CivilCraft vas pita da je dodate ili da nastavite s onom koju imate. Ako je IFC promijenio drugi program nakon što ga je CivilCraft spasio, ili je jedna datoteka starija od druge, projekat se otvara iz novijeg projekta, a panel **Problemi** kaže šta se desilo, uz **Spasi odmah** (ponovo upisuje obje datoteke) i **Prikaži geometriju IFC-a kao referencu**. IFC koji je sam promijenio drugi program otvara se iz svoje kopije projekta sa onim što se još slaže: trase koje je promijenio uzimaju njegovu geometriju, objekti koje je uklonio su izostavljeni, a ostale promjene su navedene, ali se ne preuzimaju. Datoteka projekta starija od 0.7.1 otvara se kao i ranije.

Datoteka projekta čuva:

- svaku tačku (broj, koordinate, kotu, opis) i naziv datoteke tačaka iz koje potiče
- postavke površine: izbor grupa, nacrtane prelomne linije, granicu, najduži vanjski rub i TIN pročitan iz LandXML-a
- postavke prikaza
- trase sa njihovim PI tačkama, radijusima i početnom stacionažom, njihove projektovane profile (PVI i dužine krivina) i postavke koridora
- platoe i mrežu cijevi sa njenim pravilima

Ne čuva istoriju poništavanja. Površine, izohipse, linije presjeka s terenom i zapremine se ne čuvaju; ponovo se grade iz spašenih ulaza kada se projekat otvori. Datoteka projekta iz novijeg CivilCraft-a se odbija uz poruku koja navodi njegovu verziju.

## Šta se izvozi

| Dugme | Datoteka | Sadržaj |
|---|---|---|
| {{ui:LandXML}} | `<naziv>.xml` | LandXML 1.2: tačke, postojeći teren (i nivelisana površina kada postoji) kao TIN površine, trase, profili terena i projektovani profili, mreža cijevi |
| {{ui:DXF}} | `<naziv>.dxf` | R12 DXF linija plana onako kako je prikazan, na imenovanim slojevima |
| {{ui:DWG}} | `<naziv>.dwg` | Iste linije kao DWG crtež, u formatu koji odaberete (2000 do 2018) |
| {{ui:PDF}} | `<naziv>.pdf` | Vektorski ispis plana na listu, u razmjeri koju odaberete |
| {{ui:GLB}} ili {{ui:OBJ}} (na traci 3D prikaza) | `<naziv>-3d.glb`, `<naziv>-3d.obj` | Ono što 3D prikaz pokazuje kao 3D model: metri, Y prema gore, prava razmjera, oko zabilježenog lokalnog početka |

Šta svaki od njih izostavlja: [Razmjena LandXML-a](topic:landxml), [Izvoz plana u DXF](topic:dxf-export) (DWG takođe), [Iscrtavanje plana u PDF](topic:plot-pdf), [Izvoz lokacije u 3D](topic:export-3d).

## Gdje idu datoteke

Spašene i izvezene datoteke idu tamo gdje pregledač smješta preuzimanja, obično u folder Preuzimanja. Da biste svaki put birali folder:

:::chromium
Otvorite **Postavke** pregledača, zatim **Preuzimanja**, i uključite **Pitaj gdje da spasim svaku datoteku prije preuzimanja**.
:::

:::firefox
Otvorite **Postavke**, zatim **Općenito**, i pod **Datoteke i aplikacije** odaberite **Uvijek me pitaj gdje da spasim datoteke**.
:::

:::safari
Otvorite **Safari > Postavke > Općenito** i postavite **Lokacija za preuzimanje datoteka** na **Pitaj za svako preuzimanje**.
:::

Ako spasite dva puta s istim nazivom, pregledač može dodati broj drugoj datoteci, na primjer `Site (1).civilcraft.json`. Sljedeći put otvorite najnoviju.

## Na mreži i van mreže

CivilCraft u svakom slučaju radi samo na vašem računaru: otvaranje čita datoteku u pregledaču, spašavanje je preuzima. Da biste otvorili CivilCraft bez ikakve veze, prvo ga spasite za rad van mreže:

1. Dok ste na mreži, kliknite {{ui:Spasi za rad van mreže}} na traci aplikacije na vrhu.
2. Dugme broji ("Spašavanje 12 od 30") i zatim prikazuje {{ui:Spremno za rad van mreže}}. CivilCraft je mali (oko 0.6 MB), pa ovo traje trenutak. Spašena kopija uključuje ovu pomoć i primjer lokacije.
3. Bez veze otvorite istu adresu (ili njenu oznaku). Sve radi, uključujući {{ui:Otvori primjer lokacije}}.

Ostala stanja dugmeta:

- {{ui:Nije moguće spasiti}}: neke datoteke nisu preuzete. Provjerite vezu i kliknite da pokušate ponovo.
- {{ui:Rad van mreže nije dostupan}}: ovaj prozor pregledača ne može sačuvati kopiju za rad van mreže (privatni prozori i neki upravljani računari to blokiraju). Koristite običan prozor.

Kliknite {{ui:Spremno za rad van mreže}} da vidite kada je kopija spašena, uz dva izbora: {{ui:Spasi ponovo (preuzmi najnoviju verziju)}} i {{ui:Ukloni kopiju za rad van mreže}}. Spasite ponovo prije posjete lokaciji da kopija odgovara najnovijoj verziji. Više u [Van mreže](common:offline).

:::offline
Trenutno ste van mreže. Ako je CivilCraft spašen za rad van mreže, sve radi, uključujući primjer lokacije. Ako nije, nastavite raditi u ovoj kartici, ali je ne ponovo učitavajte dok ne budete ponovo na mreži; bez spašene kopije, {{ui:Otvori primjer lokacije}} ne uspijeva uz poruku "Uzorak nije mogao biti učitan".
:::

:::tip
Za rad na terenu spasite CivilCraft za rad van mreže i nosite datoteke tačaka na samom laptopu. Projekti i izvozi se spašavaju kao preuzimanja bez veze, pa možete uvesti mjerenja jednog dana, provjeriti površinu i spasiti projekat na terenu.
:::

Spašavanje u oblaku još nije dostupno, a desktop verzije još nisu objavljene. Za sada su datoteke koje spasite jedina kopija: čuvajte ih negdje gdje se pravi rezervna kopija.

## Dodaci koje datoteka koristi

Kada spasite projekat koji sadrži podatke iz dodatka (oznake Građevinskih propisa ili izvor Adresa do lokacije), datoteka bilježi koji dodaci i koje verzije. Kada je otvorite na računaru koji ga nema, traka iznad plana to kaže i nudi da ga dodate s liste vašeg računa. Zapis je samo napomena: datoteka se otvara u svakom slučaju.

## Poništavanje iz Studio-a

Unutar CadCraft Studio-a, svaki korak koji završite u CivilCraft-u se javlja Studio-u, pa njegovo poništavanje na nivou projekta može vratiti posljednji korak preko svih aplikacija. Studio poništava korak samo kada je sam stek poništavanja CivilCraft-a tačno u stanju u kojem ga je taj korak ostavio; nakon što otvorite drugu datoteku, preskače ovaj prozor.

## Zatvaranje sa nespašenim promjenama

Kada projekat ima nespašene promjene i zatvorite karticu, ponovo učitate stranicu ili napustite stranicu, pregledač pita želite li da odete. Tekst i izgled pripadaju pregledaču i CivilCraft ih ne može promijeniti. {{ui:Novo}}, kao i otvaranje projekta ili LandXML datoteke, pitaju umjesto toga u CivilCraft-ovom okviru **Nespašene promjene**, sa {{ui:Otkaži}}, {{ui:Ne spašavaj}} i {{ui:Spasi kopiju}}.
