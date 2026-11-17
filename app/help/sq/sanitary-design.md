---
title: Llogaritni rrjedhjet e projektimit fekal dhe kontrolloni kanalizimin
summary: Shkruani njerëzit dhe sipërfaqen që hyjnë te çdo pusetë e një rrjeti fekal; CivilCraft i mbledh ato përgjatë rrjetit, llogarit rrjedhjen maksimale me një faktor pike dhe infiltrimin, dhe kontrollon kapacitetin dhe shpejtësinë e çdo tubi.
keywords: fekale, kanalizim, kanalizim fekal, ujëra të ndotura, rrjedhje projektimi, rrjedhje maksimale, faktor pike, harmon, babbitt, infiltrim, popullsi, për kokë, përqind e mbushur, vetëpastrues, shpejtësi, dimensionim tubash, fletë projektimi
from: 73ba197a
---

Rrjedhjet e projektimit fekal punojnë mbi [rrjetin e tubave](topic:pipe-network) kur {{ui:Type}} e tij është {{ui:Sanitary}}. Kur nuk është përzgjedhur asgjë, paneli i djathtë tregon atëherë **Rrjedhjet e projektimit fekal**, aty ku një rrjet stuhish tregon drenazhimin e stuhive.

## Shkruani çfarë hyn

1. Përzgjidhni një pusetë. Nën **Rrjedhjet e projektimit fekal**, shkruani {{ui:People entering here}} dhe {{ui:Area entering here}} (hektarë në një projekt metrik, akra në një projekt në këmbë).
2. Për dyqane, zyra ose industri, shkruani persona ekuivalentë: sipërfaqja shumëzuar me personat për hektar (ose për akër) që përdor agjencia juaj. Sipërfaqja llogaritet për infiltrimin në çdo rast.
3. Përsëritni për çdo pusetë ku lidhet një rrugë ose një parcelë. Një pusetë ku nuk lidhet asgjë mban të dyja në 0.

Çdo tub mban gjithçka që hyn në pusetën e tij të sipërme dhe mbi të. Përzgjidhni një pusetë për të parë çfarë kalon përmes saj.

## Cilësimet

| Cilësimi | Çfarë do të thotë |
|---|---|
| {{ui:Flow per person}} | rrjedha mesatare e një personi në ditë: litra (projekt metrik) ose galona amerikane (projekt në këmbë) |
| {{ui:Infiltration}} | ujë nëntokësor që depërton: litra në sekondë për hektar, ose galona në ditë për akër |
| {{ui:Peaking factor}} | Harmon, 1 + 14 / (4 + √P), ose Babbitt, 5 / P^0.2, me P popullsinë në mijëra |
| {{ui:Peaking factor at least}} / {{ui:Peaking factor at most}} | faktori mbahet midis këtyre dy vlerave |
| {{ui:Manning n}} | për kapacitetin dhe shpejtësinë |
| {{ui:Least velocity}} / {{ui:Most velocity}} | në thellësinë vetjake të rrjedhjes maksimale në tub |
| {{ui:Most of full capacity}} | sa e mbushur mund të jetë një tub në maksimum, si përqindje e asaj që mban kur rrjedh plotësisht |

Vlerat fillestare janë vend-mbajtës, jo një standard. Përdorni vlerat që agjencia juaj i publikon.

## Çfarë llogarit

Për çdo tub, sipas rrjedhës:

- rrjedha maksimale = persona × rrjedha për person × faktori i pikut + sipërfaqja × infiltrimi
- kapaciteti kur rrjedh plotësisht (ekuacioni i Manning-ut me pjerrësinë e tubit), dhe sa e mbush maksimumi
- thellësia normale e rrjedhjes maksimale dhe shpejtësia atje

Tabela **Rezultatet fekale** liston për çdo tub personat, faktorin e pikut, rrjedhjen maksimale (L/s, ose gpm dhe këmbë kub në sekondë), përqindjen e mbushjes dhe shpejtësinë. Problemet listohen nën të: një tub më i mbushur se kufiri, më i ngadaltë se shpejtësia më e ulët (mund të mos pastrohet vetë), më i shpejtë se shpejtësia më e lartë, ose pa rënie. {{ui:Size the pipes for these flows}} zgjedh për çdo tub madhësinë standarde më të vogël (200 mm ose 8 inç e lart) që mban rrjedhjen e tij maksimale brenda kufirit; një {{key:Mod+Z}} e zhbën.

:::note
Ky është rrjedha e qëndrueshme maksimale që llogarit një fletë projektimi, e krahasuar me një fletë projektimi të publikuar deri në rrumbullakimin e saj të printuar. Nuk është një model i kanalizimit me kalimin e kohës: pa hidrograme, ruajtje, pompa ose mbingarkesa. Shihni [Ende nuk është ndërtuar](topic:not-built-yet).
:::

Shpejtësitë përdorin ekuacionin e Manning-ut me të njëjtën n në çdo thellësi. Disa agjenci kanë tabela pjesërisht të mbushura që lejojnë që n të ndryshojë me thellësinë, gjë që jep një shpejtësi pak më të ulët në një tub që rrjedh 60 deri në 70 përqind i mbushur (rreth 3 përqind më pak).
