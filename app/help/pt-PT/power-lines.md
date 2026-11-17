---
title: Área de trabalho Linhas elétricas
summary: Linhas aéreas e cabos subterrâneos no local do projeto, com bibliotecas próprias, flecha e tração sob as hipóteses de carga definidas, verificações de folga e de resistência, tabelas de regulação, quantidades, folhas e exportação para SIG.
keywords: linha elétrica, linha aérea, elétrico, distribuição, postes, apoios, condutor, flecha, tração, regulação, folga, cabo subterrâneo, vala, área de trabalho, distribuidora
from: 638dd856
---

A área de trabalho Linhas elétricas coloca linhas aéreas e cabos subterrâneos no local do CivilCraft que já existe: os mesmos pontos de levantamento, o mesmo terreno, o mesmo ficheiro de projeto.

:::warning
Uma ferramenta de apoio ao projeto. A área de trabalho calcula a flecha, a tração, as folgas e as cargas a partir das hipóteses de carga e dos limites do projeto; nenhuma norma de um país está incorporada. Um engenheiro verifica cada resultado contra a norma aplicável antes de qualquer construção.
:::

## Abrir

Escolha {{ui:Superfície}} › {{ui:Mais}} › {{ui:Área de trabalho Linhas elétricas}}, ou **Linhas elétricas** em Área de trabalho. A barra de ferramentas passa a mostrar um grupo **Linhas elétricas**; os grupos Design e SIG recuam. Escolha **Civil** em Área de trabalho para voltar. O CivilCraft recorda a área de trabalho que usou por último neste computador.

O painel da esquerda ganha duas secções no topo:

- **Linhas elétricas**: as hipóteses de carga e os limites, as linhas e cabos do projeto, e **Verificações**, sempre atualizadas. Clique numa verificação para selecionar o elemento a que diz respeito.
- **Biblioteca**: os condutores, cabos, apoios, equipamentos e tipos de vala próprios. Veja [A biblioteca de linhas elétricas](topic:power-line-library).

## O que há no grupo Linhas elétricas

| Ferramenta | O que faz | Tópico |
|---|---|---|
| **Linha** | Uma linha aérea: clique em cada apoio | [Desenhar uma linha aérea](topic:overhead-line) |
| **Apoio** | Acrescenta um apoio num vão | [Desenhar uma linha aérea](topic:overhead-line) |
| **Cabo** | Uma rota de cabo subterrâneo numa vala | [Cabos subterrâneos](topic:underground-cables) |
| **Equipamento** | Um armário, um transformador, uma junta ou a fonte que alimenta a rede | [Cabos subterrâneos](topic:underground-cables) |
| **Obstáculo** | Algo que uma linha atravessa: uma estrada, um edifício, outra linha | [Verificações](topic:power-line-checks) |
| **Perfil** | O perfil da linha: terreno, apoios e condutor em cada hipótese de carga | [Desenhar uma linha aérea](topic:overhead-line#the-line-profile) |
| **Mais** | Hipóteses de carga e limites, tabelas de regulação, quantidades, folhas e relatório, SIG, ficheiros de estudo | [Flecha e tração](topic:sag-and-tension), [Saídas](topic:power-line-outputs), [Ficheiros de estudo](topic:power-line-study-file) |

Tudo o que acrescentar é um passo de anulação, fica guardado no ficheiro do projeto e é desenhado na planta em camadas com nomes `C-POWR-…`, por isso as exportações DXF, DWG e PDF também o incluem.
