---
title: Intercâmbio de LandXML
summary: Abrir LandXML de outro software de engenharia civil como um novo projeto, exportar pontos, superfícies, diretrizes, perfis e a rede de tubagens como LandXML 1.2, e saber o que não passa para o outro lado.
keywords: landxml, xml, importar, exportar, intercâmbio, tin, superfície, diretriz, perfil, rede de tubagens, interoperabilidade, troca de dados
from: 870d5ece
---

O LandXML é o formato aberto de intercâmbio que a maioria dos programas de engenharia civil lê e escreve. O CivilCraft lê e escreve LandXML 1.2. Se já usou o Civil 3D, as suas caixas de diálogo de importação e exportação de LandXML são a correspondência mais próxima; aqui não há opções a fazer, e as notas indicam o que ficou de fora.

## Abrir um ficheiro LandXML

1. Clique em {{ui:Abrir}} (ou prima {{key:Mod+O}}) e escolha o ficheiro `.xml` ou `.landxml`, ou arraste-o para a planta.
2. Se o projeto atual tiver alterações não guardadas, o CivilCraft pergunta primeiro. Escolha {{ui:Guardar uma cópia}}, {{ui:Não guardar}} ou {{ui:Cancelar}}.
3. É criado um **novo projeto**. A barra de estado indica o que foi lido, por exemplo "Aberto site.xml: 412 pontos, 2 superfícies, 3 diretrizes."
4. Veja a caixa sob os dados da **Superfície**. Lista tudo o que foi ignorado ou alterado, por exemplo:
   - "Só a primeira superfície ("EG") foi aberta; o ficheiro tem mais 1."
   - "A diretriz "Ramp A" tem elementos que o CivilCraft ainda não consegue desenhar (não são linhas, arcos nem espirais de clotoide); foi ignorada."
   - "As regras da rede de tubagens não estavam no ficheiro; estão a ser usados valores provisórios — defina os seus em Projeto."

O que passa a ser o quê:

| No ficheiro | No CivilCraft |
|---|---|
| Units (Imperial ou Metric) | As **Unidades** do projeto (pés ou metros) |
| Project name | O **Nome** do projeto |
| CgPoints | Os pontos do projeto; a descrição (ou o código) indica o grupo |
| The first TIN surface | O terreno existente, usado tal como está ("Surface (from LandXML)") |
| Every alignment of lines, arcs and clothoid spirals | Uma diretriz com os seus PI, raios e comprimentos de espiral reconstruídos a partir das curvas |
| The first design profile of each alignment | O seu perfil de projeto, com curvas verticais parabólicas |
| The first pipe network | A rede de tubagens, com as suas tampas, fundos e soleiras |
| Plan features of lines and arcs | Linhas características, com arcos mantidos; vindas de outro programa começam como **Só desenhada** |

A lista completa de elementos e atributos está em [LandXML: o que é lido e escrito](topic:landxml-reference).

:::note
Uma superfície lida de LandXML não é reconstruída quando altera grupos de pontos ou desenha linhas de quebra. Clique em {{ui:Reconstruir a superfície a partir dos pontos}} na secção **Superfície** para a construir a partir dos pontos ({{key:Mod+Z}} repõe a superfície LandXML).
:::

## Exportar LandXML

1. Clique em {{ui:LandXML}} no grupo **Exportar**.
2. O navegador transfere `<name>.xml`. A barra de estado indica o que foi incluído, por exemplo "Exportado LandXML 1.2: 276 pontos, 2 superfícies, 1 diretriz, a rede de tubagens. As plataformas de implantação não fazem parte do LandXML aqui; a superfície modelada, sim."

O ficheiro contém:

- **Units**: pés US de agrimensura ou metros.
- **CgPoints**: cada ponto com o seu número como nome, a sua descrição e o seu grupo como código.
- **Surfaces**: o terreno existente como TIN, com as suas linhas de quebra e o limite exterior como dados de origem; e, quando plataformas de implantação ou corredores modelam o terreno, uma segunda superfície TIN com o nome "Proposed".
- **Alignments**: linhas, arcos e espirais de clotoide com os seus PK, cada um com um perfil que contém o terreno existente amostrado ao longo dela e o perfil de projeto (PVI e curvas parabólicas) quando tem pelo menos dois PVI.
- **PipeNetworks**: estruturas com as suas tampas, fundos e soleira por tubo, e os tubos com diâmetro, comprimento e declive.
- **PlanFeatures**: cada linha característica como linhas e arcos, com a cota em cada extremidade, e a sua utilização.

## O que não passa

- Plataformas de implantação e corredores como objetos. O seu resultado está na superfície "Proposed".
- Diretrizes com erros (por exemplo, curvas sobrepostas): ficam de fora e são contadas na mensagem de estado.
- Tubos sem as duas soleiras, e redes com menos de duas estruturas.
- Uma tampa tirada da superfície é escrita como tampa fixa. Ao reabrir, a estrutura mantém esse número, mesmo que a superfície mude.
- Regras da rede (declive mínimo, recobrimento, queda): o LandXML não tem lugar para elas.
- Definições de visualização e as escolhas de superfície dos grupos de pontos: guarde um projeto do CivilCraft para isso.

Ao abrir, o CivilCraft não lê espirais que não sejam de clotoide, superfícies de grelha, pontos que apenas referenciam outros pontos, lotes, espirais em elementos de planta, vias ou dados de levantamento. Cada um é indicado nas notas, nunca adivinhado.

## Ida e volta

Para entregar o trabalho a alguém que use outro software de engenharia civil e o recuperar, exporte o LandXML, deixe que o edite, e abra o seu LandXML como novo projeto. Guarde também o seu `.civilcraft.json`: é o único ficheiro que mantém tudo o que o CivilCraft sabe.
