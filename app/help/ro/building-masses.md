---
title: Desenarea maselor de construcție pe amplasament
summary: Desenați o masă de construcție pe o parcelă, dați-i etaje și înălțime de etaj, vedeți suprafața sa brută de planșeu, alegeți cum stă pe teren în pantă, împingeți și trageți înălțimea în 3D și trimiteți-o către BimCraft sau salvați-o ca fișier IFC.
keywords: masă, masă de construcție, volum, amprentă, etaje, înălțime etaj, suprafață brută de planșeu, GFA, pantă, soclu, debleu și rambleu, împingere și tragere, 3D, studiu de amplasament, proiectare timpurie, IFC, dezvoltare, BimCraft, A-MASS
from: e5a67c16
---

O masă de construcție este o amprentă, un număr de etaje și o înălțime de etaj: întrebarea de început „cât clădire încape aici și ce face asta cu terenul”. Masele apar pe plan cu numele, numărul de etaje și suprafața brută de planșeu, intră în tipărirea PDF și în exporturile DWG și DXF pe straturile `A-MASS` și `A-MASS-TEXT` și sunt salvate în fișierul proiectului.

## Desenarea unei mase

1. În **Proprietăți**, sub **Mase de construcție**, faceți clic pe **Desenare masă**. (Este și în meniul **Mai multe** din bara de instrumente, lângă **Suprafață**.)
2. Faceți clic pe colțurile amprentei. Un clic lângă un colț al parcelei sau lângă un punct de releveu ia locul exact al acelui punct.
3. Faceți clic din nou pe primul colț, sau apăsați {{key:Enter}}, pentru a termina. {{key:Backspace}} ia înapoi ultimul colț; {{key:Esc}} oprește.

O masă nouă are trei etaje și o înălțime de etaj de 12 ft (3.6 m) și aparține parcelei în care cade mijlocul ei.

## Etaje, înălțime și suprafață

Faceți clic pe o masă pentru a-i schimba **Nume**, **Utilizare**, **Etaje**, **Înălțime etaj** și **Parcelă**. **Înălțimea** este numărul de etaje ori înălțimea de etaj: scrieți o înălțime, iar numărul de etaje devine cel mai apropiat număr întreg (niciodată mai puțin de unu). **Amprenta** și **Suprafața brută de planșeu** (amprenta ori etajele) sunt calculate automat.

## Pe teren în pantă

Terenul de sub o masă este citit din suprafață: terenul natural sau terenul amenajat, unde ați ales **Teren amenajat (proiectat)**. **Pe teren în pantă** spune unde ajunge parterul:

- **Treptat**: la terenul mediu de sub amprentă. Latura joasă este umplută până la el, iar cea înaltă este tăiată, iar cele două ajung aproape să se compenseze.
- **Soclu**: la cel mai înalt teren. O bază plină umple latura joasă.
- **Debleu**: la cel mai jos teren. Latura înaltă este tăiată în deal.

Proprietățile arată intervalul de teren sub masă, **Cota parterului** și volumul de rambleu și debleu dintre teren și acel nivel. O porțiune a amprentei care este în afara suprafeței este lăsată deoparte, iar Proprietățile spun câte.

## În vederea 3D

Masele se desenează în vederea 3D a amplasamentului, cu o linie în jurul fiecărui etaj și cu numele lor deasupra acoperișului. **Afișare** are o casetă de bifat pentru **Mase de construcție**. Faceți clic pe una pentru a o selecta. Cu o masă selectată:

- trageți acoperișul ei în sus sau în jos pentru a o împinge sau trage câte un etaj o dată, sau apăsați {{key:PageUp}} și {{key:PageDown}};
- întreaga mutare este un singur pas de anulare.

Vederea stradală a **Conducere** vede și ea mase, iar **Soare** le aruncă umbrele pe teren.

## Trimiterea mai departe

- **Mase ca IFC** salvează fiecare masă ca fișier IFC4: un amplasament, o clădire cu nivelurile sale și masa ca element de clădire, cu cifrele sale în setul de proprietăți `CadCraft_SiteMass`. Cu un sistem de coordonate setat pe proiect, fișierul este plasat pe hartă și poartă latitudinea și longitudinea amplasamentului; fără el, nu spune nimic despre unde se află.
- **Dezvoltare în BimCraft** deschide BimCraft într-o filă nouă, cu mase. Acolo, alegerea unei mase arată cifrele sale și **Dezvoltă această masă**, care construiește pereți pe fiecare nivel și o planșeu sub clădire din amprentă, într-un singur pas de anulare. Nimic nu se încarcă: fișierul trece între cele două file ale acestui browser.

Vezi și **Limite de zonare** și **Ore de soare**.
