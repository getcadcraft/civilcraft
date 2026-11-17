---
title: Verificările liniilor electrice
summary: Ce verifică CivilCraft pe fiecare linie și cablu, mereu actualizat: distanțe libere, distanțe între faze, balansare, ridicare, sarcini pe suporturi și dimensionare, accesorii, odgoane, fundații, date lipsă, conexiuni, suprasarcini și cădere de tensiune.
keywords: verificări, distanță liberă, distanță față de sol, obstacol, traversare, distanță între faze, balansarea izolatorului, ridicare, sarcină pe suport, sarcină nominală, dimensionare, fundație, odgon, tirant, accesoriu, traversă, cădere de tensiune, suprasarcină, date lipsă, deconectat
from: e6a0da47
---

**Verificări** din secțiunea Linii electrice listează fiecare problemă: roșu pentru ce eșuează și chihlimbariu pentru avertismente. Faceți clic pe una pentru a selecta linia, suportul, cablul sau echipamentul la care se referă; suporturile și deschiderile care eșuează sunt încercuite cu roșu în plan cât timp spațiul de lucru este deschis.

:::warning
O unealtă de proiectare: acestea sunt verificări ale proiectului față de propriile reguli, nu o certificare.
:::

## Distanțe libere

Cea mai joasă fază a conductorului este urmărită de-a lungul fiecărei deschideri, la fiecare ipoteză de încărcare. Distanța sa cea mai mică deasupra solului trebuie să atingă **Regula de distanță** a liniei. Acolo unde o deschidere traversează un **obstacol** (desenat cu {{ui:Obstacol}}: un punct sau o linie, cu înălțimea sa deasupra solului și propria regulă de distanță), distanța față de vârful obstacolului este verificată la fel.

**Ce pune spațiul de lucru Peisaj deasupra solului contează și el.** Plantele singulare (coroana lor la dezvoltarea matură și înălțime), gardurile vii și paturile de plantare (cele mai înalte specii din ele) și zidurile (vârful lor) sunt obstacole sub o linie, fără a fi desenate din nou. Ele păstrează regulile stabilite în {{ui:Ipoteze de încărcare și limite…}}: **Plante peisagistice sub o linie** (seturile exemplu folosesc *Copaci și plante*, 3 m) și **Ziduri peisagistice sub o linie** (*Clădire*); alegeți **Nu se verifică** pentru a le lăsa afară. Distanța se măsoară drept în sus, de la vârful plantei sau al zidului până la conductor, acolo unde deschiderea le traversează; distanța laterală până la o coroană de lângă linie nu este verificată. Mutarea unui copac sau ridicarea unui zid schimbă imediat verificările.

Regulile de distanță sunt propriile reguli. Deschideți-le cu **Reguli…** lângă orice **Regulă de distanță** (sau din {{ui:Ipoteze de încărcare și limite…}}) pentru a adăuga, redenumi, modifica sau elimina.

## Distanța între faze și balansarea

- **Distanța între faze** necesară: k·√(săgeată + lungimea izolatorului) + U/150, cu săgeata din ipoteza la cald și tensiunea U în kV (o formă uzuală; k este cel din setul de reguli). Se compară cu distanța între faze a traversei.
- **Balansarea izolatorului** la suporturile de suspensie, sub ipoteza de vânt: atan(sarcină transversală ÷ sarcină verticală), față de cea mai mare balansare din setul de reguli.
- **Ridicare**: un suport de suspensie mai jos decât vecinii săi poate fi tras în sus pe timp rece; este semnalat.

## Sarcinile pe suporturi și dimensionarea

Pentru fiecare suport și fiecare ipoteză de încărcare, cu fiecare conductor al liniei:

- **Transversală**: vântul pe metru × deschiderea de vânt (jumătate din cele două deschideri), plus 2·H·sin(unghi ÷ 2) la o schimbare de direcție.
- **De-a lungul liniei**: diferența tensiunilor celor două părți la un capăt fix sau la un unghi; la un suport de suspensie, doar sub chiciură pe o parte (fiecare deschidere lucrată separat, ceea ce greșește pe partea sigură).
- **Verticală**: sarcina verticală pe metru × deschiderea de greutate (între cele mai joase puncte de fiecare parte) plus echipamentul.

Sarcina orizontală este dusă la punctul nominal al suportului (sarcină echivalentă = sarcină × înălțimea de prindere ÷ înălțimea punctului nominal) și comparată cu **sarcina nominală** a acestuia × factorul setului de reguli. Când este prea slab, se sugerează cel mai mic suport din același material din biblioteca dvs. care o poate suporta. Un suport cu **odgon** trece sarcina orizontală la odgon, care duce sarcina ÷ sin(unghiul odgonului) și este verificat față de propria sa capacitate.

Accesoriile (cleme, izolatori, traverse) sunt verificate față de sarcina lor nominală: un accesoriu de ancorare suportă tensiunea conductorului, unul de suspensie partea sa din sarcina verticală și transversală. **Fundația** afișată este adâncimea suportului în sol și o gaură puțin mai lată decât talpa sa.

## Date, conexiuni și curent

- Un element al cărui câmp necesar este gol sau o cheie care nu există în bibliotecă.
- Un capăt de traseu de cablu, sau un echipament, conectat la nimic.
- **Căderea de tensiune** și **curentul** de la fiecare sursă (echipament marcat ca sursă) către sarcini (kW și factor de putere la echipament), de-a lungul deschiderilor aeriene și al cablurilor: √3·I·L·(R cos φ + X sin φ), cu R la 20 °C. Mai mult decât curentul admis al cablului sau mai multă cădere decât permite setul de reguli sunt semnalate.
