---
title: Navegadores e computadores
summary: Em quais navegadores os apps funcionam, o que muda entre eles e o que seu computador precisa ter.
keywords: chrome, edge, firefox, safari, brave, navegador, mac, windows, linux, ipad, tablet, webgl, requisitos, memória
from: a11b09b1
---

Os apps funcionam dentro de um navegador. Eles fazem o trabalho no seu próprio computador: seus arquivos são abertos ali e nunca enviados para nós (veja [Para onde vão seus arquivos](common:your-files)).

## Qual navegador

Use uma versão atualizada de um destes:

| Navegador | Mecanismo | Observações |
|---|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium | O mais completo: seleção de pastas, salvamento para uso offline, tratamento de arquivos. |
| Firefox | Gecko | Funciona. Abrir uma pasta inteira usa um seletor mais simples. O salvamento offline pode não funcionar em janelas privadas. |
| Safari | WebKit | Funciona no Mac e no iPad. Abrir uma pasta inteira usa um seletor mais simples. O Safari pode apagar uma cópia offline que você não usa há algumas semanas. |

Os três mecanismos servem para o trabalho do dia a dia. Quando um app faz algo de forma diferente em um deles, a ajuda mostra os passos para o seu navegador.

## O que muda entre navegadores

- **Abrir uma pasta.** Os navegadores Chromium mostram um seletor de pastas de verdade e podem ler a pasta diretamente. O Firefox e o Safari pedem que você escolha uma pasta e depois leem todos os arquivos dela, o que demora mais para pastas de projeto grandes; arrastar a pasta para o app funciona nos três.
- **Salvar.** Os apps salvam baixando um arquivo. O seu navegador decide para onde vão os downloads e se pergunta antes.

:::chromium
No Chrome ou no Edge, ative "Perguntar onde salvar cada arquivo antes de fazer download" (em Configurações, em Downloads) para escolher uma pasta toda vez.
:::

:::firefox
No Firefox, abra Configurações, depois Geral, depois Downloads, e escolha "Sempre perguntar onde salvar os arquivos" para escolher uma pasta toda vez.
:::

:::safari
No Safari, abra Ajustes, depois Geral, e defina "Local de download de arquivos" como "Perguntar para cada download" para escolher uma pasta toda vez.
:::

## Mac, Windows e Linux

Os apps são iguais em todos os computadores. O que muda é o teclado: os atalhos são escritos automaticamente para o seu computador. Veja [Teclas, mouses e trackpads](common:keys).

## Tablets e telas sensíveis ao toque

Alguns apps aceitam toque (um dedo desenha ou seleciona, dois dedos fazem pinça para zoom e pan). A ajuda de cada app diz se aceita. No iPad, use o Safari ou o Chrome. Um teclado ajuda nos apps que usam comandos digitados.

## O navegador e o sistema mais antigos

Lemos estes dados do código dos apps 0.7, não de um palpite: cada arquivo foi analisado e cada recurso da linguagem que ele usa foi consultado nos dados de compatibilidade publicados dos navegadores. Abaixo destas versões os apps nem conseguem iniciar, porque o navegador não entende o código.

| | Versão mais antiga que consegue iniciar os apps |
|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium 94 |
| Firefox | 93 |
| Safari (Mac, iPad, iPhone) | 16.4 (macOS 13.3, iPadOS e iOS 16.4) |

O CadCraft Studio traz seu próprio mecanismo web no Windows, então precisa do Windows 10 ou 11; no Mac ele usa o do sistema, então precisa do macOS 13.3 ou posterior. Configurações › Atualizações no Studio mostra em que sua cópia roda.

Esta é a versão mais antiga que *inicia*, lida do código. Não é uma lista de navegadores antigos em que executamos os apps, então um navegador mais antigo que inicie ainda pode não ter algum recurso.

## O que seu computador precisa ter

Estes são mínimos planejados para os apps, não requisitos medidos:

- 8 GB de memória (16 GB são recomendados para modelos federados grandes).
- Um chip gráfico com WebGL 2 para os apps 3D. Se uma vista 3D continua em branco, verifique se a aceleração de hardware está ativada nas configurações do navegador.
- Uma tela com pelo menos 1280 pixels de largura para as barras de ferramentas completas; telas menores as quebram em linhas.

Arquivos muito grandes (conjuntos de plantas grandes, modelos grandes) usam muita memória em uma guia do navegador. Feche outras guias pesadas se um app ficar lento.
