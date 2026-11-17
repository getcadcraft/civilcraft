---
title: Kontrollér masser mod de zoneringsgrænser, du indtaster
summary: Indtast en grunds tilbagetrækninger linje for linje, en højdegrænse, et lysplan, en udnyttelsesgrad og en bebyggelsesprocent, se byggefeltet på planen, og læs hvilke masser der overskrider hvilke grænser.
keywords: zonering, tilbagetrækning, tilbagetrækninger, forside, side, bagside, byggefelt, byggeareal, højdegrænse, lysplan, udnyttelsesgrad, bebyggelsesprocent, grund, matrikel, lokalplan, regelkontrol
from: 3e267b31
---

**CivilCraft indeholder ingen zoneringsregler.** Det kender ikke nogen kommunes regler og leveres ikke med et bibliotek af dem. Alle tal på denne side er dem, du selv indtaster fra din egen lokalplan, og hvert resultat oplyser, at det er målt mod de grænser, du har indtastet. Det er en måde at se, hvordan en grunds grænser former en bygning, ikke en afgørelse af, om et projekt er tilladt.

## Indtast grænserne

Under **Bygningsmasser** i **Egenskaber** vælger du en **Matrikel** (eller vælger en masse: dens matrikels grænser vises under den). Udfyld derefter det, der gælder; lad et felt stå tomt for »ingen grænse«:

- **Vejlinje**: grundgrænsen ud mod vejen. **Tilbagetrækning foran** gælder for den, **tilbagetrækning bagved** for linjen, der ligger modsat den, og **tilbagetrækning i siden** for de øvrige.
- **Højdegrænse**.
- **Lysplan**: det starter i en højde ved grundgrænsen og stiger med den værdi, du indtaster, for hver 1 indad, målt fra vejlinjen eller fra alle grundgrænser (2 betyder 2 til 1). Den tilladte højde over et punkt er det laveste af planet og højdegrænsen.
- **Udnyttelsesgrad** (samlet bruttoetageareal for masserne på grunden divideret med grundens areal) og **Bebyggelsesprocent** (deres fodaftryk divideret med grundens areal, indtastet i procent).

## Byggefeltet

Markér **Vis byggefeltet på planen** for at tegne det på laget `A-MASS-ENVL`. Byggefeltet er grunden, indrykket fra hver grundgrænse med den linjes egen tilbagetrækning; de forskudte linjer mødes i geringshjørner. En grundgrænse, der består af en kurve, tages som korte korder inden for 0.01 af kurven. Både konvekse og konkave grunde fungerer. Hvis tilbagetrækningerne folder over i hinanden (en dyb tilbagetrækning på en smal eller meget konkav grund), findes der intet byggefelt, og Egenskaber siger det; prøv mindre afstande.

## Resultatet

Under felterne får hver masse og hver grænse en linje med et flueben eller et kryds:

- **tilbagetrækninger**: massens areal, der ligger uden for byggefeltet;
- **højde**: massens højde mod det højeste tilladte over dens fodaftryk (et prisme med én højde begrænses af den laveste tilladte højde i et af dets hjørner);
- **udnyttelsesgrad** og **bebyggelsesprocent**: alle masserne på matriklen lagt sammen.
