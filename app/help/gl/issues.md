---
title: Incidencias e BCF
summary: Fixe un problema no plano, nunha estación de trazado, nun punto da superficie ou nun tubo, asígnelle un estado e comentarios, e intercambie as incidencias como ficheiros BCF 2.1 xunto ao ficheiro LandXML.
keywords: incidencia, incidencias, bcf, comentario, anotación, defecto, obra, marcador, estado, aberto, resolto, pechado, bim collaboration format, landxml, problemas
from: e44153b1
---

Unha incidencia é unha nota fixada nun lugar do seu debuxo de CivilCraft, cun título, un estado e comentarios. Úsea para indicar ao persoal de obra ou a outro programa o que deben revisar, e para ler as respostas que lle dean.

## Engadir unha incidencia

1. Abra **Superficie, Máis, Incidencias (BCF)...**
2. Escriba un título e o que está mal.
3. Escolla onde fixar o marcador: o centro da vista en planta, o punto da superficie do centro, unha estación do trazado seleccionado (escriba a estación e un desfase; a dereita é positiva), ou o tubo, a estrutura ou a liña de elemento seleccionados.
4. Prema en **Engadir incidencia**. O marcador aparece na planta como un pequeno rombo co seu número.

Prema no título dunha incidencia para achegar a vista, cambie o seu estado na lista (Aberto, Activo, Resolto, Pechado) e engada comentarios. Cada cambio é un paso de **Desfacer**, e as incidencias gárdanse no ficheiro do proxecto.

## Intercambialas como BCF

- **Exportar BCF** escribe un ficheiro BCF 2.1 cun tema por incidencia: título, estado, comentarios e unha vista con cámara ortogonal en planta e o marcador.
- **Importar BCF** lee un ficheiro BCF (os ficheiros 2.0 e 3.0 lense na medida en que coinciden con 2.1). Un tema cun guid que xa ten actualiza esa incidencia (estado, comentarios novos) en lugar de engadir unha segunda.
- **Desde Problemas** crea unha incidencia por cada entrada aberta do panel Problemas que indique onde está.

O BCF leva metros nas coordenadas propias deste proxecto, sen desprazamento. O outro programa debe estar no mesmo sistema de coordenadas que o seu ficheiro LandXML para que os marcadores caian no lugar correcto. O elemento ao que apunta un marcador (trazado, estación, desfase, tubo) viaxa como etiquetas que comezan por «cc:», que CivilCraft lee de volta.

## O que non se comprobou

Os marcadores e as vistas probáronse só escribindo un ficheiro e lendo de novo en CivilCraft. Aínda non o abriu ningún outro programa BIM, e se o «ver á escala do mundo» do BCF significa a altura completa ou a media altura da vista depende de cada programa: CivilCraft escribe a altura completa.
