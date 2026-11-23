---
title: Ende nuk është ndërtuar
summary: Çfarë nuk bën ende kjo version e CivilCraft dhe çfarë të bësh sot në vend të tij.
keywords: mungon, kufizime, plan zhvillimi, nuk është e disponueshme, spirale, zgjerim, dwg, dxf, hyrje kullimi, retensioni, prerje tërthore, do të vijë më vonë, kufij
from: b91588d4
---

CivilCraft është ende në fillim. Kjo faqe liston çfarë nuk bën versioni aktual, që të mos e kërkosh. Asgjë këtu nuk është premtuar për një datë.

## Pikat

| Ende nuk është ndërtuar | Në vend të kësaj, sot |
|---|---|
| Shtimi i një skedari të dytë pikash te i pari | Bashko skedarët në një redaktues teksti ose fletë llogaritëse më parë |
| Eksportimi i një skedari teksti pikash | Eksporto LandXML (pikat dalin si CgPoints), përdor GIS {{ui:Eksporto}} (pikat me fushat P, N, E, Z dhe D), ose {{ui:Kopjo}} pikat në një fletë llogaritëse |
| Stilet e etiketave të pikave, simbolet sipas çelësit të përshkrimit, kurba (harqe) nga kodet e vijave, një skedar çelësi përshkrimi për ndarje mes projekteve | Etiketat tregojnë numrin, kotën dhe përshkrimin, ose më pak ([Cilësimet e CivilCraft](topic:settings)); çelësat ruhen në skedarin e projektit |
| Konvertimi i njësive | Konverto skedarin përpara importit; **Njësitë** vetëm ri-etiketojnë |

## Sipërfaqet

| Ende nuk është ndërtuar | Në vend të kësaj, sot |
|---|---|
| Më shumë se një sipërfaqe e ndërtuar nga pikat | Një projekt për çdo sipërfaqe |
| Fshehja e kufijve (të brendshëm) | Përdor **Skajin më të gjatë të jashtëm** ose një kufi të jashtëm |
| Zgjedhja ose redaktimi i një vije thyerjeje të vizatuar | {{key:Mod+Z}}, ose {{ui:Hiq vijat e thyerjes të vizatuara}} dhe vizato sërish |
| Redaktimi i një sipërfaqeje të lexuar nga LandXML (vija thyerjeje, kufi) | {{ui:Ndërto përsëri sipërfaqen nga pikat}} |
| Redaktimi i një sipërfaqeje të bërë nga një rrjet kotash | Importo rrjetin sërish me zgjedhje të tjera |
| Konvertimi i një sipërfaqeje të lexuar nga LandXML kur ndryshon sistemi i koordinatave | {{ui:Ndërto përsëri sipërfaqen nga pikat}} më parë |
| Kotat me etiketë në pika dhe vlerat e pjerrësisë | Lexoji në shiritin e statusit, ose ngjyros sipërfaqen sipas pjerrësisë me **Analizën e pjerrësisë** në hapësirën e Peizazhit ([Nivelimi për peizazhin](topic:landscape-grading#grading-checks)) |

## Akset dhe profilet

| Ende nuk është ndërtuar | Në vend të kësaj, sot |
|---|---|
| Spirale të tjera përveç klotoidit; një spirale midis dy kthesave (kalime të përbëra) | Spiralet klotoide në skajet e një kthese janë të disponueshme; të tjerat emërtohen dhe kapërcehen në importin LandXML |
| Futja e një PI midis dy të tjerave | Vizato sërish aksin rrugor, ose ri-shkruaj koordinatat e PI |
| Akse rrugore nga objektet, zhvendosjet, zgjerimet | Vizato me PI |
| Shkruarja e K për një kurbë vertikale | Shkruaj L (K shfaqet) |
| Kurba vertikale rrethore dhe asimetrike | Vetëm kurba parabolike simetrike |
| Më shumë se një profil projektues për aks rrugor | Një aks rrugor për variant |
| Zmadhimi i pamjes së profilit, brezat e profilit nën profil | Pamja e profilit përshtatet me gjithë aksin rrugor; printoje në [fletët e planit dhe profilit](topic:plan-profile-sheets) |
| Prerjet në DWG ose LandXML | Fletët e prerjeve si PDF; {{ui:CSV}} e sipërfaqeve dhe vëllimeve |
| Vija mostre me kënd, ose me gjerësi të ndryshme përgjatë rrugës | Një gjerësi për secilën anë për gjithë aksin rrugor |

## Koridoret

| Ende nuk është ndërtuar | Në vend të kësaj, sot |
|---|---|
| Mediana, barriera dhe superelevim që rrotullon shabllonet | Vizato si shabllone ([Shabllonet e koridorit](topic:corridor-templates)); shabllonet sipas stacionit nuk marrin ende superelevim |
| Ndryshim gradual midis shabllonesh të dy zonave (kalime, konicitete) | Ndrysho shabllonin te një stacion, ose i jep një pike objektiv gjerësie për një vijë të vizatuar si koniciteti |
| Rrotullimi rreth një skaji, superelevimi në LandXML | Superelevimi rrotullohet rreth boshtit qendror në kthesat rrethore; zgjero një korsi me një objektiv gjerësie te një vijë karakteristike |
| Objektiva për pjerrësitë anësore (kontakti me një vijë ose sipërfaqe), sipërfaqe koridori të veta | Objektivat zhvendosin skajet e asfaltit dhe të bankinave ([Koridoret](topic:corridor)); koridori nivelohet në sipërfaqen e propozuar |
| Kthimet e bordurave, korsitë e kthimit dhe ishujt të niveluar në një kryqëzim; fundi i një rruge anësore i prerë te skaji i rrugës kryesore në kënd të shtrembër; një shteg i lidhur me një rrugë në plan, në gjatësinë dhe sipërfaqen e tij | Rrugët që takohen lidhen në kënd të drejtë, me skajin e rrugës kryesore të hapur dhe rrugën anësore të lehtësuar ([Ku takohen rrugët](topic:corridor#where-roads-meet-roads-pads-and-paths)); një shteg ndalon te skaji i rrugës në sipërfaqen e propozuar dhe në 3D |
| Koridoret e eksportuara si rrugë LandXML; një koridor i dytë në një aks rrugor në eksportin IFC | Sipërfaqja e propozuar eksportohet |
| Shabllonet e terrenit që ndryshojnë sipërfaqen e propozuar, në 3D ose në prerje | Ato japin sipërfaqet dhe vëllimet e çdo shtrese ([Shabllonet e terrenit](topic:corridor-templates#terrain-templates)) |
| Shtigje rrotullimi me shpejtësi, rrëshqitje gomash, kohë drejtimi, rimorkio drejtimi ose hapësirë trupi; bibliotekë automjetesh standarde projektimi; një shteg rrotullimi i vizatuar duke zvarritur automjetin | Shtigjet e rrotullimit me shpejtësi të ulët përgjatë një vije karakteristike ose aksi rrugor, me përmasat e automjeteve tua ([Shtigjet e rrotullimit të automjeteve](topic:swept-paths)) |

## Nivelimi dhe vëllimet

| Ende nuk është ndërtuar | Në vend të kësaj, sot |
|---|---|
| Banka, vija karakteristike të hapura të niveluara në projekt, nivelim deri në një vijë karakteristike nga diku tjetër | Mbyll vijën karakteristike ([Vijat karakteristike](topic:feature-lines)), ose përdore si vijë thyerjeje të terrenit ekzistues |
| Futja ose heqja e një kulmi të vijës karakteristike | Vizato sërish vijën, ose bëj një zhvendosje me shkallë të saj |
| Harqe në vijat e vizatuara të thyerjes (përmes pikave të matjes), spirale në vijat karakteristike | Vizato një vijë karakteristike me harqe dhe përdore si vijë thyerjeje të terrenit ekzistues |
| Nivelim sipas një distance, kote ose sipërfaqe tjetër | Vetëm kontakt me terrenin ekzistues |
| Shtimi ose heqja e një këndi platforme | Fshi platformën dhe vizato sërish |
| Vëllime TIN-në-TIN (prizëm), zgjedhja e madhësisë së qelizës së rrjetit | Metoda e rrjetit, madhësia e qelizës zgjidhet për ty |
| Fryrja dhe tkurrja, shtresa sipërfaqësore, thellësitë e asfaltit | Apliko faktorët mbi numrat e raportuar vetë |
| Kostot e transportit falas dhe të tejkaluar, transporti mes aksesh të ndryshëm, gropat e huazimit dhe vendet e mbeturinave të vendosura në plan | Diagrama e transportit masiv me pikat e ekuilibrit, vëllimet e lëvizura dhe distancat mesatare të transportit |

## Rrjetet e tubave

| Ende nuk është ndërtuar | Në vend të kësaj, sot |
|---|---|
| Më shumë se një rrjet për projekt | Projekte të veçanta për stuhinë dhe kanalizimin |
| Tubat e ujit: cilësia dhe mosha e ujit, kontrollet e bazuara në rregulla, lloje të tjera valvulash (kontroll rrjedhe, shtrangulim, mbajtje), pompa të dhëna me fuqi, kërkesë që varet nga presioni, një opsion Darcy–Weisbach, katalog tubash me trashësi muri dhe klasa presioni. Pjesa tjetër e rrjeteve me presion është në laborator: [Tubat e ujit](topic:water-mains) | Kontrollo ato në softuerin e shpërndarjes së ujit; flukset e projektimit të kanalizimit janë te [Flukset e projektimit sanitar](topic:sanitary-design) |
| Rrjedhat e kanalizimit me kalimin e kohës (hidrogramet, drejtimi dinamik, ruajtja, pompat, tejmbushjet) | [Flukset e projektimit sanitar](topic:sanitary-design) jep rrjedhën e pikut të qëndrueshëm që përdor një fletë projektimi |
| Kapaciteti i hyrjeve, shpërndarja e kanalit, drejtimi i retensionit, hidrogramet, humbjet e energjisë përveç një koeficienti kryqëzimi | Kontrollo ato në softuerë të tjerë; rrjedhat, madhësitë dhe vijat e nivelit janë te [Kullimi i stuhive](topic:storm-drainage) |
| Zonat e grumbullimit në grafikun PDF, DWG, DXF ose LandXML; zona grumbullimi nga sipërfaqja (ujëndarëset) | Vizato zonat me dorë; ruhen në skedarin e projektit |
| Katalogë tubash, tuba jo rrethorë, struktura që nuk janë kuti ose cilindra vertikalë (kone, shkallë, gradinë), një kategori kullimi në bibliotekë | Llojet e strukturave nga parametrat ([Rrjeti i tubave](topic:pipe-network)); tuba me diametër |
| Tubat në pamjen e profilit, tuba të lakuar | Lexo kotat e fundit dhe mbulesën në panelin e djathtë |

## Parcelat

| Ende nuk është ndërtuar | Në vend të kësaj, sot |
|---|---|
| Hartimi i lotave sipas sipërfaqes ose fasadës, parcelat nga vijat përreth tyre, e drejta e kalimit | Vizato çdo parcelë sipas këndeve të saj, ose fut matjet e saj |
| Tabela kurbash dhe tabela vijash në plan; etiketat zhvendosen me dorë | Çdo kurs etiketohet përgjatë vetes |
| Parcelat në LandXML | Parcelat ruhen në skedarin e projektit dhe shkojnë në PDF, DWG dhe DXF |

## Traversat

| Ende nuk është ndërtuar | Në vend të kësaj, sot |
|---|---|
| Rregullimi me katrorët më të vegjël, rregulli i tranzitit, peshimi i këndeve kundrejt distancave | Rregulli i busullës |
| Këndet e devijimit, këndet zenitale dhe distancat e pjerrëta, kotat me nivelim trigonometrik | Reduko në distanca dhe kënde horizontale të sakta, ose drejtime |
| Vëzhgime anësore, skedarë të dhënash të papërpunuara nga kolektorët | Importo pikat si skedar pikash |

## Shtyllëzimi

| Ende nuk është ndërtuar | Në vend të kësaj, sot |
|---|---|
| Shtyllat e zhvendosura (pika referimi të vendosura prapa shtyllës), shtyllat e pjerrësisë te pika e kapjes | Vendos shtyllat te zhvendosjet që të duhen, duke përfshirë përtej bankinës |
| Dërgimi i shtyllave drejtpërdrejt në formatin e kolektorit të të dhënave | CSV hapet në softuerin e zyrës së shumicës së kolektorëve të të dhënave |
| Shtyllëzimi i tubave, platformave dhe parcelave | Përdor pika matjeje pranë një aksi rrugor, ose kurset e parcelës |

## Skedarët dhe daljet

| Ende nuk është ndërtuar | Në vend të kësaj, sot |
|---|---|
| Teksti, vijëzimet dhe përmasat nga DWG ose DXF; hapësira e letrës; vizatime të lidhura (xref); DXF binar | Vija nga hapësira e modelit hapen ([Hap një DWG ose DXF si vija](topic:open-dwg-dxf)); hap vizatimet e lidhura veçmas |
| Zhvendosja e disa pikave njëherësh me zvarritje | Pritini dhe ngjitni, ose redakto një nga një |
| Fletë vertikale, bllokje titulli të tua, dritare që rregullon, fletë plani dhe profili në DWG | Një fletë plani horizontale për PDF, ose fletë plani dhe profili përgjatë një aksi rrugor (PDF) |
| Printimi i brezave të kotave dhe profileve | Brezat shihen vetëm në ekran; bëj një pamje ekrani nëse të duhen |
| Ndryshimi i emrave, ngjyrave ose stileve të etiketave të shtresave | Ndrysho ato në një program CAD pas eksportit DXF |
| Ruajtja në re dhe historiku i versioneve | Ruaj skedarët `.civilcraft.json` dhe mbaji të mbështetur; për të punuar bashkë në një projekt, përdor një sesion të drejtpërdrejtë në CadCraft Studio ([Projekto një vend së bashku, drejtpërdrejt](topic:work-live)) |
| CadCraft Studio për iPad dhe iPhone, dhe nga Google Play | Përdor CivilCraft në shfletues në pajisje; në Android, CadCraft Studio instalohet nga APK-ja e tij te getcadcraft.com/download |
| Hapja e disa skedarëve pikash ose projektesh njëherësh | Një skedar për çdo hapje (skedarët GIS që i përkasin njëri-tjetrit, si pjesët e një shapefile, hapen bashkë) |

## Peizazhi

| Ende nuk është ndërtuar | Në vend të kësaj, sot |
|---|---|
| Kokat dhe gryka të prodhuesve | Koka të përgjithshme, ose shto kokat e tua nga një skedar; të dhënat e prodhuesve hyjnë kur ata japin leje |
| Gjatësitë maksimale anësore për vijat e pikimit, rrjedhat me kalimin e kohës, pompat, rrjetet e tubave me unazë | Mbaj vijat e pikimit brenda gjatësisë së publikuar të prodhuesit; kontrolli kërkon një rrjet me degë |
| Konturi i saktë i një objekti të lirë konkav; vëllimi i tij nën tokë i matur saktësisht | Konveksi hull niveluhet dhe vëllimi nën tokë është një vlerësim (thuhet në Vetitë) |
| Bimët në Vendos nga biblioteka të BimCraft dhe ModelCraft | Eksporto IFC të peizazhit dhe hape në BimCraft pranë ndërtesës |
| Modelet e detajuara të bimëve (gjethe, degë, stinë) në pamjen 3D; objekte të lira dhe ujitja në pamjen 3D | Bimët shfaqen në 3D si forma të thjeshta të përmasuara nga lista e bimëve ([Shiko vendin në 3D](topic:site-3d)); shpërndarja e ModelCraft bën pamje mbjelljeje |
| Muret e elementeve të ngurta që mbajnë një nivel të niveluar pas tyre në sipërfaqe | Jepi një platforme ose një pllake anë vertikale: ato janë mure mbajtëse në sipërfaqe ([Nivelimi](topic:grading)) |
| Transformimet SVG në simbolet e tua; teksturat dhe ngjyrat e modeleve GLB të bimëve të tua; gjeometria GLB e ngjeshur | Sheshoji transformimet në programin tënd të vizatimit më parë; modelet vizatohen me ngjyrën e bimës; eksporto GLB pa ngjeshje ([Grafika e bimëve](topic:plant-graphics)) |
| Lista jote e bimëve e mbajtur në llogarinë tënde të Bibliotekës (redaktuar në aplikacion) | Redakto listën e vetë projektit në Tabelën e bimëve dhe ruaje si skedar bimësh |
| Mjetet e peizazhit për asistentët pa dritare (serveri i skedarëve dhe rreshti i komandës) | Punojnë me dritaren e CivilCraft të hapur ([Lëre një asistent AI të punojë me vendin tënd](topic:assistants)) |

## Linjat elektrike

| Ende nuk është ndërtuar | Në vend të kësaj, sot |
|---|---|
| Standardi i një vendi i integruar (rastet e ngarkesës, hapësirat, faktorët) | Vendos vlerat e standardit tënd te {{ui:Rastet e ngarkesës dhe kufijtë…}} dhe ruaji, me bibliotekën tënde, si paketë për ta ripërdorur dhe ndarë ([Paketat](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Distanca anësore nga një përcjellës te kurora e një peme ose një mur pranë linjës | Hapësira vertikale mbi bimët dhe muret që linja kalon ([Kontrollet e linjave elektrike](topic:power-line-checks#clearances)) |
| Zvarritja e përcjellësit dhe shtrirja e një përcjellësi të ri | Lejoje përmes temperaturave në tabelën e tensionimit |
| Vlerësimi termik i kabllove të zhytura (rryma e vlerësuar nga mënyra e shtrirjes) | Shkruaj vlerësimin e rrymës të furnizuesit tënd te elementi i kabllit |
| Studimet e qarkut të shkurtër, mbrojtjes dhe tokëzimit | Përdor një program elektrik të dedikuar; CivilCraft jep gjatësitë dhe kabllot e rrjetit |
| Kullat rrjetë të projektuara anëtar për anëtar, dhe spiranca të ankoruara në tokë | Mbështetëset kontrollohen sipas ngarkesës nominale; spiranca sipas ngarkesës së vlerësuar |
| Një skedar studimi `.DON` i kontrolluar në programin që e lexon | Kontrollo skedarin atje; na dërgo një mostër që ta testojmë me një skedar real |
| Linjat elektrike në pamjen 3D dhe në IFC | Plani, profili i linjës, fletët dhe shtresat GIS |
| Mjetet e linjave elektrike për asistentët pa dritare | Punojnë me dritaren e CivilCraft të hapur ([Lëre një asistent AI të punojë me vendin tënd](topic:assistants)) |

## Masat e ndërtesave

| Ende nuk është ndërtuar | Në vend të kësaj, sot |
|---|---|
| Një bibliotekë kodesh zonimi ose rregullash të ndonjë qyteti | Shkruaj kufijtë nga rregullorja jote ([Kufijtë e zonimit](topic:zoning-limits)) |
| Drita e qiellit mbi muret (drita e fasadës), era | [Orët e diellit](topic:sun-hours) numëron vetëm diellin e drejtpërdrejtë |
| Hija nga pemët, bimët ose çdo gjë që nuk është vizatuar si masë | Vizato ndërtesat fqinje si masa |
| Format e çative mbi masat | Masa me majë të sheshtë |
| Hapjet, çatitë dhe llojet e mureve kur një masë zhvillohet në BimCraft | BimCraft ndërton mure të jashtme të thjeshta në çdo kat dhe një dysheme; shto pjesën tjetër atje |

## GIS dhe sistemet e koordinatave

| Ende nuk është ndërtuar | Në vend të kësaj, sot |
|---|---|
| File Geodatabase; stilet KML, ikonat, mbivendosjet e tokës dhe lidhjet e rrjetit | Konverto në GeoPackage, shapefile ose GeoJSON më parë; shenjat KML lexohen pa stilet e tyre |
| Redaktimi i elementeve GIS ose atributeve të tyre | Redakto ato në një program GIS dhe importo përsëri. Paneli Analizo krijon shtresa të reja (buffer, mbivendosje, bashkim, përzgjedhje) dhe shton fusha sipërfaqeje dhe gjatësie, por nuk redakton një element në vend |
| Analiza e rrjetit dhe raster, buffer me skaje të sheshta ose katrore dhe buffer njëanshme, shtimi ose fshirja e rreshtave dhe ndryshimi i llojit të një fushe në tabelën e atributeve, ngjyra manuale të klasave, legjendë stili në grafikë | Përdor Përzgjidh për të zgjedhur elementet dhe për të bërë një shtresë prej tyre; skajet e sheshta nuk ofrohen. Ngjyrosja sipas atributit dhe tabela e atributeve janë ndërtuar: shih [Stilo një shtresë sipas një atributi](topic:gis-symbology) dhe [Puno me tabelën e atributeve të një shtrese](topic:gis-table) |
| Stilet e etiketave (madhësia, vendosja) dhe etiketat që shmangin njëra-tjetrën | Etiketat kanë një madhësi dhe mund të mbivendosen aty ku elementet janë të dendura |
| Datumet vertikale dhe modelet e gjeoidit | Kotat përdoren ashtu si i jep skedari; kontrollo vetë datumin vertikal |
| Zhvendosjet e rrjetit përveç NAD83 nga NAD27 të sugjeruara sipas zonës (OSTN15, NTv2 për datume të tjera funksionojnë kur shton skedarin), disa rrjete njëherësh, rrjete vertikale | Shto vetë skedarin e rrjetit për datumin tënd; një rrjet për projekt |
| Shtresat e hartës në DXF ose në eksportet 3D | Shtresat e hartës shkojnë në grafikun PDF, dhe pranë DWG si imazh |
| Serverët e hartave që kërkojnë hyrje, çelës ose token | Përdor shërbime publike, ose një skedar imazhi të georeferencuar |
| Shkrimi i skedarëve LAS ose LAZ nga një sipërfaqe, modeli i terrenit ose mjetet e rrjetit të kotave dhe LiDAR | Eksporto sipërfaqet si rrjet kotash GeoTIFF. Shtojca [Retë e pikave](topic:point-clouds) shkruan një re të pastruar si LAS 1.4 ose LAZ |
| Intensiteti, ngjyra dhe kthimet LiDAR; rrjetet e kotave me disa brez; skedarë rrjeti ose LiDAR mbi 200 MB | LiDAR filtrohet vetëm sipas klasës, rrjetet përdorin brezin e parë; pritini skedarët e mëdhenj në pjesë më parë |

## Hyrja

| Ende nuk është ndërtuar | Në vend të kësaj, sot |
|---|---|
| Përzgjedhja me kuti me prekje (kërkon {{key:Shift}}) | Shtyp gjatë çdo pike matjeje për ta shtuar |
| Koordinata ose distanca të shkruara gjatë vizatimit | Vizato përafërsisht, pastaj shkruaj koordinatat e sakta të PI në tabelën e PI të aksit rrugor |
| Shkrimi i koordinatave për këndet e platformave dhe strukturat | Zvarrit dorezat e tyre; zmadho për saktësi dhe shiko E dhe N në shiritin e statusit |
| Kapja te objektet (përveç pikave të matjes për vijat e thyerjes) | Zmadho dhe shiko shiritin e statusit |

## Pamja 3D

| Ende nuk është ndërtuar | Në vend të kësaj, sot |
|---|---|
| Vizatimi ose redaktimi në pamjen 3D | Vizato dhe redakto në plan; pamja 3D ndjek çdo redaktim |
| Përzgjedhja e vijave karakteristike të koridorit ose elementeve GIS duke klikuar në 3D | Kliko ato në plan |
| Eksporti i pamjes së zmadhuar ose në këmbë | Eksportet janë në shkallë reale, në metra; shih [Eksporto vendin në 3D](topic:export-3d) |
| Etiketat në eksportet GLB ose OBJ, madhësitë dhe stilet e etiketave në 3D | Etiketat shfaqen vetëm në pamjen 3D, në një madhësi; shih [Shiko vendin në 3D](topic:site-3d) |
| Tekstura nga fotografitë, regjistrimi i një udhëtimi si video, hijet nga përtej vendit, orët e diellit të shfaqura në pamjen 3D | Shtresat e hartës të vendosura mbi sipërfaqet; udhëto dhe pozicioni i diellit në një kohë; [orët e diellit](topic:sun-hours) për një ditë ose stinë në plan |
