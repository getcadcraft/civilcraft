---
title: Trabalhe no layout de caixa de ferramentas e caixa de informações
summary: Mude o aplicativo para uma coluna de ferramentas à esquerda, com espaços para as suas, uma caixa de informações no topo que acompanha a ferramenta em uso ou o que você selecionou, um navegador à direita, uma guia para cada vista, opções rápidas e uma paleta de edição, e volte ao layout clássico quando quiser.
keywords: layout, área de trabalho, caixa de ferramentas, coluna de ferramentas, caixa de informações, barra de informações, navegador, mapa do projeto, barra rápida, opções rápidas, paleta de edição, minhas ferramentas, ferramentas favoritas, guias de vista, janela da caixa de ferramentas, layout clássico, mudar layout, alternar layout
from: ec341666
---

**Caixa de ferramentas e caixa de informações** é um dos três layouts de área de trabalho do aplicativo. As ferramentas de desenho ficam em uma coluna à esquerda, uma caixa de informações no topo mostra o que a ferramenta em uso precisa ou o que você selecionou, cada vista tem uma guia, e uma barra rápida sob o desenho reúne algumas opções do dia a dia. As ferramentas são as do próprio aplicativo: tudo o que você faz no layout clássico funciona aqui também, e o seu desenho, o estilo de menu e as suas teclas continuam como estavam.

## Escolher

1. Abra {{ui:Configurações}} (a engrenagem, ou {{key:Mod+,}}).
2. Escolha a guia {{ui:Global}} e vá para {{ui:Layout}} › {{ui:Área de trabalho}}.
3. Escolha {{ui:Caixa de ferramentas e caixa de informações}}.

O layout muda imediatamente. A escolha vale para todos os aplicativos neste navegador: cada aplicativo se abre nele a partir de então, e ele já está pronto antes de a página ser desenhada, então você nunca vê o layout clássico primeiro.

## O que fica onde

- **Barra de ferramentas:** a barra do próprio aplicativo continua no topo da área do desenho, com os seus menus.
- **Caixa de informações:** sob a barra de ferramentas. Enquanto uma ferramenta roda, ela mostra a ferramenta e o que ela pede. Quando você escolhe algo, mostra as principais configurações dele (para uma parede: o tipo, a espessura, o comprimento, a linha de localização e a altura), e você pode alterá-las ali mesmo: uma mudança ali é igual à feita em Propriedades, e {{key:Mod+Z}} a desfaz. Sem nada escolhido, mostra "Nada selecionado". Cada aplicativo acrescenta suas próprias caixas aqui, como a camada ou o nível atual, ou o documento aberto.
- **Caixa de ferramentas:** a coluna à esquerda, com as ferramentas do aplicativo em grupos. Clique no nome de um grupo para recolhê-lo ou abri-lo de novo. A ferramenta em execução fica acesa.
- **Minhas ferramentas:** o primeiro grupo da caixa de ferramentas, com oito espaços vazios para as ferramentas que você mais usa. Clique em um espaço vazio para escolher qualquer ferramenta ou comando do aplicativo; ou clique com o botão direito em uma ferramenta da caixa e escolha {{ui:Adicionar a Minhas ferramentas}}; ou arraste uma ferramenta até um espaço. Clique com o botão direito em um espaço para trocá-lo ou esvaziá-lo. Seus espaços são mantidos para cada aplicativo neste navegador.
- **Navegador:** o painel da direita. O navegador do projeto do aplicativo fica em cima (plantas, cortes, elevações, vistas 3D, tabelas, folhas, conforme o aplicativo tem): clique em um para abri-lo. Abaixo, {{ui:Propriedades}} e uma guia com o restante do conteúdo do painel da direita.
- **Guias de vista:** uma guia para cada vista do arquivo aberto (uma folha, uma planta, uma cena…), sobre o desenho.
- **Barra rápida:** sob o desenho, as configurações de vista e as opções do dia a dia que o aplicativo tem, como a escala, o nível de detalhe, o intervalo de vista, ajustar, planta, dividir ou 3D, snaps e unidades.
- **Paleta de edição:** clique em algo no desenho e uma pequena paleta aparece junto ao ponteiro com os comandos de edição do aplicativo para ele, como mover, copiar, girar, espelhar, duplicar ou apagar, e {{ui:Propriedades}}. {{key:Esc}}, a roda do mouse, outro clique ou o botão de fechar a fecham.

Uma ferramenta que não pode ser executada agora fica cinza, e sua dica diz o motivo. Clique nela, ou pressione {{key:Enter}} sobre ela, para ler o motivo em uma caixa.

{{key:Esc}} encerra antes a ferramenta em uso, como no layout clássico, e todos os atalhos e {{key:Ctrl+Shift+F}} (modos de tela) funcionam como antes.

## Dar à caixa de ferramentas uma janela própria

O botão {{ui:Mover a caixa de ferramentas}}, no topo da caixa de ferramentas, tem {{ui:Mover para uma nova janela}}: a caixa de ferramentas se abre em uma janela estreita própria, que você pode colocar ao lado do aplicativo ou em um segundo monitor. As teclas pressionadas ali chegam ao aplicativo. {{ui:Recolocar a caixa de ferramentas}}, ou fechar essa janela, a traz de volta.

As configurações da barra de ferramentas também valem para a caixa de ferramentas: {{ui:Configurações}} › {{ui:Global}} › {{ui:Barra de ferramentas}} › {{ui:Ícones e rótulos}}, {{ui:Somente ícones}} ou {{ui:Somente rótulos}}, e {{ui:Mostrar nomes dos grupos (Arquivo, Desenhar, …)}}.

## Seus painéis continuam seus

Os painéis da esquerda e da direita mantêm tudo o que está descrito em [Organize os painéis](common:arrange-panels): acoplar, flutuar, fixar, ocultar, guias, {{ui:Mover para uma nova janela}} e {{ui:Redefinir layout}}.

## Voltar ao layout clássico

Abra {{ui:Configurações}} › {{ui:Global}} › {{ui:Layout}} › {{ui:Área de trabalho}} e escolha {{ui:CadCraft clássico}}. Cada barra de ferramentas, guia e painel volta ao lugar onde estava.

:::note
Em um celular, ou em uma janela de 760 pixels de largura ou menos, o aplicativo usa o layout de celular, seja qual for a sua escolha. Uma janela mais larga restaura o seu layout.
:::

Para testar outro arranjo, veja [o layout da faixa de opções e do navegador do projeto](common:layout-ribbon).

Para mudar o que este layout mostra, veja [Alterar um layout na tela](common:layout-edit); para um arranjo escuro, com barra de menus e faixa de opções, veja [o layout Desenho](common:layout-drafting).
