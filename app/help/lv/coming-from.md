---
title: Nākot no citas civilās programmatūras
summary: Kā pazīstamas civilās projektēšanas darbplūsmas atbilst CivilCraft un atšķirības, kas pirmajā stundā mulsina pieredzējušus lietotājus.
keywords: pārslēgšanās, migrācija, pazīstams, atšķirības, darbplūsma, komandas, atbilstības, cogo, koridors, izlīdzināšana, cauruļu tīkls, stili, komandrinda
from: feae37d6
---

Ja esat strādājis ar Civil 3D, jums jau ir zināmas CivilCraft idejas: punkti un punktu grupas, TIN virsmas ar lūzumlīnijām un robežām, trases pēc PI, garenprofili pēc PVI, šabloni, kas izvilkti koridoros, izlīdzināšana līdz dienasgaismai, gravitācijas cauruļu tīkli, LandXML. Atšķirīgs ir gandrīz viss ap tām: nav zīmējuma faila, nav komandrindas (ja vien neizvēlaties {{ui:Klasiskais zīmēšanas stils}} izvēlni), nav stilu, nav Prospector un nav iestatījumu dialogu. CivilCraft ir neliels, specializēts rīks pārlūkprogrammā, un šajā versijā tas dara nelielu daļu no pilnas civilās programmatūras paketes. Šī lapa salīdzina to, ko jūs zināt, ar to, kas šeit ir.

:::tip
Ja jums patīk Civil 3D lente, izvēlieties {{ui:Civilā lente}} izvēlnes stilu sadaļā {{ui:Iestatījumi}} › {{ui:CivilCraft}} › {{ui:Izvēlnes, taustiņi un pele}}: cilnes Sākums, Virsmas, Labošana, Ģeolokācija, Skats un Izvade; vidējā poga panoramē, un {{key:Shift}} ar vidējo pogu griež 3D skatu ap. Ja rakstāt komandas, {{ui:Klasiskais zīmēšanas stils}} pievieno komandrindu (ALIGNMENT, PAD, PROFILE, ZOOM …). Skatiet [Izvēlnes, taustiņi un pele](topic:menus-keys-and-mouse).
:::

## Atbilstību karte

| Ko vēlaties darīt | Pazīstamais veids | CivilCraft |
|---|---|---|
| Ievietot uzmērījuma punktus | Importēt punktus punktu failu formātā | {{ui:Atvērt}}, tad pārbaudiet kolonnu secību sadaļā **Importēt punktus** ([Importēt uzmērījuma punktus](topic:import-points)) |
| Kārtot punktus | Punktu grupas, aprakstu atslēgas | Automātiskas grupas pēc apraksta pirmā vārda; aprakstu atslēgu nav |
| Rediģēt punktu | Punktu redaktors, turi | Noklikšķiniet uz tā un ierakstiet **Rekvizītos** vai velciet to ([Rediģēt uzmērījuma punktu](topic:edit-points)) |
| Veidot esošo terēnu | Izveidot virsmu, pievienot punktu grupas kā datus | Automātiski: virsma pārbūvējas, kad mainās tās ievades |
| Pievienot lūzumlīnijas | Pievienot lūzumlīnijas no polilīnijām vai objektu līnijām | Iestatiet punktu grupu uz {{ui:Lūzumlīnija}} vai noklikšķiniet punktus ar {{ui:Lūzumlīnija}} rīku ({{key:B}}) |
| Apgriezt virsmu | Ārējā robeža, slēptā robeža, maksimālais trijstūra garums | {{ui:Robeža}} ({{key:O}}, tikai ārējā) un **Garākā ārējā mala** |
| Rādīt horizontāles | Virsmas stils | **Attēlojums** kreisajā panelī: intervāls, galvenās horizontāles ik pēc, uzraksti, joslas, slīpuma bultiņas |
| Izkārtot centrāllīniju | Trases veidošanas rīki, līkņu un spirāļu iestatījumi | {{ui:Trase}} ({{key:A}}): noklikšķiniet PI, {{key:Enter}}; rādiusi un spirāļu garumi PI tabulā |
| Izveidot garenprofila skatu | Garenprofila skata vednis, joslas | {{ui:Garenprofils}} ({{key:R}}): viens garenprofila skats zem plāna, vienmēr pielāgots |
| Projektēt slīpumu | Garenprofila izkārtojuma rīki | {{ui:Sākt no terēna}}, {{ui:Pievienot PVI}} ({{key:I}}), velciet PVI, ierakstiet **Līknes L** |
| Veidot ceļu | Šablons, apakššabloni, koridors, mērķi, reģioni | Atzīmējiet **Izvilkt šablonu pa projekta profilu** zem trases; josla, nomale un sānu nogāze katrā pusē vai katra puse, kas veidota no daļām (notekrēja, apmale, ietve …) |
| Izlīdzināt platformu | Objektu līnijas, izlīdzināšanas grupas, kritēriji | {{ui:Platforma}} ({{key:G}}): plakana platforma ar izrakuma un uzbēruma nogāzēm līdz dienasgaismai |
| Aprēķināt zemes darbus | Tilpumu virsmas, tilpumu panelis | **Zemes darbi** labajā panelī, režģa metode, atjaunojas tiešraidē |
| Izkārtot lietus vai kanalizāciju | Cauruļu tīkls ar detaļu sarakstu, noteikumi | {{ui:Caurules}} ({{key:P}}): noklikšķiniet konstrukcijas pa straumi; trīs noteikumi, ko iestatāt; automātiski invertu augstumi |
| Apmainīties ar citiem | LandXML importēšana un eksports | {{ui:Atvērt}} LandXML failu; {{ui:LandXML}}, lai eksportētu ([Apmaiņa ar LandXML](topic:landxml)) |
| Nosūtīt līnijas uz CAD | Eksports DWG | {{ui:DWG}} (2000 līdz 2018 formāts) vai {{ui:DXF}} (R12) |
| Drukāt | Izkārtojumi, skatlogi, lapu kopas | {{ui:PDF}}: viena horizontāla lapa ar plānu izvēlētā mērogā; plāna un garenprofila lapas un griezumu lapas kā PDF |
| Kopīgot darbu starp failiem | Datu saīsnes, atsauces | Nav pieejams: viens projekts vienā failā |
| Atsaukt | Atsaukt | {{key:Mod+Z}} un {{key:Mod+Y}}, 200 soļi; attēlojuma iestatījumi nav atsaukšanas soļi |

## Atšķirības, kas mulsina cilvēkus

**Komandrindas nav**, ja vien neizvēlaties {{ui:Klasiskais zīmēšanas stils}} izvēlnes stilu. Rīki ir rīkjoslas pogas un atsevišķi burti: {{key:A}} trase, {{key:G}} platforma, {{key:P}} caurules, {{key:B}} lūzumlīnija, {{key:O}} robeža, {{key:R}} garenprofils, {{key:I}} pievienot PVI, {{key:V}} atlasīt, {{key:F}} pielāgot. Citos izvēlņu stilos komandas nosaukuma ierakstīšana nedara neko. Skatiet [Taustiņi un pele](topic:keyboard).

**Enter pabeidz; dubultklikšķis ir riskants.** Noklikšķiniet pēdējo punktu vienreiz un pēc tam nospiediet {{key:Enter}}. Šajā versijā dubultklikšķis arī pabeidz, bet noņem punktu, uz kura veicāt dubultklikšķi. Labā poga nepabeidz un neatkārto; tā tikai panoramē, ja ar to velkat.

**Viss ir dinamisks, vienmēr.** Mainot punktu grupu, rādiusu, PVI vai platformas slīpumu, virsma, horizontāles, koridors, dienasgaismas līnijas un tilpumi atjaunojas uzreiz. Nekas nav jāpārbūvē, un nekas nekļūst novecojis.

**Nekas nav zīmējuma objekts.** Plāns ir projekta skats, nevis zīmējums, ko var rediģēt ar CAD komandām. Jūs nevarat pievienot savas līnijas vai tekstu, mainīt slāņa krāsu vai sadalīt jebko. Eksportējiet uz DXF un pabeidziet zīmējumu CAD programmā.

**Nav stilu.** Krāsas, līniju biezumi, uzrakstu izmēri un slāņu nosaukumi ir fiksēti (skatiet [Plāna slāņi](topic:plan-layers)). **Papīrs** un **Modelis** lietotnes joslā pārslēdz starp gaišu un tumšu ekrānu.

**Pa vienam.** Viena esošā terēna virsma, viens izlīdzināšanas rezultāts, viens cauruļu tīkls vienā projektā. Daudzas trases un platformas ir atļautas.

**Mērvienības ir tikai etiķetes.** Izvēloties {{ui:ASV pēdas}} vai {{ui:Metri}}, nekas netiek pārvērsts. Mēroga nav. Koordinātu sistēma ir neobligāta: iestatiet to sadaļā {{ui:Koordinātes}}, un nekas nepārvietojas; tā tikai saka, ko skaitļi nozīmē (skatiet [Iestatīt projekta koordinātu sistēmu](topic:coordinate-systems)). Pēdas tiek uzskatītas par ASV uzmērīšanas pēdām, rakstot LandXML.

**Lūzumlīniju grupas savienojas punktu numuru secībā.** Grupa, kas iestatīta uz {{ui:Lūzumlīnija}}, kļūst par vienu līniju caur visiem tās punktiem numuru secībā. Kopīgi kodi (divas plūsmas līnijas, abas kodētas kā „FL”) veido vienu zigzaga līniju; tās zīmējiet ar roku.

**Pikets izskatās vienādi, metri atšķiras.** Pēdās piketi ir 100 ft (12+34.56); metros piketi ir 1000 m (1+234.567).

**Dzēst Mac datorā.** Mac taustiņš ar uzrakstu delete pārlūkprogrammā ir Backspace. Lai izdzēstu atlasi, izmantojiet Fn un delete vai pogu {{ui:Dzēst}}.

**Faili ir lejupielādes.** {{ui:Saglabāt}} katru reizi lejupielādē `.civilcraft.json` failu; nav „saglabāt pāri atvērtajam failam”. Nesaglabāta darba atkopšanas kopija tiek glabāta šajā pārlūkprogrammā ([Atkopt nesaglabātu darbu](common:recover)). Punktu faila atvēršana aizstāj punktus bez jautājuma. Skatiet [Faili, ko varat atvērt, saglabāt un eksportēt](topic:files).

**Noteikumi ir jūsu.** Cauruļu tīkla noteikumi un koridora šablons sākas ar vietturu vērtībām, kas nav standarts. Iestatiet savas, pirms uzticaties jebkurai pārbaudei.

**Tilpumi balstās uz režģi.** Izrakums un uzbērums nāk no smalka režģa starp abām virsmām, dienasgaismas līniju iekšpusē, bez pietūkuma vai sarukuma. Tie ir tuvu, bet nav vienādi ar TIN-uz-TIN tilpumu.

## Kas vēl nav

Spirāles, kas nav klotoīdas, šabloni, kas mainās gar ceļu, slīpas platformas, ieplūdes jauda un aizture, daļu kataloģi, caurules garenprofilā, zemesgabalu izkārtojumi un parcelu izmēri, mazāko kvadrātu izlīdzināšana un uzmērīšanas datubāzes, DWG atvēršana un vēl. Pilns saraksts ar to, ko darīt tā vietā šodien, ir [Vēl nav izveidots](topic:not-built-yet).
