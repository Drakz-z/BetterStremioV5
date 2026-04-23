<h1 align="center">
    <img width="200" src="./logo.png" align="center"></img>
</h1>


<p align="center">🎬 <strong>BetterStremio</strong> is a dynamic Plugin & Theme loader for Stremio.</p>

## 💡 How it works

**BetterStremio** patches the `server.js` file to inject code in the local Stremio web server hosted at `127.0.0.1:11470` and adds a loader script to run external plugins and CSS themes. There is no need to download external custom Stremio executables! :)


![image](https://github.com/Drakz-z/BetterStremioV5/assets/16140783/1d721c4f-6493-4ed7-bb6c-ddc804b88630)

## 🚀 Getting Started

<p align="left">
  <a target="_blank" href="https://github.com/Drakz-z/BetterStremioV5">
    <img width="450px" alt="Installer" title="Installer" align="right" src="https://github.com/user-attachments/assets/ff9248ca-2b17-439b-88a2-d28f1c2d9972"></img>
  </a>
</p>

Download and run the installer from the [releases page](https://github.com/Drakz-z/BetterStremioV5/releases/). You can also choose the "Uninstall" option to unpatch changes made to Stremio's server.js file and all modified shortcuts.

> [!TIP]
> BetterStremio still works through a patched shortcut. On Stremio v5 the launcher uses `--webui-url=http://127.0.0.1:11470`, while older Stremio v4 builds still use `--development --streaming-server`.


For **Linux users**, use the startup flags that match your Stremio version: `--webui-url=http://127.0.0.1:11470` for v5, or `--development --streaming-server` for older v4 builds.  
Arch Linux was the only distro verified, please contribute to support your own distro.  

If you want to install it manually, or build the installer locally, please check out the Contribute section for more information about how the patching works.

Demo Plugin: https://github.com/Drakz-z/BetterStremioV5/blob/main/WatchParty.plugin.js  
Demo Theme: https://github.com/REVENGE977/StremioAmoledTheme

## 👾 Developing Plugins & Themes

While developing plugins (.js files) and themes (.css files) you should be accessing through the browser at `localhost:11470` for easier reloading and access to Developer Tools.  

### 🎨 Themes
Here's a sample of all theme options (note these @annotations are not required but are a nice to have).

**Sample.theme.css**:
```css
/**
 * @name Amoled Theme
 * @description A theme that uses amoled pitch black color.
 * @image https://github.com/REVENGE977/stremio-enhanced/raw/main/images/amoled_screenshot.png
 * @updateUrl https://raw.githubusercontent.com/REVENGE977/StremioAmoledTheme/main/amoled.theme.css
 * @shareUrl https://github.com/REVENGE977/StremioAmoledTheme
 * @version 1.0.1
 * @author REVENGE977
 */
```
Pitch black Stremio Theme ref: https://github.com/REVENGE977/StremioAmoledTheme

### ⚡ Plugins

Developing plugins is easy, here are all the methods you need for a sample plugin:

**Sample.plugin.js**:
```js
module.exports = class SamplePlugin {   
    getName() {return "Sample BetterStremio Plugin"}
    getImage() {return "https://cdn-icons-png.flaticon.com/512/9908/9908191.png"}
    getDescription() {return "Sample plugin description."}
    getVersion() {return "1.0.0"}
    getAuthor() {return "YourAt"}
    getShareURL() {return "https://github.com/Sample/example"}
    getUpdateURL() {return "https://raw.githubusercontent.com/Sample/example/main/Example.js"}
    onBoot() {}
    onReady() {}
    onLoad() {}
    onEnable() {}
    onDisable() {}
    onSettings() {}
}
```

All of these functions are optional. If you remove `onSettings()` declaration the settings button will be removed from your Plugin.  
Prefer to always use `onLoad` event (when window is loaded), as `onBoot` is executed before the DOM is initialized and `onReady` when the DOM is parsed.  

You can also call functions from your own plugin, eg. for a better enable/disable compatibility:

```js
onEnable() { this.onLoad(); }
```

### 🧩 API

Stremio's web source uses [angular directives](https://www.w3schools.com/angular/angular_ref_directives.asp) behind the scenes, you can use Plain JS or make use of Stremio Root functions exported by BetterStremio (eg. `BetterStremio.StremioRoot`).  
When developing plugins you might need to store/read data or interact with Stremio libs and resources. Here are all default loaded APIs for BetterStremio:

| Mod | Calls | Description |
| --- | ----- | ----------- |
| **BetterStremio** | `host` <br/> `version` <br/> `errors` | Basic Information variables
| **BetterStremio.Data**  |  `store: (plugin, key, value)` <br/> `read: (plugin, key)` <br/> `delete: (plugin, key)` | Read/Store information from storage |
| **BetterStremio.Plugins** | `enable: (plugin)` <br/> `disable: (plugin)` <br/> `reload: ()` | Used internally to control plugin states |
| **BetterStremio.Themes** | `enable: (theme)` <br/> `disable: (theme)` <br/> `reload: ()` | Used internally to control theme states |
| **BetterStremio.Internal** | `fetch: (route='/', async=true)` <br/> `update: (filename, sourceUrl)` <br/> `reloadInfo: ()` <br/> `reloadUI: ()` <br/> <br/> `enabledPlugins` <br/> `enabledThemes` <br/> `enabledThemes` <br/> `plugins` <br/> `themes` | Required functions and variables for BetterStremio loader to handle plugins, themes and autoupdates | 
| **BetterStremio.Toasts** | `error(title, desc, opts)` <br/> `info(title, desc, opts)` <br/> `success(title, desc, opts)` <br/> `warning(title, desc, opts)` | Toasts notification lib used by Stremio
| **BetterStremio.StremioRoot** | Read on DevTools for all states and functions | Used by Stremio's Angular client to control inner states
| **BetterStremio.Player** | Read on DevTools for all states and functions | Video Player used by Stremio.
| **BetterStremio.Sharing** | Read on DevTools for all states and functions | Stremio's sharing module.
| **BetterStremio.Modules** | Read on DevTools for all states and functions | All loaded modules.
| **BetterStremio.Scopes** | Read on DevTools for all states and functions | Stremio scopes from controllers (updates once controller is open).


If you need to use any other libraries or modules from Stremio (metadata, subtitles, windowManager), use the function sample below to import them.
```js 
stremioApp.run([/* libs... */, function (/* callback modules */) => {
    /* Your code */
}])
```

For further information, see examples of `BetterStremio.loader.js` or dive into `blob.js` on Developer Tools to make use of the source code, eg:

![Stremio blob.js from Network Page](https://github.com/Drakz-z/BetterStremioV5/assets/16140783/3e957108-2c73-452f-b9f4-f9a983a80627)



## 🛠️ TODOs:
- [x] Plugin & Theme loader
- [x] Auto-update for BetterStremio loader
- [x] Interface for plugins (stremio internals & storage)
- [x] Sample plugin & theme
- [x] Installer w/ WebUI
- [x] Windows installer
- [x] Linux installer (verified distros: Arch Linux)
- [ ] MacOS installer (needs contribution)
- [x] Check for updates on plugins & themes (manual)
- [ ] Internationalization

## 🤝 Contribute

This repository is currently available for contributions. If you'd like to help, here are more advanced things to know about how BetterStremio works:

1. The installer patches Stremio's **server.js** file with **patch.js**, updating some routes:
   - `GET /betterstremio/`: Get information about BetterStremio's patch version, path, installed plugins and themes.
   - `GET /betterstremio/folder`: Open plugins/themes folder on user's file explorer.
   - `GET /betterstremio/changelog`: Open BetterStremio's changelog on the browser.
   - `GET /betterstremio/src/:path`: Static sharing of files on BetterStremio's folder.
   - `POST /betterstremio/update/:path?from=URL`: Replaces a file on BetterStremio's folder with the raw content read from the URL for updates.
   - `GET /`: Patched Stremio version, it proxies the configured Stremio Web UI and injects BetterStremio's loader before returning the page.
2. Patching means to insert these routes into `server.js` and update Stremio shortcuts so they load the local UI entrypoint. On v5 this uses `--webui-url=http://127.0.0.1:11470`; on older v4 builds it still uses `--development --streaming-server` (see: [stremio/stremio-shell](https://github.com/stremio/stremio-shell) and [Stremio/stremio-shell-ng](https://github.com/Stremio/stremio-shell-ng))
3. BetterStremio loader will automatically update itself on next load (or past 24h) when **BetterStremio.version** is changed in this repository.
4. If you want to ❤️ contribute to develop plugins & themes, note you can run stremio locally in your browser @ `http://localhost:11470` to access Developer Tools.
5. If you want to ❤️ contribute to BetterStremio and its installer, clone this repository and run:

   ```bash
   cd installer
   deno install
   deno task dev # develop the frontend with a mocked interface (check: installer\src\webui.ts)
   deno task build # compiles the frontend to dist/
   deno task compile # (run after deno build) generates a webui executable with a working backend for patching files
   ```
