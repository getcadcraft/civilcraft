---
title: Trases paraugu līnijas un šķērsgriezumi
summary: Griezt šķērsgriezumus perpendikulāri trasei, redzēt zemi, projektu un izrakumu un uzbērumu katrā pikšetā un iegūt apjomus ar vidējo galu laukumu metodi.
keywords: masu pārvietojums, masu diagramma, līdzsvara punkts, saraušanās, pieaugums, pārvietošanas attālums, aizņemšana, atkritumi, šķērsgriezumu lapas, griezumu PDF, griezumi, šķērsgriezumi, paraugu līnijas, šķērsgriezuma skats, izrakums, uzbērums, laukumi, vidējā galu laukuma metode, galu laukuma tilpumi, zemes darbi, pikšets, nobīde, csv
from: 5060173c
---

Šķērsgriezums parāda ceļu tā, kā tas tiks būvēts: pāri trasei vienā pikšetā, esošo zemi, projektu (koridors vai platforma iegrādāta) un izrakumu un uzbērumu starp tiem.

## Pievienot paraugu līnijas

1. Atlasiet trasi. **Rekvizītos**, sadaļā **Paraugu līnijas**, noklikšķiniet {{ui:Pievienot paraugu līnijas}}.
2. Iestatiet **Ik pēc** (solis: sākumā 50 ft vai 20 m), **Kreisais platums** un **Labais platums** (cik tālu katrs griezums sniedzas no centrālās līnijas).
3. Lai griezumu nogrieztu konkrētā pikšetā, ierakstiet to **Pievienot pikšetu** (piemēram, `2+35`) un nospiediet {{key:Enter}}.

Griezumi tiek nogriezti katrā veselā solī reizinājumā, abos trases galos, katras līknes sākumā un beigās (PC un PT) un pikšetos, ko pievienojat. Paraugu līnijas plānā rādās kā pelēkas līnijas pāri trasei; tās arī iziet DXF, DWG un PDF slānī C-ROAD-SCTN. Katra izmaiņa ir viens solis: {{key:Mod+Z}} to atsauc.

## Šķērsgriezuma skats

Atveriet to ar {{ui:Šķērsgriezuma skats}} trases **Rekvizītos**, ar {{ui:Šķērsgriezumi}} sadaļā **Virsma** › {{ui:Vairāk}} vai ar {{key:X}}. Tas aizņem profila skata vietu zem plāna.

- Pārvietojieties pa griezumiem ar bultiņām tā joslā, pikšetu sarakstā vai ar {{key:Left}} un {{key:Right}}, kad šķērsgriezuma skats ir fokusēts ({{key:Home}} un {{key:End}} pirmajam un pēdējam).
- Pelēkā līnija ir esošā zeme, sarkanā līnija ir projekts. Izrakums ir iekrāsots oranžs, uzbērums zaļš. Koridora punkti ir atzīmēti: CL (centrālā līnija), EOP (brauktuves mala), SH (pievedceļa josla) un DL (izrakuma vai uzbēruma robeža).
- Galvene dod pikšetu, šī griezuma izrakuma un uzbēruma laukumus un vertikālo pārspīlējumu. **Pielāgot** aizpilda paneli; izvēlieties 1× lai redzētu griezumu patiesā mērogā.
- Biezā līnija plānā rāda, kurš griezums ir ekrānā.

## Griezumu lapas

{{ui:Griezumu lapas (PDF)}} sadaļā **Paraugu līnijas** ieliek katru griezumu PDF lappusēs, rindās no kreisās uz labo un no augšas uz leju pikšetu secībā. Izvēlieties **Papīru**, **Plāna mērogu** (šķērsgriezumu horizontālo mērogu) un **Profila pārspīlējumu** (1×, 2×, 5× vai 10×); dialogs pasaka, cik griezumu telpā vienā lappusē un cik lappusu tas rada.

Katrs griezums rāda režģi ar nobīdēm un augstuma atzīmēm, zemi (punktēta), projektu, izrakumu un uzbērumu iekrāsotu (oranžs un zaļš), koridora punktus un zem tā savu pikšetu un izrakuma un uzbēruma laukumus. Katrs griezums lapās ir zīmēts vienādā izmērā, pietiekami augsts lielākajam; kad tas neiekļaujas lapā jūsu pārspīlējumā, CivilCraft izmanto lielāko, kas iekļaujas, un to saka. Virsraksta josla nosauc trasi, lapas pikšetus, mērogus un "Lapa 1 no 3".

## Tilpumi pēc vidējiem galu laukumiem

Starp diviem blakus griezumiem tilpums ir to divu laukumu vidējais, reizināts ar attālumu starp to pikšetiem. Josla rāda kopsummas trasei, un {{ui:CSV}} lejupielādē katra griezuma laukumus un tilpumus ar tekošām summām (kubikjardi pēdu projektiem, kubikmetri metru projektiem).

**Rekvizīti** rāda tās pašas kopsummas blakus režģa metodes tilpumiem no [Zemes darbu tilpumi](topic:volumes). Tie ir atšķirīgi tuvinājumi: tuvāki griezumi tos padara tuvākus, un taisnā ceļā uz līdzenas zemes tie ir vienādi.

:::note
Izrakumu un uzbērumu skaita tikai iekšpusē apstrādātajās zonās (koridora vai platformas izrakuma līnijas), kā to dara režģa metode. Bez koridora vai platformas projekts ir zeme, tāpēc griezums nerāda izrakumu vai uzbērumu.
:::

## Masu pārvietojums

**Masu pārvietojums** sadaļā **Paraugu līnijas** zīmē masu pārvietojuma diagrammu no tiem pašiem vidējo galu tilpumiem: gar pikšetiem tekošā kopsumma izrakuma mīnus uzbērums.

- **Saraušanās (−) vai pieaugums (+) izrakumā** saka, ko kubikjards izrakuma padara, kad tas ieklāts kā uzbērums: −10 % (sākuma vērtība, vietturis) nozīmē, ka tas saraujas līdz 0.9; klints, kas pieaug, var būt +5 %. Izmantojiet savu ģeotehniskā pārskata skaitli.
- Kur līnija kāpj, ceļš ir izrakumā; kur krīt, uzbērumā. Virs nulles (oranžs) zeme pārvietojas pret pikšeta virzienu; zem nulles (zaļš) — pa pikšeta virzienu.
- **Līdzsvara punkti** ir vietas, kur līnija šķērso nulli: starp diviem no tiem izrakums un uzbērums līdzsvarojas. Tabula uzskaita katru līdzsvarotu posmu, pārvietoto tilpumu (tā augstāko vai zemāko punktu) un vidējo pārvietošanas attālumu (nokrāsotais laukums, dalīts ar šo tilpumu).
- Kur līnija beidzas ārpus nulles, atlikums ir **atkritumi** (virs) vai **aizņemšana** (zem). Pēdējā posmā skaitās tikai zeme aiz līmeņa, uz kura tas beidzas.

**CSV** saglabā masu ordinātu katrā griezumā, posmus un koeficientu.
