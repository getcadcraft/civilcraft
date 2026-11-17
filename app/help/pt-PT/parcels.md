---
title: Desenhar lotes e escrever as respetivas descrições legais
summary: Desenhe um lote pelos cantos ou introduza as medidas de uma escritura ou planta de loteamento, verifique o fecho das medidas, legende rumos e distâncias na planta, torne qualquer troço numa curva e copie um rascunho da descrição legal.
keywords: lotes, parcelas, limites de propriedade, limite, escritura, planta de loteamento, medidas, rumo, distância, fecho, erro de fecho, precisão, descrição legal, ponto de início, curva, raio, área, acres
from: 6793d6ce
---

Os lotes ficam na planta com o rumo e a distância ao longo de cada troço reto (uma curva mostra o raio, o comprimento e o ângulo central) e o nome e a área ao centro. Passam para a impressão PDF e para as exportações DWG e DXF, nas camadas `V-PROP` (linhas) e `V-PROP-TEXT` (rótulos). Tudo está em **Lotes** no painel direito quando nada está selecionado.

## Desenhar um lote

1. Clique em **Desenhar um lote**.
2. Clique nos cantos, começando pelo ponto de início. Um clique perto de um ponto de levantamento assume a posição exata desse ponto.
3. Clique de novo no primeiro canto, ou prima {{key:Enter}}, para terminar. {{key:Backspace}} anula o último canto; {{key:Esc}} remove os cantos marcados até então; prima-a de novo para sair da ferramenta.

## Introduzir as medidas de uma escritura

1. Clique em **Introduzir medidas da escritura**.
2. Indique onde começam as medidas: o número de um ponto de levantamento, ou uma coordenada de Norte e uma de Este.
3. Escreva ou cole as medidas, uma por linha:
   - uma linha: um rumo e uma distância, por exemplo `N 45°30'15" E 125.50`. `N45-30-15E`, `N 45 30 15 E`, `N 45.5 E` e azimutes (`AZ 45°30'15"`) também funcionam, e "thence", as vírgulas e "feet" são ignorados.
   - uma curva: `C R 300 L 52.36 right` (raio e comprimento do arco), ou `C R 300 D 10°00'00" left` (raio e ângulo central). Uma curva continua o troço anterior; quando não o faz, acrescente o respetivo rumo da corda: `C R 300 L 52.36 right CB N 50 00 00 E`.
   - `#` inicia uma linha de comentário.
4. À medida que escreve, a caixa mostra o comprimento das medidas, o **erro de fecho** (a que distância do início terminam, e em que direção), a **precisão** (o comprimento a dividir pelo erro de fecho, 1 : 10,000 e assim por diante) e a área. As linhas que não consegue ler são listadas com os respetivos números.
5. **Adicionar o lote**. Quando as medidas não fecham, o lote fecha com um troço reto sobre o intervalo: confira as medidas com a escritura. Para distribuir o erro de uma poligonal de campo pelos respetivos troços, ajuste-a primeiro.

## Curvas

Nas **Propriedades** de um lote, cada troço tem um **Raio**. Escreva um valor para que esse troço passe a ser uma curva entre os mesmos dois cantos (um raio menor do que metade da distância entre os cantos não consegue ligar os cantos, por isso é recusado), e escolha **Right** ou **Left** em **Curves**: uma curva para a direita tem o centro à direita do sentido de percurso, como numa escritura. Apague o raio para voltar a torná-lo reto. Cada alteração é um passo: {{key:Mod+Z}} anula-a.

## A descrição legal

As **Propriedades** de um lote terminam com a respetiva descrição legal, escrita a partir do desenho:

- « Com início em » o **Ponto de início** que introduzir (por exemplo, « o canto nordeste do Lote 4 »), senão a coordenada de Norte e de Este do primeiro canto, ou o ponto de levantamento de onde começaram as medidas.
- « Daí » cada troço: um rumo e uma distância, ou uma curva com o respetivo raio, comprimento do arco, ângulo central, e rumo e distância da corda.
- « Contendo » a área em pés quadrados e acres (metros quadrados e hectares num projeto em metros).

**Copiar** coloca-a na área de transferência; **Transferir como texto** guarda-a como ficheiro `.txt`.

:::warning
A descrição legal é um rascunho a partir do desenho, não um levantamento. Um topógrafo habilitado tem de a confrontar com o registo e assiná-la antes de ser usada.
:::

Clique dentro de um lote na planta para o selecionar; {{key:Delete}} elimina-o. Os lotes são guardados no ficheiro do projeto.
