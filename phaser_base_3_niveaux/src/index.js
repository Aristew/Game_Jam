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

function tirerProjectile(type, player) {
  var coefDir = (player.direction == 'left') ? -1 : 1;
  var projectiles = {
    "explosion": 'bullet_explosion',
    "congelation": 'bullet_congelation',
    "tempete": 'bullet_tempete',
    "foudre": 'bullet_foudre',
    "chaleur": 'bullet_chaleur'
  };
  
  groupeBullets = scene.physics.add.group();
  var bullet = groupeBullets.create(player.x + (25 * coefDir), player.y - 4, projectiles[type]);
  bullet.setDisplaySize(20, 20);
  bullet.setCollideWorldBounds(false);
  bullet.body.onWorldBounds = true;
  bullet.body.allowGravity = true;  // Activation de la gravité
  bullet.setVelocity(300 * coefDir, -150); // Moins de vitesse horizontale, tir plus haut
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
        y: 230 // gravité verticale : acceleration ddes corps en pixels par seconde
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
   this.load.spritesheet("esprit", "src/assets/spirit.png", { frameWidth: 128, frameHeight: 128 });
   this.load.image('bulle', 'src/assets/bulle.png'); // Optionnel, pour une bulle stylisée
// chargement de la carte
this.load.tilemapTiledJSON("carte", "src/assets/map.json");  


   this.load.image("rouge", "src/assets/Red_crystal3.png"); 
   this.load.image("jaune_clair", "src/assets/Yellow-green_crystal3.png"); 
   this.load.image("rose", "src/assets/Pink_crystal3.png"); 
   this.load.image("violet", "src/assets/Violet_crystal3.png"); 
   this.load.image("blanc", "src/assets/White_crystal3.png"); 
   this.load.image("orange", "src/assets/Yellow_crystal3.png"); 

   this.load.image("bullet_explosion", "src/assets/boule_chimique.png");

   this.load.image("bullet_congelation", "src/assets/boules_de_neige.png");
   this.load.image("bullet_tempete", "src/assets/sable.png");
   this.load.image("bullet_foudre", "src/assets/foudre.jpg");
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
    key: 'phase1',
    frames: this.anims.generateFrameNumbers('esprit', { start: 0, end: 4 }),
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

  groupe_mineraux = this.physics.add.group();

  // Nombre de minéraux à générer pour chaque couleur
  let nombreMinerauxParCouleur = 3;  
  
  for (let couleur of couleurs) {
    for (let i = 0; i < nombreMinerauxParCouleur; i++) {
      let x = Phaser.Math.Between(50, 6400);  // Toute la largeur de la carte
      let y = Phaser.Math.Between(0, 10);   // Hauteur contrôlée pour éviter le hors écran
  
      let minerau = groupe_mineraux.create(x, y, couleur);
      minerau.setBounce(0.2);  // Petit rebond pour un effet réaliste
      minerau.setCollideWorldBounds(true); 
    }
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
}





/***********************************************************************/
/** FONCTION UPDATE 
/***********************************************************************/

function update() {
  texteCompteur.setPosition(scene.cameras.main.scrollX + 20, scene.cameras.main.scrollY + 20);

  groupe_mineraux.children.iterate(function (minerau) {
    if (minerau.y > 600) {  // Si le minéral tombe trop bas
        let newX, newY;

        do {
            newX = Phaser.Math.Between(50, 6400); // Nouvelle position aléatoire en largeur
            newY = Phaser.Math.Between(50, 200);  // Nouvelle position en hauteur
        } while (newY > 600);  // Assure que le minéral ne spawn pas en dessous de la limite

        minerau.setPosition(newX, newY);
        minerau.setVelocity(0, 0);  // On réinitialise sa vitesse
    }
});

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

