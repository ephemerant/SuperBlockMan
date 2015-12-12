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
	platforms = [];

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

	platformCoords.forEach(function(coords) {
		platforms.push(createSprite(210, 21, '#ffaa00', game.world.centerX + coords.x, game.world.centerY + coords.y));
	});

	platforms.forEach(function(platform) {
		game.physics.enable(platform, Phaser.Physics.ARCADE);
		platform.body.immovable = true;
	});

	player = createSprite(42, 42, '#00ffaa', game.world.centerX, game.world.centerY);

	game.physics.enable(player, Phaser.Physics.ARCADE);

	player.body.velocity.setTo(200, 200);

	player.body.collideWorldBounds = true;

	player.body.gravity.set(0, 1800);

	cursors = game.input.keyboard.createCursorKeys();
	jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

}

function playerOnSomething() {
	return player.body.touching.down || player.body.onFloor();
}

function update() {

	platforms.forEach(function(platform) {
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