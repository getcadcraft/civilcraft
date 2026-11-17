---
title: Uzmērījuma punktu importēšana
summary: Atveriet CSV vai teksta punktu failu, pārbaudiet kolonnu secību dialogā Importēt punktus, labojiet rindas, ko nevar nolasīt, un sadaliet punktus grupās.
keywords: importēt punktus, csv, txt, pnezd, penzd, punktu fails, uzmērījums, cogo punkti, punktu grupas, kolonnas, ziemeļi, austrumi
from: ad33d88a
---

Punktu fails ir teksta fails ar vienu punktu katrā rindā: punkta numurs, ziemeļi, austrumi, augstums un apraksts jebkurā secībā, atdalīti ar komatiem, tabulācijām, semikoliem vai atstarpēm. CivilCraft to nolasa pārlūkprogrammā un uzreiz izveido no tā virsmu.

## Pirms sākat

- Zināt faila kolonnu secību, ja iespējams (PNEZD un PENZD datoram izskatās vienādi).
- Zināt tā vienības. CivilCraft nepārveido: iestatiet kreisajā panelī **Vienības** atbilstoši failam (skatiet [Vienības, pikets un skaitļu formāti](topic:units-and-stations)).
- Koordinātas var būt lielas (valsts plaknes ziemeļi un austrumi miljonos ir normāli).

## Importēt failu

1. Noklikšķiniet {{ui:Atvērt}} rīkjoslā vai nospiediet {{key:Mod+O}} un izvēlieties failu. To var arī ievilkt plānā.
   Atveras dialogs **Importēt punktus** ar faila nosaukumu, **Kolonnas** sarakstu, kas iestatīts uz {{ui:Noteikt}}, kopsavilkuma rindu un pirmajiem sešiem punktiem.
2. Izlasiet kopsavilkuma rindu. Tā saka, cik punkti nolasīti, kādā kolonnu secībā, kā šī secība atrasta un ar ko kolonnas ir atdalītas. Ir trīs veidi, kā secība tiek atrasta:
   - "no galvenes rindas": pirmā rinda nosauc tās kolonnas (Point, Northing, Easting, Elevation, Description, vai X, Y, Z …). Tas ir drošākais.
   - "kā izvēlēts": jūs izvēlējāties secību sarakstā **Kolonnas**.
   - "uzminēts pēc kolonnu skaita un jūsu punktu rindas iestatījuma (PNEZD) — pārbaudiet, vai ziemeļi un austrumi nav samainīti": galvenes nebija vai tā nebija derīga. Ja jūsu faili parasti sākas ar austrumiem, iestatiet **Punktu rindas** uz P, E, N, Z, D [CivilCraft iestatījumos](topic:settings).
3. Pārbaudiet priekšskatījuma tabulu. Tās kolonnas vienmēr ir **Punkts**, **Ziemeļi**, **Austrumi**, **Augstums**, **Apraksts**, neatkarīgi no faila secības. Reāla objekta ziemeļi un austrumi parasti ir skaidri dažādu lielumu: ja tie izskatās samainīti, minējums bija nepareizs.
4. Ja secība nav pareiza, izvēlieties pareizo sarakstā **Kolonnas** (piemēram, {{ui:PENZD — punkts, austrumi, ziemeļi, augstums, apraksts}}). Kopsavilkums un priekšskatījums uzreiz atjaunojas.
5. Zem priekšskatījuma meklējiet **Rindas, ko nenolasīja**. Katrs ieraksts norāda faila rindas numuru, iemeslu un rindas sākumu. Skatiet [Rindas, kas netiek nolasītas](topic:import-points#rows-that-are-not-read).
6. Noklikšķiniet {{ui:Importēt}}.
   Punkti parādās plānā, skats pietuvojas tiem, un virsma tiek izveidota. Statusa joslā teikts, piemēram: "Importēti 276 punkti no site.csv; virsma: 546 trīsstūri."

Ja projektam vēl nebija nosaukuma, tam tiek dots faila nosaukums.

## Pārbaudiet grupas

Katrs punkts pieder grupai, kuras nosaukums ir tā apraksta **pirmais vārds** lielajos burtos: "GRD", "FL 12" un "fl" ir grupas GRD, FL un FL. Punkti bez apraksta iekļaujas grupā "(nav apraksta)".

1. Skatiet tabulu zem **Punkti** kreisajā panelī: grupa, punktu skaits un izvēle **Virsma**.
2. Katra grupa sākas kā {{ui:Punkti}}. Mainiet līnijas, kas veido zemi (notekas, seguma malas, virsotnes un pamatnes, grēdas un līdzīgas kodētas līnijas), uz {{ui:Lūzumlīnija}}. Iestatiet grupas, kas nedrīkst veidot zemi (kontrolpunkti, koku virsotnes, komunālo pakalpojumu stabi, uzmērīti pa augšu), uz {{ui:Atstāts ārpusē}}.
3. Noklikšķiniet punktu plānā (ar {{ui:Atlasīt}}), lai labajā panelī redzētu tā numuru, koordinātas, augstumu, aprakstu un grupu.

:::warning
Lūzumlīnijas grupa savieno **visus** tās punktus **vienā** līnijā punktu numuru secībā. Tas darbojas, kad katra kodētā līnija uzmērīta secīgi ar savu kodu. Divas atsevišķas notekas līnijas, abas kodētas "FL", kļūst par vienu līniju, kas zigzagā savieno tās. Ja jūsu kodi ir kopīgi, izmantojiet rīku {{ui:Lūzumlīnija}}, lai noklikšķinātu katras līnijas punktus (skatiet [Izveidot un precizēt virsmu](topic:build-surface)).
:::

## Rindas, kas netiek nolasītas

| Parādītais iemesls | Ko tas nozīmē | Ko darīt |
|---|---|---|
| "ziemeļi vai austrumi nav skaitlis" | Koordinātu kolonnā ir teksts | Pārbaudiet kolonnu secību vai teksta rindu failā vidū |
| "augstums nav skaitlis" | Augstuma kolonnā ir teksts | Nepareiza kolonnu secība vai apraksts augstuma kolonnā |
| "nav punkta numura" | Punktu kolonna ir tukša | Numurējiet punktu vai izvēlieties secību bez P (NEZD, NEZ …): tad punkti tiek numurēti 1, 2, 3 … |
| "punkts 12 parādās divreiz (paturēts pirmais)" | Divas rindas dala vienu numuru | Pārnumurējiet vienu no tām failā, ja abi ir reāli uzmērījumi |
| "3 kolonnas, sagaidītas 5 (PNEZD)" | Rinda ir īsa | Salauzta rinda vai nepareiza kolonnu secība |

Punkts ar tukšu augstumu tiek paturēts, bet virsmā netiek izmantots. Rādītāji zem **Punkti** rāda, cik punktiem ir augstums.

Rindas, kas sākas ar `#`, `;` vai `//`, ir komentāri un tiek izlaistas. Tukšas rindas tiek izlaistas.

## Aizvietot vai pievienot punktus

Importējot atkārtoti, visi punkti tiek **aizvietoti**; tie netiek pievienoti. Jūsu trases, platformas, caurules, uzzīmētās lūzumlīnijas un robeža paliek. Atsaukšanas vēsture tiek notīrīta, tāpēc saglabājiet projektu pirms importēšanas, ja varētu vajadzēt vecos punktus. Lai apvienotu divus failus, savienojiet tos teksta redaktorā vai izklājlapā pirms importēšanas (uzmanieties no atkārtotiem punktu numuriem).

Punktus CivilCraft iekšienē vēl nevar pārvietot, rediģēt vai dzēst. Labojiet tos failā un importējiet vēlreiz.

## Saistītie

- [Punktu failu formāti](topic:point-file-formats): katra kolonnu secība un kā tiek atpazītas galvenes.
- [Izveidot un precizēt virsmu](topic:build-surface).
