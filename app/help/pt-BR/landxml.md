---
title: Trocar LandXML
summary: Abra LandXML de outros programas de civil como um novo projeto, exporte pontos, superfícies, alinhamentos, perfis e a rede de tubos como LandXML 1.2, e saiba o que não passa pela troca.
keywords: landxml, xml, importar, exportar, troca, tin, superfície, alinhamento, perfil, rede de tubos, interoperabilidade, troca de dados
from: 870d5ece
---

LandXML é o formato aberto de troca que a maioria dos programas de civil lê e grava. O CivilCraft lê e grava LandXML 1.2. Se você já usou o Civil 3D, as caixas de diálogo de importação e exportação de LandXML dele são a correspondência mais próxima; aqui não há escolhas a fazer, e as notas dizem o que ficou de fora.

## Abrir um arquivo LandXML

1. Clique em {{ui:Open}} (ou pressione {{key:Mod+O}}) e escolha o arquivo `.xml` ou `.landxml`, ou solte-o na planta.
2. Se o projeto atual tiver alterações não salvas, o CivilCraft pergunta antes. Escolha {{ui:Save a copy}}, {{ui:Don’t save}} ou {{ui:Cancel}}.
3. Um **novo projeto** é criado. A barra de status diz o que foi lido, por exemplo "Aberto site.xml: 412 pontos, 2 superfícies, 3 alinhamentos."
4. Veja a caixa abaixo dos dados da **Superfície**. Ela lista tudo o que foi ignorado ou alterado, por exemplo:
   - "Só a primeira superfície ("EG") foi aberta; o arquivo tem mais 1."
   - "O alinhamento "Rampa A" tem elementos que o CivilCraft ainda não consegue desenhar (não são linhas, arcos nem espirais clotoides); ele foi ignorado."
   - "As regras da rede de tubos não estavam no arquivo; os valores provisórios estão em uso — defina os seus em Projeto."

O que vira o quê:

| No arquivo | No CivilCraft |
|---|---|
| Units (Imperial ou Metric) | As **Unidades** do projeto (pés ou metros) |
| Nome do projeto | O **Nome** do projeto |
| CgPoints | Os pontos do projeto; a descrição (ou o código) define o grupo |
| A primeira superfície TIN | O terreno natural, usado como está ("Superfície (do LandXML)") |
| Cada alinhamento de linhas, arcos e espirais clotoides | Um alinhamento com seus PIs, raios e comprimentos de espiral reconstruídos a partir das curvas |
| O primeiro perfil de projeto de cada alinhamento | O perfil de projeto, com curvas verticais parabólicas |
| A primeira rede de tubos | A rede de tubos, com suas cotas de tampa, fundos e geratrizes |
| Elementos de linhas e arcos de planta | Linhas de feição, com os arcos mantidos; vindos de outro programa, começam como **Somente desenhada** |

A lista completa de elementos e atributos está em [LandXML: o que é lido e gravado](topic:landxml-reference).

:::note
Uma superfície lida do LandXML não é reconstruída quando você muda os grupos de pontos ou desenha linhas de quebra. Clique em {{ui:Rebuild the surface from the points}} na seção **Superfície** para construí-la a partir dos pontos (com {{key:Mod+Z}}, a superfície do LandXML volta).
:::

## Exportar LandXML

1. Clique em {{ui:LandXML}} no grupo **Exportar**.
2. O navegador baixa `<nome>.xml`. A barra de status diz o que entrou, por exemplo "LandXML 1.2 exportado: 276 pontos, 2 superfícies, 1 alinhamento, a rede de tubos. Plataformas não fazem parte do LandXML aqui; a superfície terraplenada faz."

O arquivo contém:

- **Units**: pés de agrimensura dos EUA ou metros.
- **CgPoints**: cada ponto, com o seu número como nome, a descrição e o grupo como código.
- **Surfaces**: o terreno natural como TIN, com as suas linhas de quebra e o contorno externo como dados de origem; e, quando plataformas ou corredores são terraplenados, uma segunda superfície TIN chamada "Proposed".
- **Alignments**: linhas, arcos e espirais clotoides com as suas estacas, cada um com um perfil que traz o terreno natural amostrado ao longo dele e o perfil de projeto (PVIs e curvas parabólicas) quando tem pelo menos dois PVIs.
- **PipeNetworks**: estruturas com as suas cotas de tampa, fundos e a geratriz de cada tubo, e os tubos com diâmetro, comprimento e declividade.
- **PlanFeatures**: cada linha de feição como linhas e arcos, com a cota em cada extremidade e a finalidade de cada uma.

## O que não passa pela troca

- Plataformas e corredores como objetos. O resultado deles está na superfície "Proposed".
- Alinhamentos com erros (por exemplo, curvas sobrepostas): ficam de fora e são contados na mensagem de status.
- Tubos sem as duas geratrizes, e redes com menos de duas estruturas.
- Uma cota da tampa tirada da superfície é gravada como cota fixa. Ao reabrir, a estrutura mantém esse número mesmo que a superfície mude.
- Regras da rede (menor declividade, cobertura, queda): o LandXML não tem lugar para elas.
- Configurações de exibição e escolhas de superfície dos grupos de pontos: salve um projeto do CivilCraft para isso.

Ao abrir, o CivilCraft não lê espirais que não sejam clotoides, superfícies de grade, pontos que apenas se referem a outros pontos, lotes, espirais em linhas de feição, vias ou dados de levantamento. Cada um deles é indicado nas notas, nunca adivinhado.

## Ida e volta

Para entregar o trabalho a alguém que usa outro software de civil e recebê-lo de volta, exporte o LandXML, deixe a pessoa editar e abra o LandXML dela como um novo projeto. Mantenha também o seu `.civilcraft.json`: é o único arquivo que guarda tudo o que o CivilCraft conhece.
