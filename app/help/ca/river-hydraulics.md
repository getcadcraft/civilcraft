---
title: Perfils de la superfície de l'aigua del riu
summary: Modelitzeu un riu a partir de la superfície del terreny i calculeu els perfils permanents de la superfície de l'aigua pel mètode de l'etapa estàndard: nivells d'aigua, energia, velocitats, nombres de Froude i l'extensió de la inundació al plànol. Una funció de laboratori; cada resultat necessita la revisió d'un enginyer.
keywords: dic, àrea de flux ineficaç, editor de seccions, riu, hidràulica, perfil de la superfície de l'aigua, remansament, mètode de l'etapa estàndard, flux permanent, 1d, seccions transversals, manning, rugositat, capacitat de conducció, calat crític, calat normal, froude, línia de gradient d'energia, extensió de la inundació, plana d'inundació, inundació, estacions de la riba, longituds de tram, contracció, expansió, subcrític, supercrític, règim mixt, ressalt hidràulic
from: fb8bf425
---

CivilCraft calcula perfils permanents unidimensionals de la superfície de l'aigua al llarg d'un riu: per a cada cabal que doneu, el nivell de l'aigua a cada secció transversal, a partir del balanç d'energia entre seccions veïnes (el mètode de l'etapa estàndard). Està en fase de laboratori mentre es comprova.

**Només com a ajuda al projecte.** Els nivells d'aigua necessiten la revisió d'un enginyer qualificat abans que ningú hi confiï: un model 1D només és tan bo com les seves seccions, els valors de rugositat, les longituds de tram i els contorns, i no coneix ponts, alcantarilles ni el flux que surt del riu.

## Dibuixeu el riu

1. Construïu primer la superfície del terreny existent (punts, línies de ruptura, o un TIN que hàgiu obert).
2. Sota **Superfície** › {{ui:Més}}, trieu {{ui:Riu}}.
3. Feu clic al llarg de l'eix del riu **d'amunt cap avall**, i després premeu {{key:Enter}} o feu doble clic.

CivilCraft talla una secció perpendicular a l'eix cada 50 m (200 ft), amb 100 m (300 ft) a cada costat, a partir del terreny. Els punts quilomètrics del riu es mesuren des de l'extrem d'aigües avall, de manera que augmenten cap amunt. Les ribes comencen com una estimació a 10 m (30 ft) a cada costat del punt més baix de cada secció.

Per afegir una secció on el riu s'estreny o hi ha una estructura, seleccioneu el riu, feu clic a {{ui:Afegeix una secció}} i dibuixeu una línia de tall que el travessi (en qualsevol sentit: es gira perquè vagi d'esquerra a dreta mirant aigües avall).

## Configureu el riu

Seleccioneu el riu per veure-lo a **Propietats**:

- **Règim de flux**: subcrític (el cas habitual: calculat cap amunt des del contorn d'aigües avall), supercrític (calculat cap avall des del contorn d'aigües amunt) o mixt (tots dos, i després el que té la força específica més gran a cada secció; una vista prèvia).
- **Perfils de cabal**: un nom i un cabal per a cadascun (per exemple un cabal de 10 anys i un de 100 anys), i el contorn a l'extrem d'aigües avall (i a l'extrem d'aigües amunt quan el règim no és subcrític): **Calat normal** amb una pendent d'energia (la pendent del llit és una primera estimació), una **Cota de la superfície de l'aigua coneguda**, o **Calat crític**.
- **Seccions a partir del terreny**: la separació, fins on van a l'esquerra i a la dreta, l'estimació de les ribes i els dos valors de n de Manning; {{ui:Torna a tallar les seccions}} substitueix les seccions (un pas per desfer).
- **La taula de seccions**: per a cada secció, els desplaçaments de les ribes esquerra i dreta, el n del canal i el n de la plana d'inundació, les longituds de tram fins a la següent secció aigües avall (plana d'inundació esquerra, canal, plana d'inundació dreta; mesurades des del plànol a l'inici) i els coeficients de contracció i expansió (0.1 i 0.3 a l'inici: transicions graduals). {{ui:Edició}} obre l'editor de seccions (a continuació); un punt després indica que la secció té un dic o una àrea ineficaç.

Cada canvi és un pas per desfer ({{key:Mod+Z}}).

## Edita una secció: ribes, dics i àrees ineficaces

{{ui:Edició}} sobre una secció dibuixa el seu terreny i us deixa arrossegar allò que llegeix el solucionador: les **ribes esquerra i dreta** (divideixen la secció en plana d'inundació esquerra, canal principal i plana d'inundació dreta), un **dic** a cada costat i les **àrees de flux ineficaç**. Cada nansa també es pot moure amb les tecles de fletxa, i cada nombre es pot escriure al costat del gràfic. {{ui:Aplica}} és un pas per desfer.

- Un **dic** té una posició (desplaçament) i una cota de coronament. El terreny més enllà, allunyat del riu, queda separat del riu mentre la superfície de l'aigua estigui per sota del coronament: la seva àrea, perímetre mullat i capacitat de conducció es deixen fora. Per sobre del coronament, tota la secció torna a comptar. Un dic es troba fora de la riba que protegeix; un que estigui dins de les ribes es marca.
- Una **àrea de flux ineficaç** conté aigua però no transporta cabal (una bossa darrere d'un terraplè, aigua morta al costat d'un accés a un pont). Doneu-li els seus dos desplaçaments i, si voleu, un nivell d'aigua per sota del qual és ineficaç ({{ui:sempre}} si està buit): per sobre d'aquest nivell flueix com la resta. Una que cobreix part del canal principal es marca.
- Entre dues seccions, l'extensió de la inundació deixa en sec el terreny darrere d'un dic que totes dues seccions tenen, mentre la superfície de l'aigua hi estigui per sota del coronament (la línia entre els dos coronaments és recta).

## Calculeu i llegiu els resultats

Feu clic a {{ui:Perfils de la superfície de l'aigua}}. Per al perfil que trieu obtindreu:

- un **gràfic** al llarg del riu (flux d'esquerra a dreta): fons del canal, ribes, superfície de l'aigua, línia de gradient d'energia i superfície d'aigua crítica; les seccions amb calat crític es marquen amb un cercle;
- una **taula** per secció: punt quilomètric del riu, cabal, fons del canal, superfície de l'aigua, superfície d'aigua crítica, línia de gradient d'energia, calat, velocitat al canal i global, el nombre de Froude del canal, àrea del flux, amplada superior, el cabal a cada plana d'inundació i al canal, la pendent d'energia, i avisos;
- **avisos** en llenguatge planer, per exemple una secció fixada a calat crític, aigua per sobre dels extrems d'una secció, o un canvi gran de capacitat de conducció entre dues seccions (afegiu seccions entre mig).

{{ui:Taula (CSV)}}, {{ui:Informe}} (text pla amb el mètode, els contorns i cada taula) i {{ui:Gràfic (SVG)}} es desen a les vostres baixades. Cadascun porta la línia de revisió.

Marqueu {{ui:Mostra l'extensió de la inundació}} a **Propietats** per ombrejar l'àrea mullada al plànol per al perfil escollit, amb la línia d'aigua dibuixada on el calat és zero. Entre seccions la superfície de l'aigua és horitzontal a través del riu i canvia linealment amb el punt quilomètric. El terreny darrere d'un dic queda en sec mentre l'aigua és per sota del seu coronament. Altres terrenys baixos dins del corredor del riu que l'aigua no pot arribar (per exemple darrere d'un terraplè de carretera) continuen ombrejats: comproveu-ho.

## Al dibuix i al panell Problemes

Les línies del riu van al plànol, al PDF i al DWG a les seves pròpies capes: **C-WATR-CNTR** (l'eix), **C-WATR-SCTN** (cada línia de tall, amb el seu punt quilomètric del riu) i **C-WATR-FLOD** (la línia d'aigua de l'extensió de la inundació, quan {{ui:Mostra l'extensió de la inundació}} està marcat per a un perfil). Els avisos del riu (una secció fixada a calat crític, aigua per sobre dels extrems de les seccions, un canvi de capacitat de conducció que demana més seccions, un balanç d'energia que no s'ha tancat, un dic dins de les ribes) també van al panell **Problemes**, sobre el riu i situats a la secció d'on procedeixen.

## Com es calcula

- Energia entre dues seccions: WS₂ + α₂V₂²/2g = WS₁ + α₁V₁²/2g + L·Sf + C·|α₂V₂²/2g − α₁V₁²/2g|.
- Capacitat de conducció per subdivisió: cada plana d'inundació es divideix on canvia el seu n, K = Σ (1/n)·A·R^(2/3) (1.486/n en unitats US); el canal és una sola peça, amb un n compost quan canvia el seu n. α surt de com es reparteix la capacitat de conducció.
- Pendent de fricció per capacitat de conducció mitjana, Sf = ((Q₁ + Q₂)/(K₁ + K₂))², sobre la longitud del tram ponderada pel cabal.
- Coeficient de contracció quan el flux s'accelera aigües avall, d'expansió quan es frena.
- Calat crític = energia específica mínima. Cada nivell d'aigua es resol en un interval tancat, de manera que mai no salta al costat equivocat del crític; quan no hi ha cap solució, es fixa a calat crític i es marca.

El programa es comprova amb el calat normal de Manning, el calat crític en un canal rectangular i l'exemple de remansament de Chow (*Open-Channel Hydraulics*, 1959, capítol 10) integrat de manera independent. Els programes habituals de rius 1D fan servir el mateix mètode, de manera que un càlcul a mà o els apunts d'un estudiant s'hi poden traslladar.

## Alcantarilles i ponts

A **Propietats** del riu, sota **Alcantarilles i ponts**, {{ui:Afegeix una alcantarilla}} o {{ui:Afegeix un pont}} posa una estructura entre dues seccions (cada tram en manté almenys dos). El perfil de sota no canvia; la superfície de l'aigua just per sobre ve de l'estructura, i el perfil continua aigües amunt des d'allí. **Resultats** afegeix una taula de cada estructura: aigües avall, nivell aigües amunt, quin control domina, el cabal per l'obertura i el cabal per sobre de la calçada o del tauler. Només flux subcrític.

- **Alcantarilla** (quadrada o circular, una o més canonades iguals). El control d'entrada és flux de vertedor mentre l'entrada és lliure i flux d'orifici quan s'ofega, combinats entre un nivell aigües amunt d'un i d'un i mig cops l'alçada d'elevació. El control de sortida és el balanç d'energia: pèrdua d'entrada, fricció i altura de velocitat de sortida, sobre el més alt entre el nivell aigües avall i la meitat del calat crític i la clau, menys la caiguda al llarg de la canonada. El nivell aigües amunt és el més gran dels dos. Marqueu **L'aigua pot passar per sobre de la carretera** i el flux de vertedor de la carretera comparteix el cabal amb les canonades.
- **Pont.** L'obertura és la secció sota el pont, tallada als estribs, amb cada pilar com una àrea que no transporta cabal. La superfície de l'aigua a l'obertura ve de la secció de sota (coeficient d'expansió), i la de la secció de dalt de l'obertura (coeficient de contracció). Si l'obertura no pot passar el cabal amb aquest nivell aigües avall, funciona a calat crític i el pont es marca com a obstrucció. Si l'aigua arriba a la biga inferior el flux és de pressió (tipus comporta mentre el nivell aigües avall és per sota de la biga inferior, ofegat per sobre), i l'aigua per sobre del tauler afegeix flux de vertedor; el nivell aigües amunt és aquell on sumen el cabal.

Els coeficients (descàrrega, pèrdua d'entrada, vertedor) són valors per defecte amb xifres rodones. Canvieu-los per al vostre projecte. No són els gràfics ajustats que imprimeixen els manuals de projecte d'alcantarilles, de manera que cal tractar el nivell aigües amunt d'una alcantarilla a prop del seu límit com una estimació. L'aigua per sobre d'una carretera o d'un tauler, una entrada ofegada, una obertura obstruïda i un flux ràpid en una canonada es mostren a **Problemes**.

## Flux no permanent

{{ui:Flux no permanent…}} a **Propietats** del riu encamina un hidrograma de crescuda pel llarg de les seccions. Escriviu l'entrada com a hores i cabals, un parell per línia, la pendent d'aigües avall (calat normal) i quant de temps ha de funcionar. Comença des de la superfície d'aigua permanent al primer cabal i resol les equacions unidimensionals completes (l'esquema implícit de quatre punts, ponderat 0.6 en el temps). Obteniu el nivell i el cabal punta a cada secció amb l'hora en què succeeix cadascun, un gràfic del cabal als dos extrems, i la comprovació de volums (entrada, sortida i el canvi emmagatzemat). Es comprova que el flux permanent es manté permanent, que un salt a l'entrada acaba al perfil permanent del nou cabal, que el volum es tanca, i la velocitat de l'ona de crescuda contra l'ona cinemàtica. Flux subcrític, un sol tram, sense entrades laterals, i sense alcantarilles ni ponts dins de l'execució.

## Confluències

Trams que s'uneixen a una sortida: els cabals se sumen, i la superfície de l'aigua al cap del tram aigües avall es porta fins als extrems dels trams que hi conflueixen (la mateixa superfície d'aigua a la confluència, el mètode simple: sense angle, sense momentum, de manera que és adequat per a nombres de Froude baixos). El model i les proves hi són (`river-structures.js`); un plafó per unir dos rius al plànol encara no està implementat.

## Encara no implementat

Resclosos i comportes com a estructures pròpies, un plafó per a les confluències, estructures dins d'una execució no permanent, i flux no permanent supercrític. Una execució de règim mixt marca un ressalt hidràulic entre dues seccions però no el situa.

**On s'uneixen els rius.** A **Propietats** del riu, «Desemboca a» indica el riu al qual s'uneix. Els rius que s'uneixen es resolen junts: el riu on desemboquen porta la suma dels seus cabals, i cadascun acaba a la superfície d'aigua de la primera secció d'aquest riu (el mètode de superfície d'aigua igual; deixa de banda l'angle i el momentum dels cabals). Per unir un riu principal i un rierol, dibuixeu un riu curt per sota de la confluència i feu que tots dos hi desemboquin. Els resultats mostren una taula de confluència. Els valors per defecte d'aquests resultats (contracció 0.1, expansió 0.3, canal d'una sola peça amb una rugositat composta, el règim mixt per força específica) es mantenen fins que un enginyer els revisi, i els Resultats ho indiquen.
