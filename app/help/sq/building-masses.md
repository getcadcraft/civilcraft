---
title: Vizato masa ndërtesash në një vend
summary: Vizato një masë ndërtese mbi një parcelë, jep katet dhe lartësinë e katit, shiko sipërfaqen e saj bruto të kateve, zgjidh si ulet mbi terren me pjerrësi, shtyje dhe tërhiq lartësinë e saj në 3D, dhe dërgoje te BimCraft ose ruaje si skedar IFC.
keywords: masë, modelim masash, masë ndërtese, vëllim, gjurmë, katet, lartësia e katit, sipërfaqja bruto e kateve, GFA, pjerrësi, podium, prerje dhe mbushje, shtyj tërhiq, 3D, studim vendi, projektim fillestar, IFC, zhvillo, BimCraft, A-MASS
from: e5a67c16
---

Një masë ndërtese është një gjurmë, një numër katesh dhe një lartësi kati: pyetja e hershme "sa ndërtesë përshtatet këtu, dhe çfarë i bën terrenit". Masat qëndrojnë në plan me emrin, numrin e kateve dhe sipërfaqen bruto të kateve, hyjnë në shtypjen PDF dhe eksportet DWG dhe DXF në shtresat `A-MASS` dhe `A-MASS-TEXT`, dhe ruhen në skedarin e projektit.

## Vizato një masë

1. Te **Vetitë**, nën **Masat e ndërtesave**, kliko **Vizato një masë**. (Është edhe në menynë **Më shumë** të shiritit të veglave, pranë **Sipërfaqja**.)
2. Kliko qoshet e gjurmës. Një klikim pranë një qoshe parcele ose një pike matjeje e merr vendin e saktë të asaj pike.
3. Kliko qoshen e parë përsëri, ose shtyp {{key:Enter}}, për të përfunduar. {{key:Backspace}} heq qoshen e fundit; {{key:Esc}} ndalon.

Një masë e re ka tri kate dhe një lartësi kati prej 12 ft (3.6 m), dhe i përket parcelës ku bie mesi i saj.

## Katet, lartësia dhe sipërfaqja

Kliko një masë për të ndryshuar **Emrin**, **Përdorimin**, **Katet**, **Lartësinë e katit** dhe **Parcelën**. **Lartësia** është katet shumëzuar me lartësinë e katit: shkruaj një lartësi dhe numri i kateve bëhet numri i plotë më i afërt (kurrë më pak se një). **Gjurma** dhe **Sipërfaqja bruto e kateve** (gjurma shumëzuar me katet) llogariten për ty.

## Në terren me pjerrësi

Terreni nën një masë lexohet nga sipërfaqja: terreni ekzistues, ose terreni i niveluar aty ku zgjodhe **Terreni i propozuar (i niveluar)**. **Në terren me pjerrësi** thotë ku shkon kati përdhe:

- **Me shkallë**: te terreni mesatar nën gjurmë. Ana e ulët mbushet deri atje dhe ana e lartë priet, dhe të dyja afrohen për t'u balancuar.
- **Podium**: te terreni më i lartë. Një bazë e ngurtë mbush anën e ulët.
- **Prerje**: te terreni më i ulët. Ana e lartë priet larg, brenda kodrës.

Vetitë tregojnë intervalin e terrenit nën masë, **Niveli i katit përdhe**, dhe vëllimin e mbushjes dhe prerjes midis terrenit dhe atij niveli. Një pikë e gjurmës jashtë sipërfaqes lihet jashtë, dhe Vetitë thonë sa janë.

## Në pamjen 3D

Masat vizatohen në pamjen 3D të vendit, me një vijë rreth çdo kati dhe emrat e tyre mbi çati. **Shfaq** ka një kuadrat zgjedhjeje për **Masat e ndërtesave**. Kliko një masë për ta zgjedhur. Me një masë të zgjedhur:

- tërhiq çatinë e saj lart ose poshtë për ta shtyrë ose tërhequr një kat njëherësh, ose shtyp {{key:PageUp}} dhe {{key:PageDown}};
- e gjithë zhvendosja është një hap i vetëm zhbërjeje.

Pamja e rrugës e **Drive** sheh edhe masat, dhe **Sun** hedh hijet e tyre mbi terren.

## Dërgoje më tej

- **Masat si IFC** ruan çdo masë si skedar IFC4: një vend, një ndërtesë me katet e saj, dhe masa si element ndërtese me numrat e saj te grupi i vetive `CadCraft_SiteMass`. Kur ka një sistem koordinatash të vendosur në projekt, skedari vendoset në hartë dhe mban gjerësinë dhe gjatësinë gjeografike të vendit; pa të, nuk thotë asgjë për vendndodhjen.
- **Zhvillo në BimCraft** hap BimCraft në një skedë të re me masat. Aty, zgjedhja e një mase shfaq numrat e saj dhe **Zhvillo këtë masë**, që ndërton mure në çdo nivel dhe një dysheme nën ndërtesë nga gjurma, në një hap të vetëm zhbërjeje. Asgjë nuk ngarkohet: skedari kalon mes dy skedave të këtij shfletuesi.

Shih edhe **Kufizimet e zonimit** dhe **Orët e diellit**.
