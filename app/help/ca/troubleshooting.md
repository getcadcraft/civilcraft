---
title: Solució de problemes
summary: Símptomes, causes i solucions dels problemes que es troben a CivilCraft, amb els missatges exactes que mostra l'aplicació.
keywords: problemes, errors, no funciona, solució, ajuda, missatges, resoldre, rebutjat, falta, incorrecte, intercanviat, corbes de nivell que falten
from: a9f7dedc
---

Els missatges apareixen a la barra d'estat, a la part inferior dreta, en quadres dels taulers esquerre i dret, i en els diàlegs. Es citen aquí tal com els mostra l'aplicació.

## Obrir fitxers

**"Aquest fitxer fa més de 200 MB; CivilCraft encara no obre fitxers tan grans."**
Dividiu el fitxer de punts, o reduïu les dades abans d'obrir-lo.

**"No s'ha pogut obrir site.json: Aquest no és un fitxer de projecte de CivilCraft."**
El fitxer acaba en `.json` o comença amb `{` però no és un projecte de CivilCraft. Els fitxers de punts no han de començar amb `{`.

**"No s'ha pogut obrir … Aquest fitxer de projecte és d'un CivilCraft més nou (versió 2)."**
El projecte s'ha desat amb una versió més nova de CivilCraft. Obriu-lo allà, o exporteu-ne un LandXML.

**"No s'ha pogut obrir … Això és XML però no és LandXML (el seu element arrel és <…>)."**
El fitxer és un altre tipus de XML. Exporteu un LandXML des de l'altre programa.

**"… no té punts, superfícies TIN ni traçats que CivilCraft pugui llegir."**
Tot el que hi ha al fitxer és alguna cosa que CivilCraft omet (per exemple, només superfícies de graella, o només traçats d'espiral). La resta del missatge diu què hi havia. Vegeu [LandXML: què es llegeix i què s'escriu](topic:landxml-reference).

**"La mostra no s'ha pogut carregar: …"**
{{ui:Obre el lloc d'exemple}} llegeix un fitxer del lloc de CadCraft. Sense connexió només funciona si CivilCraft s'ha desat per fer-lo servir sense connexió (el botó de la barra de l'aplicació mostra {{ui:Disponible sense connexió}}). Connecteu-vos, feu clic a {{ui:Desa per fer-lo servir sense connexió}}, i a partir d'aleshores funciona sense connexió. Vegeu [Sense connexió](common:offline).

**{{ui:Desa per fer-lo servir sense connexió}} mostra {{ui:No s'ha pogut desar}}.**
Alguns fitxers no s'han baixat. Comproveu la connexió i torneu a fer clic al botó.

**{{ui:Desa per fer-lo servir sense connexió}} mostra {{ui:Mode sense connexió no disponible}}.**
Aquesta finestra del navegador no pot guardar una còpia sense connexió, normalment perquè és una finestra privada o perquè l'ordinador està gestionat. Obriu CivilCraft en una finestra normal.

**Sense connexió, l'aplicació no s'obre de cap manera.**
No s'ha desat per fer-la servir sense connexió en aquest navegador, o el navegador ha esborrat les dades del lloc (Safari ho fa amb els llocs que no s'han visitat durant unes setmanes). Connecteu-vos, obriu CivilCraft i feu clic a {{ui:Desa per fer-lo servir sense connexió}}.

**La còpia sense connexió és d'una versió anterior.**
Feu clic a {{ui:Disponible sense connexió}}, i després a {{ui:Torna a desar (obté la versió més recent)}} mentre hi hagi connexió.

**Un fitxer surt en gris a la caixa d'obrir.**
La caixa només llista els fitxers de punts, LandXML i de projecte pels seus acabaments. Arrossegueu el fitxer sobre el plànol, o canvieu-li el nom per `.txt`.

## Importar punts

**"No s'ha pogut llegir cap punt d'aquest fitxer."**
Trieu l'ordre de les columnes a **Columnes** manualment. Si no funciona res, obriu el fitxer en un editor de text i comproveu que hi ha un punt per línia, amb números.

**El plànol apareix emmirallat, girat o estirat en una línia.**
La coordenada nord i l'est estan intercanviades. El resum deia "estimat pel nombre de columnes". Trieu PENZD en lloc de PNEZD (o al revés) a **Columnes**, o torneu a importar.

**Punts molt lluny de la resta, i el plànol amb zoom allunyat fins a un punt.**
Una fila té una errada de tecleig en una coordenada, o el fitxer barreja sistemes de coordenades. Trobeu el punt (feu clic per veure'n el número) i corregiu el fitxer.

**Files llistades a "Files no llegides".**
Vegeu la taula a [Importar punts topogràfics](topic:import-points#rows-that-are-not-read).

**Els meus punts antics han desaparegut.**
Importar un fitxer de punts substitueix tots els punts i esborra el desfer. Obriu el projecte desat per recuperar-los.

## La superfície

**"Superfície: Encara no construïda" amb una caixa vermella.**
La caixa diu el motiu: "Una superfície necessita almenys tres punts amb cotes.", "Els punts estan tots en una mateixa línia: no hi ha triangles.", "No hi ha punts amb cotes.", "El límit no es solapa amb els punts." o "No queda cap triangle dins del límit." Comproveu l'ordre de les columnes, els grups de punts (estan {{ui:Exclòs}}?) i el límit.

**Les corbes de nivell travessen una rasa o un carener en línia recta.**
Aquesta línia no és una línia de ruptura. Poseu-ne el grup a {{ui:Línia de ruptura}}, o dibuixeu-la amb l'eina {{ui:Línia de ruptura}}. Vegeu [Construir i refinar la superfície](topic:build-surface).

**Un grup de línia de ruptura dibuixa un zigzag.**
El grup té més d'una línia, o els seus punts no estan numerats al llarg de la línia. Torneu a posar el grup a {{ui:Punts}} i dibuixeu cada línia amb l'eina {{ui:Línia de ruptura}}.

**Triangles llargs i estrets al llarg de l'exterior.**
Dibuixeu un límit ({{key:O}}) o definiu **Aresta exterior més llarga**.

**No hi ha cap corba de nivell, tot i que la superfície està construïda.**
O bé {{ui:Corbes de nivell}} està desactivat a **Visualització**, o bé l'interval és tan petit que hi hauria més de 2,000 nivells de corba. Trieu un interval més gran.

**Les línies de ruptura o un límit no canvien res.**
La superfície ve d'un LandXML ("Superfície (de LandXML)"). S'utilitza tal com és. Feu clic a {{ui:Reconstrueix la superfície a partir dels punts}} per construir-la a partir dels punts.

**"Encara no hi ha superfície: obriu primer els punts topogràfics."**
La línia de ruptura, el límit i la plataforma necessiten una superfície del terreny existent. Importeu primer els punts.

**"Feu clic en un punt topogràfic amb cota: una línia de ruptura pren les cotes dels punts."**
L'eina {{ui:Línia de ruptura}} només escull punts topogràfics. Amplieu i feu clic en un punt (un quadrat taronja mostra el que agafarà).

## Dibuix

**El meu últim punt ha desaparegut quan he fet doble clic per acabar.**
En aquesta versió, fer doble clic acaba el traçat, la plataforma, la línia de ruptura o el límit, però descarta el punt on heu fet doble clic. Feu clic una vegada al darrer punt i premeu {{key:Enter}}. Useu {{key:Mod+Z}} si ja ha passat, i torneu a dibuixar.

**No puc acabar un dibuix en una tauleta.**
Per acabar cal {{key:Enter}}; encara no hi ha cap botó a la pantalla. Connecteu un teclat. Vegeu [Ratolí, trackpad i tàctil](topic:keyboard#mouse-trackpad-and-touch).

**Arrossegar per col·locar un punt desplaça el plànol en lloc de col·locar-lo.**
Un arrossegament de més de pocs píxels desplaça el plànol amb totes les eines. Feu clic sense moure.

**"Un traçat necessita almenys dos punts." / "Una plataforma necessita almenys tres cantonades." / "Un tram de canonada necessita almenys dues estructures."**
Heu premut {{key:Enter}} massa aviat. El dibuix es descarta; torneu a començar.

**Les tecles com A o G no fan res.**
Una caixa de text o una llista d'un tauler encara té el focus, i les lletres hi van. Feu clic una vegada al plànol i després premeu la tecla. En un Mac, la tecla de suprimir és Backspace per al navegador: useu Fn i Delete per suprimir una selecció.

## Traçats i perfils

**"Les corbes de PI 2 i PI 3 es solapen: … Useu radis més petits."**
Dues corbes necessiten més tangent que la que hi ha entre els seus PI. Reduïu un o els dos radis a la taula de PI, o separeu els PI.

**"El PI 3 torna enrere en línia recta; no pot prendre una corba."**
El traçat fa marxa enrere sobre si mateix en aquest PI. Mogueu o elimineu el PI.

**"Aquest traçat no té terreny sota per començar."**
El traçat és fora de la superfície. Mogueu-lo sobre la superfície, o afegiu PVI fent clic amb {{ui:Afegeix PVI}} activat.

**"La corba vertical del PVI 3 (L = …) comença abans que acabi la corba o el PVI anterior." / "… passa del següent PVI."**
Escurceu la longitud de la corba o separeu els PVI.

**"Ja hi ha un PVI a …"**
Hi ha un PVI en aquella estació. Feu clic en un altre lloc, o arrossegueu el que ja hi ha.

**La vista de perfil és buida: "Dibuixeu un traçat per veure'n el perfil."**
No hi ha cap traçat, o el seleccionat té errors.

## Corredors i plataformes

**"El corredor necessita un perfil de disseny sense errors."**
Comenceu un perfil de disseny ({{ui:Comença des del terreny}}) i corregiu els solapaments de corbes.

**"… els talussos laterals surten de la superfície abans de trobar el terreny." / "… les línies de talús surten de la superfície abans de trobar-la …"**
L'explanació arriba a la vora de la superfície abans de trobar el terreny. Mogueu el disseny cap a dins des de la vora, o acosteu-lo al terreny. Una plataforma nova dibuixada en part fora de la superfície pot començar a la cota 0: escriviu una cota real.

**"Les línies de tall del corredor es creuen …" / "La línia de tall es creua amb si mateixa …"**
Els talussos de costats diferents xoquen entre ells: corbes tancades, plataformes estretes, desmunts profunds o terraplens alts. Useu un radi més gran, una secció més estreta, una plataforma més ampla o talussos més empinats.

**"Encara no hi ha volums: una plataforma ha d'explanar-se sense problemes."**
Corregiu els problemes de la caixa vermella que hi ha a sobre.

**{{ui:Projectat (explanat)}} apareix en gris.**
Encara no explana cap plataforma ni corredor.

## Canonades

**"P2 encara no té cotes de solera."**
Feu clic a {{ui:Estableix-ne les cotes de solera segons les regles}} o escriviu les cotes de solera.

**"P1: no hi ha terreny a S1 per començar."**
L'estructura d'aigües amunt és fora de la superfície i no té brocal. Escriviu-ne un brocal.

**Cada canonada apareix marcada després d'haver mogut una estructura.**
Moure una estructura no canvia les cotes de solera. Feu clic a {{ui:Estableix totes les cotes de solera segons les regles}}.

Tots els missatges de la xarxa s'expliquen a [Dissenyar una xarxa de canonades per gravetat](topic:pipe-network#read-and-fix-problems).

## Desar i exportar

**"Encara no hi ha res per exportar." / "Encara no hi ha res per traçar."**
El projecte és buit. Importeu primer els punts.

**No trobo el fitxer desat.**
És a les baixades del navegador (normalment la carpeta Baixades). Vegeu [Fitxers que podeu obrir, desar i exportar](topic:files#where-the-files-go).

**L'escala del PDF és incorrecta al paper.**
Imprimiu al 100% o a mida real, no "ajusta a la pàgina".

**Signes d'interrogació al text del PDF.**
Els noms o les descripcions fan servir caràcters fora del conjunt de l'Europa occidental. El missatge d'estat els compta. Canvieu el nom amb caràcters simples.

**El traçat es talla a les vores.**
L'escala és massa gran per al full. Trieu l'escala marcada "(encaixa)", un full més gran, o {{ui:El que es veu a la pantalla}}.

**{{key:Mod+P}} ha obert el diàleg d'impressió del navegador.**
La pàgina no tenia el focus. Tanqueu el diàleg, feu clic al plànol i premeu {{key:Mod+P}} de nou, o feu clic a {{ui:PDF}}.

## L'aplicació en si

**La pantalla és en blanc o la barra d'eines no fa res.**
Useu una versió actual de Chrome, Edge, Firefox o Safari, i recarregueu. Vegeu [Navegadors](common:browsers).

**L'aplicació va lenta amb un fitxer de punts gran.**
Desactiveu {{ui:Triangles}}, {{ui:Etiquetes de punts}} i {{ui:Bandes d'elevació}}, i useu un interval de corbes de nivell més gran. Les superfícies molt grans triguen una estona a reconstruir-se després de cada canvi.

**El navegador pregunta "Sortir del lloc?"**
El projecte té canvis sense desar. Quedeu-vos-hi, deseu amb {{key:Mod+S}} i després sortiu.
