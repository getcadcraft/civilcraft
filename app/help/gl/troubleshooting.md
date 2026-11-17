---
title: Solución de problemas
summary: Síntomas, causas e solucións dos problemas que se atopan en CivilCraft, coas mensaxes exactas que mostra a aplicación.
keywords: problemas, erros, non funciona, solución, axuda, mensaxes, solucionar, rexeitado, falta, incorrecto, trocado, faltan curvas de nivel
from: a9f7dedc
---

As mensaxes aparecen na barra de estado, no fondo á dereita, en caixas dos paneis esquerdo e dereito e nos diálogos. Cítanse aquí tal como as mostra a aplicación.

## Abrir ficheiros

**"Este ficheiro supera os 200 MB; CivilCraft aínda non abre ficheiros tan grandes."**
Divida o ficheiro de puntos ou reduza os datos antes de abrilo.

**"Non se puido abrir site.json: Este non é un ficheiro de proxecto de CivilCraft."**
O ficheiro termina en `.json` ou comeza por `{`, pero non é un proxecto de CivilCraft. Os ficheiros de puntos non deben comezar por `{`.

**"Non se puido abrir … Este ficheiro de proxecto é dunha versión máis nova de CivilCraft (versión 2)."**
O proxecto gardouse cunha versión máis nova. Ábrao nela, ou exporte desde el un LandXML.

**"Non se puido abrir … Este é un XML pero non un LandXML (o seu elemento raíz é <…>)."**
O ficheiro é outro tipo de XML. Exporte un LandXML desde o outro programa.

**"… non ten puntos, superficies TIN nin trazados que CivilCraft poida ler."**
Todo o que hai no ficheiro é algo que CivilCraft omite (por exemplo, só superficies en cuadrícula, ou só trazados en espiral). O resto da mensaxe indica o que había. Vexa [LandXML: o que se le e se escribe](topic:landxml-reference).

**"Non se puido cargar a mostra: …"**
{{ui:Abrir o sitio de mostra}} le un ficheiro do sitio de CadCraft. Sen conexión só funciona se CivilCraft se gardou para usar sen conexión (o botón da barra da aplicación mostra {{ui:Listo sen conexión}}). Conéctese, prema {{ui:Gardar para usar sen conexión}} e, desde ese momento, funciona sen conexión. Vexa [Sen conexión](common:offline).

**{{ui:Gardar para usar sen conexión}} mostra {{ui:Non se puido gardar}}.**
Algúns ficheiros non se descargaron. Comprobe a conexión e prema de novo o botón.

**{{ui:Gardar para usar sen conexión}} mostra {{ui:Sen copia sen conexión}}.**
Esta ventá do navegador non pode gardar unha copia sen conexión, normalmente porque é unha ventá privada ou o computador está xestionado. Abra CivilCraft nunha ventá normal.

**Sen conexión, a aplicación non se abre.**
Non se gardou para usar sen conexión neste navegador, ou o navegador borrou os datos do sitio (Safari fai isto cos sitios que non se visitan durante varias semanas). Conéctese, abra CivilCraft e prema {{ui:Gardar para usar sen conexión}}.

**A copia sen conexión é unha versión anterior.**
Prema {{ui:Listo sen conexión}} e despois {{ui:Gardar de novo (obter a versión máis recente)}} estando conectado.

**Un ficheiro aparece en gris na caixa de abrir.**
A caixa só lista os ficheiros de puntos, LandXML e de proxecto segundo as súas terminacións. Arrastre o ficheiro até o plano, ou cámbielle o nome a `.txt`.

## Importar puntos

**"Non se puido ler ningún punto deste ficheiro."**
Escolla a orde das columnas en **Columnas** a man. Se nada funciona, abra o ficheiro nun editor de texto e comprobe que hai un punto por liña, con números.

**O sitio aparece reflectido, xirado ou estirado até formar unha liña.**
O norte e o leste están trocados. O resumo dicía "adiviñado polo número de columnas". Escolla PENZD en lugar de PNEZD (ou ao revés) en **Columnas**, ou importe de novo.

**Puntos moi lonxe do resto, e o plano aleado até un punto.**
Unha fila ten un erro tipográfico nunha coordenada, ou o ficheiro mestura sistemas de coordenadas. Busque o punto (prema sobre el para ver o seu número) e corrixa o ficheiro.

**Filas listadas baixo "Filas non lidas".**
Vexa a táboa en [Importar puntos de levantamento](topic:import-points#rows-that-are-not-read).

**Os meus puntos antigos desapareceron.**
Importar un ficheiro de puntos substitúe todos os puntos e borra a desfacer. Abra o proxecto gardado para recuperalos.

## A superficie

**"Superficie: sen construír" cunha caixa vermella.**
A caixa indica o motivo: "Unha superficie precisa polo menos tres puntos con cotas.", "Os puntos están todos nunha liña: non hai triángulos.", "Non hai puntos con cotas.", "O límite non coincide cos puntos." ou "Non queda ningún triángulo dentro do límite." Comprobe a orde das columnas, os grupos de puntos (están en {{ui:Deixada fóra}}?) e o límite.

**As curvas de nivel cortan en liña recta unha vala ou unha cresta.**
Esa liña non é unha liña de ruptura. Estableza o seu grupo en {{ui:Liña de ruptura}}, ou debúxea coa ferramenta {{ui:Liña de ruptura}}. Vexa [Construír e refinar a superficie](topic:build-surface).

**Un grupo de liñas de ruptura debuxa un zigzag.**
O grupo contén máis dunha liña, ou os seus puntos non están numerados ao longo da liña. Volva estabelecer o grupo en {{ui:Puntos}} e debuxe cada liña coa ferramenta {{ui:Liña de ruptura}}.

**Triángulos longos e estreitos ao longo do exterior.**
Debuxe un límite ({{key:O}}) ou estableza **Lado exterior máis longo**.

**Non hai curvas de nivel, aínda que a superficie está construída.**
Ou {{ui:Curvas de nivel}} está desactivado en **Visualización**, ou o intervalo é tan pequeno que habería máis de 2 000 niveles de curvas. Escolla un intervalo maior.

**As liñas de ruptura ou un límite non cambian nada.**
A superficie veu dun LandXML ("Superficie (desde LandXML)"). Úsase tal como está. Prema {{ui:Reconstruír a superficie a partir dos puntos}} para construíla a partir dos puntos.

**"Aínda non hai superficie: importe primeiro os puntos de levantamento."**
A liña de ruptura, o límite e a plataforma precisan unha superficie de terreo existente. Importe primeiro os puntos.

**"Prema un punto de levantamento cunha cota: unha liña de ruptura toma as cotas dos puntos."**
A ferramenta {{ui:Liña de ruptura}} só escolle puntos de levantamento. Amplíe e prema sobre un punto (un cadrado laranxa mostra o que vai tomar).

## Debuxo

**O meu último punto desapareceu cando fixen dobre clic para rematar.**
Nesta versión, o dobre clic remata o trazado, a plataforma, a liña de ruptura ou o límite, pero descarta o punto no que fixo dobre clic. Prema unha vez sobre o último punto e prema {{key:Enter}}. Use {{key:Mod+Z}} se xa pasou, e debuxe de novo.

**Non podo rematar un debuxo nunha tableta.**
Para rematar fai falla {{key:Enter}}; aínda non hai botón na pantalla. Conecte un teclado. Vexa [Rato, trackpad e tacto](topic:keyboard#mouse-trackpad-and-touch).

**Arrastrar para colocar un punto desprázaa en lugar de colocalo.**
Un arrastre de máis de uns poucos píxeles desprazar o plano en todas as ferramentas. Prema sen mover.

**"Un trazado precisa polo menos dous puntos." / "Unha plataforma precisa polo menos tres esquinas." / "Unha canle de tubaxe precisa polo menos dúas estruturas."**
Premeu {{key:Enter}} demasiado cedo. O debuxo descártase; comece de novo.

**Teclas como A ou G non fan nada.**
Unha caixa de texto ou unha lista dun panel aínda ten o foco, polo que as letras vanlle a ela. Prema unha vez sobre o plano e logo prema a tecla. Nun Mac, a tecla de borrar é Backspace para o navegador: use Fn e borrar para eliminar unha selección.

## Trazados e perfís

**"As curvas en PI 2 e PI 3 solápanse: … Use radios máis pequenos."**
Dúas curvas precisan máis tanxente da que hai entre os seus PI. Reduza un ou os dous radios na táboa de PI, ou separe os PI.

**"PI 3 dá a volta en seco; non pode admitir unha curva."**
O trazado retrocede sobre si mesmo nese PI. Mova ou elimine o PI.

**"Este trazado non ten terreo debaixo para comezar."**
O trazado está fóra da superficie. Móvao sobre a superficie, ou engada PVI prema sobre o plano con {{ui:Engadir PVI}} activado.

**"A curva vertical no PVI 3 (L = …) comeza antes de que acabe a curva ou o PVI anterior." / "… pasa do seguinte PVI."**
Acurte a lonxitude da curva ou separe os PVI.

**"Xa hai un PVI en …"**
Xa existe un PVI nesa estación. Prema noutro lugar, ou arrastre o existente.

**A vista do perfil está baleira: "Debuxe un trazado para ver o seu perfil."**
Non hai trazado, ou o seleccionado ten erros.

## Corredores e plataformas

**"O corredor precisa un perfil de deseño sen erros."**
Comece un perfil de deseño ({{ui:Comezar desde o terreo}}) e corrixa os solapamentos de curvas.

**"… os taludes laterais saen da superficie antes de atopar o terreo." / "… as liñas de talude saen da superficie antes de atopala …"**
A nivelación chega ao bordo da superficie antes de atopar o terreo. Mova o deseño cara ao interior desde o bordo, ou achéguello ao terreo. Unha nova plataforma debuxada en parte fóra da superficie pode comezar na cota 0: escriba unha cota real.

**"As liñas de intersección do corredor cruzan …" / "A liña de intersección cruza consigo mesma …"**
Os taludes de lados diferentes chocan entre si: curvas pechadas, plataformas estreitas, desmontes profundos ou terraplenes altos. Use un radio maior, un conxunto máis estreito, unha plataforma máis ancha ou taludes máis inclinados.

**"Aínda non hai volumes: unha plataforma precisa nivelarse sen problemas."**
Corrixa os problemas indicados na caixa vermella que hai enriba.

**{{ui:Proposto (nivelado)}} aparece en gris.**
Aínda non se nivela ningunha plataforma nin corredor.

## Tubaxes

**"P2 aínda non ten cotas de fondo."**
Prema {{ui:Fixar as súas cotas de fondo segundo as regras}} ou escriba as cotas de fondo.

**"P1: non hai terreo en S1 desde onde comezar."**
A estrutura augas arriba está fóra da superficie e non ten brocal. Escriba un brocal para ela.

**Todas as tubaxes aparecen marcadas despois de mover unha estrutura.**
Mover unha estrutura non cambia as cotas de fondo. Prema {{ui:Fixar todas as cotas de fondo segundo as regras}}.

Todas as mensaxes da rede explícanse en [Trazar unha rede de tubaxe por gravidade](topic:pipe-network#read-and-fix-problems).

## Gardar e exportar

**"Non hai nada que exportar aínda." / "Non hai nada que debuxar aínda."**
O proxecto está baleiro. Importe primeiro os puntos.

**Non atopo o ficheiro gardado.**
Está nas descargas do navegador (normalmente na cartafol Descargas). Vexa [Ficheiros que pode abrir, gardar e exportar](topic:files#where-the-files-go).

**A escala do PDF é incorrecta no papel.**
Imprima ao 100 % ou ao tamaño real, non "axustar á páxina".

**Aparecen signos de interrogación no texto do PDF.**
Os nomes ou as descricións usan caracteres fóra do conxunto da Europa occidental. A mensaxe de estado conta eses caracteres. Cambie o nome con caracteres sinxelos.

**O debuxo sae cortado polos bordos.**
A escala é grande de máis para a folla. Escolla a escala marcada "(cabe)", unha folla maior, ou {{ui:O que se ve na pantalla}}.

**{{key:Mod+P}} abriu o diálogo de impresión do navegador.**
A páxina non tiña o foco. Peche o diálogo, prema sobre o plano e prema de novo {{key:Mod+P}}, ou prema {{ui:PDF}}.

## A propia aplicación

**A pantalla está en branco ou a barra de ferramentas non fai nada.**
Use unha versión actual de Chrome, Edge, Firefox ou Safari, e recargue a páxina. Vexa [Navegadores](common:browsers).

**A aplicación vai lenta cun ficheiro grande de puntos.**
Desactive {{ui:Triángulos}}, {{ui:Etiquetas de puntos}} e {{ui:Bandas de altitude}}, e use un intervalo de curvas de nivel maior. As superficies moi grandes tardan un momento en reconstruírse despois de cada cambio.

**O navegador pregunta "¿Saír do sitio?"**
O proxecto ten cambios sen gardar. Quédese, garde con {{key:Mod+S}} e despois saia.
