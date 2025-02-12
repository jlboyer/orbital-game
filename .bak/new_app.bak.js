const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
//canvas.style.cursor = 'none';

// save canvas state
ctx.save();

// Create gradient

let bckgrd = ctx.createRadialGradient(110, 375, 0, 0, 375, 1200);

// Add colors

bckgrd.addColorStop(0, "rgba(255, 0, 106, 1.000)");
bckgrd.addColorStop(0.5, "rgba(134, 0, 252, 0.500)");
bckgrd.addColorStop(1, "rgba(14, 185, 247, 0.000)");

// Fill with gradient

ctx.fillStyle = bckgrd;
ctx.fillRect(0, 0, canvas.width, canvas.height);

//restore original canvas state and save it again
// ctx.restore();
// ctx.save();
//Create effect to change color of ship by position

// ctx.globalCompositeOperation = "exclusion";

class Ship {
  constructor() {
    this.lives = 5;
    this.score = 0;
    this.parentPlanet = {};
    this.radius = 8;
    this.centerX = 130;
    this.centerY = 375;
    this.orbiting = true;
    this.orbitRadius = 45;
    this.orbitFreq = 30; //1 per sec at 60 FPS
    this.angularVelocity = 2 * Math.PI * this.orbitFreq;
    this.rotationAngle = 0;
    this.vX = 0;
    this.vY = 0;
    this.vAdjust = 1 / 13.5;
    this.gradient = ctx.createRadialGradient(
      this.centerX,
      this.centerY,
      0,
      this.centerX,
      this.centerY,
      this.radius
    );
    this.colorStop1 = "rgba(252, 224, 10, 1)";
    this.colorStop2 = "rgba(244, 33, 14, 0)";
  }
  updateRotationAngle() {
    this.rotationAngle =
      this.angularVelocity * (1 / 60) * game.time.getSeconds() +
      this.angularVelocity * (1 / 60000) * game.time.getMilliseconds();
  }
  updateLinearVel() {
    let cosTheta = Math.cos(this.rotationAngle);
    let sinTheta = Math.sin(this.rotationAngle);
    this.vX = -this.angularVelocity * sinTheta * this.vAdjust;
    this.vY = this.angularVelocity * cosTheta * this.vAdjust;
  }
  orbit() {
    this.centerX =
      this.orbitRadius * Math.cos(this.rotationAngle) +
      this.parentPlanet.centerX;
    this.centerY =
      this.orbitRadius * Math.sin(this.rotationAngle) +
      this.parentPlanet.centerY;
  }
  draw() {
    if (this.orbiting === true) {
      this.updateRotationAngle();
      this.updateLinearVel();
      this.orbit();
    } else {
      this.launch();
    }
    ctx.font = "18px sans-serif";
    ctx.fillText(`Vx: ${this.vX.toFixed(1)} Vy: ${this.vY.toFixed(1)}`, 50, 50);
    ctx.fillText(`Player: ${game.currentPlayer + 1}`, 50, 75);
    ctx.beginPath();
    ctx.fillText(`Player-1 Score: ${game.ships[0].score} Player-2 Score: ${game.ships[1].score}`, 50, 100);
    ctx.beginPath();
    // this.gradient.addColorStop(0, this.colorStop1);
    // this.gradient.addColorStop(1, this.colorStop2);
    // ctx.fillStyle = this.gradient;

    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.arc(this.centerX, this.centerY, this.radius, 0, 2 * Math.PI, false);
    ctx.stroke();

    // ctx.fill();
  }
  launch() {
    this.centerX +=
      this.vX * (1 / 60) * game.time.getSeconds() +
      this.vX * (1 / 60000) * game.time.getMilliseconds();
    this.centerY +=
      this.vY * (1 / 60) * game.time.getSeconds() +
      this.vY * (1 / 60000) * game.time.getMilliseconds();
    this.newOrbit();
    this.outOfBounds();
  }
  newOrbit() {
    game.planets.slice(1).forEach(planet => {
      if (planet !== this.parentPlanet) {
        let minX = planet.centerX - 1.5*this.orbitRadius;
        let maxX = planet.centerX + 1.5*this.orbitRadius;
        let minY = planet.centerY - 1.5*this.orbitRadius;
        let maxY = planet.centerY + 1.5*this.orbitRadius;
        if (
          this.centerX > minX &&
          this.centerX < maxX &&
          this.centerY > minY &&
          this.centerY < maxY
        ) {
          this.parentPlanet = planet;
          this.orbiting = true;
          this.score++
          planet.hit = true
        }
      }
    });
  }
  outOfBounds() {
    if (this.centerX > canvas.width || this.centerY > canvas.height ||this.centerX < 0 || this.centerY < 0) {
      //reset player location to starting orbit and decrement life
      game.ships[game.currentPlayer].orbiting = true;
      game.ships[game.currentPlayer].centerX = 130;
      game.ships[game.currentPlayer].centerY = 375;
      game.ships[game.currentPlayer].lives -= 1;
      game.currentPlayer = Math.abs(game.currentPlayer - 1);
      game.planets.forEach( planet => {
        planet.centerX = planet.initialCenterX
        planet.centerY = planet.initialCenterY
      })
    }
  }
}

class Planet {
  constructor(x = 80, y = 375) {
    this.centerX = x; //initialize with home will update for targets
    this.centerY = y;
    this.initialCenterX = x
    this.initialCenterY = y
    this.radius = Math.random() * 20 + 10;
    this.color = "rgba(255, 255, 255, 1)";
    this.hit = false;
    this.orbitFreq = 2; //much slower than ship orbit
    this.angularVelocity = 2 * Math.PI * this.orbitFreq;
    this.rotationAngle = 0;
    this.firstIteration = true;
    this.timerStartAngle = 0;
    this.orbitRadius = 0;
    this.startAngleToHome = 0;
  }
  updateRotationAngle() {
    if (this.firstIteration === true){
      this.timerStartAngle =
        this.angularVelocity * (1 / 60) * game.time.getSeconds() +
        this.angularVelocity * (1 / 60000) * game.time.getMilliseconds();
      this.firstIteration = false
    }
    this.rotationAngle = this.angularVelocity * (1 / 60) * game.time.getSeconds() +
    this.angularVelocity * (1 / 60000) * game.time.getMilliseconds() - this.timerStartAngle + this.startAngleToHome

    console.log("Timer Start Ang:", this.timerStartAngle.toFixed(1), "Start Ang to Home:", this.startAngleToHome.toFixed(1), "Rotation Angle:", this.rotationAngle.toFixed(1))
  }
  orbit() {
    this.centerX =
      this.orbitRadius * Math.cos(this.rotationAngle) +
      game.planets[0].centerX; 
    this.centerY =
      this.orbitRadius * Math.sin(this.rotationAngle) +
      game.planets[0].centerY; 
  }
  draw(i) {
    if (i !== 0){
      this.drawOrbit();
      this.updateRotationAngle();
      this.orbit();
    }

    ctx.beginPath();
    ctx.arc(this.centerX, this.centerY, this.radius, 0, 2 * Math.PI);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  drawOrbit() {
    let homeX = game.planets[0].centerX;
    let homeY = game.planets[0].centerY;
    this.orbitRadius = Math.sqrt(
      Math.pow(this.initialCenterX - homeX, 2) + Math.pow(this.initialCenterY - homeY, 2)
    );
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.beginPath();
    ctx.arc(homeX, homeY, this.orbitRadius, 0, 2 * Math.PI);
    ctx.stroke();
  }
}

const game = {
  targetPlanetCount: 3,
  planets: [],
  ships: [],
  currentPlayer: 0,
  time: 0,
  initialize() {
    document.onclick = () => {
      game.ships[game.currentPlayer].orbiting = false;
    };

    const home = new Planet();
    home.hit = true
    this.planets.push(home);

    let player1 = new Ship();
    player1.parentPlanet = home;
    this.ships.push(player1);

    let player2 = new Ship();
    player2.parentPlanet = home;
    this.ships.push(player2);

    this.generateTargetPlanets();

    this.animate();
  },
  generateTargetPlanets() {
    let planetCenterArray = game.makePlanetCenterArray();
    planetCenterArray.forEach(center => {
      let planet = new Planet(center[0], center[1]);
      //assign start rotation angle 
      let distToHomeX = center[0] - game.planets[0].centerX
      let distToHomeY = -1 * (center[1] - game.planets[0].centerY) //y-coord flip
      let startAngleToHome = Math.atan(distToHomeX/(distToHomeY))
      startAngleToHome = startAngleToHome < 0 ? 0.5*Math.PI + startAngleToHome : startAngleToHome
      //planet.startAngleToHome = startAngleToHome
      planet.startAngleToHome = -0.5+(Math.random()*0.5)
      game.planets.push(planet);
    });
  },
  makePlanetCenterArray() {
    let quadDim = 87.5;
    const cols = canvas.width / quadDim;
    const rows = canvas.height / quadDim;
    let i = 0;
    let activeQuadArray = [];
    let planetCenterArray = [];
    //generate quads where target planets will originate
    while (i < game.targetPlanetCount) {
      let colIndx = Math.floor(Math.random() * cols);
      let rowIndx = Math.floor(Math.random() * rows);
      if (
        activeQuadArray.indexOf([colIndx, rowIndx]) === -1 &&
        colIndx > 4 &&
        colIndx < cols - 1 &&
        rowIndx > 1 &&
        rowIndx < rows - 1
      ) {
        activeQuadArray.push([colIndx, rowIndx]);
        i++;
      } 
    }
    activeQuadArray.forEach(quad => {
      let centerX = quad[0] * quadDim - 43.75;
      let centerY = quad[1] * quadDim - 43.75;
      planetCenterArray.push([centerX, centerY]);
    });
    return planetCenterArray;
  },
  clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  },
  animate() {
    game.clearCanvas();

    //Generate gradient background --------------
    let bckgrd = ctx.createRadialGradient(110, 375, 0, 0, 375, 1200);
    bckgrd.addColorStop(0, "rgba(255, 0, 106, 1.000)");
    bckgrd.addColorStop(0.5, "rgba(134, 0, 252, 0.500)");
    bckgrd.addColorStop(1, "rgba(14, 185, 247, 0.000)");
    ctx.fillStyle = bckgrd;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    //-------------------------------------------

    game.time = new Date();

    game.ships[game.currentPlayer].draw();

    game.planets.forEach((planet,i) => {
      planet.draw(i);
    });

    game.overCheck()
    game.newRoundCheck()
    window.requestAnimationFrame(game.animate);
  },
  overCheck(){
    if (game.ships[0].lives === 0 || game.ships[1].lives === 0) {
      console.log("game over")
      ctx = null
      return 
      //prompt for new game
    }
  },
  newRoundCheck() {
    let newRound = true
    game.planets.forEach(planet => {
      if (planet.hit === false) {
        newRound = false
      }
    });
    if (newRound === true) {
      let home = game.planets[0]
      game.ships[0].parentPlanet = home;
      game.ships[1].parentPlanet = home;
      game.planets = []
      game.planets.push(home)
      game.generateTargetPlanets()
    }
  }
};

game.initialize();

// let ship = new Ship
// let home = new Planet
// ship.draw()
// home.draw()
