---
title: Exportação e importação de IFC
summary: Guardar o projeto inteiro num único ficheiro IFC em IFC 4.3, IFC4 ou IFC2x3 (diretrizes, estradas, movimentos de terras, superfícies, muros, tubagens) e abrir ficheiros IFC para as suas diretrizes e superfícies.
keywords: ifc, ifc 4.3, ifc4x3, ifc4, ifc2x3, openbim, bim, diretriz, ifcalignment, estrada, ifcroad, movimentos de terras, tin, entregável, contratação pública, exportar ifc, importar ifc
from: 6b998bcf
---

O IFC é o formato aberto de troca que muitos clientes públicos pedem como entregável. O CivilCraft escreve o projeto inteiro num único ficheiro IFC e lê de volta diretrizes e superfícies a partir de ficheiros IFC.

## Exportar

1. Clique em {{ui:IFC}} no grupo **Exportar** (nos estilos do friso: {{ui:Saída}} › {{ui:Exportar}} › {{ui:IFC}}).
2. Escolha o esquema. **IFC 4.3 ADD2** aparece em primeiro lugar e é o predefinido: é a edição com diretrizes, estradas e movimentos de terras. Escolha IFC4 ou IFC2x3 apenas quando o software do destinatário não consegue ler a 4.3.
3. A caixa de diálogo indica o que o ficheiro vai conter e o que o esquema escolhido deixa de fora. Clique em {{ui:Exportar IFC}}.
   O ficheiro é transferido como "*nome do projeto*-ifc4x3.ifc", "-ifc4.ifc" ou "-ifc2x3.ifc". O CivilCraft memoriza o último esquema que escolheu.

## O que cada esquema contém

| | IFC 4.3 ADD2 | IFC4 | IFC2x3 |
|---|---|---|---|
| Diretrizes | IfcAlignment com os seus traçados horizontal (retas, arcos circulares, espirais de clotoide) e vertical (declives, curvas parabólicas), as suas curvas (IfcCompositeCurve, IfcGradientCurve), a estação inicial e os eventos de sobrelevação | Uma polilinha 3D sobre um elemento civil | Uma polilinha 3D sobre um proxy |
| Corredores | IfcRoad com partes de estrada; faixas, bermas, sarjetas e passeios como IfcPavement, lancis como IfcKerb, faixas ajardinadas; cada camada de pavimento como IfcCourse com a sua espessura, material e volume; os taludes laterais como IfcEarthworksCut e IfcEarthworksFill com os volumes de escavação e aterro; a velocidade de projeto e a classe | Elementos civis com o nome do que são, agrupados por estrada | Proxies, agrupados por estrada |
| Superfícies | IfcGeographicElement TERRAIN com uma rede triangular irregular | Conjuntos de faces triangulados | Modelos de superfície baseados em faces (ficheiros maiores) |
| Plataformas e muros | O topo da plataforma, os seus taludes como movimentos de terras, muros de suporte como IfcWall RETAININGWALL | O mesmo, com o muro como tipo de muro definido pelo utilizador | O mesmo, com o tipo do muro em ObjectType |
| Redes de tubagem | IfcPipeSegment e IfcDistributionChamberElement num IfcDistributionSystem | O mesmo | IfcFlowSegment e câmaras num IfcSystem |
| Georreferenciação | IfcProjectedCRS e IfcMapConversion | O mesmo | ePSet_ProjectedCRS e ePSet_MapConversion no local |

Uma **via-férrea** (um traçado com **Ferrovia** ativada) entra no IFC 4.3 como IfcRailway: as suas transições como tipos próprios (clotoide, parábola cúbica, Bloss, Helmert, meia-onda sinusoidal como curva cosseno, seno), a sua sobrelevação como IfcAlignmentCant, e a sua via como carris, travessas e leito de balastro, com o sub-balastro por baixo. O IFC4 e o IFC2x3 recebem as mesmas partes como elementos civis ou proxies. Abrir uma via-férrea IFC 4.3 devolve as suas transições e sobrelevação.

Todos os ficheiros incluem também lotes (pegadas), a vegetação e os pavimentos e muros do espaço de trabalho Paisagismo, e volumes de edifícios (cada um um IfcBuilding com os seus pisos), tudo num único local. Os conjuntos de propriedades guardam o que projetou: estações, o perfil transversal-tipo, os taludes de escavação e aterro, a largura e o número de faixas, as cotas de fundo, as cotas de tampa, as alturas dos muros; as quantidades (comprimentos, áreas, volumes) são conjuntos IfcElementQuantity.

## Unidades e coordenadas

O ficheiro está na unidade de comprimento do projeto (metros ou pés US survey); as áreas e os volumes estão em metros quadrados e cúbicos. Com um sistema de coordenadas (SIG › Coordenadas) o ficheiro é colocado no mapa: a coordenada Este e Norte da sua origem, bem como a rotação e a escala de um sistema local (do terreno), ficam na conversão para o mapa. Sem um sistema, o ficheiro regista a sua origem local num conjunto de propriedades e não é colocado num mapa.

## Importar

Abra um ficheiro .ifc com {{ui:Abrir}} ou arraste-o para a planta. A caixa de diálogo de importação indica o que o ficheiro contém:

- **Diretrizes** do IFC 4.3 (os traçados horizontal e vertical) e curvas de diretriz do IFC 4x1 tornam-se diretrizes do CivilCraft com os seus PI, raios, comprimentos de espiral e PVI. Uma diretriz que o modelo de PI do CivilCraft não consegue representar (curvas compostas, espirais entre duas curvas, uma que começa ou acaba numa curva) não é importada, e a caixa de diálogo indica porquê.
- **Superfícies**: escolha a que passa a ser o terreno natural, ou mantenha a do projeto.
- **Tudo o resto** (e as outras superfícies) pode ser mostrado na vista 3D como referência. Os elementos de referência mantêm-se enquanto o projeto estiver aberto; não são guardados no ficheiro do projeto.

Um ficheiro escrito pelo CivilCraft em IFC4 ou IFC2x3 devolve as suas diretrizes exatamente a partir dos seus conjuntos de propriedades.

## Ainda não implementado

- A sobrelevação de uma estrada é escrita como eventos de sobrelevação e nas superfícies da estrada (a sobrelevação aplica-se às ferrovias).
- Guardar elementos de referência no ficheiro do projeto, e importar redes de tubagem ou plataformas de IFC como objetos editáveis.
