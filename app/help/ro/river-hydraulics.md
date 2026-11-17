---
title: Profile ale suprafeței apei dintr-un râu
summary: Modelați un râu din suprafața terenului și calculați profile staționare ale suprafeței apei prin metoda pasului standard: niveluri ale apei, energie, viteze, numere Froude și extinderea inundației pe plan. O funcție de laborator; fiecare rezultat necesită verificarea unui inginer.
keywords: dig de protecție, zonă de curgere ineficientă, editor de secțiuni, râu, hidraulică, profil al suprafeței apei, remuu, metoda pasului standard, curgere staționară, 1d, secțiuni transversale, manning, rugozitate, capacitate de transport, adâncime critică, adâncime normală, froude, linia energiei, extinderea inundației, luncă, inundație, maluri, lungimi de tronson, contracție, expansiune, subcritic, supracritic, regim mixt, salt hidraulic
from: fb8bf425
---

CivilCraft calculează profile staționare ale suprafeței apei, unidimensionale, de-a lungul unui râu: pentru fiecare debit introdus, nivelul apei la fiecare secțiune transversală, din bilanțul energetic între secțiunile vecine (metoda pasului standard). Funcția se află în laborator cât timp este verificată.

**Doar ajutor de proiectare.** Nivelurile apei necesită verificarea unui inginer calificat înainte ca cineva să se bazeze pe ele: un model 1D valorează cât secțiunile, valorile de rugozitate, lungimile tronsoanelor și frontierele sale, și nu cunoaște podurile, podețele sau debitul care iese din râu.

## Trasarea râului

1. Construiți mai întâi suprafața terenului existent (puncte, linii de rupere sau un TIN deschis).
2. Sub **Suprafață** › {{ui:More}}, alegeți {{ui:River}}.
3. Faceți clic de-a lungul axei râului **de la amonte spre aval**, apoi apăsați {{key:Enter}} sau faceți dublu clic.

CivilCraft taie o secțiune perpendiculară pe axă la fiecare 50 m (200 ft), cu 100 m (300 ft) pe fiecare parte, din teren. Stațiile râului se măsoară de la capătul din aval, deci cresc spre amonte. Malurile pornesc ca o estimare, la 10 m (30 ft) de o parte și de alta a punctului cel mai jos al fiecărei secțiuni.

Pentru a adăuga o secțiune acolo unde râul se îngustează sau unde se află o structură, selectați râul, faceți clic pe {{ui:Add a section}} și trasați o linie de tăiere peste el (în orice sens: este întoarsă să meargă de la stânga la dreapta privind spre aval).

## Configurarea râului

Selectați râul pentru a-l vedea în **Proprietăți**:

- **Regimul de curgere**: subcritic (cazul obișnuit: calculat spre amonte din frontiera din aval), supracritic (calculat spre aval din frontiera din amonte) sau mixt (ambele, apoi cel cu forța specifică mai mare la fiecare secțiune; o previzualizare).
- **Profilele de debit**: un nume și un debit pentru fiecare (de exemplu un debit de 10 ani și unul de 100 ani) și frontiera la capătul din aval (și la capătul din amonte când regimul nu este subcritic): **Adâncime normală** cu o pantă a energiei (panta patului este o primă estimare), o **Cotă a suprafeței apei** cunoscută sau **Adâncime critică**.
- **Secțiunile din teren**: distanța, cât de departe la stânga și la dreapta, estimarea malurilor și cele două valori n Manning; {{ui:Cut sections again}} înlocuiește secțiunile (un pas de anulare).
- **Tabelul secțiunilor**: pentru fiecare secțiune, decalajele malurilor stâng și drept, n-ul albiei și n-ul lunii, lungimile tronsoanelor până la următoarea secțiune din aval (luncă stângă, albie, luncă dreaptă; măsurate de pe plan la început) și coeficienții de contracție și expansiune (0.1 și 0.3 la început: tranziții treptate). {{ui:Edit}} deschide editorul de secțiuni (urmează); un punct după el înseamnă că secțiunea are un dig sau o zonă ineficientă.

Fiecare modificare este un pas de anulare ({{key:Mod+Z}}).

## Editarea unei secțiuni: maluri, diguri și zone ineficiente

{{ui:Edit}} pe o secțiune desenează terenul și vă lasă să trageți ceea ce citește solverul: **malul stâng și drept** (ele împart secțiunea în luncă stângă, albia principală și luncă dreaptă), un **dig** de fiecare parte și **zone de curgere ineficientă**. Fiecare reper poate fi mutat și cu tastele săgeți, iar fiecare număr poate fi scris lângă grafic. {{ui:Apply}} este un pas de anulare.

- Un **dig** are o poziție (decalaj) și o cotă a crestei. Terenul de dincolo de el, departe de râu, este scos din râu cât timp suprafața apei este sub creastă: aria, perimetrul udat și capacitatea de transport sunt lăsate afară. Deasupra crestei întreaga secțiune contează din nou. Un dig stă în afara malului pe care îl protejează; unul în interiorul malurilor este semnalat.
- O **zonă de curgere ineficientă** reține apa, dar nu transportă debit (un buzunar în spatele unui rambleu, apă moartă lângă accesul la un pod). Dați cele două decalaje ale sale și, dacă doriți, un nivel al apei sub care zona este ineficientă ({{ui:always}} când este goală): deasupra acelui nivel curge ca restul. Una care acoperă o parte din albia principală este semnalată.
- Între două secțiuni, extinderea inundației lasă uscat terenul din spatele unui dig pe care îl au ambele secțiuni, cât timp suprafața apei de acolo este sub creastă (linia dintre cele două creste este dreaptă).

## Calcularea și citirea rezultatelor

Faceți clic pe {{ui:Water surface profiles}}. Pentru profilul ales obțineți:

- un **grafic** de-a lungul râului (curgerea de la stânga la dreapta): fundul albiei, malurile, suprafața apei, linia energiei și suprafața apei critice; secțiunile menținute la adâncime critică sunt încercuite;
- un **tabel** pe secțiune: stația râului, debitul, fundul albiei, suprafața apei, suprafața apei critice, linia energiei, adâncimea, viteza în albie și în total, numărul Froude al albiei, aria secțiunii, lățimea la suprafață, debitul din fiecare luncă și din albie, panta energiei și avertismentele;
- **avertismente** în cuvinte simple, de exemplu o secțiune setată la adâncime critică, apă peste capetele unei secțiuni sau o schimbare mare a capacității de transport între două secțiuni (adăugați secțiuni între ele).

{{ui:Table (CSV)}}, {{ui:Report}} (text simplu cu metoda, frontierele și fiecare tabel) și {{ui:Plot (SVG)}} se salvează în fișierele descărcate. Fiecare conține linia de verificare.

Bifați {{ui:Show the flood extent}} în **Proprietăți** ca să umbriți zona udă pe plan pentru profilul ales, cu linia apei trasată acolo unde adâncimea este zero. Între secțiuni suprafața apei este orizontală peste râu și variază liniar cu stația râului. Terenul din spatele unui dig rămâne uscat cât timp apa este sub creastă. Alte terenuri joase din coridorul râului pe care apa nu le poate atinge (de exemplu în spatele unui rambleu de drum) sunt totuși umbrite: verificați-le.

## Pe desen și în Probleme

Liniile râului merg pe plan, în PDF și în DWG, pe straturile lor proprii: **C-WATR-CNTR** (axa), **C-WATR-SCTN** (fiecare linie de tăiere, cu stația sa) și **C-WATR-FLOD** (linia apei a extinderii inundației, când {{ui:Show the flood extent}} este bifată pentru un profil). Avertismentele râului (o secțiune la adâncime critică, apă peste capetele secțiunii, o schimbare a capacității de transport care cere mai multe secțiuni, un bilanț energetic care nu s-a închis, un dig în interiorul malurilor) merg și în panoul **Probleme**, despre râu, plasate la secțiunea de unde provin.

## Cum se calculează

- Energia între două secțiuni: WS₂ + α₂V₂²/2g = WS₁ + α₁V₁²/2g + L·Sf + C·|α₂V₂²/2g − α₁V₁²/2g|.
- Capacitatea de transport prin subdiviziune: fiecare luncă este împărțită acolo unde se schimbă n-ul ei, K = Σ (1/n)·A·R^(2/3) (1.486/n în unități SUA); albia este o singură porțiune, cu un n compus când n-ul ei se schimbă. α vine din modul în care se împarte capacitatea de transport.
- Panta de frecare prin capacitatea medie, Sf = ((Q₁ + Q₂)/(K₁ + K₂))², pe lungimea tronsonului ponderată cu debitul.
- Coeficient de contracție când curgerea accelerează spre aval, de expansiune când încetinește.
- Adâncimea critică = energia specifică cea mai mică. Fiecare nivel al apei se rezolvă pe un interval, astfel încât nu sare niciodată de cealaltă parte a criticului; când nu există răspuns, este setat la adâncimea critică și semnalat.

Programul este verificat față de adâncimea normală Manning, adâncimea critică într-o albie dreptunghiulară și exemplul de remuu al lui Chow (*Open-Channel Hydraulics*, 1959, capitolul 10), integrat independent. Aceeași metodă este folosită de programele obișnuite 1D pentru râuri, deci un calcul manual sau notițele unui student se potrivesc.

## Podețe și poduri

În **Proprietățile** râului, sub **Podețe și poduri**, {{ui:Add a culvert}} sau {{ui:Add a bridge}} pune una între două secțiuni (fiecare tronson păstrează cel puțin două). Profilul de sub ea nu se schimbă; suprafața apei chiar deasupra ei vine din structură, iar profilul continuă spre amonte de acolo. **Rezultate** adaugă un tabel pentru fiecare structură: nivelul din aval, nivelul din amonte, ce control guvernează, debitul prin deschidere și debitul peste drum sau tablier. Doar pentru curgere subcritică.

- **Podeț** (cutie sau rotund, unul sau mai multe tuburi egale). Controlul la intrare este curgere prin deversor cât timp intrarea este liberă și curgere prin orificiu odată ce este înecată, amestecate între un nivel din amonte de una până la unu și jumătate din înălțimea podețului. Controlul la ieșire este bilanțul energetic: pierderea la intrare, frecarea și înălțimea de viteză la ieșire, peste cel mai mare dintre nivelul din aval și mijlocul adâncimii critice și coronamentului, minus căderea de-a lungul tubului. Nivelul din amonte este cel mai mare dintre cele două. Bifați **Apa poate trece peste drum** și curgerea prin deversorul drumului împarte debitul cu tuburile.
- **Pod.** Deschiderea este secțiunea de sub pod, tăiată la culee, cu fiecare pilon ca o arie care nu transportă debit. Suprafața apei din deschidere vine din secțiunea de dedesubt (coeficient de expansiune), iar secțiunea de deasupra din deschidere (coeficient de contracție). Dacă deschiderea nu poate trece debitul la acel nivel din aval, curge la adâncime critică, iar podul este semnalat ca obturat. Dacă apa ajunge la talpa inferioară, curgerea devine sub presiune (de tip vană cât timp nivelul din aval este sub talpă, înecată deasupra ei), iar apa peste tablier adaugă curgere prin deversor; nivelul din amonte este cel la care acestea adună debitul.

Coeficienții (debit, pierdere la intrare, deversor) sunt valori implicite rotunde, introduse de program. Schimbați-i pentru proiectul dvs. Nu sunt graficele ajustate pe care le tipăresc manualele de proiectare a podețelor, deci tratați nivelul din amonte al unui podeț aproape de limită ca pe o estimare. Apa peste un drum sau un tablier, intrarea înecată, deschiderea obturată și curgerea rapidă într-un tub sunt afișate în **Probleme**.

## Curgere nepermanentă

{{ui:Unsteady flow…}} în **Proprietățile** râului dirijează un hidrograf de viitură de-a lungul secțiunilor. Scrieți debitul de intrare ca ore și debite, o pereche pe linie, panta din aval (adâncime normală) și cât timp să ruleze. Pornește de la suprafața apei staționare la primul debit și rezolvă ecuațiile unidimensionale complete (schema implicită în patru puncte, ponderată 0.6 în timp). Obțineți nivelul și debitul maxim la fiecare secțiune, cu ora în care apar, un grafic al debitului la cele două capete și verificarea volumului (intrat, ieșit și modificarea stocată). Se verifică dacă o curgere staționară rămâne staționară, un salt în debitul de intrare care se termină la profilul staționar al noului debit, închiderea volumului și viteza undei de viitură față de unda cinematică. Curgere subcritică, un singur tronson, fără debit lateral și fără podețe sau poduri în interiorul rulării.

## Confluențe

Tronsoane care se unesc pentru a curge într-o singură ieșire: debitele se adună, iar suprafața apei de la capătul tronsonului din aval este dusă în sus până la capetele tronsoanelor care se unesc la el (aceeași suprafață a apei la confluență, metoda simplă: fără unghi și fără moment, deci se potrivește cu numere Froude mici). Modelul și testele sunt la locul lor (`river-structures.js`); un panou pentru a uni două râuri pe plan nu este încă realizat.

## Încă nerealizat

Deversoare și stavile ca structuri proprii, un panou pentru confluențe, structuri în interiorul unei rulări nepermanente și curgere supracritică nepermanentă. O rulare cu regim mixt semnalează un salt hidraulic între două secțiuni, dar nu îl plasează.

**Unde se unesc râurile.** În Proprietățile unui râu, „Curge în” numește râul în care se unește. Râurile care se unesc sunt rezolvate împreună: râul în care curg transportă suma debitelor lor, iar fiecare dintre ele se termină la suprafața apei din prima secțiune a acelui râu (metoda egalei suprafețe a apei; lasă afară unghiul și momentul debitelor). Pentru a uni un râu principal cu un pârâu, trasați un scurt râu sub confluență și lăsați ambele să curgă în el. Rezultatele arată un tabel de confluență. Valorile implicite din aceste rezultate (contracție 0.1, expansiune 0.3, albie dintr-o singură porțiune cu o rugozitate compusă, regimul mixt după forța specifică) rămân până când un inginer le verifică, iar Rezultatele o spun.
