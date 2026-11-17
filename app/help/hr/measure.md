---
title: Mjerenje udaljenosti, površina i nagiba
summary: Mjerite na tlocrtu klikom na točke, duljinu i smjerni kut svake stranice, ukupni zbroj, duljinu po terenu, nagib te površinu i opseg zatvorenog oblika, i između dviju točaka na profilu dalekovoda.
keywords: mjerenje, mjeri, udaljenost, duljina, površina, opseg, smjerni kut, nagib, uzdužni nagib, ravnalo, vrpca, po terenu, profil, razlika visina
from: d614eb25
---

{{ui:Teren}} › {{ui:Više}} › {{ui:Mjeri}} (također u izborniku {{ui:Više}} radnog prostora Dalekovodi, ili pritisnite {{key:M}}) mjeri bez dodavanja bilo čega u projekt.

## Na tlocrtu

1. Odaberite {{ui:Mjeri}}, zatim kliknite točke. Klik blizu geodetske točke preuzima njezin položaj i visinu.
2. Statusna traka prikazuje broj točaka i ukupnu duljinu, duljinu i smjerni kut zadnje stranice, njezin nagib ako je teren poznat na objema krajnjim točkama te duljinu po terenu. Uz pokazivač se prikazuju stranica koja se crta i ukupni zbroj.
3. Ponovno kliknite prvu točku da zatvorite oblik: statusna traka dodaje njegovu **površinu** i **opseg**. Sljedeći klik započinje novo mjerenje.
4. {{key:Enter}} završava mjerenje i zadržava njegove vrijednosti u statusnoj traci; {{key:Backspace}} poništava zadnju točku; {{key:Esc}} briše mjerenje, a ponovni {{key:Esc}} vraća na {{ui:Odaberi}}.

Duljine su u jedinici projekta, a površine u njegovoj jedinici za površinu. Nagib i duljina po terenu koriste predloženu površinu ako postoji, inače postojeći teren; izvan površine se izostavljaju.

## Na profilu dalekovoda

U [profilu voda](topic:overhead-line#the-line-profile), {{ui:Mjeri}} na traci profila traži dva klika i čita udaljenost preko, razliku visina, pravu udaljenost i nagib između njih. Klik blizu terena, vodiča ili vrha stupa hvata se na njih. Ponovno kliknite {{ui:Mjeri}} za zaustavljanje.
