---
title: Problēmas un BCF
summary: Piestipriniet problēmu plānam, trases piketam, virsmas punktam vai caurulei, piešķiriet tai statusu un komentārus un apmainieties ar problēmām BCF 2.1 failos līdzās LandXML failam.
keywords: problēma, problēmas, bcf, komentārs, atzīme, trūkums, defekts, objekts, marķieris, statuss, atvērts, atrisināts, slēgts, BIM sadarbības formāts, landxml, problēmas
from: e44153b1
---

Problēma ir piezīme, kas piestiprināta pie vietas jūsu CivilCraft rasējumā, ar nosaukumu, statusu un komentāriem. Izmantojiet to, lai pateiktu būvlaukuma darbiniekiem vai citai programmai, ko pārbaudīt, un lai nolasītu viņu atbildes.

## Pievienot problēmu

1. Atveriet **Virsma, Vairāk, Problēmas (BCF)...**
2. Ierakstiet nosaukumu un to, kas nav kārtībā.
3. Izvēlieties, kur piestiprināt: plāna skata centru, virsmas punktu skata centrā, selektētās trases piketu (ierakstiet piketu un nobīdi; pa labi ir pozitīva), vai selektēto cauruli, konstrukciju vai raksturlīniju.
4. Nospiediet **Pievienot problēmu**. Marķieris plānā redzams kā mazs rombs ar savu numuru.

Noklikšķiniet uz problēmas nosaukuma, lai tuvinātu tai, mainiet statusu sarakstā (Atvērta, Aktīva, Atrisināta, Slēgta) un pievienojiet komentārus. Katra izmaiņa ir viens atsaukšanas solis, un problēmas tiek saglabātas projekta failā.

## Apmainīties ar tām kā BCF

- **Eksportēt BCF** ieraksta BCF 2.1 failu ar vienu tēmu katrai problēmai: nosaukums, statuss, komentāri un viens skatpunkts ar ortogonālu plāna kameru un marķieri.
- **Importēt BCF** nolasa BCF failu (2.0 un 3.0 faili tiek nolasīti, ciktāl atbilst 2.1). Tēma ar jau esošu guid atjaunina šo problēmu (statusu, jaunos komentārus), nevis pievieno otru.
- **No problēmām** izveido problēmu no katra atvērta ieraksta Problēmu panelī, kas norāda, kur tas atrodas.

BCF šajā projektā pārnes metrus projekta savās koordinātās bez nobīdes. Otrai programmai jābūt tajā pašā koordinātu sistēmā kā jūsu LandXML failam, lai marķieri nonāktu pareizajā vietā. Elements, uz kuru norāda marķieris (trase, pikets, nobīde, caurule), tiek pārnests kā etiķetes, kas sākas ar "cc:", un CivilCraft tās nolasa atpakaļ.

## Kas nav pārbaudīts

Marķieri un skatpunkti tika pārbaudīti tikai, ierakstot failu un to atkal nolasot CivilCraft. Neviena cita BIM programma tos vēl nav atvērusi, un tas, vai BCF "view to world scale" nozīmē pilnu vai pusi no skata augstuma, atšķiras starp programmām: CivilCraft ieraksta pilnu augstumu.
