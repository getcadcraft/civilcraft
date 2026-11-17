---
title: Unidades, estacas e formatos de número
summary: Projetos em pés e em metros, como estacas, greides, taludes, rumos, áreas, volumes e diâmetros de tubo são escritos e digitados, e o que mudar de unidades faz.
keywords: digitar um comprimento, aritmética, calculadora, soma, fração, pés e polegadas, 4+7/16, unidades, pés, pés de agrimensura dos EUA, metros, métrico, imperial, formato de estaca, estaqueamento, greide, porcentagem, talude, h:v, rumo, jardas cúbicas, diâmetro
from: 0b9b5b6b
---

## Unidades do projeto

Um projeto está em **pés dos EUA** ou em **metros** (**Unidades** no painel esquerdo). Toda coordenada, cota, comprimento e estaca do projeto está nessa unidade.

:::warning
Mudar **Unidades** altera os rótulos, o formato das estacas, os padrões e a forma como os arquivos são gravados. **Não** converte nenhum número. Um local levantado em pés e trocado para metros mantém os mesmos números, agora lidos como metros. A barra de status diz "Unidades agora são metros. As coordenadas não foram convertidas." Defina as unidades de acordo com seus dados antes de projetar.
:::

O que depende das unidades:

| | Pés dos EUA | Metros |
|---|---|---|
| Formato da estaca | `12+34.56` (estacas de 100 ft) | `1+234.567` (estacas de 1000 m) |
| Intervalos de curva de nível oferecidos | 0.25 a 20 ft | 0.1 a 10 m |
| Área | ft² | m² |
| Volume | yd³ | m³ |
| Diâmetro de tubo e de estrutura | polegadas | milímetros |
| Raio padrão de curva | 100 ft | 30 m |
| Marcas de estaqueamento na planta | a cada 50 ft, rótulos a cada 100 ft | a cada 20 m, rótulos a cada 100 m |
| Escalas de plotagem | 1" = 5' a 1" = 1000' | 1:50 a 1:10000 |
| Unidade linear do LandXML | USSurveyFoot | meter |

Um novo projeto começa em pés, ou em metros quando a unidade de comprimento marcada com asterisco em {{ui:Configurações}} › {{ui:Geral}} › {{ui:Unidades}} for métrica. A lista **Unidades** mostra as unidades ativadas ali, e sempre a do próprio projeto. Com uma unidade de área ou volume marcada com asterisco ali (acres, hectares, acre-feet …), áreas e volumes são informados nela, em vez da coluna acima. Veja [Unidades, valores digitados e as listas de unidades](common:unit-lists).

Ao abrir um LandXML, o projeto assume as unidades do arquivo. Um arquivo em pés internacionais abre como projeto em pés; os números não são alterados.

## Digitando comprimentos e somas

Qualquer caixa que aceita um comprimento ou uma cota lê mais do que um número simples: pressione {{key:Enter}} e a caixa mostra o resultado nas unidades do projeto.

| Você digita | Em projeto em pés | Em projeto em metros |
|---|---|---|
| `12.5` | 12.5 ft | 12.5 m |
| `12'6"`, `12' 6 1/2"`, `6"`, `3 ft 6 in` | 12.5 ft, 12.54 ft, 0.5 ft, 3.5 ft | as mesmas distâncias em metros |
| `4 7/16`, `4-7/16` | 4.4375 ft | 4.4375 m |
| `450 mm`, `1.2 m`, `90 cm` | em pés | 0.45 m, 1.2 m, 0.9 m |
| `10 US ft`, `3 ch`, `2 rd`, `0.5 mi`, `1 km` | 10 ft, e os demais em pés de agrimensura dos EUA | as mesmas distâncias em metros |
| `4+7/16`, `12'6" + 3/4"`, `(24'-0")/3`, `2*450mm` | a soma, em pés | a soma, em metros |

Qualquer marca de comprimento da tabela de unidades compartilhada funciona, com seu tamanho exato: os pés de um projeto são pés de agrimensura dos EUA, então `10 US ft` vale 10 e `3 ch` (a corrente de pé internacional) vale 197.9996. Use `+ - * /` e parênteses, e `abs`, `round`, `ceil` e `floor`. Um traço escrito dentro de um comprimento faz parte dele (`24'-6"`, `6-1/2`); com espaços em volta, ele subtrai (`24' - 6"` = 23.5 ft). Um número simples multiplica ou divide um comprimento, e é um comprimento nas unidades do projeto quando é somado a um. Se o CivilCraft não conseguir ler o que você digitou, a caixa é marcada e a barra de status indica onde.

Estacas não são somas: `10+00` em uma caixa de estaca é a estaca 10+00. Greides em porcentagem, números de pontos e descrições são lidos como estão.

## Estacas

Uma estaca é uma distância ao longo de um alinhamento, escrita com um sinal de mais:

- Pés: a parte antes do mais são centenas de pés. `12+34.56` é 1,234.56 ft.
- Metros: a parte antes do mais são milhares de metros. `1+234.567` é 1,234.567 m.
- Estacas negativas mantêm o sinal na frente: `-0+50.00`.

Onde você digitar uma estaca (**Estaca inicial**, a **Estaca** de um PIV), pode digitá-la com o mais (`12+34.56`) ou como número simples (`1234.56`). Espaços são ignorados.

## Greides e taludes

- **Greides** (perfis, tubos, declividades de faixa e de acostamento) são em porcentagem: `+1.25%` sobe no sentido das estacas, `-0.50%` desce.
- **Taludes** (corte e aterro de plataforma, corte e aterro de corredor) são horizontal para vertical: `3` significa 3 : 1, três na horizontal para um na vertical.
- **K** de uma curva vertical é o comprimento dela dividido pela variação do greide em porcentagem.

## Rumos e ângulos

Rumos são rumos de quadrante em graus, minutos e segundos: `N 63°12'05" E`. As deflexões das curvas (Δ) usam os mesmos graus, minutos e segundos, com "esquerda" ou "direita".

## Afastamentos

Afastamentos de um alinhamento são distâncias perpendiculares a ele, marcadas com **E** (esquerda) ou **D** (direita), olhando no sentido das estacas.

## Exibição de números

- Coordenadas e cotas mostram 2 casas decimais nos painéis e na barra de status (3 para um ponto de levantamento selecionado).
- Áreas e volumes são agrupados por milhar: `128,250 ft²`, `454.9 yd³`.
- Coordenadas nunca são agrupadas, para que possam ser copiadas como estão.

## Coordenadas

O CivilCraft trabalha em um plano bidimensional: Leste para a direita, Norte para cima. O trabalho de projeto sempre acontece em coordenadas projetadas (sistema plano estadual, UTM ou uma grade local). Você pode informar ao CivilCraft qual sistema de coordenadas elas usam, e se são coordenadas de grade, de terreno ou locais; então ele mostra latitude e longitude e posiciona arquivos GIS e camadas de mapa, mas nunca altera unidades nem move suas coordenadas por conta própria. Veja [Defina o sistema de coordenadas do projeto](topic:coordinate-systems) e [Coordenadas de terreno e locais](topic:ground-and-local-coordinates). Valores grandes de sistema plano estadual (milhões de pés) são aceitáveis; o CivilCraft trabalha internamente em relação ao local para manter a precisão.
