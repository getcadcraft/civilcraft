---
title: Datoteke koje možete otvoriti, sačuvati i izvesti
summary: Datoteke sa tačkama, LandXML i projekti CivilCraft-a se uvoze; projekti, LandXML, DXF i PDF se izvoze; šta svaka datoteka čuva, gde idu datoteke i šta se menja van mreže.
keywords: otvori, sačuvaj, izvoz, uvoz, formati datoteka, csv, txt, landxml, xml, dxf, pdf, json, preuzimanje, datoteka projekta
from: a7debb61
---

CivilCraft otvara datoteke sa vašeg računara, a čuva ih tako što ih preuzima nazad na računar. Ništa se ne otprema i ništa se ne čuva na serveru. Pogledajte i [Vaše datoteke](common:your-files).

## Šta se otvara

Klikni {{ui:Otvori}} (ili pritisni {{key:Mod+O}}) i izaberi datoteku, ili prevuci datoteku iz {{pick:mac=Finder|windows=File Explorer|linux=vašeg upravljača datotekama}} na plan. Jedna datoteka u isti mah; datoteke veće od 200 MB se odbijaju.

| Vrsta | Imena datoteka | Šta se dešava |
|---|---|---|
| Datoteka sa tačkama | `.csv`, `.txt`, `.pnt`, `.xyz` (bilo koja tekstualna datoteka) | Otvara se dijalog **Uvezi tačke**. Tačke zamenjuju tačke projekta; trase, platoi i cevi ostaju. |
| LandXML | `.xml`, `.landxml` | Od datoteke se pravi **novi projekat** (pre toga se pita ako trenutni projekat ima nesačuvane izmene). |
| Projekat CivilCraft-a | `.civilcraft.json` (bilo koji `.json`) | Projekat se otvara onako kako je sačuvan (pre toga se pita ako trenutni projekat ima nesačuvane izmene). |

CivilCraft odlučuje po nastavku imena datoteke, a zatim po prvim znakovima: tekst koji počinje sa `{` se čita kao projekat, tekst koji počinje sa `<` kao LandXML, a sve ostalo kao datoteka sa tačkama. Datoteka koju prozor za otvaranje sivi i dalje može da se prevuče na plan.

:::note
Uvoz datoteke sa tačkama u projekat koji već ima tačke zamenjuje ih bez pitanja i briše istoriju opozivanja (otvaranje bilo koje datoteke je svež početak za opozivanje). Ako je površ nastala iz LandXML-a, uvoz tačaka je vraća na površ izgrađenu od tačaka. Sačuvaj pre toga ako možda želiš stare tačke nazad.
:::

Detalji: [Formati datoteka sa tačkama](topic:point-file-formats), [LandXML: šta se čita i piše](topic:landxml-reference).

## Šta se čuva

{{ui:Sačuvaj}} ({{key:Mod+S}}) piše dve datoteke jednu pored druge, nazvane po **Naziv** u levom panelu: `<naziv>.civilcraft.json`, projekat koji nastavljate da uređujete, i `<naziv>.ifc`, isti projekat u IFC 4.3 za sve ostale (pogledajte [IFC izvoz i uvoz](topic:ifc)). Svaka datoteka pominje drugu, a IFC takođe nosi komprimovanu kopiju projekta, pa se IFC poslat sam za sebe i dalje može otvoriti potpuno izmenjiv.

- **U Studiju** obe datoteke se pišu jedna pored druge, na istom mestu.
- **U Chrome i Edge** prvo čuvanje pita za fasciklu i u nju piše obe datoteke; kasnija čuvanja idu u istu fasciklu. Otkaži pitanje o fascikli da bi se obe preuzele.
- **U drugim pregledačima** obe datoteke se preuzimaju, prvo datoteka projekta.

Otvaranje bilo koje od datoteka traži drugu. Otvorite obe zajedno (ili ih prevucite obe), ili otvorite jednu: u Studiju se druga traži u istoj fascikli; u pregledaču CivilCraft pita da je dodate ili da nastavite sa onom koju imate. Ako je IFC promenio drugi program posle nego ga je CivilCraft sačuvao, ili je jedna datoteka starija od druge, projekat se otvara iz novijeg nacrta, a panel **Problemi** kaže šta se desilo, uz **Sačuvaj odmah** (ponovo piše obe datoteke) i **Prikaži geometriju IFC-a kao referencu**. Sam IFC koji je promenio drugi program otvara se iz svoje kopije projekta, sa onim što se i dalje poklapa: trase koje je promenio uzimaju njegovu geometriju, objekti koje je obrisao se izostavljaju, a ostale izmene se navode, ali se ne preuzimaju. Datoteka projekta sa verzijom pre 0.7.1 otvara se kao i do sada.

Datoteka projekta čuva:

- svaku tačku (broj, koordinate, kotu, opis) i naziv datoteke sa tačkama iz koje potiču
- podešavanja površi: izbor grupa, nacrtane linije loma, granicu, najdužu spoljnu ivicu i TIN pročitan iz LandXML-a
- podešavanja prikaza
- trase sa njihovim PI-jevima, radijusima i početnom stacionažom, njihove projektovane profile (PVI-jevi i dužine krivina) i podešavanja koridora
- platoe i mrežu cevi sa njenim pravilima

Ne čuva istoriju opozivanja. Površi, izohipse, linije do terena i zapremine se ne čuvaju; ponovo se grade iz sačuvanih ulaznih podataka kada se projekat otvori. Datoteka projekta iz novijeg CivilCraft-a se odbija, uz poruku koja navodi njegovu verziju.

## Šta se izvozi

| Dugme | Datoteka | Sadržaj |
|---|---|---|
| {{ui:LandXML}} | `<naziv>.xml` | LandXML 1.2: tačke, postojeći teren (i projektovana površ kada postoji) kao TIN površi, trase, profili terena i projektovani profili, mreža cevi |
| {{ui:DXF}} | `<naziv>.dxf` | R12 DXF linija plana onako kako se prikazuju, na imenovanim slojevima |
| {{ui:DWG}} | `<naziv>.dwg` | Iste linije kao DWG crtež, u formatu koji izaberete (2000 do 2018) |
| {{ui:PDF}} | `<naziv>.pdf` | Vektorski ispis plana na listu, u razmeri koju izaberete |
| {{ui:GLB}} ili {{ui:OBJ}} (na traci 3D prikaza) | `<naziv>-3d.glb`, `<naziv>-3d.obj` | Ono što 3D prikaz pokazuje kao 3D model: metri, Y nagore, prava razmera, oko zabeleženog lokalnog početka |

Šta svaki izvoz izostavlja: [Razmena LandXML](topic:landxml), [Izvoz plana u DXF](topic:dxf-export) (DWG takođe), [Ispis plana u PDF](topic:plot-pdf), [Izvoz lokacije u 3D](topic:export-3d).

## Gde idu datoteke

Sačuvane i izvezene datoteke idu tamo gde pregledač stavlja preuzimanja, obično u fasciklu Preuzimanja. Da birate fasciklu svaki put:

:::chromium
Otvori **Podešavanja** pregledača, zatim **Preuzimanja**, i uključi **Pitaj gde da sačuvam svaku datoteku pre preuzimanja**.
:::

:::firefox
Otvori **Podešavanja**, zatim **Opšte**, i pod **Datoteke i aplikacije** izaberi **Uvek me pitaj gde da sačuvam datoteke**.
:::

:::safari
Otvori **Safari > Podešavanja > Opšte** i postavi **Lokacija za preuzimanje datoteka** na **Pitaj za svako preuzimanje**.
:::

Ako sačuvate dva puta pod istim imenom, pregledač može drugoj datoteci dodati broj, na primer `Lokacija (1).civilcraft.json`. Sledeći put otvorite najnoviju.

## Na mreži i van mreže

CivilCraft u oba slučaja radi samo na vašem računaru: otvaranje čita datoteku u pregledaču, čuvanje je preuzima. Da biste pokrenuli CivilCraft bez ikakve veze, prvo ga sačuvajte za rad van mreže:

1. Dok ste na mreži, kliknite {{ui:Sačuvaj za rad van mreže}} u traci aplikacije na vrhu.
2. Dugme broji („Čuvam 12 od 30”) i zatim prikazuje {{ui:Spremno za rad van mreže}}. CivilCraft je mali (oko 0,6 MB), pa ovo traje koji trenutak. Sačuvana kopija uključuje i ovu pomoć i primer lokacije.
3. Bez veze otvorite istu adresu (ili njen obeleživač). Sve radi, uključujući {{ui:Otvori primer lokacije}}.

Ostala stanja dugmeta:

- {{ui:Nije moguće sačuvati}}: neke datoteke se nisu preuzele. Proverite vezu i kliknite na dugme da pokušate ponovo.
- {{ui:Rad van mreže nije dostupan}}: ovaj prozor pregledača ne može da čuva kopiju za rad van mreže (privatni prozori i neki upravljani računari to blokiraju). Koristite običan prozor.

Kliknite {{ui:Spremno za rad van mreže}} da vidite kada je kopija sačuvana, uz dva izbora: {{ui:Sačuvaj ponovo (preuzmi najnoviju verziju)}} i {{ui:Ukloni kopiju za rad van mreže}}. Sačuvajte ponovo pre posete lokaciji da bi kopija odgovarala najnovijoj verziji. Više u [Rad van mreže](common:offline).

:::offline
Trenutno ste van mreže. Ako je CivilCraft sačuvan za rad van mreže, sve radi, uključujući primer lokacije. Ako nije, nastavite da radite u ovoj kartici, ali je ne osvežavajte dok ponovo ne budete na mreži; bez sačuvane kopije, {{ui:Otvori primer lokacije}} ne uspeva uz poruku „Primer nije mogao da se učita”.
:::

:::tip
Za rad na terenu sačuvajte CivilCraft za rad van mreže i prenesite datoteke sa tačkama na sam laptop. Projekti i izvozi se čuvaju kao preuzimanja bez veze, pa možete uvesti snimanja jednog dana, proveriti površ i sačuvati projekat na terenu.
:::

Čuvanje u oblaku još nije dostupno, a desktop verzije još nisu izašle. Za sada su datoteke koje sačuvate jedina kopija: čuvajte ih na mestu koje se pravi rezervna kopija.

## Dodaci koje datoteka koristi

Kada sačuvate projekat koji sadrži podatke iz dodatka (štikle **Propisi o gradnji** ili izvor **Adresa do lokacije**), datoteka beleži koji dodaci i koje verzije. Ako je otvorite na računaru koji ih nema, traka iznad plana to kaže i nudi da ih doda sa spiska vašeg naloga. Beleška je samo napomena: datoteka se otvara u svakom slučaju.

## Opozivanje iz Studija

U CadCraft Studiu svaki korak koji završite u CivilCraft-u prijavljuje se Studiju, pa njegovo opozivanje na nivou projekta može da vrati poslednji korak preko aplikacija. Studio opoziva korak samo kada je CivilCraft-ov sopstveni stek opozivanja baš onakav kakav je taj korak ostavio; posle otvaranja druge datoteke preskače ovaj prozor.

## Zatvaranje sa nesačuvanim izmenama

Kada projekat ima nesačuvane izmene i zatvorite karticu, osvežite stranicu ili napustite stranicu, pregledač pita da li želite da odete. Tekst i izgled pripadaju pregledaču i CivilCraft ih ne može promeniti. {{ui:Novo}} i otvaranje projekta ili LandXML datoteke pitaju u CivilCraft-ovom sopstvenom okviru **Nesačuvane izmene**, sa {{ui:Otkaži}}, {{ui:Ne čuvaj}} i {{ui:Sačuvaj kopiju}}.
