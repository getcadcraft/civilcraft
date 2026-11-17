---
title: Modelos de corredor e modelos de terreno
summary: Crie modelos reutilizáveis e pequenos (lancil e sarjeta, passeio, muro, valeta), construa um corredor a partir deles por PK com a esquerda e a direita separadas, divida uma diretriz em vários corredores e sobreponha camadas de materiais num terreno.
keywords: modelo, modelos, biblioteca de modelos, criação de modelos, perfil transversal tipo, montagem, subconjunto, componentes, códigos de ponto, condição final, linha de intersecção do talude, valeta, muro de suporte, lancil, sarjeta, passeio, zonas, intervalo de PK, vários corredores, esquerda e direita, modelo de terreno, terra vegetal, pavimento, base, sobrepor, materiais, quantidades
from: ce70e58b
---

Um **modelo** é um pequeno perfil transversal que desenha uma vez e reutiliza: pontos com afastamentos, inclinações e códigos de ponto, e componentes com materiais. Um corredor pode ser construído a partir de modelos por PK, com cada lado com os seus próprios modelos de pavimento e a sua própria condição final, e os mesmos modelos podem ser sobrepostos num terreno.

:::warning
Os modelos de exemplo são valores provisórios para começar. Os seus números não são retirados de nenhuma norma nem entidade. Um engenheiro deve verificar cada modelo, e cada valor que lhe atribua, antes de os usar num projeto.
:::

## Abrir os modelos

Abra {{ui:Superfície}} › {{ui:Mais}} › {{ui:Modelos de corredor…}} (ou escreva {{cmd:TEMPLATES}}). A janela tem três listas:

- **Neste projeto**: os modelos que os corredores e os modelos de terreno deste projeto usam. São guardados no ficheiro do projeto.
- **A minha biblioteca**: modelos guardados neste navegador e oferecidos em todos os projetos. Use {{ui:Guardar na minha biblioteca}} num modelo do projeto para o guardar.
- **Exemplos**: duas vias com camadas, lancil e sarjeta, passeio, linha de intersecção do talude, valeta, muro de suporte, terra vegetal abaixo do terreno e pavimento sobre o terreno. Cada um está marcado como « Para verificação por um engenheiro ».

{{ui:Usar neste projeto}} copia um modelo da biblioteca ou dos exemplos para o projeto. {{ui:Exportar os modelos deste projeto}} guarda-os num ficheiro `.cctemplates.json`, e {{ui:Importar um ficheiro}} lê um para dentro do projeto e para a minha biblioteca. Use o ficheiro para partilhar modelos ou levá-los para outro computador.

## Criar um modelo

{{ui:Novo modelo}} (ou {{ui:Editar}} num modelo do projeto) abre o editor de modelos. Desenhe o lado direito, para fora a partir do ponto 0,0 do modelo; o lado esquerdo usa o mesmo modelo para fora, para a esquerda.

1. Dê-lhe um nome e um tipo: **Pavimento** (o modelo seguinte liga-se no seu fim), **Condição final** (encontra o terreno) ou **Modelo de terreno**.
2. Acrescente **valores**: números com nome, como uma largura `w` ou uma inclinação `s`. Uma caixa numérica em qualquer ponto do modelo aceita um número ou o nome de um valor; `-t` é o valor `t` tornado negativo. Um corredor pode dar a cada utilização do modelo os seus próprios valores, para que um mesmo modelo de lancil sirva para cada altura de lancil.
3. Acrescente **pontos** por ordem. Cada um é colocado a partir de um ponto anterior (ou do ponto 0,0) pela sua restrição:

| Restrição | Coloca o ponto |
|---|---|
| Afastamento à inclinação | Um afastamento para fora e uma inclinação (subida por avanço; −0.02 desce 2%) |
| Afastamento e subida | Um afastamento e uma subida |
| Direito para cima ou para baixo | Apenas uma subida |
| Talude lateral até ao terreno | Para fora a partir do seu ponto até ao terreno, com a razão de escavação onde o terreno está acima e a razão de aterro onde está abaixo |
| Até ao terreno | Um afastamento e depois direito para cima ou para baixo até ao terreno |
| Muro de suporte | Um muro da espessura indicada: em escavação, o seu topo encontra o terreno na face da estrada; em aterro, a estrada passa por cima dele e a sua face exterior desce até ao terreno |

   Marque **Topo** para os pontos por onde passa a superfície acabada. O último ponto de topo é onde começa o modelo seguinte desse lado. Um **Alvo** permite que um corredor mova o ponto: o seu afastamento ou a sua cota vêm de uma linha.
4. Acrescente **componentes**: formas fechadas através de códigos de ponto (`0` é o ponto 0,0), cada uma com nome, material e tipo. As suas áreas dão os volumes.

O desenho acompanha cada alteração à escala real, e a lista por baixo indica o que está errado (um ponto que encontra o terreno antes do fim, um valor que o modelo não tem, um componente sem área). {{ui:Adicionar a este projeto}} ou {{ui:Guardar}} guarda-o, como um único passo de anulação.

## Construir um corredor a partir de modelos

Selecione uma diretriz com um corredor e, nas suas Propriedades, ative {{ui:Construir a partir de modelos por estaca}}. O corredor começa com os exemplos de duas vias e de linha de intersecção do talude nos dois lados.

- **Zonas.** Cada zona começa num PK e vai até ao da zona seguinte. {{ui:Adicionar uma zona}} acrescenta uma; altere o seu PK inicial na respetiva caixa.
- **Esquerda e direita separadas.** Cada lado de cada zona tem a sua própria lista de **Pavimento**, do eixo para fora, e a sua própria **Condição final**: linha de intersecção do talude, uma valeta, um muro ou qualquer modelo que encontre o terreno. Sem condição final, o lado encontra o terreno nos taludes de escavação e aterro do corredor. {{ui:Copiar da esquerda para a direita}} copia um lado.
- **Valores e alvos.** Sob cada modelo de um lado, uma caixa por valor (vazio = valor próprio do modelo) e, para um ponto que aceita um alvo, a linha característica ou a linha de outro corredor que o move.
- **De** e **Até** limitam o corredor a parte da diretriz.

Os perfis transversais, as linhas da planta de cada código de ponto, a superfície proposta, a implantação e os movimentos de terras seguem todos. As Propriedades listam o volume de cada componente por lado e por zona (áreas médias de extremidade ao longo do eixo). A sobrelevação e os alvos de bordo do corredor não são usados enquanto o corredor é construído a partir de modelos.

## Vários corredores numa diretriz

Em **Corredores nesta diretriz**, {{ui:Adicionar um corredor}} acrescenta um corredor ao resto da diretriz: o primeiro corredor recebe um PK final a meio (ou mantém o seu), e o novo começa aí com a última zona de modelos do primeiro. Cada corredor tem o seu próprio nome, intervalo de PK, modelos e movimentos de terras. Desative um com a sua caixa {{ui:Ligadas}}. Onde dois intervalos se sobrepõem, o corredor posterior modela sobre o anterior.

## Modelos de terreno

Um modelo de terreno sobrepõe as camadas de um modelo sobre um terreno a partir do seu ponto 0,0: uma camada abaixo do ponto 0,0 vai para dentro do terreno (terra vegetal a remover), uma camada acima dele assenta sobre o terreno (base e pavimento num parque de estacionamento). As larguras e as inclinações não importam; só importa a profundidade de cada componente acima ou abaixo do ponto 0,0.

Abra {{ui:Superfície}} › {{ui:Mais}} › {{ui:Modelos de terreno…}} (ou escreva {{cmd:TERRAINTEMPLATES}}); o bloco está também nas Propriedades do projeto. {{ui:Adicionar um modelo de terreno}} acrescenta um com o exemplo de terra vegetal. Para cada um, escolha:

- o **modelo** (os seus valores podem ser alterados para este caso),
- o **terreno**: o terreno natural ou a superfície proposta,
- a **forma** que o recorta: o terreno inteiro, um lote, uma plataforma ou uma linha característica fechada. Vários modelos de terreno podem usar formas diferentes sobre o mesmo terreno.

Cada camada lista a sua espessura, a área em planta e o volume. O volume é a área em planta vezes a espessura, medida na vertical; a área é medida numa grelha, e a área inclinada (sobre o declive) também é indicada. As formas são desenhadas na planta na camada C-TOPO-TMPL. Os modelos de terreno não alteram a superfície proposta.

## Materiais e quantidades

O bloco de Movimentos de terras do projeto lista **Materiais dos modelos**: cada componente de corredor e cada camada de modelo de terreno com o seu volume. {{ui:Enviar para o TakeoffCraft}} escreve-os no ficheiro de quantidades depois da escavação e do aterro, um item cada, em jardas cúbicas (projetos em pés) ou metros cúbicos.

## Ficheiros

Os modelos, as zonas, os corredores extra e os modelos de terreno ficam guardados no ficheiro do projeto. Um projeto que não usa nenhum deles é guardado exatamente como antes, e as versões mais antigas do CivilCraft abrem um projeto que os usa (ignoram os modelos e constroem a montagem própria do corredor).
