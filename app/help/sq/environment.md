---
title: Hija, prodhimi diellor dhe rehatia e jashtme
summary: Studioni hijen që hedhin masat e ndërtesave gjatë një dite ose një stine, shihni një animacion të saj, llogaritni sa energji elektrike do të prodhonin panelet diellore në çatitë dhe muret në një vit tipik, shihni sa e rehatshme është rruga pranë një ndërtese (UTCI), dhe merrni një lexim orientues të rehatisë ndaj erës për këmbësorët.
keywords: studim hijeje, hije, orë dielli, animacion, diellor, PV, fotovoltaik, panele, prodhim, kWh, EPW, skedar moti, UTCI, rehati termike, rehati e jashtme, stres nga nxehtësia, erë
from: 96e7af4d
---

Seksioni **Mjedisi** ndodhet nën **Orët e diellit** te **Vetitë** të një mase. Ai përdor masat që keni vizatuar si ndërtesa.

## Ngarkoni një skedar moti

Zgjidhni një skedar moti (**.epw**) të një viti tipik për qytetin tuaj. Ato janë falas nga faqja e motit të EnergyPlus dhe nga climate.onebuilding.org. Skedari mbetet në shfletuesin tuaj për këtë vizitë. Prodhimi diellor dhe studimi i rehatisë kanë nevojë për të; studimi i hijes funksionon pa të kur projekti ka një sistem koordinatash.

## Studimi i hijes

Zgjidhni një datë (ose shënoni **Stinën** dhe një datë të fundit dhe një hap në ditë) dhe një zonë kohore, pastaj **Ekzekuto studimin e hijes**. Merrni një hartë të orëve të diellit, ose të hijes, në tokën rreth masave; një tabelë se sa pjesë e tokës është e hijezuar gjatë ditës; dhe një animacion të ditës që mund ta luani ose ta kaloni hap pas hapi. **Ruaj hartën**, **Ruaj kuadrot e animacionit** (të gjitha kuadrot në një figurë) dhe **Ruaj orët** (CSV) i mbajnë rezultatet.

Toka merret e sheshtë, në nivelin e masës më të ulët. Për hijen në tokë me pjerrësi përdorni **Orët e diellit**, që lexon terrenin.

## Prodhimi diellor

Vendosni efikasitetin e panelit, sa pjesë e çdo çatie dhe muri mbulohet dhe humbjet e sistemit, pastaj **Ekzekuto prodhimin diellor**. Për çdo çati dhe mur merrni energjinë elektrike që do të prodhonte një metër katror paneli në një vit tipik, sa e marrin nga masat fqinje, dhe një total për çdo masë. Modeli shkruhet me fjalë të thjeshta pranë butonit: është një vlerësim planifikimi nga një vit tipik, jo një garanci.

## Rehatia e jashtme

**Ekzekuto rehatinë** llogarit Indeksin Universal Termik Klimatik (UTCI) për një person që qëndron në tokë të hapur dhe pranë masës së parë (anët jugore, veriore, lindore dhe perëndimore), me hijen e çdo mase. Tregon sa qiell shihet, UTCI-në mesatare të ditës dhe orët mbi 32 (stres nga nxehtësia) dhe nën 0 (stres nga ftohtësia).

## Era (orientuese)

**Ekzekuto studimin e erës** llogarit një herë rrjedhën e ajrit rreth masave tuaja për çdo drejtim ere që fryn në skedarin tuaj të motit (4, 8, 12 ose 16 drejtime), mbi rrethinën që zgjidhni (vend i hapur, periferi ose qendër qyteti), dhe pastaj mbledh erën orare të gjithë vitit. Harta i ngjyros tokën sipas klasës së rehatisë, nga jeshile (**ulur**) përmes **qëndruar**, **ecje e qetë** dhe **ecje** deri te e kuqja (**e pakëndshme**): aktiviteti kufiri i shpejtësisë të të cilit (4, 6, 8 dhe 10 m/s) tejkalohet për jo më shumë se 5 % të orëve. Një tabelë e dytë jep notën NEN 8100 (A deri E) sipas pjesës së orëve kur era kalon 5 m/s. Faktori i rafalës shumëzon mesataren orare për të dhënë një rafalë efektive.

Si funksionon, me fjalë të thjeshta: një zgjidhës rrjedhe lattice-Boltzmann me simulim të vorbullave të mëdha (LES, i yni, në bibliotekën `lib/wind`) në një kuti rreth ndërtesave, një profil shpejtësie ere që rritet me lartësinë mbi ashpërsinë e zgjedhur, dhe shpejtësia rreth 1.5 m mbi tokë krahasuar me shpejtësinë përpara në 10 m. **Orientuese** është e shpejtë dhe e trashë; **Standarde** përdor më shumë qeliza dhe zgjat shumë më tepër. Nëse paneli thotë se rrjeti është i trashë (nën 10 qeliza mbi ndërtesën më të lartë), ose rrjedha ende po ndryshonte, besojeni hartën më pak.

**Ç'nuk është kjo.** Zgjidhësi është kontrolluar me rrjedha shkollore (një kanal, një kavitet me kapak të lëvizshëm) dhe është ekzekutuar mbi një kub për të parë nëse shtegu i pas-rrjedhjes dhe përshpejtimi te qoshet duken të saktë. **Nuk** është vlerësuar kundrejt matjeve në tunel ere mbi ndërtesa, kështu që çdo rezultat është shënuar si i pavlerësuar. Mos e përdorni për një vlerë projektimi, një ngarkesë ere ose një certifikatë planifikimi: një inxhinier i erës duhet ta ekzekutojë dhe konfirmojë një studim të duhur. Toka e sheshtë, muret e lëmuara të ndërtesave, shkurtesa e ashpërsisë së stacionit meteorologjik dhe tabela e pragjeve janë thjeshtime; pragjet mund të ndryshojnë në kriteret e autoritetit tuaj.

## Era me OpenFOAM (shtojcë)

Motori i erës i integruar më sipër është eksperimental. Për një zgjidhës të duhur rrjedhe, aktivizoni shtojcën **Era e këmbësorëve (OpenFOAM)** te **Cilësimet > Shtojcat** (është e fikur derisa ta bëni këtë). Është softuer me licencë GPL i vetin, i ndarë nga pjesa tjetër e CadCraft, dhe nuk e përfshin OpenFOAM: atë e instaloni vetë. Pastaj **Motori** në bllokun e erës e liston OpenFOAM.

Ajo që konfiguroni, një herë:
1. **Instaloni OpenFOAM** (seria ESI v nga openfoam.com; shtojca është testuar me v2512). Në Ubuntu ose Debian (edhe brenda WSL në Windows): `curl https://dl.openfoam.com/add-debian-repo.sh | sudo bash`, pastaj `sudo apt install openfoam2512-default`. Instalohet nën `/usr/lib/openfoam/openfoam2512`. CadCraft ka nevojë për `blockMesh`, `snappyHexMesh` dhe `simpleFoam` për t'u ekzekutuar. (Paketa më e vjetër `openfoam` 1912 nga arkivi i vetë Ubuntu-s funksionon gjithashtu, por objektet e saj të funksioneve rrëzohen; atëherë shtojca i lexon vetë skedarët e rezultatit.)
2. **Nisni ndihmësin** nga dosja `runner` e shtojcës me Node.js: `node cc-openfoam-runner.mjs serve`. Nëse OpenFOAM nuk është në shtegun e kërkimit, jepini një `runner.json` të vogël me shtegun te `etc/bashrc` të OpenFOAM (`{ "bashrc": "/usr/lib/openfoam/openfoam2512/etc/bashrc" }`) dhe nisni me `--config runner.json`. Ndihmësi dëgjon vetëm në këtë kompjuter dhe shfaq një token.
3. **Ngjitni tokenin** te fushat e shtojcës në bllokun e erës (adresa mbetet `http://127.0.0.1:8765`) dhe shtypni **Kontrollo ndihmësin**.

Pastaj **Ekzekuto studimin e erës** punon një rast për çdo drejtim ere në skedarin e motit: masat tuaja bëhen një sipërfaqe (STL) në një kuti të madhësuar sipas udhëzimit të zakonshëm (5 lartësi ndërtese rreth dhe mbi, 10 prapa), rrjetëzohet me blockMesh dhe snappyHexMesh, ekzekutohet si RANS k-epsilon në gjendje të qëndrueshme me një hyrje shtresë kufi atmosferike mbi ashpërsinë që zgjidhni, dhe shpejtësia në 1.5 m lexohet dhe kthehet në të njëjtat klasa Lawson dhe NEN 8100. Asgjë nuk del nga kompjuteri juaj.

**Ç'është kontrolluar.** Teksti mbi rezultatet e thotë qartë dhe është pjesë e çdo CSV të ruajtur. Shkrimi i rasteve të shtojcës, leximi i rezultateve dhe i gjithë procesi janë testuar pa OpenFOAM, dhe një kub i vetëm është ekzekutuar përmes OpenFOAM-it real me tre madhësi rrjeti (numrat janë në shënimet e projektit). **Nuk** është vlerësuar kundrejt matjeve në tunel ere mbi ndërtesa. Është një lexim orientues, jo një vlerë projektimi dhe jo një certifikatë. k-epsilon standard mbivlerëson turbulencën përpara ndërtesave, toka është e sheshtë, muret janë të lëmuara dhe nuk ka terren apo bimësi.
