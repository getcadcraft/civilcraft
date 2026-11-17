---
title: Conducte de apă: presiuni, debite și debit de incendiu
summary: Desenați pe plan o rețea de presiune cu noduri, rezervoare, bazine, conducte, pompe și reductoare de presiune; CivilCraft calculează înălțimile piezometrice, presiunile și debitele (Hazen–Williams, rețele inelare), debitul disponibil pentru un incendiu și o zi de consum. Funcție de laborator; fiecare rezultat necesită verificarea unui inginer.
keywords: apă, conductă de apă, distribuție de apă, rețea de presiune, conductă sub presiune, rețea inelară, hazen-williams, factor C, pierdere de sarcină, presiune reziduală, debit de incendiu, hidrant, consum, nod, rezervor, bazin, pompă, curba pompei, reductor de presiune, prv, clapet de neîntoarcere, perioadă extinsă, epanet, inp, viteză
from: df46bf6d
---

Conductele de apă sunt partea sub presiune a unui sit: conducte mereu pline, în care apa este împinsă de un rezervor, un bazin sau o pompă. CivilCraft calculează înălțimea și presiunea în fiecare nod și debitul din fiecare conductă, inclusiv rețelele inelare, unde apa are mai multe căi. Funcția este în laborator cât timp este verificată.

**Doar un instrument de calcul.** Fiecare cifră necesită verificarea unui inginer calificat: răspunsul valorează cât valorează cererile, cotele, dimensiunile conductelor și valorile de rugozitate pe care le-ați dat, iar un model în regim staționar nu știe nimic despre lovitura de berbec, calitatea apei sau comportamentul real al unei pompe de incendiu.

## Desenați rețeaua

1. Sub {{ui:Model de teren}} › {{ui:Mai multe}}, alegeți {{ui:Rețele de apă…}}. Fereastra rămâne deschisă cât lucrați pe plan.
2. Alegeți {{ui:Rezervor}} și faceți clic pe plan unde este sursa. Înălțimea sa pornește de la 100 ft (30 m) deasupra terenului; schimbați-o în Proprietăți.
3. Alegeți {{ui:Nod}} și faceți clic pe fiecare loc unde se scoate apă sau se întâlnesc conducte. Un nod își ia cota din teren; tastați alta în Proprietăți ca să o înlocuiți.
4. Alegeți {{ui:Conductă}}, faceți clic pe un nod, apoi pe nodul pe care îl unește. Instrumentul rămâne activ pentru următoarea conductă. O {{ui:Pompă}} și un {{ui:Reductor de presiune}} se desenează la fel, de la nodul de aspirație (sau din amonte) la nodul de refulare (sau din aval). Un {{ui:Bazin}} se plasează ca un nod.
5. Selectați un nod și tastați-i {{ui:Consum}} (gpm, sau L/s într-un proiect în metri). Selectați o conductă și setați-i {{ui:Diametru}} (in, sau mm) și, dacă îl cunoașteți, coeficientul Hazen–Williams C.

Fiecare modificare este un singur pas de anulare. Tasta Delete scoate nodul și conductele care se termină în el.

## Ce înseamnă fiecare parte

- **Conductă.** Lungimea este măsurată pe plan, dacă nu o tastați. C este rugozitatea Hazen–Williams (130 la început; schimbați valoarea implicită în fereastră). Un coeficient de pierdere locală K adaugă pierderile curbelor și ale pieselor de conexiune. Bifați **Clapet de neîntoarcere** pentru o conductă care nu trebuie să lase apa să curgă înapoi; o conductă **Închisă** nu transportă nimic.
- **Rezervor.** O sursă cu înălțime fixă, nivelul apei pe care îl menține deasupra cotei de referință. Dă sau ia cât are nevoie rețeaua.
- **Bazin.** Un nivel care se schimbă pe parcursul unei zile. În rezultatele în regim staționar este o sursă la nivelul său curent.
- **Pompă.** Un singur punct de proiectare (debit și înălțime) trasează prin el curba obișnuită: înălțimea la debit zero este 133 % din înălțimea de proiectare, iar înălțimea este zero la dublul debitului de proiectare. O pompă nu împinge niciodată apa înapoi.
- **Reductor de presiune.** Menține presiunea pe care o setați în aval când alimentarea este mai mare. Când alimentarea este mai mică, este deschis și nu menține nimic; dacă apa ar curge înapoi, se închide.

## Citiți rezultatele

Fereastra arată înălțimea și presiunea fiecărui nod și debitul, viteza și pierderea de sarcină pe 1,000 ft (sau pe km) pentru fiecare legătură, cu nodurile colorate pe plan: verde înseamnă între cea mai mică și cea mai mare presiune setată, roșu sub, chihlimbar peste. Săgețile de debit arată direcția. Selectați un nod sau o conductă ca să citiți cifrele în Proprietăți.

Sub tabele este o listă cu ce trebuie verificat: presiune joasă sau înaltă, o conductă mai rapidă decât limita stabilită, un nod deconectat de la orice sursă sau un solver care nu s-a stabilizat. Aceleași constatări sunt în panoul Probleme. Limitele se setează în fereastră (20 psi, 100 psi și 10 ft/s la început; 140 kPa, 700 kPa și 3 m/s într-un proiect în metri).

## Debitul de incendiu

{{ui:Debit de incendiu…}} desenează un debit la un nod și arată presiunea acolo și presiunea cea mai mică din orice punct al rețelei. Mai calculează debitul disponibil în acel nod, cât timp cel mai slab nod din rețea păstrează presiunea reziduală pe care o dați. Celelalte consumuri rămân cum sunt.

## O zi de consum

{{ui:O zi de consum…}} rulează rețeaua oră cu oră. Dați modelul de consum în setările fișierului (o listă de multiplicatori care se repetă); bazinele se umplu și se golesc cu debitul intrat și ieșit, iar o pompă poate urma un model pornit/oprit. Un bazin care ajunge la cel mai înalt sau cel mai scăzut nivel este numit în listă: CivilCraft nu-i închide intrarea sau ieșirea, deci această listă înseamnă „bazinul este prea mic sau pompa prea mare”.

## Text EPANET

{{ui:Salvare ca text EPANET (.inp)}} scrie rețeaua în formatul text simplu pe care îl citesc multe programe de ape, iar {{ui:Deschidere text EPANET (.inp)…}} citește unul. Trec doar lucrurile pe care le modelează CivilCraft: noduri, rezervoare, bazine, conducte, pompe cu o curbă de înălțime, reductoare de presiune, modele de consum și timpii. Alte tipuri de robinete, pompele date prin putere și alte formule de pierdere de sarcină sunt numite și lăsate afară. Fișierul trebuie să folosească aceleași unități ca proiectul.

## Hidranți, robinete și piese de conexiune

Selectați un nod și bifați **Hidrant** ca să puneți unul acolo; selectați o conductă și apăsați **Adăugare la mijloc** ca să puneți pe ea un robinet, un ventil de aer, o golire sau un contor. Sunt obiecte ale rețelei: se mișcă odată cu ea, iar un pas de anulare le scoate.

Aranjamentul implică și piese de conexiune, pe care CivilCraft le listează fără să i se ceară: un **teu** unde se întâlnesc trei conducte, o **cruce** unde se întâlnesc patru, un **cot** (cu unghiul său) unde două conducte se întorc cu 5° sau mai mult, un **reductor** unde se întâlnesc două dimensiuni și un **capac** la un capăt mort. {{ui:Tabel piese de conexiune (CSV)}} le numără, împreună cu conductele după dimensiune. Acesta este ce implică aranjamentul: o listă de cantități de verificat cu propriile detalii, nu o listă de comandat.

Conductele sunt așezate la teren minus o adâncime de îngropare (4 ft sau 1.2 m), ca să poată fi desenate și modelate în 3D; presiunile de mai sus nu depind niciodată de ea.

## Pe plan și în fișiere

Planul, PDF-ul și DWG sau DXF poartă conductele pe **C-WATR-MAIN**, cu dimensiunile lor pe **C-WATR-TEXT**, hidranții pe **C-WATR-HYDR**, robinetele pe **C-WATR-VALV** și piesele de conexiune pe **C-WATR-FITT**. LandXML la export scrie o rețea de conducte de apă (o structură pentru fiecare nod, o conductă pentru fiecare conductă principală, hidranții denumiți); LandXML la import o citește înapoi ca conducte de apă, fără consumuri, pompe sau robinete, pe care LandXML nu le transportă. Exportul IFC scrie conductele ca segmente de conductă, hidranți, robinete și piese de conexiune într-un singur sistem de apă. Aceste fișiere au fost verificate cu propriile noastre cititoare și scriitoare; încercați-le în celelalte programe și spuneți-ne ce afișează acolo.

## Ce nu există încă

Calitatea și vârsta apei, controalele și regulile dincolo de modelul pornit/oprit al unei pompe, alte tipuri de robinete, consumul în funcție de presiune, conductele cu diametru variabil și debitele de canalizare în timp. Vezi [Încă nerealizat](topic:not-built-yet). Debitele de proiectare sanitare, care sunt un alt calcul, sunt în [Debite de proiectare sanitare](topic:sanitary-design).
