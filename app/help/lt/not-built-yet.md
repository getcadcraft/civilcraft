---
title: Dar neįgyvendinta
summary: Ko šis CivilCraft leidimas dar nedaro ir ką šiandien daryti vietoj to.
keywords: trūkstama, apribojimai, veiklos planas, nepasiekiama, spiralės, praplatinimai, dwg, dxf, įtakos šuliniai, sulaikymas, skerspjūviai, vėliau, ribos
from: a2d970ef
---

CivilCraft yra ankstyvoje stadijoje. Šiame puslapyje išvardyta, ko dabartinis leidimas nedaro, kad neieškotumėte to. Nieko čia nurodyto nežadama jokiai datai.

## Taškai

| Dar neįgyvendinta | Vietoj to, šiandien |
|---|---|
| Antro taškų failo pridėjimas prie pirmojo | Pirmiausia sujunkite failus teksto redaktoriuje arba skaičiuoklėje |
| Taškų teksto failo eksportavimas | Eksportuokite LandXML (taškai išeina kaip CgPoints), naudokite GIS {{ui:Eksportuoti}} (taškai su P, N, E, Z ir D laukais) arba {{ui:Kopijuoti}} taškus į skaičiuoklę |
| Taškų etikečių stiliai, simboliai pagal aprašo raktą, kreivės (lankai) iš linijų kodų, aprašo raktų failas, kurį galima bendrinti tarp projektų | Etiketės rodo numerį, aukštį ir aprašą arba mažiau ([CivilCraft parametrai](topic:settings)); raktai saugomi projekto faile |
| Vienetų konvertavimas | Prieš importuodami konvertuokite failą; **Vienetai** tik pakeičia žymėjimą |

## Paviršiai

| Dar neįgyvendinta | Vietoj to, šiandien |
|---|---|
| Daugiau nei vienas paviršius, sukurtas iš taškų | Vienas projektas vienam paviršiui |
| Paslėpti (vidines) ribas | Naudokite **Ilgiausia išorinė riba** arba išorinę ribą |
| Pasirinkti arba redaguoti vieną nubrėžtą lūžio liniją | {{key:Mod+Z}} arba {{ui:Pašalinti nubrėžtas lūžio linijas}} ir nubrėžkite iš naujo |
| Redaguoti paviršių, nuskaitytą iš LandXML (lūžio linijos, riba) | {{ui:Atkurti paviršių iš taškų}} |
| Redaguoti paviršių, sukurtą iš aukščių tinklelio | Importuokite tinklelį iš naujo su kitais pasirinkimais |
| Konvertuoti paviršių, nuskaitytą iš LandXML, kai keičiasi koordinačių sistema | Pirmiausia {{ui:Atkurti paviršių iš taškų}} |
| Pažymėti taškiniai aukščiai ir nuolydžio reikšmės | Skaitykite jas būsenos juostoje arba nuspalvinkite paviršių pagal nuolydį su **Nuolydžio analizė** kraštovaizdžio darbo srityje ([Kraštovaizdžio formavimas](topic:landscape-grading#grading-checks)) |

## Trasos ir profiliai

| Dar neįgyvendinta | Vietoj to, šiandien |
|---|---|
| Spiralės, kitos nei klotoidė; spiralė tarp dviejų kreivių (sudėtinės pereinamosios kreivės) | Klotoidinės spiralės kreivių galuose yra; kitos įvardijamos ir praleidžiamos importuojant LandXML |
| Įterpti PI tarp dviejų kitų | Nubrėžkite trasą iš naujo arba perrašykite PI koordinates |
| Trasos iš objektų, poslinkiai, praplatinimai | Braižykite pagal PI |
| Įvedant K vertikaliai kreivei | Įveskite L (K rodoma) |
| Apskritiminės ir nesimetrinės vertikalios kreivės | Tik simetrinės parabolinės kreivės |
| Daugiau nei vienas projektinis profilis trasai | Viena trasa kiekvienam variantui |
| Profilio vaizdo keitimas mastelio, profilio juostos po profiliu | Profilio vaizdas telpa visai trasai; spausdinkite ją [planų ir profilių lapuose](topic:plan-profile-sheets) |
| Pjūviai DWG ar LandXML | Pjūvių lapai kaip PDF; {{ui:CSV}} plotų ir tūrių |
| Matavimo linijos kampu arba skirtingo pločio palei kelią | Vienas plotis kiekvienai pusei visai trasai |

## Koridoriai

| Dar neįgyvendinta | Vietoj to, šiandien |
|---|---|
| Vidurinės juostos, barjerai ir virštakas, kuris pasuka šablonus | Braižykite juos kaip šablonus ([Koridoriaus šablonai](topic:corridor-templates)); šablonai pagal stotį dar nepriima virštako |
| Laipsniškas pereinamasis pokytis tarp dviejų regionų šablonų (pereinamosios zonos, siaurėjimai) | Keiskite šabloną stotyje arba duokite taškui pločio tikslą linijai, nubrėžtai kaip siaurėjimas |
| Sukimas apie kraštą, virštakas LandXML | Virštakas sukasi apie ašį apskritiminėse kreivėse; praplatinkite juostą pločio tikslu charakteringai linijai |
| Šlaitų tikslai (dienos šviesa iki linijos ar paviršiaus), savi koridorių paviršiai | Tikslai perkelia dangos ir kelkraščių kraštus ([Koridoriai](topic:corridor)); koridorius suformuojamas į projektinį paviršių |
| Koridoriai eksportuojami kaip LandXML keliai; antras koridorius trasai IFC eksporte | Eksportuojamas projektinis paviršius |
| Reljefo šablonai, keičiantys projektinį paviršių, 3D vaizde ar pjūviuose | Jie pateikia kiekvieno sluoksnio plotus ir tūrius ([Reljefo šablonai](topic:corridor-templates#terrain-templates)) |
| Važiavimo trajektorijos su greičiu, padangų slydimu, vairavimo laiku, vairuojamomis priekabomis ar kėbulo laisva erdve; standartinių projektinių transporto priemonių biblioteka; apsisukimo trajektorija, nubrėžta vilkiant transporto priemonę | Mažo greičio apsisukimo trajektorijos palei charakteringą liniją ar trasą, su jūsų pačių transporto priemonių dydžiais ([Transporto priemonių apsisukimo trajektorijos](topic:swept-paths)) |

## Formavimas ir tūriai

| Dar neįgyvendinta | Vietoj to, šiandien |
|---|---|
| Suoliukai, atviros charakteringos linijos, įformuotos į projektą, formavimas iki charakteringos linijos iš kitur | Uždarykite charakteringą liniją ([Charakteringos linijos](topic:feature-lines)) arba naudokite ją kaip esamo grunto lūžio liniją |
| Charakteringos linijos viršūnės įterpimas ar šalinimas | Nubrėžkite liniją iš naujo arba padarykite jos laipsniuotą poslinkį |
| Lankai nubrėžtose lūžio linijose (per geodezinius taškus), spiralės charakteringose linijose | Nubrėžkite charakteringą liniją su lankais ir naudokite ją kaip esamo grunto lūžio liniją |
| Formavimas iki atstumo, aukščio ar kito paviršiaus | Dienos šviesa tik iki esamo grunto |
| Aikštelės kampo pridėjimas ar šalinimas | Ištrinkite aikštelę ir nubrėžkite iš naujo |
| TIN į TIN (prizmių) tūriai, tinklelio langelio dydžio pasirinkimas | Tinklelio metodas, langelio dydis parenkamas automatiškai |
| Patinimas ir susitraukimas, dirvos viršutinis sluoksnis, dangos storiai | Patys pritaikykite koeficientus pateiktiems skaičiams |
| Išvežimo ir pervežimo sąnaudos, pervežimas tarp skirtingų trasų, skolinimosi ir atliekų vietos plane | Masių pervežimo diagrama su balanso taškais, perkeltais tūriais ir vidutiniais pervežimo atstumais |

## Vamzdynų tinklai

| Dar neįgyvendinta | Vietoj to, šiandien |
|---|---|
| Daugiau nei vienas tinklas projekte | Atskiri projektai lietaus ir buitinėms nuotekoms |
| Vandentiekio magistralės: vandens kokybė ir amžius, taisyklėmis pagrįsti valdymai, kiti vožtuvų tipai (srauto reguliavimo, droselinis, palaikantis), siurbliai pagal galią, paklausa, priklausanti nuo slėgio, Darcy–Weisbach parinktis, vamzdžių katalogas su sienelių storiais ir slėgio klasėmis. Likusi slėgio tinklų dalis yra laboratorijoje: [Vandentiekio magistralės](topic:water-mains) | Tai tikrinkite vandens tiekimo programinėje įrangoje; buitinių nuotekų projektiniai srautai yra [Buitinių nuotekų projektiniai srautai](topic:sanitary-design) |
| Nuotekų srautai laike (hidrografai, dinaminis maršrutavimas, talpos, siurbliai, perpildymai) | [Buitinių nuotekų projektiniai srautai](topic:sanitary-design) pateikia nuolatinį didžiausią srautą, kurį naudoja projekto lapas |
| Įtakos pajėgumas, griovelio plitimas, sulaikymo maršrutavimas, hidrografai, energijos nuostoliai, išskyrus vieno mazgo koeficientą | Tikrinkite juos kitoje programinėje įrangoje; srautai, dydžiai ir hidrauliniai lygiai yra [Lietaus nuotekos](topic:storm-drainage) |
| Baseinai PDF spausdinyje, DWG, DXF ar LandXML; baseinai iš paviršiaus (vandens telkiniai) | Braižykite baseinus ranka; jie išsaugomi projekto faile |
| Vamzdžių katalogai, nenuapvalinti vamzdžiai, konstrukcijos, kurios nėra stačios dėžės ar cilindrai (kūgiai, laiptai, pakopos), lietaus nuotekų kategorija bibliotekoje | Konstrukcijų tipai pagal parametrus ([Vamzdynų tinklas](topic:pipe-network)); vamzdžiai su skersmeniu |
| Vamzdžiai profilio vaizde, išlenkti vamzdžiai | Dugnų aukščius ir gilumą skaitykite dešiniajame skydelyje |

## Sklypai

| Dar neįgyvendinta | Vietoj to, šiandien |
|---|---|
| Lotų išdėstymas pagal plotą ar fasadą, sklypai pagal aplink juos esančias linijas, važiavimo teisė | Nubrėžkite kiekvieną sklypą pagal jo kampus arba įveskite jo kontūrus |
| Kreivių lentelės ir linijų lentelės plane; etiketės perkeltos ranka | Kiekvienas ruožas pažymėtas palei save |
| Sklypai LandXML | Sklypai išsaugomi projekto faile ir eina į PDF, DWG ir DXF |

## Poligonai

| Dar neįgyvendinta | Vietoj to, šiandien |
|---|---|
| Mažiausių kvadratų korekcija, transito taisyklė, kampų svorinimas pagal atstumus | Kompaso taisyklė |
| Nukrypimo kampai, zenito kampai ir įstrižiniai atstumai, aukščiai trigonometriniu nivelavimu | Redukuokite į horizontalius atstumus ir kampus teisingai arba į kryptis |
| Šoniniai taškai, neapdoroti duomenų failai iš duomenų rinktuvų | Importuokite taškus kaip taškų failą |

## Kuolelių žymėjimas

| Dar neįgyvendinta | Vietoj to, šiandien |
|---|---|
| Atitraukti kuoliukai (atskaitos taškai, nustatyti atgal nuo kuoliuko), šlaitų kuoliukai prie gaudymo taško | Žymėkite kuoliukus reikiamais poslinkiais, įskaitant už kelkraščio |
| Kuoliukų siuntimas tiesiai į duomenų rinktuvo formatą | CSV atsidaro daugumos duomenų rinktuvų biuro programinėje įrangoje |
| Vamzdynų, aikštelių ir sklypų žymėjimas kuoliukais | Naudokite geodezinius taškus šalia trasos arba sklypo ruožus |

## Failai ir išvestis

| Dar neįgyvendinta | Vietoj to, šiandien |
|---|---|
| Tekstas, brūkšniuotės ir matmenys iš DWG ar DXF; popierinė erdvė; susieti brėžiniai (xref); dvejetainis DXF | Modelio erdvės linijų grafika atsidaro ([Atidaryti DWG ar DXF kaip linijų grafiką](topic:open-dwg-dxf)); susietus brėžinius atidarykite atskirai |
| Kelių taškų perkėlimas vienu metu vilkiant | Iškirpkite ir įklijuokite juos arba redaguokite po vieną |
| Portretiniai lapai, jūsų pačių antraščių blokai, jūsų išdėstomi vaizdo langai, planų ir profilių lapai DWG | Vienas horizontalus planų lapas viename PDF arba planų ir profilių lapai palei trasą (PDF) |
| Aukščių juostų ir profilių spausdinimas | Juostos rodomos tik ekrane; jei jų reikia, padarykite ekrano kopiją |
| Sluoksnių pavadinimų, spalvų ar etikečių stilių keitimas | Keiskite juos CAD programoje po DXF eksporto |
| Debesijos saugojimas ir versijų istorija | Išsaugokite `.civilcraft.json` failus ir turėkite jų atsargines kopijas; norėdami dirbti su vienu projektu kartu, naudokite tiesioginę sesiją CadCraft Studio ([Projektuokite vieną objektą kartu tiesiogiai](topic:work-live)) |
| CadCraft Studio iPad ir iPhone, taip pat iš Google Play | Naudokite CivilCraft naršyklėje savo įrenginyje; Android sistemoje CadCraft Studio įdiegiamas iš savo APK getcadcraft.com/download |
| Keli taškų ar projekto failai vienu metu | Vienas failas vienam atidarymui (GIS failai, kurie priklauso kartu, pavyzdžiui, shapefile dalys, atsidaro kartu) |

## Kraštovaizdis

| Dar neįgyvendinta | Vietoj to, šiandien |
|---|---|
| Gamintojų galvutės ir purkštukai | Bendrosios galvutės arba pridėkite savo galvutes iš failo; gamintojų duomenys įtraukiami, kai jie suteikia leidimą |
| Didžiausi šoniniai ilgiai lašinimo linijoms, srautai laike, siurbliai, uždaro ciklo vamzdynų tinklai | Lašinimo linijas laikykite pagal gamintojo paskelbtą ilgį; patikrinimui reikalingas šakotas tinklas |
| Tikslus įgaubto laisvos formos objekto kontūras; jo tūris žemiau žemės išmatuotas tiksliai | Formuojamas iškilasis apvalkalas, o tūris žemiau žemės yra apytikslis (nurodyta Ypatybėse) |
| Augalai iš BimCraft ir ModelCraft savo Vietos iš bibliotekos | Eksportuokite kraštovaizdžio IFC ir atidarykite jį BimCraft šalia pastato |
| Išsamūs augalų modeliai (lapai, šakos, sezonai) 3D vaizde; laisvos formos objektai ir laistymas 3D vaizde | Augalai 3D vaizde rodomi kaip paprastos formos, pagal augalų sąrašą ([Žiūrėti vietą 3D](topic:site-3d)); ModelCraft sklaidos įrankis kuria sodinimo vaizdus |
| Kietųjų paviršių sienos, laikančios išlygintą lygį už jų paviršiuje | Suteikite platformai ar aikštelei vertikalias puses: jos yra atraminės sienos paviršiuje ([Formavimas](topic:grading)) |
| SVG transformacijos jūsų simboliuose; jūsų GLB augalų modelių tekstūros ir spalvos; suspausta GLB geometrija | Pirmiausia sulyginkite transformacijas savo brėžinių programoje; modeliai nupiešiami augalo spalva; eksportuokite GLB be suspaudimo ([Augalų grafika](topic:plant-graphics)) |
| Jūsų pačių augalų sąrašas, saugomas bibliotekos paskyroje (redaguojamas programėlėje) | Redaguokite projekto sąrašą augalų lentelėje ir įrašykite jį kaip augalų failą |
| Kraštovaizdžio įrankiai asistentams be lango (failų serveris ir komandų eilutė) | Jie veikia, kai CivilCraft langas atidarytas ([Leiskite DI asistentui dirbti su jūsų vieta](topic:assistants)) |

## Elektros linijos

| Dar neįgyvendinta | Vietoj to, šiandien |
|---|---|
| Šalies standartas įtrauktas (apkrovų atvejai, laisvi tarpai, koeficientai) | Nustatykite savo standarto vertes {{ui:Apkrovų atvejai ir ribos…}} ir išsaugokite jas su savo biblioteka kaip paketą, kurį galėsite panaudoti ir bendrinti ([Paketai](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Šoninis atstumas nuo laido iki medžio lajos ar sienos šalia linijos | Vertikalus laisvas tarpas virš augalų ir sienų, kertamų linijos ([Elektros linijų patikros](topic:power-line-checks#clearances)) |
| Laidų šliaužimas ir naujo laido tempimas | Įskaičiuokite juos per temperatūras tempimo lentelėje |
| Šiluminis įkrovimas požeminiams kabeliams (srovės įkrova pagal tai, kaip jie klojami) | Įveskite savo tiekėjo srovės įkrovą kabelio elemente |
| Trumpojo jungimo, apsaugos ir įžeminimo tyrimai | Naudokite specializuotą elektros programą; CivilCraft pateikia tinklo ilgius ir kabelius |
| Grotelinės bokštai, suprojektuoti narys po nario, ir tvirtinimo trosai grunte | Atramos tikrinamos pagal nominalią apkrovą; tvirtinimo trosai pagal nominalią apkrovą |
| `.DON` tyrimo failas, tikrinamas programoje, kuri jį skaito | Patikrinkite failą ten; atsiųskite mums pavyzdį, kad galėtume išbandyti su tikru |
| Elektros linijos 3D vaizde ir IFC | Planas, linijos profilis, lapai ir GIS sluoksniai |
| Elektros linijų įrankiai asistentams be lango | Jie veikia, kai CivilCraft langas atidarytas ([Leiskite DI asistentui dirbti su jūsų vieta](topic:assistants)) |

## Pastatų masės

| Dar neįgyvendinta | Vietoj to, šiandien |
|---|---|
| Zonavimo kodų ar bet kurio miesto taisyklių biblioteka | Įveskite ribas iš savo savivaldybės potvarkio ([Zonavimo ribos](topic:zoning-limits)) |
| Šviesa per sienas (fasado dienos šviesa), vėjas | [Saulės valandos](topic:sun-hours) skaičiuoja tik tiesioginę saulę |
| Šešėliai nuo medžių, augalų ar bet ko, nenupiešto kaip masė | Nubrėžkite gretimus pastatus kaip mases |
| Stogų formos masėse | Plokščiai viršutinės masės |
| Angos, stogai ir sienų tipai, kai masė kuriama BimCraft | BimCraft pastato paprastas išorines sienas kiekviename aukšte ir perdangą; likusius pridėkite ten |

## GIS ir koordinačių sistemos

| Dar neįgyvendinta | Vietoj to, šiandien |
|---|---|
| File Geodatabase; KML stiliai, piktogramos, žemės uždėjimai ir tinklo ryšiai | Pirmiausia konvertuokite į GeoPackage, shapefile ar GeoJSON; KML žymos skaitomos be jų stilių |
| GIS objektų ar jų atributų redagavimas | Redaguokite juos GIS programoje ir importuokite iš naujo. Analizės skydelis sukuria naujus sluoksnius (buferis, sutapimas, sujungimas, pasirinkimas) ir prideda plotų ir ilgių laukus, bet neredaguoja objekto vietoje |
| Tinklo ir rastrų analizė, buferiai su plokščiais ar kvadratiniais galais ir vienpusiai buferiai, eilučių pridėjimas ar šalinimas bei lauko tipo keitimas atributų lentelėje, rankinės klasių spalvos, stiliaus legenda spausdiniuose | Pasirinkite objektus įrankiu Pasirinkti ir sukurkite iš jų sluoksnį; plokščių galų nėra. Spalvinimas pagal atributą ir atributų lentelė jau įgyvendinti: žr. [Sluoksnio stilius pagal atributą](topic:gis-symbology) ir [Darbas su sluoksnio atributų lentele](topic:gis-table) |
| Etikečių stiliai (dydis, išdėstymas) ir etiketės, kurios vengia viena kitos | Etiketės yra vieno dydžio ir gali persidengti, kai objektai tankūs |
| Vertikalieji duomenys ir geoidų modeliai | Aukščiai naudojami taip, kaip juos pateikia failas; vertikalius duomenis patikrinkite patys |
| Tinklelio poslinkiai, išskyrus NAD27 į NAD83 pagal sritį (OSTN15, NTv2 kitiems duomenims veikia, kai pridedate failą), keli tinkleliai vienu metu, vertikalieji tinkleliai | Patys pridėkite tinklelio failą savo duomenims; vienas tinklelis projektui |
| Žemėlapio sluoksniai DXF ar 3D eksportuose | Žemėlapio sluoksniai patenka į PDF spausdinį, o šalia DWG – kaip paveikslėlis |
| Žemėlapių serveriai, kuriems reikia prisijungimo, rakto ar prieigos žymens | Naudokite viešąsias paslaugas arba georeferencinį paveikslėlio failą |
| LAS ar LAZ failų rašymas iš paviršiaus, grunto modelio ar aukščių tinklelio ir LiDAR įrankių | Eksportuokite paviršius kaip GeoTIFF aukščių tinklelį. [Taškų debesys](topic:point-clouds) priedas rašo išvalytą debesį kaip LAS 1.4 ar LAZ |
| LiDAR intensyvumas, spalva ir grąžinimai; aukščių tinkleliai su keliomis juostomis; tinkleliai ar LiDAR failai didesni nei 200 MB | LiDAR filtruojamas tik pagal klasę, tinkleliai naudoja pirmą juostą; dideles bylas pirmiausia supjaustykite į plyteles |

## Įvestis

| Dar neįgyvendinta | Vietoj to, šiandien |
|---|---|
| Pasirinkimo rėmelis liečiant (reikia {{key:Shift}}) | Ilgai spauskite kiekvieną geodezinį tašką, kad jį pridėtumėte |
| Įvedamos koordinatės ar atstumai braižant | Nubrėžkite apytiksliai, tada įveskite tikslias PI koordinates trasos PI lentelėje |
| Įvedamos koordinatės sklypų kampams ir konstrukcijoms | Vilkite jų rankenėles; priartinkite tikslumui ir stebėkite E ir N būsenos juostoje |
| Prisitraukimas prie objektų (išskyrus geodezinius taškus lūžio linijoms) | Priartinkite ir stebėkite būsenos juostą |

## 3D vaizdas

| Dar neįgyvendinta | Vietoj to, šiandien |
|---|---|
| Braižymas ar redagavimas 3D vaizde | Braižykite ir redaguokite plane; 3D vaizdas seka kiekvieną pakeitimą |
| Koridorių charakteringų linijų ar GIS objektų pasirinkimas spustelėjant 3D vaizde | Spustelėkite juos plane |
| Eksportuojamas išvaizdos perdėtas vaizdas ar pėdomis | Eksportai tiksliu mastu metrais; žr. [Eksportuoti vietą 3D](topic:export-3d) |
| Etiketės GLB ar OBJ eksportuose, etikečių dydžiai ir stiliai 3D vaizde | Etiketės rodomos tik 3D vaizde, vieno dydžio; žr. [Žiūrėti vietą 3D](topic:site-3d) |
| Tekstūros iš nuotraukų, važiavimo įrašymas į vaizdo įrašą, šešėliai iš už vietos ribų, saulės valandos 3D vaizde | Žemėlapio sluoksniai uždėti ant paviršių; važiavimas ir saulės padėtis vienu metu; [saulės valandos](topic:sun-hours) dienai ar sezonui plane |
