---
title: Faili, ko varat atvērt, saglabāt un eksportēt
summary: Punktu failus, LandXML un CivilCraft projektus ievadiet; projektus, LandXML, DXF un PDF izvadiet; kas tiek saglabāts katrā, kur atrodas faili un kas mainās bezsaistē.
keywords: atvērt, saglabāt, eksportēt, importēt, failu formāti, csv, txt, landxml, xml, dxf, pdf, json, lejupielāde, projekta fails
from: a7debb61
---

CivilCraft atver failus no jūsu datora un saglabā, lejupielādējot failus atpakaļ uz to. Nekas netiek augšupielādēts un nekas netiek glabāts serverī. Skat. arī [Jūsu faili](common:your-files).

## Ko tas atver

Noklikšķiniet uz {{ui:Atvērt}} (vai nospiediet {{key:Mod+O}}) un izvēlieties failu, vai velciet failu no {{pick:mac=Finder|windows=File Explorer|linux=jūsu failu pārvaldnieka}} uz plāna. Vienlaikus — viens fails; faili, kas lielāki par 200 MB, netiek pieņemti.

| Veids | Failu nosaukumi | Kas notiek |
|---|---|---|
| Punktu fails | `.csv`, `.txt`, `.pnt`, `.xyz` (jebkurš teksta fails) | Atveras dialogs **Importēt punktus**. Punkti aizstāj projekta punktus; trases, platformas un caurules paliek. |
| LandXML | `.xml`, `.landxml` | No faila tiek izveidots **jauns projekts** (pirms tam jautā, ja pašreizējam projektam ir nesaglabātas izmaiņas). |
| CivilCraft projekts | `.civilcraft.json` (jebkurš `.json`) | Projekts atveras tādā veidā, kā tas tika saglabāts (pirms tam jautā, ja pašreizējam projektam ir nesaglabātas izmaiņas). |

CivilCraft nosaka pēc faila paplašinājuma, pēc tam pēc pirmajām rakstzīmēm: teksts, kas sākas ar `{`, tiek nolasīts kā projekts, teksts, kas sākas ar `<`, — kā LandXML, bet viss pārējais — kā punktu fails. Failu, ko atvēršanas logā ir padarīts pelēks, joprojām var nomest uz plāna.

:::note
Punktu faila importēšana projektā, kurā jau ir punkti, tos aizstāj bez jautājuma, un tā notīra atsaukšanas vēsturi (jebkura faila atvēršana sāk atsaukšanu no jauna). Ja virsma ir nākusi no LandXML, punktu importēšana pārslēdz to atpakaļ uz virsmu, kas veidota no punktiem. Ja varbūt vēlaties atgūt vecos punktus, vispirms saglabājiet.
:::

Sīkāk: [Punktu failu formāti](topic:point-file-formats), [LandXML: kas tiek nolasīts un rakstīts](topic:landxml-reference).

## Ko tas saglabā

{{ui:Saglabāt}} ({{key:Mod+S}}) blakus saglabā divus failus, nosauktus pēc lauka **Nosaukums** kreisajā panelī: `<name>.civilcraft.json` — projekts, ko turpināt rediģēt, un `<name>.ifc` — tas pats projekts IFC 4.3 formātā citiem lietotājiem (skat. [IFC eksportēšana un importēšana](topic:ifc)). Katrs fails ieraksta otru, un IFC turklāt satur saspiestu projekta kopiju, tāpēc IFC, kas nosūtīts atsevišķi, joprojām atveras ar pilnām rediģēšanas iespējām.

- **Studio** lietotnē abi faili tiek ierakstīti blakus, tajā pašā vietā.
- **Pārlūkā Chrome un Edge** pirmajā saglabāšanas reizē tiek prasīta mape, un abi faili tiek ierakstīti tajā; nākamās saglabāšanas iet uz to pašu mapi. Ja atceļat mapes jautājumu, abi faili tiek lejupielādēti.
- **Citos pārlūkos** abi faili tiek lejupielādēti, vispirms projekta fails.

Atverot jebkuru no failiem, meklē otru. Atveriet abus kopā (vai nometiet abus), vai atveriet vienu: **Studio** lietotnē otrs tiek atrasts tajā pašā mapē; pārlūkā CivilCraft jautā, vai to pievienot, vai turpināt tikai ar to, kas jums ir. Ja IFC pēc tā saglabāšanas ar CivilCraft ir mainījusi cita programma vai viens fails ir vecāks par otru, projekts tiek atvērts no jaunākā risinājuma, un panelis **Problēmas** pastāsta, kas notika, ar pogām **Saglabāt tagad** (ieraksta abus failus vēlreiz) un **Rādīt IFC ģeometriju kā atsauci**. IFC atsevišķi, ko citas programmas ir mainījušas, atveras no tā projekta kopijas ar to, kas joprojām atbilst: trases, ko tas ir mainījis, saņem tā ģeometriju; objekti, ko tas ir dzēsis, tiek izlaisti; pārējās izmaiņas tiek uzskaitītas, nevis pieņemtas. Projekta fails, kas saglabāts pirms versijas 0.7.1, atveras kā līdz šim.

Projekta failā saglabājas:

- visi punkti (numurs, koordinātes, augstums, apraksts) un to punktu faila nosaukums, no kura tie nākuši
- virsmas iestatījumi: grupu izvēle, zīmētās lūzumlīnijas, robeža, garākā ārējā mala un no LandXML nolasītais TIN
- attēlojuma iestatījumi
- trases ar to PI, rādiusiem un sākuma piketu, to projektētie garenprofili (PVI un līkņu garumi) un koridora iestatījumi
- platformas un cauruļu tīkls ar tā noteikumiem

Atsaukšanas vēsture netiek saglabāta. Virsmas, horizontāles, šķēluma līnijas un tilpumi netiek glabāti; tie tiek atjaunoti no saglabātajiem ievades datiem, kad projekts tiek atvērts. Projekta fails no jaunākas CivilCraft versijas tiek noraidīts ar paziņojumu, kurā norādīta tā versija.

## Ko tas eksportē

| Poga | Fails | Saturs |
|---|---|---|
| {{ui:LandXML}} | `<name>.xml` | LandXML 1.2: punkti, esošais reljefs (un projektētā virsma, ja tāda ir) kā TIN virsmas, trases, reljefa un projektētie garenprofili, cauruļu tīkls |
| {{ui:DXF}} | `<name>.dxf` | R12 DXF plāna līnijām tādā veidā, kā tās ir attēlotas, nosauktos slāņos |
| {{ui:DWG}} | `<name>.dwg` | Tās pašas līnijas kā DWG rasējums jūsu izvēlētā formātā (no 2000 līdz 2018) |
| {{ui:PDF}} | `<name>.pdf` | Plāna vektora attēls lapā ar mērogu, ko izvēlaties |
| {{ui:GLB}} vai {{ui:OBJ}} (3D skata joslā) | `<name>-3d.glb`, `<name>-3d.obj` | Ko 3D skats rāda kā 3D modeli: metros, Y ass uz augšu, īstā mērogā ap ierakstītu lokālo sākumpunktu |

Ko katrs izlaiž: [LandXML apmaiņa](topic:landxml), [Plāna eksportēšana uz DXF](topic:dxf-export) (arī DWG), [Plāna izdruka PDF formātā](topic:plot-pdf), [Objekta eksportēšana 3D](topic:export-3d).

## Kur nonāk faili

Saglabātie un eksportētie faili tiek ierakstīti tur, kur pārlūks ievieto lejupielādes, parasti mapē Lejupielādes. Lai katru reizi izvēlētos mapi:

:::chromium
Atveriet pārlūka **Iestatījumi**, pēc tam **Lejupielādes**, un ieslēdziet **Jautāt, kur saglabāt katru failu pirms lejupielādes**.
:::

:::firefox
Atveriet **Iestatījumi**, pēc tam **Vispārīgi**, un sadaļā **Faili un lietojumprogrammas** izvēlieties **Vienmēr jautāt, kur saglabāt failus**.
:::

:::safari
Atveriet **Safari > Iestatījumi > Vispārīgi** un iestatiet **Faila lejupielādes vieta** uz **Jautāt katrai lejupielādei**.
:::

Ja saglabājat divas reizes ar vienu un to pašu nosaukumu, pārlūks otrajam failam var pievienot numuru, piemēram, `Site (1).civilcraft.json`. Nākamreiz atveriet jaunāko.

## Tiešsaiste un bezsaiste

Jebkurā gadījumā CivilCraft darbojas tikai jūsu datorā: atverot fails tiek nolasīts pārlūkā, saglabājot tas tiek lejupielādēts. Lai atvērtu CivilCraft bez jebkāda savienojuma, vispirms saglabājiet to lietošanai bezsaistē:

1. Kamēr esat tiešsaistē, augšējā lietotņu joslā noklikšķiniet uz {{ui:Saglabāt bezsaistei}}.
2. Poga skaita uz augšu ("Saglabā 12 no 30") un pēc tam rāda {{ui:Gatavs darbam bezsaistē}}. CivilCraft ir neliels (apmēram 0,6 MB), tāpēc tam nepieciešams brīdis. Saglabātajā kopijā ietilpst šī palīdzība un parauga objekts.
3. Bez savienojuma atveriet to pašu adresi (vai tās grāmatzīmi). Viss darbojas, tostarp {{ui:Atvērt parauga objektu}}.

Pogas citi stāvokļi:

- {{ui:Neizdevās saglabāt}}: daži faili netika lejupielādēti. Pārbaudiet savienojumu un noklikšķiniet, lai mēģinātu vēlreiz.
- {{ui:Bezsaiste nav pieejama}}: šis pārlūka logs nevar saglabāt kopiju bezsaistei (privātie logi un daži pārvaldīti datori to bloķē). Izmantojiet parasto logu.

Noklikšķiniet uz {{ui:Gatavs darbam bezsaistē}}, lai redzētu, kad kopija tika saglabāta; ir divas izvēles: {{ui:Saglabāt vēlreiz (iegūt jaunāko versiju)}} un {{ui:Noņemt bezsaistes kopiju}}. Pirms objekta apmeklējuma saglabājiet vēlreiz, lai kopija atbilstu jaunākajai versijai. Vairāk: [Darbs bezsaistē](common:offline).

:::offline
Jūs tagad esat bezsaistē. Ja CivilCraft ir saglabāts lietošanai bezsaistē, viss darbojas, tostarp parauga objekts. Ja nav, turpiniet darbu šajā cilnē, bet neatjaunojiet to, kamēr atkal neesat tiešsaistē; bez saglabātas kopijas {{ui:Atvērt parauga objektu}} neizdodas ar paziņojumu "Paraugu nevarēja ielādēt".
:::

:::tip
Lauka darbam saglabājiet CivilCraft lietošanai bezsaistē un nesiet punktu failus tieši uz klēpjdatora. Projekti un eksporti bez savienojuma tiek saglabāti kā lejupielādes, tāpēc varat importēt dienas mērījumus, pārbaudīt virsmu un saglabāt projektu uz vietas.
:::

Mākoņa saglabāšana vēl nav pieejama, un darbvirsmas versijas vēl nav izlaistas. Šobrīd saglabātie faili ir vienīgā kopija: glabājiet tos vietā, kur tiek veikta dublēšana.

## Papildinājumi, ko fails izmanto

Saglabājot projektu, kurā ir papildinājuma dati (Būvnoteikumu atzīmes vai avots Adrese līdz objektam), fails ieraksta, kuri papildinājumi un kurās versijās tiek izmantoti. Atverot to datorā, kuram tāda nav, josla virs plāna to paziņo un piedāvā pievienot no jūsu konta saraksta. Ieraksts ir tikai piezīme: fails atveras jebkurā gadījumā.

## Atsaukšana no Studio

CadCraft Studio iekšienē katrs solis, ko pabeidzat CivilCraft, tiek paziņots Studio, tāpēc tās projekta līmeņa atsaukšana var atsaukt pēdējo soli visās lietotnēs. Studio atsauc soli tikai tad, kad CivilCraft pašas atsaukšanas steks ir tieši tāds, kāds bija pēc šī soļa; pēc tam, kad atverat citu failu, tas izlaiž šo logu.

## Aizvēršana ar nesaglabātām izmaiņām

Ja projektam ir nesaglabātas izmaiņas un aizverat cilni, atjaunojat lapu vai dodaties prom no lapas, pārlūks jautā, vai vēlaties aiziet. Tā formulējums un izskats pieder pārlūkam, un CivilCraft to nevar mainīt. {{ui:Jauns}} un projekta vai LandXML faila atvēršana savukārt jautā CivilCraft pašā logā **Nesaglabātas izmaiņas**, ar {{ui:Atcelt}}, {{ui:Don’t save}} un {{ui:Saglabāt kopiju}}.
