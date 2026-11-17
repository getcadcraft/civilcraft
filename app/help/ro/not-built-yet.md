---
title: Încă nerealizat
summary: Ce nu face încă această versiune a CivilCraft și ce să faceți în schimb, astăzi.
keywords: lipsă, limitări, plan de viitor, indisponibil, spirale, lărgiri, dwg, dxf, guri de scurgere, reținere, secțiuni transversale, vine mai târziu, limite
from: a2d970ef
---

CivilCraft este la început. Această pagină listează ce nu face versiunea actuală, ca să nu le căutați. Nimic de aici nu are o dată promisă.

## Puncte

| Încă nerealizat | În schimb, astăzi |
|---|---|
| Adăugarea unui al doilea fișier de puncte la primul | Uniți fișierele într-un editor de text sau într-o foaie de calcul, mai întâi |
| Exportul unui fișier text de puncte | Exportați LandXML (punctele ies ca CgPoints), folosiți {{ui:Export}} GIS (puncte cu câmpurile P, N, E, Z și D), sau {{ui:Copiere}} punctele într-o foaie de calcul |
| Stiluri de etichete de puncte, simboluri pe cheie de descriere, curbe (arce) din coduri de linii, un fișier cu cheia de descriere de partajat între proiecte | Etichetele arată numărul, cota și descrierea, sau mai puțin ([Setările CivilCraft](topic:settings)); cheile se păstrează în fișierul proiectului |
| Conversia unităților | Convertiți fișierul înainte de import; **Unități** doar reetichetează |

## Modele de teren

| Încă nerealizat | În schimb, astăzi |
|---|---|
| Mai mult de un model de teren construit din puncte | Un proiect pentru fiecare model de teren |
| Ascunderea conturilor (interioare) | Folosiți **Cea mai lungă muchie exterioară** sau un contur exterior |
| Selectarea sau editarea unei singure linii de rupere desenate | {{key:Mod+Z}}, sau {{ui:Eliminare linii de rupere desenate}} și desenați din nou |
| Editarea unui model de teren citit din LandXML (linii de rupere, contur) | {{ui:Reconstruire model de teren din puncte}} |
| Editarea unui model de teren făcut dintr-o rețea de cote | Importați din nou rețeaua, cu alte opțiuni |
| Convertirea unui model de teren citit din LandXML când se schimbă sistemul de coordonate | {{ui:Reconstruire model de teren din puncte}}, mai întâi |
| Cote punctuale etichetate și valori de pantă | Citiți-le în bara de stare, sau colorați modelul de teren după pantă cu **Analiza pantei** din spațiul de lucru Peisaj ([Sistematizare pentru peisaj](topic:landscape-grading#grading-checks)) |

## Trasee și profile

| Încă nerealizat | În schimb, astăzi |
|---|---|
| Spirale altele decât clotoida; o spirală între două curbe (tranziții compuse) | Spiralele clotoide la capetele unei curbe sunt disponibile; celelalte sunt numite și omise la importul LandXML |
| Inserarea unui PI între alte două | Redesenați traseul, sau reintroduceți coordonatele PI |
| Trasee din obiecte, decalaje, lărgiri | Desenați prin PI |
| Tastarea lui K pentru o curbă verticală | Tastați L (K este afișat) |
| Curbe verticale circulare și nesimetrice | Doar curbe parabolice simetrice |
| Mai mult de un profil de proiectare pe traseu | Un traseu pentru fiecare variantă |
| Zoom în vederea profilului, benzi de profil sub profil | Vederea profilului cuprinde întregul traseu; trasați-l pe [planuri și profile de situație](topic:plan-profile-sheets) |
| Secțiuni în DWG sau LandXML | Foi de secțiuni ca PDF; {{ui:CSV}} al suprafețelor și volumelor |
| Linii de profil sub un unghi, sau de lățimi diferite de-a lungul drumului | O lățime pe fiecare parte, pentru tot traseul |

## Coridoare

| Încă nerealizat | În schimb, astăzi |
|---|---|
| Separatoare centrale, parapete și o supraînălțare care rotește șabloanele | Desenați-le ca șabloane ([Șabloane de coridor](topic:corridor-templates)); șabloanele pe stație nu țin încă cont de supraînălțare |
| O schimbare treptată între șabloanele a două regiuni (tranziții, conicități) | Schimbați șablonul la o stație, sau dați unui punct o țintă de lățime, pe o linie desenată ca tranziție |
| Rotire în jurul unei muchii, supraînălțare în LandXML | Supraînălțarea se rotește în jurul axului pe curbe circulare; lărgiți o bandă cu o țintă de lățime pe o linie caracteristică |
| Ținte pentru taluzurile laterale (intersecția cu terenul până la o linie sau o suprafață), suprafețe proprii de coridor | Țintele mută marginile părții carosabile și ale acostamentelor ([Coridoare](topic:corridor)); coridorul este sistematizat în modelul de teren proiectat |
| Coridoare exportate ca drumuri LandXML; un al doilea coridor pe un traseu în exportul IFC | Se exportă modelul de teren proiectat |
| Șabloane de teren care modifică modelul proiectat, în 3D sau în secțiuni | Ele dau suprafețele și volumele fiecărui strat ([Șabloane de teren](topic:corridor-templates#terrain-templates)) |
| Traiectorii de rulare cu viteză, derapaj al anvelopelor, timp de direcție, remorci sau gabarit; o bibliotecă de vehicule standard de proiectare; o traiectorie desenată prin tragerea vehiculului | Traiectorii de rulare la viteză mică de-a lungul unei linii caracteristice sau al unui traseu, cu dimensiunile propriilor vehicule ([Traiectorii de rulare ale vehiculelor](topic:swept-paths)) |

## Sistematizare și volume

| Încă nerealizat | În schimb, astăzi |
|---|---|
| Banchete, linii caracteristice deschise sistematizate în proiect, sistematizare până la o linie caracteristică din altă parte | Închideți linia caracteristică ([Linii caracteristice](topic:feature-lines)), sau folosiți-o ca linie de rupere a terenului existent |
| Inserarea sau eliminarea unui vârf al unei linii caracteristice | Desenați din nou linia, sau faceți un decalaj în trepte al acesteia |
| Arce în liniile de rupere desenate (prin puncte topografice), spirale în liniile caracteristice | Desenați o linie caracteristică cu arce și folosiți-o ca linie de rupere a terenului existent |
| Sistematizare până la o distanță, o cotă sau o altă suprafață | Intersecție doar cu terenul existent |
| Adăugarea sau eliminarea unui colț de platformă | Ștergeți platforma și desenați-o din nou |
| Volume TIN-la-TIN (prismatice), alegerea dimensiunii celulei rețelei | Metoda rețelei, cu dimensiunea celulei aleasă pentru dvs. |
| Umflare și contracție, stratul vegetal, grosimea straturilor de carosabil | Aplicați singuri factorii asupra cifrelor raportate |
| Costuri de transport liber și de supratransport, transport între trasee diferite, cariere de împrumut și depozite amplasate pe plan | Diagrama masei de transport cu puncte de echilibru, volumele deplasate și distanțele medii de transport |

## Rețele de conducte

| Încă nerealizat | În schimb, astăzi |
|---|---|
| Mai mult de o rețea pe proiect | Proiecte separate pentru {{ui:Pluvial}} și pentru {{ui:Menajeră}} |
| Conducte de apă: calitatea și vârsta apei, comenzi pe bază de reguli, alte tipuri de robinete (de control al debitului, de strangulare, de menținere), pompe date prin putere, cerere care depinde de presiune, opțiunea Darcy–Weisbach, un catalog de țevi cu grosimi de perete și clase de presiune. Restul rețelelor sub presiune este în laborator: [Conducte de apă](topic:water-mains) | Verificați-le în software-ul de distribuție a apei; debitele de proiectare menajere sunt în [Debitele de proiectare menajere](topic:sanitary-design) |
| Debite de canalizare în timp (hidrograme, rutare dinamică, stocare, pompe, deversări) | [Debitele de proiectare menajere](topic:sanitary-design) dă debitul maxim constant folosit de o foaie de proiectare |
| Capacitatea gurii de scurgere, răspândirea în rigolă, rutarea reținerii, hidrograme, pierderi de energie altele decât un coeficient de joncțiune | Verificați-le în alt software; debitele, dimensiunile și liniile piezometrice sunt în [Drenaj pluvial](topic:storm-drainage) |
| Bazine de colectare în trasarea PDF, DWG, DXF sau LandXML; bazine din modelul de teren (bazine hidrografice) | Desenați bazinele manual; sunt salvate în fișierul proiectului |
| Cataloage de țevi, țevi necirculare, structuri care nu sunt cutii sau cilindri verticali (conuri, trepte, banchete), o categorie de drenaj în bibliotecă | Tipuri de structuri din parametri ([Rețea de conducte](topic:pipe-network)); țevi cu un diametru |
| Conducte în vederea profilului, conducte curbe | Citiți radierele și acoperirea în panoul din dreapta |

## Parcele

| Încă nerealizat | În schimb, astăzi |
|---|---|
| Amplasarea loturilor după suprafață sau front, parcele din liniile din jur, dreptul de trecere | Desenați fiecare parcelă după colțurile ei, sau introduceți laturile ei |
| Tabele de curbe și tabele de linii pe plan; etichete mutate manual | Fiecare latură este etichetată de-a lungul ei |
| Parcele în LandXML | Parcelele sunt salvate în fișierul proiectului și merg în PDF, DWG și DXF |

## Drumuiri

| Încă nerealizat | În schimb, astăzi |
|---|---|
| Compensare prin metoda celor mai mici pătrate, regula tranzitului, ponderarea unghiurilor în funcție de distanțe | Regula busolei |
| Unghiuri de deviație, unghiuri zenitale și distanțe înclinate, cote prin nivelment trigonometric | Reduceți corect la distanțe și unghiuri orizontale, sau la orientări |
| Vize laterale, fișiere de date brute de la colectoarele de date | Importați punctele ca fișier de puncte |

## Trasare pe teren

| Încă nerealizat | În schimb, astăzi |
|---|---|
| Țăruși decalați (puncte de referință retrase de la țăruș), țăruși de taluz în punctul de intersecție | Trasați țăruși la decalajele de care aveți nevoie, inclusiv dincolo de acostament |
| Trimiterea țărușilor direct în formatul propriu al unui colector de date | Fișierul CSV se deschide în software-ul de birou al majorității colectoarelor de date |
| Trasarea conductelor, platformelor și parcelelor | Folosiți puncte topografice lângă un traseu, sau laturile parcelei |

## Fișiere și ieșiri

| Încă nerealizat | În schimb, astăzi |
|---|---|
| Text, hașuri și cote din DWG sau DXF; spațiu hârtie; desene legate (xref); DXF binar | Liniile din spațiul model se deschid ([Deschiderea unui DWG sau DXF ca linii](topic:open-dwg-dxf)); deschideți desenele legate separat |
| Mutarea mai multor puncte deodată prin tragere | Tăiați și lipiți-le, sau editați-le pe rând |
| Foi pe înălțime, cartușe proprii, ferestre de vizualizare aranjate de dvs., foi de plan și profil în DWG | O foaie de plan pe orizontală pentru fiecare PDF, sau foi de plan și profil de-a lungul unui traseu (PDF) |
| Trasarea benzilor de cote și a profilelor | Benzile sunt doar pe ecran; faceți o captură de ecran dacă aveți nevoie de ele |
| Schimbarea denumirilor straturilor, culorilor sau stilurilor de etichete | Schimbați-le într-un program CAD după exportul DXF |
| Salvarea în cloud și istoricul versiunilor | Salvați fișierele `.civilcraft.json` și păstrați copii de siguranță; pentru a lucra împreună la un proiect, folosiți o sesiune live în CadCraft Studio ([Proiectați un amplasament împreună, live](topic:work-live)) |
| CadCraft Studio pentru iPad și iPhone, și din Google Play | Folosiți CivilCraft în browser pe dispozitiv; pe Android, CadCraft Studio se instalează din fișierul APK de pe getcadcraft.com/download |
| Deschiderea mai multor fișiere de puncte sau de proiect deodată | Un fișier pe deschidere (fișierele GIS care aparțin împreună, precum părțile unui shapefile, se deschid împreună) |

## Peisaj

| Încă nerealizat | În schimb, astăzi |
|---|---|
| Capete și duze ale producătorilor | Capete generice, sau adăugați propriile capete dintr-un fișier; datele producătorilor vin pe măsură ce își dau acordul |
| Lungimi laterale maxime pentru linii de picurare, debite în timp, pompe, rețele de conducte în buclă | Păstrați traseele de picurare la lungimea publicată de producător; verificarea necesită o rețea ramificată |
| Conturul exact al unui obiect liber concav; volumul său sub nivelul solului, măsurat exact | Înfășurătoarea convexă este sistematizată, iar volumul sub sol este o estimare (indicată în Proprietăți) |
| Plante în funcția proprie Plasare din bibliotecă a BimCraft și ModelCraft | Exportați IFC de peisaj și deschideți-l în BimCraft lângă clădire |
| Modele detaliate de plante (frunze, ramuri, anotimpuri) în vederea 3D; obiecte libere și irigație în vederea 3D | Plantele apar în 3D ca forme simple, dimensionate după lista de plante ([Vizualizați amplasamentul în 3D](topic:site-3d)); împrăștierea din ModelCraft face imagini cu plantări |
| Ziduri de hardscape care rețin un nivel sistematizat în spatele lor, pe suprafață | Dați unei platforme sau unui pad laturi verticale: sunt ziduri de sprijin pe suprafață ([Sistematizare](topic:grading)) |
| Transformări SVG în simbolurile proprii; texturi și culori ale propriilor modele de plante GLB; geometrie GLB comprimată | Aplatizați transformările în programul de desen mai întâi; modelele sunt desenate în culoarea plantei; exportați GLB fără compresie ([Grafica plantelor](topic:plant-graphics)) |
| Lista proprie de plante păstrată în contul dvs. din bibliotecă (editată în aplicație) | Editați lista proprie a proiectului în tabelul Plante și salvați-o ca fișier de plante |
| Uneltele de peisaj pentru asistenți fără fereastră (serverul de fișiere și linia de comandă) | Lucrează cu fereastra CivilCraft deschisă ([Lăsați un asistent AI să lucreze cu amplasamentul dvs.](topic:assistants)) |

## Linii electrice

| Încă nerealizat | În schimb, astăzi |
|---|---|
| Standardul unei țări, încorporat (ipoteze de încărcare, distanțe de siguranță, factori) | Setați valorile standardului în {{ui:Ipoteze de încărcare și limite…}} și salvați-le, împreună cu biblioteca, ca pachet de reutilizat și partajat ([Pachete](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Distanța laterală de la un conductor până la coroana unui copac sau până la un perete lângă linie | Distanța de siguranță verticală deasupra plantelor și zidurilor pe care le traversează linia ([Verificări ale liniilor electrice](topic:power-line-checks#clearances)) |
| Fluajul conductorului și alungirea unui conductor nou | Țineți cont de ele prin temperaturile din tabelul de întindere |
| Capacitatea termică a cablurilor îngropate (capacitatea de curent din modul de pozare) | Introduceți capacitatea de curent a furnizorului pe elementul de cablu |
| Studii de scurtcircuit, protecție și împământare | Folosiți un program electric dedicat; CivilCraft oferă lungimile rețelei și cablurile |
| Stâlpi cu zăbrele proiectați bară cu bară și ancore de haubane în sol | Stâlpii sunt verificați după sarcina nominală; haubanele după sarcina lor nominală |
| Un fișier de studiu `.DON` verificat în programul care îl citește | Verificați fișierul acolo; trimiteți-ne un exemplu ca să putem testa pe unul real |
| Linii electrice în vederea 3D și în IFC | Planul, profilul liniei, foile și straturile GIS |
| Uneltele pentru linii electrice pentru asistenți fără fereastră | Lucrează cu fereastra CivilCraft deschisă ([Lăsați un asistent AI să lucreze cu amplasamentul dvs.](topic:assistants)) |

## Volume de clădiri

| Încă nerealizat | În schimb, astăzi |
|---|---|
| O bibliotecă de coduri de urbanism sau reguli ale oricărui oraș | Introduceți limitele din regulamentul propriu ([Limite de urbanism](topic:zoning-limits)) |
| Lumina cerului pe pereți (iluminarea naturală a fațadei), vântul | [Orele de soare](topic:sun-hours) numără doar soarele direct |
| Umbra din copaci, plante sau orice nu este desenat ca volum | Desenați clădirile vecine ca volume |
| Forme de acoperiș pe volume | Volume cu vârf plat |
| Goluri, acoperișuri și tipuri de pereți când un volum este dezvoltat în BimCraft | BimCraft construiește pereți exteriori simpli pe fiecare nivel și un planșeu; adăugați restul acolo |

## GIS și sisteme de coordonate

| Încă nerealizat | În schimb, astăzi |
|---|---|
| File Geodatabase; stiluri KML, pictograme, suprapuneri de teren și legături de rețea | Convertiți mai întâi în GeoPackage, shapefile sau GeoJSON; reperele KML se citesc fără stilurile lor |
| Editarea entităților GIS sau a atributelor lor | Editați-le într-un program GIS și importați din nou. Panoul Analiză face straturi noi (zonă tampon, suprapunere, îmbinare, selecție) și adaugă câmpuri de arie și lungime, dar nu editează o entitate pe loc |
| Analiza rețelei și a rasterului, zone tampon cu capete plate sau pătrate și zone tampon pe o singură parte, adăugarea sau ștergerea rândurilor și schimbarea tipului unui câmp în tabelul de atribute, culori manuale pe clase, o legendă de stil în trasări | Folosiți {{ui:Selectare}} pentru a alege entități și a face un strat din ele; capetele plate nu sunt oferite. Colorarea după atribut și tabelul de atribute sunt realizate: vedeți [Stilizarea unui strat după un atribut](topic:gis-symbology) și [Lucrul cu tabelul de atribute al unui strat](topic:gis-table) |
| Stiluri de etichete (mărime, plasare) și etichete care se evită reciproc | Etichetele au o singură mărime și se pot suprapune acolo unde entitățile sunt dense |
| Datumuri verticale și modele de geoid | Cotele sunt folosite așa cum le dă fișierul; verificați singuri datumul vertical |
| Deplasări de rețea altele decât la NAD83 din NAD27, sugerate după zonă (OSTN15; NTv2 pentru alte datumuri funcționează când adăugați fișierul), mai multe rețele deodată, rețele verticale | Adăugați singuri fișierul rețelei pentru datumul dvs.; o rețea pe proiect |
| Straturi de hartă în exporturile DXF sau 3D | Straturile de hartă intră în trasarea PDF și, lângă DWG, ca imagine |
| Servere de hărți care cer autentificare, cheie sau token | Folosiți servicii publice, sau un fișier imagine georeferențiat |
| Scrierea fișierelor LAS sau LAZ dintr-un model de teren, din uneltele de rețea de cote sau LiDAR | Exportați modelele de teren ca rețea de cote GeoTIFF. Suplimentul [Nori de puncte](topic:point-clouds) scrie un nor curățat ca LAS 1.4 sau LAZ |
| Intensitatea, culoarea și ecourile LiDAR; rețele de cote cu mai multe benzi; fișiere de rețea sau LiDAR de peste 200 MB | LiDAR este filtrat doar după clasă, iar rețelele folosesc prima bandă; tăiați fișierele mari în plăci mai întâi |

## Date de intrare

| Încă nerealizat | În schimb, astăzi |
|---|---|
| Selecție cu casetă prin atingere (necesită {{key:Shift}}) | Apăsați lung pe fiecare punct topografic ca să îl adăugați |
| Coordonate sau distanțe tastate în timpul desenării | Desenați aproximativ, apoi tastați coordonatele exacte ale PI în tabelul PI al traseului |
| Tastarea coordonatelor colțurilor de platformă și a structurilor | Trageți mânerele lor; măriți pentru precizie și urmăriți E și N în bara de stare |
| Agățarea de obiecte (altele decât punctele topografice pentru liniile de rupere) | Măriți și urmăriți bara de stare |

## Vederea 3D

| Încă nerealizat | În schimb, astăzi |
|---|---|
| Desenarea sau editarea în vederea 3D | Desenați și editați în plan; vederea 3D urmărește fiecare modificare |
| Selectarea liniilor caracteristice ale coridorului sau a entităților GIS prin clic în 3D | Faceți clic pe ele în plan |
| Exportul vederii exagerate sau în picioare | Exporturile sunt la scară reală, în metri; vedeți [Exportul amplasamentului în 3D](topic:export-3d) |
| Etichete în exporturile GLB sau OBJ, mărimi și stiluri de etichete în 3D | Etichetele apar doar în vederea 3D, cu o singură mărime; vedeți [Vizualizarea amplasamentului în 3D](topic:site-3d) |
| Texturi din fotografii, înregistrarea parcurgerii traseului ca video, umbre din afara amplasamentului, orele de soare afișate în vederea 3D | Straturile de hartă așezate pe suprafețe; parcurgerea și poziția soarelui la un moment dat; [orele de soare](topic:sun-hours) pentru o zi sau un anotimp, pe plan |
