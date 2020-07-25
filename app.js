let nodeCache = {}

let configs = []

function createConfig(type){
	let cacheId = Date.now()
	let config = {
		type,
		cacheId,
		properties: {},
		children: [],
	}
	nodeCache[cacheId] = config
	return config
}

function getElement(config, mode){
	if(config.type == 'row'){
		config.properties = Object.assign(config.properties, {
			style: {
				padding: '20px'
			}
		})
		config.type = 'div'
	}
	if(mode == 'view'){
		return document.createElement(config.type)
	}
	else {
		
		let element = document.createElement(config.type)
		element.ondrop = handleDrop
		element.ondragover = allowDrop
		element.ondragleave = handleDropOut
		return element
	}
	
}

function handleDrop(ev){
	ev.preventDefault()
	ev.stopImmediatePropagation()
	console.log(ev.target)
	var type = ev.dataTransfer.getData("type")
	config = createConfig(type)
	if(ev.target.id == 'editArea'){
		configs.push(config)
	}
	else {
		let cacheId = ev.target.dataset.cacheId
		let parentConfig = nodeCache[cacheId]
		parentConfig.children.push(config)
	}
	let editArea = document.getElementById('editArea')
	clearScreen()
	renderLayout(configs, editArea)
}

function drag(ev) {
  ev.dataTransfer.setData("type", ev.target.dataset.type);
}

function allowDrop(ev) {
  ev.preventDefault();
  if(ev.target.className.indexOf('can-drop') == -1){
  	ev.target.className = ev.target.className + " can-drop"	
  }
}

function handleDropOut(ev) {
  ev.preventDefault();
  ev.target.className = ev.target.className.replace("can-drop", '')
}

function clearScreen(){
	let editArea = document.getElementById('editArea')
	editArea.innerHTML = ''
}

function renderLayout(configs, parent, mode='edit'){
	for (var i=0;i<configs.length;i++) {
		console.log(configs)
		let config = configs[i]
		if (typeof config == 'string') {
			let element = document.createTextNode(config)
			parent.appendChild(element)
		}
		else {
			let element = getElement(config, mode)
			if (config.properties && typeof config.properties == 'object') {
				for (let key in config.properties) {
					if (config.properties.hasOwnProperty(key)){
						if(key == 'style') {
							style = config.properties[key]
							let styleStr = ''
							for (let styleType in style) {
								styleStr += `${styleType}: ${style[styleType]}`
							}
							if(mode == 'edit'){
								element.setAttribute('data-cache-id', config.cacheId)		
							}
							element.style = styleStr	
						}
						else {
							element[key] = config.properties[key]		
						}
						
					}
				}
			}
			parent.appendChild(element)
			if(config.children){
				renderLayout(config.children, element)
			}
		}
	}
}

function getOutput(){
	let _configs = JSON.parse(JSON.stringify(configs))
	_configs.forEach((config)=>{delete config.cacheId})
	let fakeScreen = document.getElementById('fakeScreen')
	fakeScreen.innerHTML = ''
	renderLayout(_configs, fakeScreen, mode="view")
	let output = document.getElementById('fakeScreen')
	output.innerText = fakeScreen.innerHTML
}