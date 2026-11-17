---
title: Unidades ao importar: o ficheiro indica as suas unidades, ou é perguntado primeiro
summary: Quando um desenho ou uma malha que traz para um projeto indica as suas unidades, o CivilCraft converte-o e diz isso. Quando não indica, o CivilCraft pergunta antes de o ler e lembra-se da resposta para esse ficheiro.
keywords: unidades, importar, DWG, DXF, STL, OBJ, levantamento, pés, pés dos EUA, pés de agrimensor dos EUA, metros, milímetros, escala, tamanho errado, demasiado grande, demasiado pequeno, perguntar, lembrado, INSUNITS, unidades do desenho
from: 60921963
---

## O que vai fazer

Trazer um ficheiro para um projeto e garantir que entra com o tamanho certo.

## Passos

1. Abra o ficheiro como habitualmente: {{ui:Abrir}}, arraste-o para a planta, ou use o comando de desenho CAD.
2. Se o ficheiro indicar as suas unidades, não é perguntado nada: a caixa de importação mostra-as como **Como indica o desenho**.
3. Se não indicar, uma caixa pergunta **Unidades de** do ficheiro antes de a caixa de importação abrir. Escolha o que é uma unidade no ficheiro e clique em {{ui:Usar estas unidades}}.
4. {{ui:Cancelar}} (ou {{key:Esc}}) salta o ficheiro. Nada dele é lido para o projeto.

## Quais ficheiros indicam as suas unidades

- **DWG e DXF**: as unidades de inserção do desenho (`$INSUNITS`). Um ficheiro sem elas é perguntado. A lista **Unidades do desenho** na caixa de importação começa com a sua resposta e pode ainda ser alterada.
- **STL e OBJ** (formas livres de paisagem): nunca indicam unidades. É-lhe perguntado.
- **Listas de pontos** (CSV, TXT) e listas de levantamento de obra: uma lista que indica a sua unidade nas primeiras linhas é convertida, e a linha de estado diz isso. Uma sem unidade é perguntada quando carrega em {{ui:Importar}}, antes de os pontos entrarem. As colunas de latitude e longitude passam pelo sistema de coordenadas.
- **O suplemento Nuvens de pontos**: pergunta quando constrói uma nuvem cujo ficheiro não indica unidade, e identifica os números da nuvem com a unidade que ela transporta.
- **IFC e LandXML**: indicam as suas; são convertidos para as unidades do projeto.
- **LAS, LAZ e rasters de elevação**: colocados pelo seu sistema de coordenadas; a caixa do terreno pergunta a unidade de cota quando o ficheiro não a indica.

## Bom saber

- A resposta fica guardada para esse ficheiro neste computador, em todas as aplicações CadCraft. Na próxima vez que ele entrar, não é perguntado.
- Para voltar a ser perguntado: a paleta de comandos ({{key:Mod+K}}) › **Perguntar de novo as unidades dos ficheiros importados**.
- Uma unidade que uma lista indica é lida das primeiras oito linhas: uma linha como `units: ft`, ou cabeçalhos de coluna que levam todos a mesma unidade entre parênteses, como `Elevation (m)`.
