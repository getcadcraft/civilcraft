<?php
// SPDX-License-Identifier: Apache-2.0
/**
 * stubs.php — the few getcadcraft.com helpers an app's ui.inc / settings.inc and the shared settings dialog call,
 * for the standalone dev shell (docs/DEVSHELL.md). Reads devshell/app.json (written by pack.php): the app's catalog
 * entry, its pinned libraries, the other apps' names. Nothing here touches a database or the network.
 *
 * Only defined when the real site is not loaded, so the same ui.inc runs in both places.
 */

declare(strict_types=1);

const DEVSHELL = true;
if (!defined('CC_PUBLIC')) define('CC_PUBLIC', __DIR__ . '/site');

function devshell_app(): array
{
    static $a = null;
    if ($a === null) {
        $a = json_decode((string)@file_get_contents(__DIR__ . '/app.json'), true);
        if (!is_array($a)) { fwrite(STDERR, "devshell: app.json is missing or broken (run pack.php again)\n"); exit(1); }
    }
    return $a;
}

if (!function_exists('e')) {
    function e(string|int|float|null $s): string { return htmlspecialchars((string)($s ?? ''), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
    function tm(string $name): string { return e($name); }
    function json_embed(mixed $data): string
    {
        return (string)json_encode($data, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_SLASHES);
    }
    function url(string $path = '/'): string { return $path; }
    function asset(string $path): string { return '/' . ltrim($path, '/'); }
    function current_path(): string { return '/'; }
    function space_preference(): ?string { return null; }
    function can_lab(): bool { return true; }
    function is_admin(): bool { return false; }
}
if (!function_exists('slugify')) {
    /** The site's slugify() (help headings → anchors); keep in step with core/functions/helpers.php. */
    function slugify(string $s): string
    {
        $s = strtolower(trim($s));
        $s = preg_replace('/[^a-z0-9]+/', '-', $s) ?? '';
        return trim(substr($s, 0, 120), '-');
    }
}

if (!class_exists('Catalog')) {
    final class Catalog
    {
        /** The app this shell runs, or one of the other apps (name only: they are not in this repo). */
        public static function app(string $slug): ?array
        {
            $d = devshell_app();
            if ($slug === $d['app']['slug']) return $d['app'];
            return isset($d['others'][$slug]) ? ['slug' => $slug, 'name' => $d['others'][$slug], 'open_in' => []] : null;
        }
        /** Only this app runs here; links to other apps are never shown. */
        public static function openIn(array $app, string $area): bool
        {
            return $app['slug'] === devshell_app()['app']['slug'];
        }
        public static function areas(): array { return []; }
    }
}

if (!class_exists('AppBuilds')) {
    final class AppBuilds
    {
        public const PANEL_FEATURES = ['move', 'window'];
        public const PANELS_SCRIPT = '/assets/js/app-panels.js';

        public static function panels(array $build): array
        {
            $want = $build['manifest']['panels'] ?? [];
            return is_array($want) ? array_values(array_intersect(self::PANEL_FEATURES, $want)) : [];
        }
        /** Phones and fold phones (0.5 track PH), as the site's AppBuilds::phone. */
        public const PHONE_SCRIPT = '/assets/js/app-phone.js';
        public static function phone(array $build): ?array
        {
            $p = $build['manifest']['phone'] ?? null;
            if ($p === true) return [];
            if (!is_array($p)) return null;
            $out = [];
            foreach (['stage', 'toolbar', 'options', 'hint', 'keep', 'sheets'] as $k) if (isset($p[$k]) && is_string($p[$k]) && strlen($p[$k]) <= 400) $out[$k] = $p[$k];
            return $out;
        }
        /** Menus, keys and mouse (0.5 track IP), as the site's AppBuilds::input / wideSettings. */
        public const INPUT_SCRIPT = '/assets/js/app-input-ui.js';
        public const INPUT_ENGINE = '/assets/js/app-input.js';
        public const INPUT_CSS = '/assets/css/app-input.css';
        public static function input(array $build): ?string
        {
            $f = $build['manifest']['input'] ?? null;
            if (!is_string($f) || !preg_match('/^input-[a-z0-9-]+\.js$/', $f) || !is_file(($build['dir'] ?? '') . '/' . $f)) return null;
            return $build['url'] . $f;
        }
        public static function wideSettings(array $build): bool
        {
            $v = (string)($build['version'] ?? '');
            return !empty($build['is_dev']) || (preg_match('/^\d{1,3}\.\d{1,3}(\.\d{1,3})?$/', $v) === 1 && version_compare($v, '0.5', '>='));
        }
        /** Another app's build is never here (an "Edit in <app>" handoff stays hidden). */
        public static function resolve(string $slug, string $area, ?string $version = null): ?array
        {
            return null;
        }
        public static function versions(string $slug): array { return []; }
        public static function hasDev(string $slug): bool { return false; }
    }
}
