---
title: Depanare
summary: Simptome, cauze și remedieri pentru problemele întâlnite în CivilCraft, cu mesajele exacte pe care le afișează aplicația.
keywords: probleme, erori, nu funcționează, remediere, ajutor, mesaje, depanare, respins, lipsă, greșit, inversat, curbe de nivel lipsă
from: a9f7dedc
---

Mesajele apar în bara de stare din dreapta jos, în casete din panourile din stânga și din dreapta și în casetele de dialog. Sunt citate aici așa cum le afișează aplicația.

## Deschiderea fișierelor

**„Fișierul depășește 200 MB; CivilCraft nu deschide încă fișiere atât de mari.”**
Împărțiți fișierul de puncte sau reduceți datele înainte de deschidere.

**„Nu s-a putut deschide site.json: Acesta nu este un fișier de proiect CivilCraft.”**
Fișierul se termină în `.json` sau începe cu `{`, dar nu este un proiect CivilCraft. Fișierele de puncte nu trebuie să înceapă cu `{`.

**„Nu s-a putut deschide … Acest fișier de proiect provine dintr-un CivilCraft mai nou (versiunea 2).”**
Proiectul a fost salvat de o versiune mai nouă. Deschideți-l acolo sau exportați din el LandXML.

**„Nu s-a putut deschide … Acesta este XML, dar nu LandXML (elementul său rădăcină este <…>).”**
Fișierul este alt tip de XML. Exportați LandXML din celălalt program.

**„… nu are puncte, suprafețe TIN sau aliniamente pe care CivilCraft le poate citi.”**
Tot ce este în fișier este ceva ce CivilCraft omite (de exemplu doar suprafețe de grilă sau doar aliniamente spirale). Restul mesajului spune ce a fost acolo. Vezi [LandXML: ce se citește și ce se scrie](topic:landxml-reference).

**„Exemplul nu a putut fi încărcat: …”**
{{ui:Deschidere sit de exemplu}} citește un fișier de pe site-ul CadCraft. Fără conexiune funcționează doar dacă CivilCraft a fost salvat pentru utilizare offline (butonul din bara aplicației afișează {{ui:Pregătit pentru offline}}). Conectați-vă la internet, faceți clic pe {{ui:Salvare pentru offline}} și de atunci funcționează și offline. Vezi [Offline](common:offline).

**{{ui:Salvare pentru offline}} afișează {{ui:Nu s-a putut salva}}.**
Unele fișiere nu s-au descărcat. Verificați conexiunea și faceți clic din nou pe buton.

**{{ui:Salvare pentru offline}} afișează {{ui:Modul offline nu este disponibil}}.**
Această fereastră a browserului nu poate păstra o copie offline, de obicei pentru că este o fereastră privată sau calculatorul este administrat. Deschideți CivilCraft într-o fereastră normală.

**Offline, aplicația nu se deschide deloc.**
Nu a fost salvată pentru utilizare offline în acest browser, sau browserul a șters datele site-ului (Safari face asta pentru site-urile nevizitate câteva săptămâni). Conectați-vă la internet, deschideți CivilCraft și faceți clic pe {{ui:Salvare pentru offline}}.

**Copia offline este o versiune mai veche.**
Faceți clic pe {{ui:Pregătit pentru offline}}, apoi pe {{ui:Salvare din nou (obținere a celei mai noi versiuni)}} cât sunteți conectat la internet.

**Un fișier apare șters în caseta de deschidere.**
Caseta listează doar fișierele de puncte, LandXML și de proiect după terminațiile lor. Trageți fișierul pe plan în loc sau redenumiți-l în `.txt`.

## Importul punctelor

**„Nu s-a putut citi niciun punct din acest fișier.”**
Alegeți manual ordinea coloanelor în **Coloane**. Dacă nimic nu funcționează, deschideți fișierul într-un editor de text și verificați că există un punct pe rând, cu numere în el.

**Situl pare oglindit, rotit sau întins într-o linie.**
Nordul și estul sunt inversate. Sumarul spunea „estimat din numărul de coloane”. Alegeți PENZD în loc de PNEZD (sau invers) în **Coloane**, sau importați din nou.

**Puncte departe de rest, iar planul s-a micșorat până la un punct.**
Un rând are o greșeală de tastare într-o coordonată, sau fișierul amestecă sisteme de coordonate. Găsiți punctul (faceți clic pe el ca să vedeți numărul) și corectați fișierul.

**Rânduri listate sub „Rânduri necitite”.**
Vezi tabelul din [Importul punctelor topografice](topic:import-points#rows-that-are-not-read).

**Punctele mele vechi au dispărut.**
Importul unui fișier de puncte înlocuiește toate punctele și șterge istoricul anulărilor. Deschideți proiectul salvat ca să le recuperați.

## Modelul de teren

**„Model de teren: încă nerealizat” cu o casetă roșie.**
Caseta spune de ce: „Un model de teren are nevoie de cel puțin trei puncte cu cote.”, „Punctele sunt toate pe o linie: nu există triunghiuri.”, „Nu există puncte cu cote.”, „Limita nu se suprapune cu punctele.” sau „Nu mai rămân triunghiuri în interiorul limitei.” Verificați ordinea coloanelor, grupurile de puncte (sunt {{ui:Omis}}?) și limita.

**Curbele de nivel taie drept peste un șanț sau o creastă.**
Linia respectivă nu este o linie de rupere. Setați grupul ei la {{ui:Linie de rupere}}, sau desenați-o cu instrumentul {{ui:Linie de rupere}}. Vezi [Construirea și rafinarea modelului de teren](topic:build-surface).

**Un grup de linii de rupere desenează zig-zag.**
Grupul conține mai mult de o linie, sau punctele sale nu sunt numerotate de-a lungul liniei. Setați grupul înapoi la {{ui:Puncte}} și desenați fiecare linie cu instrumentul {{ui:Linie de rupere}}.

**Triunghiuri lungi și subțiri pe margine.**
Desenați o limită ({{key:O}}) sau setați **Cea mai lungă muchie exterioară**.

**Nicio curbă de nivel, deși modelul este construit.**
Fie {{ui:Curbe de nivel}} este dezactivat sub **Afișare**, fie intervalul este atât de mic încât ar fi peste 2.000 de niveluri de curbe. Alegeți un interval mai mare.

**Liniile de rupere sau limita nu schimbă nimic.**
Modelul a venit din LandXML („Model de teren (din LandXML)”). Este folosit așa cum este. Faceți clic pe {{ui:Reconstruire model de teren din puncte}} ca să construiți din puncte.

**„Încă nu există model de teren: deschideți mai întâi punctele topografice.”**
Liniile de rupere, limita și platforma au nevoie de un model de teren existent. Importați mai întâi punctele.

**„Faceți clic pe un punct topografic cu cotă: o linie de rupere ia cotele punctelor.”**
Instrumentul {{ui:Linie de rupere}} alege doar puncte topografice. Măriți și faceți clic pe un punct (un pătrat portocaliu arată pe care îl va lua).

## Desenarea

**Ultimul meu punct a dispărut când am făcut dublu clic ca să termin.**
În această versiune, dublu clicul termină aliniamentul, platforma, linia de rupere sau limita, dar scoate punctul pe care l-ați apăsat dublu. Faceți clic o dată pe ultimul punct și apăsați {{key:Enter}}. Folosiți {{key:Mod+Z}} dacă s-a întâmplat deja, apoi desenați din nou.

**Nu pot termina un desen pe tabletă.**
Terminarea necesită {{key:Enter}}; nu există încă buton pe ecran. Conectați o tastatură. Vezi [Mouse, touchpad și atingere](topic:keyboard#mouse-trackpad-and-touch).

**Trăgând ca să plasați un punct, planul se deplasează.**
O tragere de mai mult de câțiva pixeli deplasează planul în fiecare instrument. Faceți clic fără să mișcați.

**„Un aliniament are nevoie de cel puțin două puncte.” / „O platformă are nevoie de cel puțin trei colțuri.” / „O rețea de conducte are nevoie de cel puțin două structuri.”**
Ați apăsat {{key:Enter}} prea devreme. Desenul este anulat; începeți din nou.

**Tastele precum A sau G nu fac nimic.**
O casetă de text sau o listă din panou are încă focusul, deci literele merg acolo. Faceți clic o dată pe plan, apoi apăsați tasta. Pe Mac, tasta de ștergere este Backspace pentru browser: folosiți Fn și Delete ca să ștergeți o selecție.

## Aliniamente și profiluri

**„Curbele din PI 2 și PI 3 se suprapun: … Folosiți raze mai mici.”**
Două curbe au nevoie de mai multă tangentă decât există între PI-urile lor. Micșorați una sau ambele raze din tabelul PI sau depărtați PI-urile unul de altul.

**„PI 3 se întoarce brusc înapoi; nu poate primi o curbă.”**
Aliniamentul se întoarce asupra lui însuși la acel PI. Mutați sau eliminați PI-ul.

**„Acest aliniament nu are teren sub el de la care să pornească.”**
Aliniamentul este în afara suprafeței. Mutați-l pe suprafață sau adăugați PVI-uri făcând clic cu {{ui:Adăugare PVI}} activat.

**„Curba verticală din PVI 3 (L = …) începe înainte ca curba sau PVI-ul dinaintea ei să se termine.” / „… trece de următorul PVI.”**
Scurtați lungimea curbei sau depărtați PVI-urile.

**„Există deja un PVI la …”**
Există un PVI la acel pichet. Faceți clic în altă parte sau trageți PVI-ul existent.

**Vizualizarea profilului este goală: „Desenați un aliniament ca să vedeți profilul său.”**
Nu există aliniament, sau cel selectat are erori.

## Coridoare și platforme

**„Coridorul are nevoie de un profil de proiect fără erori.”**
Începeți un profil de proiect ({{ui:Pornire din teren}}) și reparați suprapunerile de curbe.

**„… taluzurile laterale ies de pe suprafață înainte de a întâlni terenul.” / „… liniile de taluz ies de pe suprafață înainte de a-l întâlni …”**
Sistematizarea ajunge la marginea suprafeței înainte de a întâlni terenul. Mutați proiectul spre interior, din margine, sau apropiați-l de teren. O platformă nouă desenată parțial în afara suprafeței poate începe la cota 0: introduceți o cotă reală.

**„Liniile de intersecție cu terenul ale coridorului se intersectează …” / „Linia de intersecție cu terenul se intersectează cu sine …”**
Taluzurile din laturi diferite se întâlnesc: curbe strânse, platforme înguste, săpături adânci sau umpluturi înalte. Folosiți o rază mai mare, un ansamblu mai îngust, o platformă mai largă sau taluzuri mai abrupte.

**„Nu există încă volume: o platformă trebuie să se sistematizeze fără probleme.”**
Reparați problemele listate în caseta roșie de deasupra.

**{{ui:Proiectat (gradat)}} este estompat.**
Nicio platformă sau coridor nu este încă sistematizat.

## Conducte

**„P2 nu are încă radiere.”**
Faceți clic pe {{ui:Stabilirea radierelor ei din reguli}} sau introduceți radierele.

**„P1: nu există teren la S1 de la care să pornească.”**
Structura din amonte este în afara suprafeței și nu are margine. Introduceți o margine pentru ea.

**Fiecare conductă este marcată după ce am mutat o structură.**
Mutarea unei structuri nu schimbă radierele. Faceți clic pe {{ui:Stabilirea fiecărui radier din reguli}}.

Toate mesajele rețelei sunt explicate în [Trasarea unei rețele de conducte gravitaționale](topic:pipe-network#read-and-fix-problems).

## Salvarea și exportul

**„Nimic de exportat încă.” / „Nimic de trasat încă.”**
Proiectul este gol. Importați mai întâi punctele.

**Nu găsesc fișierul salvat.**
Este în descărcările browserului (de obicei în dosarul Descărcări). Vezi [Fișiere pe care le puteți deschide, salva și exporta](topic:files#where-the-files-go).

**Scara PDF este greșită pe hârtie.**
Tipăriți la 100% sau la dimensiunea reală, nu la „potrivire în pagină”.

**Semne de întrebare în textul PDF.**
Numele sau descrierile folosesc caractere în afara setului Europei de Vest. Mesajul de stare le numără. Redenumiți cu caractere simple.

**Trasarea este tăiată la margini.**
Scara este prea mare pentru foaie. Alegeți scara marcată „(se încadrează)”, o foaie mai mare sau {{ui:Ce este pe ecran}}.

**{{key:Mod+P}} a deschis caseta de tipărire a browserului.**
Pagina nu avea focusul. Închideți caseta, faceți clic pe plan și apăsați din nou {{key:Mod+P}}, sau faceți clic pe {{ui:PDF}}.

## Aplicația în sine

**Ecranul este gol sau bara de instrumente nu face nimic.**
Folosiți o versiune actuală de Chrome, Edge, Firefox sau Safari și reîncărcați. Vezi [Browsere](common:browsers).

**Aplicația este lentă cu un fișier mare de puncte.**
Dezactivați {{ui:Triunghiuri}}, {{ui:Etichete de puncte}} și {{ui:Benzi de cote}} și folosiți un interval de curbe de nivel mai mare. Suprafețele foarte mari au nevoie de un moment ca să se reconstruiască după fiecare modificare.

**Browserul întreabă „Părăsiți site-ul?”**
Proiectul are modificări nesalvate. Rămâneți, salvați cu {{key:Mod+S}}, apoi plecați.
