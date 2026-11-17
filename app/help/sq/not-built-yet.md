---
title: Ende nuk është ndërtuar
summary: Çfarë nuk bën ende kjo version e CivilCraft, dhe çfarë të bësh sot në vend të saj.
keywords: mungon, kufizime, plan zhvillimi, nuk është e disponueshme, spirale, zgjerime, dwg, dxf, hyrje (inlets), retencion, prerje tërthore, do të vijë më vonë, kufij
from: a2d970ef
---

CivilCraft është në fillim. Kjo faqe liston çfarë nuk bën ende kjo version, që të mos e kërkosh. Asgjë këtu nuk premtohet për një datë.

## Pikat

| Ende nuk është ndërtuar | Në vend të kësaj, sot |
|---|---|
| Shtimi i një skedari të dytë pikash te i pari | Bashkoji skedarët në një redaktues teksti ose fletëllogaritës më parë |
| Eksportimi i një skedari teksti me pika | Eksporto LandXML (pikat dalin si CgPoints), përdor GIS {{ui:Eksporto}} (pikat me fushat P, N, E, Z dhe D), ose {{ui:Kopjo}} pikat në një fletëllogaritës |
| Stilet e etiketave të pikave, simbolet për çdo çelës përshkrimi, kurba (harqe) nga kodet e vijave, një skedar çelësash përshkrimi për ta ndarë midis projekteve | Etiketat tregojnë numrin, kotën dhe përshkrimin, ose më pak ([Cilësimet e CivilCraft](topic:settings)); çelësat mbahen në skedarin e projektit |
| Konvertimi i njësive | Konverto skedarin përpara importit; **Njësitë** vetëm e ri-etikedon |

## Sipërfaqet

| Ende nuk është ndërtuar | Në vend të kësaj, sot |
|---|---|
| Më shumë se një sipërfaqe e ndërtuar nga pikat | Një projekt për çdo sipërfaqe |
| Fshehja e kufijve (të brendshëm) | Përdor **Skaji më i gjatë i jashtëm** ose një kufi të jashtëm |
| Zgjedhja ose redaktimi i një vije thyerjeje të vetme të vizatuar | {{key:Mod+Z}}, ose {{ui:Hiq vijat e thyerjes të vizatuara}} dhe vizato përsëri |
| Redaktimi i një sipërfaqeje të lexuar nga LandXML (vija thyerjeje, kufi) | {{ui:Ndërto përsëri sipërfaqen nga pikat}} |
| Redaktimi i një sipërfaqeje të bërë nga një rrjet kotash | Importo rrjetin përsëri me zgjedhje të tjera |
| Konvertimi i një sipërfaqeje të lexuar nga LandXML kur ndryshon sistemi koordinativ | {{ui:Ndërto përsëri sipërfaqen nga pikat}} më parë |
| Kotat e pikave me etiketa dhe vlerat e pjerrësisë | Lexoji në shiritin e gjendjes, ose ngjyros sipërfaqen sipas pjerrësisë me **Analizën e pjerrësisë** në hapësirën e punës Peizazhi ([Nivelimi për peizazhin](topic:landscape-grading#grading-checks)) |

## Aksët rrugorë dhe profilet

| Ende nuk është ndërtuar | Në vend të kësaj, sot |
|---|---|
| Spirale të tjera përveç klotoidës; një spirale midis dy kurbash (kalime të përbëra) | Spiralet klotoide në skajet e një kurbe janë të disponueshme; të tjerat emërtohen dhe kapërcehen gjatë importit LandXML |
| Shtimi i një PI midis dy të tjerave | Rivizato aksin rrugor, ose ri-shkruaj koordinatat e PI |
| Aksë rrugorë nga objektet, zhvendosjet, zgjerimet | Vizato me PI |
| Shkrimi i K për një kurbë vertikale | Shkruaj L (K shfaqet) |
| Kurba vertikale rrethore dhe jo-simetrike | Vetëm kurba parabolike simetrike |
| Më shumë se një profil projekti për aks rrugor | Një aks rrugor për çdo variant |
| Zmadhimi i pamjes së profilit, brezat e profilit nën profil | Pamja e profilit përshtatet me gjithë aksin rrugor; vizatoje në [fletët e planimetrisë dhe profilit](topic:plan-profile-sheets) |
| Prerjet në DWG ose LandXML | Fletët e prerjeve si PDF; {{ui:CSV}} e sipërfaqeve dhe vëllimeve |
| Vijat e mostrës me kënd, ose me gjerësi të ndryshme përgjatë rrugës | Një gjerësi për secilën anë për gjithë aksin rrugor |

## Korridoret

| Ende nuk është ndërtuar | Në vend të kësaj, sot |
|---|---|
| Mesinat, barrierat dhe një superelevacion që rrotullon shabllonet | Vizato ato si shabllone ([Shabllonet e korridorit](topic:corridor-templates)); shabllonet sipas stacionit nuk marrin ende superelevacion |
| Një ndryshim gradual midis shabllonëve të dy zonave (kalime, konusë) | Ndrysho shabllonin në një stacion, ose jep një pike një objektiv gjerësie për një vijë të vizatuar si konus |
| Rrotullimi rreth një skaji, superelevacioni në LandXML | Superelevacioni rrotullohet rreth boshtit qendror në kurbat rrethore; zgjero një korsi me një objektiv gjerësie te një vijë karakteristike |
| Objektiva për pjerrësitë anësore (drita deri te një vijë ose sipërfaqe), sipërfaqe korridori të veta | Objektivat lëvizin skajet e asfaltit dhe të bankinave ([Korridoret](topic:corridor)); korridori niveloset në sipërfaqen e propozuar |
| Korridoret e eksportuara si rrugë LandXML; një korridor i dytë në një aks rrugor në eksportin IFC | Eksportohet sipërfaqja e propozuar |
| Shabllonet e terrenit që ndryshojnë sipërfaqen e propozuar, në 3D ose në prerje | Ato japin sipërfaqet dhe vëllimet e çdo shtrese ([Shabllonet e terrenit](topic:corridor-templates#terrain-templates)) |
| Trajektore lëvizjeje me shpejtësi, rrëshqitje gomash, kohë drejtimi, rimorkio drejtimi ose hapësirë trupi; bibliotekë e mjeteve standarde projektuese; trajektore e vizatuar duke tërhequr mjetin | Trajektore me shpejtësi të ulët përgjatë një vije karakteristike ose aksi rrugor, me madhësitë e tua të mjeteve ([Trajektoret e mjeteve](topic:swept-paths)) |

## Nivelimi dhe vëllimet

| Ende nuk është ndërtuar | Në vend të kësaj, sot |
|---|---|
| Banka, vija karakteristike të hapura të niveluara në projekt, nivelim deri te një vijë karakteristike nga diku tjetër | Mbyll vijën karakteristike ([Vijat karakteristike](topic:feature-lines)), ose përdore si vijë thyerjeje të terrenit ekzistues |
| Shtimi ose heqja e një kulmi të vijës karakteristike | Vizato vijën përsëri, ose bëj një zhvendosje me hapa të saj |
| Harqe në vijat e thyerjes së vizatuara (përmes pikave të rilevimit), spirale në vijat karakteristike | Vizato një vijë karakteristike me harqe dhe përdore si vijë thyerjeje të terrenit ekzistues |
| Nivelim deri në një distancë, kotë ose sipërfaqe tjetër | Vetëm dritë deri te terreni ekzistues |
| Shtimi ose heqja e një qoshe platforme | Fshi platformën dhe vizato përsëri |
| Vëllime TIN-në-TIN (prizëm), zgjedhja e madhësisë së qelizës së rrjetit | Metoda e rrjetit, madhësia e qelizës zgjidhet për ty |
| Përfshirja dhe tkurrja, shtresa e sipërme e tokës, thellësitë e asfaltit | Apliko koeficientët vetë në numrat e raportuar |
| Kostot e transportit të lirë dhe të rindërtimit, transporti midis akseve të ndryshëm, gropat e huazimit dhe vendet e mbetjeve të vendosura në planimetri | Diagrama e transportit masiv me pikat e ekuilibrit, vëllimet e lëvizura dhe distancat mesatare të transportit |

## Rrjetet e tubave

| Ende nuk është ndërtuar | Në vend të kësaj, sot |
|---|---|
| Më shumë se një rrjet për projekt | Projekte të veçanta për ujë shiu dhe fekale |
| Tubat e ujësjellësit: cilësia dhe mosha e ujit, kontrollet me rregulla, lloje të tjera valvulash (kontroll rrjedhe, shtrangues, mbajtës), pompa të dhëna me fuqi, kërkesë që varet nga presioni, opsioni Darcy–Weisbach, katalog tubash me trashësi muresh dhe klasa presioni. Pjesa tjetër e rrjeteve nën presion është në laborator: [Tubat e ujësjellësit](topic:water-mains) | Kontrolloji ato në softuerin e shpërndarjes së ujit; rrjedhat e projektimit fekal janë në [Rrjedhat e projektimit fekal](topic:sanitary-design) |
| Rrjedhat e kanalizimit në kohë (hidrografe, drejtim dinamik, ruajtje, pompa, mbitrysnime) | [Rrjedhat e projektimit fekal](topic:sanitary-design) jep rrjedhën maksimale të qëndrueshme që përdor fleta e projektit |
| Kapaciteti i hyrjeve, përhapja në kanal, drejtimi i retencionit, hidrografet, humbjet e energjisë përveç një koeficienti kryqëzimi | Kontrolloji në softuer tjetër; rrjedhat, madhësitë dhe linjat e nivelit janë në [Drenazhimi i ujërave të shiut](topic:storm-drainage) |
| Pellgjet në plotimin PDF, DWG, DXF ose LandXML; pellgje nga sipërfaqja (ndarjet e ujërave) | Vizato pellgjet me dorë; ruhen në skedarin e projektit |
| Katalogë tubash, tuba jo rrethorë, struktura që nuk janë kuti ose cilindra vertikalë (konusë, shkallë, gradina), një kategori drenazhimi në bibliotekë | Llojet e strukturave nga parametrat ([Rrjeti i tubave](topic:pipe-network)); tuba me diametër |
| Tubat në pamjen e profilit, tuba të lakuar | Lexo kotat e fundit dhe mbulesën në panelin e djathtë |

## Parcelat

| Ende nuk është ndërtuar | Në vend të kësaj, sot |
|---|---|
| Shtrirja e parcelave sipas sipërfaqes ose fasadës, parcela nga vijat përreth tyre, e drejta e kalimit | Vizato çdo parcelë sipas qoshesh të saj, ose fut thirrjet e saj |
| Tabela kurbash dhe tabela vijash në planimetri; etiketa të zhvendosura me dorë | Çdo segment etiketohet përgjatë vetes |
| Parcelat në LandXML | Parcelat ruhen në skedarin e projektit dhe shkojnë në PDF, DWG dhe DXF |

## Poligonalet

| Ende nuk është ndërtuar | Në vend të kësaj, sot |
|---|---|
| Rregullimi i katrorëve më të vegjël, rregulli i transitit, peshimi i këndeve kundrejt distancave | Rregulli i busullës |
| Këndet e devijimit, këndet zenitale dhe distancat e pjerrëta, kotat me nivelim trigonometrik | Reduktoje në distanca dhe kënde horizontale të sakta, ose në drejtime |
| Vëzhgimet anësore, skedarët e të dhënave të papërpunuara nga kolektorët e të dhënave | Importo pikat si skedar pikash |

## Shënimi në terren

| Ende nuk është ndërtuar | Në vend të kësaj, sot |
|---|---|
| Piketa me zhvendosje (pika referimi të vendosura prapa piketës), piketa pjerrësie te pika e kapjes | Pikato në zhvendosjet që të duhen, përfshirë përtej bankinës |
| Dërgimi i piketave direkt në formatin e vetë kolektorit të të dhënave | CSV hapet në softuerin e zyrës së shumicës së kolektorëve të të dhënave |
| Pikatimi i tubave, platformave dhe parcelave | Përdor pikat e rilevimit pranë një aksi rrugor, ose vijat e parcelës |

## Skedarët dhe dalja

| Ende nuk është ndërtuar | Në vend të kësaj, sot |
|---|---|
| Teksti, vijëzimet dhe përmasat nga DWG ose DXF; hapësira e letrës; vizatime të lidhura (xref); DXF binar | Vijat nga hapësira e modelit hapen ([Hap një DWG ose DXF si vijëzim](topic:open-dwg-dxf)); hap vizatimet e lidhura veç e veç |
| Zhvendosja e disa pikave njëherësh me tërheqje | Prit dhe ngjit ato, ose redakto një nga një |
| Fletë vertikale, bllokje titulli të tua, dritare pamjeje që rregulloni vetë, fletët e planimetrisë dhe profilit në DWG | Një fletë planimetrie horizontale për PDF, ose fletët e planimetrisë dhe profilit përgjatë një aksi rrugor (PDF) |
| Plotimi i brezave të kotave dhe i profileve | Brezat janë vetëm në ekran; bëj një pamje ekrani nëse të duhen |
| Ndryshimi i emrave, ngjyrave ose stileve të etiketave të shtresave | Ndrysho ato në një program CAD pas eksportit DXF |
| Ruajtja në re dhe historiku i versioneve | Ruaj skedarët `.civilcraft.json` dhe mbaji të kopjuar; për të punuar së bashku në një projekt, përdor një seancë të drejtpërdrejtë në CadCraft Studio ([Projektoni së bashku një vend, në kohë reale](topic:work-live)) |
| CadCraft Studio për iPad dhe iPhone, dhe nga Google Play | Përdor CivilCraft në shfletues në pajisje; në Android, CadCraft Studio instalohet nga APK-ja në getcadcraft.com/download |
| Hapja e disa skedarëve pikash ose projektesh njëherësh | Një skedar në çdo kohë (skedarët GIS që i takojnë njëri-tjetrit, si pjesët e një shapefile, hapen bashkë) |

## Peizazhi

| Ende nuk është ndërtuar | Në vend të kësaj, sot |
|---|---|
| Kokat dhe grykat e prodhuesve | Koka dhe gryka të përgjithshme, ose shto kokat e tua nga një skedar; të dhënat e prodhuesve hyjnë kur ata japin leje |
| Gjatësitë maksimale anësore për vijat e pikimit, rrjedhat në kohë, pompat, rrjetet me unazë tubash | Mbaj vijat e pikimit në gjatësinë e publikuar nga prodhuesi; kontrolli kërkon një rrjet me degë |
| Konturi i saktë i një objekti të lirë konkav; vëllimi i tij nën tokë i matur saktësisht | Konveksi (convex hull) niveloset dhe vëllimi nën tokë është një vlerësim (shkruhet te Vetitë) |
| Bimët në "Vendos nga biblioteka" të BimCraft dhe ModelCraft | Eksporto IFC të peizazhit dhe hape në BimCraft pranë ndërtesës |
| Modele të detajuara bimësh (gjethe, degë, stinë) në pamjen 3D; objekte të lira dhe ujitja në pamjen 3D | Bimët shfaqen në 3D si forma të thjeshta, të përmasuara sipas listës së bimëve ([Shiko vendin në 3D](topic:site-3d)); shpërndarja e ModelCraft bën imazhe mbjelljeje |
| Muret e ngurta që mbajnë një nivel të niveluar pas tyre në sipërfaqe | Jep platformës ose padit anë vertikale: ato janë mure mbajtëse në sipërfaqe ([Nivelimi](topic:grading)) |
| Transformimet SVG në simbolet e tua; teksturat dhe ngjyrat e modeleve GLB të bimëve të tua; gjeometria GLB e ngjeshur | Sheshoji transformimet në programin tënd të vizatimit më parë; modelet vizatohen në ngjyrën e bimës; eksporto GLB pa ngjeshje ([Grafika e bimëve](topic:plant-graphics)) |
| Lista jote e bimëve e mbajtur në llogarinë e Bibliotekës (e redaktuar në aplikacion) | Redakto listën e vet të projektit në tabelën e bimëve dhe ruaje si skedar bimësh |
| Veglat e peizazhit për asistentët pa dritare (serveri i skedarëve dhe rreshti i komandave) | Punojnë me dritaren e CivilCraft të hapur ([Lëri një asistent AI të punojë me vendin tënd](topic:assistants)) |

## Linjat elektrike

| Ende nuk është ndërtuar | Në vend të kësaj, sot |
|---|---|
| Standardi i një vendi i integruar (rastet e ngarkesës, hapësirat, faktorët) | Vendos vlerat e standardit tënd në {{ui:Rastet e ngarkesës dhe kufijtë…}} dhe ruaji, me bibliotekën tënde, si paketë për ta ripërdorur dhe ndarë ([Paketat](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Distanca anësore nga një përçues te kurora e një peme ose një mur pranë linjës | Hapësira vertikale lart mbi bimët dhe muret që kalon linja ([Kontrollet e linjës elektrike](topic:power-line-checks#clearances)) |
| Zvarritja e përçuesit dhe shtrirja e një përçuesi të ri | Llogarit ato përmes temperaturave në tabelën e tendosjes |
| Vlerësimi termik i kabllove të varrosur (vlerësimi i rrymës nga mënyra e vendosjes) | Fut vlerësimin e rrymës së furnizuesit tënd te artikulli i kabllit |
| Studimet e qarkut të shkurtër, mbrojtjes dhe tokëzimit | Përdor një program elektrik të veçantë; CivilCraft jep gjatësitë dhe kabllot e rrjetit |
| Shtylla rrjetë të projektuara element për element, dhe ankorime tiranesh në tokë | Mbajtëset kontrollohen sipas ngarkesës nominale; tiranët sipas ngarkesës së vlerësuar |
| Një skedar studimi `.DON` i kontrolluar në programin që e lexon | Kontrolloje atje; na dërgo një mostër që ta testojmë me një të vërtetë |
| Linjat elektrike në pamjen 3D dhe në IFC | Planimetria, profili i linjës, fletët dhe shtresat GIS |
| Veglat e linjave elektrike për asistentët pa dritare | Punojnë me dritaren e CivilCraft të hapur ([Lëri një asistent AI të punojë me vendin tënd](topic:assistants)) |

## Masat e ndërtesave

| Ende nuk është ndërtuar | Në vend të kësaj, sot |
|---|---|
| Një bibliotekë kodesh zonimi ose rregullash të ndonjë qyteti | Shkruaj kufijtë nga rregullorja jote ([Kufijtë e zonimit](topic:zoning-limits)) |
| Drita e qiellit mbi muret (drita e ditës në fasadë), era | [Orët e diellit](topic:sun-hours) numëron vetëm diellin e drejtpërdrejtë |
| Hija nga pemët, bimët ose çdo gjë që nuk është vizatuar si masë | Vizato ndërtesat fqinje si masa |
| Format e çative mbi masat | Masa me majë të sheshtë |
| Hapjet, çatitë dhe llojet e mureve kur një masë zhvillohet në BimCraft | BimCraft ndërton mure të thjeshta të jashtme në çdo nivel dhe një dysheme; shto pjesën tjetër atje |

## GIS dhe sistemet koordinative

| Ende nuk është ndërtuar | Në vend të kësaj, sot |
|---|---|
| File Geodatabase; stilet KML, ikonat, mbivendosjet e tokës dhe lidhjet e rrjetit | Konverto në GeoPackage, shapefile ose GeoJSON më parë; shënimet KML lexohen pa stilet e tyre |
| Redaktimi i elementeve GIS ose i atributeve të tyre | Redakto ato në një program GIS dhe importo përsëri. Paneli Analizo krijon shtresa të reja (buffer, mbivendosje, bashkim, përzgjedhje) dhe shton fusha sipërfaqeje dhe gjatësie, por nuk redakton një element në vend |
| Analiza e rrjetit dhe e rasterit, buffer me skaje të sheshta ose katrore dhe buffer njëanshme, shtimi ose fshirja e rreshtave dhe ndryshimi i llojit të një fushe në tabelën e atributeve, ngjyrat manuale të klasave, legjenda e stilit në plotime | Përdor {{ui:Përzgjidh}} për të zgjedhur elementet dhe krijo një shtresë prej tyre; skajet e sheshta nuk ofrohen. Ngjyrosja sipas atributit dhe tabela e atributeve janë të ndërtuara: shih [Stilizo një shtresë sipas një atributi](topic:gis-symbology) dhe [Puno me tabelën e atributeve të një shtrese](topic:gis-table) |
| Stilet e etiketave (madhësia, vendosja) dhe etiketat që shmangin njëra-tjetrën | Etiketat kanë një madhësi dhe mund të mbivendosen aty ku elementet janë të dendura |
| Datumet vertikale dhe modelet gjeoidale | Kotat përdoren ashtu si i jep skedari; kontrollo vetë datumin vertikal |
| Zhvendosjet e rrjetit të ndryshme nga NAD27 në NAD83 të sugjeruara sipas zonës (OSTN15; NTv2 për datumet e tjera funksionon kur shton skedarin), disa rrjete njëherësh, rrjete vertikale | Shto vetë skedarin e rrjetit për datumin tënd; një rrjet për projekt |
| Shtresat e hartës në DXF ose në eksportet 3D | Shtresat e hartës shkojnë në plotimin PDF, dhe pranë DWG si foto |
| Serverat e hartave që kërkojnë hyrje, çelës ose token | Përdor shërbime publike, ose një skedar imazhi të gjeoreferencuar |
| Shkrimi i skedarëve LAS ose LAZ nga një sipërfaqe, modeli i tokës ose veglat e rrjetit të kotave dhe LiDAR | Eksporto sipërfaqet si rrjet kotash GeoTIFF. Shtesa [Retë e pikave](topic:point-clouds) shkruan një re të pastruar si LAS 1.4 ose LAZ |
| Intensiteti, ngjyra dhe kthimet LiDAR; rrjetet e kotave me disa brezë; skedarët e rrjetit ose LiDAR mbi 200 MB | LiDAR filtrohet vetëm sipas klasës, rrjetet përdorin brezin e parë; prit skedarët e mëdhenj në pjesë përpara |

## Hyrja

| Ende nuk është ndërtuar | Në vend të kësaj, sot |
|---|---|
| Përzgjedhja me kuti me prekje (kërkon {{key:Shift}}) | Mbaj shtypur çdo pikë rilevimi për ta shtuar |
| Koordinata ose distanca të shkruara gjatë vizatimit | Vizato përafërsisht, pastaj shkruaj koordinatat e sakta të PI në tabelën PI të aksit rrugor |
| Shkrimi i koordinatave për qoshet e platformave dhe strukturat | Tërhiq kapësit e tyre; zmadho për saktësi dhe shiko E dhe N në shiritin e gjendjes |
| Kapja te objektet (përveç pikave të rilevimit për vijat e thyerjes) | Zmadho dhe shiko shiritin e gjendjes |

## Pamja 3D

| Ende nuk është ndërtuar | Në vend të kësaj, sot |
|---|---|
| Vizatimi ose redaktimi në pamjen 3D | Vizato dhe redakto në planimetri; pamja 3D ndjek çdo redaktim |
| Zgjedhja e vijave karakteristike të korridorit ose elementeve GIS duke klikuar në 3D | Kliko ato në planimetri |
| Eksportimi i pamjes së zmadhuar ose në këmbë | Eksportet janë në shkallë të vërtetë, në metra; shih [Eksporto vendin në 3D](topic:export-3d) |
| Etiketat në eksportet GLB ose OBJ, madhësitë dhe stilet e etiketave në 3D | Etiketat shfaqen vetëm në pamjen 3D, në një madhësi; shih [Shiko vendin në 3D](topic:site-3d) |
| Tekstura nga foto, regjistrimi i një udhëtimi si video, hijet nga jashtë vendit, orët e diellit të shfaqura në pamjen 3D | Shtresat e hartës të shtrira mbi sipërfaqet; udhëto dhe pozicioni i diellit në një kohë; [orët e diellit](topic:sun-hours) për një ditë ose stinë në planimetri |
