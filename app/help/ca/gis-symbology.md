---
title: Dona estil a una capa segons un atribut
summary: Acoloreix els elements d'una capa SIG segons els valors d'un camp (un color per valor, o per intervals numèrics), mida dels punts segons un número, tint dels polígons i una llegenda al plànol.
keywords: simbologia, estil, color, categoritzat, graduat, valors únics, interval igual, quantil, talls naturals, jenks, rampa, daltonisme, llegenda, mida, punts, coroplètic, classes, sig
from: a3a69add
---

Obriu el menú de **tres punts** de la llista de capes SIG i trieu {{ui:Estil per atribut…}}.

## Tres estils

- **Símbol únic:** el color de la capa, com abans.
- **Categoritzat:** un color per cada valor diferent d'un camp qualsevol. Fins a vuit valors reben els vuit colors Okabe-Ito (triats perquè es distingeixin en els tipus habituals de daltonisme); amb més valors, els set més freqüents reben un color cadascun i la resta comparteix una classe **Altres** en gris. Els elements sense valor són grisos.
- **Graduat:** un camp numèric es talla en 2 a 9 intervals, cadascun amb un color d'una rampa. Un valor situat en un tall va a l'interval inferior.

## Com es tallen els intervals

| Mètode | Talls |
|---|---|
| Interval igual | L'interval que va del valor més petit al més gran, dividit en amplades iguals. Valors de 0 a 30 en tres intervals: 0, 10, 20, 30. |
| Quantil | Aproximadament el mateix nombre d'elements en cada interval. Els talls es llegeixen dels valors ordenats amb la interpolació lineal habitual: per a 1 a 10 en dos intervals, el tall és 5.5. |
| Talls naturals (Jenks) | Els talls que deixen la menor dispersió dins de cada interval, de manera que els grups de valors semblants es mantenen junts. Amb més de 1,500 valors treballa amb 1,500 valors igualment espaiats i ho indica. |

## Colors

Viridis i Cividis van del fosc al clar amb un canvi constant de lluminositat, de manera que l'ordre dels intervals es pot llegir fins i tot en gris o amb daltonisme. Blues va del clar al fosc. Vermell a blau és una rampa de dues direccions per a valors al voltant d'un punt mig. **Inverteix els colors** inverteix qualsevol d'elles. El diàleg enumera els intervals i el nombre d'elements de cada un abans d'aplicar-ho.

## Mida, emplenament i llegenda

- **Mida dels punts segons** un camp numèric fa que el quadrat de cada punt sigui més gran com més gran és el valor, entre les dues mides que indiqueu (la meitat del costat, en mil·límetres sobre paper).
- **Tint de l'interior dels polígons** omple cada polígon amb el color de la seva classe (els forats queden buits). El tint és a la pantalla; els traçats i els DXF/DWG mostren els contorns de colors.
- **Mostra una llegenda al plànol** dibuixa les classes, els seus recomptes i l'interval de mides a la part inferior esquerra del plànol. La llegenda és a la pantalla; no entra en un traçat.
- Per etiquetar els elements amb un camp, useu **Etiqueta amb** al mateix menú.

L'estil es desa al fitxer del projecte. Una versió que no coneix els estils obre el fitxer amb el color de la capa. Els traçats, DXF i DWG porten les classes com a capes separades anomenades segons la capa i la classe, en el més proper dels nou colors bàsics de CAD. Una capa de més de 200,000 elements es dibuixa en un sol color.
