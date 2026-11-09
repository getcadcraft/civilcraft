---
title: Ficheiros que pode abrir, gardar e exportar
summary: Ficheiros de puntos, LandXML e proxectos de CivilCraft de entrada; proxectos, LandXML, DXF e PDF de saída; o que garda cada un, onde van os ficheiros e que cambia sen conexión.
keywords: abrir, gardar, exportar, importar, formatos de ficheiro, csv, txt, landxml, xml, dxf, pdf, json, descargar, ficheiro de proxecto
from: a7debb61
---

CivilCraft abre ficheiros do seu ordenador e garda descargándoos de novo nel. Non se envía nada e nada se garda nun servidor. Vexa tamén [Os seus ficheiros](common:your-files).

## Que abre

Prema {{ui:Open}} (ou prema {{key:Mod+O}}) e escolla un ficheiro, ou arrastre o ficheiro desde {{pick:mac=Finder|windows=Explorador de ficheiros|linux=o seu xestor de ficheiros}} ata o plano. Un ficheiro de cada vez; os ficheiros de máis de 200 MB non se admiten.

| Tipo | Nomes de ficheiro | Que pasa |
|---|---|---|
| Ficheiro de puntos | `.csv`, `.txt`, `.pnt`, `.xyz` (calquera ficheiro de texto) | Ábrese o diálogo **Importar puntos**. Os puntos substitúen os puntos do proxecto; os trazados, as plataformas e as tubaxes permanecen. |
| LandXML | `.xml`, `.landxml` | Créase un **proxecto novo** a partir do ficheiro (pregúntase antes se o actual ten cambios sen gardar). |
| Proxecto de CivilCraft | `.civilcraft.json` (calquera `.json`) | O proxecto ábrese tal como se gardou (pregúntase antes se o actual ten cambios sen gardar). |

CivilCraft decide pola terminación do ficheiro e logo polos primeiros caracteres: o texto que comeza por `{` lese como proxecto, o que comeza por `<` como LandXML, e calquera outro como ficheiro de puntos. Un ficheiro que o cadro de abrir deixa en gris aínda se pode soltar no plano.

:::note
Importar un ficheiro de puntos nun proxecto que xa ten puntos substitúeos sen preguntar, e borra o historial de desfacer (abrir calquera ficheiro é un inicio novo para desfacer). Se a superficie veu dun LandXML, importar puntos volve a unha superficie construída a partir dos puntos. Garde primeiro se pode querer recuperar os puntos antigos.
:::

Máis información: [Formatos de ficheiros de puntos](topic:point-file-formats), [LandXML: o que se le e o que se escribe](topic:landxml-reference).

## Que garda

{{ui:Save}} ({{key:Mod+S}}) escribe dous ficheiros xuntos, con nome segundo **Nome** no panel esquerdo: `<nome>.civilcraft.json`, o proxecto que segue editando, e `<nome>.ifc`, o mesmo deseño en IFC 4.3 para os demais (vexa [Exportación e importación de IFC](topic:ifc)). Cada ficheiro rexistra o outro, e o IFC tamén leva unha copia comprimida do proxecto, de modo que un IFC enviado só aínda se abre por completo e é editable.

- **En Studio** ambos ficheiros escríbense un ao lado do outro, no mesmo sitio.
- **En Chrome e Edge** o primeiro gardado pide un cartafol e escribe os dous nel; os gardados seguintes van ao mesmo cartafol. Cancele a pregunta do cartafol para descargar os dous.
- **Noutros navegadores** descárganse os dous ficheiros, primeiro o do proxecto.

Abrir calquera dos dous ficheiros busca o outro. Abra os dous xuntos (ou solte os dous), ou abra un: en Studio o outro atópase no mesmo cartafol; nun navegador CivilCraft pregúntalle se o quere engadir ou se continúa só co que ten. Se outro programa cambiou o IFC despois de que CivilCraft o gardase, ou un ficheiro é máis antigo que o outro, o proxecto ábrese a partir do deseño máis recente e o panel de Problemas di o que pasou, con **Gardar agora** (escribe de novo os dous ficheiros) e **Mostrar a xeometría do IFC como referencia**. Un IFC só, que outro programa cambiou, ábrese a partir da súa copia do proxecto co que aínda coincide: os trazados que cambiou toman a súa xeometría, os obxectos que eliminou quedan fóra, e o resto dos cambios enuméranse sen aplicarse. Un ficheiro de proxecto anterior á versión 0.7.1 ábrese como antes.

O ficheiro de proxecto garda:

- cada punto (número, coordenadas, elevación, descrición) e o nome do ficheiro de puntos do que proceden
- a configuración da superficie: opcións de grupo, liñas de ruptura debuxadas, o límite, o bordo exterior máis longo e un TIN lido de LandXML
- a configuración da visualización
- os trazados cos seus PI, radios e estación inicial, os seus perfís de deseño (PVI e lonxitudes de curva) e a configuración do corredor
- as plataformas e a rede de tubaxes coas súas regras

Non garda o historial de desfacer. As superficies, as curvas de nivel, as liñas de enlace co terreo e os volumes non se almacenan; reconstrúense a partir das entradas gardadas cando se abre o proxecto. Un ficheiro de proxecto dunha versión máis nova de CivilCraft recházase cunha mensaxe que indica a súa versión.

## Que exporta

| Botón | Ficheiro | Contido |
|---|---|---|
| {{ui:LandXML}} | `<nome>.xml` | LandXML 1.2: puntos, o terreo existente (e a superficie nivelada cando a hai) como superficies TIN, trazados, perfís do terreo e de deseño, a rede de tubaxes |
| {{ui:DXF}} | `<nome>.dxf` | DXF R12 das liñas do plano tal como se mostran, en capas con nome |
| {{ui:DWG}} | `<nome>.dwg` | As mesmas liñas como debuxo DWG, no formato que escolla (2000 a 2018) |
| {{ui:PDF}} | `<nome>.pdf` | Un trazado vectorial do plano nunha folla, a unha escala que escolla |
| {{ui:GLB}} ou {{ui:OBJ}} (na barra da vista 3D) | `<nome>-3d.glb`, `<nome>-3d.obj` | O que mostra a vista 3D como modelo 3D: metros, Y cara arriba, escala real, arredor dunha orixe local rexistrada |

Que deixa fóra cada un: [LandXML de intercambio](topic:landxml), [Exportar o plano a DXF](topic:dxf-export) (DWG tamén), [Trazar o plano a PDF](topic:plot-pdf), [Exportar o emprazamento en 3D](topic:export-3d).

## Onde van os ficheiros

Os ficheiros gardados e exportados van onde o navegador poña as descargas, normalmente ao cartafol Descargas. Para escoller un cartafol cada vez:

:::chromium
Abra a **Configuración** do navegador, despois **Descargas**, e active **Preguntar onde gardar cada ficheiro antes de descargalo**.
:::

:::firefox
Abra **Configuración**, despois **Xeral**, e en **Ficheiros e aplicacións** escolla **Preguntar sempre onde gardar os ficheiros**.
:::

:::safari
Abra **Safari > Configuración > Xeral** e estableza **Lugar de descarga de ficheiros** en **Preguntar en cada descarga**.
:::

Se garda dúas veces co mesmo nome, o navegador pode engadir un número ao segundo ficheiro, por exemplo `Sitio (1).civilcraft.json`. Abra o máis recente a próxima vez.

## Conexión e sen conexión

CivilCraft funciona só no seu ordenador en calquera caso: abrir lé o ficheiro no navegador, gardar descárgao. Para abrir CivilCraft sen conexión ningunha, gárdeo antes para uso sen conexión:

1. Con conexión, prema {{ui:Save for offline}} na barra da aplicación superior.
2. O botón conta ("Gardando 12 de 30") e despois mostra {{ui:Offline ready}}. CivilCraft é pequeno (uns 0,6 MB), así que tarda un momento. A copia gardada inclúe esta axuda e o emprazamento de exemplo.
3. Sen conexión, abra o mesmo enderezo (ou un marcador del). Todo funciona, incluído {{ui:Open the sample site}}.

Os outros estados do botón:

- {{ui:Could not save}}: non se descargaron algúns ficheiros. Comprobe a conexión e prema de novo para tentalo.
- {{ui:Offline not available}}: esta xanela do navegador non pode gardar unha copia sen conexión (as xanelas privadas e algúns ordenadores xestionados bloquéano). Use unha xanela normal.

Prema {{ui:Offline ready}} para ver cando se gardou a copia, con dúas opcións: {{ui:Save again (get the newest version)}} e {{ui:Remove the offline copy}}. Garde de novo antes dunha visita ao terreo para que a copia coincida coa compilación máis recente. Máis en [Sen conexión](common:offline).

:::offline
Está sen conexión agora. Se CivilCraft se gardou para uso sen conexión, todo funciona, incluído o emprazamento de exemplo. Se non, siga traballando nesta lapela, pero non a recargue ata que volva ter conexión; sen unha copia gardada, {{ui:Open the sample site}} falla co erro «A mostra non se puido cargar».
:::

:::tip
Para uso en campo, garde CivilCraft para uso sen conexión e leve os ficheiros de puntos no propio portátil. Os proxectos e as exportacións gárdanse como descargas sen conexión, así que pode importar as medicións dun día, revisar a superficie e gardar o proxecto no lugar.
:::

Gardar na nube aínda non está dispoñible, e as compilacións de escritorio aínda non saíron. Por agora, os ficheiros que garda son a única copia: gárdeos nalgún lugar con copia de seguridade.

## Complementos que usa un ficheiro

Cando garda un proxecto que contén datos dun complemento (as casillas de normativa de construción, ou unha fonte de Enderezo á parcela), o ficheiro rexistra que complementos e que versións. Ábrao nun ordenador que non o teña e unha barra sobre o plano indícao e ofrece engadilo desde a lista da súa conta. O rexistro é só unha nota: o ficheiro ábrese igual.

## Desfacer desde Studio

Dentro de CadCraft Studio, cada paso que remata en CivilCraft comunícase a Studio, de modo que o seu desfacer a nivel de proxecto pode anular o último paso entre aplicacións. Studio só desfai un paso cando a pila de desfacer de CivilCraft está exactamente como o deixou ese paso; despois de abrir outro ficheiro, omite esta xanela.

## Pechar con cambios sen gardar

Cando o proxecto ten cambios sen gardar e pecha a lapela, recarga a páxina ou sae dela, o navegador pregunta se quere saír. A súa redacción e aspecto corresponden ao navegador e CivilCraft non os pode cambiar. {{ui:New}}, e abrir un proxecto ou un ficheiro LandXML, preguntan no seu lugar no cadro propio de CivilCraft **Cambios sen gardar**, con {{ui:Cancel}}, {{ui:Don’t save}} e {{ui:Save a copy}}.
