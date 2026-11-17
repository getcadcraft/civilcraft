---
title: Ombra, producció solar i confort exterior
summary: Estudieu l'ombra que projecten les masses de l'edifici al llarg d'un dia o d'una temporada, veieu-ne una animació, calculeu quanta electricitat produirien en un any típic els panells solars de les cobertes i les parets, veieu com de confortable és el carrer al costat d'un edifici (UTCI), i obteniu una lectura de cribratge del confort del vent per als vianants.
keywords: estudi d'ombra, ombra, hores de sol, animació, solar, PV, fotovoltaica, panells, producció, kWh, EPW, fitxer meteorològic, UTCI, confort tèrmic, confort exterior, estrès per calor, vent
from: 96e7af4d
---

La secció **Entorn** és sota **Hores de sol** a les **Propietats** d'una massa. Fa servir les masses que heu dibuixat com a edificis.

## Carregueu un fitxer meteorològic

Trieu un fitxer meteorològic d'un any típic (**.epw**) per a la vostra població. Són gratuïts al lloc de fitxers meteorològics d'EnergyPlus i a climate.onebuilding.org. El fitxer es manté al navegador durant aquesta visita. L'estudi de producció solar i el de confort el necessiten; l'estudi d'ombra funciona sense ell quan el projecte té un sistema de coordenades.

## Estudi d'ombra

Trieu una data (o marqueu **Temporada** i una última data i un pas en dies) i un fus horari, i després **Executa l'estudi d'ombra**. Obteniu un mapa de les hores de sol, o d'ombra, sobre el terreny al voltant de les masses; una taula de quina part del terreny queda a l'ombra al llarg del dia; i una animació del dia que podeu reproduir o avançar pas a pas. **Desa el mapa**, **Desa els fotogrames de l'animació** (tots els fotogrames en una sola imatge) i **Desa les hores** (CSV) conserven els resultats.

El terreny es considera pla al nivell de la massa més baixa. Per a l'ombra en terreny inclinat, useu **Hores de sol**, que llegeix el relleu.

## Producció solar

Definiu l'eficiència del panell, quina part de cada coberta i de cada paret es cobreix i les pèrdues del sistema, i després **Executa la producció solar**. Per a cada coberta i paret obteniu l'electricitat que produiria un metre quadrat de panell en un any típic, quanta part li treuen les masses veïnes, i un total per a cada massa. El model s'explica en paraules planes al costat del botó: és una estimació de planificació a partir d'un any típic, no una garantia.

## Confort exterior

**Executa el confort** calcula l'Índex Universal de Clima Tèrmic (UTCI) per a una persona de peu en terreny obert i al costat de la primera massa (cares sud, nord, est i oest), amb l'ombra de cada massa. Mostra quant cel es veu, l'UTCI mitjà diürn, i les hores per sobre de 32 (estrès per calor) i per sota de 0 (estrès per fred).

## Vent (cribratge)

**Executa l'estudi del vent** resol el flux d'aire al voltant de les masses una vegada per a cada direcció del vent que bufa al fitxer meteorològic (4, 8, 12 o 16 direccions), sobre l'entorn que trieu (camp obert, suburbi o centre de ciutat), i després suma el vent horari de tot l'any. El mapa acoloreix el terreny per classe de confort, des del verd (**assegut**) passant per **dempeus**, **passeig** i **caminar** fins al vermell (**incòmode**): l'activitat el límit de velocitat (4, 6, 8 i 10 m/s) de la qual se supera durant no més del 5 % de les hores. Una segona taula dona la categoria NEN 8100 (de la A a la E) a partir de la part d'hores en què el vent passa de 5 m/s. El factor de ràfega multiplica la mitjana horària per obtenir una ràfega efectiva.

Com funciona, en paraules planes: un solucionador de flux de grans remolins lattice-Boltzmann (propi, a la biblioteca `lib/wind`) en una caixa al voltant dels edificis, un perfil de velocitat del vent que puja amb l'altura segons la rugositat triada, i la velocitat a uns 1.5 m sobre el terra comparada amb la velocitat aigües amunt a 10 m. **Cribratge** és ràpid i aproximat; **Estàndard** utilitza més cel·les i triga molt més. Si el quadre diu que la graella és massa grollera (menys de 10 cel·les sobre l'edifici més alt), o que el flux encara canviava, creieu menys el mapa.

**El que no és.** El solucionador s'ha comprovat amb fluxos de manual (un canal, una cavitat amb tapa mòbil) i s'ha executat sobre un cub per veure que l'estela i l'acceleració a les cantonades són correctes. **No** s'ha validat amb mesures de túnel de vent d'edificis, de manera que cada resultat està marcat com a no validat. No l'useu per a un valor de disseny, una càrrega de vent o un certificat urbanístic: un enginyer de vent ha d'executar i confirmar un estudi adequat. El terreny pla, les parets llises dels edificis, la drecera de rugositat de l'estació meteorològica i la taula de llindars són simplificacions; els llindars poden diferir dels criteris que aplica la vostra autoritat.

## Vent amb OpenFOAM (complement)

El motor de vent integrat de dalt és experimental. Per a un solucionador de flux adequat, activeu el complement **Vent per a vianants (OpenFOAM)** a **Configuració > Complements** (està desactivat fins que ho feu). És programari amb llicència GPL propi, separat de la resta de CadCraft, i no inclou OpenFOAM: l'heu d'instal·lar vosaltres. Després, **Motor** al bloc del vent llista OpenFOAM.

Què cal configurar, una sola vegada:
1. **Instal·leu OpenFOAM** (la sèrie v d'ESI de openfoam.com; el complement està provat amb la v2512). A Ubuntu o Debian (també dins de WSL a Windows): `curl https://dl.openfoam.com/add-debian-repo.sh | sudo bash`, i després `sudo apt install openfoam2512-default`. S'instal·la a `/usr/lib/openfoam/openfoam2512`. CadCraft necessita `blockMesh`, `snappyHexMesh` i `simpleFoam` per executar-se. (El paquet antic `openfoam` 1912 de l'arxiu propi d'Ubuntu també funciona, però les seves funcions d'objectes fallen; aleshores el complement llegeix ell mateix els fitxers de resultats.)
2. **Engegueu l'ajudant** des de la carpeta `runner` del complement amb Node.js: `node cc-openfoam-runner.mjs serve`. Si OpenFOAM no és al camí de cerca, doneu-li un petit `runner.json` amb el camí al `etc/bashrc` d'OpenFOAM (`{ "bashrc": "/usr/lib/openfoam/openfoam2512/etc/bashrc" }`) i engegueu-lo amb `--config runner.json`. L'ajudant escolta només en aquest ordinador i mostra un token.
3. **Enganxeu el token** als camps del complement al bloc del vent (l'adreça es manté `http://127.0.0.1:8765`) i premeu **Comprova l'ajudant**.

Després, **Executa l'estudi del vent** treballa un cas per cada direcció del vent del fitxer meteorològic: les vostres masses es converteixen en una superfície (STL) dins d'una caixa de la mida que indica la guia habitual (5 alçades d'edifici als costats i per sobre, 10 aigües avall), es malla amb blockMesh i snappyHexMesh, s'executa com a RANS k-epsilon estacionari amb una entrada de capa límit atmosfèrica sobre la rugositat que trieu, i la velocitat a 1.5 m es llegeix de nou i es converteix a les mateixes classes de Lawson i NEN 8100. No surt res del vostre ordinador.

**Què s'ha comprovat.** El text de sobre dels resultats ho diu clarament i forma part de cada CSV desat. La redacció dels casos, la lectura dels resultats i tot el procés del complement s'han provat sense OpenFOAM, i un sol cub s'ha executat amb OpenFOAM real amb tres mides de malla (els números són a les notes del projecte). **No** s'ha validat amb mesures de túnel de vent d'edificis. És una lectura de cribratge, no un valor de disseny ni un certificat. El k-epsilon estàndard sobreestima la turbulència davant dels edificis, el terreny és pla, les parets són llises i no hi ha relleu ni vegetació.
