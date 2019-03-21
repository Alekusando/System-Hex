let parent = null;
window.onload = () =>{
	parent = document.querySelector("#selection_systems");
	getApi('chooseSystemData',(result)=>{
		result.systems.forEach(system=>{
			addOption(system.id,system.title);
		});
	});
}

const addOption = (id,name) =>{
	let node = document.createElement("option");
	node.setAttribute("value",id);
	let txt = document.createTextNode(name);
	node.appendChild(txt);

	parent.appendChild(node);
}