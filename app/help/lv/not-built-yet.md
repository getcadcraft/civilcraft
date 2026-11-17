---
title: Vēl nav izveidots
summary: Ko šī CivilCraft versija vēl nedara un ko darīt tā vietā šodien.
keywords: trūkst, ierobežojumi, plānotais, nav pieejams, spirāles, paplašināšana, dwg, dxf, ieteces, aizturēšana, šķērsgriezumi, vēlāk, ierobežojumi
from: a2d970ef
---

CivilCraft ir agrīnā stadijā. Šajā lapā uzskaitīts, ko pašreizējā versija nedara, lai nemeklētu to. Nekas šeit nav solīts noteiktam datumam.

## Punkti

| Vēl nav izveidots | Šodien tā vietā |
|---|---|
| Otra punktu faila pievienošana pirmajam | Vispirms savienojiet failus teksta redaktorā vai izklājlapā |
| Punktu teksta faila eksportēšana | Eksportējiet LandXML (punkti tiek izvadīti kā CgPoints), izmantojiet GIS {{ui:Eksportēt}} (punkti ar laukiem P, N, E, Z un D) vai {{ui:Kopēt}} punktus izklājlapā |
| Punktu etiķešu stili, simboli katram apraksta atslēgas punktam, līknes (lokus) no līniju kodiem, apraksta atslēgu fails, ko kopīgot starp projektiem | Etiķetēs rādīts numurs, augstums un apraksts vai mazāk ([CivilCraft iestatījumi](topic:settings)); atslēgas glabājas projekta failā |
| Mērvienību pārveidošana | Pārveidojiet failu pirms importēšanas; **Mērvienības** tikai maina nosaukumu |

## Virsmas

| Vēl nav izveidots | Šodien tā vietā |
|---|---|
| Vairāk nekā viena virsma, izveidota no punktiem | Viens projekts uz vienu virsmu |
| Paslēpt (iekšējās) robežas | Izmantojiet **Garākā ārējā mala** vai ārējo robežu |
| Viena zīmētas lūzumlīnijas atlasīšana vai rediģēšana | {{key:Mod+Z}} vai {{ui:Noņemt zīmētās lūzumlīnijas}} un zīmējiet atkārtoti |
| Virsmas, kas nolasīta no LandXML, rediģēšana (lūzumlīnijas, robeža) | {{ui:Pārbūvēt virsmu no punktiem}} |
| Virsmas, kas izveidota no augstumu režģa, rediģēšana | Importējiet režģi atkārtoti ar citām izvēlēm |
| Virsmas, kas nolasīta no LandXML, pārveidošana, mainoties koordinātu sistēmai | Vispirms {{ui:Pārbūvēt virsmu no punktiem}} |
| Iezīmētas vietējās atzīmes un slīpuma vērtības | Nolasiet tās statusa joslā vai iekrāsojiet virsmu pēc slīpuma ar **Slīpuma analīzi** Ainavas darbvidē ([Ainavas nogāžu plānošana](topic:landscape-grading#grading-checks)) |

## Trases un garenprofili

| Vēl nav izveidots | Šodien tā vietā |
|---|---|
| Spirāles, kas nav klotoīdas; spirāle starp divām līknēm (saliktās pārejas) | Klotoīdas spirāles līknes galos ir pieejamas; pārējās tiek nosauktas un izlaistas LandXML importā |
| PI ievietošana starp diviem citiem | Pārzīmējiet trasi vai pārrakstiet PI koordinātas |
| Trases no objektiem, nobīdēm, paplašinājumiem | Zīmējiet ar PI |
| K ierakstīšana vertikālai līknei | Ierakstiet L (K tiek rādīts) |
| Apļveida un nesimetriskas vertikālās līknes | Tikai simetriskas parabolas līknes |
| Vairāk nekā viens projektēts garenprofils vienai trasei | Viena trase katram variantam |
| Garenprofila skata tuvināšana, profila joslas zem profila | Profila skats ietver visu trasi; drukājiet to [plānu un profilu lapās](topic:plan-profile-sheets) |
| Griezumi DWG vai LandXML | Griezumu lapas kā PDF; {{ui:CSV}} laukumu un tilpumu |
| Paraugu līnijas leņķī vai dažādos platumos gar ceļu | Viens platums katrā pusē visai trasei |

## Koridori

| Vēl nav izveidots | Šodien tā vietā |
|---|---|
| Vidusjoslas, barjeras un virsaugstinājums, kas pagriež šablonus | Zīmējiet tos kā šablonus ([Koridoru šabloni](topic:corridor-templates)); šabloni pēc stacijas vēl neņem vērā virsaugstinājumu |
| Pakāpeniska pāreja starp diviem reģionu šabloniem (pārejas, sašaurinājumi) | Mainiet šablonu stacijā vai piešķiriet punktam platuma mērķi līnijai, kas zīmēta kā sašaurinājums |
| Pagriešana ap malu, virsaugstinājums LandXML | Virsaugstinājums griežas ap centrālo līniju apļveida līknēs; paplašiniet joslu ar platuma mērķi uz raksturlīniju |
| Sānu nogāžu mērķi (līdz līnijai vai virsmai), pašas koridora virsmas | Mērķi pārvieto braucamās daļas un apmales malas ([Koridori](topic:corridor)); koridors tiek izrakts projektētajā virsmā |
| Koridori, eksportēti kā LandXML ceļi; otrs koridors trasē IFC eksportā | Tiek eksportēta projektētā virsma |
| Zemes šabloni, kas maina projektēto virsmu 3D skatā vai griezumos | Tie dod katra slāņa laukumus un tilpumus ([Zemes šabloni](topic:corridor-templates#terrain-templates)) |
| Transportlīdzekļu pagrieziena trajektorijas ar ātrumu, riepu slīdēšanu, stūrēšanas laiku, stūrējamām piekabēm vai korpusa atstatumu; standarta projektēšanas transportlīdzekļu bibliotēka; trajektorija, kas zīmēta, velkot transportlīdzekli | Zema ātruma trajektorijas gar raksturlīniju vai trasi ar jūsu pašu transportlīdzekļu izmēriem ([Transportlīdzekļu pagrieziena trajektorijas](topic:swept-paths)) |

## Nogāzes un tilpumi

| Vēl nav izveidots | Šodien tā vietā |
|---|---|
| Soliņi, atvērtas raksturlīnijas, kas nogrieztas dizainā; nogāze līdz raksturlīnijai no citurienes | Aizveriet raksturlīniju ([Raksturlīnijas](topic:feature-lines)) vai izmantojiet to kā esošās zemes lūzumlīniju |
| Raksturlīnijas virsotnes ievietošana vai noņemšana | Zīmējiet līniju no jauna vai izveidojiet tās pakāpenisku nobīdi |
| Lokas zīmētās lūzumlīnijās (caur uzmērījuma punktiem), spirāles raksturlīnijās | Zīmējiet raksturlīniju ar lokiem un izmantojiet to kā esošās zemes lūzumlīniju |
| Nogāze līdz attālumam, augstumam vai citai virsmai | Tikai līdz esošajai zemei |
| Platformas stūra pievienošana vai noņemšana | Dzēsiet platformu un zīmējiet to no jauna |
| TIN-uz-TIN (prizmas) tilpumi, režģa šūnas izmēra izvēle | Režģa metode, šūnas izmērs izvēlēts jūsu vietā |
| Sabriešana un saraušanās, augsnes slānis, seguma biezumi | Lietojiet koeficientus paziņotajiem skaitļiem paši |
| Izvešanas un atvešanas izmaksas, pārvadāšana starp dažādām trasēm, aizņemšanās vietas un atkritumu izgāztuves, kas novietotas plānā | Masu pārvietošanas diagramma ar līdzsvara punktiem, pārvietotajiem tilpumiem un vidējiem pārvietošanas attālumiem |

## Cauruļu tīkli

| Vēl nav izveidots | Šodien tā vietā |
|---|---|
| Vairāk nekā viens tīkls projektā | Atsevišķi projekti lietusūdenim un sadzīves kanalizācijai |
| Ūdensvadi: ūdens kvalitāte un vecums, uz noteikumiem balstītas vadības, citi vārstu tipi (plūsmas kontrole, droseļvārsts, uzturošais), sūkņi ar jaudu, pieprasījums atkarīgs no spiediena, Darsi–Veisbaha iespēja, cauruļu katalogs ar sienu biezumiem un spiediena klasēm. Pārējais spiedienu tīklos ir laboratorijā: [Ūdensvadi](topic:water-mains) | Pārbaudiet tos ūdens sadales programmatūrā; sadzīves kanalizācijas projektēšanas plūsmas ir [Sadzīves kanalizācijas projektēšanas plūsmas](topic:sanitary-design) |
| Kanalizācijas plūsmas laika gaitā (hidrogrāfi, dinamiska maršrutēšana, uzkrāšana, sūkņi, pārplūdes) | [Sadzīves kanalizācijas projektēšanas plūsmas](topic:sanitary-design) dod stabilo maksimālo plūsmu, ko izmanto projektēšanas lapa |
| Ieteces jauda, rievas izplatība, aizturēšanas maršrutēšana, hidrogrāfi, enerģijas zudumi, izņemot vienu krustojuma koeficientu | Pārbaudiet tos citā programmatūrā; plūsmas, izmēri un hidrauliskās līnijas ir [Lietusūdens novadīšana](topic:storm-drainage) |
| Baseini PDF izdrukā, DWG, DXF vai LandXML; baseini no virsmas (ūdensšķirtnes) | Zīmējiet baseinus ar roku; tie tiek saglabāti projekta failā |
| Cauruļu katalogi, nenoapaļotas caurules, konstrukcijas, kas nav taisnas kastes vai cilindri (konusi, pakāpieni, pakāpienu sienas), lietusūdens kategorija bibliotēkā | Konstrukciju tipi pēc parametriem ([Cauruļu tīkls](topic:pipe-network)); caurules ar diametru |
| Caurules garenprofila skatā, izliektas caurules | Nolasiet atzīmes un pārklājumu labajā panelī |

## Zemesgabali

| Vēl nav izveidots | Šodien tā vietā |
|---|---|
| Zemesgabalu izvietošana pēc platības vai fronta, zemesgabali no līnijām ap tiem, ceļa servitūts | Zīmējiet katru zemesgabalu pēc tā stūriem vai ievadiet tā virzienus |
| Līkņu tabulas un līniju tabulas plānā; etiķetes, kas pārvietotas ar roku | Katrs posms ir iezīmēts gar sevi |
| Zemesgabali LandXML | Zemesgabali glabājas projekta failā un tiek izvadīti uz PDF, DWG un DXF |

## Lauka pārvadi

| Vēl nav izveidots | Šodien tā vietā |
|---|---|
| Mazāko kvadrātu izlīdzināšana, transita likums, leņķu svēršana pret attālumiem | Kompasa likums |
| Novirzes leņķi, zenīta leņķi un slīpuma attālumi, augstumi ar trigonometrisko nivelēšanu | Pārveidojiet pareizi horizontālos attālumos un leņķos vai virzienos |
| Sānu uzņemšanas, neapstrādātu datu faili no datu savācējiem | Importējiet punktus kā punktu failu |

## Mietiņi

| Vēl nav izveidots | Šodien tā vietā |
|---|---|
| Nobīdes mietiņi (atsauces punkti, atvirzīti no mietiņa), nogāzes mietiņi pie noķeršanas punkta | Iezīmējiet mietiņus nepieciešamajās nobīdēs, arī aiz malas |
| Mietiņu nosūtīšana tieši datu savācēja formātā | CSV atveras vairuma datu savācēju biroja programmatūrā |
| Cauruļu, platformu un zemesgabalu iezīmēšana ar mietiņiem | Izmantojiet uzmērījuma punktus pie trases vai zemesgabala posmus |

## Faili un izvade

| Vēl nav izveidots | Šodien tā vietā |
|---|---|
| Teksts, svītrojumi un izmēri no DWG vai DXF; papīra telpa; saistītie rasējumi (xrefs); bināralais DXF | Modeļa telpas līnijzīmējums tiek atvērts ([DWG vai DXF atvēršana kā līnijzīmējums](topic:open-dwg-dxf)); saistītos rasējumus atveriet atsevišķi |
| Vairāku punktu pārvietošana vienlaikus, velkot | Izgrieziet un ielīmējiet tos vai rediģējiet pa vienam |
| Portreta lapas, savas titulu lapas, skatlogi, ko izkārtojat pats, plānu un profilu lapas DWG | Viena ainavas plāna lapa vienam PDF vai plānu un profilu lapas gar trasi (PDF) |
| Attēlot augstumu joslas un profilus izdrukā | Joslas ir tikai ekrānā; uzņemiet ekrānuzņēmumu, ja tās vajadzīgas |
| Slāņu nosaukumu, krāsu vai etiķešu stilu maiņa | Mainiet tos CAD programmā pēc DXF eksporta |
| Mākoņa saglabāšana un versiju vēsture | Saglabājiet `.civilcraft.json` failus un dublējiet tos; lai kopā strādātu pie viena projekta, izmantojiet tiešsaistes sesiju CadCraft Studio ([Projektējiet vienu objektu kopā, tiešsaistē](topic:work-live)) |
| CadCraft Studio iPad un iPhone ierīcēm, kā arī no Google Play | Izmantojiet CivilCraft pārlūkprogrammā savā ierīcē; Android ierīcē CadCraft Studio instalējas no APK faila lapā getcadcraft.com/download |
| Vairāku punktu vai projektu failu atvēršana vienlaikus | Viens fails vienlaikus (GIS faili, kas pieder kopā, piemēram, shapefile daļas, atveras kopā) |

## Ainava

| Vēl nav izveidots | Šodien tā vietā |
|---|---|
| Ražotāju galvas un sprauslas | Vispārīgas galvas vai pievienojiet savas galvas no faila; ražotāju dati tiek ievietoti, kad viņi dod atļauju |
| Maksimālie sānu garumi pilienu līnijām, plūsmas laika gaitā, sūkņi, cilpotie cauruļu tīkli | Turiet pilienu posmus pie ražotāja publicētā garuma; pārbaudei nepieciešams atzarots tīkls |
| Precīzs ieliekta brīvforma objekta kontūrs; tā zemes zemākās daļas tilpums, izmērīts precīzi | Izrakts ir izliektais apvalks, un zemes zemākās daļas tilpums ir aplēse (norādīts Rekvizītos) |
| Augi BimCraft un ModelCraft savā Place from library | Eksportējiet ainavas IFC un atveriet to BimCraft blakus ēkai |
| Detalizēti augu modeļi (lapas, zari, sezonas) 3D skatā; brīvformas objekti un apūdeņošana 3D skatā | Augi 3D skatā rādīti kā vienkāršas formas, kas izmērītas pēc augu saraksta ([Skatīt vietu 3D](topic:site-3d)); ModelCraft izkliedes veido stādīšanas attēlus |
| Cietās ainavas sienas, kas notur izlīdzinātu līmeni aiz tām virsmā | Dodiet platformai vai padam vertikālas malas: tās virsmā ir atbalsta sienas ([Nogāžu plānošana](topic:grading)) |
| SVG pārveidojumi jūsu simbolos; jūsu pašu GLB augu modeļu tekstūras un krāsas; saspiesta GLB ģeometrija | Vispirms izlīdziniet pārveidojumus zīmēšanas programmā; modeļi zīmēti augu krāsā; eksportējiet GLB bez saspiešanas ([Augu grafika](topic:plant-graphics)) |
| Jūsu pašu augu saraksts, kas glabājas bibliotēkas kontā (rediģējams lietotnē) | Rediģējiet projekta paša sarakstu augu tabulā un saglabājiet to kā augu failu |
| Ainavas rīki palīgiem bez loga (failu serveris un komandrinda) | Tie darbojas, kad CivilCraft logs ir atvērts ([Ļaujiet MI palīgam strādāt ar jūsu objektu](topic:assistants)) |

## Elektrolīnijas

| Vēl nav izveidots | Šodien tā vietā |
|---|---|
| Valsts standarts iebūvēts (slodžu gadījumi, atstatumi, koeficienti) | Iestatiet sava standarta vērtības sadaļā {{ui:Slodžu gadījumi un ierobežojumi…}} un saglabājiet tās ar savu bibliotēku kā paketi, ko var lietot atkārtoti un kopīgot ([Paketes](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Sānu attālums no vadītāja līdz koka vainagam vai sienai līnijas malā | Vertikālais atstatums virs augiem un sienām, ko līnija šķērso ([Elektrolīniju pārbaudes](topic:power-line-checks#clearances)) |
| Vadītāja ložņāšana un jauna vadītāja izstiepšanās | Ņemiet tās vērā caur temperatūrām stiepšanas tabulā |
| Zemē ieraktu kabeļu termiskais novērtējums (strāvas slodze no to izvietojuma) | Ievadiet sava piegādātāja strāvas slodzi kabeļa vienumā |
| Īssavienojuma, aizsardzības un zemējuma pētījumi | Izmantojiet specializētu elektrisko programmu; CivilCraft dod tīkla garumus un kabeļus |
| Līkņu torņi, kas projektēti pa elementiem, un atbalstu stiepes augsnē | Balsti pārbaudīti pēc nominālās slodzes; stiepes — pēc nominālās slodzes |
| `.DON` pētījuma fails, kas pārbaudīts programmā, kas to lasa | Pārbaudiet failu tur; nosūtiet mums paraugu, lai pārbaudītu pret reālu |
| Elektrolīnijas 3D skatā un IFC | Plāns, līnijas garenprofils, lapas un GIS slāņi |
| Elektrolīniju rīki palīgiem bez loga | Tie darbojas, kad CivilCraft logs ir atvērts ([Ļaujiet MI palīgam strādāt ar jūsu objektu](topic:assistants)) |

## Ēku masas

| Vēl nav izveidots | Šodien tā vietā |
|---|---|
| Zonēšanas kodu bibliotēka vai jebkuras pilsētas noteikumi | Ierakstiet ierobežojumus no sava pilsētas noteikumiem ([Zonējuma ierobežojumi](topic:zoning-limits)) |
| Saules gaisma uz sienām (fasādes dienasgaisma), vējš | [Saules stundas](topic:sun-hours) skaita tikai tiešu saules gaismu |
| Ēnas no kokiem, augiem vai jebkā, kas nav zīmēts kā masa | Zīmējiet blakus esošās ēkas kā masas |
| Jumtu formas masām | Plakanas virsotnes masas |
| Atvērumi, jumti un sienu tipi, kad masa tiek izstrādāta BimCraft | BimCraft veido vienkāršas ārsienas katrā līmenī un stāvā; pievienojiet pārējo tur |

## GIS un koordinātu sistēmas

| Vēl nav izveidots | Šodien tā vietā |
|---|---|
| File Geodatabase; KML stili, ikonas, zemes pārklājumi un tīkla saites | Pārvērtiet GeoPackage, shapefile vai GeoJSON formātā; KML atzīmes tiek nolasītas bez stiliem |
| GIS objektu vai to atribūtu rediģēšana | Rediģējiet tos GIS programmā un importējiet vēlreiz. Analīzes panelis veido jaunus slāņus (buferi, pārklāšana, savienošana, atlase) un pievieno laukumu un garumu laukus, bet neredaģē objektu uz vietas |
| Tīkla un rastra analīze, buferi ar plakaniem vai kvadrātiskiem galiem un vienpusēji buferi, rindu pievienošana vai dzēšana un lauka tipa maiņa atribūtu tabulā, pašu klašu krāsas, stila leģenda izdrukās | Izmantojiet Atlasīt, lai izvēlētos objektus un izveidotu no tiem slāni; plakani gali nav piedāvāti. Krāsošana pēc atribūta un atribūtu tabula jau ir izveidotas: skatiet [Stilizēt slāni pēc atribūta](topic:gis-symbology) un [Strādāt ar slāņa atribūtu tabulu](topic:gis-table) |
| Etiķešu stili (izmērs, izvietojums) un etiķetes, kas izvairās viena no otras | Etiķetes ir viena izmēra un var pārklāties, kur objekti ir blīvi |
| Vertikālie datumi un ģeoīda modeļi | Augstumi tiek izmantoti tā, kā tos dod fails; pārbaudiet vertikālo datumu pats |
| Režģa nobīdes, izņemot NAD27 uz NAD83, kas ieteiktas pēc apgabala (OSTN15, NTv2 citiem datumiem darbojas, kad pievienojat failu), vairāki režģi vienlaikus, vertikālie režģi | Pievienojiet režģa failu savam datumam pats; viens režģis vienā projektā |
| Kartes slāņi DXF vai 3D eksportos | Kartes slāņi tiek ievietoti PDF izdrukā un blakus DWG kā attēls |
| Kartes serveri, kam nepieciešama pieteikšanās, atslēga vai pilnvara | Izmantojiet publiskos pakalpojumus vai georeferencētu attēla failu |
| LAS vai LAZ failu rakstīšana no virsmas, zemes modeļa vai augstumu režģa un LiDAR rīkiem | Eksportējiet virsmas kā GeoTIFF augstumu režģi. [Punktu mākoņi](topic:point-clouds) papildinājums raksta notīrītu mākoni kā LAS 1.4 vai LAZ |
| LiDAR intensitāte, krāsa un atgriešanās; augstumu režģi ar vairākām joslām; režģu vai LiDAR faili, lielāki par 200 MB | LiDAR tiek filtrēts tikai pēc klases, režģi izmanto pirmo joslu; vispirms sadaliet lielos failus daļās |

## Ievade

| Vēl nav izveidots | Šodien tā vietā |
|---|---|
| Atlase ar skārienu, kastes veidā (vajag {{key:Shift}}) | Ilgi turiet katru uzmērījuma punktu, lai to pievienotu |
| Ierakstītas koordinātas vai attālumi zīmēšanas laikā | Uzzīmējiet aptuveni, pēc tam ierakstiet precīzas PI koordinātas trases PI tabulā |
| Platformu stūru un konstrukciju koordinātu ierakstīšana | Velciet to rokturus; tuviniet precizitātei un skatiet E un N statusa joslā |
| Piesaistīšana objektiem (izņemot uzmērījuma punktus lūzumlīnijām) | Tuviniet un skatiet statusa joslu |

## 3D skats

| Vēl nav izveidots | Šodien tā vietā |
|---|---|
| Zīmēšana vai rediģēšana 3D skatā | Zīmējiet un rediģējiet plānā; 3D skats seko katrai izmaiņai |
| Koridora raksturlīniju vai GIS objektu atlase 3D skatā, noklikšķinot | Noklikšķiniet tos plānā |
| Pārspīlētā skata vai pēdu eksports | Eksporti ir patiesā mērogā metros; skatiet [Eksportēt vietu 3D](topic:export-3d) |
| Etiķetes GLB vai OBJ eksportā, etiķešu izmēri un stili 3D | Etiķetes rādītas tikai 3D skatā, vienā izmērā; skatiet [Skatīt vietu 3D](topic:site-3d) |
| Tekstūras no fotogrāfijām, braukšanas ierakstīšana kā video, ēnas no ārpus objekta, saules stundas 3D skatā | Kartes slāņi, uzlikti uz virsmām; braukšana un saules pozīcija vienā laikā; [saules stundas](topic:sun-hours) dienai vai sezonai plānā |
