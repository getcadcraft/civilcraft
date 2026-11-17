---
title: Disseny de reg
summary: Eina de càlcul, no un disseny visat: aspersors, derivacions, canonada principal, vàlvules i línies de degoteig al lloc; zones trobades a partir de les canonades; pèrdua de pressió per Hazen–Williams, l'aspersor del pitjor cas, cabal i pressió contra el subministrament, intensitats de precipitació, temps de reg, cobertura i llista de materials.
keywords: reg, aspersor, aspersors, aspersió, rotor, broquet rotatiu, degotador, degoteig, línia de degoteig, emissor, vàlvula, zona, estació, programador, canonada principal, derivació, punt de connexió, subministrament d'aigua, pressió, psi, kpa, cabal, gpm, pèrdua per fricció, hazen williams, intensitat de precipitació, temps de reg, cobertura, cap a cap, llista de materials
from: 7d6342c1
---

:::warning
Això és una eina de càlcul, no un disseny visat: un dissenyador de reg revisa cada resultat abans que es construeixi res.
:::

## Definir el sistema

1. A la secció **Reg** a l'esquerra, trieu l'**Aspersor**, el seu **Arc** i on comença l'arc, i les mides de canonada de les derivacions i de la canonada principal.
2. {{ui:Reg}} › {{ui:Punt de connexió}}: feu clic on s'uneix el subministrament d'aigua. Definiu-ne la **pressió**, el **cabal disponible** i la pèrdua del comptador i de l'antiretorn a Propietats.
3. {{ui:Reg}} › {{ui:Vàlvula}}: feu clic on va la vàlvula de cada zona. Una vàlvula inicia una zona.
4. {{ui:Reg}} › {{ui:Aspersor}}: feu clic per col·locar aspersors; cada clic en col·loca un.
5. {{ui:Reg}} › {{ui:Canonada lateral}}: feu clic des d'una vàlvula, passant pels seus aspersors, i premeu {{key:Enter}}. {{ui:Canonada principal}}: des del punt de connexió fins a cada vàlvula.

Els extrems de les canonades s'ajusten a aspersors, vàlvules, al subministrament i a altres extrems de canonada, de manera que la xarxa es connecta. Una zona és tot el que s'arriba des de la seva vàlvula per les derivacions; la canonada principal porta una zona a la vegada.

## Degoteig

{{ui:Reg}} › {{ui:Línia de degoteig}}: feu clic al llarg de la línia, començant per on s'alimenta (un extrem de derivació o una vàlvula). Definiu el **cabal de l'emissor** i l'**espaiat** a Propietats; el seu cabal és el dels emissors que té al llarg.

## La revisió

{{ui:Reg}} › {{ui:Revisa el sistema…}} llista cada zona:

| Columna | Com es calcula |
|---|---|
| Cabal | La suma dels cabals dels aspersors (i de les línies de degoteig) |
| A la vàlvula | La pressió de treball de l'aspersor del pitjor cas més les pèrdues de les canonades fins a ell (Hazen–Williams, el diàmetre interior de la canonada, el canvi d'elevació), i la pèrdua a través de la vàlvula |
| Al subministrament | El mateix més la pèrdua de la canonada principal que porta aquella zona, i la pèrdua del comptador i de l'antiretorn |
| Precipitació | El cabal dels aspersors dividit per l'àrea que reguen amb l'espaiat cap a cap |
| Minuts a la setmana | Per aplicar el valor de **Reg a la setmana** |
| Problemes | Velocitat per sobre del límit, un aspersor fora del seu rang de pressió, aspersió i rotors a una mateixa vàlvula, pressió o cabal insuficients al subministrament, aspersors que no són de cap zona, bucles |

Seleccioneu una vàlvula per veure les xifres de la seva zona i el seu aspersor del pitjor cas marcat amb un cercle al pla. La llista de materials compta els aspersors per tipus i arc, la canonada per mida, les vàlvules, la línia de degoteig i els emissors, i les estacions del programador. **Desa com a CSV** en guarda totes dues.

Configuració de la secció **Reg**: el **Coeficient C de Hazen–Williams** (150 per a canonada de plàstic nova), la **velocitat més alta** en una canonada (1.5 m/s), la **pèrdua a través d'una vàlvula** i el **Reg a la setmana**. Són valors per defecte marcats com a tals.

## Cobertura

{{ui:Reg}} › {{ui:Mostra la cobertura}} indica quina part de l'àrea queda sense regar pels aspersors, quina part reben dos o més aspersors, i quins aspersors no arriben a un veí (espaiat cap a cap).

## Aspersors

Els aspersors que es llisten són tipus **genèrics** que CadCraft redacta a partir de les intensitats de precipitació de disseny (aspersors fixos, broquets rotatius, rotors d'engranatge, degotadors, microaspersors, emissors), no els productes de cap fabricant. **Afegeix aspersors des d'un fitxer…** llegeix els vostres propis (una llista JSON amb el llançament, el cabal o la intensitat de precipitació i el rang de pressió de cada aspersor); es desen amb el projecte. Les dades publicades d'un fabricant només s'hi inclouen amb el permís escrit d'aquest fabricant.

Sota els aspersors genèrics, la llista té els **aspersors típics** (els seus noms acaben en "valors típics"): mides de broquet d'aspersors fixos, broquets rotatius i rotors d'engranatge, microaspersors, degotadors i emissors, amb un radi, un cabal i un rang de pressió. CadCraft els calcula a partir de càlculs publicats (l'equació de l'orifici per al cabal, l'escalat del llançament per al radi) i de classes nominals de cabal, només a partir de fonts obertes; no es copia cap taula de cap fabricant. En trieu un i el selector en mostra la base i la llicència. Un projecte que n'usa un guarda l'aspersor i la seva font al fitxer del projecte. Són per a planificar: comproveu les dades pròpies de l'aspersor real abans de construir.
