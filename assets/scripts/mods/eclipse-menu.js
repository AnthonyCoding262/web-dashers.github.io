/*
 * Web Dashers mod menu.
 * Interface structure is inspired by Eclipse Menu's public EPL-2.0 project:
 * https://github.com/EclipseMenu/EclipseMenu
 * This is a browser-native implementation; no Geode/C++ runtime code is used.
 */
(function () {
  "use strict";

  const STORAGE_KEY = "gd_mod_menu";
  const DEFAULTS = Object.freeze({
    speedHack: 1,
    syncAudioSpeed: true,
    safeMode: true,
    freezeAttempts: false,
    showFPS: false,
    showCPS: false,
    showPercentage: true,
    percentageDecimals: false,
    autoPractice: false,
    practiceMusicSync: false,
    startPosSwitcher: false,
    showHitboxes: false,
    hitboxTrail: false,
    hitboxesOnDeath: false,
    noclip: false,
    noclipAccuracy: false,
    jumpHack: false,
    solidWave: false,
    lowDetail: false,
    showGlow: true,
    cullDistance: 3,
    portalGuide: true,
    orbGuide: false,
    createObjectIds: false,
    showObjectIds: false,
    showEditorGlow: false
  });

  const TABS = ["Global", "Level", "Player", "Bot", "Creator", "Shortcuts"];

  const ITEMS = [
    { tab: "Global", section: "Performance", id: "speedHack", label: "Speedhack", description: "Changes the fixed-step gameplay rate.", type: "number", min: 0.1, max: 4, step: 0.05, suffix: "x" },
    { tab: "Global", section: "Performance", id: "syncAudioSpeed", label: "Audio Speed", description: "Keeps music playback synchronized with Speedhack.", type: "toggle" },
    { tab: "Global", section: "Performance", id: "lowDetail", label: "Low Detail Mode", description: "Reduces particles, glow, and designated detail objects.", type: "toggle" },
    { tab: "Global", section: "Performance", id: "showGlow", label: "Show Object Glow", description: "Displays glow layers used by level objects.", type: "toggle" },
    { tab: "Global", section: "Performance", id: "cullDistance", label: "Cull Distance", description: "Number of nearby level sections kept visible.", type: "number", min: 0, max: 6, step: 1 },
    { tab: "Global", section: "Labels", id: "showFPS", label: "Show FPS", description: "Displays the measured browser frame rate.", type: "toggle" },
    { tab: "Global", section: "Labels", id: "showCPS", label: "Show CPS", description: "Displays clicks per second during gameplay.", type: "toggle" },
    { tab: "Global", section: "Safety", id: "safeMode", label: "Auto Safe Mode", description: "Prevents modded runs from saving progress or completions.", type: "toggle" },
    { tab: "Global", section: "Safety", id: "freezeAttempts", label: "Freeze Attempts", description: "Stops attempt counters from increasing.", type: "toggle" },

    { tab: "Level", section: "Progress", id: "showPercentage", label: "Show Percentage", description: "Shows current level progress at the top of the screen.", type: "toggle" },
    { tab: "Level", section: "Progress", id: "percentageDecimals", label: "Accurate Percentage", description: "Shows progress with two decimal places.", type: "toggle" },
    { tab: "Level", section: "Practice", id: "autoPractice", label: "Auto Practice Mode", description: "Starts newly opened levels in Practice Mode.", type: "toggle" },
    { tab: "Level", section: "Practice", id: "practiceMusicSync", label: "Practice Music Sync", description: "Uses normal level music and checkpoint-based sync in Practice Mode.", type: "toggle" },
    { tab: "Level", section: "Practice", id: "startPosSwitcher", label: "StartPos Switcher", description: "Enables the in-level start-position selector.", type: "toggle" },
    { tab: "Level", section: "Guides", id: "portalGuide", label: "Portal Guide", description: "Displays extra portal direction indicators.", type: "toggle" },
    { tab: "Level", section: "Guides", id: "orbGuide", label: "Orb Guide", description: "Displays extra orb indicators where supported.", type: "toggle" },
    { tab: "Level", section: "Hitboxes", id: "showHitboxes", label: "Show Hitboxes", description: "Draws player, solid, hazard, orb, and portal hitboxes.", type: "toggle" },
    { tab: "Level", section: "Hitboxes", id: "hitboxTrail", label: "Hitbox Trail", description: "Keeps recent player hitbox positions visible.", type: "toggle" },
    { tab: "Level", section: "Hitboxes", id: "hitboxesOnDeath", label: "Hitboxes On Death", description: "Shows hitboxes after the player dies.", type: "toggle" },

    { tab: "Player", section: "Player", id: "noclip", label: "Noclip", description: "Prevents hazards and fatal surfaces from ending the run.", type: "toggle" },
    { tab: "Player", section: "Player", id: "noclipAccuracy", label: "Noclip Accuracy", description: "Tracks frames and deaths that Noclip prevented.", type: "toggle" },
    { tab: "Player", section: "Player", id: "jumpHack", label: "Jump Hack", description: "Allows supported ground modes to jump while airborne.", type: "toggle" },
    { tab: "Player", section: "Visual", id: "solidWave", label: "Solid Wave Trail", description: "Uses a solid version of the wave trail.", type: "toggle" },
    { tab: "Player", section: "Visual", action: "clearHitboxTrail", label: "Clear Hitbox Trail", description: "Clears all currently retained trail positions.", type: "action", button: "Clear" },

    { tab: "Bot", section: "Replay Bot", action: "macroStatus", label: "Replay Status", description: "No replay loaded.", type: "status" },
    { tab: "Bot", section: "Replay Bot", action: "macroNew", label: "New Replay", description: "Clears the current replay buffer.", type: "action", button: "New" },
    { tab: "Bot", section: "Replay Bot", action: "macroRecord", label: "Record", description: "Records portable 60 TPS GDR input events.", type: "action", button: "Record" },
    { tab: "Bot", section: "Replay Bot", action: "macroStop", label: "Stop", description: "Stops recording or playback.", type: "action", button: "Stop" },
    { tab: "Bot", section: "Replay Bot", action: "macroPlayback", label: "Playback", description: "Plays the currently loaded replay.", type: "action", button: "Play" },
    { tab: "Bot", section: "Replay Files", action: "macroSaveGdr2", label: "Export GDR2", description: "Downloads the universal binary GDR2 replay.", type: "action", button: "Save .gdr2" },
    { tab: "Bot", section: "Replay Files", action: "macroSaveGdr", label: "Export GDR1", description: "Downloads a legacy MessagePack GDR replay.", type: "action", button: "Save .gdr" },
    { tab: "Bot", section: "Replay Files", action: "macroLoad", label: "Import GDR", description: "Imports a raw .gdr or .gdr2 replay.", type: "action", button: "Load" },

    { tab: "Creator", section: "Debug", id: "createObjectIds", label: "Create Object ID Labels", description: "Creates debug labels when level objects are built.", type: "toggle" },
    { tab: "Creator", section: "Debug", id: "showObjectIds", label: "Show Object ID Labels", description: "Displays generated object ID labels during gameplay.", type: "toggle" },
    { tab: "Creator", section: "Editor", id: "showEditorGlow", label: "Show Editor Glow", description: "Displays object glow inside the level editor.", type: "toggle" },

    { tab: "Shortcuts", section: "Run", action: "restartLevel", label: "Restart Level", description: "Restarts the current run immediately.", type: "action", button: "Restart" },
    { tab: "Shortcuts", section: "Run", action: "togglePractice", label: "Toggle Practice Mode", description: "Switches Practice Mode on or off.", type: "action", button: "Toggle" },
    { tab: "Shortcuts", section: "Checkpoints", action: "addCheckpoint", label: "Add Checkpoint", description: "Adds a checkpoint at the current position.", type: "action", button: "Add" },
    { tab: "Shortcuts", section: "Checkpoints", action: "deleteCheckpoint", label: "Delete Checkpoint", description: "Removes the most recent checkpoint.", type: "action", button: "Delete" },
    { tab: "Shortcuts", section: "Configuration", action: "resetMods", label: "Reset Mod Settings", description: "Restores every mod option to its default value.", type: "action", button: "Reset", danger: true }
  ];

  class WebDashersModMenu {
    constructor() {
      this.scene = null;
      this.root = null;
      this.activeTab = "Global";
      this.query = "";
      this.wasMusicPlaying = false;
      this.toastTimer = null;
      this._statusTimer = null;
      this._hasStoredState = false;
      this.state = this._loadState();
      this._boundKeyDown = event => this._handleKeyDown(event);
      window.addEventListener("keydown", this._boundKeyDown, true);
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => this._build(), { once: true });
      } else {
        this._build();
      }
    }

    _loadState() {
      let saved = null;
      try {
        saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      } catch (_error) {}
      this._hasStoredState = !!saved && typeof saved === "object";
      return { ...DEFAULTS, ...(this._hasStoredState ? saved : {}) };
    }

    _saveState() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    }

    _migrateLegacyState() {
      if (this._hasStoredState) return;
      const scene = this.scene;
      const legacy = {
        speedHack: window.speedHack,
        showFPS: scene?._fpsText?.visible,
        showCPS: window.showCPS,
        showPercentage: window.showPercentage,
        percentageDecimals: window.percentageDecimals,
        practiceMusicSync: window.practiceMusicSync,
        startPosSwitcher: window.startPosSwitcher,
        showHitboxes: window.showHitboxes,
        hitboxTrail: window.showHitboxTrail,
        hitboxesOnDeath: window.hitboxesOnDeath,
        noclip: window.noClip,
        noclipAccuracy: window.noClipAccuracy,
        solidWave: window.solidWave,
        lowDetail: window.enableLDM,
        showGlow: window.showGlow,
        cullDistance: window.cullDistance,
        portalGuide: window.enablePortalGuide,
        orbGuide: window.enableOrbGuide,
        createObjectIds: window.createObjectIds,
        showObjectIds: window.showObjectIds,
        showEditorGlow: window.showEditorGlow
      };
      for (const [key, value] of Object.entries(legacy)) {
        if (value !== undefined && value !== null) this.state[key] = value;
      }
      this._hasStoredState = true;
      this._saveState();
    }

    attachScene(scene) {
      this.scene = scene;
      window.webDashersScene = scene;
      this._migrateLegacyState();
      this._applyAll();
      this._renderContent();
      this._updateStatus();
    }

    isOpen() {
      return !!this.root?.classList.contains("is-open");
    }

    isUnsafeRun() {
      const bot = this.scene?._macroBot;
      return !!(
        this.state.noclip ||
        this.state.jumpHack ||
        Math.abs(Number(this.state.speedHack) - 1) > 0.0001 ||
        bot?.recording ||
        bot?.playing
      );
    }

    isSafeModeActive() {
      return !!this.state.safeMode && (this.isUnsafeRun() || !!this.scene?._modRunTainted);
    }

    _build() {
      if (this.root) return;
      const root = document.createElement("div");
      root.className = "wd-eclipse-menu";
      root.setAttribute("role", "dialog");
      root.setAttribute("aria-modal", "true");
      root.setAttribute("aria-label", "Web Dashers mod menu");
      root.innerHTML = `
        <div class="wd-eclipse-window">
          <header class="wd-eclipse-titlebar">
            <div class="wd-eclipse-brand"><span class="wd-eclipse-mark">W</span><span>Web Dashers Mods</span></div>
            <input class="wd-eclipse-search" type="search" placeholder="Search mods..." aria-label="Search mods">
            <span class="wd-eclipse-key">Left Shift</span>
          </header>
          <nav class="wd-eclipse-tabs" aria-label="Mod categories"></nav>
          <main class="wd-eclipse-content"><div class="wd-eclipse-grid"></div></main>
          <footer class="wd-eclipse-footer"><span>Browser-safe Eclipse-style feature set</span><span class="wd-eclipse-safe">Safe Mode ready</span></footer>
          <div class="wd-eclipse-toast" role="status"></div>
          <input class="wd-eclipse-file" type="file" accept=".gdr,.gdr2" hidden>
        </div>`;
      document.body.appendChild(root);
      this.root = root;
      this.tabsElement = root.querySelector(".wd-eclipse-tabs");
      this.gridElement = root.querySelector(".wd-eclipse-grid");
      this.searchElement = root.querySelector(".wd-eclipse-search");
      this.safeElement = root.querySelector(".wd-eclipse-safe");
      this.toastElement = root.querySelector(".wd-eclipse-toast");
      this.fileElement = root.querySelector(".wd-eclipse-file");

      TABS.forEach(tabName => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "wd-eclipse-tab";
        button.textContent = tabName;
        button.addEventListener("click", () => {
          this.activeTab = tabName;
          this.query = "";
          this.searchElement.value = "";
          this._renderTabs();
          this._renderContent();
        });
        this.tabsElement.appendChild(button);
      });
      this.searchElement.addEventListener("input", () => {
        this.query = this.searchElement.value.trim().toLowerCase();
        this._renderContent();
      });
      this.fileElement.addEventListener("change", event => this._loadReplayFile(event));
      root.addEventListener("pointerdown", event => {
        if (event.target === root) this.close();
      });
      this._renderTabs();
      this._renderContent();
      this._statusTimer = window.setInterval(() => this._updateStatus(), 250);
    }

    _renderTabs() {
      if (!this.tabsElement) return;
      this.tabsElement.querySelectorAll(".wd-eclipse-tab").forEach(button => {
        button.classList.toggle("is-active", button.textContent === this.activeTab && !this.query);
      });
    }

    _visibleItems() {
      if (!this.query) return ITEMS.filter(item => item.tab === this.activeTab);
      return ITEMS.filter(item => `${item.tab} ${item.section} ${item.label} ${item.description || ""}`.toLowerCase().includes(this.query));
    }

    _renderContent() {
      if (!this.gridElement) return;
      this._renderTabs();
      this.gridElement.replaceChildren();
      const items = this._visibleItems();
      if (!items.length) {
        const empty = document.createElement("div");
        empty.className = "wd-eclipse-empty";
        empty.textContent = "No matching mods.";
        this.gridElement.appendChild(empty);
        return;
      }

      const groups = new Map();
      items.forEach(item => {
        const key = this.query ? `${item.tab} / ${item.section}` : item.section;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(item);
      });

      groups.forEach((groupItems, title) => {
        const section = document.createElement("section");
        section.className = "wd-eclipse-section";
        const heading = document.createElement("div");
        heading.className = "wd-eclipse-section-title";
        heading.textContent = `▼  ${title}`;
        section.appendChild(heading);
        groupItems.forEach(item => section.appendChild(this._createRow(item)));
        this.gridElement.appendChild(section);
      });
    }

    _createRow(item) {
      const row = document.createElement("div");
      row.className = "wd-eclipse-row";
      row.dataset.item = item.id || item.action || "";
      const wrap = document.createElement("div");
      wrap.className = "wd-eclipse-label-wrap";
      const label = document.createElement("span");
      label.className = "wd-eclipse-label";
      label.textContent = item.label;
      wrap.appendChild(label);
      const description = document.createElement("span");
      description.className = "wd-eclipse-description";
      description.textContent = item.description || "";
      wrap.appendChild(description);
      row.appendChild(wrap);

      if (item.type === "toggle") {
        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "wd-eclipse-toggle";
        toggle.classList.toggle("is-on", !!this.state[item.id]);
        toggle.setAttribute("role", "switch");
        toggle.setAttribute("aria-checked", String(!!this.state[item.id]));
        toggle.setAttribute("aria-label", item.label);
        toggle.addEventListener("click", () => this.setSetting(item.id, !this.state[item.id]));
        row.appendChild(toggle);
      } else if (item.type === "number") {
        const input = document.createElement("input");
        input.className = "wd-eclipse-number";
        input.type = "number";
        input.min = String(item.min);
        input.max = String(item.max);
        input.step = String(item.step);
        input.value = String(this.state[item.id]);
        input.setAttribute("aria-label", item.label);
        input.addEventListener("change", () => {
          let value = Number(input.value);
          if (!Number.isFinite(value)) value = Number(DEFAULTS[item.id]);
          value = Math.max(item.min, Math.min(item.max, value));
          if (item.step >= 1) value = Math.round(value);
          input.value = String(value);
          this.setSetting(item.id, value);
        });
        row.appendChild(input);
      } else if (item.type === "status") {
        const status = document.createElement("span");
        status.className = "wd-eclipse-status";
        status.textContent = this._macroStatus();
        row.appendChild(status);
      } else {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `wd-eclipse-button${item.danger ? " is-danger" : ""}`;
        button.textContent = item.button || "Run";
        button.disabled = !this._isActionAvailable(item.action);
        button.addEventListener("click", () => this._runAction(item.action));
        row.appendChild(button);
      }
      return row;
    }

    setSetting(id, value) {
      if (!(id in DEFAULTS)) return;
      this.state[id] = value;
      this._saveState();
      this._applySetting(id);
      if (this.isUnsafeRun() && this.scene) this.scene._modRunTainted = true;
      this.scene?._saveSettings?.();
      this._renderContent();
      this._updateStatus();
    }

    _applyAll() {
      Object.keys(DEFAULTS).forEach(id => this._applySetting(id));
      this.scene?._saveSettings?.();
    }

    _applySetting(id) {
      const scene = this.scene;
      const value = this.state[id];
      const globals = {
        speedHack: "speedHack",
        syncAudioSpeed: "syncAudioSpeed",
        safeMode: "modSafeMode",
        freezeAttempts: "freezeAttempts",
        showCPS: "showCPS",
        showPercentage: "showPercentage",
        percentageDecimals: "percentageDecimals",
        autoPractice: "autoPracticeMode",
        practiceMusicSync: "practiceMusicSync",
        startPosSwitcher: "startPosSwitcher",
        showHitboxes: "showHitboxes",
        hitboxTrail: "showHitboxTrail",
        hitboxesOnDeath: "hitboxesOnDeath",
        noclip: "noClip",
        noclipAccuracy: "noClipAccuracy",
        jumpHack: "jumpHack",
        solidWave: "solidWave",
        lowDetail: "enableLDM",
        showGlow: "showGlow",
        cullDistance: "cullDistance",
        portalGuide: "enablePortalGuide",
        orbGuide: "enableOrbGuide",
        createObjectIds: "createObjectIds",
        showObjectIds: "showObjectIds",
        showEditorGlow: "showEditorGlow"
      };
      if (globals[id]) window[globals[id]] = value;
      if (!scene) return;

      if (id === "showFPS") scene._fpsText?.setVisible?.(!!value);
      if (id === "showPercentage") scene._percentageLabel?.setVisible?.(!!value && !scene._menuActive);
      if (id === "startPosSwitcher") {
        if (!value) scene._startPosIndex = -1;
        scene._startPosGui?.setVisible?.(!!value && !scene._menuActive);
      }
      if (id === "showHitboxes" && !value) {
        scene._player?._hitboxGraphics?.clear?.();
        scene._player2?._hitboxGraphics?.clear?.();
      }
      if (id === "hitboxTrail" && !value) this._clearHitboxTrail();
      if (id === "showGlow" || id === "showEditorGlow" || id === "lowDetail") {
        scene._level?._updateGlowVisibility?.();
      }
      if (id === "syncAudioSpeed" || id === "speedHack") this.applyAudioRate();
    }

    applyAudioRate() {
      const music = this.scene?._audio?._music;
      const rate = this.state.syncAudioSpeed ? Number(this.state.speedHack) || 1 : 1;
      if (!music) return;
      try {
        if (typeof music.setRate === "function") music.setRate(rate);
        else music.rate = rate;
      } catch (_error) {}
    }

    _isGameplayAvailable() {
      return !!this.scene && !this.scene._menuActive && !this.scene._slideIn && !window.isEditor;
    }

    _isActionAvailable(action) {
      const bot = this.scene?._macroBot;
      if (action === "resetMods" || action === "macroNew" || action === "macroLoad") return true;
      if (action === "macroSaveGdr2" || action === "macroSaveGdr" || action === "macroPlayback") {
        return !!(bot?.inputs?.length || bot?.frames?.length) && !bot?.recording;
      }
      if (action === "macroStop") return !!(bot?.recording || bot?.playing);
      if (action === "macroRecord") return this._isGameplayAvailable() && !bot?.playing;
      if (action === "clearHitboxTrail") return !!this.scene;
      if (action === "togglePractice" || action === "restartLevel") return this._isGameplayAvailable();
      if (action === "addCheckpoint" || action === "deleteCheckpoint") return this._isGameplayAvailable() && !!this.scene?._practicedMode?.practiceMode;
      return !!this.scene;
    }

    _runAction(action) {
      const scene = this.scene;
      const bot = scene?._macroBot;
      if (!this._isActionAvailable(action)) {
        this._toast("That action is not available on the current screen.");
        return;
      }

      if (action === "clearHitboxTrail") {
        this._clearHitboxTrail();
        this._toast("Hitbox trail cleared.");
      } else if (action === "macroNew") {
        bot?.resetAll?.();
        if (scene) {
          scene._macroLoaded = false;
          scene._macroName = null;
        }
        this._toast("New replay buffer created.");
      } else if (action === "macroRecord") {
        scene._startMacroRecording?.({ name: `Replay ${new Date().toLocaleTimeString()}` });
        scene._modRunTainted = true;
        scene._macroLoaded = false;
        this._toast("Replay recording started. Close the menu to continue the run.");
      } else if (action === "macroStop") {
        if (bot?.recording) {
          const replay = scene._stopMacroRecording?.();
          scene._macroLoaded = !!(replay?.inputs?.length || replay?.frames?.length);
          scene._macroName = replay?.meta?.name || "Recorded Replay";
          this._toast(`Recording stopped: ${replay?.inputs?.length || 0} input events.`);
        } else {
          scene._stopMacroPlayback?.();
          this._toast("Replay playback stopped.");
        }
      } else if (action === "macroPlayback") {
        const replay = bot?.exportObject?.();
        scene._restartLevel?.();
        scene._startMacroPlayback?.(replay);
        scene._modRunTainted = true;
        this._toast("Replay playback armed. Close the menu to watch it.");
      } else if (action === "macroSaveGdr2") {
        const name = bot?.meta?.name || window.currentlevel?.[2] || "replay";
        scene._exportMacroFile?.(`${name}.gdr2`, "gdr2");
        this._toast("GDR2 replay download started.");
      } else if (action === "macroSaveGdr") {
        const name = bot?.meta?.name || window.currentlevel?.[2] || "replay";
        scene._exportMacroFile?.(`${name}.gdr`, "gdr");
        this._toast("GDR1 replay download started.");
      } else if (action === "macroLoad") {
        this.fileElement.value = "";
        this.fileElement.click();
      } else if (action === "restartLevel") {
        scene._restartLevel?.();
        this._toast("Level restarted.");
      } else if (action === "togglePractice") {
        scene._setPracticeMode?.(!scene._practicedMode?.practiceMode, true);
        this._toast(scene._practicedMode?.practiceMode ? "Practice Mode enabled." : "Practice Mode disabled.");
      } else if (action === "addCheckpoint") {
        const saved = scene._practicedMode.saveCheckpoint(scene._state, scene._playerWorldX, scene._cameraX, scene);
        this._toast(saved ? "Checkpoint added." : "Checkpoint could not be added.");
      } else if (action === "deleteCheckpoint") {
        this._toast(scene._practicedMode.deleteLastCheckpoint() ? "Checkpoint removed." : "No checkpoint to remove.");
      } else if (action === "resetMods") {
        this.state = { ...DEFAULTS };
        this._saveState();
        this._applyAll();
        this._renderContent();
        this._toast("Mod settings reset.");
      }
      this._renderContent();
      this._updateStatus();
    }

    async _loadReplayFile(event) {
      const file = event.target.files?.[0];
      if (!file || !this.scene?._macroBot) return;
      try {
        const replay = await this.scene._macroBot.importFile(file);
        if (!Array.isArray(replay?.inputs) || !replay.inputs.length) throw new Error("Replay contains no input events");
        this.scene._macroBot.resetAll();
        this.scene._macroBot.frames = replay.frames.slice().sort((a, b) => (a.frame ?? 0) - (b.frame ?? 0));
        this.scene._macroBot.inputs = window.GDRCodec.normalizeInputs(replay.inputs);
        this.scene._macroBot.endFrame = Math.max(0, Math.trunc(Number(replay.durationFrames) || 0));
        this.scene._macroBot.meta = { ...this.scene._macroBot.meta, ...(replay.meta || {}) };
        this.scene._macroName = replay.meta?.name || file.name.replace(/\.[^/.]+$/, "");
        this.scene._macroBot.meta.name = this.scene._macroName;
        this.scene._macroLoaded = true;
        this._toast(`Loaded ${this.scene._macroBot.inputs.length} input events from ${replay.meta?.sourceFormat?.toUpperCase() || "GDR"}.`);
      } catch (error) {
        this._toast(`Replay import failed: ${error.message}`);
      }
      this._renderContent();
      this._updateStatus();
    }

    _clearHitboxTrail() {
      if (this.scene?._player) this.scene._player._hitboxTrail = [];
      if (this.scene?._player2) this.scene._player2._hitboxTrail = [];
      this.scene?._player?._hitboxGraphics?.clear?.();
      this.scene?._player2?._hitboxGraphics?.clear?.();
    }

    _macroStatus() {
      const bot = this.scene?._macroBot;
      if (!bot) return "Unavailable";
      if (bot.recording) return `Recording · ${bot.inputs.length} inputs`;
      if (bot.playing) return `Playback · ${bot.cursor}/${bot.inputs.length}`;
      if (bot.inputs.length) return `${bot.meta?.name || this.scene?._macroName || "Loaded"} · ${bot.inputs.length} inputs`;
      if (bot.frames.length) return `${bot.meta?.name || this.scene?._macroName || "Legacy"} · ${bot.frames.length} snapshots`;
      return "Empty";
    }

    _updateStatus() {
      if (!this.root) return;
      const status = this.root.querySelector('[data-item="macroStatus"] .wd-eclipse-status');
      if (status) status.textContent = this._macroStatus();
      const safeActive = this.isSafeModeActive();
      if (this.safeElement) {
        this.safeElement.classList.toggle("is-active", safeActive);
        this.safeElement.textContent = safeActive ? "Safe Mode active · progress blocked" : (this.state.safeMode ? "Safe Mode ready" : "Safe Mode disabled");
      }
      this.applyAudioRate();
    }

    _toast(message) {
      if (!this.toastElement) return;
      this.toastElement.textContent = message;
      this.toastElement.classList.add("is-visible");
      window.clearTimeout(this.toastTimer);
      this.toastTimer = window.setTimeout(() => this.toastElement?.classList.remove("is-visible"), 2600);
    }

    _handleKeyDown(event) {
      if (event.code === "ShiftLeft" && !event.repeat) {
        event.preventDefault();
        event.stopImmediatePropagation();
        this.toggle();
        return;
      }
      if (event.key === "Escape" && this.isOpen()) {
        event.preventDefault();
        event.stopImmediatePropagation();
        this.close();
      }
    }

    toggle() {
      if (this.isOpen()) this.close();
      else this.open();
    }

    open() {
      if (!this.root) this._build();
      if (!this.root || this.isOpen()) return;
      const scene = this.scene;
      this.wasMusicPlaying = !!scene?._audio?.isplaying?.();
      scene?._releaseButton?.(true);
      scene?._audio?.pauseMusic?.();
      scene?._setParticleTimeScale?.(0);
      if (scene) {
        scene._modMenuOpen = true;
        scene._deltaBuffer = 0;
      }
      this.root.classList.add("is-open");
      this._renderContent();
      this._updateStatus();
    }

    close() {
      if (!this.root || !this.isOpen()) return;
      this.root.classList.remove("is-open");
      const scene = this.scene;
      if (scene) {
        scene._modMenuOpen = false;
        scene._spaceWasDown = false;
        scene._deltaBuffer = 0;
        if (!scene._paused) scene._setParticleTimeScale?.(1);
        if (this.wasMusicPlaying && !scene._paused && !scene._state?.isDead && !scene._levelWon) {
          scene._audio?.resumeMusic?.();
        }
      }
      this.searchElement?.blur();
    }
  }

  window.WebDashersModMenu = WebDashersModMenu;
  window.webDashersModMenu = new WebDashersModMenu();
})();
