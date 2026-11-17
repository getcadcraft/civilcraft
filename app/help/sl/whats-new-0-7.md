---
title: Kaj je novega v 0.7 (prej)
summary: CivilCraft 0.7 dodaja delovno okolje daljnovodov (nadzemne vode in podzemne kable z lastnimi knjižnicami, povešanje in napetost, preverjanja odmikov in trdnosti, tabele napeljave, količine, liste in GIS), delovno okolje krajinske ureditve (seznam rastlin, načrte sajenja in razpredelnice, niveliranje, tlakovanje, zidove in stopnice, pripomoček za izračun namakanja, liste krajinske ureditve in prostoročne objekte), gradbene mase z omejitvami prostorske ureditve, ki jih vpišete, in urami sončne svetlobe, klotoidne prehodnice, koridorje iz delov na vsaki strani, izvoz USD ter več orodij za pomočnike.
keywords: kaj je novega 0.7, prejšnja izdaja, opombe ob izdaji, dnevnik sprememb, spremembe, 0.7, različica, nove funkcije, krajinska ureditev, delovno okolje krajinske ureditve, seznam rastlin, rastline, sajenje, razpredelnica rastlin, greda, živa meja, niveliranje, ploščad, berma, jarek, kota točke, analiza naklona, zajezitev vode, utrjene površine, tlakovanje, pot, zid, robnik, rampa, stopnice, namakanje, brizgalnik, kapljično, liste krajinske ureditve, prostoročni objekt, gradbena masa, masiranje, bruto tlorisna površina, prostorska ureditev, zoning, odmik, ovojnica, ravnina neba, faktor izrabe, zazidanost, ure sonca, senca, ifc, razvij v BimCraft, prehodnica, klotoida, prehod, sestav, robnik, obcestni jarek, pločnik, usd, pomočniki, enote, portugalščina
from: 797d2f2f
---

To so spremembe v CivilCraft 0.7 v primerjavi z 0.6. Največji novi deli sta delovni okolji daljnovodov in krajinske ureditve ter gradbene mase.

## Novo

### Delovno okolje krajinske ureditve

- **Delovno okolje krajinske ureditve na istem mestu.** {{ui:Površje}} › {{ui:Več}} › {{ui:Delovno okolje krajinske ureditve}} doda orodja za sajenje, niveliranje, utrjene površine in namakanje na obstoječe mesto: iste točke, površja in datoteko projekta. Za vrnitev izberite **Civil** pod **Delovno okolje**. Glejte [Delovno okolje krajinske ureditve](topic:landscape).
- **Seznam rastlin.** Približno 420 pogostih drevesnih, grmovnih, živih mej, trav, trajnic, zemeljskih prekrivk in vzpenjavk zmernega in sredozemskega podnebja z velikostmi ob sajenju in pri zrelosti, območjem odpornosti, svetlobo, vodo in razmikom. Iščite po katerem koli imenu v angleščini, španščini ali portugalščini. Lastni seznam uvozite kot CSV; shrani se skupaj s projektom. Vgrajene velikosti so tipične in zaokrožene: preverite jih pri lokalnem vrtnarju. Glejte [Seznam rastlin](topic:plant-list).
- **Načrti sajenja.** {{ui:Rastlina}} postavi posamezne rastline, ki ležijo na tleh in po poznejšem niveliranju sledijo terenu; {{ui:Greda}} zapolni obris z razmikom rastlin in mešanico po odstotkih; {{ui:Živa meja}} postavi eno ali dve vrsti ob črto. Rastline so na načrtu označene. Glejte [Načrti sajenja in razpredelnice](topic:planting).
- **Razpredelnica rastlin.** Več › {{ui:Razpredelnica rastlin …}} prešteje rastline po vrsti in velikosti ob sajenju. Shranite jo kot CSV ali XLSX ali pošljite v TakeoffCraft za izračun cene. Glejte [Razpredelnica rastlin](topic:planting#the-plant-schedule).
- **Niveliranje za krajinsko ureditev.** {{ui:Niveliranje}} ima ploščadi (ravne ali padajoče), berme, jarke in območja niveliranja s kotami točk in plastnicami, ki jih vlečete. Izkop in nasip se prikazujeta sproti. **Analiza naklona** pobarva površje po vaših dveh mejnih vrednostih, **Puščice toka in zajezitev vode** pa pokažeta, kje teče voda in kje bi se zadrževala. Vse to gre v isto predlagano površje kot ploščadi in koridorji. Glejte [Niveliranje za krajinsko ureditev](topic:landscape-grading).
- **Tlakovanje, poti, zidovi, robniki, rampe in stopnice.** {{ui:Utrjene površine}} riše tlakovanje s prečnim nagibom ali padcem k odtoku, vzorcem in njegovimi plastmi; poti, ki sledijo terenu; podporne in samostoječe zidove s stopnjastimi temelji; robnike; ter rampe in stopnice, preverjene glede na mejne vrednosti, ki jih nastavite. Podporni zid, višji od 1.2 m (4 ft), je označen za inženirja. Glejte [Tlakovanje, zidovi in stopnice](topic:hardscape).
- **Pripomoček za izračun namakanja.** {{ui:Namakanje}} postavi brizgalnike, veje cevi, glavni vod, ventile, kapalne linije in mesto priključitve. {{ui:Preveri sistem …}} poišče cone iz cevi in izračuna pretok vsake cone, tlak, potreben na njenem ventilu in na dovodu (Hazen–Williams), padavine, čase delovanja, pokritost in kosovnico. Gre za pripomoček za izračun, ne za potrditev projekta: vsak rezultat preveri načrtovalec namakanja. Brizgalniki so splošnih vrst ali vaši iz datoteke. Glejte [Načrtovanje namakanja](topic:irrigation).
- **Liste krajinske ureditve.** Več › {{ui:Listi krajinske ureditve …}} pripravi načrte sajenja, niveliranja in namakanja z njihovimi legendami ter list s podrobnostmi z odseki zidov, sestavo tlakovanja in stopnicami, kot en PDF. Glejte [Listi krajinske ureditve](topic:landscape-sheets).
- **Prostoročni objekti.** Več › {{ui:Prostoročni objekt …}} postavi mrežo STL, OBJ ali element knjižnice, narejen v drugem programu, na primer koritce ali kip. Stoji na tleh ali se vanje vreže; njegova prostornina, površina in tlorisna površina se preštejejo. Glejte [Prostoročni objekti](topic:freeform-objects).
- **IFC krajinske ureditve.** Več › {{ui:Izvozi IFC krajinske ureditve}} shrani rastline (kot rastlinje z njihovimi lastnostmi), utrjene površine in prostoročne objekte kot IFC 4.3 za model BIM. Glejte [IFC](topic:planting#ifc).
- **Od začetka do konca.** [Oblikujte vrt od začetka do konca](topic:landscape-walkthrough) vodi skozi celotno delovno okolje na vzorčnem mestu.

### Delovno okolje daljnovodov

- **Nadzemni vodi in podzemni kabli na vašem mestu.** {{ui:Površje}} › {{ui:Več}} › {{ui:Delovno okolje daljnovodov}}: narišite vod po njegovih podporah, kable v jarkih, opremo in ovire na istem terenu in v isti datoteki projekta. Glejte [Delovno okolje daljnovodov](topic:power-lines).
- **Vaše lastne knjižnice.** Vodniki, kabli, podpore, oprema (prečke, izolatorji, fitingi, zategi, transformatorji, omarice, spojke) in tipi jarkov v kategorijah, ki jih poimenujete; delijo se kot datoteka ali preglednica. Vgrajenega kataloga nobene države ali proizvajalca ni; primeri so označeni kot primeri. Glejte [Vaša knjižnica daljnovodov](topic:power-line-library).
- **Povešanje in napetost pri vaših obremenitvenih primerih.** Temperatura, veter, led in led na eni strani; mejne vrednosti napetosti kot delež prekinitvene trdnosti; natančna verižnica na vsakem razponu, tudi na nagibih; tabele napeljave. Glejte [Povešanje in napetost](topic:sag-and-tension).
- **Preverjanja, vedno posodobljena.** Odmik nad tlemi in ovirami, razmik faz, nihanje izolatorjev, dvig, obremenitve podpor z dimenzioniranjem iz vaše knjižnice, zategi, fitingi, temelji, manjkajoči podatki, odklopljeni kabli, preobremenitve in padec napetosti, označeno na načrtu in na profilu voda. Pripomoček za načrtovanje: preveri inženir. Glejte [Preverjanja daljnovodov](topic:power-line-checks).
- **Tabele, liste in GIS.** Tabele napeljave in podpor, količine (CSV, Excel, TakeoffCraft), liste načrta in profila s poročilom o študiji v enem PDF-ju, sloji GIS s podatki vsakega sredstva. Glejte [Tabele, količine, liste in GIS za daljnovode](topic:power-line-outputs).
- **Po prvih poskusih.** Profil voda sledi vodu, ki ga izberete, ima seznam **Vod** in pod kazalcem prebere teren, vodnik in odmik ter izmeri med dvema točkama. Rastline in zidovi v krajini se štejejo kot ovire pod vodi; trase kablov in cevi se prikažejo v profilu voda in križajo z odmikom, ki ga izberete; **Pravila …** ob vsakem odmiku odpre vaša pravila; nabori pravil z knjižnico se shranijo kot paketi za deljenje po državah. Glejte [Preverjanja daljnovodov](topic:power-line-checks) in [Paketi](topic:sag-and-tension#packs-rules-and-a-library-for-a-country).
- **Vaše lastne datotečne oblike.** Daljnovodi se shranjujejo v datoteko projekta CivilCraft, knjižnice v `.cclines.json` ali CSV, nabori pravil in paketi v lastnih datotekah JSON: odprtih oblikah, ki jih lahko vsakdo prebere ali pretvori. Datoteka študije `.DON` je dodaten uvoz in izvoz poleg njih.
- **Datoteke študije (.DON), še nepreizkušeno.** Vod shranite kot datoteko študije `.DON` za drug program za daljnovode ali preberete podpore iz nje; zgrajeno iz imen polj formata, še ni preizkušeno s tem programom. Glejte [Datoteke študije](topic:power-line-study-file).

### Merjenje

- **Orodje Meri.** {{ui:Površje}} › {{ui:Več}} › {{ui:Meri}} (ali {{key:M}}) meri na tlorisu: dolžino in smer vsake stranice, tekoči seštevek, dolžino po terenu in nagib ter površino in obseg, ko zaprete obliko. V projekt ničesar ne riše. Glejte [Meri](topic:measure).

### Gradbene mase

- **Risanje gradbenih mas.** V Lastnostih pod **Gradbene mase** {{ui:Nariši maso}} (ali {{ui:Površje}} › {{ui:Več}} › {{ui:Mase}}). Masi dajte etaže in višino etaže ter preberite njeno bruto tlorisno površino. Izberite, kako sedi na nagnjenem terenu (stopničasto, podstavek ali izkop), in poglejte nasip in izkop. Mase so prikazane na tlorisu, v PDF-ju ter v DWG in DXF na lastnih slojih. Glejte [Risanje gradbenih mas na mestu](topic:building-masses).
- **Potisk in vlek v 3D.** V pogledu 3D povlecite streho izbrane mase ali pritisnite {{key:PageUp}} in {{key:PageDown}}, da jo spreminjate po eno etažo naenkrat, v enem koraku razveljavitve. {{ui:Sonce}} vrže sence mas. Glejte [V pogledu 3D](topic:building-masses#in-the-3d-view).
- **Omejitve prostorske ureditve, ki jih vpišete.** Odmiki po vrsticah od ulične meje, omejitev višine, ravnina odprtosti neba, faktor izrabe in zazidanost. Gradbena ovojnica se riše na tlorisu, vsaka masa pa dobi kljukico ali križec za vsako omejitev. CivilCraft nima vgrajenih predpisov o prostorski ureditvi: vsako število vpišete iz svojega odloka. Glejte [Preverite mase glede na omejitve, ki jih vpišete](topic:zoning-limits).
- **Ure sonca.** Izberite dan ali letni čas ter časovni pas po imenu ali odmiku in preberite ure neposredne sončne svetlobe na vsaki steni vsake mase, etaži za etažo, ter na terenu okoli njih, narisane na tlorisu. Stene in teren shranite kot CSV. Projekt potrebuje koordinatni sistem. Glejte [Ugotovite ure sonca na mestu](topic:sun-hours).
- **Mase kot IFC in naprej v BimCraft.** {{ui:Mase kot IFC}} shrani mase kot IFC4, postavljene na zemljevid, ko ima projekt koordinatni sistem. {{ui:Razvij v BimCraft}} odpre BimCraft v novem zavihku z masami, kjer **Razvij to maso** zgradi stene na vsaki etaži in tla iz tlorisne površine. Nič se ne naloži. Glejte [Pošiljanje naprej](topic:building-masses#send-it-on).

### Trase

- **Klotoidne prehodnice.** V tabeli PI za krivino vpišite dolžino v **Prehodnica v** in **Prehodnica iz**: tangenta, prehodnica, krivina, prehodnica, tangenta, z enakimi ali različnimi dolžinami. Načrt označi TS, SC, CS in ST, seznam krivin poda θs ter tangentne in zunanje razdalje, stacionaže in odmiki pa tečejo skozi prehodnice. Glejte [Prehodnice](topic:alignment#spirals).
- **Prehodnice v LandXML.** LandXML zapisuje in bere klotoidne prehodnice. Trase s prehodnicami, ki jih je CivilCraft prej preskočil pri uvozu, se zdaj odprejo. Glejte [Izmenjava LandXML](topic:landxml).

### Koridorji

- **Vsako stran sestavite iz delov.** Vklopite **Vsako stran sestavite iz delov**, da ima vsaka stran svoj seznam od osi navzven: vozne pasove, bankino, obcestni jarek, robnik, zeleni pas, pločnik in stransko pobočje z lastnim izkopom in nasipom. Začnite z {{ui:Podeželska cesta}} ali {{ui:Mestna ulica}} in kopirajte eno stran na drugo. Prečni prerezi označijo linijo toka, robnik in hodnik, niveliranem površju pa ima robnik. Glejte [Vsako stran sestavite iz delov](topic:corridor#build-each-side-from-parts).
- **Nadvišanje čez prehodnice.** Pri krivini s prehodnicami se izteka nadvišanja odvija čez prehodnico: na TS brez prečnega nagiba, na SC polno nadvišanje. Glejte [Nadvišanje](topic:corridor#superelevation).

### Datoteke 3D

- **Izvoz USD.** V pogledu 3D {{ui:USD}} zapiše mesto kot `.usda`, `.usdc` ali `.usdz` v pravi velikosti in na koordinatah projekta: površja, cevi in objekti kot mreže, trase, vsaka trasa, ter točke na terenu s številkami. Glejte [Izvoz mesta v 3D kot USD](topic:usd).

### Pomočniki z umetno inteligenco

- **Več za pomočnike.** Ko so pomočniki vklopljeni v {{ui:Nastavitve}} › {{ui:CivilCraft}}, lahko pomočnik zdaj tudi bere parcele, izkop in nasip ter profile, dodaja točke na terenu, shrani projekt, izvozi LandXML, DWG in USD ter dela v mapah, ki jih izberete, v CadCraft Studio. Delovno okolje krajinske ureditve doda orodja za iskanje rastlin, postavljanje rastlin, gred in živih mej, niveliranje in preverjanje namakanja. Strežnik datotek in ukazna vrstica `cadcraft` odpreta shranjene projekte brez okna. Glejte [Naj pomočnik z umetno inteligenco dela z vašim mestom](topic:assistants).

## V vseh programih

- **Enote.** {{ui:Nastavitve}} › {{ui:Splošno}} › {{ui:Enote}} ima po en seznam za dolžino, površino, prostornino, kot in nagib, z natančnimi velikostmi, ki jih dajo definicije enot (ameriška geodetska stopala so njihova lastna enota). Izklopite enote, ki jih nikoli ne uporabite, in zapustijo sezname enot; označite eno z zvezdico, in nova dela se začnejo v njej. Datoteka vedno ohrani svojo enoto. V CivilCraft seznam **Enote** projekta sledi stikalom; zvezdica za metrsko dolžino začne nove projekte v metrih (sicer v ameriških geodetskih čevljih), zvezdica za površino ali prostornino nastavi enoto, v kateri se poročajo površine in prostornine, polje za dolžino pa sprejme oznako katere koli enote, na primer `3 ch` ali `450 mm`. Glejte [Enote, vpisane vrednosti in seznami enot](common:unit-lists).
- **Gostejša postavitev in plošče, ki se umaknejo.** {{ui:Nastavitve}} › {{ui:Splošno}} › {{ui:Gostota postavitve}} › {{ui:Strnjeno}} prikaže več na zaslonu (zasloni na dotik in telefoni ohranijo velike gumbe). Vsaka stranska plošča ima ozko naslovno vrstico: povlecite jo, da jo pripnete ali naredite plavajočo, spustite jo na naslovno vrstico druge plošče, da delita en okvir kot zavihka, jo pripnete, da zdrsne na rob, ali jo skrijete in vrnete z roba. Glejte [Razporeditev plošč](common:arrange-panels#make-the-layout-denser).
- **Pogovorna okna se premikajo.** Pogovorno okno povlecite za naslovno vrstico stran od risbe; ko se vrne, je tam, kjer ste ga pustili. Dvakrat kliknite naslovno vrstico, da se spet postavi na sredino. Glejte [Premik pogovornega okna](common:arrange-panels#move-a-dialog).
- **Recepti za pomočnike z umetno inteligenco.** Deset zgledov zahtev za vašega pomočnika (urejanje risbe, izris nabora, preverjanje risb, vprašanja o modelu, seštevek popisa, poskus variante dela …), vsaka z orodji, ki jih kliče, in dovoljenji, ki jih potrebuje, in vsakega preverijo naši testi. Aplikacije ne vsebujejo nobene umetne inteligence. Glejte [Recepti za pomočnike](common:assistants-recipes).
- **Jeziki.** **Português (Portugal)** je nov v {{ui:Nastavitve}} › {{ui:Splošno}} › {{ui:Jezik}}. Ta, **Português (Brasil)**, **Español (México)** in **Bahasa Indonesia** imajo zdaj vse besede programov kot osnutke, ki jih še ni pregledal izvorni govorec. Teme pomoči so v angleščini, nekatere v španščini.
- **CadCraft Studio** pove, zakaj preverjanje posodobitev ni uspelo (še ni datoteke za vaš sistem, ni omrežja, napačen podpis), namesto le „Končano“, in preneha vračati kartico Kaj je novega, ki ste jo zaprli, dokler ni novejše izdaje.

## Še ni v tej različici

- **0.7 ni podpisan s kodo.** Podpisovanje in paket trgovine Microsoft Store sta prestavljena v 0.8, ker potrdilo še ni bilo overjeno. Preverite SHA-256 ob vsaki datoteki na getcadcraft.com/download. Na Windows, če SmartScreen ustavi namestitveni program, izberite {{ui:Več informacij}}, nato {{ui:Vseeno zaženi}}. Na Macu prvič z desnim klikom kliknite CadCraft Studio in izberite {{ui:Odpri}}. CadCraft Studio še ni v trgovini z aplikacijami in še ni izdelave za iPad ali iPhone.
- Seznama kotov in nagibov v {{ui:Enote}} sta shranjena, vendar ju zaenkrat nobeno polje ne bere.
- Proizvajalčevi brizgalniki za namakanje: samo splošni brizgalniki in vaši iz datoteke. Podatki proizvajalcev pridejo le z njihovim dovoljenjem, ki ga zaenkrat še ni bilo.
- BimCraft in ModelCraft nosita seznam rastlin, vendar njihova funkcija Postavi iz knjižnice zaenkrat ne ponuja rastlin. Rastline pridejo v BimCraft prek IFC krajinske ureditve.
- Orodja krajinske ureditve za pomočnike delujejo z odprtim oknom CivilCraft; strežnik datotek in ukazna vrstica jih še nimata.
- Gradbene mase: brez dnevne svetlobe ali vetra na fasadi, brez sence od dreves ali česa, kar ni narisano kot masa, brez oblik streh, ure sonca pa so prikazane na tlorisu, ne v pogledu 3D. Razvij v BimCraft zgradi preproste stene in tla brez odprtin ali strehe.
- Daljnovodi: brez vgrajenega standarda katere koli države (nastavite obremenitvene primere, mejne vrednosti in odmike); brez študij puzenja vodnikov, toplotne obremenitve zakopanih kablov, kratkega stika, zaščite ali ozemljitve; brez vodov v pogledu 3D ali IFC. Datoteka študije `.DON` ni bila preizkušena s programom, ki jo bere.
- Prehodnice, ki niso klotoidne, prehodnica med dvema krivinama in prehodnice v karakterističnih črtah. Prehodnice so bile preverjene po formulah in shemi LandXML, še ne z datoteko LandXML s prehodnicami iz drugega programa.
- Sestavi koridorja, ki se spreminjajo vzdolž ceste, regije in cilji za stransko pobočje.
- Vodovodne cevi in tlačna omrežja (naslednje civilno delo), tokovi, ki se spreminjajo s časom, in povezave med vodnimi in meteornimi omrežji.
- Loki v narisanih prelomnicah. Standardne tabele projektnih vozil: pet vozil, ki so priložena, so označena kot začasna mesta. Karakteristične črte, deljene med projekti, čakajo na skupne projekte.

Vse drugo je v [Še ni izdelano](topic:not-built-yet).
