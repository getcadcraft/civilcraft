---
title: Mesura distàncies, àrees i pendents
summary: Mesureu sobre el plànol fent clic als punts —la longitud i el rumb de cada costat, el total acumulat, la longitud sobre el terreny, el pendent, i l'àrea i el perímetre d'una forma tancada— i entre dos punts del perfil d'una línia elèctrica aèria.
keywords: mesura, mesurar, distància, longitud, àrea, perímetre, rumb, pendent, graó, regle, cinta, sobre el terreny, perfil, diferència d'alçada
from: d614eb25
---

{{ui:Superfície}} › {{ui:Més}} › {{ui:Mesura}} (també al menú {{ui:Més}} de l'espai de treball Línies elèctriques, o premeu {{key:M}}) mesura sense afegir res al projecte.

## Sobre el plànol

1. Trieu {{ui:Mesura}}, i després feu clic als punts. Un clic prop d'un punt topogràfic en pren la posició i la cota.
2. La barra d'estat indica el nombre de punts i la longitud total, la longitud i el rumb del darrer costat, el seu pendent quan el terreny és conegut a tots dos extrems, i la longitud sobre el terreny. Al costat del punter, el costat que s'està dibuixant i el total acumulat.
3. Torneu a fer clic al primer punt per tancar la forma: la barra d'estat hi afegeix la seva **àrea** i el seu **perímetre**. El clic següent comença una mesura nova.
4. {{key:Enter}} acaba la mesura i en manté els valors a la barra d'estat; {{key:Backspace}} desfà l'últim punt; {{key:Esc}} l'esborra, i {{key:Esc}} una altra vegada torna a {{ui:Selecciona}}.

Les longituds són en la unitat del projecte i les àrees en la unitat quadrada corresponent. El pendent i la longitud sobre el terreny usen la superfície projectada quan n'hi ha una, i si no, el terreny existent; fora de la superfície s'ometen.

## Sobre el perfil d'una línia aèria

Al [perfil de la línia](topic:overhead-line#the-line-profile), {{ui:Mesura}} a la barra del perfil necessita dos clics i llegeix la distància horitzontal, la diferència d'alçada, la distància recta i el pendent entre tots dos. Un clic prop del terreny, del conductor o de la part superior d'un suport s'hi ajusta. Torneu a fer clic a {{ui:Mesura}} per aturar-ho.
