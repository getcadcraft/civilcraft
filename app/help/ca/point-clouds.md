---
title: Núvols de punts des d'un dron o escàner
summary: Amb el complement Núvols de punts, obriu un fitxer LAS o LAZ de milions de punts, mireu-lo tot, netegeu-lo, classifiqueu-lo en terreny, vegetació i edificis, i construïu-ne el terreny, les corbes de nivell i els volums.
keywords: núvol de punts, las, laz, dron, fotogrametria, recap, lidar, escaneig, terreny, classifica, soroll, piló, volum, desmunt i terraplè, corbes de nivell, línia de ruptura, eye-dome, ortomosaic, ortho, drapa, capa de mapa, exporta las, exporta laz, comprimeix
from: e4a4901f
---

La majoria d'usuaris no ho necessita mai, per això és un complement. Activeu {{ui:Núvols de punts}} a Configuració › Complements; apareix una pestanya {{ui:Núvols de punts}} al panell de la dreta. El fitxer es llegeix al navegador i es talla en mosaics que es guarden a l'emmagatzematge propi del navegador (o en una carpeta que trieu). **No es puja res.**

:::warning
Tot el que mostra aquesta pestanya és un nombre derivat de les vostres dades, no un certificat. S'ha provat en un emplaçament inventat, encara no en un vol de dron real: llegiu els primers resultats amb cura i expliqueu-nos què trobeu. El professional col·legiat decideix quin valor tenen el terreny, les corbes de nivell i els volums.
:::

## Obre un núvol

Sota {{ui:Obre un núvol}} trieu un fitxer LAS o LAZ. La pestanya indica quants punts conté, el seu sistema de coordenades i unitats, i quant espai necessita la construcció; premeu {{ui:Construeix el núvol}}. Una construcció es pot aturar i es reprèn amb {{ui:Reprèn}} (trieu el mateix fitxer un altre cop). El fitxer mai no es modifica. Un fitxer de 100 milions de punts es construeix en minuts en una estació de treball i ocupa aproximadament tant espai com el fitxer.

Sota {{ui:Núvols en aquest ordinador}} obriu o traieu un núvol. {{ui:Desa els núvols en una carpeta…}} (Chrome, Edge i l'aplicació Studio) desa els mosaics en una carpeta que trieu, per exemple una carpeta de núvols de CadCraft a Documents, de manera que un núvol de 10 GB no cal que càpiga a l'emmagatzematge del navegador; els núvols construïts abans es queden on es van construir. Després d'un reinici, el navegador torna a demanar permís: premeu {{ui:Torna a utilitzar la carpeta … }}.

## Mireu-lo

{{ui:Mireu-lo en 3D}} dibuixa el núvol a partir de mosaics grollers i el refina quan us hi acosteu, mai més de {{ui:Màxim de punts dibuixats}} alhora (2.5 milions; 500 mil en un telèfon). Colora segons el color propi del fitxer, l'alçada, la classe, la intensitat o el {{ui:Residu}}. {{ui:Il·luminació eye-dome}} ombreja les vores segons la profunditat perquè la forma es llegeixi sense normals (desactivada en un telèfon); {{ui:Els punts es redueixen amb la distància}} fa els punts llunyans més petits i els propers més grans; {{ui:Mida del punt}} en defineix la mida. La planta mostra el núvol com a imatge de mapa de bits sota el dibuix i **es refina quan feu zoom** en una part seva.

## Netegeu-lo

Sota {{ui:Neteja}} dibuixeu un llaç, un rectangle o un polígon a la planta (o en 3D des de la vista superior: en 3D el contorn es pren directament cap avall, de manera que només és exacte des de dalt). La pestanya mostra quants punts hi ha dins **abans** d'aplicar: {{ui:Suprimeix aquests punts}}, {{ui:Canvia'n la classe}}, {{ui:Restaura els punts suprimits}} o {{ui:Retalla fins a aquest límit}}. {{ui:Desfés}} i {{ui:Refés}} recorren el registre d'edicions; el fitxer en si mateix no es canvia mai. {{ui:Filtre de soroll…}} marca els punts aïllats com a punts baixos (classe 7) o soroll alt (classe 18).

## Classifiqueu-lo

{{ui:Troba el terreny}} treballa mosaic a mosaic i marca el terreny (classe 2) i els punts baixos; la tolerància és de 0.15 m, o de 0.08 m amb el commutador de grau topogràfic. Informa de les juntures entre mosaics que no coincideixen. Després, {{ui:Classifica la vegetació i els edificis}} marca la vegetació baixa, mitjana i alta i els edificis segons l'alçada sobre el terreny i com de pla és l'entorn. No hi ha aprenentatge automàtic, de manera que un cobert de sostre pla sota arbres pot estar mal classificat: comproveu-ho.

## Terreny, corbes de nivell i línies de ruptura

{{ui:Construeix el terreny}} crea el terreny actual a partir dels punts de terreny i l'afegeix al projecte de la mateixa manera que una importació de LAS (un sol pas per desfer). Després compara els punts amb ell: la mitjana, l'RMS, el percentil 95, la part dins de la tolerància, i els deu punts que més difereixen, cadascun amb {{ui:Vés-hi}}. Colora segons {{ui:Residu}} mostra on no coincideixen el terreny i el núvol.

Una **línia de ruptura** (una vorera, una cuneta o la coronació d'un talús) s'escull sobre el núvol: {{ui:Escull una línia de ruptura sobre el núvol}} a la vista 3D pren el punt dibuixat més proper a cada clic, i {{ui:Escull una línia de ruptura a la planta}} pren el punt del núvol més proper (primer els de terreny) sota cada clic; feu doble clic o premeu Enter per acabar la línia. La següent {{ui:Construeix el terreny}} la fa servir. {{ui:Mostra les corbes de nivell}} dibuixa les corbes de nivell sobre el núvol en una imatge petita i en defineix l'interval del projecte.

## Volums

{{ui:Volum d'acopi…}} calcula el volum de la superfície per sobre d'una base dins d'un límit que dibuixeu. Dibuixeu el límit sobre terreny pla al voltant del munt i trieu la base: el punt més baix del límit, un pla, una base corba suau, una superfície que passi pel límit, o un nivell que escriviu. En terreny inclinat o corbat useu el pla o la base corba; el punt més baix dona un valor massa alt. Els punts del límit que sobresurten dels altres (un arbre sobre la línia) queden exclosos de la base. {{ui:Vol a vol}} dona el desmunt i el terraplè entre dos núvols. Tots dos es poden desar com a CSV.

## Ortomosaic

Sota {{ui:Ortomosaic (imatge des de dalt)}} trieu l'ortomosaic del dron juntament amb el seu fitxer de referència espacial i el `.prj` quan en tingui: un GeoTIFF, o un PNG o JPEG. Esdevé una **capa de mapa** del projecte, de manera que la planta el mostra sota el dibuix, i la vista 3D (color {{ui:Mapa}}) el pinta sobre el terreny que heu construït, de manera que primer cal {{ui:Construeix el terreny}}. La pestanya indica quant del núvol cobreix la imatge, i avisa quan no en cobreix cap: la causa habitual és un sistema de coordenades diferent, de manera que cal donar-hi el fitxer `.prj`. Quan no hi ha `.prj`, el programa demana on són les coordenades. La imatge es desa dins del fitxer del projecte; un GeoTIFF de més de 200 MB es rebutja i un mosaic molt gran es redueix a 16 megapíxels, de manera que per a un aixecament gran, primer talleu el mosaic a l'emplaçament.

## Exporta

{{ui:Exporta}} escriu el núvol netejat i classificat com a fitxer nou (tots els punts, només les classes netes o només el terreny). Sota {{ui:Tipus de fitxer}} trieu:

- **LAS 1.4 (sense comprimir)**: format de punt 6, o 7 amb color.
- **LAZ (comprimit)**: els mateixos punts comprimits sense pèrdua, de manera que cada punt es recupera exactament. S'escriu com a format de punt 0, o 2 amb color, en un fitxer LAS 1.4. En l'emplaçament inventat de 300 m, el LAZ ocupava aproximadament una cinquena part de la mida del fitxer LAS 1.4. Els formats LAZ 0 i 2 només contenen les classes de 0 a 31: un punt amb una classe més alta es rebutja amb un missatge, de manera que cal exportar aquest núvol com a LAS 1.4.

El LAZ l'escriu el compressor propi de CadCraft, fet a partir de l'especificació LAZ publicada. Hem comprovat que el nostre propi lector i dos lectors LAZ independents (laz-perf, que fa servir l'aplicació per obrir fitxers LAZ, i laspy amb lazrs) recuperen cada punt exactament, i que els fitxers LAZ fets amb laspy surten idèntics byte per byte quan en tornem a escriure els punts. Encara no s'han provat altres programes; per això, si algun no obre un fitxer, digueu-nos quin és.

Quan el navegador pot escriure el fitxer a mesura que avança, trieu primer el fitxer i un núvol molt gran s'hi escriu mosaic a mosaic en lloc de reunir-se a la memòria; en cas contrari, el fitxer es reuneix i es baixa, cosa que va bé fins a uns quants centenars de megabytes.

## Què no fa

Només llegeix LAS i LAZ (E57, PLY i PCD encara no estan connectats a aquesta pestanya, i diversos fitxers d'un mateix vol no s'uneixen), no reprojecta un núvol (s'assumeix el sistema del projecte i els metres), no llegeix els fitxers RCP o RCS d'Autodesk, no fa una superfície a partir de fotografies, i no troba per si sol pals, vorades ni canonades.
