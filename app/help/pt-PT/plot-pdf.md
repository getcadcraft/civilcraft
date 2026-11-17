---
title: Imprimir (plotar) a planta em PDF
summary: Imprima tudo ou a vista atual para um PDF vetorial numa folha normalizada, a uma escala de engenharia ou métrica, com cores de camada ou a preto.
keywords: imprimir, plotar, pdf, folha, escala, formato do papel, folha de planta, publicar, legenda, seta do norte, barra de escala
from: 9af396ca
---

{{ui:PDF}} imprime a planta num PDF vetorial numa folha, com uma legenda, uma seta do norte e uma barra de escala. O PDF é criado no navegador e transferido; não passa pela caixa de diálogo de impressão do navegador.

## Imprimir

1. Defina a planta em **Visualização**: a superfície mostrada, o intervalo das curvas de nível e o que está ligado. A impressão segue estas definições.
2. Se quiser apenas parte do local, aplique zoom e desloque a vista para essa parte.
3. Clique em {{ui:PDF}} no grupo **Exportar**, ou prima {{key:Mod+P}}. Abre-se a caixa de diálogo **Imprimir a planta em PDF**.
4. Escolha a **Área**: {{ui:Everything}} ou {{ui:What is on screen}}.
5. Escolha o **Formato**: Letter, Tabloid, ANSI D, ARCH D, ISO A4, A3 ou A1. Um projeto em pés começa em Tabloid, um projeto em metros em A3. As folhas são sempre horizontais.
6. Escolha a **Escala**. A lista marca com «(cabe)» a maior escala que cabe e seleciona-a.
   - Pés: 1" = 5', 10', 20', 30', 40', 50', 60', 100', 200', 300', 400', 500', 1000'.
   - Metros: 1:50, 1:100, 1:200, 1:250, 1:500, 1:1000, 1:2000, 1:2500, 1:5000, 1:10000.
7. Escolha a **Tinta**: {{ui:Layer colors}} ou {{ui:Black}}.
8. Leia a linha por baixo das opções. Indica o tamanho da área no papel e o tamanho da folha, por exemplo «A área tem 297 × 222 mm à escala 1" = 40' numa folha de 432 × 279 mm (horizontal).»
9. Clique em {{ui:Download PDF}}. O navegador transfere `<name>.pdf`. A barra de estado indica «Impresso <name>.pdf à escala 1" = 40'».

Se a área for maior do que a folha à escala escolhida, a impressão fica centrada e as margens são cortadas. Escolha a escala marcada com «(cabe)» ou uma folha maior.

## O que está na folha

- A planta, centrada na área de desenho, em vetores reais: curvas de nível, etiquetas, diretrizes com marcação de PK, corredores, plataformas e linhas de intersecção do talude, coletores, pontos.
- Espessuras de linha por camada: diretrizes, plataformas e coletores mais grossos; triângulos e curvas secundárias mais finos.
- Uma legenda ao longo da base com o **Nome** do projeto, a escala, uma nota do intervalo das curvas de nível e a superfície (existente ou modelada), e a data e a versão do programa à direita.
- Uma seta do norte no canto superior direito (o norte da planta fica para cima) e uma barra de escala na legenda.
- As camadas de mapa mostradas sob a planta (uma imagem, mosaicos de mapa ou um serviço de mapas), quando **Camadas de mapa sob a planta** está assinalada: são desenhadas como uma só imagem de toda a área de desenho a 150 pontos por polegada, sob o traçado, e a atribuição de um mapa vai para a legenda. A CivilCraft espera até 8 segundos pelas imagens de mapa que ainda chegam; se algumas faltarem, a barra de estado indica-o.

O texto usa o Helvetica incorporado no PDF. Os caracteres fora do conjunto da Europa Ocidental (Windows-1252) são impressos como "?", e a mensagem de estado conta-os.

## O que não é impresso

- Faixas de cota.
- A vista de perfil. A impressão de perfis ainda não está disponível.
- Mais do que uma folha (para uma diretriz, use [folhas de planta e perfil](topic:plan-profile-sheets)), viewports, uma legenda personalizada ou folhas na vertical.

:::note
A caixa de diálogo indica que as setas de inclinação são só para ecrã. Nesta versão, as setas de inclinação ligadas em **Visualização** são impressas (e exportadas para DXF). Desligue-as antes de imprimir se não as quiser.
:::

## Imprimir em papel

Abra o PDF transferido em qualquer leitor de PDF e imprima a 100% (tamanho real) para que a escala se mantenha exata. «Ajustar à página» altera a escala.
