---
title: Ce este nou în 0.9
summary: Șabloane de coridor și de teren, accentrări și butoane de selectare la desenare, analiză GIS cu tabel de atribute, umbră, randament solar, confort și studii de vânt pentru un amplasament, o vizualizare 3D Randare și suplimentele Nori de puncte și WaterCraft.
keywords: ce este nou, 0.9, note de lansare, șabloane de coridor, șabloane de teren, editor de șabloane, secțiune tip, mai multe coridoare, accentrare, accentrări, selectare, mutare, copiere, rotire, tangentă, randare, randare 3D, analiză GIS, zonă tampon, suprapunere, îmbinare spațială, tabel de atribute, stil după atribut, studiu de umbră, randament solar, utci, confort în aer liber, studiu de vânt, openfoam, nori de puncte, las, laz, watercraft, debit de incendiu, hidrant, vârsta apei, clor, consumuri, desenare, aspect, tooltip, bază, cale ferată, live, dwg, 0.8, 0.8.1, versiune, funcții noi, ploaie, scurgere, băltire, depășire, terasamente, transport, cel mai bun traseu, cel mai mic cost, aliniament, bazin de retenție, evacuare, bord liber, progres, măsurători, dronă, depozit de material, adresă la amplasament, parcelă, sol, inundație, stabilitate a taluzului, Bishop, tasare, intersecție, marcaje, semne, distanță de vizibilitate, compensare, cele mai mici pătrate, drumuire, carieră, model de bloc, legătură radio, Fresnel, macaz, cruciș
from: d7ac5b14
---

Aceasta este lista modificărilor din CivilCraft 0.9, comparativ cu 0.8.1. CivilCraft 0.9 face parte din CadCraft Studio 0.9 și din cele opt aplicații ale sale. Cele mai mari părți sunt șabloanele de coridor și de teren, accentrările la desenare, analiza GIS, studiile de soare, randamentul solar, confortul și vântul pentru un amplasament și două suplimente: Nori de puncte și WaterCraft.

## Nou

### Șabloane de coridor și de teren

- **Șabloane de coridor.** Deschideți {{ui:Model de teren}} › {{ui:Mai multe}} › {{ui:Șabloane de coridor…}} (sau scrieți {{cmd:TEMPLATES}}). Un șablon este o secțiune transversală mică, cu componente, decalaje, pante, materiale și coduri de puncte. Păstrați-le în proiect, în {{ui:Biblioteca mea}} sau ca fișier `.cctemplates.json`. Editorul de șabloane arată un desen la scară reală și listează problemele pe măsură ce scrieți.
- **Construire din șabloane pe kilometraj.** Selectați un aliniament și activați {{ui:Construire din șabloane pe kilometraj}} în Proprietățile sale. Fiecare parte din fiecare regiune are propria listă de îmbrăcăminte și propria condiție de capăt. {{ui:Adăugare coridor}} sub {{ui:Coridoare pe acest aliniament}} pune mai multe coridoare pe un aliniament.
- **Șabloane de teren.** {{ui:Model de teren}} › {{ui:Mai multe}} › {{ui:Șabloane de teren…}} (sau scrieți {{cmd:TERRAINTEMPLATES}}) așază materiale pe straturi, precum stratul fertil sau îmbrăcămintea și fundația, pe un teren, cu suprafața și volumul pe fiecare strat. Vezi [Șabloane de coridor și șabloane de teren](topic:corridor-templates).

### Desenare

- **Accentări.** Instrumentele Aliniament, Platformă, Parcelă, Volum, Linie de caracteristică, Măsurare, Limită și Bazin de colectare se accentrează pe punctele topografice, PI-uri, colțuri, vârfuri și structuri, cu o etichetă lângă marcaj. Țineți {{key:Alt}} pentru un punct liber.
- **Butoane de selectare, tangentă, mutare, copiere, rotire.** Colțurile platformei, parcelei și liniei de caracteristică au casete tastate pentru Est și Nord și un buton de selectare cu cruce. Proprietățile mai au {{ui:Tangentă din două puncte}} pentru aliniamente și {{ui:Mutare, copiere și rotire}} pentru aliniamente, platforme, parcele și linii de caracteristică. Vezi [Desenarea cu accentări, colțuri selectate și mutare, copiere, rotire](topic:draft-with-snaps).
- **Vizualizarea Randare în 3D.** Butonul {{ui:Randare}} de pe bara 3D desenează terenul cu culori naturale, cer, ceață și umbre moi. Nu schimbă modelul. Meniul {{ui:Soare}} are acum butoanele {{ui:Aplicare}} și {{ui:Închidere}}. Vezi [Vizualizarea amplasamentului în 3D](topic:site-3d).
- **Panourile se deschid câte o secțiune.** Panoul din stânga și panoul Proprietăți deschid o secțiune și le închid pe celelalte, iar plăcile din panglica Amenajări peisagistice care țin mai multe instrumente sunt butoane divizate.

### Analiză GIS

- **Analiză.** {{ui:Model de teren}} › {{ui:Mai multe}} › {{ui:Analiză}} oferă zonă tampon, suprapunere, îmbinare spațială, selectare după atribut sau formă, și măsurare. Fiecare instrument creează un strat nou într-un singur pas de anulare.
- **Tabel de atribute.** Meniul cu trei puncte al unui strat are {{ui:Tabel de atribute…}} și {{ui:Stil după atribut…}}. Vezi [Analiza straturilor GIS](topic:gis-analysis) și [Lucrul cu tabelul de atribute al unui strat](topic:gis-table).

### Amplasamentul: soare, randament solar, confort și vânt

- **Secțiunea Mediu.** Selectați un volum: secțiunea {{ui:Mediu}} se află sub {{ui:Ore de soare}} în Proprietățile sale. Are un studiu de umbră (hartă, tabel, animație, CSV), randament solar dintr-un fișier meteo al unui an tipic (.epw) și confort în aer liber (UTCI).
- **Vânt, doar ca ecranare.** {{ui:Rulare studiu de vânt}} colorează terenul de la ședere la neconfortabil, pentru fiecare direcție a vântului din fișierul meteo. Nu este validat, iar panoul o spune.
- **Suplimentul Vânt pietonal (OpenFOAM).** Este oprit până îl activați în {{ui:Setări}} › {{ui:Suplimente}}. OpenFOAM este un program pe care îl instalați singur. Vezi [Umbră, randament solar și confort în aer liber](topic:environment).

### Nori de puncte (supliment)

- Activați {{ui:Nori de puncte}} în {{ui:Setări}} › {{ui:Suplimente}}; apare o filă Nori de puncte în panoul din dreapta. Deschideți un fișier LAS sau LAZ, curățați-l, sortați-l în sol, vegetație și clădiri, construiți terenul, curbele de nivel și volumele, apoi exportați LAS sau LAZ. Vezi [Nori de puncte de la o dronă sau un scaner](topic:point-clouds).

### WaterCraft (supliment)

- Activați {{ui:WaterCraft (distribuție de apă)}} în {{ui:Setări}} › {{ui:Suplimente}}; apare o filă WaterCraft. Are consumuri de la clienți, debitul de incendiu la fiecare hidrant, care întrerupere de conductă contează cel mai mult, și vârsta apei și clorul, fiecare salvat ca CSV. Vezi [WaterCraft: consumuri, debit de incendiu, întreruperi și vârsta apei](topic:watercraft).

### Lucrul împreună

- Într-o sesiune Live vedeți cursoarele și numele fiecăruia pe plan. Pentru plante din bibliotecă, Amenajările peisagistice CivilCraft pornesc din colecția implicită, {{ui:Amenajări peisagistice CivilCraft}}.

## În fiecare aplicație

- Indiciile apar ca tooltip-uri Bootstrap, iar sugestia de pornire poate fi închisă.
- Șirul de file al unui panou care nu încape derulează, în loc să fie tăiat.
- Titlurile filelor din browser arată `<document> - CivilCraft | CadCraft`.
- {{ui:Setări}} are o secțiune Aspect, unde aspectele sunt o listă derulantă cu alegeri pe două rânduri.
- Unitățile de greutate și temperatură sunt în {{ui:Setări}} › {{ui:Global}} › {{ui:Unități}}.
- Lista de limbi arată limbile pentru care build-ul are fișiere. Limbile în afara engleziei sunt ciorne automate.

## Remediat

- Verificarea adreselor și suplimentele de verificare EnergyPlus nu puteau fi activate; acum pot.
- Ajutorul spune acum că suplimentul Nori de puncte scrie un nor curățat ca LAS 1.4 sau LAZ.
- Clicul pe propriul mâner al obiectului selectat nu mai pornește o tragere de mâner care oprea o selectare în așteptare.

## Limite recunoscute

- Șabloanele de coridor exemplu sunt marcaje provizorii, fără niciun standard; un inginer trebuie să le verifice. Șabloanele de teren nu adaugă nicio suprafață și nu sunt desenate în 3D sau în vizualizarea secțiunii. Al doilea coridor de pe un aliniament nu este în exportul IFC. Nu există tranziție între două șabloane pe kilometraj.
- Norii de puncte au fost testați pe fișiere fictive, nu pe un zbor real cu drona. Se citesc doar LAS și LAZ.
- Analiza GIS a fost testată pe straturi fictive.
- Umbra, soarele și confortul sunt estimări de planificare; vântul este o ecranare nevalidată. Nimic din acestea nu este o valoare de proiectare.
- WaterCraft este un instrument de calcul verificat pe rețele fictive. Un inginer de apă decide ce valoare au cifrele.
- Limbile în afara engleziei sunt ciorne automate.
- Programele de instalare pentru Windows nu sunt semnate cu cod, iar imaginea de disc pentru macOS nu este notarizată.

## Mai devreme: 0.8 și 0.8.1

Aceasta este lista modificărilor din CivilCraft 0.8 (2026-11-01) și 0.8.1 (2026-11-02), comparativ cu 0.7. Cele mai mari părți noi sunt instrumente care testează sistematizarea și amplasamentul (ploaia, terasamentele, traseele, bazinele, progresul) și șase ferestre de calcul pentru teren, drumuri, topografie, mine, legături și cale ferată.

### Nou

**Testați sistematizarea**

- **Fă să plouă.** {{ui:Fă să plouă…}} (sub {{ui:Model de teren}}) trimite o furtună pe terenul sistematizat. Vedeți apa curgând de pe platforme, băltindu-se în colțurile joase și depășind bazinele prea mici. Rularea este animată și dă volumele, debitul maxim de ieșire și un CSV cu fiecare bazin. Celula implicită este grosieră, ca o primă privire să fie rapidă; o celulă mai fină este mai lentă. Bazinele care depășesc apar și în panoul Probleme.
- **Echilibrare terasamente.** {{ui:Echilibrare terasamente…}} ridică sau coboară o platformă până când săpătura egalează umplutura, și arată tabelul de transport între ele.
- **Cel mai bun traseu.** {{ui:Cel mai bun traseu…}}: alegeți un început și un sfârșit, iar CivilCraft găsește cel mai ieftin drum peste teren care respectă limitele proprii de pantă și de curbură, apoi face un aliniament din el.
- **Bazine de retenție.** {{ui:Bazine de retenție…}} calculează etajul și stocarea din teren, acceptă elemente de evacuare (orificiu, deversor, V-ul, descărcător), trece o furtună prin bazin și verifică vârful reținut, timpul de golire și bordul liber.
- **Progres din măsurători.** {{ui:Progres din măsurători…}} compară suprafețele de la dronă sau scanare din date diferite cu terenul așa cum era și cu proiectul: procentul executat după volum, zonele săpate în plus și umplute în plus, depozitele de material și când se termină lucrarea în acest ritm (marcat ca estimare).

**Cunoașteți amplasamentul**

- **Adresă la amplasament.** {{ui:Adresă la amplasament…}} aliniază date deschise despre parcelă, clădire, zonare, sol, inundații și teren pe un singur amplasament. Puteți păstra amplasamentul în fișierul de proiect: adresa tastată, fiecare sursă cu ziua în care a fost preluată și licența ei, și ce a venit înapoi. Redeschideți sau partajați proiectul și amplasamentul este încă acolo, fără să se mai preia nimic. Îl puteți salva și ca fișier de amplasament sau trimite la BimCraft. Vezi [Adresă la amplasament](topic:address-to-site).

**Teren, drumuri, topografie, mine, legături și cale ferată**

- **{{ui:Soluri și taluze…}}** desenează profilul solului între sondajele pe care le tastați. Metoda Bishop caută apoi cercul critic pe terenul dumneavoastră, cu un nivel al apei subterane, o supraîncărcare și un coeficient seismic; tasarea unei fundații primește consolidare, tasare imediată și timp.
- **{{ui:Intersecții și marcaje…}}** unește brațele cu racordări de bordură (o rază pe braț sau racordări cu trei centre), distanța de vizibilitate pentru viteza de proiectare, o verificare a triunghiurilor de vizibilitate, treceri de pietoni, linii de oprire, marcaje și semne, cu un tabel de semne. Sunt desenate pe plan și salvate ca .dxf, cu straturi numite.
- **{{ui:Compensare topografică…}}** rulează o compensare prin cele mai mici pătrate a unei drumuiri sau a unei rețele: coordonate compensate, elipse de eroare, testul chi-pătrat și un semnal pe măsurătoarea care nu se potrivește. Rețelele libere, închiderea unei drumuiri prin regula busolei și fișierele de teren RW5, GSI, JobXML sau CSV sunt incluse, iar punctele compensate se salvează ca CSV.
- **{{ui:Cariere…}}** transformă probele de foraj într-un model de bloc și în groapa finală, în limita unghiului de taluz, cu raportul de decopertare, un tabel pe banc și o curbă de tenor și tonaj. Sunt incluse și gropi imbricate după factorul de venit și un program de producție cu flux de numerar actualizat.
- **{{ui:Legături radio…}}** verifică linia de vedere peste terenul dumneavoastră, cu bombarea pământului, prima zonă Fresnel, bugetul legăturii, marja de atenuare și întreruperea prin propagare multiplă, și dă înălțimea catargului care ar elibera traseul. Face și bugete de pierderi pentru fibră, cantități de traseu și vântul pe un turn.
- **{{ui:Macazuri…}}** construiește un macaz din numărul său de inimă, încrucișări între linii paralele și un gabarit al structurii înclinat prin supraînălțare și lărgit pe o curbă. Un macaz poate sta la un kilometraj al unui aliniament.

Vezi [Soluri, intersecții, compensare topografică, cariere, legături radio și macazuri](topic:soils-roads-survey-mines-links).

### În fiecare aplicație

- **Limbi.** 54 de limbi, zece dintre ele noi. Limbile în afara engleziei sunt ciorne automate până când un vorbitor nativ le citește. Subiectele de ajutor sunt încă în mare parte în engleză.
- **Rânduri ale barei de instrumente.** {{ui:Setări}} › {{ui:General}} › {{ui:Rânduri ale barei de instrumente}}: Înfășurare (ca înainte), 2 rânduri sau 1 rând. Panglica CivilCraft arată cel mai folosit instrument mare, următoarele mici, iar restul în spatele săgeții de lângă numele grupului.
- **Dispozitive de intrare.** Touchpad, creion, mouse 3D, controler și MIDI pot comanda aplicațiile.
- **Probleme.** Un panou Probleme care avertizează în fiecare aplicație, cu verificări care citesc pachete de reglementări.
- **Live.** O vizualizare a cine unde se află într-o sesiune Live.
- **Suplimente.** O listă de suplimente, cu suplimente de iluminat.
- **Conectați-vă AI-ul.** Orice asistent conectat poate comanda instrumentele CivilCraft. Vine cu o notă că înseși conectarea dintr-un clic în CadCraft Studio și conectorul găzduit nu sunt încă gata. Vezi [Lăsați un asistent AI să lucreze cu amplasamentul](topic:assistants).

### Remediate în 0.8.1

- **Secțiunea de clase DWG.** Era citită ca tip greșit (GitHub cadcraft#5). Remediat în CivilCraft, împreună cu CadCraft, BimCraft, ModelCraft și TakeoffCraft.
- **Schimbarea limbii în timpul rulării.** CadCraft Studio și edițiile împachetate pot schimba limba în timpul rulării. Înainte erau doar în engleză. Nu este încă testat pe toate platformele: spuneți-ne dacă limba nu se schimbă.

### Nu este încă în această versiune

- **Acestea sunt instrumente de calcul.** Fiecare rezultat din ferestrele noi are nevoie de verificarea unui inginer. Rezistențele solului pornesc de la valori tipice pentru grupa de sol, iar fereastra spune asta.
- **Fă să plouă.** O rulare pe amplasamentul exemplu poate dura peste două minute în browser la o celulă fină. A fost verificată pe cazuri calculate manual și pe o zonă de colectare în V, dar nu încă pe un amplasament real sistematizat.
- **Adresă la amplasament.** Citește fișiere de date deschise pe care le aduceți și a fost testată doar pe fișierele noastre. Copacii nu sunt o sursă. Preluarea surselor în locul dumneavoastră așteaptă formularea de confidențialitate.
- **Progres din măsurători.** Testat doar pe măsurători fictive. Progresul pe planșe și adnotări (MarkupCraft) și compararea scanării cu modelul (BimCraft) nu sunt încă construite.
- **Soluri și taluze.** Doar suprafețe circulare: fără căutare pe pană sau pe bloc și fără fisură de tensiune.
- **Intersecții.** O rază pe braț, fără traiectorii de vehicule mari, și nu intră încă în coridor.
- **Fișiere de teren.** Cititoarele au fost scrise din descrieri publice ale formatelor și încercate pe fișiere pe care le-am făcut. Sunt necesare fișiere reale de la instrumente.
- **Legături și cale ferată.** Legături radio: doar pierdere în spațiu liber și propagare multiplă (fără atenuare de ploaie sau diagrame de antenă), și niciun standard feroviar: fiecare limită de cale ferată este un marcaj provizoriu, cu cifre preliminare pe care niciun inginer feroviar nu le-a verificat.
- **Windows și macOS.** 0.8 nu este semnată cu cod. Windows poate avertiza, iar macOS cere clic dreapta, apoi Deschidere.

Restul este în [Încă nerealizat](topic:not-built-yet). Pentru versiunea anterioară, vezi [Ce este nou în 0.7](topic:whats-new-0-7).
