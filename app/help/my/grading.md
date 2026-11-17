---
title: အဆောက်အအုံ pad ကို grade လုပ်ခြင်း
summary: ပြားသော pad ကို ဆွဲ၊ ၎င်း၏ elevation နှင့် cut နှင့် fill slope များကို သတ်မှတ်ပြီး CivilCraft က ရှိပြီးမြေပြင်သို့ daylight လုပ်ကာ proposed surface သို့ ထည့်ခြင်း။
keywords: retaining wall, retaining walls, ထောင်ထားသော ဘက်, slope အစား နံရံ, ဘက်တစ်ဘက်စီ slope, embankment, grading, pad, အဆောက်အအုံ pad, daylight, feature line, grading အုပ်စု, cut slope, fill slope, ပြီးစီးသော grade, proposed surface, site grading
from: 482319a6
---

pad သည် တစ်ပြေးညီ elevation ရှိသော ပြားသောနေရာ ဖြစ်သည်။ ၎င်း၏အနားမှ CivilCraft က မြေပြင်ထက်မြင့်သော နေရာတွင် သင်၏ cut slope ဖြင့်၊ နိမ့်သော နေရာတွင် fill slope ဖြင့် အပြင်ဘက်သို့ grade လုပ်ပြီး slope သည် ရှိပြီးမြေပြင်နှင့် တွေ့သည်အထိ ဆက်သွားသည်။ ထိုတွေ့ဆုံသော မျဉ်းသည် daylight line ဖြစ်သည်။ pad နှင့် ၎င်း၏ slope များသည် daylight line အတွင်းရှိ ရှိပြီးမြေပြင်ကို အစားထိုးပြီး proposed surface ကို ဖြစ်စေသည်။

## Pad ကို ဆွဲခြင်း

ဦးစွာ ရှိပြီးသား ground surface လိုအပ်သည်။

1. {{key:G}} ကို နှိပ်ပါ၊ သို့မဟုတ် **Design** အုပ်စုရှိ {{ui:Pad}} ကို နှိပ်ပါ။
   အကြံပြုချက်က "Pad: ထောင့်များကို နှိပ်ပါ။ Enter သို့မဟုတ် နှစ်ချက်နှိပ်ခြင်းဖြင့် ပြီးစီးမည်၊ Backspace က နောက်ဆုံးကို ဖျက်မည်၊ Esc က ပယ်ဖျက်မည်။" ဟု ပြသည်။
2. pad ၏ ထောင့်များကို အစဉ်လိုက် နှိပ်ပါ၊ မည်သည့်လမ်းကြောင်းဖြင့်မဆို။ အပြာရောင် outline က pointer ကို လိုက်သည်။
3. နောက်ဆုံးထောင့်ပြီးနောက် {{key:Enter}} ကို နှိပ်ပါ (အနည်းဆုံး သုံးခု)။
   pad ကို ဆွဲပြီး ရွေးထားသည်။ ၎င်းသည် အလယ်ရှိ မြေပြင် elevation ဖြင့် 0.1 သို့ ပြည့်စုံစွာ စတင်ပြီး cut slope 2 : 1 နှင့် fill slope 3 : 1 ရှိသည်။ status bar က ဥပမာ "Pad 1 at elevation 254.3 (the ground at its middle), cut 2:1, fill 3:1. Change them in Properties." ဟု ပြသည်။

:::warning
{{key:Enter}} ဖြင့် ပြီးစီးပါ။ နှစ်ချက်နှိပ်ခြင်းဖြင့်လည်း ပြီးစီးသော်လည်း ဤ build တွင် နှစ်ချက်နှိပ်ထားသော ထောင့်ကို ချန်လှပ်ပစ်သည်။ နောက်ဆုံးထောင့်ကို တစ်ကြိမ်နှိပ်ပြီး {{key:Enter}} ကို နှိပ်ပါ။
:::

pad outline သည် ကိုယ်ဘာသာ မဖြတ်ရပါ ("The pad outline crosses itself." ဟု ပြသည်)။

## Elevation နှင့် slope များ သတ်မှတ်ခြင်း

pad ကို ရွေးထားစဉ် ညာဘက် panel တွင် **Pad** ကို ပြသည်:

1. **Name**။
2. **Elevation**: pad ၏ ပြားသော elevation။
3. **Cut slope** နှင့် **Fill slope**, H:V အဖြစ် (2 သည် 2 : 1)။ နှစ်ခုစလုံး 0 ထက် ကြီးရမည်။
4. **Pad area** နှင့် **Corners** ကို ကိုးကားရန် ပြသည်။

တန်ဖိုးတစ်ခုစီ နောက်တွင် {{key:Enter}} ကို နှိပ်ပါ။ daylight line၊ proposed surface နှင့် ပမာဏများ ချက်ချင်း အပ်ဒိတ် ဖြစ်သည်။

field များအောက်တွင် ဥပမာ "Daylight line: 48 slope lines (20 in cut, 28 in fill), farthest 31.20 ft out." ကဲ့သို့ စာကြောင်း ဖတ်ရသည်။ plan က daylight line နှင့် slope line များကို magenta ဖြင့် ပြသည်။

## Daylight ကို ရှာပုံ

- slope line များသည် အနားတစ်ခုစီမှ ထောင့်မှန်ထွက်ပြီး pad အရွယ်၏ နှစ်ဆယ်မှ တစ်ခုခန့် ခြားတွင် ထွက်သည်။
- အပြင်ဘက်ထောင့်များတွင် ထောင့်ပတ်လည်ကို slope ပတ်နိုင်ရန် 10° တိုင်း ပျံ့ထွက်သည်။
- အတွင်းဘက်ထောင့်များတွင် တစ်ကြောင်းသည် bisector တလျှောက် ပြေးပြီး pad ၏ အနားနှစ်ခုမှ slope များ တွေ့ဆုံသည်။
- မျဉ်းတစ်ကြောင်းစီသည် မြေပြင်သို့ ရောက်သည်အထိ cut slope ဖြင့် တက်သည် သို့မဟုတ် fill slope ဖြင့် ဆင်းသည်။

## ဘက်တစ်ဘက်စီ slope များနှင့် ထိန်းသိမ်းနံရံများ

pad၊ platform သို့မဟုတ် berm ၏ Properties တွင် **Sides and retaining walls** အောက်၌ ဘက်တစ်ဘက်စီကို ကိုယ်ပိုင်နည်းဖြင့် grade လုပ်နိုင်သည်။ Side 1 သည် ပထမထောင့်မှ ဒုတိယထောင့်သို့၊ side 2 သည် ဒုတိယမှ တတိယသို့ စသည်ဖြင့် ပြေးသည်။

- **All sides**: **Sloped** က အထက်ပါ cut နှင့် fill slope ကို ဘက်တိုင်းတွင် သုံးသည်; **Vertical: retaining walls** က ဘက်တိုင်းတွင် နံရံ ထားသည်။
- ဘက်တစ်ဘက်စီအတွက်: **Slopes above**၊ **Its own slopes** (ထိုဘက်အတွက် cut နှင့် fill slope ကို ရိုက်ထည့်ပါ) သို့မဟုတ် **Vertical (retaining wall)**။
- slope ကို `3` သို့မဟုတ် `3:1` (horizontal ကို vertical 1 အတွက်)၊ `33%` သို့မဟုတ် `18.4°` ဟု ရိုက်ထည့်နိုင်ပြီး H:1 အဖြစ် ပြသည်။ pad ၏ ကိုယ်ပိုင် **Cut slope** နှင့် **Fill slope** လည်း တူညီစွာ ယူသည်။
- ဒေါင်လိုက်ဘက်တွင် embankment မရှိ: နံရံသည် pad မှ အောက်သို့ (fill တွင်) သို့မဟုတ် မြေပြင်မှ pad သို့ (cut တွင်) အနားတလျှောက် ပြေးသည်။ **Wall thickness** (စတင်ရန် 0.3 m သို့မဟုတ် 1 ft) သည် pad အနားမှ ရှိပြီးမြေပြင်သို့ မြေပြင်က ခြေလှမ်းထိုးတက်သော အကွာအဝေး ဖြစ်သည်။ cut နှင့် fill ပမာဏများတွင် ထိုဘက်တွင် မရှိတော့သော embankment ကို ထည့်မတွက်ပါ။
- နံရံနှင့် slope ဘက်တိုင်းဆုံရာတွင် slope က နံရံ၏ အဆုံးကို ပတ်သွားသည်; နံရံနှစ်ခု ဆုံလျှင် mitre ဖြစ်သည်။
- field များအောက်တွင်: နံရံများ၏ အလျား၊ ဖော်ထုတ်ထားသော မျက်နှာ (အမြင့် × အလျား)၊ အမြင့်ဆုံးနှင့် ပျမ်းမျှ အမြင့်။

plan က နံရံတစ်ခုစီ၏ အပြင်ဘက်မျက်နှာကို အတိုတိုတံဆိပ်များဖြင့် ဆွဲပြီး အဆုံးနှစ်ခုနှင့် အမြင့်ဆုံးတွင် အမြင့်ကို ပြသည် (retaining walls အလွှာပေါ်တွင်၊ ၎င်းသည် DXF နှင့် DWG တွင်လည်း ပါသည်)။ 3D view က နံရံများကို solid အဖြစ် ပြသည် (Show › Retaining walls), GLB၊ OBJ နှင့် USD export များတွင် ပါဝင်သည်။ အနားကို ဖြတ်သော section များက အဆင့်ကို ပြသည်။

**Warnings** (Properties တွင်နှင့် Problems panel တွင်): **Warn above a wall height of** (စတင်ရန် 1.0 m သို့မဟုတ် 3.3 ft) ထက်မြင့်သော နံရံသည် "may need an engineered wall or a permit; check local rules" ဟု သတိပေးပြီး၊ **Steepest slope the soil stands** ကို ရိုက်ထည့်လျှင် ထိုအတန်းထက် ပိုစောက်သော cut သို့မဟုတ် fill slope ရှိသည့် ဘက်တိုင်းကို သတိပေးသည်။ ၎င်းတို့သည် သတိပေးချက်သာ ဖြစ်ပြီး grading ကို ဆက်ဆောက်သည်။ ပြောင်းလဲမှုတိုင်းသည် {{key:Mod+Z}} အတွက် အဆင့်တစ်ခု ဖြစ်သည်။

## ထောင့်များ ရွှေ့ခြင်း

pad ကို ရွေးပြီး ထောင့်တစ်ခုရှိ စတုရန်း grip ကို ဆွဲပါ။ ဆွဲမှုတိုင်းသည် undo အဆင့်တစ်ခု ဖြစ်သည်။ ထောင့်ထည့်ခြင်း သို့မဟုတ် ဖယ်ရှားခြင်းကို မရရှိသေးပါ: pad ကို ဖျက်ပြီး ပြန်ဆွဲပါ။

## Grade မလုပ်နိုင်သောအခါ

**Earthwork** အောက်ရှိ အနီရောင် ဘောက်စ်က pad နှင့် ပြဿနာကို အမည်ပေးသည်:

| စာတန်း | ဘာလုပ်ရမည် |
|---|---|
| "3 slope lines run off the surface before meeting it: the pad is too close to the surface's edge or too high/low." | pad ကို မျက်နှာပြင်၏ အနားမှ အတွင်းသို့ ရွှေ့ပါ၊ သို့မဟုတ် ၎င်း၏ elevation ကို မြေပြင်နှင့် ပိုနီးအောင် ချိန်ပါ။ |
| "The daylight line crosses itself (slopes from different sides of the pad run into each other). Reshape the pad or change the slopes." | ကျဉ်းသော သို့မဟုတ် L-ပုံ pad များ နက်သော cut သို့မဟုတ် မြင့်သော fill တွင် ပုံမှန်ဖြစ်သည်။ pad ကို ကျယ်ပါ၊ ကွာခြားမှုကို ညီအောင်လုပ်ပါ၊ သို့မဟုတ် slope များကို ပိုစောက်စေပါ။ |
| "The pad outline crosses itself." | ထောင့်များကို pad ပတ်လည် အစဉ်လိုက် ပြန်ဆွဲပါ။ |

ပြဿနာရှိသော pad ကို ပြင်သည်အထိ proposed surface နှင့် ပမာဏများမှ ထုတ်ထားသည်။

## ရလဒ်ကို ကြည့်ခြင်း

1. **Display** အောက်တွင် **Surface** ကို {{ui:Proposed (graded)}} သို့ သတ်မှတ်ပါ။
   contour များသည် ယခု pad ကို ညီညီ ဖြတ်ပြီး slope များကို daylight line အထိ လိုက်သည်။
2. pointer ကို pad ပေါ်တွင် ထားပါ: status bar က **Ground** နှင့် **Graded** elevation များကို ပြသည်။
3. **Earthwork** အောက်တွင် cut နှင့် fill ကို ဖတ်ပါ; [Earthwork ပမာဏများ](topic:volumes) ကို ကြည့်ပါ။

pad များကို corridor များပြီးနောက်၊ ဆွဲခဲ့သော အစီအစဉ်အတိုင်း grade လုပ်သည်။ နောက်ပိုင်း pad သည် ၎င်း၏ daylight line အတွင်းရှိ ရှေ့က ဘာမဆို အစားထိုးသည်။

## Pad ကို ဖျက်ခြင်း

ရွေးပြီး {{key:Delete}} ကို နှိပ်ပါ (Mac တွင် Fn နှင့် delete), သို့မဟုတ် {{ui:Delete}} ကို နှိပ်ပါ။

## မတည်ဆောက်ရသေးသည်များ

Pad များသည် ပြားသည်: slope ရှိ pad၊ ကွာခြားသော grade ရှိ feature line၊ bench များနှင့် အကွာအဝေး သို့မဟုတ် elevation ပစ်မှတ်ဖြင့် grading များကို မရရှိသေးပါ။ [မတည်ဆောက်ရသေးသည်များ](topic:not-built-yet) ကို ကြည့်ပါ။
