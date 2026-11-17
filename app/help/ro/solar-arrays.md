---
title: Amplasarea câmpurilor solare pe teren
summary: Plasați mese solare montate pe sol într-o parcelă sau pe o platformă, cu rândurile distanțate după terenul pe care stă fiecare, terenul abrupt lăsat liber, energia anuală calculată și mesele afișate pe plan și în 3D.
keywords: solar, pv, fotovoltaic, câmp, montaj pe sol, mese, rânduri, distanță între rânduri, umbră, teren, pantă, piloni, randament, kWp, energie, orizont
from: 95593fd6
---

## Ce veți afla

Cum să amplasați un câmp de mese solare pe un amplasament care nu este plat și ce înseamnă cifrele. Deschideți-l din Suprafață › Mai multe › Câmpuri solare.

## Amplasarea meselor

1. Alegeți **Unde**: o parcelă sau o platformă a proiectului ori tastați colțurile unei zone. Bifați orice platforme sau parcele care trebuie să rămână **goale** (o clădire, un iaz).
2. Tastați **latitudinea și longitudinea** amplasamentului. Soarele depinde de ele; nimic nu se estimează. Dacă proiectul are un sistem de coordonate, **Plasare din sistemul de coordonate** le completează.
3. Stabiliți înclinarea, orientarea (necompletat înseamnă spre ecuator), câte module formează o masă și puterea și dimensiunea modulului. Valorile modulelor pornesc ca valori generice și sunt etichetate astfel; introduceți valorile proprii.
4. Apăsați **Amplasare mese**. Fereastra dă numărul de mese și de module, dimensiunea în kWp și distanța dintre rânduri.

Fiecare masă este o coloană în zonă, plasată de la față și deplasată pas cu pas spre spate. O masă este plasată doar acolo unde terenul de sub ea se află sub limita de pantă, în interiorul zonei și al retragerii, iar piloții de care are nevoie nu depășesc limita stabilită. Locurile care nu îndeplinesc condițiile rămân goale, iar fereastra arată câte sunt și de ce.

## Rândurile sunt distanțate după teren

Pe teren plat, rândurile stau la distanță conform regulii obișnuite de neumbrire: umbra unui rând la amiază, în solstițiul de iarnă, nu trebuie să ajungă la marginea inferioară a rândului din spate. Pe pantă, CivilCraft aplică aceeași regulă terenului pe care stă efectiv rândul următor. Unde terenul urcă în spatele unei mese, rândurile pot sta mai aproape; unde coboară, stau mai departe. Fereastra arată distanța cea mai mică, cea mai mare și media, alături de distanța pe teren plat, ca să vedeți ce a făcut terenul.

Planul unei mese este ridicat pe piloni până când fiecare punct de sub ea se află deasupra terenului cu garda stabilită. Cel mai înalt pilon apare în rezultat.

## Energia anuală

**Energia anuală** calculează lumina pe planul înclinat pentru o zi reprezentativă din fiecare lună, temperatura celulei, pierderile introduse, umbrirea reciprocă a meselor și dealurile de la orizont, care iau soarele pe care îl ascund. Cerul este senin, deci rezultatul este o limită superioară; vremea reală dă mai puțin. Este o estimare de proiectare timpurie, nu un raport de randament.

## Salvarea rezultatului

**Salvare în proiect** păstrează datele de intrare și cifrele în fișierul proiectului; mesele sunt recalculate din teren la deschiderea fișierului, deci o suprafață modificată le mută. Ele apar pe plan și în 3D (Afișare › Câmpuri solare). Lista meselor se descarcă în CSV. Un singur pas de anulare elimină sau restabilește un câmp.

## Încă nerealizat

Date meteo în locul cerului senin, mese care urmăresc terenul în direcția est–vest, trackere și proiectarea electrică (șiruri, cablu, invertoare) în CivilCraft. Panoul Solar PV al BimCraft are șiruri și schema unifilară pentru acoperișuri.
