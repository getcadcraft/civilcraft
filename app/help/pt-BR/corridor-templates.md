---
title: Modelos de corredor e modelos de terreno
summary: Crie pequenos modelos reutilizáveis (meio-fio e sarjeta, calçada, muro, valeta), construa um corredor a partir deles por estaca, com esquerda e direita separadas, divida um alinhamento em vários corredores e aplique camadas de materiais sobre um terreno.
keywords: modelo, modelos, biblioteca de modelos, criação de modelo, seção típica, montagem, submontagem, componentes, códigos de ponto, condição final, pé de talude, valeta, muro de contenção, meio-fio, sarjeta, calçada, regiões, faixa de estacas, vários corredores, múltiplos corredores, esquerda e direita, modelo de terreno, camada superficial, pavimento, base, projetar sobre o terreno, materiais, quantitativos
from: ce70e58b
---

Um **modelo** é uma pequena seção transversal que você desenha uma vez e reutiliza: pontos com deslocamentos, declividades e códigos de ponto, e componentes com materiais. Um corredor pode ser construído a partir de modelos por estaca, cada lado com seus próprios modelos de pavimento e sua própria condição final, e os mesmos modelos podem ser aplicados sobre um terreno.

:::warning
Os modelos de exemplo são valores provisórios para começar. Seus números não foram tirados de nenhuma norma ou órgão. Um engenheiro deve verificar cada modelo, e cada valor que você informar nele, antes de usá-lo em um projeto.
:::

## Abrir os modelos

Abra {{ui:Superfície}} › {{ui:Mais}} › {{ui:Modelos de corredor…}} (ou digite {{cmd:TEMPLATES}}). A janela tem três listas:

- **Neste projeto**: os modelos que os corredores e os modelos de terreno deste projeto usam. Eles são salvos no arquivo do projeto.
- **Minha biblioteca**: modelos mantidos neste navegador e oferecidos em todos os projetos. Use {{ui:Salvar na Minha biblioteca}} em um modelo do projeto para mantê-lo.
- **Exemplos**: duas faixas com camadas, meio-fio e sarjeta, calçada, pé de talude, valeta, muro de contenção, camada superficial abaixo do terreno e pavimento sobre o terreno. Cada um é marcado como "Para verificação por engenheiro".

{{ui:Usar neste projeto}} copia um modelo da biblioteca ou um exemplo para o projeto. {{ui:Exportar os modelos deste projeto}} os salva como um arquivo `.cctemplates.json`, e {{ui:Importar um arquivo}} lê um deles para o projeto e para a Minha biblioteca. Use o arquivo para compartilhar modelos ou levá-los para outro computador.

## Criar um modelo

{{ui:Novo modelo}} (ou {{ui:Editar}} em um modelo do projeto) abre o editor de modelos. Desenhe o lado direito, para fora a partir do ponto 0,0 do modelo; o lado esquerdo usa o mesmo modelo, para fora, para a esquerda.

1. Dê a ele um nome e um tipo: **Pavimento** (o próximo modelo se prende ao seu fim), **Condição final** (ele encontra o terreno) ou **Modelo de terreno**.
2. Adicione **valores**: números com nome, como uma largura `w` ou uma declividade `s`. Uma caixa de número em qualquer ponto do modelo aceita um número ou o nome de um valor; `-t` é o valor `t` com sinal negativo. Um corredor pode dar a cada uso do modelo seus próprios valores, então um único modelo de meio-fio atende a qualquer altura de meio-fio.
3. Adicione **pontos** em ordem. Cada um é posicionado a partir de um ponto anterior (ou do ponto 0,0) pela sua restrição:

| Restrição | Posiciona o ponto |
|---|---|
| Deslocamento com declividade | Um deslocamento para fora e uma declividade (desnível por distância; −0.02 desce 2%) |
| Deslocamento e desnível | Um deslocamento e um desnível |
| Reto para cima ou para baixo | Apenas um desnível |
| Talude lateral até o terreno | Para fora do seu ponto até o terreno, na inclinação de corte onde o terreno está acima e na inclinação de aterro onde está abaixo |
| Até o terreno | Um deslocamento, depois reto para cima ou para baixo até o terreno |
| Muro de contenção | Um muro com a espessura informada: em corte, o topo encontra o terreno na face da pista; em aterro, a pista passa por cima dele e a face externa desce até o terreno |

   Marque **Topo** para os pontos por onde passa a superfície acabada. O último ponto de topo é onde começa o próximo modelo daquele lado. Um **Alvo** permite que um corredor mova o ponto: seu deslocamento ou sua cota vêm de uma linha.
4. Adicione **componentes**: formas fechadas através de códigos de ponto (`0` é o ponto 0,0), cada uma com um nome, um material e um tipo. As áreas delas dão os volumes.

O desenho acompanha cada alteração em escala real, e a lista abaixo dele informa o que está errado (um ponto que encontra o terreno antes do fim, um valor que o modelo não tem, um componente sem área). {{ui:Adicionar a este projeto}} ou {{ui:Salvar}} o mantém, como uma etapa de desfazer.

## Construir um corredor a partir de modelos

Selecione um alinhamento com um corredor e, em suas Propriedades, ative {{ui:Construir a partir de modelos por estaca}}. O corredor começa com os exemplos de duas faixas e de pé de talude nos dois lados.

- **Regiões.** Cada região começa em uma estaca e vai até a estaca da região seguinte. {{ui:Adicionar uma região}} adiciona uma; altere a estaca inicial dela na caixa correspondente.
- **Esquerda e direita separadas.** Cada lado de cada região tem sua própria lista de **Pavimento**, do eixo para fora, e sua própria **Condição final**: pé de talude, uma valeta, um muro ou qualquer modelo que encontre o terreno. Sem condição final, o lado chega ao pé de talude nas declividades de corte e aterro do corredor. {{ui:Copiar da esquerda para a direita}} copia um lado.
- **Valores e alvos.** Abaixo de cada modelo de um lado, uma caixa por valor (vazia = o valor próprio do modelo) e, para um ponto que recebe um alvo, a linha de feição ou a linha de outro corredor que o move.
- **De** e **Até** limitam o corredor a uma parte do alinhamento.

As seções, as linhas em planta de cada código de ponto, a superfície projetada, a locação e a terraplenagem acompanham tudo isso. Propriedades lista o volume de cada componente por lado e por região (áreas médias das extremidades ao longo do eixo). A superelevação e os alvos de borda do corredor não são usados enquanto o corredor é construído a partir de modelos.

## Vários corredores em um alinhamento

Em **Corredores neste alinhamento**, {{ui:Adicionar um corredor}} adiciona um corredor no restante do alinhamento: o primeiro corredor recebe uma estaca final no meio (ou mantém a própria), e o novo começa ali com a última região de modelos do primeiro. Cada corredor tem seu próprio nome, faixa de estacas, modelos e terraplenagem. Desligue um com a caixa {{ui:Ligado}}. Onde dois intervalos se sobrepõem, o corredor posterior terraplena sobre o anterior.

## Modelos de terreno

Um modelo de terreno projeta as camadas de um modelo sobre um terreno a partir do seu ponto 0,0: uma camada abaixo do ponto 0,0 entra no terreno (camada superficial a decapar), e uma camada acima dele fica sobre o terreno (base e pavimento em um estacionamento). Larguras e declividades não importam, apenas a profundidade de cada componente acima ou abaixo do ponto 0,0.

Abra {{ui:Superfície}} › {{ui:Mais}} › {{ui:Modelos de terreno…}} (ou digite {{cmd:TERRAINTEMPLATES}}); o bloco também está nas Propriedades do projeto. {{ui:Adicionar um modelo de terreno}} adiciona um com o exemplo de camada superficial. Para cada um, escolha:

- o **modelo** (seus valores podem ser alterados apenas para este),
- o **terreno**: o terreno natural ou a superfície projetada,
- a **forma** que o recorta: o terreno inteiro, um lote, uma plataforma ou uma linha de feição fechada. Vários modelos de terreno podem usar formas diferentes sobre o mesmo terreno.

Cada camada lista sua espessura, área em planta e volume. O volume é a área em planta vezes a espessura, com a espessura medida na vertical; a área é medida em uma malha, e a área projetada (inclinada) também é informada. As formas são desenhadas na planta, na camada C-TOPO-TMPL. Modelos de terreno não alteram a superfície projetada.

## Materiais e quantitativos

O bloco de Terraplenagem do projeto lista **Materiais dos modelos**: cada componente de corredor e cada camada de modelo de terreno com seu volume. {{ui:Enviar para o TakeoffCraft}} os grava no arquivo de quantitativos, após o corte e aterro, um item cada, em jardas cúbicas (projetos em pés) ou metros cúbicos.

## Arquivos

Modelos, regiões, os corredores extras e os modelos de terreno são salvos no arquivo do projeto. Um projeto que não usa nenhum deles é salvo exatamente como antes, e versões mais antigas do CivilCraft abrem um projeto que os usa (elas ignoram os modelos e constroem a montagem própria do corredor).
