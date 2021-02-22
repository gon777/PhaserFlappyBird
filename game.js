/// <reference path="./typings/phaser.d.ts" />

const WIDTH = 288;
const HEIGHT = 512;
const TOP = 0;
const BOT = HEIGHT;
const LEFT = 0;
const RIGHT = WIDTH;
const CEN_X = WIDTH / 2;
const CEN_Y = HEIGHT / 2;

const GRAVITY = 500.0;
const JUMP_SPEED = 200.0;
const MAX_FALLSPEED = 300.0;

const PIPE_SPEED = 100;
const PIPE_SPACING = 100;

var sceneConfig =
{
    preload: preload,
    create: create,
    update: update
};

var gameConfig =
{
    type: Phaser.AUTO,
    width: WIDTH,
    height: HEIGHT,
    physics:
    {
        default: 'arcade',
        arcade:
        {
            debug: false
        }
    },
    scene: sceneConfig,
};

var game = new Phaser.Game(gameConfig);
var verticalSpeed = 0.0;
var handleJumpKey = false;

var score = 0;

var bird;
var birdIndex;

let birdUpSpriteKeys = [];
let birdMidSpriteKeys = [];
let birdDownSpriteKeys = [];
let backgroundSpriteKeys = [];
let uiSpriteKeys = [];

var ge, shi, bai;

var audioHit;
var audioWing;

//load sprites
function preload() {
    //background
    this.load.image('background-day', 'assets/sprites/background-day.png');
    this.load.image('background-night', 'assets/sprites/background-night.png');
    backgroundSpriteKeys.push('background-day');
    backgroundSpriteKeys.push('background-night');

    //platform
    this.load.image('platform', 'assets/sprites/base.png');

    //bird
    this.load.image('blue-down', 'assets/sprites/bluebird-downflap.png');
    this.load.image('yellow-down', 'assets/sprites/yellowbird-downflap.png');
    this.load.image('red-down', 'assets/sprites/redbird-downflap.png');
    birdDownSpriteKeys.push('blue-down');
    birdDownSpriteKeys.push('yellow-down');
    birdDownSpriteKeys.push('red-down');
    

    this.load.image('blue-mid', 'assets/sprites/bluebird-midflap.png');
    this.load.image('yellow-mid', 'assets/sprites/yellowbird-midflap.png');
    this.load.image('red-mid', 'assets/sprites/redbird-midflap.png');
    birdMidSpriteKeys.push('blue-mid');
    birdMidSpriteKeys.push('yellow-mid');
    birdMidSpriteKeys.push('red-mid');

    this.load.image('blue-up', 'assets/sprites/bluebird-upflap.png');
    this.load.image('yellow-up', 'assets/sprites/yellowbird-upflap.png');
    this.load.image('red-up', 'assets/sprites/redbird-upflap.png');
    birdUpSpriteKeys.push('blue-up');
    birdUpSpriteKeys.push('yellow-up');
    birdUpSpriteKeys.push('red-up');


    //uiSpriteKeys
    this.load.image('0', 'assets/sprites/0.png');
    this.load.image('1', 'assets/sprites/1.png');
    this.load.image('2', 'assets/sprites/2.png');
    this.load.image('3', 'assets/sprites/3.png');
    this.load.image('4', 'assets/sprites/4.png');
    this.load.image('5', 'assets/sprites/5.png');
    this.load.image('6', 'assets/sprites/6.png');
    this.load.image('7', 'assets/sprites/7.png');
    this.load.image('8', 'assets/sprites/8.png');
    this.load.image('9', 'assets/sprites/9.png');
    uiSpriteKeys.push('0');
    uiSpriteKeys.push('1');
    uiSpriteKeys.push('2');
    uiSpriteKeys.push('3');
    uiSpriteKeys.push('4');
    uiSpriteKeys.push('5');
    uiSpriteKeys.push('6');
    uiSpriteKeys.push('7');
    uiSpriteKeys.push('8');
    uiSpriteKeys.push('9');

    //pipe
    this.load.image('pipe', 'assets/sprites/pipe-green.png');

    //audio
    this.load.audio('audio-hit', 'assets/audio/hit.ogg');
    this.load.audio('audio-wing', 'assets/audio/wing.ogg');
}

//create level
function create() {
    //scene
    background = this.add.image(CEN_X, CEN_Y, 'background-day');

    pipeUp = this.physics.add.sprite(0, 0, 'pipe');
    pipeUp.setFlip(false, true);
    pipeDown = this.physics.add.sprite(0, 0, 'pipe');
    randomPipePosition();

    platform = this.physics.add.sprite(CEN_X, BOT - 20, 'platform');

    birdIndex = randomInt(0,2);
    bird = this.physics.add.sprite(CEN_X - 50, CEN_Y, birdMidSpriteKeys[birdIndex]);

    //collision matrix
    this.physics.add.collider(bird, platform, onTouchFloor, null, this);
    this.physics.add.collider(bird, pipeUp, onTouchPipe, null, this);
    this.physics.add.collider(bird, pipeDown, onTouchPipe, null, this);

    //uiSpriteKeys
    ge = this.add.image(CEN_X + 20, TOP + 40, '0');
    shi = this.add.image(CEN_X, TOP + 40, '0');
    bai = this.add.image(CEN_X - 20, TOP + 40, '0');

    //input
    var spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    spaceKey.on('down', onSpaceKeyDown);

    //audio
    audioHit = this.sound.add('audio-hit');
    audioWing = this.sound.add('audio-wing');
}



function update(time, delta) {
    realDelta = delta * 0.001;

    updatePlayer(realDelta);
    updateScore(realDelta);
    updatePipes(realDelta);
    resetInput();
}

function updatePlayer(delta) {
    if (handleJumpKey) 
    {
        verticalSpeed = JUMP_SPEED;
        audioWing.play();
    }
    else {
        verticalSpeed = Math.max(verticalSpeed - GRAVITY * delta, -MAX_FALLSPEED);
    }


    if (verticalSpeed < -1.0) {
        bird.setTexture(birdUpSpriteKeys[birdIndex]);
    }
    else if (verticalSpeed > 1.0) {
        bird.setTexture(birdDownSpriteKeys[birdIndex]);
    }
    else {
        bird.setTexture(birdMidSpriteKeys[birdIndex]);
    }
    bird.y += -verticalSpeed * delta;
}

function updateScore(delta) {
    //score
    score += delta;
    scoreInt = Math.floor(score);

    //uiSpriteKeys
    gewei = Math.floor(score % 10);
    ge.setTexture(uiSpriteKeys[gewei]);

    shiwei = Math.floor((score - gewei) % 100 / 10);
    shi.setTexture(uiSpriteKeys[shiwei]);

    baiwei = Math.floor((score - gewei - shiwei) % 1000 / 100);
    bai.setTexture(uiSpriteKeys[baiwei]);
}

function updatePipes(delta) {
    pipeUp.x -= PIPE_SPEED * delta;
    pipeDown.x -= PIPE_SPEED * delta;

    if (pipeUp.x <= -26) {
        randomPipePosition();
    }
}

//inputs
function resetInput() {
    handleJumpKey = false;
}

function onSpaceKeyDown() {
    handleJumpKey = true;
}

//collision
function onTouchFloor() {
    audioHit.play();
    resetGame();
}

function onTouchPipe() 
{
    audioHit.play();
    resetGame();
}

//game
function resetGame() 
{
    score = 0;
    
    //bird
    birdIndex = randomInt(0,2);
    verticalSpeed = 0.0;
    bird.setPosition(CEN_X - 50, CEN_Y);
    bird.setTexture(birdMidSpriteKeys[birdIndex]);

    //background
    background.setTexture(backgroundSpriteKeys[randomInt(0,1)])

    //pipe
    randomPipePosition();
}

//helper
function randomFloat(min, max) 
{
    return Math.random() * (max - min) + min;
}

function randomInt(min, max)
{
    return Math.floor( Math.random() * (max - min  + 1) + min);
}

function randomPipePosition() 
{
    var random = randomFloat(PIPE_SPACING, TOP - PIPE_SPACING);
    pipeUp.setPosition(RIGHT + 26, CEN_Y - 160 - PIPE_SPACING / 2 + random);
    pipeDown.setPosition(RIGHT + 26, CEN_Y + 160 + PIPE_SPACING / 2 + random);
}