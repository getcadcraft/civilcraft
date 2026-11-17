---
title: Comproveu els volums amb els límits de zonificació que escriviu
summary: Escriviu els retrocessos d'una parcel·la línia per línia, un límit d'alçada, un pla d'exposició al cel, un coeficient d'edificabilitat i una cobertura; veieu l'envolupant edificable al plànol i llegiu quins volums superen quin límit.
keywords: zonificació, retrocés, retrocessos, davant, lateral, posterior, envolupant, superfície edificable, límit d'alçada, pla d'exposició al cel, coeficient d'edificabilitat, FAR, cobertura, parcel·la, ordenança, comprovació normativa
from: 3e267b31
---

**CivilCraft no té cap codi de zonificació.** No coneix les normes de cap ciutat i no n'inclou cap biblioteca. Tots els números d'aquesta pàgina els escriviu vosaltres, presos de la vostra pròpia ordenança, i cada resultat indica que es mesura amb els límits que heu escrit. És una manera de veure com els límits d'una parcel·la condicionen un edifici, no un dictamen sobre si un disseny està permès.

## Escriviu els límits

A **Propietats**, sota **Volums d'edificació**, trieu una **Parcel·la** (o seleccioneu un volum: els límits de la seva parcel·la es mostren sota ell). Ompliu el que correspongui; deixeu una casella buida per a «sense límit»:

- **Línia de carrer**: la línia de parcel·la a la façana. El **Retrocés davanter** s'aplica a aquesta, el **Retrocés posterior** a la línia més oposada, i el **Retrocés lateral** a la resta.
- **Límit d'alçada**.
- **Pla d'exposició al cel**: comença a una alçada a la línia de parcel·la i puja la quantitat que escriviu per cada 1 de recorregut cap a dins, mesurada des de la línia de carrer o des de totes les línies de parcel·la (2 vol dir 2 a 1). L'alçada permesa sobre un punt és la més baixa entre el pla i el límit d'alçada.
- **Coeficient d'edificabilitat** (superfície bruta construïda dels volums de la parcel·la dividida per l'àrea de la parcel·la) i **Cobertura** (les seves petjades dividides per l'àrea de la parcel·la, escrita en percentatge).

## L'envolupant

Marqueu **Mostra l'envolupant al plànol** per dibuixar-la a la capa `A-MASS-ENVL`. L'envolupant és la parcel·la retallada des de cada línia de parcel·la pel seu propi retrocés, amb les línies desplaçades unides en cantonades a inglet. Una línia de parcel·la formada per una corba es pren com a cordes curtes dins de 0.01 de la corba. Funcionen tant les parcel·les convexes com les còncaves. Si els retrocessos es plegant sobre si mateixos (un retrocés profund en una parcel·la estreta o molt còncava) no hi ha envolupant, i Propietats ho indica; proveu distàncies més petites.

## El resultat

Sota les caselles, cada volum i cada límit tenen una línia, amb una marca o una creu:

- **retrocessos**: l'àrea del volum que queda fora de l'envolupant;
- **alçada**: l'alçada del volum comparada amb la més permesa sobre la seva petjada (un prisma d'una sola alçada està limitat per l'alçada permesa més baixa en qualsevol de les seves cantonades);
- **coeficient d'edificabilitat** i **cobertura**: tots els volums de la parcel·la sumats.
