---
title: Exportação e importação de IFC
summary: Salve o projeto inteiro como um único arquivo IFC no IFC 4.3, IFC4 ou IFC2x3 (alinhamentos, vias, movimentos de terra, superfícies, muros, tubulações), e abra arquivos IFC para seus alinhamentos e superfícies.
keywords: ifc, ifc 4.3, ifc4x3, ifc4, ifc2x3, openbim, bim, alinhamento, ifcalignment, via, ifcroad, movimentos de terra, tin, entregável, licitação, exportar ifc, importar ifc
from: 6b998bcf
---

IFC é o formato aberto de intercâmbio que muitos clientes públicos pedem como entregável. O CivilCraft grava o projeto inteiro em um único arquivo IFC e lê de volta alinhamentos e superfícies a partir de arquivos IFC.

## Exportação

1. Clique em {{ui:IFC}} no grupo **Exportar** (nos estilos de faixa de opções: {{ui:Saída}} › {{ui:Exportar}} › {{ui:IFC}}).
2. Escolha o esquema. **IFC 4.3 ADD2** vem primeiro e é o padrão: é a edição com alinhamentos, vias e movimentos de terra. Escolha IFC4 ou IFC2x3 somente quando o software do destinatário não consegue ler o 4.3.
3. A caixa de diálogo diz o que o arquivo conterá e o que o esquema escolhido deixa de fora. Clique em {{ui:Exportar IFC}}.
   O arquivo é baixado como "*nome do projeto*-ifc4x3.ifc", "-ifc4.ifc" ou "-ifc2x3.ifc". O CivilCraft lembra o esquema que você escolheu por último.

## O que cada esquema contém

| | IFC 4.3 ADD2 | IFC4 | IFC2x3 |
|---|---|---|---|
| Alinhamentos | IfcAlignment com seus layouts horizontal (retas, arcos circulares, espirais clotoides) e vertical (greides, curvas parabólicas), suas curvas (IfcCompositeCurve, IfcGradientCurve), a estaca inicial e os eventos de superelevação | Uma polilinha 3D em um elemento civil | Uma polilinha 3D em um proxy |
| Corredores | IfcRoad com partes de via; faixas, acostamentos, sarjetas e calçadas como IfcPavement, meios-fios como IfcKerb, faixas de plantio; cada camada do pavimento como IfcCourse com sua espessura, material e volume; os taludes laterais como IfcEarthworksCut e IfcEarthworksFill com os volumes de corte e aterro; a velocidade e a classe de projeto | Elementos civis nomeados conforme o que são, agrupados por via | Proxies, agrupados por via |
| Superfícies | IfcGeographicElement TERRAIN com uma rede triangular irregular | Conjuntos de faces triangulados | Modelos de superfície baseados em faces (arquivos maiores) |
| Plataformas e muros | O topo da plataforma, seus taludes como movimentos de terra, muros de arrimo como IfcWall RETAININGWALL | Igual, o muro como um tipo de muro definido pelo usuário | Igual, o tipo do muro em ObjectType |
| Redes de tubulações | IfcPipeSegment e IfcDistributionChamberElement em um IfcDistributionSystem | Igual | IfcFlowSegment e câmaras em um IfcSystem |
| Georreferenciamento | IfcProjectedCRS e IfcMapConversion | Igual | ePSet_ProjectedCRS e ePSet_MapConversion no local |

Uma **ferrovia** (um alinhamento com Ferrovia ativada) vai para o IFC 4.3 como IfcRailway: suas transições como tipos próprios (clotoide, parábola cúbica, Bloss, Helmert, meia-onda senoidal como curva cosseno, senoide), sua superelevação como IfcAlignmentCant, e sua via como trilhos, dormentes e leito de lastro, com o sub-lastro embaixo. IFC4 e IFC2x3 recebem as mesmas partes como elementos civis ou proxies. Ao abrir uma ferrovia IFC 4.3, suas transições e sua superelevação voltam.

Todo arquivo também carrega lotes (pegadas), as plantas e os elementos construídos da área de trabalho de Paisagismo e volumetrias de edificações (cada uma um IfcBuilding com seus pavimentos), tudo em um único local. Conjuntos de propriedades trazem o que você projetou: estacas, a seção-tipo, taludes de corte e aterro, largura e número de faixas, cotas de fundo, cotas de tampão, alturas dos muros; as quantidades (comprimentos, áreas, volumes) são conjuntos IfcElementQuantity.

## Unidades e coordenadas

O arquivo fica na unidade de comprimento do projeto (metros, ou pés de agrimensura dos EUA); áreas e volumes ficam em metros quadrados e cúbicos. Com um sistema de coordenadas (GIS › Coordenadas), o arquivo é posicionado no mapa: a coordenada leste e norte da sua origem, e a rotação e a escala de um sistema local (do terreno), ficam na conversão de mapa. Sem um sistema, o arquivo registra sua origem local em um conjunto de propriedades e não é posicionado em um mapa.

## Importação

Abra um arquivo .ifc com {{ui:Abrir}} ou solte-o na planta. A caixa de diálogo de importação informa o que o arquivo contém:

- **Alinhamentos** do IFC 4.3 (os layouts horizontal e vertical) e curvas de alinhamento do IFC 4x1 viram alinhamentos do CivilCraft, com seus PIs, raios, comprimentos de espiral e PIVs. Um alinhamento que o modelo de PI do CivilCraft não consegue conter (curvas compostas, espirais entre duas curvas, uma que começa ou termina em curva) não é importado, e a caixa de diálogo diz por quê.
- **Superfícies**: escolha a que se torna o terreno existente, ou mantenha a do projeto.
- **Todo o resto** (e as outras superfícies) pode ser mostrado na vista 3D como referência. Os elementos de referência permanecem enquanto o projeto estiver aberto; não são salvos no arquivo do projeto.

Um arquivo que o CivilCraft gravou em IFC4 ou IFC2x3 traz seus alinhamentos de volta exatamente a partir dos conjuntos de propriedades.

## Ainda não implementado

- A superelevação de uma via é gravada como eventos de superelevação e nas superfícies das vias (cant é para ferrovias).
- Salvar elementos de referência no arquivo do projeto, e importar redes de tubulações ou plataformas do IFC como objetos editáveis.
