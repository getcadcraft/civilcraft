---
title: Shikoni vendin në 3D
summary: Hapni pamjen 3D, rrotulloni, lëvizni dhe zmadhoni, vendosni ekzagjerimin vertikal dhe ngjyrosjen, zgjidhni çfarë shfaqet, dhe klikoni aksët, platformat, vijat e veçorive, vijat e thyerjes, tubat, strukturat dhe pikat për t'i përzgjedhur.
keywords: etiketa, etiketa 3d, billboard, etiketa që shikojnë kamerën, etiketa stacionesh, etiketa konturash, etiketa pikash, rrëshqitje, ajror, shtresat e hartës mbi sipërfaqe, 3d, tre d, pamja 3d, kub pamjeje, busull, rrotullim, perspektivë, paralele, izometrike, iso, ekzagjerim vertikal, terren, model, model vendi, fluturim rreth, vizualizim, render, tuba në 3d, struktura, pusetë, korridor 3d, rrugë në 3d, sipërfaqe rrugore, korsi, bordura, trotuare, bimë në 3d, pemë në 3d, shkurre, gardhe, peizazh 3d, rampa në 3d, shkallë, mure, shtrime, punime të forta 3d
from: a16bafe1
---

Pamja 3D tregon vendin si një model të vetëm: tokën ekzistuese dhe sipërfaqen e nivelizuar, konturat e rrëshqitura mbi to, vijat e thyerjes dhe skajin e sipërfaqes, çdo akst rrugor mbi profilin e vet të projektit me shenja stacionesh, vijat e veçorive të korridorit dhe vetë rrugën (korsi, bankina, kanale, bordura, shirita dhe trotuare, secila në ngjyrat e veta), platformat me vijat e tyre të dritës së ditës, rrjetin e tubave me tubat dhe strukturat në kotat e tyre reale, dhe nga hapësira e punës Landscape bimët, shtrimet, shtigjet, muret, bordurat, rampat dhe shkallët. Ai lexon të njëjtin projekt si plani, kështu që çdo ndryshim shfaqet në të dyja.

## Hapni pamjen 3D

1. Hapni pikat topografike (ose një skedar LandXML ose projekti) që të ketë një sipërfaqe. Bimët, shtrimet ose rampat vetëm janë të mjaftueshme për ta hapur edhe atë.
2. Shtypni {{key:D}}, ose klikoni {{ui:3D}} te grupi {{ui:View}} i shiritit të veglave.
   Pamja 3D hapet mbi plan, duke parë të gjithë vendin nga juglindja. Herën e parë, duhet pak kohë për t'u ngarkuar.
3. Shtypni {{key:D}} përsëri, ose klikoni {{ui:3D}} përsëri, për t'u kthyer në plan. Zgjedhja e një vegle vizatimi si {{ui:Alignment}} ose {{ui:Pad}} gjithashtu kthen në plan, sepse vizatimi bëhet atje.

## Lëvizni rreth

| Për të | Bëni këtë |
|---|---|
| Rrotulloni | Tërhiqni me butonin e majtë ose të mesëm |
| Lëvizni | Tërhiqni me butonin e djathtë, ose {{key:Shift}} dhe tërhiqni |
| Zmadhoni | Rrotulloni rrotën; zmadhon drejt treguesit |
| Rrotulloni në trackpad | Rrëshqitni me dy gishta ({{key:Shift}} dhe rrëshqitja lëviz) |
| Zmadhoni në trackpad | Shtrëngoni (pinch) |
| Prekja | Një gisht rrotullon; dy gishta shtrëngojnë për të zmadhuar dhe lëvizin për të lëvizur |
| Tastet (pamja ka fokusin) | {{key:Left}} {{key:Right}} {{key:Up}} {{key:Down}} rrotullojnë, me {{key:Shift}} lëvizin; {{key:Plus}} dhe {{key:Minus}} zmadhojnë |

Shiriti mbi pamjen ka pjesën tjetër:

- Lista e pamjes: **Iso**, **Top**, **Bottom**, **Front** (duke parë nga veriu), **Back**, **Left**, **Right**.
- {{ui:Perspective}}: i shtypur është një pamje perspektive; klikojeni për një projeksion paralel (pa shkurtim perspektive).
- {{ui:Extents}}: shfaq gjithçka sërish. {{key:F}} bën të njëjtën gjë ndërsa pamja 3D është e hapur.

## Kubi i pamjes

Kubi i pamjes në qoshen e sipërme djathtas kthehet me pamjen. Klikoni një anë, një skaj ose një qoshe për të parë vendin nga aty (kamera kthehet butë, përveç nëse sistemi juaj kërkon lëvizje të reduktuar). Tërhiqeni kubin për ta rrotulluar. Unaza e busullës nën të tregon veriun (veriun e rrjetit, +Y): tërhiqeni unazën për ta rrotulluar vendin rreth vertikales, ose klikoni N, E, S ose W për të parë nga ajo anë. {{ui:Home}}, shtëpiza e vogël në skajin e sipërm majtas, kthehet në pamjen iso të gjithë vendit. Me tastierë: {{key:Tab}} te kubi, shigjetat zgjedhin një anë, skaj ose qoshe, {{key:Enter}} shikon nga aty.

Në plan i njëjti kub tregon sipërin. Klikoni çdo anë, skaj ose qoshe tjetër (ose tërhiqeni) për të hapur pamjen 3D duke parë nga aty: kjo është rruga më e shpejtë në 3D nga një drejtim i caktuar. Për të zëvendësuar kubin me një ikonë të vogël boshtesh, ose për ta fshehur, shihni **Treguesi i qoshes** te [Cilësimet e CivilCraft](topic:settings).

## Zmadhoni kotat

Vendet janë zakonisht shumë më të gjera se sa janë të larta, kështu që kotat zgjaten nga **2×** në fillim. Zgjidhni **1×**, **2×**, **3×**, **5×** ose **10×** në listën e shiritit, ose te **3D vertical exaggeration** te [Cilësimet e CivilCraft](topic:settings) (të dyja janë një cilësim). Ndryshon vetëm pamja: vëllimet, profilet dhe eksportet mbeten në përmasa reale.

## Ngjyrosni sipërfaqet

- **Elevation bands**: të njëjtat brezat dhe ngjyrat si brezat e lartësisë të planit (numri i brezave vendoset te **Shfaq** në panelin e majtë). Çdo kufi brezi pritet saktë në kotën e tij.
- **One colour**: toka ekzistuese dhe sipërfaqja e nivelizuar, secila me një ngjyrë të thjeshtë.
- **Map layers**: shtresat e hartës të shfaqura nën plan (një foto e georeferuar, pllaka hartash ose një shërbim harte; shihni [Shtresat e hartës](topic:map-layers)) të vendosura mbi sipërfaqet si një fletë, kështu që një foto ajrore shfaqet mbi kodrat. Fotot që ende po vijnë plotësohen ndërsa mbërrijnë. Pa asnjë shtresë harte të shfaqur, sipërfaqet mbajnë brezat e tyre të lartësisë dhe pamja e thotë këtë. Fotoja është për ekranin: eksportet GLB dhe OBJ nuk e mbajnë atë.

Kur shfaqen të dyja sipërfaqet, toka ekzistuese është transparente mbi sipërfaqen e nivelizuar, kështu që mund të shihni prerjen (toka mbi projektin) dhe mbushjen.

## Zgjidhni çfarë shfaqet

Klikoni {{ui:Show}} në shirit dhe shënoni ose hiqni shenjën te:

| Zëri | Çfarë është |
|---|---|
| Existing ground | Sipërfaqja e ndërtuar nga pikat topografike (ose e lexuar nga LandXML) |
| Graded surface | Toka ekzistuese me korridoret dhe platformat e nivelizuara (vetëm kur ka të tilla) |
| Triangle edges | Çdo skaj TIN, si vija |
| Contours | Izoipsat e vogla dhe të mëdha të çdo sipërfaqeje të shfaqur, me intervalin e planit |
| Surface edge | Skaji i jashtëm i çdo sipërfaqeje të shfaqur, në kotat e saj |
| Breaklines | Çdo vijë thyerjeje, në kotat e saj |
| Alignments and stations | Çdo akst mbi profilin e vet të projektit (mbi tokë aty ku nuk ka profil), me shenja çdo 50 ft ose 20 m |
| Corridor feature lines | Skaji i asfaltit, bankina dhe drita e ditës në të dy anët |
| Road surfaces | Rruga që ndërton çdo korridor, nga konfigurimi i saj: korsi, bankina, kanale, bordura, shirita dhe trotuare, secila në ngjyrën e vet, mbi sipërfaqen e nivelizuar |
| Plants | Çdo bimë, dhe bimët në shtretër dhe gardhe, si forma të thjeshta të përmasuara sipas listës së bimëve: një pemë është një trung dhe një kurorë e rrumbullakët (një kon për një konifer, një tufë mbi një trung të lartë për një palmë), shkurret, bimët e gardhit, lulet shumëvjeçare dhe mbulesat e tokës janë kupola, barërat janë tufa, ngjitëset janë kolona të holla. Ato qëndrojnë mbi sipërfaqen e nivelizuar (ose tokën ekzistuese) në madhësinë që tregon plani: të pjekura, ose në mbjellje |
| Hardscape | Shtrimet dhe shtigjet me rënien e tyre, muret, bordurat, shkallët dhe rampat që ngjiten në vargje me pllaka të sheshta ndërmjet tyre |
| Pads and daylight | Konturi i çdo platforme në kotën e saj dhe vija e dritës së ditës |
| Pipes and structures | Tubat si tuba të rrumbullakët ndërmjet fundeve të tyre, strukturat nga buza deri te gropa |
| Survey points | Një pikë te çdo pikë me kotë (fiknjuar në fillim) |
| GIS layers | Shtresat GIS të shfaqura në plan, në ngjyrat e tyre: vija dhe konture me kotat e veta në ato kota, të tjerat të vendosura mbi tokën ekzistuese (ndjekin saktë); pikat si kryqe të vegjël. Format pa kota jashtë sipërfaqes lihen jashtë, dhe pamja thotë sa janë |
| Labels | Emra dhe vlera që gjithmonë ju përballen: emri i çdo aksi në fillimin e tij dhe stacionet e tij çdo 100 ft (ose 100 m), kota e çdo izoipse të madhe, platformat, vijat e veçorive dhe strukturat sipas emrit, dhe me **Survey points** të shënuar, numri dhe kota e çdo pike |

Etiketat mbeten të njëjtës madhësi dhe të drejta sado që t'i rrotulloni ose zmadhoni, dhe një kodër përpara një etikete e fsheh atë. Aty ku do të mbusheshin, shfaqen më të rëndësishmet dhe pjesa tjetër pret derisa të zmadhoni: aksët e parët, pastaj strukturat, platformat, vijat e veçorive, stacionet, konturat dhe pikat, më të afërtat e para. Ato janë vetëm në ekran; eksportet dhe printimet i lënë jashtë.

Zgjedhjet tuaja, ekzagjerimi dhe ngjyrosja mbahen mend në këtë shfletues.

Një rrugë ndërtohet mbi tokën ekzistuese. Me një akst dhe korridor, por pa pika topografike ose sipërfaqe ende, rruga vizatohet mbi tokë të sheshtë zëvendësuese për tani: në kotën mesatare të profilit të projektit të saj, ose e nivelizuar në kotën 0 kur nuk ka as profil. Një paralajmërim në fund të pamjes 3D dhe te vetitë e korridorit e thotë këtë. Është vetëm një imazh: asnjë vëllim ose prerje nuk del prej tij. Hapni pikat topografike ose një sipërfaqe dhe rruga zhvendoset vetë mbi tokën reale.

Ekzagjerimi vertikal zgjat tokën, jo bimët: ato qëndrojnë mbi tokën e zgjeruar në lartësinë e tyre reale dhe shtrirjen e tyre, kështu që një pemë duket si pemë në çdo cilësim. Bimët janë forma të thjeshta, jo modele të detajuara: mijëra prej tyre mbeten të shpejta për t'u rrotulluar dhe zmadhuar.

## Tubat dhe strukturat

- Një tub vizatohet me fundin e tij brenda në fundet që vendosni dhe majën e tij brenda (kurorën) një diametër të brendshëm më lart. Diametrat janë në inç në një projekt në këmbë dhe në milimetra në një projekt metrik, si në panelin e djathtë.
- Një strukturë shkon nga buza e saj (e shkruar, ose nga sipërfaqja) poshtë te gropa e saj (fundi më i ulët i tubit minus thellësinë e gropës). Pa asnjë fund, vizatohet 5 ft (1.5 m) e thellë.
- Tubat dhe strukturat me problem (shih kontrollin e rrjetit në panelin e djathtë) vizatohen në të kuqe.
- Një tub pa fundet e tij nuk vizatohet; një shënim në fund të pamjes thotë sa janë.

## Përzgjidhni nga pamja 3D

Klikoni një akst (ose rrugën e tij), një platformë, një vijë veçorie, një tub, një strukturë, një pikë topografike, një bimë, një rampë ose një shtrim tjetër të fortë. Ai përzgjidhet pikërisht sikur ta klikonit në plan: vetitë e tij hapen në panelin e djathtë, ku mund t'i redaktoni, dhe vizatohet në ngjyrën e përzgjedhjes mbi gjithçka tjetër në 3D. Çfarëdo që përzgjidhni në plan theksohet edhe në 3D. Një ndihmë pranë treguesit emëron atë që klikuat me lindjen, veriun dhe kotën e tij. Tubat dhe strukturat mund të klikohen edhe aty ku janë nën tokë; një vijë e fshehur pas një kodre nuk mund të klikohet përmes saj.

Klikoni një vijë thyerjeje për të parë cila është: theksohet, dhe shiriti i gjendjes e emëron (vijat e thyerjes nuk kanë veti të tyre).

Klikoni tokën për të lexuar lindjen, veriun dhe kotën atje në ndihmë.

## Lëvizni përgjatë një aksi

Klikoni **Drive** në shiritin 3D dhe zgjidhni një akst. Pamja zhvendoset në vendin e shoferit: 3.5 ft (1.07 m) mbi rrugë, mbi profilin e saj të projektit (mbi tokën ekzistuese përgjatë boshtit kur ende nuk ka profil), duke parë përpara përgjatë saj.

- **Play** ose {{key:Space}} lëviz me shpejtësinë që zgjidhni (10 deri në 65 mph, ose 15 deri në 100 km/h); {{key:Space}} përsëri e ndalon. Ndalet në fund; **Play** atëherë fillon përsëri nga fillimi.
- Rrëshqitësi kërcen në çdo stacion; {{key:Left}} dhe {{key:Right}} hapin 10 ft (5 m) prapa dhe përpara.
- Tërheqja në pamje ndalon dhe ju lejon të shikoni përreth.
- **Stop** ose {{key:Esc}} e kthen pamjen aty ku ishte.

Ekzagjerimi vertikal vlen edhe gjatë lëvizjes: vendoseni në 1× për ta parë rrugën ashtu si do të jetë.

## Drita nga dielli

Hapni **Sun** në shiritin 3D dhe shenjoni **Light from the sun**. Jepni një datë, një orë dhe zonën e saj kohore (ndryshimin nga UTC: në verë, ai i kohës së verës), dhe gjerësinë dhe gjatësinë gjeografike të vendit. Kur projekti ka një sistem koordinatash, ato plotësohen nga ai.

Vendi ndriçohet atëherë nga ana ku është dielli, me **Shadows** (hijet) mbi tokë, korridorin dhe platformat; menuja thotë azimutin e diellit dhe sa lart është, ose që është nën horizont. Pozicionet vijnë nga ekuacionet diellore të NOAA. Hijet bien në drejtimin e duhur në çdo ekzagjerim, por ndalen te skaji i vendit: kodrat dhe ndërtesat përtej tij nuk hedhin asnjë.

## Eksportoni pamjen 3D

Klikoni {{ui:GLB}} ose {{ui:OBJ}} në shirit. Ajo që shfaq pamja ruhet, në përmasa reale (pa ekzagjerim), në metra, me Y lart. Detajet: [Eksportoni vendin në 3D](topic:export-3d).
