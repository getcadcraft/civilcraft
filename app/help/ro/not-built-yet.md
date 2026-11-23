---
title: Încă nerealizat
summary: Ce nu face această versiune a CivilCraft încă și ce să faceți în schimb, astăzi.
keywords: lipsă, limitări, plan de viitor, nedisponibil, spirale, lărgire, dwg, dxf, guri de scurgere, bazine de retenție, secțiuni transversale, vine ulterior, limite
from: b91588d4
---

CivilCraft este la început. Această pagină listează ce nu face versiunea actuală, ca să nu le căutați. Nimic de aici nu are o dată promisă.

## Puncte

| Încă nerealizat | În schimb, astăzi |
|---|---|
| Adăugarea unui al doilea fișier de puncte la primul | Uniți mai întâi fișierele într-un editor de text sau o foaie de calcul |
| Exportul unui fișier text de puncte | Exportați LandXML (punctele ies ca CgPoints), folosiți GIS {{ui:Export}} (puncte cu câmpurile P, N, E, Z și D) sau {{ui:Copiere}} punctele într-o foaie de calcul |
| Stiluri pentru etichetele punctelor, simboluri pe cheia de descriere, curbe (arce) din codurile de linie, un fișier cu cheia de descriere de partajat între proiecte | Etichetele arată numărul, cota și descrierea, sau mai puțin ([Setările CivilCraft](topic:settings)); cheile se păstrează în fișierul de proiect |
| Conversia unităților | Convertiți fișierul înainte de import; **Unități** doar reetichetează |

## Suprafețe

| Încă nerealizat | În schimb, astăzi |
|---|---|
| Mai multe suprafețe construite din puncte | Un proiect pentru fiecare suprafață |
| Ascunderea limitelor (interioare) | Folosiți **Cea mai lungă muchie exterioară** sau o limită exterioară |
| Selectarea sau editarea unei linii de rupere desenate | {{key:Mod+Z}}, sau {{ui:Eliminare linii de rupere desenate}} și desenați din nou |
| Editarea unei suprafețe citite din LandXML (linii de rupere, limită) | {{ui:Reconstruire model de teren din puncte}} |
| Editarea unei suprafețe făcute dintr-o rețea de cote | Importați din nou rețeaua cu alte opțiuni |
| Convertirea unei suprafețe citite din LandXML când se schimbă sistemul de coordonate | Mai întâi {{ui:Reconstruire model de teren din puncte}} |
| Cote punctuale etichetate și valori ale pantei | Citiți-le în bara de stare, sau colorați suprafața după pantă cu **Analiza pantei** din spațiul de lucru Peisaj ([Nivelarea pentru peisaj](topic:landscape-grading#grading-checks)) |

## Aliniamente și profile

| Încă nerealizat | În schimb, astăzi |
|---|---|
| Clotoide altele decât clotoida; o clotoidă între două curbe (tranziții compuse) | Clotoidele de la capetele unei curbe sunt disponibile; celelalte sunt numite și omise la importul LandXML |
| Inserarea unui PI între două altele | Desenați din nou aliniamentul sau reintroduceți coordonatele PI |
| Aliniamente din obiecte, decalaje, lărgiri | Desenați prin PI |
| Introducerea lui K pentru o curbă verticală | Introduceți L (K este afișat) |
| Curbe verticale circulare și nesimetrice | Doar curbe parabolice simetrice |
| Mai multe profiluri de proiectare pe aliniament | Un aliniament pentru fiecare variantă |
| Zoom în vizualizarea profilului, benzi de profil sub profil | Vizualizarea profilului se potrivește pe întregul aliniament; trasați-o pe [planșe de plan și profil](topic:plan-profile-sheets) |
| Secțiuni în DWG sau LandXML | Planșe de secțiuni ca PDF; {{ui:CSV}} al ariilor și volumelor |
| Linii de profil înclinate sau de lățimi diferite de-a lungul drumului | O lățime pe fiecare parte pentru tot aliniamentul |

## Coridoare

| Încă nerealizat | În schimb, astăzi |
|---|---|
| Separatoare centrale, bariere și un dever care rotește șabloanele | Desenați-le ca șabloane ([Șabloane de coridor](topic:corridor-templates)); șabloanele pe kilometraj nu preiau încă devers |
| O schimbare treptată între șabloanele a două regiuni (tranziții, conicități) | Schimbați șablonul la un pichet sau dați unui punct o țintă de lățime până la o linie desenată ca o conicitate |
| Rotire în jurul unei margini, devers în LandXML | Deversul se rotește în jurul axului pe curbe circulare; lărgiți o bandă cu o țintă de lățime până la o linie caracteristică |
| Ținte pentru pantele laterale (intersecția cu terenul până la o linie sau o suprafață), suprafețe proprii ale coridoarelor | Țintele mută marginile părților carosabile și ale acostamentelor ([Coridoare](topic:corridor)); coridorul este nivelat în suprafața proiectată |
| Racordări de bordură, benzi de virare și insule nivelate într-o intersecție; capătul unui drum lateral tăiat până la marginea drumului principal pe o înclinație; o alee îmbinată cu un drum în plan, în lungimea și aria sa | Drumurile care se întâlnesc sunt îmbinate drept, cu marginea drumului principal deschisă și drumul lateral racordat la aceasta ([Unde se întâlnesc drumurile](topic:corridor#where-roads-meet-roads-pads-and-paths)); o alee se oprește la marginea drumului în suprafața proiectată și în 3D |
| Coridoare exportate ca drumuri LandXML; un al doilea coridor pe un aliniament în exportul IFC | Se exportă suprafața proiectată |
| Șabloane de teren care modifică suprafața proiectată, în 3D sau în secțiuni | Ele dau ariile și volumele fiecărui strat ([Șabloane de teren](topic:corridor-templates#terrain-templates)) |
| Traiectorii de giratie cu viteză, derapaj al pneurilor, timp de direcție, remorci cu direcție sau gabarit al caroseriei; o bibliotecă de vehicule standard de proiectare; o traiectorie trasată prin tragerea vehiculului | Traiectorii de giratie la viteză mică de-a lungul unei linii caracteristice sau al unui aliniament, cu dimensiunile propriilor vehicule ([Traiectorii de giratie ale vehiculelor](topic:swept-paths)) |

## Nivelare și volume

| Încă nerealizat | În schimb, astăzi |
|---|---|
| Banchete, linii caracteristice deschise nivelate în proiect, nivelare până la o linie caracteristică din altă parte | Închideți linia caracteristică ([Linii caracteristice](topic:feature-lines)) sau folosiți-o ca linie de rupere a terenului existent |
| Inserarea sau eliminarea unui vârf al liniei caracteristice | Desenați din nou linia sau faceți un decalaj în trepte al acesteia |
| Arce în liniile de rupere desenate (prin puncte topografice), clotoide în liniile caracteristice | Desenați o linie caracteristică cu arce și folosiți-o ca linie de rupere a terenului existent |
| Nivelare până la o distanță, cotă sau altă suprafață | Doar intersecția cu terenul existent |
| Adăugarea sau eliminarea unui colț de platformă | Ștergeți platforma și desenați-o din nou |
| Volume TIN-la-TIN (prismatice), alegerea dimensiunii celulei rețelei | Metoda rețelei, cu dimensiunea celulei stabilită de program |
| Umflare și contracție, stratul vegetal, adâncimile îmbrăcămintei | Aplicați singuri factorii la cifrele raportate |
| Costuri de transport liber și de transport suplimentar, transport între aliniamente diferite, zone de împrumut și depozite plasate în plan | Diagrama maselor cu puncte de echilibru, volume deplasate și distanțe medii de transport |

## Rețele de conducte

| Încă nerealizat | În schimb, astăzi |
|---|---|
| Mai multe rețele pe proiect | Proiecte separate pentru ape pluviale și menajere |
| Conducte de apă: calitatea și vârsta apei, comenzi pe bază de reguli, alte tipuri de vane (de control al debitului, de strangulare, de menținere a presiunii), pompe date prin putere, cerere care depinde de presiune, o opțiune Darcy–Weisbach, un catalog de conducte cu grosimi de perete și clase de presiune. Restul rețelelor sub presiune este în laborator: [Conducte de apă](topic:water-mains) | Verificați acestea în programe de distribuție a apei; debitele de proiectare menajere sunt în [Debite de proiectare menajere](topic:sanitary-design) |
| Debitele canalizării în timp (hidrograme, rutare dinamică, stocare, pompe, deversări) | [Debite de proiectare menajere](topic:sanitary-design) dă debitul de vârf constant pe care îl folosește o planșă de proiectare |
| Capacitatea gurilor de scurgere, răspândirea în rigolă, rutarea retenției, hidrogramele, pierderile de energie în afara unui singur coeficient de intersecție | Verificați-le în alte programe; debitele, dimensiunile și liniile de pantă sunt în [Scurgerea apelor pluviale](topic:storm-drainage) |
| Bazinele de colectare în trasarea PDF, DWG, DXF sau LandXML; bazine de colectare din suprafață (bazine hidrografice) | Desenați bazinele manual; ele se salvează în fișierul de proiect |
| Cataloage de conducte, conducte necirculare, structuri care nu sunt cutii verticale sau cilindri (conuri, trepte, banchetare), o categorie de drenaj în bibliotecă | Tipuri de structuri din parametri ([Rețea de conducte](topic:pipe-network)); conducte cu diametru |
| Conducte în vizualizarea profilului, conducte curbe | Citiți radierele și adâncimea de îngropare în panoul din dreapta |

## Parcele

| Încă nerealizat | În schimb, astăzi |
|---|---|
| Trasarea loturilor după suprafață sau front, parcele din liniile din jurul lor, dreptul de trecere | Desenați fiecare parcelă după colțurile sale sau introduceți segmentele descrierii sale |
| Tabele de curbe și tabele de linii în plan; etichete mutate manual | Fiecare segment este etichetat de-a lungul său |
| Parcele în LandXML | Parcelele se salvează în fișierul de proiect și merg în PDF, DWG și DXF |

## Drumuiri

| Încă nerealizat | În schimb, astăzi |
|---|---|
| Compensare prin metoda celor mai mici pătrate, regula tranzitului, ponderarea unghiurilor în raport cu distanțele | Regula busolei |
| Unghiuri de deviație, unghiuri zenitale și distanțe înclinate, cote prin nivelment trigonometric | Reduceți la distanțe și unghiuri orizontale corecte, sau la orientări |
| Vize laterale, fișiere de date brute de la colectoare de date | Importați punctele ca fișier de puncte |

## Trasare pe teren

| Încă nerealizat | În schimb, astăzi |
|---|---|
| Țăruși de decalaj (puncte de referință retrase de țăruș), țăruși de pantă la punctul de intersecție cu terenul | Trasați țăruși la decalajele de care aveți nevoie, inclusiv dincolo de acostament |
| Trimiterea țărușilor direct în formatul propriu al unui colector de date | CSV-ul se deschide în programele de birou ale majorității colectoarelor de date |
| Trasarea conductelor, platformelor și parcelelor | Folosiți puncte topografice lângă un aliniament, sau segmentele parcelei |

## Fișiere și ieșiri

| Încă nerealizat | În schimb, astăzi |
|---|---|
| Text, hașuri și cote din DWG sau DXF; spațiul hârtiei; desene legate (xref); DXF binar | Liniile din spațiul model se deschid ([Deschiderea unui DWG sau DXF ca linii](topic:open-dwg-dxf)); deschideți desenele legate separat |
| Mutarea mai multor puncte simultan prin tragere | Tăiați și lipiți-le sau editați-le pe rând |
| Planșe pe verticală, cartușe proprii, ferestre de vizualizare aranjate, planșe de plan și profil în DWG | O planșă de plan pe orizontală pentru fiecare PDF, sau planșe de plan și profil de-a lungul unui aliniament (PDF) |
| Trasarea benzilor de cote și a profilelor | Benzile sunt doar pe ecran; faceți o captură de ecran dacă aveți nevoie de ele |
| Schimbarea numelor de straturi, a culorilor sau a stilurilor etichetelor | Schimbați-le într-un program CAD după exportul DXF |
| Salvarea în cloud și istoricul versiunilor | Salvați fișierele `.civilcraft.json` și păstrați-le copiate; pentru a lucra la un proiect împreună, folosiți o sesiune live în CadCraft Studio ([Proiectarea unui amplasament împreună, live](topic:work-live)) |
| CadCraft Studio pentru iPad și iPhone, și din Google Play | Folosiți CivilCraft în browser pe dispozitiv; pe Android, CadCraft Studio se instalează din APK-ul de pe getcadcraft.com/download |
| Deschiderea mai multor fișiere de puncte sau de proiect simultan | Un fișier pe deschidere (fișierele GIS care aparțin împreună, precum părțile unui shapefile, se deschid împreună) |

## Peisaj

| Încă nerealizat | În schimb, astăzi |
|---|---|
| Capetele și duzele producătorilor | Capete generice sau capete proprii dintr-un fișier; datele producătorilor intră pe măsură ce își dau acordul |
| Lungimi laterale maxime pentru liniile de picurare, debite în timp, pompe, rețele de conducte în buclă | Păstrați traseele de picurare la lungimea publicată de producător; verificarea necesită o rețea ramificată |
| Conturul exact al unui obiect liber concav; volumul său sub teren măsurat exact | Se nivelează înfășurătoarea convexă, iar volumul sub teren este o estimare (spus în Proprietăți) |
| Plantele din funcția proprie Plasare din bibliotecă a BimCraft și ModelCraft | Exportați IFC peisagistic și deschideți-l în BimCraft lângă clădire |
| Modele detaliate de plante (frunze, ramuri, anotimpuri) în vizualizarea 3D; obiecte libere și irigație în vizualizarea 3D | Plantele apar în 3D ca forme simple dimensionate după lista plantelor ([Vizualizarea amplasamentului în 3D](topic:site-3d)); dispersia din ModelCraft face imagini de plantare |
| Zidurile de amenajare dură care rețin un nivel nivelat în spatele lor pe suprafață | Dați unei platforme laturi verticale: ele sunt ziduri de sprijin pe suprafață ([Nivelare](topic:grading)) |
| Transformări SVG în propriile simboluri; texturi și culori ale propriilor modele de plante GLB; geometrie GLB comprimată | Aplatizați transformările în programul de desen mai întâi; modelele sunt desenate în culoarea plantei; exportați GLB fără compresie ([Grafica plantelor](topic:plant-graphics)) |
| Lista proprie de plante păstrată în contul de bibliotecă (editată în aplicație) | Editați lista proprie a proiectului din tabelul Plante și salvați-o ca fișier de plante |
| Uneltele de peisaj pentru asistenți fără fereastră (serverul de fișiere și linia de comandă) | Funcționează cu fereastra CivilCraft deschisă ([Lăsați un asistent AI să lucreze cu amplasamentul](topic:assistants)) |

## Linii electrice

| Încă nerealizat | În schimb, astăzi |
|---|---|
| Un standard al unei țări încorporat (ipoteze de încărcare, distanțe, coeficienți) | Setați valorile standardului în {{ui:Ipoteze de încărcare și limite…}} și salvați-le, cu biblioteca, ca pachet de reutilizat și de partajat ([Pachete](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Distanța laterală de la un conductor la coroana unui arbore sau la un zid de lângă linie | Distanța verticală directă deasupra plantelor și zidurilor pe care le traversează linia ([Verificări ale liniilor electrice](topic:power-line-checks#clearances)) |
| Fluajul conductorului și alungirea unui conductor nou | Țineți cont de acestea prin temperaturile din tabelul de întindere |
| Capacitatea termică a cablurilor îngropate (capacitatea de curent din modul de pozare) | Introduceți capacitatea de curent a furnizorului pe articolul cablului |
| Studii de scurtcircuit, protecție și împământare | Folosiți un program electric dedicat; CivilCraft dă lungimile și cablurile rețelei |
| Stâlpi cu zăbrele proiectați bară cu bară și ancore de hobane în sol | Suporturile se verifică după sarcina lor nominală; hobanele după sarcina lor admisă |
| Un fișier de studiu `.DON` verificat în programul care îl citește | Verificați fișierul acolo; trimiteți-ne un exemplu ca să testăm pe unul real |
| Linii electrice în vizualizarea 3D și în IFC | Planul, profilul liniei, planșele și straturile GIS |
| Uneltele pentru linii electrice pentru asistenți fără fereastră | Funcționează cu fereastra CivilCraft deschisă ([Lăsați un asistent AI să lucreze cu amplasamentul](topic:assistants)) |

## Volume de clădiri

| Încă nerealizat | În schimb, astăzi |
|---|---|
| O bibliotecă de coduri de urbanism sau reguli ale oricărui oraș | Introduceți limitele din propriul regulament ([Limite de urbanism](topic:zoning-limits)) |
| Lumină de cer pe pereți (lumina zilei pe fațadă), vânt | [Orele de soare](topic:sun-hours) numără doar soarele direct |
| Umbra de la copaci, plante sau orice nu este desenat ca masă | Desenați clădirile vecine ca mase |
| Forme de acoperiș pe mase | Mase cu vârf plat |
| Goluri, acoperișuri și tipuri de pereți când o masă este dezvoltată în BimCraft | BimCraft construiește pereți exteriori simpli la fiecare nivel și o placă; adăugați restul acolo |

## GIS și sisteme de coordonate

| Încă nerealizat | În schimb, astăzi |
|---|---|
| File Geodatabase; stiluri KML, pictograme, suprapuneri la sol și legături de rețea | Convertiți în GeoPackage, shapefile sau GeoJSON mai întâi; marcajele KML se citesc fără stilurile lor |
| Editarea entităților GIS sau a atributelor lor | Editați-le într-un program GIS și importați din nou. Panoul Analiză creează straturi noi (tampon, suprapunere, îmbinare, selecție) și adaugă câmpuri de arie și lungime, dar nu editează o entitate pe loc |
| Analiza rețelelor și a rasterelor, tampoane cu capete plate sau pătrate și tampoane pe o singură parte, adăugarea sau ștergerea rândurilor și schimbarea tipului unui câmp în tabelul de atribute, culori manuale ale claselor, o legendă de stil în trasări | Folosiți Selectare pentru a alege entități și a crea un strat din ele; capetele plate nu sunt oferite. Colorarea după atribut și tabelul de atribute sunt construite: vedeți [Stilizarea unui strat după un atribut](topic:gis-symbology) și [Lucrul cu tabelul de atribute al unui strat](topic:gis-table) |
| Stiluri de etichete (dimensiune, poziționare) și etichete care se evită reciproc | Etichetele au o singură dimensiune și pot să se suprapună unde entitățile sunt dense |
| Datumuri verticale și modele de geoid | Cotele se folosesc așa cum le dă fișierul; verificați singuri datumul vertical |
| Deplasări ale rețelei altele decât NAD27 către NAD83 sugerate după zonă (OSTN15; NTv2 pentru alte datumuri funcționează când adăugați fișierul), mai multe rețele deodată, rețele verticale | Adăugați singuri fișierul de rețea pentru datumul propriu; o rețea pe proiect |
| Straturi de hartă în DXF sau în exporturile 3D | Straturile de hartă intră în trasarea PDF și alături de DWG ca imagine |
| Servere de hărți care cer autentificare, cheie sau token | Folosiți servicii publice sau un fișier de imagine georeferențiat |
| Scrierea fișierelor LAS sau LAZ dintr-o suprafață, din modelul terenului sau din uneltele de rețea de cote și LiDAR | Exportați suprafețele ca rețea de cote GeoTIFF. Suplimentul [Nor de puncte](topic:point-clouds) scrie un nor curățat ca LAS 1.4 sau LAZ |
| Intensitatea, culoarea și ecourile LiDAR; rețele de cote cu mai multe benzi; fișiere de rețea sau LiDAR de peste 200 MB | LiDAR este filtrat doar după clasă, iar rețelele folosesc prima bandă; tăiați întâi fișierele mari în fragmente |

## Introducerea datelor

| Încă nerealizat | În schimb, astăzi |
|---|---|
| Selectarea prin casetă la atingere (necesită {{key:Shift}}) | Apăsați lung pe fiecare punct topografic pentru a-l adăuga |
| Coordonate sau distanțe introduse în timpul desenării | Desenați aproximativ, apoi introduceți coordonatele exacte ale PI în tabelul PI al aliniamentului |
| Introducerea coordonatelor pentru colțurile platformelor și structuri | Trageți mânerele lor; măriți pentru precizie și urmăriți E și N în bara de stare |
| Agățarea de obiecte (altele decât punctele topografice pentru linii de rupere) | Măriți și urmăriți bara de stare |

## Vizualizarea 3D

| Încă nerealizat | În schimb, astăzi |
|---|---|
| Desenarea sau editarea în vizualizarea 3D | Desenați și editați în plan; vizualizarea 3D urmează fiecare modificare |
| Selectarea liniilor caracteristice ale coridorului sau a entităților GIS prin clic în 3D | Faceți clic pe ele în plan |
| Exportul vederii exagerate sau în ft | Exporturile sunt la scară reală în metri; vedeți [Exportul amplasamentului în 3D](topic:export-3d) |
| Etichete în exporturile GLB sau OBJ, dimensiuni și stiluri ale etichetelor în 3D | Etichetele apar doar în vizualizarea 3D, la o singură dimensiune; vedeți [Vizualizarea amplasamentului în 3D](topic:site-3d) |
| Texturi din fotografii, înregistrarea unei parcurgeri ca video, umbre din afara amplasamentului, orele de soare afișate în vizualizarea 3D | Straturi de hartă proiectate pe suprafețe; parcurgerea și poziția soarelui la un moment dat; [orele de soare](topic:sun-hours) pentru o zi sau un anotimp, în plan |
