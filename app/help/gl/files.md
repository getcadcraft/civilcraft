---
title: Ficheiros que pode abrir, gardar e exportar
summary: Ficheiros de puntos, LandXML e proxectos de CivilCraft de entrada; proxectos, LandXML, DXF e PDF de saída; o que garda cada un, onde van os ficheiros e o que cambia sen conexión.
keywords: abrir, gardar, exportar, importar, formatos de ficheiro, csv, txt, landxml, xml, dxf, pdf, json, descargar, ficheiro de proxecto
from: 82bff559
---

CivilCraft abre ficheiros do seu ordenador e gárdaos descargándoos de novo ao ordenador. Non se envía nada e nada se garda nun servidor. Vexa tamén [Os seus ficheiros](common:your-files).

## Que abre

Prema {{ui:Abrir}} (ou prema {{key:Mod+O}}) e escolla un ficheiro, ou arrastre o ficheiro desde o {{pick:mac=Finder|windows=File Explorer|linux=o xestor de ficheiros}} ata a planta. Un ficheiro de cada vez; os ficheiros de máis de 200 MB non se admiten. Un ficheiro LandXML ou de proxecto de máis de 32 MB lese en anacos de uns 4 MB, nunca como un único bloque de texto; mentres se abre un LandXML, espere que use arredor de 13 veces o tamaño do ficheiro en memoria (un ficheiro de 69 MB usou uns 0,9 GB na nosa proba).

| Tipo | Nomes de ficheiro | Que pasa |
|---|---|---|
| Ficheiro de puntos | `.csv`, `.txt`, `.pnt`, `.xyz` (calquera ficheiro de texto) | Ábrese o diálogo **Importar puntos**. Os puntos substitúen os puntos do proxecto; os trazados, as plataformas e as tubaxes permanecen. |
| LandXML | `.xml`, `.landxml` | Créase un **proxecto novo** a partir do ficheiro (pregúntase antes se o actual ten cambios sen gardar). |
| Proxecto de CivilCraft | `.civilcraft.json` (calquera `.json`) | O proxecto ábrese como se gardou (pregúntase antes se o actual ten cambios sen gardar). |

CivilCraft decide pola terminación do ficheiro e despois polos primeiros caracteres: o texto que comeza con `{` lese como proxecto, o que comeza con `<` como LandXML, e o resto como ficheiro de puntos. Un ficheiro que a caixa de abrir deixa en gris aínda se pode soltar sobre a planta.

:::note
Importar un ficheiro de puntos nun proxecto que xa ten puntos substitúeos sen preguntar, e borra o historial de desfacer (abrir calquera ficheiro é un inicio novo para desfacer). Se a superficie veu dun LandXML, importar puntos volve a unha superficie construída a partir dos puntos. Garde antes se pode querer recuperar os puntos antigos.
:::

Detalles: [Formatos de ficheiros de puntos](topic:point-file-formats), [LandXML: o que se le e o que se escribe](topic:landxml-reference).

## Que garda

{{ui:Gardar}} ({{key:Mod+S}}) escribe dous ficheiros un ao lado do outro, co nome que haxa no campo **Nome** do panel esquerdo: `<nome>.civilcraft.json`, o proxecto que segue editando, e `<nome>.ifc`, o mesmo deseño en IFC 4.3 para os demais (vexa [Exportación e importación de IFC](topic:ifc)). Cada ficheiro menciona o outro, e o IFC tamén leva unha copia comprimida do proxecto, de xeito que un IFC enviado só se pode volver abrir totalmente editable.

- **En Studio** os dous ficheiros escríbense un ao lado do outro, no mesmo sitio.
- **En Chrome e Edge** o primeiro gardado pide un cartafol e escribe os dous nel; os gardados seguintes van ao mesmo cartafol. Cancele a pregunta do cartafol para descargar os dous.
- **En outros navegadores** os dous ficheiros descárganse, primeiro o de proxecto.

Abrir calquera dos dous ficheiros busca o outro. Abra os dous xuntos (ou solte os dous), ou abra un só: en Studio o outro atópase no mesmo cartafol; nun navegador CivilCraft pregunta se o quere engadir, ou se quere seguir só co que ten. Se outro programa cambiou o IFC despois de que CivilCraft o gardase, ou un dos ficheiros é máis antigo que o outro, o proxecto ábrese a partir do deseño máis novo e o panel Problemas di o que pasou, con **Gardar agora** (escribe de novo os dous ficheiros) e **Amosar a xeometría do IFC como referencia**. Un IFC só, cambiado por outro programa, ábrese desde a súa copia do proxecto co que aínda coincide: os trazados que cambiou toman a súa xeometría, os obxectos que eliminou quedan fóra, e o resto dos seus cambios enuméranse sen aplicarse. Un ficheiro de proxecto anterior á versión 0.7.1 ábrese como antes.

O ficheiro de proxecto garda:

- cada punto (número, coordenadas, cota, descrición) e o nome do ficheiro de puntos do que viñeron
- a configuración da superficie: opcións de grupo, liñas de ruptura debuxadas, o límite, a aresta exterior máis longa e un TIN lido de LandXML
- a configuración de visualización
- os trazados cos seus PI, radios e estación inicial, os seus perfís de deseño (PVI e lonxitudes de curva) e a configuración de corredor
- as plataformas e a rede de tubaxes coas súas regras

Non garda o historial de desfacer. As superficies, as curvas de nivel, as liñas de talude e os volumes non se gardan; reconstrúense a partir das entradas gardadas cando se abre o proxecto. Un ficheiro de proxecto dunha versión máis nova de CivilCraft recházase cun aviso que indica a súa versión.

## Que exporta

| Botón | Ficheiro | Contido |
|---|---|---|
| {{ui:LandXML}} | `<nome>.xml` | LandXML 1.2: puntos, o terreo existente (e a superficie niveladada cando a hai) como superficies TIN, trazados, perfís do terreo e de deseño, e a rede de tubaxes |
| {{ui:DXF}} | `<nome>.dxf` | DXF R12 das liñas da planta tal como se amosan, en capas con nome |
| {{ui:DWG}} | `<nome>.dwg` | As mesmas liñas como debuxo DWG, no formato que escolla (2000 a 2018) |
| {{ui:PDF}} | `<nome>.pdf` | Un trazado vectorial da planta nunha folla, a unha escala que escolla |
| {{ui:GLB}} ou {{ui:OBJ}} (na barra da vista 3D) | `<nome>-3d.glb`, `<nome>-3d.obj` | O que amosa a vista 3D como modelo 3D: metros, eixo Y cara arriba, escala real, arredor dunha orixe local gravada |

O que deixa fóra cada un: [LandXML de intercambio](topic:landxml), [Exportar a planta a DXF](topic:dxf-export) (tamén DWG), [Trazar a planta a PDF](topic:plot-pdf), [Exportar o terreo en 3D](topic:export-3d).

## Onde van os ficheiros

Os ficheiros gardados e exportados van a onde o navegador pon as descargas, normalmente ao cartafol Descargas. Para escoller un cartafol cada vez:

:::chromium
Abra a **Configuración** do navegador, despois **Descargas**, e active **Preguntar onde gardar cada ficheiro antes de descargar**.
:::

:::firefox
Abra **Configuración**, despois **Xeral**, e en **Ficheiros e aplicacións** escolla **Preguntar sempre onde gardar os ficheiros**.
:::

:::safari
Abra **Safari > Configuración > Xeral** e estableza **Localización de descarga de ficheiros** en **Preguntar en cada descarga**.
:::

Se garda dúas veces co mesmo nome, o navegador pode engadir un número ao segundo ficheiro, por exemplo `Sitio (1).civilcraft.json`. Abra o máis novo a seguinte vez.

## En liña e sen conexión

CivilCraft funciona só no seu ordenador en calquera caso: abrir lee o ficheiro no navegador, gardar descárgao. Para abrir CivilCraft sen conexión ningunha, gárdeo antes para uso sen conexión:

1. Mentres está en liña, prema {{ui:Gardar para usar sen conexión}} na barra da aplicación, na parte superior.
2. O botón conta ("Gardando 12 de 30") e despois amosa {{ui:Listo sen conexión}}. CivilCraft é pequeno (uns 0,6 MB), así que isto leva un momento. A copia gardada inclúe esta axuda e o sitio de exemplo.
3. Sen conexión, abra o mesmo enderezo (ou un marcador del). Todo funciona, incluído {{ui:Abrir o sitio de exemplo}}.

Os outros estados do botón:

- {{ui:Non se puido gardar}}: algúns ficheiros non se descargaron. Revise a conexión e prémao para tentalo de novo.
- {{ui:Sen copia sen conexión}}: esta xanela do navegador non pode gardar unha copia sen conexión (as xanelas privadas e algúns ordenadores xestionados bloquéano). Use unha xanela normal.

Prema {{ui:Listo sen conexión}} para ver cando se gardou a copia, con dúas opcións: {{ui:Gardar de novo (obter a versión máis recente)}} e {{ui:Quitar a copia sen conexión}}. Gárdeo de novo antes dunha visita a obra para que a copia coincida coa versión máis recente. Máis en [Sen conexión](common:offline).

:::offline
Está sen conexión agora. Se CivilCraft se gardou para uso sen conexión, todo funciona, incluído o sitio de exemplo. Se non, siga traballando nesta lapela, pero non a recargue ata que volva estar en liña; sen unha copia gardada, {{ui:Abrir o sitio de exemplo}} falla e amosa "A mostra non se puido cargar".
:::

:::tip
Para usar en obra, garde CivilCraft para uso sen conexión e leve os seus ficheiros de puntos ao propio portátil. Os proxectos e as exportacións gárdanse como descargas sen conexión, así que pode importar as medicións dun día, revisar a superficie e gardar o proxecto no lugar.
:::

O gardado en nube aínda non está dispoñible, e as versións de escritorio aínda non están listas. Por agora, os ficheiros que garda son a única copia: manteña os en lugar con copia de seguridade.

## Complementos que usa un ficheiro

Cando garda un proxecto que ten datos dun complemento (as marcas da normativa de edificación, ou unha fonte de enderezo ao terreo), o ficheiro rexistra que complementos e que versións usa. Ábrao nun ordenador que non o teña e unha barra por riba da planta di iso e ofrece engadilo desde a lista da súa conta. O rexistro é só unha nota: o ficheiro ábrese igual.

## Desfacer desde Studio

Dentro de CadCraft Studio, cada paso que remata en CivilCraft comunícase a Studio, de xeito que o seu desfacer a nivel de proxecto pode desfacer o último paso entre aplicacións. Studio só desfai un paso cando a pila de desfacer de CivilCraft está exactamente como a deixou ese paso; despois de abrir outro ficheiro, omite esta xanela.

## Ao pechar con cambios sen gardar

Cando o proxecto ten cambios sen gardar e pecha a lapela, recarga a páxina ou sae dela, o navegador pregunta se quere marchar. O seu texto e aspecto son do navegador e CivilCraft non os pode cambiar. {{ui:Novo}}, e abrir un proxecto ou un ficheiro LandXML, pregunta na caixa propia de CivilCraft **Cambios sen gardar**, con {{ui:Cancelar}}, {{ui:Non gardar}} e {{ui:Gardar unha copia}}.
