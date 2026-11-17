---
title: Çështjet dhe BCF
summary: Lidh një problem me planimetrinë, me një stacion aksi rrugor, me një pikë sipërfaqeje ose me një tub, jepi një gjendje dhe koment, dhe shkëmbe çështjet si skedarë BCF 2.1 pranë skedarit LandXML.
keywords: çështje, çështje, bcf, koment, shënime, defekt, defekt, terren, pin, gjendje, e hapur, e zgjidhur, e mbyllur, format bashkëpunimi bim, landxml, probleme
from: e44153b1
---

Një çështje është një shënim i lidhur me një vend në vizatimin tënd CivilCraft, me një titull, një gjendje dhe komente. Përdoreni për t'i thënë stafit të terrenit ose një programi tjetër çfarë duhet parë, dhe për të lexuar përgjigjet e tyre.

## Shto një çështje

1. Hap **Sipërfaqe, Më shumë, Çështje (BCF)...**
2. Shkruaj një titull dhe çfarë nuk shkon.
3. Zgjidh ku ta lidhësh: qendrën e pamjes së planimetrisë, pikën e sipërfaqes në qendër, një stacion të aksit rrugor të përzgjedhur (shkruaj stacionin dhe një shmangie, e djathta është pozitive), ose tubin, strukturën ose vijën e veçorisë së përzgjedhur.
4. Shtyp **Shto çështjen**. Pina shfaqet në planimetri si një romb i vogël me numrin e saj.

Kliko titullin e një çështjeje për ta zmadhuar, ndrysho gjendjen e saj në listë (E hapur, Aktive, E zgjidhur, E mbyllur) dhe shto komente. Çdo ndryshim është një hap zhbërjeje, dhe çështjet ruhen në skedarin e projektit.

## Shkëmbe ato si BCF

- **Eksporto BCF** shkruan një skedar BCF 2.1 me një temë për çdo çështje: titullin, gjendjen, komentet, dhe një pamje me një kamerë ortogonale planimetrie dhe pinën.
- **Importo BCF** lexon një skedar BCF (skedarët 2.0 dhe 3.0 lexohen deri aty ku përputhen me 2.1). Një temë me një guid që e ke tashmë e përditëson atë çështje (gjendjen, komentet e reja) në vend që të shtojë një të dytë.
- **Nga Problemet** krijon një çështje për çdo hyrje të hapur në panelin Problemet që tregon ku ndodhet.

BCF mbart metra në koordinatat e vetë këtij projekti, pa zhvendosje. Programi tjetër duhet të jetë në të njëjtin sistem koordinatash me skedarin tënd LandXML, që pinat të bien në vendin e duhur. Elementi ku tregon një pinë (aksi, stacioni, shmangia, tubi) udhëton si etiketa që fillojnë me "cc:", të cilat CivilCraft i lexon përsëri.

## Ç'nuk kontrollohet

Pinat dhe pamjet u testuan vetëm duke shkruar një skedar dhe duke e lexuar përsëri në CivilCraft. Asnjë program tjetër BIM nuk i ka hapur ende, dhe nëse një "view to world scale" i BCF do të thotë lartësia e plotë apo gjysma e lartësisë së pamjes ndryshon nga programi në program: CivilCraft shkruan lartësinë e plotë.
