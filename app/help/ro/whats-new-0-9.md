---
title: Ce este nou în 0.9 (anterior)
summary: Șabloane de coridor și de teren, agățări și butoane Alegere la desen, analiză GIS cu tabel de atribute, studii de umbră, randament solar, confort și vânt pentru un amplasament, o vizualizare 3D de randare și suplimentele Nor de puncte și WaterCraft.
keywords: ce este nou 0.9, versiune anterioară, ce este nou, 0.9, note de lansare, șabloane de coridor, șabloane de teren, editor de șabloane, secțiune tip, mai multe coridoare, agățare, agățări, alegere, mutare, copiere, rotire, tangentă, randare, randare 3d, analiză gis, tampon, suprapunere, îmbinare spațială, tabel de atribute, stil după atribut, studiu de umbră, randament solar, utci, confort în exterior, studiu de vânt, openfoam, nor de puncte, las, laz, watercraft, debit de incendiu, hidrant, vârsta apei, clor, consumuri, sugestii, aranjare în pagină, ce este nou, 0.8, 0.8.1, versiune, funcții noi, ploaie, furtună, acumulare de apă, depășire, terasamente, echilibru, debleu și rambleu, transport, cel mai bun traseu, cost minim, aliniament, bazin de retenție, evacuare, coborârea nivelului, bordaj liber, progres, măsurători, dronă, depozit de material, adresă la amplasament, parcelă, sol, inundație, stabilitatea taluzelor, Bishop, tasare, intersecție, marcaje, semne, distanță de vizibilitate, compensare, cele mai mici pătrate, drumuire, carieră, model de bloc, legătură radio, Fresnel, macaz, trecere, limbi, probleme, live, dwg
from: 4664522c
---

Iată ce s-a schimbat în CivilCraft 0.9, comparativ cu 0.8.1. CivilCraft 0.9 face parte din CadCraft Studio 0.9 și din cele opt aplicații ale sale. Părțile importante sunt șabloanele de coridor și de teren, agățările la desen, analiza GIS, studiile soarelui, randamentului solar, confortului și vântului pentru un amplasament și două suplimente: Nor de puncte și WaterCraft.

## Noutăți

### Șabloane de coridor și de teren

- **Șabloane de coridor.** Deschideți {{ui:Model de teren}} › {{ui:Mai multe}} › {{ui:Șabloane de coridor…}} (sau scrieți {{cmd:TEMPLATES}}). Un șablon este o secțiune transversală mică, cu componente, decalaje, pante, materiale și coduri de punct. Păstrați-le în proiect, în {{ui:Biblioteca mea}} sau ca fișier `.cctemplates.json`. Editorul de șabloane arată un desen la scară reală și listează problemele pe măsură ce scrieți.
- **Construire din șabloane pe kilometraj.** Selectați un aliniament și activați {{ui:Construire din șabloane pe kilometraj}} în **Proprietăți**. Fiecare parte a fiecărei regiuni are propria listă de îmbrăcăminte și propria condiție de capăt. {{ui:Adăugare coridor}} sub {{ui:Coridoare pe acest aliniament}} pune mai multe coridoare pe un aliniament.
- **Șabloane de teren.** {{ui:Model de teren}} › {{ui:Mai multe}} › {{ui:Șabloane de teren…}} (sau scrieți {{cmd:TERRAINTEMPLATES}}) așază pe teren materiale stratificate, precum stratul vegetal, îmbrăcămintea sau fundația, cu arie și volum pe fiecare strat. Vedeți [Șabloane de coridor și de teren](topic:corridor-templates).

### Desenare

- **Agățări.** Uneltele Aliniament, Platformă, Parcelă, Masă, Linie caracteristică, Măsurare, Limită și Bazin de colectare se agață de punctele topografice, PI, colțuri, vârfuri și structuri, cu o etichetă lângă marcaj. Țineți apăsat {{key:Alt}} pentru un punct liber.
- **Butoane Alegere, tangentă și mutare, copiere, rotire.** Colțurile platformelor, parcelelor și liniilor caracteristice au casete introduse pentru Est și Nord și un buton Alegere cu cruce. Proprietăți are de asemenea {{ui:Tangentă din două puncte}} pentru aliniamente și {{ui:Mutare, copiere și rotire}} pentru aliniamente, platforme, parcele și linii caracteristice. Vedeți [Desenarea cu agățări, colțuri alese și mutare, copiere, rotire](topic:draft-with-snaps).
- **Vizualizare de randare în 3D.** Butonul {{ui:Randare}} din bara 3D desenează terenul cu culori naturale, cer, ceață ușoară și umbre moi. Nu modifică modelul. Meniul {{ui:Soare}} are acum butoanele {{ui:Aplicare}} și {{ui:Închidere}}. Vedeți [Vizualizarea amplasamentului în 3D](topic:site-3d).
- **Panourile se deschid câte o secțiune.** Panoul din stânga și panoul Proprietăți deschid o secțiune și le închid pe celelalte, iar casetele panglicii Peisaj care țin mai multe unelte sunt butoane împărțite.

### Analiză GIS

- **Analiză.** {{ui:Model de teren}} › {{ui:Mai multe}} › {{ui:Analiză}} oferă tampon, suprapunere, îmbinare spațială, selectare după atribut sau formă și măsurare. Fiecare unealtă creează un strat nou, ca un singur pas de anulare.
- **Tabel de atribute.** Meniul cu trei puncte al unui strat are {{ui:Tabel de atribute…}} și {{ui:Stil după atribut…}}. Vedeți [Analiza straturilor GIS](topic:gis-analysis) și [Lucrul cu tabelul de atribute al unui strat](topic:gis-table).

### Amplasamentul: soare, solar, confort și vânt

- **Secțiunea Mediu.** Selectați o masă: secțiunea {{ui:Mediu}} se află sub {{ui:Ore de soare}} în **Proprietăți**. Are un studiu de umbră (hartă, tabel, animație, CSV), randament solar dintr-un fișier meteo de an tipic (.epw) și confort în exterior (UTCI).
- **Vânt, doar ca evaluare preliminară.** {{ui:Rulare studiu de vânt}} colorează terenul de la șezut până la neconfortabil, pentru fiecare direcție a vântului din fișierul meteo. Nu este validat, iar panoul o spune.
- **Suplimentul vânt pentru pietoni (OpenFOAM).** Dezactivat până la activarea sa în {{ui:Setări}} › {{ui:Suplimente}}. OpenFOAM este un program care se instalează separat. Vedeți [Umbra, randamentul solar și confortul în exterior](topic:environment).

### Nor de puncte (supliment)

- Activați {{ui:Nor de puncte}} în {{ui:Setări}} › {{ui:Suplimente}}; în panoul din dreapta apare o filă Nor de puncte. Deschideți un fișier LAS sau LAZ, curățați-l, sortați-l în teren, vegetație și clădiri, construiți terenul, curbele de nivel și volumele și exportați LAS sau LAZ. Vedeți [Nor de puncte dintr-o dronă sau un scanner](topic:point-clouds).

### WaterCraft (supliment)

- Activați {{ui:WaterCraft (distribuție de apă)}} în {{ui:Setări}} › {{ui:Suplimente}}; apare o filă WaterCraft. Are consumuri de la clienți, debitul de incendiu la fiecare hidrant, care întrerupere de conductă contează cel mai mult și vârsta apei și clorul, fiecare salvat ca CSV. Vedeți [WaterCraft: consumuri, debit de incendiu, întreruperi și vârsta apei](topic:watercraft).

### Lucrul împreună

- Într-o sesiune Live vedeți cursoarele și numele celorlalți în plan. Plante din bibliotecă: CivilCraft Peisaj pornește din colecția implicită a bibliotecii, {{ui:Peisaj CivilCraft}}.

## În fiecare aplicație

- Indicațiile apar ca sugestii Bootstrap, iar sfatul de pornire poate fi închis.
- Șirul de file al unui panou care nu încape se derulează în loc să fie tăiat.
- Titlurile filelor din browser arată `<document> - CivilCraft | CadCraft`.
- {{ui:Setări}} are o secțiune Aranjare în pagină, în care aranjamentele sunt o listă derulantă cu opțiuni pe două rânduri.
- Unitățile de greutate și de temperatură se află în {{ui:Setări}} › {{ui:Global}} › {{ui:Unități}}.
- Lista de limbi arată limbile pentru care versiunea are fișiere. Limbile în afara engleză sunt ciorne făcute de mașină.

## Corectate

- Suplimentele de căutare a adresei și de verificare EnergyPlus nu puteau fi activate; acum pot.
- Ajutorul spune acum că suplimentul Nor de puncte scrie un nor curățat ca LAS 1.4 sau LAZ.
- Un clic pe mânerul propriu al obiectului selectat nu mai pornește o tragere de mâner care oprea o alegere care aștepta.

## Limite reale

- Șabloanele de coridor exemplu sunt valori provizorii, fără standard; un inginer trebuie să le verifice. Șabloanele de teren nu adaugă suprafață și nu sunt desenate în 3D sau în vizualizarea secțiunii. Al doilea coridor de pe un aliniament nu este în exportul IFC. Nu există conicitate între două șabloane pe kilometraj.
- Norii de puncte au fost testați pe fișiere inventate, nu pe o măsurătoare reală cu dronă. Se citesc doar LAS și LAZ.
- Analiza GIS a fost testată pe straturi inventate.
- Umbra, solarul și confortul sunt estimări de planificare; vântul este o evaluare preliminară nevalidată. Nimic din acestea nu este o valoare de proiectare.
- WaterCraft este un instrument de calcul verificat pe rețele inventate. Un inginer de apă decide ce valoare au cifrele.
- Limbile în afara engleză sunt ciorne făcute de mașină.
- Programele de instalare pentru Windows nu sunt semnate digital, iar imaginea de disc pentru macOS nu este notarizată.

## Mai devreme: 0.8 și 0.8.1

Iată ce s-a schimbat în CivilCraft 0.8 (2026-11-01) și 0.8.1 (2026-11-02), comparativ cu 0.7. Părțile noi importante sunt unelte care testează nivelarea și amplasamentul (ploaia, terasamentele, traseele, bazinele, progresul) și șase ferestre de calcul pentru teren, drumuri, măsurători, mine, legături și cale ferată.

### Noutăți

**Testați nivelarea**

- **Fă să plouă.** {{ui:Fă să plouă…}} (sub {{ui:Model de teren}}) lasă o furtună pe terenul nivelat. Urmăriți apa scurgându-se de pe platforme, acumulându-se în colțurile joase și depășind bazinele prea mici. Rularea este animată și dă volumele, debitul maxim de evacuare și un CSV pentru fiecare bazin. Celula implicită este mare, astfel încât o primă privire este rapidă; o celulă mai fină este mai lentă. Bazinele care se depășesc apar și în panoul Probleme.
- **Echilibrarea terasamentelor.** {{ui:Echilibrare terasamente…}} ridică sau coboară o platformă până când debleul este egal cu rambleul și arată tabelul de transport între ele.
- **Cel mai bun traseu.** {{ui:Cel mai bun traseu…}}: alegeți un început și un sfârșit, iar CivilCraft găsește cel mai ieftin drum prin teren care respectă limitele de pantă și de curbură stabilite, apoi face din el un aliniament.
- **Bazine de retenție.** {{ui:Bazine de retenție…}} calculează cota și stocarea din teren, primește dispozitive de evacuare (orificiu, deversor, prag triunghiular, deversor de ape mari), rutează o furtună prin bazin și verifică debitul reținut, timpul de coborâre a nivelului și bordajul liber.
- **Progres din măsurători.** {{ui:Progres din măsurători…}} compară suprafețe obținute cu drona sau prin scanare, din date diferite, cu terenul de la acel moment și cu proiectul: procentul executat după volum, zonele săpate în exces și cele umplute în exces, depozitele de material și momentul în care se termină lucrarea în acest ritm (marcat ca estimare).

**Cunoașteți amplasamentul**

- **Adresă la amplasament.** {{ui:Adresă la amplasament…}} aliniază date deschise despre parcele, clădiri, zonare, sol, inundații și teren pe un singur amplasament. Amplasamentul se poate păstra în fișierul de proiect: adresa introdusă, fiecare sursă cu ziua în care a fost preluată și licența sa, și ce a venit înapoi. Deschiderea din nou sau partajarea proiectului păstrează amplasamentul, fără a mai prelua nimic. Se poate salva și ca fișier de amplasament sau trimite către BimCraft. Vedeți [Adresă la amplasament](topic:address-to-site).

**Teren, drumuri, măsurători, mine, legături și cale ferată**

- **Soluri și taluze.** {{ui:Soluri și taluze…}} trasează profilul solului între sondajele pe care le introduceți. Metoda Bishop caută apoi cercul critic pe teren, cu nivelul pânzei freatice, o supraîncărcare și un coeficient seismic; tasarea unei tălpi de fundare include consolidarea, tasarea imediată și timpul.
- **Intersecții și marcaje.** {{ui:Intersecții și marcaje…}} unește brațele cu racordări de bordură (o rază pe braț sau racordări cu trei centre), distanța de vizibilitate pentru viteza de proiectare, verificarea triunghiurilor de vizibilitate, treceri de pietoni, linii de oprire, marcaje și semne, cu un tabel al semnelor. Sunt desenate în plan și salvate ca .dxf, cu straturi denumite.
- **Compensare topografică.** {{ui:Compensare topografică…}} rulează o compensare prin cele mai mici pătrate a unei drumuiri sau rețele: coordonate compensate, elipse de eroare, testul chi-pătrat și un semnal pe măsurătoarea care nu se potrivește. Sunt incluse rețele libere, închiderea unei drumuiri prin regula busolei și fișiere de teren RW5, GSI, JobXML sau CSV, iar punctele compensate se salvează ca CSV.
- **Cariere.** {{ui:Cariere…}} transformă probele de foraj într-un model de bloc și în groapa finală, în unghiul pantei stabilit, cu raportul de decopertare, un tabel pe banc și o curbă a conținutului și tonajului. Există și groapa imbricată după factorul de venit și un program de producție cu flux de numerar actualizat.
- **Legături radio.** {{ui:Legături radio…}} verifică vizibilitatea liniei peste teren, cu bombarea Pământului, prima zonă Fresnel, bugetul legăturii, marja de atenuare și întreruperea prin trasee multiple, și dă înălțimea catargului care ar elibera traseul. Face și bugete de pierderi pe fibră, cantități pe traseu și vântul pe un turn.
- **Macazuri.** {{ui:Macazuri…}} face un macaz din numărul inimii sale, treceri între linii paralele și un gabarit al construcției înclinat prin deversare și lărgit pe o curbă. Un macaz poate fi plasat la un pichet al unui aliniament.

Vedeți [Soluri, intersecții, compensare topografică, cariere, legături radio și macazuri](topic:soils-roads-survey-mines-links).

### Corectate în 0.8.1

- **Secțiunea de clase DWG.** Era citită ca tip greșit (GitHub cadcraft#5). Corectată în CivilCraft, împreună cu CadCraft, BimCraft, ModelCraft și TakeoffCraft.
- **Schimbarea limbii în timpul rulării.** CadCraft Studio și edițiile împachetate pot schimba limba în timpul rulării. Înainte erau doar în engleză. Nu este încă testat pe toate platformele: semnalați-ne dacă limba nu se schimbă.

### Nu este încă în această versiune

- **Sunt instrumente de calcul.** Fiecare rezultat din ferestrele noi necesită verificarea unui inginer. Rezistențele solului pornesc de la valori tipice pentru grupa solului, iar fereastra o spune.
- **Fă să plouă.** O rulare pe amplasamentul de exemplu poate dura peste două minute în browser, cu o celulă fină. A fost verificată pe cazuri calculate manual și pe un bazin în V, dar nu încă pe un amplasament real nivelat.
- **Adresă la amplasament.** Citește fișierele de date deschise pe care le aduceți și a fost testată doar pe fișierele noastre. Copacii nu sunt o sursă. Preluarea automată a surselor așteaptă formularea privind confidențialitatea.
- **Progres din măsurători.** Testat doar pe măsurători inventate. Progresul pe planșe și pe adnotări (MarkupCraft) și compararea scanării cu modelul (BimCraft) nu sunt construite.
- **Soluri și taluze.** Doar suprafețe circulare: fără căutare pe pană sau pe bloc și fără fisură de tracțiune.
- **Intersecții.** O rază pe braț, fără traiectorii de giratie ale camioanelor, iar acestea nu intră încă în coridor.
- **Fișiere de teren.** Cititoarele au fost scrise după descrieri publice ale formatelor și încercate pe fișiere pe care le-am făcut. Sunt necesare fișiere reale de la instrumente.
- **Legături și cale ferată.** Legături radio: doar pierderea în spațiu liber și trasee multiple (fără atenuare prin ploaie sau diagrame ale antenei), iar niciun standard feroviar: fiecare limită feroviară este provizorie, cu cifre de lucru pe care niciun inginer feroviar nu le-a verificat.
- **Windows și macOS.** 0.8 nu este semnată digital. Windows poate avertiza, iar macOS cere clic dreapta, apoi Deschidere.

Restul se află în [Încă nerealizat](topic:not-built-yet). Pentru versiunea anterioară, vedeți [Ce este nou în 0.7](topic:whats-new-0-7).
