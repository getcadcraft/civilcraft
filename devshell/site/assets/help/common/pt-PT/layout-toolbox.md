---
title: Trabalhar com o layout de caixa de ferramentas e caixa de informação
summary: Mudar a aplicação para uma coluna de ferramentas à esquerda, com lugares para as suas próprias, uma caixa de informação no topo que segue a ferramenta em curso ou o que escolheu, um navegador à direita, um separador para cada vista, opções rápidas e uma paleta de edição, e voltar ao layout clássico sempre que quiser.
keywords: layout, ambiente de trabalho, caixa de ferramentas, coluna de ferramentas, caixa de informação, barra de informação, navegador, mapa do projeto, barra rápida, opções rápidas, paleta de edição, paleta rápida, as minhas ferramentas, ferramentas favoritas, separadores de vistas, janela da caixa de ferramentas, layout clássico, mudar layout, alternar layout
from: ec341666
---

**Caixa de ferramentas e caixa de informação** é um dos três layouts de área de trabalho da aplicação. As ferramentas de desenho ficam numa coluna à esquerda, uma caixa de informação no topo mostra o que a ferramenta em curso exige ou o que selecionou, cada vista tem um separador, e uma barra rápida sob o desenho reúne algumas opções do dia a dia. As ferramentas são as da própria aplicação: tudo o que pode fazer no layout clássico funciona também aqui, e o seu desenho, o seu estilo de menus e as suas teclas mantêm-se como estão.

## Escolher este layout

1. Abra {{ui:Definições}} (a engrenagem, ou {{key:Mod+,}}).
2. Escolha o separador {{ui:Global}} e vá a {{ui:Esquema}} › {{ui:Área de trabalho}}.
3. Escolha {{ui:Caixa de ferramentas e caixa de informação}}.

O layout muda de imediato. A escolha vale para todas as aplicações neste navegador: cada aplicação abre com ele a partir de então, e fica em vigor antes de a página ser desenhada, pelo que o layout clássico nunca aparece primeiro.

## O que está onde

- **Barra de ferramentas:** a barra de ferramentas da própria aplicação mantém-se no topo da área do desenho, com os seus menus.
- **Caixa de informação:** por baixo da barra de ferramentas. Enquanto uma ferramenta corre, mostra a ferramenta e o que pede. Quando escolhe algo, mostra as suas definições principais (para uma parede: o tipo, a espessura, o comprimento, a linha de localização e a altura), e pode alterá-las ali mesmo: uma alteração feita aí é igual à das Propriedades, e {{key:Mod+Z}} anula-a. Sem nada escolhido, indica « Nada selecionado ». Cada aplicação acrescenta aqui as suas próprias caixas, como a camada atual ou o nível atual, ou o documento aberto.
- **Caixa de ferramentas:** a coluna da esquerda, com as ferramentas da aplicação em grupos. Clique no nome de um grupo para o recolher ou o abrir de novo. A ferramenta em curso fica acesa.
- **As minhas ferramentas:** o primeiro grupo da caixa de ferramentas, com oito lugares vazios para as ferramentas mais usadas. Clique num lugar vazio para escolher qualquer ferramenta ou comando da aplicação; ou clique com o botão direito numa ferramenta da caixa de ferramentas e escolha {{ui:Adicionar a As minhas ferramentas}}; ou arraste uma ferramenta para um lugar. Clique com o botão direito num lugar para o alterar ou o esvaziar. Os lugares ficam guardados para cada aplicação neste navegador.
- **Navegador:** o painel da direita. O navegador de projeto da aplicação fica em cima (plantas, cortes, alçados, vistas 3D, mapas e folhas, conforme a aplicação os tenha): clique num para o abrir. Por baixo, {{ui:Propriedades}} e um separador com os restantes conteúdos do painel da direita.
- **Separadores de vistas:** um separador para cada vista do ficheiro aberto (uma folha, uma planta, uma cena…), sobre o desenho.
- **Barra rápida:** sob o desenho, as definições de vista e as opções do dia a dia que a aplicação tem, como a escala, o nível de detalhe, o intervalo de vista, ajustar, planta, dividir ou 3D, snaps e unidades.
- **Paleta de edição:** clique em algo no desenho e surge junto ao cursor uma pequena paleta com os comandos de edição da aplicação para esse objeto, como mover, copiar, rodar, espelhar, duplicar ou eliminar, e {{ui:Propriedades}}. {{key:Esc}}, a roda do rato, outro clique ou o respetivo botão de fechar fazem-na recolher.

Uma ferramenta que não pode ser executada neste momento fica a cinzento, e a sua dica indica porquê. Clique nela, ou prima {{key:Enter}} sobre ela, para ler o motivo numa caixa.

{{key:Esc}} termina primeiro a ferramenta em curso, como no layout clássico, e todos os atalhos e {{key:Ctrl+Shift+F}} (modos de ecrã) funcionam como antes.

## Dar à caixa de ferramentas uma janela própria

O botão {{ui:Mover a caixa de ferramentas}} no topo da caixa de ferramentas tem {{ui:Mover para uma nova janela}}: a caixa de ferramentas abre numa janela estreita própria, que pode colocar ao lado da aplicação ou num segundo monitor. As teclas premidas aí chegam à aplicação. {{ui:Repor a caixa de ferramentas}}, ou fechar essa janela, traz a caixa de volta.

As definições da barra de ferramentas aplicam-se também à caixa de ferramentas: {{ui:Definições}} › {{ui:Global}} › {{ui:Barra de ferramentas}} › {{ui:Ícones e etiquetas}}, {{ui:Só ícones}} ou {{ui:Só etiquetas}}, e {{ui:Mostrar os nomes dos grupos (Ficheiro, Desenhar, …)}}.

## Os painéis mantêm as suas funções

Os painéis da esquerda e da direita mantêm tudo o que está descrito em [Organizar os painéis](common:arrange-panels): ancorar, flutuar, fixar, ocultar, separadores, {{ui:Mover para uma nova janela}} e {{ui:Repor esquema}}.

## Voltar ao layout clássico

Abra {{ui:Definições}} › {{ui:Global}} › {{ui:Esquema}} › {{ui:Área de trabalho}} e escolha {{ui:CadCraft clássico}}. Cada barra de ferramentas, separador e painel volta ao sítio onde estava.

:::note
Num telemóvel, ou numa janela com 760 pixels de largura ou menos, a aplicação usa o layout de telemóvel, seja qual for a escolha. Uma janela mais larga repõe o seu layout.
:::

Para experimentar outra disposição, veja [o layout do friso e do navegador de projeto](common:layout-ribbon).

Para mudar o que este layout mostra, veja [Alterar um layout no ecrã](common:layout-edit); para uma disposição escura, com barra de menus e friso, veja [o layout Desenho](common:layout-drafting).
