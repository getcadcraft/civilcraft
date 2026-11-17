---
title: Še ni izdelano
summary: Česa ta izdaja CivilCraft še ne počne in kaj storiti namesto tega danes.
keywords: manjka, omejitve, načrt razvoja, ni na voljo, spirale, širitev, dwg, dxf, vtoki, zadrževanje, prečni prerezi, pride pozneje, meje
from: a2d970ef
---

CivilCraft je zgodnja različica. Ta stran navaja, česa trenutna izdaja ne počne, da tega ne iščete. Za nič tukaj ni obljubljen datum.

## Točke

| Še ni izdelano | Namesto tega, danes |
|---|---|
| Dodajanje druge datoteke točk k prvi | Datoteke najprej združite v urejevalniku besedil ali preglednici |
| Izvoz besedilne datoteke točk | Izvozite LandXML (točke gredo ven kot CgPoints), uporabite GIS {{ui:Izvoz}} (točke s poljema P, N, E, Z in D) ali {{ui:Kopiraj}} točke v preglednico |
| Slogi oznak točk, simboli po ključu opisa, krivulje (loki) iz kod črt, datoteka ključev opisa za deljenje med projekti | Oznake prikažejo številko, koto in opis ali manj ([Nastavitve CivilCraft](topic:settings)); ključi se hranijo v datoteki projekta |
| Pretvorba enot | Pretvorite datoteko pred uvozom; **Enote** samo preimenujejo |

## Površja

| Še ni izdelano | Namesto tega, danes |
|---|---|
| Več kot ena površina, izdelana iz točk | En projekt na površje |
| Skrivanje notranjih mej | Uporabite **Najdaljši zunanji rob** ali zunanjo mejo |
| Izbira ali urejanje ene narisane prelomnice | {{key:Mod+Z}} ali {{ui:Odstrani narisane prelomnice}} in jo narišite znova |
| Urejanje površja, prebranega iz LandXML (prelomnice, meja) | {{ui:Obnovi površje iz točk}} |
| Urejanje površja, narejenega iz mreže višin | Mrežo znova uvozite z drugimi izbirami |
| Pretvorba površja, prebranega iz LandXML, ko se koordinatni sistem spremeni | Najprej {{ui:Obnovi površje iz točk}} |
| Označene kote točk in vrednosti naklona | Preberite jih v vrstici stanja ali obarvajte površje po naklonu s **Analiza naklona** v delovnem okolju Krajinsko oblikovanje ([Zravnavanje za krajino](topic:landscape-grading#grading-checks)) |

## Trase in profili

| Še ni izdelano | Namesto tega, danes |
|---|---|
| Spirale, razen klotoide; spirala med dvema krivinama (sestavljeni prehodi) | Klotoidne spirale na koncih krivine so na voljo; druge so imenovane in pri uvozu LandXML preskočene |
| Vstavljanje PI med dve drugi | Trasiranje narišite znova ali ponovno vnesite koordinate PI |
| Trase iz objektov, odmiki, širitve | Rišite s PI |
| Vnos K za vertikalno krivino | Vnesite L (K je prikazan) |
| Krožne in nesimetrične vertikalne krivine | Samo simetrične parabolične krivine |
| Več kot en projektirani profil na trasо | Ena trasa na različico |
| Povečava pogleda profila, pasovi profila pod profilom | Pogled profila prilagodi celotno trasu; izrišite jo na [liste tlorisa in profila](topic:plan-profile-sheets) |
| Prerezi v DWG ali LandXML | Listi prerezov kot PDF; {{ui:CSV}} površin in prostornin |
| Vzorčne črte pod kotom ali različnih širin vzdolž ceste | Ena širina na vsako stran za celotno trasu |

## Koridorji

| Še ni izdelano | Namesto tega, danes |
|---|---|
| Sredinske ločilne črte, ovire in nadvišanje, ki zavrti predloge | Narišite jih kot predloge ([Predloge koridorjev](topic:corridor-templates)); predloge po stacionaži še ne upoštevajo nadvišanja |
| Postopna sprememba med predlogama dveh območij (prehodi, zožitve) | Spremenite predlogo na stacionaži ali dajte točki ciljno širino črti, narisani kot zožitev |
| Vrtenje okoli roba, nadvišanje v LandXML | Nadvišanje se vrti okoli osrednje črte na krožnih krivinah; razširite vozni pas s ciljno širino na karakteristično črto |
| Cilji za stranske naklone (dnevna svetloba do črte ali površine), lastne površine koridorjev | Cilji premaknejo robove vozišč in bankin ([Koridorji](topic:corridor)); koridor je zravnan v projektirano površje |
| Koridorji, izvoženi kot LandXML cestišča; drugi koridor na trasi v izvozu IFC | Izvozi se projektirano površje |
| Predloge terena, ki spreminjajo projektirano površje, v 3D ali v prerezih | Dajo površine in prostornine vsakega sloja ([Predloge terena](topic:corridor-templates#terrain-templates)) |
| Vozne poti s hitrostjo, zdrsom pnevmatik, časom krmiljenja, prikolicami ali odmikom karoserije; knjižnica standardnih projektnih vozil; vozna pot, narisana z vlečenjem vozila | Vozne poti pri nizki hitrosti vzdolž karakteristične črte ali trase z lastnimi velikostmi vozil ([Vozne poti vozil](topic:swept-paths)) |

## Zravnavanje in prostornine

| Še ni izdelano | Namesto tega, danes |
|---|---|
| Klopi, odprte karakteristične črte, zravnane v zasnovo, zravnavanje do karakteristične črte od drugod | Zaprite karakteristično črto ([Karakteristične črte](topic:feature-lines)) ali jo uporabite kot prelomnico obstoječega terena |
| Vstavljanje ali odstranjevanje oglišča karakteristične črte | Črto narišite znova ali naredite njen stopničasti odmik |
| Loki v narisanih prelomnicah (skozi geodetske točke), spirale v karakteristični črti | Narišite karakteristično črto z loki in jo uporabite kot prelomnico obstoječega terena |
| Zravnavanje do razdalje, kote ali druge površine | Dnevna svetloba samo do obstoječega terena |
| Dodajanje ali odstranjevanje oglišča ploščadi | Ploščad izbrišite in jo narišite znova |
| Prostornine TIN-na-TIN (prizme), izbira velikosti celice mreže | Metoda mreže, velikost celice izbrana za vas |
| Nabreklost in krčenje, humus, debeline vozišč | Faktorje uporabite sami na prijavljenih številkah |
| Stroški prevoza in dodatnega prevoza, prevoz med različnimi trasami, posojilna mesta in odlagališča, postavljena na tloris | Diagram masnega prevoza s točkami ravnotežja, premaknjenimi prostorninami in povprečnimi razdaljami prevoza |

## Mreže cevi

| Še ni izdelano | Namesto tega, danes |
|---|---|
| Več kot ena mreža na projekt | Ločeni projekti za padavinsko in fekalno |
| Vodovodi: kakovost in starost vode, pravilu podobno krmiljenje, drugi tipi ventilov (regulacija pretoka, dušilni, vzdrževalni), črpalke z močjo, poraba, odvisna od tlaka, možnost Darcy–Weisbach, katalog cevi z debelinami sten in razredi tlaka. Ostalo o tlačnih mrežah je v laboratoriju: [Vodovodi](topic:water-mains) | Preverite to v programski opremi za oskrbo z vodo; projektni pretoki za fekalno so v [Projektni pretoki za fekalno](topic:sanitary-design) |
| Pretoki kanalizacije skozi čas (hidrogrami, dinamično vodenje, shranjevanje, črpalke, prelivi) | [Projektni pretoki za fekalno](topic:sanitary-design) da stalni konični pretok, ki ga uporablja projektni list |
| Zmogljivost vtoka, razlitje po žlebu, zadrževalno vodenje, hidrogrami, izgube energije razen enega koeficienta v križišču | Preverite v drugi programski opremi; pretoki, velikosti in hidravlične črte so v [Odvodnjavanje padavinskih vod](topic:storm-drainage) |
| Prispevna območja v PDF-izrisu, DWG, DXF ali LandXML; prispevna območja iz površja (vodozbirniki) | Prispevna območja narišite ročno; shranjena so v datoteki projekta |
| Katalogi cevi, nekrožne cevi, objekti, ki niso pokončne škatle ali valji (stožci, stopnice, klopi), kategorija odvodnjavanja v knjižnici | Tipi objektov iz parametrov ([Mreža cevi](topic:pipe-network)); cevi s premerom |
| Cevi v pogledu profila, ukrivljene cevi | Dna in zasutje preberite v desnem podoknu |

## Parcele

| Še ni izdelano | Namesto tega, danes |
|---|---|
| Razporejanje parcel po površini ali čelu, parcele iz črt okoli njih, služnosti | Vsako parcelo narišite po njenih vogalih ali vnesite njene zapise mej |
| Tabele krivin in tabele črt na tlorisu; oznake, premaknjene ročno | Vsak odsek je označen vzdolž sebe |
| Parcele v LandXML | Parcele se shranijo v datoteko projekta in gredo v PDF, DWG in DXF |

## Poligonski vlaki

| Še ni izdelano | Namesto tega, danes |
|---|---|
| Izravnava po metodi najmanjših kvadratov, transitno pravilo, uteževanje kotov glede na razdalje | Kompasno pravilo |
| Koti odklona, zenitni koti in poševne razdalje, višine s trigonometričnim nivelmanom | Pravilno reducirajte na vodoravne razdalje in kote ali smeri |
| Stranski posnetki, surove datoteke iz zbiralnikov podatkov | Uvozite točke kot datoteko točk |

## Zakoličba

| Še ni izdelano | Namesto tega, danes |
|---|---|
| Odmične točke (referenčne točke, odmaknjene od kola), kola naklona na točki preloma | Zakoličite na odmikih, ki jih potrebujete, tudi za robom bankine |
| Pošiljanje kolov neposredno v lastni format zbiralnika podatkov | CSV se odpre v pisarniški programski opremi večine zbiralnikov podatkov |
| Zakoličba cevi, ploščadi in parcel | Uporabite geodetske točke blizu trase ali zapise mej parcele |

## Datoteke in izpis

| Še ni izdelano | Namesto tega, danes |
|---|---|
| Besedilo, šrafure in kote iz DWG ali DXF; papirni prostor; povezane risbe (zunanji sklici); binarni DXF | Črtovje iz prostora modela se odpre ([Odprite DWG ali DXF kot črtovje](topic:open-dwg-dxf)); povezane risbe odprite posebej |
| Premikanje več točk hkrati z vlečenjem | Izrežite in prilepite jih ali jih urejajte posamezno |
| Pokončni listi, lastni naslovni bloki, pogledni okni, ki jih sami razporedite, listi tlorisa in profila v DWG | En pokrajinski list tlorisa na PDF ali listi tlorisa in profila vzdolž trase (PDF) |
| Izris pasov višin in profilov | Pasovi so samo na zaslonu; če jih potrebujete, naredite posnetek zaslona |
| Spreminjanje imen slojev, barv ali slogov oznak | Spremenite jih v programu CAD po izvozu DXF |
| Shranjevanje v oblak in zgodovina različic | Shranjujte datoteke `.civilcraft.json` in jih varnostno kopirajte; za skupno delo na enem projektu uporabite živo sejo v CadCraft Studio ([Skupna zasnova mesta v živo](topic:work-live)) |
| CadCraft Studio za iPad in iPhone ter iz Google Play | Uporabite CivilCraft v brskalniku na napravi; v Androidu se CadCraft Studio namesti iz APK na getcadcraft.com/download |
| Odpiranje več datotek točk ali projektov hkrati | Ena datoteka na odprtje (datoteke GIS, ki sodijo skupaj, na primer deli shapefile-a, se odprejo skupaj) |

## Krajinsko oblikovanje

| Še ni izdelano | Namesto tega, danes |
|---|---|
| Glave in šobe proizvajalcev | Splošne glave ali dodajte lastne glave iz datoteke; podatki proizvajalcev pridejo, ko dovolijo |
| Največje stranske dolžine za linije kapljanja, pretoki skozi čas, črpalke, zaprte cevne mreže | Odvode kapljanja ohranite v objavljeni dolžini proizvajalca; preverjanje zahteva razvejano mrežo |
| Natančen obris konkavnega prostoročnega objekta; njegov prostornina pod zemljo, izmerjena natančno | Konveksna lupina je zravnana, prostornina pod zemljo pa je ocena (navedeno v Lastnostih) |
| Rastline v lastnem Postavi iz knjižnice programov BimCraft in ModelCraft | Izvozite krajinski IFC in ga odprite v BimCraft ob stavbi |
| Podrobni modeli rastlin (listi, veje, letni časi) v pogledu 3D; prostoročni objekti in namakanje v pogledu 3D | Rastline se v 3D prikažejo kot preproste oblike, velikostno določene iz seznama rastlin ([Ogled mesta v 3D](topic:site-3d)); razpršitev v ModelCraft ustvari slike zasaditev |
| Trdne stene, ki zadržujejo zravnano raven za seboj na površju | Ploščadi ali podlogi dajte navpične stranice: na površju so podporni zidovi ([Zravnavanje](topic:grading)) |
| Transformacije SVG v lastnih simbolih; teksture in barve lastnih modelov rastlin GLB; stisnjena geometrija GLB | Najprej poravnajte transformacije v risalnem programu; modeli so narisani v barvi rastline; izvozite GLB brez stiskanja ([Grafika rastlin](topic:plant-graphics)) |
| Lastni seznam rastlin v vašem računu Knjižnice (urejen v aplikaciji) | Uredite seznam projekta v tabeli Rastline in ga shranite kot datoteko rastlin |
| Orodja za krajino za pomočnike brez okna (strežnik datotek in ukazna vrstica) | Delujejo, ko je okno CivilCraft odprto ([Naj vam pomočnik UI pri delu z mestom](topic:assistants)) |

## Daljnovodi

| Še ni izdelano | Namesto tega, danes |
|---|---|
| Standard države, vgrajen vnaprej (obtežni primeri, odmiki, faktorji) | Nastavite vrednosti svojega standarda v {{ui:Obtežni primeri in omejitve …}} in jih shranite, skupaj s knjižnico, kot paket za ponovno uporabo in deljenje ([Paketi](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Vodoravna razdalja od vodnika do krošnje drevesa ali stene ob vodu | Navpični odmik nad rastlinami in stenami, ki jih vod seka ([Preverjanja daljnovoda](topic:power-line-checks#clearances)) |
| Lezenje vodnika in raztezek novega vodnika | Upoštevajte ju prek temperatur v tabeli napenjanja |
| Termična obremenitev zakopanih kablov (tokovna obremenitev glede na način polaganja) | Vnesite tokovno obremenitev svojega dobavitelja na postavko kabla |
| Študije kratkega stika, zaščite in ozemljitve | Uporabite namenski električni program; CivilCraft da dolžine in kable mreže |
| Rešetkasti stebri, zasnovani po elementih, in sidra v tleh | Stebri so preverjeni po nazivni obtežbi; vrvi po nazivni obtežbi |
| Študijska datoteka `.DON`, preverjena v programu, ki jo bere | Preverite datoteko tam; pošljite nam vzorec, da ga preizkusimo na pravem |
| Daljnovodi v pogledu 3D in v IFC | Tloris, profil voda, listi in sloji GIS |
| Orodja za daljnovode za pomočnike brez okna | Delujejo, ko je okno CivilCraft odprto ([Naj vam pomočnik UI pri delu z mestom](topic:assistants)) |

## Mase stavb

| Še ni izdelano | Namesto tega, danes |
|---|---|
| Knjižnica območnih predpisov ali pravil katerega koli mesta | Vnesite omejitve iz svojega predpisa ([Omejitve gradnje](topic:zoning-limits)) |
| Svetloba neba na stenah (dnevna svetloba fasade), veter | [Sončne ure](topic:sun-hours) štejejo samo neposredno sonce |
| Senca dreves, rastlin ali česar koli, kar ni narisano kot masa | Sosednje stavbe narišite kot mase |
| Oblike streh na masah | Masе z ravnimi vrhovi |
| Odprtine, strehe in tipi sten, ko je masa razvita v BimCraft | BimCraft zgradi preproste zunanje stene na vsaki etaži in tla; dodajte ostalo tam |

## GIS in koordinatni sistemi

| Še ni izdelano | Namesto tega, danes |
|---|---|
| Geodatabaza datoteke; stili, ikone, prekrivanja tal in mrežne povezave KML | Najprej pretvorite v GeoPackage, shapefile ali GeoJSON; oznake KML se preberejo brez stilov |
| Urejanje elementov GIS ali njihovih atributov | Uredite jih v programu GIS in ponovno uvozite. Podokno Analiza naredi nove sloje (medpomnilnik, prekrivanje, združitev, izbor) in doda polja površine in dolžine, vendar elementa ne ureja na mestu |
| Mrežna in rastrska analiza, medpomnilniki z ravnimi ali kvadratnimi konci in enostranski medpomnilniki, dodajanje ali brisanje vrstic in spreminjanje tipa polja v tabeli atributov, ročne barve razredov, slog legende v izrisih | Uporabite Izberi, da izberete elemente in iz njih naredite sloj; ravni konci niso ponujeni. Barvanje po atributu in tabela atributov sta izdelana: glejte [Slog sloja po atributu](topic:gis-symbology) in [Delo s tabelo atributov sloja](topic:gis-table) |
| Slogi oznak (velikost, postavitev) in oznake, ki se izogibajo druga drugi | Oznake so ene velikosti in se lahko prekrivajo tam, kjer so elementi gosti |
| Navpični datumi in modeli geoida | Kote se uporabijo tako, kot jih da datoteka; sami preverite navpični datum |
| Premiki mreže, razen na NAD83 iz NAD27, predlagani po območju (OSTN15, NTv2 za druge datume delujejo, ko dodate datoteko), več mrež hkrati, navpične mreže | Sami dodajte datoteko mreže za svoj datum; ena mreža na projekt |
| Sloji zemljevida v DXF ali v izvozih 3D | Sloji zemljevida gredo v PDF-izris, ob DWG pa kot slika |
| Strežniki zemljevidov, ki zahtevajo prijavo, ključ ali žeton | Uporabite javne storitve ali datoteko slike z georeferenco |
| Pisanje datotek LAS ali LAZ iz površja, modela terena ali orodij mreže višin in LiDAR | Izvozite površja kot mrežo višin GeoTIFF. Dodatek [Oblaki točk](topic:point-clouds) zapiše očiščen oblak kot LAS 1.4 ali LAZ |
| Intenzivnost, barva in odboji LiDAR; mreže višin z več pasovi; datoteke mrež ali LiDAR, večje od 200 MB | LiDAR se filtrira samo po razredu, mreže uporabijo svoj prvi pas; velike datoteke najprej razrežite na ploščice |

## Vnos

| Še ni izdelano | Namesto tega, danes |
|---|---|
| Izbira s škatlo na dotik (potrebuje {{key:Shift}}) | Dolgo pritisnite vsako geodetsko točko, da jo dodate |
| Vtipkane koordinate ali razdalje med risanjem | Narišite okvirno, nato v tabeli PI trase vtipkajte natančne koordinate PI |
| Vtipkane koordinate za oglišča ploščad in objektov | Povlecite njihove ročice; za natančnost povečajte pogled in spremljajte E in N v vrstici stanja |
| Prijemanje na objekte (razen geodetskih točk za prelomnice) | Povečajte pogled in spremljajte vrstico stanja |

## Pogled 3D

| Še ni izdelano | Namesto tega, danes |
|---|---|
| Risanje ali urejanje v pogledu 3D | Rišite in urejajte v tlorisu; pogled 3D sledi vsaki spremembi |
| Izbira karakterističnih črt koridorja ali elementov GIS s klikom v 3D | Kliknite nanje v tlorisu |
| Izvoz pretiranega pogleda ali v čevljih | Izvozi so v pravem merilu v metrih; glejte [Izvoz mesta v 3D](topic:export-3d) |
| Oznake v izvozih GLB ali OBJ, velikosti in slogi oznak v 3D | Oznake se prikažejo samo v pogledu 3D, ene velikosti; glejte [Ogled mesta v 3D](topic:site-3d) |
| Teksture iz fotografij, snemanje vožnje kot video, sence od zunaj mesta, sončne ure v pogledu 3D | Sloji zemljevida, položeni na površja; vožnja in položaj sonca ob enem času; [sončne ure](topic:sun-hours) za dan ali sezono na tlorisu |
