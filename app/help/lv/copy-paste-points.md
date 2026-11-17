---
title: Uzmērījuma punktu atlasīšana, kopēšana un ielīmēšana
summary: Atlasiet uzmērījuma punktus ar klikšķi, Shift un rāmi vai visus uzreiz; kopējiet, izgriezt, ielīmējiet, ielīmējiet vietā, dublējiet un dzēsiet tos ar jauniem punktu numuriem, kas nekad nesakrīt; ielīmējiet punktu rindas no un uz izklājlapu.
keywords: kopēt, ielīmēt, izgriezt, dublēt, dzēst punktus, atlasīt punktus, atlasīt visu, rāmja atlase, logs, starpliktuve, izklājlapa, csv, pārnumurēt, punktu numuri, ielīmēt vietā, klons, nospraušana
from: 78a6aea7
---

Uzmērījuma punktus var kopēt un ielīmēt projektā, starp projektiem divos pārlūka logos un uz izklājlapu un no tās. Katra izmaiņa ir viens atsaukšanas solis, un virsma uzreiz tiek atjaunota no jaunajiem punktiem.

## Atlasīt punktus

Ar {{ui:Atlasīt}} ({{key:V}}):

- **Noklikšķiniet** uz punkta, lai to atlasītu (un tikai to). Tā numuri tiek rādīti sadaļā **Rekvizīti**.
- {{key:Shift}} un **klikšķis** pievieno punktu atlasei vai to izņem.
- {{key:Shift}} un **velciet** zīmē rāmi: rāmī esošie punkti tiek pievienoti atlasei. Ja velkat ap punktiem, tas kļūst par lasso; skat. [Uzmērījuma punktu lasso atlase](topic:lasso-selection). Velkot bez {{key:Shift}}, plāns tiek pārvietots, kā vienmēr.
- {{key:Mod+A}} (vai {{ui:Vairāk}} › {{ui:Atlasīt visus punktus}}) atlasa katru punktu.
- {{key:Esc}} (vai {{ui:Vairāk}} › {{ui:Noņemt atlasi}}) notīra atlasi.

Atlasītajiem punktiem ir gredzens. Ja ir atlasīti vairāki, sadaļā **Rekvizīti** tiek rādīts to skaits, numuri, augstumu diapazons un grupas.

## Kopēt, izgriezt un dzēst

- {{ui:Kopēt}} vai {{key:Mod+C}} kopē atlasītos punktus. CivilCraft saglabā kopiju un arī ieliek to sistēmas starpliktuvē kā punktu rindas, lai to varētu tieši ielīmēt izklājlapā vai teksta failā.
- {{ui:Vairāk}} › {{ui:Izgriezt}} vai {{key:Mod+X}} tos kopē un dzēš vienā solī.
- {{ui:Vairāk}} › {{ui:Dzēst}} vai {{key:Delete}} tos dzēš. {{key:Mod+Z}} tos atgriež.

Rindas ir: punkts, ziemeļi, austrumi, augstums, apraksts (P,N,E,Z,D), atdalītas ar komatiem, ar trim decimālzīmēm. Lai austrumi būtu pirms ziemeļiem, iestatiet **Punktu rindas** [CivilCraft iestatījumos](topic:settings). Apraksts, ko izklājlapa uzskatītu par formulu (sākas ar =, +, - vai @), tiek papildināts ar apostrofu, lai tas paliktu teksts.

## Ielīmēt

1. Nospiediet {{key:Mod+V}} vai noklikšķiniet uz {{ui:Ielīmēt}}. Punkti seko kursoram kā mazi krustiņi ar punktētu līniju atpakaļ uz vietu, no kuras tie nāca.
2. Noklikšķiniet, kur tiem jābūt. Nokopēto punktu vidus nonāk klikšķa vietā.
3. Vai nospiediet {{key:Enter}}, lai tos novietotu to paša koordinātēs, vai {{key:Esc}}, lai atceltu.

{{ui:Vairāk}} › {{ui:Ielīmēt vietā}} vai {{key:Mod+Shift+V}} ielīmē punktus to paša koordinātēs uzreiz. Ielīmētie punkti pēc tam tiek atlasīti, lai tos varētu atkal kopēt, pārvietot vai dzēst.

:::note
Noklikšķinot uz {{ui:Ielīmēt}} rīkjoslā, tiek nolasīta sistēmas starpliktuve. Pirmajā reizē pārlūkprogramma var jautāt, vai CivilCraft drīkst piekļūt starpliktuvei. Ja atteiksities, rīkjoslas poga ielīmē tikai CivilCraft pašu kopiju; {{key:Mod+V}} joprojām ielīmē rindas no izklājlapas bez jautāšanas.
:::

## Punktu numuri nekad nesakrīt

Diviem punktiem nekad nav viens un tas pats numurs. Ielīmējot:

- Ielīmētais punkts paturē savu numuru, ja projektā neviens punkts to neizmanto. Tātad pēc **Izgriezt** punkti tiek ielīmēti atpakaļ ar saviem numuriem, un punkti, kas nokopēti no cita projekta, paturē savus, ja tie ir brīvi.
- Ielīmētajam punktam, kura numurs ir aizņemts, tiek dots jauns vesels numurs: par vienu lielāks nekā augstākais lietotais numurs, skaitot uz augšu.
- Statusa joslā tiek norādīts, kas notika, piemēram, „1 paturēja savu numuru; 9 saņēma jaunus numurus: 10–18 kļuva par 277–285“.

[CivilCraft iestatījumos](topic:settings) varat izvēlēties **Vienmēr jauni numuri** un numuru, no kura jaunie numuri sākas, piemēram, 5000 projektēšanas punktiem.

:::warning
Punktu grupas, kas veido virsmu kā **lūzumlīniju**, savieno savus punktus numuru secībā. Nokopēti lūzumlīnijas punkti (piemēram, FL uzņēmumi) saņem jaunus, augstākus numurus un pievienojas šīs lūzumlīnijas beigām, iespējams, ar garu lēcienu. Pēc šādu punktu ielīmēšanas pārbaudiet plānu vai iestatiet to grupu uz {{ui:Punkti}}.
:::

## Dublēt

{{ui:Vairāk}} › {{ui:Dublēt}} vai {{key:Mod+D}} izveido atlasīto punktu kopiju, kas seko kursoram: noklikšķiniet, kur tai jābūt. Kopijām vienmēr tiek doti jauni numuri, un CivilCraft starpliktuve paliek tāda, kāda tā bija.

## No izklājlapas vai teksta faila

Izklājlapā atlasiet punktu rindas (punkts, ziemeļi, austrumi, augstums, apraksts) un nokopējiet tās. CivilCraft nospiediet {{key:Mod+V}} un noklikšķiniet, kur tām jābūt, vai nospiediet {{key:Mod+Shift+V}}, lai tās novietotu to paša koordinātēs, kas parasti ir vajadzīgs reāliem uzmērījuma datiem.

Rindas tiek nolasītas tieši kā [punktu fails](topic:point-file-formats): komati, tabulācijas vai atstarpes, galvenes rinda, ja tāda ir. Bez galvenes kolonnu secību nosaka **Punktu rindas** [CivilCraft iestatījumos](topic:settings).

Ja abas ir pieejamas, CivilCraft izvēlas pēc tā, kas ir jaunāks: rindas sistēmas starpliktuvē, kas atšķiras no CivilCraft pēdējās kopijas, tika nokopētas vēlāk, tāpēc tās tiek ielīmētas. Teksts, kurā nav punktu, tiek ignorēts, un tā vietā tiek ielīmēta CivilCraft pati kopija.

## Starp projektiem un logiem

Kopija tiek saglabāta šajā pārlūkprogrammā, tāpēc otrs CivilCraft logs to var ielīmēt pat pēc tam, kad pirmais log aizvērts. Punkti, kas nokopēti metru projektā un ielīmēti pēdu projektā, paturē savus numurus: nekas netiek pārveidots, un statusa joslā tas tiek norādīts.

## Kas netiek kopēts

Pagaidām tiek kopēti tikai uzmērījuma punkti. Trases, platformas, cauruļu tīkli, lūzumlīnijas un robežas pagaidām nevar kopēt vai ielīmēt. Ielīmēšana nevar pārvietot esošos punktus: izmantojiet {{ui:Izgriezt}} un ielīmēšanu vai pārvietojiet vienu punktu vienlaikus ([Rediģēt uzmērījuma punktu](topic:edit-points)).
