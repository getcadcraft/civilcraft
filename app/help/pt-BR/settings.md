---
title: Configurações do CivilCraft
summary: Escolha a ordem das colunas para as linhas de pontos copiadas e coladas e para a adivinhação das colunas de um arquivo, como os pontos colados são numerados, o que os rótulos dos pontos mostram, o indicador de canto, o exagero vertical 3D, como latitude e longitude são exibidas, e se as camadas de mapa vêm da internet.
keywords: configurações, preferências, pnezd, penzd, ordem das colunas, linhas de pontos, renumerar, números de pontos, número inicial, rótulos dos pontos, rótulos, descrição, cota, cubo de vista, ícone de eixos, indicador de canto, bússola, exagero vertical, 3d, latitude, longitude, gms, graus decimais, camadas de mapa, internet, privacidade
from: 64b9cb92
---

Abra {{ui:Settings}} com a engrenagem na barra de aplicativo ou com {{key:Mod+,}}. A primeira guia, {{ui:CivilCraft}}, reúne as configurações deste aplicativo; {{ui:General}} reúne as que todos os aplicativos CadCraft compartilham (tema, barra de ferramentas, painéis). As configurações do CivilCraft existem somente no aplicativo: você as altera aqui, e este navegador as lembra. {{ui:Reset CivilCraft settings}} devolve todas as configurações ao início.

## Linhas de pontos

**P, N, E, Z, D** (o início) ou **P, E, N, Z, D**: ponto, norte, leste, cota, descrição, ou leste antes de norte. Ela é usada em três lugares:

- **Copiar**: as linhas que o CivilCraft coloca na área de transferência do sistema para uma planilha.
- **Colar**: linhas coladas de uma planilha ou de um arquivo de texto que não têm linha de cabeçalho.
- **Importar**: a adivinhação na caixa de diálogo **Importar pontos** quando um arquivo não tem linha de cabeçalho (um arquivo com quatro colunas é lido como PENZ, com três como ENZ). Veja [Formatos de arquivo de pontos](topic:point-file-formats).

Uma linha de cabeçalho que nomeia as suas colunas sempre prevalece, assim como uma escolha na lista **Colunas** da caixa de diálogo de importação.

## Números para pontos colados

- **Manter números livres** (o início): um ponto colado mantém o seu número quando nenhum ponto o tem; somente os pontos em conflito recebem números novos.
- **Sempre números novos**: cada ponto colado recebe um número novo, mesmo que o seu próprio número esteja livre.

**Novos números começam em**: deixe vazio para contar a partir de um a mais que o maior número em uso. Digite um número, por exemplo 5000, para dar aos novos pontos números a partir de 5000; números já em uso são pulados. Dois pontos nunca compartilham um número, de qualquer forma. Veja [Selecionar, copiar e colar pontos topográficos](topic:copy-paste-points#point-numbers-never-clash).

## Rótulos dos pontos

O que um rótulo de ponto mostra quando {{ui:Point labels}} está ativado em **Exibir**: **Número**, **Número e cota** ou **Número, cota e descrição** (o início). As exportações DXF, DWG e PDF mostram os mesmos rótulos da tela.

## Indicador de canto

O que fica no canto da planta e da vista 3D: **Cubo de vista** (o início), **Ícone de eixos** ou **Nenhum**.

- **Cubo de vista** (canto superior direito). Na planta, ele mostra o topo, com o anel da bússola: N é o norte da malha (para cima na planta). Clique em qualquer outro lado, aresta ou canto do cubo, ou arraste-o, e a [vista 3D](topic:site-3d) abre olhando de lá. {{ui:Home}} no cubo da planta ajusta a planta.
- Na vista 3D o cubo gira com a vista: clique em um lado, aresta ou canto para olhar de lá, arraste o cubo para orbitar, arraste o anel da bússola para girar em torno da vertical, clique em uma letra para olhar a partir daquele lado, e use {{ui:Home}} para a vista isométrica de todo o local. Olhando diretamente para um lado, as pequenas setas avançam para o próximo lado e as setas curvas giram a vista um quarto de volta.
- **Ícone de eixos** (canto inferior esquerdo): um pequeno marcador X (leste) e Y (norte) na planta, X, Y e Z (para cima) em 3D.

## Exagero vertical 3D

Quanto a vista 3D estica as cotas: **1×**, **2×** (o início), **3×**, **5×** ou **10×**. A lista na barra da vista 3D é a mesma configuração, então alterar uma altera as duas. Volumes, perfis e exportações 3D permanecem na escala real.

## Latitude e longitude

Como a barra de status mostra a latitude e a longitude do ponteiro quando o projeto tem um sistema de coordenadas: **graus, minutos e segundos** (o início, por exemplo `30°18′00.00″ N`) ou **graus decimais** (`30.300000° N`). Veja [Definir o sistema de coordenadas do projeto](topic:coordinate-systems#latitude-and-longitude-in-the-status-bar).

## Camadas de mapa pela internet

**Desligado** (o início) ou **Ligado**. Quando ligado, o CivilCraft pede aos servidores de mapa que você adicionar imagens da área na tela. Seu desenho continua neste computador; o servidor vê a área e o seu endereço de internet. Enquanto estiver desligado, nenhum servidor de mapa é consultado, mesmo quando um projeto aberto indica um; uma imagem georreferenciada de um arquivo funciona de qualquer forma. Veja [Mostrar camadas de mapa sob a planta](topic:map-layers).

## Assistentes

**Permitir que assistentes de IA e scripts usem o CivilCraft** (desligado no início) permite que um assistente neste computador acesse o local aberto pelo CadCraft Studio: **Ler** descreve o local e fornece pontos, cotas da superfície, estacas, perfis, volumes e lotes; **Editar** permite que ele selecione e adicione pontos topográficos; **Salvar** e **Exportar** permitem que ele salve o projeto e grave LandXML ou DWG. **Pastas que ele pode usar** (no Studio) são onde ele pode salvar e exportar. **Atividade** lista suas chamadas. Veja [Deixar um assistente de IA trabalhar com o seu local](topic:assistants).
