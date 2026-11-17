---
title: Plotar a planta em PDF
summary: Plotar tudo ou a vista atual em PDF vetorial, em uma folha padrão, em escala de engenharia ou métrica, com cores das camadas ou em preto.
keywords: plotar, imprimir, pdf, folha, escala, tamanho do papel, folha de planta, publicar, legenda, seta do norte, barra de escala
from: 9af396ca
---

{{ui:PDF}} plota a planta em um PDF vetorial em uma folha, com faixa da legenda, seta do norte e barra de escala. O PDF é gerado no navegador e baixado; ele não passa pela caixa de diálogo de impressão do navegador.

## Plotar

1. Configure a planta em **Exibição**: a superfície mostrada, o intervalo das curvas de nível e quais elementos estão ativados. A plotagem segue essas configurações.
2. Se quiser apenas parte do terreno, aplique zoom e pan na planta até ela.
3. Clique em {{ui:PDF}} no grupo **Exportar**, ou pressione {{key:Mod+P}}.
   A caixa de diálogo **Plotar a planta em PDF** abre.
4. Escolha a **Área**: {{ui:Tudo}} ou {{ui:O que está na tela}}.
5. Escolha o **Papel**: Letter, Tabloid, ANSI D, ARCH D, ISO A4, A3 ou A1. Um projeto em pés começa em Tabloid, um projeto em metros em A3. As folhas são sempre em paisagem.
6. Escolha a **Escala**. A lista marca a maior escala que cabe com "(cabe)" e a seleciona.
   - Pés: 1" = 5', 10', 20', 30', 40', 50', 60', 100', 200', 300', 400', 500', 1000'.
   - Metros: 1:50, 1:100, 1:200, 1:250, 1:500, 1:1000, 1:2000, 1:2500, 1:5000, 1:10000.
7. Escolha as **Cores**: {{ui:Cores das camadas}} ou {{ui:Preto}}.
8. Leia a linha abaixo das opções. Ela informa o tamanho da área no papel e o tamanho da folha, por exemplo "A área tem 297 × 222 mm em 1" = 40' em uma folha de 432 × 279 mm (paisagem)."
9. Clique em {{ui:Baixar PDF}}.
   O navegador baixa `<name>.pdf`. A barra de status diz "Plotado <name>.pdf em 1" = 40'."

Se a área for maior que a folha na escala escolhida, a plotagem é centralizada e as bordas são cortadas. Escolha a escala marcada "(cabe)" ou uma folha maior.

## O que há na folha

- A planta, centralizada na área de desenho, como vetores verdadeiros: curvas de nível, rótulos, alinhamentos com estaqueamento, corredores, plataformas e linhas de pé de talude, tubos, pontos.
- Espessuras de linha por camada: alinhamentos, plataformas e tubos mais grossos; triângulos e curvas secundárias finos.
- Uma faixa de legenda na parte inferior com o **Nome** do projeto, a escala, uma nota do intervalo das curvas de nível e a superfície (existente ou terraplenada), e à direita a data e a versão do build.
- Uma seta do norte no canto superior direito (o norte da planta fica para cima) e uma barra de escala na faixa da legenda.
- As camadas de mapa mostradas sob a planta (uma imagem, blocos de mapa ou um serviço de mapa), quando **Camadas de mapa sob a planta** está marcado: são desenhadas como uma única imagem de toda a área de desenho a 150 pontos por polegada, sob as linhas, e a atribuição de um mapa vai para a faixa da legenda. O CivilCraft aguarda até 8 segundos por imagens de mapa ainda chegando; se alguma ainda faltar, a barra de status informa.

O texto usa a Helvetica embutida no PDF. Caracteres fora do conjunto da Europa Ocidental (Windows-1252) são impressos como "?", e a mensagem de status os conta.

## O que não é plotado

- Faixas de elevação.
- A vista de perfil. A plotagem de perfis ainda não está disponível.
- Mais de uma folha (para um alinhamento, use [folhas de planta e perfil](topic:plan-profile-sheets)), viewports, uma legenda personalizada ou folhas em retrato.

:::note
A caixa de diálogo informa que as setas de declividade são apenas de tela. Nesta versão, as setas de declividade ativadas em **Exibição** são plotadas (e exportadas para DXF). Desative-as antes de plotar se não as quiser.
:::

## Imprimindo no papel

Abra o PDF baixado em qualquer leitor de PDF e imprima em 100% (tamanho real) para que a escala se mantenha. "Ajustar à página" altera a escala.
