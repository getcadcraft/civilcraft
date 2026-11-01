---
title: Navegadores e computadores
summary: Em que navegadores correm as aplicações, o que difere entre eles e o que o seu computador necessita.
keywords: chrome, edge, firefox, safari, brave, navegador, mac, windows, linux, ipad, tablet, webgl, requisitos, memória
from: a11b09b1
---

As aplicações correm dentro de um navegador. Fazem o trabalho no seu próprio computador: os seus ficheiros são abertos aí e nunca nos são enviados (ver [Para onde vão os seus ficheiros](common:your-files)).

## Que navegador

Utilize uma versão atualizada de um destes:

| Navegador | Motor | Notas |
|---|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium | O mais completo: seleção de pastas, gravação para utilização offline, abertura de ficheiros pelo sistema. |
| Firefox | Gecko | Funciona. Abrir uma pasta inteira usa um seletor mais simples. A gravação offline pode não funcionar em janelas privadas. |
| Safari | WebKit | Funciona em Mac e iPad. Abrir uma pasta inteira usa um seletor mais simples. O Safari pode apagar uma cópia offline que não tenha usado durante algumas semanas. |

Os três motores servem para o trabalho do dia a dia. Quando uma aplicação faz algo de forma diferente num deles, a sua ajuda mostra os passos para o seu navegador.

## O que difere entre navegadores

- **Abrir uma pasta.** Os navegadores Chromium mostram um verdadeiro seletor de pastas e podem ler a pasta diretamente. O Firefox e o Safari pedem-lhe que escolha uma pasta e depois lêem todos os ficheiros que contém, o que demora mais em pastas de projeto grandes; arrastar a pasta para a aplicação funciona nos três.
- **Guardar.** As aplicações guardam transferindo um ficheiro. É o seu navegador que decide para onde vão as transferências e se pergunta primeiro.

:::chromium
No Chrome ou no Edge, ative «Perguntar onde guardar cada ficheiro antes de o transferir» (em Definições, em Transferências) para escolher uma pasta de cada vez.
:::

:::firefox
No Firefox, abra Definições, depois Geral, depois Transferências, e escolha «Perguntar sempre onde guardar os ficheiros» para escolher uma pasta de cada vez.
:::

:::safari
No Safari, abra Definições, depois Geral, e defina «Localização das transferências de ficheiros» como «Perguntar a cada transferência» para escolher uma pasta de cada vez.
:::

## Mac, Windows e Linux

As aplicações são iguais em todos os computadores. O que muda é o teclado: os atalhos são escritos automaticamente para o seu computador. Ver [Teclas, ratos e trackpads](common:keys).

## Tablets e ecrãs táteis

Algumas aplicações aceitam toque (um dedo desenha ou seleciona, dois dedos fazem pinça para aumentar e deslocam a vista). A ajuda de cada aplicação diz se o faz. Num iPad, utilize o Safari ou o Chrome. Um teclado ajuda nas aplicações que usam comandos escritos.

## O navegador e o sistema mais antigos

Lemos isto a partir do código das aplicações 0.7, não por palpite: cada ficheiro foi analisado e cada funcionalidade da linguagem que utiliza foi procurada nos dados de compatibilidade publicados dos navegadores. Abaixo destas versões, as aplicações nem sequer conseguem arrancar, porque o navegador não entende o código.

| | Versão mais antiga que consegue arrancar as aplicações |
|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium 94 |
| Firefox | 93 |
| Safari (Mac, iPad, iPhone) | 16.4 (macOS 13.3, iPadOS e iOS 16.4) |

O CadCraft Studio traz o seu próprio motor web no Windows, por isso precisa do Windows 10 ou 11; num Mac usa o do sistema, por isso precisa do macOS 13.3 ou posterior. Definições › Atualizações no Studio mostra em que corre a sua cópia.

Esta é a versão mais antiga que *arranca*, lida a partir do código. Não é uma lista de navegadores antigos em que tenhamos executado as aplicações, por isso um navegador mais antigo que arranque pode ainda assim não ter uma funcionalidade.

## O que o seu computador necessita

Estes são mínimos previstos para as aplicações, não requisitos medidos:

- 8 GB de memória (recomendam-se 16 GB para modelos federados grandes).
- Uma placa gráfica com WebGL 2 para as aplicações 3D. Se uma vista 3D ficar em branco, verifique se a aceleração de hardware está ativada nas definições do navegador.
- Um ecrã com pelo menos 1280 píxeis de largura para as barras de ferramentas completas; em ecrãs mais pequenos, quebram em várias linhas.

Os ficheiros muito grandes (conjuntos de plantas grandes, modelos grandes) usam muita memória num separador do navegador. Feche outros separadores pesados se uma aplicação ficar lenta.
