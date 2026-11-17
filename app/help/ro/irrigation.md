---
title: Proiectarea irigațiilor
summary: Un instrument de calcul, nu un proiect ștampilat: capete, derivații, conducta principală, vane și linii de picurare pe sit; zone găsite din conducte; pierderea de presiune prin Hazen–Williams, capul cel mai defavorabil, debitul și presiunea față de alimentare, ratele de precipitații, duratele de funcționare, acoperirea și lista de materiale.
keywords: irigații, stropitor, stropitoare, pulverizator, rotor, duză rotativă, barbotor, picurare, linie de picurare, emitor, vană, zonă, stație, controler, conductă principală, derivație, punct de racord, alimentare cu apă, presiune, psi, kpa, debit, gpm, pierdere prin frecare, hazen williams, rată de precipitare, durată de funcționare, acoperire, cap la cap, listă de materiale
from: 7d6342c1
---

:::warning
Acesta este un instrument de calcul, nu un proiect ștampilat: un proiectant de irigații verifică fiecare rezultat înainte de orice construcție.
:::

## Stabilirea sistemului

1. În secțiunea **Irigații** din stânga, alegeți **Cap**, **Arcul** și de unde începe arcul, precum și dimensiunile conductelor pentru derivații și pentru conducta principală.
2. {{ui:Irigații}} › {{ui:Punct de racord}}: faceți clic unde se unește alimentarea cu apă. Setați **presiunea** ei, **debitul disponibil** și pierderile de contor și de clapetă anti-retur în Proprietăți.
3. {{ui:Irigații}} › {{ui:Vană}}: faceți clic unde merge vana fiecărei zone. O vană pornește o zonă.
4. {{ui:Irigații}} › {{ui:Cap}}: faceți clic ca să plasați capetele; fiecare clic plasează unul.
5. {{ui:Irigații}} › {{ui:Conductă laterală}}: faceți clic dintr-o vană prin capetele sale și apăsați {{key:Enter}}. {{ui:Conductă principală}}: de la punctul de racord la fiecare vană.

Capetele conductelor se fixează de capete, de vane, de alimentare și de alte capete de conductă, astfel încât rețeaua se unește. O zonă este tot ce se ajunge din vana ei prin conductele laterale; conducta principală transportă câte o zonă pe rând.

## Picurare

{{ui:Irigații}} › {{ui:Linie de picurare}}: faceți clic de-a lungul liniei, începând de unde este alimentată (un capăt de conductă laterală sau o vană). Setați **debitul emitorului** și **distanța** în Proprietăți; debitul ei este cel al emitoarelor de-a lungul ei.

## Verificarea

{{ui:Irigații}} › {{ui:Verificarea sistemului…}} listează fiecare zonă:

| Coloană | Cum se calculează |
|---|---|
| Debit | Debitele capetelor (și ale liniilor de picurare) adunate |
| La vană | Presiunea de lucru a capului cel mai defavorabil plus pierderile din conducte până la el (Hazen–Williams, diametrul interior al conductei, diferența de nivel) și pierderea prin vană |
| La alimentare | Același lucru, plus pierderea conductei principale care transportă zona aceea, plus pierderea de contor și de clapetă |
| Precipitații | Debitul capetelor raportat la suprafața pe care o udă la distanța cap la cap |
| Minute pe săptămână | Pentru a aplica setarea **Udare pe săptămână** |
| Probleme | Viteză peste limită, un cap în afara intervalului său de presiune, stropitoare și rotoare pe aceeași vană, presiune sau debit insuficient la alimentare, capete fără nicio zonă, bucle |

Selectați o vană ca să vedeți cifrele zonei ei și capul ei cel mai defavorabil, încercuit pe plan. Lista de materiale numără capetele după tip și arc, conductele după dimensiune, vanele, linia de picurare și emitoarele, precum și stațiile controlerului. **Salvare ca CSV** păstrează ambele.

Setările din secțiunea Irigații sunt: **Hazen–Williams C** (150 pentru conducte noi din plastic), **viteza maximă** a debitului în conductă (1.5 m/s), **pierderea prin vană** și **Udare pe săptămână**. Sunt valori implicite etichetate.

## Acoperire

{{ui:Irigații}} › {{ui:Afișare acoperire}} spune cât din suprafață rămâne uscată după capete, cât este udată de două sau mai multe capete și care capete nu ajung la un vecin (distanța cap la cap).

## Capete

Capetele listate sunt tipuri **generice**, scrise de CadCraft din ratele de precipitații de proiectare (pulverizatoare fixe, duze rotative, rotoare cu roți dințate, barbotoare, micropulverizatoare, emitoare), nu produsele vreunui producător. **Adăugare capete dintr-un fișier…** citește capetele dvs. (o listă JSON cu aruncarea, debitul sau rata de precipitații a fiecărui cap și intervalul lui de presiune); ele se salvează odată cu proiectul. Datele publicate ale unui producător se includ doar cu permisiunea înregistrată a acelui producător.

Sub capetele generice, lista are **capete tipice** (numele lor se termină în „valori tipice”): dimensiuni de duze ale pulverizatoarelor fixe, duzelor rotative și rotoarelor cu roți dințate, micropulverizatoarelor, barbotoarelor și emitoarelor, cu o rază, un debit și un interval de presiune. Sunt calculate de CadCraft din formule publicate (ecuația orificiului pentru debit, scalarea jetului pentru rază) și din clase nominale de debit, doar din surse deschise; niciun tabel de producător nu este copiat. Alegeți unul și selectorul arată baza și licența lui. Un proiect care îl folosește păstrează capul și sursa lui în fișierul proiectului. Sunt pentru planificare: verificați datele proprii ale capului real înainte de construcție.
