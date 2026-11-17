<?php
require_once dirname(__DIR__, 2) . '/public_html/core/bootstrap.php';
foreach (['super-0.1','0.6','0.8'] as $rel) foreach (['SC.1','SC.2','SC.3','SC.4','SC.5','SC.6','SC.7','SC.8','SC.9','SC.10','DC.1'] as $k) { $it=RoadmapItems::byKey($rel,$k); if($it) echo "$rel $k [{$it['status']}] {$it['title']} | days={$it['days']} waits={$it['waits']}\n"; }
