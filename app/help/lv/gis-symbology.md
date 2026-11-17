---
title: Stila piešķiršana slānim pēc atribūta
summary: Krāsot GIS slāņa objektus pēc lauka vērtībām (viena krāsa katrai vērtībai vai pēc skaitļu diapazoniem), punktus izmērā pēc skaitļa, aizpildīt poligonus un rādīt leģendu plānā.
keywords: simbolika, stils, krāsa, kategorizēts, gradēts, unikālas vērtības, vienāds intervāls, kvantīle, dabiskie pārtraukumi, jenks, krāsu skala, krāsu aklums, leģenda, izmērs, punkti, horoplēta, klases, gis
from: a3a69add
---

Atveriet slāņa **trīs punktu** izvēlni GIS slāņu sarakstā un izvēlieties {{ui:Stils pēc atribūta…}}.

## Trīs stili

- **Vienots simbols:** slāņa krāsa, kā iepriekš.
- **Kategorizēts:** viena krāsa katrai atšķirīgajai jebkura lauka vērtībai. Līdz astoņām vērtībām saņem astoņas Okabe-Ito krāsas (izvēlētas, lai paliktu atšķirīgas biežākajos krāsu akluma veidos); ar vairāk vērtībām septiņas biežākās saņem katra savu krāsu, bet pārējās dalās pelēkā klasē **Cits**. Objekti bez vērtības ir pelēki.
- **Gradēts:** skaitliskais lauks tiek sadalīts 2 līdz 9 diapazonos, katrs ar krāsu no skalas. Vērtība uz robežas nonāk zemākajā diapazonā.

## Kā tiek sadalīti diapazoni

| Metode | Robežas |
|---|---|
| Vienāds intervāls | Diapazons no mazākās līdz lielākajai vērtībai sadalīts vienāda platuma daļās. Vērtības no 0 līdz 30 trijos diapazonos: 0, 10, 20, 30. |
| Kvantīle | Aptuveni vienāds objektu skaits katrā diapazonā. Robežas nolasa no sakārtotajām vērtībām ar parasto taisnās līnijas interpolāciju: vērtībām no 1 līdz 10 divos diapazonos robeža ir 5.5. |
| Dabiskie pārtraukumi (Jenks) | Griezumi, kas katrā diapazonā atstāj vismazāko izkliedi, tātad līdzīgu vērtību kopas paliek kopā. Vairāk nekā 1,500 vērtībām darbojas ar 1,500 vienmērīgi izvietotām un par to paziņo. |

## Krāsas

Viridis un Cividis iet no tumšas uz gaišu ar vienmērīgu spilgtuma maiņu, tāpēc diapazonu secību var nolasīt arī pelēkā vai krāsu akluma gadījumā. Blues iet no gaišas uz tumšu. Sarkans līdz zilam ir divvirzienu skala vērtībām ap vidu. **Apgriezt krāsas** apgriež jebkuru no tām. Dialogs uzskaita diapazonus un objektu skaitu katrā, pirms to lietojat.

## Izmērs, aizpildījums un leģenda

- **Punkta izmērs pēc** skaitļa lauka padara katra punkta kvadrātu lielāku, jo lielāka vērtība, starp diviem izmēriem, ko norādāt (puse no malas, milimetros uz papīra).
- **Poligonu iekšpuses krāsojums** aizpilda katru poligonu ar tā klases krāsu (caurumi paliek tukši). Krāsojums ir ekrānā; izdrukas un DXF/DWG rāda krāsotas kontūras.
- **Rādīt leģendu plānā** zīmē klases, to skaitu un izmēru diapazonu plāna apakšējā kreisajā stūrī. Leģenda ir ekrānā; tā nav izdrukā.
- Lai etiķetētu objektus ar lauku, izmantojiet **Etiķetēt ar** tajā pašā izvēlnē.

Stils tiek saglabāts projekta failā. Versija, kas nezina par stiliem, atver failu ar slāņa krāsu. Izdrukas, DXF un DWG nes klases kā atsevišķus slāņus ar nosaukumu pēc slāņa un klases, tuvākajā no deviņām pamata CAD krāsām. Slānis ar vairāk nekā 200,000 objektiem tiek zīmēts vienā krāsā.
