console.log("fred.js loaded");

// Fred, the asset loader
// built for chicken nugget eating simulator deluxe
// general purpose, feel free to use in other projects, with credit, & may need to modify to get it to work for your project
// made by ezyybin604

/*

Required:

- p5.js
- Howler
Variables:
- assets (the things you are going to load)
- MODLOADER (if you don't want modloading, just make the object empty)
- GAME (scenes)
- GAME.init (go to return or mods, entrypoint)
- GAME.return (return from mods or init)
- assetspointer (points to zip file with al your data)

*/

function loadSound(fileArg, callback=e=>{}, extra={}) {
  let js = Object.assign({src: [fileArg], onload: callback}, extra);
  if (onsoundfail != null) {
    js = Object.assign(js, {onloaderror: onsoundfail})
  }
  return new Howl(js);
}

let onsoundfail = null;
let BLACK;
let MODS = [];
let modsloaded = 0;
let canvascall = () => {
  createCanvas(500, 400);
}

let chicken_nugget_spin = 0;
let chicken_nugget_spin_progress = 0;
let prog = 0;

let loaded = {
  sounds: {},
  imgs: {},
  json: {},
  fonts: {}
}

let RED;
let dtc;
let mus;
let fheader = "";
let scene = "prompt_cache";
let upondownload = "waitmod";
let tex = "...";
let keystack = [];
let assetspointer = "/v3.zip";

let heartbeat_down = 1;
let heartbeat = false;
// let fname = "";

let tick = 10;
let sound, mp, mr;
let ZipRequest;

function Key(k, kc) {
  this.key = k;
  this.keyCode = kc;
}

function getAllIndexes(arr, val) { // this function is copied
  var indexes = [], i = -1;
  while ((i = arr.indexOf(val, i+1)) != -1){
    indexes.push(i);
  }
  return indexes;
}

function IsKeyPressed(ke) {
  let ka = getAllIndexes(keystack.map(e => e.key), ke.key)
  let kc = getAllIndexes(keystack.map(e => e.keyCode), ke.keyCode)
  return {
    res: ka.length != 0 && kc.length != 0,
    ind: ka.filter(function(e) { return this.includes(e) }, kc)
  }
}

function blobToDataURL(blob, callback) { // this function is copied
  let a = new FileReader();
  a.onload = function(e) {callback(e.target.result);}
  a.readAsDataURL(blob);
}

function getPath(str) { // this function is copied
  return str.split('\\').pop().split('/').pop();
}

let modname = "";
let startdownload;

Howl.prototype.changeSong = function(o) {
  var self = this;
  self.unload();
  self._duration = 0; // init duration
  self._sprite = {};// init sprite
  self._src = typeof o.src !== 'string' ? o.src : [o.src];
  self._format = typeof o.format !== 'string' ? o.format : [o.format];
  self.load(); // => update duration, sprite(var timeout)
};

function findMod() {
  modname = MODS[modsloaded];
  if (modname == undefined) {
    MODS = [];
    scene = "return";
    return;
  }
  modsloaded++;
  tex = "Downloading mod.."
  setTimeout(function() {
    caches.open("ModCache").then(function(c) {
      c.match(modname).then(function(data) {
        data.blob().then(function(dat) {
          progress[0].finish();
          console.log(`Downloaded Mod ${modsloaded}`);
          JSZip.loadAsync(dat).then(function(zip) {
              ZipRequest = zip;
              scene = "loadmod"
              mstage = 0;
              rootfolder = Object.keys(ZipRequest.files).reduce(function(a, b) {return a.length <= b.length ? a : b});
          })
        });
      })
    })
  }, 100);
}

let mstage = 0;
let rootfolder, modules;
function findModules() {
  if (ZipRequest.files[rootfolder].dir) {
    ZipRequest.folder(rootfolder).forEach(function(rp, fle) {
      if (rp.startsWith("_") && fle.dir) {
        modules = rp.substr(1, rp.length-2);
        modules = modules.match(/.{1,2}/g);
        progress.push(new ProgressBar(0, modules.length));
        progress.push(new ProgressBar(0, 1));
        mstage++;
        modulesloaded = 0;
        sendback = false;
      }
    })
  } else {
    console.error("Asset Loader Modloader, Error 1");
  }
}

let onAssetLoaded = null;
let loadingmodule = false;
let modulesloaded = 0;
let loadeddata = 0;
let module, sendback;

let buf, root;

function loadModule() {
  if (!loadingmodule) {
    if (sendback) {
      root = rootfolder + "$data/";
      scene = "loadnew";
      sendback = false;
      return;
    }
    if (modulesloaded >= modules.length) {
      mstage++;
      return;
    }
    sendback = false;
    loadingmodule = true;
    if (MODLOADER.hasOwnProperty(modules[modulesloaded])) {
      module = MODLOADER[modules[modulesloaded]];
    } else {
      module = MODLOADER.INVALLID;
    }
    progress.pop();
    setTimeout(function() {
      progress[1].finish();
      console.log(`Loading module ${modules[modulesloaded]}`);
      let file = rootfolder + "_" + modules.join("") + "/" + modules[modulesloaded]
      module(ZipRequest.files[file]);
      modulesloaded++;
    }, 100);
  }
}

let fdata = {
  "types": ["imgs", "sounds", "json", "fonts"],
  "idx": {
    "imgs": 0,
    "imgs0": null, // used for nesting
    "sounds": 0,
    "sounds0": null, // used for nesting
    "json": 0,
    "json0": null, // used for nesting
    "fonts": 0,
    "fonts0": null // used for nesting
  },
  "network": [
    null,
    null,
    null,
    null
  ],
  "complete": {
    imgs: false,
    sounds: false,
    json: false,
    fonts: false
  }
};

function getAssetPath(type) {
  if (fdata.idx[type + "0"] == null) {
    return assets[type][fdata.idx[type]];
  } else {
    return assets[type][fdata.idx[type]][fdata.idx[type + "0"]];
  }
}

function getBeforePath(type) {
  if (fdata.idx[type + "0"] == null) {
    return ""
  } else {
    return assets[type][fdata.idx[type]][0];
  }
}

let networktype2mime = {
  imgs: "image/png",
  sounds: "audio/mp3",
  json: "application/json",
  fonts: "font/ttf"
}

// Y O I N K
const b64toBlob = (b64Data, contentType='', sliceSize=512) => {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];
  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  const blob = new Blob(byteArrays, {type: contentType});
  return blob;
}

async function handleAsset(idx) {
  if (fdata.network[idx] == null) {
    console.warn(idx)
    return;
  }
  let filename = root + fdata.network[idx].path;
  if (!(filename in ZipRequest.files)) {
    scene = 'no';
    tex = "Asset failed to be found";
    console.log("Failure: " + filename);
    return;
  }
  // console.log(`Started of type: ${fdata.network[idx].type}, as ${fdata.network[idx].path}`)
  let base64 = await ZipRequest.files[filename].async("base64");
  let mime = networktype2mime[fdata.network[idx].type];
  switch (fdata.network[idx].type) {
    case "imgs":
      loadImage("data:image/png;base64," + base64, function(img) {
        let targetpath = fdata.network[idx].before + getPath(fdata.network[idx].path);
        loaded.imgs[targetpath] = img;
        loaded.imgs[targetpath].targetPath = targetpath;
        if (onAssetLoaded != null) onAssetLoaded();
        loadeddata++;
        console.log(`Loaded Image: ${fdata.network[idx].path}`);
        fdata.network[idx] = null;
      });
      break;
    case "sounds":
      let bc = b64toBlob(base64,mime);
      onsoundfail = function(id, code) {
        if (true) {
          loaded.sounds[fdata.network[idx].before + getPath(fdata.network[idx].path)] = null;
          if (onAssetLoaded != null) onAssetLoaded();
          loadeddata++;
          console.log(`Loaded Sound (FAILED): ${fdata.network[idx].path}`);
          fdata.network[idx] = null;
        }
      };
      if (!audioTest.canPlayType(bc.type)) {
        onsoundfail(0,4);
      } else {
        let sound = loadSound("data:audio/mp3;base64," + base64, function() {
          loaded.sounds[fdata.network[idx].before + getPath(fdata.network[idx].path)] = sound;
          if (onAssetLoaded != null) onAssetLoaded();
          loadeddata++;
          console.log(`Loaded Sound: ${fdata.network[idx].path}`);
          fdata.network[idx] = null;
        }, metadata[getPath(fdata.network[idx].path)]);
      }
      break;
    case "json":
      loadeddata++;
      loaded.json[fdata.network[idx].before + getPath(fdata.network[idx].path)] = JSON.parse(atob(base64));
      if (onAssetLoaded != null) onAssetLoaded();
      console.log(`Loaded JSON: ${fdata.network[idx].path}`);
      fdata.network[idx] = null;
      break;
    case "fonts":
      loadFont("data:font/ttf;base64," + base64, function(font) {
        loaded.fonts[fdata.network[idx].before + getPath(fdata.network[idx].path)] = font;
        if (onAssetLoaded != null) onAssetLoaded();
        loadeddata++;
        console.log(`Loaded Font: ${fdata.network[idx].path}`);
        fdata.network[idx] = null;
      })
      break;
    default:
      console.log("Unknown asset type: " + fdata.network[idx].type);
      break;
  }
}

function manageAssetLoading() {
  for (let i=0;i<fdata.types.length;i++) {
    if (fdata.idx[fdata.types[i]]+1 > assets[fdata.types[i]].length) {
      fdata.complete[fdata.types[i]] = true;
    }
    if (fdata.complete[fdata.types[i]] == false) {
      let idx = fdata.network.indexOf(null);
      if (idx != -1) {
        let type = fdata.types[i];
        if (fdata.idx[type + "0"] == null) {
          fdata.idx[type]++;
          // console.log(fdata.idx[type]);
          if (typeof assets[type][fdata.idx[type]] == "object") {
            fdata.idx[type + "0"] = 1;
          } else {
            fdata.idx[type]--;
            fdata.network[idx] = {
              path: getAssetPath(fdata.types[i]),
              before: getBeforePath(fdata.types[i]),
              type: fdata.types[i]
            };
            fdata.idx[type]++;
          }
        } else {
          fdata.network[idx] = {
            path: getAssetPath(fdata.types[i]),
            before: getBeforePath(fdata.types[i]),
            type: fdata.types[i]
          };
          fdata.idx[type + "0"]++;
          if (fdata.idx[type + "0"]+1 > assets[type][fdata.idx[type]].length) {
            fdata.idx[type]++;
            fdata.idx[type + "0"] = null;
          }
        }
        // console.log(fdata.idx[type + "0"]);
        if (fdata.idx[type + "0"] != 1 || fdata.idx[type + "0"] == null) {
          handleAsset(idx);
        } else if (fdata.idx[type + "0"] == 1) {
          fdata.network[idx] = null;
        }
      }
    }
  }
}

let progress = [];

function ProgressBar(s, d) {
  this.s = s;
  this.goal = d;
}

ProgressBar.prototype.finish = function() {
  this.s++;
}

ProgressBar.prototype.render = function(w, h) {
  progressbar(this.s, this.goal, w, h);
}

function PBR() { // Progress Bar Render
  push();
  translate(10, 20);
  for (let i=0;i<progress.length;i++) {
    translate(0, 20);
    progress[i].render(100, 15);
  }
  pop();
}

function progressbar(prog, amount, width, height) {
  fill("#d4d4d4");
  rect(0, 0, width, height);
  fill(RED);
  rect(0, 0, width*(prog/amount), height);
}

function setup() {
  canvascall();
  BLACK = color(0, 0, 0);
  RED = color(255, 0, 0);
  window.addEventListener("paste", (event) => {
    event.preventDefault();
    let paste = (event.clipboardData || window.clipboardData).getData("text");
    FunnyChickenNuggetPasteEvent(paste);
  });
  updateModMenu();
  window.addEventListener("copy", copyEvent);
}

window.addEventListener("error", (event) => {
  alert("From file " + event.filename + " ln" + event.lineno.toString() + "\n\n" + event.message);
});

function startLoadingMods() {
  InitDiv();
  progress.push(new ProgressBar(0, MODS.length));
  scene = "loadmods";
}

function drawChickenNugget() {
  chicken_nugget_spin_progress += deltaTime / 100;
  chicken_nugget_spin += (deltaTime * (sin(chicken_nugget_spin_progress) + 1)) / 2;
  if (loaded.imgs.hasOwnProperty("icon.png")) {
    let chkn = loaded.imgs["icon.png"];
    push();
    imageMode(CENTER);
    translate(width-chkn.width, height-chkn.height);
    rotate((PI / 180) * chicken_nugget_spin);
    image(chkn, 0, 0);
    pop();
  }
}

function calculateTotalAssets(o) {
  let num = o.flat().length;
  num -= Array.from(o.values()).filter(e=>(typeof e)=="object").length;
  return num;
}

let totalassets = 0;

function draw() {
  cursor("auto")
  dtc = (deltaTime / 30)
  heartbeat_down -= dtc / 2;
  if (heartbeat_down < 0) {
    heartbeat = true;
    heartbeat_down = 1;
  }
  if (scene == "load") {
    root = "assets/"
    background(200);
    drawChickenNugget();
    textSize(30);
    fill(BLACK);
    noStroke();
    tick--;
    text(`Loading Assets ${loadeddata}/${totalassets}`, 0, 30);
    manageAssetLoading();
    if (fdata.complete.sounds && fdata.complete.imgs && fdata.complete.json && fdata.complete.fonts) {
      startGame();
    }
  } else if (scene == "start") {
    background(200);
    textSize(30);
    fill(BLACK);
    noStroke();
    text("Press Return/Enter to start", 0, 30);
    text("Data Loader v5.1", 0, 60);
  } else if (scene == "no") {
    background(200);
    drawChickenNugget();
    textSize(30);
    fill(BLACK);
    noStroke();
    text(tex, 0, 30);
  } else if (scene == "prompt_cache") {
    background(BLACK);
    textSize(30);
    fill(255);
    noStroke();
    text("Fred v1.1.2 - p5.js", 0, 30);
    text("Press ENTER to Start", 0, 60);
    text("Press R to Reload Resources", 0, 90);
    text("Press M for Mod Menu", 0, 120);
  } else if (scene == "waitmod") {
    scene = "load";
  } else if (scene == "loadmods") {
    background(200);
    drawChickenNugget();
    textSize(30);
    fill(BLACK);
    noStroke();
    text(tex, 0, 30);
    PBR();
    if (modname == "") {
      modulesloaded = 0;
      loadeddata = 0;
      findMod();
    }
    // tex = `Downloading mod.. (${Math.round(prog*1000)/10}%) (${((e.total-e.loaded)*(e.loaded/startdownload.getTime()))/1000} seconds left)`;
  } else if (scene == "loadmod") {
    background(200);
    drawChickenNugget();
    textSize(30);
    fill(BLACK);
    noStroke();
    text(`Loading mod: ${getPath(modname)}`, 0, 30);
    PBR();
    if (mstage == 0) {
      findModules();
    } else if (mstage == 1) {
      loadModule();
    } else if (mstage == 2) {
      progress.pop();
      progress.pop();
      scene = "loadmods";
      modname = "";
    }
  } else if (scene == "loadnew") {
    background(200);
    drawChickenNugget();
    textSize(30);
    fill(BLACK);
    noStroke();
    tick--;
    text(`Loading mod: ${getPath(modname)}`, 0, 30);
    PBR();
    manageAssetLoading();
    if (fdata.complete.sounds && fdata.complete.imgs && fdata.complete.json && fdata.complete.fonts) {
      scene = "loadmod";
    }
  } else if (scene == "modmenu") {
    background(200);
    if (modlist == null) {
      textSize(30);
      fill(0);
      noStroke();
      text("Grabbing Modlist..", 0, 30);
    } else if (ogdownload) {
      drawChickenNugget();
      textSize(30);
      fill(0);
      noStroke();
      text("Downloading Mod..", 0, 30);
    } else {
      push();
      translate(0, round(modscroll));
      let hashover = false;
      for (let i=0;i<modlist.length;i++) {
        fill(100);
        noStroke();
        let tmp = new Rectangle(10, (i*40)+10, width-20, 30);
        rect(tmp.x, tmp.y, tmp.width, tmp.height);
        if (collidePointRect(mouseX, mouseY, tmp.x, tmp.y, tmp.width, tmp.height)) {
          hashover = true;
          if (mp) {
            modlistsel = modlist[i];
          }
        }
        textSize(20);
        fill(0);
        let u = new URL(modlist[i]);
        text(u.host.split(".").at(-2) + u.pathname, 20, (i*40)+30)
      }
      pop();
      if (!hashover) {
        if (mp) {
          modlistsel = null;
        }
      }
      push();
      translate(0, -5);
      textAlign(LEFT, BASELINE);
      fill(0);
      textSize(20);
      noStroke();
      if (modlistsel != null) {
        if (MODS.includes(modlistsel)) {
          text("Loaded", 0, height-80);
        }
        text("COPY to get url", 0, height-60);
        text("D to delete", 0, height-40);
        text("L to add/remove from modlist", 0, height-20);
        text(modlistsel, 0, height);
      } else {
        text("M to go back to fred", 0, height);
      }
      pop();
    }
  } else {
    mus = false;
    let extra = GAME[scene]();
    if (GAME.hasOwnProperty(`global`)) GAME.global();
  }
  push();
  fill(BLACK);
  textSize(6);
  noStroke();
  noTint();
  text(Math.round(frameRate()).toString(), 0, 5);
  pop();
  mp = false;
  mr = false;
  heartbeat = false;
}

function removeItemOnce(arr, value) { // this function was copied
  let index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

async function checkImageCached(url) {
  let cache = await caches.open("ChickenNuggetCacheDeluxe");
  let funny = await cache.match(url);
  console.log(funny)
  return funny != undefined;
}

function copyEvent(ev) {
  if (scene == "modmenu" && modlistsel != null) {
    ev.preventDefault();
    ev.clipboardData.setData("text/plain", modlistsel);
    modlistsel = null;
  }
}

let modscroll = 0;
let cache, modcache, modlist;
let ogdownload = false; // On Going Download
let modlistsel = null;

function updateModMenu() {
  caches.open("ModCache").then(function(mca) {
    mca.keys().then(function(keys) {
      modlist = keys.map(function(e) {
        return e.url;
      })
    })
  });
}

function isValidUrl(string) { // i made this code myself dont check the link im about to put in the comment https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;  
  }
  return url.protocol === "http:" || url.protocol === "https:";
}


function FunnyChickenNuggetPasteEvent(text) {
  if (scene == "modmenu" && isValidUrl(text)) {
    console.log(text);
    ogdownload = true;
    fetch(text).then(async function(response) {
      console.log("Caching..")
      if (!response.ok) {
        console.error("OH NO THE CODE IS BAD SEND HELP");
        ogdownload = false;
        return;
      }
      caches.open("ModCache").then(function(mca) {
        mca.put(text, response).then(function() {
          updateModMenu();
          ogdownload = false;
        });
      });
    })
  }
}

function updateCache() {
  scene = "no";
  tex = "Downloading data.."
  ogdownload = true;
  fetch(assetspointer).then(async function(response) {
    console.log("Caching..")
    console.log("Downloading URL: " + response.url)
    if (!response.ok) {
      tex = "Error: Failed to download data.";
      return;
    }
    ogdownload = false;
    caches.open("ChickenNuggetCacheDeluxe").then(async function(cache) {
      await cache.put(assetspointer, response);
      setTimeout(startDownload, 100);
    })
  });
}

async function checkDataCached() {
  let done = await checkImageCached(assetspointer);
  if (done) {
    setTimeout(startDownload, 100);
    scene = "no";
  } else {
    updateCache();
  }
}

function keyPressed(k) {
  if (scene == "waitmod") {
    scene = "load";
  } else if (scene == "prompt_cache") {
    if (k.key == "Enter") {
      checkDataCached();
      updateModMenu();
    } else if (k.key == "r") {
      updateCache();
      updateModMenu();
    } else if (k.key == "m") {
      modlist = null;
      updateModMenu();
      scene = "modmenu";
    }
  } else if (scene == "modmenu") {
    if (k.key == "m" && modlistsel == null) {
      scene = "prompt_cache";
    }
    if (modlistsel != null) {
      if (k.key == "d") {
        caches.open("ModCache").then(function(mca) {
          mca.delete(modlistsel).then(function() {
            if (MODS.includes(modlistsel)) {
              MODS.splice(MODS.indexOf(modlistsel), 1);
            }
            modlistsel = null;
            updateModMenu();
          });
        })
      } else if (k.key == "l") {
        // Load / Remove
        if (MODS.includes(modlistsel)) {
          MODS.splice(MODS.indexOf(modlistsel), 1);
        } else {
          MODS.push(modlistsel);
        }
      } else if (k.key == "b") {
        modlistsel = null;
      }
    }
  } else if (GAME.hasOwnProperty(`KEY_EVENT_${scene}`)) {
    GAME[`KEY_EVENT_${scene}`](k);
  }
  if (GAME.hasOwnProperty(`KEY_EVENT_global`)) GAME.KEY_EVENT_global(k);
  let kp = new Key(key, keyCode);
  let kd = IsKeyPressed(kp);
  if (!kd.res) keystack.push(kp);
}

function keyReleased(k) {
  if (GAME.hasOwnProperty(`KEY_RELEASED_${scene}`)) {
    GAME[`KEY_RELEASED_${scene}`](k);
  }
  if (GAME.hasOwnProperty(`KEY_RELEASED_global`)) GAME.KEY_RELEASED_global(k);
  let kp = new Key(key, keyCode);
  let kd = IsKeyPressed(kp);
  if (kd.res) keystack.splice(kd.ind[0], 1);
}

function mousePressed() {
  mp = true;
  if (GAME.hasOwnProperty(`MOUSE_EVENT_${scene}`)) {
    GAME[`MOUSE_EVENT_${scene}`]();
  }
  if (GAME.hasOwnProperty(`MOUSE_EVENT_global`)) GAME.MOUSE_EVENT_global();
}

function mouseReleased() {
  mr = true;
  if (GAME.hasOwnProperty(`MOUSE_RELEASE_${scene}`)) {
    GAME[`MOUSE_RELEASE_${scene}`]();
  }
  if (GAME.hasOwnProperty(`MOUSE_RELEASE_global`)) GAME.MOUSE_RELEASE_global();
}

function mouseWheel(event) {
  if (scene == "modmenu") {
    modscroll += event.delta;
    modscroll = Math.min(0, modscroll);
  }
  if (GAME.hasOwnProperty(`MOUSE_SCROLL_${scene}`)) {
    GAME[`MOUSE_SCROLL_${scene}`](event.delta);
  }
  if (GAME.hasOwnProperty("MOUSE_SCROLL_global")) GAME.MOUSE_SCROLL_global(event.deltaX, event.deltaY, event.deltaZ);
}

window.onload = function() {
  window.hideWarning = false;
  window.addEventListener('beforeunload', (event) => {
    if (!hideWarning) {
      event.preventDefault();
      event.returnValue = '';
    }
  });
  if (itch) { // im not giving them any money (github)
    assetspointer = "https://ezyybin604.github.io/DataRep/v3.zip";
  }
}

function startDownload() {
  tex = "Loading..";
  document.title = "fred.js (Loading)";
  caches.open("ChickenNuggetCacheDeluxe").then(function(cache) {
    cache.match(assetspointer).then(function(data) {
      data.blob().then(function(final_data) {
        console.log(final_data);
        JSZip.loadAsync(final_data).then(function(zip) {
          totalassets = 0;
          totalassets += calculateTotalAssets(assets.sounds);
          totalassets += calculateTotalAssets(assets.imgs);
          totalassets += calculateTotalAssets(assets.sounds);
          ZipRequest = zip;
          setTimeout(function() {
            scene = upondownload;
          }, 100)
        })
      })
    })
  });
}

function startGame() {
  scene = "init";
  ZipRequest = undefined;
}
