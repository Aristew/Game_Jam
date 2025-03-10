// chargement des librairies

/***********************************************************************/
/** CONFIGURATION GLOBALE DU JEU ET LANCEMENT 
/***********************************************************************/

// configuration générale du jeu
var groupe_plateformes;
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
      debug: false // permet de voir les hitbox et les vecteurs d'acceleration quand mis à true
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

  // Mise à jour de l'affichage des minéraux collectés
  texteCompteur.setText(`Oxygène: ${compteurMineraux["rouge"]}  Fer: ${compteurMineraux["jaune_clair"]}  Hydrogène: ${compteurMineraux["rose"]}\nSodium: ${compteurMineraux["violet"]}  Chlore: ${compteurMineraux["blanc"]}  Silicium: ${compteurMineraux["orange"]}`);
  
  // Vérifier que le texte a bien été mis à jour
  console.log(`Minéral collecté: ${un_minerau.texture.key}`);
  console.log(`Minéraux: Oxygène: ${compteurMineraux["rouge"]}, Fer: ${compteurMineraux["jaune_clair"]}, Hydrogène: ${compteurMineraux["rose"]}`);
}

function lancerAttaque(type) {
  let attaques = {
    "explosion": { elements: ["jaune_clair", "rouge"], effet: "Explosion Chimique !" },
    "congelation": { elements: ["rose", "rouge"], effet: "Congélation Instantanée !" },
    "tempete": { elements: ["orange", "rouge"], effet: "Tempête de Sable !" },
    "foudre": { elements: ["jaune_clair", "violet"], effet: "Foudre Électrostatique !" },
    "chaleur": { elements: ["violet", "blanc"], effet: "Chaleur Intense !" }
  };

  let attaque = attaques[type];

  // Vérifie si le joueur a suffisamment de minéraux pour lancer l'attaque
  if (attaque.elements.every(e => compteurMineraux[e] > 0)) {
    attaque.elements.forEach(e => compteurMineraux[e]--);

    // Mise à jour de l'affichage des minéraux
    texteCompteur.setText(`Oxygène: ${compteurMineraux["rouge"]}  Fer: ${compteurMineraux["jaune_clair"]}  Hydrogène: ${compteurMineraux["rose"]}\nSodium: ${compteurMineraux["violet"]}  Chlore: ${compteurMineraux["blanc"]}  Silicium: ${compteurMineraux["orange"]}`);

    // Affiche un message avec la composition du sort, son effet et la touche associée
    console.log(`Sort lancé: ${attaque.effet}`);
    console.log(`Minéraux nécessaires : ${attaque.elements.join(', ')}`);
    console.log(`Touche pour lancer: ${type.toUpperCase()}`);

    // Lancement du projectile correspondant
    tirerProjectile(type, player);

    // Affiche un message sur l'écran indiquant que le sort a été lancé avec succès
    afficherMessage(`Sort lancé: ${attaque.effet}`);
  } else {
    console.log("Pas assez de minéraux !");
    
    // Affiche un message à l'écran si le joueur n'a pas assez de minéraux
    afficherMessage("Pas assez de minéraux pour lancer ce sort !");
  }
}

function afficherMessage(message) {
  if (!scene.texteMessage) {
    scene.texteMessage = scene.add.text(400, 300, "", { fontSize: '18px', fill: '#FF0000' });
    scene.texteMessage.setOrigin(0.5, 0.5);
  }

  scene.texteMessage.setText(message);

  // Effacer le message après 2 secondes
  scene.time.delayedCall(2000, () => {
    scene.texteMessage.setText('');
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
   this.load.image("img_ciel", "src/assets/sky.png"); 
   this.load.image("img_plateforme", "src/assets/platform.png");  

   this.load.image("rouge", "src/assets/Red_crystal3.png"); 
   this.load.image("jaune_clair", "src/assets/Yellow-green_crystal3.png"); 
   this.load.image("rose", "src/assets/Pink_crystal3.png"); 
   this.load.image("violet", "src/assets/Violet_crystal3.png"); 
   this.load.image("blanc", "src/assets/White_crystal3.png"); 
   this.load.image("orange", "src/assets/Yellow_crystal3.png"); 

   this.load.image("bullet_explosion", "src/assets/bullet_explosion.png");
   this.load.image("bullet_congelation", "src/assets/bullet_congelation.png");
   this.load.image("bullet_tempete", "src/assets/bullet_tempete.png");
   this.load.image("bullet_foudre", "src/assets/bullet_foudre.png");
   this.load.image("bullet_chaleur", "src/assets/bullet_chaleur.png");

   this.load.spritesheet("img_perso", "src/assets/Idle.png", {
    spacing: 46,
    frameWidth: 82,
    frameHeight: 73,
    
  }); 
  this.load.spritesheet("gauche", "src/assets/Run2.png", {
    frameWidth: 80,
    frameHeight: 70,
    spacing: 48
  }); 
  this.load.spritesheet("droite", "src/assets/Run.png", {
    frameWidth: 80,
    frameHeight: 70,
    spacing: 48
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

// redimentionnement du monde avec les dimensions calculées via tiled
//this.physics.world.setBounds(0, 0, 3200, 640);
//  ajout du champs de la caméra de taille identique à celle du monde
//this.cameras.main.setBounds(0, 0, 3200, 640);
  scene = this;
  this.add.image(400, 300, "img_ciel"); 
  groupe_plateformes = this.physics.add.staticGroup();
  groupe_plateformes.create(200, 584, "img_plateforme");
  groupe_plateformes.create(600, 584, "img_plateforme"); 
  groupe_plateformes.create(50, 300, "img_plateforme");
  groupe_plateformes.create(600, 450, "img_plateforme"); 
  groupe_plateformes.create(750, 270, "img_plateforme"); 
  player = this.physics.add.sprite(100, 250, 'img_perso'); 
  player.index=100;

  player.setCollideWorldBounds(true); 
  this.physics.add.collider(player, groupe_plateformes); 
  player.setBounce(0); 
  clavier = this.input.keyboard.createCursorKeys(); 

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

groupeBullets = this.physics.add.group();

groupe_mineraux = this.physics.add.group();
  for (let couleur of couleurs) {
    for (let i = 0; i < 3; i++) {
      let x = Phaser.Math.Between(50, 750);
      let y = Phaser.Math.Between(50, 400);
      groupe_mineraux.create(x, y, couleur);
    }
  }
  this.physics.add.collider(groupe_mineraux, groupe_plateformes); 
  this.physics.add.overlap(player, groupe_mineraux, ramasserMineraux, null, this);
    
  this.input.keyboard.on("keydown-A", () => lancerAttaque("explosion"));
  this.input.keyboard.on("keydown-Z", () => lancerAttaque("congelation"));
  this.input.keyboard.on("keydown-E", () => lancerAttaque("tempete"));
  this.input.keyboard.on("keydown-R", () => lancerAttaque("foudre"));
  this.input.keyboard.on("keydown-T", () => lancerAttaque("chaleur"));

  texteCompteur = this.add.text(450, 20, "Oxygène: 0  Fer: 0  Hydrogène: 0\nSodium: 0  Chlore: 0  Silicium: 0", { fontSize: '16px', fill: '#FFF' });
}





/***********************************************************************/
/** FONCTION UPDATE 
/***********************************************************************/

function update() {
  if (clavier.right.isDown) {
    player.setVelocityX(220);
    player.anims.play('anim_tourne_droite', true); 
    player.direction = 'right';  // Mise à jour de la direction
  } 
  else if (clavier.left.isDown) {
    player.setVelocityX(-220);
    player.anims.play('anim_tourne_gauche', true);    
    player.direction = 'left';  // Mise à jour de la direction
  } else {
    player.setVelocityX(0); 
    player.anims.play('anim_face', true); 
  } 
  if (clavier.up.isDown && player.body.blocked.down) {
    player.setVelocityY(-300);
  } 
  if (gameOver) {
    return;
  }
}

