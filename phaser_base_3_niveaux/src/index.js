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
var compteurMineraux = { "rouge": 0, "jaune_clair": 0, "rose": 0, "violet": 0, "blanc": 0, "orange": 0 };
var texteCompteur;
var scene;
var musique_de_fond;
var Squelette_1;
var box;

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
  bullet.setDisplaySize(20, 20);
  bullet.setCollideWorldBounds(false);
  bullet.body.onWorldBounds = true;
  bullet.body.allowGravity = true;
  bullet.setVelocity(450 * coefDir, 0);

  // Ajouter la collision entre le projectile et le squelette
  scene.physics.add.overlap(bullet, Squelette_1, () => {
    Squelette_1.disableBody(true, true); // Désactiver le squelette
    bullet.destroy(); // Détruire le projectile
  });
}

var config = {
  type: Phaser.AUTO,
  scale : {
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
  scene: {
    // une scene est un écran de jeu. Pour fonctionner il lui faut 3 fonctions  : create, preload, update
    preload: preload, // la phase preload est associée à la fonction preload, du meme nom (on aurait pu avoir un autre nom)
    create: create, // la phase create est associée à la fonction create, du meme nom (on aurait pu avoir un autre nom)
    update: update // la phase update est associée à la fonction update, du meme nom (on aurait pu avoir un autre nom)
  }
};

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

  // Effet de fondu sur le texte Game Over
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
    compteurMineraux = { "rouge": 0, "jaune_clair": 0, "rose": 0, "violet": 0, "blanc": 0, "orange": 0 };
    scene.scene.restart();  // Recharge la scène
    gameOver = false;
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
    game.destroy(true);  // Ferme le jeu
  });
  boutonQuitter.setOrigin(0.5);
  boutonQuitter.setDepth(21);
}
/***********************************************************************/
/** FONCTION PRELOAD 
/***********************************************************************/

/** La fonction preload est appelée une et une seule fois,
 * lors du chargement de la scene dans le jeu.
 * On y trouve surtout le chargement des assets (images, son ..)
 */
function preload() {
   // tous les assets du jeu sont placés dans le sous-répertoire src/assets/
   this.load.audio('background', 'src/assets/dd-fantasy-music-and-ambience.mp3'); 

   this.load.image("img_ciel", "src/assets/sky.png"); 
   this.load.image("img_plateforme", "src/assets/platform.png");  
   // chargement tuiles de jeu
   this.load.image("Phaser_tuilesdejeu", "src/assets/Tileset.png");
   this.load.image("fond", "src/assets/fond.png");

   box=this.load.image("box", "src/assets/box.png");

   this.load.spritesheet("esprit", "src/assets/spirit.png", { 
    frameWidth: 128, 
    frameHeight: 128 });

// chargement de la carte
this.load.tilemapTiledJSON("carte", "src/assets/map.json");  


   this.load.image("rouge", "src/assets/Red_crystal3.png"); 
   this.load.image("jaune_clair", "src/assets/Yellow-green_crystal3.png"); 
   this.load.image("rose", "src/assets/Pink_crystal3.png"); 
   this.load.image("violet", "src/assets/Violet_crystal3.png"); 
   this.load.image("blanc", "src/assets/White_crystal3.png"); 
   this.load.image("orange", "src/assets/Yellow_crystal3.png"); 

   this.load.image("bullet_explosion", "src/assets/boule_chimique.png");

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
  });}


/***********************************************************************/
/** FONCTION CREATE 
/***********************************************************************/

/* La fonction create est appelée lors du lancement de la scene
 * si on relance la scene, elle sera appelée a nouveau
 * on y trouve toutes les instructions permettant de créer la scene
 * placement des peronnages, des sprites, des platesformes, création des animations
 * ainsi que toutes les instructions permettant de planifier des evenements
 */
function create() {
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

player = this.physics.add.sprite(100,475 , 'img_perso'); 
player.index=100;
player.setCollideWorldBounds(true); 
player.setBounce(0); 
clavier = this.input.keyboard.createCursorKeys(); 

// Créer l’esprit
this.esprit = this.add.sprite(400, 475, 'esprit'); // Position fixe

// Créer les animations
this.anims.create({
  key: 'anim_Sq_1D', 
  frames: this.anims.generateFrameNumbers('Sq_1_D', { start: 0, end: 4 }),
  frameRate: 10,
  repeat: -1
});

this.anims.create({
  key: 'anim_Sq_1G', 
  frames: this.anims.generateFrameNumbers('Sq_1_G', { start: 0, end: 4 }),
  frameRate: 10,
  repeat: -1
});

// Créer les animations 
this.anims.create({
    key: 'phase1',
    frames: this.anims.generateFrameNumbers('esprit', { start: 0, end: 3 }),
    frameRate: 5,
    repeat: -1
  });
  this.esprit.play('phase1');

  

  // redimentionnement du monde avec les dimensions calculées via tiled
this.physics.world.setBounds(0, 0, 4768, 640);
//  ajout du champs de la caméra de taille identique à celle du monde
this.cameras.main.setBounds(0, 0, 4768, 640);
// ancrage de la caméra sur le joueur
this.cameras.main.startFollow(player);  
this.physics.add.collider(player, plateforme); 
// Création de la bulle de texte (initialement cachée)


  this.anims.create({
    key: "anim_tourne_gauche", // key est le nom de l'animation : doit etre unique poru la scene.
    frames: this.anims.generateFrameNumbers("gauche", { start: 7, end: 0 }), // on prend toutes les frames de img perso numerotées de 0 à 3
    frameRate: 10, // vitesse de défilement des frames
    repeat: -1 // nombre de répétitions de l'animation. -1 = infini
  }); 
  this.anims.create({
    key: "anim_tourne_droite", // key est le nom de l'animation : doit etre unique poru la scene.
    frames: this.anims.generateFrameNumbers("droite", { start: 0, end: 7 }), // on prend toutes les frames de img perso numerotées de 0 à 3
    frameRate: 10, // vitesse de défilement des frames
    repeat: -1 // nombre de répétitions de l'animation. -1 = infini
  }); 
  this.anims.create({
    key: "anim_face", // key est le nom de l'animation : doit etre unique poru la scene.
    frames: this.anims.generateFrameNumbers("img_perso", { start: 0, end: 7 }), // on prend toutes les frames de img perso numerotées de 0 à 3
    frameRate: 10, // vitesse de défilement des frames
    repeat: -1 // nombre de répétitions de l'animation. -1 = infini
  }); 
  groupeBullets = scene.physics.add.group();
  groupe_mineraux = this.physics.add.group(); 

  box = this.physics.add.sprite(2450, 100, "box"); // Création du sprite
  box.setCollideWorldBounds(true); // Empêche la box de sortir du monde
  box.setImmovable(true); // La box ne bougera pas si elle est touchée
  this.physics.add.collider(player, box); // Permet au joueur de rentrer en collision avec la box
  this.physics.add.collider(plateforme, box); // Permet au joueur de rentrer en collision avec la box


  // Liste des positions prédéfinies pour les minéraux
let positionsMineraux = [
  { x: 500, y: 300, type: "rouge" },
  { x: 575, y: 310, type: "violet" },
  { x: 555, y: 300, type: "blanc" },
  { x: 650, y: 250, type: "blanc" },
  { x: 900, y: 275, type: "rose" },
  { x: 1300, y: 320, type: "violet" },
  { x: 1800, y: 280, type: "orange" },
  { x: 1850, y: 310, type: "jaune_clair" },
  { x: 2350, y: 300, type: "rouge" },
  { x: 2400, y: 250, type: "blanc" },
  { x: 1550, y: 275, type: "rose" },
  { x: 1050, y: 320, type: "violet" },
  { x: 700, y: 280, type: "orange" },
  { x: 550, y: 310, type: "jaune_clair" },
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
  
  // Empêcher les minéraux de flotter en les faisant tomber sur le sol
  this.physics.add.collider(groupe_mineraux, plateforme);
  this.physics.add.overlap(player, groupe_mineraux, ramasserMineraux, null, this);
  
  this.input.keyboard.on("keydown-A", () => lancerAttaque("explosion"));
  this.input.keyboard.on("keydown-Z", () => lancerAttaque("congelation"));
  this.input.keyboard.on("keydown-E", () => lancerAttaque("tempete"));
  this.input.keyboard.on("keydown-R", () => lancerAttaque("foudre"));
  this.input.keyboard.on("keydown-T", () => lancerAttaque("chaleur"));

  this.physics.add.collider(groupe_mineraux, plateforme);

  // Création du texte du compteur avec un fond semi-transparent
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
  mettreAJourCompteur();
  this.bulleTexte = this.add.text(400, 250, 'Je suis un esprit...', {
    fontSize: '16px',
    fill: '#fff',
    backgroundColor: '#000',
    padding: { x: 10, y: 5 }
  }).setOrigin(0.5).setVisible(false);
  
  // Positions prédéfinies pour les squelettes
  let positionsSquelettes = [
    { x: 1000, y: 300 },
    { x: 1300, y: 300 },
    { x: 3000, y: 300 }
  ];

  // Créer les squelettes
  for (let pos of positionsSquelettes) {
    let squelette = this.physics.add.sprite(pos.x, pos.y, 'Sq_1_G');
    squelette.setCollideWorldBounds(true);
    squelette.setBounce(0);
    squelette.body.setSize(80, 50);
    squelette.body.setOffset(30, 80);
    Squelettes.push(squelette);

    // Initialiser l'animation et la direction
    squelette.anims.play('anim_Sq_1D', true);

    // Boucle simple pour alterner le déplacement
    let movingRight = true;
    setInterval(() => {
      if (movingRight) {
        squelette.setVelocityX(50); // Déplace à droite
        squelette.anims.play('anim_Sq_1D', true);
      } else {
        squelette.setVelocityX(-50); // Déplace à gauche
        squelette.anims.play('anim_Sq_1G', true);
      }
      movingRight = !movingRight;
    }, 3000); // Change de direction toutes les 3 secondes
  }

  // Ajouter les collisions entre les squelettes et les plateformes
  Squelettes.forEach(squelette => {
    this.physics.add.collider(squelette, plateforme);
    this.physics.add.overlap(player, squelette, finDuJeu);
  });

  // Ajouter les collisions entre les projectiles et les squelettes
  groupeBullets.children.iterate(bullet => {
    Squelettes.forEach(squelette => {
      this.physics.add.overlap(bullet, squelette, () => {
        squelette.disableBody(true, true); // Désactiver le squelette
        bullet.destroy(); // Détruire le projectile
      });
    });
  });
}




/***********************************************************************/
/** FONCTION UPDATE 
/***********************************************************************/

function update() {
  texteCompteur.setPosition(scene.cameras.main.scrollX + 20, scene.cameras.main.scrollY + 20);

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

  const distance = Phaser.Math.Distance.Between(
        player.x, player.y,
        this.esprit.x, this.esprit.y
    );

    if (distance < 100) {
        this.bulleTexte.setVisible(true);
        this.bulleTexte.setPosition(this.esprit.x, this.esprit.y - 50);
    } else {
        this.bulleTexte.setVisible(false);
    }

  if (gameOver) {
    // arret du son background
    musique_de_fond.stop(); 
    return;
  }
}

