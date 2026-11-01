---
title: Skedarët që mund të hapësh, ruajsh dhe eksportosh
summary: Skedarët e pikave, LandXML dhe projektet CivilCraft hyjnë; projektet, LandXML, DXF dhe PDF dalin; çfarë mban secili, ku shkojnë skedarët dhe çfarë ndryshon jashtë linje.
keywords: hap, ruaj, eksporto, importo, formate skedarësh, csv, txt, landxml, xml, dxf, pdf, json, shkarko, skedar projekti
from: a7debb61
---

CivilCraft hap skedarë nga kompjuteri yt dhe ruan duke i shkarkuar përsëri në të. Asgjë nuk ngarkohet dhe asgjë nuk mbahet në server. Shih gjithashtu [Skedarët e tu](common:your-files).

## Çfarë hap

Kliko {{ui:Open}} (ose shtyp {{key:Mod+O}}) dhe zgjidh një skedar, ose tërhiq skedarin nga {{pick:mac=Finder|windows=File Explorer|linux=menaxheri juaj i skedarëve}} mbi planimetri. Një skedar në çdo kohë; skedarët mbi 200 MB refuzohen.

| Lloji | Emrat e skedarit | Çfarë ndodh |
|---|---|---|
| Skedar pikash | `.csv`, `.txt`, `.pnt`, `.xyz` (çdo skedar tekst) | Hapet dialogu **Importo pikat**. Pikat zëvendësojnë pikat e projektit; aksët rrugorë, platformat dhe tubat qëndrojnë. |
| LandXML | `.xml`, `.landxml` | Krijohet një **projekt i ri** nga skedari (të pyetesh së pari nëse projekti aktual ka ndryshime të paruajtura). |
| Projekt CivilCraft | `.civilcraft.json` (çdo `.json`) | Projekti hapet ashtu siç u ruajt (të pyetesh së pari nëse projekti aktual ka ndryshime të paruajtura). |

CivilCraft vendos sipas mbaresës së skedarit, pastaj sipas karaktereve të parë: teksti që fillon me `{` lexohet si projekt, ai që fillon me `<` si LandXML, çdo gjë tjetër si skedar pikash. Një skedar që kutia e hapjes e shkurtë mund të lëshohet akoma mbi planimetri.

:::note
Importimi i një skedari pikash në një projekt që ka tashmë pika i zëvendëson ato pa pyetur, dhe pastron historikun e zhbërjes (hapja e çdo skedari është fillim i ri për zhbërjen). Nëse sipërfaqja vinte nga LandXML, importimi i pikave e kthen përsëri në sipërfaqe të ndërtuar nga pikat. Ruaj së pari nëse mund të duash pikat e vjetra përsëri.
:::

Detaje: [Formatet e skedarëve të pikave](topic:point-file-formats), [LandXML: çfarë lexohet dhe shkruhet](topic:landxml-reference).

## Çfarë ruan

{{ui:Save}} ({{key:Mod+S}}) shkruan dy skedarë pranë njëri-tjetrit, të emëruar sipas **Emrit** në panelin e majtë: `<emri>.civilcraft.json`, projekti që vazhdon ta përpunosh, dhe `<emri>.ifc`, i njëjti projekt si IFC 4.3 për të tjerët (shih [Eksporti dhe importi IFC](topic:ifc)). Secili skedar regjistron tjetrin, dhe IFC mban gjithashtu një kopje të ngjeshur të projektit, kështu që një IFC i dërguar vetëm hapet akoma plotësisht i redaktueshëm.

- **Në Studio** të dy skedarët shkruhen pranë njëri-tjetrit, në vend.
- **Në Chrome dhe Edge** ruajtja e parë pyet për një dosje dhe shkruan të dyja në të; ruajtjet e mëvonshme shkojnë në të njëjtën dosje. Anulo pyetjen e dosjes për t'i shkarkuar të dyja.
- **Në shfletuesit e tjerë** të dy skedarët shkarkohen, skedari i projektit i pari.

Hapja e njërit prej skedarëve kërkon tjetrin. Hap të dy së bashku (ose tërhiqi të dy), ose hap vetëm një: në Studio tjetri gjendet në të njëjtën dosje; në shfletues CivilCraft pyet nëse ta shtosh, ose të vazhdosh me atë që ke. Nëse IFC u ndryshua nga një program tjetër pasi CivilCraft e ruajti, ose një skedar është më i vjetër se tjetri, projekti hapet nga projektimi më i ri dhe paneli Problem thotë çfarë ndodhi, me **Ruaj tani** (shkruan përsëri të dy skedarët) dhe **Shfaq gjeometrinë e IFC-së si referencë**. Një IFC i vetëm që një program tjetër e ndryshoi hapet nga kopja e tij e projektit me atë që ende përputhet: aksët rrugorë që ai i ndryshoi marrin gjeometrinë e tij, objektet që fshiu largohen, dhe pjesa tjetër e ndryshimeve listohet, jo merret. Një skedar projekti nga përpara 0.7.1 hapet si më parë.

Skedari i projektit mban:

- çdo pikë (numër, koordinata, kotë, përshkrim) dhe emrin e skedarit të pikave nga i cili erdhi
- cilësimet e sipërfaqes: zgjedhjet e grupeve, vijat e thyerjes të vizatuara, kufirin, skajin më të gjatë të jashtëm dhe një TIN të lexuar nga LandXML
- cilësimet e shfaqjes
- aksët rrugorë me PI-të, rrezet dhe stacionin e fillimit, profilet e tyre të projektimit (PVI-të dhe gjatësitë e lakimeve) dhe cilësimet e korridorit
- platformat dhe rrjetin e tubave me rregullat e tij

Skedari nuk mban historikun e zhbërjes. Sipërfaqet, izoipsat, vijat e ditës dhe vëllimet nuk ruhen; ato rikrijohen nga të dhënat e ruajtura kur hapet projekti. Një skedar projekti nga një CivilCraft më i ri refuzohet me një mesazh që emërton versionin e tij.

## Çfarë eksporton

| Buton | Skedari | Përmbajtja |
|---|---|---|
| {{ui:LandXML}} | `<emri>.xml` | LandXML 1.2: pikat, terreni ekzistues (dhe sipërfaqja e nivelluar kur ka një) si sipërfaqe TIN, aksët rrugorë, profilet e terrenit dhe të projektimit, rrjeti i tubave |
| {{ui:DXF}} | `<emri>.dxf` | DXF R12 i vijave të planimetrisë ashtu siç shfaqen, në shtresa të emëruara |
| {{ui:DWG}} | `<emri>.dwg` | Të njëjtat vija si vizatim DWG, në formatin që zgjedh (2000 deri 2018) |
| {{ui:PDF}} | `<emri>.pdf` | Një vizatim vektorial i planimetrisë në një fletë, në një shkallë që zgjedh |
| {{ui:GLB}} ose {{ui:OBJ}} (në shiritin e pamjes 3D) | `<emri>-3d.glb`, `<emri>-3d.obj` | Ajo që tregon pamja 3D si model 3D: metra, Y lart, shkallë e vërtetë, rreth një origjine lokale të regjistruar |

Çfarë lë jashtë secili: [Shkëmbimi LandXML](topic:landxml), [Eksporto planimetrinë në DXF](topic:dxf-export) (DWG gjithashtu), [Printo planimetrinë në PDF](topic:plot-pdf), [Eksporto vendin në 3D](topic:export-3d).

## Ku shkojnë skedarët

Skedarët e ruajtur dhe të eksportuar shkojnë atje ku shfletuesi vendos shkarkimet, zakonisht dosjen Downloads. Për të zgjedhur një dosje çdo herë:

:::chromium
Hap **Cilësimet** e shfletuesit, pastaj **Shkarkimet**, dhe ndiz **Pyet ku të ruhet çdo skedar para shkarkimit**.
:::

:::firefox
Hap **Cilësimet**, pastaj **Të përgjithshme**, dhe te **Skedarët dhe aplikacionet** zgjidh **Pyet gjithmonë ku të ruhen skedarët**.
:::

:::safari
Hap **Safari > Cilësimet > Të përgjithshme** dhe vendos **Vendndodhja e shkarkimit të skedarëve** në **Pyet për çdo shkarkim**.
:::

Nëse ruan dy herë me të njëjtin emër, shfletuesi mund t'i shtojë një numër skedarit të dytë, për shembull `Site (1).civilcraft.json`. Hap më të riun herën tjetër.

## Online dhe jashtë linje

CivilCraft punon vetëm në kompjuterin tënd në çdo rast: hapja lexon skedarin në shfletues, ruajtja e shkarkon. Për të hapur CivilCraft pa asnjë lidhje, ruaje për përdorim jashtë linje më parë:

1. Ndërsa je online, kliko {{ui:Save for offline}} në shiritin e aplikacionit lart.
2. Butoni numëron ("Duke ruajtur 12 nga 30") dhe pastaj shfaq {{ui:Offline ready}}. CivilCraft është i vogël (rreth 0.6 MB), kështu që kjo zgjat pak. Kopja e ruajtur përfshin këtë ndihmë dhe terrenin shembull.
3. Pa lidhje, hap të njëjtën adresë (ose një shenjues të saj). Gjithçka punon, përfshirë {{ui:Open the sample site}}.

Gjendjet e tjera të butonit:

- {{ui:Could not save}}: disa skedarë nuk u shkarkuan. Kontrollo lidhjen dhe kliko për të provuar përsëri.
- {{ui:Offline not available}}: kjo dritare shfletuesi nuk mund të mbajë kopje jashtë linje (dritaret private dhe disa kompjuterë të menaxhuar e bllokojnë). Përdor një dritare normale.

Kliko {{ui:Offline ready}} për të parë kur u ruajt kopja, me dy zgjedhje: {{ui:Save again (get the newest version)}} dhe {{ui:Remove the offline copy}}. Ruaje përsëri para një vizite në terren, që kopja të përputhet me versionin më të fundit. Më shumë te [Jashtë linje](common:offline).

:::offline
Tani je jashtë linje. Nëse CivilCraft u ruajt për përdorim jashtë linje, gjithçka punon, përfshirë terrenin shembull. Nëse jo, vazhdo të punosh në këtë skedë, por mos e rifresko derisa të jesh përsëri online; pa një kopje të ruajtur, {{ui:Open the sample site}} dështon me "Mostra nuk mund të ngarkohej".
:::

:::tip
Për përdorim në terren, ruaje CivilCraft për përdorim jashtë linje dhe sill skedarët e pikave të tua në vetë laptopin. Projektet dhe eksportet ruhen si shkarkime pa lidhje, kështu që mund të importosh matjet e një dite, të kontrollosh sipërfaqen dhe të ruash projektin në terren.
:::

Ruajtja në cloud nuk është ende e disponueshme, dhe versionet desktop nuk janë dalë ende. Sot, skedarët që ruan janë e vetmja kopje: mbaji diku që mbahet kopje rezervë.

## Shtojcat që përdor një skedar

Kur ruan një projekt që mban të dhëna nga një shtojcë (kutitë e Rregulloreve të ndërtimit, ose një burim Adresë-në-terren), skedari regjistron cilat shtojca dhe cilat versione. Hape në një kompjuter që nuk e ka një, dhe një shirit mbi planimetri e thotë këtë dhe ofron ta shtosh nga lista e llogarisë sate. Regjistrimi është vetëm një shënim: skedari hapet në çdo rast.

## Zhbërja nga Studio

Brenda CadCraft Studio, çdo hap që përfundon në CivilCraft i thuhet Studios, kështu që zhbërja e saj në nivel projekti mund të kthejë hapin e fundit ndër aplikacione. Studio zhbën një hap vetëm kur pirgu i zhbërjes së CivilCraft është saktësisht ashtu siç e la ai hap; pasi hap një skedar tjetër, ajo e kalon këtë dritare.

## Mbyllja me ndryshime të paruajtura

Kur projekti ka ndryshime të paruajtura dhe mbyll skedën, rifreskon ose largohesh nga faqja, shfletuesi pyet nëse do të largohesh. Formulimi dhe pamja e tij i përkasin shfletuesit dhe nuk mund të ndryshohen nga CivilCraft. {{ui:New}}, dhe hapja e një projekti ose skedari LandXML, pyesin në vend të kësaj në kutinë e CivilCraft **Ndryshime të paruajtura**, me {{ui:Cancel}}, {{ui:Don’t save}} dhe {{ui:Save a copy}}.
