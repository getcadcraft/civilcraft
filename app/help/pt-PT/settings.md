---
title: Definições do CivilCraft
summary: Escolha a ordem das colunas para as linhas de pontos copiadas e coladas e para adivinhar as colunas de um ficheiro, como os pontos colados são numerados, o que mostram as etiquetas dos pontos, o indicador de canto, o exagero vertical 3D, como se mostram a latitude e a longitude, e se as camadas de mapa vêm da Internet.
keywords: definições, preferências, pnezd, penzd, ordem das colunas, linhas de pontos, renumerar, números dos pontos, número inicial, etiquetas dos pontos, etiquetas, descrição, cota, cubo de vistas, ícone dos eixos, indicador de canto, rosa dos ventos, exagero vertical, 3d, latitude, longitude, dms, graus decimais, camadas de mapa, Internet, privacidade
from: 64b9cb92
---

Abra {{ui:Definições}} com a engrenagem na barra da aplicação, ou com {{key:Mod+,}}. O primeiro separador, {{ui:CivilCraft}}, contém as definições que pertencem a esta aplicação; {{ui:Geral}} contém as que todas as aplicações do CadCraft partilham (tema, barra de ferramentas, painéis). As definições do CivilCraft existem apenas na aplicação: altera-as aqui, e este navegador as memoriza. {{ui:Repor definições do CivilCraft}} repõe todas as definições para o seu valor inicial.

## Linhas de pontos

**P, N, E, Z, D** (o predefinido) ou **P, E, N, Z, D**: ponto, norte, este, cota, descrição, ou este antes de norte. Usa-se em três sítios:

- **Copiar**: as linhas que o CivilCraft coloca na área de transferência do sistema para uma folha de cálculo.
- **Colar**: linhas coladas de uma folha de cálculo ou de um ficheiro de texto que não têm linha de cabeçalho.
- **Importar**: a sugestão na caixa de diálogo **Importar pontos** quando um ficheiro não tem linha de cabeçalho (um ficheiro com quatro colunas lê-se como PENZ, com três como ENZ). Ver [Formatos de ficheiros de pontos](topic:point-file-formats).

Uma linha de cabeçalho que nomeia as colunas prevalece sempre, e o mesmo acontece com uma escolha na lista **Colunas** da caixa de diálogo de importação.

## Números para os pontos colados

- **Manter números livres** (o predefinido): um ponto colado mantém o seu número quando nenhum ponto o tem; apenas os pontos em conflito recebem números novos.
- **Números novos sempre**: cada ponto colado recebe um número novo, mesmo que o seu esteja livre.

**Os números novos começam em**: deixe vazio para contar a partir de mais um do que o maior número em uso. Introduza um número, por exemplo 5000, para dar aos pontos novos números a partir de 5000; os números já em uso são saltados. Dois pontos nunca partilham um número, em nenhum dos casos. Ver [Selecionar, copiar e colar pontos topográficos](topic:copy-paste-points#point-numbers-never-clash).

## Etiquetas dos pontos

O que mostra uma etiqueta de ponto quando {{ui:Etiquetas dos pontos}} está ativo em **Visualização**: **Número**, **Número e cota** ou **Número, cota e descrição** (o predefinido). As exportações DXF, DWG e PDF mostram as mesmas etiquetas que o ecrã.

## Indicador de canto

O que fica no canto da planta e da vista 3D: **Cubo de vistas** (o predefinido), **Ícone dos eixos** ou **Nenhum**.

- **Cubo de vistas** (canto superior direito). Na planta mostra o topo, com o anel da rosa dos ventos: N é o norte da grelha (para cima na planta). Clique em qualquer outro lado, aresta ou canto do cubo, ou arraste-o, e a [vista 3D](topic:site-3d) abre a olhar dessa direção. {{ui:Base}} no cubo da planta ajusta a planta à janela.
- Na vista 3D o cubo roda com a vista: clique num lado, aresta ou canto para olhar dessa direção, arraste o cubo para orbitar, arraste o anel da rosa dos ventos para rodar em torno da vertical, clique numa letra para olhar desse lado, e use {{ui:Base}} para a vista isométrica de todo o local. Quando olha diretamente para um lado, as setas pequenas avançam para o lado seguinte e as setas curvas rodam a vista um quarto de volta.
- **Ícone dos eixos** (canto inferior esquerdo): um pequeno marcador X (este) e Y (norte) na planta, e X, Y e Z (para cima) em 3D.

## Exagero vertical 3D

Quanto a vista 3D estica as cotas: **1×**, **2×** (o predefinido), **3×**, **5×** ou **10×**. A lista na barra da vista 3D é a mesma definição, por isso alterar uma altera as duas. Volumes, perfis e exportações 3D mantêm a escala real.

## Latitude e longitude

Como a barra de estado mostra a latitude e a longitude do ponteiro quando o projeto tem um sistema de coordenadas: **graus, minutos e segundos** (o predefinido, por exemplo `30°18′00.00″ N`) ou **graus decimais** (`30.300000° N`). Ver [Definir o sistema de coordenadas do projeto](topic:coordinate-systems#latitude-and-longitude-in-the-status-bar).

## Camadas de mapa da Internet

**Desligado** (o predefinido) ou **Ligado**. Quando ligado, o CivilCraft pede aos servidores de mapas que acrescente, que indique, imagens da área no ecrã. O seu desenho fica neste computador; o servidor vê a área e o seu endereço de Internet. Enquanto estiver desligado, nenhum servidor de mapas é consultado, mesmo que um projeto aberto indique um; uma imagem georreferenciada de um ficheiro funciona de qualquer forma. Ver [Mostrar camadas de mapa sob a planta](topic:map-layers).

## Assistentes

**Permitir que assistentes de IA e scripts usem o CivilCraft** (desligado no início) permite que um assistente no seu computador alcance o local aberto através do CadCraft Studio: **Ler** descreve o local e dá pontos, cotas de superfície, PK, perfis, volumes e parcelas; **Editar** permite-lhe selecionar e acrescentar pontos topográficos; **Guardar** e **Exportar** permitem-lhe guardar o projeto e escrever LandXML ou DWG. **Pastas que pode usar** (no Studio) são onde pode guardar e exportar. **Atividade** lista as suas chamadas. Ver [Deixar um assistente de IA trabalhar com o local](topic:assistants).
