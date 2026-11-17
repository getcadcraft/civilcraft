---
title: Flecha e tração
summary: Suas hipóteses de carga (temperatura, vento, gelo) e limites de tração, como o CivilCraft calcula a tração de cada seção, e as tabelas de lançamento.
keywords: flecha, tração, hipótese de carga, temperatura, vento, gelo, gelo assimétrico, vão de regulagem, vão equivalente, mudança de estado, catenária, tabela de lançamento, carga de ruptura, tensão de serviço
from: f8876c35
---

## Hipóteses de carga e limites

{{ui:More}} › {{ui:Load cases and limits…}} edita as regras que cada linha do projeto segue.

- **Hipóteses de carga**: uma temperatura, uma pressão de vento sobre o condutor (Pa) e gelo radial (mm, com a sua densidade). A primeira hipótese é a de referência.
- **Limites de tração**: uma parcela da carga de ruptura do condutor, sobre a tração horizontal ou sobre a maior tração em um apoio, em uma hipótese de carga. Ou informe você mesmo a tração horizontal.
- **Distâncias de segurança**: a distância que o condutor mantém acima do terreno, de uma estrada, de uma edificação e assim por diante. Adicione, renomeie e remova: elas são suas. Abaixo delas, escolha as regras para **Plantas paisagísticas sob a linha**, **Muros paisagísticos sob a linha** e **Travessias subterrâneas**.
- **Hipóteses usadas nas verificações**: qual hipótese dá a maior flecha (quente), o balanço do isolador (vento), gelo e gelo em um só lado de um apoio.
- **Fatores**: fator de espaçamento entre fases k, maior balanço do isolador, um fator sobre as cargas dos apoios e das ferragens, os ângulos de deflexão que tornam os apoios de ângulo e de ancoragem, a menor cobertura sobre cabos enterrados e a maior queda de tensão.

## Pacotes: regras e uma biblioteca para um país

Nenhuma regra de país vem embutida no CivilCraft. Um **pacote** guarda um conjunto de regras e uma biblioteca juntos em um só arquivo (`.cclinepack.json`), para um país, uma operadora de rede ou uma empresa:

- **Salvar como pacote…** em {{ui:Load cases and limits…}} grava o conjunto de regras exibido e a sua biblioteca (ou, se a sua biblioteca ainda estiver vazia, os itens que este projeto usa). Digite primeiro o **País ou região**.
- **Abrir um conjunto de regras ou pacote…** lê um pacote, um arquivo de regras ou um arquivo de biblioteca. As regras de um pacote são exibidas na caixa de diálogo (clique em **Aplicar** para usá-las), e os seus itens vão para a sua biblioteca.
- Os pacotes que outras pessoas compartilham aparecem na página de complementos, em **Pacotes de linhas de transmissão**. Dois pacotes de exemplo mostram o formato; eles não são as regras de país nenhum.

Todo pacote é verificado ao ser aberto, como qualquer arquivo. Confira cada valor com a norma aplicável antes de qualquer construção.

Há dois conjuntos de regras de exemplo para começar: **Exemplo: clima frio** e **Exemplo: clima temperado**. Seus números não vêm de nenhuma norma: informe os valores que a sua norma determina. {{ui:Save rules}} e {{ui:Open rules…}} compartilham um conjunto de regras como arquivo.

## Como a tração é calculada

Para cada seção entre estruturas de ancoragem:

1. O **vão de regulagem** é √(ΣL³ ÷ ΣL) dos seus vãos.
2. Cada limite é convertido em uma tração horizontal no caso de referência pela **equação de mudança de estado** sobre o vão de regulagem: H₂²·(H₂ − H₁ + EA·w₁²L²/(24H₁²) + EA·α·(t₂ − t₁)) = EA·w₂²L²/24. O mais restritivo define a tração.
3. A tração de cada hipótese de carga segue dessa, e a forma de cada vão é a **catenária** exata que passa pelos seus dois pontos de fixação (inclusive vãos em declive): flecha a partir da corda, comprimento e a tração em cada extremidade.

A carga por metro em uma hipótese: peso mais gelo (área de gelo × densidade × g) na vertical; pressão do vento × o diâmetro com gelo na horizontal.

## Tabelas de lançamento

{{ui:More}} › {{ui:Stringing tables…}} lista, para cada seção, a tração horizontal e a flecha de cada vão em cada temperatura do conjunto de regras (−5 °C a 40 °C de 5 em 5 °C, para começar), sem vento. Salve-as, assim como a tabela de apoios, como CSV.

Não são considerados: a fluência do condutor ao longo dos anos e o alongamento de um condutor novo. Inclua-os nas temperaturas de lançamento que você usar.
