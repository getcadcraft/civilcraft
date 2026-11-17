---
title: Koordinatat tokësore dhe lokale
summary: Punoni me koordinata tokësore (sipërfaqe) të shkallëzuara nga rrjeti me një faktor të kombinuar të shkallës që shkruani ose llogaritni në një pikë, ose në një rrjet vendi të supozuar të lidhur me sistemin përmes dy pikave kontrolli.
keywords: koordinata tokësore, koordinata sipërfaqësore, rrjet në tokë, faktor i kombinuar i shkallës, csf, faktor i kombinuar, faktor rrjeti, faktor lartësie, faktor i nivelit të detit, konvergjencë, kënd hartografik, faktor shkalle, koordinata të supozuara, koordinata lokale, rrjet vendi, 5000 5000, pika kontrolli, lokalizim, kalibrim, dy pika, mospërputhje
from: 3d7453de
---

Koordinatat e State plane dhe UTM janë koordinata **rrjeti**: një projeksion hartë zgjat ose shkurton pak distancat (dhjetëra pjesë për milion), dhe sa më i lartë të jetë vendi, aq më shumë ndryshon një distancë e matur në tokë nga ajo në rrjet. Shumë matje për këtë arsye japin koordinata **tokësore**, të shkallëzuara që distancat në planimetri të jenë të barabarta me ato të matura në tokë, ose një rrjet vendi **të supozuar** (5000, 5000 në një pikë kontrolli). CivilCraft i mban numrat tuaj ashtu si janë dhe regjistron si lidhen me rrjetin, kështu që gjerësia dhe gjatësia gjeografike, skedarët GIS dhe shtresat e hartave ende vendosen saktë.

Hap {{ui:Koordinatat}} te grupi {{ui:GIS}}, zgjidh (ose mbaj) sistemin, pastaj zgjidh nën **Koordinatat e rrjetit, tokësore ose lokale**:

| Zgjedhja | Koordinatat tuaja janë | Si lidhen me rrjetin |
|---|---|---|
| {{ui:Rrjet}} | Të sistemit (fillimi) | Të njëjtët numra |
| {{ui:Toka}} | Të shkallëzuara sipas distancave në tokë | rrjeti = baza + faktori i kombinuar × (toka − baza) |
| {{ui:Lokale}} | Një rrjet vendi i supozuar | Zhvendosur, rrotulluar dhe shkallëzuar mbi rrjetin me dy pika kontrolli |

Çfarë zgjidhni ruhet me projektin dhe është një hap zhbërjeje; asgjë nuk lëviz.

## Koordinatat tokësore

1. Zgjidh {{ui:Toka}}.
2. Shkruaj **Faktorin e kombinuar të shkallës** nga matja (për shembull `0.99987`), ose llogarite:
   1. Te **Llogarit faktorin në një pikë**, pika fillon në mes të projektit. Zgjidh {{ui:Zgjidh një pikë në plan}} dhe kliko vendin (një klikim pranë një pike matjeje merr atë pikë), ose shkruaj E dhe N.
   2. Lartësia vjen nga sipërfaqja aty; shkruaj një tjetër nëse ke nevojë.
   3. Zgjidh {{ui:Llogarit}}. CivilCraft shfaq:
      - **Faktorin e shkallës së rrjetit k**: sa e zgjat projeksioni i hartës distancat aty.
      - **Faktorin e lartësisë**: sa më të shkurtra janë distancat në elipsoid sesa në atë lartësi.
      - **Faktorin e kombinuar** = k × faktori i lartësisë: distanca në rrjet = distanca në tokë × ky.
      - **Konvergjencën**: këndi nga veriu i rrjetit deri te veriu i vërtetë aty (azimuti gjeodezik = azimuti i rrjetit + konvergjenca).
   4. Zgjidh butonin {{ui:Përdorimi}} nën numra për ta vendosur faktorin e kombinuar në kutinë.
3. Vendos **Pikën bazë**, ku koordinatat tokësore dhe ato të rrjetit janë të njëjta. Fillon në 0, 0: shumica e juridiksioneve që publikojnë koordinata tokësore shkallëzojnë rreth origjinës, kështu që koordinatat tokësore mbeten të dukshme afër atyre të rrjetit. Disa matje shkallëzojnë rreth pikës kontrolli të projektit: përdor atë që thotë matja.
4. Zgjidh {{ui:Apliko}}.

:::warning
Lartësia merret si lartësi mbi elipsoidin. CivilCraft nuk ka model gjeoidi, kështu që aty ku gjeoidi është 30 m (100 ft) nën ose mbi elipsoidin, faktori i lartësisë është i gabuar me rreth 5 ppm. Kur matja shpall faktorin e saj të kombinuar, shkruaje atë.
:::

## Koordinatat lokale (të supozuara)

1. Zgjidh {{ui:Lokale}}.
2. Për **Pikën e kontrollit 1**, shkruaj numrin e pikës së matjes (ose zgjidh {{ui:Zgjidh}} dhe kliko te planimetria). Koordinatat e saj lokale shfaqen pranë saj.
3. Shkruaj E dhe N të **rrjetit**, ose gjerësinë dhe gjatësinë e saj gjeografike në kutinë e tretë (për shembull `30.2672, -97.7431`).
4. Bëj të njëjtën për **Pikën e kontrollit 2**, sa më larg nga e para që të mundesh.
5. CivilCraft shfaq **Shkallën** dhe **Rrotullimin** e gjetur, dhe të kujton: **Dy pika përshtaten gjithmonë saktë — kontrollo një të tretë.**
6. Jep një **Pikë kontrolli** në të njëjtën mënyrë. CivilCraft shfaq sa larg e vendos përshtatja nga koordinatat e rrjetit që shkrove (mospërputhja, në njësitë e projektit dhe në pjesë për milion). Një mospërputhje e madhe do të thotë një pikë e gabuar, një gabim shkrimi, ose koordinata në një njësi tjetër.
7. Zgjidh {{ui:Apliko}}.

Një shkallë larg 1 (më shumë se 0.5 deri në 2) refuzohet: kontrollo pikat dhe njësitë e tyre.

## Çfarë u kontrollua

- Faktori i shkallës dhe konvergjenca përputhen me PROJ (pyproj 3.7.1 me PROJ 9.5.1), bibliotekën e koordinatave që përdorin shumica e programeve GIS, deri në 1 pjesë në një miliard mbi 300 sisteme me projeksione konforme (state plane, UTM, Mercator tërthor, konik konform Lambert), dhe në shfletues në një pikë të zgjedhur në planimetri.
- Hapat tokësorë dhe lokalë konvertohen përpara dhe prapa me 1 pjesë në një miliard; dy pika kontrolli japin përsëri shkallën dhe rrotullimin me të cilat u bënë; një pikë kontrolli 0.05 ft larg tregon një mospërputhje prej 0.05 ft.
