---
title: Vir doutro software civil
summary: Como os fluxos de traballo civís coñecidos se corresponden con CivilCraft, e as diferenzas que desconcertan aos usuarios experimentados na primeira hora.
keywords: cambio, migración, coñecido, diferenzas, fluxo de traballo, comandos, correspondencia, cogo, corredor, nivelación, rede de tubaxes, estilos, liña de comandos
from: feae37d6
---

Se xa usou Civil 3D, xa coñece as ideas de CivilCraft: puntos e grupos de puntos, superficies TIN con liñas de ruptura e límites, trazados por PI, perfís por PVI, conxuntos barridos en corredores, nivelación ata a superficie, redes de tubaxes por gravidade, LandXML. O que é distinto é case todo o que as rodea: non hai ficheiro de debuxo, non hai liña de comandos (salvo que escolla o estilo de menú {{ui:Debuxo clásico 2D}}), non hai estilos, non hai Prospector e non hai diálogos de configuración. CivilCraft é unha ferramenta pequena e centrada, nun navegador, e nesta versión fai unha fracción do que fai un paquete civil completo. Esta páxina relaciona o que xa sabe co que hai aquí.

:::tip
Se lle gusta a cinta de Civil 3D, escolla o estilo de menú {{ui:Cinta civil}} en {{ui:Configuración}} › {{ui:CivilCraft}} › {{ui:Menus, teclas e rato}}: as lapelas Inicio, Superficies, Modificar, Xeolocalización, Vista e Saída, o botón central despraza, e {{key:Shift}} co botón central orbita a vista 3D. Se escribe comandos, {{ui:Debuxo clásico 2D}} engade unha liña de comandos (ALIGNMENT, PAD, PROFILE, ZOOM …). Consulte [Menús, teclas e rato](topic:menus-keys-and-mouse).
:::

## Mapa de fluxos de traballo

| O que quere facer | Modo coñecido | En CivilCraft |
|---|---|---|
| Traer puntos de levantamento | Importar puntos cun formato de ficheiro de puntos | {{ui:Abrir}}, e logo comprobe a orde das columnas en **Importar puntos** ([Importar puntos de levantamento](topic:import-points)) |
| Ordenar puntos | Grupos de puntos, claves de descrición | Grupos automáticos pola primeira palabra da descrición; sen claves de descrición |
| Editar un punto | Editor de puntos, agarraderos | Faga clic nel e escriba en Propiedades, ou arrástreo ([Editar un punto de levantamento](topic:edit-points)) |
| Construír o terreo existente | Crear unha superficie, engadir grupos de puntos como datos | Automático: a superficie reconstrúese cada vez que cambian as súas entradas |
| Engadir liñas de ruptura | Engadir liñas de ruptura desde polilíneas ou liñas de elemento | Configure un grupo de puntos como {{ui:Liña de ruptura}}, ou faga clic en puntos coa ferramenta {{ui:Liña de ruptura}} ({{key:B}}) |
| Recortar a superficie | Límite exterior, límite oculto, lonxitude máxima de triángulo | {{ui:Límite}} ({{key:O}}, só exterior) e **Aresta exterior máis longa** |
| Amosar curvas de nivel | Estilo de superficie | **Visualización** no panel esquerdo: intervalo, maior cada, etiquetas, bandas, frechas de pendente |
| Dispoñer un eixo | Ferramentas de creación de trazados, axustes de curva e espiral | {{ui:Trazado}} ({{key:A}}): faga clic nos PI, {{key:Enter}}; raios e lonxitudes de espiral na táboa de PI |
| Crear unha vista de perfil | Asistente de vista de perfil, bandas | {{ui:Perfil}} ({{key:R}}): unha vista de perfil baixo o plano, sempre axustada |
| Deseñar a pendente | Ferramentas de disposición de perfil | {{ui:Comezar desde o terreo}}, {{ui:Engadir PVI}} ({{key:I}}), arrastre os PVI, escriba **Curva L** |
| Construír unha estrada | Conxunto, subconxuntos, corredor, obxectivos, rexións | Marque **Barrer un conxunto ao longo do perfil de deseño** baixo o trazado; unha faixa, un arcén e un talud a cada lado, ou cada lado construído con pezas (cuneta, bordo, beirarrúa …) |
| Nivelar unha plataforma | Liñas de elemento, grupos de nivelación, criterios de nivelación | {{ui:Plataforma}} ({{key:G}}): unha plataforma plana con taludes de desmonte e recheo ata a superficie |
| Calcular o movemento de terras | Superficies de volume, panel de volumes | **Movemento de terras** no panel dereito, método de cuadrícula, actualízase en directo |
| Dispoñer pluvial ou saneamento | Rede de tubaxes cunha lista de pezas, regras | {{ui:Tubaxes}} ({{key:P}}): faga clic nas estruturas augas abaixo; tres regras que vostede fixa; cotas de fondo automáticas |
| Intercambiar con outros | Importación e exportación de LandXML | {{ui:Abrir}} un ficheiro LandXML; {{ui:LandXML}} para exportar ([Intercambiar LandXML](topic:landxml)) |
| Enviar liñas ao CAD | Exportar a DWG | {{ui:DWG}} (formato de 2000 a 2018) ou {{ui:DXF}} (R12) |
| Trazar | Disposicións, ventás gráficas, conxuntos de follas | {{ui:PDF}}: unha folla en horizontal do plano a unha escala escollida; follas de planta e perfil e follas de sección en PDF |
| Compartir traballo entre ficheiros | Atallos de datos, referencias | Non dispoñible: un proxecto por ficheiro |
| Desfacer | Desfacer | {{key:Mod+Z}} e {{key:Mod+Y}}, 200 pasos; os axustes de visualización non son pasos de desfacer |

## Diferenzas que desconcertan á xente

**Non hai liña de comandos** salvo que escolla o estilo de menú {{ui:Debuxo clásico 2D}}. As ferramentas son botóns da barra de ferramentas e letras soltas: {{key:A}} trazado, {{key:G}} plataforma, {{key:P}} tubaxes, {{key:B}} liña de ruptura, {{key:O}} límite, {{key:R}} perfil, {{key:I}} engadir PVI, {{key:V}} seleccionar, {{key:F}} axustar. Nos outros estilos de menú, escribir un nome de comando non fai nada. Consulte [Teclas e rato](topic:keyboard).

**Enter remata; o dobre clic é arriscado.** Faga clic no último punto unha vez e logo prema {{key:Enter}}. Nesta versión un dobre clic tamén remata, pero elimina o punto no que fixo dobre clic. O botón dereito non remata nin repite; só despraza cando arrastra con el.

**Todo é dinámico, sempre.** Cambie un grupo de puntos, un raio, un PVI ou unha pendente de plataforma, e a superficie, as curvas de nivel, o corredor, as liñas de talud e os volumes actualízanse de inmediato. Non hai nada que reconstruír e nada se desactualiza.

**Nada é un obxecto de debuxo.** O plano é unha vista do deseño, non un debuxo que se poida editar con comandos CAD. Non pode engadir as súas propias liñas ou textos, cambiar a cor dunha capa nin descompoñer nada. Exporte a DXF e remate o debuxo nun programa CAD.

**Sen estilos.** As cores, os grosores de liña, os tamaños das etiquetas e os nomes das capas son fixos (consulte [Capas do plano](topic:plan-layers)). Papel e Modelo na barra da aplicación alternan entre unha pantalla clara e unha escura.

**Un de cada.** Unha superficie de terreo existente, un resultado niveladado, unha rede de tubaxes por proxecto. Os trazados e as plataformas pódense ter moitos.

**As unidades son etiquetas.** Escoller {{ui:Pés US}} ou {{ui:Metros}} non converte nada. Non hai escala de debuxo. Un sistema de coordenadas é opcional: estabélceo en {{ui:Coordenadas}} e nada se move, só indica o que significan os números (consulte [Estableza o sistema de coordenadas do proxecto](topic:coordinate-systems)). Os pés trátanse como pés US de levantamento ao escribir LandXML.

**Os grupos de liñas de ruptura únense por orde de número de punto.** Un grupo configurado como {{ui:Liña de ruptura}} convértese nunha soa liña por todos os seus puntos, por orde de número. Os códigos compartidos (dúas liñas de corrente codificadas ambas como «FL») fan unha soa liña en zigzag; debúxeas á man.

**As estacións parecen iguais, os metros difiren.** Os pés usan estacións de 100 ft (12+34.56); os metros usan estacións de 1000 m (1+234.567).

**Eliminar nun Mac.** A tecla de Mac etiquetada delete é Backspace para o navegador. Use Fn e delete, ou o botón {{ui:Eliminar}}, para eliminar unha selección.

**Os ficheiros son descargas.** {{ui:Gardar}} descarga un ficheiro `.civilcraft.json` cada vez; non hai «gardar sobre o ficheiro aberto». Unha copia de recuperación do traballo sen gardar consérvase neste navegador ([Recuperar traballo sen gardar](common:recover)). Abrir un ficheiro de puntos substitúe os puntos sen preguntar. Consulte [Ficheiros que pode abrir, gardar e exportar](topic:files).

**As regras son súas.** As regras da rede de tubaxes e o conxunto do corredor comezan con valores de marcador que non son unha norma. Estableza os seus propios antes de fiarse de calquera comprobación.

**Os volumes baséanse en cuadrícula.** O desmonte e o recheo proceden dunha cuadrícula fina entre as dúas superficies, dentro das liñas de talud, sen expansión ou contracción. Están próximos, pero non son iguais, a un volume TIN a TIN.

## O que falta

Espirais que non sexan clotoides, conxuntos que cambian ao longo da estrada, plataformas con pendente, capacidade de entrada e retención, catálogos de pezas, tubaxes en perfil, disposicións de parcelas e dimensionamento de lotes, axuste por mínimos cadrados e bases de datos de levantamento, abrir DWG, e outros. A lista completa, co que facer no seu lugar hoxe, está en [Aínda non construído](topic:not-built-yet).
