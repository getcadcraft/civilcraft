---
title: Tubacionet e ujit: presionet, rrjedhjet dhe rrjedha për zjarrin
summary: Vizato në plan një rrjet presioni me nyje, rezervuarë, cisterna, tuba, pompa dhe valvula reduktuese presioni; CivilCraft llogarit kotat, presionet dhe rrjedhjet (Hazen–Williams, rrjete unazore), rrjedhën e disponueshme për një zjarr dhe një ditë kërkese. Funksion laboratorik; çdo rezultat kërkon kontrollin e një inxhinieri.
keywords: ujë, tub uji, shpërndarje uji, rrjet presioni, tub presioni, rrjet unazor, hazen-williams, faktori c, humbje kote, presion i mbetur, rrjedhë zjarri, hidrant, kërkesë, nyje, rezervuar, cisternë, pompë, kurba e pompës, valvulë reduktuese presioni, prv, valvulë kontrolli, periudhë e zgjatur, epanet, inp, shpejtësi
from: df46bf6d
---

Tubacionet e ujit janë ana e presionit të një vendi: tuba që janë gjithmonë plot, me ujin të shtyrë nga një rezervuar, një cisternë ose një pompë. CivilCraft llogarit kotën dhe presionin në çdo nyje dhe rrjedhjen në çdo tub, duke përfshirë rrjetet unazore ku uji ka më shumë se një rrugë. Është në laborator ndërsa verifikohet.

**Vetëm një ndihmë llogaritjeje.** Çdo numër ka nevojë për kontrollin e një inxhinieri të kualifikuar: përgjigjja është aq e mirë sa kërkesat, kotat, madhësitë e tubave dhe vlerat e rrugozitetit që i ke dhënë, dhe një model në gjendje të qëndrueshme nuk di asgjë për goditjen e ujit (water hammer), cilësinë e ujit ose sjelljen reale të një pompe zjarri.

## Vizato rrjetin

1. Nën **Sipërfaqja** › {{ui:Më shumë}}, zgjidh {{ui:Tubacionet e ujit…}}. Dritarja mbetet e hapur ndërsa punon në plan.
2. Zgjidh {{ui:Rezervuar}} dhe kliko planin aty ku është furnizimi. Kota e tij fillon 100 ft (30 m) mbi terren; ndryshoje te Vetitë.
3. Zgjidh {{ui:Nyjë}} dhe kliko çdo vend ku merret ujë ose ku takohen tubat. Një nyje e merr kotën e saj nga terreni; shkruaj një tjetër te Vetitë për ta mbishkruar.
4. Zgjidh {{ui:Tubi}}, kliko një nyje, pastaj nyjen që lidh. Mjeti mbetet i ndezur për tubin e radhës. {{ui:Pompë}} dhe {{ui:Valvulë reduktuese presioni}} vizatohen në të njëjtën mënyrë, nga nyja e thithjes (ose e sipërme) te nyja e shkarkimit (ose e poshtme). {{ui:Cisternë}} vendoset si një nyje.
5. Zgjidh një nyje dhe shkruaj {{ui:Kërkesa}} e saj (gpm, ose L/s në një projekt në metra). Zgjidh një tub dhe vendos {{ui:Diametrin}} e tij (in, ose mm) dhe, nëse e di, C-në e Hazen–Williams.

Çdo ndryshim është një hap zhbërjeje. Fshirja heq nyjen dhe tubat që mbarojnë në të.

## Çfarë do të thotë secila pjesë

- **Tubi.** Gjatësia matet përgjatë planit, përveç nëse shkruan një të tillë. C është rrugoziteti i Hazen–Williams (130 si fillim, ndrysho parazgjedhjen në dritare). Një koeficient humbjeje lokale K shton humbjet e lakimeve dhe të lidhjeve. Shëno **Valvulë kontrolli** për një tub që nuk duhet të bartë ujë prapa; një tub i **Mbyllur** nuk bart asgjë.
- **Rezervuari.** Një burim me kotë fikse, niveli i ujit që mban mbi datumin. Jep ose merr sa i duhet rrjetit.
- **Cisterna.** Një nivel që ndryshon gjatë ditës. Në rezultatet e gjendjes së qëndrueshme është një burim me nivelin e tij aktual.
- **Pompa.** Një pikë projektimi (rrjedhje dhe kotë) jep kurbën e zakonshme përmes saj: kota me rrjedhje zero është 133 % e kotës së projektimit, dhe kota është zero në dyfishin e rrjedhjes së projektimit. Një pompë nuk shtyn kurrë ujë prapa.
- **Valvula reduktuese presioni.** Mban presionin që vendos poshtë, ndërsa furnizimi është më i lartë. Kur furnizimi është më i ulët, është e hapur dhe nuk mban asgjë; nëse uji do të kthehej prapa, mbyllet.

## Lexo rezultatet

Dritarja shfaq kotën dhe presionin e çdo nyje dhe rrjedhjen, shpejtësinë dhe humbjen e kotës për 1,000 ft (ose për km) të çdo lidhjeje, me nyjet e ngjyrosura në plan: jeshile është midis presionit më të ulët dhe më të lartë që ke vendosur, e kuqe nën të, e verdhë mbi të. Shigjetat e rrjedhjes tregojnë drejtimin. Zgjidh një nyje ose tub për të lexuar numrat e tij te Vetitë.

Nën tabela ka një listë me çfarë duhet parë: presion i ulët ose i lartë, një tub më i shpejtë se kufiri yt, një nyje e shkëputur nga çdo burim, ose një zgjidhës që nuk u stabilizua. Të njëjtat gjetje janë në panelin e Problemeve. Vendos kufijtë në dritare (20 psi, 100 psi dhe 10 ft/s si fillim; 140 kPa, 700 kPa dhe 3 m/s në një projekt në metra).

## Rrjedha për zjarrin

{{ui:Rrjedha për zjarrin…}} vizaton një rrjedhë në një nyje dhe shfaq presionin atje dhe presionin më të ulët kudo në rrjet. Gjithashtu gjen rrjedhën e disponueshme në atë nyje, ndërsa nyja më e dobët e rrjetit mban presionin e mbetur që jep. Kërkesat e tjera mbeten ashtu si janë.

## Një ditë kërkese

{{ui:Një ditë kërkese…}} e ekzekuton rrjetin orë pas ore. Jep modelin e kërkesës te cilësimet e skedarit (një listë shumëzuesish që përsëritet); cisternat mbushen dhe zbrazen me rrjedhjen hyrëse dhe dalëse, dhe një pompë mund të ndjekë një model ndezje/fikjeje. Një cisternë që arrin nivelin më të lartë ose më të ulët të saj emërtohet në listë: CivilCraft nuk e mbyll hyrjen ose daljen e saj për ty, kështu që lexoje si "kjo cisternë është shumë e vogël ose pompa shumë e madhe".

## Tekst EPANET

{{ui:Ruaj si tekst EPANET (.inp)}} shkruan rrjetin në formatin me tekst të thjeshtë që lexojnë shumë programe uji, dhe {{ui:Hap tekst EPANET (.inp)…}} lexon një të tillë. Kalon vetëm ajo që modelon CivilCraft: nyjet, rezervuarët, cisternat, tubat, pompat me kurbë kote, valvulat reduktuese presioni, modelet e kërkesës dhe kohët. Llojet e tjera të valvulave, pompat e dhëna me fuqi dhe formulat e tjera të humbjes janë emërtuar dhe lihen jashtë. Skedari duhet të përdorë të njëjtat njësi si projekti.

## Hidrantët, valvulat dhe lidhjet

Zgjidh një nyje dhe shëno **Hidrant** për të vendosur një hidrant aty; zgjidh një linjë dhe shtyp **Shto në mes** për të vendosur një valvul, një valvul ajri, një valvul shkarkimi ose një matës mbi të. Janë objekte të rrjetit: lëvizin me të dhe një hap zhbërjeje i heq.

Vendndodhja nënkupton edhe lidhje, dhe CivilCraft i liston pa u kërkuar: një **trung T** aty ku takohen tre linja, një **kryq** ku takohen katër, një **lakim** (me këndin e tij) ku dy linja kthehen me 5° ose më shumë, një **reduktor** ku takohen dy madhësi, dhe një **kapak** në një fund të vdekur. {{ui:Tabela e pajisjeve (CSV)}} i numëron ato dhe linjat sipas madhësisë. Kjo është ajo që nënkupton vendndodhja: një llogaritje për ta krahasuar me detajet e tua, jo një listë për të porositur.

Linjat vendosen në terren minus një mbulesë (4 ft ose 1.2 m) që të mund të vizatohen dhe modelohen në 3D; presionet më lart nuk varen kurrë nga ajo.

## Në plan dhe në skedarë

Plani, PDF-i dhe DWG ose DXF mbajnë linjat në **C-WATR-MAIN** me madhësitë e tyre në **C-WATR-TEXT**, hidrantët në **C-WATR-HYDR**, valvulat në **C-WATR-VALV** dhe lidhjet në **C-WATR-FITT**. Eksporti LandXML shkruan një rrjet tubash uji (një strukturë për çdo nyje, një tub për çdo linjë, hidrantët të emërtuar); importi LandXML e lexon përsëri si tubacione uji, pa kërkesa, pompa ose valvula, sepse LandXML nuk i mban. Eksporti IFC i shkruan linjat si segmente tubash, hidrantë, valvula dhe lidhje në një sistem uji. Këta skedarë janë verifikuar me lexuesit dhe shkruesit tanë; provoji në programet e tua të tjera dhe na thuaj çfarë thonë.

## Ç’mungon ende

Cilësia dhe mosha e ujit, kontrollet dhe rregullat përtej modelit ndezje/fikje të një pompe, llojet e tjera të valvulave, kërkesa sipas presionit, tubat me diametër që ndryshon, dhe rrjedhjet e kanalizimit gjatë kohës. Shih [Ç’nuk është ndërtuar ende](topic:not-built-yet). Rrjedhjet e projektimit sanitar, që janë një llogaritje tjetër, janë te [Rrjedhat e projektimit sanitar](topic:sanitary-design).
