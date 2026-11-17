---
title: Distribueix matrius solars al terreny
summary: Col·loca taules solars de muntatge al terreny dins d'una parcel·la o plataforma, amb les files separades segons el terreny on es recolza cadascuna, el terreny inclinat deixat buit, l'energia anual calculada i les taules mostrades al plànol i en 3D.
keywords: solar, fv, fotovoltaic, matriu, muntatge al terreny, taules, files, separació entre files, ombra, terreny, pendent, pilots, producció, kWp, energia, horitzó
from: 95593fd6
---

## Què aprendreu

Com distribuir un camp de taules solars en un emplaçament que no és pla, i què signifiquen els números. Obriu-lo des de Superfície › Més › Matrius solars.

## Distribueix les taules

1. Trieu **On**: una parcel·la o una plataforma del projecte, o escriviu els vèrtexs d'una àrea. Marqueu les plataformes o parcel·les que han de quedar **buides** (un edifici, una bassa).
2. Escriviu la **latitud i la longitud** de l'emplaçament. El sol depèn d'aquestes dades; no se n'endevina cap. Si el projecte té un sistema de coordenades, **Situa a partir del sistema de coordenades** les omple.
3. Establiu la inclinació, l'orientació (en blanc és cap a l'equador), quants mòduls formen una taula, i la potència i la mida del mòdul. Els valors del mòdul comencen com a valors genèrics i així s'indica; escriviu els vostres.
4. Premeu **Distribueix les taules**. La finestra mostra el nombre de taules i de mòduls, la mida en kWp i la distància entre files.

Cada taula és una columna dins de l'àrea, col·locada des del davant i desplaçada cap enrere. Una taula només es col·loca on el terreny que hi ha sota és dins del límit de pendent, dins de l'àrea i del retrocés, i on els pilots que necessita no són més alts que el límit que heu fixat. Els llocs que no compleixen el criteri queden buits, i la finestra indica quants són i per què.

## Les files se separen segons el terreny

En terreny pla, les files se separen segons la regla habitual d'absència d'ombra: l'ombra d'una fila al migdia del solstici d'hivern no ha d'arribar a la vora inferior de la fila següent. En un pendent, CivilCraft aplica la mateixa regla al terreny on es recolza realment la fila següent. On el terreny puja darrere d'una taula, les files poden estar més juntes; on baixa, queden més separades. La finestra mostra la separació mínima, la màxima i la mitjana, al costat de la separació en terreny pla, perquè pugueu veure què ha fet el relleu.

El pla d'una taula s'eleva sobre pilots fins que cada punt de mostreig que hi ha sota queda per sobre del terreny, amb la distància lliure que heu fixat. El pilot més alt apareix al resultat.

## L'energia anual

**Energia anual** calcula la llum sobre el pla inclinat per a un dia representatiu de cada mes, la temperatura de la cèl·lula, les pèrdues que heu escrit, l'ombra que les taules projecten les unes sobre les altres i els turons de l'horitzó que treuen el sol que amaguen. El cel és un cel serè, de manera que el resultat és un límit superior; el temps real donarà un resultat inferior. És una estimació de les primeres fases del disseny, no un informe de producció.

## Desa-ho

**Desa al projecte** conserva les dades d'entrada i els números al fitxer del projecte; les taules es tornen a calcular a partir del terreny quan s'obre el fitxer, de manera que una superfície canviada les desplaça. Es mostren al plànol i en 3D (Mostra › Matrius solars). La llista de taules es baixa en CSV. Un pas de desfer elimina o restaura una matriu.

## Encara no implementat

Dades meteorològiques en lloc del cel serè, taules que segueixen el terreny en la direcció est-oest, seguidors, i el disseny elèctric (cadenes, cable, inversors) a CivilCraft. El panell Solar PV de BimCraft té les cadenes i l'esquema unifilar per a cobertes.
