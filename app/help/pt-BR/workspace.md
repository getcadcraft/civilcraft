---
title: A tela, parte por parte
summary: Um passeio por cada barra e painel do CivilCraft pelo nome que aparece na tela, da barra de ferramentas à barra de status.
keywords: interface, tela, barra de ferramentas, painéis, propriedades, barra de status, vista de perfil, layout, passeio, ui
from: 76272010
---

O CivilCraft tem uma única tela. Não há guias nem layouts. Os painéis laterais podem ser movidos, flutuar ou ir para uma janela própria: veja [Organize os painéis e use um segundo monitor](common:arrange-panels). De cima para baixo e da esquerda para a direita:

- a **barra do aplicativo** (marca CadCraft, nome do aplicativo, versão, Sobre, modo de tela, Ajuda, Salvar para uso offline, Papel e Modelo)
- a **barra de ferramentas** com sete grupos de botões
- o **painel esquerdo**: Implantação, Pontos, Superfície, Exibição e, depois que você importar algumas, Camadas GIS
- a **planta** no meio, com a **vista de perfil** embaixo dela quando está aberta
- o **painel direito**: Propriedades do que está selecionado
- a **barra de status** ao longo da parte de baixo

## Barra do aplicativo

A barra fina no alto da tela pertence ao site do CadCraft, não ao CivilCraft em si.

- O menu de versão mostra qual versão você está executando.
- {{ui:Sobre o CivilCraft}} abre a página do aplicativo no site.
- {{ui:Tela cheia}} percorre os modos de tela: tela cheia, depois tela cheia com as barras ocultas, depois de volta ao normal. {{key:Ctrl+Shift+F}} faz o mesmo em todas as plataformas, inclusive no Mac (lá é a tecla Control, não Command). Com as barras ocultas, leve o ponteiro à borda de cima para trazê-las de volta.
- {{ui:Ajuda}} (ou {{key:F1}}) abre esta ajuda em um painel lateral; {{key:F1}} ou {{key:Esc}} a fecha.
- {{ui:Salvar para uso offline}} guarda o CivilCraft neste navegador para que ele abra sem conexão; depois ele mostra {{ui:Pronto para uso offline}}. Veja [Arquivos que você pode abrir, salvar e exportar](topic:files#online-and-offline).
- {{ui:Papel}} e {{ui:Modelo}} alternam entre um tema claro e um escuro. A planta e o perfil seguem o tema; os PDFs são sempre impressos em branco.

## Barra de ferramentas

Cada grupo tem um pequeno rótulo acima de seus botões. Passe o ponteiro sobre um botão para ver a dica e a tecla.

| Grupo | Botões | O que fazem |
|---|---|---|
| Arquivo | {{ui:Novo}}, {{ui:Abrir}}, {{ui:Salvar}} | Recomeçar, abrir um arquivo de pontos, LandXML ou projeto, salvar o projeto como download |
| Exportar | {{ui:LandXML}}, {{ui:DXF}}, {{ui:DWG}}, {{ui:PDF}} | Gravar LandXML 1.2, um DXF R12 ou um DWG da planta, ou plotar a planta em PDF |
| Superfície | {{ui:Linha de quebra}}, {{ui:Limite}} | Desenhar uma linha de quebra por pontos de levantamento; desenhar o limite externo |
| Projeto | {{ui:Alinhamento}}, {{ui:Plataforma}}, {{ui:Tubos}}, {{ui:Perfil}} | Desenhar um alinhamento, uma plataforma, um trecho de tubos; mostrar ou ocultar a vista de perfil |
| Editar | {{ui:Desfazer}}, {{ui:Refazer}}, {{ui:Copiar}}, {{ui:Colar}}, {{ui:Mais}} | Desfazer, refazer, copiar e colar pontos de levantamento; {{ui:Mais}} contém Recortar, Colar no mesmo local, Duplicar, Excluir, Selecionar todos os pontos e Limpar seleção |
| GIS | {{ui:Coordenadas}}, {{ui:Importar}}, {{ui:Exportar}}, {{ui:Mapa}} | Definir o sistema de coordenadas, importar e exportar arquivos GIS, mostrar camadas de mapa sob a planta |
| Exibir | {{ui:Selecionar}}, {{ui:Ajustar}}, {{ui:3D}} | Escolher e mover coisas; dar zoom para mostrar tudo; mostrar a implantação em 3D ([Veja a implantação em 3D](topic:site-3d)) |

Uma ferramenta de desenho fica pressionada enquanto está ativa. Clicar nela de novo, pressionar {{key:Esc}} ou pressionar {{key:V}} volta para {{ui:Selecionar}}. {{ui:Desfazer}}, {{ui:Refazer}}, {{ui:Copiar}} e os itens de {{ui:Mais}} ficam esmaecidos quando não podem agir; a dica diz por quê (por exemplo, "Selecione pontos de levantamento primeiro"). Todos os botões estão listados em [Referência da barra de ferramentas](topic:toolbar).

Em uma janela estreita, a barra de ferramentas rola para os lados.

## Painel esquerdo

### Implantação

- **Nome**: o nome do projeto. Ele dá nome a todo arquivo que você salva ou exporta e é impresso na faixa de título do PDF.
- **Unidades**: {{ui:Pés dos EUA}} ou {{ui:Metros}}. Isso diz o que os números significam. Mudar isso **não** converte as coordenadas; veja [Unidades, estacas e formatos de número](topic:units-and-stations).

### Pontos

Vazio, ele diz como abrir um arquivo de pontos. Com pontos, mostra o nome do arquivo, o número de pontos e quantos têm elevação, depois uma tabela de **grupos de pontos**: uma linha por primeira palavra da descrição (GRD, FL, TBS …), com uma contagem e uma escolha em **Superfície**:

- {{ui:Pontos}}: os pontos entram na superfície (o padrão para todo grupo).
- {{ui:Linha de quebra}}: os pontos do grupo são unidos, na ordem do número do ponto, em uma só linha de quebra.
- {{ui:Deixado de fora}}: o grupo não afeta a superfície.

### Superfície

Dados sobre o terreno natural: pontos, triângulos, menor e maior elevação, elevação média, área 2D e 3D, linhas de quebra e se há um limite. Sob os dados, uma caixa lista tudo o que o construtor da superfície teve de corrigir ou não conseguiu fazer. Depois:

- **Maior aresta externa**: 0 mantém todos os triângulos externos; um número apara triângulos longos e finos da parte externa.
- Links que aparecem quando se aplicam: {{ui:Remover o limite}}, {{ui:Remover linhas de quebra desenhadas}} e, para uma superfície lida de um LandXML, {{ui:Reconstruir a superfície a partir dos pontos}}.

### Exibição

- **Superfície**: {{ui:Terreno natural}} ou {{ui:Projetado (terraplenado)}}. A segunda fica disponível quando uma plataforma ou corredor terraplena sem problemas.
- **Curvas de nível a cada**, **Mestra a cada** e **Faixas** (o número de faixas de cor).
- Caixas de seleção: {{ui:Curvas de nível}}, {{ui:Rótulos das curvas de nível}}, {{ui:Triângulos}}, {{ui:Faixas de elevação}}, {{ui:Setas de declividade}}, {{ui:Pontos}}, {{ui:Rótulos dos pontos}}, {{ui:Linhas de quebra}}, {{ui:Borda da superfície}}, {{ui:Tubos}}.
- Uma legenda das elevações das faixas aparece quando as faixas estão ativas.

As configurações de exibição são salvas com o projeto, mas não são passos de desfazer: {{key:Mod+Z}} nunca desmarca uma caixa de seleção.

## Planta

A planta mostra os pontos, a superfície e tudo o que você projeta, em vista de planta com o norte para cima. Use a roda para dar zoom no ponteiro e arraste um espaço vazio para fazer pan. A lista completa está em [Teclas e mouse](topic:keyboard).

- Em um projeto vazio, uma caixa com o título **Comece com pontos de levantamento** lista os primeiros passos e oferece {{ui:Abrir a implantação de exemplo}}.
- Enquanto uma ferramenta de desenho está ativa, uma dica no alto da planta diz onde clicar e como concluir.
- Arrastar um arquivo sobre a planta mostra "Solte um arquivo de pontos, LandXML ou projeto".
- As coisas selecionadas ficam destacadas. Um alinhamento ou plataforma selecionado mostra grips quadrados em seus PIs ou cantos; uma estrutura selecionada mostra um grip. Arraste um grip para movê-lo.
- Os pontos de levantamento selecionados têm um anel. {{key:Shift}} e um clique adiciona ou remove um ponto; {{key:Shift}} e um arrasto desenha uma caixa (ou, arrastado em volta deles, um laço) que adiciona os pontos dentro dela. Veja [Selecione, copie e cole pontos de levantamento](topic:copy-paste-points).

## Vista de perfil

Pressione {{key:R}} ou clique em {{ui:Perfil}} para abri-la sob a planta. Sua barra tem:

- uma lista de alinhamentos (ativada quando há dois ou mais alinhamentos)
- {{ui:Adicionar PIVs}}: enquanto está pressionado, um clique no perfil adiciona um PIV ({{key:I}} alterna)
- uma leitura de estaca, terreno, cota de projeto, greide e corte ou aterro sob o ponteiro
- um botão de fechar

O perfil mostra o terreno natural, o perfil de projeto, os greides de cada tangente, a estaca e a cota de cada PIV, o L e o K de cada curva vertical com seu PCV e PTV, pontos altos e baixos e o exagero vertical. Ele sempre ajusta o alinhamento inteiro: não faz zoom nem pan. Mover o ponteiro ao longo dele põe um ponto no alinhamento da planta.

## Painel direito: Propriedades

O título diz o que ele mostra.

- **Projeto** (nada selecionado): os alinhamentos e as plataformas como links, o bloco **Movimento de terra** e o bloco **Rede de tubos** com suas regras e problemas.
- **Alinhamento**: nome, estaca inicial, comprimento, a tabela de PIs, as curvas, a tabela de PIVs e os dados do perfil de projeto e as configurações do **Corredor**.
- **Plataforma**: nome, cota, taludes de corte e aterro, área, dados do pé de talude e movimento de terra.
- **Estrutura** ou **Tubo**: dimensões, tampas, cotas de fundo, declividade, cobrimento e quaisquer problemas.
- **Ponto** e seu número: as coordenadas, a elevação, a descrição e o grupo do ponto (somente leitura).

Os campos têm efeito quando você pressiona {{key:Enter}} ou sai do campo. Um valor que não é aceito é marcado como inválido e nada muda.

## Barra de status

- **E** e **N**: coordenada leste e norte sob o ponteiro.
- A cota do **Terreno** ali (e **Terraplenado** onde uma plataforma ou corredor a mudou), ou "Fora da superfície".
- O alinhamento mais próximo (ou o selecionado) com a **Sta** e o afastamento (**L** ou **R**) sob o ponteiro.
- À direita, mensagens: o que acabou de acontecer, ou por que algo foi recusado. Uma mensagem some sozinha após alguns segundos.

## Caixas de diálogo

- **Importar pontos**: abre com todo arquivo de pontos. Veja [Importe pontos de levantamento](topic:import-points).
- **Plotar a planta em PDF**: veja [Plote a planta em PDF](topic:plot-pdf).
- **Alterações não salvas**: pergunta antes que {{ui:Novo}} ou a abertura de um projeto ou arquivo LandXML descarte o trabalho não salvo. {{ui:Salvar uma cópia}} baixa o projeto primeiro.

## Telas pequenas

Com até 760 pixels de largura, como em um celular, a planta fica com a tela: a barra de ferramentas vira uma linha que rola para os lados, e os painéis se abrem como folhas a partir de uma barra na parte de baixo. {{ui:Ferramentas}} oculta a barra de ferramentas e {{ui:Mover}} a põe embaixo.
