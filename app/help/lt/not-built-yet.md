---
title: Dar neįgyvendinta
summary: Ko šiuo CivilCraft leidimu dar nedaroma ir ką šiandien daryti vietoje.
keywords: trūksta, apribojimai, veiklos planas, nepasiekiama, spiralės, platinimas, dwg, dxf, įtekėjimo angos, sulaikymas, skersiniai pjūviai, bus vėliau, ribos
from: b91588d4
---

CivilCraft dar naujas. Šiame puslapyje išvardyta, ko dabartinė versija nedaro, kad to nesiektumėte. Čia nieko nežadama įvykdyti tam tikru terminu.

## Taškai

| Dar neįgyvendinta | Vietoje to, šiandien |
|---|---|
| Antro taškų failo pridėjimas prie pirmojo | Pirma sujunkite failus teksto redaktoriuje arba skaičiuoklėje |
| Taškų teksto failo eksportas | Eksportuokite LandXML (taškai išeina kaip CgPoints), naudokite GIS {{ui:Eksportuoti}} (taškai su P, N, E, Z ir D laukais) arba {{ui:Kopijuoti}} taškus į skaičiuoklę |
| Taškų žymų stiliai, simboliai pagal aprašymo raktą, kreivės (lankai) pagal linijų kodus, aprašymo raktų failas, kurį bendrinti tarp projektų | Žymose rodomas numeris, aukštis ir aprašymas arba mažiau ([CivilCraft nustatymai](topic:settings)); raktai saugomi projekto faile |
| Vienetų konvertavimas | Konvertuokite failą prieš importuodami; **Vienetai** tik perženklina |

## Paviršiai

| Dar neįgyvendinta | Vietoje to, šiandien |
|---|---|
| Daugiau nei vienas paviršius, sukurtas iš taškų | Vienas projektas vienam paviršiui |
| Vidinių ribų paslėpimas | Naudokite **Ilgiausią išorinį kraštą** arba išorinę ribą |
| Vienos nubrėžtos lūžio linijos pasirinkimas ar redagavimas | {{key:Mod+Z}} arba {{ui:Pašalinti nubrėžtas lūžio linijas}} ir nubrėžti iš naujo |
| Paviršiaus, nuskaityto iš LandXML (lūžio linijos, riba), redagavimas | {{ui:Atkurti paviršių iš taškų}} |
| Paviršiaus, sukurto iš aukščių tinklelio, redagavimas | Importuokite tinklelį iš naujo su kitais pasirinkimais |
| Paviršiaus, nuskaityto iš LandXML, konvertavimas, kai keičiasi koordinačių sistema | Pirmiausia {{ui:Atkurti paviršių iš taškų}} |
| Pažymėti taškiniai aukščiai ir nuolydžių reikšmės | Skaitykite juos būsenos juostoje arba nuspalvinkite paviršių pagal nuolydį su **Nuolydžio analizė** Kraštovaizdžio darbo srityje ([Kraštovaizdžio nuolydžiai](topic:landscape-grading#grading-checks)) |

## Trasos ir profiliai

| Dar neįgyvendinta | Vietoje to, šiandien |
|---|---|
| Spiralės, kitos nei klotoidė; spiralė tarp dviejų kreivių (sudėtiniai pereinamieji ruožai) | Klotoidinės spiralės kreivių galuose yra; kitos pavadinamos ir praleidžiamos importuojant LandXML |
| PI įterpimas tarp dviejų kitų | Nubrėžkite trasą iš naujo arba iš naujo įveskite PI koordinates |
| Trasos iš objektų, poslinkių, platinimų | Braižykite pagal PI |
| Vertikaliosios kreivės K įvedimas | Įveskite L (K rodomas) |
| Apskritiminės ir nesimetrinės vertikaliosios kreivės | Tik simetrinės parabolinės kreivės |
| Daugiau nei vienas projektinis profilis trasai | Viena trasa vienam variantui |
| Profilio rodinio mastelio keitimas, profilio juostos po profiliu | Profilio rodinys telpa visą trasą; spausdinkite jį [plano ir profilio lapuose](topic:plan-profile-sheets) |
| Pjūviai DWG ar LandXML | Pjūvių lapai PDF; {{ui:CSV}} plotų ir tūrių |
| Mėginių linijos kampu arba skirtingų pločių palei kelią | Vienas plotis kiekvienai pusei visai trasai |

## Koridoriai

| Dar neįgyvendinta | Vietoje to, šiandien |
|---|---|
| Vidurio juostos, barjerai ir superelevacija, kuri pasuka šablonus | Nubrėžkite juos kaip šablonus ([Koridoriaus šablonai](topic:corridor-templates)); šablonai pagal stacionažą dar nepriima superelevacijos |
| Palaipsnis pakeitimas tarp dviejų regionų šablonų (pereinamieji ruožai, susiaurėjimai) | Pakeiskite šabloną stacionaže arba suteikite taškui pločio tikslą linijai, nubrėžtai kaip susiaurėjimas |
| Sukimas apie kraštą, superelevacija LandXML | Superelevacija sukasi apie ašį apskritiminėse kreivėse; platinkite juostą pločio tikslu iki charakteristinės linijos |
| Šoninių šlaitų tikslai (ribinė linija iki linijos ar paviršiaus), savi koridorių paviršiai | Tikslai perkelia dangos kraštus ir pakraščius ([Koridoriai](topic:corridor)); koridorius suvedamas į projektuojamą paviršių |
| Bordiūrų lankai, posūkio juostos ir salelės, suvedamos į sankryžą; šoninio kelio galas, nupjautas iki pagrindinio kelio krašto įstrižai; takas, sujungtas su keliu plane, jo ilgyje ir plote | Keliai, kurie susitinka, sujungiami statmenai, pagrindinio kelio kraštas atveriamas, o šoninis kelias prijungiamas prie jo ([Kur keliai susitinka](topic:corridor#where-roads-meet-roads-pads-and-paths)); takas sustoja ties kelio kraštu projektuojamame paviršiuje ir 3D |
| Koridoriai, eksportuojami kaip LandXML keliai; antras koridorius trasoje IFC eksporte | Eksportuojamas projektuojamas paviršius |
| Reljefo šablonai, keičiantys projektuojamą paviršių 3D ar pjūviuose | Jie pateikia kiekvieno sluoksnio plotus ir tūrius ([Reljefo šablonai](topic:corridor-templates#terrain-templates)) |
| Važiavimo kreivės su greičiu, padangų slydimu, vairavimo laiku, vairuojamomis priekabomis ar kėbulo tarpu; standartinių projektinių transporto priemonių biblioteka; važiavimo kreivė, braižoma tempiant transporto priemonę | Mažo greičio važiavimo kreivės palei charakteristinę liniją ar trasą su jūsų transporto priemonės matmenimis ([Transporto priemonių važiavimo kreivės](topic:swept-paths)) |

## Suvedimas ir apimtys

| Dar neįgyvendinta | Vietoje to, šiandien |
|---|---|
| Laiptai (bermos), atviros charakteristinės linijos, suvedamos į projektą, suvedimas iki charakteristinės linijos iš kitur | Uždarykite charakteristinę liniją ([Charakteristinės linijos](topic:feature-lines)) arba naudokite ją kaip esamo grunto lūžio liniją |
| Charakteristinės linijos viršūnės įterpimas ar šalinimas | Nubrėžkite liniją iš naujo arba padarykite jos laiptuotą poslinkį |
| Lankai nubrėžtose lūžio linijose (per matavimo taškus), spiralės charakteristinėse linijose | Nubrėžkite charakteristinę liniją su lankais ir naudokite ją kaip esamo grunto lūžio liniją |
| Suvedimas iki atstumo, aukščio ar kito paviršiaus | Tik ribinis suvedimas iki esamo grunto |
| Aikštelės kampo pridėjimas ar šalinimas | Ištrinkite aikštelę ir nubrėžkite iš naujo |
| TIN–TIN (prizmių) tūriai, tinklelio langelio dydžio pasirinkimas | Tinklelio metodas, langelio dydis parenkamas automatiškai |
| Brinkimas ir traukimasis, dirvožemis, dangos gyliai | Patys taikykite koeficientus pateiktiems skaičiams |
| Nemokamo ir papildomo vežimo kainos, vežimas tarp skirtingų trasų, plane pažymėtos skolos ir atliekų vietos | Masių pervežimo diagrama su balanso taškais, perkeltais tūriais ir vidutiniais vežimo atstumais |

## Vamzdynų tinklai

| Dar neįgyvendinta | Vietoje to, šiandien |
|---|---|
| Daugiau nei vienas tinklas projekte | Atskiri projektai lietaus ir buitinėms nuotekoms |
| Vandentiekio magistralės: vandens kokybė ir amžius, taisyklėmis grįsti valdymai, kiti vožtuvų tipai (srauto reguliavimo, droselinis, palaikantis), siurbliai pagal galią, paklausa, priklausanti nuo slėgio, Darcy–Weisbach parinktis, vamzdžių katalogas su sienelių storiais ir slėgio klasėmis. Likęs slėgio tinklų funkcionalumas yra bandomojoje stadijoje: [Vandentiekio magistralės](topic:water-mains) | Patikrinkite juos vandens paskirstymo programinėje įrangoje; buitinių nuotekų projektiniai srautai – [Buitinių nuotekų projektiniai srautai](topic:sanitary-design) |
| Nuotekų tėkmė laikui bėgant (hidrografai, dinaminis nukreipimas, talpos, siurbliai, perpylimai) | [Buitinių nuotekų projektiniai srautai](topic:sanitary-design) pateikia nuolatinį pikinį srautą, kurį naudoja projekto lapas |
| Įtekėjimo angų pajėgumas, latako išsklaidymas, sulaikymo nukreipimas, hidrografai, energijos nuostoliai, išskyrus vieną sankryžos koeficientą | Tikrinkite juos kita programine įranga; srautai, dydžiai ir nuolydžio linijos yra [Lietaus nuvedimas](topic:storm-drainage) |
| Baseinai PDF brėžinyje, DWG, DXF ar LandXML; baseinai iš paviršiaus (vandenskyros) | Baseinus braižykite rankiniu būdu; jie išsaugomi projekto faile |
| Vamzdžių katalogai, nenuapvalinti vamzdžiai, konstrukcijos, kurios nėra stačiakampės dėžės ar cilindrai (kūgiai, laiptai, nuolaidos), nuvedimo kategorija bibliotekoje | Konstrukcijų tipai pagal parametrus ([Vamzdynų tinklas](topic:pipe-network)); vamzdžiai su skersmeniu |
| Vamzdžiai profilio rodinyje, išlenkti vamzdžiai | Nuskaitykite dugno aukščius ir dangos gylį dešiniajame skydelyje |

## Sklypai

| Dar neįgyvendinta | Vietoje to, šiandien |
|---|---|
| Sklypų išdėstymas pagal plotą ar frontą, sklypai pagal aplink juos esančias linijas, servitutinė juosta | Nubrėžkite kiekvieną sklypą pagal jo kampus arba įveskite jo ribų matmenis |
| Kreivių ir linijų lentelės plane; žymos, perkeltos ranka | Kiekvienas kursas pažymėtas palei save |
| Sklypai LandXML | Sklypai išsaugomi projekto faile ir eina į PDF, DWG ir DXF |

## Traversos

| Dar neįgyvendinta | Vietoje to, šiandien |
|---|---|
| Mažiausių kvadratų koregavimas, transito taisyklė, kampų svorinimas pagal atstumus | Kompaso taisyklė |
| Nukrypimo kampai, zenito kampai ir nuožulniosios atstumai, aukščiai trigonometriniu nivelavimu | Redukuokite į horizontalius atstumus ir kampus tiksliai arba naudokite kryptis |
| Šoniniai matavimai, neapdoroti duomenų failai iš duomenų kaupiklių | Importuokite taškus kaip taškų failą |

## Kuoliavimas

| Dar neįgyvendinta | Vietoje to, šiandien |
|---|---|
| Poslinkio kuolai (atraminiai taškai, atitraukti nuo kuolo), nuolydžio kuolai ties gaudymo tašku | Kuoluokite pagal jums reikalingus poslinkius, įskaitant už pakraščio |
| Kuolų siuntimas tiesiai į duomenų kaupiklio savo formatą | CSV atsidaro daugumos duomenų kaupiklių biuro programinėje įrangoje |
| Vamzdynų, aikštelių ir sklypų kuoliavimas | Naudokite matavimo taškus šalia trasos arba sklypo kursus |

## Failai ir išvestis

| Dar neįgyvendinta | Vietoje to, šiandien |
|---|---|
| Tekstas, brūkšniavimai ir matmenys iš DWG ar DXF; popieriaus erdvė; susieti brėžiniai (xref); dvejetainis DXF | Atsidaro linijinė grafika iš modelio erdvės ([Atidaryti DWG ar DXF kaip linijinę grafiką](topic:open-dwg-dxf)); susietus brėžinius atidarykite atskirai |
| Kelių taškų perkėlimas vienu metu tempiant | Iškirpkite ir įklijuokite juos arba redaguokite po vieną |
| Stačio formato lapai, savo antraštės blokai, jūsų išdėstyti vaizdo langai, plano ir profilio lapai DWG | Vienas horizontalaus formato plano lapas PDF arba plano ir profilio lapai palei trasą (PDF) |
| Aukščių juostų ir profilių spausdinimas | Juostos rodomos tik ekrane; jei jų reikia, padarykite ekrano nuotrauką |
| Sluoksnių pavadinimų, spalvų ar žymų stilių keitimas | Pakeiskite juos CAD programoje po DXF eksporto |
| Debesies saugojimas ir versijų istorija | Išsaugokite `.civilcraft.json` failus ir turėkite jų atsargines kopijas; norėdami dirbti su vienu projektu kartu, naudokite gyvą sesiją CadCraft Studio ([Projektuokite vieną objektą kartu, gyvai](topic:work-live)) |
| CadCraft Studio iPad ir iPhone, ir iš Google Play | Naudokite CivilCraft naršyklėje įrenginyje; Android sistemoje CadCraft Studio diegiamas iš APK failo svetainėje getcadcraft.com/download |
| Kelių taškų ar projekto failų atidarymas vienu metu | Vienas failas kiekvienam atidarymui (GIS failai, kurie priklauso vienas kitam, pvz., shapefile dalys, atidaromi kartu) |

## Kraštovaizdis

| Dar neįgyvendinta | Vietoje to, šiandien |
|---|---|
| Gamintojų galvutės ir purkštukai | Bendrinės galvutės arba pridėkite savo galvutes iš failo; gamintojų duomenys įtraukiami, kai jie duoda leidimą |
| Didžiausi šoniniai laidų ilgiai lašelinio laistymo linijoms, srautai laikui bėgant, siurbliai, uždaro kontūro vamzdynų tinklai | Lašelinio laistymo linijas laikykite pagal gamintojo paskelbtą ilgį; patikrinimui reikalingas šakotas tinklas |
| Įgaubto laisvos formos objekto tikslus kontūras; jo tūris žemiau žemės išmatuojamas tiksliai | Iškilasis apvalkalas suvedamas, o tūris žemiau žemės yra apytikslis (nurodyta Ypatybėse) |
| Augalai BimCraft ir ModelCraft savo funkcijoje Įdėti iš bibliotekos | Eksportuokite kraštovaizdžio IFC ir atidarykite jį BimCraft šalia pastato |
| Išsamūs augalų modeliai (lapai, šakos, sezonai) 3D rodinyje; laisvos formos objektai ir laistymo sistema 3D rodinyje | Augalai 3D rodomi kaip paprastos formos, dydis nustatytas pagal augalų sąrašą ([Žiūrėti vietovę 3D](topic:site-3d)); ModelCraft išsklaidymas kuria augalų vaizdus |
| Kietosios dangos sienos, kurios laiko suvestą lygį už savęs paviršiuje | Suteikite platformai ar aikštelei vertikalius šonus: jie paviršiuje yra laikančiosios sienos ([Suvedimas](topic:grading)) |
| SVG transformacijos jūsų simboliuose; jūsų GLB augalų modelių tekstūros ir spalvos; suspaustos GLB geometrijos | Prieš tai suplokštinkite transformacijas savo braižymo programoje; modeliai braižomi augalo spalva; eksportuokite GLB be suspaudimo ([Augalų grafika](topic:plant-graphics)) |
| Jūsų pačių augalų sąrašas, saugomas jūsų Bibliotekos paskyroje (redaguojamas programoje) | Redaguokite projekto augalų sąrašą Augalų lentelėje ir išsaugokite jį kaip augalų failą |
| Kraštovaizdžio įrankiai asistentams be lango (failų serveris ir komandinė eilutė) | Jie veikia, kai atidarytas CivilCraft langas ([Leiskite DI asistentui dirbti su jūsų vietove](topic:assistants)) |

## Elektros linijos

| Dar neįgyvendinta | Vietoje to, šiandien |
|---|---|
| Šalies standartas įtaisytas (apkrovų atvejai, tarpai, koeficientai) | Nustatykite savo standarto reikšmes {{ui:Apkrovų atvejai ir ribos…}} ir išsaugokite jas kartu su savo biblioteka kaip paketą, kurį galima naudoti ir bendrinti ([Paketai](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Šoninis atstumas nuo laido iki medžio vainiko ar sienos šalia linijos | Vertikalus tarpas virš augalų ir sienų, kurias kerta linija ([Elektros linijų patikrinimai](topic:power-line-checks#clearances)) |
| Laidų šliaužimas ir naujo laido tempimas | Įskaitykite juos per temperatūras tempimo lentelėje |
| Požeminių kabelių šiluminis įvertinimas (srovės įvertis pagal tai, kaip jie tiesiami) | Įveskite tiekėjo srovės įvertį kabelio elemente |
| Trumpojo jungimo, apsaugos ir įžeminimo tyrimai | Naudokite specializuotą elektros programą; CivilCraft pateikia tinklo ilgius ir kabelius |
| Grotelinių bokštų projektavimas elementas po elemento ir atramų inkarai grunte | Atramos tikrinamos pagal nominalią apkrovą, tvirtinimo lynai – pagal įvertintą apkrovą |
| `.DON` tyrimo failas, tikrinamas programoje, kuri jį skaito | Patikrinkite failą toje programoje; atsiųskite mums pavyzdį, kad galėtume patikrinti su tikru |
| Elektros linijos 3D rodinyje ir IFC | Planas, linijos profilis, lapai ir GIS sluoksniai |
| Elektros linijų įrankiai asistentams be lango | Jie veikia, kai atidarytas CivilCraft langas ([Leiskite DI asistentui dirbti su jūsų vietove](topic:assistants)) |

## Pastatų masės

| Dar neįgyvendinta | Vietoje to, šiandien |
|---|---|
| Zonavimo kodų ar bet kurio miesto taisyklių biblioteka | Įveskite ribas iš savo savivaldybės potvarkio ([Zonavimo ribos](topic:zoning-limits)) |
| Dangaus šviesa ant sienų (fasado dienos šviesa), vėjas | [Saulės valandos](topic:sun-hours) skaičiuoja tik tiesioginę saulę |
| Pavėsis nuo medžių, augalų ar bet ko, nebraižomo kaip masė | Nubrėžkite gretimus pastatus kaip mases |
| Stogų formos masėse | Masės su plokščiu viršumi |
| Angos, stogai ir sienų tipai, kai masė kuriama BimCraft | BimCraft braižo paprastas išorines sienas kiekviename aukšte ir perdangą; likusius pridėkite ten |

## GIS ir koordinačių sistemos

| Dar neįgyvendinta | Vietoje to, šiandien |
|---|---|
| File Geodatabase; KML stiliai, piktogramos, žemės perdengimai ir tinklo nuorodos | Konvertuokite į GeoPackage, shapefile ar GeoJSON; KML žymės nuskaitomos be stilių |
| GIS objektų ar jų atributų redagavimas | Redaguokite juos GIS programoje ir vėl importuokite. Analizės skydelis sukuria naujus sluoksnius (buferis, perdengimas, sujungimas, pasirinkimas) ir prideda plotų bei ilgių laukus, bet neredaguoja objekto vietoje |
| Tinklo ir rastrinė analizė, buferiai su plokščiais ar kvadratiniais galais ir vienpusiai buferiai, eilučių pridėjimas ar šalinimas bei lauko tipo keitimas atributų lentelėje, rankinės klasių spalvos, stilių legenda braižiniuose | Naudokite Pasirinkti, kad pažymėtumėte objektus ir sukurtumėte iš jų sluoksnį; plokšti galai nesiūlomi. Spalvinimas pagal atributą ir atributų lentelė jau yra: žr. [Stilizuokite sluoksnį pagal atributą](topic:gis-symbology) ir [Dirbkite su sluoksnio atributų lentele](topic:gis-table) |
| Žymų stiliai (dydis, išdėstymas) ir žymos, vengiančios viena kitos | Žymos vieno dydžio ir gali persidengti, kai objektai tankūs |
| Vertikalūs datumai ir geoido modeliai | Aukščiai naudojami tokie, kokius pateikia failas; vertikalųjį datumą patikrinkite patys |
| Tinklelio poslinkiai, kitokie nei iš NAD27 į NAD83, siūlomi pagal plotą (OSTN15; NTv2 kitiems datumams veikia, kai pridedate failą), keli tinkleliai vienu metu, vertikalūs tinkleliai | Patys pridėkite tinklelio failą savo datumui; vienas tinklelis vienam projektui |
| Žemėlapio sluoksniai DXF ar 3D eksportuose | Žemėlapio sluoksniai eina į PDF braižinį, o šalia DWG – kaip paveikslėlis |
| Žemėlapių serveriai, kuriems reikia prisijungimo, rakto ar žetono | Naudokite viešąsias paslaugas arba georeferencuotą paveikslėlio failą |
| LAS ar LAZ failų rašymas iš paviršiaus, grunto modelio ar aukščių tinklelio ir LiDAR įrankių | Eksportuokite paviršius kaip GeoTIFF aukščių tinklelį. [Taškų debesys](topic:point-clouds) priedas rašo išvalytą debesį kaip LAS 1.4 ar LAZ |
| LiDAR intensyvumas, spalva ir atspindžiai; aukščių tinkleliai su keliais kanalais; tinklelio ar LiDAR failai, didesni nei 200 MB | LiDAR filtruojamas tik pagal klasę, tinkleliai naudoja pirmąjį kanalą; dideli failai prieš tai supjaustykite į dalis |

## Įvestis

| Dar neįgyvendinta | Vietoje to, šiandien |
|---|---|
| Pasirinkimas stačiakampiu lietimu (reikia {{key:Shift}}) | Ilgai spauskite kiekvieną matavimo tašką, kad jį pridėtumėte |
| Įvestos koordinatės ar atstumai braižant | Nubrėžkite apytiksliai, tada įveskite tikslias PI koordinates trasos PI lentelėje |
| Aikštelių kampų ir konstrukcijų koordinačių įvedimas | Tempkite jų rankenėles; priartinkite tikslumui ir stebėkite E ir N būsenos juostoje |
| Prisitraukimas prie objektų (išskyrus matavimo taškus lūžio linijoms) | Priartinkite ir stebėkite būsenos juostą |

## 3D rodinys

| Dar neįgyvendinta | Vietoje to, šiandien |
|---|---|
| Braižymas ar redagavimas 3D rodinyje | Braižykite ir redaguokite plane; 3D rodinys seka kiekvieną pakeitimą |
| Koridoriaus charakteristinių linijų ar GIS objektų pasirinkimas spustelint 3D | Spustelėkite juos plane |
| Padidinto vaizdo ar pėdomis eksportavimas | Eksportai tikro mastelio metrais; žr. [Eksportuoti vietovę 3D](topic:export-3d) |
| Žymos GLB ar OBJ eksportuose, žymų dydžiai ir stiliai 3D | Žymos rodomos tik 3D rodinyje, vieno dydžio; žr. [Žiūrėti vietovę 3D](topic:site-3d) |
| Tekstūros iš nuotraukų, važiavimo įrašymas į vaizdo įrašą, šešėliai iš už vietovės ribų, saulės valandos 3D rodinyje | Žemėlapio sluoksniai uždedami ant paviršių; važiavimas ir saulės padėtis vienu metu; [saulės valandos](topic:sun-hours) dienai ar sezonui plane |
