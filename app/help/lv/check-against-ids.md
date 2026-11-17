---
title: IFC eksporta pārbaude pret klienta IDS
summary: Ielādējiet .ids failu, ko jums iedeva klients vai ceļu iestāde, un skatiet katru eksportēto elementu, kas tam neatbilst, sadaļā Problēmas.
keywords: ids, informācijas piegādes specifikācija, buildingsmart, prasības, piegāde, pārbaude, validācija, kvalitāte, ifc eksports, ifc 4.3, trase, ceļš, iepirkums
from: 183d9a0e
---

## Ko jūs darīsiet

IDS (Information Delivery Specification, buildingSMART standarts) ir saraksts ar to, kam jābūt IFC. Publiskie iepirkumi bieži sūta to kopā ar darbu. CivilCraft pārbauda šī projekta eksportēto IFC, tajā IFC versijā, ko izvēlējāties eksportam, pret to un uzskaita katru elementu, kas neatbilst prasībām.

## Soļi

1. Atveriet savu projektu.
2. Noklikšķiniet uz {{ui:IFC}} grupā Eksports rīkjoslā. Dialogā izvēlieties IFC versiju, ko piegādāsit.
3. Noklikšķiniet uz {{ui:Pārbaudīt pret IDS…}}.
4. Noklikšķiniet uz {{ui:Ielādēt .ids failu…}} un izvēlieties failu. Nekas netiek augšupielādēts.
5. Izlasiet rezultātu: katra specifikācija ar {{ui:Izpildīts}} vai {{ui:Neizpildīts}} un to, cik elementiem tā attiecas.
6. Atveriet Problēmas ({{key:Ctrl+Shift+M}}) un noklikšķiniet uz neizpildījuma, lai atlasītu trasi, platformu, cauruli, konstrukciju vai ēkas masu, no kuras tas nāca.

## Ko jūs redzēsiet

- Viens brīdinājums katram eksportētam elementam un prasībai, ko tas neizpilda, ar specifikācijas nosaukumu, to, ko IDS prasa, un to, ko eksportā ir.
- Pārbaudes atskaite (Problēmās) sākas ar IDS: tā nosaukumu, versiju, autoru un katras specifikācijas skaitļiem.

## Noderīgi zināt

- IDS tiek saglabāts projekta failā, tāpēc tas tiek pārbaudīts vēlreiz, kad projektu atverat. IDS ielādēšana vai aizmirstīšana ir viens solis, ko var atsaukt.
- Katra izmaiņa tiek pārbaudīta vēlreiz pēc brīža. Lielas virsmas aizņem ilgāk, tāpēc pārbaude tad starp palaišanām gaida nedaudz ilgāk.
- Pārbaude izmanto to pašu failu, ko raksta {{ui:IFC}} eksports, pēdējā tur izvēlētajā versijā (IFC 4.3, ja neesat izvēlējies nevienu).
- Skaitļi tiek salīdzināti SI vienībās: projekts pēdās vispirms tiek pārvērsts metros.

- Vērtības IDS šablonos tiek lasītas kā visa vērtība. `^` sākumā un `$` beigās arī tiek uzskatīti par „visu vērtību”, kā to parasti domā lielākā daļa IDS failu.

## Tālāk

- [Eksportēt IFC](topic:ifc)
