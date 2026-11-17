---
title: Zgjidhja e problemeve
summary: Simptoma, shkaqe dhe zgjidhje për problemet që hasen në CivilCraft, me mesazhet e sakta që shfaq aplikacioni.
keywords: probleme, gabime, nuk punon, rregullo, ndihmë, mesazhe, diagnozë, refuzuar, mungon, i gabuar, i ndërruar, izoipsët mungojnë
from: a9f7dedc
---

Mesazhet shfaqen në shiritin e statusit në fund djathtas, në kutitë në panelet e majtë dhe të djathtë, dhe në dialogë. Citohen këtu ashtu siç i shfaq aplikacioni.

## Hapja e skedarëve

**"Ky skedar është më i madh se 200 MB; CivilCraft nuk hap ende skedarë kaq të mëdhenj."**
Ndaje skedarin e pikave, ose holloje të dhënat përpara se ta hapësh.

**"Nuk u hap site.json: Ky nuk është një skedar projekti CivilCraft."**
Skedari mbaron me `.json` ose fillon me `{`, por nuk është një projekt CivilCraft. Skedarët e pikave nuk duhet të fillojnë me `{`.

**"Nuk u hap … Ky skedar projekti është nga një CivilCraft më i ri (versioni 2)."**
Projekti u ruajt nga një version më i ri. Hapeni atje, ose eksportoni LandXML prej tij.

**"Nuk u hap … Ky është XML, por jo LandXML (elementi rrënjë është <…>)."**
Skedari është një lloj tjetër XML. Eksportoni LandXML nga programi tjetër.

**"… nuk ka pika, sipërfaqe TIN ose aks rrugor që CivilCraft mund t’i lexojë."**
Çdo gjë në skedar është diçka që CivilCraft e kalon (për shembull vetëm sipërfaqe rrjete, ose vetëm aks rrugorë spiralë). Pjesa tjetër e mesazhit thotë çfarë kishte. Shih [LandXML: çfarë lexohet dhe shkruhet](topic:landxml-reference).

**"Mostra nuk mund të ngarkohej: …"**
{{ui:Hap vendin e mostrës}} lexon një skedar nga faqja e CadCraft. Pa lidhje funksionon vetëm nëse CivilCraft është ruajtur për përdorim jashtë linje (butoni në shiritin e aplikacionit shfaq {{ui:Gati jashtë linje}}). Lidhu në internet, kliko {{ui:Ruaje për jashtë linje}}, dhe që nga ai çast funksionon edhe jashtë linje. Shih [Jashtë linje](common:offline).

**{{ui:Ruaje për jashtë linje}} shfaq {{ui:Nuk u ruajt}}.**
Disa skedarë nuk u shkarkuan. Kontrollo lidhjen dhe kliko butonin përsëri.

**{{ui:Ruaje për jashtë linje}} shfaq {{ui:Modaliteti jashtë linje nuk është i disponueshëm}}.**
Ky dritare shfletuesi nuk mund të mbajë një kopje jashtë linje, zakonisht sepse është dritare private ose kompjuteri është i menaxhuar. Hap CivilCraft në një dritare normale.

**Jashtë linje, aplikacioni nuk hapet fare.**
Nuk u ruajt për përdorim jashtë linje në këtë shfletues, ose shfletuesi fshiu të dhënat e faqes (Safari e bën këtë për faqet që nuk janë vizituar për disa javë). Lidhu në internet, hap CivilCraft dhe kliko {{ui:Ruaje për jashtë linje}}.

**Kopja jashtë linje është një version më i vjetër.**
Kliko {{ui:Gati jashtë linje}}, pastaj {{ui:Ruaje përsëri (merr versionin më të ri)}} ndërsa je në internet.

**Një skedar është i zbehur në kutinë e hapjes.**
Kutia liston vetëm skedarët e pikave, LandXML dhe skedarët e projektit sipas mbaresave të tyre. Tërhiqe skedarin mbi plan, ose riemëroje me `.txt`.

## Importimi i pikave

**"Nuk mund të lexoheshin pika nga ky skedar."**
Zgjidh renditjen e kolonave me dorë te **Kolonat**. Nëse asgjë nuk funksionon, hap skedarin në një redaktues teksti dhe kontrollo që ka një pikë për rresht me numra brenda.

**Planit i duket i pasqyruar, i rrotulluar ose i shtrirë në një vijë.**
Veriu dhe lindja janë ndërruar. Përmbledhja thoshte "e marrë me hamendësim nga numri i kolonave". Zgjidh PENZD në vend të PNEZD (ose anasjelltas) te **Kolonat**, ose importo përsëri.

**Pika shumë larg pjesës tjetër, dhe plani u zmadhua aq sa u bë një pikë.**
Një rresht ka një gabim shkrimi në një koordinatë, ose skedari përzien sisteme koordinatash. Gjeje pikën (kliko mbi të për të parë numrin e saj) dhe korrigjo skedarin.

**Rreshta të listuar nën "Rreshta që nuk u lexuan".**
Shih tabelën te [Importo pikat e rilevimit](topic:import-points#rows-that-are-not-read).

**Pikat e mia të vjetra u zhdukën.**
Importimi i një skedari pikash zëvendëson të gjitha pikat dhe pastron zhbërjen. Hap projektin e ruajtur për t’i rikthyer.

## Sipërfaqja

**"Sipërfaqja: Nuk është ndërtuar" me kuti të kuqe.**
Kutia thotë pse: "Një sipërfaqe ka nevojë për të paktën tre pika me kota.", "Pikat janë të gjitha në një vijë: pa trekëndësha.", "Nuk ka pika me kota.", "Kufiri nuk mbivendoset me pikat." ose "Nuk mbetet asnjë trekëndësh brenda kufirit." Kontrollo renditjen e kolonave, grupet e pikave (a janë {{ui:Lënë jashtë}}?), dhe kufirin.

**Izoipsët presin drejt e nëpër një kanal ose kreshtë.**
Ajo vijë nuk është vijë thyerjeje. Vendose grupin e saj në {{ui:Vijë thyerjeje}}, ose vizatoje me mjetin {{ui:Vijë thyerjeje}}. Shih [Ndërto dhe rafino sipërfaqen](topic:build-surface).

**Një grup vijash thyerjeje vizaton një zig-zag.**
Grupi përmban më shumë se një vijë, ose pikat e tij nuk janë numeruar sipas vijës. Vendose grupin përsëri në {{ui:Pikat}} dhe vizato secilën vijë me mjetin {{ui:Vijë thyerjeje}}.

**Trekëndësha të gjatë e hollë përgjatë jashtës.**
Vizato një kufi ({{key:O}}) ose vendos **{{ui:Brinja më e gjatë e jashtme}}**.

**Asnjë izoipsë fare, megjithëse sipërfaqja është ndërtuar.**
Ose {{ui:Izoipsët}} është i fikur nën **Shfaqja**, ose intervali është aq i vogël sa do të kishte më shumë se 2,000 nivele izoipsash. Zgjidh një interval më të madh.

**Vijat e thyerjes ose kufiri nuk ndryshojnë asgjë.**
Sipërfaqja erdhi nga LandXML ("Sipërfaqe (nga LandXML)"). Përdoret ashtu siç është. Kliko {{ui:Ririndërto sipërfaqen nga pikat}} për ta ndërtuar nga pikat.

**"Nuk ka ende sipërfaqe: hap së pari pikat e rilevimit."**
Vija e thyerjes, kufiri dhe sheshi kanë nevojë për një sipërfaqe ekzistuese të terrenit. Importo pikat së pari.

**"Kliko një pikë rilevimi me kotë: një vijë thyerjeje merr kotat e pikave."**
Mjeti {{ui:Vijë thyerjeje}} zgjedh vetëm pika rilevimi. Zmadho dhe kliko mbi një pikë (një katror portokalli tregon cilën do të marrë).

## Vizatimi

**Pika ime e fundit u zhduk kur klikova dy herë për të përfunduar.**
Në këtë version, klikimi dy herë përfundon aksin rrugor, sheshin, vijën e thyerjes ose kufirin, por heq pikën mbi të cilën klikove dy herë. Kliko një herë mbi pikën e fundit dhe shtyp {{key:Enter}}. Përdor {{key:Mod+Z}} nëse ka ndodhur tashmë, pastaj vizato përsëri.

**Nuk mund ta përfundoj një vizatim në tablet.**
Përfundimi kërkon {{key:Enter}}; ende nuk ka buton në ekran. Lidh një tastierë. Shih [Miu, trackpad-i dhe prekja](topic:keyboard#mouse-trackpad-and-touch).

**Tërheqja për të vendosur një pikë lëviz planin.**
Një tërheqje më e gjatë se disa piksele lëviz planin në çdo mjet. Kliko pa lëvizur.

**"Një aks rrugor ka nevojë për të paktën dy pika." / "Një shesh ka nevojë për të paktën tre cepa." / "Një linjë tubash ka nevojë për të paktën dy struktura."**
Shtype {{key:Enter}} shumë herët. Vizatimi hidhet; fillo përsëri.

**Tastet si A ose G nuk bëjnë asgjë.**
Një kuti tekstit ose një listë në panel ende ka fokusin, kështu që shkronjat shkojnë atje. Kliko planin një herë, pastaj shtyp tastin. Në Mac, tasti i fshirjes është Backspace për shfletuesin: përdor Fn dhe delete për të fshirë një zgjedhje.

## Aksi rrugor dhe profilet

**"Kurbat te PI 2 dhe PI 3 mbivendosen: … Përdor rreze më të vogla."**
Dy kurba kanë nevojë për më shumë tangjente se sa ka midis PI-ve të tyre. Ul njërën ose të dyja rrezet në tabelën e PI-ve, ose largo PI-të.

**"PI 3 kthehet drejt e prapa; nuk mund të marrë një kurbë."**
Aksi rrugor kthehet mbrapsht mbi vetveten te ai PI. Zhvendose ose hiqe PI-në.

**"Ky aks rrugor nuk ka tokë nën vete ku të nisë."**
Aksi rrugor është jashtë sipërfaqes. Zhvendose mbi sipërfaqe, ose shto PVI-të duke klikuar me {{ui:Shto PVI-të}} të ndezur.

**"Kurba vertikale te PVI 3 (L = …) fillon para se të mbarojë kurba ose PVI-ja para saj." / "… kalon PVI-n tjetër."**
Shkurto gjatësinë e kurbës ose largo PVI-të.

**"Ka tashmë një PVI te …"**
Ekziston një PVI te ai stacion. Kliko diku tjetër, ose tërhiqe atë ekzistuese.

**Pamja e profilit është bosh: "Vizato një aks rrugor për të parë profilin e tij."**
Nuk ka aks rrugor, ose ai i zgjedhur ka gabime.

## Korridoret dhe sheshet

**"Korridori ka nevojë për një profil projektimi pa gabime."**
Fillo një profil projektimi ({{ui:Nis nga terreni}}) dhe rregullo çdo mbivendosje kurbash.

**"… pjerrësitë anësore dalin nga sipërfaqja përpara se të takojnë terrenin." / "… vijat e pjerrësisë dalin nga sipërfaqja përpara se ta takojnë …"**
Nivelimi arrin skajin e sipërfaqes përpara se të takojë terrenin. Zhvendos projektin brenda nga skaji, ose afroje më shumë me terrenin. Një shesh i ri i vizatuar pjesërisht jashtë sipërfaqes mund të fillojë në kotën 0: shkruaj një kotë të vërtetë.

**"Vijat e dritës së korridorit kryqëzohen …" / "Vija e dritës kryqëzohet me veten …"**
Pjerrësitë nga anë të ndryshme takohen me njëra-tjetrën: kurba të ngushta, shesh të ngushtë, prerje të thella ose mbushje të larta. Përdor një rreze më të madhe, një strukturë më të ngushtë, një shesh më të gjerë ose pjerrësi më të thepisura.

**"Nuk ka ende vëllime: një shesh duhet të nivelohet pa probleme."**
Rregullo problemet e listuara në kutinë e kuqe mbi të.

**{{ui:E propozuar (e nivelluar)}} është i zbehur.**
Asnjë shesh ose korridor nuk është niveluar ende.

## Tubat

**"P2 nuk ka ende kota fundi."**
Kliko {{ui:Cakto kotat e tij sipas rregullave}} ose shkruaj kotat e fundit.

**"P1: nuk ka tokë te S1 ku të nisë."**
Struktura e sipërme është jashtë sipërfaqes dhe nuk ka buzë. Shkruaj një buzë për të.

**Çdo tub shënohet pasi zhvendosa një strukturë.**
Zhvendosja e një strukture nuk ndryshon kotat e fundit. Kliko {{ui:Cakto çdo kotë fundi sipas rregullave}}.

Të gjitha mesazhet e rrjetit shpjegohen te [Hartëzo një rrjet tubash me rrjedhje me gravitet](topic:pipe-network#read-and-fix-problems).

## Ruajtja dhe eksportimi

**"Nuk ka ende asgjë për të eksportuar." / "Nuk ka ende asgjë për të printuar."**
Projekti është bosh. Importo pikat së pari.

**Nuk e gjej skedarin e ruajtur.**
Ai është te shkarkimet e shfletuesit (zakonisht dosja Downloads). Shih [Skedarët që hap, ruan dhe eksporton](topic:files#where-the-files-go).

**Shkalla e PDF-it është e gabuar në letër.**
Printo me 100% ose në madhësinë reale, jo "përshtat në faqe".

**Pyetje në tekstin e PDF-it.**
Emrat ose përshkrimet përdorin karaktere jashtë grupit Evropian Perëndimor. Mesazhi i statusit i numëron ato. Riemëro me karaktere të thjeshta.

**Printimi del i prerë në skaje.**
Shkalla është shumë e madhe për fletën. Zgjidh shkallën e shënuar "(përshtatet)", një flete më të madhe, ose {{ui:Ç’është në ekran}}.

**{{key:Mod+P}} hapi dialogun e printimit të shfletuesit.**
Faqja nuk kishte fokusin. Mbyll dialogun, kliko planin dhe shtyp {{key:Mod+P}} përsëri, ose kliko {{ui:PDF}}.

## Vetë aplikacioni

**Ekrani është bosh ose shiriti i veglave nuk bën asgjë.**
Përdor një version aktual të Chrome, Edge, Firefox ose Safari, dhe rifresko. Shih [Shfletuesit](common:browsers).

**Aplikacioni është i ngadaltë me një skedar të madh pikash.**
Fik {{ui:Trekëndësha}}, {{ui:Etiketat e pikave}} dhe {{ui:Brezat e kotës}}, dhe përdor një interval izoipsash më të madh. Sipërfaqet shumë të mëdha duan pak kohë për t’u ndërtuar përsëri pas çdo ndryshimi.

**Shfletuesi pyet "Të largohem nga faqja?"**
Projekti ka ndryshime të pa ruajtura. Qëndro, ruaje me {{key:Mod+S}}, pastaj largohu.
