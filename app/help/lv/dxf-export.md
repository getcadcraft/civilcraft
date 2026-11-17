---
title: Eksportēt plānu uz DXF
summary: Ierakstīt plāna līnijas kā R12 DXF ar nosauktiem slāņiem, horizontāles to augstumos un lūzumlīnijas 3D formā jebkurai CAD programmai.
keywords: dxf, dwg, cad, eksportēt, līnijas, r12, 2000, 2004, 2007, 2010, 2013, 2018, slāņi, horizontāles, rasējumu apmaiņa, pamatkarte, fons
from: f2d8ede9
---

{{ui:DXF}} ieraksta to, ko rāda plāns, kā DXF failu R12 formātā, versijā, ko atver jebkura CAD programma. Ja esat lietojis AutoCAD vai Civil 3D, atveriet vai ievietojiet to tāpat kā jebkuru citu DXF.

## Eksportēt

1. Iestatiet plānu, kā vēlaties rasējumu: sadaļā **Attēlojums** izvēlieties virsmu (esošo vai projektēto), horizontāļu intervālu un to, kas ir ieslēgts (horizontāles, uzraksti, punkti, punktu uzraksti, trijstūri, lūzumlīnijas, virsmas mala, caurules, nogāžu bultiņas).
2. Noklikšķiniet uz {{ui:DWG/DXF}} grupā **Eksportēt** un izvēlieties {{ui:DXF (R12, teksts) — vienkāršais apmaiņas fails}}, tad {{ui:Lejupielādēt}}.
3. Pārlūkprogramma lejupielādē `<name>.dxf`. Statusa joslā parādās, piemēram, "Eksportēts R12 DXF: 2,140 objekti; uzraksti izmērīti mērogam 1" = 40'. Joslas netiek eksportētas."

Koordinātas tiek ierakstītas projekta mērvienībās, to reālajās vērtībās (valsts plaknes koordinātas paliek tādas, kādas tās ir). Nekas netiek mērogots vai pārvietots.

## Kas ir failā

| Objekts | DXF elements | Slānis |
|---|---|---|
| Mazās un lielās horizontāles | 2D polilīnijas to augstumā | C-TOPO-MINR, C-TOPO-MAJR |
| Horizontāļu uzraksti | Teksts | C-TOPO-TEXT |
| Trijstūri | Polilīnijas | C-TOPO-TINN |
| Lūzumlīnijas un robeža | 3D polilīnijas | C-TOPO-BRKL |
| Virsmas mala | Polilīnijas | C-TOPO-BNDY |
| Nogāžu bultiņas | Polilīnijas | C-TOPO-SLOP |
| Uzmērījuma punkti un to uzraksti | Punkti (ar augstumu), teksts | V-NODE, V-NODE-TEXT |
| Līnijas no līniju kodiem | 3D polilīnijas | V-NODE-LINE |
| Trases centrlīnijas | Līnijas un loki | C-ROAD-CNTR |
| Piketāžas atzīmes un uzraksti | Polilīnijas, teksts | C-ROAD-STAN |
| Koridora malas | Polilīnijas | C-ROAD-CORR |
| Paraugu līnijas | Polilīnijas | C-ROAD-SCTN |
| Laukumi, dienasgaismas līnijas, nogāžu līnijas | Polilīnijas | C-GRAD-PADS, C-GRAD-DAYL, C-GRAD-SLOP |
| Raksturlīnijas | 3D polilīnijas (loki kā posmi 0.01 robežās; skatīt [Raksturlīnijas](topic:feature-lines)) | C-GRAD-FEAT |
| Pagriezienu trajektorijas | Polilīnijas, teksts | C-ROAD-SWPT |
| Caurules, konstrukcijas, uzraksti | Polilīnijas, teksts | C-STRM-PIPE, C-STRM-STRC, C-STRM-TEXT |
| Caurules un konstrukcijas ar problēmām | Polilīnijas | C-STRM-PROB |

Katram slānim ir sava krāsa. Pilnais saraksts ir sadaļā [Plāna slāņi](topic:plan-layers).

## Uzrakstu izmērs

Tekstam rasējuma vienībās jābūt izmēram. CivilCraft izmēro uzrakstus mērogam, kurā viss plāns ietilpst Tabloid lapā (pēdās) vai A3 lapā (metros), un statusa ziņojumā norāda, kurš mērogs. Ja drukājat citā mērogā savā CAD programmā, tur mērogojiet tekstu.

## Kas netiek eksportēts

- Augstumu joslas (tikai ekrānā).
- Garenprofila skats. Profili tiek eksportēti kā LandXML, nevis kā rasējums.
- Pati virsma kā 3D objekts. Izmantojiet LandXML TIN datiem vai ieslēdziet {{ui:Trijstūri}}, lai iegūtu tās malas kā līnijas.
- Viss, ko izslēdzāt sadaļā **Attēlojums**.

## DWG

{{ui:DWG/DXF}} ieraksta to pašu līniju kopumu arī kā DWG rasējumu. Tā dialogs prasa formātu: DXF vai DWG 2000, 2004, 2007, 2010, 2013 vai 2018. 2000 atver gandrīz visas CAD programmas, vecās un jaunās; izvēlieties jaunāku, kad to pieprasa rasējuma saņēmējs. Jūsu izvēle tiek atcerēta šajā pārlūkprogrammā.

1. Noklikšķiniet uz {{ui:DWG}} grupā **Eksportēt**.
2. Izvēlieties **Formāts** un noklikšķiniet uz **Lejupielādēt DWG**.
3. Pārlūkprogramma lejupielādē `<name>.dwg`. Statusa joslā parādās, kas tika ierakstīts, piemēram, "Eksportēts DWG (2018 formāts): 12 polilīnijas, 40 uzraksti 9 slāņos".

DWG satur tos pašus slāņus, krāsas, horizontāles (kā polilīnijas to augstumā), 3D lūzumlīnijas, uzrakstus un punktus kā DXF, tajās pašās koordinātās. Slāņu nosaukumi, ko DWG nevar saturēt, tiek mainīti, un statusa ziņojums to norāda. CivilCraft raksta DWG ar savu kodu, tāpēc nekas neatstāj jūsu datoru.

### Kartes slāņi DWG

DWG rasējums nevar saturēt attēlu pašā rasējumā: CAD programmas rāda attēlu, kas atrodas blakus rasējumam. Ja kartes slāņi ir redzami, dialogs piedāvā **Kartes slāņi kā attēls blakus rasējumam**. Ja tas ir atzīmēts, lejupielāde ir `.zip`, kas satur `<name>.dwg`, `<name>-map.png` (kartes slāņi pāri visam rasējumam, līdz 4,096 pikseļiem platumā) un `<name>-map.pgw` (pasaules fails GIS programmām). Rasējums attēlo bildi kā attēlu slānī G-MAP-IMAG, savā vietā. Izsaiņojiet failus vienā mapē un glabājiet tos kopā.
