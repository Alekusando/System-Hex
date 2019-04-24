class Tile extends Element{
	constructor(id,attributes,x,y,color='ede1c9',border='8e8a6b'){
		super(id,attributes,'tile');

		this.stackColor = {ini:'#'+color,border:'#'+border,selected:'#436177'}
		this.colorToken = '';
		this.borderToken = '';

		this.selected = false;
		this.hexX = x;
		this.hexY = y;
	}

	// ---------------------------------------------------------------------------------------------
	// Méthodes Test
	// ---------------------------------------------------------------------------------------------
	testToken(){
		let range = 58;

		let min = 1;
		let max = 100;
		let randToken = Math.floor(Math.random() * (+max - +min)) + +min;
		if (randToken >= 100-range){
			try{
				let json = tokenTemplate.Arbre;
				let token = new Token(getId(),json.attributes,this,json.name,json.Color,json.Border);
				token.installMethods(json.methods);
				this.addToken(token);
			}catch(err){

			}
		}
	}
	setOnFire(){
		this.addInput(this.nextInputs,effectTemplate.Feu,true);
		clickEvent = false;
	}
	// ---------------------------------------------------------------------------------------------
	// Tick
	// ---------------------------------------------------------------------------------------------
	tick(){
		super.tick();
		this.drawTile();
		this.checkOutputs();
		this.setColor();
	}

	continuousTick(clickEvent){
		this.mouseEvent(clickEvent)
		this.drawTile();
		this.setColor();
	}

	// ---------------------------------------------------------------------------------------------
	// Méthodes d'Actions
	// ---------------------------------------------------------------------------------------------
	mouseEvent(clickEvent){
		let mod = 5;
		let x = this.posX;
		let y = this.posY;
		if(posX > x-this.size+mod && posX < x + this.size -mod && posY > y-this.size+mod && posY < y+this.size-mod){
			this.selected = true;
			if(clickEvent){
				this.setOnFire();
			}
		}
		else{
			this.selected = false;
		}
	}

	setColor(){
		this.children.forEach(child=>{
			if(child.color){
				this.colorToken = child.color;
			}
			if(child.borderColor){
				this.borderToken = child.borderColor;
			}
		})

	}

	switchInputs(){
		this.clearInputs();
		this.nextInputs.forEach(input=>{
			this.addInput(this.inputs,input);
		})
		this.nextInputs = [];
	}

	checkOutputs(){
		this.outputs.forEach(output=>{
			if(output.name == 'destroyChild'){
				deleteToken(this.children,output.elem);
				this.colorToken = '';
				this.borderToken = '';
				deleteInput(this.outputs,output.name);
			}else if (isInput(output.name)){
				this.addInput(this.nextInputs,output,true);
				giveInput(output,this.getNeighbours());
				deleteInput(this.outputs,output.name);
			}
		});
	}

	getNeighbours(){
		let keyVoisin = [];
		let x = this.hexX;
		let y = this.hexY;
		if(x%2 == 0){
			if(x>0){keyVoisin.push((x-1)+'-'+y);}
			if(y>0){keyVoisin.push(x+'-'+(y-1));}
			if(x<nbColumns-1){keyVoisin.push((x+1)+'-'+y);}

			if(y<nbRows-1&&x>0){keyVoisin.push((x-1)+'-'+(y+1));}
			if(y<nbRows-1){keyVoisin.push(x+'-'+(y+1));}
			if(y<nbRows-1&&x<nbColumns-1){keyVoisin.push((x+1)+'-'+(y+1));}
		}else{
			if(y>0&&x>0){keyVoisin.push((x-1)+'-'+(y-1));}
			if(y>0){keyVoisin.push(x+'-'+(y-1));}
			if(y>0&&x<nbColumns-1){keyVoisin.push((x+1)+'-'+(y-1));}

			if(x>0){keyVoisin.push((x-1)+'-'+y);}
			if(y<nbRows-1){keyVoisin.push(x+'-'+(y+1));}
			if(x<nbColumns-1){keyVoisin.push((x+1)+'-'+y);}
		}
		return keyVoisin;
	}

	// ---------------------------------------------------------------------------------------------
	// Méthodes d'Affichage
	// ---------------------------------------------------------------------------------------------
	drawTile(){
		let x = this.posX;
		let y = this.posY;
		let size = this.size;
		let side = 0;
		let canvas = document.querySelector('#mainCanvas').getContext('2d');

		canvas.beginPath();
		canvas.lineCap = "round";
		canvas.moveTo(x + size * Math.cos(0), y + size * Math.sin(0));
		for (side; side < 7; side++) {
			canvas.lineTo(x + size * Math.cos(side * 2 * Math.PI / 6), y + size * Math.sin(side * 2 * Math.PI / 6));
		}
		canvas.closePath();

		canvas.fillStyle = this.getBgColor();
		canvas.save();
		canvas.clip();
		canvas.fill();


		canvas.lineWidth = boardConfig.size/4;
		canvas.strokeStyle = this.getBorderColor();
		canvas.stroke();
		canvas.restore();

		// canvas.font = "10px Arial";
		// canvas.fillStyle = 'black';
		// ctx.fillText(this.hexX+"-"+this.hexY, x-9, y+4);
	}

	getBorderColor(){
		let borderColor = this.stackColor.border;
		if(this.selected){
			borderColor = this.stackColor.selected;
		}
		else if(this.borderToken != ''){
			borderColor = this.borderToken;
		}

		return borderColor;
	}

	getBgColor(){
		let color = this.stackColor.ini;
		if (this.colorToken != ''){
			color = this.colorToken;
		}

		return color;
	}
}