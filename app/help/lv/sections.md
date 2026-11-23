---
title: Paraugu līnijas un šķērsgriezumi
summary: Griezt šķērsgriezumus taisni pret trasi, redzēt terēnu, projektu un izrakumu un uzbērumu katrā piketā un iegūt apjomus ar vidējo galu laukumu metodi.
keywords: masu bilance, masu diagramma, bilances punkts, saraušanās, uzbriešana, pārvadāšanas attālums, aizņemšana, atkritumi, griezumu lapas, šķērsgriezumu lapas, griezumu pdf, griezumi, šķērsgriezumi, paraugu līnijas, griezuma skats, izrakums, uzbērums, laukumi, vidējā galu laukuma metode, galu laukuma apjomi, zemes darbi, pikets, nobīde, csv
from: 09639ce2
---

Šķērsgriezums parāda ceļu tā, kā tas tiks būvēts: pāri trasei vienā piketā, esošo terēnu, projektu (koridors vai laukums, kas iestrādāts) un izrakumu un uzbērumu starp tiem.

## Pievienot paraugu līnijas

1. Atlasiet trasi. Rekvizītos sadaļā **Paraugu līnijas** noklikšķiniet uz {{ui:Pievienot paraugu līnijas}}.
2. Iestatiet **Ik** (attālums: sākumā 50 ft vai 20 m), **Kreisais platums** un **Labais platums** (cik tālu katrs griezums sniedzas no centrālās līnijas).
3. Lai izgrieztu griezumu konkrētā piketā, ierakstiet to laukā **Pievienot piketu** (piemēram, `2+35`) un nospiediet {{key:Enter}}.

Griezumi tiek veidoti katrā soļa veselajā kārtnē, abos trases galos, katras līknes (PC un PT) sākumā un beigās un pievienotajos piketos. Paraugu līnijas plānā redzamas kā pelēkas līnijas pāri trasei; tās tiek izvadītas arī DXF, DWG un PDF formātos slānī C-ROAD-SCTN. Katra izmaiņa ir viens solis: {{key:Mod+Z}} to atsauc.

## Šķērsgriezuma skats

Atveriet to ar {{ui:Šķērsgriezuma skats}} trases **Rekvizītos**, {{ui:Šķērsgriezumi}} sadaļā {{ui:Virsma}} › {{ui:Vairāk}}, vai ar {{key:X}}. Tas aizvieto garenprofila skatu zem plāna.

- Pārvietojieties pa griezumiem ar joslas bultiņām, piketu sarakstu vai {{key:Left}} un {{key:Right}}, kad šķērsgriezuma skats ir fokusēts ({{key:Home}} un {{key:End}} pirmajam un pēdējam).
- Pelēkā līnija ir esošais terēns, sarkanā – projekts. Izrakums ir iekrāsots oranžs, uzbērums zaļš. Koridora punkti ir atzīmēti: CL (centrālā līnija), EOP (seguma mala), SH (mala) un DL (nogāzes robežlīnija).
- Galvenē ir pikets, šā griezuma izrakuma un uzbēruma laukumi un vertikālais pārspīlējums. {{ui:Pielāgot}} aizpilda paneli; izvēlieties 1×, lai redzētu griezumu patiesā mērogā.
- Biezā līnija plānā rāda, kurš griezums ir ekrānā.
- **Tuvināšana un pārvietošana:** ritentiņš tuvina ap rādītāju, un velkot pārvieto skatu. {{ui:Pielāgot}} (vai {{key:F}}, vai dubultklikšķis) atkal parāda visu griezumu.

## Mērīt griezumā

1. Noklikšķiniet uz {{ui:Mērīt}} griezuma joslā vai nospiediet {{key:M}}. Norāde saka "Noklikšķiniet pirmo punktu, pēc tam otro."
2. Noklikšķiniet uz diviem punktiem. Katrs piesaistās līnijas galam vai koridora punktam (CL, EOP, SH, DL); turiet {{key:Alt}} brīvam punktam.
3. Rādījums dod horizontālo attālumu (ΔH), vertikālo attālumu (ΔV), slīpumu procentos ar tā attiecību un taisno garumu projekta mērvienībās.

Noklikšķiniet vēlreiz, lai sāktu jaunu mērījumu. {{key:Esc}} to notīra, un {{key:M}} izslēdz mērīšanu.

## Griezumu lapas

{{ui:Griezumu lapas (PDF)}} sadaļā **Paraugu līnijas** ievieto katru griezumu PDF lappusēs, rindās no kreisās uz labo un no augšas uz leju piketu secībā. Izvēlieties **Papīrs**, **Plāna mērogs** (griezumu horizontālais mērogs) un **Profila pārspīlējums** (1×, 2×, 5× vai 10×); dialogs norāda, cik griezumu iederas lappusē un cik lappušu tas nodrošina.

Katrs griezums rāda režģi ar nobīdēm un augstumiem, terēnu (punktēts), projektu, izrakumu un uzbērumu ar iekrāsotiem laukumiem (oranžs un zaļš), koridora punktus un zem tā – tā piketu un tā izrakuma un uzbēruma laukumus. Visi griezumi lapās ir zīmēti vienā izmērā, pietiekami augsti lielākajam; ja tas nederētu lappusē pie jūsu pārspīlējuma, CivilCraft izmanto lielāko, kas iederas, un to norāda. Titulsloksnē ir trases nosaukums, lappuses piketi, mērogi un "Lapa 1 no 3".

## Ko mēra izrakums un uzbērums

Koridoram var būt slāņi zem seguma: seguma slāņi, veidnes komponenti, sliežu ceļš. Sadaļā **Apjomi mērīti līdz** griezumu joslā izvēlieties, līdz kam izrakums un uzbērums tiek mērīti:

- **Apakšējā virsma** (sākums): līdz šo komponentu apakšai, tātad izrakums ietver seguma konstrukcijas dziļumu.
- **Augšējā virsma**: tikai līdz projekta augšai, kā agrāk, kad komponenti netika skaitīti.

Galvenes laukumi, zemāk esošie apjomi, CSV un masu bilance visi seko šai izvēlei, un tā tiek saglabāta kopā ar projektu.

## Apjomi pēc vidējiem galu laukumiem

Starp diviem blakus griezumiem tilpums ir to abu laukumu vidējais, reizināts ar attālumu starp piketiem. Joslā tiek rādītas trases kopsummas, un {{ui:CSV}} lejupielādē katra griezuma laukumus un tilpumus ar tekošajām summām (kubikjardos projektiem ASV pēdās, kubikmetros metriskiem).

**Rekvizīti** rāda tās pašas kopsummas blakus režģa metodes apjomiem no [Zemes darbu apjomi](topic:volumes). Abi ir atšķirīgi tuvinājumi: tuvāki griezumi tos tuvina, un taisnā ceļā uz līdzenas zemes tie ir vienādi.

:::note
Izrakums un uzbērums tiek skaitīti tikai iekšpusē zonās, kas izlīdzinātas (koridora vai laukuma nogāzes robežlīnijās), tāpat kā režģa metodē. Bez koridora vai laukuma projekts ir terēns, tāpēc griezums neparāda ne izrakumu, ne uzbērumu.
:::

## Masu bilance

**Masu bilance** sadaļā **Paraugu līnijas** zīmē masu bilances diagrammu no tiem pašiem galu laukumu apjomiem: gar piketiem tekošā izrakuma summa mīnus uzbērums.

- **Izrakuma saraušanās (−) vai uzbriešana (+)** norāda, ko kubikjards izraktās grunts kļūst, kad tā ir ieklāta kā uzbērums: −10 % (sākuma vērtība, vietturis) nozīmē, ka tā saraujas līdz 0.9; uzbriedusi klints var būt +5 %. Izmantojiet sava ģeotehniskā pārskata skaitli.
- Kur līnija kāpj, ceļš ir izrakumā; kur krīt, uzbērumā. Virs nulles (iekrāsots oranžs) zeme pārvietojas uz augšu pa piketu; zem nulles (zaļš) – uz leju pa piketu.
- **Bilances punkti** ir vietas, kur līnija šķērso nulli: starp diviem no tiem izrakums un uzbērums ir līdzsvarā. Tabulā uzskaitīts katrs līdzsvarotais posms, pārvietotais tilpums (tā augstākais vai zemākais punkts) un vidējais pārvadāšanas attālums (iekrāsotais laukums, dalīts ar šo tilpumu).
- Kur līnija beidzas ārpus nulles, atlikums ir **atkritumi** (virs) vai **aizņemšana** (zem). Pēdējā posmā tiek skaitīta tikai zeme, kas atrodas aiz līmeņa, uz kura tas beidzas.

**CSV** saglabā masu ordinātu katrā griezumā, posmus un koeficientu.
