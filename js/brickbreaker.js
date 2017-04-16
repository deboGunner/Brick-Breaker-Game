var gamePaddle;	//Paddle to be used in the game
var gameBricks=[];	//Bricks to be used in the game
var gameBall; //Ball to be used in the game
var gameBackground;//Background used in the game
var gameScore;//Text object to display the game score
var gameScoreValue=0;//Value in game score object

//Defining the constants for the game
var gamingConstants={
	arenaWidth:700,
	arenaHeight:500,
	paddleWidth:100,
	paddleHeight:40,
	ballWidth:40,
	ballHeight:40,
	brickWidth:50,
	brickHeight:50
}

function startBrickBreaker(){
	arena.start();	//Building up the gaming arena

	//Setting up the game components
	gamePaddle = new component(gamingConstants.paddleWidth, gamingConstants.paddleHeight, "img/paddle.jpg", 0, gamingConstants.arenaHeight-gamingConstants.paddleHeight,"paddle");

	gameBall = new component(gamingConstants.ballWidth, gamingConstants.ballHeight, "img/ball.jpg", 10, gamingConstants.arenaHeight/2, "ball");

	var brickIndex=0;
	for(var brickRow=0;brickRow<3;brickRow++){
		for(var brickColumn=0;brickColumn<gamingConstants.arenaWidth/gamingConstants.brickWidth;brickColumn++){
			gameBricks[brickIndex++]=new component(gamingConstants.brickWidth, gamingConstants.brickHeight, "img/brick.jpg",brickColumn*gamingConstants.brickWidth, brickRow*gamingConstants.brickHeight ,"brick");
		}	
	}

	gameBackground=new component(gamingConstants.arenaWidth, gamingConstants.arenaHeight, "img/background.jpg", 0, 0,"background");

	gameScore=new component("20px", "Consolas", "black", 0, 9*gamingConstants.brickHeight, "score");
	
	//Set to zero, used mainly during restart of game
	gameScoreValue=0;
	
	//Setting an initial speed for the ball
	gameBall.speedX=1.75;
	gameBall.speedY=1.75;
}

var arena={
	canvas:document.getElementById("brickBreakerCanvas"),
	start: function(){
		//Setting up the properties for the canvas
		this.canvas.width = gamingConstants.arenaWidth;
		this.canvas.height = gamingConstants.arenaHeight;
		this.context = this.canvas.getContext("2d");
		//document.body.insertBefore(this.canvas, document.body.childNodes[1]);

		//Setting up the FPS 
		this.interval=setInterval(updateArena,20);

		//Adding functionalities to the keyboard events
		window.addEventListener('keydown', function (e) {
			arena.key = e.keyCode;
		})
		window.addEventListener('keyup', function (e) {
			arena.key = false;
		})
	},
	clear: function(){
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	},
	stop: function(){
		clearInterval(this.interval);
	}
}

function component(width, height, imgsrc, x, y, type) {
	this.type = type;
	if(this.type!="score"){
		this.image = new Image();
		this.image.src = imgsrc;		
	}
	this.width = width;
	this.height = height;
	this.speedX = 0;
	this.speedY = 0;    
	this.x = x;
	this.y = y;    
	this.update = function() {
		ctx = arena.context;
		if(this.type!="score"){
			ctx.drawImage(this.image, 
				this.x, 
				this.y,
				this.width, this.height);	
		}else{
			ctx.font = this.width + " " + this.height;
			ctx.fillStyle = imgsrc;
			ctx.fillText(this.text, this.x, this.y);
		}	
	}
	this.newPos = function() {
		this.x += this.speedX;
		this.y += this.speedY;        
	}

	//On two objects collision
	this.hit=function(otherObject){
		var myleft = this.x;
		var myright = this.x + (this.width);
		var mytop = this.y;
		var mybottom = this.y + (this.height);
		var otherleft = otherObject.x;
		var otherright = otherObject.x + (otherObject.width);
		var othertop = otherObject.y;
		var otherbottom = otherObject.y + (otherObject.height);
		var crash = true;
		if ((mybottom < othertop) ||
			(mytop > otherbottom) ||
			(myright < otherleft) ||
			(myleft > otherright)) {
			crash = false;
	}
	return crash;
}

this.cornerTouch=function(){
	//If the ball touches the corner
	if(this.type=="ball"){
		if(this.x<=0)
			this.speedX=-this.speedX;
		if(this.y<=0)
			this.speedY=-this.speedY;
		if(this.x+this.width>=arena.canvas.width)
			this.speedX=-this.speedX;
		if(this.y+this.height>=arena.canvas.height){
			arena.stop();
			$('#lossScore').html(gameScoreValue.toFixed());
			$('#lossModal').modal('show');
		}

	}

	//If the paddle touches the corner
	if(this.type=="paddle"){
		if(this.x==0 && this.speedX<0)
			this.speedX=0;
		if(this.x+this.width==arena.canvas.width && this.speedX>0)
			this.speedX=0;
	}
}
}

function updateArena(){
	arena.clear();
	gameBackground.update();
	gameScoreValue-=0.02;
	gameScore.text="SCORE: " + gameScoreValue.toFixed();
	gameScore.update();

	//Check if the gameball hits the game brick
	for(var i=0;i<gameBricks.length;i++){
		if(gameBall.hit(gameBricks[i])){
			gameBricks.splice(i,1); //Remove that brick
			gameScoreValue+=5; //Increment the score by 5
		}
	}

	//When no more bricks left, when user has won the game
	if(gameBricks.length==0){
		arena.stop();
		$('#winScore').html(gameScoreValue.toFixed());
		$('#winModal').modal('show'); //Display the winning modal
	}

	//For updating the game bricks on the canvas
	for(var i=0;i<gameBricks.length;i++){
		gameBricks[i].update();
	}

	//If the ball hits the paddle
	if(gameBall.hit(gamePaddle)){
		gameBall.speedY=-gameBall.speedY; //Reverse direction
		gameScoreValue-=2; //Decrement score by 2
	}

	gameBall.cornerTouch(); //Check if the game ball touches any corner

	gameBall.newPos();
	gameBall.update();

	gamePaddle.speedX=0; //Keep the game paddle speed to 0

	if (arena.key && arena.key == 37) {gamePaddle.speedX = -4; } //For paddle's left movement
	if (arena.key && arena.key == 39) {gamePaddle.speedX = 4; }	//For paddle's right movement

	gamePaddle.cornerTouch(); //Check if the game paddle touches any corner
	gamePaddle.newPos();
	gamePaddle.update();
}