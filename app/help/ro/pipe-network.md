---
title: Proiectarea unei rețele de conducte gravitaționale
summary: Desenați tronsoane de conducte pluviale sau menajere structură cu structură, stabiliți regulile de pantă, acoperire și cădere, lăsați CivilCraft să stabilească radierele și rezolvați problemele pe care le listează.
keywords: generator de structuri, tip de structură, structură dreptunghiulară, cămin de captare, ramă, acoperire, grosimea peretelui, element de bibliotecă, rețea de conducte, pluvial, menajer, canalizare, structuri, cămine de vizitare, guri de scurgere, radiere, pantă, cădere, margine, groapă de decantare, conducte gravitaționale
from: 10a3c14d
---

Un proiect deține o rețea de conducte gravitaționale, pluvială sau menajeră. Este formată din structuri (cămine de vizitare, guri de scurgere) și din conducte drepte între ele. Curgerea merge în direcția în care desenați. CivilCraft verifică fiecare conductă și structură față de trei reguli pe care le stabiliți și poate stabili fiecare radier din aceste reguli.

## Desenați un tronson

Puteți desena conducte fără model de teren, dar marginile, acoperirea și radierele automate au nevoie de unul.

1. Apăsați {{key:P}}, sau faceți clic pe {{ui:Conducte}} din grupul **Proiectare**.
   Indiciul spune: „Conducte: faceți clic pe structuri de sus în jos pe tronson (faceți clic pe una existentă ca să vă conectați). Enter termină.”
2. Faceți clic unde se află structura din amonte. Se plasează o structură.
3. Faceți clic pe fiecare structură următoare din aval. Ca să vă conectați la o structură care există deja, faceți clic pe ea: bara de stare spune „Conectat la S3.”
4. Apăsați {{key:Enter}}.
   Conductele sunt desenate, radierele lor se stabilesc din reguli, iar bara de stare spune, de exemplu: „3 conducte desenate, 12 radiere stabilite din reguli; toate verificările trec.”

Structurile noi se numesc S1, S2 … și au diametrul de 48 in (1200 mm). Conductele noi se numesc P1, P2 … și au diametrul de 12 in (300 mm). Diametrele sunt în țoli într-un proiect în picioare și în milimetri într-un proiect în metri.

Terminați cu {{key:Enter}}. Dublul clic funcționează de asemenea, dar când faceți dublu clic pe o structură existentă ca să încheiați tronsonul acolo, conectarea se pierde: faceți clic o dată, apoi apăsați {{key:Enter}}.

## Stabiliți regulile

Fără nimic selectat, panoul din dreapta (**Proiect**) are un bloc **Rețea de conducte**:

| Setare | Valoare de pornire | Înțeles |
|---|---|---|
| Tip | Pluvial | {{ui:Pluvial}} sau {{ui:Menajeră}}; scris în LandXML |
| Panta minimă | 0.50% | Fiecare conductă trebuie să coboare cel puțin atât |
| Acoperirea minimă | 2 ft (0.6 m) | De la teren până la generatoarea de sus a conductei, pe toată lungimea ei |
| Cădere în structuri | 0.10 ft (0.03 m) | Radierul de ieșire trebuie să fie cel puțin atât de jos sub fiecare radier de intrare |

**Aceste valori de pornire sunt substituenți, nu un standard.** Stabiliți valorile pe care le cere agenția sau proiectul dvs. Acoperirea se măsoară de la teren până la generatoarea de sus (radier plus diametrul interior); grosimea peretelui nu se socotește. Acolo unde platformele sau coridoarele sunt sistematizate, suprafața sistematizată este terenul.

## Lăsați CivilCraft să stabilească radierele

- {{ui:Stabilirea fiecărui radier din reguli}} (în blocul **Rețea de conducte**) stabilește toate conductele.
- {{ui:Stabilirea radierelor ei din reguli}} (cu o conductă selectată) stabilește doar acea conductă.

Lucrând spre aval, fiecare tronson începe cu cel puțin acoperirea minimă la structura sa de sus, coboară cel puțin panta minimă, coboară cel puțin căderea prin fiecare structură și coboară mai adânc oriunde terenul de-a lungul conductei ar lăsa mai puțin decât acoperirea minimă. Radierele se rotunjesc în jos la 0.01, niciodată în sus. Bara de stare spune „Radiere stabilite: acoperire minimă la capătul de sus al fiecărui tronson, cel puțin panta minimă, cel puțin căderea în fiecare structură.” sau numește ce nu a putut face.

## Editați structuri și conducte

Faceți clic pe o structură sau pe o conductă cu {{ui:Selectare}} ca s-o vedeți în panoul din dreapta.

**Structură**: **Nume**, **Margine**, **Adâncimea gropii de decantare**, **Diametru**, apoi **Margine folosită**, **Groapă de decantare**, **Y (Est)** și **X (Nord)**, și conductele de intrare și de ieșire, cu radierele lor.

- Lăsați **Margine** goală ca s-o luați din suprafață; caseta arată atunci valoarea suprafeței cu gri. Tastați o valoare ca să fixați marginea.
- Trageți mânerul structurii pe plan ca s-o mutați. Conductele ei urmează; radierele lor rămân cum erau, deci verificați problemele după aceea.

**Tip**: alegeți unul dintre tipurile de structuri ale rețelei (mai jos), sau fără, pentru o structură rotundă cu propriul diametru.

**Conductă**: **Nume**, structurile între care trece, **Diametru**, **Radier superior**, **Radier inferior**, apoi **Lungime**, **Pantă** și **Acoperire minimă**.

Apăsați {{key:Enter}} după fiecare valoare.

## Citiți și rezolvați problemele

Blocul **Rețea de conducte** listează fiecare problemă (până la 40); faceți clic pe una ca să selectați conducta sau structura. O conductă sau structură selectată își listează proprii probleme. Fără nimic selectat, afișează „Toate conductele și structurile trec regulile.”

| Mesaj (exemple) | Ce să faceți |
|---|---|
| „P2 urcă (-0.40%).” sau „… merge plat …” | Inversați radierele, sau stabiliți-le din reguli. |
| „P2 la 0.30% este mai plată decât panta minimă de 0.50%.” | Coborâți radierul din aval sau ridicați-l pe cel din amonte. |
| „P3 are 1.40 de acoperire pe lungimea 35, mai puțin decât minimul 2.” | Coborâți conducta; stabiliți-i radierele din reguli. |
| „În S3, P4 pleacă la 245.20, cu mai puțin de 0.1 sub P3 care intră la 245.25.” | Coborâți radierul superior al conductei de ieșire. |
| „Generatoarea de sus a lui P1 este deasupra marginii lui S1.” | Conducta este prea sus pentru structură. |
| „S2 are 2 conducte care pleacă din ea; o rețea gravitațională ar trebui să aibă o singură ieșire din fiecare structură.” | Ștergeți o conductă de ieșire, sau desenați-o din nou în direcția corectă. |
| „Conductele formează o buclă; curgerea trebuie să se termine la o ieșire.” | Un tronson a fost desenat înapoi în el însuși; ștergeți o conductă. |
| „S5 este în afara suprafeței și nu are cotă de margine.” | Tastați o margine, sau mutați structura pe suprafață. |
| „P6 trece parțial în afara suprafeței; acoperirea acolo este necunoscută.” | Extindeți suprafața, sau acceptați că acoperirea nu este verificată acolo. |
| „P7 nu are încă radiere.” | Tastați-le, sau stabiliți-le din reguli. |

Conductele și structurile cu probleme sunt marcate și cu roșu pe plan.

## Tipuri de structuri

Un tip de structură este o structură construită din parametrii săi: un cămin de vizitare, o gură de scurgere, o cutie de joncțiune sau o ieșire, **rotundă** (diametru interior) sau **dreptunghiulară** (lățime și lungime interioare), cu **grosimea peretelui**, **placa de fund**, o **groapă de decantare** sub cea mai joasă conductă și un **capac și o ramă** (deschidere rotundă sau dreptunghiulară, înălțimea ramei). Tipurile aparțin rețelei, sub **Tipuri de structuri** în Proprietățile proiectului.

1. Faceți clic pe {{ui:Tip de structură nou}}. Caseta de dialog desenează structura în plan și în secțiune pe măsură ce tastați.
2. Faceți clic pe {{ui:Adăugare tip}}.
3. Selectați o structură și alegeți tipul sub **Tip**. Ea preia dimensiunile și groapa tipului; propria groapă poate fi schimbată în continuare.

Editați un tip și fiecare structură de acel tip urmează dimensiunile sale. Eliminați un tip și structurile sale rămân structuri rotunde de aceeași lățime. Fiecare modificare este un pas: {{key:Mod+Z}} o anulează.

O structură dreptunghiulară se desenează pe plan, în DXF, DWG și PDF, iar în 3D ca un dreptunghi cu lungimea de-a lungul conductei sale de ieșire; conductele pornesc de la perete. LandXML o scrie ca structură dreptunghiulară (`RectStruct`) cu grosimea peretelui și citește astfel de structuri înapoi ca tipuri.

### Partajați un tip prin bibliotecă

{{ui:Salvare ca element de bibliotecă}} scrie tipul ca element de bibliotecă CadCraft (un fișier `.json`): simbolul său de plan, un corp 3D până la o adâncime tipică și toate dimensiunile. Încărcați-l în bibliotecă ca să îl partajați. {{ui:Deschidere element de bibliotecă}} citește înapoi în rețea o structură salvată astfel, convertită în unitățile proiectului. Elementele de bibliotecă care nu sunt structuri făcute în CivilCraft sunt refuzate, cu motivul.

## Ștergere

Selectați o conductă și apăsați Delete ca s-o eliminați. Ștergerea unei structuri elimină și conductele conectate la ea. Pe Mac, apăsați Fn și Delete, sau faceți clic pe {{ui:Ștergere}}.

## Încă nerealizat

Debitele, dimensiunile conductelor și linia piezometrică hidraulică sunt în [Drenaj pluvial](topic:storm-drainage). Cataloagele de conducte, conductele necirculare, conductele din vederea profilului, conductele curbe și mai mult de o rețea pe proiect nu sunt disponibile încă. Vedeți [Încă nerealizat](topic:not-built-yet).
