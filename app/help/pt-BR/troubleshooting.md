---
title: Solução de problemas
summary: Sintomas, causas e correções para os problemas que as pessoas encontram no CivilCraft, com as mensagens exatas que o aplicativo mostra.
keywords: problemas, erros, não funciona, correção, ajuda, mensagens, solucionar, recusado, ausente, errado, trocado, curvas de nível ausentes
from: a9f7dedc
---

As mensagens aparecem na barra de status no canto inferior direito, em caixas nos painéis esquerdo e direito e nas caixas de diálogo. Elas são citadas aqui como o aplicativo as mostra.

## Abrindo arquivos

**"Este arquivo tem mais de 200 MB; o CivilCraft ainda não abre arquivos desse tamanho."**
Divida o arquivo de pontos, ou reduza os dados antes de abri-lo.

**"Não foi possível abrir site.json: Este não é um arquivo de projeto do CivilCraft."**
O arquivo termina em `.json` ou começa com `{`, mas não é um projeto do CivilCraft. Arquivos de pontos não podem começar com `{`.

**"Não foi possível abrir … Este arquivo de projeto é de um CivilCraft mais novo (versão 2)."**
O projeto foi salvo por uma versão mais recente. Abra-o lá, ou exporte o LandXML dele.

**"Não foi possível abrir … Isto é XML, mas não LandXML (o elemento raiz é <…>)."**
O arquivo é outro tipo de XML. Exporte o LandXML do outro programa.

**"… não tem pontos, superfícies TIN nem alinhamentos que o CivilCraft possa ler."**
Tudo no arquivo é algo que o CivilCraft ignora (por exemplo, apenas superfícies em grade, ou apenas alinhamentos em espiral). O restante da mensagem diz o que havia. Veja [LandXML: o que é lido e gravado](topic:landxml-reference).

**"Não foi possível carregar o exemplo: …"**
{{ui:Abrir o site de exemplo}} lê um arquivo do site do CadCraft. Sem conexão, ele só funciona se o CivilCraft tiver sido salvo para uso offline (o botão na barra do aplicativo mostra {{ui:Pronto para uso offline}}). Conecte-se, clique em {{ui:Salvar para uso offline}} e, daí em diante, ele funciona offline. Veja [Offline](common:offline).

**{{ui:Salvar para uso offline}} mostra {{ui:Não foi possível salvar}}.**
Alguns arquivos não foram baixados. Verifique a conexão e clique no botão de novo.

**{{ui:Salvar para uso offline}} mostra {{ui:Offline indisponível}}.**
Esta janela do navegador não pode manter uma cópia offline, geralmente porque é uma janela privada ou o computador é gerenciado. Abra o CivilCraft em uma janela normal.

**Offline, o aplicativo não abre de jeito nenhum.**
Ele não foi salvo para uso offline neste navegador, ou o navegador limpou os dados do site (o Safari faz isso com sites não visitados por várias semanas). Conecte-se, abra o CivilCraft e clique em {{ui:Salvar para uso offline}}.

**A cópia offline é de uma versão anterior.**
Clique em {{ui:Pronto para uso offline}} e depois em {{ui:Salvar de novo (obter a versão mais recente)}} estando online.

**Um arquivo aparece esmaecido na caixa de abertura.**
A caixa lista apenas arquivos de pontos, LandXML e de projeto, pela extensão. Arraste o arquivo para a planta, ou renomeie-o para `.txt`.

## Importando pontos

**"Não foi possível ler nenhum ponto deste arquivo."**
Escolha a ordem das colunas em **Colunas** manualmente. Se nada funcionar, abra o arquivo em um editor de texto e confira se há um ponto por linha, com números.

**O terreno parece espelhado, girado ou esticado em uma linha.**
Norte e Leste estão trocados. O resumo dizia "estimado pelo número de colunas". Escolha PENZD em vez de PNEZD (ou o contrário) em **Colunas**, ou importe de novo.

**Pontos muito distantes dos demais, e a planta com zoom afastado até virar um ponto.**
Uma linha tem erro de digitação em uma coordenada, ou o arquivo mistura sistemas de coordenadas. Encontre o ponto (clique nele para ver o número) e corrija o arquivo.

**Linhas listadas em "Linhas não lidas".**
Veja a tabela em [Importar pontos de levantamento](topic:import-points#rows-that-are-not-read).

**Meus pontos antigos sumiram.**
Importar um arquivo de pontos substitui todos os pontos e limpa o desfazer. Abra seu projeto salvo para recuperá-los.

## A superfície

**"Superfície: não construída" com uma caixa vermelha.**
A caixa diz o motivo: "Uma superfície precisa de pelo menos três pontos com cotas.", "Os pontos estão todos na mesma linha: sem triângulos.", "Nenhum ponto com cotas.", "O contorno não se sobrepõe aos pontos." ou "Nenhum triângulo restou dentro do contorno." Confira a ordem das colunas, os grupos de pontos (estão em {{ui:Deixado de fora}}?) e o contorno.

**Curvas de nível cortam em linha reta uma vala ou uma crista.**
Essa linha não é uma linha de quebra. Defina o grupo dela como {{ui:Linha de quebra}}, ou desenhe-a com a ferramenta {{ui:Linha de quebra}}. Veja [Construir e refinar a superfície](topic:build-surface).

**Um grupo de linha de quebra desenha um zigue-zague.**
O grupo tem mais de uma linha, ou os pontos dele não estão numerados ao longo da linha. Defina o grupo de volta como {{ui:Pontos}} e desenhe cada linha com a ferramenta {{ui:Linha de quebra}}.

**Triângulos longos e finos ao longo da parte externa.**
Desenhe um contorno ({{key:O}}) ou defina **Maior aresta externa**.

**Nenhuma curva de nível, embora a superfície esteja construída.**
Ou {{ui:Curvas de nível}} está desligado em **Exibição**, ou o intervalo é tão pequeno que haveria mais de 2,000 níveis de curva. Escolha um intervalo maior.

**Linhas de quebra ou um contorno não mudam nada.**
A superfície veio de LandXML ("Superfície (de LandXML)"). Ela é usada como está. Clique em {{ui:Reconstruir a superfície a partir dos pontos}} para construí-la a partir dos pontos.

**"Ainda não há superfície: primeiro abra os pontos de levantamento."**
Linha de quebra, contorno e plataforma precisam de uma superfície de terreno existente. Importe os pontos primeiro.

**"Clique em um ponto de levantamento com cota: uma linha de quebra usa as cotas dos pontos."**
A ferramenta {{ui:Linha de quebra}} só escolhe pontos de levantamento. Dê zoom e clique em um ponto (um quadrado laranja mostra o que ela vai pegar).

## Desenho

**Meu último ponto sumiu quando dei duplo clique para concluir.**
Nesta versão, o duplo clique conclui o alinhamento, a plataforma, a linha de quebra ou o contorno, mas descarta o ponto em que você deu duplo clique. Clique uma vez no último ponto e pressione {{key:Enter}}. Use {{key:Mod+Z}} se isso já aconteceu e depois desenhe de novo.

**Não consigo concluir um desenho em um tablet.**
Concluir precisa de {{key:Enter}}; ainda não há botão na tela. Conecte um teclado. Veja [Mouse, trackpad e toque](topic:keyboard#mouse-trackpad-and-touch).

**Arrastar para posicionar um ponto faz pan.**
Um arrasto de mais de alguns pixels faz pan na planta em todas as ferramentas. Clique sem mover.

**"Um alinhamento precisa de pelo menos dois pontos." / "Uma plataforma precisa de pelo menos três cantos." / "Um trecho de tubulação precisa de pelo menos duas estruturas."**
Você pressionou {{key:Enter}} cedo demais. O desenho é descartado; comece de novo.

**Teclas como A ou G não fazem nada.**
Uma caixa de texto ou uma lista em um painel ainda tem o foco, então as letras vão para ela. Clique uma vez na planta e depois pressione a tecla. No Mac, a tecla apagar é Backspace para o navegador: use Fn e Delete para excluir uma seleção.

## Alinhamentos e perfis

**"As curvas nos PI 2 e PI 3 se sobrepõem: … Use raios menores."**
Duas curvas precisam de mais tangente do que há entre os PIs delas. Reduza um ou os dois raios na tabela de PIs, ou afaste os PIs.

**"O PI 3 retorna em linha reta; ele não pode receber uma curva."**
O alinhamento volta sobre si mesmo nesse PI. Mova ou remova o PI.

**"Este alinhamento não tem terreno abaixo dele para começar."**
O alinhamento está fora da superfície. Mova-o para cima da superfície, ou adicione PIVs clicando com {{ui:Adicionar PIVs}} ativado.

**"A curva vertical no PIV 3 (L = …) começa antes de a curva ou o PIV anterior terminar." / "… ultrapassa o próximo PIV."**
Reduza o comprimento da curva ou afaste os PIVs.

**"Já existe um PIV em …"**
Há um PIV naquela estação. Clique em outro lugar, ou arraste o existente.

**A vista de perfil está vazia: "Desenhe um alinhamento para ver o perfil dele."**
Não há alinhamento, ou o selecionado tem erros.

## Corredores e plataformas

**"O corredor precisa de um perfil de projeto sem erros."**
Comece um perfil de projeto ({{ui:Começar do terreno}}) e corrija as sobreposições de curvas.

**"… os taludes saem da superfície antes de encontrar o terreno." / "… as linhas de talude saem da superfície antes de encontrá-lo …"**
A terraplenagem chega à borda da superfície antes de encontrar o terreno. Afaste o projeto da borda, ou aproxime-o do terreno. Uma nova plataforma desenhada parcialmente fora da superfície pode começar na cota 0: digite uma cota real.

**"As linhas de pé de talude do corredor se cruzam …" / "A linha de pé de talude cruza a si mesma …"**
Taludes de lados diferentes se encontram: curvas fechadas, plataformas estreitas, cortes profundos ou aterros altos. Use um raio maior, uma seção-tipo mais estreita, uma plataforma mais larga ou taludes mais íngremes.

**"Ainda não há volumes: uma plataforma precisa ser terraplenada sem problemas."**
Corrija os problemas listados na caixa vermelha acima.

**{{ui:Projetado (terraplenado)}} está esmaecido.**
Nenhuma plataforma ou corredor foi terraplenado ainda.

## Tubulações

**"P2 ainda não tem cotas de fundo."**
Clique em {{ui:Definir suas cotas de fundo pelas regras}} ou digite as cotas de fundo.

**"P1: não há terreno em S1 para começar."**
A estrutura de montante está fora da superfície e não tem cota de tampa. Digite a cota da tampa dela.

**Todo tubo é sinalizado depois que movi uma estrutura.**
Mover uma estrutura não altera as cotas de fundo. Clique em {{ui:Definir todas as cotas de fundo pelas regras}}.

Todas as mensagens da rede são explicadas em [Traçar uma rede de tubulação por gravidade](topic:pipe-network#read-and-fix-problems).

## Salvando e exportando

**"Nada para exportar ainda." / "Nada para plotar ainda."**
O projeto está vazio. Importe os pontos primeiro.

**Não encontro o arquivo salvo.**
Ele está nos downloads do navegador (geralmente a pasta Downloads). Veja [Arquivos que você pode abrir, salvar e exportar](topic:files#where-the-files-go).

**A escala do PDF está errada no papel.**
Imprima em 100% ou em tamanho real, não em "ajustar à página".

**Pontos de interrogação no texto do PDF.**
Nomes ou descrições usam caracteres fora do conjunto da Europa Ocidental. A mensagem de status os conta. Renomeie usando caracteres simples.

**A plotagem é cortada nas bordas.**
A escala é grande demais para a folha. Escolha a escala marcada "(cabe)", uma folha maior, ou {{ui:O que está na tela}}.

**{{key:Mod+P}} abriu a caixa de impressão do navegador.**
A página não tinha o foco. Feche a caixa, clique na planta e pressione {{key:Mod+P}} de novo, ou clique em {{ui:PDF}}.

## O aplicativo em si

**A tela está em branco ou a barra de ferramentas não faz nada.**
Use uma versão atual do Chrome, Edge, Firefox ou Safari, e recarregue a página. Veja [Navegadores](common:browsers).

**O aplicativo fica lento com um arquivo grande de pontos.**
Desligue {{ui:Triângulos}}, {{ui:Rótulos dos pontos}} e {{ui:Faixas de elevação}}, e use um intervalo de curvas de nível maior. Superfícies muito grandes levam um momento para reconstruir após cada alteração.

**O navegador pergunta "Sair do site?"**
O projeto tem alterações não salvas. Fique, salve com {{key:Mod+S}} e depois saia.
