---
title: Darba sākšana ar CivilCraft
summary: Ko dara CivilCraft, kā to atvērt un pirmās desmit minūtes ar parauga objektu — no punktiem līdz horizontālēm, ceļam un saglabātam projektam.
keywords: sākt, pirmā palaišana, parauga objekts, ievads, ātrā sākšana, pamācība, sākums, jauns projekts
from: c9b6dd8e
---

CivilCraft ir CadCraft saimes civilo būvju un objektu projektēšanas lietotne. Tā ņem uzmērījuma punktus un pārvērš tos virsmā (TIN) ar horizontālēm; pēc tam ļauj izvietot trases ar projektētiem garenprofiliem, izvilkt vienkāršu ceļa koridoru, izlīdzināt ēku platformas līdz šķēluma līnijām, pārbaudīt gravitācijas cauruļu tīklu pret jūsu noteikumiem un apskatīt izrakumu un uzbērumu tilpumus. Tā nolasa un raksta LandXML, eksportē plānu kā DXF un izdrukā to PDF formātā.

Ja esat lietojis Civil 3D, idejas būs pazīstamas: punkti, punktu grupas, lūzumlīnijas, trases pēc PI, garenprofili pēc PVI, koridori, reljefa veidošana, cauruļu tīkli. Darba veids ir citāds un daudz vienkāršāks: nav komandrindas, nav stilu un nav rasējuma faila. Pirms pirmā īstā darba izlasiet reizi [Pāreja no citas civilās inženierijas programmatūras](topic:coming-from).

## Kas jums nepieciešams

- Jauna darbvirsmas pārlūka versija: Chrome, Edge, Firefox vai Safari. Skat. [Pārlūki](common:browsers).
- Pele vai skārienpaliktnis un tastatūra vai skārienekrāns: zīmēšanai tur ir ekrāna pogas {{ui:Pabeigt}}, {{ui:Atsaukt punktu}} un {{ui:Atcelt}} (skat. [Pele, skārienpaliktnis un skāriens](topic:keyboard#mouse-trackpad-and-touch)).
- Plāns tiek zīmēts 2D ar pārlūka audekla palīdzību. [3D skats](topic:site-3d) izmanto pārlūka WebGL grafiku; ja tas nevar sākties, statusa josla norāda iemeslu, un plāns joprojām darbojas.
- Konts nav vajadzīgs un nekas netiek augšupielādēts. Faili tiek atvērti jūsu datorā un saglabāti kā lejupielādes. Skat. [Jūsu faili](common:your-files).

:::note
CivilCraft šobrīd darbojas kā agrīna pārlūka versija, kas vēl tiek veidota. Darbvirsmas versijas vēl nav pieejamas, un mākoņa saglabāšana vēl nav pieejama. Viss, ko veidojat, paliek jūsu datorā, līdz to saglabājat vai eksportējat.
:::

## Atvērt CivilCraft

1. Atveriet CivilCraft savā pārlūkā.
2. Pagaidiet, līdz ekrāns aizpildās: rīkjosla augšpusē, panelis kreisajā pusē, plāns vidū un panelis **Rekvizīti** labajā pusē.
3. Tukšā plānā redzēsiet lodziņu ar nosaukumu **Sāciet ar uzmērījuma punktiem**. Tajā ir uzskaitīti pirmie soļi un saite {{ui:Atvērt parauga objektu}}.

Lai vēlāk izmantotu CivilCraft bez savienojuma, lietotņu joslā noklikšķiniet uz {{ui:Saglabāt bezsaistei}} un pagaidiet, līdz parādās {{ui:Gatavs darbam bezsaistē}}. Tajā ietilpst šī palīdzība, parauga objekts un 3D un GIS bibliotēkas. Skat. [Darbs bezsaistē](common:offline). Jebkurā laikā nospiediet {{key:F1}} vai noklikšķiniet uz {{ui:Palīdzība}}, lai atvērtu šo palīdzību blakus lietotnei.

## Pirmās desmit minūtes: parauga objekts

Parauga objekts ir neliels uzmērījums ASV pēdās: 276 punkti valsts plaknes koordinātēs, kalnagrēda, ieplaka ar tecējuma līniju un divas krasta augšmalas. Tas ir iekļauts lietotnē, tāpēc varat sekot instrukcijām bez sava faila.

1. Noklikšķiniet uz {{ui:Atvērt parauga objektu}} lodziņā uz plāna.
   Atveras dialogs **Importēt punktus**. Tajā teikts "276 punkti nolasīti kā PNEZD (no galvenes rindas), atdalīti ar komatiem." un tiek rādītas pirmās rindas.
2. Noklikšķiniet uz {{ui:Importēt}}.
   Plāns piepildās ar punktiem, horizontālēm un virsmas malu. Apakšējā statusa joslā teikts, ka punkti importēti un cik trijstūru ir virsmai (546).
3. Paskatieties kreisajā panelī zem **Punkti**. Punkti ir grupēti pēc pirmā vārda to aprakstā: CP, FL, GRD, RIDGE, TBN, TBS un TREE.
4. Šīs tabulas kolonnā **Virsma** iestatiet **FL**, **RIDGE**, **TBN** un **TBS** uz {{ui:Lūzumlīnija}}.
   Virsma uzreiz tiek pārbūvēta. Virsmas dati tagad rāda "Lūzumlīnijas: 4", un horizontāles saliecas stipri gar tecējuma līniju un kalnagrēdu, nevis šķērso tos.
5. Pārvietojiet rādītāju pa plānu. Statusa josla rāda austrumu un ziemeļu koordinātes zem rādītāja un tur esošo reljefa augstumu.
6. Sadaļā **Attēlojums** iestatiet {{ui:Horizontāles ik pēc}} uz 0.5 ft un ieslēdziet {{ui:Augstuma joslas}}. Zem izvēles rūtiņām parādās krāsu skala ar leģendu. Kad esat pabeidzis, joslas atkal izslēdziet.

Tagad jums ir esošā reljefa virsma. Tālāk — ceļš.

## Izvietot īsu ceļu

1. Nospiediet {{key:A}} (vai noklikšķiniet uz {{ui:Trase}} grupā **Projektēšana**).
2. Noklikšķiniet trīs punktus pāri objektam, viens pēc otra. Sarkana līnija seko rādītājam un rāda nākamās pieskares garumu un azimutu.
3. Nospiediet {{key:Enter}}, lai pabeigtu.
   Trase parādās ar piketāžu. Labajā panelī redzama **Trase**: tās garums, PI tabula un līkne vidējā PI (100 ft rādiuss vai mazāks, ja 100 ft nav iespējams).
4. Labajā panelī zem **Projektētais garenprofils** noklikšķiniet uz {{ui:Sākt no terēna}}.
   Garenprofila skats atveras zem plāna ar esošo reljefu un taisnu projektēto slīpumu no gala līdz galam.
5. Nospiediet {{key:I}}, lai ieslēgtu {{ui:Pievienot PVI}}, pēc tam vienreiz noklikšķiniet garenprofila skatā tuvu vidum. Parādās PVI.
6. Labajā PVI tabulā ierakstiet līknes garumu (piemēram, 100) vidējā PVI lodziņā **Līknes L** un nospiediet {{key:Enter}}. Garenprofilam tagad ir vertikāla līkne ar tās K vērtību.
7. Sadaļā **Koridors** atzīmējiet **Izvilkt elementu gar projektēto garenprofilu**.
   Ceļš tiek izlīdzināts zemē: joslas, malas un sānu nogāzes līdz šķēlumam. Bloks **Zemes darbi** rāda izrakumu un uzbērumu.

Neuztraucieties par precīzām vērtībām. Katru skaitli var mainīt labajā panelī, un {{key:Mod+Z}} atsauc pēdējo izmaiņu.

## Saglabājiet savu darbu

1. Ierakstiet nosaukumu laukā **Nosaukums** kreisā paneļa augšdaļā.
2. Nospiediet {{key:Mod+S}} (vai noklikšķiniet uz {{ui:Saglabāt}}).
   Pārlūks lejupielādē failu, kas nosaukts pēc objekta un beidzas ar `.civilcraft.json`. Tajā ir punkti, virsmas iestatījumi, trases, profili, koridori, platformas un caurules.
3. Lai turpinātu vēlāk, noklikšķiniet uz {{ui:Atvērt}} (vai nospiediet {{key:Mod+O}}) un izvēlieties šo failu vai nometiet to uz plāna.

:::warning
Automātiska saglabāšana nav. Ja aizverat cilni ar nesaglabātām izmaiņām, pārlūks jautā, vai aiziet; ja aiziet, izmaiņas tiek zaudētas. Saglabājiet bieži.
:::

## Kur doties tālāk

- [Importējiet uzmērījuma punktus](topic:import-points) ar saviem failiem.
- [Veidojiet un precizējiet virsmu](topic:build-surface) ar lūzumlīnijām un robežu.
- [Ekrāns pa daļām](topic:workspace).
- [Taustiņi un pele](topic:keyboard).
