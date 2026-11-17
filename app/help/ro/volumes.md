---
title: Volume de terasamente
summary: Citiți volumele de debleu, rambleu și net între terenul existent și suprafața proiectată, pe platformă și pe coridor și în total, și înțelegeți metoda grilei din spatele lor.
keywords: volume, terasamente, debleu, rambleu, net, debleu și rambleu, cantități, metoda grilei, comparare suprafețe, suprafață de volume, yarzi cubi, metri cubi
from: 299d7bc7
---

Imediat ce o platformă sau un coridor se sistematizează fără probleme, CivilCraft compară suprafața proiectată cu terenul existent și raportează debleul și rambleul. Cifrele se actualizează la fiecare modificare.

## Unde le citiți

- **Terasamente** în panoul din dreapta, când nu este selectat nimic (vizualizarea **Proiect**), când există cel puțin o platformă sau un coridor.
- **Terasamente** în panoul din dreapta, când este selectată o platformă (aceleași totaluri pentru întregul proiect).
- Linia de sub setările unui coridor, cu debleul și rambleul propriu al acelui coridor.

Blocul **Terasamente** arată:

- **Debleu**, **Rambleu** și **Net** (cu „rambleu” sau „debleu” după el, care dintre ele este mai mare)
- câte o linie pentru fiecare element, când sunt mai multe, de exemplu „Platforma 1: debleu 120.4 cu yd, rambleu 310.2 cu yd”
- linia metodei: „Metoda grilei: terenul existent și suprafața sistematizată eșantionate la fiecare 0.5 ft în interiorul liniilor de intersecție cu terenul (92,891 celule). Nu s-a aplicat niciun coeficient de umflare sau contracție.”

Volumele sunt în yarzi cubi într-un proiect în picioare și în metri cubi într-un proiect în metri.

## Trimiteți-le la TakeoffCraft

Ca să evaluați lucrările de terasament, alegeți {{ui:Trimitere la TakeoffCraft}} la baza blocului **Terasamente**. CivilCraft salvează un fișier de cantități (`<site>.quantities.json`) cu două cantități: debleu și rambleu, în yarzi cubi (proiect în picioare) sau metri cubi (proiect în metri), aceleași cifre ca în bloc, până la sutime. Deschideți-l în TakeoffCraft cu **Deschidere extragere de cantități** sau trageți-l acolo: devin două articole pe care le puteți evalua ([Debleu și rambleu din CivilCraft](app:takeoffcraft/earthwork#cut-and-fill-from-civilcraft)). Trimiteți din nou după o modificare și deschideți fișierul nou: aceleași articole primesc noile cifre.

Sunt trimise doar totalurile, deci nimic nu se numără de două ori; nota fișierului listează debleul și rambleul fiecărei platforme și al fiecărui coridor.

## Cum se calculează

CivilCraft folosește **metoda grilei**:

1. O grilă de celule pătrate este așezată peste zona din interiorul fiecărei linii de intersecție cu terenul.
2. În centrul fiecărei celule, ambele suprafețe sunt eșantionate.
3. Fiecare celulă contează ca o prismă: diferența de cotă înmulțită cu aria celulei. Acolo unde suprafața proiectată este mai joasă, este debleu; unde este mai înaltă, este rambleu.
4. Celulele sunt adunate.

Mărimea celulei este aleasă automat, astfel încât dreptunghiul din jurul zonelor sistematizate să conțină circa 250,000 de celule, rotunjită la o valoare simplă (1, 2 sau 5 ori o putere a lui zece). Încă nu o puteți stabili singuri. Linia metodei spune mărimea celulei și numărul lor. Celulele mai mici sunt mai precise de-a lungul marginilor; pe celule întregi, între plane netede, rezultatul este exact.

## De reținut

- Doar aria din interiorul liniilor de intersecție cu terenul este numărată. Terenul din afara lor rămâne neschimbat.
- O platformă sau un coridor cu o problemă nu este sistematizat și nu adaugă nimic. Dacă blocul spune „Nu există încă volume: o platformă trebuie să se sistematizeze fără probleme.”, căutați o casetă roșie deasupra lui.
- Acolo unde elementele se suprapun, cel mai recent l-a înlocuit pe cel anterior în interiorul liniei sale de intersecție cu terenul, iar suprapunerea este numărată o singură dată.
- Nu se aplică niciun coeficient de umflare sau contracție. Înmulțiți singuri rezultatele dacă aveți nevoie de volume în teren natural, afânat sau compactat.
- Decaparea stratului vegetal, adâncimile pavajului și ale fundației de balast și volumele de prisme TIN-la-TIN nu sunt disponibile încă.

## Verificarea unui rezultat

- Activați {{ui:Proiectat (gradat)}} sub **Afișare** și priviți curbele de nivel din interiorul liniilor de intersecție cu terenul.
- Treceți cursorul peste zona sistematizată: bara de stare arată **Teren** și **Sistematizat**. Diferența este adâncimea debleului sau a rambleului în acel punct.
- Pentru un coridor, citirea din vizualizarea profilului arată debleul sau rambleul pe axă la fiecare pichet.
