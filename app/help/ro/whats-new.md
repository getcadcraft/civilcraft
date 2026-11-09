---
title: Noutăți în 0.8 și 0.8.1
summary: CivilCraft 0.8 adaugă Fă să plouă (o furtună peste sistematizarea verticală), un echilibrator de terasamente, un instrument de găsire a celui mai bun traseu, bazine de retenție, progres din măsurători, un import de la adresă la amplasament care păstrează amplasamentul în proiect, și ferestre pentru soluri și taluze, intersecții și marcaje, compensare topografică, cariere, legături radio și macazuri. 0.8.1 corectează modul în care sunt citite fișierele DWG.
keywords: noutăți, ce este nou, note de lansare, jurnal de modificări, modificări, 0.8, 0.8.1, versiune, funcții noi, ploaie, furtună, stagnare, depășire, terasamente, echilibru, debleu și rambleu, transport, cel mai bun traseu, cost minim, aliniament, bazin de retenție, evacuare, coborârea nivelului, bord liber, progres, măsurători, dronă, depozit de material, adresă la amplasament, parcelă, sol, inundație, stabilitatea taluzului, bishop, tasare, intersecție, marcaje, semne, distanță de vizibilitate, compensare, cele mai mici pătrate, traversă, carieră, model de bloc, legătură radio, fresnel, macaz, limbi, probleme, live, dwg
from: b0932cf0
---

Iată ce s-a schimbat în CivilCraft 0.8 (2026-11-01) și 0.8.1 (2026-11-02), comparativ cu 0.7. Părțile noi mari sunt instrumente care verifică sistematizarea verticală și amplasamentul (ploaie, terasamente, trasee, bazine, progres) și șase ferestre de calcul pentru teren, drumuri, topografie, mine, legături și cale ferată.

## Noutăți

### Verificați sistematizarea verticală

- **Fă să plouă.** {{ui:Fă să plouă…}} (sub {{ui:Model de teren}}) aruncă o furtună peste terenul sistematizat. Urmăriți cum apa curge de pe platforme, se adună în colțurile joase și depășește bazinele care sunt prea mici. Rularea este animată și oferă volumele, debitul de vârf și un CSV cu fiecare bazin. Celula implicită este grosieră, ca o primă verificare să fie rapidă; o celulă mai fină este mai lentă. Bazinele care depășesc apar și în panoul Probleme.
- **Echilibrator de terasamente.** {{ui:Echilibrare terasamente…}} ridică sau coboară o platformă până când debleul este egal cu rambleul și arată tabelul de transport dintre ele.
- **Cel mai bun traseu.** {{ui:Cel mai bun traseu…}}: alegeți un început și un sfârșit, iar CivilCraft găsește cea mai ieftină cale prin teren care respectă limitele de pantă și de curbură, apoi creează din ea un aliniament.
- **Bazine de retenție.** {{ui:Bazine de retenție…}} calculează cota apei și stocarea din terenul existent, acceptă dispozitive de evacuare (orificiu, prag deversor, deversor în V, deversor de siguranță), trece o furtună prin bazin și verifică debitul de vârf reținut, timpul de golire și bordul liber.
- **Progres din măsurători.** {{ui:Progres din măsurători…}} compară suprafețe de dronă sau de scanare din date diferite cu terenul așa cum era și cu proiectul: procentul realizat din volum, zonele săpate în exces și cele umplute în exces, depozitele de material și momentul în care lucrarea se termină la ritmul acesta (marcat ca estimare).

### Amplasamentul

- **Adresă la amplasament.** {{ui:Adresă la amplasament…}} reunește date deschise despre parcelă, clădire, zonare, sol, inundații și teren pentru un singur amplasament. Puteți păstra amplasamentul în fișierul proiectului: adresa introdusă, fiecare sursă cu ziua în care a fost preluată și licența ei, și ce a revenit. Redeschideți sau partajați proiectul și amplasamentul este încă acolo, fără nicio preluare nouă. Îl puteți salva și ca fișier de amplasament sau trimite către BimCraft. Vezi [Adresă la amplasament](topic:address-to-site).

### Teren, drumuri, topografie, mine, legături și cale ferată

- **Soluri și taluze.** {{ui:Soluri și taluze…}} desenează profilul solului între forajele pe care le introduceți. Metoda Bishop caută apoi cercul critic de cedare pe terenul existent, cu nivelul apei freatice, supraîncărcare și coeficient seismic; tasarea unei tălpi de fundare include consolidarea, tasarea imediată și evoluția în timp.
- **Intersecții și marcaje.** {{ui:Intersecții și marcaje…}} unește ramurile cu racordări de bordură (o rază pentru fiecare ramură sau racordări cu trei centre), distanța de vizibilitate pentru viteza de proiectare, o verificare a triunghiurilor de vizibilitate, treceri de pietoni, linii de oprire, marcaje și semne, cu un tabel al semnelor. Sunt desenate în plan și salvate ca .dxf cu straturi denumite.
- **Compensare topografică.** {{ui:Compensare topografică…}} rulează o compensare prin metoda celor mai mici pătrate pentru o traversă sau o rețea: coordonate compensate, elipse de eroare, testul chi-pătrat și un semnal pe măsurătoarea care nu se potrivește. Sunt incluse rețelele libere, închiderea unei traverse prin regula busolei și fișierele de teren RW5, GSI, JobXML sau CSV; punctele compensate se salvează ca CSV.
- **Cariere.** {{ui:Cariere…}} transformă probele de foraj într-un model de bloc și în groapa finală din limita unghiului de taluz, cu raportul de decapare, un tabel pe banc și o curbă de grad și tonaj. Sunt disponibile și gropile imbricate după factorul de venit și un program de producție cu flux de numerar actualizat.
- **Legături radio.** {{ui:Legături radio…}} verifică vizibilitatea directă peste teren, cu bombarea Pământului, prima zonă Fresnel, bugetul de legătură, marja de atenuare și întreruperea prin multitraseu, și indică înălțimea catargului care ar elibera traseul. Face și bugete de pierderi pentru fibră optică, cantități de traseu și vântul pe un turn.
- **Macazuri.** {{ui:Macazuri…}} creează un macaz din numărul inimii, traversări între linii paralele și un gabarit de structură înclinat prin supraînălțare și lărgit în curbă. Un macaz poate fi plasat la o stație a unui aliniament.

Vezi [Soluri, intersecții, compensare topografică, cariere, legături radio și macazuri](topic:soils-roads-survey-mines-links).

## În toate aplicațiile

- **Limbi.** 54 de limbi, zece dintre ele noi. Limbile altele decât engleza sunt ciorne generate automat până când le citește un vorbitor nativ. Subiectele de ajutor sunt încă în mare parte în engleză.
- **Rânduri ale barei de instrumente.** {{ui:Setări}} › {{ui:General}} › {{ui:Rânduri ale barei de instrumente}}: Încadrare (ca înainte), 2 rânduri sau 1 rând. Panglica CivilCraft arată cel mai folosit instrument mare, următoarele mici, iar restul în spatele săgeții din numele grupului.
- **Dispozitive de intrare.** Trackpad-ul, creionul, mouse-ul 3D, controlerul și MIDI pot comanda aplicațiile.
- **Probleme.** Un panou Probleme care avertizează în fiecare aplicație, cu verificări care citesc pachetele de reglementări.
- **Live.** O vizualizare a celor care sunt unde într-o sesiune Live.
- **Suplimente.** O listă de suplimente, cu suplimente de iluminat.
- **Conectați un asistent AI.** Orice asistent conectat poate comanda instrumentele CivilCraft. Vine cu o notă că, din CadCraft Studio, conectarea dintr-un clic și conectorul găzduit nu sunt încă gata. Vezi [Lăsați un asistent AI să lucreze cu amplasamentul](topic:assistants).

## Corectat în 0.8.1

- **Secțiunea de clase DWG.** A fost citită ca tip greșit (GitHub cadcraft#5). Corectat în CivilCraft împreună cu CadCraft, BimCraft, ModelCraft și TakeoffCraft.
- **Schimbarea limbii în timpul rulării.** CadCraft Studio și edițiile împachetate pot schimba limba în timpul rulării. Înainte erau doar în engleză. Nu este încă testat pe toate platformele: spuneți-ne dacă limba nu se schimbă.

## Încă nu în această versiune

- **Acestea sunt instrumente de calcul.** Fiecare rezultat din ferestrele noi necesită verificarea unui inginer. Rezistențele solului pornesc de la valori tipice pentru grupa de sol, iar fereastra o spune.
- **Fă să plouă.** O rulare pe amplasamentul de probă poate dura peste două minute în browser la o celulă fină. A fost verificată pe cazuri calculate manual și pe un bazin în V, dar încă nu pe un teren real sistematizat.
- **Adresă la amplasament.** Citește fișiere de date deschise pe care le aduceți și a fost testată doar pe fișierele noastre. Copacii nu sunt o sursă. Preluarea automată a surselor așteaptă textul despre confidențialitate.
- **Progres din măsurători.** Testat doar pe măsurători inventate. Progresul pe foi și pe adnotări (MarkupCraft) și compararea scanării cu modelul (BimCraft) nu sunt încă realizate.
- **Soluri și taluze.** Doar suprafețe circulare: fără căutare de pană sau de bloc și fără fisură de tracțiune.
- **Intersecții.** O rază pentru fiecare ramură, fără traiectorii de giraj ale camioanelor, și nu intră încă în coridor.
- **Fișiere de teren.** Cititoarele au fost scrise după descrieri publice ale formatelor și încercate pe fișiere create de noi. Sunt necesare fișiere reale de la instrumente.
- **Legături și cale ferată.** Legături radio: doar pierderea în spațiu liber și multitraseul (fără atenuare prin ploaie și fără diagrame de antenă), și fără standard feroviar: fiecare limită feroviară este un substituent, cu cifre provizorii pe care niciun inginer feroviar nu le-a verificat.
- **Windows și macOS.** 0.8 nu este semnat digital. Windows poate avertiza, iar macOS cere clic dreapta, apoi Deschidere.

Restul se găsește în [Încă nerealizat](topic:not-built-yet). Pentru versiunea anterioară, vezi [Noutăți în 0.7](topic:whats-new-0-7).
