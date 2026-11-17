---
title: Faili, ko var atvērt, saglabāt un eksportēt
summary: Punktu faili, LandXML un CivilCraft projekti ievadei; projekti, LandXML, DXF un PDF izvadei; ko katrs saglabā, kur faili tiek ievietoti un kas mainās bezsaistē.
keywords: atvērt, saglabāt, eksportēt, importēt, failu formāti, csv, txt, landxml, xml, dxf, pdf, json, lejupielāde, projekta fails
from: 82bff559
---

CivilCraft atver failus no jūsu datora un saglabā, lejupielādējot failus atpakaļ datorā. Nekas netiek augšupielādēts un nekas netiek glabāts serverī. Skatiet arī [Jūsu faili](common:your-files).

## Ko tas atver

Noklikšķiniet uz {{ui:Atvērt}} (vai nospiediet {{key:Mod+O}}) un izvēlieties failu, vai velciet failu no {{pick:mac=Finder|windows=Failu pārlūks|linux=jūsu failu pārvaldnieks}} uz plānu. Vienlaikus viens fails; failus, kas lielāki par 200 MB, neatver. LandXML vai projekta fails, kas lielāks par 32 MB, tiek nolasīts pa daļām, aptuveni pa 4 MB, nekad kā viens teksta bloks; kamēr LandXML tiek atvērts, paredziet, ka atmiņā tas aizņems aptuveni 13 reizes vairāk nekā faila izmērs (69 MB fails mūsu testā aizņēma aptuveni 0.9 GB).

| Veids | Failu nosaukumi | Kas notiek |
|---|---|---|
| Punktu fails | `.csv`, `.txt`, `.pnt`, `.xyz` (jebkurš teksta fails) | Atveras dialoglodziņš **Importēt punktus**. Punkti aizstāj projekta punktus; trases, platformas un caurules paliek. |
| LandXML | `.xml`, `.landxml` | No faila tiek izveidots **jauns projekts** (ja pašreizējam projektam ir nesaglabātas izmaiņas, vispirms tiks jautāts). |
| CivilCraft projekts | `.civilcraft.json` (jebkurš `.json`) | Projekts tiek atvērts tādā veidā, kādā tas tika saglabāts (ja pašreizējam projektam ir nesaglabātas izmaiņas, vispirms tiks jautāts). |

CivilCraft nosaka pēc faila beigām, pēc tam pēc tā pirmajām rakstzīmēm: teksts, kas sākas ar `{`, tiek nolasīts kā projekts; teksts, kas sākas ar `<`, kā LandXML; viss pārējais kā punktu fails. Fails, ko atvēršanas logs ir pelēkojis, joprojām var tikt ievilkts plānā.

:::note
Punktu faila importēšana projektā, kurā jau ir punkti, tos aizstāj bez jautājuma un notīra atsaukšanas vēsturi (jebkura faila atvēršana sāk atsaukšanu no jauna). Ja virsma nākusi no LandXML, punktu importēšana pārslēdz to atpakaļ uz virsmu, kas veidota no punktiem. Ja vecos punktus varētu vajadzēt atpakaļ, vispirms saglabājiet.
:::

Sīkāk: [Punktu failu formāti](topic:point-file-formats), [LandXML: kas tiek nolasīts un rakstīts](topic:landxml-reference).

## Ko tas saglabā

{{ui:Saglabāt}} ({{key:Mod+S}}) ieraksta blakus divus failus, nosauktus pēc **Nosaukums** kreisajā panelī: `<name>.civilcraft.json`, projekts, ko turpiniet rediģēt, un `<name>.ifc`, tāds pats dizains IFC 4.3 formātā citiem lietotājiem (skatiet [IFC eksports un imports](topic:ifc)). Katrs fails ieraksta otru, un IFC arī satur saspiestu projekta kopiju, tāpēc IFC, nosūtīts atsevišķi, joprojām var atvērt pilnībā rediģējamu.

- **Studio** vidē abi faili tiek ierakstīti blakus, tajā pašā vietā.
- **Chrome** un **Edge** pirmajā saglabāšanā tiek jautāta mape, un abi faili tiek ierakstīti tajā; turpmākās saglabāšanas iet uz to pašu mapi. Atceļot jautājumu par mapi, abi faili tiek lejupielādēti.
- **Citās pārlūkprogrammās** abi faili tiek lejupielādēti, vispirms projekta fails.

Atverot jebkuru no failiem, meklē otru. Atveriet abus kopā (vai ievelciet abus) vai atveriet vienu: **Studio** vidē otrs fails tiek atrasts tajā pašā mapē; pārlūkprogrammā CivilCraft jautā, vai to pievienot, vai turpināt tikai ar to, kas jums ir. Ja IFC pēc CivilCraft saglabāšanas ir mainījusi cita programma vai viens fails ir vecāks par otru, projekts tiek atvērts no jaunākā dizaina, un **Problēmu panelis** norāda, kas noticis, ar pogām **Saglabāt tagad** (ieraksta abus failus vēlreiz) un **Rādīt IFC ģeometriju kā atsauci**. Atsevišķs IFC, ko mainījusi cita programma, tiek atvērts no tā projekta kopijas ar to, kas joprojām atbilst: trases, ko tas mainījis, iegūst tā ģeometriju; objekti, ko tas dzēsis, tiek izlaisti; pārējās tā izmaiņas tiek uzskaitītas, bet nav pieņemtas. Projekta fails, kas ir pirms 0.7.1, tiek atvērts kā iepriekš.

Projekta failā tiek saglabāts:

- katrs punkts (numurs, koordinātas, augstums, apraksts) un to punktu faila nosaukums, no kura tie nākuši
- virsmas iestatījumi: grupu izvēles, zīmētās lūzumlīnijas, robeža, garākā ārējā mala un TIN, nolasīts no LandXML
- attēlošanas iestatījumi
- trases ar to PI, rādiusiem un sākuma staciju, to projektētie garenprofili (PVI un līknes garumi) un koridora iestatījumi
- platformas un cauruļu tīkls ar tā noteikumiem

Atsaukšanas vēsture netiek saglabāta. Virsmas, horizontāles, robežlīnijas un tilpumi netiek glabāti; tie tiek atjaunoti no saglabātajiem ievades datiem, kad projekts tiek atvērts. Projekta fails no jaunākas CivilCraft versijas tiek noraidīts ar ziņojumu, kurā nosaukta tā versija.

## Ko tas eksportē

| Poga | Fails | Saturs |
|---|---|---|
| {{ui:LandXML}} | `<name>.xml` | LandXML 1.2: punkti, esošais reljefs (un vertikāli plānotā virsma, ja tāda ir) kā TIN virsmas, trases, zemes un projektētie garenprofili, cauruļu tīkls |
| {{ui:DXF}} | `<name>.dxf` | R12 DXF plāna līniju zīmējums tādā veidā, kā tas tiek attēlots, uz nosauktiem slāņiem |
| {{ui:DWG}} | `<name>.dwg` | Tās pašas līnijas kā DWG rasējums izvēlētajā formātā (no 2000 līdz 2018) |
| {{ui:PDF}} | `<name>.pdf` | Plāna vektora izdruka uz lapas izvēlētā mērogā |
| {{ui:GLB}} vai {{ui:OBJ}} (3D skata joslā) | `<name>-3d.glb`, `<name>-3d.obj` | Tas, ko 3D skats rāda kā 3D modeli: metri, Y uz augšu, patiess mērogs, ap ierakstītu lokālo sākumpunktu |

Ko katrs izlaiž: [LandXML apmaiņa](topic:landxml), [Plāna eksports uz DXF](topic:dxf-export) (arī DWG), [Plāna drukāšana uz PDF](topic:plot-pdf), [Objekta eksports 3D](topic:export-3d).

## Kur nonāk faili

Saglabātie un eksportētie faili nonāk tur, kur jūsu pārlūkprogramma ievieto lejupielādes, parasti mapē Lejupielādes. Lai katru reizi izvēlētos mapi:

:::chromium
Atveriet pārlūkprogrammas **Iestatījumi**, pēc tam **Lejupielādes** un ieslēdziet **Jautāt, kur saglabāt katru failu pirms lejupielādes**.
:::

:::firefox
Atveriet **Iestatījumi**, pēc tam **Vispārīgi**, un sadaļā **Faili un lietojumprogrammas** izvēlieties **Vienmēr jautāt, kur saglabāt failus**.
:::

:::safari
Atveriet **Safari > Iestatījumi > Vispārīgi** un iestatiet **Faila lejupielādes vieta** uz **Jautāt par katru lejupielādi**.
:::

Ja saglabājat divas reizes ar vienu un to pašu nosaukumu, pārlūkprogramma otrajam failam var pievienot numuru, piemēram, `Site (1).civilcraft.json`. Nākamreiz atveriet jaunāko.

## Tiešsaistē un bezsaistē

Jebkurā gadījumā CivilCraft darbojas tikai jūsu datorā: atverot fails tiek nolasīts pārlūkprogrammā, saglabājot tas tiek lejupielādēts. Lai atvērtu CivilCraft bez jebkāda savienojuma, vispirms saglabājiet to lietošanai bezsaistē:

1. Kamēr esat tiešsaistē, augšējā lietotņu joslā noklikšķiniet uz {{ui:Saglabāt bezsaistei}}.
2. Poga skaita uz augšu (“Saglabā 12 no 30”) un tad rāda {{ui:Gatavs darbam bezsaistē}}. CivilCraft ir neliels (aptuveni 0.6 MB), tāpēc tas aizņem brīdi. Saglabātajā kopijā ir iekļauta šī palīdzība un paraugobjekts.
3. Bez savienojuma atveriet to pašu adresi (vai tās grāmatzīmi). Viss darbojas, tostarp {{ui:Atvērt paraugobjektu}}.

Pogas citi stāvokļi:

- {{ui:Neizdevās saglabāt}}: daži faili netika lejupielādēti. Pārbaudiet savienojumu un noklikšķiniet uz tās, lai mēģinātu vēlreiz.
- {{ui:Bezsaiste nav pieejama}}: šis pārlūkprogrammas logs nevar saglabāt bezsaistes kopiju (privātie logi un daži pārvaldīti datori to bloķē). Izmantojiet parastu logu.

Noklikšķiniet uz {{ui:Gatavs darbam bezsaistē}}, lai redzētu, kad kopija tika saglabāta, ar divām izvēlēm: {{ui:Saglabāt vēlreiz (iegūt jaunāko versiju)}} un {{ui:Noņemt bezsaistes kopiju}}. Pirms objekta apmeklējuma saglabājiet vēlreiz, lai kopija atbilstu jaunākajai versijai. Vairāk: [Bezsaiste](common:offline).

:::offline
Jūs tagad esat bezsaistē. Ja CivilCraft tika saglabāts lietošanai bezsaistē, viss darbojas, tostarp paraugobjekts. Ja nē, turpiniet darbu šajā cilnē, bet neatjaunojiet to, kamēr atkal nebūsiet tiešsaistē; bez saglabātas kopijas {{ui:Atvērt paraugobjektu}} neizdodas ar ziņojumu “Paraugu nevarēja ielādēt”.
:::

:::tip
Lietošanai laukā saglabājiet CivilCraft lietošanai bezsaistē un nesiet punktu failus tieši uz klēpjdatora. Projekti un eksporti bez savienojuma tiek saglabāti kā lejupielādes, tāpēc varat importēt dienas uzmērījumus, pārbaudīt virsmu un saglabāt projektu objektā.
:::

Mākoņa saglabāšana vēl nav pieejama, un darbvirsmas versijas vēl nav izlaistas. Šobrīd saglabātie faili ir vienīgā kopija: glabājiet tos vietā, kur tiek veikta dublēšana.

## Papildinājumi, ko izmanto fails

Saglabājot projektu, kurā ir dati no papildinājuma (Būvnoteikumu atzīmes vai Adreses-uz-objektu avots), fails ieraksta, kuri papildinājumi un kuras versijas. Ja to atverat datorā, kurā tāda nav, virs plāna redzama josla, kas to norāda, un piedāvā pievienot no jūsu konta saraksta. Ieraksts ir tikai piezīme: fails tiek atvērts jebkurā gadījumā.

## Atsaukšana no Studio

CadCraft Studio iekšienē katrs solis, ko pabeidzat CivilCraft, tiek paziņots Studio, tāpēc tās projekta līmeņa atsaukšana var atsaukt pēdējo soli dažādās lietotnēs. Studio atsauc soli tikai tad, kad CivilCraft pašas atsaukšanas steks ir tieši tāds, kāds bija pēc šī soļa; pēc citas faila atvēršanas tas šo logu izlaiž.

## Aizverot ar nesaglabātām izmaiņām

Ja projektam ir nesaglabātas izmaiņas un aizverat cilni, pārlādējat lapu vai atstājat lapu, pārlūkprogramma jautā, vai vēlaties aiziet. Tās formulējums un izskats pieder pārlūkprogrammai, un CivilCraft to nevar mainīt. {{ui:Jauns}} un projekta vai LandXML faila atvēršana tā vietā jautā CivilCraft pašas lodziņā **Nesaglabātas izmaiņas**, ar pogām {{ui:Atcelt}}, {{ui:Nesaglabāt}} un {{ui:Saglabāt kopiju}}.
