---
title: Registros de plantas, cultivares e tamanhos fornecidos
summary: A lista de plantas própria do projeto como uma tabela: cultivares, tamanhos fornecidos (recipiente, torrão, circunferência, altura do fuste livre), densidade, notas de especificação, CSV de entrada e saída; cada planta posicionada indica um tamanho; símbolos das plantas por escala e seus próprios símbolos e modelos 3D.
keywords: tabela de plantas, banco de dados de plantas, cultivar, variedade, tamanho fornecido, recipiente, torrão, raiz nua, circunferência, altura do fuste, densidade, plantas por metro quadrado, especificação, notas de especificação, símbolo de planta, bloco, símbolo próprio, planta 3D, nível de detalhe, escala
from: 12251beb
---

Abra {{ui:Tabela de plantas}} pelo menu {{ui:Mais}} do grupo Paisagismo, ou pela seção Plantas. Cada linha é um registro de planta na lista própria deste projeto (um registro da lista de plantas é copiado quando você o adiciona). Cada edição é verificada como um arquivo importado e equivale a uma etapa de desfazer.

## As colunas

- **Nome botânico**, **Nome comum**, **Tipo**, **Altura** e **Espalhamento** na maturidade (metros).
- **Espaçamento** (centro a centro) ou **Densidade** (plantas por m²). Um canteiro de um registro com densidade e sem espaçamento é preenchido nessa densidade, segundo o padrão próprio dele (triangular ou quadrado).
- **Tamanhos fornecidos**: uma entrada por tamanho, separadas por `;`. Cada entrada é um id, um tipo (`container`, `rootball`, `wrapped`, `bareroot`, `plug`, `seed`) e depois qualquer um destes: um volume `10L`, uma altura `h0.6`, um espalhamento `s0.4`, uma circunferência `g14-16` (cm), uma altura do fuste livre `st1.8`. Exemplo: `c10 container 10L h0.6; rb rootball h3 g14-16 st1.8`.
- **Cultivares**: nomes separados por `;`. Uma cultivar mantém seus próprios tamanhos e notas quando o arquivo importado os tinha.
- **Notas de especificação**.

{{ui:Duplicar}} copia uma linha com uma nova chave; {{ui:Salvar como CSV}} e {{ui:Salvar como arquivo de plantas}} gravam a lista (as linhas CSV das cultivares ficam sob a espécie, com `cultivar_of`). Importar um CSV ou arquivo de plantas o mescla.

## Sua lista de plantas da Biblioteca

Entre na sua conta CadCraft (Configurações, Seus complementos, Entrar) e a tabela de plantas pode usar a lista que você mantém na Biblioteca:

- {{ui:Da minha lista da Biblioteca}} traz seus próprios itens de planta (inclusive os que ainda aguardam revisão). Uma planta que você já tem aqui é atualizada a partir da Biblioteca; as cultivares, tamanhos fornecidos, densidade e especificação que você adicionou aqui são mantidos.
- {{ui:Salvar como lista de plantas}} salva cada linha como um item de planta próprio da Biblioteca, um item por espécie: uma planta nova é um item novo, uma planta alterada é uma nova versão, uma inalterada é deixada como está. Marque a caixa antes: salvar disponibiliza as plantas ao público sob CC0. O primeiro envio público de uma pessoa ainda não confiável é verificado por uma pessoa antes de aparecer, como todo envio.

A Biblioteca guarda o registro básico da planta. Cultivares, tamanhos fornecidos, densidade e notas de especificação ficam no projeto e no arquivo de plantas ({{ui:Salvar como arquivo de plantas}}); a caixa de diálogo informa quantas linhas são afetadas a cada vez que você salva.

## Uma planta posicionada indica um tamanho

Selecione uma planta, uma cerca ou uma linha de mistura de um canteiro ou área plantada: quando o registro tem cultivares ou tamanhos fornecidos, {{ui:Cultivar e tamanho}} escolhe um. A tabela de plantio então conta por espécie, cultivar e tamanho, e um rótulo pode mostrá-los: `{botanical} '{cultivar}' {size}` ou `{full}`.

## Símbolos das plantas por escala

{{ui:Gráficos de plantas}} (Paisagismo › Mais) define como as plantas são desenhadas na planta: **automático** (mais grosseiro que 1:500, um círculo na largura; entre 1:200 e 1:500, um contorno com o centro; mais fino, o símbolo detalhado; as duas escalas podem ser alteradas) ou um nível para todas as escalas. A caixa Folhas tem seu próprio **Detalhe das plantas na planta** para esse conjunto.

Em um registro da seção Plantas, {{ui:Símbolo próprio…}} lê um SVG, ou um bloco de um desenho DXF/DWG, e o desenha na largura da planta no nível detalhado. {{ui:Modelo 3D próprio…}} lê um OBJ, STL ou GLB; em Gráficos de plantas escolha **Modelo próprio de cada registro** para vê-lo em 3D. Os arquivos têm limite (512 KB de SVG, 2000 formas, 50 000 triângulos) e são mantidos no projeto. Transformações de SVG não são aplicadas (você é avisado quando um arquivo as tem). Veja [Gráficos de plantas, símbolos próprios e plantas em 3D](topic:plant-graphics) para os níveis, os limites e o que um GLB pode conter.
