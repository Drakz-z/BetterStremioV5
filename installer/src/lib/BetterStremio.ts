/// <reference lib="deno.ns" />

// @ts-ignore: Importing @types/webui breaks the language server
import { WebUIEvent } from "@types/webui";
import path from "node:path";

const start = "/* BetterStremio:start */";
const end = "/* BetterStremio:end */";
const repoOwner = "Drakz-z";
const repoName = "BetterStremioV5";
const repoBranch = "main";
const rawRepoBase =
  `https://raw.githubusercontent.com/${repoOwner}/${repoName}/${repoBranch}`;

const urlPatch =
  `${rawRepoBase}/patch.js`;
const urlLoader =
  `${rawRepoBase}/BetterStremio.loader.js`;
const urlFont1 =
  `${rawRepoBase}/fonts/icon-full-height.ttf`;
const urlFont2 =
  `${rawRepoBase}/fonts/icon-full-height.woff`;
const urlFont3 =
  `${rawRepoBase}/fonts/PlusJakartaSans.ttf`;
const urlWp =
  `${rawRepoBase}/WatchParty.plugin.js`;
const urlAmoled =
  "https://raw.githubusercontent.com/REVENGE977/StremioAmoledTheme/refs/heads/main/amoled.theme.css";
const localWebUI = "http://127.0.0.1:11470";
const legacyLaunchArgs = " --development --streaming-server";
const modernLaunchArgs = ` --webui-url=${localWebUI}`;
const shortcutArgsToRemove = [
  legacyLaunchArgs,
  modernLaunchArgs,
  " --development",
  " --streaming-server",
];

const unixAlert = (src: string) =>
  Deno.build.os === "windows"
    ? ""
    : `\n\nFor Unix systems, run before patching:\n\nsudo chown username ${
      src.endsWith("/") ? src : src + "/"
    }*`;

async function download(url: string, filename: string) {
  console.log("Downloading", url, "to", filename);
  const data = (await fetch(url)).arrayBuffer();
  return Deno.writeFile(filename, new Uint8Array(await data));
}

export function getDefaultPath() {
  if (Deno.build.os === "windows") {
    const localAppData = Deno.env.get("LOCALAPPDATA");
    const modernPath = `${localAppData}\\Programs\\Stremio\\`;
    const legacyPath = `${localAppData}\\Programs\\LNV\\Stremio-4\\`;

    if (isValidStremioPath(modernPath)) return modernPath;
    if (isValidStremioPath(legacyPath)) return legacyPath;
    return modernPath;
  }

  return "/opt/stremio/";
}

export function getBetterStremioPath(stremioPath: string) {
  if (Deno.build.os === "windows") {
    return path.join(stremioPath, "BetterStremio");
  }
  return path.join(Deno.env.get("HOME")!, ".config", "BetterStremio");
}

function getExecutableNames(stremioPath: string) {
  const executableNames = ["stremio.exe"];
  if (Deno.build.os === "windows") {
    if (exists(path.join(stremioPath, "stremio-shell-ng.exe"))) {
      executableNames.unshift("stremio-shell-ng.exe");
    }
  }
  return executableNames;
}

function getLaunchArgs(stremioPath: string) {
  return getExecutableNames(stremioPath).includes("stremio-shell-ng.exe")
    ? modernLaunchArgs
    : legacyLaunchArgs;
}

function getPrimaryExecutablePath(stremioPath: string) {
  return path.join(stremioPath, getExecutableNames(stremioPath)[0]);
}

function getExecutablePaths(stremioPath: string) {
  return getExecutableNames(stremioPath).map((name) => path.join(stremioPath, name));
}

function getWindowsKnownShortcutPaths() {
  const appData = Deno.env.get("APPDATA");
  const programData = Deno.env.get("PROGRAMDATA");
  const userProfile = Deno.env.get("USERPROFILE");
  const publicProfile = Deno.env.get("PUBLIC");

  return [
    appData
      ? path.join(appData, "Microsoft", "Windows", "Start Menu", "Programs", "Stremio.lnk")
      : "",
    programData
      ? path.join(programData, "Microsoft", "Windows", "Start Menu", "Programs", "Stremio.lnk")
      : "",
    userProfile ? path.join(userProfile, "Desktop", "Stremio.lnk") : "",
    publicProfile ? path.join(publicProfile, "Desktop", "Stremio.lnk") : "",
    appData
      ? path.join(
        appData,
        "Microsoft",
        "Internet Explorer",
        "Quick Launch",
        "User Pinned",
        "TaskBar",
        "Stremio.lnk",
      )
      : "",
  ].filter(Boolean);
}

function exists(targetPath: string) {
  try {
    Deno.statSync(targetPath);
    return true;
  } catch (_e) {
    return false;
  }
}

export function isValidStremioPath(stremioPath: string) {
  if (!exists(stremioPath)) return false;

  const serverJs = path.join(stremioPath, "server.js");
  const executableNames = getExecutableNames(stremioPath);
  return exists(serverJs) ||
    executableNames.some((name) => exists(path.join(stremioPath, name)));
}

export async function installExtra(
  event: WebUIEvent,
  stremioPath: string,
  url: string,
  type: "plugins" | "themes",
  filename: string,
) {
  event.window.run(`setStatus('Downloading ${filename}...')`);
  const BetterStremioPath = getBetterStremioPath(stremioPath);
  try {
    await download(url, path.join(BetterStremioPath, type, filename));
  } catch (e) {
    console.error(e);
    return false;
  }
}

export async function patch(event: WebUIEvent, stremioPath: string) {
  console.log("Patching Stremio");
  event.window.run("setStatus('Patching Stremio...')");

  let patchContent;
  try {
    const data = (await fetch(urlPatch)).arrayBuffer();
    patchContent = new TextDecoder().decode(new Uint8Array(await data));
  } catch (e) {
    console.error(e);
    return "Failed to download patch, make sure you have an established internet connection.";
  }

  const serverJs = path.join(stremioPath, "server.js");
  if (!exists(serverJs)) {
    return "This Stremio installation does not expose a patchable server.js file, so BetterStremio cannot hook into it.";
  }
  const contents = Deno.readTextFileSync(serverJs);

  try {
    const updatedContents = contents.replace(
      /enginefs\.router\.get/,
      `${patchContent.trim()}enginefs.router.get`,
    );
    Deno.writeTextFileSync(serverJs, updatedContents);
  } catch (e) {
    console.error(e);
    return (
      "Failed to update server.js, make sure BetterStremio is allowed to write to Stremio files." +
      unixAlert(stremioPath)
    );
  }
  return true;
}

function updateShortcuts(
  event: WebUIEvent,
  stremioPath: string,
  addArgs: string,
  removeArgs: string[],
) {
  if (Deno.build.os === "windows") {
    event.window.run(
      "setStatus('Scanning for existing Stremio shortcuts (this may take a while)...')",
    );
    const psAddArgs = addArgs.replaceAll("'", "''");
    const psPrimaryExecutable = getPrimaryExecutablePath(stremioPath).replaceAll("'", "''");
    const psWorkingDirectory = stremioPath.replaceAll("'", "''");
    const psExecutableNames = getExecutableNames(stremioPath)
      .map((name) => `'${name.replaceAll("'", "''")}'`)
      .join(", ");
    const psExecutablePaths = getExecutablePaths(stremioPath)
      .map((targetPath) => `'${targetPath.replaceAll("'", "''")}'`)
      .join(", ");
    const psKnownShortcutPaths = getWindowsKnownShortcutPaths()
      .map((targetPath) => `'${targetPath.replaceAll("'", "''")}'`)
      .join(", ");
    const psRemoveArgs = removeArgs
      .map((arg) => `'${arg.replaceAll("'", "''")}'`)
      .join(", ");
    const shortcutCmd = new Deno.Command("powershell", {
      args: [
        "-c",
        `[void][Reflection.Assembly]::LoadWithPartialName('IWshRuntimeLibrary') | Out-Null
$shell = New-Object -ComObject WScript.Shell
$execNames = @(${psExecutableNames})
$execTargets = @(${psExecutablePaths})
$removeArgs = @(${psRemoveArgs})
$knownShortcutPaths = @(${psKnownShortcutPaths}) | Where-Object { $_ }
$addArg = '${psAddArgs}'
$primaryExecutable = '${psPrimaryExecutable}'
$workingDirectory = '${psWorkingDirectory}'
$roots = @(
  [Environment]::GetFolderPath([Environment+SpecialFolder]::Desktop),
  "$env:PROGRAMDATA\\Microsoft",
  "$env:APPDATA\\Microsoft",
  "$env:APPDATA\\Microsoft\\Internet Explorer\\Quick Launch\\User Pinned\\TaskBar"
) | Select-Object -Unique
$shortcuts = [System.Collections.Generic.List[string]]::new()
foreach ($shortcutPath in $knownShortcutPaths) {
  if (Test-Path $shortcutPath) {
    $shortcuts.Add($shortcutPath)
  }
}
foreach ($root in $roots) {
  if (Test-Path $root) {
    Get-ChildItem -Recurse -Path $root -Filter '*.lnk' -ErrorAction SilentlyContinue | ForEach-Object {
      $shortcut = $shell.CreateShortcut($_.FullName)
      $targetName = [System.IO.Path]::GetFileName($shortcut.TargetPath)
      if ($targetName -and $execNames -contains $targetName) {
        $shortcuts.Add($_.FullName)
      }
    }
  }
}
$shortcuts = $shortcuts | Sort-Object -Unique
if ($addArg -and -not $shortcuts.Count -and $knownShortcutPaths.Count) {
  $preferredShortcutPath = $knownShortcutPaths[0]
  $preferredShortcutDir = Split-Path -Parent $preferredShortcutPath
  if ($preferredShortcutDir) {
    New-Item -ItemType Directory -Force -Path $preferredShortcutDir | Out-Null
  }
  $shortcut = $shell.CreateShortcut($preferredShortcutPath)
  $shortcut.TargetPath = $primaryExecutable
  $shortcut.WorkingDirectory = $workingDirectory
  $shortcut.IconLocation = "\${primaryExecutable},0"
  $shortcut.Arguments = ''
  $shortcut.Save()
  $shortcuts = @($preferredShortcutPath)
}
foreach ($shortcutPath in $shortcuts) {
  $shortcut = $shell.CreateShortcut($shortcutPath)
  $isKnownShortcut = $knownShortcutPaths -contains $shortcutPath
  $targetPath = $shortcut.TargetPath
  $targetName = [System.IO.Path]::GetFileName($targetPath)
  $isStremioShortcut = $targetName -and $execNames -contains $targetName
  if (-not $isKnownShortcut -and -not $isStremioShortcut) {
    continue
  }
  if ($addArg -and $isKnownShortcut) {
    if (-not $targetPath -or -not (Test-Path $targetPath) -or -not ($execTargets -contains $targetPath)) {
      $shortcut.TargetPath = $primaryExecutable
    }
    $shortcut.WorkingDirectory = $workingDirectory
    if (-not $shortcut.IconLocation) {
      $shortcut.IconLocation = "\${primaryExecutable},0"
    }
  }
  if ($null -eq $shortcut.Arguments) {
    $shortcut.Arguments = ''
  }
  foreach ($pattern in $removeArgs) {
    $shortcut.Arguments = $shortcut.Arguments.Replace($pattern, '')
  }
  if ($addArg -and $shortcut.Arguments -notlike "*$addArg*") {
    $shortcut.Arguments += $addArg
  }
  $shortcut.Save()
}
$shortcuts`,
      ],
    });
    const shortcuts = new TextDecoder()
      .decode(shortcutCmd.outputSync().stdout)
      .trim()
      .split("\n")
      .filter(Boolean);

    event.window.run(
      "setStatus('Found " + shortcuts.length +
        " shortcuts, updating cmd args (this may take a while)...')",
    );
    console.log("Shortcuts found", shortcuts);
  } else {
    event.window.run(
      "setStatus('Updating smartcode-stremio.desktop shortcut...')",
    );
    const desktopApp = path.join(stremioPath, "smartcode-stremio.desktop");
    const desktopAppContents = Deno.readTextFileSync(desktopApp);
    const rgx = /Exec=(?!.*--development --streaming-server.*).*/;
    const updatedDesktopAppContents = removeArgs.reduce(
      (contents, value) => contents.replace(value, ""),
      desktopAppContents,
    )
      .replace(rgx, `$&${addArgs}`);
    Deno.writeTextFileSync(desktopApp, updatedDesktopAppContents);
  }
}

export async function install(
  event: WebUIEvent,
  stremioPath: string,
  installWp: boolean,
  installAmoled: boolean,
) {
  event.window.run("setStatus('Creating BetterStremio folder...')");
  const BetterStremioPath = getBetterStremioPath(stremioPath);

  try {
    Deno.mkdirSync(BetterStremioPath, { recursive: true });
  } catch (e) {
    console.error(e);
    return "Failed to create BetterStremio folder, make sure BetterStremio is allowed to write to Stremio files.";
  }

  Deno.mkdirSync(path.join(BetterStremioPath, "themes"), { recursive: true });
  Deno.mkdirSync(path.join(BetterStremioPath, "fonts"), { recursive: true });
  Deno.mkdirSync(path.join(BetterStremioPath, "plugins"), { recursive: true });

  try {
    event.window.run("setStatus('Downloading BetterStremio loader...')");
    await download(
      urlLoader,
      path.join(BetterStremioPath, "BetterStremio.loader.js"),
    );
    event.window.run(
      "setStatus('Downloading missing Stremio fonts (icon-full-height.ttf)...')",
    );
    await download(
      urlFont1,
      path.join(BetterStremioPath, "fonts", "icon-full-height.ttf"),
    );
    event.window.run(
      "setStatus('Downloading missing Stremio fonts (icon-full-height.woff)...')",
    );
    await download(
      urlFont2,
      path.join(BetterStremioPath, "fonts", "icon-full-height.woff"),
    );
    event.window.run(
      "setStatus('Downloading missing Stremio fonts (PlusJakartaSans.ttf)...')",
    );
    await download(
      urlFont3,
      path.join(BetterStremioPath, "fonts", "PlusJakartaSans.ttf"),
    );
  } catch (e) {
    console.error(e);
    return "Failed to download BetterStremio files, make sure you have an established internet connection.";
  }

  event.window.run("setStatus('Removing previous BetterStremio patches...')");
  const uninstallResult = await uninstall(event, stremioPath, false);
  if (uninstallResult !== true) return uninstallResult;
  const patchResult = await patch(event, stremioPath);
  if (patchResult !== true) return patchResult;

  try {
    updateShortcuts(
      event,
      stremioPath,
      getLaunchArgs(stremioPath),
      shortcutArgsToRemove,
    );
  } catch (e) {
    console.error(e);
    return (
      "Failed to update existing Stremio shortcuts args: " +
      (e as Error).toString() +
      unixAlert(stremioPath)
    );
  }

  const resultWp = installWp
    ? installExtra(event, stremioPath, urlWp, "plugins", "WatchParty.plugin.js")
    : true;
  const resultAmoled = installAmoled
    ? installExtra(event, stremioPath, urlAmoled, "themes", "amoled.theme.css")
    : true;

  return resultWp && resultAmoled
    ? true
    : "BetterStremio was successfully installed, but these extras failed: " +
      (resultWp ? "" : "WatchParty") +
      (!resultWp && !resultAmoled ? ", " : "") +
      (resultAmoled ? "" : "Amoled theme");
}

// deno-lint-ignore require-await
export async function uninstall(
  event: WebUIEvent,
  stremioPath: string,
  shouldUpdateShortcuts = true,
) {
  const serverJs = path.join(stremioPath, "server.js");
  if (!exists(serverJs)) {
    return true;
  }
  let contents;
  try {
    contents = Deno.readTextFileSync(serverJs);
  } catch (e) {
    console.error(e);
    return (
      "Failed to read server.js, make sure BetterStremio is allowed to access Stremio files." +
      unixAlert(stremioPath)
    );
  }
  if (!contents.includes(start)) return true;
  event.window.run("setStatus('Unpatching Stremio...')");
  const startIdx = contents.indexOf(start);
  const endIdx = contents.indexOf(end, startIdx);
  if (startIdx === -1 || endIdx === -1) {
    return "Failed to uninstall BetterStremio, is your Stremio installation corrupted?";
  }
  const newContents = contents.slice(0, startIdx) +
    contents.slice(endIdx + end.length);
  try {
    Deno.writeTextFileSync(serverJs, newContents);
  } catch (e) {
    console.error(e);

    return (
      "Failed to update server.js, make sure BetterStremio is allowed to write to Stremio files." +
      unixAlert(stremioPath)
    );
  }

  try {
    if (shouldUpdateShortcuts) {
      updateShortcuts(
        event,
        stremioPath,
        "",
        shortcutArgsToRemove,
      );
    }
  } catch (e) {
    console.error(e);
    return (
      "Failed to update existing Stremio shortcuts args: " +
      (e as Error).toString() +
      unixAlert(stremioPath)
    );
  }

  return true;
}

export function killStremio() {
  if (Deno.build.os === "windows") {
    const commands = [
      ["stremio-shell-ng.exe"],
      ["stremio.exe"],
      ["stremio-runtime.exe"],
      ["stremio-service.exe"],
    ].map((processName) =>
      new Deno.Command("taskkill", {
        args: ["/F", "/IM", ...processName],
      }).outputSync()
    );
    return commands[0];
  } else {
    const cmd = new Deno.Command("pkill", { args: ["-f", "stremio"] });
    return cmd.outputSync();
  }
}
