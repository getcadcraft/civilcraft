---
title: Venire de la alt software civil
summary: Cum se mapează fluxurile de lucru obișnuite de proiectare civilă în CivilCraft și diferențele care îi încurcă pe utilizatorii experimentați în prima oră.
keywords: trecere, migrare, familiar, diferențe, flux de lucru, comenzi, mapare, cogo, coridor, amenajare, rețea de conducte, stiluri, linie de comandă
from: feae37d6
---

Dacă ați folosit Civil 3D, cunoașteți deja ideile din CivilCraft: puncte și grupuri de puncte, suprafețe TIN cu linii de rupere și limite, axe după PI, profiluri după PVI, ansambluri măturate în coridoare, amenajare până la linia de racordare cu terenul, rețele de conducte gravitaționale, LandXML. Ce este diferit este aproape tot ce este în jurul lor: nu există fișier de desen, nicio linie de comandă (decât dacă alegeți stilul de meniu {{ui:Desenare clasică}}), niciun stil, niciun Prospector și nicio casetă de setări. CivilCraft este un instrument mic și concentrat, într-un browser, iar în această versiune face o fracțiune din ce face un pachet civil complet. Această pagină mapează ce cunoașteți la ce există aici.

:::tip
Dacă vă place panglica din Civil 3D, alegeți stilul de meniu {{ui:Panglică civilă}} din {{ui:Setări}} › {{ui:CivilCraft}} › {{ui:Meniuri, taste și mouse}}: filele Acasă, Suprafețe, Modificare, Geolocalizare, Vizualizare și Ieșire, butonul din mijloc deplasează vederea, iar {{key:Shift}} cu butonul din mijloc orbitează vederea 3D. Dacă tastați comenzi, {{ui:Desenare clasică}} adaugă o linie de comandă (ALIGNMENT, PAD, PROFILE, ZOOM …). Vezi [Meniuri, taste și mouse](topic:menus-keys-and-mouse).
:::

## Harta fluxului de lucru

| Ce doriți să faceți | Mod obișnuit | În CivilCraft |
|---|---|---|
| Aduceți punctele de releveu | Importați puncte cu un format de fișier de puncte | {{ui:Deschidere}}, apoi verificați ordinea coloanelor în **Import puncte** ([Importul punctelor de releveu](topic:import-points)) |
| Sortați punctele | Grupuri de puncte, chei de descriere | Grupuri automate după primul cuvânt al descrierii; fără chei de descriere |
| Editați un punct | Editor de puncte, mânere | Faceți clic pe el și scrieți în Proprietăți, sau trageți-l ([Editarea unui punct de releveu](topic:edit-points)) |
| Construiți terenul natural | Creați o suprafață, adăugați grupuri de puncte ca date | Automat: suprafața se reconstruiește ori de câte ori se schimbă intrările ei |
| Adăugați linii de rupere | Adăugați linii de rupere din polilinii sau linii caracteristice | Setați un grup de puncte la {{ui:Linie de rupere}}, sau faceți clic pe puncte cu instrumentul {{ui:Linie de rupere}} ({{key:B}}) |
| Tăiați suprafața | Limită exterioară, limită ascunsă, lungime maximă a triunghiului | {{ui:Limită}} ({{key:O}}, doar exterioară) și **Cea mai lungă muchie exterioară** |
| Arătați curbele de nivel | Stilul suprafeței | **Afișare** în panoul din stânga: interval, major la fiecare, etichete, benzi, săgeți de pantă |
| Trasați un ax | Instrumente de creare a axului, setări de curbă și spirală | {{ui:Axul traseului}} ({{key:A}}): faceți clic pe PI-uri, {{key:Enter}}; razele și lungimile spiralelor în tabelul PI |
| Creați o vizualizare de profil | Asistentul vizualizării de profil, benzi | {{ui:Profil longitudinal}} ({{key:R}}): o vizualizare de profil sub plan, mereu încadrată |
| Proiectați panta | Instrumente de proiectare a profilului | {{ui:Pornire din teren}}, {{ui:Adăugare PVI}} ({{key:I}}), trageți PVI-urile, scrieți **Curbă L** |
| Construiți un drum | Ansamblu, subansambluri, coridor, ținte, regiuni | Bifați **Măturare ansamblu de-a lungul profilului de proiectare** sub axă; o bandă, berma și o pantă laterală pe fiecare parte, sau fiecare parte construită din elemente (rigolă, bordură, trotuar …) |
| Amenajați o platformă | Linii de amenajare, grupuri de amenajare, criterii de amenajare | {{ui:Platformă}} ({{key:G}}): o platformă plană cu pante de debleu și rambleu până la racordare cu terenul |
| Calculați terasamentele | Suprafețe de volum, tablou de volume | **Terasamente** în panoul din dreapta, metoda rețelei, se actualizează imediat |
| Trasați canalizarea pluvială sau menajeră | Rețea de conducte cu listă de elemente, reguli | {{ui:Conducte}} ({{key:P}}): faceți clic pe construcțiile din aval; trei reguli pe care le setați; cote de radier automate |
| Schimbați date cu alții | Import și export LandXML | {{ui:Deschidere}} un fișier LandXML; {{ui:LandXML}} pentru export ([Schimbul LandXML](topic:landxml)) |
| Trimiteți liniile către CAD | Export în DWG | {{ui:DWG}} (format 2000 până la 2018) sau {{ui:DXF}} (R12) |
| Trasați pe hârtie | Aranjări în pagină (layout), ferestre de vizualizare, seturi de planșe | {{ui:PDF}}: o foaie orizontală cu planul la o scară aleasă; foi de plan și profil și foi de secțiune ca PDF |
| Partajați lucrul între fișiere | Scurtături de date, referințe | Indisponibil: un proiect per fișier |
| Anulare | Anulare | {{key:Mod+Z}} și {{key:Mod+Y}}, 200 de pași; setările de afișare nu sunt pași de anulare |

## Diferențe care îi încurcă pe oameni

**Nu există linie de comandă** decât dacă alegeți stilul de meniu {{ui:Desenare clasică}}. Instrumentele sunt butoane din bara de instrumente și litere simple: {{key:A}} ax, {{key:G}} platformă, {{key:P}} conducte, {{key:B}} linie de rupere, {{key:O}} limită, {{key:R}} profil, {{key:I}} adăugare PVI, {{key:V}} selectare, {{key:F}} potrivire. În celelalte stiluri de meniu, tastarea unui nume de comandă nu face nimic. Vezi [Taste și mouse](topic:keyboard).

**Enter încheie; dublu clicul este riscant.** Faceți clic o dată pe ultimul punct, apoi apăsați {{key:Enter}}. În această versiune și dublu clicul încheie, dar elimină punctul pe care l-ați făcut dublu clic. Clicul dreapta nu încheie și nu repetă; doar deplasează vederea când trageți cu el.

**Totul este dinamic, mereu.** Schimbați un grup de puncte, o rază, un PVI sau o pantă a platformei, iar suprafața, curbele de nivel, coridorul, liniile de racordare cu terenul și volumele se actualizează imediat. Nu există nimic de reconstruit și nimic nu devine învechit.

**Nimic nu este un obiect de desen.** Planul este o vedere a proiectului, nu un desen pe care îl editați cu comenzi CAD. Nu puteți adăuga propriile linii sau text, schimba culoarea unui strat sau descompune ceva. Exportați în DXF și terminați desenul într-un program CAD.

**Fără stiluri.** Culorile, grosimile de linie, dimensiunile etichetelor și numele straturilor sunt fixe (vezi [Straturile planului](topic:plan-layers)). Hârtie și Model din bara aplicației comută între un ecran luminos și unul întunecat.

**Câte unul din fiecare.** O suprafață de teren natural, o suprafață amenajată rezultată, o rețea de conducte per proiect. Multe axe și platforme sunt în regulă.

**Unitățile sunt etichete.** Alegerea {{ui:Picioare SUA}} sau {{ui:Metri}} nu convertește nimic. Nu există scară de desen. Un sistem de coordonate este opțional: setați-l sub {{ui:Coordonate}} și nimic nu se mișcă; doar spune ce înseamnă numerele (vezi [Setarea sistemului de coordonate al proiectului](topic:coordinate-systems)). Picioarele sunt tratate ca picioare SUA de releveu când sunt scrise în LandXML.

**Grupurile de linii de rupere se unesc în ordinea numerelor de punct.** Un grup setat la {{ui:Linie de rupere}} devine o singură linie prin toate punctele sale, în ordinea numerelor. Codurile comune (două linii de curgere cu codul „FL”) fac o singură linie în zigzag; desenați-le manual.

**Stațiile arată la fel, metrii diferă.** Picioarele folosesc stații de 100 ft (12+34.56); metrii folosesc stații de 1000 m (1+234.567).

**Ștergerea pe Mac.** Tasta etichetată delete pe Mac este {{key:Backspace}} pentru browser. Folosiți Fn și delete, sau butonul {{ui:Ștergere}}, ca să ștergeți o selecție.

**Fișierele sunt descărcări.** {{ui:Salvare}} descarcă un fișier `.civilcraft.json` de fiecare dată; nu există „salvare peste fișierul deschis”. O copie de recuperare a lucrului nesalvat este păstrată în acest browser ([Recuperarea lucrului nesalvat](common:recover)). Deschiderea unui fișier de puncte înlocuiește punctele fără să întrebe. Vezi [Fișierele pe care le puteți deschide, salva și exporta](topic:files).

**Regulile le stabilește proiectantul.** Regulile rețelei de conducte și ansamblul coridorului pornesc cu valori provizorii, care nu sunt un standard. Setați valori proprii înainte de a avea încredere în orice verificare.

**Volumele se bazează pe o grilă.** Debleul și rambleul vin dintr-o grilă fină între cele două suprafețe, în interiorul liniilor de racordare cu terenul, fără umflare sau contracție. Sunt apropiate de, dar nu identice cu, un volum TIN-la-TIN.

## Ce lipsește

Spirale altele decât clotoida, ansambluri care se schimbă de-a lungul drumului, platforme înclinate, capacitatea gurilor de scurgere și retenția, cataloage de piese, conducte în profil, aranjarea parcelelor și dimensionarea loturilor, compensarea prin metoda celor mai mici pătrate și bazele de date de releveu, deschiderea fișierelor DWG și multe altele. Lista completă, cu ce să faceți în loc astăzi, este în [Încă nerealizat](topic:not-built-yet).
