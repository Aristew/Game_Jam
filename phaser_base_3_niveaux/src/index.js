// chargement des librairies

/***********************************************************************/
/** CONFIGURATION GLOBALE DU JEU ET LANCEMENT 
/***********************************************************************/

// configuration générale du jeu
var player; // désigne le sprite du joueur 
var clavier;
var boutonFeu;
var groupeBullets;
var gameOver = false;
var groupe_mineraux;
var couleurs = ["rouge", "jaune_clair", "rose", "violet", "blanc", "orange"];
var compteurMineraux = { "rouge": 100, "jaune_clair": 100, "rose": 100, "violet": 100, "blanc": 100, "orange": 100 };
var texteCompteur;
var scene;
var musique_de_fond;
var box;
var Squelettes1 = []; // Tableau pour stocker les squelettes a lance
var Squelettes2 = []; // Tableau pour stocker les squelettes a épée
var eaux;
var collision;
var porte;
var devientGlace = false;

let texteSorts;
let styleSorts = {
    fontSize: 16,
    fill: '#FFD700', // Doré
    fontStyle: 'bold',
    stroke: '#8B0000',
    strokeThickness: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fond semi-transparent
    padding: { x: 10, y: 5 },
    align: 'right'
};

class ScenePresentation extends Phaser.Scene {
  constructor() {
    super({ key: 'ScenePresentation' });
  }

  preload() {
    this.load.image('backgroundPres', 'src/assets/Battleground3.png'); // Charge ton image de fond
    //this.load.audio('introMusic', 'assets/intro_music.mp3'); // Charge la musique
  }

  create() {
    // Ajout de l'image de fond
    this.add.image(400, 500, 'backgroundPres').setScale(1.1);

    // Lance la musique d'ambiance
    //this.music = this.sound.add('introMusic', { loop: true, volume: 0.5 });
    //this.music.play();

    // Titre du jeu avec effet de fondu
    let titre = this.add.text(400, 120, "Mystic Alchemy", {
      fontSize: '64px',
      fill: '#ffdd44',
      fontStyle: 'bold',
      stroke: '#703200',
      strokeThickness: 6,
      shadow: { offsetX: 4, offsetY: 4, color: '#000', blur: 2, fill: true }
    }).setOrigin(0.5);

    this.tweens.add({
      targets: titre,
      alpha: { from: 0, to: 1 },
      duration: 2000,
      ease: 'Power2'
    });

    // Texte d'introduction
    this.add.text(400, 250, "Découvrez les secrets de la chimie et affrontez les ténèbres !", {
      fontSize: '26px',
      fill: '#ffffff',
      fontStyle: 'italic',
      stroke: '#000',
      strokeThickness: 3,
      align: 'center',
      wordWrap: { width: 700 }
    }).setOrigin(0.5);

    // Bouton "Jouer" avec animation
    let boutonJouer = this.add.text(400, 400, "▶ Commencer l'aventure", {
      fontSize: '28px',
      fill: '#ffffff',
      backgroundColor: '#004d00',
      padding: { x: 20, y: 10 },
      borderRadius: 10
    })
      .setInteractive()
      .on('pointerdown', () => {
        //this.music.stop(); // Coupe la musique
        this.scene.start('SceneJeu'); // Lance le jeu
      })
      .on('pointerover', () => {
        boutonJouer.setStyle({ backgroundColor: '#008000' });
      })
      .on('pointerout', () => {
        boutonJouer.setStyle({ backgroundColor: '#004d00' });
      });

    boutonJouer.setOrigin(0.5);
  }
}

class SceneJeu extends Phaser.Scene {
  constructor() {
    super({ key: 'SceneJeu' });
  }

  /***********************************************************************/
  /** FONCTION PRELOAD 
  /***********************************************************************/

  /** La fonction preload est appelée une et une seule fois,
   * lors du chargement de la scene dans le jeu.
   * On y trouve surtout le chargement des assets (images, son ..)
   */
  preload() {
    // tous les assets du jeu sont placés dans le sous-répertoire src/assets/
    this.load.audio('background', 'src/assets/dd-fantasy-music-and-ambience.mp3');

    this.load.image("img_ciel", "src/assets/sky.png");
    this.load.image("img_plateforme", "src/assets/platform.png");
    // chargement tuiles de jeu
    this.load.image("Phaser_tuilesdejeu", "src/assets/Tileset.png");
    this.load.image("fond", "src/assets/fond.png");

    box = this.load.image("box", "src/assets/box.png");

    this.load.spritesheet("esprit", "src/assets/spirit.png", {
      frameWidth: 128,
      frameHeight: 128
    });

    // chargement de la carte
    this.load.tilemapTiledJSON("carte", "src/assets/map.json");


    this.load.image("rouge", "src/assets/Red_crystal3.png");
    this.load.image("jaune_clair", "src/assets/Yellow-green_crystal3.png");
    this.load.image("rose", "src/assets/Pink_crystal3.png");
    this.load.image("violet", "src/assets/Violet_crystal3.png");
    this.load.image("blanc", "src/assets/White_crystal3.png");
    this.load.image("orange", "src/assets/Yellow_crystal3.png");

    this.load.image("bullet_explosion", "src/assets/boule_chimique.png");
    this.load.spritesheet("eau", "src/assets/eau.png", {
      frameWidth: 320,
      frameHeight: 50,

    });
    this.load.image("bullet_congelation", "src/assets/boule_de_neige.png");
    this.load.image("bullet_tempete", "src/assets/sable.png");
    this.load.image("bullet_foudre", "src/assets/foudre.png");
    this.load.image("bullet_chaleur", "src/assets/boules_de_feu.png");
    this.load.spritesheet("img_perso", "src/assets/Idle.png", {

      frameWidth: 128,
      frameHeight: 73,

    });
    this.load.spritesheet("gauche", "src/assets/RunG.png", {
      frameWidth: 128,
      frameHeight: 70,

    });
    this.load.spritesheet("droite", "src/assets/Run.png", {
      frameWidth: 128,
      frameHeight: 70,
    });


    this.load.spritesheet("Sq_1_D", "src/assets/Squelette_1D.png", {
      frameWidth: 128,
      frameHeight: 128,
    });
    this.load.spritesheet("Sq_1_G", "src/assets/Squelette_1G.png", {
      frameWidth: 128,
      frameHeight: 128,
    });
    this.load.spritesheet("Sq_1_Mort", "src/assets/Dead_Squelette_1D.png", {
      frameWidth: 128,
      frameHeight: 128,
    });
    this.load.spritesheet("Sq_2_D", "src/assets/Squelette_2D.png", {
      frameWidth: 128,
      frameHeight: 128,
    });
    this.load.spritesheet("Sq_2_G", "src/assets/Squelette_2G.png", {
      frameWidth: 128,
      frameHeight: 128,
    });
    this.load.spritesheet("porte", "src/assets/spritesheet_porte.png", {
      frameWidth: 96,
      frameHeight: 120,
    });

  }

  /***********************************************************************/
  /** FONCTION CREATE 
  /***********************************************************************/

  /* La fonction create est appelée lors du lancement de la scene
   * si on relance la scene, elle sera appelée a nouveau
   * on y trouve toutes les instructions permettant de créer la scene
   * placement des peronnages, des sprites, des platesformes, création des animations
   * ainsi que toutes les instructions permettant de planifier des evenements
   */
  create() {
    // lancement du son background
    musique_de_fond = this.sound.add('background');
    musique_de_fond.play();
    // redimentionnement du monde avec les dimensions calculées via tiled
    //this.physics.world.setBounds(0, 0, 3200, 640);
    //  ajout du champs de la caméra de taille identique à celle du monde
    //this.cameras.main.setBounds(0, 0, 3200, 640);
    scene = this;
    this.add.image(2384, 320, "fond");
    const carteDuNiveau = this.add.tilemap("carte");
    scene.texteMessage = scene.add.text(0, 0, "", {
      fontSize: '20px',
      fill: '#FFD700',
      fontStyle: 'bold',
      stroke: '#8B0000',
      strokeThickness: 3
    }).setOrigin(0.5, 0.5);

    // chargement du jeu de tuiles
    const tileset = carteDuNiveau.addTilesetImage(
      "Tileset",
      "Phaser_tuilesdejeu"
    );

    // chargement du calque calque_background
    // chargement du calque calque_background_2
    const fond = carteDuNiveau.createLayer(
      "fond",
      tileset
    );
    const plateforme = carteDuNiveau.createLayer(
      "plateforme",
      tileset
    );

    plateforme.setCollisionByProperty({ estSolide: true });
    this.esprit = this.add.sprite(400, 475, 'esprit'); // Position fixe
    this.esprit1 = this.add.sprite(832, 416, 'esprit'); // Position fixe

player = this.physics.add.sprite(100,475 , 'img_perso'); 
player.index=100;
player.setCollideWorldBounds(true); 
player.setBounce(0); 
player.setDepth(9);
clavier = this.input.keyboard.createCursorKeys(); 



if (!this.anims.exists('anim_Sq_1D')) {
    this.anims.create({
      key: "eau_glace",
      frames: [{ key: "eau", frame: 3 }]
    }); 
  }

    if (!this.anims.exists('anim_Sq_1D')) {
      this.anims.create({
        key: 'anim_Sq_1D',
        frames: this.anims.generateFrameNumbers('Sq_1_D', { start: 0, end: 4 }),
        frameRate: 10,
        repeat: -1
      });
    }

    if (!this.anims.exists('anim_Sq_1G')) {
      this.anims.create({
        key: 'anim_Sq_1G',
        frames: this.anims.generateFrameNumbers('Sq_1_G', { start: 0, end: 4 }),
        frameRate: 10,
        repeat: -1
      });
    }

    if (!this.anims.exists('anim_Sq_2D')) {
      this.anims.create({
        key: 'anim_Sq_2D',
        frames: this.anims.generateFrameNumbers('Sq_2_D', { start: 0, end: 4 }),
        frameRate: 10,
        repeat: -1
      });
    }

    if (!this.anims.exists('anim_Sq_2G')) {
      this.anims.create({
        key: 'anim_Sq_2G',
        frames: this.anims.generateFrameNumbers('Sq_2_G', { start: 0, end: 4 }),
        frameRate: 10,
        repeat: -1
      });
    }

    if (!this.anims.exists('phase1')) {
      this.anims.create({
        key: 'phase1',
        frames: this.anims.generateFrameNumbers('esprit', { start: 0, end: 3 }),
        frameRate: 5,
        repeat: -1
      });
    }
    if (!this.anims.exists('anim_porte')) {
      this.anims.create({
        key: 'anim_porte',
        frames: this.anims.generateFrameNumbers('porte', { start: 0, end: 5 }),
        frameRate: 5,
        repeat: 0
      });
    }
this.esprit.play('phase1');
this.esprit1.play('phase1');
  

  // redimentionnement du monde avec les dimensions calculées via tiled
this.physics.world.setBounds(0, 0, 4768, 640);
//  ajout du champs de la caméra de taille identique à celle du monde
this.cameras.main.setBounds(0, 0, 4768, 640);
// ancrage de la caméra sur le joueur
this.cameras.main.startFollow(player);  
this.physics.add.collider(player, plateforme); 
// Création de la bulle de texte (initialement cachée)



    if (!this.anims.exists('anim_tourne_gauche')) {
      this.anims.create({
        key: 'anim_tourne_gauche',
        frames: this.anims.generateFrameNumbers('gauche', { start: 7, end: 0 }),
        frameRate: 10,
        repeat: -1
      });
    }

    if (!this.anims.exists('anim_tourne_droite')) {
      this.anims.create({
        key: 'anim_tourne_droite',
        frames: this.anims.generateFrameNumbers('droite', { start: 0, end: 7 }),
        frameRate: 10,
        repeat: -1
      });
    }

    if (!this.anims.exists('anim_face')) {
      this.anims.create({
        key: 'anim_face',
        frames: this.anims.generateFrameNumbers('img_perso', { start: 0, end: 7 }),
        frameRate: 10,
        repeat: -1
      });
    }

    groupeBullets = scene.physics.add.group();
    groupe_mineraux = this.physics.add.group();

    box = this.physics.add.sprite(2450, 100, "box"); // Création du sprite
    box.setCollideWorldBounds(true); // Empêche la box de sortir du monde
    box.setImmovable(true); // La box ne bougera pas si elle est touchée
    this.physics.add.collider(player, box); // Permet au joueur de rentrer en collision avec la box
    this.physics.add.collider(plateforme, box); // Permet au joueur de rentrer en collision avec la box
    this.physics.add.collider(player, porte);

    // Liste des positions prédéfinies pour les minéraux
    let positionsMineraux = [
      { x: 450, y: 300, type: "rouge" },
      { x: 550, y: 310, type: "violet" },
      { x: 980, y: 350, type: "rouge" },
      { x: 485, y: 300, type: "blanc" },
      { x: 980, y: 350, type: "rose" },
      { x: 650, y: 250, type: "blanc" },
      { x: 900, y: 275, type: "rose" },
      { x: 2400, y: 250, type: "blanc" },
      { x: 1550, y: 275, type: "rose" },
      { x: 1050, y: 320, type: "violet" },
      { x: 700, y: 280, type: "orange" },
      { x: 550, y: 310, type: "jaune_clair" },
      { x: 2700, y: 350, type: "rouge" },
      { x: 1300, y: 320, type: "violet" },
      { x: 1800, y: 280, type: "orange" },
      { x: 1850, y: 310, type: "jaune_clair" },
      { x: 2350, y: 300, type: "rouge" },
      { x: 2400, y: 250, type: "blanc" },
      { x: 1550, y: 275, type: "rose" },
      { x: 1050, y: 320, type: "violet" },
      { x: 700, y: 280, type: "orange" },
      { x: 515, y: 310, type: "jaune_clair" },
      { x: 2700, y: 350, type: "rouge" },
      { x: 3200, y: 400, type: "jaune_clair" },
      { x: 3500, y: 420, type: "rose" },
      { x: 4100, y: 100, type: "violet" },
      { x: 4300, y: 480, type: "blanc" },
      { x: 4600, y: 500, type: "orange" },
      { x: 5000, y: 350, type: "rouge" },
      { x: 5400, y: 400, type: "jaune_clair" },
      { x: 5800, y: 400, type: "rose" },
      { x: 6400, y: 400, type: "violet" },
      { x: 6400, y: 400, type: "blanc" },
      { x: 6400, y: 400, type: "orange" }
    ];

// Générer les minéraux à des positions fixes
groupe_mineraux = this.physics.add.group();
for (let pos of positionsMineraux) {
  let minerau = groupe_mineraux.create(pos.x, pos.y, pos.type);
  minerau.setBounce(0.2);  
  minerau.setCollideWorldBounds(true);
}
groupe_mineraux.setDepth(15);

  // Empêcher les minéraux de flotter en les faisant tomber sur le sol
  this.physics.add.collider(groupe_mineraux, plateforme);
  this.physics.add.overlap(player, groupe_mineraux, ramasserMineraux, null, this);
  
  this.input.keyboard.on("keydown-A", () => lancerAttaque("explosion"));
  this.input.keyboard.on("keydown-Z", () => lancerAttaque("congelation"));
  this.input.keyboard.on("keydown-E", () => lancerAttaque("tempete"));
  this.input.keyboard.on("keydown-R", () => lancerAttaque("foudre"));
  this.input.keyboard.on("keydown-T", () => lancerAttaque("chaleur"));

    this.physics.add.collider(groupe_mineraux, plateforme);

    // Création de l'affichage des sorts (invisible au départ)
    texteSorts = this.add.text(600, 20, "", styleSorts).setDepth(10).setVisible(false);
    texteSorts.setScrollFactor(0); // Reste fixe à l'écran
    // Création du texte du compteur avec un fond semi-transpa
    // rent
    let styleCompteur = {
      fontSize: '18px',
      fill: '#FFD700', // Doré
      fontStyle: 'bold',
      stroke: '#8B0000',
      strokeThickness: 3,
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fond semi-transparent
      padding: { x: 10, y: 5 },
      align: 'left'
    };

    texteCompteur = this.add.text(20, 20, "", styleCompteur).setDepth(10);
    texteCompteur.setScrollFactor(0); // Reste fixe à l'écran
    mettreAJourCompteur();

    
    this.bulleTexte = this.add.text(400, 250, '...', {  // Texte vide au départ
      fontSize: '16px',
      fill: '#fff',
      backgroundColor: '#000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setVisible(false);

    this.dialogues = [
      "Je suis un esprit",
      "je suis là pour te guider",
      "Dans ce monde, il existe une multitude d'atomes",
      "Combine les pour créer de puissants sorts",
      "Mais prends garde",
      "Les ressources sont rares"
    ];

    this.indexDialogue = 0;
    this.derniereParole = 0;
    this.joueurDansZone = false;

    this.bulleTexte1 = this.add.text(400, 250, '...', {  // Texte vide au départ
      fontSize: '16px',
      fill: '#fff',
      backgroundColor: '#000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setVisible(false);

    this.dialogues1 = [
      "Fais attention",
      "Il y a des squelettes",
      "combines les atomes pour créer un sort"
    ];

    this.indexDialogue1 = 0;
    this.derniereParole1 = 0;



    // Positions prédéfinies pour les squelettes
    let positionsSquelettes1 = [
      { x: 1000, y: 300 },
      { x: 1400, y: 300 },
      { x: 3000, y: 300 }
    ];

    let positionsSquelettes2 = [
      { x: 3400, y: 100 },
    ];

    // Créer les squelettes1
    for (let pos of positionsSquelettes1) {
      let squelette1 = this.physics.add.sprite(pos.x, pos.y, 'Sq_1_G');
      squelette1.setCollideWorldBounds(true);
      squelette1.setBounce(0);
      squelette1.body.setSize(80, 50);
      squelette1.body.setOffset(30, 80);
      Squelettes1.push(squelette1);

      // Initialiser l'animation et la direction
      squelette1.anims.play('anim_Sq_1D', true);

      // Boucle simple pour alterner le déplacement
      let movingRight = true;
      setInterval(() => {
        if (movingRight) {
          squelette1.setVelocityX(50); // Déplace à droite
          squelette1.anims.play('anim_Sq_1D', true);
        } else {
          squelette1.setVelocityX(-50); // Déplace à gauche
          squelette1.anims.play('anim_Sq_1G', true);
        }
        movingRight = !movingRight;
      }, 3000); // Change de direction toutes les 3 secondes
    }

    // Créer les squelettes2
    for (let pos of positionsSquelettes2) {
      let squelette2 = this.physics.add.sprite(pos.x, pos.y, 'Sq_2_G');
      squelette2.setCollideWorldBounds(true);
      squelette2.setBounce(0);
      squelette2.body.setSize(60, 70);
      squelette2.body.setOffset(50, 60);
      Squelettes2.push(squelette2);

      // Initialiser l'animation et la direction
      squelette2.anims.play('anim_Sq_2D', true);

      // Boucle simple pour alterner le déplacement
      let movingRight = true;
      setInterval(() => {
        if (movingRight) {
          squelette2.setVelocityX(50); // Déplace à droite
          squelette2.anims.play('anim_Sq_2D', true);
        } else {
          squelette2.setVelocityX(-50); // Déplace à gauche
          squelette2.anims.play('anim_Sq_2G', true);
        }
        movingRight = !movingRight;
      }, 3000); // Change de direction toutes les 3 secondes
    }

    // Ajouter les collisions entre les squelettes et les plateformes
    Squelettes1.forEach(squelette1 => {
      this.physics.add.collider(squelette1, plateforme);
      this.physics.add.overlap(player, squelette1, finDuJeu);
    });
    Squelettes2.forEach(squelette2 => {
      this.physics.add.collider(squelette2, plateforme);
      this.physics.add.overlap(player, squelette2, finDuJeu);
    });



    // Ajouter les collisions entre les projectiles et les squelettes
    groupeBullets.children.iterate(bullet => {
      Squelettes1.forEach(squelette1 => {
        this.physics.add.overlap(bullet, squelette1, () => {
          squelette1.disableBody(true, true); // Désactiver le squelette
          bullet.destroy(); // Détruire le projectile
        });
      });
    });
    // Ajouter les collisions entre les projectiles et les squelettes
    groupeBullets.children.iterate(bullet => {
      Squelettes2.forEach(squelette2 => {
        this.physics.add.overlap(bullet, squelette2, () => {
          squelette2.disableBody(true, true); // Désactiver le squelette
          bullet.destroy(); // Détruire le projectile
        });
      });
    });

    if (!this.anims.exists('eau_anim')) {
      this.anims.create({
        key: 'eau_anim',
        frames: this.anims.generateFrameNumbers('eau', { start: 0, end: 2 }),
        frameRate: 10,
        repeat: -1
      });
    }

    //eau = this.physics.add.staticSprite(400, 400, 'eau');
    eaux = this.physics.add.group({
      key: 'eau',
      repeat: 1,
      setXY: { x: 2016, y: 352 }
    });

    this.physics.add.collider(player, eaux, null, collisEau, this);
    collision = this.physics.add.collider(player, eaux);
    eaux.children.iterate(function iterateur(eau) { eau.anims.play('eau_anim'); });

    // Gérer les collisions

  
    this.physics.add.collider(plateforme, eaux);

    // Créer la porte
    porte = this.physics.add.sprite(630, 550, 'porte');
    porte.setCollideWorldBounds(true);
    this.physics.add.collider(porte, plateforme);
    porte.setImmovable(true);


    // Détecter si le joueur est près de la porte et appuie sur la touche espace
    this.input.keyboard.on('keydown-SPACE', () => {
      const distance = Phaser.Math.Distance.Between(player.x, player.y, porte.x, porte.y);
      if (distance < 50) { // Si le joueur est suffisamment proche de la porte
        porte.anims.play('anim_porte', true);
      }
    });

  }




  /***********************************************************************/
  /** FONCTION UPDATE 
  /***********************************************************************/

  update(time) {
    //texteCompteur.setPosition(scene.cameras.main.scrollX + 20, scene.cameras.main.scrollY + 20);

    if (clavier.right.isDown) {
      player.setVelocityX(220);
      player.anims.play('anim_tourne_droite', true);
      player.body.setSize(50, 67);
      player.body.setOffset(32, 5);
      player.direction = 'right';  // Mise à jour de la direction
    }
    else if (clavier.left.isDown) {
      player.setVelocityX(-220);
      player.anims.play('anim_tourne_gauche', true);
      player.body.setSize(50, 67);
      player.body.setOffset(45, 5);
      player.direction = 'left';  // Mise à jour de la direction
    } else {
      player.setVelocityX(0);
      player.anims.play('anim_face', true);
      player.body.setSize(50, 67);
      player.body.setOffset(35, 5);
    }
    if (clavier.up.isDown && player.body.blocked.down) {
      player.setVelocityY(-300);
    }
    if (player.y > 600 && !gameOver) {  // Si le joueur tombe trop bas
      finDuJeu();
    }
    if (player.x > 900) {
      texteSorts.setVisible(true);
      texteSorts.setText("Sorts : A - Explosion | Z - Congélation | E - Tempête | R - Foudre | T - Chaleur");

      // Position en bas de l'écran
      let cam = this.cameras.main;
      texteSorts.setPosition(cam.width / 2 - 395, cam.height - 40);
      } else {
          texteSorts.setVisible(false);
    }

    const distance = Phaser.Math.Distance.Between(
      player.x, player.y,
      this.esprit.x, this.esprit.y
    );
    const distance1 = Phaser.Math.Distance.Between(
      player.x, player.y,
      this.esprit1.x, this.esprit1.y
    );
    if (distance1 < 100) {
    if (!this.joueurDansZone1) {  
        this.joueurDansZone1 = true;

        if (!this.anciennementDansZone1) { 
            this.indexDialogue1 = 0;  // Ne réinitialise qu'à la première entrée
        }
        this.anciennementDansZone1 = true;
    }

    if (time > this.derniereParole1 + 1500 && this.indexDialogue1 < this.dialogues1.length) { 
        this.derniereParole1 = time;
        this.bulleTexte1.setVisible(false);

        this.time.delayedCall(500, () => { 
            this.bulleTexte1.setText(this.dialogues1[this.indexDialogue1]);
            this.bulleTexte1.setPosition(this.esprit1.x, this.esprit1.y - 50);
            this.bulleTexte1.setVisible(true); 
            this.indexDialogue1++;
        });
    }
} else {
    this.joueurDansZone1 = false;
    this.anciennementDansZone1 = false;  // Réinitialise seulement quand le joueur sort complètement
    this.bulleTexte1.setVisible(false);
}


if (distance1 < 100) {
  if (!this.joueurDansZone1) {  
      this.joueurDansZone1 = true;

      if (!this.anciennementDansZone1) { 
          this.indexDialogue1 = 0;  // Ne réinitialise qu'à la première entrée
      }
      this.anciennementDansZone1 = true;
  }

  if (time > this.derniereParole1 + 1500 && this.indexDialogue1 < this.dialogues1.length) { 
      this.derniereParole1 = time;
      this.bulleTexte1.setVisible(false);

      this.time.delayedCall(500, () => { 
          this.bulleTexte1.setText(this.dialogues1[this.indexDialogue1]);
          this.bulleTexte1.setPosition(this.esprit1.x, this.esprit1.y - 50);
          this.bulleTexte1.setVisible(true); 
          this.indexDialogue1++;
      });
  }
} else {
  this.joueurDansZone1 = false;
  this.anciennementDansZone1 = false;  // Réinitialise seulement quand le joueur sort complètement
  this.bulleTexte1.setVisible(false);
}


    if(devientGlace){
      eaux.children.iterate(function iterateur(eau) { eau.anims.play('eau_glace'); });    }


    if (gameOver) {
      // arret du son background
      musique_de_fond.stop();
      return;
    }
  }
}
class SceneJeu2 extends Phaser.Scene {
  constructor() {
    super({ key: 'SceneJeu2' });
  }
  preLoad(){
    this.load.image("Phaser_tuilesdejeu2", "src/assets/CaveG.png");
    this.load.tilemapTiledJSON("carte2", "src/assets/Map_cave.json");
  }
  create(){

  }
  update(){
    
  }
}

var config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  width: 800, // largeur en pixels
  height: 600, // hauteur en pixels
  physics: {
    // définition des parametres physiques
    default: "arcade", // mode arcade : le plus simple : des rectangles pour gérer les collisions. Pas de pentes
    arcade: {
      // parametres du mode arcade
      gravity: {
        y: 440 // gravité verticale : acceleration ddes corps en pixels par seconde
      },
      debug: true // permet de voir les hitbox et les vecteurs d'acceleration quand mis à true
    }
  },
  scene: [ScenePresentation, SceneJeu]
};

function tirerProjectile(type, player) {
  var coefDir = (player.direction == 'left') ? -1 : 1;
  var projectiles = {
    "explosion": 'bullet_explosion',
    "congelation": 'bullet_congelation',
    "tempete": 'bullet_tempete',
    "foudre": 'bullet_foudre',
    "chaleur": 'bullet_chaleur'
  };


  var bullet = groupeBullets.create(player.x + (25 * coefDir), player.y - 4, projectiles[type]);
  bullet.setCollideWorldBounds(false);
  bullet.body.onWorldBounds = true;
  bullet.body.allowGravity = true;  // Activation de la gravité

  // Ajuster la taille du projectile en fonction de son type
  switch (type) {
    case "explosion":
      bullet.setDisplaySize(30, 30);  // Exemple : taille de la boule d'explosion
      bullet.setVelocity(450 * coefDir, 0); // Moins de vitesse horizontale, tir plus haut
      break;
    case "congelation":
      bullet.setDisplaySize(25, 25);  // Exemple : taille de la boule de neige
      bullet.setVelocity(450 * coefDir, 0); // Moins de vitesse horizontale, tir plus haut
      break;
    case "tempete":
      bullet.setDisplaySize(40, 40);  // Exemple : taille de la boule de sable
      bullet.setVelocity(450 * coefDir, 10); // Moins de vitesse horizontale, tir plus haut
      break;
    case "foudre":
      bullet.setDisplaySize(15, 40);  // Exemple : taille de la foudre
      bullet.setVelocity(450 * coefDir, 0); // Moins de vitesse horizontale, tir plus haut
      break;
    case "chaleur":
      bullet.setDisplaySize(30, 30);  // Exemple : taille de la boule de feu
      bullet.setVelocity(450 * coefDir, 0); // Moins de vitesse horizontale, tir plus haut
      break;
    default:
      bullet.setDisplaySize(20, 20);  // Taille par défaut
      bullet.setVelocity(450 * coefDir, 0); // Moins de vitesse horizontale, tir plus haut
      break;
  }

  // Ajouter la collision entre le projectile et les squelettes1
  Squelettes1.forEach(squelette1 => {
    scene.physics.add.overlap(bullet, squelette1, () => {
      squelette1.disableBody(true, true); // Désactiver le squelette
      bullet.destroy(); // Détruire le projectile
    });
  });

  // Ajouter la collision entre le projectile et les squelettes
  Squelettes2.forEach(squelette2 => {
    scene.physics.add.overlap(bullet, squelette2, () => {
      squelette2.disableBody(true, true); // Désactiver le squelette
      bullet.destroy(); // Détruire le projectile
    });
  });


  // Collision avec une box
  scene.physics.add.overlap(bullet, box, () => {
    if (type === "chaleur") {  // Vérifie si le projectile est de type "chaleur"
      box.disableBody(true, true); // Désactive la box
    }
    bullet.destroy();
  });
  scene.physics.add.overlap(bullet, eaux, () => {
    if (type === "congelation") {  // Vérifie si le projectile est de type "chaleur"
      devientGlace = true;
    }
    bullet.destroy();
  });
  return devientGlace;
}

// création et lancement du jeu
var game = new Phaser.Game(config);

function ramasserMineraux(un_player, un_minerau) {
  compteurMineraux[un_minerau.texture.key]++;
  un_minerau.disableBody(true, true);
  mettreAJourCompteur();
}

function mettreAJourCompteur() {
  texteCompteur.setText(
    `🔮 Réserve d'Alchimiste 🔮\n` +
    `🔥 Oxygène: ${compteurMineraux["rouge"]}  ⚡ Fer: ${compteurMineraux["jaune_clair"]}  💧 Hydrogène: ${compteurMineraux["rose"]}\n` +
    `🌌 Sodium: ${compteurMineraux["violet"]}  ❄️ Chlore: ${compteurMineraux["blanc"]}  🏺 Silicium: ${compteurMineraux["orange"]}`
  );
}


function lancerAttaque(type) {
  let attaques = {
    "explosion": {
      elements: ["jaune_clair", "rouge"],
      effet: "Déflagration Alchimique !"
    },
    "congelation": {
      elements: ["rose", "rouge"],
      effet: "Malédiction de Givre !"
    },
    "tempete": {
      elements: ["orange", "rouge"],
      effet: "Invocation de la Tempête !"
    },
    "foudre": {
      elements: ["jaune_clair", "violet"],
      effet: "Éclair du Chaos !"
    },
    "chaleur": {
      elements: ["violet", "blanc"],
      effet: "Brasier Astral !"
    }
  };

  let attaque = attaques[type];

  if (attaque.elements.every(e => compteurMineraux[e] > 0)) {
    attaque.elements.forEach(e => compteurMineraux[e]--);

    // Mise à jour de l'affichage des minéraux
    texteCompteur.setText(`🔮 Réserve d'Alchimiste 🔮\n🔥 Oxygène: ${compteurMineraux["rouge"]}  ⚡ Fer: ${compteurMineraux["jaune_clair"]}  💧 Hydrogène: ${compteurMineraux["rose"]}\n🌌 Sodium: ${compteurMineraux["violet"]}  ❄️ Chlore: ${compteurMineraux["blanc"]}  🏺 Silicium: ${compteurMineraux["orange"]}`);

    // Effet magique
    afficherMessage(`✨ ${attaque.effet} ! ✨`);

    // Lancement du projectile correspondant
    tirerProjectile(type, player);
  } else {
    afficherMessage("⚠️ Pas assez d'essences magiques !");
  }
}


function afficherMessage(message) {
  if (!scene.texteMessage) {
    scene.texteMessage = scene.add.text(0, 0, "", {
      fontSize: '20px',
      fill: '#FFD700',
      fontStyle: 'bold',
      stroke: '#8B0000',
      strokeThickness: 3
    });
    scene.texteMessage.setOrigin(0.5, 0.5);
  }

  // Stopper toute animation en cours sur le texte
  scene.tweens.killTweensOf(scene.texteMessage);
  scene.texteMessage.setDepth(10);
  // Positionner le message au centre de l'écran en fonction de la caméra
  scene.texteMessage.setPosition(scene.cameras.main.scrollX + scene.cameras.main.width / 2,
    scene.cameras.main.scrollY + scene.cameras.main.height / 2);

  // Réinitialiser l'alpha (rendre visible immédiatement)
  scene.texteMessage.setAlpha(1);

  // Mettre à jour le texte
  scene.texteMessage.setText(message);

  // Lancer une nouvelle animation pour le faire disparaître
  scene.tweens.add({
    targets: scene.texteMessage,
    alpha: 0,
    duration: 2000,
    ease: 'Power2'
  });
}

function finDuJeu() {
  gameOver = true;
  player.setVelocity(0, 0); // Arrête le joueur
  player.anims.stop(); // Stop l'animation du joueur
  player.body.moves = false; // Empêche tout mouvement
  musique_de_fond.stop(); // Stop la musique

  // Fond noir semi-transparent
  let overlay = scene.add.rectangle(
    scene.cameras.main.scrollX + 400,
    scene.cameras.main.scrollY + 300,
    800, 600,
    0x000000, 0.7
  );
  overlay.setDepth(20);

  // Texte "Game Over" avec effet de fondu
  let texteGameOver = scene.add.text(
    scene.cameras.main.scrollX + 400,
    scene.cameras.main.scrollY + 200,
    "GAME OVER",
    {
      fontSize: '64px',
      fill: '#ff0000',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 6
    }
  );
  texteGameOver.setOrigin(0.5);
  texteGameOver.setDepth(21);

  scene.tweens.add({
    targets: texteGameOver,
    alpha: { from: 0, to: 1 },
    duration: 1000,
    ease: 'Power2'
  });

  // Bouton "Rejouer"
  let boutonRejouer = scene.add.text(
    scene.cameras.main.scrollX + 400,
    scene.cameras.main.scrollY + 320,
    "🔄 Rejouer",
    {
      fontSize: '30px',
      fill: '#ffffff',
      backgroundColor: '#008000',
      padding: { x: 10, y: 5 }
    }
  )
    .setInteractive()
    .on('pointerdown', () => {
      // Réinitialisation complète des variables du jeu
      compteurMineraux = { "rouge": 0, "jaune_clair": 0, "rose": 0, "violet": 0, "blanc": 0, "orange": 0 };
      gameOver = false;
      scene.scene.restart();
    });
  boutonRejouer.setOrigin(0.5);
  boutonRejouer.setDepth(21);

  // Bouton "Quitter"
  let boutonQuitter = scene.add.text(
    scene.cameras.main.scrollX + 400,
    scene.cameras.main.scrollY + 390,
    "🚪 Quitter",
    {
      fontSize: '30px',
      fill: '#ffffff',
      backgroundColor: '#800000',
      padding: { x: 10, y: 5 }
    }
  )
    .setInteractive()
    .on('pointerdown', () => {
      game.destroy(true); // Ferme complètement le jeu
    });
  boutonQuitter.setOrigin(0.5);
  boutonQuitter.setDepth(21);
}

function collisEau(player, eau) {

  if (eau.anims.currentFrame.index == 4) { // Par exemple, frame 2
    return true;
  }
  return false;
}
