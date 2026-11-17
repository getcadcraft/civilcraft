---
title: Calcula cabals pluvials, mides de canonades i la línia de gradient hidràulic
summary: Dibuixeu les conques que desguassen a cada estructura, sumeu els cabals per la xarxa amb el mètode racional, dimensioneu les canonades amb l'equació de Manning, i vegeu on la línia de gradient hidràulic va plena o arriba a la superfície.
keywords: drenatge pluvial, conca, àrea de drenatge, mètode racional, coeficient d'escolament, temps de concentració, intensitat de pluja, idf, manning, dimensionat de canonades, línia de gradient hidràulic, hgl, línia de gradient d'energia, egl, sobrecàrrega, inundació, aigua avall
from: e44872ec
---

El drenatge pluvial funciona sobre la [xarxa de canonades](topic:pipe-network): dibuixeu primer la xarxa, i després les àrees que hi desguassen. Tot apareix sota **Drenatge pluvial** al tauler de la dreta quan no hi ha res seleccionat.

## Dibuixa una conca

1. Premeu **Dibuixa una conca** sota **Drenatge pluvial**.
2. Feu clic als vèrtexs de l'àrea que desguassa a una estructura. {{key:Enter}} o un doble clic acaba; {{key:Backspace}} retira l'últim vèrtex, {{key:Esc}} atura.
3. La conca desguassa a una estructura que hi ha dins, si no, a la més propera. S'obren les seves **Propietats**: establiu-ne el nom, el **Coeficient d'escolament C** (la part de la pluja que s'escorre, de 0 a 1), el **Temps de concentració** en minuts, i a quina estructura **Desguassa a**.

**Dibuixa una altra conca** a les seves Propietats comença la següent. Feu clic dins d'una conca al plànol per seleccionar-la; {{key:Delete}} la suprimeix. Cada canvi és un pas: {{key:Mod+Z}} el desfà.

## Estableix la tempesta de disseny

La intensitat de la pluja és i = a ÷ (tc + b) elevat a c, en polzades per hora per a un projecte en peus, i en mil·límetres per hora per a un projecte en metres. Ajusteu **Intensitat a**, **b** i **c** a la vostra corba pròpia d'intensitat-durada-freqüència per al període de retorn del disseny.

:::warning
La corba d'intensitat inicial, la n de Manning (0.013) i la pèrdua a la unió (0.5) són valors provisionals, no una norma. Establiu-los a partir de les vostres dades de pluja i criteris de disseny.
:::

- **Temps de concentració mínim**: cap canonada es calcula amb un temps més curt (10 minuts al començament).
- **n de Manning**: la rugositat de les canonades.
- **Pèrdua a la unió**: el cap perdut a cada estructura, com a part de l'alçada de velocitat V²/2g de la canonada que en surt.
- **Nivell de l'aigua a la sortida**: l'aigua avall, on buida l'última canonada. Deixeu-lo buit quan la sortida és lliure.

## Com se sumen els cabals

Cada canonada transporta totes les conques que hi ha aigua amunt. Q = C × i × A, on C × A se suma per la xarxa, i i és la intensitat al temps de concentració més llarg de l'aigua que arriba: el temps propi d'una conca, o el temps d'una conca aigua amunt més el temps de recorregut per les canonades (longitud ÷ la velocitat a canonada plena). Q és en peus cúbics per segon (A en acres) o metres cúbics per segon (A en hectàrees).

## Dimensiona les canonades

La taula sota **Cabals i línies de gradient** mostra, per a cada canonada, el cabal, el que transporta a canonada plena amb la seva pendent, la velocitat, el gradient hidràulic a la part superior i a la base, i la profunditat del flux.

**Dimensiona les canonades per a aquests cabals** dona a cada canonada la mida estàndard més petita que transporta el seu cabal amb la seva pròpia pendent (de 12 a 72 in, o de 300 a 1800 mm). És un sol pas. Les cotes de solera es queden on són: si les mides canvien, useu **Estableix totes les cotes de solera segons les regles** per conservar el recobriment, i després torneu a revisar la taula.

## Llegeix les línies de gradient

La línia de gradient hidràulic (HGL) es calcula des de la sortida cap amunt:

- Una canonada que flueix parcialment plena té el seu HGL a la superfície de l'aigua: la cota de solera més la profunditat normal.
- Quan l'aigua de sota és més alta que la generatriu superior, o transporta més del que pot a canonada plena, flueix plena (amb sobrecàrrega) i el seu HGL puja per la pendent de fricció al llarg de la seva longitud.
- A cada estructura, el HGL és el HGL superior de la canonada que en surt més la pèrdua a la unió.
- La línia de gradient d'energia (EGL) és el HGL més l'alçada de velocitat.

Una canonada que flueix plena es llista, i també qualsevol estructura on el HGL és per sobre de la vora: l'aigua arriba a la superfície allà, i l'estructura es marca en vermell al plànol. Seleccioneu una canonada o una estructura per veure'n el cabal, la profunditat, la velocitat i totes dues línies de gradient a les seves Propietats.

## Encamina una tempesta

El mètode racional dona una sola punta per a cada canonada. {{ui:Encamina la tempesta}} (sota els resultats, a les propietats de la xarxa) calcula la tempesta sencera en lloc d'això: l'escorrentia de cada conca al llarg del temps, transportada per les canonades amb el seu temps de recorregut i el seu emmagatzematge, i sumada allà on es troben.

1. Deixeu {{ui:La pluja dura}} i {{ui:Intensitat de la pluja}} buits per usar el temps de concentració més llarg i la corba de pluja d'adalt, o escriviu-ne els vostres.
2. Premeu {{ui:Encamina la tempesta}}. La taula mostra, per a cada canonada, el cabal més alt d'entrada i de sortida, quant més baixa és la punta de sortida, quina part de la capacitat plena de la canonada fa servir, i el minut en què arriba a la punta.
3. Cada sortida té un petit gràfic de cabal al llarg del temps i {{ui:Baixa l'hidrograma (CSV)}}.

Una conca envia la pluja mitjanada sobre el seu temps de concentració, de manera que una tempesta més curta que aquest temps té una punta més baixa que C × i × A. Cada canonada s'encamina amb el mètode Muskingum–Cunge, usant l'alçada del flux que ja havia trobat el mètode racional. Dues branques amb temps de concentració diferents no arriben a la punta alhora, de manera que la seva suma és més baixa que la suma de les seves puntes.

Això no modela la sobrecàrrega, el remoús, l'emmagatzematge a les estructures ni les inundacions. Una canonada la punta encaminada de la qual és per sobre de la seva capacitat plena es llista, i la seva aigua es passa com si hi cabés. Useu-ho per veure el temps i l'atenuació, no per dimensionar la canonada. És una eina de càlcul: un enginyer ho ha de comprovar.

## Es desa amb el projecte

Les conques i la configuració de la tempesta es desen al fitxer del projecte. Encara no són al PDF del plànol, al DWG o DXF, ni al LandXML: vegeu [Encara no implementat](topic:not-built-yet).
