---
title: A biblioteca de linhas elétricas
summary: Crie condutores, cabos subterrâneos, apoios, equipamentos e tipos de vala próprios, em categorias com nomes à escolha, e partilhe-os como ficheiros.
keywords: biblioteca, condutor, cabo, poste, apoio, cruzeta, isolador, acessório, retenida, cabo de retenção, transformador, armário, junta, vala, categoria, csv, importar, exportar
from: 88733744
---

A secção **Biblioteca** da área de trabalho Linhas elétricas guarda todos os itens que uma linha ou um cabo pode usar. Nada nela está ligado a um país ou a um fabricante: crie os itens com que trabalha.

## Três tipos de itens

| Tipo | Onde fica | Pode alterá-lo? |
|---|---|---|
| **Exemplos** | Incluídos no CivilCraft, com valores genéricos calculados a partir de propriedades dos materiais | Não: primeiro {{ui:Copiar para a minha biblioteca}} |
| **No projeto** | Veio com o ficheiro de projeto que abriu | Não: primeiro {{ui:Copiar para a minha biblioteca}} |
| **Os meus** | Os meus itens, guardados neste navegador | Sim, e as alterações são guardadas de imediato |

Cada projeto guarda uma cópia de cada item que usa, para que um projeto abra em qualquer computador com os próprios condutores e postes.

:::warning
Os itens de exemplo são apenas exemplos: confronte cada número com os dados do seu fornecedor. Os cabos subterrâneos não têm corrente nominal de propósito, porque ela depende de como o cabo é instalado.
:::

## Criar um item

1. Em **Biblioteca**, escolha o **Tipo** (condutores aéreos, cabos subterrâneos, apoios, equipamentos ou tipos de vala).
2. Clique em {{ui:Novo item}}, ou escolha um exemplo e clique em {{ui:Copiar para a minha biblioteca}} ou {{ui:Duplicar}}.
3. Preencha os campos. Os campos marcados com `*` são os que as verificações precisam; um item com um deles em falta é marcado com `!` e listado em **Verificações** quando uma linha o usa.
4. Atribua-lhe uma **Categoria**, com `/` entre os níveis: `Overhead/LV/Bundled`, `Supports/Concrete/12 m`. A árvore segue as categorias.

O que cada tipo precisa:

| Tipo | Necessário para as verificações |
|---|---|
| Condutor aéreo | secção transversal, diâmetro, massa por metro, resistência à rutura, módulo de elasticidade, dilatação térmica |
| Cabo subterrâneo | veias, secção transversal, tensão, diâmetro, resistência, corrente nominal |
| Apoio | comprimento total, carga nominal (tomada num ponto abaixo do topo), profundidade no solo |
| Equipamento | o seu tipo; uma carga nominal para cruzetas, acessórios e retenidas; espaçamento entre fases e queda para cruzetas; comprimento para isoladores; o ângulo para retenidas |
| Tipo de vala | profundidade, largura, cobertura sobre os cabos |

## Partilhar

- {{ui:Guardar a minha biblioteca}} guarda todos os meus itens num único ficheiro `.cclines.json`; {{ui:Abrir uma biblioteca…}} lê um de volta (os itens com a mesma chave são substituídos).
- {{ui:Guardar como CSV}} guarda o tipo que está a ver como folha de cálculo; {{ui:Abrir uma biblioteca…}} lê de volta um CSV desse tipo. As colunas podem vir em qualquer ordem; um ficheiro separado por ponto e vírgula pode usar vírgula decimal.
