---
title: Definir o estilo de uma camada por um atributo
summary: Colorir as feições de uma camada GIS pelos valores de um campo (uma cor por valor, ou por faixas numéricas), dimensionar pontos por um número, tingir polígonos e mostrar uma legenda na planta.
keywords: simbologia, estilo, cor, colorir, categorizado, graduado, valores únicos, intervalo igual, quantil, quebras naturais, jenks, rampa, daltonismo, legenda, tamanho, pontos, coropleta, classes, gis
from: a3a69add
---

Abra o menu de **três pontos** de uma camada na lista de camadas GIS e escolha {{ui:Estilo por atributo…}}.

## Três estilos

- **Símbolo único:** a cor da camada, como antes.
- **Categorizado:** uma cor para cada valor distinto de qualquer campo. Até oito valores recebem as oito cores Okabe-Ito (escolhidas para continuarem distintas nos tipos comuns de daltonismo); com mais valores, as sete mais frequentes recebem uma cor cada, e o restante divide uma classe cinza **Outros**. Feições sem valor ficam cinza.
- **Graduado:** um campo numérico é dividido em 2 a 9 faixas, cada uma com uma cor de uma rampa. Um valor sobre uma divisão vai para a faixa inferior.

## Como as faixas são divididas

| Método | Divisões |
|---|---|
| Intervalo igual | A faixa do menor ao maior valor, dividida em larguras iguais. Valores de 0 a 30 em três faixas: 0, 10, 20, 30. |
| Quantil | Cerca do mesmo número de feições em cada faixa. As divisões são lidas dos valores ordenados, com a interpolação linear usual: para 1 a 10 em duas faixas, a divisão é 5.5. |
| Quebras naturais (Jenks) | Os cortes que deixam a menor dispersão dentro de cada faixa, de modo que grupos de valores parecidos ficam juntos. Com mais de 1,500 valores, trabalha com 1,500 espaçados igualmente e informa isso. |

## Cores

Viridis e Cividis vão do escuro ao claro, com mudança constante de luminosidade, então a ordem das faixas pode ser lida mesmo em cinza ou com daltonismo. Blues vai do claro ao escuro. Vermelho a azul é uma rampa bidirecional para valores em torno de um meio. **Inverter as cores** inverte qualquer uma delas. A caixa lista as faixas e o número de feições em cada uma antes de você aplicar.

## Tamanho, preenchimento e legenda

- **Tamanho do ponto por** um campo numérico faz o quadrado de cada ponto ficar maior quanto maior o valor, entre os dois tamanhos que você define (metade do lado, em milímetros no papel).
- **Tingir o interior dos polígonos** preenche cada polígono com a cor de sua classe (os furos ficam vazios). O tingimento é na tela; plotagens e DXF/DWG mostram os contornos coloridos.
- **Mostrar uma legenda na planta** desenha as classes, suas contagens e a faixa de tamanhos no canto inferior esquerdo da planta. A legenda é na tela; ela não entra na plotagem.
- Para rotular feições com um campo, use **Rotular com** no mesmo menu.

O estilo é salvo no arquivo do projeto. Uma versão que não conhece estilos abre o arquivo com a cor da camada. Plotagens, DXF e DWG levam as classes como camadas separadas, com nomes da camada e da classe, na mais próxima das nove cores básicas de CAD. Uma camada com mais de 200,000 feições é desenhada em uma só cor.
