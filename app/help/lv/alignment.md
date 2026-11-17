---
title: Horizontālās trases izveide
summary: Zīmējiet trasi pēc tās PI, iestatiet līkņu rādiusus un sākuma pikets, pārvietojiet PI un nolasiet līkņu datus, pikets un nobīde.
keywords: trase, nav risinājuma, līkne neiederas, lielākais rādiuss, mazākais rādiuss, minimālais rādiuss, projektētais ātrums, pārklāšanās, centrāllīnija, pi, horizontālā līkne, rādiuss, piketāža, pieskare, izveidot trasi, trases izkārtojums, pc, pt, pikets un nobīde
from: 8c5df4aa
---

Trase CivilCraft ir pieskarņu ķēde caur krustpunktiem (PI), ar apļveida līkni jebkurā iekšējā PI, kuram ir rādiuss. Tā tiek piketēta no jūsu izvēlētā sākuma pikets. Projektā var būt daudz trašu.

## Zīmēt trasi

1. Nospiediet {{key:A}} vai noklikšķiniet uz {{ui:Trase}} grupā **Projektēšana**.
   Palīgteksts saka: „Trase: noklikšķiniet PI secībā. Enter vai dubultklikšķis pabeidz, Backspace noņem pēdējo, Esc atceļ.”
2. Noklikšķiniet uz pirmā PI (trases sākuma).
3. Noklikšķiniet uz katra nākamā PI secībā. Sarkana līnija seko rādītājam un rāda zīmējamās pieskares garumu un virzienu, piemēram, „212.40 ft  N 63°12'05" E”.
4. Noklikšķiniet uz pēdējā PI (trases beigās).
5. Nospiediet {{key:Enter}}.
   Trase tiek uzzīmēta ar piketāžu un ir atlasīta. Statusa joslā rakstīts, piemēram, „Trase 1: 386.36 ft, līknes ar 100 ft rādiusu, kur tās iederas. Rādiusus rediģējiet Rekvizītos; Garenprofils (R) projektē tās slīpumu.”

Zīmēšanas laikā: {{key:Backspace}} noņem pēdējo PI, {{key:Esc}} atceļ, un vilkšana tukšā vietā panoramē, nepievienojot PI.

:::warning
Pabeidziet ar {{key:Enter}}. Dubultklikšķis arī pabeidz, bet šajā versijā noņem PI, uz kura veicāt dubultklikšķi. Noklikšķiniet uz pēdējā PI vienreiz un pēc tam nospiediet {{key:Enter}}.
:::

Katram iekšējam PI tiek piešķirta līkne ar 100 ft rādiusu (metru projektā 30 m) vai lielākais vesels rādiuss, kas iederas pusē no katras pieskares, ja 100 ft neiederas. Ļoti asi vai taisni cauri ejoši PI līkni nesaņem.

## Iestatīt rādiusus un koordinātes

Kad trase ir atlasīta, labajā panelī redzams **Trase**:

1. **Nosaukums** un **Sākuma pikets**. Ierakstiet pikētu kā `10+00` (pēdas) vai `0+500` (metri), vai kā vienkāršu skaitli. Skatiet [Mērvienības, pikets un skaitļu formāti](topic:units-and-stations).
2. **Garums** un **Beigu pikets** tiek aprēķināti jums.
3. Tabulā **PI** ir katra PI **Austrumi** un **Ziemeļi**, kā arī **Rādiuss** katram iekšējam PI. Ierakstiet jaunu vērtību un nospiediet {{key:Enter}}.
   - Rādiuss 0 veido leņķa punktu bez līknes.
   - Pirmajam un pēdējam PI nekad nav rādiusa.
   - Mazais x rindas galā noņem šo PI (trasē paliek vismaz divi).
4. Nolasiet sarakstu **Līknes**: katrai līknei tās PC un PT pikets, rādiuss R, novirze Δ un virziens (pa kreisi vai pa labi), garums L, pieskare T, ārējais E un horda.
5. Rinda zem līknēm rāda pirmās pieskares virzienu.

## Kad līkne neiederas

Ja līknēm vajadzīga lielāka pieskare, nekā ir starp to PI, trasei nav risinājuma: tā nav pareizi uzzīmēta, kamēr to nelabojat, un tā tiek izlaista no LandXML eksporta. Sarkana kaste pasaka iemeslu skaitļos un piedāvā, kas iederētos:

- „Līknēm PI 2 un PI 3 starp tām vajadzīgas 240.00 ft pieskares (130.00 + 110.00), bet PI ir 180.00 ft attālumā.” — vai, ja tikai vienai no tām ir līkne, „Līknei PI 2 vajadzīgas 240.00 ft pieskares virzienā uz PI 1 …”.
- Poga katram PI iestata **lielāko rādiusu, kas tur iederas**, pārējo līkni atstājot kā ir (tam jāiederas arī PI otrajā pieskarē). Ja abiem PI ir līknes, **Abas** proporcionāli samazina abus rādiusus, lai tie tikko sastaptos.
- Ja viena līkne pati ir garāka par pieskari, kaste saka, ka neviena līkne otrā PI nevar iederēties, kamēr tā ir tik liela.
- PI, kas griežas tieši atpakaļ, nevar saņemt līkni; kaste piedāvā **Nav līknes PI n**.

Katra poga ir viens solis: {{key:Mod+Z}} atjauno rādiusus. Piedāvātie rādiusi tiek noapaļoti uz leju līdz 0.01, lai tie vienmēr iederētos.

### Projektēšanas minimālais rādiuss

Ierakstiet **Projektēšanas minimālais rādiuss** (piemēram, atbilstoši projektētajam ātrumam), lai katra līkne tiktu pārbaudīta pret to; ja nav vajadzīgs, atstājiet tukšu. Līkne, kas ir mazāka par to, tiek uzskaitīta ar pogu **mazākajam rādiusam, kas atbilst minimumam**, ja šis rādiuss iederas. Ja neiederas, kaste to saka un dod lielāko rādiusu, ko pieļauj pieskares, lai jūs zinātu pārvietot PI vai pazemināt minimumu.

## Pārvietot PI plānā

1. Ar aktīvu {{ui:Atlasīt}} noklikšķiniet uz trases, lai to atlasītu. Parādās kvadrātveida turi tās PI.
2. Velciet turi. Trase, tās piketāža, garenprofils un koridors seko.
3. Atlaidiet. Pārvietošana ir viens atsaukšanas solis.

PI pievienošana starp diviem esošiem vēl nav pieejama: dzēsiet trasi un zīmējiet to vēlreiz vai ierakstiet jaunas koordinātes esošajiem PI.

## Nolasīt pikētu un nobīdi

Pārvietojiet rādītāju pār plānu. Statusa joslā redzama tuvākā trase (vai atlasītā) ar pikētu un nobīdi, **L** vai **R**, skatoties uz priekšu pēc piketāžas, piemēram, „Trase 1: Sta 2+15.30, nobīde 18.42 R”. Aiz kāda gala tiek pievienots „(aiz gala)”.

## Kas tiek zīmēts

Plānā, DXF un PDF: centrāllīnija (pieskares kā līnijas, līknes kā patiesi loki), atzīme ik pēc 50 ft (20 m) ar garāku atzīmi un piketāžas uzrakstu ik pēc 100 vienībām, un PC un PT atzīmes ar to piketiem.

## Dzēst trasi

Atlasiet to un nospiediet {{key:Delete}} vai noklikšķiniet uz {{ui:Dzēst}} rīkjoslā vai labā paneļa apakšā. Kopā ar to aiziet arī tās garenprofils un koridors. {{key:Mod+Z}} to atjauno.

:::mac
Mac tastatūrā taustiņš ar uzrakstu **delete** atbilst {{key:Backspace}} pārlūkprogrammā un neizdzēš atlasi. Nospiediet {{key:Delete}} (Fn un delete) vai izmantojiet pogu {{ui:Dzēst}}.
:::

## Tālāk

- [Izveidot vertikālo garenprofilu](topic:profile).
## Projektētais ātrums un klase

Trases rekvizītos **Projektētais ātrums** (km/h vai mph) un **Projektēšanas klase** tiek glabāti kopā ar trasi, saglabāti projektā un ierakstīti IFC (Pset_RoadDesignCriteriaCommon). CivilCraft nav tabulas, kas saista ātrumu ar minimālo rādiusu, tāpēc no tiem nekas netiek pārbaudīts: iestatiet **Minimālais rādiuss** pēc sava projektēšanas standarta.

## Spirāles

Līknei var būt klotoīdas spirāle abos galos: pieskare, spirāle, līkne, spirāle, pieskare. PI tabulā ierakstiet garumu laukos **Spirāle ieejā** un **Spirāle izejā** PI, kuram ir rādiuss. PI paliek savā vietā; līkne pārvietojas iekšup, lai radītu vietu, tāpēc pieskares attālums pieaug par spirāles nobīdi. Abi garumi var atšķirties, un PI ar vienu garumu saņem spirāli tikai šajā galā.

Līkņu sarakstā tad redzams TS, SC, CS un ST (pieskare–spirāle, spirāle–līkne, līkne–spirāle, spirāle–pieskare) ar spirāles leņķi θs, pieskares attālumiem un ārējo attālumu. Pikets iet pa spirālēm kā visur citur. Spirāles, kas kopā pagriežas vairāk nekā līkne, tiek noraidītas, nosaucot PI; spirāle, kas ir garāka par to, ko pieļauj pieskare, ir pārklāšanās, kā jebkurai līknei. Virsaugstuma pāreja izmanto spirāli kā izbīdes posmu (skatiet [Koridors](topic:corridor)).
