---
title: Dibuixa una línia aèria
summary: Col·loqueu suports al plànol, deixeu que CivilCraft determini el paper de cada suport i els trams entre suports terminals, i moveu els suports al plànol o al perfil de la línia.
keywords: línia aèria, suport, pal, và, secció, suport terminal, angle, suspensió, perfil, alçada, braç transversal, tirant, cable tensor
from: b8e5e272
---

## Dibuixa-la

1. Heu de tenir una superfície: el terreny sota la línia en prové ([Construeix una superfície](topic:build-surface)). Un suport sense terreny sota apareix a **Comprovacions**; escriviu-ne la **Cota del terreny** a Propietats en lloc d'això.
2. Feu clic a {{ui:Línia}} al grup Línies elèctriques i feu clic a cada suport al plànol.
3. Feu doble clic a l'últim, o premeu {{key:Enter}}.

La línia rep el conductor, el suport i l'equip que heu usat per última vegada en aquest ordinador (la primera vegada: exemples de la biblioteca). Canvieu-los a Propietats.

## La línia a Propietats

Seleccioneu la línia (feu clic a un và) per definir el seu **Conductor**, **Conductors per circuit**, **Circuits**, **Tensió**, la **Regla de distància** que ha de mantenir sobre el terreny, i l'equip **A cada suport** (un braç transversal, aïllants, accessoris). La taula enumera les seves **seccions** amb el và de referència de cadascuna, la tensió habitual i el cas de càrrega que la governa.

## Suports

Feu clic a un suport per seleccionar-lo. A Propietats:

- **Suport**: el seu element de biblioteca. Quan és massa feble, {{ui:Usa …}} posa el suport més petit del mateix material de la vostra biblioteca que suporta la càrrega.
- **Rol**: Automàtic, Suspensió, Angle o Extrem mort. Automàtic vol dir: el primer i l'últim suport són extrems morts; un gir superior a l'angle del conjunt de regles fa un suport d'angle; un gir més gran, un extrem mort.
- **Alçada sobre el terreny**: buit la pren de l'element de biblioteca (la seva longitud menys la profunditat dins del terreny).
- **També en aquest suport**: equip extra, com un **tirant**. Un suport amb tirant transmet la tracció de la línia al seu tirant.
- **Suport existent**: es comprova com els altres però no s'inclou a les quantitats.

{{ui:Suport}} afegeix un suport al và més proper al vostre clic. Arrossegueu un suport al plànol per moure'l. {{ui:Suprimeix}} l'elimina (una línia en manté almenys dos).

Les seccions van entre extrems morts: dins d'una secció el conductor corre lliurement per les pinces de suspensió, de manera que una sola tensió regeix tota la secció.

## El perfil de la línia

Feu clic a {{ui:Perfil}} (o **Perfil** a les Propietats de la línia). El panell sota el plànol mostra el terreny al llarg de la línia, cada suport des del terreny fins a la seva part superior, la fase més baixa del conductor al **Cas de càrrega** que trieu, i la distància que la línia ha de mantenir com una línia de guions. Un và que falla es mostra en vermell; el número sota cada và és la seva distància més petita.

- **Línia** tria la línia aèria a mostrar. Seleccionar una altra línia, o un dels seus suports, al plànol canvia el perfil cap a ella.
- Desplaceu el punter sobre el perfil: una línia guia el segueix, i l'etiqueta indica la distància al llarg de la línia, el terreny, el conductor i la distància lliure en aquell punt (i diu quan la distància és inferior a la regla de la línia).
- {{ui:Mesura}} a la barra del perfil: feu clic a dos punts per obtenir la distància horitzontal, la diferència d'alçada, la distància recta i el pendent entre tots dos. Un clic prop del terreny, del conductor o de la part superior d'un suport s'hi ajusta. Torneu a fer clic a {{ui:Mesura}} per aturar-ho.
- Els obstacles que travessa la línia s'alcen des del terreny: els dibuixats com a barres, les plantes de Paisatge com la seva capçada, els murs com a barres (vegeu [Comprovacions de línies elèctriques](topic:power-line-checks#clearances)). Les rutes de cables i les canonades que la línia travessa es marquen sota el terreny a la seva part superior, amb el seu nom.

- Arrossegueu un suport lateralment per moure'l al llarg de la línia.
- Arrossegueu la seva part superior amunt o avall per fixar-ne l'alçada sobre el terreny.
