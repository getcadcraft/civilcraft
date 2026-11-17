---
title: Nýtt í 0.7 (eldra)
summary: CivilCraft 0.7 bætir við vinnusvæði fyrir raflínur (loftlínur og jarðstrengi með eigin söfnum, slaki og spennu, athugunum á fjarlægð og styrk, strengjatöflum, magntölum, blöðum og GIS), vinnusvæði fyrir landslag (plöntulista, gróðursetningaráætlunum og listum, landmótun, hellulögn, veggjum og þrepum, áveitureiknihjálp, landslagsblöðum og frjálsum hlutum), byggingarmössum með mörkum úr skipulagi sem þú slærð inn og sólarstundum, klóþoíðaspírölum, göngum með hlutum beggja vegna, USD-útflutningi og fleiri verkfærum fyrir gervigreindaraðstoðarmenn.
keywords: nýtt 0.7, eldri útgáfa, útgáfuskýringar, breytingaskrá, breytingar, 0.7, útgáfa, nýir eiginleikar, landslag, vinnusvæði fyrir landslag, plöntulisti, plöntur, gróðursetning, plöntuáætlun, beð, limgerði, landmótun, pallur, bermur, rennur, punkthæð, hallagreining, pollur, harðyfirborð, hellulögn, stígur, veggur, kantsteinn, rampa, þrep, áveita, úðari, dropaáveita, landslagsblöð, frjáls hlutur, byggingarmassi, massi, brúttógólfflötur, skipulag, byggingarfjarlægð, umslag, himinflötur, nýtingarhlutfall, þekja, sólarstundir, skuggi, ifc, þróa í bimcraft, spíral, klóþoíð, umskipti, samsetning, kantsteinn, rennusteinn, gangstétt, usd, aðstoðarmenn, einingar, portúgalska
from: 797d2f2f
---

Þetta er það sem breyttist í CivilCraft 0.7, miðað við 0.6. Stærstu nýju hlutarnir eru vinnusvæðin Raflínur og Landslag og byggingarmassar.

## Nýtt

### Vinnusvæðið Landslag

- **Vinnusvæði Landslags á sama svæði.** {{ui:Yfirborð}} › {{ui:Meira}} › {{ui:Landslagsvinnusvæði}} bætir gróðursetningu, landmótun, harðyfirborði og áveitu við svæðið sem þú átt nú þegar: sömu mælipunkta, yfirborð og verkefnaskrá. Veldu **Civil** undir **Vinnusvæði** til að fara til baka. Sjá [Vinnusvæðið Landslag](topic:landscape).
- **Plöntulisti.** Um 420 algengar tempraðar og Miðjarðarhafsplöntur: tré, runnar, limgerði, grös, fjölærar plöntur, þekjuplöntur og klifurplöntur, með stærðum við gróðursetningu og við fullan vöxt, hörkusvæði, birtu, vatnsþörf og bili. Leitaðu eftir hvaða nafni sem er á ensku, spænsku eða portúgölsku. Fluttu inn þinn eigin lista sem CSV; hann er vistaður með verkefninu. Innbyggðu stærðirnar eru dæmigerðar og námundaðar: athugaðu þær hjá staðbundinni gróðrarstöð. Sjá [Plöntulistinn](topic:plant-list).
- **Gróðursetningaráætlanir.** {{ui:Planta}} setur einstakar plöntur sem standa á jörðinni og fylgja síðari landmótun, {{ui:Beð}} fyllir útlínu með bili plantnanna og blöndu eftir hlutfalli, og {{ui:Limgerði}} setur eina eða tvær raðir eftir línu. Plöntur eru merktar á áætluninni. Sjá [Gróðursetningaráætlanir og listar](topic:planting).
- **Plöntulisti á blaði.** Meira › {{ui:Plöntulisti…}} telur plönturnar eftir tegund og gróðursetningarstærð. Vistaðu hann sem CSV eða XLSX, eða sendu hann í TakeoffCraft til verðlagningar. Sjá [Plöntulistinn á blaði](topic:planting#the-plant-schedule).
- **Landmótun fyrir landslag.** {{ui:Landmótun}} hefur palla (láréttir eða hallandi), bermur, rennur og landmótunarsvæði með punkthæðum og hæðarlínum sem þú dregur. Skurður og fylling birtast jafnóðum. **Hallagreining** litar yfirborðið eftir tveimur mörkum sem þú setur, og **Rennslisörvar og pollar** sýna hvar vatn rennur og hvar það myndi safnast í poll. Allt fer í sama tillögufleti og undirlög og gangar. Sjá [Landmótun fyrir landslag](topic:landscape-grading).
- **Hellulögn, stígar, veggir, kantsteinar, rampar og þrep.** {{ui:Harðyfirborð}} teiknar hellulögn með þverhalla eða halla að niðurfalli, mynstri og lögum hennar; stíga sem fylgja landinu; haldveggi og frístandandi veggi með þrepuðum undirstöðum; kantsteina; og rampa og þrep sem eru athuguð við mörk sem þú setur. Haldveggur yfir 1.2 m (4 ft) er merktur fyrir verkfræðing. Sjá [Hellulögn, veggir og þrep](topic:hardscape).
- **Reiknihjálp fyrir áveitu.** {{ui:Áveita}} setur úðahausa, hliðarlagnir, aðallögnina, loka, dropalagnir og tengipunktinn. {{ui:Athuga kerfið…}} finnur svæðin út frá lögnunum og reiknar flæði hvers svæðis, þrýstinginn sem þarf við loka þess og við veituna (Hazen–Williams), úrkomu, keyrslutíma, þekju og efnisskrá. Þetta er reiknihjálp, ekki hönnunarvottun: hönnuður áveitu yfirfer allar niðurstöður. Úðahausarnir eru almennar gerðir eða þínir eigin úr skrá. Sjá [Hönnun áveitu](topic:irrigation).
- **Landslagsblöð.** Meira › {{ui:Landslagsblöð…}} býr til gróðursetningar-, landmótunar- og áveituáætlanir ásamt skýringum sínum, og smáatriðablað með veggsniðum, hellulagnauppbyggingu og þrepum, sem eitt PDF. Sjá [Landslagsblöð](topic:landscape-sheets).
- **Frjálsir hlutir.** Meira › {{ui:Frjálst hlutur…}} setur STL-, OBJ- eða safnhlut (möskva) sem var gerður í öðru forriti, svo sem blómaker eða höggmynd. Hann situr á jörðinni eða sker inn í hana, og rúmmál hans, flatarmál og grunnflötur eru talin. Sjá [Frjálsir hlutir](topic:freeform-objects).
- **Landslags-IFC.** Meira › {{ui:Flytja út landslags-IFC}} vistar plöntur (sem gróður með eiginleikum sínum), harðyfirborð og frjálsa hluti sem IFC 4.3 fyrir BIM-líkan. Sjá [IFC](topic:planting#ifc).
- **Frá upphafi til enda.** [Hanna garð frá upphafi til enda](topic:landscape-walkthrough) fer yfir allt vinnusvæðið á sýnisvæðinu.

### Vinnusvæðið Raflínur

- **Loftlínur og jarðstrengir á svæðinu þínu.** {{ui:Yfirborð}} › {{ui:Meira}} › {{ui:Raflínuvinnusvæði}}: teiknaðu línu eftir stoðum hennar, strengi í skurðum, búnað og hindranir, á sama landi og í sömu verkefnaskrá. Sjá [Vinnusvæðið Raflínur](topic:power-lines).
- **Þín eigin söfn.** Leiðarar, strengir, stoðir, búnaður (þverslár, einangrarar, tengihlutir, stög, spennar, skápar, samskeyti) og skurðargerðir, í flokkum sem þú nefnir, deilt sem skrá eða töflureikni. Engin vörulisti lands eða framleiðanda er innbyggður; dæmin segja að þau séu dæmi. Sjá [Safn raflína](topic:power-line-library).
- **Slak og spenna undir þínum álagstilvikum.** Hitastig, vindur, ís og ís á annarri hliðinni; spennumörk sem hlutfall af brotstyrk; nákvæm keðjulína á hverju spani, einnig í hallandi landi; strengjatöflur. Sjá [Slak og spenna](topic:sag-and-tension).
- **Athuganir, alltaf uppfærðar.** Fjarlægð yfir jörð og hindranir, fasabil, sveifla einangrara, uppátak, álag á stoðir með stærðarvali úr safninu þínu, stög, tengihlutir, undirstöður, vöntun gagna, aftengdir strengir, ofálag og spennufall, merkt á uppdrættinum og á línusniðinu. Hönnunarhjálp: verkfræðingur yfirfer hana. Sjá [Athuganir á raflínum](topic:power-line-checks).
- **Töflur, blöð og GIS.** Strengja- og stoðatöflur, magntölur (CSV, Excel, TakeoffCraft), uppdrættir og snið með rannsóknarskýrslu í einu PDF, GIS-lög með gögnum allra eigna. Sjá [Töflur, magntölur, blöð og GIS fyrir raflínur](topic:power-line-outputs).
- **Eftir fyrstu tilraunirnar.** Línusniðið fylgir línunni sem þú velur, hefur lista yfir **Línu**, les jörðina, leiðarann og fjarlægðina undir bendlinum og mælir milli tveggja punkta. Plöntur og veggir í landslagi teljast hindranir undir línum; strengjaleiðir og lagnir birtast í línusniðinu og skerast með fjarlægðarreglu sem þú velur; **Reglur…** við hverja fjarlægð opnar þínar eigin reglur; og reglusöfn með safni eru vistuð sem pakkar til að deila eftir landi. Sjá [Athuganir á raflínum](topic:power-line-checks) og [Pakkar](topic:sag-and-tension#packs-rules-and-a-library-for-a-country).
- **Þín eigin skráarsnið.** Raflínur eru vistaðar í CivilCraft-verkefnaskránni, söfn í `.cclines.json` eða CSV, reglusöfn og pakkar í eigin JSON-skrám: opin snið sem hver sem er getur lesið eða breytt. Rannsóknarskráin `.DON` er auka innflutningur og útflutningur við hlið þeirra.
- **Rannsóknarskrár (.DON), óprófaðar.** Vistaðu línu sem `.DON`-rannsóknarskrá fyrir annað forrit fyrir raflínur, eða lestu stoðir úr slíkri skrá; byggt á reitaheitum sniðsins, ekki enn prófað með því forriti. Sjá [Rannsóknarskrár](topic:power-line-study-file).

### Mælingar

- **Mælitól.** {{ui:Yfirborð}} › {{ui:Meira}} › {{ui:Mæla}} (eða {{key:M}}) mælir á uppdrættinum: lengd og stefnu hverrar hliðar, heildarsumman, lengdina eftir jörðinni og hallann, og flatarmál og ummál þegar þú lokar forminu. Ekkert er teiknað inn í verkefnið. Sjá [Mæla](topic:measure).

### Byggingarmassar

- **Teiknaðu byggingarmassa.** Í {{ui:Eiginleikar}}, undir **Byggingarmassar**, {{ui:Teikna massa}} (einnig {{ui:Yfirborð}} › {{ui:Meira}} › {{ui:Massar}}). Gefðu massa hæðir og hæð hverrar hæðar og lestu brúttógólfflöt hans. Veldu hvernig hann situr á hallandi landi (þrepaður, sökkull eða skorinn) og sjáðu fyllingu og skurð. Massar birtast á uppdrættinum, í PDF og í DWG og DXF á eigin lögum. Sjá [Teiknaðu byggingarmassa á svæði](topic:building-masses).
- **Ýttu og togaðu í þrívídd.** Í þrívíddarsýn dregurðu þak valins massa, eða ýtir á {{key:PageUp}} og {{key:PageDown}}, til að breyta honum hæð fyrir hæð, í einu afturkallsskrefi. **Sól** varpar skuggum massanna. Sjá [Í þrívíddarsýn](topic:building-masses#in-the-3d-view).
- **Skipulagsmörk sem þú slærð inn.** Byggingarfjarlægðir línu fyrir línu frá götulínunni, hæðarmörk, himinflötur, nýtingarhlutfall og þekja. Byggingarsvæðið er teiknað á uppdráttinn, og hver massi fær hakmerki eða kross fyrir hvert mark. CivilCraft hefur enga skipulagsreglugerð innbyggða: hver tala er tala sem þú slærð inn úr þinni eigin samþykkt. Sjá [Athugaðu massa á móti skipulagsmörkum sem þú slærð inn](topic:zoning-limits).
- **Sólarstundir.** Veldu dag, eða árstíð, og tímabelti eftir heiti eða frávikum, og lestu fjölda klukkustunda beinnar sólar á hverjum vegg hvers massa, hæð fyrir hæð, og á landinu í kringum þá, teiknað á uppdráttinn. Vistaðu veggina og landið sem CSV. Verkefnið þarf hnitakerfi. Sjá [Reiknaðu út sólarstundir á svæði](topic:sun-hours).
- **Massar sem IFC, og áfram í BimCraft.** {{ui:Líkön sem IFC}} vistar massana sem IFC4, staðsetta á kortinu þegar verkefnið hefur hnitakerfi. {{ui:Vinna áfram í BimCraft}} opnar BimCraft í nýjum flipa með massunum, þar sem **Þróa þennan massa** býr til veggi á hverri hæð og gólf út frá grunnfletinum. Ekkert er hlaðið upp. Sjá [Senda áfram](topic:building-masses#send-it-on).

### Veglínur

- **Klóþoíðaspíralar.** Sláðu inn lengd í **Spíral inn** og **Spíral út** í PI-töflunni fyrir boga: snertill, spíral, bogi, spíral, snertill, með jafnlöngum eða mismunandi lengdum. Uppdrátturinn merkir TS, SC, CS og ST, bogalistinn gefur θs og snertil- og ytri fjarlægðir, og stöðvar og frávik ganga í gegnum spíralana. Sjá [Spíralar](topic:alignment#spirals).
- **Spíralar í LandXML.** LandXML skrifar og les klóþoíðaspírala. Veglínur með spíröllum, sem CivilCraft sleppti áður við innflutning, opnast nú. Sjá [Flytja LandXML inn og út](topic:landxml).

### Gangar

- **Byggðu hvora hlið úr hlutum.** Kveiktu á **Byggja hvora hlið úr hlutum** til að hvor hlið fái sinn lista frá miðlínu út: akreinar, öxl, rennusteinn, kantsteinn, gróðurrönd, gangstétt og hliðarhalli með sínum skurði og fyllingu. Byrjaðu á {{ui:Sveitavegur}} eða {{ui:Þéttbýlisgata}} og afritaðu aðra hliðina yfir á hina. Þversnið merkja rennslislínu, kantstein og gangstétt, og landmótaða yfirborðið hefur kantsteininn. Sjá [Byggðu hvora hlið úr hlutum](topic:corridor#build-each-side-from-parts).
- **Yfirhækkun yfir spíralum.** Á boga með spíröllum liggur yfirhækkunarhlaupið yfir spírallinn: jöfn kambur við TS, full yfirhækkun við SC. Sjá [Yfirhækkun](topic:corridor#superelevation).

### Þrívíddarskrár

- **USD-útflutningur.** Í þrívíddarsýn skrifar {{ui:USD}} svæðið sem `.usda`, `.usdc` eða `.usdz` í réttum mælikvarða og í hnitum verkefnisins: fletir, lagnir og mannvirki sem möskvar, línur, hver veglína og mælipunktar með númerum sínum. Sjá [Flytja þrívíddarsvæðið út sem USD](topic:usd).

### Gervigreindaraðstoðarmenn

- **Meira fyrir aðstoðarmenn.** Með kveikt á aðstoðarmönnum í {{ui:Stillingar}} › {{ui:CivilCraft}} getur aðstoðarmaður nú einnig lesið lóðir, skurð og fyllingu og snið, bætt við mælipunktum, vistað verkefnið, flutt út LandXML, DWG og USD, og unnið í möppum sem þú velur í CadCraft Studio. Vinnusvæðið Landslag bætir við verkfærum til að finna plöntur, setja niður plöntur, beð og limgerði, landmóta og athuga áveituna. Skráaþjónninn og skipanalínan `cadcraft` opna vistuð verkefni án gluggans. Sjá [Láttu gervigreindaraðstoðarmann vinna með svæðið þitt](topic:assistants).

## Í öllum forritum

- **Einingar.** {{ui:Stillingar}} › {{ui:Almennt}} › {{ui:Einingar}} hefur einn lista fyrir hvert af lengd, flatarmáli, rúmmáli, horni og halla, með nákvæmu stærðunum sem skilgreiningar eininganna gefa (bandaríski landmælingafóturinn er sín eigin eining). Slökktu á einingum sem þú notar aldrei og þær hverfa af einingalistunum; stjörnumerktu eina og nýtt verk byrjar í henni. Skrá heldur alltaf sinni eigin einingu. Í CivilCraft fylgir listi verkefnisins **Einingar** rofunum; stjörnumerkt metralengd byrjar nýju verkefnin í metrum (annars fetum, sem eru bandarísk landmælingafet), stjörnumerkt flatarmál eða rúmmál ákveður einingarnar sem flatarmál og rúmmál eru skráð í, og reitur fyrir lengd tekur við tákni hverrar einingar, svo sem `3 ch` eða `450 mm`. Sjá [Einingar, slegin gildi og einingalistarnir](common:unit-lists).
- **Þéttara skipulag og spjöld sem renna undan.** {{ui:Stillingar}} › {{ui:Almennt}} › {{ui:Þéttleiki skipulags}} › {{ui:Þétt}} kemur meiru fyrir á skjánum (snertiskjáir og símar halda stóru hnöppunum sínum). Hvert hliðarspjald er með mjóa titilstiku: dragðu hana til að festa eða fljóta spjaldið, slepptu henni á titilstiku annars spjalds til að deila einum ramma sem flipum, festu hana til að renna undan að brúninni, eða feldu hana og kallaðu hana aftur úr brúninni. Sjá [Raða spjöldunum](common:arrange-panels#make-the-layout-denser).
- **Gluggar færast.** Dragðu glugga með titilstikunni úr vegi teikningarinnar; hann kemur aftur þangað sem þú skildir við hann. Tvísmelltu á titilstikuna til að miðja hann aftur. Sjá [Færa glugga](common:arrange-panels#move-a-dialog).
- **Uppskriftir fyrir gervigreindaraðstoðarmenn.** Tíu útfærð dæmi um beiðnir til þíns eigin aðstoðarmanns (taka til teikningu, teikna sett, athuga teikningar, spyrja líkan spurninga, leggja saman magntölu, prófa afbrigði hluta…), hvert með verkfærunum sem það kallar á og heimildunum sem það þarfnast, og hvert endurspilað af prófunum okkar. Forritin innihalda enga gervigreind. Sjá [Uppskriftir fyrir gervigreindaraðstoðarmenn](common:assistants-recipes).
- **Tungumál.** **Português (Portugal)** er nýtt í {{ui:Stillingar}} › {{ui:Almennt}} › {{ui:Tungumál}}. Það, **Português (Brasil)**, **Español (México)** og **Bahasa Indonesia** hafa nú hvert orð forritanna, sem drög sem móðurmálsmaður hefur ekki yfirfarið enn. Hjálparefnið er á ensku, með nokkrum greinum á spænsku.
- **CadCraft Studio** segir hvers vegna athugun á uppfærslu mistókst (engin skrá fyrir kerfið þitt enn, ekkert net, röng undirritun) í stað þess að segja bara „Lokið“, og hættir að birta aftur spjald um „Nýtt“ sem þú lokaðir þar til ný útgáfa kemur út.

## Ekki í þessari útgáfu enn

- **0.7 er ekki kóðaundirrituð.** Undirritun og Microsoft Store-pakkinn færðust yfir í 0.8 því vottun skírteinisins er ekki komin í gegn. Athugaðu SHA-256 við hverja skrá á getcadcraft.com/download. Á Windows, ef SmartScreen stöðvar uppsetninguna, veldu {{ui:Meiri upplýsingar}} og síðan {{ui:Keyra samt}}. Á Mac, í fyrsta skipti, hægrismelltu á CadCraft Studio og veldu {{ui:Opna}}. CadCraft Studio er ekki komið í forritaverslun enn, og engin iPad- eða iPhone-útgáfa er til enn.
- Horn- og hallalistarnir í {{ui:Einingar}} eru vistaðir, en enginn reitur les þá enn.
- Úðahausar framleiðenda: aðeins almennir hausar og þínir eigin úr skrá. Gögn framleiðenda koma aðeins inn með leyfi þeirra, og enginn hefur veitt það enn.
- BimCraft og ModelCraft bera plöntulistann, en þeirra {{ui:Setja inn úr safni}} býður ekki upp á plöntur enn. Plöntur berast í BimCraft gegnum landslags-IFC.
- Landslagsverkfæri fyrir aðstoðarmenn virka þegar CivilCraft-glugginn er opinn; skráaþjónninn og skipanalínan hafa þau ekki enn.
- Byggingarmassar: engin dagsbirta eða vindur á framhlið, enginn skuggi frá trjám eða öðru sem ekki er teiknað sem massi, engin þaklögun, og sólarstundir birtast á uppdrættinum, ekki í þrívíddarsýn. Þróa í BimCraft býr til einfalda veggi og gólf, án op eða þaks.
- Raflínur: engir staðlar lands innbyggðir (þú setur álagstilvikin, mörkin og fjarlægðirnar); engar rannsóknir á skriði leiðara, varmaeinkunn grafinna strengja, skammhlaupi, vörn eða jarðtengingu; engar línur í þrívíddarsýn eða IFC. `.DON`-rannsóknarskráin hefur ekki verið prófuð með forritinu sem les hana.
- Spíralar aðrir en klóþoíðar, spíral á milli tveggja bogja, og spíralar í eiginleikalínum. Spíralarnir hafa verið bornir saman við formúlurnar og LandXML-skemuna, en ekki enn við LandXML-skrá með spíröllum frá öðru forriti.
- Gangasamsetningar sem breytast eftir veginum, svæði og markmið fyrir hliðarhallann.
- Vatnsveitulagnir og þrýstinet (næsta mannvirkjaverk), flæði sem breytist með tímanum, og tengingar milli vatns- og regnvatnsneta.
- Bogar í teiknuðum brotalínum. Staðlaðar töflur fyrir hönnunarbíla: bílarnir fimm sem fylgja eru merktir sem staðgengilsgildi. Eiginleikalínur sem deilt er milli verkefna bíða eftir teymisverkefnum.

Allt annað er í [Ekki byggt enn](topic:not-built-yet).
