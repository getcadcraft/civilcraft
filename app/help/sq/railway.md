---
title: Projektimi i një binari hekurudhor
summary: Bëni një aks rrugor hekurudhë: kalimet e shinave (klotoidë, parabolë kubike, Bloss, Helmert, gjysmëvalë sinusoidal, sinusoidë), ngritja e skajit në çdo kurbë me ngritjen e ekuilibrit të saj, mungesa dhe teprica, kufijtë e ngritjes dhe të gjeometrisë së binarit si paralajmërime, devijimet dhe kryqëzimet sipas stacionit, një zonë lirie e tërhequr përgjatë linjës, dhe një binar me shina, traversa dhe shtrat balasti i ndërtuar si koridor, në plan, prerje, profil, 3D dhe sasi.
keywords: hekurudhë, shinë, binar, tren, metro, tramvaj, ngritje e skajit, mungesë ngritjeje, tepricë ngritjeje, ngritje ekuilibri, kalim, kurbë kalimi, klotoidë, parabolë kubike, bloss, helmert, gjysmëvalë sinusoidal, kosinus, gjurmë, gjurmë standarde, gjurmë e gjerë, gjurmë metrike, gjurmë e ngushtë, traversë, balast, nënbalast, shtrat, banketë, largësi binarësh, 60E1, 54E1, UIC60, 115RE, 136RE, gradient i ngritjes, shpejtësia e ndryshimit të ngritjes, devijim, gjilpërë, kryq, kryqëzim, hyrje, numër kryqi, kurbë mbylljeje, shpejtësi divergjente, lirim, zonë lirie, kalibër i strukturës, kalibër kinematik, platformë, hapësirë peroni, largësi binarësh, gradient, kurbë vertikale, rreze minimale, ngritje LandXML
from: 99de9745
---

Çdo aks rrugor mund të jetë një binar hekurudhor. Kurbat e tij marrin atëherë kalime shinash dhe një ngritje (ngritjen e tërthortë të shinave), dhe korridori i tij ndërtohet si binar: shina mbi traversa mbi një shtrat balasti, të niveluara në tokë si një rrugë. Devijimet dhe kryqëzimet vendosen mbi të sipas stacionit, dhe mund të tërhiqet mbi të një zonë lirie, e cila kontrollohet me atë që ndodhet pranë binarit.

Çdo numër më poshtë është një **vend-mbajtës**, jo një standard. Hekurudhat i vendosin kufijtë sipas shpejtësisë së linjës, llojit të binarit dhe vendit; vendosni ata sipas standardit të hekurudhës suaj. CivilCraft nuk përfshin asnjë tabelë kombëtare.

## Bëni aksin një hekurudhë

1. Përzgjidhni aksin dhe gjeni **Railway** te **Veti**.
2. Vendosni shenjën te **This alignment is a railway track**. Çdo ndryshim është një hap zhbërjeje.
3. Vendosni **Design speed** në krye të **Vetive** të aksit: është shpejtësia e linjës me të cilën kontrollohet ngritja. **Slowest trains** (në bllokun Railway) është shpejtësia me të cilën kontrollohet tepricë ngritjeje.

## Kalimet

Jepni çdo kurbe një gjatësi spirale në secilin skaj në tabelën PI (**Spiral in**, **Spiral out**), më pas zgjidhni llojin e saj në tabelën e kurbave të bllokut Railway, ose **Transition for every curve**:

| Lloji | Lakorja përgjatë kalimit |
|---|---|
| Clothoid | rritet në mënyrë të barabartë (spirale e rrugës) |
| Cubic parabola | y = x³ / (6·R·L), me L të matur përgjatë tangentes; vetë kurba është pak më e gjatë |
| Bloss | 3u² − 2u³ e lakores së plotë (u = pjesa e gjatësisë): fillon dhe mbaron butë |
| Helmert | dy parabola, 2u² dhe më pas 1 − 2(1 − u)² |
| Sine half-wave | (1 − cos πu) / 2 |
| Sine | u − sin(2πu) / 2π |

Të gjitha përveç parabolës kubike kthehen për L / 2R, si klotoida. Stacionet ndjekin gjatësinë reale. LandXML e ruan llojin (spiType clothoid, cubicParabola, bloss, biquadratic, cosine, sinusoid).

## Ngritja

Shkruani **Cant** të çdo kurbe në milimetra. Tabela tregon për çdo kurbë:

- **Equilibrium** cant = G·v² / (g·R), ku G është largësia midis qendrave të shinave (**Rail centres**, gjurma plus gjerësia e kokës së shinës, përveç nëse e shkruani vetë). Me G = 1500 mm kjo është formula e njohur 11.8·V² / R (V në km/h, R në m).
- **Deficiency** = ekuilibri në shpejtësinë e linjës − ngritja e aplikuar.
- **Excess** = ngritja e aplikuar − ekuilibri në shpejtësinë e trenave më të ngadaltë.
- **Ramp**: gradienti më i thiklë i ngritjes përgjatë rampave të saj, në mm për metër.

Ngritja rritet gjatë çdo kalimi, e formuar sipas lakores së tij: drejt për klotoidën ose parabolën kubike, në formë Bloss për Bloss, e kështu me radhë. Një skaj kurbe pa kalim ngrihet mbi drejtëzën para tij, aq sa kërkon kufiri i gradientit të ngritjes, dhe kjo tregohet: ngritja ndryshon atëherë aty ku nuk ndryshon lakorja.

**Cant turns about** tregon cila shinë mbetet në profilin e projektit: **the low rail** (zakonisht), **the inner rail** ose **the track centre** (secila shinë lëviz për gjysmën e ngritjes). Profili i projektit është lartësia e kokës së shinës aty.

**Cant diagram** vizaton lartësinë e secilës shinë mbi profil përgjatë stacioneve; pamja e profilit dhe fletët e planit dhe profilit marrin të njëjtën gjë si brez nën profil.

## Kufijtë dhe paralajmërimet e ngritjes

**Most applied cant**, **Most cant deficiency**, **Most cant excess**, **Steepest cant gradient** dhe **Fastest change of cant** (gradienti në shpejtësinë e linjës, mm/s) kontrollohen në çdo kurbë. Një vlerë mbi një kufi është paralajmërim në bllokun Railway dhe në panelin **Problemet**, me kufirin dhe vlerën e gjetur. Pa shpejtësi projekti, mungesa dhe shpejtësia e ndryshimit nuk kontrollohen (një shënim e thotë këtë).

## Binari

Vendosni **Gauge** (parazgjedhjet standarde 1435 mm, të gjera, metrike ose të ngushta, ose tuajën), **Rail section** (60E1, 54E1, 49E1, 115RE, 136RE: vetëm dimensionet e tyre të publikuara), numrin e **Tracks** dhe **Track centres**, pastaj **Sleepers and ballast**: materialin e traversës, gjatësinë, gjerësinë, thellësinë dhe largësinë; thellësinë e balastit nën traversë (te shina e ulët), bankinën, pjerrësinë, sa lart është maja e tij nën traversa; thellësinë e nënbalastit, banketën jashtë fundit të balastit dhe pjerrësinë tërthore të shtratit.

Shtypni **Build the track**. Ai aktivizohet te korridori i aksit, i ndërtuar si binar përgjatë profilit të projektit: shinat dhe traversat pjerren me ngritjen, por shtrati nuk pjerret. Pjerrësitë e dritës shkojnë nga skaji i banketës në prerjen dhe mbushjen e korridorit, dhe binari nivelohet në sipërfaqen e propozuar si një rrugë.

- **Plan**: të dy shinat e çdo binari (shtresa C-RAIL-TRAK) dhe, me më shumë se një binar, qendra e çdo binari (C-RAIL-CNTR), në ekran, në DXF, DWG, PDF dhe në fletët e planit dhe profilit.
- **Sections**: traversat, shinat, fundet e balastit dhe nënbalastit në çdo prerje.
- **3D**: shinat, çdo traversë dhe shtrati i balastit (Show › Track), gjithashtu në GLB, OBJ dhe USD.
- **Quantities**: gjatësia e binarit, shinat (të dy shinat e çdo binari, përgjatë vijës së vetë çdo binari), traversat, shtrati i balastit dhe balasti pa traversat, dhe nënbalasti, sipas metodës së sipërfaqeve mesatare të skajeve midis prerjeve.

## Kontrollet e gjeometrisë së binarit

Përveç ngritjes, blloku Railway e kontrollon vetë linjën kundrejt gjashtë kufijve të tjerë (të gjithë vend-mbajtës, të gjithë të juajt për t'i vendosur):

- **Steepest gradient** i profilit të projektit, në mm për metër.
- **Least vertical curve radius**, si faktor k në R ≥ k·V² (R në metra, V në km/h). Një kurbë vertikale parabolike e gjatësisë L midis dy gradientëve ka rreze L të pjesëtuar me ndryshimin e gradientit.
- **Shortest vertical curve**.
- **Least curve radius** në plan (0 e fik kontrollin).
- **Shortest arc or straight**, si sekonda udhëtimi në shpejtësinë e linjës: një hark rrethor, ose drejtëza midis dy kurbave, më i shkurtër se kjo largësi, paralajmërohet. 1.8 s është e njohura "gjysma e shpejtësisë në km/h, në metra".
- **Rate of change of cant deficiency** përgjatë çdo kalimi, në mm/s në shpejtësinë e linjës.

**Track geometry** liston gradientin më të thiklë të gjetur dhe çdo kurbë vertikale me rrezen e saj dhe rrezen që kërkon shpejtësia e linjës. Një kurbë vertikale që shtrihet mbi një kalim ose rampë ngritjeje merr një shënim. Pa profil projekti ose pa shpejtësi projekti, kontrollet që kërkojnë një të tillë anashkalohen dhe një shënim e thotë këtë.

## Devijimet dhe kryqëzimet

Nën **Turnouts and crossovers**, shtypni **Add a turnout**. Ai vendoset në drejtëzën më të gjatë; vendosni në tabelë:

- **Switch toe station**: ku fillon devijimi në këtë akst.
- **Frog**: numri i kryqit N (1:N). Këndi i kryqit është 2·atan(1 / 2N).
- **Side**: majtas ose djathtas, duke parë drejt stacionit në rritje.
- **Crossover spacing** në metra: mbi 0, devijimi bëhet kryqëzim me një binar paralel në atë largësi (dy devijime dhe drejtëza midis tyre).

Tabela tregon **Lead** (gjilpera deri te kryqi), **Radius** e kurbës së mbylljes dhe **Diverging speed** që lejon ajo rreze me kufirin tuaj të mungesës së ngritjes dhe pa ngritje. **Make its track** e kthen rrugën divergjente në një akst të vetin (gjilpera, kurba e mbylljes, pastaj drejt përpara në këndin e kryqit) me të njëjtat cilësime hekurudhore, gati për t'u zgjatur.

Plani vizaton dy shinat divergjente të çdo devijimi, boshtin e tij, një shenjë te gjilpera dhe te kryqi, dhe "1:N" (shtresa C-RAIL-TURN), në ekran dhe në DXF, DWG, PDF dhe fletë. Pamja 3D vizaton shinat divergjente në nivelin e binarit kryesor.

Forma është një **vend-mbajtës**: një gjilpërë e drejtë dhe një kurbë mbylljeje nga numri i kryqit. Një devijim i ndërtuar ndjek standardin e hekurudhës dhe vizatimin e prodhuesit. Paralajmërime: një devijim që del jashtë aksit, qëndron mbi një kurbë, kalim, ngritje ose kurbë vertikale, ose mbivendoset me një tjetër; dhe një shënim kur shpejtësia e linjës është mbi shpejtësinë e tij divergjente.

## Zona e lirisë

Shenjoni **Sweep a clearance envelope along this track**. Zgjidhni **Outline** (dy forma vend-mbajtëse, ose **Your own outline** i shkruar si një pikë për rresht: zhvendosja nga qendra e binarit, pastaj lartësia mbi kokën e shinës, në metra), **Vehicle length** dhe **Bogie centres**, dhe, nëse ka një, **Platform edge** (ana, largësia nga qendra e binarit, lartësia mbi shinën).

Në çdo stacion kontura pjerret me ngritjen rreth shinës së ulët dhe zgjerohet nga kurba: mesi i automjetit lëviz brenda me b² / 8R, skajet e tij jashtë me (L² − b²) / 8R (b qendrat e boshteve, L gjatësia e automjetit, R rrezja atje, sipas kalimit). Blloku vizaton prerjen në drejtëz dhe aty ku është më e gjerë, dhe liston:

- **widest envelope** dhe ku,
- **track centres** krahasuar me qendrat që kërkojnë dy zonat e lirisë fqinje,
- hapësirën e mbetur te **platform edge**, ose sa është brenda,
- çdo vijë objekti, strukturë tubi dhe akst tjetër hekurudhor të gjetur **brenda zonës së lirisë**.

Një vijë objekti me kota gjykohet kundrejt konturës në lartësinë e saj mbi shinën; pa profil projekti, ose për një pikë pa kotë, gjykohet vetëm në plan dhe lista e thotë këtë. Plani shfaq dy skajet e zonës së lirisë (shtresa C-RAIL-CLRN) me një kryq te çdo gjë brenda.

Konturat e ofruara janë **vend-mbajtës, jo kalibri i ndonjë hekurudhe**. Shkruani kalibrin e strukturës së hekurudhës suaj përpara se të mbështeteni në një rezultat.

## Në programe të tjera

- **LandXML**: një akst hekurudhor shkruhet me kalimet e tij (spiType) dhe një bllok `Cant`: gjurmën, pikën e rrotullimit, shpejtësinë e linjës, dhe një stacion ku fillon dhe mbaron çdo rampë ngritjeje, me ngritjen e aplikuar, ngritjen e ekuilibrit dhe mungesën. Hapja e një skedari LandXML me një bllok `Cant` e bën atë akst një hekurudhë me ato ngritje.
- **IFC**: aksi me segmentet e ngritjes, shinat, traversat, balastin dhe nënbalastin.

## Ende nuk është ndërtuar

Devijimet në eksportin IFC, familje devijimesh përtej kurbës së vetme të mbylljes (gjilpera të lakuara, kryqe me hundë lëvizëse, rrëshqitje, diamante), rregulla kinematike të gjurmës (zona e lirisë është një kontur fiks me lëvizje kurbe), linja ajrore dhe sinjalizimi.

**Cili standard.** Te blloku Railway, "Standard to cite" zgjedh None ose European (UIC dhe EN). Zgjedhja e European i emëron dokumentet që cito një projekt evropian (EN 13803 për parametrat e aksit, EN 13232 për gjilpera dhe kryqëzime, EN 15273 për kalibrat, EN 13848 për cilësinë e gjeometrisë së binarit) dhe i jep çdo kufiri një kuti për klauzolën nga vjen. Asnjë numër nga asnjë standard nuk është i ndërtuar brenda: kufijtë e ngritjes, mungesës, teprica, gradientit dhe shpejtësisë, gjeometria e devijimit dhe kalibri i strukturës janë akoma vend-mbajtës, dhe dritarja e thotë këtë. Një inxhinier hekurudhor kontrollon çdo vlerë kundrejt tekstit të vetë standardit, dhe shkruan klauzolën pranë saj, përpara se të ndërtohet diçka. Afrika e Jugut dhe tabelat AREMA nuk janë në këtë version.
