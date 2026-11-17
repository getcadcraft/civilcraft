---
title: Seleccionar, copiar e pegar puntos de levantamento
summary: Seleccione puntos de levantamento con clic, Shift e un recadro, ou todos á vez; copie, corte, pegue, pegue no mesmo sitio, duplique e elimine con números novos que nunca coincidan; pegue filas de puntos desde e cara a unha folla de cálculo.
keywords: copiar, pegar, cortar, duplicar, eliminar puntos, seleccionar puntos, seleccionar todo, selección por recadro, ventá, portapapeis, folla de cálculo, csv, renumerar, números de punto, pegar no mesmo sitio, clonar, replanteo
from: 78a6aea7
---

Os puntos de levantamento pódense copiar e pegar dentro dun proxecto, entre proxectos en dúas pestanas do navegador, e desde e cara a unha folla de cálculo. Cada cambio é un paso de desfacer, e a superficie reconstrúese de inmediato a partir dos novos puntos.

## Seleccionar puntos

Con {{ui:Seleccionar}} ({{key:V}}):

- **Prema** nun punto para seleccionalo (só ese). Os seus números móstranse en **Propiedades**.
- {{key:Shift}} e **clic** engade un punto á selección ou sácao dela.
- {{key:Shift}} e **arrastre** debuxa un recadro: os puntos que quedan dentro engádense á selección. Se arrastra ao redor dos puntos, o gesto convértese nun lazo; ver [Selección con lazo de puntos de levantamento](topic:lasso-selection). Un arrastre sen {{key:Shift}} despraza a vista, como sempre.
- {{key:Mod+A}} (ou {{ui:Máis}} › {{ui:Seleccionar todos os puntos}}) selecciona todos os puntos.
- {{key:Esc}} (ou {{ui:Máis}} › {{ui:Non seleccionar nada}}) borra a selección.

Os puntos seleccionados teñen un anel. Cando hai máis dun seleccionado, **Propiedades** mostra canto son, os seus números, o intervalo de cotas e os seus grupos.

## Copiar, cortar e eliminar

- {{ui:Copiar}} ou {{key:Mod+C}} copia os puntos seleccionados. CivilCraft garda a copia e tamén a pon no portapapeis do sistema como filas de puntos, para que poida pegala directamente nunha folla de cálculo ou nun ficheiro de texto.
- {{ui:Máis}} › {{ui:Cortar}} ou {{key:Mod+X}} copia e elimina os puntos nun só paso.
- {{ui:Máis}} › {{ui:Eliminar}} ou {{key:Delete}} elimínaos. {{key:Mod+Z}} devólveos.

As filas teñen o punto, o norte, o este, a cota e a descrición (P,N,E,Z,D), separados por comas, con tres decimais. Para obter o este antes que o norte, configure **Filas de puntos** en [Configuración de CivilCraft](topic:settings). Unha descrición que unha folla de cálculo trataría como fórmula (que comece por =, +, - ou @) recibe un apóstrofo diante, para que siga sendo texto.

## Pegar

1. Prema {{key:Mod+V}} ou prema {{ui:Pegar}}. Os puntos seguen o punteiro como pequenas cruces, cunha liña de puntos que leva ata onde estaban.
2. Prema onde han ir. O centro dos puntos copiados cae no punto onde premeu.
3. Ou prema {{key:Enter}} para colocalos nas súas propias coordenadas, ou {{key:Esc}} para cancelar.

{{ui:Máis}} › {{ui:Pegar no mesmo sitio}} ou {{key:Mod+Shift+V}} pega nas coordenadas propias dos puntos de inmediato. Os puntos pegados quedan seleccionados despois, para que poida copialos, movelos ou eliminalos de novo.

:::note
Ao premer {{ui:Pegar}} na barra de ferramentas lese o portapapeis do sistema. A primeira vez, o navegador pode preguntar se CivilCraft pode ver o portapapeis. Se o rexeita, o botón da barra de ferramentas pega só a copia propia de CivilCraft; {{key:Mod+V}} segue pegando filas dunha folla de cálculo sen preguntar.
:::

## Os números de punto nunca coinciden

Dous puntos nunca comparten número. Ao pegar:

- Un punto pegado conserva o seu número cando ningún punto do proxecto o ten. Así, despois de **Cortar**, os puntos se pegan de novo cos seus propios números, e os puntos copiados doutro proxecto conservan os seus onde estean libres.
- Un punto pegado cuxo número xa está ocupado recibe un número enteiro novo: un máis que o maior número en uso, contando cara arriba.
- A barra de estado indica o que pasou, por exemplo: «1 conservou o seu número; 9 recibiron números novos: 10–18 pasaron a ser 277–285».

En [Configuración de CivilCraft](topic:settings) pode escoller **Sempre números novos**, e un número co que comezan os números novos, por exemplo 5.000 para os puntos de deseño.

:::warning
Os grupos de puntos que constrúen a superficie como **liña de quebra** unen os seus puntos pola orde dos números. As copias pegadas de puntos de liña de quebra (por exemplo, disparos FL) reciben números novos e máis altos e únense ao final desa liña de quebra, quizais cun salto longo. Revise o plano despois de pegar estes puntos, ou defina o seu grupo como {{ui:Puntos}}.
:::

## Duplicar

{{ui:Máis}} › {{ui:Duplicar}} ou {{key:Mod+D}} fai unha copia dos puntos seleccionados que segue o punteiro: prema onde debe ir. As copias reciben sempre números novos, e o portapapeis de CivilCraft queda como estaba.

## Desde unha folla de cálculo ou un ficheiro de texto

Seleccione filas de puntos nunha folla de cálculo (punto, norte, este, cota, descrición) e cópiaas. En CivilCraft prema {{key:Mod+V}} e prema onde han ir, ou prema {{key:Mod+Shift+V}} para colocalos nas súas propias coordenadas, que é normalmente o que se quere para datos de levantamento reais.

As filas léense exactamente como un [ficheiro de puntos](topic:point-file-formats): comas, tabulacións ou espazos, e unha fila de cabeceira se a hai. Sen cabeceira, a orde das columnas vén de **Filas de puntos** en [Configuración de CivilCraft](topic:settings).

Cando hai as dúas cousas, CivilCraft decide polo que é máis recente: as filas do portapapeis do sistema que difiren da última copia de CivilCraft copiáronse despois, así que pégánse. O texto que non contén puntos ignórase, e pégase no seu lugar a copia propia de CivilCraft.

## Entre proxectos e pestanas

A copia gárdase neste navegador, polo que unha segunda pestana de CivilCraft pode pegala, mesmo despois de pechar a primeira. Os puntos copiados nun proxecto en metros e pegados nun proxecto en pés conservan os seus números tal como están: non se converte nada, e a barra de estado así o indica.

## O que non se copia

Por agora só se copian os puntos de levantamento. Os trazados, as plataformas, as redes de tubaxes, as liñas de quebra e os límites aínda non se poden copiar nin pegar. Pegar non pode mover puntos existentes: use {{ui:Cortar}} e pegar, ou mova un punto de cada vez ([Editar un punto de levantamento](topic:edit-points)).
