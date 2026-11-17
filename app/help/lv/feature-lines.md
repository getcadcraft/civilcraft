---
title: Raksturlīnijas
summary: Zīmēt 3D līnijas, ko noteiksiet pa virsotnēm, veidot to pakāpeniskas nobīdes un izmantot tās kā zemes lūzumlīnijas vai kā slīpus laukumus projektā.
keywords: loks, līkne, rādiuss, 3D loks, spirāle, izliektā apmale, slīpuma pārklājums, augstuma pārklājums, slīpuma bultiņas, raksturlīnija, slīpums, augstums, pakāpeniska nobīde, nobīde, lūzumlīnija, apmale, grāvis, uzbērums, slīps laukums, dienasgaisma, vertikālā plānošana, 3D polilīnija
from: d55b25fb
---

Raksturlīnija ir līnija ar augstumu katrā virsotnē: apmale, grāvja plūsmas līnija, uzbēruma augšmala vai slīpa laukuma mala. Augstumus iestatāt ar skaitli vai slīpumu, to kopējat sāniski ar soli uz augšu vai uz leju, un izvēlaties, ko virsmas ar to dara.

## Uzzīmēt vienu

1. Izvēlieties **Virsma** › {{ui:Vairāk}} › {{ui:Raksturlīnija}} vai nospiediet {{key:L}}.
2. Noklikšķiniet uz tās virsotnēm plānā. Klikšķis uz uzmērījuma punkta ņem punkta vietu un augstumu; citur virsotne ņem esošās zemes augstumu tur.
3. Nospiediet {{key:Enter}}, lai pabeigtu atvērtu līniju, vai noklikšķiniet uz pirmās virsotnes vēlreiz, lai to aizvērtu.

Jaunā līnija ir atlasīta un sākas kā esošās zemes lūzumlīnija, kas guļ uz zemes.

## Loki

Segments var būt loks plānā, kura gali atrodas dažādos augstumos: apmales atgriešanās, izliekts grāvis, rampa, kas pagriežas. Tā slīpums vienmērīgi iet pa loku, un tā garums tiek mērīts pa līkni.

- **Zīmēšanas laikā:** nospiediet {{key:C}} (skārienekrānā — {{ui:Loks}} joslā virs plāna), lai ieslēgtu lokus. Pēc virsotnes noklikšķiniet punktu uz līknes, tad noklikšķiniet, kur loks beidzas. Nospiediet {{key:C}} vēlreiz taisniem segmentiem. {{key:Backspace}} vispirms noņem punktu uz līknes.
- **Pēc tam:** sadaļā **Rekvizīti** ierakstiet rādiusu un pagriešanas virzienu virsotnes lodziņā **Loks**, piemēram, `50 L` vai `50 R` (pa kreisi vai pa labi, ejot pa līniju), un nospiediet {{key:Enter}}. Iztukšojiet lodziņu, lai segments atkal kļūtu taisns. Rādiuss, kas mazāks par pusi no segmenta, tiek noraidīts.

Atlasītā līnija rāda katra loka rādiusu blakus tā slīpumam. **Garums** ir pa lokiem plānā; **3D garums** ietver arī pacēlumu un nolaišanos. Pakāpeniskās nobīdes saglabā lokus: loks līkuma ārpusē aug, iekšpusē saraujas, un nobīde, kas iet pāri loka centram, tiek noraidīta.

Virsmas, 3D skats, DXF un DWG katru loku ņem kā īsus taisnus posmus, kas paliek 0.01 robežās no līknes. LandXML tos saglabā kā lokus (skatīt zemāk **Loki citos failos**).

## Iestatīt augstumus un slīpumus

**Rekvizīti** uzskaita virsotnes ar attālumu pa līniju, to **Augstumu** un **Slīpumu līdz nākamajai** (procentos). Ierakstiet vienu no tiem un nospiediet {{key:Enter}}:

- Augstums pārvieto tikai šo virsotni.
- Slīpums iestata augstumu segmenta tālākajā galā; virsotnes pēc tā paliek vietā, tāpēc nākamā segmenta slīpums mainās.

Arī sadaļā **Rekvizīti**:

| Darbība | Ko tā dara |
|---|---|
| **Pacelt vai nolaist visu par** | Pieskaita ierakstīto augstumu katrai virsotnei. |
| {{ui:Augstumi no zemes}} | Novieto katru virsotni atpakaļ uz esošās zemes (virsotnes ārpus virsmas paliek savās vietās un tiek uzskaitītas). |
| {{ui:Viens slīpums no pirmās līdz pēdējai}} | Saglabā pirmo un pēdējo augstumu un novieto starp tām esošās virsotnes uz viena vienmērīga slīpuma. |

Atlasītā līnija plānā rāda augstumus virsotnēs un slīpumus pa segmentiem. Velciet virsotni ar {{ui:Atlasīt}}, lai to pārvietotu; tās augstums paliek.

## Pakāpeniskas nobīdes

Zem **Pakāpeniska nobīde** ierakstiet **Attālumu** (pozitīvs līnijas virziena labajā pusē, negatīvs kreisajā), tad augstumu (par cik uz augšu vai uz leju) vai slīpumu procentos, un noklikšķiniet uz {{ui:Izveidot nobīdes līniju}}. Kopija ir jauna raksturlīnija: piemēram, apmales aizmugure 0.5 ft sāniski un 0.5 ft augstāk, vai grāvja mala 6 ft ārpus 2 % slīpumā. Attālums, kas kopiju pārlocītu pāri pati sev šaurā līkumā, tiek noraidīts.

## Slīpumi un augstumi ekrānā

Nospiediet {{key:E}} vai atzīmējiet **Slīpumi un augstumi raksturlīnijās** sadaļā **Attēlojums**, lai redzētu katras raksturlīnijas slīpumu pa katru segmentu (ar mazu bultiņu, kas norāda lejup) un tās augstumu virsotnēs. Tie tiek rādīti tikai ekrānā: rasējumā nekas netiek pievienots, un PDF, DXF un DWG paliek tādi, kādi bija. Īsi segmenti un blīvi izvietotas virsotnes paliek bez uzrakstiem, līdz tuvinat. Atlasītā līnija vienmēr rāda savus slīpumus un augstumus.

## Garenprofila skatā

Raksturlīnija, kas krusto trasi, parādās šīs trases garenprofila skatā ar savu nosaukumu un augstumu krustojumā; blakus esošās līnijas var rādīt arī. Skatiet [Projektēt garenprofilu](topic:profile).

## Ko virsmas ar to dara

Izvēlieties **Lietot**:

| Lietot | Kas notiek |
|---|---|
| Esošās zemes lūzumlīnija | Esošā zeme iet caur līniju tās augstumos, kā zīmēta lūzumlīnija. |
| Izlīdzināta projektā | **Slēgta** līnija kļūst par slīpu laukumu: projektētā virsma iekšpusē tiek izlīdzināta līdz tās malai. Ieslēdziet **Dienasgaisma līdz zemei**, lai no tās malas līdz zemei izveidotu izrakuma un uzbēruma nogāzes (horizontāli līdz 1 vertikāli), kā to dara laukums; katra nogāze sākas ar malas pašas augstumu tur. |
| Tikai zīmēta | Tā paliek plānā un iziet DXF, DWG un PDF (slānis C-GRAD-FEAT, 3D polilīnijas), bet virsmas to ignorē. |

Apjomos, griezumos un 3D skatā ir iekļautas raksturlīnijas, kas izlīdzinātas projektā, tāpat kā laukumi. Katra izmaiņa ir viens solis: {{key:Mod+Z}} to atsauc.

## Līniju kopīgošana ar komandu

Rasējumā, kas atvērts no jūsu mākoņa failiem CadCraft Studio, komandas plānā, projekta **Rekvizītos** (kad nekas nav atlasīts) ir sadaļa **Komanda** ar {{ui:Komandas līnijas…}}: līnijas, ko jūsu komanda ir kopīgojusi, katra ar savu versiju, bez raksturlīnijas iepriekšējas atlasīšanas. Atlasiet līniju, lai to kopīgotu, publicētu jaunu versiju, ielādētu komandas versiju vai pārtrauktu kopīgošanu. Ārpus šī iestatījuma sadaļa saka, kas tai vajadzīgs.

## Loki citos failos

| Fails | Kas notiek ar raksturlīniju ar lokiem |
|---|---|
| CivilCraft projekts | Saglabājas tieši tāpat. |
| LandXML | Ierakstīts kā plāna elements ar līnijām un lokiem un to augstumiem, un atkal nolasīts ar lokiem. Raksturlīnija no citas programmas tiek ielādēta kā **Tikai zīmēta**: izvēlieties tās **Lietot**, lai to ievietotu virsmā. |
| DWG un DXF | 3D polilīnija nevar saturēt loku, tāpēc līnija tiek ierakstīta kā īsi posmi 0.01 robežās no katra loka. CivilCraft rasējumā atzīmē arī to, kuri posmi bija loki: kad atverat rasējumu kā līnijas, {{ui:Raksturlīnijas}} atjauno līnijas kā raksturlīnijas ar to lokiem. Citas programmas redz parastu 3D polilīniju. |
