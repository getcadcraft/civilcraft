---
title: Trabalhar no layout de caixa de ferramentas e caixa de informações
summary: Mude o app para uma coluna de ferramentas à esquerda com espaços para as suas, uma caixa de informações no alto que acompanha a ferramenta em execução ou o que você escolheu, um navegador à direita, uma guia para cada vista, opções rápidas e uma paleta de edição, e volte ao layout clássico quando quiser.
keywords: layout, área de trabalho, caixa de ferramentas, coluna de ferramentas, caixa de informações, barra de informações, navegador, mapa do projeto, barra rápida, opções rápidas, paleta de edição, paleta de acesso, minhas ferramentas, ferramentas favoritas, guias de vista, janela da caixa de ferramentas, layout clássico, mudar layout, alternar layout
from: 2f807c9c
---

**Caixa de ferramentas e caixa de informações** é um dos três layouts de área de trabalho do app. As ferramentas de desenho ficam em uma coluna à esquerda, uma caixa de informações no alto mostra o que a ferramenta em execução precisa ou o que você selecionou, cada vista tem uma guia e uma barra rápida sob o desenho reúne algumas opções do dia a dia. As ferramentas são as do próprio app: tudo o que você faz no layout clássico funciona aqui também, e seu desenho, seu estilo de menu e suas teclas continuam como estão.

## Escolher o layout

1. Abra {{ui:Configurações}} (a engrenagem, ou {{key:Mod+,}}).
2. Escolha a guia {{ui:Global}} e vá a {{ui:Layout}} › {{ui:Área de trabalho}}.
3. Escolha {{ui:Caixa de ferramentas e caixa de informações}}.

O layout muda na hora. A escolha vale para todos os apps neste navegador: cada app passa a abrir nele, e ele já está no lugar antes de a página ser desenhada, então você nunca vê o layout clássico primeiro.

## O que fica onde

- **Barra de ferramentas:** a barra de ferramentas do próprio app continua no alto da área de desenho, com seus menus.
- **Caixa de informações:** sob a barra de ferramentas. Enquanto uma ferramenta é executada, mostra a ferramenta e o que ela pede. Quando você escolhe algo, mostra suas principais configurações (para uma parede: tipo, espessura, comprimento, linha de localização e altura), e você pode alterá-las ali mesmo: uma alteração ali é igual a uma em Propriedades, e {{key:Mod+Z}} a desfaz. Sem nada escolhido, diz "Nada selecionado". Cada app acrescenta aqui suas próprias caixas, como a camada ou o nível atual, ou o documento aberto.
- **Caixa de ferramentas:** a coluna à esquerda, com as ferramentas do app em grupos. Clique no nome de um grupo para recolhê-lo ou abri-lo de novo. A ferramenta em execução fica acesa.
- **Minhas ferramentas:** o primeiro grupo da caixa de ferramentas, oito espaços vazios para as ferramentas que você mais usa. Clique em um espaço vazio para escolher qualquer ferramenta ou comando do app; ou clique com o botão direito em uma ferramenta da caixa e escolha {{ui:Adicionar a Minhas ferramentas}}; ou arraste uma ferramenta para um espaço. Clique com o botão direito em um espaço para alterá-lo ou esvaziá-lo. Seus espaços são guardados por app neste navegador.
- **Navegador:** o painel da direita. O navegador do projeto do app fica em cima (plantas, cortes, elevações, vistas 3D, tabelas, folhas, conforme o app tem): clique em um para abri-lo. Embaixo, {{ui:Propriedades}} e uma guia com os demais conteúdos do painel da direita.
- **Guias de vista:** uma guia para cada vista do arquivo aberto (uma folha, uma planta, uma cena…), sobre o desenho.
- **Barra rápida:** sob o desenho, as configurações de vista e as opções do dia a dia que o app tem, como a escala, o nível de detalhe, o alcance da vista, ajustar, planta, dividir ou 3D, snaps e unidades.
- **Paleta de edição:** clique em algo no desenho e uma pequena paleta aparece junto ao ponteiro com os comandos de edição do app para esse item, como mover, copiar, girar, espelhar, duplicar ou excluir, e {{ui:Propriedades}}. {{key:Esc}}, a roda do mouse, outro clique ou seu botão de fechar a guardam.

Uma ferramenta que não pode ser executada agora fica esmaecida, e sua dica explica por quê. Clique nela, ou pressione {{key:Enter}} sobre ela, para ler o motivo em uma caixa.

{{key:Esc}} encerra primeiro a ferramenta em execução, como no layout clássico, e todos os atalhos e {{key:Ctrl+Shift+F}} (modos de tela) funcionam como antes.

## Dar à caixa de ferramentas uma janela própria

O botão {{ui:Mover a caixa de ferramentas}} no alto da caixa de ferramentas tem {{ui:Mover para uma nova janela}}: a caixa de ferramentas abre em uma janela estreita própria que você pode colocar ao lado do app ou em um segundo monitor. As teclas pressionadas ali chegam ao app. {{ui:Recolocar a caixa de ferramentas}}, ou fechar essa janela, a traz de volta.

As configurações da barra de ferramentas valem também para a caixa de ferramentas: {{ui:Configurações}} › {{ui:Global}} › {{ui:Barra de ferramentas}} › {{ui:Ícones e rótulos}}, {{ui:Somente ícones}} ou {{ui:Somente rótulos}}, e {{ui:Mostrar nomes dos grupos (Arquivo, Desenhar, …)}}.

## Seus painéis continuam seus

Os painéis da esquerda e da direita mantêm tudo o que está descrito em [Organizar os painéis](common:arrange-panels): acoplar, flutuar, fixar, ocultar, guias, {{ui:Mover para uma nova janela}} e {{ui:Redefinir layout}}.

## Voltar ao layout clássico

Abra {{ui:Configurações}} › {{ui:Global}} › {{ui:Layout}} › {{ui:Área de trabalho}} e escolha {{ui:CadCraft clássico}}. Cada barra de ferramentas, guia e painel volta ao lugar onde estava.

:::note
Em um celular, ou em uma janela de 760 pixels de largura ou menos, o app usa seu layout de celular, qualquer que seja a sua escolha. Uma janela mais larga traz de volta o seu layout.
:::

Para experimentar outro arranjo, veja [o layout de faixa de opções e navegador do projeto](common:layout-ribbon).
