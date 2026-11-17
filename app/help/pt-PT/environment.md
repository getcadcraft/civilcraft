---
title: Sombra, produção solar e conforto exterior
summary: Estudar a sombra que os volumes desenhados lançam ao longo de um dia ou de uma estação, ver uma animação dessa sombra, calcular quanta eletricidade os painéis solares nos telhados e nas paredes produziriam num ano típico, ver o conforto da rua junto a um edifício (UTCI) e obter uma leitura preliminar do conforto do vento para peões.
keywords: estudo de sombra, sombra, horas de sol, animação, solar, PV, fotovoltaico, painéis, produção, kWh, EPW, ficheiro meteorológico, UTCI, conforto térmico, conforto exterior, stress térmico, vento
from: 96e7af4d
---

A secção **Ambiente** fica por baixo de **Horas de sol** nas **Propriedades** de um volume. Usa os volumes desenhados como edifícios.

## Carregar um ficheiro meteorológico

Escolha um ficheiro meteorológico de ano típico (**.epw**) para a sua localidade. Estão disponíveis gratuitamente no site de dados meteorológicos do EnergyPlus e em climate.onebuilding.org. O ficheiro fica no navegador durante esta visita. A produção solar e o estudo de conforto precisam dele; o estudo de sombra funciona sem ele quando o projeto tem um sistema de coordenadas.

## Estudo de sombra

Escolha uma data (ou marque **Estação**, uma última data e um passo em dias) e um fuso horário, e depois **Executar estudo de sombra**. Obtém um mapa das horas de sol, ou de sombra, no chão à volta dos volumes; uma tabela de quanto do chão fica à sombra ao longo do dia; e uma animação do dia que pode reproduzir ou avançar quadro a quadro. **Guardar mapa**, **Guardar quadros da animação** (todos os quadros numa só imagem) e **Guardar horas** (CSV) guardam os resultados.

O chão é considerado plano, ao nível do volume mais baixo. Para sombra em terreno inclinado use **Horas de sol**, que lê o relevo.

## Produção solar

Defina a eficiência dos painéis, a parte de cada telhado e de cada parede que fica coberta e as perdas do sistema, e depois **Executar produção solar**. Para cada telhado e parede obtém a eletricidade que um metro quadrado de painel produziria num ano típico, quanto dela os volumes vizinhos retiram, e um total para cada volume. O modelo está descrito por palavras simples ao lado do botão: é uma estimativa para planeamento a partir de um ano típico, não uma garantia.

## Conforto exterior

**Executar conforto** calcula o Índice Térmico Climático Universal (UTCI) para uma pessoa em pé, em terreno aberto e junto ao primeiro volume (lados sul, norte, este e oeste), com a sombra de cada volume. Mostra quanto céu é visível, o UTCI médio diurno e as horas acima de 32 (stress térmico) e abaixo de 0 (stress pelo frio).

## Vento (preliminar)

**Executar estudo de vento** resolve o escoamento do ar à volta dos volumes uma vez para cada direção de vento que sopra no ficheiro meteorológico (4, 8, 12 ou 16 direções), sobre a envolvente que escolher (campo aberto, subúrbio ou centro da cidade), e depois soma todo o vento horário do ano. O mapa colore o chão por classe de conforto, do verde (**sentado**), passando por **de pé**, **a passear** e **a andar**, até ao vermelho (**desconfortável**): a atividade cuja velocidade limite (4, 6, 8 e 10 m/s) é excedida em não mais de 5 % das horas. Uma segunda tabela dá a classe NEN 8100 (A a E) a partir da parte das horas em que o vento passa os 5 m/s. O fator de rajada multiplica a média horária para dar uma rajada efetiva.

Como funciona, por palavras simples: um solver de escoamento de grandes escalas lattice-Boltzmann (de desenvolvimento próprio, na biblioteca `lib/wind`) numa caixa à volta dos edifícios, um perfil de velocidade do vento que sobe com a altura segundo a rugosidade escolhida, e a velocidade a cerca de 1.5 m acima do chão comparada com a velocidade a montante a 10 m. **Preliminar** é rápido e grosseiro; **Padrão** usa mais células e demora muito mais. Se o painel indicar que a grelha é grosseira (menos de 10 células sobre o edifício mais alto), ou que o escoamento ainda estava a mudar, confie menos no mapa.

**O que isto não é.** O solver foi verificado em escoamentos clássicos de manual (um canal, uma cavidade com tampa deslizante) e executado num cubo para confirmar que a esteira e a aceleração de velocidade nos cantos parecem corretas. **Não** foi validado contra medições em túnel de vento de edifícios, por isso cada resultado está marcado como não validado. Não o use para um valor de projeto, uma carga de vento ou um certificado de planeamento: um engenheiro de vento tem de executar e confirmar um estudo adequado. O terreno plano, as paredes lisas dos edifícios, o atalho de rugosidade pela estação meteorológica e a tabela de limiares são simplificações; os limiares podem diferir dos critérios usados pela entidade competente.

## Vento com OpenFOAM (complemento)

O motor de vento integrado acima é experimental. Para um solver de escoamento a sério, ative o complemento **Vento de peões (OpenFOAM)** em **Definições > Suplementos** (fica desativado até o fazer). É um software com licença GPL próprio, mantido separado do resto do CadCraft, e não inclui o OpenFOAM, que tem de ser instalado à parte. Depois, **Motor** no bloco de vento passa a listar o OpenFOAM.

O que configura, uma única vez:
1. **Instalar o OpenFOAM** (a série v da ESI, de openfoam.com; o complemento é testado com a v2512). Em Ubuntu ou Debian (também dentro do WSL no Windows): `curl https://dl.openfoam.com/add-debian-repo.sh | sudo bash`, depois `sudo apt install openfoam2512-default`. Instala-se em `/usr/lib/openfoam/openfoam2512`. O CadCraft precisa de `blockMesh`, `snappyHexMesh` e `simpleFoam` para funcionar. (O pacote `openfoam` 1912, mais antigo, do próprio repositório do Ubuntu também funciona, mas as suas function objects falham; nesse caso o complemento lê ele próprio os ficheiros de resultados.)
2. **Iniciar o auxiliar** a partir da pasta `runner` do complemento, com Node.js: `node cc-openfoam-runner.mjs serve`. Se o OpenFOAM não estiver no caminho de pesquisa, crie um `runner.json` pequeno com o caminho para o `etc/bashrc` do OpenFOAM (`{ "bashrc": "/usr/lib/openfoam/openfoam2512/etc/bashrc" }`) e inicie-o com `--config runner.json`. O auxiliar escuta apenas neste computador e imprime um token.
3. **Cole o token** nos campos do complemento no bloco de vento (o endereço mantém-se `http://127.0.0.1:8765`) e clique em **Verificar o auxiliar**.

Depois, **Executar estudo de vento** trabalha um caso por cada direção de vento do ficheiro meteorológico: os volumes passam a ser uma superfície (STL) numa caixa dimensionada pela regra prática habitual (5 alturas de edifício em redor e acima, 10 atrás), com malha gerada por blockMesh e snappyHexMesh, resolvida como RANS k-epsilon estacionário com uma entrada de camada-limite atmosférica sobre a rugosidade escolhida; a velocidade a 1.5 m é lida e convertida nas mesmas classes de Lawson e NEN 8100. Nada sai do computador.

**O que foi verificado.** O texto acima dos resultados diz isto com clareza e faz parte de cada CSV guardado. A escrita dos casos, a leitura dos resultados e todo o processo do complemento são testados sem OpenFOAM, e um cubo único foi executado no OpenFOAM real com três tamanhos de malha (os números estão nas notas do projeto). **Não** foi validado contra medições em túnel de vento de edifícios. É uma leitura preliminar, não um valor de projeto nem um certificado. O k-epsilon padrão sobrestima a turbulência à frente dos edifícios, o chão é plano, as paredes são lisas e não há relevo nem vegetação.
