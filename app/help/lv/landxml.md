---
title: Apmaiņa ar LandXML
summary: Atveriet LandXML no citas civilo inženieru programmatūras kā jaunu projektu, eksportējiet punktus, virsmas, trases, profilus un cauruļu tīklu kā LandXML 1.2 un zinot, kas netiek līdzi.
keywords: landxml, xml, imports, eksports, apmaiņa, tin, virsma, trase, profils, cauruļu tīkls, sadarbspēja, datu apmaiņa
from: 870d5ece
---

LandXML ir atvērtais apmaiņas formāts, ko lasa un raksta lielākā daļa civilo programmu. CivilCraft nolasa un raksta LandXML 1.2. Ja esat lietojis Civil 3D, tā LandXML importa un eksporta dialogi ir tuvākie analogi; šeit izvēļu nav, un piezīmes jums pateiks, kas tika izlaists.

## Atvērt LandXML failu

1. Noklikšķiniet {{ui:Open}} (vai nospiediet {{key:Mod+O}}) un izvēlieties `.xml` vai `.landxml` failu, vai nometiet to uz plāna.
2. Ja pašreizējam projektam ir nesaglabātas izmaiņas, CivilCraft vispirms jautā. Izvēlieties {{ui:Save a copy}}, {{ui:Don’t save}} vai {{ui:Cancel}}.
3. Tiek izveidots **jauns projekts**. Statusa joslā rakstīts, kas tika nolasīts, piemēram, "Atvērts site.xml: 412 punkti, 2 virsmas, 3 trases."
4. Apskatiet lodziņu zem **Virsmas** faktiem. Tajā uzskaitīts viss, kas tika izlaists vai mainīts, piemēram:
   - "Tikai pirmā virsma ("EG") tika atvērta; failā ir vēl 1."
   - "Trasei "Nogāze A" ir elementi, ko CivilCraft vēl nevar zīmēt (nav līnijas, loki vai klotoīdas spirāles); tā tika izlaista."
   - "Cauruļu tīkla noteikumu failā nebija; tiek izmantoti vietturi — iestatiet savus sadaļā Projekts."

Kas kļūst par ko:

| Failā | CivilCraft |
|---|---|
| Mērvienības (Imperial vai Metric) | Projekta **Mērvienības** (pēdas vai metri) |
| Projekta nosaukums | Projekta **Nosaukums** |
| CgPoints | Projekta punkti; apraksts (vai kods) dod grupu |
| Pirmā TIN virsma | Esošā zeme, izmantota kā tā ir ("Virsma (no LandXML)") |
| Katra trase ar līnijām, lokiem un klotoīdu spirālēm | Trase ar PI, rādiusiem un spirāļu garumiem, atjaunota no līknēm |
| Katras trases pirmais projektētais profils | Tās projektētais profils ar parabolisko vertikālo līkni |
| Pirmais cauruļu tīkls | Cauruļu tīkls ar tā akas malām, dūņu kamerām un dibena augstumiem |
| Elementu līnijas ar līnijām un lokiem | Elementu līnijas, loki saglabāti; no citas programmas tās sākas kā **Tikai uzzīmēts** |

Pilns elementu un atribūtu saraksts ir [LandXML: ko nolasa un ko raksta](topic:landxml-reference).

:::note
Virsma, kas nolasīta no LandXML, netiek pārbūvēta, kad maināt punktu grupas vai zīmējat lūzumlīnijas. Lai to izveidotu no punktiem, sadaļā **Virsma** noklikšķiniet {{ui:Rebuild the surface from the points}} ({{key:Mod+Z}} atgriež LandXML virsmu).
:::

## Eksportēt LandXML

1. Noklikšķiniet {{ui:LandXML}} grupā **Eksportēt**.
2. Pārlūks lejupielādē `<name>.xml`. Statusa joslā rakstīts, kas tajā ievietots, piemēram, "Eksportēts LandXML 1.2: 276 punkti, 2 virsmas, 1 trase, cauruļu tīkls. Platformas šeit nav LandXML daļa; daļa ir pielāgotā virsma."

Fails satur:

- **Mērvienības**: ASV pēdas (survey) vai metri.
- **CgPoints**: katrs punkts ar savu numuru kā nosaukumu, aprakstu un grupu kā kodu.
- **Virsmas**: esošā zeme kā TIN ar savām lūzumlīnijām un ārējo robežu kā avota datiem; un, kad platformas vai koridori veido reljefu, otra TIN virsma ar nosaukumu "Proposed".
- **Trases**: līnijas, loki un klotoīdas spirāles ar savām stacijām, katra ar profilu, kurā ir gar to izparaugota esošā zeme, un projektētais profils (PVI un paraboliskās līknes), ja tam ir vismaz divi PVI.
- **PipeNetworks**: konstrukcijas ar savām malām, dūņu kamerām un dibena augstumu katrai caurulei, un caurules ar diametru, garumu un slīpumu.
- **PlanFeatures**: katra elementa līnija kā līnijas un loki ar augstumu katrā galā un tās lietojumu.

## Kas netiek līdzi

- Platformas un koridori kā objekti. To rezultāts ir virsmā "Proposed".
- Trases ar kļūdām (piemēram, pārklājušās līknes): izlaistas un uzskaitītas statusa ziņojumā.
- Caurules bez abiem dibena augstumiem un tīkli ar mazāk nekā diviem objektiem.
- Mala, kas ņemta no virsmas, tiek rakstīta kā fiksēta mala. Atverot vēlreiz, konstrukcija saglabā šo skaitli, pat ja virsma mainās.
- Tīkla noteikumi (mazākais slīpums, pārklājums, kritums): LandXML tiem nav vietas.
- Attēlojuma iestatījumi un punktu grupu virsmu izvēles: tiem saglabājiet CivilCraft projektu.

Atverot, CivilCraft nelasa spirāles, kas nav klotoīdas, režģa virsmas, punktus, kas tikai atsaucas uz citiem punktiem, parcelas, spirāles elementu līnijās, ceļus vai uzmērījuma datus. Katrs no tiem ir norādīts piezīmēs, nevis minēts pēc pieņēmuma.

## Atgriezeniskā apmaiņa

Lai nodotu darbu cilvēkam, kas izmanto citu civilo programmatūru, un to saņemtu atpakaļ, eksportējiet LandXML, ļaujiet viņam rediģēt un atveriet viņa LandXML kā jaunu projektu. Paturiet arī savu `.civilcraft.json`: tas ir vienīgais fails, kas saglabā visu, ko CivilCraft zina.
