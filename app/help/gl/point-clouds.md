---
title: Nubes de puntos dun drone ou escáner
summary: Co complemento Nubes de puntos, abra un ficheiro LAS ou LAZ de millóns de puntos, mírao todo, límpao, clasifíqueo en terreo, vexetación e edificios, e constrúa a partir del o terreo, as curvas de nivel e os volumes.
keywords: nube de puntos, las, laz, drone, fotogrametría, recap, lidar, escaneado, terreo, clasificar, ruído, acopio, volume, desmonte e terraplén, curvas de nivel, liña de quebra, eye-dome, ortomosaico, ortho, drapeado, capa de mapa, exportar las, exportar laz, comprimir
from: e4a4901f
---

A maioría da xente nunca o necesita, por iso é un complemento. Active {{ui:Nubes de puntos}} en Configuración › Complementos; aparece unha pestana {{ui:Nubes de puntos}} no panel da dereita. O ficheiro lese no navegador e divídese en teselas que se gardan no almacenamento propio do navegador (ou nun cartafol que vostede escolla). **Non se envía nada.**

:::warning
Todo o que esta pestana informa é un número dos seus datos, non un certificado. Probouse nun terreo ficticio, e aínda non nun levantamento real con drone: lea os primeiros resultados con coidado e díganos o que atopa. O técnico habilitado decide o que valen o terreo, as curvas de nivel e os volumes.
:::

## Abrir unha nube

En {{ui:Abrir unha nube}} escolla un ficheiro LAS ou LAZ. A pestana indica cantos puntos contén, o seu sistema de coordenadas e as súas unidades, e canto espazo precisa unha construción; prema {{ui:Construír a nube}}. Unha construción pode detela e retómala con {{ui:Retomar}} (escolla de novo o mesmo ficheiro). O ficheiro nunca se modifica. Un ficheiro de 100 millóns de puntos constrúese en minutos nunha estación de traballo e ocupa aproximadamente o mesmo espazo que o ficheiro.

En {{ui:Nubes neste ordenador}} abre ou elimina unha nube. {{ui:Gardar as nubes nun cartafol…}} (Chrome, Edge e a aplicación Studio) garda as teselas nun cartafol que vostede escolla, por exemplo un cartafol de nubes de CadCraft en Documentos, de modo que unha nube de 10 GB non tería que caber no almacenamento do navegador; as nubes construídas antes quedan onde foron construídas. O navegador volve pedir permiso despois dun reinicio: prema {{ui:Usar de novo o cartafol …}}.

## Mirala

{{ui:Ver en 3D}} debuxa a nube a partir de teselas grosas e refínaa a medida que se achega, sen superar nunca {{ui:Máis puntos debuxados}} de cada vez (2,5 millóns; 500 mil nun teléfono). Colorear pola cor propia do ficheiro, pola altura, pola clase, pola intensidade ou polo residuo. {{ui:Iluminación eye-dome}} sombrea as arestas segundo a profundidade para que a forma se lea sen normais (desactivada nun teléfono); {{ui:Os puntos diminúen coa distancia}} fai máis pequenos os puntos lonxanos e máis grandes os próximos; {{ui:Tamaño do punto}} fixa o tamaño. O plano mostra a nube como unha trama baixo o seu debuxo e **refínase ao achegar o zoom** a unha parte dela.

## Limpala

En {{ui:Limpar}} debuxe un lazo, unha caixa ou un polígono no plano (ou en 3D desde a vista superior: en 3D o contorno trázase en vertical, así que só é exacto desde arriba). A pestana amosa cantos puntos hai dentro **antes** de aplicar: {{ui:Eliminar estes puntos}}, {{ui:Cambiar a súa clase}}, {{ui:Restaurar os puntos eliminados}} ou {{ui:Recortar a este límite}}. {{ui:Desfacer}} e {{ui:Refacer}} percorren o rexistro de edicións; o ficheiro en si nunca se modifica. {{ui:Filtro de ruído…}} marca os puntos extraviados como puntos baixos (clase 7) ou ruído alto (clase 18).

## Clasificala

{{ui:Atopar o terreo}} traballa tesela a tesela e marca o terreo (clase 2) e os puntos baixos; a tolerancia é de 0,15 m, ou de 0,08 m co interruptor de calidade de levantamento. Informa das xuntas entre teselas que non coinciden. {{ui:Clasificar vexetación e edificios}} despois marca a vexetación baixa, media e alta e os edificios, a partir da altura sobre o terreo e de como de plana é a contorna. Non hai aprendizaxe automática, así que un cobertizo de teito plano baixo as árbores pode estar mal: revíseo.

## Terreo, curvas de nivel, liñas de quebra

{{ui:Construír o terreo}} crea o terreo existente a partir dos puntos de terreo e engádeo ao proxecto do mesmo xeito que unha importación LAS (un paso de desfacer). Despois compara os puntos con el: a media, o RMS, o percentil 95, a proporción dentro da tolerancia e os dez lugares que máis difiren, cada un con {{ui:Ir alí}}. Colorear por {{ui:Residuo}} mostra onde non coinciden o terreo e a nube.

Unha **liña de quebra** (un bordo de beirarrúa, unha cuneta ou o cume dun talude) escóllese na nube: {{ui:Escoller unha liña de quebra na nube}} na vista 3D toma o punto debuxado máis próximo en cada clic, e {{ui:Escoller unha liña de quebra no plano}} toma o punto da nube máis próximo (primeiro o terreo) baixo cada clic; faga dobre clic ou prema Enter para rematar a liña. O seguinte {{ui:Construír o terreo}} a usa. {{ui:Amosar curvas de nivel}} debuxa as curvas de nivel sobre a nube nunha pequena imaxe e fixa o intervalo do proxecto.

## Volumes

{{ui:Volume de acopio…}} calcula o volume da superficie por riba dunha base dentro dun límite que debuxa. Debuxe o límite sobre terreo nivelado ao redor do montón e escolla a base: o punto máis baixo do límite, un plano, unha base curva suave, unha superficie que pase polo límite, ou un nivel que escriba. En terreo inclinado ou curvo use o plano ou a base curva; o punto máis baixo dá unha lectura demasiado alta. Os puntos do límite que sobresaen dos demais (unha árbore na liña) déixanse fóra da base. {{ui:Voo a voo}} dá o desmonte e o terraplén entre dúas nubes. Ambos poden gardarse como CSV.

## Ortomosaico

En {{ui:Ortomosaico (imaxe desde arriba)}} escolla o ortomosaico do drone xunto co seu ficheiro de mundo e o `.prj`, cando os teña: un GeoTIFF, ou un PNG ou JPEG. Convértese nunha **capa de mapa** do proxecto, así que o plano a mostra baixo o seu debuxo, e a vista 3D (cor {{ui:Mapa}}) pinta a imaxe sobre o terreo construído, polo que hai que {{ui:Construír o terreo}} primeiro. A pestana indica canta parte da nube cobre a imaxe e avisa cando non cobre ningunha: a causa habitual é outro sistema de coordenadas, así que achegue o ficheiro `.prj`. Cando non hai `.prj`, o programa pregunta onde están as coordenadas. A imaxe gárdase dentro do ficheiro do proxecto; un GeoTIFF de máis de 200 MB rexéitase e un mosaico moi grande redúcese a 16 megapíxeles, así que, para un levantamento grande, recorte antes o mosaico ao terreo.

## Exportar

{{ui:Exportar}} escribe a nube limpa e clasificada como un ficheiro novo (todos os puntos, as clases limpas ou só o terreo). En {{ui:Tipo de ficheiro}} escolla:

- **LAS 1.4 (sen comprimir)**: formato de punto 6, ou 7 con cor.
- **LAZ (comprimido)**: os mesmos puntos comprimidos sen perda, de xeito que cada punto se recupera exactamente. Escríbese como formato de punto 0, ou 2 con cor, nun ficheiro LAS 1.4. No terreo ficticio de 300 m, o LAZ ocupou aproximadamente unha quinta parte do tamaño do ficheiro LAS 1.4. Os formatos LAZ 0 e 2 só admiten as clases 0 a 31: un punto cunha clase superior recházase cunha mensaxe, así que exporte esa nube como LAS 1.4.

O LAZ escríbeo o compresor propio de CadCraft, feito a partir da especificación LAZ publicada. Comprobamos que o noso lector e dous lectores LAZ independentes (laz-perf, que a aplicación usa para abrir ficheiros LAZ, e laspy con lazrs) len todos os puntos exactamente, e que os ficheiros LAZ feitos con laspy saen byte por byte iguais cando volvemos escribir os seus puntos. Aínda non se probaron outros programas, así que, se un non abre un ficheiro, díganos cal.

Onde o navegador pode escribir un ficheiro segundo avanza, primeiro escolla o ficheiro, e unha nube moi grande escríbese nel tesela a tesela en lugar de reunirse na memoria; se non, o ficheiro reúnese e descárgase, o que está ben ata uns poucos centenares de megabytes.

## O que non fai

Só le LAS e LAZ (E57, PLY e PCD aínda non están conectados a esta pestana, e varios ficheiros dun mesmo voo non se unen), non reproxecta unha nube (asúmese o sistema do proxecto e os metros), non le ficheiros RCP ou RCS de Autodesk, non crea unha superficie a partir de fotografías e non atopa por si mesmo postes, beirarrúas ou tubaxes.
