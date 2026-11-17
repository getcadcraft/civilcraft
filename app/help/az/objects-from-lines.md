---
title: Xətlərdən obyektlər, bağlantı saxlanılır
summary: Xəttdən döşəmə, bitkiləndirilmiş sahə, yataq, hasar, cığır, divar, künc daşı, pillə, pandus, platforma, arx və ya xarakterik xətt yaradın; xətt hərəkət etdikdə o da hərəkət edir, bağlantını qırana qədər.
keywords: xəttdən, xətt, DWG, DXF, bağlantı, bağlı, izləmə, yenidən yaratma, bağlantını qır, xarakterik xətt, çertyoj xətti, idxal olunmuş qat, kontur, supercad studio, çəkilmiş xətt
from: eb67a0c6
---

{{ui:Xəttdən}} (Landşaft › {{ui:More}}): xarakterik xəttə və ya idxal olunmuş DWG/DXF qatının xəttinə və ya konturuna klikləyin. Qapalı xətt döşəmə, çəmən, bitkiləndirilmiş yataq, çəmənlik, örtük bitkisi, yataq və ya platforma yarada bilər; açıq xətt cığır, divar, künc daşı, pillələr (ilk və son nöqtəsi), pandus, hasar və ya arx. Hər iki növ **xarakterik xətt** yarada bilər, xarakterik xəttin özü istisna olmaqla.

## Xəttdən yaradılmış xarakterik xətt

Xəttdən yaradılmış xarakterik xətt xəttin nöqtələrini alır; xətt qapalı idisə, o da qapalı olur. Onun kotaları mövcud yer üzərində qurulur (hələ yer yoxdursa 0), istifadəsi isə **Söndürülüb**-dür: siz istifadə seçib kotalarını Xassələrdə təyin edənə qədər heç bir yer formalaşdırmır. Xətt hərəkət etdikdə eyni nöqtə sayına malik xarakterik xətt təyin etdiyiniz hər kotanı saxlayır; xətt nöqtə qazandıqda və ya itirdikdə kotalar yenidən yer üzərində qurulur. Bax [Xarakterik xətlər](topic:feature-lines).

Yeni obyekt öz xəttinə **bağlantı** saxlayır. Xətt hərəkət etdikdə (nöqtələrini sürüklədikdə, ya da çertyoj köçürüldükdə və ya yenidən oxunduqda) obyekt eyni geri alma addımında yeni formanı alır və yer dəyişdiriciləri vasitəsilə təklif olunan yer də izləyir. Xassələr nəyə bağlı olduğunu göstərir; {{ui:Bağlantını qır}} onu sərbəst edir.

Xətlər əvvəlcə yoxlanılır: xətt ən azı 2 nöqtə olmalıdır (kontur üçün 3), ən çoxu 5000, həqiqi ədədlər; kontur qapalı olmalı və özü ilə kəsişməməlidir. Yoxlamadan keçməyən xətt istifadə olunmur: obyekt olduğu kimi qalır və Problemlər paneli səbəbi göstərir. Xətt silinərsə obyekt qalır və Problemlər paneli bunu qeyd edir.

## SuperCad Studio-da

Sahəni və 2D çertyojunu eyni layihədə açın. 2D çertyojunda bir xətt və ya polixətt seçin, Ctrl+K basın və {{ui:Çertyoj xəttindən landşaft obyekti}} əmrini işə salın: CivilCraft yuxarıdakı kimi nə yaradılacağını soruşur və obyekt həmin çertyoj xəttinə bağlı qalır. Çertyojda xətləri dəyişdikdən sonra Ctrl+K {{ui:Çertyojdan landşaftı yenilə}} obyektlərin izləməsinə səbəb olur; hər xətt üçün bir geri alma addımı. Layihənin bağlantı faylı hansı obyektin hansı xətti izlədiyini qeyd edir. SuperCad Studio-nun öz yardımında Landşaft mövzusu var.
