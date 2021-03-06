let system = null;
let modal = null;

let selectedItem = null;

const iniDashboard = () =>{
	getApi('systemChoiceData',(result)=>{
		document.querySelector('.header_bar').onclick = (event) =>{
			event.stopPropagation();
			hideForm();
		}
		system = result;
		addOnClickSaveSystem('#systemBtnSave');
		fillInput('#titleSystem',system.title);

		fillInput('#colorBGTile',system.tile.Color);
		fillInput('#colorBorderTile',system.tile.Border);
		addAttributes('#listTileAttributes',system.tile.attributes,system.tile,'tile');
		addOnClickModal('#addTileAttribute','#listTileAttributes',system.tile,'tile');

		fillInput('#colorBGBoard',system.board.Color);
		// addAttributes('#listBoardAttributes',system.board.attributes,system.board,'board');
		// addOnClickModal('#addBoardAttribute','#listBoardAttributes',system.board,'board');

		addOpenEditor('#listTileMethods',system.tile.methods,null);
		fillList('#listTokens',system.tokens,showToken);
		document.querySelector('#addToken').onclick = createToken;

		fillList('#listEffects',system.effects,showEffect);
		document.querySelector('#addEffect').onclick = createEffect;

		changeBtn('#tileView',system.tile.Color,system.tile.Border);
		$('#colorBGTile').colpick({
			colorScheme:'light',
			onChange:function(hsb,hex,rgb,el,bySetColor) {
				$(el).val(hex);
				changeBtn('#tileView',hex,document.querySelector('#colorBorderTile').value);
			}
		});

		$('#colorBorderTile').colpick({
			colorScheme:'light',
			onChange:function(hsb,hex,rgb,el,bySetColor) {
				$(el).val(hex);
				changeBtn('#tileView',document.querySelector('#colorBGTile').value,hex);
			}
		});

		changeBtn('#boardView',system.board.Color,"");
		$('#colorBGBoard').colpick({
			colorScheme:'light',
			onChange:function(hsb,hex,rgb,el,bySetColor) {
				$(el).val(hex);
				changeBtn('#boardView',hex,"");
			}
		});
	});

}

const fillInput = (id,value) =>{
	document.querySelector(id).value =
	document.querySelector(id).defaultValue = value;
}

const fillList = (id,array, onclick=null) =>{
	let parent = document.querySelector(id);
	while (parent.firstChild) {
		parent.removeChild(parent.firstChild);
	}
	if(array){
		for(let i = 0; i < array.length;i++){
			let item = array[i];
			addElement(id,i,item,onclick);
		}
	}

}

const addElement = (id,index,item,onclick) =>{
	let parent = document.querySelector(id);
	let newElem = document.createElement('a');
	let txt = document.createTextNode(item.name);
	newElem.appendChild(txt);

	if(onclick){
		newElem.onclick = () =>{
			onclick(index,newElem);
		}
	}
	parent.appendChild(newElem);
	return newElem;
}

const addAttributes = (id,array,element,type='token') =>{
	let parent = document.querySelector(id);

	while (parent.firstChild) {
		parent.removeChild(parent.firstChild);
	}
	if(array){
		for(let i = 0; i < array.length;i++){
			let attribute = array[i];
			addAttribute(id,attribute,element,type);
		}
	}

}

const addAttribute = (id,attribute,element,type) =>{
	let parent = document.querySelector(id);
	let newElem = document.createElement('a');
	let txt = document.createTextNode(attribute.name);
	newElem.appendChild(txt);
	newElem.setAttribute('href','#');
	newElem.setAttribute('class','modalBtn');
	newElem.onclick = () =>{
		showAttribute(attribute,newElem,element,type);
	}

	parent.appendChild(newElem);
}

const showAttribute = (attribute,node, element,type) =>{
	fillInput('#titleAttribute',attribute.name);
	fillInput('#valueAttribute',attribute.value);
	modal.querySelector('#modalBtnDelete').style.display = 'block';

	modal.querySelector('#modalBtnDelete').onclick = () =>{
		deleteAttribute(attribute,node,element,type);
	}

	modal.querySelector('#modalBtnSave').onclick = () =>{
		saveAttribute(attribute,node,element,type);
	}

	showModal();
}

const deleteAttribute = (attribute,node,element,type) =>{
	if (confirm('Voulez-vous vraiment supprimer cet Attributs?')) {
		updateAPI(element.name,type,'deleteAttribute',{keyAttribute:attribute.name},(res)=>{
			element.attributes.splice(findElement(element.attributes,'name',attribute.name,false),1);
			node.remove();
			hideModal();
		})
	}
}

const saveAttribute = (attribute,node,element,type) =>{
	let title = document.querySelector('#titleAttribute').value;
	let value = Number(document.querySelector('#valueAttribute').value);
	let oldTitle = attribute.name;
	let newAttribute = {name:title,value:value};

	updateAPI(element.name,type,'saveAttribute',{keyAttribute:oldTitle ,attribute:newAttribute},(res)=>{
		attribute.name = title;
		attribute.value = value;
		node.innerHTML = title;

		hideModal();
	})
}

const createAttribute = (id,element,type) =>{
	let title = document.querySelector('#titleAttribute').value;
	let value = Number(document.querySelector('#valueAttribute').value);
	let attribute = {name:title,value:value}
	let name = (element.name)?element.name:'tile';

	updateAPI(name,type,'addAttribute',{attribute:attribute},(res)=>{
		element.attributes.push(attribute);
		addAttribute(id,attribute,element,type);
		hideModal();
	})
}

const createToken = () =>{
	let tokenName = prompt("Entrez un nom pour le Jeton","Jeton");
	if (tokenName != null && tokenName != "") {
		updateAPI(tokenName,'tokens','addToken',{},(res)=>{
			let templateToken = {"name":tokenName,
                    "Color":"",
                    "Border":"",
					"Img":"",
					"iniRatio":"",
                	"listenedInputs":[],
                    "attributes":[],
					"methods":[]};
			system.tokens.push(templateToken);
			addElement('#listTokens',system.tokens.length-1,templateToken,showToken);

			showToken(system.tokens.length-1);
		})
	}
}

const createEffect = () =>{
	let effectName = prompt("Entrez un nom pour l'Effet","Effet");
	if (effectName != null && effectName != "") {
		updateAPI(effectName,'effects','addEffect',{},(res)=>{
			let templateEffect = {"name":effectName,
                    "attributes":[]};
			system.effects.push(templateEffect);
			addElement('#listEffects',system.effects.length-1,templateEffect,showEffect);

			showEffect(system.effects.length-1);
		})
	}
}

const showToken = (index,elem) =>{
	let formToken = document.querySelector('#formToken');
	let formEffect = document.querySelector('#formEffect');
	let display = document.querySelector('#formToken').style.display;
	if(selectedItem!= elem || display == 'none'){
		if(selectedItem){
			selectedItem.style.color = "#8e8a6b";
		}
		selectedItem = elem;
		elem.style.color = "#344c7c";

		formToken.style.display = 'block';
		formEffect.style.display = 'none';
		let token = system.tokens[index];
		addOnClickModal('#addTokenAttribute','#listTokenAttributes',token,'token');
		fillInput('#titleToken',token.name);
		fillInput('#colorBGToken',token.Color);
		fillInput('#colorBorderToken',token.Border);
		addAttributes('#listTokenAttributes',token.attributes,token);
		addOpenEditor('#listTokenMethods',token.methods,token.name);
		changeBtn('#tokenView',token.Color,token.Border);
		addOnClickSaveItem('#tokenBtnSave',token,'token','#titleToken','#listTokens','#colorBGToken','#colorBorderToken','#ratioSlider');
		addOnClickdeleteElement('#tokenBtnDelete',token,'token','deleteToken',system.tokens,'#listTokens');

		$('#colorBGToken').colpick({
			colorScheme:'light',
			onChange:function(hsb,hex,rgb,el,bySetColor) {
				$(el).val(hex);
				changeBtn('#tokenView',hex,document.querySelector('#colorBorderToken').value);
			}
		});

		$('#colorBorderToken').colpick({
			colorScheme:'light',
			onChange:function(hsb,hex,rgb,el,bySetColor) {
				$(el).val(hex);
				changeBtn('#tokenView',document.querySelector('#colorBGToken').value,hex);
			}
		});
		document.querySelector('#addTokenMethod').onclick = () =>{
			window.location.href = "/methodEditor.html?token="+token.name+"&method=new";
		}

		$( "#ratioSlider" ).slider({
			min: 0,
			max: 100,
			value: token.iniRatio});
	}else{
		formToken.style.display = 'none';
		selectedItem.style.color = "#8e8a6b";
	}
}



const changeBtn = (id,bg,border) =>{
	let btn = document.querySelector(id);
	if(bg){
		btn.style.backgroundColor = '#'+bg;
	}else{
		btn.style.backgroundColor = 'transparent';
	}
	if(border){
		btn.style.borderColor = '#'+border;
	}else{
		btn.style.borderColor = 'transparent';
	}
}

const showEffect = (index,elem) =>{
	let formToken = document.querySelector('#formToken');
	let formEffect = document.querySelector('#formEffect');
	let display = document.querySelector('#formEffect').style.display;
	if(selectedItem != elem || display == 'none'){
		if(selectedItem){
			selectedItem.style.color = "#8e8a6b";
		}
		selectedItem = elem;
		elem.style.color = "#344c7c";

		formEffect.style.display = 'block';
		formToken.style.display = 'none';
		let effect = system.effects[index];
		addOnClickModal('#addEffectAttribute','#listEffectAttributes',effect,'effect');

		fillInput('#titleEffect',effect.name);
		addAttributes('#listEffectAttributes',effect.attributes,effect,'effect');
		addOnClickSaveItem('#effectBtnSave',effect,'effect','#titleEffect','#listEffects');
		addOnClickdeleteElement('#effectBtnDelete',effect,'effect','deleteEffect',system.effects,'#listEffects');
	}else{
		formEffect.style.display = 'none';
		selectedItem.style.color = "#8e8a6b";
	}
}

const hideForm = () =>{
	if(selectedItem){
		selectedItem.style.color = "#8e8a6b";
	}
	selectedItem = null;
	formEffect.style.display = 'none';
	formToken.style.display = 'none';
}

const addOpenEditor = (id,array,name) =>{
	let parent = document.querySelector(id);
	while (parent.firstChild) {
		parent.removeChild(parent.firstChild);
	}
	if(array){
		for(let i = 0; i < array.length;i++){
			let item = array[i];
			let elem = addElement(id,i,item,()=>{
				let tokenStr = "";
				if(name){
					tokenStr = "token="+name+"&";
				}
				window.location.href = "/methodEditor.html?"+tokenStr+"method="+item.name;
			});
			if(item['active'] != 'undefined' && item['active'] == false){
				elem.style.color = "#bfbb9c";
			}

		}
	}

}

const addOnClickModal = (id,listnode,item,type) =>{
	document.querySelector(id).onclick = () =>{
		modal.querySelector('#modalBtnDelete').style.display = 'none';
		modal.querySelector('#modalBtnSave').onclick = () =>{
			createAttribute(listnode,item,type);
		}
		showModal();
	}
}

const addOnClickdeleteElement = (id,item,type,action,list,container) =>{
	document.querySelector(id).onclick = () =>{
		if (confirm('Voulez-vous vraiment supprimer cet Attributs?')) {
			updateAPI(item.name,type,action,{},(res)=>{
				list.splice(findElement(list,'name',item.name,false),1);
				let node = findNode(document.querySelector(container),item.name);
				node.remove();
				formToken.style.display = 'none';
				formEffect.style.display = 'none';
			})
		}
	}
}

const addOnClickSaveItem = (id,item,type,nameId,container,colorId=null,borderId=null,sliderId = null) =>{
	document.querySelector(id).onclick = () =>{
		saveItem(item,type,nameId,container,colorId,borderId,sliderId);
	}
}

const saveItem = (item,type,nameId=null,container=null,colorId=null,borderId=null,sliderId = null) =>{
	let data = {};
	if(nameId){
		data.name = document.querySelector(nameId).value;
	}else{
		data.name = item.name;
	}
	if(colorId){
		data.Color = document.querySelector(colorId).value;
	}
	if(borderId){
		data.Border = document.querySelector(borderId).value;
	}
	if(sliderId){
		data.iniRatio = $( sliderId ).slider("value");
	}
	let oldTitle = item.name;
	updateAPI(oldTitle,type,'saveItem',data,(res)=>{
		if(nameId){
			item.name = document.querySelector(nameId).value;
		}
		if(colorId){
			item.Color = document.querySelector(colorId).value;
		}
		if(borderId){
			item.Border = document.querySelector(borderId).value;
		}
		if(sliderId){
			item.iniRatio = $( sliderId ).slider("value");
		}
		if(container){
			let node = findNode(document.querySelector(container),oldTitle);
			node.innerHTML = item.name;
			formToken.style.display = 'none';
			formEffect.style.display = 'none';
		}
	});
}

const addOnClickSaveSystem = (id) =>{
	document.querySelector(id).onclick = () =>{
		let data = {};
		data['title'] = document.querySelector('#titleSystem').value;
		data['tileColor'] = document.querySelector('#colorBGTile').value;
		data['tileBorder'] = document.querySelector('#colorBorderTile').value;
		data['boardColor'] = document.querySelector('#colorBGBoard').value;
		updateAPI(null,'system','saveSystem',data,(res)=>{
			system.title = data.title;
			system.tile.Color = data.tileColor;
			system.tile.Board = data.tileBoard;
			system.board.Color = data.boardColor;
		});
	}
}

const updateAPI = (item,type,action,data,callback) =>{
	let params = {key:item,data:data,type:type}
	postApi(action,(res)=>{
		if(res == 'SUCCESS'){
			callback(res);
		}else{
			alert(res);
		}
	},params);
}

const showModal = () =>{
	modal.style.display = "block";
}

const hideModal = () =>{
	fillInput('#titleAttribute','');
	fillInput('#valueAttribute','');
	modal.style.display = "none";
}

const findNode = (container,value) =>{
	var childs = container.childNodes;
	for(let i = 0; i < childs.length;i++){
		if(childs[i].innerHTML == value){
			return childs[i];
		}
	}
}

const deleteSystem = () =>{
	if (confirm('Voulez-vous vraiment supprimer ce Système?')) {
		let params = {};
		postApi('deleteSystem',(res)=>{
			if(res == 'SUCCESS'){
				window.location.href = "/chooseSystem.html";
			}else{
				alert(res);
			}
		},params);
	}
}