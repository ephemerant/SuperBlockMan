var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'screen', {
	preload: preload,
	create: create,
	update: update,
	render: render
});

function preload() {

}

var WIDTH = 3000,
	HEIGHT = 1000,
	player,
	cursors,
	jumpButton,
	blocks = [],
	movingPlatforms = [],
	jumpReleased = true;

function createSprite(w, h, c, x, y) {
	var bmd = game.add.bitmapData(w, h);

	bmd.ctx.beginPath();
	bmd.ctx.rect(0, 0, w, h);
	bmd.ctx.fillStyle = c;
	bmd.ctx.fill();

	return game.add.sprite(x, y, bmd);
}

function create() {

	game.physics.startSystem(Phaser.Physics.ARCADE);

	this.world.setBounds(0, 0, WIDTH, HEIGHT);

	var blockCoords = [{
		x: 450,
		y: 100,
		w: 210,
		h: 21
	}, {
		x: 100,
		y: 100,
		w: 210,
		h: 21
	}, {
		x: 1250,
		y: 400,
		w: 210,
		h: 400
	}, {
		x: 900,
		y: 400,
		w: 210,
		h: 400
	}];

	var movingPlatformCoords = [{
		x: 410,
		y: 160
	}, {
		x: 200,
		y: 160
	}];

	// Spawn pre-determined platforms
	blockCoords.forEach(function(data) {
		var block = createSprite(data.w, data.h, '#ffaa00', data.x, HEIGHT - data.y);
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
		platform.body.velocity.y = -50;
	}
	// Change direction after a certain distance and again when it returns
	if (platform.originalPosition.y - platform.body.position.y >= 120 ||
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
		player.body.velocity.x -= 30;
		moved = true;
	} else if (cursors.right.isDown) {
		player.body.velocity.x += 30;
		moved = true;
	}

	if (!moved && playerOnSomething()) {
		player.body.velocity.x *= 0.8;
		if (Math.abs(player.body.velocity.x) < 1) {
			player.body.velocity.x = 0;
		}
	}

	if (jumpButton.isDown && jumpReleased) {
		// Make it so they can't just hold down the key
		jumpReleased = false;
		// Check if it should be a jump or a walljump
		if (playerOnSomething()) {
			player.body.velocity.y = -650;
		} else if (playerCanWallJump()) {
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
	// game.debug.spriteInfo(player, 32, 32);
}