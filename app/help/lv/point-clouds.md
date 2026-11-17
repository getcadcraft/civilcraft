---
title: Punktu mākoņi no drona vai skenera
summary: Ar papildinājumu Punktu mākoņi atveriet LAS vai LAZ failu ar miljoniem punktu, apskatiet visu, notīriet to, sadaliet terēnā, veģetācijā un ēkās un no tā izveidojiet terēnu, horizontāles un apjomus.
keywords: punktu mākonis, las, laz, drons, fotogrammetrija, recap, lidar, skenēšana, terēns, klasificēt, troksnis, kaudze, apjoms, izrakums un uzbērums, horizontāles, raksturlīnija, dziļuma apgaismojums, ortomozaīka, ortho, uzklāt, kartes slānis, eksportēt las, eksportēt laz, saspiest
from: e4a4901f
---

Vairumam cilvēku tas nekad nav vajadzīgs, tāpēc tas ir papildinājums. Ieslēdziet {{ui:Punktu mākoņi}} sadaļā Iestatījumi › Papildinājumi; labajā panelī parādīsies cilne {{ui:Punktu mākoņi}}. Fails tiek nolasīts jūsu pārlūkprogrammā un sadalīts flīzēs, kas tiek glabātas pārlūkprogrammas krātuvē (vai izvēlētā mapē). **Nekas netiek augšupielādēts.**

:::warning
Viss, ko šī cilne parāda, ir skaitlis no jūsu datiem, nevis sertifikāts. Tas testēts uz izdomātas vietas, vēl ne uz reāla drona uzmērījuma: uzmanīgi izvērtējiet pirmos rezultātus un pastāstiet mums, ko atradāt. Reģistrētais profesionālis nosaka, cik vērti ir terēns, horizontāles un apjomi.
:::

## Mākoņa atvēršana

Sadaļā {{ui:Atvērt mākoni}} izvēlieties LAS vai LAZ failu. Cilnē norādīts, cik punktu tas satur, tā koordinātu sistēma un mērvienības un cik vietas nepieciešams izveidei; nospiediet {{ui:Izveidot mākoni}}. Izveidi var apturēt, un to turpina ar {{ui:Turpināt}} (izvēlieties to pašu failu vēlreiz). Fails nekad netiek mainīts. Fails ar 100 miljoniem punktu darbstacijā tiek izveidots dažās minūtēs un aizņem apmēram tikpat vietas, cik pats fails.

Sadaļā {{ui:Mākoņi šajā datorā}} atverat vai noņemat mākoni. {{ui:Glabāt mākoņus mapē…}} (Chrome, Edge un Studio lietotne) glabā flīzes mapē, ko izvēlaties, piemēram, CadCraft mākoņu mapē mapē Dokumenti, tāpēc 10 GB mākonim nav jāietilpst pārlūkprogrammas krātuvē; agrāk izveidotie mākoņi paliek tur, kur tika izveidoti. Pēc restartēšanas pārlūkprogramma atļauju jautā vēlreiz: nospiediet {{ui:Vēlreiz izmantot mapi …}}.

## Apskatīt

{{ui:Apskatīt 3D}} zīmē mākoni no rupjām flīzēm un precizē to, kad tuvojaties, taču nekad nezīmē vairāk par {{ui:Lielākais zīmēto punktu skaits}} vienlaikus (2.5 miljoni; 500 tūkstoši tālrunī). Krāsojiet pēc paša faila krāsas, augstuma, klases, intensitātes vai atlikuma. {{ui:Dziļuma apgaismojums}} ēnē malas pēc dziļuma, lai forma būtu saprotama bez normālēm (tālrunī izslēgts); {{ui:Punkti samazinās ar attālumu}} padara tālus punktus mazākus, bet tuvos lielākus; {{ui:Punkta izmērs}} nosaka izmēru. Plānā mākonis tiek rādīts kā rastrs zem jūsu rasējuma un **precizējas, tuvinot** tā daļu.

## Tīrīšana

Sadaļā {{ui:Tīrīt}} plānā (vai 3D no augšējā skata) zīmējiet lasso, kasti vai daudzstūri. 3D skatā kontūra tiek ņemta taisni uz leju, tāpēc tā ir precīza tikai no augšas. Cilnē pirms lietošanas tiek rādīts, cik punktu ir iekšpusē: {{ui:Dzēst šos punktus}}, {{ui:Mainīt to klasi}}, {{ui:Atjaunot dzēstos punktus}} vai {{ui:Apgriezt pēc šīs robežas}}. {{ui:Atsaukt}} un {{ui:Atkārtot}} pārvietojas pa rediģēšanas žurnālu; pats fails nekad netiek mainīts. {{ui:Trokšņu filtrs…}} atzīmē nejaušus punktus kā zemus punktus (klase 7) vai augstu troksni (klase 18).

## Sadalīšana

{{ui:Atrast terēnu}} strādā pa flīzēm un atzīmē terēna punktus (klase 2) un zemos punktus; pielaide ir 0.15 m vai 0.08 m ar uzmērījuma kvalitātes slēdzi. Tā ziņo par flīžu savienojumiem, kas nesakrīt. {{ui:Klasificēt veģetāciju un ēkas}} pēc tam atzīmē zemu, vidēju un augstu veģetāciju un ēkas pēc augstuma virs terēna un apkārtnes līdzenuma. Mašīnmācīšanās nav, tāpēc šķūnis ar līdzenu jumtu zem kokiem var tikt kļūdaini noteikts: paskatieties.

## Terēns, horizontāles, raksturlīnijas

{{ui:Izveidot terēnu}} izveido esošo terēnu no terēna punktiem un pievieno to projektam tāpat kā LAS importēšana (viens atsaukšanas solis). Pēc tam tas salīdzina punktus ar to: vidējo, RMS, 95. procentili, daļu pielaidē un desmit vietas, kur atšķirības ir vislielākās, katru ar {{ui:Doties uz vietu}}. Krāsojot pēc {{ui:Atlikums}}, redzams, kur terēns un mākonis neatbilst.

**Raksturlīnija** (apmale, grāvis vai nogāzes augša) tiek atlasīta uz mākoņa: {{ui:Atlasīt raksturlīniju uz mākoņa}} 3D skatā ņem tuvāko zīmēto punktu katrā klikšķī, un {{ui:Atlasīt raksturlīniju plānā}} ņem tuvāko mākoņa punktu (vispirms terēnu) zem katra klikšķa; dubultklikšķis vai Enter beidz līniju. Nākamā {{ui:Izveidot terēnu}} to izmanto. {{ui:Rādīt horizontāles}} zīmē horizontāles pāri mākonim nelielā attēlā un iestata projekta intervālu.

## Apjomi

{{ui:Kaudzes tilpums…}} aprēķina virsmas tilpumu virs pamatnes jūsu zīmētās robežas iekšpusē. Zīmējiet robežu ap kaudzi uz līdzena terēna un izvēlieties pamatni: zemāko robežpunktu, plakni, gludu izliektu pamatni, virsmu caur robežu vai ierakstītu līmeni. Uz slīpa vai izliekta terēna izmantojiet plakni vai izliektu pamatni; zemākais punkts rāda pārāk augstu. Robežpunkti, kas stāv augstāk par pārējiem (koks uz līnijas), netiek ieskaitīti pamatnē. {{ui:Lidojums pret lidojumu}} dod izrakumu un uzbērumu starp diviem mākoņiem. Abus var saglabāt kā CSV.

## Ortomozaīka

Sadaļā {{ui:Ortomozaīka (attēls no augšas)}} izvēlieties drona ortomozaīku kopā ar tās pasaules failu un `.prj`, ja tādi ir: GeoTIFF vai PNG vai JPEG. Tā kļūst par projekta **kartes slāni**, tāpēc plānā tā tiek rādīta zem jūsu rasējuma, un 3D skats (krāsa {{ui:Karte}}) to uzklāj uz izveidotā terēna, tāpēc vispirms {{ui:Izveidot terēnu}}. Cilnē norādīts, cik daudz mākoņa attēls aptver, un brīdina, ja neaptver nevienu: parastais iemesls ir cita koordinātu sistēma, tāpēc pievienojiet `.prj` failu. Ja `.prj` nav, programma jautā, kur ir koordinātas. Attēls tiek glabāts projekta failā; GeoTIFF virs 200 MB tiek noraidīts, un ļoti liela mozaīka tiek samazināta līdz 16 megapikseļiem, tāpēc lielam uzmērījumam vispirms izgrieziet mozaīku līdz vietai.

## Eksportēšana

{{ui:Eksportēt}} ieraksta notīrīto, klasificēto mākoni kā jaunu failu (visi punkti, tīrās klases vai tikai terēns). Sadaļā {{ui:Faila tips}} izvēlieties:

- **LAS 1.4 (nesaspiests)**: punktu formāts 6 vai 7 ar krāsu.
- **LAZ (saspiests)**: tie paši punkti, saspiesti bez zuduma, tāpēc katrs punkts atgriežas precīzi. Tas tiek rakstīts kā punktu formāts 0 vai 2 ar krāsu LAS 1.4 failā. Izdomātā 300 m vietā LAZ bija apmēram piektdaļa LAS 1.4 faila izmēra. LAZ formāti 0 un 2 satur tikai klases no 0 līdz 31: punkts ar augstāku klasi tiek noraidīts ar paziņojumu, tāpēc šādu mākoni eksportējiet kā LAS 1.4.

LAZ raksta CadCraft pats kompresors, kas izveidots pēc publicētās LAZ specifikācijas. Mēs esam pārbaudījuši, ka mūsu pašu lasītājs un divi neatkarīgi LAZ lasītāji (laz-perf, ko lietotne izmanto LAZ failu atvēršanai, un laspy ar lazrs) nolasa katru punktu precīzi, un ka LAZ faili, ko izveidojis laspy, pēc to punktu atkārtotas rakstīšanas ir identiski baitiem. Citas programmas vēl nav pārbaudītas, tāpēc, ja kāda neatver failu, pastāstiet mums, kura.

Ja pārlūkprogramma var rakstīt failu, kamēr tas top, vispirms izvēlaties failu, un ļoti liels mākonis tiek rakstīts tajā pa flīzei, nevis savākts atmiņā; pretējā gadījumā fails tiek savākts un lejupielādēts, kas ir labi līdz dažiem simtiem megabaitu.

## Ko tas nedara

Tas nolasa tikai LAS un LAZ (E57, PLY un PCD šajā cilnē vēl nav pieslēgti, un vairāki viena lidojuma faili nav apvienojami), nepārprojektē mākoni (tiek pieņemta projekta sistēma un metri), nenolasa Autodesk RCP vai RCS failus, neveido virsmu no fotogrāfijām un pats neatrod stabus, apmales vai caurules.
