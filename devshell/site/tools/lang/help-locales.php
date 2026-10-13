<?php
// SPDX-License-Identifier: Apache-2.0
/**
 * help-locales.php — help in other languages (0.4 item 0.3; docs/LANG.md § Help). Required by bin/build-help.php
 * and bin/test-lang-help.php; needs the site bootstrap (Help, Catalog).
 *
 *   assets/apps/<slug>/<build>/help/<locale>/<topic>.md     a translated topic (same slug as the English one)
 *   assets/help/common/<locale>/<topic>.md                  a translated shared "basics" topic
 *   → assets/apps/<slug>/<build>/help/help.<locale>.js      every topic: translated where a file exists in the
 *                                                           locale's chain (es-MX → es), else the English topic
 *
 * Help stays the only parser: the English topics and the translations go through Help's own readTopics/compileTopic
 * (private; reached by reflection so the compiler is not copied) — every lint rule applies to translations too
 * (trademarks, "crafts", "→", tokens, links, blocks). compileEnglish() rebuilds exactly what Help::compileApp()
 * makes, and bin/test-lang-help.php checks that it still does, so a change in Help shows up as a failing test.
 *
 * A translation's front matter: title, summary, keywords (translated), and `from: <8 hex>` — the first 8 of the
 * sha256 of the English .md it was translated from (build-help.php prints it). section/order may be left out (the
 * English ones are used) and must match when given. Missing or different `from` = warning "translated from an older
 * English text". Each compiled topic carries `lang` (the locale its text is in), the module `locale` and `chain`.
 */

declare(strict_types=1);

final class HelpLocales
{
    public const LOCALE_RE = '/^[a-z]{2,3}(?:-(?:[A-Z]{2}|[0-9]{3}|[A-Z][a-z]{3}))?$/';

    private static function call(string $method, array $args): mixed
    {
        $m = new ReflectionMethod(Help::class, $method);
        return $m->invokeArgs(null, $args);
    }

    /** @return array<string, array> slug → raw topic (Help::readTopics) */
    private static function read(string $dir, string $scope, array &$errors): array
    {
        $args = [$dir, $scope, &$errors];
        return self::call('readTopics', $args);
    }

    private static function compileTopic(array $raw, string $scope, string $app, array $index, array &$errors): array
    {
        $args = [$raw, $scope, $app, $index, &$errors];
        return self::call('compileTopic', $args);
    }

    private static function sortTopics(array &$topics): void
    {
        $cmp = (new ReflectionMethod(Help::class, 'topicOrder'))->getClosure(null);
        usort($topics, $cmp);
    }

    /**
     * Compile an add-on's help (docs/ADDONS-SPEC.md §5.2): its own topics only, scoped "addon:<id>"; the app it runs in
     * already ships the shared basics, so common: and app: links are checked against those indexes but not copied in.
     * No required topics. Lives here (not in Help, which is the owner's) for bin/build-help.php --addon.
     * @return array{data: array, errors: string[], warnings: string[]}
     */
    public static function compileAddon(string $helpDir, string $id, string $name, ?string $app = null): array
    {
        $errors = [];
        if (!preg_match('/^[a-z0-9]+(-[a-z0-9]+)*$/', $id)) return ['data' => [], 'errors' => ["Add-on id \"$id\" is not lowercase words joined by hyphens."], 'warnings' => []];
        if ($app !== null && !Catalog::app($app)) return ['data' => [], 'errors' => ["Unknown app $app."], 'warnings' => []];
        $scope = 'addon:' . $id;
        $own = self::read($helpDir, $scope, $errors);
        $index = [$scope => array_keys($own), Help::COMMON => array_keys(self::read(Help::commonDir(), Help::COMMON, $errors))];
        if ($app !== null && ($d = Help::sourceDir($app)) && is_dir($d)) $index[$app] = array_keys(self::read($d, $app, $errors));
        $topics = [];
        foreach ($own as $raw) $topics[] = self::call('compileTopic', [$raw, $scope, $app, $index, &$errors]);
        self::sortTopics($topics);
        $data = ['format' => 'cadcraft-help', 'version' => 1];
        if ($app !== null) $data['app'] = $app;
        $data += ['addon' => $id, 'name' => $name, 'sections' => Help::SECTIONS, 'topics' => $topics];
        return ['data' => $data, 'errors' => $errors, 'warnings' => []];
    }

    /** help/help.js text for an add-on (Help::moduleText with the add-on's header line). */
    public static function addonModuleText(array $data): string
    {
        return preg_replace('/^[^\n]*\n/', "// Compiled by bin/build-help.php from help/*.md (the add-on's topics only). Do not edit.\n", Help::moduleText($data), 1);
    }

    /** The locale folders under a help folder (help/es, help/es-MX …). */
    public static function localesIn(string $dir): array
    {
        $out = [];
        foreach (glob(rtrim($dir, '/') . '/*', GLOB_ONLYDIR) ?: [] as $d) {
            if (preg_match(self::LOCALE_RE, basename($d))) $out[] = basename($d);
        }
        sort($out);
        return $out;
    }

    /** Every locale with a translation for this app (its own folder or the shared basics). */
    public static function locales(string $helpDir, ?string $commonDir = null): array
    {
        $l = array_unique(array_merge(self::localesIn($helpDir), self::localesIn($commonDir ?? Help::commonDir())));
        sort($l);
        return array_values($l);
    }

    /** [es-MX, es] — the translation folders a locale reads, most specific first (English is the last resort). */
    public static function chain(string $locale): array
    {
        $c = [$locale];
        $lang = explode('-', $locale)[0];
        if ($lang !== $locale) $c[] = $lang;
        return $c;
    }

    /** First 8 hex of the sha256 of a topic's English source file. */
    public static function sourceHash(string $file): string
    {
        return substr(hash('sha256', str_replace(["\r\n", "\r"], "\n", (string)@file_get_contents($file))), 0, 8);
    }

    /** English topics with each translation in the locale's chain laid over them (most specific folder wins). */
    private static function overlay(array $english, string $scope, string $dir, string $locale, array &$errors, array &$warnings, int &$translated): array
    {
        $set = $english;
        foreach (array_reverse(self::chain($locale)) as $loc) {      // es, then es-MX over it
            $lerr = [];
            foreach (self::read("$dir/$loc", $scope, $lerr) as $s => $raw) {
                $where = "[$loc] $scope/$s.md";
                if (!isset($english[$s])) { $errors[] = "$where: there is no English topic $s.md to translate."; continue; }
                $enMeta = $english[$s]['meta'];
                $meta = $raw['meta'];
                foreach (['section', 'order'] as $k) {
                    if (($meta[$k] ?? '') === '') $meta[$k] = $enMeta[$k] ?? '';
                    elseif ($meta[$k] !== ($enMeta[$k] ?? '')) $errors[] = "$where: $k must match the English topic (" . ($enMeta[$k] ?? '') . ').';
                }
                $from = $meta['from'] ?? '';
                unset($meta['from']);
                $hash = self::sourceHash("$dir/$s.md");
                if ($from === '') $warnings[] = "$where: no \"from: $hash\" line (which English text it translates).";
                elseif ($from !== $hash) $warnings[] = "$where: translated from an older English text (from: $from, English is now $hash).";
                $raw['meta'] = $meta;
                $raw['where'] = "[$loc] " . $raw['where'];
                $raw['lang'] = $loc;
                $set[$s] = $raw;
            }
            foreach ($lerr as $e) $errors[] = "[$loc] $e";
        }
        foreach ($set as $raw) if (isset($raw['lang'])) $translated++;
        return $set;
    }

    /** What Help::compileApp() makes, from any folders (tests compare the two). */
    public static function compileEnglish(string $slug, string $helpDir, ?string $commonDir = null): array
    {
        return self::compile($slug, $helpDir, null, $commonDir);
    }

    /**
     * Compile one app's help in a locale (null = English, identical to Help::compileApp).
     * @return array{data: array, errors: string[], warnings: string[], translated: int, total: int}
     */
    public static function compile(string $slug, string $helpDir, ?string $locale, ?string $commonDir = null): array
    {
        $commonDir ??= Help::commonDir();
        $app = Catalog::app($slug);
        $errors = $warnings = [];
        if (!$app) return ['data' => [], 'errors' => ["Unknown app $slug."], 'warnings' => [], 'translated' => 0, 'total' => 0];
        if ($locale !== null && !preg_match(self::LOCALE_RE, $locale)) {
            return ['data' => [], 'errors' => ["$locale is not a locale."], 'warnings' => [], 'translated' => 0, 'total' => 0];
        }

        $own = self::read($helpDir, $slug, $errors);
        $common = self::read($commonDir, Help::COMMON, $errors);
        if ($locale === null) {
            foreach (array_keys($own) as $s) {
                if (isset($common[$s])) $errors[] = "$slug/$s.md: the slug \"$s\" is taken by a shared topic.";
            }
            foreach (Help::REQUIRED as $r) {
                if (!isset($own[$r])) $warnings[] = "$slug: missing the required topic $r.md.";
            }
        }
        $index = [$slug => array_keys($own), Help::COMMON => array_keys($common)];

        $translated = 0;
        if ($locale !== null) {
            $own = self::overlay($own, $slug, $helpDir, $locale, $errors, $warnings, $translated);
            $common = self::overlay($common, Help::COMMON, $commonDir, $locale, $errors, $warnings, $translated);
        }

        $topics = [];
        foreach ([$slug => $own, Help::COMMON => $common] as $scope => $set) {
            foreach ($set as $raw) {
                $t = self::compileTopic($raw, (string)$scope, $slug, $index, $errors);
                if ($locale !== null) $t['lang'] = $raw['lang'] ?? 'en';
                $topics[] = $t;
            }
        }
        self::sortTopics($topics);

        $data = [
            'format'   => 'cadcraft-help',
            'version'  => 1,
            'app'      => $slug,
            'name'     => $app['name'],
            'common'   => Help::COMMON,
            'sections' => Help::SECTIONS,
            'variants' => Help::VARIANTS,
            'topics'   => $topics,
        ];
        if ($locale !== null) {
            $data['locale'] = $locale;
            $data['chain'] = array_merge(self::chain($locale), ['en']);
        }
        return ['data' => $data, 'errors' => $errors, 'warnings' => $warnings, 'translated' => $translated, 'total' => count($topics)];
    }

    /**
     * Compile and write help.<locale>.js for every locale this app has a translation for; remove help.<locale>.js
     * files whose locale has no folder any more. Nothing is written for a locale with errors.
     * @return array<string, array{errors, warnings, translated, total, file, written}>
     */
    public static function buildAll(string $slug, string $helpDir, bool $write = true, ?string $commonDir = null): array
    {
        $out = [];
        $locales = self::locales($helpDir, $commonDir);
        foreach ($locales as $loc) {
            $r = self::compile($slug, $helpDir, $loc, $commonDir);
            $file = "$helpDir/help.$loc.js";
            $written = false;
            if ($write && !$r['errors']) {
                $text = Help::moduleText($r['data']);
                if (@file_get_contents($file) !== $text) {
                    $tmp = "$file.tmp";
                    if (file_put_contents($tmp, $text) === false || !rename($tmp, $file)) $r['errors'][] = "cannot write $file";
                    else $written = true;
                }
            }
            $out[$loc] = ['errors' => $r['errors'], 'warnings' => $r['warnings'], 'translated' => $r['translated'],
                'total' => $r['total'], 'file' => $file, 'written' => $written];
        }
        if ($write) {
            foreach (glob("$helpDir/help.*.js") ?: [] as $f) {
                $loc = substr(basename($f, '.js'), 5);
                if (preg_match(self::LOCALE_RE, $loc) && !in_array($loc, $locales, true)) @unlink($f);
            }
        }
        return $out;
    }
}
