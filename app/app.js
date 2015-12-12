var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'screen', {
	preload: preload,
	create: create,
	update: update,
	render: render
});

function preload() {

}

var player,
	cursors,
	jumpButton,
	jumpTimer = 0,
	platforms = [],
	movingPlatforms = [];

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

	var platformCoords = [{
		x: 50,
		y: 210
	}, {
		x: -300,
		y: 210
	}];

	var movingPlatformCoords = [{
		x: 10,
		y: 140
	}, {
		x: -200,
		y: 140
	}];

	// Spawn pre-determined platforms
	platformCoords.forEach(function(coords) {
		var platform = createSprite(210, 21, '#ffaa00', game.world.centerX + coords.x, game.world.centerY + coords.y);
		// Add physics
		game.physics.enable(platform, Phaser.Physics.ARCADE);
		platform.body.immovable = true;
		// Track it via a global list
		platforms.push(platform);
	});

	// Spawn pre-determined moving platforms
	movingPlatformCoords.forEach(function(coords) {
		var platform = createSprite(150, 21, '#ff5500', game.world.centerX + coords.x, game.world.centerY + coords.y);
		// Add physics
		game.physics.enable(platform, Phaser.Physics.ARCADE);
		platform.body.immovable = true;
		// Track it via a global list
		movingPlatforms.push(platform);
	});

	// Create player and add physics properties
	player = createSprite(42, 42, '#00ffaa', game.world.centerX, game.world.centerY);

	game.physics.enable(player, Phaser.Physics.ARCADE);

	player.body.velocity.setTo(200, 200);

	player.body.collideWorldBounds = true;

	player.body.gravity.set(0, 1800);

	cursors = game.input.keyboard.createCursorKeys();
	jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

}

function playerOnSomething() {
	// Check if the player is on a platform or the floor
	return player.body.touching.down || player.body.onFloor();
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
	platforms.forEach(function(platform) {
		game.physics.arcade.collide(player, platform);
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
		player.body.velocity.x *= 0.9;
		if (Math.abs(player.body.velocity.x) < 1) {
			player.body.velocity.x = 0;
		}
	}

	if (jumpButton.isDown && playerOnSomething() && game.time.now > jumpTimer) {
		player.body.velocity.y = -600;
		jumpTimer = game.time.now + 200;
	}

}

function render() {
	game.debug.spriteInfo(player, 32, 32);

}