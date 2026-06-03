/* Player — portage de player.py + animation.py (sprite 16x16, 10 frames).
 * idle_down=0 idle_up=1 idle_right=2 idle_left=2(flip)
 * moving_down=4,5 moving_up=6,7 moving_right=8,9 moving_left=8,9(flip)
 */
class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture = 'skeleton') {
    super(scene, x, y, texture, 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0, 0);
    this.body.setSize(12, 6);
    this.body.setOffset(2, 10);
    this.speed = 90;
    this.direction = 'down';
    this.moving = false;
    Player.createAnims(scene, texture);
    this.anims.play(texture + '-idle-down');
  }
  static createAnims(scene, key) {
    if (scene.anims.exists(key + '-idle-down')) return;
    const mk = (name, frames, rate) => scene.anims.create({
      key: key + '-' + name,
      frames: scene.anims.generateFrameNumbers(key, { frames }),
      frameRate: rate, repeat: -1,
    });
    mk('idle-down', [0], 1); mk('idle-up', [1], 1); mk('idle-right', [2], 1);
    mk('walk-down', [4, 5], 6); mk('walk-up', [6, 7], 6); mk('walk-right', [8, 9], 6);
  }
  handleInput(keys) {
    let vx = 0, vy = 0;
    if (keys.up) { vy = -this.speed; this.direction = 'up'; }
    else if (keys.down) { vy = this.speed; this.direction = 'down'; }
    else if (keys.left) { vx = -this.speed; this.direction = 'left'; }
    else if (keys.right) { vx = this.speed; this.direction = 'right'; }
    this.setVelocity(vx, vy);
    this.moving = (vx !== 0 || vy !== 0);
    this.updateStatus();
  }
  stop() { this.setVelocity(0, 0); this.moving = false; this.updateStatus(); }
  updateStatus() {
    const k = this.texture.key;
    const dir = this.direction, mv = this.moving;
    const right = mv ? '-walk-right' : '-idle-right';
    if (dir === 'up')   { this.anims.play(k + (mv ? '-walk-up' : '-idle-up'), true); this.setFlipX(false); }
    else if (dir === 'down') { this.anims.play(k + (mv ? '-walk-down' : '-idle-down'), true); this.setFlipX(false); }
    else if (dir === 'right'){ this.anims.play(k + right, true); this.setFlipX(false); }
    else { this.anims.play(k + right, true); this.setFlipX(true); }
  }
}
