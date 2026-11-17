---
title: Unidades, PK e formatos de número
summary: Projetos em pés e em metros, como se escrevem e digitam os PK, declives, rumos, áreas, volumes e diâmetros de coletores, e o que muda ao alterar as unidades.
keywords: digitar um comprimento, aritmética, calculadora, soma, fração, pés e polegadas, 4+7/16, unidades, pés, pés dos EUA, pés de agrimensor dos EUA, metros, métrico, imperial, formato de PK, quilometragem, declive, percentagem, talude, h:v, rumo, jardas cúbicas, diâmetro
from: 0b9b5b6b
---

## Unidades do projeto

Um projeto está em **pés dos EUA** ou em **metros** (**Unidades** no painel esquerdo). Todas as coordenadas, cotas, comprimentos e PK do projeto estão nessa unidade.

:::warning
Alterar **Unidades** muda as etiquetas, o formato dos PK, os valores por defeito e a forma como os ficheiros são escritos. **Não** converte nenhum número. Um local medido em pés e mudado para metros mantém os mesmos números, agora lidos como metros. A barra de estado diz "As unidades são agora metros. As coordenadas não foram convertidas." Defina as unidades de acordo com os seus dados antes de projetar.
:::

O que depende das unidades:

| | Pés dos EUA | Metros |
|---|---|---|
| Formato de PK | `12+34.56` (PK de 100 ft) | `1+234.567` (PK de 1000 m) |
| Intervalos de curvas de nível oferecidos | 0.25 a 20 ft | 0.1 a 10 m |
| Área | ft² | m² |
| Volume | yd³ | m³ |
| Diâmetro de coletores e estruturas | polegadas | milímetros |
| Raio de curva por defeito | 100 ft | 30 m |
| Marcas de PK na planta | a cada 50 ft, etiquetas a cada 100 ft | a cada 20 m, etiquetas a cada 100 m |
| Escalas de impressão | 1" = 5' a 1" = 1000' | 1:50 a 1:10000 |
| Unidade linear do LandXML | USSurveyFoot | meter |

Um projeto novo começa em pés, ou em metros quando a unidade de comprimento assinalada com asterisco em {{ui:Definições}} › {{ui:Geral}} › {{ui:Unidades}} for métrica. A lista **Unidades** mostra as unidades ativadas aí, e sempre a própria do projeto. Com uma unidade de área ou de volume assinalada aí (acres, hectares, acre-pés …), as áreas e os volumes são indicados nela, em vez da coluna acima. Veja [Unidades, valores digitados e listas de unidades](common:unit-lists).

Ao abrir um LandXML, o projeto adota as unidades do ficheiro. Um ficheiro em pés internacionais abre como projeto em pés; os números não são alterados.

## Digitar comprimentos e somas

Qualquer caixa que aceite um comprimento ou uma cota lê mais do que um número simples: prima {{key:Enter}} e a caixa mostra o resultado nas unidades do projeto.

| Escrito | Num projeto em pés | Num projeto em metros |
|---|---|---|
| `12.5` | 12.5 ft | 12.5 m |
| `12'6"`, `12' 6 1/2"`, `6"`, `3 ft 6 in` | 12.5 ft, 12.54 ft, 0.5 ft, 3.5 ft | os mesmos comprimentos em metros |
| `4 7/16`, `4-7/16` | 4.4375 ft | 4.4375 m |
| `450 mm`, `1.2 m`, `90 cm` | em pés | 0.45 m, 1.2 m, 0.9 m |
| `10 US ft`, `3 ch`, `2 rd`, `0.5 mi`, `1 km` | 10 ft, e os restantes em pés de agrimensor dos EUA | os mesmos comprimentos em metros |
| `4+7/16`, `12'6" + 3/4"`, `(24'-0")/3`, `2*450mm` | a soma, em pés | a soma, em metros |

Qualquer marca de comprimento da tabela de unidades comum funciona, com o seu tamanho exato: os pés de um projeto são pés de agrimensor dos EUA, por isso `10 US ft` é 10 e `3 ch` (a cadeia em pés internacionais) é 197.9996. Use `+ - * /` e parênteses, e `abs`, `round`, `ceil` e `floor`. Um traço escrito dentro de um comprimento faz parte dele (`24'-6"`, `6-1/2`); com espaços à volta, subtrai (`24' - 6"` = 23.5 ft). Um número simples multiplica ou divide um comprimento, e é um comprimento nas unidades do projeto quando é somado a um. Se o CivilCraft não conseguir ler o que escreveu, a caixa fica assinalada e a barra de estado indica onde.

Os PK não são somas: `10+00` numa caixa de PK é o PK 10+00. Os declives em percentagem, os números de ponto e as descrições são lidos tal como estão.

## PK

Um PK é uma distância ao longo de um alinhamento (diretriz), escrita com um sinal de mais:

- Pés: a parte antes do mais são centenas de pés. `12+34.56` são 1,234.56 ft.
- Metros: a parte antes do mais são milhares de metros. `1+234.567` são 1,234.567 m.
- Os PK negativos mantêm o sinal à frente: `-0+50.00`.

Em qualquer sítio onde escreva um PK (**PK inicial**, o **PK** de um PVI), pode escrevê-lo com o mais (`12+34.56`) ou como número simples (`1234.56`). Os espaços são ignorados.

## Declives e taludes

- **Declives** (perfis, coletores, inclinações de faixa e de berma) são em percentagem: `+1.25%` sobe no sentido crescente do PK, `-0.50%` desce.
- **Taludes laterais** (escavação e aterro da plataforma, escavação e aterro do corredor) são horizontais para vertical: `3` significa 3 : 1, três na horizontal para um na vertical.
- **K** de uma curva vertical é o seu comprimento a dividir pela variação do declive em percentagem.

## Rumos e ângulos

Os rumos são rumos de quadrante em graus, minutos e segundos: `N 63°12'05" E`. As deflexões das curvas (Δ) usam os mesmos graus, minutos e segundos, com "esquerda" ou "direita".

## Afastamentos

Os afastamentos de um alinhamento são distâncias perpendiculares a ele, marcadas **L** (esquerda) ou **R** (direita), olhando no sentido crescente do PK.

## Visualização dos números

- As coordenadas e cotas mostram 2 casas decimais nos painéis e na barra de estado (3 para um ponto topográfico selecionado).
- As áreas e os volumes são agrupados por milhares: `128,250 ft²`, `454.9 yd³`.
- As coordenadas nunca são agrupadas, para poderem ser copiadas tal como estão.

## Coordenadas

O CivilCraft trabalha num plano: este para a direita, norte para cima. O trabalho de projeto faz-se sempre em coordenadas projetadas (sistema de coordenadas planas, UTM ou uma grelha local). Pode indicar ao CivilCraft em que sistema de coordenadas estão e se são coordenadas de grelha, de terreno ou locais; depois ele mostra a latitude e a longitude e posiciona os ficheiros SIG e as camadas de mapa, mas nunca altera as unidades nem move as suas coordenadas por si só. Veja [Definir o sistema de coordenadas do projeto](topic:coordinate-systems) e [Coordenadas de terreno e locais](topic:ground-and-local-coordinates). Valores grandes de sistema de coordenadas planas (milhões de ft) são aceites; o CivilCraft trabalha internamente em relação ao local para manter a precisão.
