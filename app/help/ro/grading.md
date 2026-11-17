---
title: Sistematizarea verticală a unei platforme
summary: Desenați o platformă plană, stabiliți-i cota și pantele de debleu și rambleu și lăsați CivilCraft să o racordeze la terenul existent și să o adauge la suprafața proiectată.
keywords: zid de sprijin, ziduri de sprijin, latură verticală, zid în loc de pantă, pantă laterală pe fiecare latură, rambleu, debleu, platformă, platformă de construcție, intersecție cu terenul, linie caracteristică, grup de sistematizare, pantă de debleu, pantă de rambleu, cotă finită, suprafață proiectată, sistematizare verticală
from: 482319a6
---

O platformă este o zonă plană la o singură cotă. Din marginea ei, CivilCraft sistematizează spre exterior la panta de debleu acolo unde terenul este mai sus decât platforma și la panta de rambleu acolo unde terenul este mai jos, până când panta întâlnește terenul existent. Linia de întâlnire este linia de intersecție cu terenul. Platforma și pantele sale înlocuiesc terenul existent din interiorul liniei de intersecție, pentru a face suprafața proiectată.

## Desenarea platformei

Aveți nevoie mai întâi de o suprafață de teren existentă.

1. Apăsați {{key:G}}, sau faceți clic pe {{ui:Platformă}} în grupul **Proiectare**.
   Indicația spune „Platformă: faceți clic pe colțurile ei. Enter sau dublu clic termină, Backspace elimină ultimul, Esc anulează.”
2. Faceți clic pe colțurile platformei în ordine, în oricare sens. Un contur albastru urmărește cursorul.
3. Apăsați {{key:Enter}} după ultimul colț (cel puțin trei).
   Platforma este desenată și selectată. Începe la cota terenului din mijlocul ei, rotunjită la 0.1, cu o pantă de debleu 2 : 1 și o pantă de rambleu 3 : 1. Bara de stare spune, de exemplu, „Platforma 1 la cota 254.3 (terenul din mijloc), debleu 2:1, rambleu 3:1. Modificați-le în Proprietăți.”

:::warning
Terminați cu {{key:Enter}}. Dublu clicul termină și el, dar în această versiune elimină colțul pe care l-ați dat dublu clic. Faceți clic o dată pe ultimul colț, apoi apăsați {{key:Enter}}.
:::

Conturul platformei nu trebuie să se intersecteze singur („Conturul platformei se intersectează singur.”).

## Stabilirea cotei și a pantelor

Cu platforma selectată, panoul din dreapta afișează **Platformă**:

1. **Nume**.
2. **Cotă**: cota plană a platformei.
3. **Pantă de debleu** și **Pantă de rambleu**, ca H:V (2 înseamnă 2 : 1). Amândouă trebuie să fie mai mari decât 0.
4. **Aria platformei** și **Colțuri** sunt afișate pentru referință.

Apăsați {{key:Enter}} după fiecare valoare. Linia de intersecție cu terenul, suprafața proiectată și volumele se actualizează imediat.

Sub câmpuri, o linie citește, de exemplu, „Linia de intersecție cu terenul: 48 de linii de pantă (20 în debleu, 28 în rambleu), cea mai îndepărtată la 31.20 ft.” Planul desenează linia de intersecție și liniile de pantă cu magenta.

## Cum se găsește intersecția cu terenul

- Liniile de pantă pleacă din fiecare margine perpendicular pe ea, aproximativ la fiecare a douăzecea parte din dimensiunea platformei.
- La colțurile exterioare se răsfiră la fiecare 10°, astfel încât panta se înfășoară în jurul colțului.
- La colțurile interioare, o linie merge pe bisectoare, acolo unde se întâlnesc pantele din cele două margini.
- Fiecare linie urcă la panta de debleu sau coboară la panta de rambleu până ajunge la teren.

## Pante pe fiecare latură și ziduri de sprijin

Sub **Laturi și ziduri de sprijin** din Proprietățile unei platforme sau ale unei berme, fiecare latură poate fi sistematizată în felul ei. Latura 1 merge de la primul colț pe care l-ați dat clic până la al doilea, latura 2 de la al doilea la al treilea și așa mai departe.

- **Toate laturile**: **Înclinat** folosește pantele de debleu și rambleu de mai sus pe fiecare latură; **Vertical: ziduri de sprijin** pune un zid pe fiecare latură.
- Pe latură: **Pante de mai sus**, **Pante proprii** (tastați o pantă de debleu și una de rambleu pentru acea latură) sau **Vertical (zid de sprijin)**.
- Tastați o pantă ca `3` sau `3:1` (orizontal la 1 vertical), `33%` sau `18.4°`; se afișează ca H:1. **Pantă de debleu** și **Pantă de rambleu** ale platformei acceptă același lucru.
- O latură verticală nu are rambleu: un zid de sprijin merge de-a lungul marginii, de la platformă în jos până la terenul existent (în rambleu) sau de la teren în jos până la platformă (în debleu). **Grosimea zidului** (0.3 m sau 1 ft la început) este cât de mult sare terenul de la marginea platformei până la terenul existent. Volumele de debleu și rambleu lasă afară rambleul pe care latura nu îl mai are.
- Unde un zid întâlnește o latură înclinată, panta se înfășoară în jurul capătului zidului; două ziduri se întâlnesc într-o îmbinare la 45°.
- Sub câmpuri: lungimea zidurilor, fața expusă (înălțime × lungime), înălțimea cea mai mare și cea medie.

Planul desenează fața exterioară a fiecărui zid cu linii scurte transversale și înălțimea sa la ambele capete și la cea mai mare (pe stratul zidurilor de sprijin, care merge și în DXF și DWG). Vizualizarea 3D arată zidurile ca solide (Afișare › Ziduri de sprijin), iar exporturile GLB, OBJ și USD le includ. Secțiunile transversale peste margine arată treapta.

**Avertismente** (în Proprietăți și în panoul {{ui:Probleme}}): un zid mai înalt decât **Avertizare peste o înălțime de zid de** (1.0 m sau 3.3 ft la început) „poate necesita un zid inginerește sau o autorizație; verificați regulile locale”, iar când tastați **Cea mai abruptă pantă pe care stă solul**, orice latură al cărei debleu sau rambleu este mai abrupt decât aceasta. Sunt avertismente: sistematizarea se construiește oricum. Fiecare schimbare este un pas pentru {{key:Mod+Z}}.

## Mutarea colțurilor

Selectați platforma, apoi trageți un mâner pătrat de la un colț. Fiecare tragere este un pas de anulare. Adăugarea sau eliminarea unui colț nu este disponibilă încă: ștergeți platforma și desenați-o din nou.

## Când nu se sistematizează

O casetă roșie sub **Terasamente** numește platforma și problema:

| Mesaj | Ce trebuie făcut |
|---|---|
| „3 linii de pantă ies de pe suprafață înainte să o întâlnească: platforma este prea aproape de marginea suprafeței sau prea sus/jos.” | Mutați platforma spre interiorul suprafeței sau aduceți cota mai aproape de teren. |
| „Linia de intersecție cu terenul se intersectează singură (pantele din laturi diferite ale platformei se ciocnesc). Reconturați platforma sau schimbați pantele.” | Tipic pentru platforme înguste sau în formă de L, în debleu adânc sau rambleu înalt. Lărgiți platforma, aplatizați diferența sau înclinați pantele. |
| „Conturul platformei se intersectează singur.” | Desenați din nou colțurile în ordine în jurul platformei. |

O platformă cu o problemă este lăsată afară din suprafața proiectată și din volume până când este reparată.

## Vedeți rezultatul

1. Sub **Afișare**, setați **Suprafața** la {{ui:Proiectat (gradat)}}. Curbele de nivel acum trec plat peste platformă și urmează pantele până la linia de intersecție cu terenul.
2. Treceți cu cursorul peste platformă: bara de stare afișează cotele **Teren** și **Sistematizat**.
3. Citiți debleul și rambleul sub **Terasamente**; vezi [Volumele de terasament](topic:volumes).

Platformele sunt sistematizate după coridoare, în ordinea în care au fost desenate. O platformă ulterioară înlocuiește orice este mai devreme în interiorul propriei linii de intersecție cu terenul.

## Ștergerea unei platforme

Selectați-o și apăsați {{key:Delete}} (pe Mac, Fn și delete), sau faceți clic pe {{ui:Ștergere}}.

## Încă nerealizat

Platformele sunt plane: platformele înclinate, liniile caracteristice cu pantă variabilă, banchetele și sistematizarea până la o distanță sau o cotă țintă nu sunt disponibile încă. Vezi [Încă nerealizat](topic:not-built-yet).
