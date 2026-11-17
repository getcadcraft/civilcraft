---
title: Dissenya una via fèrria
summary: Converteix un traçat en una via fèrria: transicions (clotoide, paràbola cúbica, Bloss, Helmert, sinus de mig període, sinus), peralt a cada corba amb el seu peralt d'equilibri, insuficiència i excés, límits de peralt i de geometria de la via com a avisos, aparells de via i encreuaments per punt quilomètric, una envolupant de gàlib recorreguda al llarg de la línia i una via amb carrils, travesses i un llit de balast construïda com a corredor, en planta, seccions, perfil, 3D i amidaments.
keywords: ferrocarril, carril, via fèrria, via, tren, metro, tramvia, peralt, insuficiència de peralt, excés de peralt, peralt d'equilibri, transició, corba de transició, clotoide, paràbola cúbica, bloss, helmert, sinus de mig període, cosinus, ample, ample estàndard, ample ampli, ample mètric, ample estret, travessa, balast, sub-balast, plataforma de la via, berma, entreeixos de via, 60E1, 54E1, UIC60, 115RE, 136RE, pendent del peralt, variació del peralt, aparell de via, agulla, agulles, encreuament de vies, cor, número de cor, avanç, corba de tancament, velocitat en desviament, gàlib, envolupant de gàlib, gàlib d'obra, gàlib cinemàtic, andana, buit d'andana, entreeixos, pendent, acord vertical, radi mínim, peralt LandXML
from: 99de9745
---

Qualsevol traçat pot ser una via fèrria. Les seves corbes passen a tenir transicions de carril i un peralt (el peralt dels carrils), i el seu corredor es construeix com a via: carrils sobre travesses en un llit de balast, amb el terreny perfilat com una carretera. Els aparells de via i els encreuaments es col·loquen per punt quilomètric, i es pot recórrer una envolupant de gàlib al llarg de la línia i comprovar-la amb el que hi ha al costat de la via.

Tots els valors que hi ha a continuació són **marcadors de posició**, no pas normes. Els ferrocarrils fixen els seus límits segons la velocitat de la línia, el tipus de via i el país; fixeu-los segons la norma del vostre ferrocarril. CivilCraft no inclou cap taula nacional.

## Converteix el traçat en una via fèrria

1. Seleccioneu el traçat i busqueu **Ferrocarril** a Propietats.
2. Marqueu **Aquest traçat és una via fèrria**. Cada canvi és un pas de desfer.
3. Definiu la **Velocitat de disseny** a la part superior de les propietats del traçat: és la velocitat de línia amb què es comprova el peralt. **Trens més lents** (al bloc Ferrocarril) és la velocitat amb què es comprova l'excés de peralt.

## Transicions

Doneu a cada corba una longitud d'espiral a cada extrem a la taula de PI (**Espiral d'entrada**, **Espiral de sortida**), i després trieu-ne el tipus a la taula de corbes del bloc Ferrocarril, o bé **Transició per a cada corba**:

| Tipus | Curvatura al llarg de la transició |
|---|---|
| Clotoide | creix de manera uniforme (l'espiral de carretera) |
| Paràbola cúbica | y = x³ / (6·R·L), amb L mesurada sobre la tangent; la corba en si és una mica més llarga |
| Bloss | 3u² − 2u³ de la curvatura total (u = la part de la longitud): comença i acaba suaument |
| Helmert | dues paràboles, 2u² i després 1 − 2(1 − u)² |
| Sinus de mig període | (1 − cos πu) / 2 |
| Sinus | u − sin(2πu) / 2π |

Totes menys la paràbola cúbica giren L / 2R, igual que la clotoide. Els punts quilomètrics segueixen la longitud real. LandXML conserva el tipus (spiType clothoid, cubicParabola, bloss, biquadratic, cosine, sinusoid).

## Peralt

Escriviu el **Peralt** de cada corba en mil·límetres. La taula mostra per a cada corba:

- **Peralt d'equilibri** = G·v² / (g·R), on G és la distància entre els centres dels carrils (**Entreeix dels carrils**, que és l'ample més l'amplada del cap del carril tret que l'escriviu). Amb G = 1500 mm això és el conegut 11,8·V² / R (V en km/h, R en m).
- **Insuficiència** = peralt d'equilibri a la velocitat de la línia − peralt aplicat.
- **Excés** = peralt aplicat − peralt d'equilibri a la velocitat dels trens més lents.
- **Rampa**: el pendent de peralt més pronunciat al llarg de les seves rampes, en mil·límetres per metre.

El peralt puja al llarg de cada transició, amb la forma de la seva curvatura: recta per a la clotoide o la paràbola cúbica, en forma de Bloss per al Bloss, i així successivament. Un extrem de corba sense transició puja sobre el tram recte anterior, tant com calgui per al límit de pendent de peralt, i ho indica: el peralt canvia aleshores on no canvia la curvatura.

**El peralt gira al voltant de** indica quin carril es manté sobre el perfil de projecte: **el carril baix** (el més habitual), **el carril interior** o **l'eix de la via** (cada carril es mou la meitat del peralt). El perfil de projecte és la part superior del carril en aquell punt.

El **Diagrama de peralt** dibuixa l'alçada de cada carril sobre el perfil al llarg dels punts quilomètrics; la vista de perfil i les fulles de planta i perfil reben el mateix com una banda sota el perfil.

## Límits i avisos de peralt

**Peralt aplicat màxim**, **Insuficiència de peralt màxima**, **Excés de peralt màxim**, **Pendent de peralt més pronunciat** i **Variació de peralt més ràpida** (el pendent a la velocitat de la línia, en mm/s) es comproven a cada corba. Un valor superior a un límit és un avís al bloc Ferrocarril i al tauler Problemes, amb el límit i el valor trobat. Sense velocitat de disseny, la insuficiència i la velocitat de variació no es comproven (una nota ho indica).

## La via

Definiu l'**Ample** (les predefinicions estàndard 1435 mm, ample ampli, mètric o estret, o el vostre propi), la **Secció del carril** (60E1, 54E1, 49E1, 115RE, 136RE: només les seves dimensions publicades), el nombre de **Vies** i els seus **Entreeixos de via**, i després **Travesses i balast**: material de les travesses, longitud, amplada, alçada i separació; alçada del balast sota la travessa (al carril baix), berma, talús, i a quina profunditat queda la seva part superior per sota de les travesses; alçada del sub-balast, la berma més enllà del peu del balast, i la pendent transversal de la plataforma.

Premeu **Construeix la via**. Això activa el corredor del traçat, construït com a via sobre el perfil de projecte: els carrils i les travesses s'inclinen amb el peralt, la plataforma no. Els talussos d'excavació i terraplè del corredor parteixen de la vora de la berma, i la via s'adapta al terreny projectat com una carretera.

- **Planta**: els dos carrils de cada via (capa C-RAIL-TRAK) i, amb més d'una via, el centre de cada via (C-RAIL-CNTR), a la pantalla, en DXF, DWG, PDF i fulles de planta i perfil.
- **Seccions**: les travesses, els carrils, i les bases del balast i del sub-balast en totes les seccions.
- **3D**: els carrils, cada travessa i el llit de balast (Mostra › Via), també en GLB, OBJ i USD.
- **Amidaments**: longitud de la via, carril (els dos carrils de cada via, al llarg de la línia de cada via), travesses, llit de balast i balast menys les travesses, i sub-balast, pel mètode de les àrees mitjanes entre seccions.

## Comprovacions de la geometria de la via

A més del peralt, el bloc Ferrocarril comprova la línia mateixa amb sis límits més (tots són marcadors de posició, tots els establiu vosaltres):

- **Pendent més pronunciat** del perfil de projecte, en mil·límetres per metre.
- **Radi mínim d'acord vertical**, com a factor k en R ≥ k·V² (R en metres, V en km/h). Un acord vertical parabòlic de longitud L entre dos pendents té un radi igual a L dividit per la variació de pendent.
- **Acord vertical més curt**.
- **Radi mínim de corba** en planta (0 desactiva la comprovació).
- **Arc o recta més curts**, com a segons de recorregut a la velocitat de la línia: un arc circular, o la recta entre dues corbes, més curt que aquesta distància genera un avís. 1,8 s és la coneguda regla de "la meitat de la velocitat en km/h, en metres".
- **Variació de la insuficiència de peralt** al llarg de cada transició, en mm/s a la velocitat de la línia.

**Geometria de la via** llista el pendent més pronunciat trobat i cada acord vertical amb el seu radi i el radi que necessita la velocitat de la línia. Un acord vertical que es troba sobre una transició o una rampa de peralt rep una nota. Sense perfil de projecte o sense velocitat de disseny, es salten les comprovacions que en necessiten una i una nota ho indica.

## Aparells de via i encreuaments

Sota **Aparells de via i encreuaments**, premeu **Afegeix un aparell de via**. Es col·loca a la recta més llarga; definiu-ho a la taula:

- **Punt de l'agulla per punt quilomètric**: on comença l'aparell de via en aquest traçat.
- **Cor**: el número de cor N (1:N). L'angle del cor és 2·atan(1 / 2N).
- **Costat**: esquerra o dreta, mirant en sentit creixent dels punts quilomètrics.
- **Separació de l'encreuament** en metres: si és superior a 0, l'aparell de via es converteix en un encreuament amb una via paral·lela a aquella distància (dos aparells de via i la recta entre tots dos).

La taula mostra l'**Avanç** (de la punta de l'agulla al cor), el **Radi** de la corba de tancament i la **Velocitat en desviament** que permet aquest radi amb el vostre límit d'insuficiència de peralt i sense peralt. **Fes-ne la via** converteix la ruta de desviament en un traçat propi (l'agulla, la corba de tancament i després recta a l'angle del cor) amb els mateixos paràmetres ferroviaris, a punt per allargar-lo.

La planta dibuixa els dos carrils de desviament de cada aparell de via, la seva línia central, una marca a la punta de l'agulla i al cor, i "1:N" (capa C-RAIL-TURN), a la pantalla i en DXF, DWG, PDF i fulles. La vista 3D dibuixa els carrils de desviament al nivell de la via principal.

La forma és un **marcador de posició**: una agulla recta i una corba de tancament a partir del número de cor. Un aparell de via construït segueix la norma del ferrocarril i el plànol del fabricant. Avisos: un aparell de via que surt del traçat, que es troba sobre una corba, una transició, un peralt o un acord vertical, o que es solapa amb un altre; i una nota quan la velocitat de la línia és superior a la seva velocitat en desviament.

## Envolupant de gàlib

Marqueu **Recorre una envolupant de gàlib al llarg d'aquesta via**. Trieu el **Contorn** (dues formes de marcador de posició, o **El vostre propi contorn** escrit com a un punt per línia: desplaçament respecte de l'eix de la via, i després alçada sobre la part superior del carril, en metres), la **Longitud del vehicle** i els **Centres de bogies** i, si n'hi ha, una **Vora d'andana** (costat, distància respecte de l'eix de la via, alçada sobre el carril).

A cada punt quilomètric el contorn s'inclina amb el peralt al voltant del carril baix i s'eixampla per la corba: el centre del vehicle s'acosta b² / 8R, i els seus extrems s'allunyen (L² − b²) / 8R (b els centres de bogies, L la longitud del vehicle, R el radi en aquell punt, seguint la transició). El bloc dibuixa la secció sobre la recta i on és més ampla, i llista:

- l'**envolupant més ampla** i on es troba,
- els **entreeixos de via** comparats amb els entreeixos que necessiten dues envolupants veïnes,
- l'espai lliure a la **vora d'andana**, o quant hi entra,
- cada línia d'elements, estructura de canonades i altra línia ferroviària trobats **dins l'envolupant**.

Una línia d'elements amb cotes s'avalua contra el contorn a la seva alçada sobre el carril; sense perfil de projecte, o per a un punt sense cota, s'avalua només en planta i la llista ho indica. La planta mostra les dues vores de l'envolupant (capa C-RAIL-CLRN) amb una creu a cada element que hi ha dins.

Els contorns que s'ofereixen són **marcadors de posició, no pas l'ample de cap ferrocarril**. Escriviu el gàlib d'estructura del vostre ferrocarril abans de confiar en un resultat.

## En altres programes

- **LandXML**: un traçat ferroviari s'escriu amb les seves transicions (spiType) i un bloc `Cant`: l'ample, el punt de rotació, la velocitat de la línia, i un punt quilomètric on comença i acaba cada rampa de peralt, amb el peralt aplicat, el peralt d'equilibri i la insuficiència. Obrir un fitxer LandXML amb un bloc `Cant` fa que aquell traçat sigui una via fèrria amb aquests peralts.
- **IFC**: el traçat amb els seus segments de peralt, els carrils, les travesses, el balast i el sub-balast.

## Encara no implementat

Aparells de via a l'exportació IFC, famílies d'aparells de via més enllà de l'única corba de tancament (agulles corbes, cors de punta mòbil, encreuaments dobles, diamants), normes de gàlib cinemàtic (l'envolupant és un contorn fix amb el desplaçament de la corba), línies aèries i senyalització.

**Quina norma.** Al bloc Ferrocarril, "Norma a citar" admet Cap o Europea (UIC i EN). Triar Europea indica els documents que cita un projecte europeu (EN 13803 per als paràmetres del traçat, EN 13232 per a agulles i encreuaments, EN 15273 per als gàlibs, EN 13848 per a la qualitat de la geometria de la via) i dona a cada límit un quadre per al punt del qual prové. Cap valor de cap norma no està integrat: els límits de peralt, insuficiència, excés, pendent i variació, la geometria dels aparells de via i el gàlib d'estructura són encara marcadors de posició, i la finestra ho indica. Un enginyer ferroviari comprova cada valor amb el text de la pròpia norma, i hi escriu la clàusula al costat, abans que es construeixi res. Les taules de Sud-àfrica i d'AREMA no són en aquesta versió.
