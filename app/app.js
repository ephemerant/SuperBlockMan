var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, '', {
	init: init,
	preload: preload,
	create: create,
	update: update,
	render: render
});

window.onresize = function() {
	game.width = window.innerWidth;
	game.height = window.innerHeight;
	game.camera.setSize(game.width, game.height);
	game.renderer.resize(game.width, game.height);
};

function init() {
	this.input.maxPointers = 1;
	this.stage.disableVisibilityChange = true;
	this.stage.backgroundColor = "#111";
	this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
	this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
	this.scale.pageAlignHorizontally = true;
	this.scale.pageAlignVertically = true;
	this.scale.updateLayout(true);
	this.scale.refresh();
	this.game.stage.smoothed = false;
	this.game.canvas.oncontextmenu = function(t) {
		t.preventDefault();
	};
}

function preload() {
	game.load.audio('jump', 'assets/sounds/jump.wav');
	game.load.audio('land', 'assets/sounds/land.wav');
}

var WIDTH = 5000,
	HEIGHT = 2000,
	player,
	cursors,
	jumpButton,
	blocks = [],
	movingPlatforms = [],
	jumpReleased = true,
	sounds = {};

function createSprite(w, h, c, x, y) {
	var bmd = game.add.bitmapData(w, h);

	bmd.ctx.beginPath();
	bmd.ctx.rect(0, 0, w, h);
	bmd.ctx.fillStyle = c;
	bmd.ctx.fill();

	return game.add.sprite(x, y, bmd);
}

function create() {

	sounds.jump = game.add.audio('jump');
	sounds.land = game.add.audio('land');

	game.physics.startSystem(Phaser.Physics.ARCADE);

	this.world.setBounds(0, 0, WIDTH, HEIGHT);

	var blockCoords = [{
		x: 0,
		y: 10,
		w: WIDTH,
		h: 10,
		c: '#5577ff'
	}, {
		x: 450,
		y: 100,
		w: 210,
		h: 21,
		c: '#ffaa00'
	}, {
		x: 100,
		y: 100,
		w: 210,
		h: 21,
		c: '#ffaa00'
	}, {
		x: 900,
		y: 400,
		w: 210,
		h: 400,
		c: '#5577ff'
	}, {
		x: 1250,
		y: 380,
		w: 210,
		h: 380,
		c: '#5577ff'
	}, {
		x: 1600,
		y: 360,
		w: 210,
		h: 360,
		c: '#5577ff'
	}, {
		x: 1950,
		y: 340,
		w: 210,
		h: 340,
		c: '#5577ff'
	}, {
		x: 2300,
		y: 320,
		w: 210,
		h: 320,
		c: '#5577ff'
	}, {
		x: 2650,
		y: 300,
		w: 210,
		h: 300,
		c: '#5577ff'
	}];

	var movingPlatformCoords = [{
		x: 410,
		y: 180
	}, {
		x: 200,
		y: 180
	}];

	// Spawn pre-determined platforms
	blockCoords.forEach(function(data) {
		var block = createSprite(data.w, data.h, data.c, data.x, HEIGHT - data.y);
		// Add physics
		game.physics.enable(block, Phaser.Physics.ARCADE);
		block.body.immovable = true;
		// Track it via a global list
		blocks.push(block);
	});

	// Spawn pre-determined moving platforms
	movingPlatformCoords.forEach(function(coords) {
		var platform = createSprite(150, 21, '#ff5500', coords.x, HEIGHT - coords.y);
		// Add physics
		game.physics.enable(platform, Phaser.Physics.ARCADE);
		platform.body.immovable = true;
		// Track it via a global list
		movingPlatforms.push(platform);
	});

	// Create player and add physics properties
	player = createSprite(42, 42, '#00ffaa', 400, HEIGHT - 500);

	game.physics.enable(player, Phaser.Physics.ARCADE);

	player.body.velocity.setTo(200, 200);

	player.body.collideWorldBounds = true;

	player.body.gravity.set(0, 1800);

	player.body.maxVelocity.x = 1200;

	game.camera.follow(player);

	cursors = game.input.keyboard.createCursorKeys();
	jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
}

function playerOnSomething() {
	// Check if the player is on a platform or the floor
	return player.body.touching.down || player.body.onFloor();
}

function playerCanWallJump() {
	// Check if the player is on a platform or the floor
	return player.body.touching.left || player.body.touching.right || player.body.onWall();
}

function movingPlatform(platform) {
	// Store original position and set velocity
	if (!platform.originalPosition) {
		platform.originalPosition = {
			x: platform.body.position.x,
			y: platform.body.position.y
		};
		platform.body.velocity.y = -70;
	}
	// Change direction after a certain distance and again when it returns
	if (platform.originalPosition.y - platform.body.position.y >= 200 ||
		(platform.originalPosition.y < platform.body.position.y)) {
		platform.body.velocity.y *= -1;
	}
}

function update() {
	// Check collision
	blocks.forEach(function(block) {
		game.physics.arcade.collide(player, block);
	});

	// Check collision and move platforms
	movingPlatforms.forEach(function(platform) {
		movingPlatform(platform);
		game.physics.arcade.collide(player, platform);
	});

	var moved = false;

	if (cursors.left.isDown) {
		// Gain more speed on ground
		if (playerOnSomething()) {
			player.body.velocity.x -= 35;
		} else {
			player.body.velocity.x -= 25;
		}
		moved = true;
	} else if (cursors.right.isDown) {
		// Gain more speed on ground
		if (playerOnSomething()) {
			player.body.velocity.x += 35;
		} else {
			player.body.velocity.x += 25;
		}
		moved = true;
	}

	if (!playerOnSomething()) {
		player.air = true;
	} else if (player.air) {
		sounds.land.play();
		player.air = false;
	}

	if (!moved) {
		if (playerOnSomething()) {
			// Ground has more friction
			player.body.velocity.x *= 0.8;
		} else {
			// Air has less friction
			player.body.velocity.x *= 0.95;
		}
		if (Math.abs(player.body.velocity.x) < 1) {
			player.body.velocity.x = 0;
		}
	}

	if (jumpButton.isDown && jumpReleased) {
		// Check if it should be a jump or a walljump
		if (playerOnSomething()) {
			// Make it so they can't just hold down the key
			jumpReleased = false;
			sounds.jump.play();
			player.body.velocity.y = -650;
		} else if (playerCanWallJump()) {
			// Make it so they can't just hold down the key
			jumpReleased = false;
			sounds.jump.play();
			if (cursors.left.isDown) {
				player.body.velocity.x = 340;
				player.body.velocity.y = -550;
			}
			if (cursors.right.isDown) {
				player.body.velocity.x = -340;
				player.body.velocity.y = -550;
			}
		}
	}

	if (!jumpButton.isDown) {
		jumpReleased = true;
	}
}

function render() {
	game.debug.bodyInfo(player, 32, 32);
}