---
title: Ekrani, pjesë pas pjese
summary: Një turne i çdo shiriti dhe paneli në CivilCraft sipas emrit të tyre në ekran, nga shiriti i veglave deri te shiriti i gjendjes.
keywords: ndërfaqe, ekran, shirit veglash, panele, vetitë, shiriti i gjendjes, pamja e profilit, paraqitje, turne, ui
from: 76272010
---

CivilCraft ka një ekran të vetëm. Nuk ka skeda dhe nuk ka paraqitje. Panelet anësore mund të lëvizin, të notojnë ose të shkojnë në një dritare të tyre: shih [Rregullo panelet dhe përdor një monitor të dytë](common:arrange-panels). Nga lart poshtë dhe nga e majta në të djathtë:

- **shiriti i aplikacionit** (shenja CadCraft, emri i aplikacionit, versioni, Rreth, mënyra e ekranit, Ndihmë, Ruaje për jashtë linje, Letra dhe Model)
- **shiriti i veglave** me shtatë grupe butonash
- **paneli i majtë**: Vendi, Pikat, Sipërfaqe, Shfaqja dhe, sapo importon disa, shtresat GIS
- **planimetria** në mes, me **pamjen e profilit** nën të kur është hapur
- **paneli i djathtë**: Vetitë e asaj që është zgjedhur
- **shiriti i gjendjes** përgjatë fundit

## Shiriti i aplikacionit

Shiriti i hollë në krye i përket vendit CadCraft, jo vetë CivilCraft.

- Menyja e versionit tregon cilin version po përdor.
- {{ui:About CivilCraft}} hap faqen e aplikacionit në sit.
- {{ui:Full screen}} cikël mes mënyrave të ekranit: ekran i plotë, pastaj ekran i plotë me shiritat e fshehur, pastaj kthehu në normal. {{key:Ctrl+Shift+F}} bën të njëjtën gjë në çdo platformë, përfshi Mac (atje është tasti Control, jo Command). Me shiritat e fshehur, lëviz treguesin në skajin e sipërm për t'i sjellë përsëri.
- {{ui:Help}} (ose {{key:F1}}) hap këtë ndihmë në një panel anësor; {{key:F1}} ose {{key:Esc}} e mbyll.
- {{ui:Save for offline}} e mban CivilCraft në këtë shfletues, që hapet pa lidhje; pastaj shfaq {{ui:Offline ready}}. Shih [Skedarët që hap, ruan dhe eksporton](topic:files#online-and-offline).
- {{ui:Paper}} dhe {{ui:Model}} ndërrojnë midis një teme të çelët dhe një teme të errët. Planimetria dhe profili ndjekin temën; PDF-të gjithmonë printohen në të bardhë.

## Shiriti i veglave

Çdo grup ka një etiketë të vogël mbi butonat e tij. Kalo mbi një buton për të parë majën dhe tastin e tij.

| Grupi | Butonat | Çfarë bëjnë |
|---|---|---|
| Skedar | {{ui:New}}, {{ui:Open}}, {{ui:Save}} | Fillo nga e para, hap një skedar pikash, LandXML ose projekt, ruaj projektin si shkarkim |
| Eksporto | {{ui:LandXML}}, {{ui:DXF}}, {{ui:DWG}}, {{ui:PDF}} | Shkruan LandXML 1.2, një DXF R12 ose një DWG të planimetrisë, ose e printon planimetrinë në PDF |
| Sipërfaqe | {{ui:Breakline}}, {{ui:Boundary}} | Vizato një vijë thyerjeje përmes pikave të rilevimit; vizato kufirin e jashtëm |
| Projektim | {{ui:Alignment}}, {{ui:Pad}}, {{ui:Pipes}}, {{ui:Profile}} | Vizato një aks rrugor, një platformë, një linjë tubash; shfaq ose fshih pamjen e profilit |
| Redakto | {{ui:Undo}}, {{ui:Redo}}, {{ui:Copy}}, {{ui:Paste}}, {{ui:More}} | Zhbëj, ribëj, kopjo dhe ngjit pikat e rilevimit; {{ui:More}} mban Prije, Ngjit në vend, Dyfisho, Fshi, Përzgjidh të gjitha pikat dhe Mos përzgjidh asnjë |
| GIS | {{ui:Coordinates}}, {{ui:Import}}, {{ui:Export}}, {{ui:Map}} | Cakto sistemin e koordinatave, importo dhe eksporto skedarë GIS, shfaq shtresa harte nën planimetri |
| Pamja | {{ui:Select}}, {{ui:Fit}}, {{ui:3D}} | Përzgjidh dhe zhvendos gjërat; zmadho për të shfaqur gjithçka; shfaq vendin në 3D ([Shiko vendin në 3D](topic:site-3d)) |

Një mjet vizatimi mbetet i shtypur ndërsa është aktiv. Kliko përsëri, shtyp {{key:Esc}} ose shtyp {{key:V}} kthehet te {{ui:Select}}. {{ui:Undo}}, {{ui:Redo}}, {{ui:Copy}} dhe artikujt në {{ui:More}} janë të zbehura kur nuk mund të veprojnë; maja thotë pse (për shembull "Përzgjidh fillimisht pikat e rilevimit"). Çdo buton listohet në [Referenca e shiritit të veglave](topic:toolbar).

Në një dritare të ngushtë shiriti i veglave lëviz anash.

## Paneli i majtë

### Vendi

- **Emri**: emri i projektit. Emëron çdo skedar që ruan ose eksporton dhe shtypet në titullin e PDF-së.
- **Njësitë**: {{ui:US feet}} ose {{ui:Metres}}. Kjo thotë çfarë do të thotë numri. Ndryshimi i saj **nuk** i konverton koordinatat; shih [Njësitë, stacionet dhe formatet e numrave](topic:units-and-stations).

### Pikat

Bosh, tregon si të hapësh një skedar pikash. Me pika shfaq emrin e skedarit, numrin e pikave dhe sa kanë kotë, pastaj një tabelë **grupesh pikash**: një rresht për çdo fjalë të parë të përshkrimit (GRD, FL, TBS …), me një numërim dhe një zgjedhje **Sipërfaqe**:

- {{ui:Points}}: pikat hyjnë në sipërfaqe (parazgjedhja për çdo grup).
- {{ui:Breakline}}: pikat e grupit lidhen, sipas numrit të pikës, në një vijë thyerjeje.
- {{ui:Left out}}: grupi nuk prek sipërfaqen.

### Sipërfaqe

Fakte për terrenin ekzistues: pika, trekëndësha, kota më e ulët dhe më e lartë, kota mesatare, sipërfaqja 2D dhe 3D, vijat e thyerjes dhe nëse ka kufi. Nën faktet, një kuti liston çdo gjë që ndërtuesi i sipërfaqes duhej të riparonte ose nuk mund ta bënte. Pastaj:

- **Skaji më i gjatë i jashtëm**: 0 mban çdo trekëndësh të jashtëm; një numër pret trekëndëshat e gjatë e hollë nga jashtë.
- Lidhje që shfaqen kur zbatohen: {{ui:Remove the boundary}}, {{ui:Remove drawn breaklines}} dhe, për një sipërfaqe të lexuar nga LandXML, {{ui:Rebuild the surface from the points}}.

### Shfaqja

- **Sipërfaqe**: {{ui:Existing ground}} ose {{ui:Proposed (graded)}}. E dyta është e disponueshme pasi një platformë ose korridor nivelon pa probleme.
- **Kurbat e nivelit çdo**, **Kurbat kryesore çdo** dhe **Brezat** (numri i brezave me ngjyrë).
- Kutitë e zgjedhjes: {{ui:Contours}}, {{ui:Contour labels}}, {{ui:Triangles}}, {{ui:Elevation bands}}, {{ui:Slope arrows}}, {{ui:Points}}, {{ui:Point labels}}, {{ui:Breaklines}}, {{ui:Surface edge}}, {{ui:Pipes}}.
- Një legjendë e kotave të brezave shfaqet kur brezat janë të ndezur.

Cilësimet e shfaqjes ruhen me projektin, por nuk janë hapa zhbërjeje: {{key:Mod+Z}} nuk e kthen kurrë mbrapa një kuti zgjedhjeje.

## Planimetria

Planimetria tregon pikat, sipërfaqen dhe çdo gjë që projekton, në pamje planimetrie me veriun lart. Rrotulla e mausit zmadhon te treguesi, dhe tërhiq hapësirën bosh për të lëvizur. Lista e plotë është te [Tastet dhe miu](topic:keyboard).

- Në një projekt bosh një kuti me titull **Fillo me pikat e rilevimit** liston hapat e parë dhe ofron {{ui:Open the sample site}}.
- Ndërsa një mjet vizatimi është aktiv, një ndihmë lart në planimetri thotë çfarë të klikosh dhe si të përfundosh.
- Tërheqja e një skedari mbi planimetri shfaq "Lësho një skedar pikash, LandXML ose projekt".
- Gjërat e zgjedhura theksohen. Një aks rrugor ose platformë e zgjedhur shfaq doreza katrore te PI-të ose qoshet e veta; një strukturë e zgjedhur shfaq një dorezë. Tërhiq një dorezë për ta zhvendosur.
- Pikat e rilevimit të zgjedhura kanë një unazë. {{key:Shift}} dhe një klikim shton ose heq një pikë; {{key:Shift}} dhe një tërheqje vizaton një kuti (ose, e tërhequr rrotull tyre, një lasso) që shton pikat brenda. Shih [Zgjidh, kopjo dhe ngjit pikat e rilevimit](topic:copy-paste-points).

## Pamja e profilit

Shtyp {{key:R}} ose kliko {{ui:Profile}} për ta hapur nën planimetri. Shiriti i saj ka:

- një listë aksesh rrugorë (aktive kur ka dy ose më shumë akse)
- {{ui:Add PVIs}}: ndërsa është i shtypur, një klikim në profil shton një PVI ({{key:I}} e ndërron)
- një lexim i stacionit, terrenit, kotës projektuese, pjerrësisë dhe prerjes ose mbushjes nën treguesin
- një buton mbylljeje

Profili tregon terrenin ekzistues, profilin e projektimit, pjerrësitë në çdo tangjente, stacionin dhe kotën e çdo PVI-je, L dhe K të çdo lakimi vertikal me BVC dhe EVC të tij, pikat e larta dhe të ulëta, dhe ekzagjerimin vertikal. Gjithmonë përshtatet me gjithë aksin rrugor: nuk zmadhon dhe nuk lëviz. Lëvizja e treguesit përgjatë tij vendos një pikë mbi aksin rrugor në planimetri.

## Paneli i djathtë: Vetitë

Titulli i tij thotë çfarë shfaq.

- **Projekti** (asgjë e zgjedhur): aksët rrugorë dhe platformat si lidhje, blloku **Punime tokësore**, dhe blloku **Rrjeti i tubave** me rregullat dhe problemet e tij.
- **Aksi rrugor**: emri, stacioni i fillimit, gjatësia, tabela PI, lakimet, tabela PVI e profilit të projektimit dhe faktet, dhe cilësimet e **Korridorit**.
- **Platforma**: emri, kota, pjerrësitë e prerjes dhe mbushjes, sipërfaqja, faktet e linjës së ditës dhe punimet tokësore.
- **Strukturë** ose **Tub**: madhësitë, buzët, kotat e fundit, pjerrësia, mbulesa dhe çdo problem.
- **Pikë** dhe numri i saj: koordinatat e pikës, kota, përshkrimi dhe grupi (vetëm lexim).

Fushat hyjnë në fuqi kur shtyp {{key:Enter}} ose del nga fusha. Një vlerë që nuk pranohet shënohet si e pavlefshme dhe asgjë nuk ndryshon.

## Shiriti i gjendjes

- **E** dhe **N**: lindja dhe veriu nën treguesin.
- **Terreni** kota atje (dhe **I nivelluar** ku një platformë ose korridor e ka ndryshuar), ose "Jashtë sipërfaqes".
- Aksi rrugor më i afërt (ose i zgjedhuri) me **Sta** dhe ofsetin (**L** ose **R**) nën treguesin.
- Në të djathtë, mesazhe: çfarë ndodhi tani, ose pse diçka u refuzua. Një mesazh pastrohet vetë pas disa sekondash.

## Dialogët

- **Importo pikat**: hapet me çdo skedar pikash. Shih [Importo pikat e rilevimit](topic:import-points).
- **Printo planimetrinë në PDF**: shih [Printo planimetrinë në PDF](topic:plot-pdf).
- **Ndryshime të paruajtura**: pyet përpara se {{ui:New}} ose hapja e një projekti ose skedari LandXML të hedhë punën e paruajtur. {{ui:Save a copy}} shkarkon projektin së pari.

## Ekrane të vogla

Deri në 760 piksela të gjerë, si në telefon, planimetria përshtatet me ekranin: shiriti i veglave është një rresht që lëviz anash, dhe panelet hapen si fletë nga një shirit në fund. {{ui:Tools}} fsheh shiritin e veglave dhe {{ui:Move}} e vendos në fund.
