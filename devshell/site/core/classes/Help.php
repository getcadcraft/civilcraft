<?php
// SPDX-License-Identifier: Apache-2.0
/**
 * Help — the app help system (docs/HELP-SPEC.md). One Markdown source per topic, compiled once
 * to safe HTML and read three ways: the in-app help panel (help/help.js inside the build, so it
 * works offline and ships with desktop builds), the site (/tutorials/<app>/<topic>), and tests.
 *
 *   assets/apps/<slug>/<build>/help/*.md   one topic per file (front matter + the Markdown subset)
 *   assets/apps/<slug>/<build>/help/help.js compiled: `export default {…}` — never edited by hand
 *   assets/help/common/*.md                the shared "basics", compiled into every app's help.js
 *
 * compile() is the only parser. The HTML it writes carries the reader-dependent parts as data:
 *   variant blocks  <div class="hv" data-v="os:mac;browser:safari">…   (shown by help-panel.js / help-page.js)
 *   picks           <span class="hp"><span class="hpv" data-v="os:mac">…</span>…</span>
 *   keys            <kbd class="hk"><span class="k-mac">⇧⌘S</span><span class="k-pc">Ctrl+Shift+S</span></kbd>
 *   links           <a href="/tutorials/<app>/<slug>" data-topic="<scope>/<slug>">
 * Text is escaped before any markup is added, so a topic cannot inject HTML.
 */

declare(strict_types=1);

final class Help
{
    public const COMMON = 'basics';   // the shared collection: /tutorials/basics/<slug>

    public const SECTIONS = [
        'start'     => 'Getting started',
        'tasks'     => 'Walkthroughs',
        'switching' => 'Coming from other software',
        'reference' => 'Reference',
        'trouble'   => 'Troubleshooting and limits',
    ];

    /** Variant dimensions → tokens → label. */
    public const VARIANTS = [
        'os'      => ['mac' => 'Mac', 'windows' => 'Windows', 'linux' => 'Linux'],
        'browser' => ['chromium' => 'Chrome or Edge', 'firefox' => 'Firefox', 'safari' => 'Safari'],
        'shell'   => ['web' => 'In the browser', 'desktop' => 'Desktop app'],
        'net'     => ['online' => 'Online', 'offline' => 'Offline'],
        'input'   => ['mouse' => 'Mouse', 'touch' => 'Touch'],
    ];

    public const CALLOUTS = ['tip' => 'Tip', 'note' => 'Note', 'warning' => 'Warning'];

    /** Never in a title, summary, heading, keyword or table header (the trademark rule in the site docs). */
    public const TRADEMARKS = ['AutoCAD', 'Revit', 'Civil 3D', 'SketchUp', 'Bluebeam', 'PlanSwift', 'Tekla',
        'SolidWorks', 'Navisworks', 'Inventor', 'Autodesk', 'Trimble', 'Excel', 'Acrobat', 'ArcGIS', 'Esri', 'QGIS'];

    /** Minimum topics each app ships (missing = warning, not an error). */
    public const REQUIRED = ['getting-started', 'workspace', 'files', 'coming-from', 'keyboard', 'troubleshooting', 'not-built-yet'];

    private const NAMED_KEYS = [
        // name => [pc, mac]
        'mod' => ['Ctrl', '⌘'], 'ctrl' => ['Ctrl', '⌃'], 'shift' => ['Shift', '⇧'], 'alt' => ['Alt', '⌥'],
        'enter' => ['Enter', 'Return'], 'esc' => ['Esc', 'Esc'], 'tab' => ['Tab', 'Tab'], 'space' => ['Space', 'Space'],
        'backspace' => ['Backspace', 'Delete'], 'delete' => ['Delete', 'fn Delete'],
        'up' => ['↑', '↑'], 'down' => ['↓', '↓'], 'left' => ['←', '←'], 'right' => ['→', '→'],
        'pageup' => ['Page Up', 'fn ↑'], 'pagedown' => ['Page Down', 'fn ↓'], 'home' => ['Home', 'fn ←'], 'end' => ['End', 'fn →'],
        'plus' => ['+', '+'], 'minus' => ['−', '−'],
    ];
    private const MAC_MODS = ['ctrl' => 0, 'alt' => 1, 'shift' => 2, 'mod' => 3];   // Apple's order: ⌃⌥⇧⌘
    private const SPOKEN = ['⌘' => 'Command', '⌃' => 'Control', '⌥' => 'Option', '⇧' => 'Shift'];

    // ------------------------------------------------------------------ locations

    public static function sourceDir(string $slug, string $build = 'dev'): ?string
    {
        $root = AppBuilds::root($slug);
        return $root ? "$root/$build/help" : null;
    }

    public static function commonDir(): string
    {
        return CC_PUBLIC . '/assets/help/common';
    }

    // ------------------------------------------------------------------ compile

    /**
     * Compile one app's help (its topics + the shared basics) from a help folder.
     * @return array{data: array, errors: string[], warnings: string[]}
     */
    public static function compileApp(string $slug, string $helpDir): array
    {
        $app = Catalog::app($slug);
        $errors = $warnings = [];
        if (!$app) return ['data' => [], 'errors' => ["Unknown app $slug."], 'warnings' => []];

        $own = self::readTopics($helpDir, $slug, $errors);
        $common = self::readTopics(self::commonDir(), self::COMMON, $errors);
        foreach (array_keys($own) as $s) {
            if (isset($common[$s])) $errors[] = "$slug/$s.md: the slug \"$s\" is taken by a shared topic.";
        }
        foreach (self::REQUIRED as $r) {
            if (!isset($own[$r])) $warnings[] = "$slug: missing the required topic $r.md.";
        }
        $index = [$slug => array_keys($own), self::COMMON => array_keys($common)];
        $topics = [];
        foreach ([$slug => $own, self::COMMON => $common] as $scope => $set) {
            foreach ($set as $s => $raw) {
                $topics[] = self::compileTopic($raw, $scope, $slug, $index, $errors);
            }
        }
        usort($topics, [self::class, 'topicOrder']);

        return [
            'data' => [
                'format'   => 'cadcraft-help',
                'version'  => 1,
                'app'      => $slug,
                'name'     => $app['name'],
                'common'   => self::COMMON,
                'sections' => self::SECTIONS,
                'variants' => self::VARIANTS,
                'topics'   => $topics,
            ],
            'errors'   => $errors,
            'warnings' => $warnings,
        ];
    }

    /** Compile just the shared basics (the site's /tutorials/basics). */
    public static function compileCommon(): array
    {
        $errors = [];
        $common = self::readTopics(self::commonDir(), self::COMMON, $errors);
        $index = [self::COMMON => array_keys($common)];
        $topics = [];
        foreach ($common as $raw) $topics[] = self::compileTopic($raw, self::COMMON, null, $index, $errors);
        usort($topics, [self::class, 'topicOrder']);
        return ['data' => ['app' => self::COMMON, 'name' => 'Basics', 'sections' => self::SECTIONS, 'topics' => $topics], 'errors' => $errors, 'warnings' => []];
    }

    /** The module text for help/help.js. */
    public static function moduleText(array $data): string
    {
        $json = json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_THROW_ON_ERROR);
        return "// Compiled by bin/build-help.php from help/*.md and assets/help/common/*.md. Do not edit.\n"
            . "export default " . $json . ";\n";
    }

    /** Read a compiled help.js back (the site reads the build's compiled help). */
    public static function readModule(string $file): ?array
    {
        $t = @file_get_contents($file);
        if ($t === false) return null;
        $p = strpos($t, 'export default ');
        if ($p === false) return null;
        $json = rtrim(substr($t, $p + 15), " ;\n\r\t");
        $d = json_decode($json, true);
        return is_array($d) && ($d['format'] ?? '') === 'cadcraft-help' ? $d : null;
    }

    private static function topicOrder(array $a, array $b): int
    {
        $sec = array_flip(array_keys(self::SECTIONS));
        return [$a['scope'] === self::COMMON ? 1 : 0, $sec[$a['section']] ?? 9, $a['order'], $a['title']]
           <=> [$b['scope'] === self::COMMON ? 1 : 0, $sec[$b['section']] ?? 9, $b['order'], $b['title']];
    }

    /** @return array<string, array{slug, file, meta, body, line}> */
    private static function readTopics(string $dir, string $scope, array &$errors): array
    {
        $out = [];
        if (!is_dir($dir)) return $out;
        $files = glob($dir . '/*.md') ?: [];
        sort($files);
        foreach ($files as $f) {
            $slug = basename($f, '.md');
            $where = "$scope/$slug.md";
            if (!preg_match('/^[a-z0-9]+(-[a-z0-9]+)*$/', $slug)) { $errors[] = "$where: file names are lowercase words joined by hyphens."; continue; }
            $text = str_replace(["\r\n", "\r"], "\n", (string)file_get_contents($f));
            if (!preg_match('/^---\n(.*?)\n---\n(.*)$/s', $text, $m)) { $errors[] = "$where: starts without a --- front matter block."; continue; }
            $meta = [];
            foreach (explode("\n", $m[1]) as $i => $line) {
                if (trim($line) === '') continue;
                if (!preg_match('/^([a-z]+):\s*(.*)$/', $line, $kv)) { $errors[] = "$where:" . ($i + 2) . ": front matter lines are key: value."; continue; }
                $meta[$kv[1]] = trim($kv[2]);
            }
            $out[$slug] = ['slug' => $slug, 'where' => $where, 'meta' => $meta, 'body' => $m[2],
                           'line' => substr_count($m[1], "\n") + 3];
        }
        return $out;
    }

    private static function compileTopic(array $raw, string $scope, ?string $app, array $index, array &$errors): array
    {
        $w = $raw['where'];
        $meta = $raw['meta'];
        foreach (['title', 'summary', 'section', 'order'] as $k) {
            if (($meta[$k] ?? '') === '') $errors[] = "$w: front matter needs $k.";
        }
        foreach (array_diff(array_keys($meta), ['title', 'summary', 'section', 'order', 'keywords']) as $k) {
            $errors[] = "$w: unknown front matter key $k.";
        }
        $section = $meta['section'] ?? '';
        if ($section !== '' && !isset(self::SECTIONS[$section])) $errors[] = "$w: section must be one of " . implode(', ', array_keys(self::SECTIONS)) . '.';
        if (isset($meta['order']) && !preg_match('/^\d{1,4}$/', $meta['order'])) $errors[] = "$w: order is a whole number.";
        foreach (['title', 'summary', 'keywords'] as $k) self::lintPlain($meta[$k] ?? '', "$w $k", $errors);

        $ctx = ['where' => $w, 'scope' => $scope, 'app' => $app, 'index' => $index, 'line' => $raw['line'], 'headings' => []];
        $html = self::renderBody($raw['body'], $ctx, $errors);

        return [
            'slug'     => $raw['slug'],
            'scope'    => $scope,
            'title'    => $meta['title'] ?? $raw['slug'],
            'summary'  => $meta['summary'] ?? '',
            'section'  => isset(self::SECTIONS[$section]) ? $section : 'reference',
            'order'    => (int)($meta['order'] ?? 0),
            'keywords' => array_values(array_filter(array_map('trim', explode(',', $meta['keywords'] ?? '')))),
            'headings' => $ctx['headings'],
            'html'     => $html,
            'text'     => self::plainText($html),
        ];
    }

    /** Titles, summaries, keywords, headings, table headers: no trademarks, no "crafts". */
    private static function lintPlain(string $s, string $where, array &$errors): void
    {
        foreach (self::TRADEMARKS as $tm) {
            if (stripos($s, $tm) !== false) $errors[] = "$where: \"$tm\" may appear in body text only (trademark rule).";
        }
        self::lintCopy($s, $where, $errors);
    }

    private static function lintCopy(string $s, string $where, array &$errors): void
    {
        if (preg_match('/\bcrafts\b/i', $s)) $errors[] = "$where: never \"crafts\" for the apps; say \"apps\".";
        if (str_contains($s, '→')) $errors[] = "$where: no \"→\" in copy; write \"then\".";
    }

    // ------------------------------------------------------------------ blocks

    private static function renderBody(string $body, array &$ctx, array &$errors): string
    {
        $lines = explode("\n", $body);
        $out = [];
        $stack = [];          // open directives
        $para = [];
        $list = null;         // ['type' => ul|ol, 'items' => [[text, children[]]], 'sub' => ?]
        $n = count($lines);

        $flushPara = function () use (&$para, &$out, &$ctx, &$errors) {
            if ($para) { $out[] = '<p>' . self::inline(implode(' ', $para), $ctx, $errors) . '</p>'; $para = []; }
        };
        $flushList = function () use (&$list, &$out, &$ctx, &$errors) {
            if ($list) { $out[] = self::renderList($list, $ctx, $errors); $list = null; }
        };

        for ($i = 0; $i < $n; $i++) {
            $line = rtrim($lines[$i]);
            $ctx['lineNo'] = $ctx['line'] + $i;
            $at = $ctx['where'] . ':' . $ctx['lineNo'];

            // Fenced code.
            if (preg_match('/^```/', $line)) {
                $flushPara(); $flushList();
                $code = [];
                for ($i++; $i < $n && !preg_match('/^```\s*$/', rtrim($lines[$i])); $i++) $code[] = $lines[$i];
                if ($i >= $n) $errors[] = "$at: code block never closed.";
                $out[] = '<pre class="hcode"><code>' . e(implode("\n", $code)) . '</code></pre>';
                continue;
            }
            // Directive close.
            if ($line === ':::') {
                $flushPara(); $flushList();
                if (!$stack) { $errors[] = "$at: ::: closes nothing."; continue; }
                $out[] = array_pop($stack);
                continue;
            }
            // Directive open.
            if (preg_match('/^:::\s*([a-z][a-z ]*)$/', $line, $m)) {
                $flushPara(); $flushList();
                $tokens = preg_split('/\s+/', trim($m[1]));
                if (count($tokens) === 1 && isset(self::CALLOUTS[$tokens[0]])) {
                    $out[] = '<aside class="hc hc-' . $tokens[0] . '"><p class="hc-label">' . self::CALLOUTS[$tokens[0]] . '</p>';
                    $stack[] = '</aside>';
                    continue;
                }
                [$spec, $label, $bad] = self::variantSpec($tokens);
                if ($bad) $errors[] = "$at: unknown variant or callout \"" . implode(' ', $bad) . '".';
                $out[] = '<div class="hv" data-v="' . e($spec) . '"><p class="hv-label">' . e($label) . '</p>';
                $stack[] = '</div>';
                continue;
            }
            if (str_starts_with($line, ':::')) { $errors[] = "$at: a directive line is ::: then lowercase tokens."; continue; }

            // Blank.
            if (trim($line) === '') { $flushPara(); $flushList(); continue; }

            // Headings.
            if (preg_match('/^(#{1,6})\s+(.+)$/', $line, $m)) {
                $flushPara(); $flushList();
                $lvl = strlen($m[1]);
                if ($lvl < 2 || $lvl > 3) { $errors[] = "$at: use ## or ### (the title is the page heading)."; $lvl = max(2, min(3, $lvl)); }
                $text = trim($m[2]);
                self::lintPlain($text, "$at heading", $errors);
                $id = slugify($text) ?: 'section';
                $base = $id; $k = 2;
                while (in_array($id, array_column($ctx['headings'], 'id'), true)) $id = $base . '-' . $k++;
                $ctx['headings'][] = ['id' => $id, 'text' => $text, 'level' => $lvl];
                $out[] = "<h$lvl id=\"" . e($id) . '">' . self::inline($text, $ctx, $errors) . "</h$lvl>";
                continue;
            }
            // Rule.
            if (preg_match('/^-{3,}$/', $line)) { $flushPara(); $flushList(); $out[] = '<hr>'; continue; }

            // Table: a pipe row followed by a separator row.
            if (str_starts_with(ltrim($line), '|') && $i + 1 < $n && preg_match('/^\s*\|?\s*:?-{2,}/', $lines[$i + 1])) {
                $flushPara(); $flushList();
                $rows = [];
                for (; $i < $n && str_starts_with(ltrim($lines[$i]), '|'); $i++) $rows[] = rtrim($lines[$i]);
                $i--;
                $out[] = self::renderTable($rows, $ctx, $errors);
                continue;
            }

            // Lists (top level, or nested 3+ spaces).
            if (preg_match('/^( {0,2})([-*]|\d{1,3}\.)\s+(.*)$/', $line, $m)) {
                $flushPara();
                $type = ctype_digit($m[2][0]) ? 'ol' : 'ul';
                if ($list && $list['type'] !== $type) $flushList();
                $list ??= ['type' => $type, 'items' => []];
                $list['items'][] = ['text' => [$m[3]], 'sub' => null];
                continue;
            }
            if ($list && preg_match('/^ {3,}([-*]|\d{1,3}\.)\s+(.*)$/', $line, $m)) {
                $type = ctype_digit($m[1][0]) ? 'ol' : 'ul';
                $last = &$list['items'][count($list['items']) - 1];
                $last['sub'] ??= ['type' => $type, 'items' => []];
                $last['sub']['items'][] = ['text' => [$m[2]], 'sub' => null];
                unset($last);
                continue;
            }
            if ($list && preg_match('/^ {2,}\S/', $line)) {
                // Continuation of the last item (or of its last sub-item).
                $last = &$list['items'][count($list['items']) - 1];
                if ($last['sub'] && preg_match('/^ {5,}/', $line)) $last['sub']['items'][count($last['sub']['items']) - 1]['text'][] = trim($line);
                else $last['text'][] = trim($line);
                unset($last);
                continue;
            }
            $flushList();
            if (str_starts_with($line, '>')) { $errors[] = "$at: use :::note / :::tip instead of > quotes."; }
            $para[] = trim($line);
        }
        $flushPara(); $flushList();
        if ($stack) $errors[] = $ctx['where'] . ': ' . count($stack) . ' ::: block(s) never closed.';
        while ($stack) $out[] = array_pop($stack);
        return implode("\n", $out);
    }

    /** @return array{0: string, 1: string, 2: string[]} spec "os:mac,windows;browser:safari", label, unknown tokens */
    private static function variantSpec(array $tokens): array
    {
        $by = [];
        $bad = [];
        foreach ($tokens as $t) {
            $hit = false;
            foreach (self::VARIANTS as $dim => $opts) {
                if (isset($opts[$t])) { $by[$dim][] = $t; $hit = true; break; }
            }
            if (!$hit) $bad[] = $t;
        }
        $spec = $labels = [];
        foreach (self::VARIANTS as $dim => $opts) {
            if (empty($by[$dim])) continue;
            $spec[] = $dim . ':' . implode(',', $by[$dim]);
            $labels[] = implode(' or ', array_map(static fn($t) => $opts[$t], $by[$dim]));
        }
        return [implode(';', $spec), implode(', ', $labels), $bad];
    }

    private static function renderList(array $list, array &$ctx, array &$errors): string
    {
        $h = '<' . $list['type'] . '>';
        foreach ($list['items'] as $it) {
            $h .= '<li>' . self::inline(implode(' ', $it['text']), $ctx, $errors);
            if ($it['sub']) $h .= self::renderList($it['sub'], $ctx, $errors);
            $h .= '</li>';
        }
        return $h . '</' . $list['type'] . '>';
    }

    private static function renderTable(array $rows, array &$ctx, array &$errors): string
    {
        $split = static function (string $row): array {
            $row = trim($row);
            $row = preg_replace('/^\||\|$/', '', $row);
            $cells = preg_split('/(?<!\\\\)\|/', $row);
            return array_map(static fn($c) => str_replace('\|', '|', trim($c)), $cells);
        };
        $head = $split($rows[0]);
        foreach ($head as $c) self::lintPlain($c, $ctx['where'] . ' table header', $errors);
        $h = '<div class="ht-wrap"><table class="ht"><thead><tr>';
        foreach ($head as $c) $h .= '<th scope="col">' . self::inline($c, $ctx, $errors) . '</th>';
        $h .= '</tr></thead><tbody>';
        foreach (array_slice($rows, 2) as $r) {
            $cells = $split($r);
            $h .= '<tr>';
            foreach ($head as $k => $_) $h .= '<td>' . self::inline($cells[$k] ?? '', $ctx, $errors) . '</td>';
            $h .= '</tr>';
        }
        return $h . '</tbody></table></div>';
    }

    // ------------------------------------------------------------------ inline

    private static function inline(string $s, array &$ctx, array &$errors): string
    {
        $at = $ctx['where'] . ':' . ($ctx['lineNo'] ?? $ctx['line']);
        self::lintCopy($s, $at, $errors);
        $slots = [];
        $hold = static function (string $html) use (&$slots): string {
            $slots[] = $html;
            return "\x01" . (count($slots) - 1) . "\x02";
        };
        // Code spans first: nothing inside them is markup.
        $s = preg_replace_callback('/`([^`]+)`/', static fn($m) => $hold('<code>' . e($m[1]) . '</code>'), $s);
        // Tokens.
        $s = preg_replace_callback('/\{\{([a-z]+):((?:[^{}]|\{(?!\{))*?)\}\}/', function ($m) use ($hold, $at, &$errors, &$ctx) {
            return $hold(self::token($m[1], $m[2], $at, $errors, $ctx));
        }, $s);
        if (str_contains($s, '{{') || str_contains($s, '}}')) $errors[] = "$at: a {{token}} is malformed.";
        // Links.
        $s = preg_replace_callback('/\[([^\]]+)\]\(([^)\s]+)\)/', function ($m) use ($hold, $at, &$errors, &$ctx) {
            return $hold(self::link($m[1], $m[2], $at, $errors, $ctx));
        }, $s);
        $s = e($s);
        $s = preg_replace('/\*\*(.+?)\*\*/s', '<strong>$1</strong>', $s);
        $s = preg_replace('/(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])/s', '<em>$1</em>', $s);
        // Restore held fragments (they may nest: a link's text can hold a token).
        for ($k = 0; $k < 3 && str_contains($s, "\x01"); $k++) {
            $s = preg_replace_callback('/\x01(\d+)\x02/', static fn($m) => $slots[(int)$m[1]], $s);
        }
        return $s;
    }

    private static function token(string $kind, string $arg, string $at, array &$errors, array &$ctx): string
    {
        switch ($kind) {
            case 'key':
                return self::keys($arg, $at, $errors);
            case 'ui':
                return '<span class="hui">' . e(trim($arg)) . '</span>';
            case 'cmd':
                if (!preg_match('/^[A-Z][A-Z0-9_]*$/', trim($arg))) $errors[] = "$at: {{cmd:…}} is an uppercase command name.";
                return '<code class="hcmd">' . e(trim($arg)) . '</code>';
            case 'pick':
                $parts = [];
                foreach (preg_split('/(?<!\\\\)\|/', $arg) as $p) {
                    if (!preg_match('/^\s*([a-z ]+?)\s*=(.*)$/s', $p, $m)) { $errors[] = "$at: {{pick:…}} parts are token=text."; continue; }
                    [$spec, $label, $bad] = self::variantSpec(preg_split('/\s+/', trim($m[1])));
                    if ($bad) $errors[] = "$at: {{pick:…}} unknown variant \"" . implode(' ', $bad) . '".';
                    $inner = self::inline(str_replace('\|', '|', trim($m[2])), $ctx, $errors);
                    $parts[] = '<span class="hpv" data-v="' . e($spec) . '" title="' . e($label) . '">' . $inner . '</span>';
                }
                return '<span class="hp">' . implode('<span class="hp-sep"> / </span>', $parts) . '</span>';
        }
        $errors[] = "$at: unknown token {{" . $kind . ':…}}.';
        return e('{{' . $kind . ':' . $arg . '}}');
    }

    /** {{key:Mod+Shift+S Esc}} → <kbd> with a Mac and a PC rendering. */
    public static function keys(string $arg, string $at = '', ?array &$errors = null): string
    {
        $errors ??= [];
        $pcSeq = $macSeq = $spoken = [];
        foreach (preg_split('/\s+/', trim($arg)) as $chord) {
            if ($chord === '') continue;
            $parts = explode('+', $chord);
            $mods = $keys = [];
            foreach ($parts as $p) {
                $l = strtolower($p);
                if (isset(self::MAC_MODS[$l])) { $mods[] = $l; continue; }
                if (isset(self::NAMED_KEYS[$l])) { $keys[] = self::NAMED_KEYS[$l]; continue; }
                if (preg_match('/^f([1-9]|1[0-2])$/', $l)) { $keys[] = [strtoupper($p), strtoupper($p)]; continue; }
                if (preg_match('/^[a-z0-9]$/i', $p) || preg_match('/^[\[\]\/\\\\;\',.`=?<>]$/', $p)) { $keys[] = [strtoupper($p), strtoupper($p)]; continue; }
                $errors[] = "$at: unknown key \"$p\" in {{key:$arg}}.";
                $keys[] = [$p, $p];
            }
            $pcMods = array_map(static fn($m) => self::NAMED_KEYS[$m][0], $mods);
            $pcSeq[] = implode('+', array_merge(array_unique($pcMods), array_column($keys, 0)));
            usort($mods, static fn($a, $b) => self::MAC_MODS[$a] <=> self::MAC_MODS[$b]);
            $macMods = implode('', array_map(static fn($m) => self::NAMED_KEYS[$m][1], array_unique($mods)));
            $macKeys = implode(' ', array_column($keys, 1));
            $macSeq[] = $macMods . (($macMods !== '' && mb_strlen($macKeys) > 1) ? ' ' : '') . $macKeys;
            $spoken[] = trim(implode(' ', array_map(static fn($m) => self::SPOKEN[self::NAMED_KEYS[$m][1]], array_unique($mods))) . ' ' . $macKeys);
        }
        $pc = implode(', then ', $pcSeq);
        $mac = implode(', then ', $macSeq);
        return '<kbd class="hk"><span class="k-mac" title="' . e(implode(', then ', $spoken)) . '">' . e($mac)
            . '</span><span class="k-pc">' . e($pc) . '</span></kbd>';
    }

    private static function link(string $text, string $target, string $at, array &$errors, array &$ctx): string
    {
        $inner = self::inline($text, $ctx, $errors);
        if (preg_match('#^https://[^\s<>"]+$#', $target)) {
            return '<a href="' . e($target) . '" class="hx" target="_blank" rel="noopener">' . $inner . '</a>';
        }
        if (!preg_match('/^(topic|common|app):([a-z0-9-]+)(?:\/([a-z0-9-]+))?(?:#([a-z0-9-]+))?$/', $target, $m)) {
            $errors[] = "$at: link target \"$target\" is not topic:, common:, app: or https://.";
            return $inner;
        }
        [$all, $kind, $a, $b] = $m + [3 => ''];
        $hash = $m[4] ?? '';
        if ($kind === 'topic') { $scope = $ctx['scope']; $slug = $a; }
        elseif ($kind === 'common') { $scope = self::COMMON; $slug = $a; }
        else {
            $scope = $a; $slug = $b;
            if (!Catalog::app($scope) || $slug === '') $errors[] = "$at: app:$a/$b is not app:<slug>/<topic>.";
        }
        if (isset($ctx['index'][$scope]) && !in_array($slug, $ctx['index'][$scope], true)) {
            $errors[] = "$at: link to a topic that does not exist ($scope/$slug).";
        }
        $href = '/tutorials/' . $scope . '/' . $slug . ($hash !== '' ? '#' . $hash : '');
        return '<a href="' . e($href) . '" data-topic="' . e($scope . '/' . $slug) . '"' . ($hash !== '' ? ' data-hash="' . e($hash) . '"' : '') . '>' . $inner . '</a>';
    }

    /** Search text: one rendering (PC keys, every variant), no tags. */
    private static function plainText(string $html): string
    {
        $t = preg_replace('#<span class="k-mac"[^>]*>.*?</span>#s', '', $html);
        $t = preg_replace('#<p class="(hv|hc)-label">.*?</p>#s', ' ', $t);
        $t = html_entity_decode(strip_tags(preg_replace('#<(/p|li|/li|ul|ol|/h\d|br|/td|/th)>#', ' $0', $t)), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        return trim(preg_replace('/\s+/u', ' ', $t));
    }

    // ------------------------------------------------------------------ site reads

    /**
     * The help the site shows for an app: the build its public area runs (current release),
     * else the dev build. Null when the app has no compiled help.
     * @return ?array{data: array, build: string}
     */
    public static function forApp(string $slug): ?array
    {
        if (!Catalog::app($slug)) return null;
        $builds = [];
        if ($cur = AppBuilds::current($slug)) $builds[] = $cur;
        if (AppBuilds::hasDev($slug)) $builds[] = 'dev';
        foreach ($builds as $b) {
            $d = self::readModule(self::sourceDir($slug, $b) . '/help.js');
            if ($d) return ['data' => $d, 'build' => $b];
        }
        return null;
    }

    /** The shared basics for the site. */
    public static function common(): array
    {
        return self::compileCommon()['data'];
    }

    /** One topic of a compiled set. */
    public static function topic(array $data, string $slug, ?string $scope = null): ?array
    {
        foreach ($data['topics'] as $t) {
            if ($t['slug'] === $slug && ($scope === null || $t['scope'] === $scope)) return $t;
        }
        return null;
    }

    /** Topics of a set grouped by section key, in order. Own topics only unless $withCommon. */
    public static function bySection(array $data, bool $withCommon = false): array
    {
        $out = [];
        foreach ($data['topics'] as $t) {
            if (!$withCommon && $t['scope'] !== $data['app']) continue;
            $out[$t['section']][] = $t;
        }
        return array_replace(array_intersect_key(array_fill_keys(array_keys(self::SECTIONS), null), $out), $out);
    }

    /** Previous and next topic in reading order (own topics). */
    public static function neighbors(array $data, array $topic): array
    {
        $list = array_values(array_filter($data['topics'], static fn($t) => $t['scope'] === $topic['scope']));
        foreach ($list as $i => $t) {
            if ($t['slug'] === $topic['slug']) return [$list[$i - 1] ?? null, $list[$i + 1] ?? null];
        }
        return [null, null];
    }

    /**
     * What the site says about the build a set of help describes (honesty rule): an app nobody
     * outside the team can run yet is labeled, and its help pages are noindex until it opens.
     * @return array{public: bool, where: ?string, note: string}
     */
    public static function siteStatus(array $app, string $build): array
    {
        $where = null;
        foreach (['app', 'try'] as $area) {
            if (Catalog::openIn($app, $area)) { $where = Catalog::area($area)['path'] . '/' . $app['slug']; break; }
        }
        if ($where === null) {
            return ['public' => false, 'where' => null,
                'note' => $app['name'] . ' is in development and not open to the public yet. These pages describe the build the team is testing now, so they change as it does.'];
        }
        return ['public' => true, 'where' => $where,
            'note' => 'Written for ' . $app['name'] . ($build === 'dev' ? ' as it is today' : ' ' . $build) . '. The same help is inside the app: press F1.'];
    }

    /** Server guess of the reader's OS for the site's first render (script refines it). */
    public static function guessOs(?string $ua = null): string
    {
        $ua ??= $_SERVER['HTTP_USER_AGENT'] ?? '';
        if (preg_match('/Macintosh|Mac OS X|iPhone|iPad/i', $ua)) return 'mac';
        if (preg_match('/Linux|X11|CrOS/i', $ua) && !preg_match('/Android/i', $ua)) return 'linux';
        return 'windows';
    }
}
