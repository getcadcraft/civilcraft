---
title: Gaisa elektrolīnijas zīmēšana
summary: Novietojiet balstus plānā, ļaujiet CivilCraft noteikt katra balsta lomu un posmus starp gala balstiem, un pārvietojiet balstus plānā vai elektrolīnijas garenprofilā.
keywords: gaisa līnija, balsts, stabs, laidums, posms, gala balsts, leņķis, piekare, profils, augstums, šķērsstienis, stiepe, balsta trose
from: b8e5e272
---

## Zīmējiet to

1. Jābūt virsmai: zeme zem līnijas nāk no tās ([Virsmas veidošana](topic:build-surface)). Balstam bez zemes zem tā ir sarakstā **Pārbaudes**; tā vietā ierakstiet tā **Zemes līmeni** Rekvizītos.
2. Noklikšķiniet {{ui:Līnija}} grupā Elektrolīnijas un noklikšķiniet katru balstu plānā.
3. Veiciet dubultklikšķi uz pēdējā vai nospiediet {{key:Enter}}.

Līnija saņem vadītāju, balstu un aprīkojumu, ko pēdējo reizi izmantojāt šajā datorā (pirmajā reizē: bibliotēkas piemēri). Mainiet tos Rekvizītos.

## Līnija Rekvizītos

Atlasiet līniju (noklikšķiniet uz laiduma), lai iestatītu tās **Vadītājs**, **Vadītāji uz ķēdi**, **Ķēdes**, **Spriegums**, **Atstatuma noteikums**, ko tai jāsaglabā pāri zemei, un aprīkojumu **Uz katra balsta** (šķērsstienis, izolatori, savienojumi). Tabulā uzskaitīti tās **posmi** ar katra noteicošo laidumu, ikdienas spriegumu un slodzes gadījumu, kas to nosaka.

## Balsti

Noklikšķiniet uz balsta, lai to atlasītu. Rekvizītos:

- **Balsts**: tā bibliotēkas vienums. Kad tas ir pārāk vājš, {{ui:Izmantot …}} ieliek mazāko tāda paša materiāla balstu jūsu bibliotēkā, kas notur slodzi.
- **Loma**: Automātiski, Piekare, Leņķis vai Gala balsts. Automātiski nozīmē: pirmais un pēdējais balsts ir gala balsti; pagriezienis virs noteikumu kopas leņķa padara leņķa balstu; lielāks pagriezienis — gala balstu.
- **Augstums virs zemes**: tukšs ņem to no bibliotēkas vienuma (tā garums mīnus dziļums zemē).
- **Arī šim balstam**: papildu aprīkojums, piemēram, **stiepe** (atbalsta trose). Balstīts balsts nodod līnijas spriegumu savai stiepei.
- **Esošais balsts**: tas tiek pārbaudīts kā citi, bet neiekļauts daudzumos.

{{ui:Balsts}} pievieno balstu tuvākajā laidumā jūsu klikšķim. Velciet balstu plānā, lai to pārvietotu. Dzēst noņem to (līnijā paliek vismaz divi).

Posmi iet starp gala balstiem: posmā vadītājs brīvi iet cauri piekares skavām, tāpēc viens spriegojums attiecas uz visu posmu.

## Līnijas garenprofils

Noklikšķiniet {{ui:Garenprofils}} (vai **Garenprofils** līnijas Rekvizītos). Panelis zem plāna rāda zemi gar līniju, katru balstu no zemes līdz tā augšai, zemākā vadītāja fāzi pie **Slodzes gadījuma**, ko izvēlaties, un atstatumu, ko līnijai jāsaglabā, kā punktētu līniju. Laidums, kas neiztur, ir sarkans; skaitlis zem katra laiduma ir tā zemākais atstatums.

- **Līnija** izvēlas rādāmo gaisa līniju. Citas līnijas vai tās balsta izvēle plānā pārslēdz profilu uz to.
- Pārvietojiet rādītāju pāri profilam: vadotnes līnija seko tam, un etiķete rāda attālumu pa līniju, zemi, vadītāju un atstatumu tur (un norāda, ja atstatums ir mazāks par līnijas noteikumu).
- {{ui:Mērīt}} profila joslā: noklikšķiniet divus punktus, lai iegūtu attālumu šķērsām, augstumu starpību, taisno attālumu un slīpumu starp tiem. Klikšķis tuvu zemei, vadītājam vai balsta augšai piesaistās tam. Lai apturētu, vēlreiz noklikšķiniet {{ui:Mērīt}}.
- Šķēršļi, ko līnija šķērso, paceļas no zemes: zīmētie kā joslas, ainavas augi kā to vainagi, sienas kā joslas (skatiet [Elektrolīniju pārbaudes](topic:power-line-checks#clearances)). Kabeļu maršruti un caurules, ko līnija šķērso, atzīmēti zem zemes pie to augšas ar nosaukumu.
- Velciet balstu sāniski, lai to pārvietotu gar līniju.
- Velciet tā augšu uz augšu vai uz leju, lai iestatītu augstumu virs zemes.
