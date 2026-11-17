---
title: Definir o estilo de uma camada por atributo
summary: Colorir os elementos de uma camada SIG pelos valores de um campo (uma cor por valor, ou por intervalos numéricos), dimensionar pontos por um número, preencher polígonos e mostrar uma legenda na planta.
keywords: simbologia, estilo, cor, colorido, categorizado, graduado, valores únicos, intervalo igual, quantil, quebras naturais, jenks, rampa, daltonismo, legenda, tamanho, pontos, coroplético, classes, sig
from: a3a69add
---

Abra o menu de **três pontos** de uma camada na lista de camadas SIG e escolha {{ui:Estilo por atributo…}}.

## Três estilos

- **Símbolo único:** a cor da camada, como antes.
- **Categorizado:** uma cor por cada valor distinto de qualquer campo. Até oito valores recebem as oito cores Okabe-Ito (escolhidas para se manterem distintas nos tipos comuns de daltonismo); com mais valores, as sete mais frequentes recebem uma cor cada, e os restantes partilham uma classe cinzenta **Outro**. Os elementos sem valor ficam cinzentos.
- **Graduado:** um campo numérico é dividido em 2 a 9 intervalos, cada um com uma cor de uma rampa. Um valor sobre uma quebra vai para o intervalo inferior.

## Como são cortados os intervalos

| Método | Quebras |
|---|---|
| Intervalo igual | O intervalo do menor ao maior valor, dividido em larguras iguais. Valores 0 a 30 em três intervalos: 0, 10, 20, 30. |
| Quantil | Aproximadamente o mesmo número de elementos em cada intervalo. As quebras são lidas dos valores ordenados, com a interpolação linear habitual: para 1 a 10 em dois intervalos, a quebra é 5.5. |
| Quebras naturais (Jenks) | Os cortes que deixam a menor dispersão dentro de cada intervalo, para que os grupos de valores semelhantes fiquem juntos. Com mais de 1,500 valores, trabalha sobre 1,500 valores igualmente espaçados, e diz isso. |

## Cores

Viridis e Cividis vão do escuro para o claro com uma mudança estável de luminosidade, pelo que a ordem dos intervalos se lê mesmo em cinzento ou com daltonismo. Blues vai do claro para o escuro. Vermelho para azul é uma rampa bidirecional para valores em torno de um meio. **Inverter as cores** inverte qualquer uma delas. A caixa de diálogo lista os intervalos e o número de elementos em cada um antes de aplicar.

## Tamanho, preenchimento e legenda

- **Tamanho do ponto por** um campo numérico faz o quadrado de cada ponto crescer quanto maior for o valor, entre os dois tamanhos que indicar (metade do lado, em milímetros no papel).
- **Preencher o interior dos polígonos** pinta cada polígono com a cor da sua classe (os furos ficam vazios). O preenchimento é no ecrã; as impressões e os DXF/DWG mostram os contornos coloridos.
- **Mostrar uma legenda na planta** desenha as classes, as suas contagens e o intervalo de tamanhos no canto inferior esquerdo da planta. A legenda é no ecrã; não aparece numa impressão.
- Para rotular elementos com um campo, use **Rotular com** no mesmo menu.

O estilo é guardado no ficheiro do projeto. Uma versão que não conheça os estilos abre o ficheiro com a cor da camada. As impressões, o DXF e o DWG levam as classes como camadas separadas, com o nome da camada e da classe, na mais próxima das nove cores básicas de CAD. Uma camada com mais de 200,000 elementos é desenhada numa só cor.
