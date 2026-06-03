/* DialogBox — portage de dialog.py
 * - dialogues multi-textes avec effet machine à écrire
 * - QCM imbriqué : un élément du tableau est [question, indexCorrect, choix0, choix1, choix2]
 *   -> bonne réponse : on avance ; mauvaise : "Dommage..." puis fermeture sans récompense.
 * - le callback onComplete(success) reçoit true seulement si le dialogue est allé au bout.
 */
class DialogBox {
  constructor(scene) {
    this.scene = scene;
    this.reading = false;
    this.aborted = false;
    this.texts = [];
    this.textIndex = 0;
    this.letterIndex = 0;
    this.onComplete = null;

    // boîte de dialogue (en bas)
    this.container = scene.add.container(0, 0).setDepth(3000).setVisible(false);
    this.container.ui = true;
    const W = scene.scale.width, H = scene.scale.height;
    const boxW = W * 0.9, boxH = 110;
    const boxX = (W - boxW) / 2, boxY = H - boxH - 16;

    this.bg = scene.add.image(boxX, boxY, 'dialog_box').setOrigin(0, 0).setDisplaySize(boxW, boxH);
    this.label = scene.add.text(boxX + 22, boxY + 18, '', {
      fontFamily: 'DialogFont, monospace', fontSize: '19px', color: '#000000',
      wordWrap: { width: boxW - 44 }, lineSpacing: 4,
    }).setOrigin(0, 0);
    this.hint = scene.add.text(boxX + boxW - 16, boxY + boxH - 14, '▶', {
      fontFamily: 'monospace', fontSize: '14px', color: '#444',
    }).setOrigin(1, 1);
    this.container.add([this.bg, this.label, this.hint]);

    // QCM
    this.qcmActive = false;
    this.qcmCorrect = 0;
    this.qcmAnswers = [];
    this.qcmQuestion = '';
    this.selectedChoice = 0;
    this.choiceTexts = [];
    this.choiceFrames = [];
    this.choiceArrow = scene.add.text(0, 0, '▶', {
      fontFamily: 'monospace', fontSize: '16px', color: '#ffd35a',
    }).setOrigin(0.5, 0.5).setDepth(3002).setVisible(false);
    this.choiceArrow.ui = true;

    // navigation
    scene.input.keyboard.on('keydown-UP', () => this._moveChoice(-1));
    scene.input.keyboard.on('keydown-Z', () => this._moveChoice(-1));
    scene.input.keyboard.on('keydown-DOWN', () => this._moveChoice(1));
    scene.input.keyboard.on('keydown-S', () => this._moveChoice(1));
  }

  start(texts, onComplete) {
    this.texts = Array.isArray(texts) ? texts.slice() : [texts];
    this.textIndex = 0; this.letterIndex = 0;
    this.aborted = false;
    this.onComplete = onComplete || null;
    this.reading = true;
    this.container.setVisible(true);
    this._renderCurrent();
  }

  _renderCurrent() {
    this._hideChoices();
    this.letterIndex = 0;
    const cur = this.texts[this.textIndex];
    if (Array.isArray(cur)) {
      this.qcmActive = true;
      this.qcmQuestion = String(cur[0] || '');
      this.qcmCorrect = cur[1] | 0;
      this.qcmAnswers = cur.slice(2).map(String);
      this.selectedChoice = 0;
    } else {
      this.qcmActive = false;
    }
    this.label.setText('');
    this.hint.setVisible(false);
  }

  next() {
    // QCM : valider la réponse sélectionnée
    if (this.qcmActive && this.choiceTexts.length > 0) {
      if (this.selectedChoice === this.qcmCorrect) {
        this._advance();
      } else {
        // mauvaise réponse -> Dommage... puis fermeture sans récompense
        this.aborted = true;
        this._hideChoices();
        this.qcmActive = false;
        this.texts = ['Dommage...'];
        this.textIndex = 0;
        this.letterIndex = 0;
        this.label.setText('');
        this.hint.setVisible(false);
      }
      return;
    }
    // texte normal : si pas fini, tout révéler ; sinon avancer
    const full = this._currentVisible();
    if (this.letterIndex < full.length) {
      this.letterIndex = full.length;
      this.label.setText(full);
      return;
    }
    this._advance();
  }

  _advance() {
    this.textIndex += 1;
    if (this.textIndex >= this.texts.length) {
      this._end(!this.aborted);
      return;
    }
    this._renderCurrent();
  }

  _end(success) {
    this.reading = false;
    this.container.setVisible(false);
    this._hideChoices();
    if (this.onComplete) { const cb = this.onComplete; this.onComplete = null; cb(success); }
  }

  _currentVisible() {
    const cur = this.texts[this.textIndex];
    if (Array.isArray(cur)) return this.qcmQuestion;
    return typeof cur === 'string' ? cur : '';
  }

  update() {
    if (!this.reading) return;
    const full = this._currentVisible();
    if (this.letterIndex < full.length) {
      this.letterIndex += 1;
      this.label.setText(full.slice(0, this.letterIndex));
    }
    const done = this.letterIndex >= full.length;
    if (done && this.qcmActive && this.choiceTexts.length === 0) this._showChoices();
    this.hint.setVisible(done && !this.qcmActive);
  }

  _showChoices() {
    this._hideChoices();
    const scene = this.scene;
    const W = scene.scale.width;
    const ignoreFromWorld = (obj) => {
      if (scene.cameras && scene.cameras.main) scene.cameras.main.ignore(obj);
    };

    // 1) créer d'abord les textes pour mesurer leur taille réelle
    const padX = 14, padY = 8;
    const items = this.qcmAnswers.map(ans => {
      const t = scene.add.text(0, 0, ans, {
        fontFamily: 'DialogFont, monospace', fontSize: '13px', color: '#1a1a1a',
        align: 'center', wordWrap: { width: W * 0.65 }, lineSpacing: 3,
      }).setOrigin(0.5, 0.5).setDepth(3002);
      return { t, w: t.width + padX * 2, h: t.height + padY * 2 };
    });

    // 2) empiler verticalement avec un vrai espacement entre chaque cadre
    const spaceBetween = 12;
    const totalH = items.reduce((s, it) => s + it.h, 0) + spaceBetween * (items.length - 1);
    // bloc QCM positionné au-dessus de la boîte de dialogue (qui commence à y≈354)
    const topY = 130;
    let y = topY;
    items.forEach((it, i) => {
      const cy = y + it.h / 2;
      // cadre blanc bordé
      const frame = scene.add.rectangle(W / 2, cy, it.w, it.h, 0xffffff)
        .setStrokeStyle(2, 0x222831)
        .setDepth(3001);
      frame.ui = true; it.t.ui = true;
      it.t.setPosition(W / 2, cy);
      ignoreFromWorld(frame); ignoreFromWorld(it.t);
      this.choiceFrames.push(frame);
      this.choiceTexts.push(it.t);
      y += it.h + spaceBetween;
    });
    this._updateArrow();
  }

  _hideChoices() {
    this.choiceTexts.forEach(t => t.destroy());
    this.choiceFrames.forEach(f => f.destroy());
    this.choiceTexts = [];
    this.choiceFrames = [];
    this.choiceArrow.setVisible(false);
  }

  _updateArrow() {
    const sel = this.choiceFrames[this.selectedChoice];
    if (!sel) { this.choiceArrow.setVisible(false); return; }
    this.choiceArrow.setVisible(true);
    this.choiceArrow.setPosition(sel.x - sel.width / 2 - 14, sel.y);
    // ré-appliquer la surbrillance : le cadre sélectionné a un contour doré
    this.choiceFrames.forEach((f, i) => {
      if (i === this.selectedChoice) f.setStrokeStyle(3, 0xd4a017);
      else f.setStrokeStyle(2, 0x222831);
    });
    if (this.scene.cameras && this.scene.cameras.main) this.scene.cameras.main.ignore(this.choiceArrow);
  }

  _moveChoice(d) {
    if (!this.reading || !this.qcmActive || this.choiceTexts.length === 0) return;
    const n = this.qcmAnswers.length;
    this.selectedChoice = (this.selectedChoice + d + n) % n;
    this._updateArrow();
  }
}
