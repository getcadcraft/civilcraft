---
title: Tegn en luftledning
summary: Placér master i planen, lad CivilCraft finde ud af hver masts rolle og sektionerne mellem endeafspændinger, og flyt master i planen eller på ledningens længdeprofil.
keywords: luftledning, mast, stolpe, spænd, sektion, endeafspænding, vinkel, ophæng, længdeprofil, højde, tværarm, forankring, stag
from: b8e5e272
---

## Tegn den

1. Der skal være en overflade: jorden under ledningen kommer fra den ([Byg en overflade](topic:build-surface)). En mast uden jord under sig står under **Kontrol**; skriv i stedet dens **Terrænkote** i Egenskaber.
2. Klik på {{ui:Ledning}} i gruppen Højspændingsledninger, og klik på hver mast i planen.
3. Dobbeltklik på den sidste, eller tryk {{key:Enter}}.

Ledningen får den leder, mast og det udstyr, du brugte sidst på denne computer (første gang: eksempler fra biblioteket). Ændr dem i Egenskaber.

## Ledningen i Egenskaber

Vælg ledningen (klik på et spænd) for at angive dens **Leder**, **Ledere pr. kreds**, **Kredse**, **Spænding**, den **Frihøjderegel**, den skal overholde over terrænet, og det udstyr **På hver mast** (en tværarm, isolatorer, beslag). Tabellen viser dens **sektioner** med hver enkelts dimensionerende spænd, normale spænding og det lasttilfælde, der er styrende.

## Master

Klik på en mast for at vælge den. I Egenskaber:

- **Mast**: dens bibliotekspost. Når den er for svag, lægger {{ui:Brug …}} den mindste mast af samme materiale i dit bibliotek, der kan bære lasten.
- **Rolle**: Automatisk, Ophæng, Vinkel eller Endeafspænding. Automatisk betyder: første og sidste mast er endeafspændinger; en drejning over regelsættets vinkel gør en vinkelmast; en større drejning gør den til en endeafspænding.
- **Højde over terræn**: tom tager den fra bibliotekposten (dens længde med fradrag for dybden i jorden).
- **Også på denne mast**: ekstra udstyr, fx et **stag** (forankring). En mast med stag fører lederens træk videre til sit stag.
- **Eksisterende mast**: den kontrolleres som de andre, men udelades i mængderne.

{{ui:Understøtning}} tilføjer en mast på spændet nærmest dit klik. Træk en mast i planen for at flytte den. Slet fjerner den (en ledning beholder mindst to).

Sektioner går mellem endeafspændinger: inde i en sektion løber lederen frit gennem ophængsklemmerne, så én spænding gælder for hele sektionen.

## Linjens længdeprofil

Klik på {{ui:Længdeprofil}} (eller **Længdeprofil** i ledningens Egenskaber). Panelet under planen viser terrænet langs ledningen, hver mast fra terrænet til sin top, lederens laveste fase ved det **Lasttilfælde**, du vælger, og den frihøjde ledningen skal overholde, vist som en stiplet linje. Et spænd, der ikke består, er rødt; tallet under hvert spænd er dens laveste frihøjde.

- **Linje** vælger den luftledning, der vises. Hvis du vælger en anden ledning eller en af dens master i planen, skifter profilen til den.
- Før markøren hen over profilen: en hjælpelinje følger den, og etiketten viser afstanden langs ledningen, terrænet, lederen og frihøjden dér (og siger, når frihøjden er under ledningens regel).
- {{ui:Mål}} i profilens bjælke: klik på to punkter for at få afstanden på tværs, højdeforskellen, den lige afstand og hældningen mellem dem. Et klik nær terrænet, lederen eller en masts top fastgør sig til det. Klik på {{ui:Mål}} igen for at stoppe.
- Forhindringer, ledningen krydser, står op fra terrænet: tegnede som søjler, landskabsplanter som deres krone, mure som søjler (se [Højspændingstjek](topic:power-line-checks#clearances)). Kabelruter og rør, ledningen krydser, markeres under terrænet ved deres top, med navn.

- Træk en mast sideværts for at flytte den langs ledningen.
- Træk dens top op eller ned for at sætte dens højde over terrænet.
