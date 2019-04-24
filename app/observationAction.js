const nbColumns = 24;

let gap = 5;
let nbRows = 14;
const tilesList = [];
const boardConfig = {width:0,height:0,size:0,speed:0,timer:0,startingSpeed:0};

const tileDic = {};
const tokenTemplate = {};
const effectTemplate = {};

let ctx = null;
let canvas = null;

let posX = 0;
let posY = 0;
let clickEvent = false;

let demoToken = null;

const iniObservation = () =>{
	canvas = document.querySelector('#mainCanvas');
	ctx = canvas.getContext('2d');
	ctx.moveTo(0, 0);

	let container = document.querySelector('#board_container');
	boardConfig.width = container.offsetWidth;
	boardConfig.height = container.offsetHeight;

	boardConfig.size = (boardConfig.width / nbColumns)/1.76;
	nbRows = Math.ceil(boardConfig.height/boardConfig.size*.435);

	ctx.canvas.width  = container.offsetWidth;
	ctx.canvas.height = container.offsetHeight;

	canvas.onclick=(e)=>{
		clickEvent = true;
	}
	canvas.onmousemove = (e) =>{
		posX = e.offsetX;
		posY = e.offsetY;
	}

	$( "#speedSlider" ).slider({
		min: -60,
		max: 0,
      	value: boardConfig.startingSpeed,
		slide: changeSpeed,
		change: changeSpeed});

		let speed = $( "#speedSlider").slider("value");
		boardConfig.speed = Math.abs(speed);

	getApi('systemChoiceData',(result)=>{
		system = result;
		setTextNode('#titleSystem',system.title);
		iniApp();
	});

}


const iniApp = () =>{
	// Create Effect Template
	for(let i = 0; i< system.effects.length;i++){
		let json = system.effects[i];
		try{
			let effect = json;
			effectTemplate[effect.name] = effect;
			console.log(effect)
		}catch(err){
			console.error(json.name,'ERROR_CONSTRUCTION_METHOD');
		}
	}

	// Create Token Template
	for(let i = 0; i< system.tokens.length;i++){
		let json = system.tokens[i];
		try{
			let token = json;
			tokenTemplate[token.name] = token;
			console.log(token)
		}catch(err){
			console.error(json.name,'ERROR_CONSTRUCTION_METHOD');
		}
	}

	// Create board
	for(let row = 0;row<nbRows;row++){
		let tileRow = [];
		for(let column = 0;column<nbColumns;column++){
			let tile = new Tile(getId(),system.tile.attributes,column,row,system.tile.Color,system.tile.Border);
			tile.installMethods(system.tile.methods);
			tile.myListenedInputs = [];
			tile.listenedInputs = [];
			// tile.testToken();
			iniToken(tile);

			let iniPosX = boardConfig.size, iniPosY = boardConfig.size;
			let x = boardConfig.size*1.75;
			let y = boardConfig.size*2;
			if(column%2 == 0){
				iniPosY += boardConfig.size;
			}
			tile.addCoord(boardConfig.size,column*x+iniPosX,row*y+iniPosY)

			tileRow.push(tile);
			tileDic[column+'-'+row] = tile;
		}
		tilesList.push(tileRow);
	}

	tick();
}

const iniTokens = () =>{
	for(let i = 0;i<tilesList.length;i++){
		let tile = tilesList[i];
		iniToken(tile);
	}
}

const iniToken = (tile) =>{
	let min = 1;
	let max = system.tokens.length*100;
	let randToken = Math.floor(Math.random() * (+max - +min)) + +min;
	let chooseToken = getRandomToken(randToken);
	if(chooseToken){
		let json = tokenTemplate[chooseToken];
		let token = new Token(getId(),json.attributes,this,json.name,json.Color,json.Border);
		token.installMethods(json.methods);
		tile.addToken(token);
	}
}

const getRandomToken = (randomNum) =>{
	let total = 0;
	let newTotal = 0;
	for(let i = 0; i < system.tokens.length; i++){
		let token = system.tokens[i];
		let actRatio = token.iniRatio+((token.iniRatio/100)*getRatio(token));
		newTotal += actRatio;
		if(randomNum > total && randomNum <= newTotal){
			return token.name;
		}
		total = newTotal;
	}
	return null;
}

const getRatio = (mainToken) =>{
	let res = 0;
	for(let i = 0; i < system.tokens.length; i++){
		let token = system.tokens[i];
		if(token != mainToken){
			res += 100-token.iniRatio;
		}
	}
	return res;
}

const changeSpeed = () =>{
	let speed = $( "#speedSlider").slider("value");
	boardConfig.speed = Math.abs(speed);
	console.log(boardConfig.speed);
}

const tick = () =>{
	ctx.clearRect(0, 0, boardConfig.width, boardConfig.height);
	tilesSwitch();
	tilesTick();
	if(boardConfig.timer <= 0){
		boardConfig.timer = boardConfig.speed;
	}
	boardConfig.timer--;
	clickEvent = false;
	window.requestAnimationFrame(tick);
}

const tilesSwitch = () =>{
	for(let row = 0; row < nbRows;row++){
		for(let column = 0; column < nbColumns;column++){
			let tile = tilesList[row][column]

			if(boardConfig.timer <= 0){
				tile.switchInputs(); // To Dispatch to workers
			}
		}
	}
}

const tilesTick = () =>{
	for(let row = 0; row < nbRows;row++){
		for(let column = 0; column < nbColumns;column++){
			let tile = tilesList[row][column]

			tile.continuousTick(clickEvent);
			if(boardConfig.timer <= 0){
				tile.tick(); // To Dispatch to workers
			}
		}
	}
}

// ---------------------------------------------------------------------------------------------
// GENERAL FUNCTIONS
// ---------------------------------------------------------------------------------------------
const getInput = (arr,input)=>{
	for(let i = 0;i < arr.length;i++){
		if(arr[i].name === input){
			return arr[i];
		}
	}
}

const getToken = (arr,token)=>{
	for(let i = 0; i < arr.length;i++){
		if(arr[i].name === token){
			return arr[i];
		}
	}
}

const deleteInput = (arr, input)=> {
	for(let i = 0; i < arr.length;i++){
		if(arr[i].name === input ){
			arr.splice(i,1);
		}
	}
}

const deleteToken = (arr, id)=> {
	for(let i = 0; i < arr.length;i++){
		if(arr[i].id === id ){
			arr.splice(i,1);
		}
	}
}

const getId = () =>{
	if (typeof getId.counter == 'undefined'){
		getId.counter = 0;
	}
	return(++getId.counter);
}

const giveInput = (input,arr) =>{
	arr.forEach(tileId => {
		let tile = tileDic[tileId]
		tile.addInput(tile.nextInputs,input,true)
	});
}

const getTemplateToken = (name) =>{
	for(let i = 0;i < tokenTemplate.length;i++){
		let token = tokenTemplate[i];
		if(token.name == name){
			return token;
		}
	}
	return null;
}

const isInput = (name) =>{
	if(effectTemplate[name] != null){
		return true;
	}
	return false;
}