---
title: Še ni izdelano
summary: Kaj ta izdaja CivilCraft še ne počne in kaj storiti namesto tega danes.
keywords: manjka, omejitve, plan razvoja, ni na voljo, spirale, razširitev, dwg, dxf, lovilniki, zadrževanje, prečni prerezi, pride pozneje, meje
from: b91588d4
---

CivilCraft je v zgodnji fazi. Ta stran navaja, kaj trenutna izdaja ne počne, da tega ne iščete. Nič tukaj ni obljubljeno za določen datum.

## Točke

| Še ni izdelano | Namesto tega danes |
|---|---|
| Dodajanje druge datoteke točk k prvi | Datoteke najprej združite v urejevalniku besedila ali preglednici |
| Izvoz besedilne datoteke točk | Izvozite LandXML (točke gredo ven kot CgPoints), uporabite GIS {{ui:Izvoz}} (točke s poljih P, N, E, Z in D) ali {{ui:Kopiraj}} točke v preglednico |
| Slogi oznak točk, simboli po ključu opisa, krivulje (loki) iz kod črt, datoteka ključev opisa za skupno rabo med projekti | Oznake prikazujejo številko, višino in opis ali manj ([Nastavitve CivilCraft](topic:settings)); ključi se hranijo v projektni datoteki |
| Pretvorba enot | Datoteko pretvorite pred uvozom; **Enote** samo preimenujejo |

## Površja

| Še ni izdelano | Namesto tega danes |
|---|---|
| Več kot ena površina, zgrajena iz točk | En projekt na površino |
| Skrivanje (notranjih) meja | Uporabite **Najdaljši zunanji rob** ali zunanjo mejo |
| Izbiranje ali urejanje ene narisane prelomnice | {{key:Mod+Z}} ali {{ui:Odstrani narisane prelomnice}} in ponovno narišite |
| Urejanje površja, prebranega iz LandXML (prelomnice, meja) | {{ui:Obnovi površje iz točk}} |
| Urejanje površja, ustvarjenega iz mreže višin | Mrežo znova uvozite z drugimi nastavitvami |
| Pretvorba površja, prebranega iz LandXML, ko se koordinatni sistem spremeni | Najprej {{ui:Obnovi površje iz točk}} |
| Označene točkovne višine in vrednosti naklonov | Preberite jih v vrstici stanja ali pobarvajte površje glede na naklon z **Analizo naklonov** v delovnem okolju Krajina ([Izravnava za krajino](topic:landscape-grading#grading-checks)) |

## Trase in profili

| Še ni izdelano | Namesto tega danes |
|---|---|
| Spirale, razen klotoide; spirala med dvema krivinama (sestavljeni prehodi) | Klotoidne spirale na koncih krivine so na voljo; druge so pri uvozu LandXML poimenovane in preskočene |
| Vstavljanje PI med dve drugi | Ponovno narišite traso ali ponovno vnesite koordinate PI |
| Trase iz objektov, odmikov, razširitev | Rišite s PI |
| Vnašanje K za vertikalno krivino | Vnesite L (K je prikazan) |
| Krožne in nesimetrične vertikalne krivine | Samo simetrične parabolične krivine |
| Več kot en projektni profil na traso | Ena trasa na različico |
| Povečava pogleda profila, pasovi profila pod profilom | Pogled profila prilagodi celotno traso; izrišite ga na [listih načrta in profila](topic:plan-profile-sheets) |
| Prerezi v DWG ali LandXML | Listi prerezov kot PDF; {{ui:CSV}} površin in prostornin |
| Vzorčne črte pod kotom ali različnih širin vzdolž ceste | Ena širina na vsaki strani za celotno traso |

## Koridorji

| Še ni izdelano | Namesto tega danes |
|---|---|
| Sredinski pasovi, ovire in nadvišanje, ki zasuka predloge | Narišite jih kot predloge ([Predloge koridorjev](topic:corridor-templates)); predloge po stacionaži zaenkrat ne upoštevajo nadvišanja |
| Postopna sprememba med predlogama dveh območij (prehodi, zožitve) | Spremenite predlogo na stacionaži ali dajte točki ciljno širino do črte, narisane kot zožitev |
| Zasuk okoli roba, nadvišanje v LandXML | Nadvišanje se na krožnih krivinah zasuka okoli osrednje črte; vozni pas razširite s ciljno širino do karakteristične črte |
| Cilji za bočne nagibe (linija preseka z terenom do črte ali površja), lastne površine koridorjev | Cilji premikajo robove vozišč in bankin ([Koridorji](topic:corridor)); koridor je izravnan v predvideno površje |
| Zaokrožitve robnikov, zavijalni pasovi in otoki, izravnani v križišču; konec stranske ceste, odrezan do roba glavne ceste pod kotom; pot, povezana s cesto v tlorisu, v svoji dolžini in površini | Ceste, ki se stikajo, so povezane pravokotno, rob glavne ceste je odprt, stranska cesta se nanj postopoma prilagodi ([Kjer se ceste stikajo](topic:corridor#where-roads-meet-roads-pads-and-paths)); pot se v predvidenem površju in v 3D ustavi na robu ceste |
| Koridorji, izvoženi kot ceste LandXML; drugi koridor na trasi v izvozu IFC | Izvozi se predvideno površje |
| Predloge terena, ki spremenijo predvideno površje, v 3D ali v prerezih | Dajejo površine in prostornine vsakega sloja ([Predloge terena](topic:corridor-templates#terrain-templates)) |
| Vozne poti z hitrostjo, zdrsom pnevmatik, časom zavijanja, priklopniki ali prostostjo karoserije; knjižnica standardnih projektnih vozil; vozna pot, narisana z vlečenjem vozila | Vozne poti pri nizki hitrosti vzdolž karakteristične črte ali trase z vašimi velikostmi vozil ([Vozne poti vozil](topic:swept-paths)) |

## Izravnava in prostornine

| Še ni izdelano | Namesto tega danes |
|---|---|
| Berme, odprte karakteristične črte, izravnane v projekt, izravnava do karakteristične črte od drugod | Zaprite karakteristično črto ([Karakteristične črte](topic:feature-lines)) ali jo uporabite kot prelomnico obstoječega terena |
| Vstavljanje ali odstranjevanje oglišča karakteristične črte | Črto narišite znova ali naredite stopničasti odmik |
| Loki v narisanih prelomnicah (skozi geodetske točke), spirale v karakterističnih črtah | Narišite karakteristično črto z loki in jo uporabite kot prelomnico obstoječega terena |
| Izravnava na razdaljo, višino ali drugo površje | Samo linija preseka z obstoječim terenom |
| Dodajanje ali odstranjevanje vogala ploščadi | Izbrišite ploščad in jo narišite znova |
| Prostornine TIN-v-TIN (prizme), izbira velikosti celice mreže | Metoda mreže, velikost celice je izbrana za vas |
| Nabrekanje in krčenje, humus, globine voziščnih slojev | Faktorje uporabite sami na prikazanih številkah |
| Stroški prevoza in prekomernega prevoza, prevoz med različnimi trasami, izposojevališča in deponije, postavljene v načrt | Diagram masnega prevoza z ravnotežnimi točkami, premaknjenimi prostorninami in povprečnimi razdaljami prevoza |

## Cevna omrežja

| Še ni izdelano | Namesto tega danes |
|---|---|
| Več kot eno omrežje na projekt | Ločeni projekti za meteorno in fekalno odvodnjavanje |
| Vodovodi: kakovost in starost vode, nadzor na podlagi pravil, drugi tipi ventilov (regulacija pretoka, dušilka, vzdrževalni), črpalke, podane z močjo, poraba, odvisna od tlaka, možnost Darcy–Weisbach, katalog cevi z debelinami sten in tlačnimi razredi. Ostalo pri tlačnih omrežjih je v fazi preizkušanja: [Vodovodi](topic:water-mains) | Preverite jih v programski opremi za distribucijo vode; projektni pretoki za fekalno kanalizacijo so v [Projektni pretoki za fekalno kanalizacijo](topic:sanitary-design) |
| Pretoki v kanalizaciji skozi čas (hidrogrami, dinamično vodenje, akumulacija, črpalke, preliv) | [Projektni pretoki za fekalno kanalizacijo](topic:sanitary-design) da stalni konični pretok, ki ga uporablja projektni list |
| Zmogljivost vtoka, širjenje žleba, vodenje zadrževanja, hidrogrami, energijske izgube razen enega koeficienta križišča | Preverite jih v drugi programski opremi; pretoki, dimenzije in vzdolžne črte so v [Meteorno odvodnjavanje](topic:storm-drainage) |
| Zbirna območja v izrisu PDF, DWG, DXF ali LandXML; zbirna območja iz površja (povodja) | Zbirna območja narišite ročno; shranjena so v projektni datoteki |
| Katalogi cevi, necilindrične cevi, objekti, ki niso pokončne škatle ali valji (stožci, stopnice, berme), kategorija odvodnjavanja v knjižnici | Tipi objektov iz parametrov ([Cevno omrežje](topic:pipe-network)); cevi s premerom |
| Cevi v pogledu profila, ukrivljene cevi | Preberite dna cevi (invert) in globino nadsloja v desnem podoknu |

## Parcele

| Še ni izdelano | Namesto tega danes |
|---|---|
| Razporejanje parcel po površini ali fronti, parcele iz črt okoli njih, služnost | Vsako parcelo narišite po vogalih ali vnesite njene odseke (klice) |
| Tabele krivin in tabele črt v tlorisu; oznake, premaknjene ročno | Vsak odsek je označen vzdolž sebe |
| Parcele v LandXML | Parcele se shranijo v projektno datoteko in gredo v PDF, DWG in DXF |

## Poligonski vlaki

| Še ni izdelano | Namesto tega danes |
|---|---|
| Izravnava po metodi najmanjših kvadratov, pravilo transita, utežitev kotov glede na razdalje | Pravilo kompasa |
| Odklonski koti, zenitni koti in nagibne razdalje, višine s trigonometričnim nivelmanom | Reducirajte na vodoravne razdalje in kote ali na smeri |
| Stranski posnetki, surove datoteke podatkov iz zbiralnikov | Točke uvozite kot datoteko točk |

## Zakoličevanje

| Še ni izdelano | Namesto tega danes |
|---|---|
| Odmični koli (referenčne točke, zamaknjene od kola), koli za naklon na točki preseka | Zakoličite na odmikih, ki jih potrebujete, tudi onkraj bankine |
| Pošiljanje kolov neposredno v lastni format zbiralnika podatkov | CSV se odpre v pisarniški programski opremi večine zbiralnikov podatkov |
| Zakoličevanje cevi, ploščadi in parcel | Uporabite geodetske točke blizu trase ali odseke parcele |

## Datoteke in izhod

| Še ni izdelano | Namesto tega danes |
|---|---|
| Besedilo, šrafure in kote iz DWG ali DXF; papirni prostor; povezane risbe (xref); binarni DXF | Črte iz prostora modela se odprejo ([Odpri DWG ali DXF kot črte](topic:open-dwg-dxf)); povezane risbe odprite posebej |
| Premikanje več točk hkrati z vlečenjem | Izrežite in prilepite jih ali jih urejajte posamezno |
| Pokončni listi, lastne glave risb, pogledna okna, ki jih razporejate, listi načrta in profila v DWG | En ležeči list načrta na PDF ali listi načrta in profila vzdolž trase (PDF) |
| Izris pasov višin in profilov | Pasovi so samo na zaslonu; če jih potrebujete, naredite posnetek zaslona |
| Spreminjanje imen slojev, barv ali slogov oznak | Spremenite jih v programu CAD po izvozu DXF |
| Shranjevanje v oblaku in zgodovina različic | Shranjujte datoteke `.civilcraft.json` in jih imejte varnostno kopirane; za skupno delo na enem projektu uporabite sejo v živo v CadCraft Studio ([Skupno oblikovanje ene lokacije v živo](topic:work-live)) |
| CadCraft Studio za iPad in iPhone ter iz Google Play | Uporabite CivilCraft v brskalniku na napravi; na Androidu se CadCraft Studio namesti iz svoje datoteke APK na getcadcraft.com/download |
| Odpiranje več datotek točk ali projektov hkrati | Ena datoteka na odprtje (datoteke GIS, ki sodijo skupaj, na primer deli shapefile-a, se odprejo skupaj) |

## Krajina

| Še ni izdelano | Namesto tega danes |
|---|---|
| Glave in šobe proizvajalcev | Splošne glave ali dodajte lastne iz datoteke; podatki proizvajalcev pridejo, ko dovolijo |
| Največje stranske dolžine kapljičnih linij, pretoki skozi čas, črpalke, zankasta cevna omrežja | Kapljične proge ohranite v objavljeni dolžini proizvajalca; preverjanje zahteva razvejano omrežje |
| Natančen obris konkavnega prostega objekta; njegova prostornina pod terenom, izmerjena natančno | Konveksna ovojnica je izravnana, prostornina pod terenom pa je ocena (navedeno v **Lastnostih**) |
| Rastline v lastni funkciji Place from library v BimCraft in ModelCraft | Izvozite IFC krajinske ureditve in ga odprite v BimCraft poleg stavbe |
| Podrobni modeli rastlin (listi, veje, letni časi) v pogledu 3D; prosti objekti in namakanje v pogledu 3D | Rastline se v 3D prikažejo kot preprosti liki z velikostjo iz seznama rastlin ([Ogled lokacije v 3D](topic:site-3d)); raztros programa ModelCraft ustvari slike zasaditve |
| Zidovi utrjenih površin, ki za seboj na površju zadržujejo izravnan nivo | Platformi ali ploščadi dajte navpične stranice: na površju so podporni zidovi ([Izravnava](topic:grading)) |
| Transformacije SVG v lastnih simbolih; teksture in barve lastnih modelov rastlin GLB; stisnjena geometrija GLB | Najprej poenostavite transformacije v risalnem programu; modeli so narisani v barvi rastline; izvozite GLB brez stiskanja ([Grafika rastlin](topic:plant-graphics)) |
| Lasten seznam rastlin, shranjen v vašem računu Knjižnica (urejen v aplikaciji) | Uredite projektni seznam v tabeli rastlin in ga shranite kot datoteko rastlin |
| Orodja za krajino za pomočnike brez okna (datotečni strežnik in ukazna vrstica) | Delujejo, ko je okno CivilCraft odprto ([Naj pomočnik z umetno inteligenco dela z vašo lokacijo](topic:assistants)) |

## Daljnovodi

| Še ni izdelano | Namesto tega danes |
|---|---|
| Standard države, vgrajen v program (obtežni primeri, odmiki, faktorji) | Vrednosti standarda nastavite v {{ui:Obtežni primeri in omejitve …}} in jih skupaj s knjižnico shranite kot paket za ponovno uporabo in deljenje ([Paketi](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Vodoravna razdalja od vodnika do krošnje drevesa ali zidu ob daljnovodu | Navpični odmik nad rastlinami in zidovi, ki jih daljnovod seka ([Preverjanja daljnovodov](topic:power-line-checks#clearances)) |
| Lezenje vodnika in raztezek novega vodnika | Upoštevajte ju prek temperatur v tabeli napenjanja |
| Toplotna obremenitev zakopanih kablov (tokovna obremenitev glede na način polaganja) | Vnesite tokovno obremenitev dobavitelja na postavko kabla |
| Študije kratkega stika, zaščite in ozemljitve | Uporabite namenski električni program; CivilCraft navaja dolžine omrežja in kable |
| Rešetkasti stebri, načrtovani člen za členom, in sidra za vrvi v tleh | Podpore se preverjajo po nazivni obtežbi; vrvi po nazivni obremenitvi |
| Datoteka študije `.DON`, preverjena v programu, ki jo bere | Datoteko preverite tam; pošljite nam vzorec, da lahko preizkusimo na pravem |
| Daljnovodi v pogledu 3D in v IFC | Načrt, profil daljnovoda, listi in sloji GIS |
| Orodja za daljnovode za pomočnike brez okna | Delujejo, ko je okno CivilCraft odprto ([Naj pomočnik z umetno inteligenco dela z vašo lokacijo](topic:assistants)) |

## Gradbene mase

| Še ni izdelano | Namesto tega danes |
|---|---|
| Knjižnica prostorskih predpisov ali pravil katerega koli mesta | Vnesite omejitve iz lastnega odloka ([Prostorske omejitve](topic:zoning-limits)) |
| Nebesna svetloba na stenah (dnevna svetloba na fasadi), veter | [Ure sonca](topic:sun-hours) šteje samo neposredno sonce |
| Senca dreves, rastlin ali česar koli, kar ni narisano kot masa | Sosednje stavbe narišite kot mase |
| Oblike streh na masah | Mase z ravnim vrhom |
| Odprtine, strehe in tipi sten, ko je masa razvita v BimCraft | BimCraft zgradi preproste zunanje zidove na vsaki etaži in tleh; ostalo dodajte tam |

## GIS in koordinatni sistemi

| Še ni izdelano | Namesto tega danes |
|---|---|
| File Geodatabase; slogi, ikone, prekrivanja terena in mrežne povezave KML | Najprej pretvorite v GeoPackage, shapefile ali GeoJSON; oznake KML se preberejo brez svojih slogov |
| Urejanje elementov GIS ali njihovih atributov | Uredite jih v programu GIS in ponovno uvozite. Podokno **Analiziraj** ustvari nove sloje (pas, prekrivanje, združitev, izbor) in doda polja površine in dolžine, vendar ne ureja elementa na mestu |
| Analiza omrežij in rastrov, pasovi z ravnimi ali kvadratnimi konci ter enostranski pasovi, dodajanje ali brisanje vrstic in spreminjanje tipa polja v tabeli atributov, ročne barve razredov, legenda slogov v izrisih | Uporabite {{ui:Izberi}} za izbor elementov in iz njih ustvarite sloj; ravni konci niso ponujeni. Barvanje po atributu in tabela atributov sta izdelana: glejte [Slog sloja po atributu](topic:gis-symbology) in [Delo s tabelo atributov sloja](topic:gis-table) |
| Slogi oznak (velikost, položaj) in oznake, ki se izogibajo druga drugi | Oznake so ene velikosti in se lahko prekrivajo tam, kjer so elementi gosti |
| Višinski datumi in modeli geoida | Višine se uporabljajo, kot jih poda datoteka; višinski datum preverite sami |
| Premiki mrež, razen v NAD83 iz NAD27, predlagani glede na območje (OSTN15, NTv2 za druge datume delujeta, ko dodate datoteko), več mrež hkrati, višinske mreže | Datoteko mreže za svoj datum dodajte sami; ena mreža na projekt |
| Kartni sloji v izvozih DXF ali 3D | Kartni sloji gredo v izris PDF in ob DWG kot slika |
| Kartni strežniki, ki zahtevajo prijavo, ključ ali žeton | Uporabite javne storitve ali georeferencirano slikovno datoteko |
| Pisanje datotek LAS ali LAZ iz površja, modela terena ter orodij za mrežo višin in LiDAR | Izvozite površja kot višinsko mrežo GeoTIFF. Dodatek [Oblaki točk](topic:point-clouds) zapiše očiščen oblak kot LAS 1.4 ali LAZ |
| Intenzivnost, barva in odboji LiDAR; višinske mreže z več pasovi; datoteke mrež ali LiDAR, večje od 200 MB | LiDAR se filtrira samo po razredu, mreže uporabljajo njihov prvi pas; velike datoteke najprej razrežite na ploščice |

## Vnos

| Še ni izdelano | Namesto tega danes |
|---|---|
| Izbira z okvirjem na dotik (potrebuje {{key:Shift}}) | Vsako geodetsko točko dodajte z dolgim pritiskom |
| Vnos koordinat ali razdalj med risanjem | Narišite približno, nato v tabeli PI trase vnesite natančne koordinate PI |
| Vnašanje koordinat za vogale ploščadi in objekte | Povlecite njihove ročice; za natančnost povečajte in spremljajte E in N v vrstici stanja |
| Lovljenje objektov (razen geodetskih točk za prelomnice) | Povečajte in spremljajte vrstico stanja |

## Pogled 3D

| Še ni izdelano | Namesto tega danes |
|---|---|
| Risanje ali urejanje v pogledu 3D | Rišite in urejajte v načrtu; pogled 3D sledi vsaki spremembi |
| Izbira karakterističnih črt koridorja ali elementov GIS s klikom v 3D | Kliknite jih v načrtu |
| Izvoz povečanega pogleda ali v čevljih | Izvozi so v pravem merilu v metrih; glejte [Izvoz lokacije v 3D](topic:export-3d) |
| Oznake v izvozih GLB ali OBJ, velikosti in slogi oznak v 3D | Oznake se prikažejo samo v pogledu 3D, ene velikosti; glejte [Ogled lokacije v 3D](topic:site-3d) |
| Teksture iz fotografij, snemanje vožnje kot video, sence od zunaj lokacije, ure sonca, prikazane v pogledu 3D | Kartni sloji, položeni na površja; vožnja in položaj sonca ob enem času; [ure sonca](topic:sun-hours) za dan ali sezono v načrtu |
