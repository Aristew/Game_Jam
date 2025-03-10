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
var couleurs = ["rouge", "vert", "rose", "violet", "blanc", "jaune"];
var compteurMineraux = { "rouge": 0, "vert": 0, "rose": 0, "violet": 0, "blanc": 0, "jaune": 0 };
var texteCompteur;

function tirer(player) {
  var coefDir;
if (player.direction == 'left') { coefDir = -1; } else { coefDir = 1 }
  // on crée la balle a coté du joueur
  var bullet = groupeBullets.create(player.x + (25 * coefDir), player.y - 4, 'bullet');
  // parametres physiques de la balle.
  bullet.setCollideWorldBounds(true);
  bullet.body.onWorldBounds = true;
  bullet.body.allowGravity =false;
  bullet.setVelocity(1000 * coefDir, 0); // vitesse en x et en y
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
        y: 300 // gravité verticale : acceleration ddes corps en pixels par seconde
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
  texteCompteur.setText(`Rouge: ${compteurMineraux["rouge"]}  Vert: ${compteurMineraux["vert"]}  Rose: ${compteurMineraux["rose"]}\nViolet: ${compteurMineraux["violet"]}  Blanc: ${compteurMineraux["blanc"]}  Jaune: ${compteurMineraux["jaune"]}`);
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
   this.load.image("vert", "src/assets/green_crystal3.png"); 
   this.load.image("rose", "src/assets/Pink_crystal3.png"); 
   this.load.image("violet", "src/assets/Violet_crystal3.png"); 
   this.load.image("blanc", "src/assets/White_crystal3.png"); 
   this.load.image("jaune", "src/assets/Yellow_crystal3.png"); 

   this.load.spritesheet("img_perso", "src/assets/Idle.png", {
    frameWidth: 128,
    frameHeight: 73
  }); 
  this.load.spritesheet("gauche", "src/assets/Run2.png", {
    frameWidth: 128,
    frameHeight: 70
  }); 
  this.load.spritesheet("droite", "src/assets/Run.png", {
    frameWidth: 128,
    frameHeight: 70
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
  player.setBounce(0.2); 
  clavier = this.input.keyboard.createCursorKeys(); 

  this.anims.create({
    key: "anim_tourne_gauche", // key est le nom de l'animation : doit etre unique poru la scene.
    frames: this.anims.generateFrameNumbers("gauche", { start: 0, end: 7 }), // on prend toutes les frames de img perso numerotées de 0 à 3
    frameRate: 10, // vitesse de défilement des frames
    repeat: -1 // nombre de répétitions de l'animation. -1 = infini
  }); 
  this.anims.create({
    key: "anim_tourne_droite", // key est le nom de l'animation : doit etre unique poru la scene.
    frames: this.anims.generateFrameNumbers("droite", { start: 7, end: 0 }), // on prend toutes les frames de img perso numerotées de 0 à 3
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
  for (let couleur of couleurs) {
    for (let i = 0; i < 3; i++) {
      let x = Phaser.Math.Between(50, 750);
      let y = Phaser.Math.Between(50, 400);
      groupe_mineraux.create(x, y, couleur);
    }
  }
  this.physics.add.collider(groupe_mineraux, groupe_plateformes); 
  this.physics.add.overlap(player, groupe_mineraux, ramasserMineraux, null, this);
  
  texteCompteur = this.add.text(500, 20, "Rouge: 0  Vert: 0  Rose: 0\nViolet: 0  Blanc: 0  Jaune: 0", { fontSize: '16px', fill: '#FFF' });
}





/***********************************************************************/
/** FONCTION UPDATE 
/***********************************************************************/

function update() {
  if (clavier.right.isDown) {
    player.setVelocityX(220);
    player.anims.play('anim_tourne_droite', true); 
  } 
  else if ( clavier.left.isDown) {
    player.setVelocityX(-220);
    player.anims.play('anim_tourne_gauche', true);    
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

