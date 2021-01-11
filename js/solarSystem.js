// import { OrbitControls } from "https://threejs.org/examples/jsm/controls/OrbitControls.js";
let scene, camera, renderer, light, controls
let init = () => {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.0000000000000000001, 1000000000000000000000);
  // camera.position.z = 100;
  camera.position.z = 10000000;
  camera.position.y = 1000000;
  // LIGHT
  let lightAmb = new THREE.AmbientLight(0xffffff, 0.2)
  light = new THREE.PointLight(0xffffff, 1.4, 2000, 0)
  scene.add(lightAmb)
  scene.add(light)

  // CONTROLS
  let body = document.querySelector('body')
  controls = new THREE.OrbitControls(camera, body);
  controls.update()
  // RENDERER
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);

  let axis = new THREE.AxesHelper(10);
  // scene.add(axis)
  $('.viewbox').append(renderer.domElement)
  // document.body.appendChild(renderer.domElement);
}
let ly = 9460730470000
let k = 1000
let ml = 1000000
let bn = 1000000000

// solarSystem, closeStars, milkyWay, localGroup, laniakeaCluster, localSuperClusters, observableUniverse
// HELPER FUNCTIONS
let randomNum = (min, max) => {
  return Math.random() * (max - min) + min;
}
let currData = []
let generateSpheres = (objArr,raidus, imgPath, amount, min, max) => {
  let randomColor = () => {
    let starColors = [ 0x91B6FF,0xA6C4FF,0xCEDBFF,0xEFF0FE,0xFDEEE9,0xFFDCBB,0xFFB76A,0xFF8412,0xFF3C00 ]
    return starColors[Math.floor(randomNum(0,7))]
  }
  let geometry = new THREE.SphereGeometry(raidus, 80, 80)
  // let texture = new THREE.TextureLoader().load(imgPath)
  let material
  for (let i = 0; i < amount; i++) {
    let color = randomColor()
    material = new THREE.MeshBasicMaterial( {color: color, transparent: true, opacity: 1, wireframe: false} )
    let currObj = new THREE.Mesh(geometry, material)
    let x = randomNum(min,max)
    let y = randomNum(min,max)
    let z = randomNum(min,max)
    currData.push({x: x, y: y, z: z, color: color})
    currObj.position.set(x,y,z)
    scene.add(currObj)
    objArr.push(currObj)
  }
}

let generateCluster = (objArr,raidus, imgPath, amount, min, max, maxDist = 10e+1000) => {
  let geometry = new THREE.SphereGeometry(raidus, 8, 8)
  let material
  let texture = new THREE.TextureLoader().load('media/cluster.png')
  for (let i = 0; i < amount; i++) {
    material = new THREE.MeshBasicMaterial( {color: 0xffffff, transparent: true, opacity: 0.7, wireframe: true} )
    let currObj = new THREE.Mesh(geometry, material)
    let x = randomNum(min,max)
    let y = randomNum(min,max)
    let z = randomNum(min,max)
    let randomScale = randomNum(0,5)
    currObj.scale.set(randomScale,randomScale,randomScale)
    currObj.scale.set(randomNum(0,5),randomNum(0,5),randomNum(0,5))
    currObj.rotation.set(randomNum(0,10),randomNum(0,10),randomNum(0,10))
    currData.push({x: x, y: y, z: z})
    currObj.position.set(x,y,z)
    if (calcDist(currObj.position, {x: 0, y: 0, z:0}) < maxDist) {
      scene.add(currObj)
      objArr.push(currObj)
    }
  }
}

let calcDist = (pos1, pos2) => {
  return Math.floor(Math.sqrt(((pos2.x - pos1.x) ** 2)+((pos2.y - pos1.y) ** 2)+((pos2.z - pos1.z) ** 2)))
}

// RENDERING FUNCTIONS
let perspective = []
let renderStructures = () => {
  let sun = {name: 'sun', w: 1400000, h: 1400000, color: 0xffd94f}
  let solarSystem = {name: 'solarSystem', w: 287000000000, h: 50000000000, color: 0xf58742}
  let closeStars = {name: 'closeStars', w: 30*ly, h: 30*ly, color: 0xffe680}
  let milkyWay = {name: 'milkyWay', w: 105000*ly, h: 105000*ly / 8, color: 0xd4feff}
  let localGroup = {name: 'localGroup', w: 10000000*ly, h: 10000000*ly, color: 0xffd4de}
  let laniakeaCluster = {name: 'laniakeaCluster', w: 500000000*ly, h: 500000000*ly, color: 0x8053fc}
  let localSuperClusters = {name: 'localSuperClusters', w: 3000000000*ly, h: 3000000000*ly, color: 0x53fcda}
  let observableUniverse = {name: 'observableUniverse', w: 93000000000*ly, h: 93000000000*ly, color: 0x9a59cf}
  let objects = [sun, solarSystem, closeStars, milkyWay, localGroup, laniakeaCluster, localSuperClusters, observableUniverse]

  for (let object of objects) {
    let geometry = new THREE.BoxGeometry(object.w, object.h, object.w, 3,3,3);
    let material = new THREE.MeshBasicMaterial( {color: object.color, wireframe: true, opacity: 0.2, transparent: true} );
    if (object === observableUniverse) {
      let uniTexture = new THREE.TextureLoader().load('media/cosmic.png')
      geometry = new THREE.SphereGeometry(object.w/2, 36, 36);
    }
    // , side: THREE.DoubleSide
    let generate = new THREE.Mesh( geometry, material );
    if(object === milkyWay) {
      generate.position.set(-ly*15*k,0,ly*15*k)
    }
    generate.name = object.name
    perspective[generate.name] = generate
    scene.add(generate);
  }
}

let orbArr = []
let planetArr = []
let renderSolarSystem = () => {
  let makePlanet = (planet) => {
    planet.radius = planet.diameter/2

    let geometry = new THREE.SphereGeometry(planet.radius, 80, 80)
    let texture = new THREE.TextureLoader().load(`media/2k_${planet.name}.jpg`)
    let material = new THREE.MeshBasicMaterial( {map: texture, color: 0xffffff, transparent: true, opacity: 1, wireframe: false} )
    if (planet.name === 'sun') {
      material = new THREE.MeshBasicMaterial( {map: texture, color: 0xffffff, transparent: true, opacity: 1, wireframe: false} )
    }
    let currPlanet = new THREE.Mesh(geometry, material)
    currPlanet.name = planet.name
    currPlanet.position.x = planet.distFromSun
    currPlanet.theta = 0
    currPlanet.radius = planet.diameter/2
    currPlanet.distFromSun = planet.distFromSun
    currPlanet.orbitalPeriod = planet.orbitalPeriod
    scene.add(currPlanet)
    planetArr.push(currPlanet)

    let orbGeometry = new THREE.SphereGeometry(20000000, 12, 12)
    let orbMaterial = new THREE.MeshBasicMaterial( {map: texture, color: 0xffffff, transparent: true, opacity: 0.2, wireframe: true} )
    let currOrb = new THREE.Mesh(orbGeometry, orbMaterial)
    currOrb.name = planet.name
    currOrb.position.x = planet.distFromSun
    currOrb.theta = 0
    currOrb.radius = planet.diameter/2
    currOrb.distFromSun = planet.distFromSun
    currOrb.orbitalPeriod = planet.orbitalPeriod
    scene.add(currOrb)
    orbArr.push(currOrb)
  }
  for (let key in planets) {
    makePlanet(planets[key])
  }

  // let setOrbit = () => {
  //   let msDay = 24 * 60 * 60000
  //   let msYear = 365 * msDay
  //   setInterval(() => {
  //   for (let i = 0; i < planetArr.length; i++) {
  //     let p = planetArr[i]
  //     let orb = orbArr[i]
  //     if(p.name === 'sun') { continue }
  //     let dTheta = 2 * Math.PI / p.orbitalPeriod / 1000
  //     p.theta = p.theta + dTheta
  //     p.position.x = (p.distFromSun) * Math.cos(p.theta);
  //     p.position.z = (p.distFromSun) * Math.sin(p.theta);
  //     orb.position.x = (p.distFromSun) * Math.cos(p.theta);
  //     orb.position.z = (p.distFromSun) * Math.sin(p.theta);
  //     p.rotation.y += 0.003
  //   }

  //   }, 10)
  // }
  // setOrbit()
}
let stellerObjs = []
let renderStellarNeightborhood = () => {
  // 71 stars +  + several planetary systems
  for (let star of closeStars) {
    let geometry = new THREE.SphereGeometry(ly/10, 80, 80)
    let material = new THREE.MeshBasicMaterial( {color: star.color} )
    let currStar = new THREE.Mesh(geometry, material)
    currStar.position.set(star.x, star.y, star.z)
    scene.add(currStar)
    stellerObjs.push(currStar)
  }
  // generateSpheres(stellerObjs, ly/10, 'media/2k_sun.jpg', 71, -ly*20, ly*20)
}
let milkywayObjs = []
let renderMilkyWay = () => {
  // 100b stars + gasses and other stuff
  let texture = new THREE.TextureLoader().load('media/milky.jpg')
  let geometry = new THREE.CylinderGeometry(50*k*ly, 50*k*ly, 5*k*ly, 24, 30);
  let material = new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: 0.1, map: texture, side: THREE.DoubleSide});
  let material2 = new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: 0.5, map: texture});
  let cylinder1 = new THREE.Mesh(geometry, material);
  let cylinder2 = new THREE.Mesh(geometry, material2);
  cylinder1.position.set(-ly*15*k,0,ly*15*k)
  cylinder2.position.set(-ly*15*k,0,ly*15*k)
  milkywayObjs.push(cylinder1)
  milkywayObjs.push(cylinder2)
  scene.add(cylinder1);
  scene.add(cylinder2);
}
let localGroupObjs = []
let renderLocalGroup = () => {
  // 30 galaxies
  let texture1 = new THREE.TextureLoader().load('media/galaxy.png')
  let texture2 = new THREE.TextureLoader().load('media/galaxy2.png')
  let texture3 = new THREE.TextureLoader().load('media/galaxy3.jpg')
  let texture4 = new THREE.TextureLoader().load('media/galaxy4.jpg')
  let texture5 = new THREE.TextureLoader().load('media/galaxy5.png')
  for (let galaxy of localGroupData) {
    // let geometry = new THREE.SphereGeometry(ly*k*80, 80, 80)
    let textures = [texture1,texture2,texture3,texture4,texture5]
    let width = randomNum(ly*k*30, ly*k*200)
    let height = randomNum(ly*k*3, ly*k*30)
    let rotation = randomNum(-30, 30)
    let currTexture = textures[Math.floor(randomNum(0, 4))]
    let geometry = new THREE.CylinderGeometry(width, width, height, 10, 1)
    let material = new THREE.MeshBasicMaterial( {map: currTexture, transparent: true, opacity: 0.9, color: 0xffffff} )
    let wrapperMaterial = new THREE.MeshBasicMaterial( {transparent: true, opacity: 0.2, color: 0xffffff, wireframe: true} )
    let currGalaxy = new THREE.Mesh(geometry, material)
    let currGalaxyWrapper = new THREE.Mesh(geometry, wrapperMaterial)
    currGalaxy.position.set(galaxy.x, galaxy.y, galaxy.z)
    currGalaxy.rotation.set(rotation,-rotation,rotation)
    currGalaxyWrapper.position.set(galaxy.x, galaxy.y, galaxy.z)
    currGalaxyWrapper.rotation.set(rotation,-rotation,rotation)
    scene.add(currGalaxy)
    scene.add(currGalaxyWrapper)
    localGroupObjs.push(currGalaxy)
    localGroupObjs.push(currGalaxyWrapper)
  }
  // generateSpheres(localGroupObjs, ly*k*80, 'media/white.png', 30, -ly*ml*5, ly*ml*5)
}
let laniakeaObjs = []
let renderLaniakeaCluster = () => {
  // 300-500 galaxy clusters
  generateCluster(laniakeaObjs, ly*ml, 'media/2k_sun.jpg', 200, -ly*ml*260, ly*ml*260)
}
let localSuperClusterObjs = []
let renderLocalSuperClusters = () => {
  generateCluster(localSuperClusterObjs, ly*ml*10, 'media/2k_sun.jpg', 200, -ly*ml*1200, ly*ml*1200)
}
let observableUniverseObjs = []
let renderObservableUniverse = () => {
  generateCluster(observableUniverseObjs, ly*ml*100, 'media/2k_sun.jpg', 5000, -ly*bn*45, ly*bn*45, ly*bn*45)
}

// HANDLING OBJECTS
let removeSection = (sectionObjects) => {
  for (let object of sectionObjects) {
    scene.remove(object)
  }
}
let resetOpacity = () => {
  perspective.sun.material.opacity = 0
  perspective.solarSystem.material.opacity = 0
  perspective.closeStars.material.opacity = 0
  perspective.milkyWay.material.opacity = 0
  perspective.localGroup.material.opacity = 0
  perspective.laniakeaCluster.material.opacity = 0
  perspective.localSuperClusters.material.opacity = 0
  perspective.observableUniverse.material.opacity = 0
}
let selectSection = () => {
  $('.solar-system-btn').click(()=>{
    solarSystemInfo()
    camera.position.set(100*k,200*ml, bn)
    renderSolarSystem()
    removeSection(stellerObjs)
    renderStatus.closeStars = false
    removeSection(milkywayObjs)
    renderStatus.milkyWay = false
    removeSection(localGroupObjs)
    renderStatus.localGroup = false
    removeSection(laniakeaObjs)
    renderStatus.laniakeaCluster = false
    removeSection(localSuperClusterObjs)
    renderStatus.localSuperClusters = false
    removeSection(observableUniverseObjs)
    renderStatus.observableUniverse = false
  })
  $('.steller-hood-btn').click(()=>{
    $('.rendering').text('RENDERING')
    camera.position.set(10*k,10*ml,100*ly)

    renderStellarNeightborhood()
    $('.rendering').text('')
    renderStatus.closeStars = true
    removeSection(milkywayObjs)
    renderStatus.milkyWay = false
    removeSection(localGroupObjs)
    renderStatus.localGroup = false
    removeSection(laniakeaObjs)
    renderStatus.laniakeaCluster = false
    removeSection(localSuperClusterObjs)
    renderStatus.localSuperClusters = false
    removeSection(observableUniverseObjs)
    renderStatus.observableUniverse = false
  })
  $('.milky-way-btn').click(()=>{
    camera.position.set(1*k*bn*ml,2*k*bn*ml,2*bn*bn)
    renderMilkyWay()
    renderStatus.milkyWay = true
    removeSection(localGroupObjs)
    renderStatus.localGroup = false
    removeSection(laniakeaObjs)
    renderStatus.laniakeaCluster = false
    removeSection(localSuperClusterObjs)
    renderStatus.localSuperClusters = false
    removeSection(observableUniverseObjs)
    renderStatus.observableUniverse = false
  })
  $('.local-group-btn').click(()=>{
    camera.position.set(10*k,bn*bn*320)
    renderLocalGroup()
    renderStatus.localGroup = true
    removeSection(laniakeaObjs)
    renderStatus.laniakeaCluster = false
    removeSection(localSuperClusterObjs)
    renderStatus.localSuperClusters = false
    removeSection(observableUniverseObjs)
    renderStatus.observableUniverse = false
  })
  $('.laniakea-cluster-btn').click(()=>{
    camera.position.set(k*bn*ml*150,2*k*bn*ml*50,bn*bn*k*16)
    renderLaniakeaCluster()
    renderStatus.laniakeaCluster = true
    removeSection(localSuperClusterObjs)
    renderStatus.localSuperClusters = false
    removeSection(observableUniverseObjs)
    renderStatus.observableUniverse = false
  })
  $('.local-super-cluster-btn').click(()=>{
    camera.position.set(k*bn*ml*150,2*k*bn*bn,bn*bn*k*100)
    renderLocalSuperClusters()
    renderStatus.localSuperClusters = true
    removeSection(observableUniverseObjs)
    renderStatus.observableUniverse = false
  })
  $('.observable-universe-btn').click(()=>{
    camera.position.set(k*bn*ml*k*k,k*bn*ml*k*k,bn*bn*ml)
    renderObservableUniverse()
    renderStatus.observableUniverse = true
  })
}

let goTo = (name) => {
  // Planets
  for (let planet of planetArr) {
    if (planet.name === name) {
      let x = planet.position.x + planet.radius * 3
      let y = planet.position.y + planet.radius * 3
      let z = planet.position.z + planet.radius * 3
      camera.position.set(x, y, z)
      controls.target = planet.position
      console.log(planet)
    }
  }
}

let solarSystemInfo = () => {
  for (let key in planets) {
    let planet = planets[key]
    let div = $(`<div class="info-div"></div>`)
    let img = $(`<img src="${planet.img}">`)
    let name = $(`<div>${planet.name}</div>`)
    let diameter = $(`<div>Diameter: ${planet.diameter}</div>`)
    let dist = $(`<div>Distance from Sun: ${planet.distFromSun}</div>`)
    let orbPeriod = $(`<div>Orbital Period: ${planet.orbitalPeriod}</div>`)
    let desc = $(`<p>${planet.desc}</p>`)
    div.append(img)
    div.append(name)
    div.append(diameter)
    div.append(dist)
    div.append(orbPeriod)
    div.append(desc)
    div.on('click', () => {
      goTo(planet.name)
    })
    $('.info').append(div)
  }
}

// Tool tips for info bar items
let renderStatus = {
  sun: false,
  solarSystem: false,
  closeStars: false,
  milkyWay: false,
  localGroup: false,
  laniakeaCluster: false,
  localSuperClusters: false,
  observableUniverse: false
}

let distInterval = setInterval(() => {
  let currDistKm = calcDist(camera.position, {x: 0, y: 0, z: 0})
  let currDistLy = Math.floor(currDistKm / ly)

  let sun = {w: 1400000, color: '#ff8940'}
  let solarSystem = {w: 287000000000, color: '#ff8940'}
  let closeStars = {w: 30*ly, color: '#ffe680'}
  let milkyWay = {w: 105000*ly, color: '#d4feff'}
  let localGroup = {w: 10000000*ly, color: '#ffd4de'}
  let laniakeaCluster = {w: 500000000*ly, color: '#8053fc'}
  let localSuperClusters = {w: 3000000000*ly, color: '#53fcda'}
  let observableUniverse = {w: 93000000000*ly, color: '#9a59cf'}
  // 0 to Edge of solar system
  if (currDistKm > 0 && currDistKm < solarSystem.w ){
    if (!renderStatus.solarSystem) {
      renderStatus.solarSystem = true
      renderSolarSystem()
    }
    if (renderStatus.closeStars) {
      renderStatus.closeStars = false
      removeSection(stellerObjs)
    }
    $('.curr-name').text(`Solar System`)
    $('.curr-name').css('color', sun.color)
    $('.curr-objects').text(`Objects: 1 star, 8 planets, 32 satelites`)
    $('.curr-size').text(`Width: ${solarSystem.w/1000000000} Billion KM`)
    $('.km').text(`Kilometers: ${Math.floor(currDistKm/1000000)} Million`)
    $('.ly').text(`Light Years: ${currDistLy}`)
    perspective.sun.material.opacity = 0
    perspective.solarSystem.material.opacity = 0.1
    perspective.closeStars.material.opacity = 0
    perspective.milkyWay.material.opacity = 0
    perspective.localGroup.material.opacity = 0
    perspective.laniakeaCluster.material.opacity = 0
    perspective.localSuperClusters.material.opacity = 0
    perspective.observableUniverse.material.opacity = 0

  }
  // Solar System
  if (currDistKm > solarSystem.w && currDistKm < closeStars.w ){
    if (!renderStatus.closeStars) {
      renderStatus.closeStars = true
      renderStellarNeightborhood()
    }

    $('.curr-name').css('color', solarSystem.color)
    $('.curr-name').text(`Solar System`)
    $('.curr-objects').text(`Objects: 1 star, 8 planets, 32 satelites`)
    $('.curr-size').text(`Width: ${solarSystem.w/1000000000} Billion KM`)
    $('.km').text(`Kilometers: ${Math.floor(currDistKm/1000000000)} Billion`)
    $('.ly').text(`Light Years: ${currDistLy}`)
    perspective.solarSystem.material.opacity = 0.2
    perspective.closeStars.material.opacity = 0.1
    perspective.milkyWay.material.opacity = 0
  }
  // Close Stars
  if (currDistKm > closeStars.w && currDistKm < milkyWay.w ){
    if (!renderStatus.milkyWay) {
      renderStatus.milkyWay = true
      renderMilkyWay()
    }
    if (renderStatus.localGroup) {
      renderStatus.localGroup = false
      removeSection(localGroupObjs)
    }

    $('.curr-name').css('color', closeStars.color)
    $('.curr-name').text(`Stellar Neighborhood`)
    $('.curr-objects').text(`Objects: 71 Stars`)
    $('.curr-size').text(`Width: ${closeStars.w/ly} Light Years`)
    $('.km').text(`Kilometers: ${Math.floor(currDistKm/1000000000000000)} Quintillion`)
    $('.ly').text(`Light Years: ${currDistLy}`)
    perspective.closeStars.material.opacity = 0.2
    perspective.milkyWay.material.opacity = 0.1
    perspective.localGroup.material.opacity = 0
  }
  // Milky Way
  if (currDistKm > milkyWay.w && currDistKm < localGroup.w ){
    if (!renderStatus.localGroup) {
      renderStatus.localGroup = true
      renderLocalGroup()
    }
    if (renderStatus.laniakeaCluster) {
      renderStatus.laniakeaCluster = false
      removeSection(laniakeaObjs)
    }

    $('.curr-name').css('color', milkyWay.color)
    $('.curr-name').text(`Milky Way`)
    $('.curr-objects').text(`Objects: 100 Billion Stars*, Gases`)
    $('.curr-size').text(`Width: ${milkyWay.w/ly/1000} Thousand Light Years`)
    $('.km').text(`Kilometers: ${Math.floor(currDistKm/1000000000000000000)} Sextillion`)
    $('.ly').text(`Light Years: ${Math.floor(currDistLy/1000)} Thousand Light Years`)
    perspective.milkyWay.material.opacity = 0.2
    perspective.localGroup.material.opacity = 0.05
    perspective.laniakeaCluster.material.opacity = 0
  }
  if (currDistKm > localGroup.w && currDistKm < laniakeaCluster.w ){
    if (!renderStatus.laniakeaCluster) {
      renderStatus.laniakeaCluster = true
      renderLaniakeaCluster()
    }
    if (renderStatus.localSuperClusters) {
      renderStatus.localSuperClusters = false
      removeSection(localSuperClusterObjs)
    }

    $('.curr-name').css('color', localGroup.color)
    $('.curr-name').text(`Local Group`)
    $('.curr-objects').text(`Objects: 30 Galaxies`)
    $('.curr-size').text(`Width:  ${localGroup.w/ly/1000000} Million Light Years`)
    $('.km').text(`Kilometers: ${Math.floor(currDistKm/1000000000000000000)} Sextillion`)
    $('.ly').text(`Light Years: ${Math.floor(currDistLy/1000000)} Million`)
    perspective.localGroup.material.opacity = 0.2
    perspective.laniakeaCluster.material.opacity = 0.1
    perspective.localSuperClusters.material.opacity = 0
  }
  // Laniakea Cluster
  if (currDistKm > laniakeaCluster.w && currDistKm < localSuperClusters.w ){
    if (!renderStatus.localSuperClusters) {
      renderStatus.localSuperClusters = true
      renderLocalSuperClusters()
    }
    if (renderStatus.observableUniverse) {
      renderStatus.observableUniverse = true
      removeSection(observableUniverseObjs)
    }

    $('.curr-name').css('color', laniakeaCluster.color)
    $('.curr-name').text(`Laniakea Super Cluster`)
    $('.curr-objects').text(`Objects 300-500 Galaxy Clusters (100k Galaxies)`)
    $('.curr-size').text(`Width: ${laniakeaCluster.w/ly/1000000} Million Light Years`)
    $('.km').text(`Kilometers: ${Math.floor(currDistKm/1000000000000000000000)} Septillion`)
    $('.ly').text(`Light Years: ${Math.floor(currDistLy/1000000)} Million`)
    perspective.laniakeaCluster.material.opacity = 0.2
    perspective.localSuperClusters.material.opacity = 0.05
    perspective.observableUniverse.material.opacity = 0
  }
  // Local Super Clusters
  if (currDistKm > localSuperClusters.w && currDistKm < observableUniverse.w ){
    console.log(renderStatus.observableUniverse)
    if (!renderStatus.observableUniverse) {
      renderStatus.observableUniverse = true
      renderObservableUniverse()
    }

    $('.curr-name').css('color', localSuperClusters.color)
    $('.curr-name').text(`Local Super Clusters`)
    $('.curr-objects').text(`Objects: 8 Super Clusters (Aprox. 1.2m Galaxies)`)
    $('.curr-size').text(`Width: ${localSuperClusters.w/ly/1000000000} Billion Light Years`)
    $('.km').text(`Kilometers: ${Math.floor(currDistKm/1000000000000000000000)} Septillion`)
    $('.ly').text(`Light Years: ${Math.floor(currDistLy/1000000000)} Billion`)
    perspective.localSuperClusters.material.opacity = 0.2
    perspective.observableUniverse.material.opacity = 0.1
  }
  if (currDistKm > observableUniverse.w){
    $('.curr-name').text(`Observable Universe (${observableUniverse.w/ly/1000000000} Million Light Years)`)
    $('.curr-name').css('color', observableUniverse.color)
    $('.km').text(`Kilometers: ${Math.floor(currDistKm/1000000000000000000000000)} Octillion`)
    $('.ly').text(`Light Years: ${Math.floor(currDistLy/1000000000)} Billion`)
    perspective.observableUniverse.material.opacity = 0.2
  }
}, 100)

// OTHER
let camTheta = 0
let camDTheta = -0.002
let camRadius = 300
let looking = new THREE.Vector3(0, 0, 0)
let mainLoop = () => {
  camera.lookAt(looking)
  controls.update()
  // camera.position.x = (camRadius) * Math.cos(camTheta);
  // camera.position.z = (camRadius) * Math.sin(camTheta);
  // camTheta += camDTheta
  renderer.render(scene, camera);
  requestAnimationFrame(mainLoop);
}

init();
renderStructures()
renderSolarSystem()
// renderStellarNeightborhood()
// renderMilkyWay()
// renderLocalGroup()
// renderLaniakeaCluster()
// renderLocalSuperClusters()
// renderObservableUniverse()

selectSection()

mainLoop();



// Out of date code
let deadFuncs = () => {
  // OTHER
  let userControls = () => {
    $('body').on('keypress', (e) => {
      let key = e.key
      console.log(e.key)
      if(key === 'Enter') {
        camera.position.x = 0;
        camera.position.z = 300;
        camera.position.y = 0;
        camera.rotation.y = 0
        camera.lookAt(new THREE.Vector3(0,0,0))
      }
    })
  }
  let makeStarBox = () => {
    let universeWidth = 9460730470000 * 93 * 1000000000
    let skyBoxImg = 'media/2k_stars.jpg'
    // let skyBoxImg = 'media/black.png'
    let skyBoxTexture = new THREE.TextureLoader().load(skyBoxImg)
    skyBoxTexture.wrapT = THREE.RepeatWrapping;
    skyBoxTexture.wrapS = THREE.RepeatWrapping;
    skyBoxTexture.repeat.set(2, 2);
    let skyBoxMaterial = new THREE.MeshBasicMaterial({map: skyBoxTexture, side: THREE.DoubleSide, transparent: true, opacity: 0.2})
    let skyboxGeo = new THREE.SphereGeometry(universeWidth, 80, 80)
    let skybox = new THREE.Mesh(skyboxGeo, skyBoxMaterial)
    scene.add(skybox)
  }

  // Solar System Event Handeling
  let status
  let loadPlanetOptions = (planet) => {
    $('.footer').empty()
    if (planet === 'loaded') {
      let infoBtn = `<button class='back-btn'>Back</button>`
      let exploreBtn = `<button class='explore-btn'><a href='/explore.html'>Explore</a></button>`
      $('.footer').append(infoBtn, exploreBtn)
      $('.back-btn').on('click', () => {
        planet = 'unloaded'
        loadPlanetInfo('back')
      })
      $('.explore-btn').on('click', () => {
        // console.log('lets explore')
        // explorePlanet(currPlanet)
      })
    } else if (planet !== 'unloaded') {
      // console.log('activated')
      // if (currPlanet === planet) { return }
      let planetName = planet.name.toUpperCase()
      let infoBtn = `<button class='planet-info'>${planetName}</button>`
      currPlanet = planet
      $('.footer').append(infoBtn)
      $('.planet-info').on('click', () => {
        loadPlanetInfo(currPlanet)
      })
    }
  }

  let currPlanet
  let getCurrName = (planet) => {
    // remove any current button, display new button
    if (planet !== currPlanet) {
      $('.footer').empty()
      currPlanet = planet
      let planetName = planet.name.toUpperCase()
      let infoBtn = $(`<button class='planet-info'>${planetName}</button>`)
      $('.footer').append(infoBtn)
      $('.planet-info').on('click', () => {
        loadPlanetInfo(currPlanet)
      })
    }
  }

  let loaded = false
  let loadPlanetInfo = (planet) => {
    if (!loaded) {
      $('.footer').empty()
      loaded = true
      controls.target = planet.position
      camera.position.x = planet.position.x+(100000000);
      camera.position.z = planet.position.z;
      camera.position.y = planet.position.y+(100000000);

      let infoBtn = `<button class='back-btn'>Back</button>`
      let exploreBtn = `<button class='explore-btn'><a href='/explore.html'>Skyview</a></button>`
      $('.footer').append(infoBtn, exploreBtn)
      $('.back-btn').on('click', () => {
        loaded = false
        currPlanet = null
        // $('.planet-info-left').empty()
        // $('.planet-info-right').empty()
        $('.footer').empty()
        controls.target = new THREE.Vector3(0,0,0)
        camera.position.set(0, 100000000, 300000000)
      })

    }
  }

  let planetHandeling = () => {
    $('body').on('mousemove', (e) => {
      let mouse = {}
      mouse.x = ((e.clientX / window.innerWidth) * 2 - 1)
      mouse.y = (-(e.clientY / window.innerHeight) * 2 + 1)
      mouse.z = 1
      let rayCast = new THREE.Raycaster();
      rayCast.setFromCamera(mouse, camera)
      let intersects = rayCast.intersectObjects(scene.children)

      if (intersects[0]) {
        console.log(intersects)
        let name = intersects[0].object.name;
        for (let i = 0; i < planetArr.length; i++) {
          if(planetArr[i].name === name) {
            loadPlanetOptions(planetArr[i])
          }
          if(orbArr[i].name === name) {
            loadPlanetOptions(planetArr[i])
          }
        }
      }
    })
    $('body').on('click', (e) => {
      let mouse = {}
      mouse.x = ((e.clientX / window.innerWidth) * 2 - 1)
      mouse.y = (-(e.clientY / window.innerHeight) * 2 + 1)
      mouse.z = 1
      let rayCast = new THREE.Raycaster();
      rayCast.setFromCamera(mouse, camera)
      let intersects = rayCast.intersectObjects(scene.children)
      console.log(intersects)
      if (intersects[0]) {
        for (let intersect of intersects) {
          let name = intersect.object.name;
          for (let planet of planetArr) {
            if(planet.name === name) {
              loadPlanetInfo(planet)
            }
          }
        }
      }
    })
  }
}
