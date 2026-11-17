---
title: Proiectarea unei grădini, de la început la sfârșit
summary: Cei zece pași ai arhitectului peisagist, de la ridicarea topografică până la setul publicat, cu ce face azi spațiul de lucru Amenajări peisagistice la fiecare pas și ce nu face încă.
keywords: tutorial, ghid pas cu pas, cum se face, proiectare peisagistică, proiectarea grădinii, primii pași, exemplu, probă, pas cu pas, ridicare topografică, linii, teren, plantare, tabel, planșe, publicare, un singur proiect
from: 87900bf5
---

Un proiect peisagistic merge în cerc: ridicare topografică, schiță, linii, teren, suprafețe, niveluri, plantare, tabele, planșe și înapoi din nou. Iată cei zece pași, cu ce există pentru fiecare. Acolo unde un pas are un gol, acesta este numit la **Încă nerealizat** de la final și nu este ascuns în pas.

Puteți urma pașii pe amplasamentul exemplu sau pe propria ridicare topografică. Dacă folosiți propria ridicare, începeți de la pasul 1.

## 1. Aduceți ridicarea topografică

{{ui:Model de teren}} › {{ui:Linii dintr-un desen…}}, alegeți desenul ridicării (DWG 2000–2018 sau DXF). Verificați unitățile, luați curbele de nivel, polilinii 3D și limita pentru modelul de teren, iar blocurile de puncte ca puncte de ridicare. Secțiunea **Niveluri ale ridicării și verificare** citește cotele scrise ca text sau ca atribut și listează ce pare greșit (unități, sistem de coordonate, distanța față de origine, curbe de nivel plate, cote ciudate, puncte dublate) înainte să adăugați ceva. Vedeți [Verificarea unui desen de ridicare la import](topic:survey-check) și [Deschiderea unui DWG sau DXF ca linii](topic:open-dwg-dxf). Setați sistemul de coordonate cu {{ui:Sistem de coordonate…}}.

## 2. Schițe de mână

O foaie pe hârtie, cum ar fi o ridicare veche sau un print marcat, intră cu {{ui:Scanare…}} (Pornire de la o scanare): este așezată la scară sau pe coordonate cunoscute sub plan și poate fi trasată în linii. ModelCraft citește o fotografie a unei schițe de mână (Fișier › Importare a unei fotografii de schiță…). CivilCraft nu are în sine o unealtă pentru schița de mână: așezați foaia sub plan și desenați peste ea.

## 3. De la schiță la linii

Desenați linii caracteristice și contururi peste ridicare în CivilCraft sau desenați-le în desenul 2D. Amenajări peisagistice › {{ui:Mai multe}} › {{ui:Dintr-o linie}} transformă o linie în pavaj, zonă plantată, zid, trepte, linie caracteristică și altele, legate: mutați linia, iar obiectul o urmează. Vedeți [Obiecte din linii](topic:objects-from-lines). În SuperCad Studio, deschideți amplasamentul, desenul și modelul clădirii într-un singur proiect: spațiul de lucru **Amenajări peisagistice** are uneltele tuturor, iar o linie selectată în desenul 2D poate deveni un obiect peisagistic care o urmează (Ctrl+K, {{ui:Obiect peisagistic din linia selectată din desen}}).

## 4. Terenul amenajat

Deschideți {{ui:Model de teren}} › {{ui:Mai multe}} › {{ui:Spațiu de lucru Amenajări peisagistice}}. Construiți terenul amenajat cu {{ui:Platformă}}, {{ui:Bermă}}, {{ui:Șanț înierbat}} și zone de sistematizare cu cote de punct și curbe de nivel; pavajele, aleile, zidurile, rampele și treptele pe care le adăugați se sistematizează în aceeași suprafață amenajată. Terenul natural nu se modifică niciodată. {{ui:Niveluri}} › {{ui:Modificatori de teren…}} listează tot ce modelează terenul, într-o singură ordine, cu debleu și rambleu pentru fiecare. Vedeți [Sistematizarea verticală](topic:landscape-grading) și [Modificatori de teren și niveluri active](topic:ground-modifiers).

## 5. Pavaje și zone plantate

{{ui:Amenajări dure}} › {{ui:Pavaj}}, {{ui:Alee}}, {{ui:Zid}}, {{ui:Bordură}}, {{ui:Rampă}} și {{ui:Trepte}}. {{ui:Suprafețe}} desenează un gazon, un strat, o pajiște sau un covor vegetal cu alcătuirea lui; se decupează singur în jurul pavajelor, zidurilor și treptelor. {{ui:Strat}} umple o suprafață la distanța dintre plante, dintr-un amestec de plante. Vedeți [Amenajări dure](topic:hardscape), [Zone plantate](topic:planted-areas) și [Plantare](topic:planting).

## 6. Niveluri, pante și îmbinări

Sub **Verificări de sistematizare**, bifați **Analiza pantei** și **Săgeți de scurgere și stagnare**. Dacă apa stagnează lângă o terasă, adăugați un {{ui:Șanț înierbat}} în jurul ei. Proprietățile vă spun câte contratrepte au nevoie treptele și dacă se potrivesc, precum și unde o alee este mai abruptă decât limita ei. Panoul Probleme listează unde obiectele se întâlnesc prost: un zid depășit în înălțime, un strat deasupra pavajului, trepte care nu ating podestul. {{ui:Cotă de punct}} și {{ui:Săgeată de pantă}} etichetează terenul și se actualizează singure.

## 7. Plantare

În **Plante**, căutați în lista de plante (câteva sute de specii sau lista proprie), alegeți una și {{ui:Plantă}}, {{ui:Strat}} sau {{ui:Gard viu}}. Setați dimensiunea și etichetele plantei din {{ui:Mai multe}}. {{ui:Mai multe}} › {{ui:Tabel plante}} editează înregistrările proprii: soiuri, dimensiuni livrate, densitate, note de specificație. Fiecare înregistrare poate avea propriul simbol și propriul model 3D (OBJ, STL sau GLB), iar {{ui:Mai multe}} › {{ui:Grafică pentru plante}} desenează plantele mai simplu la scări mai mari. Vedeți [Lista de plante](topic:plant-list), [Înregistrările plantelor](topic:plant-records) și [Grafica plantelor](topic:plant-graphics).

## 8. Cantități și tabele

{{ui:Mai multe}} › {{ui:Tabele de lucru}}: tabelele de plante și de amenajări dure, precum și cele proprii, rămân legate de obiecte; salvați-le ca CSV sau XLSX ori puneți-le pe planșe (vedeți [Tabele de lucru](topic:worksheets)). {{ui:Mai multe}} › {{ui:Tabel de plante…}} trimite numărătorile către TakeoffCraft. Cantitățile de amenajări dure sunt în Proprietățile pavajului, zidului și treptelor. Irigațiile au propria listă de materiale: {{ui:Irigații}} › **Verificați sistemul…**. Vedeți [Irigații](topic:irrigation).

## 9. Desene și planșe

{{ui:Mai multe}} › {{ui:Planșe peisagistice…}}: planuri de plantare, de sistematizare verticală și de irigații, cu detalii. {{ui:Niveluri}} › {{ui:Linie de secțiune}} desenează secțiuni prin teren, ziduri, alcătuiri, trepte și plante. Vedeți [Planșe peisagistice](topic:landscape-sheets) și [Secțiuni și setul de publicare](topic:landscape-sections).

## 10. Publicare

{{ui:Set de publicare (.zip)}} din caseta de dialog Planșe creează un PDF cu o listă de planșe și un DWG pentru fiecare planșă. {{ui:Mai multe}} › {{ui:Export IFC peisagistic}} îi dă BimCraft plantele și amenajările dure. Salvați proiectul: totul se află în același fișier.

## Schimbați un lucru: scara

Ideea păstrării totului într-un singur proiect este că o modificare se propagă. Încercați cu o scară între două terase:

1. Desenați linia scării ca linie caracteristică (sau ca linie în desen), apoi Amenajări peisagistice › {{ui:Mai multe}} › {{ui:Dintr-o linie}} › {{ui:Trepte}}. În Proprietățile treptelor, bifați **Modelează terenul** și setați nivelurile de jos și de sus la cele două terase.
2. Desenați un strat plantat lângă scară și sub ea cu {{ui:Suprafețe}}, și pavaj pe terase. Stratul se decupează singur în jurul treptelor și al pavajului, iar tabelul de plante numără doar ce este plantat.
3. Ridicați nivelul de sus al scării în Proprietăți. Terenul amenajat, cotele de punct, săgețile de pantă și debleul și rambleul se schimbă deodată. Dacă scara nu mai ajunge la terasa de sus, panoul Probleme spune cu cât.
4. Mutați linia scării. Treptele urmează linia lor în același pas de anulare; stratul se decupează din nou și este recalculat, iar tabelele de lucru și listele arată noile numere.
5. Apăsați o singură dată Ctrl+Z: linia, treptele, terenul și stratul revin împreună.

Vedeți [Modificatori de teren și niveluri active](topic:ground-modifiers), [Zone plantate](topic:planted-areas) și [Tabele de lucru](topic:worksheets).

## Încă nerealizat

Acestea sunt cerute, dar nu există în această versiune:

- Ziduri care modelează terenul (raportează unde îl întâlnesc, iar vârful lor poate să îl urmeze).
- Editarea propriei liste de plante din Bibliotecă, în aplicație (editați lista proiectului și salvați-o ca fișier de plante).
- Texturile și culorile propriilor modele GLB de plante (forma se citește; se folosește culoarea plantei).

Vedeți [Spațiul de lucru Amenajări peisagistice](topic:landscape) pentru fiecare unealtă.
