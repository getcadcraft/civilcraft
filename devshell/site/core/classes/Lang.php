<?php
// SPDX-License-Identifier: Apache-2.0
/**
 * Lang — language files on the server (docs/LANG.md): the strings in an app's ui.inc and settings.inc, chosen by the
 * same rules as assets/js/i18n.js, which then reads the catalog this class embeds in the page (bootTag()).
 *
 *   assets/apps/<slug>/<build>/lang/<locale>.json   the app's strings (en.json is the source; others translate it)
 *   assets/lang/shell/<locale>.json                 the shared shell's strings (keys start "shell.")
 *
 * In a build's PHP (app-shell.inc calls use(); calling it again is harmless):
 *   <?php Lang::use($__build); ?>
 *   <button><?= Lang::e('toolbar.open') ?></button>              escaped for text and attributes
 *   <?= Lang::e('sheets.count', ['n' => 3]) ?>                    plural chosen by n
 *   <?= Lang::bootTag() ?>                                         once per page (later calls print nothing)
 *
 * Which language: cookie cc_lang (the user's choice), else ?lang=, else Accept-Language, matched against the locales
 * the app has a file for (exact, then the language alone: es-MX → es); else English. Chain = [locale, its language,
 * en] (those with a file); a key missing from one falls through to the next, then to the key itself.
 *
 * Self-contained (no site helpers, no DB) so the standalone dev shell and the per-app repos can use it as is.
 */

declare(strict_types=1);

final class Lang
{
    public const DEFAULT = 'en';
    public const COOKIE = 'cc_lang';
    public const LOCALE_RE = '/^[a-z]{2,3}(?:-(?:[A-Z]{2}|[0-9]{3}|[A-Z][a-z]{3}))?$/';
    public const KEY_RE = '/^[a-z0-9]+(?:[._-][a-z0-9]+)*$/';
    public const CATEGORIES = ['zero', 'one', 'two', 'few', 'many', 'other'];

    /** Pseudo-locale (0.4 item 0.4): English with accents, 40% longer, in brackets — dev builds only (?lang=en-XA). */
    public const PSEUDO = 'en-XA';
    private const PSEUDO_MAP = [
        'a' => 'á', 'b' => 'ƀ', 'c' => 'ç', 'd' => 'ð', 'e' => 'é', 'f' => 'ƒ', 'g' => 'ĝ', 'h' => 'ĥ', 'i' => 'î', 'j' => 'ĵ',
        'k' => 'ķ', 'l' => 'ļ', 'm' => 'ɱ', 'n' => 'ñ', 'o' => 'ö', 'p' => 'þ', 'q' => 'ǫ', 'r' => 'ŕ', 's' => 'š', 't' => 'ţ',
        'u' => 'û', 'v' => 'ṽ', 'w' => 'ŵ', 'x' => 'ẋ', 'y' => 'ý', 'z' => 'ž',
        'A' => 'Å', 'B' => 'Ɓ', 'C' => 'Ç', 'D' => 'Ð', 'E' => 'É', 'F' => 'Ƒ', 'G' => 'Ĝ', 'H' => 'Ĥ', 'I' => 'Î', 'J' => 'Ĵ',
        'K' => 'Ķ', 'L' => 'Ļ', 'M' => 'Ṁ', 'N' => 'Ñ', 'O' => 'Ö', 'P' => 'Þ', 'Q' => 'Ǫ', 'R' => 'Ŕ', 'S' => 'Š', 'T' => 'Ţ',
        'U' => 'Û', 'V' => 'Ṽ', 'W' => 'Ŵ', 'X' => 'Ẋ', 'Y' => 'Ý', 'Z' => 'Ž',
    ];

    /** Shared shell strings; null = <public_html>/assets/lang/shell. */
    public static ?string $shellDir = null;

    private static ?array $cur = null;     // {app, dir, locale, chain, strings}
    private static bool $booted = false;
    private static array $fileCache = [];

    // ------------------------------------------------------------------ setup

    /** Use a build (AppBuilds::resolve() row, or ['slug' => …, 'dir' => …]) for this request. */
    public static function use(array $build, ?string $locale = null): void
    {
        $dir = (string)($build['dir'] ?? '');
        $slug = (string)($build['slug'] ?? basename(dirname($dir)));
        if (self::$cur && self::$cur['dir'] === $dir && ($locale === null || self::$cur['locale'] === $locale)) return;
        $available = self::locales($dir);
        if (!empty($build['is_dev']) || basename($dir) === 'dev') $available[] = self::PSEUDO;
        $loc = $locale !== null && self::validLocale($locale) ? $locale : self::negotiate($available);
        if ($loc === self::PSEUDO) {
            self::$cur = ['app' => $slug, 'dir' => $dir, 'locale' => $loc, 'chain' => [self::PSEUDO, self::DEFAULT],
                'strings' => array_map([self::class, 'pseudoValue'], self::merged($dir, [self::DEFAULT]))];
            return;
        }
        $chain = self::chain($loc, $available);
        self::$cur = ['app' => $slug, 'dir' => $dir, 'locale' => $loc, 'chain' => $chain,
            'strings' => self::merged($dir, $chain)];
    }

    /** Forget the current build (tests). */
    public static function reset(): void
    {
        self::$cur = null;
        self::$booted = false;
        self::$fileCache = [];
    }

    public static function shellDir(): string
    {
        if (self::$shellDir !== null) return self::$shellDir;
        return (defined('CC_PUBLIC') ? CC_PUBLIC : dirname(__DIR__, 2)) . '/assets/lang/shell';
    }

    /** Locales an app has a file for (always includes en), sorted. */
    public static function locales(string $buildDir): array
    {
        $out = [self::DEFAULT];
        foreach (glob(rtrim($buildDir, '/') . '/lang/*.json') ?: [] as $f) {
            $l = basename($f, '.json');
            if (self::validLocale($l)) $out[] = $l;
        }
        $out = array_values(array_unique($out));
        sort($out);
        return $out;
    }

    public static function validLocale(string $l): bool
    {
        return (bool)preg_match(self::LOCALE_RE, $l);
    }

    /**
     * The locale for this request among $available.
     * @param ?string $cookie / $query / $accept default to the request's (cc_lang cookie, ?lang=, Accept-Language)
     */
    public static function negotiate(array $available, ?string $cookie = null, ?string $query = null, ?string $accept = null): string
    {
        $cookie ??= isset($_COOKIE[self::COOKIE]) ? (string)$_COOKIE[self::COOKIE] : null;
        $query ??= isset($_GET['lang']) && is_string($_GET['lang']) ? $_GET['lang'] : null;
        $accept ??= (string)($_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? '');
        $wants = [];
        foreach ([$cookie, $query] as $w) if ($w !== null && $w !== '') $wants[] = $w;
        foreach (self::parseAccept($accept) as $w) $wants[] = $w;
        foreach ($wants as $w) {
            $m = self::match($w, $available);
            if ($m !== null) return $m;
        }
        return self::DEFAULT;
    }

    /** Accept-Language → tags by q, best first ("es-mx" normalised to "es-MX"; "*" and q=0 dropped). */
    public static function parseAccept(string $header): array
    {
        $out = [];
        foreach (explode(',', $header) as $i => $part) {
            $bits = array_map('trim', explode(';', $part));
            $tag = $bits[0] ?? '';
            if ($tag === '' || $tag === '*') continue;
            $q = 1.0;
            foreach (array_slice($bits, 1) as $b) if (str_starts_with($b, 'q=')) $q = (float)substr($b, 2);
            if ($q <= 0) continue;
            $out[] = [self::normalise($tag), $q, $i];
        }
        usort($out, static fn($a, $b) => $b[1] <=> $a[1] ?: $a[2] <=> $b[2]);
        return array_column($out, 0);
    }

    /** "es_mx" / "ES-mx" → "es-MX"; script subtags Title-case. */
    public static function normalise(string $tag): string
    {
        $p = preg_split('/[-_]/', trim($tag));
        $out = [strtolower((string)array_shift($p))];
        foreach ($p as $s) {
            if (strlen($s) === 2) $out[] = strtoupper($s);
            elseif (strlen($s) === 4) $out[] = ucfirst(strtolower($s));
            else $out[] = $s;
        }
        return implode('-', $out);
    }

    /** Best available locale for a wanted tag: exact, else its language alone, else the first with that language. */
    public static function match(string $want, array $available): ?string
    {
        $want = self::normalise($want);
        if (!self::validLocale($want)) return null;
        if (in_array($want, $available, true)) return $want;
        $lang = explode('-', $want)[0];
        if (in_array($lang, $available, true)) return $lang;
        foreach ($available as $a) if (explode('-', $a)[0] === $lang) return $a;
        return null;
    }

    /** [locale, its language, en] — only those that exist in $available (en always). */
    public static function chain(string $locale, array $available): array
    {
        $c = [$locale];
        $lang = explode('-', $locale)[0];
        if ($lang !== $locale && in_array($lang, $available, true)) $c[] = $lang;
        $c[] = self::DEFAULT;
        return array_values(array_unique($c));
    }

    // ------------------------------------------------------------------ files

    /** One language file as an array (missing or broken file → []). Keys starting with "@" are notes, not strings. */
    public static function readFile(string $file): array
    {
        if (array_key_exists($file, self::$fileCache)) return self::$fileCache[$file];
        $data = is_file($file) ? json_decode((string)file_get_contents($file), true) : null;
        $out = [];
        if (is_array($data)) {
            foreach ($data as $k => $v) {
                if (!is_string($k) || $k === '' || $k[0] === '@') continue;
                if (is_string($v) || (is_array($v) && isset($v['other']) && is_string($v['other']))) $out[$k] = $v;
            }
        }
        return self::$fileCache[$file] = $out;
    }

    /** Shell + app strings for a chain, the first file that has a key winning. */
    public static function merged(string $buildDir, array $chain): array
    {
        $out = [];
        foreach (array_reverse($chain) as $loc) {
            $out = array_replace($out, self::readFile(self::shellDir() . "/$loc.json"));
            $out = array_replace($out, self::readFile(rtrim($buildDir, '/') . "/lang/$loc.json"));
        }
        return $out;
    }

    // ------------------------------------------------------------------ pseudo-locale

    /**
     * "Open {file}" → "[Öþéñ {file} ·····]": letters accented (shows text that skipped the language files: it stays
     * plain), 40% longer (shows labels with no room to grow), brackets (show cut-off or glued-together strings).
     * Fills and literal braces are kept as they are.
     */
    public static function pseudo(string $text): string
    {
        $parts = preg_split('/(\{\{|\}\}|\{[A-Za-z_][A-Za-z0-9_]*\})/', $text, -1, PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY) ?: [];
        $out = '';
        $len = 0;
        foreach ($parts as $p) {
            if ($p[0] === '{' || $p === '}}') { $out .= $p; continue; }
            $out .= strtr($p, self::PSEUDO_MAP);
            $len += mb_strlen($p);
        }
        $pad = (int)ceil($len * 0.4);
        return '[' . $out . ($pad ? ' ' . str_repeat('·', max(1, $pad - 1)) : '') . ']';
    }

    /** pseudo() for a string or every form of a plural. */
    public static function pseudoValue(string|array $v): string|array
    {
        return is_string($v) ? self::pseudo($v) : array_map([self::class, 'pseudo'], $v);
    }

    // ------------------------------------------------------------------ strings

    public static function locale(): string
    {
        return self::$cur['locale'] ?? self::DEFAULT;
    }

    public static function has(string $key): bool
    {
        return isset(self::$cur['strings'][$key]);
    }

    /** The string, with fills (plain text — use e() in HTML). Unknown key → the key. */
    public static function t(string $key, array $vars = []): string
    {
        $v = self::$cur['strings'][$key] ?? null;
        if ($v === null) return $key;
        $text = is_string($v) ? $v : self::choosePlural($v, $vars['n'] ?? null, self::locale());
        return self::fill($text, $vars);
    }

    /** t() escaped for HTML text and attribute values. */
    public static function e(string $key, array $vars = []): string
    {
        return htmlspecialchars(self::t($key, $vars), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }

    public static function fill(string $text, array $vars): string
    {
        return (string)preg_replace_callback('/\{\{|\}\}|\{([A-Za-z_][A-Za-z0-9_]*)\}/', static function ($m) use ($vars) {
            if ($m[0] === '{{') return '{';
            if ($m[0] === '}}') return '}';
            $name = $m[1];
            return array_key_exists($name, $vars) && $vars[$name] !== null ? (string)$vars[$name] : $m[0];
        }, $text);
    }

    public static function choosePlural(array $forms, int|float|string|null $n, string $locale): string
    {
        if ($n !== null && isset($forms['=' . $n]) && is_string($forms['=' . $n])) return $forms['=' . $n];
        $cat = $n === null ? 'other' : self::pluralCategory($n, $locale);
        return is_string($forms[$cat] ?? null) ? $forms[$cat] : (string)$forms['other'];
    }

    /** CLDR plural category through ICU (the same data as the browser's Intl.PluralRules). */
    public static function pluralCategory(int|float|string $n, string $locale): string
    {
        if (!is_numeric($n) || !class_exists('MessageFormatter')) return 'other';
        static $fmt = [];
        $fmt[$locale] ??= \MessageFormatter::create($locale,
            '{0,plural,zero{zero}one{one}two{two}few{few}many{many}other{other}}');
        $r = $fmt[$locale] ? $fmt[$locale]->format([$n + 0]) : false;
        return is_string($r) && in_array($r, self::CATEGORIES, true) ? $r : 'other';
    }

    // ------------------------------------------------------------------ page

    /** The catalog for i18n.js, once per page: <script type="application/json" id="cc-lang">. */
    public static function bootTag(): string
    {
        if (self::$booted || self::$cur === null) return '';
        self::$booted = true;
        $data = ['locale' => self::$cur['locale'], 'chain' => self::$cur['chain'], 'strings' => (object)self::$cur['strings']];
        $json = json_encode($data, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        return '<script type="application/json" id="cc-lang">' . $json . '</script>';
    }
}
