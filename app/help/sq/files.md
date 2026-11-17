---
title: Skedarët që mund të hapni, ruani dhe eksportoni
summary: Skedarë pikash, LandXML dhe projekte CivilCraft në hyrje; projekte, LandXML, DXF dhe PDF në dalje; çfarë mban secili, ku shkojnë skedarët dhe çfarë ndryshon jashtë linje.
keywords: hap, ruaj, eksporto, importo, formate skedarësh, csv, txt, landxml, xml, dxf, pdf, json, shkarko, skedar projekti
from: 82bff559
---

CivilCraft hap skedarë nga kompjuteri juaj dhe ruan duke i shkarkuar përsëri te ai. Asgjë nuk ngarkohet dhe asgjë nuk mbahet në një server. Shihni gjithashtu [Skedarët tuaj](common:your-files).

## Çfarë hap

Klikoni {{ui:Hap}} (ose shtypni {{key:Mod+O}}) dhe zgjidhni një skedar, ose tërhiqeni skedarin nga {{pick:mac=Finder|windows=Eksploruesi i skedarëve|linux=menaxheri juaj i skedarëve}} mbi planimetri. Një skedar në çdo kohë; skedarët mbi 200 MB refuzohen. Një skedar LandXML ose projekti mbi 32 MB lexohet në pjesë prej rreth 4 MB, kurrë si një bllok i vetëm teksti; ndërsa një LandXML hapet, pritni që ai të përdorë rreth 13 herë madhësinë e skedarit në memorie (një skedar 69 MB përdori rreth 0.9 GB në testin tonë).

| Lloji | Emrat e skedarëve | Çfarë ndodh |
|---|---|---|
| Skedar pikash | `.csv`, `.txt`, `.pnt`, `.xyz` (çdo skedar teksti) | Dialogu **Importo pikat** hapet. Pikat zëvendësojnë pikat e projektit; aksat rrugorë, platformat dhe tubat qëndrojnë. |
| LandXML | `.xml`, `.landxml` | Krijohet një **projekt i ri** nga skedari (pyeteni më parë nëse projekti aktual ka ndryshime të pa ruajtura). |
| Projekt CivilCraft | `.civilcraft.json` (çdo `.json`) | Projekti hapet siç u ruajt (pyeteni më parë nëse projekti aktual ka ndryshime të pa ruajtura). |

CivilCraft vendos sipas mbaresës së skedarit, pastaj sipas karaktereve të parë: teksti që fillon me `{` lexohet si projekt, teksti që fillon me `<` si LandXML, çdo gjë tjetër si skedar pikash. Një skedar që kutia e hapjes e shfaq të zbehur mund të tërhiqet akoma mbi planimetri.

:::note
Importimi i një skedari pikash në një projekt që ka tashmë pika i zëvendëson ato pa pyetur, dhe pastron historikun e zhbërjes (hapja e çdo skedari është një fillim i ri për zhbërjen). Nëse sipërfaqja vinte nga LandXML, importimi i pikave e kthen në një sipërfaqe të ndërtuar nga pikat. Ruajeni më parë, nëse mund t'i duhen përsëri pikat e vjetra.
:::

Detaje: [Formatet e skedarëve të pikave](topic:point-file-formats), [LandXML: çfarë lexohet dhe shkruhet](topic:landxml-reference).

## Çfarë ruan

{{ui:Ruaj}} ({{key:Mod+S}}) shkruan dy skedarë njëri pranë tjetrit, të emëruar sipas **Emri** në panelin e majtë: `<emri>.civilcraft.json`, projekti që vazhdoni ta redaktoni, dhe `<emri>.ifc`, i njëjti projekt si IFC 4.3 për të tjerët (shihni [Eksporti dhe importi IFC](topic:ifc)). Secili skedar i referon tjetrin, dhe IFC mban gjithashtu një kopje të kompresuar të projektit, kështu që një IFC i dërguar vetëm rihapet plotësisht i redaktueshëm.

- **Në Studio** të dy skedarët shkruhen njëri pranë tjetrit, në vend.
- **Në Chrome dhe Edge** ruajtja e parë kërkon një dosje dhe i shkruan të dy aty; ruajtjet e tjera shkojnë në të njëjtën dosje. Anuloni pyetjen për dosjen për t'i shkarkuar të dy.
- **Në shfletues të tjerë** të dy skedarët shkarkohen, skedari i projektit i pari.

Hapja e njërit prej skedarëve kërkon tjetrin. Hapni të dy bashkë (ose tërhiqni të dy), ose hapni vetëm një: në Studio tjetri gjendet në të njëjtën dosje; në një shfletues CivilCraft ju pyet nëse doni ta shtoni, ose të vazhdoni me atë që keni. Nëse IFC është ndryshuar nga një program tjetër pasi CivilCraft e ruajti, ose një skedar është më i vjetër se tjetri, projekti hapet nga dizajni më i ri dhe paneli i Problemeve thotë çfarë ndodhi, me **Ruaje tani** (shkruan përsëri të dy skedarët) dhe **Shfaq gjeometrinë e IFC si referencë**. Një IFC i vetëm që e ka ndryshuar një program tjetër hapet nga kopja e tij e projektit, me atë që ende përputhet: aksat rrugorë që i ka ndryshuar marrin gjeometrinë e tij, objektet që i ka hequr lihen jashtë, dhe pjesa tjetër e ndryshimeve listohet, por nuk merret. Një skedar projekti nga para versionit 0.7.1 hapet si më parë.

Skedari i projektit mban:

- çdo pikë (numër, koordinata, kotë, përshkrim) dhe emrin e skedarit të pikave nga i cili vjen
- cilësimet e sipërfaqes: zgjedhjet e grupeve, vijat e thyerjes së vizatuara, kufirin, skajin e jashtëm më të gjatë, dhe një TIN të lexuar nga LandXML
- cilësimet e shfaqjes
- aksat rrugorë me PI-të, rrezet dhe stacionin fillestar, profilet e tyre të projektit (PVI-të dhe gjatësitë e kurbave) dhe cilësimet e korridorit
- platformat dhe rrjetin e tubave me rregullat e tij

Nuk mban historikun e zhbërjes. Sipërfaqet, konturet, vijat e dritës së ditës dhe vëllimet nuk ruhen; ato rindërtohen nga të dhënat e ruajtura kur hapet projekti. Një skedar projekti nga një CivilCraft më i ri refuzohet me një mesazh që e emërton versionin e tij.

## Çfarë eksporton

| Butoni | Skedari | Përmbajtja |
|---|---|---|
| {{ui:LandXML}} | `<emri>.xml` | LandXML 1.2: pikat, terreni ekzistues (dhe sipërfaqja e nivelluar kur ekziston) si sipërfaqe TIN, aksat rrugorë, profilet e terrenit dhe të projektit, rrjeti i tubave |
| {{ui:DXF}} | `<emri>.dxf` | DXF R12 i vizatimit në plan siç shfaqet, në shtresa të emëruara |
| {{ui:DWG}} | `<emri>.dwg` | Të njëjtat vija si vizatim DWG, në formatin që zgjidhni (2000 deri 2018) |
| {{ui:PDF}} | `<emri>.pdf` | Një grafik vektorial i planit në një fletë, me shkallën që zgjidhni |
| {{ui:GLB}} ose {{ui:OBJ}} (në shiritin e pamjes 3D) | `<emri>-3d.glb`, `<emri>-3d.obj` | Ajo që tregon pamja 3D si model 3D: metra, Y lart, shkallë e vërtetë, rreth një origjine lokale të regjistruar |

Çfarë lë jashtë secili: [LandXML për shkëmbim](topic:landxml), [Eksporto planin në DXF](topic:dxf-export) (DWG gjithashtu), [Printo planin në PDF](topic:plot-pdf), [Eksporto vendin në 3D](topic:export-3d).

## Ku shkojnë skedarët

Skedarët e ruajtur dhe të eksportuar shkojnë atje ku shfletuesi i vendos shkarkimet, zakonisht te dosja Shkarkime (Downloads). Për të zgjedhur një dosje çdo herë:

:::chromium
Hapni **Cilësimet** e shfletuesit, pastaj **Shkarkimet**, dhe aktivizoni **Pyet ku të ruhet çdo skedar përpara shkarkimit**.
:::

:::firefox
Hapni **Cilësimet**, pastaj **Të përgjithshme**, dhe nën **Skedarët dhe aplikacionet** zgjidhni **Pyet gjithmonë ku të ruhen skedarët**.
:::

:::safari
Hapni **Safari > Cilësimet > Të përgjithshme** dhe vendosni **Vendndodhja e shkarkimit të skedarëve** në **Pyet për çdo shkarkim**.
:::

Nëse ruani dy herë me të njëjtin emër, shfletuesi mund t'i shtojë një numër skedarit të dytë, për shembull `Site (1).civilcraft.json`. Hapni më të riun herën tjetër.

## Në linjë dhe jashtë linje

CivilCraft punon vetëm në kompjuterin tuaj në çdo rast: hapja lexon skedarin në shfletues, ruajtja e shkarkon. Për ta hapur CivilCraft pa asnjë lidhje, ruajeni më parë për përdorim jashtë linje:

1. Ndërsa jeni në linjë, klikoni {{ui:Ruaje për jashtë linje}} në shiritin e sipërm.
2. Butoni numëron ("Duke ruajtur 12 nga 30") dhe pastaj shfaq {{ui:Gati jashtë linje}}. CivilCraft është i vogël (rreth 0.6 MB), kështu që kjo zgjat pak. Kopja e ruajtur përfshin këtë ndihmë dhe vendin shembull.
3. Pa lidhje, hapni të njëjtën adresë (ose një shenjues të saj). Gjithçka funksionon, përfshirë {{ui:Hap vendin shembull}}.

Gjendjet e tjera të butonit:

- {{ui:Nuk u ruajt}}: disa skedarë nuk u shkarkuan. Kontrolloni lidhjen dhe klikoni për ta provuar përsëri.
- {{ui:Modaliteti jashtë linje nuk është i disponueshëm}}: ky dritare shfletuesi nuk mund të mbajë një kopje jashtë linje (dritaret private dhe disa kompjuterë të administruar e bllokojnë). Përdorni një dritare normale.

Klikoni {{ui:Gati jashtë linje}} për të parë kur u ruajt kopja, me dy zgjedhje: {{ui:Ruaje përsëri (merr versionin më të ri)}} dhe {{ui:Hiq kopjen jashtë linje}}. Ruajeni përsëri para një vizite në terren, që kopja të përputhet me versionin më të ri. Më shumë te [Jashtë linje](common:offline).

:::offline
Tani jeni jashtë linje. Nëse CivilCraft u ruajt për përdorim jashtë linje, gjithçka funksionon, përfshirë vendin shembull. Nëse jo, vazhdoni të punoni në këtë skedë, por mos e rifreskoni derisa të jeni përsëri në linjë; pa një kopje të ruajtur, {{ui:Hap vendin shembull}} dështon me "Shembulli nuk mund të ngarkohej".
:::

:::tip
Për përdorim në terren, ruajeni CivilCraft për përdorim jashtë linje dhe sillni skedarët e pikave në vetë laptopin. Projektet dhe eksportet ruhen si shkarkime pa asnjë lidhje, kështu që mund të importoni matjet e një dite, të kontrolloni sipërfaqen dhe të ruani projektin në terren.
:::

Ruajtja në cloud nuk është ende e disponueshme, dhe versionet për desktop nuk janë dalë ende. Sot, skedarët që ruani janë kopja e vetme: mbajini diku ku bëhet kopjim rezervë.

## Shtojcat e përdorura nga një skedar

Kur ruani një projekt që mban të dhëna nga një shtojcë (kutitë e Rregulloreve të ndërtimit, ose një burim Adresë për terrenin), skedari regjistron cilat shtojca dhe cilat versione. Hapeni në një kompjuter që nuk e ka një prej tyre dhe një shirit mbi planimetri e thotë këtë dhe ofron ta shtojë nga lista e llogarisë suaj. Regjistrimi është vetëm një shënim: skedari hapet në çdo rast.

## Zhbëj nga Studio

Brenda CadCraft Studio, çdo hap që përfundoni në CivilCraft i njoftohet Studio-s, kështu që zhbërja e saj në nivel projekti mund ta kthejë mbrapsht hapin e fundit në të gjitha aplikacionet. Studio zhbën një hap vetëm kur stiva e zhbërjes së CivilCraft është saktësisht ashtu si e la ai hap; pasi hapni një skedar tjetër, ajo e kalon këtë dritare.

## Mbyllja me ndryshime të pa ruajtura

Kur projekti ka ndryshime të pa ruajtura dhe mbyllni skedën, rifreskoni ose largoheni nga faqja, shfletuesi pyet nëse doni të largoheni. Fjalët dhe pamja e pyetjes i përkasin shfletuesit dhe nuk mund të ndryshohen nga CivilCraft. {{ui:E re}}, dhe hapja e një projekti ose skedari LandXML, pyesin në vend të kësaj në kutinë e vetë CivilCraft **Ndryshime të pa ruajtura**, me {{ui:Anulo}}, {{ui:Mos ruaj}} dhe {{ui:Ruaj një kopje}}.
