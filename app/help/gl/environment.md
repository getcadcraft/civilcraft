---
title: Sombra, produción solar e confort exterior
summary: Estude a sombra que proxectan as súas masas de edificios ao longo dun día ou dunha estación, vexa unha animación, calcule canta electricidade producirían os paneis solares dos tellados e muros nun ano típico, vexa o confort da rúa xunto a un edificio (UTCI) e obteña unha lectura de cribado do confort do vento para peóns.
keywords: estudo de sombra, sombra, horas de sol, animación, solar, FV, fotovoltaica, paneis, produción, kWh, EPW, ficheiro meteorolóxico, UTCI, confort térmico, confort exterior, estrés térmico, vento
from: 96e7af4d
---

A sección **Ambiente** sitúase baixo **Horas de sol** nas **Propiedades** dunha masa. Usa as masas que ten debuxado como edificios.

## Cargar un ficheiro meteorolóxico

Escolla un ficheiro meteorolóxico de ano típico (**.epw**) para a súa localidade. Son gratuítos no sitio meteorolóxico de EnergyPlus e en climate.onebuilding.org. O ficheiro queda no seu navegador durante esta visita. O estudo de produción solar e o de confort necesítano; o estudo de sombra funciona sen el cando o proxecto ten sistema de coordenadas.

## Estudo de sombra

Escolla unha data (ou marque **Estación** e unha última data e un paso en días) e un fuso horario, despois **Executar estudo de sombra**. Obtén un mapa das horas de sol, ou de sombra, no chan arredor das masas; unha táboa de canto chan está á sombra ao longo do día; e unha animación do día que pode reproducir ou avanzar fotograma a fotograma. **Gardar mapa**, **Gardar fotogramas da animación** (todos os fotogramas nunha soa imaxe) e **Gardar horas** (CSV) conservan os resultados.

O chan considérase plano ao nivel da masa máis baixa. Para a sombra en terreo en pendente use **Horas de sol**, que lé o terreo.

## Produción solar

Defina a eficiencia dos paneis, canta parte de cada tellado e muro está cuberta e as perdas do sistema, despois **Executar produción solar**. Para cada tellado e muro obtén a electricidade que produciría un metro cadrado de panel nun ano típico, canta parte delo lle quitan as masas veciñas, e un total para cada masa. O modelo escríbese en palabras sinxelas xunto ao botón: é unha estimación de planificación a partir dun ano típico, non unha garantía.

## Confort exterior

**Executar confort** calcula o índice térmico climático universal (UTCI) para unha persoa de pé en terreo aberto e xunto á primeira masa (lados sur, norte, leste e oeste), coa sombra de cada masa. Mostra canto ceo se ve, o UTCI medio diurno e as horas por enriba de 32 (estrés térmico) e por debaixo de 0 (estrés polo frío).

## Vento (cribado)

**Executar estudo do vento** resolve o fluxo de aire arredor das súas masas unha vez para cada dirección do vento que sopra no seu ficheiro meteorolóxico (4, 8, 12 ou 16 direccións), sobre o contorno que escolla (campo aberto, periferia ou centro da cidade), e logo suma o vento horario de todo o ano. O mapa colorea o chan segundo a clase de confort, desde verde (**sentado**), pasando por **de pé**, **paseando** e **camiñando**, ata vermello (**incómodo**): a actividade cuxa velocidade límite (4, 6, 8 e 10 m/s) se supera durante non máis do 5 % das horas. Unha segunda táboa dá o grao NEN 8100 (A a E) a partir da proporción de horas en que o vento pasa de 5 m/s. O factor de ráfaga multiplica a media horaria para dar unha ráfaga efectiva.

Como funciona, en palabras sinxelas: un solucionador de simulación de grandes remuíños de tipo lattice-Boltzmann (propio, na biblioteca `lib/wind`) nunha caixa arredor dos edificios, un perfil de velocidade do vento que sobe coa altura segundo a rugosidade escollida, e a velocidade a uns 1,5 m sobre o chan comparada coa velocidade augas arriba a 10 m. **Cribado** é rápido e grosso; **Estándar** usa máis celas e tarda moito máis. Se o panel di que a cuadrícula é grosa (menos de 10 celas sobre o edificio máis alto), ou que o fluxo aínda cambiaba, confíe menos no mapa.

**Que non é isto.** O solucionador comprobouse con fluxos de libro de texto (un canal, unha cavidade de tapa móbil) e executouse nun cubo para ver que a estela e a aceleración nas esquinas son correctas. **Non** foi validado con medicións en túnel de vento de edificios, así que cada resultado está etiquetado como non validado. Non o use para un valor de deseño, unha carga de vento nin un certificado de planificación: un enxeñeiro de vento debe executar e confirmar un estudo axeitado. O chan plano, as paredes lisas dos edificios, o atallo de rugosidade da estación meteorolóxica e a táboa de límites son simplificacións; os límites poden diferir dos criterios da súa autoridade.

## Vento con OpenFOAM (complemento)

O motor de vento integrado de enriba é experimental. Para un solucionador de fluxo axeitado, active o complemento **Vento para peóns (OpenFOAM)** en **Configuración > Complementos** (está desactivado ata que o active). É un software con licenza GPL propia, mantido á parte do resto de CadCraft, e non inclúe OpenFOAM: instáleo vostede. Logo **Motor** no bloque de vento lista OpenFOAM.

O que configura, unha vez:
1. **Instale OpenFOAM** (a serie v da ESI de openfoam.com; o complemento está probado con v2512). En Ubuntu ou Debian (tamén dentro de WSL en Windows): `curl https://dl.openfoam.com/add-debian-repo.sh | sudo bash`, despois `sudo apt install openfoam2512-default`. Instálase en `/usr/lib/openfoam/openfoam2512`. CadCraft necesita `blockMesh`, `snappyHexMesh` e `simpleFoam` para executarse. (O paquete `openfoam` 1912, máis antigo, do propio arquivo de Ubuntu tamén funciona, pero as súas funcións de obxecto fallan; o complemento lé entón os ficheiros de resultados por si mesmo.)
2. **Inicie o auxiliar** desde a cartafol `runner` do complemento con Node.js: `node cc-openfoam-runner.mjs serve`. Se OpenFOAM non está na ruta de busca, dea un pequeno `runner.json` coa ruta ao `etc/bashrc` de OpenFOAM (`{ "bashrc": "/usr/lib/openfoam/openfoam2512/etc/bashrc" }`) e inicíeo con `--config runner.json`. O auxiliar escoita só neste ordenador e imprime un token.
3. **Pegue o token** nos campos do complemento no bloque de vento (o enderezo mantense `http://127.0.0.1:8765`) e prema **Comprobar o auxiliar**.

Entón **Executar estudo do vento** traballa un caso por cada dirección do vento do ficheiro meteorolóxico: as súas masas convértense nunha superficie (STL) nunha caixa dimensionada segundo a pauta habitual (5 alturas de edificio a redor e por enriba, 10 detrás), malla con blockMesh e snappyHexMesh, execútase como RANS k-épsilon estacionario con entrada de capa límite atmosférica sobre a rugosidade que escolla, e a velocidade a 1,5 m lese e convértese nas mesmas clases de Lawson e NEN 8100. Non sae nada do seu ordenador.

**O que se comprobou.** O texto sobre os resultados di isto claramente e forma parte de cada CSV gardado. A escritura de casos, a lectura de resultados e todo o proceso do complemento proban sen OpenFOAM, e un cubo único foi executado no OpenFOAM real con tres tamaños de malla (os números están nas notas do proxecto). **Non** foi validado con medicións en túnel de vento de edificios. É unha lectura de cribado, non un valor de deseño nin un certificado. O k-épsilon estándar sobrestima a turbulencia diante dos edificios, o chan é plano, as paredes son lisas e non hai terreo nin vexetación.
