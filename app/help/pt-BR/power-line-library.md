---
title: Sua biblioteca de linhas de energia
summary: Crie seus próprios condutores, cabos subterrâneos, estruturas, equipamentos e tipos de vala, em categorias que você nomeia, e compartilhe-os como arquivos.
keywords: biblioteca, condutor, cabo, poste, estrutura, travessa, isolador, acessório, estai, transformador, gabinete, emenda, vala, categoria, csv, importar, exportar
from: 88733744
---

A seção **Biblioteca** da área de trabalho de linhas de energia guarda todos os itens que uma linha ou um cabo pode usar. Nada nela está ligado a um país ou a um fabricante: você cria os itens com que trabalha.

## Três tipos de itens

| Tipo | Onde fica | Pode ser alterado? |
|---|---|---|
| **Exemplos** | Incluídos no CivilCraft, com números genéricos que calculamos a partir das propriedades dos materiais | Não: primeiro {{ui:Copiar para minha biblioteca}} |
| **No projeto** | Veio com o arquivo de projeto que você abriu | Não: primeiro {{ui:Copiar para minha biblioteca}} |
| **Meus** | Seus próprios itens, armazenados neste navegador | Sim, e as alterações são salvas na hora |

Todo projeto guarda uma cópia de cada item que usa, de modo que um projeto abre em qualquer computador com seus próprios condutores e postes.

:::warning
Os itens de exemplo são apenas exemplos: confira cada número com os dados do seu fornecedor. Os cabos subterrâneos não têm capacidade de corrente de propósito, porque ela depende de como o cabo é instalado.
:::

## Criar um item

1. Em **Biblioteca**, escolha o **Tipo** (condutores aéreos, cabos subterrâneos, estruturas, equipamentos ou tipos de vala).
2. Clique em {{ui:Novo item}}, ou escolha um exemplo e clique em {{ui:Copiar para minha biblioteca}} ou {{ui:Duplicar}}.
3. Preencha os campos. Os campos marcados com `*` são os que as verificações precisam; um item sem um deles é marcado com `!` e listado em **Verificações** quando uma linha o usa.
4. Dê a ele uma **Categoria**, com `/` entre os níveis: `Overhead/LV/Bundled`, `Supports/Concrete/12 m`. A árvore segue as suas categorias.

O que cada tipo precisa:

| Tipo | Necessário para as verificações |
|---|---|
| Condutor aéreo | seção transversal, diâmetro, massa por metro, carga de ruptura, módulo de elasticidade, dilatação térmica |
| Cabo subterrâneo | veias, seção transversal, tensão, diâmetro, resistência, capacidade de corrente |
| Estrutura | comprimento total, carga nominal (tomada em um ponto abaixo do topo), profundidade no terreno |
| Equipamento | seu tipo; uma carga nominal para travessas, acessórios e estais; espaçamento entre fases e queda para travessas; comprimento para isoladores; o ângulo para estais |
| Tipo de vala | profundidade, largura, cobertura sobre os cabos |

## Compartilhar

- {{ui:Salvar minha biblioteca}} salva todos os seus itens em um único arquivo `.cclines.json`; {{ui:Abrir uma biblioteca…}} lê um de volta (itens com a mesma chave são substituídos).
- {{ui:Salvar como CSV}} salva o tipo que você está vendo como planilha; {{ui:Abrir uma biblioteca…}} lê de volta um CSV desse tipo. As colunas podem vir em qualquer ordem; um arquivo separado por ponto e vírgula pode usar vírgula decimal.
