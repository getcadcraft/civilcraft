---
title: Xarxes d'aigua: pressions, cabals i cabal d'incendi
summary: Dibuixeu al plànol una xarxa de pressió de nusos, embassaments, dipòsits, canonades, bombes i vàlvules reductores de pressió; CivilCraft calcula les alçades, les pressions i els cabals (Hazen–Williams, xarxes en bucle), el cabal disponible per a un incendi i un dia de demanda. Una funció de laboratori; cada resultat necessita la comprovació d'un enginyer.
keywords: aigua, canonada d'aigua, distribució d'aigua, xarxa de pressió, canonada a pressió, xarxa en bucle, hazen-williams, factor C, pèrdua de càrrega, pressió residual, cabal d'incendi, boca d'incendi, demanda, nus, embassament, dipòsit, bomba, corba de bomba, vàlvula reductora de pressió, prv, vàlvula de retenció, període estès, epanet, inp, velocitat
from: df46bf6d
---

Les xarxes d'aigua són la part de pressió d'un lloc: canonades sempre plenes, amb l'aigua impulsada per un embassament, un dipòsit o una bomba. CivilCraft calcula l'alçada i la pressió a cada nus i el cabal de cada canonada, incloent-hi les xarxes en bucle on l'aigua té més d'un camí. Està en fase de laboratori mentre se'n verifica el funcionament.

**Només és una ajuda al càlcul.** Cada nombre necessita la comprovació d'un enginyer qualificat: la resposta només és tan bona com les demandes, les cotes, les mides de canonada i els valors de rugositat que heu donat, i un model d'estat estacionari no sap res dels cops d'ariet, de la qualitat de l'aigua ni del comportament real d'una bomba d'incendi.

## Dibuixar la xarxa

1. Sota **Superfície** › {{ui:Més}}, trieu {{ui:Xarxes d'aigua…}}. La finestra es queda oberta mentre treballeu al plànol.
2. Trieu {{ui:Embassament}} i feu clic al plànol on és el subministrament. La seva alçada comença a 100 ft (30 m) per sobre del terreny; canvieu-la a Propietats.
3. Trieu {{ui:Nus}} i feu clic a cada lloc on es pren aigua o on es troben canonades. Un nus pren la seva cota del terreny; escriviu-ne una altra a Propietats per substituir-la.
4. Trieu {{ui:Tub}}, feu clic a un node i després al node que uneix. L'eina es queda activada per a la canonada següent. Una {{ui:Bomba}} i una {{ui:Vàlvula reductora de pressió}} es dibuixen de la mateixa manera, des del node d'aspiració (o aigües amunt) fins al node d'impulsió (o aigües avall). Un {{ui:Dipòsit}} es col·loca com un nus.
5. Seleccioneu un nus i escriviu la seva {{ui:Demanda}} (gpm, o L/s en un projecte en metres). Seleccioneu una canonada i definiu el seu {{ui:Diàmetre}} (in, o mm) i, si el coneixeu, el seu factor C de Hazen–Williams.

Cada canvi és un sol pas de desfer. {{key:Delete}} elimina el node i les canonades que hi acaben.

## Què significa cada part

- **Canonada.** La longitud es mesura sobre el plànol tret que n'escriviu una. C és la rugositat de Hazen–Williams (130 per començar; canvieu el valor per defecte a la finestra). Un coeficient de pèrdua local K afegeix les pèrdues dels colzes i dels accessoris. Marqueu **Vàlvula de retenció** per a una canonada que no ha de portar aigua cap enrere; una canonada **Tancada** no porta res.
- **Embassament.** Una font amb una alçada fixa, el nivell d'aigua que manté per sobre del datum. Dóna o pren el que la xarxa necessiti.
- **Dipòsit.** Un nivell que canvia al llarg d'un dia. En els resultats estacionaris és una font al seu nivell actual.
- **Bomba.** Un punt de disseny (cabal i alçada) dona la corba habitual que hi passa: l'alçada a cabal zero és el 133 % de l'alçada de disseny, i l'alçada és zero a dos cops el cabal de disseny. Una bomba mai no impulsa aigua cap enrere.
- **Vàlvula reductora de pressió.** Manté la pressió que definiu aigües avall mentre el subministrament és més alt. Quan el subministrament és més baix, està oberta i no manté res; si l'aigua hagués de córrer cap enrere, es tanca.

## Llegir els resultats

La finestra mostra l'alçada i la pressió de cada node i el cabal, la velocitat i la pèrdua de càrrega per cada 1,000 ft (o per km) de cada enllaç, amb els nusos acolorits al plànol: verd és entre la pressió mínima i la màxima que heu definit, vermell per sota i ambre per sobre. Les fletxes de cabal mostren la direcció. Seleccioneu un node o una canonada per llegir els seus nombres a Propietats.

Sota les taules hi ha una llista del que cal mirar: pressió baixa o alta, una canonada més ràpida que el vostre límit, un nus desconnectat de totes les fonts, o un solucionador que no ha convergit. Les mateixes troballes són al tauler de Problemes. Definiu els límits a la finestra (20 psi, 100 psi i 10 ft/s per començar; 140 kPa, 700 kPa i 3 m/s en un projecte en metres).

## Cabal d'incendi

{{ui:Cabal d'incendi…}} dibuixa un cabal en un nus i mostra la pressió allà i la pressió més baixa en qualsevol punt de la xarxa. També troba el cabal disponible en aquest nus mentre el node més feble de la xarxa manté la pressió residual que doneu. La resta de demandes es mantenen igual.

## Un dia de demanda

{{ui:Un dia de demanda…}} executa la xarxa hora per hora. Doneu el patró de demanda a la configuració del fitxer (una llista de multiplicadors que es repeteix); els dipòsits s'omplen i es buiden amb el cabal que entra i surt, i una bomba pot seguir un patró d'encesa i apagada. Un dipòsit que arriba al seu nivell més alt o més baix es nomena a la llista: CivilCraft no tanca l'entrada ni la sortida per vosaltres, de manera que llegiu-ho com "aquest dipòsit és massa petit o la bomba massa gran".

## Text EPANET

{{ui:Desa com a text EPANET (.inp)}} escriu la xarxa en el format de text pla que llegeixen molts programes d'aigua, i {{ui:Obre text EPANET (.inp)…}} n'llegeix un. Només hi passa el que CivilCraft modela: nusos, embassaments, dipòsits, canonades, bombes amb corba d'alçada, vàlvules reductores de pressió, patrons de demanda i els temps. Altres tipus de vàlvules, bombes definides per potència i altres fórmules de pèrdua de càrrega es citen i queden fora. El fitxer ha de fer servir les mateixes unitats que el projecte.

## Hidrants, vàlvules i accessoris

Seleccioneu un nus i marqueu **Hidrant** per posar-hi un; seleccioneu una canonada principal i premeu **Afegeix al mig** per posar-hi una vàlvula, una vàlvula d'aire, una purga o un comptador. Són objectes de la xarxa: es mouen amb ella, i un sol pas de desfer els elimina.

El traçat també implica accessoris, i CivilCraft els llista sense que se'ls demani: una **te** on es troben tres canonades principals, una **creu** on en són quatre, un **colze** (amb el seu angle) on dues canonades principals giren 5° o més, un **reductor** on es troben dues mides, i un **tap** en un extrem mort. {{ui:Quadre d'accessoris (CSV)}} els compta, i també les canonades per mida. Això és el que implica el traçat: un amidament per comprovar amb els vostres propis detalls, no una llista per encarregar.

Les canonades es posen a la cota del terreny menys un recobriment (4 ft o 1.2 m) perquè es puguin dibuixar i modelar en 3D; les pressions de dalt mai no en depenen.

## Al plànol i als fitxers

El plànol, el PDF i el DWG o DXF porten les canonades a **C-WATR-MAIN**, amb les seves mides a **C-WATR-TEXT**, els hidrants a **C-WATR-HYDR**, les vàlvules a **C-WATR-VALV** i els accessoris a **C-WATR-FITT**. El LandXML de sortida escriu una xarxa de canonades d'aigua (una estructura per a cada node, una canonada per a cada canonada principal, i els hidrants amb nom); el LandXML d'entrada en torna a llegir una com a canonades d'aigua, sense demandes, bombes ni vàlvules, que LandXML no porta. L'exportació IFC escriu les canonades com a segments de tub, hidrants, vàlvules i accessoris en un sol sistema d'aigua. Aquests fitxers s'han comprovat amb els nostres propis lectors i escriptors; proveu-los en els altres programes i digueu-nos què en diuen.

## Què encara no hi és

Qualitat i antiguitat de l'aigua, controls i regles més enllà de l'encesa i apagada d'una bomba, altres tipus de vàlvules, demanda en funció de la pressió, canonades amb un diàmetre que canvia, i cabals de clavegueram al llarg del temps. Vegeu [Encara no implementat](topic:not-built-yet). Els cabals de disseny sanitari, que són un càlcul diferent, són a [Cabals de disseny sanitari](topic:sanitary-design).
