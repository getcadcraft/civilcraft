---
title: Vizualizarea amplasamentului în 3D
summary: Deschideți vederea 3D, orbitați, deplasați-vă și măriți, setați exagerarea verticală și colorarea, alegeți ce se afișează și faceți clic pe axe, platforme, linii caracteristice, linii de rupere, conducte, structuri și puncte pentru a le selecta.
keywords: etichete, etichete 3D, etichete orientate spre cameră, etichete de pichete, etichete de curbe de nivel, etichete de puncte, proiectare pe suprafață, aerian, straturi de hartă pe suprafață, 3d, trei dimensiuni, vedere 3D, ViewCube, busolă, orbitare, perspectivă, paralelă, izometrică, iso, exagerare verticală, teren, model, model al amplasamentului, zbor în jur, vizualizare, randare, conducte în 3D, structuri, guri de vizitare, coridor în 3D, drum în 3D, suprafața drumului, benzi, borduri, trotuare, plante în 3D, copaci în 3D, arbuști, garduri vii, peisaj 3D, rampe în 3D, trepte, ziduri, pavaj, amenajări dure 3D
from: a16bafe1
---

Vederea 3D arată amplasamentul ca un singur model: terenul existent și suprafața nivelată, curbele de nivel proiectate pe ele, liniile de rupere și marginea suprafeței, fiecare ax pe profilul său de proiectare, cu marcaje de pichet, liniile caracteristice ale coridorului și drumul însuși (benzi, acostamente, rigole, borduri, fâșii și trotuare, în culorile lor), platformele cu liniile lor de ieșire la lumină, rețeaua de conducte cu conducte și structuri la cotele lor reale și, din spațiul de lucru Peisaj, plantele, pavajul, aleile, zidurile, bordurile, rampele și treptele. Citește același proiect ca planul, deci fiecare modificare apare în ambele.

## Deschiderea vederii 3D

1. Deschideți punctele topografice (sau un fișier LandXML ori de proiect), ca să existe o suprafață. Plantele, pavajul sau rampele singure sunt suficiente și ele pentru a o deschide.
2. Apăsați {{key:D}} sau faceți clic pe {{ui:3D}} din grupul {{ui:View}} al barei de instrumente.
   Vederea 3D se deschide peste plan, privind întregul amplasament din sud-est. Prima dată, durează o clipă să se încarce.
3. Apăsați din nou {{key:D}} sau faceți din nou clic pe {{ui:3D}} ca să reveniți la plan. Alegerea unui instrument de desenare, precum {{ui:Alignment}} sau {{ui:Pad}}, revine și ea la plan, deoarece desenarea se face acolo.

## Deplasarea

| Pentru a | Faceți astfel |
|---|---|
| Orbita | Trageți cu butonul stâng sau cu cel din mijloc |
| Deplasa (pan) | Trageți cu butonul drept sau țineți {{key:Shift}} și trageți |
| Mări sau micșora | Rotiți rotița; zoomul merge spre indicator |
| Orbita pe trackpad | Glisați cu două degete ({{key:Shift}} și glisarea deplasează) |
| Mări pe trackpad | Ciupiți |
| Atingere | Un deget orbitează; două degete ciupesc pentru zoom și se mută pentru deplasare |
| Taste (vederea are focusul) | {{key:Left}} {{key:Right}} {{key:Up}} {{key:Down}} orbitează, cu {{key:Shift}} deplasează; {{key:Plus}} și {{key:Minus}} măresc |

Bara de deasupra vederii are restul:

- Lista de vederi: **Iso**, **Sus**, **Jos**, **Față** (privind spre nord), **Spate**, **Stânga**, **Dreapta**.
- {{ui:Perspective}}: apăsat înseamnă vedere în perspectivă; faceți clic pe el pentru o proiecție paralelă (fără scurtare).
- {{ui:Extents}}: arată din nou totul. {{key:F}} face același lucru cât timp vederea 3D este deschisă.

## Cubul vederii

Cubul vederii din colțul din dreapta sus se rotește cu vederea. Faceți clic pe o latură, o muchie sau un colț ca să priviți amplasamentul de acolo (camera se rotește lin, dacă sistemul dvs. nu cere mișcare redusă). Trageți cubul ca să orbitați. Inelul busolei de sub el arată nordul (nordul grilei, +Y): trageți inelul ca să rotiți amplasamentul în jurul verticalei sau faceți clic pe N, E, S sau V ca să priviți de pe acea latură. {{ui:Home}}, căsuța mică din colțul stânga sus, revine la vederea izometrică a întregului amplasament. Cu tastatura: {{key:Tab}} până la cub, săgețile aleg o latură, o muchie sau un colț, iar {{key:Enter}} privește de acolo.

Pe plan, același cub arată partea de sus. Faceți clic pe orice altă latură, muchie sau colț (sau trageți-l) ca să deschideți vederea 3D privind de acolo: aceasta este cea mai rapidă cale în 3D dintr-o direcție dată. Ca să înlocuiți cubul cu o pictogramă mică de axe sau să-l ascundeți, vezi **Indicatorul de colț** din [Setările CivilCraft](topic:settings).

## Exagerarea cotelor

Amplasamentele sunt de obicei mult mai late decât sunt de înalte, deci cotele sunt întinse de **2×** la început. Alegeți **1×**, **2×**, **3×**, **5×** sau **10×** din lista de pe bară, sau la **Exagerarea verticală 3D** din [Setările CivilCraft](topic:settings) (cele două sunt o singură setare). Doar vederea se schimbă: volumele, profilele și exporturile rămân la scară reală.

## Colorarea suprafețelor

- **Benzi de cote**: aceleași benzi și culori ca benzile de cote ale planului (numărul de benzi se setează sub **Afișare**, în panoul din stânga). Fiecare margine de bandă este tăiată exact la cota sa.
- **O singură culoare**: terenul existent și suprafața nivelată, fiecare într-o culoare uniformă.
- **Straturi de hartă**: straturile de hartă afișate sub plan (o imagine georeferențiată, plăci de hartă sau un serviciu de hartă; vezi [Straturi de hartă](topic:map-layers)) așezate peste suprafețe ca o foaie, astfel încât o fotografie aeriană se vede pe dealuri. Imaginile care încă sosesc se completează pe măsură ce vin. Fără niciun strat de hartă afișat, suprafețele își păstrează benzile de cote, iar vederea o spune. Imaginea este pentru ecran: exporturile GLB și OBJ nu o conțin.

Când ambele suprafețe sunt afișate, terenul existent este transparent peste suprafața nivelată, deci puteți vedea debleul (terenul deasupra proiectării) și rambleul.

## Alegerea a ce se afișează

Faceți clic pe {{ui:Show}} din bară și bifați sau debifați:

| Element | Ce este |
|---|---|
| Terenul existent | Suprafața construită din punctele topografice (sau citită dintr-un LandXML) |
| Suprafața nivelată | Terenul existent cu coridoarele și platformele nivelate (doar când există) |
| Muchiile triangulației | Fiecare muchie TIN, ca linii |
| Curbe de nivel | Curbele de nivel minore și majore ale fiecărei suprafețe afișate, la intervalul planului |
| Marginea suprafeței | Marginea exterioară a fiecărei suprafețe afișate, la cotele sale |
| Linii de rupere | Fiecare linie de rupere, la cotele sale |
| Axe și pichete | Fiecare ax pe profilul său de proiectare (pe teren acolo unde nu există profil), cu marcaje la fiecare 50 ft sau 20 m |
| Liniile caracteristice ale coridorului | Marginea părții carosabile, acostamentul și punctul de intersecție cu terenul, pe ambele părți |
| Suprafețele drumului | Drumul pe care îl construiește fiecare coridor, din secțiunea sa transversală: benzi, acostamente, rigole, borduri, fâșii și trotuare, fiecare în culoarea sa, pe suprafața nivelată |
| Plante | Fiecare plantă și plantele din straturi și garduri vii, ca forme simple dimensionate după lista de plante: un copac este un trunchi și o coroană rotundă (un con pentru un conifer, un smoc pe un trunchi înalt pentru o palmier); arbuștii, plantele de gard, perenele și plantele de acoperire sunt cupole, ierburile sunt smocuri, cățărătoarele sunt coloane subțiri. Stau pe suprafața nivelată (sau pe terenul existent) la mărimea arătată de plan: mature sau la plantare |
| Amenajări dure | Pavaj și alei cu pantele lor, ziduri, borduri, trepte și rampe care urcă în șiruri, cu paliere orizontale între ele |
| Platforme și punctul de intersecție | Conturul fiecărei platforme la cota sa și linia sa de ieșire la lumină |
| Conducte și structuri | Conductele ca țevi rotunde între radierele lor, structurile de la gură până la sump |
| Puncte topografice | Un punct la fiecare punct cu o cotă (dezactivat la început) |
| Straturi GIS | Straturile GIS afișate pe plan, în culorile lor: liniile și contururile cu propriile cote, la acele cote; altele așezate pe terenul existent (îl urmează exact); punctele ca mici cruci. Formele fără cote în afara suprafeței sunt lăsate afară, iar vederea spune câte |
| Etichete | Nume și valori care vă fac mereu față: numele fiecărui ax la începutul său și pichetele la fiecare 100 ft (sau 100 m), cota fiecărei curbe de nivel majore, platformele, liniile caracteristice și structurile după nume și, cu **Puncte topografice** bifat, numărul și cota fiecărui punct |

Etichetele rămân de aceeași mărime și verticale oricum le rotiți sau le măriți, iar un deal în fața unei etichete o ascunde. Unde s-ar aglomera, cele mai importante se afișează, iar restul așteaptă până măriți: întâi axele, apoi structurile, platformele, liniile caracteristice, pichetele, curbele de nivel și punctele, cele mai apropiate primele. Sunt doar pe ecran; exporturile și graficele le lasă afară.

Alegerile dvs., exagerarea și colorarea sunt ținute minte în acest browser.

Un drum se construiește pe terenul existent. Cu un ax și un coridor, dar fără puncte topografice sau suprafață încă, drumul este desenat pe un teren provizoriu plat: la cota medie a profilului său de proiectare sau la nivelul zero, când nu există nici profil. Un avertisment din partea de jos a vederii 3D și în proprietățile coridorului o spune. Este doar o imagine: nu rezultă volume sau secțiuni din ea. Deschideți punctele topografice sau o suprafață și drumul se mută singur pe terenul real.

Exagerarea verticală întinde terenul, nu plantele: ele stau pe terenul exagerat, la înălțimea și întinderea lor reale, deci un copac arată ca un copac la orice setare. Plantele sunt forme simple, nu modele detaliate: mii dintre ele rămân rapide la rotire și la zoom.

## Conducte și structuri

- O conductă este desenată cu baza sa interioară la radierele pe care le setați și cu partea de sus (coronamentul) cu un diametru interior mai sus. Diametrele sunt în inch într-un proiect în picioare și în milimetri într-un proiect metric, ca în panoul din dreapta.
- O structură merge de la gură (introdusă sau din suprafață) în jos până la sump (cea mai mică radier minus adâncimea sumpului). Fără nicio radier, este desenată adâncă de 5 ft (1.5 m).
- Conductele și structurile cu o problemă (vezi verificarea rețelei din panoul din dreapta) sunt desenate în roșu.
- O conductă fără radiere nu este desenată; o notă din partea de jos a vederii spune câte sunt.

## Selectarea din vederea 3D

Faceți clic pe un ax (sau pe drumul său), pe o platformă, pe o linie caracteristică, pe o conductă, pe o structură, pe un punct topografic, pe o plantă, pe o rampă sau pe altă amenajare dură. Este selectat exact ca și cum l-ați fi apăsat în plan: proprietățile sale se deschid în panoul din dreapta, unde le puteți edita, iar el este desenat în culoarea de selecție, peste tot în 3D. Orice selectați pe plan este evidențiat și în 3D. Un indiciu lângă cursor numește ce ați apăsat, cu estul, nordul și cota sa. Conductele și structurile pot fi apăsate chiar și acolo unde sunt sub pământ; o linie ascunsă după un deal nu poate fi apăsată prin el.

Faceți clic pe o linie de rupere ca să vedeți care este: ea este evidențiată, iar bara de stare o numește (liniile de rupere nu au proprietăți proprii).

Faceți clic pe teren ca să citiți în indiciu estul, nordul și cota de acolo.

## Conducerea de-a lungul unui ax

Faceți clic pe **Conducere** în bara 3D și alegeți un ax. Vederea se mută într-un loc de șofer: 3.5 ft (1.07 m) deasupra drumului, pe profilul său de proiectare (pe terenul existent de-a lungul axei, când nu are încă unul), privind înainte pe el.

- **Redare** sau {{key:Space}} conduce cu viteza pe care o alegeți (10 până la 65 mph, sau 15 până la 100 km/h); {{key:Space}} din nou pune pe pauză. Se oprește la capăt; **Redare** pornește atunci din nou de la început.
- Glisorul sare la orice pichet; {{key:Left}} și {{key:Right}} fac pași de 10 ft (5 m) înapoi și înainte.
- Trăgând în vedere se pune pe pauză și vă lasă să priviți împrejur.
- **Oprire** sau {{key:Esc}} pune vederea înapoi unde era.

Exagerarea verticală se aplică și în timpul conducerii: puneți-o pe 1× ca să vedeți drumul așa cum va fi.

## Lumina soarelui

Deschideți **Soare** pe bara 3D și bifați **Lumină de la soare**. Dați o dată, o oră a ceasului și fusul său orar (decalajul față de UTC: vara, cel de ora de vară), și latitudinea și longitudinea amplasamentului. Când proiectul are un sistem de coordonate, acestea se completează din el.

Amplasamentul este apoi luminat de unde este soarele, cu **Umbre** pe teren, pe coridor și pe platforme; meniul spune azimutul soarelui și cât de sus este, sau că este sub orizont. Pozițiile vin din ecuațiile solare NOAA. Umbrele cad corect la orice exagerare, dar se opresc la marginea amplasamentului: dealurile și clădirile de dincolo de el nu aruncă nicio umbră.

## Exportul vederii 3D

Faceți clic pe {{ui:GLB}} sau {{ui:OBJ}} din bară. Ce arată vederea este salvat, la scară reală (fără exagerare), în metri, cu Y în sus. Detalii: [Exportul amplasamentului în 3D](topic:export-3d).
