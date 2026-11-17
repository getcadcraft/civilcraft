---
title: Umbră, producție solară și confort în aer liber
summary: Studiați umbra pe care o proiectează volumele clădirilor într-o zi sau un sezon, vedeți o animație a acesteia, calculați cât energie electrică ar produce panourile solare de pe acoperișuri și pereți într-un an tipic, vedeți cât de confortabilă este strada de lângă o clădire (UTCI) și obțineți o citire orientativă a confortului vântului pentru pietoni.
keywords: studiu de umbră, umbră, ore de soare, animație, solar, PV, fotovoltaic, panouri, producție, kWh, EPW, fișier meteo, UTCI, confort termic, confort în aer liber, stres termic, vânt
from: 96e7af4d
---

Secțiunea **Mediu** se află sub **Ore de soare** în **Proprietățile** unui volum. Folosește volumele desenate ca fiind clădirile.

## Încărcarea unui fișier meteo

Alegeți un fișier meteo cu an tipic (**.epw**) pentru localitatea dvs. Ele sunt gratuite pe site-ul meteo EnergyPlus și pe climate.onebuilding.org. Fișierul rămâne în browserul dvs. pentru această vizită. Producția solară și studiul de confort au nevoie de el; studiul de umbră funcționează și fără el, când proiectul are un sistem de coordonate.

## Studiul de umbră

Alegeți o dată (sau bifați **Sezon** și o ultimă dată și un pas în zile) și un fus orar, apoi **Rulare studiu de umbră**. Obțineți o hartă a orelor de soare sau de umbră de pe teren în jurul volumelor; un tabel cu cât din teren este umbrit pe parcursul zilei; și o animație a zilei pe care o puteți reda sau parcurge pas cu pas. **Salvare hartă**, **Salvare cadre de animație** (toate cadrele pe o singură imagine) și **Salvare ore** (CSV) păstrează rezultatele.

Terenul este considerat plat, la nivelul celui mai jos volum. Pentru umbra pe teren înclinat folosiți **Ore de soare**, care citește terenul.

## Producția solară

Setați randamentul panoului, ce parte din fiecare acoperiș și perete este acoperită și pierderile sistemului, apoi **Rulare producție solară**. Pentru fiecare acoperiș și perete obțineți energia electrică pe care ar produce-o un metru pătrat de panou într-un an tipic, cât din ea iau volumele vecine și un total pentru fiecare volum. Modelul este scris în cuvinte simple lângă buton: este o estimare de planificare dintr-un an tipic, nu o garanție.

## Confort în aer liber

**Rulare confort** calculează Indicele Universal de Climă Termică (UTCI) pentru o persoană în picioare pe teren deschis și lângă primul volum (laturile sud, nord, est și vest), cu umbra fiecărui volum. Arată cât cer se vede, UTCI mediu pe timp de zi și orele peste 32 (stres termic) și sub 0 (stres de frig).

## Vânt (studiu orientativ)

**Rulare studiu de vânt** rezolvă curgerea aerului în jurul volumelor dvs. o dată pentru fiecare direcție a vântului care bate în fișierul meteo (4, 8, 12 sau 16 direcții), peste împrejurimile alese (câmp deschis, periferie sau centrul orașului), apoi adună vântul orar al întregului an. Harta colorează terenul după clasa de confort, de la verde (**stat jos**) prin **stat în picioare**, **plimbare** și **mers** până la roșu (**inconfortabil**): activitatea a cărei viteză-limită (4, 6, 8 și 10 m/s) este depășită pentru cel mult 5 % din ore. Un al doilea tabel dă gradul NEN 8100 (de la A la E) pe baza procentului de ore în care vântul trece de 5 m/s. Factorul de rafală înmulțește media orară pentru a obține o rafală efectivă.

Cum funcționează, în cuvinte simple: un solver de curgere cu simulare de turbulență de tip large-eddy, lattice-Boltzmann (al nostru, în biblioteca `lib/wind`) într-o cutie în jurul clădirilor, un profil al vitezei vântului care crește cu înălțimea peste rugozitatea aleasă, iar viteza la aproximativ 1.5 m deasupra terenului este comparată cu viteza din amonte, la 10 m. **Orientativ** este rapid și grosier; **Standard** folosește mai multe celule și rulează mult mai mult. Dacă panoul spune că grila este grosieră (sub 10 celule peste cea mai înaltă clădire) sau că curgerea încă se schimba, dați mai puțin credit hărții.

**Ce nu este.** Solverul a fost verificat pe curgeri de manual (un canal, o cavitate cu capac mobil) și rulat pe un cub, pentru a vedea dacă sillajul și accelerarea din colțuri arată corect. **Nu** a fost validat prin măsurători în tunel aerodinamic pe clădiri, așa că fiecare rezultat este etichetat ca nevalidat. Nu-l folosiți pentru o valoare de proiectare, o încărcare de vânt sau un certificat de urbanism: un inginer în domeniul vântului trebuie să ruleze și să confirme un studiu corect. Terenul plat, pereții netezi ai clădirilor, scurtătura de rugozitate de la stația meteo și tabelul de praguri sunt simplificări; pragurile pot diferi de criteriile pe care le folosește autoritatea dvs.

## Vântul cu OpenFOAM (supliment)

Motorul de vânt încorporat de mai sus este experimental. Pentru un solver de curgere adevărat, activați suplimentul **Vânt pentru pietoni (OpenFOAM)** din **Setări > Suplimente** (este dezactivat până îl activați). Este un software propriu, sub licență GPL, separat de restul CadCraft, și nu include OpenFOAM: îl instalați singur. Apoi **Motor** din blocul de vânt listează OpenFOAM.

Ce configurați, o singură dată:
1. **Instalați OpenFOAM** (seria v ESI de pe openfoam.com; suplimentul este testat cu v2512). Pe Ubuntu sau Debian (și în WSL pe Windows): `curl https://dl.openfoam.com/add-debian-repo.sh | sudo bash`, apoi `sudo apt install openfoam2512-default`. Se instalează în `/usr/lib/openfoam/openfoam2512`. CadCraft are nevoie de `blockMesh`, `snappyHexMesh` și `simpleFoam` ca să ruleze. (Pachetul mai vechi `openfoam` 1912 din arhiva proprie a Ubuntu funcționează și el, dar obiectele sale de funcție se blochează; suplimentul citește atunci singur fișierele de rezultate.)
2. **Porniți programul auxiliar** din dosarul `runner` al suplimentului, cu Node.js: `node cc-openfoam-runner.mjs serve`. Dacă OpenFOAM nu este în calea de căutare, dați-i un `runner.json` mic cu calea către `etc/bashrc` al OpenFOAM (`{ "bashrc": "/usr/lib/openfoam/openfoam2512/etc/bashrc" }`) și porniți-l cu `--config runner.json`. Programul auxiliar ascultă doar pe acest calculator și afișează un token.
3. **Lipiți tokenul** în câmpurile suplimentului din blocul de vânt (adresa rămâne `http://127.0.0.1:8765`) și apăsați **Verificare program auxiliar**.

Apoi **Rulare studiu de vânt** lucrează câte un caz pentru fiecare direcție a vântului din fișierul meteo: volumele dvs. devin o suprafață (STL) într-o cutie dimensionată după ghidul obișnuit (5 înălțimi de clădire în jur și deasupra, 10 în spate), discretizată în rețea cu blockMesh și snappyHexMesh, rulată ca RANS staționar k-epsilon, cu intrare de strat limită atmosferic peste rugozitatea aleasă, iar viteza la 1.5 m este citită înapoi și transformată în aceleași clase Lawson și NEN 8100. Nimic nu părăsește calculatorul dvs.

**Ce a fost verificat.** Textul de deasupra rezultatelor o spune limpede și face parte din fiecare CSV salvat. Scrierea cazurilor, citirea rezultatelor și întregul lanț al suplimentului sunt testate fără OpenFOAM, iar un singur cub a fost rulat prin OpenFOAM real la trei dimensiuni ale rețelei (cifrele sunt în notele proiectului). **Nu** a fost validat prin măsurători în tunel aerodinamic pe clădiri. Este o citire orientativă, nu o valoare de proiectare și nu un certificat. k-epsilon standard supraestimează turbulența din fața clădirilor, terenul este plat, pereții sunt netezi și nu există relief sau vegetație.
