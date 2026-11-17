---
title: Organizar um layout próprio e guardar as suas configurações
summary: Escolher que painel mostra o navegador de projeto, as Propriedades ou o conteúdo próprio do painel, onde fica a caixa de ferramentas e o que contêm as barras, guardar o layout como próprio e guardar configurações completas com um nome para alternar entre elas.
keywords: layout, ambiente de trabalho, organizar, personalizar, meu layout, layout próprio, painéis, editores, navegador de projeto, propriedades, caixa de ferramentas, barra rápida, caixa de informação, ambiente de trabalho, configuração, perfil, guardar configuração, alternar configuração, exportar configuração, importar configuração, ccenv
from: 6af528e0
---

Para além dos três layouts incorporados, pode organizar um próprio e guardar toda a configuração com um nome, para voltar a ela num único passo.

## Organizar um layout próprio

1. Abra {{ui:Definições}} (a engrenagem, ou {{key:Mod+,}}), escolha {{ui:Global}} e, depois, {{ui:Esquema}}.
2. Escolha {{ui:Organizar a sua própria disposição…}}. A caixa de diálogo parte do layout que usa agora.
3. Dê-lhe um nome e, depois, escolha:
   - **Sobre o desenho:** a barra de ferramentas da aplicação, um friso ou nenhum; uma barra de título; uma caixa de informação e os controlos que contém.
   - **Ao lado do desenho:** a caixa de ferramentas à esquerda, à direita ou em nenhum lado, com ou sem {{ui:As minhas ferramentas}}; que painel contém as paletas, qual fica por cima (o navegador de projeto ou as Propriedades, por exemplo), e quais são separadores por baixo dele.
   - **A área do desenho:** separadores de vistas, uma barra rápida e uma barra de vista com os controlos que marcar, a paleta de edição e uma barra de estado.
   - **Aspeto:** tamanho, contornos dos botões e estilo dos separadores.
4. Escolha {{ui:Utilizar esta disposição}}. A aplicação muda para ele de imediato, e todas as aplicações que têm layouts também o usam.

Só se oferece o que esta aplicação tem. O seu layout aparece em {{ui:De suplementos e ficheiros}}; {{ui:Exportar esta disposição}} guarda-o como um ficheiro que pode dar a um colega, e o botão de remover retira-o. Os painéis que ele ocupa continuam a ancorar, flutuar e mover-se para janelas próprias, como em [Organizar os painéis](common:arrange-panels).

## Guardar a sua configuração como ambiente de trabalho

Um ambiente de trabalho é a sua configuração completa para todas as aplicações neste navegador: o layout, o estilo dos menus e as suas teclas, o estilo da barra de ferramentas, os painéis e os respetivos tamanhos, e {{ui:As minhas ferramentas}}. O tema e a língua não fazem parte dele.

- **Guardar:** escreva um nome em {{ui:Ambientes de trabalho}} e escolha {{ui:Guardar a minha configuração}}. Guardar com um nome que já existe substitui essa configuração.
- **Alternar:** escolha uma configuração na lista e escolha {{ui:Mudar para ela}}. A aplicação recarrega-se nessa configuração; se tiver alterações não guardadas, a aplicação pergunta primeiro, como faz em qualquer recarregamento.
- **Partilhar:** {{ui:Exportar}} guarda a configuração escolhida como um ficheiro `.ccenv.json`; {{ui:Importar uma configuração…}} acrescenta uma a partir de um ficheiro. Um ficheiro define apenas estas opções, e mais nada.
- **Remover:** escolha uma configuração e escolha {{ui:Remover}}.

Pode guardar até doze configurações.

Para mudar um layout sem abrir a caixa de diálogo (arrastar um bloco, clicar com o botão direito numa ferramenta), veja [Alterar um layout no ecrã](common:layout-edit). Para experimentar primeiro as disposições incorporadas, veja [o layout da caixa de ferramentas e da caixa de informação](common:layout-toolbox), [o layout do friso e do navegador de projeto](common:layout-ribbon) e [o layout Desenho](common:layout-drafting).
