---
title: Registos de plantas, cultivares e tamanhos fornecidos
summary: A lista de plantas do seu projeto como tabela: cultivares, tamanhos fornecidos (contentor, torrão, perímetro do tronco, fuste livre), densidade, notas de especificação, CSV de entrada e saída; cada planta colocada indica um tamanho; símbolos de plantas por escala e os seus próprios símbolos e modelos 3D.
keywords: tabela de plantas, base de dados de plantas, cultivar, variedade, tamanho fornecido, contentor, torrão, raiz nua, perímetro do tronco, fuste livre, densidade, plantas por metro quadrado, especificação, notas de especificação, símbolo de planta, bloco, símbolo próprio, planta 3D, nível de detalhe, escala
from: 12251beb
---

Abra {{ui:Plant table}} a partir do menu {{ui:More}} do grupo Paisagismo, ou a partir da secção Plantas. Cada linha é um registo de planta na lista própria deste projeto (um registo da lista de plantas é copiado quando o adiciona). Cada edição é verificada da mesma forma que um ficheiro importado, e corresponde a um passo de anulação.

## As colunas

- **Nome botânico**, **Nome comum**, **Tipo**, **Altura** e **Largura da copa** na maturidade (metros).
- **Espaçamento** (de centro a centro) ou **Densidade** (plantas por m²). Um canteiro de um registo com densidade e sem espaçamento é preenchido a essa densidade, segundo o seu padrão (triangular ou quadrado).
- **Tamanhos fornecidos**: uma entrada por tamanho, separadas por `;`. Cada entrada é um id, um tipo (`container`, `rootball`, `wrapped`, `bareroot`, `plug`, `seed`) e depois qualquer um destes: um volume `10L`, uma altura `h0.6`, uma largura `s0.4`, um perímetro do tronco `g14-16` (cm), um fuste livre `st1.8`. Exemplo: `c10 container 10L h0.6; rb rootball h3 g14-16 st1.8`.
- **Cultivares**: nomes separados por `;`. Uma cultivar mantém os seus próprios tamanhos e notas quando o ficheiro importado os tinha.
- **Notas de especificação**.

{{ui:Duplicate}} copia uma linha com uma nova chave; {{ui:Save as CSV}} e {{ui:Save as a plants file}} escrevem a lista (as linhas CSV das cultivares ficam debaixo da sua espécie, com `cultivar_of`). Importar um CSV ou um ficheiro de plantas junta-o à lista.

## A sua lista da Biblioteca

Inicie sessão na sua conta CadCraft (Definições, Os seus suplementos, Iniciar sessão) e a tabela de plantas pode usar a lista que mantém na Biblioteca:

- {{ui:From my Library list}} traz os seus próprios itens de planta (incluindo os que ainda aguardam revisão). Uma planta que já tem aqui é atualizada a partir da Biblioteca; as cultivares, os tamanhos fornecidos, a densidade e a especificação que acrescentou aqui são mantidos.
- {{ui:Save as a plant list}} guarda cada linha como um item de planta da sua Biblioteca, um item por espécie: uma planta nova é um item novo, uma planta alterada é uma nova versão, e uma planta sem alterações fica como está. Marque primeiro a caixa de verificação: guardar disponibiliza as plantas ao público sob CC0. Um primeiro envio público de uma pessoa que ainda não é de confiança é verificado por uma pessoa antes de aparecer, como acontece com todos os envios.

A Biblioteca guarda o registo básico da planta. As cultivares, os tamanhos fornecidos, a densidade e as notas de especificação ficam no projeto e no ficheiro de plantas ({{ui:Save as a plants file}}); a caixa de diálogo indica quantas linhas isso afeta de cada vez que guarda.

## Uma planta colocada indica um tamanho

Selecione uma planta, uma sebe, ou uma linha de mistura de um canteiro ou de uma área plantada: quando o registo tem cultivares ou tamanhos fornecidos, {{ui:Cultivar and size}} escolhe um. O mapa de plantação conta então por espécie, cultivar e tamanho, e uma etiqueta pode mostrá-los: `{botanical} '{cultivar}' {size}` ou `{full}`.

## Símbolos de plantas por escala

{{ui:Plant graphics}} (Paisagismo › Mais) define como as plantas são desenhadas na planta: **automático** (mais grosseiro do que 1:500 um círculo com a largura da copa; entre 1:200 e 1:500 um contorno com o centro; mais fino o símbolo detalhado; ambas as escalas podem ser alteradas) ou um nível para todas as escalas. A caixa de diálogo Folhas tem a sua própria **Detalhe das plantas na planta** para esse conjunto.

Num registo da secção Plantas, {{ui:Own symbol…}} lê um SVG, ou um bloco de um desenho DXF/DWG, e desenha-o com a largura da copa da planta no nível detalhado. {{ui:Own 3D model…}} lê um OBJ, STL ou GLB; em Gráficos de plantas, escolha **Modelo próprio de cada registo** para o ver em 3D. Os ficheiros têm limites (512 KB de SVG, 2000 formas, 50 000 triângulos) e ficam guardados no projeto. As transformações SVG não são aplicadas (é avisado quando um ficheiro as tem). Consulte [Gráficos de plantas, símbolos próprios e plantas em 3D](topic:plant-graphics) para os níveis, os limites e o que um GLB pode conter.
