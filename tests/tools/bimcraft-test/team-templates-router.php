<?php
// SPDX-License-Identifier: Apache-2.0
// browser-team-templates.mjs: PHP's built-in server for /api/v1/team/shared only, started with TEAM_SHARED_ITEMS=1 in the child's environment
// (the switch stays off in the live .env, rule 62). Same router as bin/test-team-shared-http.php.
$p = rtrim((string)parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/'); $b = $_SERVER['DOCUMENT_ROOT'];
if ($p !== '/api/v1/team/shared' || !is_file("$b$p.php")) { http_response_code(404); echo 'nf'; return true; }
$_SERVER['HTTPS'] = 'on'; $_SERVER['SCRIPT_NAME'] = "$p.php"; $_SERVER['SCRIPT_FILENAME'] = "$b$p.php"; chdir(dirname("$b$p.php")); require "$b$p.php";
