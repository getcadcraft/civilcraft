---
title: Sistematizarea pentru peisagistică
summary: Platforme, berme, șanțuri înierbate și sistematizare liberă, cu cote de punct și curbe de nivel pe care le trageți, debleu și rambleu în timp real, analiza pantelor, săgeți de scurgere și băltire, totul în suprafața proiectată a CivilCraft.
keywords: zid de sprijin, ziduri de sprijin, latură verticală, zid în loc de pantă, pantă pe latură, rambleu, sistematizare, sistematizare peisagistică, platformă, terasă, platformă pentru casă, bermă, movilă, șanț înierbat, cotă de nivel, cotă de punct, curbe de nivel, editare curbe de nivel, debleu și rambleu, terasamente, analiza pantelor, accesibilitate, pante abrupte, săgeți de curgere, drenaj, băltire, bălți
from: e1559eb9
---

Totul aici este sistematizat în **suprafața proiectată**, cu aceeași sistematizare ca pentru platforme și coridoare. **Terenul natural** nu se modifică niciodată, iar Terasamentele le includ pe toate. Meniul Sistematizare este în grupul Peisagistică.

## Platforme

{{ui:Sistematizare}} › {{ui:Platformă}}, apoi faceți clic pe colțuri și apăsați {{key:Enter}}. Platforma pornește de la cota medie a terenului de sub ea; introduceți o **Cotă** ca să o stabiliți sau goliți-o ca să urmeze din nou terenul. O **Pantă** în % și o **Înclinare spre** în grade (0 = est, 90 = nord) o înclină. Laturile ei sunt nivelate până la teren la **Taluzul de debleu** și **Taluzul de rambleu** (orizontal la 1).

## Pante pe fiecare latură și ziduri de sprijin

Sub **Laturi și ziduri de sprijin** din Proprietățile unei platforme pentru casă, ale unei platforme sau ale unei berme, fiecare latură poate fi nivelată în felul ei. Latura 1 merge de la primul colț pe care l-ați făcut clic până la al doilea, latura 2 de la al doilea la al treilea, și așa mai departe.

- **Toate laturile**: **Înclinată** folosește taluzele de debleu și rambleu de mai sus pe fiecare latură; **Vertical: ziduri de sprijin** pune un zid pe fiecare latură.
- Pe fiecare latură: **Pante de mai sus**, **Propriile pante** (introduceți un taluz de debleu și unul de rambleu pentru acea latură) sau **Vertical (zid de sprijin)**.
- Introduceți o pantă ca `3` sau `3:1` (orizontal la 1 vertical), `33%` sau `18.4°`; ea este afișată ca H:1. **Taluzul de debleu** și **Taluzul de rambleu** ale platformei iau aceeași formă.
- O latură verticală nu are rambleu: un zid de sprijin merge de-a lungul marginii, de la platformă în jos până la terenul natural (în rambleu) sau de la teren în jos până la platformă (în debleu). **Grosimea zidului** (0.3 m sau 1 ft la început) este cât de mult face terenul o treaptă de la marginea platformei până la terenul natural. Volumele de debleu și rambleu lasă afară rambleul pe care latura respectivă nu-l mai are.
- Acolo unde un zid întâlnește o latură înclinată, panta se înfășoară în jurul capătului zidului; două ziduri care se întâlnesc se unesc într-o mitră.
- Sub câmpuri: lungimea zidurilor, fața expusă (înălțime × lungime), înălțimea cea mai mare și cea medie.

Planul desenează fața exterioară a fiecărui zid cu scurte linii transversale și înălțimea lui la ambele capete și în punctul cel mai înalt (pe stratul zidurilor de sprijin, care intră și în DXF și DWG). Vederea 3D arată zidurile ca solide (Afișare › Ziduri de sprijin), iar exporturile GLB, OBJ și USD le includ. Secțiunile peste margine arată treapta.

**Avertismente** (în Proprietăți și în panoul Probleme): un zid mai înalt decât **Avertizare peste înălțimea zidului de** (1.0 m sau 3.3 ft la început) „poate necesita un zid ingineresc sau o autorizație; verificați regulile locale”, și, când introduceți **Panta cea mai abruptă pe care o suportă solul**, orice latură al cărei taluz de debleu sau de rambleu este mai abrupt decât aceasta. Sunt avertismente: sistematizarea se construiește în continuare. Fiecare modificare este un singur pas pentru {{key:Mod+Z}}.

## Berme

{{ui:Sistematizare}} › {{ui:Bermă}}: o movilă al cărei vârf este la **Înălțimea** sa deasupra terenului mediu de sub ea, cu laturile nivelate.

## Șanțuri înierbate

{{ui:Sistematizare}} › {{ui:Șanț înierbat}}, apoi faceți clic de-a lungul șanțului **în direcția în care curge apa** și apăsați {{key:Enter}}. Setați **Adâncimea**, **Lățimea fundului** (0 pentru un V) și **Taluzul lateral**. Fără o **Pantă**, fundul său urmează terenul, la adâncimea sa sub el, și nu urcă niciodată; introduceți o pantă ca să-i dați una constantă de la început.

## Cote de nivel și curbe de nivel

1. {{ui:Sistematizare}} › {{ui:Zonă de sistematizare}}: faceți clic pe conturul zonei pe care vreți să o modelați.
2. {{ui:Sistematizare}} › {{ui:Cotă de nivel}}: faceți clic în interiorul zonei. Introduceți cota în Proprietăți sau folosiți butoanele ▲ ▼.
3. {{ui:Sistematizare}} › {{ui:Editare curbă de nivel}}: faceți clic pe o curbă de nivel din zonă ca s-o luați ca linie pe care o puteți remodela.

Selectați o cotă sau o curbă și **trageți-o** (sau punctele ei) pe plan: suprafața urmează când lăsați, ca un singur pas de anulare. În interiorul zonei, terenul se reconstruiește de la marginea sa (acolo unde întâlnește terenul natural), din cotele de nivel și din curbele de nivel editate.

## Debleu și rambleu, în timp real

Proprietățile fiecărui obiect de sistematizare arată **Debleul** și **Rambleul** lui și ale întregului sit, prin metoda grilei folosită de Terasamente, pe măsură ce îl modificați. Problemele (în afara suprafeței, un contur care se intersectează singur) sunt listate acolo.

## Verificări de sistematizare

În secțiunea **Verificări de sistematizare** din stânga:

- **Analiza pantelor** colorează suprafața după gradient: până la limita blândă, între, și mai abruptă decât limita abruptă (5 % și 33.3 % la început: pantele obișnuite de 1:20 pentru traseele accesibile și 1:3 pentru cosit). Legenda spune cât din suprafață cade în fiecare. Zonele abrupte se tipăresc și pe planșe.
- **Săgețile de scurgere și băltirea** desenează în ce direcție curge apa și încercuiesc fiecare loc în care s-ar bălta, cu adâncimea lui; secțiunea spune câte locuri sunt, cel mai adânc și cât apă conțin.

Verificările citesc suprafața proiectată atunci când ceva este sistematizat, altfel terenul natural.
