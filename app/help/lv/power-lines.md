---
title: Elektrolīniju darbvieta
summary: Gaisvadu līnijas un pazemes kabeļi jūsu objektā ar jūsu pašu bibliotēkām, izliece un spriegums saskaņā ar jūsu slodzes gadījumiem, atstatumu un izturības pārbaudes, vilkšanas tabulas, daudzumi, lapas un GIS eksports.
keywords: elektrolīnija, gaisvadu līnija, elektrība, sadale, stabi, balsti, vadītājs, izliece, spriegums, vilkšana, atstatums, pazemes kabelis, tranšeja, darbvieta, komunālie
from: 638dd856
---

Elektrolīniju darbvieta novieto gaisvadu līnijas un pazemes kabeļus uz jūsu jau esošā CivilCraft objekta: tie paši uzmērījuma punkti, tas pats terēns, tas pats projekta fails.

:::warning
Projektēšanas palīglīdzeklis. Darbvieta aprēķina izlieci, spriegumu, atstatumus un slodzes, izmantojot **jūsu** slodzes gadījumus un ierobežojumus; nekāds valsts standarts nav iebūvēts. Inženieris pārbauda katru rezultātu pret piemērojamo standartu, pirms kaut kas tiek uzbūvēts.
:::

## Atvēršana

Izvēlieties {{ui:Virsma}} › {{ui:Vairāk}} › {{ui:Elektrolīniju darbvieta}} vai **Elektrolīnijas** sadaļā Darbvieta. Rīkjosla tad rāda grupu **Elektrolīnijas**, un grupas Projektēšana un GIS atkāpjas. Lai atgrieztos, izvēlieties **Civil** sadaļā Darbvieta. CivilCraft atceras darbvietu, ko pēdējo reizi izmantojāt šajā datorā.

Kreisajā panelī augšpusē parādās divas sadaļas:

- **Elektrolīnijas**: jūsu slodzes gadījumi un ierobežojumi, projekta līnijas un kabeļi un **Pārbaudes**, vienmēr atjaunotas. Noklikšķiniet uz pārbaudes, lai atlasītu to, uz ko tā attiecas.
- **Bibliotēka**: jūsu paši vadītāji, kabeļi, balsti, iekārtas un tranšeju tipi. Skatiet [Jūsu elektrolīniju bibliotēka](topic:power-line-library).

## Kas ir grupā Elektrolīnijas

| Rīks | Ko tas dara | Tēma |
|---|---|---|
| **Līnija** | Gaisvadu līnija: noklikšķiniet uz katra balsta | [Zīmēt gaisvadu līniju](topic:overhead-line) |
| **Balsts** | Pievieno balstu posmā | [Zīmēt gaisvadu līniju](topic:overhead-line) |
| **Kabelis** | Pazemes kabeļa maršruts tranšejā | [Pazemes kabeļi](topic:underground-cables) |
| **Iekārta** | Skapis, transformators, savienojums vai avots, no kura tīkls tiek barots | [Pazemes kabeļi](topic:underground-cables) |
| **Šķērslis** | Kas tāds, ko līnija šķērso: ceļš, ēka, cita līnija | [Pārbaudes](topic:power-line-checks) |
| **Garenprofils** | Līnijas garenprofils: terēns, balsti un vadītājs katrā slodzes gadījumā | [Zīmēt gaisvadu līniju](topic:overhead-line#the-line-profile) |
| **Vairāk** | Slodzes gadījumi un ierobežojumi, vilkšanas tabulas, daudzumi, lapas un atskaite, GIS, pētījumu faili | [Izliece un spriegums](topic:sag-and-tension), [Izvades](topic:power-line-outputs), [Pētījumu faili](topic:power-line-study-file) |

Viss, ko pievienojat, ir viens atsaukšanas solis, tiek saglabāts projekta failā un tiek zīmēts plānā slāņos ar nosaukumiem `C-POWR-…`, tāpēc DXF, DWG un PDF eksporti to iekļauj arī.
