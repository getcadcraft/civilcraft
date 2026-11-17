---
title: Proiectarea unei căi ferate
summary: Transformați un aliniament într-o cale ferată: tranziții ale curburii (clotoidă, parabolă cubică, Bloss, Helmert, semiundă sinusoidală, sinusoidă), devers pe fiecare curbă, cu devers de echilibru, insuficiență și exces, limite de devers și de geometrie a căii ca avertismente, aparate de cale și traversări pe stații, un gabarit de liberă trecere măturat de-a lungul liniei și o cale cu șine, traverse și strat de piatră spartă, construită ca un coridor, în plan, secțiuni, profil, 3D și cantități.
keywords: cale ferată, șină, cale, linie, metrou, tramvai, devers, superelevație, insuficiență de devers, exces de devers, devers de echilibru, tranziție, curbă de tranziție, clotoidă, parabolă cubică, bloss, helmert, semiundă sinusoidală, cosinus, ecartament, ecartament normal, ecartament larg, ecartament metric, ecartament îngust, traversă, piatră spartă, subbalast, platforma căii, banchetă, axe între căi, 60E1, 54E1, UIC60, 115RE, 136RE, gradient de devers, viteză de variație a deversului, aparat de cale, macaz, ac, traversare, numărul inimii, inimă, lungime de aparat, curbă de închidere, viteză pe ramura deviată, gabarit, gabarit de liberă trecere, gabarit de structură, peron, decalaj față de peron, distanță între căi, gradient, curbă verticală, rază minimă, devers LandXML
from: 99de9745
---

Orice aliniament poate fi o cale ferată. Curbele lui primesc atunci tranziții ale curburii și un devers (superelevația șinelor), iar coridorul său este construit ca o cale: șine pe traverse, pe un strat de piatră spartă, așezată în teren ca un drum. Aparatele de cale și traversările se adaugă pe stații, iar un gabarit de liberă trecere poate fi măturat de-a lungul ei și verificat față de ceea ce se află lângă cale.

Toate valorile de mai jos sunt **valori provizorii**, nu standarde. Căile ferate își stabilesc limitele după viteza liniei, tipul căii și țară; stabiliți-le după standardul propriei căi ferate. CivilCraft nu include niciun tabel național.

## Transformarea aliniamentului în cale ferată

1. Selectați aliniamentul și găsiți **Cale ferată** în Proprietăți.
2. Bifați **Acest aliniament este o cale ferată**. Fiecare modificare este un pas de anulare.
3. Setați **Viteza de proiectare** în partea de sus a Proprietăților aliniamentului: este viteza liniei, față de care se verifică deversul. **Cele mai lente trenuri** (în blocul Cale ferată) este viteza față de care se verifică excesul de devers.

## Tranziții

Dați fiecărei curbe o lungime de spirală la fiecare capăt în tabelul PI (**Spirală la intrare**, **Spirală la ieșire**), apoi alegeți tipul ei în tabelul de curbe din blocul Cale ferată, sau **Tranziție pentru fiecare curbă**:

| Tip | Curbura de-a lungul tranziției |
|---|---|
| Clotoidă | crește uniform (spirala drumurilor) |
| Parabolă cubică | y = x³ / (6·R·L), cu L măsurat pe tangentă; curba în sine este puțin mai lungă |
| Bloss | 3u² − 2u³ din curbura completă (u = partea din lungime): începe și se termină blând |
| Helmert | două parabole, 2u² apoi 1 − 2(1 − u)² |
| Semiundă sinusoidală | (1 − cos πu) / 2 |
| Sinusoidă | u − sin(2πu) / 2π |

Toate, în afară de parabola cubică, se rotesc cu L / 2R, ca clotoida. Stațiile urmează lungimea reală. LandXML păstrează tipul (spiType clothoid, cubicParabola, bloss, biquadratic, cosine, sinusoid).

## Devers

Introduceți **Deversul** fiecărei curbe în milimetri. Tabelul arată pentru fiecare curbă:

- **Devers de echilibru** = G·v² / (g·R), G fiind distanța dintre axele șinelor (**Axe între șine**, ecartamentul plus lățimea capului șinei, dacă nu introduceți altă valoare). Cu G = 1500 mm, aceasta este formula cunoscută 11,8·V² / R (V în km/h, R în m).
- **Insuficiență** = devers de echilibru la viteza liniei − devers aplicat.
- **Exces** = devers aplicat − devers de echilibru la viteza celor mai lente trenuri.
- **Rampă**: cel mai abrupt gradient de devers de-a lungul rampelor sale, în milimetri pe metru.

Deversul crește pe fiecare tranziție, după forma curburii: liniar pentru clotoidă sau parabolă cubică, în formă Bloss pentru Bloss și așa mai departe. Un capăt de curbă fără tranziție are o rampă pe aliniamentul dinaintea sa, cât cere limita gradientului de devers, și aceasta se indică: deversul se modifică atunci în locul în care nu se modifică curbura.

**Deversul se rotește în jurul** indică ce șină rămâne pe profilul de proiect: **șina joasă** (cazul obișnuit), **șina interioară** sau **axa căii** (fiecare șină se mută cu jumătate din devers). Profilul de proiect este aici partea superioară a șinei.

**Diagrama devers** desenează înălțimea fiecărei șine deasupra profilului, de-a lungul stațiilor; vederea profilului și planșele de plan și profil primesc același lucru sub formă de bandă sub profil.

## Limite de devers și avertismente

**Cel mai mare devers aplicat**, **Cea mai mare insuficiență de devers**, **Cel mai mare exces de devers**, **Cel mai abrupt gradient de devers** și **Cea mai rapidă variație a deversului** (gradientul la viteza liniei, în mm/s) se verifică pe fiecare curbă. O valoare peste o limită este un avertisment în blocul Cale ferată și în panoul Probleme, cu limita și valoarea găsită. Fără viteză de proiectare, insuficiența și viteza de variație nu se verifică (o notă o spune).

## Calea

Setați **Ecartamentul** (presetări standard 1435 mm, larg, metric sau îngust, sau propriul), **Tipul șinei** (60E1, 54E1, 49E1, 115RE, 136RE: doar dimensiunile lor publicate), numărul de **Căi** și **Axele între căi**, apoi **Traverse și balast**: materialul traverselor, lungimea, lățimea, înălțimea și distanța; grosimea balastului sub traversă (la șina joasă), banheta, panta, cât de jos este partea sa superioară față de traverse; grosimea subbalastului, banheta dincolo de marginea balastului și panta transversală a platformei căii.

Apăsați **Construire cale**. Aceasta activează coridorul aliniamentului, construit ca o cale de-a lungul profilului de proiect: șinele și traversele se înclină odată cu deversul, platforma nu. Taluzele de degajare pornesc de la marginea banchetei, la tăietura și umplutura coridorului, iar calea se racordează la suprafața proiectată ca un drum.

- **Plan**: ambele șine ale fiecărei căi (stratul C-RAIL-TRAK) și, cu mai multe căi, axa fiecărei căi (C-RAIL-CNTR), pe ecran, în DXF, DWG, PDF și în planșele de plan și profil.
- **Secțiuni**: traversele, șinele, baza balastului și a subbalastului în fiecare secțiune.
- **3D**: șinele, fiecare traversă și patul de balast (Afișare › Cale), și în GLB, OBJ și USD.
- **Cantități**: lungimea căii, șinele (ambele șine ale fiecărei căi, de-a lungul propriei linii a fiecărei căi), traversele, patul de balast și balastul fără traverse, precum și subbalastul, prin metoda ariilor medii între secțiuni.

## Verificări ale geometriei căii

Pe lângă devers, blocul Cale ferată verifică linia în sine față de șase limite suplimentare (toate provizorii, toate ale dumneavoastră de stabilit):

- **Cel mai abrupt gradient** al profilului de proiect, în milimetri pe metru.
- **Cea mai mică rază a curbei verticale**, ca factor k în R ≥ k·V² (R în metri, V în km/h). O curbă verticală parabolică de lungime L între două gradienți are raza L împărțit la variația gradientului.
- **Cea mai scurtă curbă verticală**.
- **Cea mai mică rază a curbei** în plan (0 dezactivează verificarea).
- **Cel mai scurt arc sau aliniament drept**, ca secunde de parcurs la viteza liniei: un arc de cerc sau aliniamentul drept dintre două curbe, mai scurt decât această distanță, primește avertisment. 1,8 s este cunoscutul „jumătate din viteza în km/h, în metri”.
- **Viteza de variație a insuficienței de devers** de-a lungul fiecărei tranziții, în mm/s la viteza liniei.

**Geometria căii** listează cel mai abrupt gradient găsit și fiecare curbă verticală, cu raza ei și raza pe care o cere viteza liniei. O curbă verticală situată pe o tranziție sau pe o rampă de devers primește o notă. Fără profil de proiect sau fără viteză de proiectare, verificările care le cer sunt omise, iar o notă o spune.

## Aparate de cale și traversări

Sub **Aparate de cale și traversări**, apăsați **Adăugare aparat de cale**. Aparatul se plasează pe cel mai lung aliniament drept; se setează în tabel:

- **Stația vârfului acului**: unde începe aparatul pe acest aliniament.
- **Inima**: numărul inimii N (1:N). Unghiul inimii este 2·atan(1 / 2N).
- **Parte**: stânga sau dreapta, privind în sensul crescător al stațiilor.
- **Distanța de traversare** în metri: peste 0, aparatul devine o traversare către o cale paralelă aflată la această distanță (două aparate și aliniamentul drept dintre ele).

Tabelul arată **Lungimea de aparat** (de la vârful acului la inimă), **Raza** curbei de închidere și **Viteza pe ramura deviată** pe care o permite această rază, cu limita de insuficiență de devers și fără devers. **Creare cale** transformă ramura deviată într-un aliniament propriu (acul, curba de închidere, apoi drept înainte sub unghiul inimii), cu aceleași setări de cale ferată, gata de prelungit.

Planul desenează cele două șine deviate ale fiecărui aparat, axa sa, o marcă la vârful acului și la inimă și „1:N” (stratul C-RAIL-TURN), pe ecran și în DXF, DWG, PDF și planșe. Vederea 3D desenează șinele deviate la nivelul căii principale.

Forma este **provizorie**: un ac drept și o singură curbă de închidere, pornind de la numărul inimii. Un aparat construit urmează standardul căii ferate și desenul producătorului. Avertismente: un aparat care iese din aliniament, se află pe o curbă, o tranziție, un devers sau o curbă verticală, sau se suprapune cu altul; și o notă atunci când viteza liniei depășește viteza sa pe ramura deviată.

## Gabaritul de liberă trecere

Bifați **Măturare gabarit de liberă trecere de-a lungul acestei căi**. Alegeți **Conturul** (două forme provizorii, sau **Contur propriu**, introdus ca un punct pe linie: decalaj față de axa căii, apoi înălțime deasupra părții superioare a șinei, în metri), **Lungimea vehiculului** și **Axele boghiurilor** și, dacă există, **Marginea peronului** (parte, distanță față de axa căii, înălțime deasupra șinei).

În fiecare stație, conturul este înclinat odată cu deversul, în jurul șinei joase, și lărgit de curbă: mijlocul vehiculului se apropie cu b² / 8R, iar capetele se depărtează cu (L² − b²) / 8R (b distanța dintre axele boghiurilor, L lungimea vehiculului, R raza din acel loc, urmând tranziția). Blocul desenează secțiunea pe aliniamentul drept și acolo unde este cea mai lată și listează:

- **gabaritul cel mai lat** și locul lui,
- **axele între căi** comparate cu axele pe care le cer două gabarite vecine,
- spațiul rămas la **marginea peronului**, sau cât de mult pătrunde în el,
- fiecare linie a unui element, structură de conductă și alt aliniament de cale ferată găsit **în interiorul gabaritului**.

O linie a unui element cu cote de nivel este judecată față de contur la înălțimea sa deasupra șinei; fără profil de proiect, sau pentru un punct fără cotă, se judecă doar în plan, iar lista o spune. Planul arată cele două margini ale gabaritului (stratul C-RAIL-CLRN), cu o cruce la fiecare lucru aflat înăuntru.

Conturile oferite sunt **provizorii, nu ecartamentul vreunei căi ferate**. Introduceți gabaritul de structură al căii dumneavoastră înainte de a vă baza pe un rezultat.

## În alte programe

- **LandXML**: un aliniament de cale ferată se scrie cu tranzițiile sale (spiType) și un bloc `Cant`: ecartamentul, punctul de rotație, viteza liniei și o stație unde începe și se termină fiecare rampă de devers, cu deversul aplicat, deversul de echilibru și insuficiența. Deschiderea unui fișier LandXML cu un bloc `Cant` face ca aliniamentul respectiv să fie o cale ferată cu acele devers.
- **IFC**: aliniamentul cu segmentele sale de devers, șinele, traversele, balastul și subbalastul.

## Încă nerealizat

Aparate de cale în exportul IFC, familii de aparate dincolo de singura curbă de închidere (ace curbate, inimi cu ac mobil, traversări duble, romburi), reguli de gabarit cinematic (gabaritul este un contur fix cu deplasarea curbei), linii aeriene și semnalizare.

**Ce standard.** În blocul Cale ferată, „Standard de referință” ia valoarea Niciunul sau European (UIC și EN). Alegerea Europeanului indică documentele pe care le citează un proiect european (EN 13803 pentru parametrii aliniamentului, EN 13232 pentru ace și traversări, EN 15273 pentru gabarite, EN 13848 pentru calitatea geometriei căii) și oferă fiecărei limite o casetă pentru articolul din care provine. Niciun număr din niciun standard nu este încorporat: limitele de devers, insuficiență, exces, gradient și variație, geometria aparatelor de cale și gabaritul de structură sunt încă provizorii, iar fereastra o spune. Un inginer de căi ferate verifică fiecare valoare față de textul standardului și notează articolul alături, înainte ca ceva să fie construit. Africa de Sud și tabelele AREMA nu sunt în această versiune.
