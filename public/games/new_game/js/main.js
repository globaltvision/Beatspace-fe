/* Eternal Run — moteur web (Phaser 3), piloté par assets/game_data.json
 * Porte fidèlement map.py : registre des cartes, portails, PNJ, musique.
 */

// ----------------------------------------------------------------- Boot/Preload
class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  preload() { this.load.json('gamedata', 'assets/game_data.json'); }
  create() {
    const data = this.cache.json.get('gamedata');
    this.registry.set('gamedata', data);

    // charger toutes les cartes
    Object.keys(data.maps).forEach(name =>
      this.load.tilemapTiledJSON(name, `assets/maps/${name}.json`));
    // charger tous les tilesets (clé = nom de fichier)
    data.tilesetKeys.forEach(k => this.load.image(k, `assets/tilesets/${k}`));
    // sprites
    this.load.spritesheet('skeleton', 'assets/characters/skeleton.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('AI', 'assets/characters/AI.png', { frameWidth: 16, frameHeight: 16 });
    // ui
    this.load.image('dialog_box', 'assets/ui/dialog_box.png');
    for (let i = 1; i <= 4; i++) this.load.image('cd' + i, `assets/ui/cd${i}.png`);
    // musiques (best-effort)
    const musics = new Set();
    Object.values(data.maps).forEach(m => { if (m.music) musics.add(m.music); });
    musics.forEach(m => this.load.audio('mus_' + m, `assets/music/${m}`));

    this.load.once('complete', () => this.scene.start('World', { map: data.start, spawn: data.startSpawn }));
    this.load.start();
  }
}

// dialogues par défaut pour les PNJ dont le texte est calculé en Python (player.py)
const FALLBACK_DIALOG = {
  LightsGuy: ["À l'aide !! Je ne sais pas ce qu'il se passe\navec l'électricité",
              "Peux-tu aller vérifier la cheminée ?\nJe suis achluophobique...!!"],
  Boss: ["Te voilà enfin.", "Reviens me voir une fois que tu auras\nréuni les morceaux de disque."],
};

// ----------------------------------------------------------------- World
class WorldScene extends Phaser.Scene {
  constructor() { super('World'); }

  init(data) {
    this.mapName = data.map;
    this.spawnName = data.spawn;
    this.gamedata = this.registry.get('gamedata');
    if (!this.registry.has('inventory')) this.registry.set('inventory', []);
  }

  create() {
    const map = this.make.tilemap({ key: this.mapName });
    const def = this.gamedata.maps[this.mapName] || { portals: [], npcs: [] };

    // tilesets : associer chaque tileset Tiled à son image.
    // On lit le nom de fichier image dans le JSON BRUT (le Tileset runtime de Phaser
    // n'expose pas ce champ tant que la texture n'est pas liée).
    const rawTilesets = this.cache.tilemap.get(this.mapName).data.tilesets;
    const tsObjs = rawTilesets
      .map(ts => map.addTilesetImage(ts.name, ts.image))
      .filter(Boolean);

    // Fond couvrant toute la zone visible par la caméra (utile quand la carte est plus
    // petite que le viewport : on évite la bande noire en remplissant).
    const W0 = this.scale.width, H0 = this.scale.height;
    const zoom = 2;
    const viewW0 = W0 / zoom, viewH0 = H0 / zoom;
    const mapW0 = map.widthInPixels, mapH0 = map.heightInPixels;
    const bx0 = Math.min(0, (mapW0 - viewW0) / 2);
    const by0 = Math.min(0, (mapH0 - viewH0) / 2);
    this.add.rectangle(bx0, by0, Math.max(mapW0, viewW0), Math.max(mapH0, viewH0), 0x1a1d24)
      .setOrigin(0, 0).setDepth(-1);

    // calques de tuiles
    let topDepth = map.layers.length;
    map.layers.forEach((ld, i) => {
      const layer = map.createLayer(i, tsObjs, 0, 0);
      if (layer) layer.setDepth(i);
      if (ld.name === 'Top') topDepth = i;
    });
    this.topDepth = topDepth;

    // objets
    const objs = [];
    map.objects.forEach(og => og.objects.forEach(o => objs.push(o)));
    const byName = {};
    this.walls = [];
    objs.forEach(o => {
      if (o.name) byName[o.name] = o;
      if (o.type === 'collision') {
        const z = this.add.zone(o.x, o.y, o.width, o.height).setOrigin(0, 0);
        this.physics.add.existing(z, true);
        this.walls.push(z);
      }
    });
    this.byName = byName;

    // joueur
    const sp = byName[this.spawnName] || byName['player'] || { x: 240, y: 240 };
    this.player = new Player(this, sp.x, sp.y, 'skeleton');
    this.player.setDepth(topDepth - 0.5);
    this.physics.add.collider(this.player, this.walls);

    // portails (zones d'entrée) -> overlap
    this.portalActive = false;
    this.time.delayedCall(500, () => { this.portalActive = true; }); // évite le re-déclenchement immédiat
    def.portals.forEach(p => {
      const o = byName[p.origin];
      if (!o) return;
      const w = o.width || 8, h = o.height || 8;
      const z = this.add.zone(o.x, o.y, w, h).setOrigin(0, 0);
      this.physics.add.existing(z, true);
      this.physics.add.overlap(this.player, z, () => {
        if (!this.portalActive || this.dialog.reading) return;
        this.portalActive = false;
        this.changeMusicIfNeeded(this.gamedata.maps[p.target] && this.gamedata.maps[p.target].music);
        this.scene.restart({ map: p.target, spawn: p.tp });
      });
    });

    // PNJ
    this.npcs = [];
    Player.createAnims(this, 'AI');   // mêmes animations que le joueur, pour le sprite AI
    def.npcs.forEach(npc => {
      const pts = [];
      const n = npc.nb_points || 1;
      for (let i = 1; i <= n; i++) { const pt = byName[`${npc.name}_path${i}`]; if (pt) pts.push(pt); }
      const start = pts[0] || byName['player'] || { x: 240, y: 240 };
      const tex = 'AI';
      const sprite = this.physics.add.sprite(start.x, start.y, tex, 0).setOrigin(0, 0);
      sprite.setDepth(topDepth - 0.5);
      sprite.body.setSize(12, 6); sprite.body.setOffset(2, 10);
      this.physics.add.collider(sprite, this.walls);
      sprite.anims.play('AI-idle-down');
      // dialogue : depuis les données, sinon fallback selon la classe
      sprite.dialog = npc.dialog || FALLBACK_DIALOG[npc.cls] || ['...'];
      sprite.cls = npc.cls; sprite.reward = npc.reward;

      // joue l'animation de marche selon la direction du déplacement (porte player.py update_status)
      const faceDir = (dx, dy) => {
        if (Math.abs(dx) >= Math.abs(dy)) {
          if (dx >= 0) { sprite.anims.play('AI-walk-right', true); sprite.setFlipX(false); }
          else { sprite.anims.play('AI-walk-right', true); sprite.setFlipX(true); }
        } else {
          if (dy >= 0) { sprite.anims.play('AI-walk-down', true); sprite.setFlipX(false); }
          else { sprite.anims.play('AI-walk-up', true); sprite.setFlipX(false); }
        }
      };

      // patrouille
      if (pts.length >= 2) {
        const tweenTargets = pts.slice(1).concat([pts[0]]);
        let idx = 0;
        const moveNext = () => {
          const t = tweenTargets[idx % tweenTargets.length]; idx++;
          faceDir(t.x - sprite.x, t.y - sprite.y);
          const dist = Phaser.Math.Distance.Between(sprite.x, sprite.y, t.x, t.y);
          this.tweens.add({ targets: sprite, x: t.x, y: t.y,
            duration: Math.max(800, dist / 0.03), ease: 'Linear', onComplete: moveNext });
        };
        moveNext();
      }
      this.npcs.push(sprite);
    });

    // interactions (turnlight_on : allumer la cheminée du Niveau 1, etc.)
    objs.forEach(o => {
      if (o.name === 'turnlight_on') {
        const z = this.add.zone(o.x, o.y, Math.max(o.width, 12), Math.max(o.height, 12)).setOrigin(0, 0);
        this.physics.add.existing(z, true);
        this.physics.add.overlap(this.player, z, () => {
          if (!this.registry.get('lights_on')) {
            this.registry.set('lights_on', true);
            this.showToast("Cheminée allumée ! Retourne voir le PNJ.");
          }
        });
      }
    });

    // caméra monde : zoom x2, suit le joueur.
    // Si la carte est plus petite que le viewport sur un axe, on étend les bornes
    // de manière à CENTRER la carte (au lieu d'avoir une bande noire en bas / droite).
    const cam = this.cameras.main;
    cam.setZoom(2);
    const mapW = map.widthInPixels, mapH = map.heightInPixels;
    const viewW = cam.width / cam.zoom, viewH = cam.height / cam.zoom;
    const bx = Math.min(0, (mapW - viewW) / 2);
    const by = Math.min(0, (mapH - viewH) / 2);
    cam.setBounds(bx, by, Math.max(mapW, viewW), Math.max(mapH, viewH));
    cam.startFollow(this.player, true);
    cam.setRoundPixels(true);

    // caméra UI : par-dessus, sans zoom — pour la boîte de dialogue, l'inventaire et le label.
    // (sinon avec zoom 2 ces éléments sont multipliés par 2 et débordent du canevas)
    const W = this.scale.width, H = this.scale.height;
    this.uiCam = this.cameras.add(0, 0, W, H);
    this.uiCam.setZoom(1);
    this.uiCam.setScroll(0, 0);

    // entrées
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({ z: 'Z', q: 'Q', s: 'S', d: 'D' });
    this.input.keyboard.on('keydown-SPACE', () => this.onSpace());

    // dialogue + inventaire (objets UI, marqués .ui = true)
    this.dialog = new DialogBox(this);
    this.dialog.container.ui = true;
    this.buildInventory();

    // musique
    this.changeMusicIfNeeded(def.music);

    // petit nom de carte (UI)
    const lbl = this.add.text(4, 4, this.mapName, {
      fontFamily: 'monospace', fontSize: '10px', color: '#fff', backgroundColor: '#0008',
    }).setDepth(2000).setAlpha(0.7);
    lbl.ui = true;

    // zone réservée aux toasts (centrée en haut)
    this.toastText = this.add.text(W / 2, 28, '', {
      fontFamily: 'DialogFont, monospace', fontSize: '14px', color: '#ffffff',
      backgroundColor: '#000a', padding: { x: 8, y: 4 },
    }).setOrigin(0.5, 0).setDepth(2500).setAlpha(0);
    this.toastText.ui = true;

    // clignotement des lumières au Niveau 1 (porte blinking_lights de map.py) :
    // 1s visible, 2s noir, jusqu'à ce que le joueur active la cheminée.
    if (this.mapName === 'First_Level') {
      this.darkOverlay = this.add.rectangle(0, 0, W, H, 0x000000)
        .setOrigin(0, 0).setDepth(1500);
      this.darkOverlay.ui = true;
      this._lightPhase = 'light';
      this._lightPhaseEnd = this.time.now + 1000;
      this._lightTimer = this.time.addEvent({
        delay: 50, loop: true, callback: () => this._lightsTick(),
      });
      // état initial : visible si déjà éteinte (i.e. lumière pas encore allumée)
      this.darkOverlay.setVisible(false);
    }

    // partage caméra/objets : la caméra monde ignore l'UI, la caméra UI ignore le monde
    const allChildren = this.children.list;
    const uiObjs = allChildren.filter(c => c.ui);
    const worldObjs = allChildren.filter(c => !c.ui);
    cam.ignore(uiObjs);
    this.uiCam.ignore(worldObjs);
  }

  showToast(msg) {
    if (!this.toastText) return;
    this.toastText.setText(msg).setAlpha(1);
    this.tweens.add({ targets: this.toastText, alpha: 0, delay: 1800, duration: 600 });
  }

  _lightsTick() {
    if (!this.darkOverlay) return;
    if (this.registry.get('lights_on')) {
      this.darkOverlay.setVisible(false);
      if (this._lightTimer) { this._lightTimer.remove(); this._lightTimer = null; }
      return;
    }
    if (this.time.now >= this._lightPhaseEnd) {
      if (this._lightPhase === 'light') {
        this._lightPhase = 'dark';
        this._lightPhaseEnd = this.time.now + 2000;  // 2s noir
      } else {
        this._lightPhase = 'light';
        this._lightPhaseEnd = this.time.now + 1000;  // 1s visible
      }
    }
    this.darkOverlay.setVisible(this._lightPhase === 'dark');
  }

  buildInventory() {
    // nettoyer les anciens sprites pour éviter les doublons
    if (this.invSprites) this.invSprites.forEach(s => s.destroy());
    this.invSprites = [];
    const inv = this.registry.get('inventory');
    const W = this.scale.width;
    inv.forEach((cd, i) => {
      if (this.textures.exists(cd)) {
        const img = this.add.image(W - 18 - i * 22, 14, cd).setDepth(2000).setScale(1.4);
        img.ui = true;
        if (this.uiCam) this.cameras.main.ignore(img);
        this.invSprites.push(img);
      }
    });
  }

  giveReward(cd) {
    if (!cd) return;
    const inv = this.registry.get('inventory');
    if (!inv.includes(cd)) { inv.push(cd); this.registry.set('inventory', inv); this.buildInventory(); }
  }

  changeMusicIfNeeded(musicName) {
    if (!musicName) return;
    const cur = this.registry.get('musicKey');
    if (cur === musicName && this.sound.get('mus_' + musicName)) return;
    // stopper l'ancienne
    this.sound.stopAll();
    const key = 'mus_' + musicName;
    if (this.cache.audio.exists(key)) {
      const m = this.sound.add(key, { loop: true, volume: 0.25 });
      m.play();
      this.registry.set('musicKey', musicName);
    }
  }

  onSpace() {
    if (this.dialog.reading) { this.dialog.next(); return; }
    for (const npc of this.npcs) {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y);
      if (d < 28) {
        // LightsGuy : dialogue conditionnel selon la mission (allumer la cheminée)
        if (npc.cls === 'LightsGuy') {
          const lit = !!this.registry.get('lights_on');
          const dlg = lit
            ? ["Merci infiniment, je serais resté pétrifié\nsans toi.",
               "Tiens, ce n'est pas grand-chose, je sais...\nMais c'est tout ce que j'ai !"]
            : npc.dialog;
          this.dialog.start(dlg, () => { if (lit) this.giveReward('cd1'); });
          return;
        }
        this.dialog.start(npc.dialog, () => {
          // fin de dialogue : DiskGiver donne un CD
          if (npc.cls === 'DiskGiver') this.giveReward(npc.reward);
        });
        return;
      }
    }
  }

  update() {
    this.dialog.update();
    if (this.dialog.reading) { this.player.stop(); return; }
    const k = this.keys, c = this.cursors;
    this.player.handleInput({
      up: c.up.isDown || k.z.isDown, down: c.down.isDown || k.s.isDown,
      left: c.left.isDown || k.q.isDown, right: c.right.isDown || k.d.isDown,
    });
  }
}

const config = {
  type: Phaser.AUTO, width: 480, height: 480, parent: 'game',
  pixelArt: true, backgroundColor: '#10121a',
  physics: { default: 'arcade', arcade: { debug: false } },
  scene: [BootScene, WorldScene],
};
new Phaser.Game(config);
