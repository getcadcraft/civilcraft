---
title: Novetats de les versions 0.8 i 0.8.1
summary: CivilCraft 0.8 afegeix Fes ploure (una tempesta sobre l'explanació), un equilibrador de moviment de terres, un cercador de millor traçat, basses de retenció, progrés a partir de topografies, un importador de l'adreça a la parcel·la que manté el lloc dins del projecte, i finestres per a sòls i talussos, cruïlles i senyalització, ajust topogràfic, mines a cel obert, enllaços de ràdio i agulles ferroviàries. 0.8.1 corregeix la lectura de fitxers DWG.
keywords: novetats, què hi ha de nou, notes de la versió, registre de canvis, canvis, 0.8, 0.8.1, versió, noves funcions, pluja, tempesta, acumulació d'aigua, desbordament, moviment de terres, equilibri, desmunt i terraplè, transport de terres, millor traçat, cost mínim, traçat, bassa de retenció, desguàs, descens, franc, progrés, topografia, dron, acopi, adreça, parcel·la, sòl, inundació, estabilitat de talussos, Bishop, assentament, cruïlla, senyalització, senyals, distància de visibilitat, ajust, mínims quadrats, itinerari, mina a cel obert, model de blocs, enllaç de ràdio, Fresnel, agulla ferroviària, encreuament, idiomes, problemes, Live, DWG
from: b0932cf0
---

Aquests són els canvis de CivilCraft 0.8 (2026-11-01) i 0.8.1 (2026-11-02), respecte de la 0.7. Les parts noves més importants són eines que proven l'explanació i el lloc (pluja, moviment de terres, traçats, basses, progrés) i sis finestres de càlcul per al terreny, les carreteres, les topografies, les mines, els enllaços i el ferrocarril.

## Novetats

### Prova l'explanació

- **Fes ploure.** {{ui:Make it rain…}} (sota {{ui:Surface}}) fa caure una tempesta sobre el terreny explanat. Veieu com l'aigua baixa per les plataformes, s'acumula als racons baixos i desborda les basses que són massa petites. L'execució és animada i dona els volums, el cabal màxim de sortida i un CSV de cada bassa. La cel·la per defecte és gruixuda perquè una primera ullada sigui ràpida; una cel·la més fina és més lenta. Les basses que desborden també apareixen al tauler Problemes.
- **Equilibrador de moviment de terres.** {{ui:Earthwork balancer…}} puja o baixa una plataforma fins que el desmunt iguala el terraplè, i mostra la taula de transport entre tots dos.
- **Millor traçat.** {{ui:Best route…}}: trieu un inici i un final, i CivilCraft troba el camí més barat pel terreny que es manté dins dels límits de pendent i de corba, i en fa un traçat.
- **Basses de retenció.** {{ui:Detention ponds…}} calcula la cota i l'emmagatzematge a partir del terreny, accepta dispositius de desguàs (orifici, presa, entalla en V, abocador), fa passar una tempesta per la bassa i comprova el cabal màxim retingut, el temps de descens i el franc.
- **Progrés a partir de topografies.** {{ui:Progress from surveys…}} compara superfícies de dron o d'escaneig de dates diferents amb el terreny tal com era i amb el disseny: percentatge completat per volum, àrees excavades de més i farcides de més, acopis i quan acabarà la feina a aquest ritme (marcat com a estimació).

### Coneix el lloc

- **De l'adreça a la parcel·la.** {{ui:Address to site…}} reuneix en un sol lloc les dades de parcel·les obertes, edificis, zonificació, sòl, inundació i relleu. Podeu mantenir el lloc dins del fitxer del projecte: l'adreça escrita, cada font amb el dia que l'heu obtinguda i la seva llicència, i el que ha tornat. En reobrir o compartir el projecte, el lloc hi és encara, sense tornar a obtenir res. També el podeu desar com a fitxer de lloc o enviar-lo a BimCraft. Vegeu [De l'adreça a la parcel·la](topic:address-to-site).

### Terreny, carreteres, topografia, mines, enllaços i ferrocarril

- **Sòls i talussos.** {{ui:Soils and slopes…}} dibuixa el perfil del sòl entre els sondejos que escriviu. El mètode de Bishop busca després el cercle crític sobre el vostre terreny, amb nivell freàtic, sobrecàrrega i coeficient sísmic; l'assentament d'una sabata inclou consolidació, assentament immediat i temps.
- **Cruïlles i senyalització.** {{ui:Junctions and striping…}} ajunta els trams amb retorns de vorera (un radi per tram o retorns de tres centres), la distància de visibilitat per a la velocitat de projecte, una comprovació dels triangles de visibilitat, passos de vianants, barres d'aturada, marques i senyals amb un quadre de senyals. Es dibuixen a la planta i es desen com a .dxf amb capes amb nom.
- **Ajust topogràfic.** {{ui:Survey adjustment…}} fa un ajust per mínims quadrats d'un itinerari o d'una xarxa: coordenades ajustades, el·lipses d'error, la prova de khi quadrat i un marcatge a la mesura que no encaixa. Hi ha incloses xarxes lliures, el tancament d'un itinerari per la regla de la brúixola i fitxers de camp RW5, GSI, JobXML o CSV, i els punts ajustats es desen com a CSV.
- **Mines a cel obert.** {{ui:Open pits…}} converteix les mostres de sondeig en un model de blocs i en la mina final dins de l'angle de talús, amb la relació d'estèril, una taula per banc i una corba de llei i tonatge. També hi ha mines imbricades segons el factor d'ingressos i un calendari de producció amb flux de caixa descomptat.
- **Enllaços de ràdio.** {{ui:Radio links…}} comprova la visibilitat directa sobre el terreny amb la corbatura de la Terra, la primera zona de Fresnel, el balanç d'enllaç, el marge d'esvaiment i la interrupció per multitrajecte, i dona l'alçada del mast que deixaria lliure el camí. També fa pressupostos de pèrdua de fibra, quantitats de la ruta i el vent sobre una torre.
- **Agulles ferroviàries.** {{ui:Rail turnouts…}} crea una agulla a partir del seu número de cor, els encreuaments entre vies paral·leles i un gàlibe de l'estructura inclinat pel peralt i eixamplat en una corba. Una agulla pot situar-se en un punt quilomètric d'un traçat.

Vegeu [Sòls, cruïlles, ajust topogràfic, mines, enllaços de ràdio i agulles](topic:soils-roads-survey-mines-links).

## En totes les aplicacions

- **Idiomes.** 54 idiomes, deu d'ells nous. Els idiomes diferents de l'anglès són esborranys automàtics fins que un parlant nadiu els llegeixi. Els temes d'ajuda continuen essent majoritàriament en anglès.
- **Files de la barra d'eines.** {{ui:Settings}} › {{ui:General}} › {{ui:Toolbar rows}}: Ajusta (com abans), 2 files o 1 fila. La cinta de CivilCraft mostra l'eina més usada en gran, les següents en petit, i la resta darrere de la fletxa del nom del grup.
- **Dispositius d'entrada.** El trackpad, el llapis, el ratolí 3D, el comandament i el MIDI poden controlar les aplicacions.
- **Problemes.** Un tauler Problemes que avisa en totes les aplicacions, amb comprovacions que llegeixen paquets de normatives.
- **Live.** Una vista de qui és on en una sessió Live.
- **Complements.** Un llistat de complements, amb complements d'il·luminació.
- **Connecteu la IA.** Qualsevol assistent que connecteu pot manejar les eines de CivilCraft. Inclou una nota que diu que la connexió amb un clic dins de CadCraft Studio i el connector allotjat encara no estan a punt. Vegeu [Deixeu que un assistent d'IA treballi amb el vostre lloc](topic:assistants).

## Corregit a la 0.8.1

- **Secció de classes DWG.** Es llegia com un tipus incorrecte (GitHub cadcraft#5). Corregit a CivilCraft juntament amb CadCraft, BimCraft, ModelCraft i TakeoffCraft.
- **Canvi d'idioma mentre s'executa.** CadCraft Studio i les edicions empaquetades poden canviar d'idioma en temps d'execució. Abans només eren en anglès. Encara no s'ha provat a totes les plataformes: digueu-nos si l'idioma no canvia.

## Encara no és en aquesta versió

- **Són ajudes de càlcul.** Cada resultat de les finestres noves necessita la revisió d'un enginyer. Les resistències del sòl parteixen de valors típics del grup de sòl, i la finestra ho indica.
- **Fes ploure.** Una execució sobre el lloc d'exemple pot trigar més de dos minuts al navegador amb una cel·la fina. Es va comprovar amb casos calculats a mà i amb una conca en forma de V, però encara no en un lloc modelat real.
- **De l'adreça a la parcel·la.** Llegeix fitxers de dades obertes que porteu, i només s'ha provat amb fitxers propis. La vegetació no és una font. Obtenir les fonts automàticament depèn de la redacció sobre privacitat.
- **Progrés a partir de topografies.** Provat només amb topografies inventades. El progrés en plànols i marques (MarkupCraft) i la comparació d'escaneig amb el model (BimCraft) encara no estan implementats.
- **Sòls i talussos.** Només superfícies circulars: sense cerca de falca ni de bloc i sense esquerda de tensió.
- **Cruïlles.** Un radi per tram, sense recorreguts de camió i encara no entren al corredor.
- **Fitxers de camp.** Els lectors s'han escrit a partir de descripcions públiques dels formats i s'han provat amb fitxers fets per nosaltres. Calen fitxers reals d'instruments.
- **Enllaços i ferrocarril.** Enllaços de ràdio: només pèrdua en espai lliure i multitrajecte (sense esvaiment per pluja ni patrons d'antena), i cap norma ferroviària: cada límit ferroviari és un marcador de posició, amb xifres d'esborrany que cap enginyer ferroviari no ha revisat.
- **Windows i macOS.** 0.8 no està signada amb codi. Windows pot avisar, i macOS demana fer clic dret i després Obre.

Tot la resta és a [Encara no implementat](topic:not-built-yet). Per a la versió anterior, vegeu [Novetats de la 0.7](topic:whats-new-0-7).
