---
title: Zemes darbu tilpumi
summary: Lasiet izrakuma, uzbērumu un neto tilpumus starp esošo zemi un projektēto virsmu, pa platformām un koridoriem un kopā, un saprotiet režģa metodi, kas tiem ir pamatā.
keywords: tilpumi, zemes darbi, izrakums, uzbērums, neto, izrakums un uzbērums, daudzumi, režģa metode, virsmu salīdzinājums, tilpuma virsma, kubikjardi, kubikmetri
from: 299d7bc7
---

Tiklīdz platforma vai koridors veidojas ar slīpumiem bez problēmām, CivilCraft salīdzina projektēto virsmu ar esošo zemi un ziņo par izrakumu un uzbērumu. Skaitļi atjaunojas ar katru izmaiņu.

## Kur tos lasīt

- **Zemes darbi** labajā panelī, kad nekas nav atlasīts (skats **Projekts**), kad ir vismaz viena platforma vai viens koridors.
- **Zemes darbi** labajā panelī, kad platforma ir atlasīta (tās pašas kopsummas visam projektam).
- Līnija zem koridora iestatījumiem ar šī koridora paša izrakumu un uzbērumu.

Bloks **Zemes darbi** rāda:

- **Izrakums**, **Uzbērums** un **Neto** (ar "uzbērums" vai "izrakums" aiz tā, kas ir lielāks)
- līniju katram vienumam, ja ir vairāk nekā viens, piemēram, "Platforma 1: izrakums 120.4 cu yd, uzbērums 310.2 cu yd"
- metodes līniju: "Režģa metode: esošā zeme un slīpotā virsma paraugotas ik 0.5 ft iekšpus malu līnijām (92,891 šūnas). Nav piemērots pieaugums vai samazinājums."

Tilpumi ir kubikjardos pēdu projektā un kubikmetros metru projektā.

## Nosūtiet tos uz TakeoffCraft

Lai izmaksātu zemes darbus, izvēlieties {{ui:Nosūtīt uz TakeoffCraft}} bloka **Zemes darbi** apakšā. CivilCraft saglabā daudzumu failu (`<site>.quantities.json`) ar diviem daudzumiem: izrakumu un uzbērumu kubikjardos (pēdu projekts) vai kubikmetros (metru projekts), tie paši skaitļi kā blokā, līdz simtdaļai. Atveriet to TakeoffCraft ar **Atvērt apjomu aprēķinu** vai ievelciet tur: tie kļūst par diviem vienumiem, ko varat izmaksāt ([Izrakums un uzbērums no CivilCraft](app:takeoffcraft/earthwork#cut-and-fill-from-civilcraft)). Sūtiet vēlreiz pēc izmaiņām un atveriet jauno failu: tie paši vienumi saņem jaunos skaitļus.

Tiek nosūtītas tikai kopsummas, tāpēc nekas netiek skaitīts divreiz; faila piezīme uzskaita katras platformas un koridora paša izrakumu un uzbērumu.

## Kā tie tiek aprēķināti

CivilCraft izmanto **režģa metodi**:

1. Pār laukumu iekšpus katras malu līnijas tiek uzlikts kvadrātveida šūnu režģis.
2. Katras šūnas centrā tiek paraugotas abas virsmas.
3. Katra šūna tiek skaitīta kā prizma: augstumu starpība, reizināta ar šūnas laukumu. Kur projektētā virsma ir zemāka, tas ir izrakums; augstāka: uzbērums.
4. Šūnas tiek saskaitītas.

Šūnas izmēru CivilCraft izvēlas jums tā, lai taisnstūris ap apstrādātajām zonām saturētu apmēram 250,000 šūnu, noapaļots līdz labam skaitlim (1, 2 vai 5 reizes desmit pakāpe). Pašlaik to nevar iestatīt pašam. Metodes līnija norāda šūnas izmēru un to skaitu. Mazākas šūnas ir precīzākas gar malām; veselās šūnās starp plakanām plaknēm rezultāts ir precīzs.

## Lietas, kas jāzina

- Tiek skaitīts tikai laukums iekšpus malu līnijām. Zeme ārpus tām nemainās.
- Platforma vai koridors ar problēmu netiek apstrādāts un nepievieno nevienu vērtību. Ja blokā rakstīts "No volumes yet: a pad needs to grade without problems.", meklējiet virs tā sarkanu lodziņu.
- Kur vienumi pārklājas, vēlākais ir aizstājis agrāko savas malu līnijas iekšpusē, un pārklāšanās tiek skaitīta vienreiz.
- Nosēšanās vai sablīvēšanās koeficients nav piemērots. Reiziniet rezultātus pats, ja vajag vietējos, irdenos vai sablīvētos tilpumus.
- Augsnes noņemšana, seguma un pamatnes dziļumi un TIN-līdz-TIN prizmu tilpumi vēl nav pieejami.

## Rezultāta pārbaude

- Ieslēdziet {{ui:Projektētā (ar slīpumiem)}} zem **Attēlojums** un apskatiet horizontāles malu līniju iekšpusē.
- Virziet rādītāju pāri apstrādātajai zonai: statusa josla rāda **Terēns** un **Projektētā**. Starpība ir izrakuma vai uzbēruma dziļums šajā vietā.
- Koridoram profila skata rādījums rāda izrakumu vai uzbērumu centrālajā līnijā katrā stacijā.
