---
title: Desenhar lotes e escrever suas descrições legais
summary: Desenhe um lote pelos seus cantos ou insira os trechos de uma escritura ou planta, verifique o quanto os trechos fecham, rotule rumos e distâncias na planta, transforme qualquer trecho em curva e copie um rascunho da descrição legal.
keywords: lotes, terrenos, divisas, limite, escritura, planta, metes and bounds, rumo, distância, fechamento, erro de fechamento, precisão, descrição legal, ponto de início, curva, raio, área, acres
from: 6793d6ce
---

Lotes ficam na planta com o rumo e a distância ao longo de cada trecho reto (uma curva mostra seu raio, comprimento e ângulo central) e seu nome e área no centro. Eles entram no PDF e nas exportações DWG e DXF, nas camadas `V-PROP` (linhas) e `V-PROP-TEXT` (rótulos). Tudo fica em **Lotes** no painel direito quando nada está selecionado.

## Desenhar um lote

1. Clique em **Desenhar um lote**.
2. Clique nos cantos, começando pelo ponto de início. Um clique perto de um ponto de levantamento assume a posição exata desse ponto.
3. Clique no primeiro canto de novo, ou pressione {{key:Enter}}, para concluir. {{key:Backspace}} desfaz o último canto; {{key:Esc}} descarta os cantos até ali; pressione {{key:Esc}} de novo para sair da ferramenta.

## Inserir os trechos de uma escritura

1. Clique em **Inserir trechos da escritura**.
2. Informe onde os trechos começam: o número de um ponto de levantamento, ou uma coordenada norte e leste.
3. Digite ou cole os trechos, um por linha:
   - um trecho: um rumo e uma distância, como `N 45°30'15" E 125.50`. `N45-30-15E`, `N 45 30 15 E`, `N 45.5 E` e azimutes (`AZ 45°30'15"`) também funcionam, e "thence", vírgulas e "feet" são ignorados.
   - uma curva: `C R 300 L 52.36 right` (raio e comprimento do arco) ou `C R 300 D 10°00'00" left` (raio e ângulo central). Uma curva segue o trecho anterior; quando não segue, informe o rumo da corda: `C R 300 L 52.36 right CB N 50 00 00 E`.
   - `#` inicia uma linha de comentário.
4. Conforme você digita, a caixa mostra o comprimento dos trechos, o **erro de fechamento** (quão longe do início eles terminam, e em que direção), a **precisão** (o comprimento dividido pelo erro, 1 : 10,000 e assim por diante) e a área. Linhas que não consegue ler são listadas com seus números de linha.
5. **Adicionar o lote**. Quando os trechos não fecham, o lote é fechado com um trecho reto atravessando a diferença: confira os trechos com a escritura. Para distribuir o erro de uma poligonal de campo pelos seus trechos, ajuste-a antes.

## Curvas

Nas **Propriedades** de um lote, cada trecho tem um **Raio**. Digite um para transformar esse trecho em uma curva entre os mesmos dois cantos (um raio menor que a metade da distância entre os cantos não pode ser alcançado, então é recusado), e escolha **Direita** ou **Esquerda** em **Curvas**: uma curva para a direita tem seu centro à direita do sentido do percurso, como em uma escritura. Limpe o raio para deixar o trecho reto de novo. Cada alteração é uma etapa: {{key:Mod+Z}} a desfaz.

## A descrição legal

As Propriedades de um lote terminam com a sua descrição legal, escrita a partir do desenho:

- "Começando em" o **Ponto de início** que você digita (por exemplo, "o canto nordeste do Lote 4"); senão, a coordenada norte e leste do primeiro canto, ou o ponto de levantamento de onde os trechos começaram.
- "em seguida" cada trecho: um rumo e uma distância, ou uma curva com seu raio, comprimento do arco, ângulo central, e rumo e distância da corda.
- "Contendo" sua área em pés quadrados e acres (metros quadrados e hectares em um projeto em metros).

**Copiar** coloca a descrição na área de transferência; **Baixar como texto** salva um arquivo `.txt`.

:::warning
A descrição legal é um rascunho a partir do desenho, não um levantamento. Um agrimensor habilitado precisa conferi-la com o registro e assiná-la antes que alguém dependa dela.
:::

Clique dentro de um lote na planta para selecioná-lo; {{key:Delete}} o remove. Os lotes são salvos no arquivo do projeto.
