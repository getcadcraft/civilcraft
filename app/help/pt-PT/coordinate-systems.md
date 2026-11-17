---
title: Definir o sistema de coordenadas do projeto
summary: Indique em que sistema de coordenadas está o levantamento, para que o CivilCraft mostre latitude e longitude, posicione ficheiros SIG e camadas de mapa e escreva ficheiros .prj. Escolha por código, por nome, pelas próprias coordenadas ou a partir de um ficheiro .prj.
keywords: sistema de coordenadas, crs, epsg, srid, state plane, spcs, utm, nad83, wgs 84, projeção, prj, wkt, datum, latitude, longitude, lat long, geográfico, grelha, georreferenciação, georreferenciar, atribuir sistema de coordenadas
from: 964250e2
---

As coordenadas de um projeto são apenas números até indicar o que significam. Definir o sistema de coordenadas **nunca move nada**: informa o CivilCraft de que, por exemplo, E 6,150,000 N 2,080,000 são coordenadas state plane da zona 6 da Califórnia, em pés de agrimensura dos EUA (US survey feet). Depois de o saber:

- a barra de estado mostra a latitude e a longitude do cursor,
- os ficheiros SIG noutros sistemas (shapefiles, GeoJSON, GeoPackage, grelhas de cotas, LiDAR) são convertidos para o projeto à medida que são abertos,
- as camadas de mapa podem ser desenhadas sob a planta ([Mostrar camadas de mapa sob a planta](topic:map-layers)),
- as exportações para formatos SIG levam o sistema (um `.prj` para shapefiles, o código EPSG para GeoPackage e GeoTIFF).

## Escolher o sistema

1. Escolha {{ui:Coordenadas}} no grupo {{ui:SIG}} da barra de ferramentas. Abre-se a caixa de diálogo **Sistema de coordenadas**. No topo indica em que sistema está o projeto neste momento, ou **Nenhum — as coordenadas são apenas números**.
2. Encontre o sistema de uma destas formas:
   - **Pesquisa**: escreva o código EPSG (`2277`, `EPSG:2277`) ou palavras do nome (`texas central`, `utm 14n`, `lambert-93`). Os códigos listam a partir do que escreveu; as palavras listam os sistemas cujo nome contém todas as palavras.
   - {{ui:Sistemas onde cabem estas coordenadas}} (quando o projeto tem pontos ou uma superfície): o CivilCraft lê o centro do projeto em todos os sistemas da família de unidades do projeto e lista aqueles cuja área de utilização o inclui. As coordenadas state plane normalmente só cabem em poucas zonas: um projeto no Texas em E 3,115,000 N 10,070,000 pés de agrimensura dos EUA cabe nas quatro variantes Texas Central (NAD83, NAD83(2011), HARN, NSRS2007). Cada entrada mostra onde ficaria o centro do projeto.
   - **Perto de (lat, long)** e {{ui:Sugerir}}: escreva onde fica o local, por exemplo `30.27, -97.74` ou `30°16′N 97°44′W`, e o CivilCraft lista os sistemas projetados cuja área o inclui, primeiro as grelhas nacionais e estaduais.
   - {{ui:Ler um ficheiro .prj…}}: abra o `.prj` que veio com um shapefile ou um desenho. O CivilCraft associa-o à sua lista pela matemática da projeção (por isso um `.prj` que dá outro nome ao datum ainda encontra o sistema certo) e diz qual é; quando nada coincide exatamente, usa-se a descrição do próprio ficheiro. Também pode arrastar um `.prj` para a caixa de diálogo, ou abri-lo ou arrastá-lo para a planta sozinho.
3. Clique num sistema da lista. Em **Escolhido** mostra o nome, o código EPSG, a unidade, o grau de ligação do seu datum ao WGS 84, a área de utilização em latitude e longitude e onde fica o centro do projeto nele.
4. Deixe **Grelha** selecionada (na maioria dos projetos; veja [Coordenadas do terreno e locais](topic:ground-and-local-coordinates) para os outros casos) e selecione {{ui:Aplicar}}.

A barra de estado mostra agora a latitude e a longitude do cursor ao lado de E e N. Definir o sistema é um único passo de anulação: {{key:Mod+Z}} anula-o.

:::note
As unidades têm de coincidir: um projeto em pés aceita sistemas em pés de agrimensura dos EUA ou em pés internacionais, e um projeto em metros aceita sistemas em metros. O CivilCraft explica uma recusa (« O projeto está em pés, mas este sistema está em metros… »). Um projeto em pés com um sistema em pé de agrimensura dos EUA usa pés de agrimensura: o "ft" do projeto significa o pé do sistema. Os sistemas geográficos (latitude e longitude, como o próprio WGS 84) não podem ser o sistema de um projeto: os desenhos precisam de coordenadas E e N.
:::

## Alterar ou remover o sistema

Abra de novo {{ui:Coordenadas}}, escolha outro sistema e selecione {{ui:Aplicar}}. Quando o projeto tem pontos ou um traçado, o CivilCraft pergunta **As coordenadas já estão em …?**

- {{ui:Sim — nada se move}}: os números mantêm-se e só muda o seu significado. Use esta opção quando o sistema anterior foi escolhido por engano.
- {{ui:Não — convertê-las}}: cada ponto topográfico, linha de quebra, limite, PI de diretriz, canto de plataforma e estrutura é convertido do sistema antigo para o novo, num único passo de anulação. Uma superfície lida de LandXML como triângulos não pode ser convertida; reconstrua-a primeiro a partir dos pontos.

{{ui:Remover o sistema}} retira o sistema (nada se move). As camadas SIG já no projeto mantêm-se onde estão.

## Latitude e longitude na barra de estado

Enquanto o projeto tiver um sistema, a barra de estado mostra a latitude e a longitude do cursor no WGS 84, por exemplo `30°18′00.00″ N  97°42′00.00″ W`. Para usar graus decimais, selecione {{ui:Definições}}, {{ui:CivilCraft}}, **Latitude e longitude** ([Definições do CivilCraft](topic:settings)). Com coordenadas do terreno ou locais, a leitura passa primeiro por esse passo, pelo que está correta para o ponto sob o cursor.

## Qualidade da mudança de datum

A latitude, a longitude, o GeoJSON e as camadas de mapa estão todos no WGS 84. A ligação de cada sistema ao WGS 84 é indicada na caixa de diálogo:

| O que a caixa de diálogo diz | O que significa |
|---|---|
| WGS 84 em si | Nenhuma mudança. |
| NAD83 tomado como WGS 84 | Os dois diferem de um ou dois metros na maior parte da América do Norte, no máximo alguns metros. Serve para camadas de mapa e contexto do local; não serve para o controlo de levantamentos. |
| Conhecida com cerca de *n* m (valor do EPSG) | Uma mudança publicada; as camadas de mapa e o GeoJSON podem estar desfasados nessa ordem de grandeza. |
| Não conhecida para este datum | Não há mudança publicada sem um ficheiro de grelha: as camadas de mapa e o GeoJSON podem estar desfasados em centenas de metros. |
| Do ficheiro de mudança de grelha … | Está em uso um ficheiro de mudança de grelha (abaixo): dentro de cerca de 10 cm do NAD83, dentro da grelha. |

As coordenadas do próprio projeto nunca passam por uma mudança de datum: só passa o que é convertido de ou para latitude e longitude. Datuns verticais e modelos de geoide não são tratados (as cotas nunca são convertidas). Quando a melhor mudança exige um ficheiro de grelha, a lista traz uma mudança publicada mais grosseira e a caixa de diálogo mostra a sua precisão (por exemplo, cerca de 20 m nos sistemas NAD27), até acrescentar a grelha.

## Ficheiros de mudança de grelha

Para um sistema NAD27, **Ficheiro de mudança de grelha** na caixa de diálogo do sistema de coordenadas coloca a latitude, a longitude, os ficheiros SIG e as camadas de mapa a cerca de 10 cm do NAD83, em vez de cerca de 20 m:

- **Transferir** a grelha sugerida para a área do sistema (NADCON5 para os Estados Unidos contíguos, NADCON para o Alasca, NTv2 para o Canadá) a partir de cdn.proj.org, o servidor público de grelhas do PROJ. Só o nome do ficheiro da grelha é enviado.
- Ou **Acrescentar um ficheiro de grelha…** se já tiver um: NTv2 (`.gsb`) ou uma grelha GeoTIFF do PROJ (`.tif`), até 20 MB.

A grelha fica guardada no ficheiro do projeto, pelo que segue com o projeto. A secção da caixa de diálogo indica se o centro do projeto está dentro da grelha: fora dela não se aplica nenhuma mudança, por isso use uma grelha que cubra o local. **Deixar de usar a grelha** volta à mudança grosseira. Cada alteração é um passo: {{key:Mod+Z}} anula-a.

As camadas SIG já no projeto mantêm-se onde estão quando a grelha muda; volte a importá-las para as posicionar através da grelha. As coordenadas do próprio projeto nunca se movem.

## O que foi verificado

- Cada conversão foi comparada com o PROJ (pyproj 3.7.1 com PROJ 9.5.1), a biblioteca de coordenadas que a maioria dos programas SIG usa, em mais de 330 sistemas: state plane em pés de agrimensura dos EUA e em pés, UTM norte e sul, Lambert-93, British National Grid, GDA2020 MGA, New Zealand Transverse Mercator e Mercator web, entre outros. As coordenadas E e N coincidem em 1 cm com a mesma mudança de datum (na maioria, bem abaixo de 1 mm), e a matemática da projeção coincide com as próprias definições do PROJ em 1 cm.
- Os ficheiros `.prj` escritos pelo PROJ nas duas formas comuns (ESRI e OGC) foram lidos de volta para 105 sistemas: 208 dos 210 coincidiram com o código EPSG exato, e os outros dois com um sistema de matemática igual no mesmo elipsoide. Os ficheiros `.prj` que o CivilCraft escreve são lidos pelo PROJ como o mesmo sistema. Os ficheiros `.prj` ESRI de sistemas estereográficos polares (UPS, polar do Alasca) não podem ser lidos; escolha esses sistemas pelo código.
- A latitude e a longitude na barra de estado coincidiram com o PROJ até 0.01″ no navegador.
