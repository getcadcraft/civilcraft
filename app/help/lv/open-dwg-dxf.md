---
title: DWG vai DXF atvēršana kā līnijzīmējums
summary: Atveriet rasējuma līnijzīmējumu plānā slāni pa slānim, izmantojiet tā horizontāles, 3D polilīnijas un slēgtas kontūras virsmai un pārvērtiet tā punktu blokus uzmērījuma punktos.
keywords: uzmērījuma pārbaude, teksta augstumi, dwg, dxf, cad, rasējums, līnijzīmējums, horizontāles, lūzumlīnijas, robeža, polilīnija, 3d polilīnija, slāņi, pamatkarte, topogrāfija, uzmērījuma rasējums, bloki, bloku atsauces, uzmērījuma punkti no blokiem, atribūti, punktu bloki, ievietošanas punkts
from: da0f4c58
---

Topogrāfiskais uzmērījums bieži nāk kā rasējums: horizontāles kā polilīnijas to augstumā, lūzumlīnijas kā 3D polilīnijas, objekta robeža kā slēgta polilīnija. CivilCraft atver rasējuma **modeļa telpu** kā slāņus plānā, un var šīs līnijas tieši pārvērst virsmā.

## Atveriet rasējumu

1. Noklikšķiniet {{ui:Līnijzīmējums}} grupā **Virsma** (vai {{ui:Atvērt}}, vai nometiet failu plānā) un izvēlieties `.dwg` vai `.dxf` failu. Rasējums tiek nolasīts šajā datorā; nekas netiek augšupielādēts. Tiek nolasīti DWG no 2000. līdz 2018. gadam un ASCII DXF.
2. Dialogā **Līnijzīmējums** uzskaitīti rasējuma slāņi, kuros ir līnijas, slēgtas formas vai punkti, un tas, vai tiem ir **augstumi**. Slāņi, kas rasējumā izslēgti, sākas neatzīmēti. Teksts, svītrojumi, izmēri un citi objekti, kas nav līnijzīmējums, tiek saskaitīti un izlaisti (dialogs norāda, kuri).
3. Pārbaudiet **Rasējuma mērvienības**. Kad rasējums norāda savas mērvienības, CivilCraft tās pārvērš projekta mērvienībās (milimetri metros, metri pēdās, collas pēdās). Pēdās esošs rasējums tiek nolasīts kā ASV pēdas bez mērogošanas: abas atšķiras par 2 miljondaļām, un valsts plaknes koordinātu mērogošana tās pārvietotu par pēdām. Kad rasējums nenorāda savas mērvienības, tā skaitļi tiek nolasīti projekta mērvienībās; izvēlieties pareizās sarakstā, ja tās nav pareizas.
4. Sadaļā {{ui:Lietot virsmai}} izvēlieties, ko katrs slānis dod virsmai (vai atstājiet **Tikai rādīt**). Slāņi ar horizontāļu nosaukumiem (TOPO, CONT, CNTR), kam ir augstumi, sākas kā lūzumlīnijas.
5. Noklikšķiniet {{ui:Pievienot}}. Slāņi parādās kreisajā panelī zem **GIS slāņi**; katrs lietojums tiek ielikts virsmā. Katra daļa ir atsevišķs solis: {{key:Mod+Z}} atsauc tās pa vienai.

## Ko katra veida slānis var dot

| Slānī ir | Lietot virsmai |
|---|---|
| Horizontāles (polilīnijas augstumā) | Lūzumlīnijas to pašu līniju augstumā vai ELEV laukā norādītajā augstumā |
| 3D polilīnijas | Lūzumlīnijas to pašu augstumos |
| Slēgta kontūra | Virsmas robeža (lielākā slēgtā forma vai tā, ko izvēlējāties) |
| Punkti ar augstumu | Uzmērījuma punkti, aprakstīti ar slāņa nosaukumu |
| Līnijas augstumā 0 (plāna līnijzīmējums) | Nekas: tās paliek plānā kā pamata zīmējums |

CivilCraft rakstīts rasējums glabā savas raksturlīnijas kā 3D polilīnijas, kas atceras savus lokus. Dialogs tad rāda **Raksturlīnijas**: atstājiet atzīmētu, lai tās atgrieztu kā raksturlīnijas ar lokiem un lietojumiem (viens atsaukšanas solis), vai noņemiet atzīmi, lai tās nolasītu kā līnijzīmējumu kā jebkuru citu slāni.

Vēlāk izmantojiet {{ui:Lietot virsmai}} slāņa izvēlnē sadaļā **GIS slāņi**, lai to pašu izdarītu slānim, ko tikai rādījāt.

## Uzmērījuma punkti no blokiem

Uzmērījuma rasējumi bieži satur punktus kā blokus: mazs simbols katrā mērījumā ar atribūtiem punkta numuram, aprakstam un augstumam. Kad rasējumā ir bloku atsauces, dialogā ir sadaļa **Uzmērījuma punkti no blokiem**:

1. Atzīmējiet blokus, ko ņemt (tabulā norādīts, cik atsauču katram ir, uz kuriem slāņiem un kādi atribūti), vai atzīmējiet slāņus, lai ņemtu katru tajos esošo bloku atsauci.
2. Izvēlieties, no kurienes nāk katra punkta **numurs**, **apraksts** un **augstums**: atribūts, bloka vai slāņa nosaukums, nākamie brīvie numuri vai ievietošanas punkta Z. CivilCraft sākas ar iespējamajiem atribūtiem (PT, DESC, ELEV un līdzīgi) un ņem augstumu no atribūta tikai tad, ja bloki atrodas nullē.
3. Noņemiet atzīmi no līnijzīmējuma slāņiem, ja vēlaties tikai punktus, un noklikšķiniet {{ui:Pievienot}}.

Katra atsauce kļūst par vienu uzmērījuma punktu tās ievietošanas punktā. Skaitās tikai atsauces, kas novietotas modeļa telpā; bloki, kas ligzdoti citos blokos, neskaitās. Numuri, kas jau ir projektā vai rasējumā izmantoti divreiz, saņem jaunus numurus aiz lielākā, un augstuma atribūts, kas nav skaitlis, atstāj šo punktu bez augstuma; statusa rinda saskaita abus. Rasējums nekad netiek mainīts, un katrs punkts atceras savu bloku: tā Rekvizītos rādīts **No bloka** ar bloku, slāni un identifikatoru. Punktu pievienošana ir viens solis, tāpēc {{key:Mod+Z}} tos visus noņem.

## Augstumi kā teksts un pārbaude

Augstumi, kas ierakstīti kā teksts (vai bloka atribūtā, kas nav uzmērījuma punktu bloks), nav līnijzīmējums. Sadaļa **Uzmērījuma augstumi un pārbaude** tos var ņemt kā uzmērījuma punktus un uzskaita, kas rasējumā šķiet nepareizi: mērvienības, koordinātu sistēma, attālums no nulles, plakanas horizontāles, dīvaini augstumi, dubultie punkti. Skatiet [Uzmērījuma rasējuma pārbaude importējot](topic:survey-check).

## Kā rasējums tiek nolasīts

- Loki, riņķi, elipses, izliektie polilīnijas segmenti un splainī kļūst par īsiem taisniem posmiem (ne vairāk kā ik pēc 5°).
- Bloku atsauces tiek zīmētas tur, kur novietotas, arī ligzdotie bloki; tas, ko bloks satur slānī 0, pārņem atsauces slāni.
- Objekti, kas zīmēti citā plaknē (citā ekstrūzijas virzienā), tiek novietoti pasaules koordinātēs.
- Katram objektam ir trīs lauki: LAYER, TYPE (objekta tips) un ELEV (tā augstums, kad visi tā punkti dalās vienā).
- Koordinātas tiek ņemtas tādas, kādas tās ir: rasējumam jālieto tās pašas koordinātas kā projektam (piemēram, tā pati valsts plaknes zona). Saistītie rasējumi (xrefs) netiek atvērti: atveriet tos atsevišķi.

:::tip
Horizontāļu rasējums dod labāko virsmu ar dažiem vietējiem augstumiem kalnu virsotnēs un ieplakās, kur tikai horizontāles atstāj plakanus trijstūrus. Pievienojiet tos kā uzmērījuma punktus vai no punktu slāņa rasējumā.
:::
