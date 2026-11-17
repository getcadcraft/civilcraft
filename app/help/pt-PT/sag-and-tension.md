---
title: Flecha e tensão
summary: As suas hipóteses de carga (temperatura, vento, gelo) e os limites de tensão, como o CivilCraft calcula a tensão de cada troço e as tabelas de regulação.
keywords: flecha, tensão, hipótese de carga, temperatura, vento, gelo, gelo assimétrico, vão de regulação, vão equivalente, mudança de estado, catenária, tabela de regulação, carga de rutura, tensão corrente
from: f8876c35
---

## Hipóteses de carga e limites

{{ui:Mais}} › {{ui:Hipóteses de carga e limites…}} edita as regras que cada linha do projeto segue.

- **Hipóteses de carga**: uma temperatura, uma pressão do vento sobre o condutor (Pa) e gelo radial (mm, com a sua densidade). A primeira hipótese é a de referência.
- **Limites de tensão**: uma parte da carga de rutura do condutor, sobre a tensão horizontal ou sobre a maior tensão num apoio, numa hipótese de carga. Ou indique diretamente a tensão horizontal.
- **Distâncias de segurança**: a distância que o condutor mantém sobre o terreno, uma estrada, um edifício e assim por diante. Acrescente, renomeie e remova-as: são suas. Abaixo delas, escolha as regras para **Plantas paisagísticas sob uma linha**, **Muros paisagísticos sob uma linha** e **Cruzamentos subterrâneos**.
- **Hipóteses usadas nas verificações**: qual hipótese dá a maior flecha (quente), o balanço do isolador (vento), o gelo e o gelo de um só lado de um apoio.
- **Fatores**: fator de espaçamento entre fases k, maior balanço do isolador, um fator sobre as cargas nos apoios e acessórios, os ângulos de desvio que tornam os apoios de ângulo e de amarração, o recobrimento mínimo sobre cabos enterrados e a maior queda de tensão.

## Pacotes: regras e uma biblioteca para um país

Nenhuma regra de país vem incorporada no CivilCraft. Um **pacote** guarda um conjunto de regras e uma biblioteca num só ficheiro (`.cclinepack.json`), para um país, um operador de rede ou uma empresa:

- **Guardar como pacote…** em {{ui:Hipóteses de carga e limites…}} escreve o conjunto de regras apresentado e a sua biblioteca (ou, se a biblioteca estiver vazia, os itens que este projeto usa). Introduza primeiro o **País ou região**.
- **Abrir um conjunto de regras ou um pacote…** lê um pacote, um ficheiro de regras ou um ficheiro de biblioteca. As regras de um pacote são apresentadas na caixa de diálogo (clique em **Aplicar** para as usar) e os seus itens passam para a sua biblioteca.
- Os pacotes que outros partilham aparecem na página de suplementos, em **Pacotes de linhas elétricas**. Dois pacotes de exemplo mostram o formato; não são as regras de nenhum país.

Cada pacote é verificado quando é aberto, como qualquer ficheiro. Verifique cada valor contra a norma aplicável antes de construir o que quer que seja.

Dois conjuntos de regras de exemplo estão disponíveis para começar: **Exemplo: clima frio** e **Exemplo: clima ameno**. Os seus números não vêm de nenhuma norma: defina os valores que a sua norma indica. {{ui:Guardar regras}} e {{ui:Abrir regras…}} partilham um conjunto de regras como ficheiro.

## Como a tensão é calculada

Para cada troço entre amarrações:

1. O **vão de regulação** é √(ΣL³ ÷ ΣL) dos seus vãos.
2. Cada limite é convertido numa tensão horizontal na hipótese de referência, através da **equação de mudança de estado** no vão de regulação: H₂²·(H₂ − H₁ + EA·w₁²L²/(24H₁²) + EA·α·(t₂ − t₁)) = EA·w₂²L²/24. O mais restritivo define a tensão.
3. A tensão de cada hipótese de carga segue dessa, e a forma de cada vão é a **catenária** exata que passa pelos seus dois pontos de fixação (incluindo vãos em declive): flecha pela corda, comprimento e a tensão em cada extremidade.

A carga por metro numa hipótese: peso mais gelo (área de gelo × densidade × g) na vertical; pressão do vento × diâmetro com gelo na horizontal.

## Tabelas de regulação

{{ui:Mais}} › {{ui:Tabelas de regulação…}} lista, para cada troço, a tensão horizontal e a flecha de cada vão a cada temperatura do conjunto de regras (de −5 °C a 40 °C, de 5 °C em 5 °C, para começar), em ar parado. Guarde-as, e à tabela de apoios, em CSV.

Não contado: a fluência do condutor ao longo dos anos e o alongamento de um condutor novo. Acrescente-os através das temperaturas a que faz a regulação.
