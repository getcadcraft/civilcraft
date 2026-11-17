---
title: Nýtt í 0.9
summary: Sniðmát fyrirganga og landlíkan, smellur og Velja-hnappar við teikningu, GIS-greining með eigindatöflu, skuggi, sólarorka, þægindi og vindrannsóknir fyrir svæði, þrívíddar-myndgerðarsýn og viðbæturnar Punktaský og WaterCraft.
keywords: nýtt, 0.9, útgáfuskýringar, sniðmát ganga, sniðmát landlíkans, sniðmátsritill, þversnið, nokkrir gangar, smellur, velja, færa, afrita, snúa, snertill, myndgerð, þrívíddar-myndgerð, GIS-greining, biðminni, yfirlag, staðbundin tenging, eigindatafla, stíll eftir eiginleika, skuggarannsókn, sólarorka, utci, útivistarþægindi, vindrannsókn, openfoam, punktský, las, laz, watercraft, brunaflæði, brunahani, aldur vatns, klór, eftirspurn, verkfæraábendingar, skipulag, breytingar, 0.8, 0.8.1, útgáfa, nýir eiginleikar, regn, storm, pollar, yfirflæði, jarðvinna, jöfnun, flutningur, besta leið, ódýrasta leið, veglína, varnartjörn, útrás, tæmingartími, frírými, framvinda, mæling, dróni, birgðahaugur, heimilisfang á svæði, lóð, jarðvegur, flóð, stöðugleiki hlíða, Bishop, setning, gatnamót, merkingar, skilti, sjónlengd, jöfnun, minnstu kvaðrat, þverlína, opin námuvinnsla, blokkalíkan, radíótengingar, Fresnel, brautarskipti, sporskipti, tungumál, vandamál, live, dwg
from: d7ac5b14
---

Þetta er það sem breyttist í CivilCraft 0.9, miðað við 0.8.1. CivilCraft 0.9 er hluti af CadCraft Studio 0.9 og átta forritum þess. Stóru hlutarnir eru sniðmát fyrir ganga og landlíkan, smellur meðan þú teiknar, GIS-greining, rannsóknir á sól, sólarorku, þægindum og vindi fyrir svæði, og tvær viðbætur: Punktaský og WaterCraft.

## Nýtt

### Sniðmát fyrir ganga og landlíkan

- **Sniðmát ganga.** Opnaðu {{ui:Yfirborð}} › {{ui:Meira}} › {{ui:Sniðmát gangs…}} (eða skrifaðu {{cmd:TEMPLATES}}). Sniðmát er lítið þversnið með hlutum, fráviksum, hallum, efnum og punktakóðum. Geymdu þau í verkefninu, í {{ui:Safnið mitt}} eða sem `.cctemplates.json`-skrá. Sniðmátsritillinn sýnir teikningu í réttum mælikvarða og telur upp vandamál jafnóðum og þú slærð inn.
- **Byggja úr sniðmátum eftir stöð.** Veldu veglínu og kveiktu á {{ui:Byggja úr sniðmátum eftir stöð}} í eiginleikum hennar. Hvor hlið hvers svæðis hefur sinn eigin lista yfir yfirborð og sín eigin endamörk. {{ui:Bæta við gangi}} undir {{ui:Gangar á þessari veglínu}} setur marga ganga á eina veglínu.
- **Sniðmát landlíkans.** {{ui:Yfirborð}} › {{ui:Meira}} › {{ui:Sniðmát landlíkans…}} (eða skrifaðu {{cmd:TERRAINTEMPLATES}}) leggur lagskipt efni, eins og gróðurmold eða yfirborð, og undirlag yfir landlíkan, með flatarmáli og rúmmáli fyrir hvert lag. Sjá [Sniðmát ganga og sniðmát landlíkans](topic:corridor-templates).

### Teiknun

- **Smellur.** Verkfærin Veglína, Undirlag, Lóð, Massi, Eiginleikalína, Mæla, Mörk og Vatnasvæði smella á mælipunkta, PI, horn, hornpunkta og mannvirki, með merki við merkið. Haltu inni {{key:Alt}} fyrir frjálsan punkt.
- **Velja-hnappar, snertill og færa, afrita, snúa.** Hornpunktar undirlags, lóða og eiginleikalína hafa reiti fyrir Austur og Norður sem þú slærð inn og krosshárs-hnappinn Velja. Eiginleikar hafa líka {{ui:Snertill milli tveggja punkta}} fyrir veglínur og {{ui:Færa, afrita og snúa}} fyrir veglínur, undirlög, lóðir og eiginleikalínur. Sjá [Teiknun með smellum, völdum hornum og færslu, afritun og snúningi](topic:draft-with-snaps).
- **Myndgerðarsýn í þrívídd.** Hnappurinn {{ui:Myndgerð}} á þrívíddarstikunni teiknar landið með náttúrulegum litum, himni, móðu og mjúkum skuggum. Hann breytir ekki líkaninu. Valmyndin {{ui:Sól}} er nú með hnappana {{ui:Beita}} og {{ui:Loka}}. Sjá [Skoða svæðið í þrívídd](topic:site-3d).
- **Spjöld opnast einn hluta í einu.** Vinstra spjaldið og eiginleikaspjaldið opna einn hluta og loka hinum, og flísar Landslagsborðsins sem halda nokkrum verkfærum eru klofnir hnappar.

### GIS-greining

- **Greina.** {{ui:Yfirborð}} › {{ui:Meira}} › {{ui:Greina}} býður upp á biðminni, yfirlag, staðbundna tengingu, val eftir eiginleika eða lögun, og mælingar. Hvert verkfæri býr til nýtt lag í einu afturkallsskrefi.
- **Eigindatafla.** Þriggja punkta valmynd lags hefur {{ui:Eigindatafla…}} og {{ui:Stíll eftir eiginleika…}}. Sjá [Greining GIS-laga](topic:gis-analysis) og [Vinna með eigindatöflu lags](topic:gis-table).

### Svæðið: sól, sólarorka, þægindi og vindur

- **Umhverfishluti.** Veldu massa: hlutinn {{ui:Umhverfi}} situr undir {{ui:Sólarstundir}} í eiginleikum hans. Hann hefur skuggarannsókn (kort, töflu, hreyfimynd, CSV), sólarorku út frá veðurskrá dæmigerðs árs (.epw) og útivistarþægindi (UTCI).
- **Vindur, aðeins skimun.** {{ui:Keyra vindrannsókn}} litar landið frá setu að óþægilegu fyrir hverja vindátt í veðurskránni. Hún er óstaðfest og spjaldið segir það.
- **Viðbótin Vindur fyrir gangandi (OpenFOAM).** Slökkt þar til þú kveikir á henni í {{ui:Stillingar}} › {{ui:Viðbætur}}. OpenFOAM er hugbúnaður sem notandinn setur upp sjálfur. Sjá [Skuggi, sólarorka og útivistarþægindi](topic:environment).

### Punktaský (viðbót)

- Kveiktu á {{ui:Punktaský}} í {{ui:Stillingar}} › {{ui:Viðbætur}}; flipi {{ui:Punktaský}} birtist í hægra spjaldinu. Opnaðu LAS- eða LAZ-skrá, hreinsaðu hana, flokkaðu í jörð, gróður og byggingar, byggðu landið, hæðarlínur og rúmmál, og fluttu út LAS eða LAZ. Sjá [Punktaský frá dróna eða skanna](topic:point-clouds).

### WaterCraft (viðbót)

- Kveiktu á {{ui:WaterCraft (dreifing vatns)}} í {{ui:Stillingar}} › {{ui:Viðbætur}}; flipi WaterCraft birtist. Hann er með eftirspurn frá viðskiptavinum, brunaflæði við hvern brunahana, hvaða rof á aðallögn skiptir mestu, og aldur vatns og klór, hvert vistað sem CSV. Sjá [WaterCraft: eftirspurn, brunaflæði, rof og aldur vatns](topic:watercraft).

### Vinna saman

- Í Live-lotu sérðu bendla og nöfn hvers annars á uppdrættinum. Plöntur úr safni: CivilCraft Landslag byrjar frá sjálfgefna safninu sínu, {{ui:CivilCraft landscape}}.

## Í öllum forritum

- Ábendingar birtast sem Bootstrap-verkfæraábendingar, og upphafsábendinguna má loka.
- Fliparöð spjalds sem passar ekki rennur í stað þess að vera klippt af.
- Titlar vafraflipa eru `<skjal> - CivilCraft | CadCraft`.
- {{ui:Stillingar}} er með skipulagshluta þar sem skipulögin eru fellilisti með tveggja lína valkostum.
- Þyngdar- og hitaeiningar eru í {{ui:Stillingar}} › {{ui:Sameiginlegt}} › {{ui:Einingar}}.
- Tungumálalistinn sýnir þau tungumál sem útgáfan hefur skrár fyrir. Tungumál önnur en enska eru vélþýðingar á drögum.

## Lagað

- Viðbæturnar fyrir leit að heimilisfangi og EnergyPlus-athugun var ekki hægt að kveikja á; nú er hægt að gera það.
- Hjálpin segir nú að viðbótin Punktaský skrifi hreinsað ský sem LAS 1.4 eða LAZ.
- Smellur á handfang valins hlutar sjálfs ræsir ekki lengur handfangsdrátt sem stöðvaði bíðandi Velja.

## Takmarkanir sem eru heiðarlega sagðar

- Dæmisniðmát ganga eru staðgengilsgildi án staðals; verkfræðingur verður að yfirfara þau. Sniðmát landlíkans bæta engum fleti við og eru ekki teiknuð í þrívídd eða þversniðssýn. Annar gangur á veglínu er ekki í IFC-útflutningi. Engin umskipti eru milli tveggja sniðmáta eftir stöð.
- Punktaský voru prófuð á tilbúnum skrám, ekki raunverulegri drónamælingu. Aðeins LAS og LAZ eru lesin.
- GIS-greining var prófuð á tilbúnum lögum.
- Skuggi, sól og þægindi eru áætlanir fyrir skipulag; vindur er óstaðfest skimun. Ekkert af þessu er hönnunargildi.
- WaterCraft er reiknihjálp sem var prófuð á tilbúnum netum. Vatnsverkfræðingur ákveður hvers virði tölurnar eru.
- Tungumál önnur en enska eru vélþýðingar á drögum.
- Uppsetningarforrit fyrir Windows eru ekki kóðaundirrituð og diskmynd fyrir macOS er ekki staðfest af Apple.

## Eldra: 0.8 og 0.8.1

Þetta er það sem breyttist í CivilCraft 0.8 (2026-11-01) og 0.8.1 (2026-11-02), miðað við 0.7. Stóru nýju hlutarnir eru verkfæri sem prófa landmótun og svæðið (regn, jarðvinnu, leiðir, tjarnir, framvindu) og sex reiknigluggar fyrir land, vegi, mælingar, námur, tengingar og járnbrautir.

### Nýtt

**Prófaðu landmótunina**

- **Láttu rigna.** {{ui:Láttu rigna…}} (undir {{ui:Yfirborð}}) lætur storm falla á landmótaða landið. Þú sérð vatnið renna af undirlögunum, safnast í poll í lægðunum og flæða yfir tjarnirnar sem eru of litlar. Keyrslan er hreyfð og gefur rúmmálin, hámarksútrennsli og CSV-skrá yfir hverja tjörn. Sjálfgefið reitanet er gróft svo fyrsta sýn er fljót; fínna net er hægara. Tjarnir sem flæða yfir birtast einnig í Vandamálaspjaldinu.
- **Jarðvinnujöfnun.** {{ui:Jarðvinnujöfnun…}} hækkar eða lækkar undirlag þar til skurður er jafn fyllingu, og sýnir flutningatöfluna á milli þeirra.
- **Besta leið.** {{ui:Besta leið…}}: veldu upphaf og endi, og CivilCraft finnur ódýrustu leiðina yfir landið sem heldur sig innan halla- og boga-marka þinna, og býr síðan til veglínu úr henni.
- **Varnartjarnir.** {{ui:Varnartjarnir…}} reiknar vatnsborð og rúmtak út frá landinu þínu, tekur við úttaksbúnaði (op, yfirfall, V-skurð, yfirfallsrás), beinir storminum í gegnum tjörnina og athugar hámarksvatnið sem heldur aftur af, tæmingartímann og frírýmið.
- **Framvinda eftir mælingum.** {{ui:Framvinda eftir mælingum…}} ber saman yfirborð úr dróna eða skanna frá mismunandi dagsetningum við landið eins og það var og við hönnunina: hlutfall lokið miðað við rúmmál, of djúpt grafin og of fyllt svæði, birgðahaugar, og hvenær verkinu lýkur á þessum hraða (merkt sem áætlun).

**Þekktu svæðið**

- **Heimilisfang á svæði.** {{ui:Heimilisfang á svæði…}} raðar opnum gögnum um lóðir, byggingar, skipulag, jarðveg, flóð og landlíkan á eitt svæði. Þú getur geymt svæðið í verkefnaskránni: slegna heimilisfangið, hverja heimild með deginum sem þú sóttir hana og leyfi hennar, og það sem kom til baka. Opnaðu aftur eða deildu verkefninu og svæðið er enn þar, án þess að sækja neitt aftur. Þú getur einnig vistað það sem svæðisskrá eða sent í BimCraft. Sjá [Heimilisfang á svæði](topic:address-to-site).

**Jarðvegur, vegir, mælingar, námur, tengingar og járnbrautir**

- **Jarðvegur og hallar.** {{ui:Jarðvegur og hallar…}} teiknar jarðvegssniðið milli borhola sem þú slærð inn. Aðferð Bishops leitar síðan að mikilvægasta hringnum á landinu þínu, með grunnvatnsborði, ofálagi og jarðskjálftastuðli; setning undirstöðu fær þjöppun, tafarlausa setningu og tíma.
- **Gatnamót og merkingar.** {{ui:Gatnamót og merkingar…}} setur arma saman með kantsteinsbogum (einn radíus á arm, eða þriggja-miðjubogar), sjónlengd fyrir hönnunarhraðann, athugun á sjóntríhyrningum, gangbrautum, stöðvunarlínum, merkingum og skiltum með skiltalista. Þau eru teiknuð á uppdrættinum og vistuð sem .dxf með nefndum lögum.
- **Jöfnun mælinga.** {{ui:Jöfnun mælinga…}} keyrir minnstu-kvaðrata-jöfnun á þverlínu eða neti: jöfnuð hnit, villusporbauga, kí-kvaðrat-próf og merkingu á mælingu sem passar ekki. Frjáls net, lokun þverlínu með áttavitareglu og RW5, GSI, JobXML eða CSV vettvangsskrár eru innifaldar, og jöfnuðu punktarnir vistast sem CSV.
- **Opnar námur.** {{ui:Opnar námur…}} breytir borsýnum í blokkalíkan og lokanámuna innan hallahornsins þíns, með afhjúpunarhlutfalli, töflu eftir þrepi og styrk- og tonnaferil. Hreiðraðar námur eftir tekjuþætti og framleiðsluáætlun með núvirtu sjóðstreymi eru einnig til staðar.
- **Radíótengingar.** {{ui:Radíótengingar…}} athugar sjónlínu yfir landið þitt með jarðarbungu, fyrsta Fresnel-svæðinu, tengiáætlun, dofaframlegð og fjölvegaröskun, og gefur mastrahæðina sem myndi hreinsa leiðina. Einnig gerir það ljósleiðaratapsáætlanir, magntölur leiða og vind á turni.
- **Brautarskipti.** {{ui:Brautarskipti…}} býr til brautarskipti út frá nefnúmeri sínu, þverleiðir milli samsíða spora og byggingarmæli sem hallar vegna hallahalla (cant) og breikkar í boga. Brautarskipti geta staðsetst á stöð veglínu.

Sjá [Jarðvegur, gatnamót, jöfnun mælinga, námur, radíótengingar og brautarskipti](topic:soils-roads-survey-mines-links).

### Í öllum forritum

- **Tungumál.** 54 tungumál, tíu þeirra ný. Tungumál önnur en enska eru vélþýðingar á drögum þar til móðurmálsmaður les þau. Hjálparefnið er enn að mestu á ensku.
- **Línur tækjastikunnar.** {{ui:Stillingar}} › {{ui:Almennt}} › {{ui:Línur tækjastikunnar}}: Wrap (eins og áður), 2 línur eða 1 lína. Borði CivilCraft sýnir mest notaða verkfærið stórt, næstu smá, og hin á bak við örina við heiti hópsins.
- **Inntakstæki.** Snertiflötur, penni, þrívíddarmús, stýripinni og MIDI geta stjórnað forritunum.
- **Vandamál.** Vandamálaspjald sem varar við í öllum forritum, með athugunum sem lesa reglupakka.
- **Live.** Yfirlit yfir hver er hvar í Live-lotu.
- **Viðbætur.** Listi yfir viðbætur, með lýsingarviðbótum.
- **Tengdu gervigreindina þína.** Hvaða aðstoðarmaður sem þú tengir getur stjórnað verkfærum CivilCraft. Honum fylgir athugasemd um að tenging með einum smelli í CadCraft Studio og hýstur tengill séu ekki tilbúin enn. Sjá [Láttu gervigreindaraðstoðarmann vinna með svæðið þitt](topic:assistants).

### Lagað í 0.8.1

- **Flokkahluti DWG.** Hann var lesinn sem röng gerð (GitHub cadcraft#5). Lagað í CivilCraft ásamt CadCraft, BimCraft, ModelCraft og TakeoffCraft.
- **Skipt um tungumál meðan forritið keyrir.** CadCraft Studio og pakkaútgáfurnar geta skipt um tungumál meðan þær keyra. Áður voru þær aðeins á ensku. Ekki enn prófað á öllum stýrikerfum: láttu okkur vita ef tungumálið breytist ekki.

### Ekki í þessari útgáfu enn

- **Þetta eru reiknihjálpir.** Sérhver niðurstaða í nýju gluggunum þarf yfirferð verkfræðings. Styrkur jarðvegs byggir á dæmigerðum gildum fyrir jarðvegsflokkinn, og glugginn segir það.
- **Láttu rigna.** Keyrsla á sýnisvæðinu getur tekið yfir tvær mínútur í vafranum við fínt reitanet. Hún var athuguð við handreiknuð dæmi og V-laga vatnasvæði, ekki enn á raunverulegu landmótuðu svæði.
- **Heimilisfang á svæði.** Það les opnar gagnaskrár sem þú kemur með, og var aðeins prófað á eigin skrám okkar. Tré eru ekki heimild. Að sækja heimildir fyrir þig bíður eftir orðalagi persónuverndar.
- **Framvinda eftir mælingum.** Prófað á tilbúnum mælingum eingöngu. Framvinda á blöðum og merkingum (MarkupCraft) og skönnun á móti líkani (BimCraft) eru ekki smíðuð.
- **Jarðvegur og hallar.** Aðeins hringlaga fletir: engin fleyg- eða blokkaleit og engin togsprunga.
- **Gatnamót.** Einn radíus á arm, engir beygjuferlar vörubíla, og þau fara ekki enn inn í ganginn.
- **Vettvangsskrár.** Lesararnir voru skrifaðir út frá opinberum lýsingum sniðanna og prófaðir á skrám sem við bjuggum til. Raunverulegra skráa frá mælitækjum er óskað.
- **Tengingar og járnbrautir.** Radíótengingar: aðeins frjálsrýmistap og fjölvegi (engin regndofi eða loftnetsmynstur), og enginn járnbrautarstaðall: hvert járnbrautarmark er staðgengill, með drögum sem enginn járnbrautarverkfræðingur hefur yfirfarið.
- **Windows og macOS.** 0.8 er ekki kóðaundirrituð. Windows gæti varað við, og macOS biður um hægrismell og síðan Opna.

Allt annað er í [Ekki byggt enn](topic:not-built-yet). Fyrir eldri útgáfuna, sjá [Nýtt í 0.7](topic:whats-new-0-7).
