---
title: Darbs ar slāņa atribūtu tabulu
summary: Apskatīt katru GIS slāņa objektu tabulā, kārtot un filtrēt to, atlasīt rindas un objektus kopā, labot vērtības, pievienot laukus, aprēķināt jaunas vērtības un saglabāt tabulu kā CSV.
keywords: atribūtu tabula, tabula, lauki, kolonnas, rindas, kārtot, filtrs, izteiksme, atlasīt, rediģēt, lauku kalkulators, aprēķināt, pievienot lauku, pārdēvēt lauku, noņemt lauku, csv, eksportēt, gis, shapefile, geopackage, simbolika
from: fd9d6c11
---

Atveriet slāņa tabulu no tā **trīs punktu** izvēlnes GIS slāņu sarakstā ({{ui:Atribūtu tabula…}}), no Virsma › Vairāk › {{ui:Atribūtu tabula}} vai ierakstot `ATTRIBUTES`, `ATTTABLE` vai `TABLE`. Tabula atveras blakus plānam un paliek atvērta, kamēr strādājat. Tiek zīmētas tikai redzamās rindas, tāpēc slānis ar tūkstošiem objektiem atveras un ritina ātri.

## Kārtot, filtrēt un atlasīt

- **Kārtot:** noklikšķiniet uz kolonnas nosaukuma. Otrs klikšķis apgriež secību, trešais atjauno faila kārtību. Tukšas vērtības vienmēr paliek apakšā. Kārtošana maina tikai to, ko redzat, nekad pašu slāni.
- **Filtrs:** rakstiet filtra lodziņā. Izteiksme, piemēram, `AREA > 500 and USE = 'Res'`, patur rindas, kurās tā ir patiesa (tie paši vārdi kā atlases cilnē [Analizēt GIS slāņus](topic:gis-analysis): `=`, `<`, `like`, `contains`, `is null`, `in`, `between`, `and`, `or`, `not`, `$area`, `$length`). Viss, kas nav izteiksme, piemēram, `oak maple`, meklē šos vārdus katrā kolonnā.
- **Atlasīt rindas:** noklikšķiniet uz rindas. Ctrl+klikšķis pievieno vai noņem vienu, Shift+klikšķis atlasa virkni, un {{ui:Atlasīt redzamās rindas}} ņem katru rindu, kas iztur filtru. Atlasītie objekti tiek zīmēti plānā, un klikšķis uz objekta plānā atlasa tā rindu šeit.
- Ar atlasītām rindām varat {{ui:Tālummaiņa}} uz tām, izveidot **slāni no atlases** un nolasīt kopējo laukumu vai garumu statusa rindā.

## Labot vērtības

Veiciet dubultklikšķi uz šūnas (vai pārvietojieties ar bultiņu taustiņiem un nospiediet Enter), ierakstiet jauno vērtību un nospiediet Enter. Esc atstāj to, kāda tā bija. Vērtībai jāiekļaujas kolonnā: skaitļi kā skaitļi, datumi kā `YYYY-MM-DD`, jā/nē kā yes, no, true vai false. Vērtība, kas neiekļaujas, tiek noraidīta ar teikumu, un nekas nemainās. Tukšs lodziņš padara vērtību tukšu. Katra izmaiņa ir viens atsaucams solis: {{ui:Atsaukt}} un {{ui:Atkārtot}} atrodas tabulas apakšā, un Ctrl+Z darbojas plānā.

## Lauki

Sadaļā **Lauki** varat pievienot lauku (teksta, skaitļa, datuma vai jā/nē), pārdēvēt vai noņemt. Jaunais lauks sākas tukšs. Pārdēvēšana tiek pārnesta: slāņa etiķešu lauks un [stils pēc atribūta](topic:gis-symbology) pāriet uz jauno nosaukumu, un lauka noņemšana noņem etiķeti un stilu, kas to izmantoja. Katrs ir viens atsaucams solis, kas atjauno visu.

## Lauku kalkulators

Ieraksta vērtību katrā rindā (vai tikai atlasītajās) no rindas citiem laukiem, tās ģeometrijas un dažām funkcijām. Izvēlieties esošu lauku vai **Jauns lauks…** un norādiet tā nosaukumu un tipu. Nekas netiek palaists kā kods: izteiksmi nolasa neliels analizators ar fiksētu funkciju sarakstu.

| Grupa | Vārdi |
|---|---|
| Skaitļi | `+ - * /`, iekavas, `abs round(x, digits) floor ceil sqrt pow min max` |
| Teksts | `upper lower trim len substr(text, from, count) left right replace concat` (teksts jāliek 'vienpēdiņās'; lauka nosaukums ar atstarpēm jāliek "dubultpēdiņās" vai [kvadrātiekavās]) |
| Izvēle | `if(test, then, else)`, `coalesce(a, b, …)`, `num(x)`, `str(x)` |
| Datumi | `year month day` no `YYYY-MM-DD` vērtības |
| Ģeometrija | `$area $perimeter $length $x $y $vertices`, projekta vienībās |

Rezultāts, ko nevar saglabāt lauka tipā (teksts skaitļu laukā), tiek atstāts tukšs un ieskaitīts ziņojumā. Dalīšana ar nulli dod tukšu vērtību. Piemēram, `round($area / 43560, 2)` ieraksta akrus no kvadrātpēdām.

## Eksports

{{ui:Eksportēt CSV}} saglabā rindas, ko redzat (pēc filtra un kārtošanas), kā UTF-8 CSV failu ar lauku nosaukumiem pirmajā rindā. Teksts, kas sākas ar `=`, `+`, `-` vai `@`, saņem vadošu apostrofu, lai izklājlapa to nepalaistu kā formulu. Lai saglabātu pašu slāni, izmantojiet [Eksportēt izbūves datus GIS](topic:gis-export).

## Ierobežojumi

Tabula rāda slāni vienā kārtošanas secībā un ar vienu filtru vienlaikus. Rindas šeit nevar pievienot vai dzēst (izveidojiet jaunu slāni no atlases), ģeometriju nevar rediģēt, un lauka tipu nevar mainīt pēc tā izveidošanas.
