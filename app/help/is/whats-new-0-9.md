---
title: Nýtt í 0.9 (eldra)
summary: Gangasniðmát og landsniðmát, smellifesting og Velja-hnappar við teikningu, GIS-greining með eigindatöflu, skugga-, sólarorku-, þæginda- og vindrannsóknir fyrir svæði, 3D-myndgerðarsýn, og viðbæturnar Punktaský og WaterCraft.
keywords: nýtt í 0.9, eldri útgáfa, nýtt, 0.9, útgáfuskýringar, gangasniðmát, landsniðmát, ritill sniðmáta, dæmigert snið, nokkrir gangar, smellifesting, smella, velja, færa, afrita, snúa, snertill, myndgerð, 3d myndgerð, gis greining, buffer, yfirlögn, rúmfræðileg tenging, eigindatafla, stíll eftir eigind, skuggarannsókn, sólarorka, utci, útiþægindi, vindrannsókn, openfoam, punktaský, las, laz, watercraft, brunaflæði, brunahani, vatnsaldur, klór, eftirspurn, vísbendingar, skipulag, nýtt, útgáfuskýringar, breytingaskrá, 0.8, 0.8.1, útgáfa, nýir eiginleikar, regn, storm, pollur, yfirfall, jarðvinna, jafnvægi, skurður og fylling, flutningur, besta leið, minnsta kostnaður, veglína, varnartjörn, útrás, lækkun, frír hæð, framvinda, mæling, dróni, haugur, heimilisfang á lóð, lóð, jarðvegur, flóð, stöðugleiki hlíða, bishop, sig, gatnamót, merkingar, skilti, sjónlína, jöfnun, minnstu ferningar, þræðing, opin náma, blokkalíkan, radíótenging, fresnel, brautarskiptir, krossgata, tungumál, vandamál, í beinni, dwg
from: 4664522c
---

Þetta er það sem breyttist í CivilCraft 0.9, samanborið við 0.8.1. CivilCraft 0.9 er hluti af CadCraft Studio 0.9 og átta forritum þess. Stærstu hlutarnir eru gangasniðmát og landsniðmát, smellur við teikningu, GIS-greining, rannsóknir á sól, sólarorku, þægindum og vindi á svæði, og tvær viðbætur: Punktaský og WaterCraft.

## Nýtt

### Gangasniðmát og landsniðmát

- **Gangasniðmát.** Opnaðu {{ui:Yfirborð}} › {{ui:Meira}} › {{ui:Sniðmát gangs…}} (eða skrifaðu {{cmd:TEMPLATES}}). Sniðmát er lítið þversnið með íhlutum, útfærslum, hallum, efnum og punktakóðum. Geymdu þau í verkefninu, í {{ui:Safnið mitt}} eða sem skrá `.cctemplates.json`. Ritillinn sýnir teikningu í réttum mælikvarða og listar vandamál þegar þú skrifar.
- **Byggja úr sniðmátum eftir stöð.** Veldu veglínu og kveiktu á {{ui:Byggja úr sniðmátum eftir stöð}} í Eiginleikum hennar. Hvor hlið hvers svæðis hefur sinn eigin yfirborðslista og sitt eigið endaástand. {{ui:Bæta við gangi}} undir {{ui:Gangar á þessari veglínu}} setur marga ganga á eina veglínu.
- **Landsniðmát.** {{ui:Yfirborð}} › {{ui:Meira}} › {{ui:Landsniðmát…}} (eða skrifaðu {{cmd:TERRAINTEMPLATES}}) leggur lagskipt efni eins og ofanmold eða yfirborð og undirlag yfir land, með flatarmáli og rúmmáli fyrir hvert lag. Sjá [Gangasniðmát og landsniðmát](topic:corridor-templates).

### Teikning

- **Smellur.** Verkfærin Veglína, Byggingarflötur, Lóð, Massi, Eiginlína, Mæling, Mörk og Vatnasvæði smella að mælipunktum, PI-um, hornum, hnútum og mannvirkjum, með merkimiða við punktinn. Haltu inni {{key:Alt}} fyrir frjálsan punkt.
- **Velja-hnappar, snertill og færa, afrita, snúa.** Hornin á byggingarflötum, lóðum og eiginlínum hafa slegna reiti fyrir Austur og Norður og krosshárs-hnappinn {{ui:Velja}}. Eiginleikar hafa líka {{ui:Snertill úr tveimur punktum}} fyrir veglínur og {{ui:Færa, afrita og snúa}} fyrir veglínur, byggingarfleti, lóðir og eiginlínur. Sjá [Teikna með smellum, völdum hornum og færa, afrita, snúa](topic:draft-with-snaps).
- **Myndgerðarsýn í 3D.** Hnappurinn {{ui:Myndgerð}} á 3D-stikunni teiknar landið með náttúrulegum litum, himni, móðu og mjúkum skuggum. Hann breytir ekki líkaninu. Valmyndin {{ui:Sól}} hefur nú hnappana {{ui:Beita}} og {{ui:Loka}}. Sjá [Skoða svæðið í 3D](topic:site-3d).
- **Spjöld opnast eitt hluta í einu.** Vinstra spjaldið og Eiginleikaspjaldið opna einn hluta og loka hinum, og Ribbon-borðinn fyrir Landslag hefur hnappa skipta í flipa þar sem fleiri verkfæri eru.

### GIS-greining

- **Greina.** {{ui:Yfirborð}} › {{ui:Meira}} › {{ui:Greina}} býður buffer, yfirlögn, rúmfræðilega tengingu, val eftir eigind eða lögun, og mælingu. Hvert verkfæri býr til nýtt lag í einu afturkallsskrefi.
- **Eigindatafla.** Þriggja punkta valmynd lags hefur {{ui:Eigindatafla…}} og {{ui:Stíll eftir eigind…}}. Sjá [Greina GIS-lög](topic:gis-analysis) og [Vinna með eigindatöflu lags](topic:gis-table).

### Svæðið: sól, sólarorka, þægindi og vindur

- **Umhverfishluti.** Veldu massa: hlutinn {{ui:Umhverfi}} situr undir {{ui:Sólarstundir}} í Eiginleikum hans. Hann hefur skuggarannsókn (kort, töflu, hreyfimynd, CSV), sólarorku úr veðurskrá eins dæmigerðs árs (.epw) og útiþægindi (UTCI).
- **Vindur, aðeins skimun.** {{ui:Keyra vindrannsókn}} litar landið frá því að sitja til óþægilegs fyrir hverja vindátt í veðurskránni. Hún er óstaðfest og spjaldið segir það.
- **Vindur á göngusvæðum (OpenFOAM) viðbót.** Slökkt þar til þú kveikir á henni í {{ui:Stillingar}} › {{ui:Viðbætur}}. OpenFOAM er hugbúnaður sem þú setur upp sjálf(ur). Sjá [Skuggi, sólarorka og útiþægindi](topic:environment).

### Punktaský (viðbót)

- Kveiktu á {{ui:Punktaský}} í {{ui:Stillingar}} › {{ui:Viðbætur}}; flipi Punktaský birtist í hægra spjaldinu. Opnaðu LAS- eða LAZ-skrá, hreinsaðu hana, raðaðu henni í jörð, gróður og byggingar, byggðu landið, hæðarlínur og rúmmál, og fluttu út LAS eða LAZ. Sjá [Punktaský frá dróna eða skanna](topic:point-clouds).

### WaterCraft (viðbót)

- Kveiktu á {{ui:WaterCraft (vatnsdreifing)}} í {{ui:Stillingar}} › {{ui:Viðbætur}}; flipi WaterCraft birtist. Hann hefur eftirspurn frá viðskiptavinum, brunarennsli við hvern brunahana, hvaða rof á lögn skiptir mestu máli, og vatnsaldur og klór, hvert vistað sem CSV. Sjá [WaterCraft: eftirspurn, brunaflæði, rof og vatnsaldur](topic:watercraft).

### Vinna saman

- Í lifandi lotu sérðu bendla og nöfn hvers annars í grunnmyndinni. Plöntur úr safni: CivilCraft Landslag byrjar frá sjálfgefnu safni sínu, {{ui:CivilCraft landslag}}.

## Í öllum forritum

- Vísbendingar birtast sem Bootstrap-ábendingar, og upphafsábendinguna má loka.
- Flipastika spjalds sem passar ekki rúllar í stað þess að vera skorin af.
- Titlar vafraflipa lesa `<skjal> - CivilCraft | CadCraft`.
- {{ui:Stillingar}} hefur skipulagshluta þar sem skipulögin eru fellilisti með tveggja lína valkostum.
- Þyngdar- og hitaeiningar eru í {{ui:Stillingar}} › {{ui:Almennt}} › {{ui:Einingar}}.
- Tungumálalistinn sýnir þau tungumál sem útgáfan hefur skrár fyrir. Önnur tungumál en enska eru vélþýðingar.

## Lagfært

- Viðbæturnar fyrir heimilisfangaleit og EnergyPlus-athugun var ekki hægt að kveikja á; nú er hægt að kveikja á þeim.
- Hjálpin segir nú að viðbótin Punktaský skrifi hreinsað ský sem LAS 1.4 eða LAZ.
- Smellur á eigin grip valins hlutar byrjar ekki lengur gripdrátt sem stöðvaði biðjandi Velja.

## Takmarkanir

- Dæmi um gangasniðmát eru bráðabirgðagildi án staðals; verkfræðingur verður að athuga þau. Landsniðmát bæta engu yfirborði við og eru ekki teiknuð í 3D eða í þversniðssýninni. Annar gangur á veglínu er ekki í IFC-útflutningnum. Engin mjókkun er milli tveggja sniðmáta eftir stöð.
- Punktaský voru prófuð á tilbúnum skrám, ekki á raunverulegri drónamælingu. Aðeins LAS og LAZ eru lesin.
- GIS-greining var prófuð á tilbúnum lögum.
- Skuggi, sól og þægindi eru áætlanir fyrir skipulag; vindur er óstaðfest skimun. Ekkert af þessu er hönnunargildi.
- WaterCraft er reiknihjálp sem var prófuð á tilbúnum netum. Vatnsverkfræðingur ákveður hvers virði tölurnar eru.
- Tungumál önnur en enska eru vélþýðingar þar til móðurmálsmaður hefur lesið þau.
- Uppsetningarforrit fyrir Windows eru ekki undirrituð með kóðaundirritun, og diskmynd fyrir macOS er ekki staðfest (notarized). Windows gæti varað við, og macOS biður um hægrismell og síðan Opna.

## Eldra: 0.8 og 0.8.1

Þetta er það sem breyttist í CivilCraft 0.8 (2026-11-01) og 0.8.1 (2026-11-02), samanborið við 0.7. Stærstu nýju hlutarnir eru verkfæri sem prófa mótun og svæðið þitt (regn, jarðvinna, leiðir, tjarnir, framvinda) og sex reikniglugga fyrir land, vegi, mælingar, námur, tengingar og járnbrautir.

### Nýtt

**Prófaðu mótunina þína**

- **Láttu rigna.** {{ui:Láttu rigna…}} (undir {{ui:Yfirborð}}) sleppir stormi á mótaða landið. Þú sérð vatnið renna af byggingarflötunum, safnast fyrir í lægstu hornunum og yfirfalla tjarnir sem eru of litlar. Keyrslan er hreyfð og gefur rúmmálin, hámarksútrennsli og CSV fyrir hverja tjörn. Reiturinn er grófur í sjálfgefnu til að fyrsta sýn sé fljót; fínni reitur er hægari. Tjarnir sem yfirfalla birtast líka í Vandamálaspjaldinu.
- **Jarðvinnujöfnun.** {{ui:Jarðvinnujöfnun…}} hækkar eða lækkar byggingarflöt þar til skurður er jafn fyllingu, og sýnir flutningstöfluna milli þeirra.
- **Besta leið.** {{ui:Besta leið…}}: veldu upphaf og endi, og CivilCraft finnur ódýrustu leiðina yfir landið sem heldur sig innan halla- og bogamarka þinna, og býr síðan til veglínu úr henni.
- **Varnartjarnir.** {{ui:Varnartjarnir…}} reiknar þrep og geymslu út frá landinu þínu, tekur útrásartæki (op, þröskuld, V-skarð, yfirfall), leiðir storm í gegnum tjörnina og athugar hámarkið sem er haldið til baka, lækkunartímann og frían hæð.
- **Framvinda úr mælingum.** {{ui:Framvinda úr mælingum…}} ber saman yfirborð úr drónum eða skönnum frá mismunandi dagsetningum við landið eins og það var og við hönnunina: hlutfall lokið miðað við rúmmál, ofgrafin og ofyllt svæði, haugar, og hvenær verkinu lýkur á þessum hraða (merkt sem áætlun).

**Þekktu svæðið**

- **Heimilisfang á lóð.** {{ui:Heimilisfang á lóð…}} stillir opin gögn um lóð, byggingu, skipulag, jarðveg, flóð og landslag saman á eitt svæði. Þú getur geymt svæðið í verkefnaskránni: slegna heimilisfangið, hverja heimild með deginum sem þú sóttir hana og leyfi hennar, og það sem kom til baka. Opnaðu verkefnið aftur eða deildu því og svæðið er enn þar, án þess að neitt sé sótt aftur. Þú getur líka vistað það sem svæðisskrá eða sent það til BimCraft. Sjá [Heimilisfang á lóð](topic:address-to-site).

**Land, vegir, mælingar, námur, tengingar og járnbrautir**

- **Jarðvegur og hallar.** {{ui:Jarðvegur og hallar…}} teiknar jarðvegssniðið milli bora sem þú slærð inn. Aðferð Bishops leitar þá að mikilvægum hring á landinu þínu, með grunnvatnsborði, ofálagi og jarðskjálftastuðli; sig undirstöðu fær þjöppun, tafarlaust sig og tíma.
- **Gatnamót og merkingar.** {{ui:Gatnamót og merkingar…}} setur saman fætur með kantboga (einn radíus fyrir hvern fót, eða þriggja miðja boga), sjónlengd fyrir hönnunarhraðann, athugun á sjóntríhyrningum, gangbrautir, stöðvunarlínur, merkingar og skilti með skiltaskrá. Þau eru teiknuð á grunnmyndina og vistuð sem .dxf með nefndum lögum.
- **Jöfnun mælinga.** {{ui:Jöfnun mælinga…}} keyrir minnstu-ferninga jöfnun á þræðingu eða neti: jafnaðar hnit, villusporbaug, kí-kvaðrat prófið og merki á mælingunni sem passar ekki. Frí net, lokun þræðingar með þjöppunarreglunni og RW5, GSI, JobXML eða CSV vettvangsskrár eru innifalin, og jöfnuðu punktarnir vistast sem CSV.
- **Opnar námur.** {{ui:Opnar námur…}} breytir borsýnum í blokkalíkan og endanlega námu innan hallahorns þíns, með hlutfalli afhjúpunar, töflu eftir þrepum og línuriti fyrir gæði og tonn. Hreiðraðar námur eftir tekjustuðli og framleiðsluáætlun með afvexti sjóðstreymis eru líka til staðar.
- **Radíótengingar.** {{ui:Radíótengingar…}} athugar sjónlínu yfir landið þitt með boga jarðar, fyrsta Fresnel-svæðinu, tengingarkostnaðaráætlun, varaforða fyrir dofa og fjölvegatruflanir, og gefur mastrahæðina sem myndi hreinsa leiðina. Það gerir líka tapsreikninga fyrir ljósleiðara, magntölur leiða og vindinn á turni.
- **Járnbrautarskiptir.** {{ui:Járnbrautarskiptir…}} býr til skipti úr tölu hjartastykkis þeirra, krossgötur milli samsíða spora og byggingarlínu sem hallar eftir halla og breikkar í sveigju. Skipti getur staðið á stöð veglínu.

Sjá [Jarðvegur, gatnamót, jöfnun mælinga, námur, radíótengingar og skiptir](topic:soils-roads-survey-mines-links).

### Í öllum forritum

- **Tungumál.** 54 tungumál, tíu þeirra ný. Tungumál önnur en enska eru vélþýðingar þar til móðurmálsmaður hefur lesið þau. Hjálparefni er enn að mestu á ensku.
- **Stikuraðir.** {{ui:Stillingar}} › {{ui:Almennt}} › {{ui:Línur tækjastikunnar}}: Vefja (eins og áður), 2 línur eða 1 lína. Ribbon CivilCraft sýnir mest notaða verkfærið stórt, næstu smá, og hin á bak við örina í heiti hópsins.
- **Inntakstæki.** Snertiborð, penni, þrívíddarmús, stýripinni og MIDI geta stjórnað forritunum.
- **Vandamál.** Vandamálaspjald sem varar í hverju forriti, með athugunum sem lesa reglupakka.
- **Lifandi.** Yfirlit yfir hver er hvar í lifandi lotu.
- **Viðbætur.** Listi yfir viðbætur, með lýsingarviðbótum.
- **Tengdu gervigreindina þína.** Hvaða aðstoðarmaður sem þú tengir getur stjórnað verkfærum CivilCraft. Hann fylgir athugasemd um að tenging með einum smelli innan CadCraft Studio og hýst tengi séu ekki tilbúin enn. Sjá [Láttu gervigreindaraðstoðarmann vinna með svæðið þitt](topic:assistants).

### Lagfært í 0.8.1

- **Hluti DWG-flokka.** Hann var lesinn sem röng tegund (GitHub cadcraft#5). Lagað í CivilCraft ásamt CadCraft, BimCraft, ModelCraft og TakeoffCraft.
- **Skipt um tungumál meðan forritið keyrir.** CadCraft Studio og pakkaðar útgáfur geta skipt um tungumál meðan þær keyra. Áður var aðeins enska í boði. Ekki enn prófað á öllum stýrikerfum: segðu okkur ef tungumálið breytist ekki.

### Ekki í þessari útgáfu enn

- **Þetta eru reiknihjálpar.** Sérhver niðurstaða í nýju gluggunum þarfnast athugunar verkfræðings. Styrkleikar jarðvegs byrja frá dæmigerðum gildum fyrir jarðvegshópinn, og glugginn segir það.
- **Láttu rigna.** Keyrsla á sýnissvæðinu getur tekið yfir tvær mínútur í vafranum á fínum reit. Hún var prófuð gegn handreiknuðum tilvikum og V-laga vatnasvæði, ekki enn á raunverulegu mótuðu svæði.
- **Heimilisfang á lóð.** Hún les opnar gagnaskrár sem þú kemur með, og var prófuð á okkar eigin skrám einum saman. Tré eru ekki heimild. Að sækja heimildir fyrir þig bíður eftir orðalagi um persónuvernd.
- **Framvinda úr mælingum.** Prófað á tilbúnum mælingum einum saman. Framvinda á blöðum og merkingum (MarkupCraft) og skönnun á móti líkani (BimCraft) eru ekki smíðuð.
- **Jarðvegur og hallar.** Aðeins hringlaga yfirborð: engin leit að kíl eða blokk og engin togsprunga.
- **Gatnamót.** Einn radíus fyrir hvern fót, engar slóðir ökutækja fyrir vörubíla, og þau fara ekki enn inn í ganginn.
- **Vettvangsskrár.** Lesendurnir voru skrifaðir eftir opnum lýsingum á skráasniðum og prófaðir á skrám sem við bjuggum til. Raunverulegar skrár tækja eru vel þegnar.
- **Tengingar og járnbrautir.** Radíótengingar: aðeins tap í frjálsu rými og fjölvegatruflanir (engin regnfíkn eða loftnetsmynstur), og enginn járnbrautarstaðall: hver takmörk járnbrauta eru bráðabirgðagildi, með drögum að tölum sem enginn járnbrautarverkfræðingur hefur athugað.
- **Windows og macOS.** 0.8 er ekki undirrituð með kóðaundirritun. Windows gæti varað við, og macOS biður um hægrismell og síðan Opna.

Allt annað er í [Ekki smíðað enn](topic:not-built-yet). Fyrir fyrri útgáfuna, sjá [Nýtt í 0.7](topic:whats-new-0-7).
