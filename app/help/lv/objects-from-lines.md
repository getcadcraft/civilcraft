---
title: Objekti no līnijzīmējuma, saglabāti saistīti
summary: Izveidojiet bruģējumu, apstādītu laukumu, dobi, dzīvžogu, taku, sienu, apmali, pakāpienus, rampu, platformu, grāvi vai raksturlīniju no līnijas; tas seko, kad līnija pārvietojas, līdz pārtraucat saiti.
keywords: no līnijas, līnijzīmējums, DWG, DXF, saite, saistīts, sekot, regenerēt, pārtraukt saiti, raksturlīnija, raksturlīnija no līnijzīmējuma, importēts slānis, kontūra, supercad studio, zīmēšanas līnija
from: eb67a0c6
---

{{ui:No līnijas}} (Ainava › {{ui:Vairāk}}): noklikšķiniet raksturlīniju vai importēta DWG/DXF slāņa līniju vai kontūru. Slēgta līnija var izveidot bruģējumu, zālienu, apstādītu dobi, pļavu, zemsegu, dobi vai platformu; atvērta līnija — taku, sienu, apmali, pakāpienus (to pirmais un pēdējais punkts), rampu, dzīvžogu vai grāvi. Abi veidi var izveidot **raksturlīniju**, izņemot pašu raksturlīniju.

## Raksturlīnija no līnijas

Raksturlīnija, kas izveidota no līnijas, pārņem tās punktus, un tā ir slēgta, ja līnija bija slēgta. Tās augstumi tiek uzlikti uz esošās zemes (0, ja tādas vēl nav), un tās lietojums ir **Izslēgts**: tā neveido zemi, kamēr neizvēlaties lietojumu un nenosakāt augstumus tās Rekvizītos. Kad līnija pārvietojas, raksturlīnija ar tādu pašu punktu skaitu saglabā katru augstumu, ko iestatījāt; kad līnija iegūst vai zaudē punktus, augstumi tiek uzlikti uz zemes no jauna. Skatiet [Raksturlīnijas](topic:feature-lines).

Jaunais objekts saglabā **saiti** uz savu līniju. Kad līnija pārvietojas (velkat tās punktus vai zīmējums tiek pārvietots vai nolasīts no jauna), objekts pārņem jauno formu tajā pašā atsaukšanas solī, un caur zemes modifikatoriem projektētā zeme seko tam. Rekvizītos ir norādīts, ar ko objekts ir saistīts; {{ui:Pārtraukt saiti}} padara to brīvu.

Līnijas tiek pārbaudītas vispirms: līnijai vajag vismaz 2 punktus (3 kontūrai), ne vairāk kā 5000, reālus skaitļus; kontūrai jābūt slēgtai, un tā nedrīkst krustoties pati ar sevi. Līnija, kas neiztur pārbaudi, netiek izmantota: objekts paliek kā bija, un Problēmu panelis norāda iemeslu. Ja līnija tiek izdzēsta, objekts paliek, un Problēmu panelis to atzīmē.

## SuperCad Studio

Atveriet objektu un 2D zīmējumu tajā pašā projektā. Izvēlieties vienu līniju vai polilīniju 2D zīmējumā, nospiediet Ctrl+K un palaidiet {{ui:Ainavas objekts no izvēlētās zīmējuma līnijas}}: CivilCraft jautā, ko veidot, kā iepriekš aprakstīts, un objekts paliek saistīts ar šo zīmējuma līniju. Pēc tam, kad maināt līnijas zīmējumā, Ctrl+K {{ui:Atjaunināt ainavu no zīmējuma}} liek objektiem sekot, viens atsaukšanas solis katrai līnijai. Projekta saišu fails ieraksta, kurš objekts seko kurai līnijai. SuperCad Studio palīdzībā ir sadaļa par ainavu.
