---
title: Vēl nav izstrādāts
summary: Ko šis CivilCraft izlaidums vēl nedara un ko šodien darīt tā vietā.
keywords: trūkst, ierobežojumi, plānojums, nav pieejams, spirāles, paplašināšana, dwg, dxf, ieplūdes, aizturēšana, šķērsgriezumi, nākotnē, robežas
from: b91588d4
---

CivilCraft ir agrīnā stadijā. Šī lapa uzskaita to, ko pašreizējais izlaidums nedara, lai jūs to nemeklētu. Nekas šeit nav apsolīts kādam datumam.

## Punkti

| Vēl nav izstrādāts | Šodien tā vietā |
|---|---|
| Otra punktu faila pievienošana pirmajam | Vispirms apvienojiet failus teksta redaktorā vai izklājlapā |
| Punktu teksta faila eksports | Eksportējiet LandXML (punkti tiek izvadīti kā CgPoints), izmantojiet GIS {{ui:Eksportēt}} (punkti ar laukiem P, N, E, Z un D) vai {{ui:Kopēt}} punktus izklājlapā |
| Punktu etiķešu stili, simboli katram apraksta kodam, līknes (lokus) no līniju kodiem, apraksta koda fails, ko kopīgot starp projektiem | Etiķetēs rāda numuru, augstumu un aprakstu vai mazāk ([CivilCraft iestatījumi](topic:settings)); kodi tiek saglabāti projekta failā |
| Mērvienību pārveide | Pirms importa pārveidojiet failu; {{ui:Mērvienības}} tikai maina etiķeti |

## Virsmas

| Vēl nav izstrādāts | Šodien tā vietā |
|---|---|
| Vairāk nekā viena virsma, kas veidota no punktiem | Viens projekts uz vienu virsmu |
| Slēpt (iekšējās) robežas | Izmantojiet **Garākā ārējā mala** vai ārējo robežu |
| Viena zīmēta lūzumlīnija atlase vai rediģēšana | {{key:Mod+Z}} vai {{ui:Noņemt zīmētās lūzumlīnijas}} un zīmējiet no jauna |
| Virsmas rediģēšana, kas nolasīta no LandXML (lūzumlīnijas, robeža) | {{ui:Pārbūvēt virsmu no punktiem}} |
| Virsmas rediģēšana, kas izveidota no augstuma režģa | Importējiet režģi vēlreiz ar citām izvēlēm |
| Virsmas, kas nolasīta no LandXML, pārvēršana, kad mainās koordinātu sistēma | Vispirms {{ui:Pārbūvēt virsmu no punktiem}} |
| Iezīmētas punktu augstuma atzīmes un slīpuma vērtības | Nolasiet tās statusa joslā vai iekrāsojiet virsmu pēc slīpuma ar **Slīpuma analīze** ainavas darba vidē ([Ainavas reljefa veidošana](topic:landscape-grading#grading-checks)) |

## Trases un garenprofili

| Vēl nav izstrādāts | Šodien tā vietā |
|---|---|
| Spirāles, kas nav klotoīdas; spirāle starp divām līknēm (saliktās pārejas) | Klotoīdas spirāles līknes galos ir pieejamas; citas tiek nosauktas un izlaistas LandXML importā |
| PI ievietošana starp diviem citiem | Pārzīmējiet trasi vai pārrakstiet PI koordinātas |
| Trases no objektiem, nobīdēm, paplašinājumiem | Zīmējiet ar PI |
| K ierakstīšana vertikālai līknei | Ierakstiet L (K tiek rādīts) |
| Apļveida un nesimetriskas vertikālās līknes | Tikai simetriskas parabolas vertikālās līknes |
| Vairāk nekā viens projektētais garenprofils uz trasi | Viena trase uz variantu |
| Garenprofila skata tuvināšana, profila joslas zem profila | Garenprofila skats aizpilda visu trasi; drukājiet to uz [plāna un profila lapām](topic:plan-profile-sheets) |
| Griezumi DWG vai LandXML formātā | Griezumu lapas kā PDF; {{ui:CSV}} no laukumiem un tilpumiem |
| Paraugu līnijas leņķī vai dažādos platumos gar ceļu | Viens platums katrā pusē visai trasei |

## Koridori

| Vēl nav izstrādāts | Šodien tā vietā |
|---|---|
| Joslas, barjeras un virsaugstums, kas pagriež veidnes | Zīmējiet tos kā veidnes ([Koridoru veidnes](topic:corridor-templates)); veidnes pēc piketa virsaugstumu vēl neņem vērā |
| Pakāpeniska pāreja starp divu reģionu veidnēm (pārejas, sašaurinājumi) | Mainiet veidni pie piketa vai dodiet punktam platuma mērķi uz līniju, kas zīmēta kā sašaurinājums |
| Pagriešana ap malu, virsaugstums LandXML | Virsaugstums pagriež ap centrālo līniju apļveida līknēs; paplašiniet joslu ar platuma mērķi uz raksturlīniju |
| Mērķi nogāzēm (nogāzes robežlīnija līdz līnijai vai virsmai), koridoru virsmas pašas | Mērķi pārvieto seguma malas un malas ([Koridori](topic:corridor)); koridors tiek izlīdzināts projektētajā virsmā |
| Noapaļojumi krustojumos, pagriešanās joslas un salas, kas izlīdzinātas krustojumā; blakusceļa gals, kas nogriezts līdz galvenā ceļa malai slīpā leņķī; takas savienošana ar ceļu plānā, tās garumā un laukumā | Savienotie ceļi tiek savienoti taisni, ar atvērtu galvenā ceļa malu un blakusceļu, kas tai pielāgots ([Kur ceļi sastopas](topic:corridor#where-roads-meet-roads-pads-and-paths)); taka apstājas pie ceļa malas projektētajā virsmā un 3D |
| Koridori eksportēti kā LandXML ceļi; otrs koridors uz trases IFC eksportā | Tiek eksportēta projektētā virsma |
| Reljefa veidnes, kas maina projektēto virsmu 3D skatā vai griezumos | Tās dod katra slāņa laukumus un tilpumus ([Reljefa veidnes](topic:corridor-templates#terrain-templates)) |
| Šķērsošanas trajektorijas ar ātrumu, riepu slīdēšanu, stūrēšanas laiku, stūrējamām piekabēm vai korpusa atstarpi; standarta projektēto transportlīdzekļu bibliotēka; trajektorija, ko zīmē, velkot transportlīdzekli | Zemas ātruma šķērsošanas trajektorijas gar raksturlīniju vai trasi ar jūsu pašu transportlīdzekļu izmēriem ([Transportlīdzekļu šķērsošanas trajektorijas](topic:swept-paths)) |

## Zemes darbi un apjomi

| Vēl nav izstrādāts | Šodien tā vietā |
|---|---|
| Berzes, atvērtas raksturlīnijas, kas izlīdzinātas projektā, izlīdzināšana līdz raksturlīnijai no citurienes | Aizveriet raksturlīniju ([Raksturlīnijas](topic:feature-lines)) vai izmantojiet to kā esošā terēna lūzumlīniju |
| Raksturlīnijas virsotnes ievietošana vai noņemšana | Zīmējiet līniju no jauna vai izveidojiet tās pakāpenisku nobīdi |
| Lokus zīmētās lūzumlīnijās (caur topogrāfijas punktiem), spirāles raksturlīnijās | Zīmējiet raksturlīniju ar lokiem un izmantojiet to kā esošā terēna lūzumlīniju |
| Izlīdzināšana līdz attālumam, augstumam vai citai virsmai | Tikai pieskaņošana esošajam terēnam |
| Laukuma stūra pievienošana vai noņemšana | Dzēsiet laukumu un zīmējiet to no jauna |
| TIN-uz-TIN (prizmas) tilpumi, režģa šūnas izmēra izvēle | Režģa metode, šūnas izmērs izvēlēts jums |
| Pietūkums un saraušanās, augsnes slānis, seguma biezumi | Lietojiet koeficientus pats uz ziņotajiem skaitļiem |
| Izvešanas un papildu izvešanas izmaksas, pārvadāšana starp dažādām trasēm, aizņemšanās bedres un atkritumu vietas, kas novietotas uz plāna | Masu bilances diagramma ar bilances punktiem, pārvietotie tilpumi un vidējie pārvadāšanas attālumi |

## Cauruļu tīkli

| Vēl nav izstrādāts | Šodien tā vietā |
|---|---|
| Vairāk nekā viens tīkls vienā projektā | Atsevišķi projekti lietus un kanalizācijas ūdeņiem |
| Ūdensvadi: ūdens kvalitāte un vecums, uz noteikumiem balstītas vadības, citi vārstu veidi (plūsmas kontrole, droseles, uzturošie), sūkņi, kas doti pēc jaudas, pieprasījums, kas atkarīgs no spiediena, Darsija-Vaisbaha iespēja, cauruļu katalogs ar sienu biezumiem un spiediena klasēm. Pārējais spiediena tīklos ir laboratorijā: [Ūdensvadi](topic:water-mains) | Pārbaudiet tos ūdens sadales programmatūrā; sanitārās konstrukcijas plūsmas ir [Sanitārās konstrukcijas plūsmas](topic:sanitary-design) |
| Kanalizācijas plūsmas laika gaitā (hidrogrāfi, dinamiskā maršrutēšana, uzkrāšana, sūkņi, pārplūdes) | [Sanitārās konstrukcijas plūsmas](topic:sanitary-design) dod stabilo maksimālo plūsmu, ko izmanto projekta lapa |
| Ieplūdes jauda, notekrētas izplūde, aizturēšanas maršrutēšana, hidrogrāfi, enerģijas zudumi, izņemot vienu krustojuma koeficientu | Pārbaudiet tos citā programmatūrā; plūsmas, izmēri un līmeņu līnijas ir [Lietus ūdens novadīšana](topic:storm-drainage) |
| Baseini PDF izdrukā, DWG, DXF vai LandXML; baseini no virsmas (ūdensšķirtnes) | Zīmējiet baseinus ar roku; tie tiek saglabāti projekta failā |
| Cauruļu katalogi, nekruglas caurules, konstrukcijas, kas nav taisnas kastes vai cilindri (konusi, pakāpieni, nogāzes), drenāžas kategorija bibliotēkā | Konstrukciju tipi pēc parametriem ([Cauruļu tīkls](topic:pipe-network)); caurules ar diametru |
| Caurules garenprofila skatā, izliektas caurules | Nolasiet ieejas un pārklājumus labajā panelī |

## Zemes gabali

| Vēl nav izstrādāts | Šodien tā vietā |
|---|---|
| Zemes gabalu veidošana pēc platības vai fronta, gabali no līnijām ap tiem, ceļu sarkanā josla | Zīmējiet katru gabalu pēc tā stūriem vai ievadiet tā mērījumus |
| Līkņu tabulas un līniju tabulas uz plāna; etiķetes, ko pārvieto ar roku | Katrs posms ir iezīmēts gar sevi |
| Zemes gabali LandXML | Zemes gabali tiek saglabāti projekta failā un nonāk PDF, DWG un DXF |

## Poligonālie mērījumi

| Vēl nav izstrādāts | Šodien tā vietā |
|---|---|
| Mazāko kvadrātu izlīdzināšana, transita likums, leņķu svarošana pret attālumiem | Kompasa likums |
| Novirzes leņķi, zenīta leņķi un slīpie attālumi, augstumi ar trigonometrisko nivelēšanu | Pārrēķiniet uz horizontālajiem attālumiem un leņķiem pareizi vai azimutiem |
| Sānu uzņēmumi, neapstrādātu datu faili no datu vācējiem | Importējiet punktus kā punktu failu |

## Nospraušana

| Vēl nav izstrādāts | Šodien tā vietā |
|---|---|
| Nobīdes mietiņi (atskaites punkti, kas nolikti atpakaļ no mietiņa), nogāzes mietiņi pie noķeršanas punkta | Nospraudiet nobīdēs, kas jums vajadzīgas, arī aiz malas |
| Mietiņu sūtīšana tieši datu vācēja formātā | CSV atveras lielākās daļas datu vācēju biroja programmatūrā |
| Cauruļu, laukumu un zemes gabalu nospraušana | Izmantojiet topogrāfijas punktus tuvu trasei vai zemes gabala kursus |

## Failu un izvades

| Vēl nav izstrādāts | Šodien tā vietā |
|---|---|
| Teksts, svītrojumi un izmēri no DWG vai DXF; papīra telpa; saistītie zīmējumi (xrefs); bināri DXF | Lineārais zīmējums no modeļa telpas tiek atvērts ([Atvērt DWG vai DXF kā lineāro zīmējumu](topic:open-dwg-dxf)); atveriet saistītos zīmējumus atsevišķi |
| Vairāku punktu vienlaicīga pārvietošana, velkot | Izgrieziet un ielīmējiet tos vai rediģējiet pa vienam |
| Portreta lapas, jūsu pašu titulblokoti, skatlogi, ko izkārtojat, plāna un profila lapas DWG | Viena ainavas plāna lapa uz PDF vai plāna un profila lapas gar trasi (PDF) |
| Garenprofilu un elevācijas joslu drukāšana | Joslas ir tikai ekrānā; uzņemiet ekrānuzņēmumu, ja tās vajadzīgas |
| Slāņu nosaukumu, krāsu vai etiķešu stilu maiņa | Mainiet tos CAD programmā pēc DXF eksporta |
| Mākoņa glabāšana un versiju vēsture | Saglabājiet `.civilcraft.json` failus un turiet tos dublētus; lai kopā strādātu pie viena projekta, izmantojiet tiešraides sesiju programmā CadCraft Studio ([Viens objekts kopā, tiešsaistē](topic:work-live)) |
| CadCraft Studio iPad un iPhone, kā arī no Google Play | Izmantojiet CivilCraft pārlūkprogrammā ierīcē; Android ierīcēs CadCraft Studio instalējas no tā APK faila getcadcraft.com/download |
| Vairāku punktu vai projekta failu atvēršana vienlaikus | Viens fails vienā reizē (GIS faili, kas pieder kopā, piemēram, shapefile daļas, atveras kopā) |

## Ainava

| Vēl nav izstrādāts | Šodien tā vietā |
|---|---|
| Ražotāju galviņas un sprauslas | Vispārīgas galviņas vai pievienojiet savas galviņas no faila; ražotāju dati tiek ievietoti, kad viņi to atļauj |
| Maksimālie sānu garumi pilienu līnijām, plūsmas laika gaitā, sūkņi, cilpotie cauruļu tīkli | Turiet pilienu līnijas ražotāja publicētajā garumā; pārbaudei nepieciešams sazarots tīkls |
| Precīzs ieliekta brīvas formas objekta kontūrs; tā zemes līmeņa tilpums, kas izmērīts precīzi | Konveksais apvalks tiek izlīdzināts, un zemes līmeņa tilpums ir aprēķins (norādīts Rekvizītos) |
| Augi no BimCraft un ModelCraft paša Novietot no bibliotēkas | Eksportējiet ainavas IFC un atveriet to BimCraft blakus ēkai |
| Detalizēti augu modeļi (lapas, zari, sezonas) 3D skatā; brīvas formas objekti un apūdeņošana 3D skatā | Augi 3D skatā tiek rādīti kā vienkāršas formas, kas izmērotas pēc augu saraksta ([Skatīt objektu 3D](topic:site-3d)); ModelCraft izkliedēšana veido stādījumu attēlus |
| Cietā seguma sienas, kas tur aiz sevis izlīdzinātu līmeni virsmā | Dodiet platformai vai laukumam vertikālas malas: tās ir atbalsta sienas virsmā ([Izlīdzināšana](topic:grading)) |
| SVG pārveidojumi jūsu pašu simbolos; jūsu pašu GLB augu modeļu tekstūras un krāsas; saspiests GLB ģeometrija | Vispirms saplakiniet pārveidojumus zīmēšanas programmā; modeļi tiek zīmēti augu krāsā; eksportējiet GLB bez saspiešanas ([Augu grafika](topic:plant-graphics)) |
| Jūsu pašu augu saraksts, kas glabāts jūsu Bibliotēkas kontā (rediģēts lietotnē) | Rediģējiet projekta paša sarakstu augu tabulā un saglabājiet to kā augu failu |
| Ainavas rīki palīgiem bez loga (failu serveris un komandrinda) | Tie darbojas, kad CivilCraft logs ir atvērts ([Ļaujiet AI palīgam strādāt ar jūsu objektu](topic:assistants)) |

## Elektrolīnijas

| Vēl nav izstrādāts | Šodien tā vietā |
|---|---|
| Valsts standarts, kas iebūvēts (slodžu gadījumi, atstarpes, koeficienti) | Iestatiet sava standarta vērtības {{ui:Slodžu gadījumi un ierobežojumi…}} un saglabājiet tās kopā ar savu bibliotēku kā paketi, ko atkārtoti izmantot un kopīgot ([Paketes](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Sānu attālums no vadītāja līdz koka vainagam vai sienai līnijas malā | Vertikāla atstarpe virs augiem un sienām, ko līnija šķērso ([Elektrolīniju pārbaudes](topic:power-line-checks#clearances)) |
| Vadītāja rāpšanās un jauna vadītāja stiepšanās | Ņemiet tos vērā caur temperatūrām stiepšanas tabulā |
| Apraktu kabeļu termiskais novērtējums (strāvas slodze no tā, kā tie ir ieklāti) | Ievadiet sava piegādātāja strāvas slodzi kabeļa vienumā |
| Īssavienojuma, aizsardzības un zemēšanas pētījumi | Izmantojiet specializētu elektrisko programmu; CivilCraft sniedz tīkla garumus un kabeļus |
| Režģa torņi, kas projektēti pa elementam, un augsnes stiprinājumi | Balsti tiek pārbaudīti pēc nominālās slodzes; stiprinājumi pēc to nominālās slodzes |
| `.DON` pētījuma fails, kas pārbaudīts programmā, kura to lasa | Pārbaudiet failu tur; nosūtiet mums paraugu, lai varam pārbaudīt pret īstu |
| Elektrolīnijas 3D skatā un IFC | Plāns, līnijas garenprofils, lapas un GIS slāņi |
| Elektrolīniju rīki palīgiem bez loga | Tie darbojas, kad CivilCraft logs ir atvērts ([Ļaujiet AI palīgam strādāt ar jūsu objektu](topic:assistants)) |

## Ēku masas

| Vēl nav izstrādāts | Šodien tā vietā |
|---|---|
| Zonējuma kodu bibliotēka vai jebkuras pilsētas noteikumi | Ierakstiet ierobežojumus no sava noteikuma ([Zonējuma ierobežojumi](topic:zoning-limits)) |
| Dienasgaisma uz sienām (fasādes dienasgaisma), vējš | [Saules stundas](topic:sun-hours) skaita tikai tiešo sauli |
| Ēnas no kokiem, augiem vai jebkā, kas nav zīmēts kā masa | Zīmējiet blakus esošās ēkas kā masas |
| Jumtu formas masām | Masas ar plakanu virsmu |
| Atvērumi, jumti un sienu veidi, kad masa tiek izstrādāta BimCraft | BimCraft veido vienkāršas ārsienas katrā līmenī un stāvu; pievienojiet pārējo tur |

## GIS un koordinātu sistēmas

| Vēl nav izstrādāts | Šodien tā vietā |
|---|---|
| File Geodatabase; KML stili, ikonas, zemes pārklājumi un tīkla saites | Vispirms pārveidojiet uz GeoPackage, shapefile vai GeoJSON; KML atzīmes tiek nolasītas bez stiliem |
| GIS objektu vai to atribūtu rediģēšana | Rediģējiet tos GIS programmā un importējiet vēlreiz. Analīzes panelis veido jaunus slāņus (buferus, pārklāšanos, savienojumus, atlasi) un pievieno laukumu un garuma laukus, bet neizmaina objektu vietā |
| Tīkla un rastra analīze, buferi ar plakaniem vai kvadrātveida galiem un vienpusēji buferi, lauku pievienošana vai dzēšana un lauka tipa maiņa atribūtu tabulā, pašrocīgas klašu krāsas, stila leģenda izdrukās | Izmantojiet Atlasīt, lai izvēlētos objektus un izveidotu no tiem slāni; plakani gali netiek piedāvāti. Krāsošana pēc atribūta un atribūtu tabula ir izveidotas: skatiet [Slāņa stils pēc atribūta](topic:gis-symbology) un [Darbs ar slāņa atribūtu tabulu](topic:gis-table) |
| Etiķešu stili (izmērs, izvietojums) un etiķetes, kas izvairās viena no otras | Etiķetes ir viena izmēra un var pārklāties, ja objekti ir blīvi |
| Vertikālie datumi un ģeoīda modeļi | Augstumi tiek izmantoti tā, kā tos dod fails; pārbaudiet vertikālo datumu pats |
| Režģa nobīdes, kas nav uz NAD83 no NAD27, ieteiktas pēc apgabala (OSTN15, NTv2 citiem datumiem darbojas, kad pievienojat failu), vairāki režģi vienlaikus, vertikālie režģi | Pievienojiet režģa failu savam datumam pats; viens režģis projektā |
| Kartes slāņi DXF vai 3D eksportos | Kartes slāņi nonāk PDF izdrukā un blakus DWG kā attēls |
| Kartes serveri, kam nepieciešama pieteikšanās, atslēga vai pilnvara | Izmantojiet publiskus pakalpojumus vai georeferencētu attēla failu |
| LAS vai LAZ failu rakstīšana no virsmas, zemes modeļa vai augstuma režģa un LiDAR rīkiem | Eksportējiet virsmas kā GeoTIFF augstuma režģi. Papildinājums [Punktu mākoņi](topic:point-clouds) raksta notīrītu mākoni kā LAS 1.4 vai LAZ |
| LiDAR intensitāte, krāsa un atgriezumi; augstuma režģi ar vairākām joslām; režģa vai LiDAR faili, kas lielāki par 200 MB | LiDAR tiek filtrēts tikai pēc klases, režģi izmanto pirmo joslu; vispirms sagrieziet lielus failus kārtās |

## Ievade

| Vēl nav izstrādāts | Šodien tā vietā |
|---|---|
| Atlase ar rāmi ar skārienu (tai nepieciešams {{key:Shift}}) | Ilgi nospiediet katru topogrāfijas punktu, lai to pievienotu |
| Ierakstītas koordinātas vai attālumi zīmēšanas laikā | Zīmējiet aptuveni, pēc tam ierakstiet precīzas PI koordinātas trases PI tabulā |
| Stūru vai struktūru koordinātu ierakstīšana laukumiem | Velciet to satvērējus; tuvinājiet precizitātei un sekojiet E un N statusa joslā |
| Piesaiste objektiem (izņemot topogrāfijas punktus lūzumlīnijām) | Tuviniet un sekojiet statusa joslai |

## 3D skats

| Vēl nav izstrādāts | Šodien tā vietā |
|---|---|
| Zīmēšana vai rediģēšana 3D skatā | Zīmējiet un rediģējiet plānā; 3D skats seko katrai izmaiņai |
| Koridora raksturlīniju vai GIS objektu atlase 3D skatā ar klikšķi | Noklikšķiniet uz tiem plānā |
| Pārspīlētā skata vai pēdu eksports | Eksporti ir patiesā mērogā metros; skatiet [Eksportēt objektu 3D](topic:export-3d) |
| Etiķetes GLB vai OBJ eksportos, etiķešu izmēri un stili 3D | Etiķetes tiek rādītas tikai 3D skatā, viena izmēra; skatiet [Skatīt objektu 3D](topic:site-3d) |
| Tekstūras no fotogrāfijām, brauciena ierakstīšana videoformātā, ēnas no ārpus objekta, saules stundas 3D skatā | Kartes slāņi, kas uzlikti virsmām; braukšana un saules pozīcija vienā laikā; [saules stundas](topic:sun-hours) dienai vai sezonai plānā |
