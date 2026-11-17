---
title: Unidades na importação: o arquivo informa suas unidades, ou você é perguntado antes
summary: Quando um desenho ou malha que você traz para um projeto informa suas unidades, o CivilCraft as converte e avisa. Quando não informa, o CivilCraft pergunta antes de lê-lo e lembra sua resposta para esse arquivo.
keywords: unidades, importação, DWG, DXF, STL, OBJ, levantamento, pés, pés de agrimensura dos EUA, metros, milímetros, escala, tamanho errado, grande demais, pequeno demais, perguntar, lembrado, INSUNITS, unidades do desenho
from: 60921963
---

## O que você vai fazer

Trazer um arquivo para um projeto e garantir que ele entre no tamanho certo.

## Passos

1. Abra o arquivo como de costume: {{ui:Abrir}}, arraste-o para a planta, ou use o comando de desenho CAD.
2. Se o arquivo informa suas unidades, nada é perguntado: a caixa de importação as mostra como **Como indica o desenho**.
3. Se não informa, uma caixa pergunta as **Unidades de** do arquivo antes de a caixa de importação abrir. Escolha o que é uma unidade no arquivo e clique em {{ui:Usar estas unidades}}.
4. {{ui:Cancelar}} (ou {{key:Esc}}) pula o arquivo. Nada dele é lido para o projeto.

## Quais arquivos informam suas unidades

- **DWG e DXF**: as unidades de inserção do desenho (`$INSUNITS`). Um arquivo sem elas é perguntado. A lista **Unidades do desenho** na caixa de importação começa com a sua resposta e ainda pode ser alterada.
- **STL e OBJ** (formas livres de terreno): nunca informam unidades. Você é perguntado.
- **Listas de pontos** (CSV, TXT) e listas de levantamento em andamento: uma lista que informa sua unidade nas primeiras linhas é convertida, e a linha de status avisa. Uma que não informa nenhuma é perguntada ao pressionar {{ui:Importar}}, antes de os pontos entrarem. Colunas de latitude e longitude passam pelo sistema de coordenadas.
- **O complemento Nuvens de pontos**: pergunta ao criar uma nuvem cujo arquivo não informa unidade, e rotula os números da nuvem na unidade que ela traz.
- **IFC e LandXML**: informam as suas; são convertidos para as unidades do projeto.
- **LAS, LAZ e rasters de elevação**: posicionados pelo sistema de coordenadas deles; a caixa de terreno pergunta a unidade de elevação quando o arquivo não a informa.

## Bom saber

- A resposta fica lembrada para esse arquivo neste computador, em todos os aplicativos CadCraft. Na próxima vez que ele entrar, você não será perguntado.
- Para ser perguntado de novo: a paleta de comandos ({{key:Mod+K}}) › **Perguntar de novo as unidades dos arquivos importados**.
- A unidade que uma lista informa é lida das primeiras oito linhas: uma linha como `units: ft`, ou cabeçalhos de coluna que trazem a mesma unidade entre parênteses, como `Elevation (m)`.
