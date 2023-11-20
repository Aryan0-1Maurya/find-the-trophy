/* 

    #############################################################
      
          @@@@@@@@@@    &&&&&&&&&&&&&&&&&&&    %%%%%%%%%%

(   By ~Aryan Maurya Mr.perfect https://amsrportfolio.netlify.app  )

          @@@@@@@@@@    &&&&&&&&&&&&&&&&&&&    %%%%%%%%%%

    #############################################################

*/
let W, H, camera, player;
let ctx,
    level = 0,
    maxLevel = 2, // 3 actually
    splashScreenLoaded = false,
    splashScreentimeOut = 0,
    isPlaying = false,
    lastPlayed = new Date();


const showInfos = (text, time) => {
    let canvas = document.getElementsByTagName('canvas')[0];
    let divLevel = document.getElementById('infos');
    divLevel.style.top = '0';
    divLevel.innerText = text;
    canvas.style.filter = "blur(10px)"; 
    setTimeout(function() { 
        divLevel.style.top = '-100%';
        canvas.style.filter = "blur(0px)";
    }, time);
};    

/**Camera
 * -moves around with the player and focus only on the current tile
 * @param x starting point of the camera along the x-axis
 * @param y starting point of the camera along the y-axis
 * @param width ending point of the camera on the x-axis
 * @param height ending point of the camera on the y-axis
 */
class Camera {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = 4;
    }
}


/**Player 
 * @param x position of the player on the x-axis
 * @param y position of the player on the y-axis
 * @param width the original width of a single tile in the tilesheet 
 * @param height the original height of a single tile in the tilesheet
 * @param scaleWidth new width given to a tile
 * @param scaleHeight new height given to a tile
 * @method animateSprite decides if to animate a tile when moving or not
*/
class Player {
    constructor(x, y) {
        this.x = x - camera.x;
        this.y = y - camera.y;
        this.scaleWidth = tile.width + 10;
        this.scaleHeight = tile.height + 10;
        this.isMoving = false;
        this.sourceX = 15;
        this.sourceY = 1 * tile.height;
        this.animationDelay = 0;
        this.animationIndex = 0;
        this.animationFrame = [15, 16, 17, 18, 19, 20, 21, 22];
        this.angle = 0;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x + this.scaleWidth * .5, this.y + this.scaleHeight * .5);
        ctx.rotate(util.radeg(this.angle));
        ctx.drawImage(tile.img, this.sourceX, this.sourceY, tile.width, 
            tile.height, -(this.scaleWidth * .5), -(this.scaleHeight * .5),
            this.scaleWidth, this.scaleHeight);
        ctx.restore();
    }

    setKeyDirection(direction) {
        if(direction === "south")
            this.angle = 0;
        else if(direction === "west") 
            this.angle = 90;
        else if(direction === "north")
            this.angle = 180;
        else if(direction === "east")
            this.angle = -90;
    }

    animateSprite() {
        if(this.isMoving) {
            this.animationDelay++;
            if(this.animationDelay >= 3) {
                this.animationDelay = 0;
                this.animationIndex++;
                if(this.animationIndex >= this.animationFrame.length) 
                    this.animationIndex = 0;
                this.sourceX = this.animationFrame[this.animationIndex] * tile.width;
                this.sourceY = 1 * tile.height;
            }
        } else {
            this.sourceX = 14 * tile.width;
            this.sourceY = 5 * tile.width;
        }
    }

    update() {
        this.draw();
        this.setKeyDirection();
        this.animateSprite();
    }
}


/**Text render texts to the screen */
class Text {
    constructor(text, x, y, font, color, life) {
        this.text = text;
        this.x = x;
        this.y = y;
        this.font = font;
        this.color = color;
        this.halfLife = life || null;
    }

    draw() {
        ctx.font = this.font;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, this.x, this.y);
    }
}


// just some utility functions
const util = {
    radeg(value, type) {
        if(type == null || typeof type == "undefined") 
            return value * Math.PI / 180;
        else
            return value * 180 / Math.PI;
    }, 

    drawRect(params, color, ofX, ofY) {
        ctx.save();
        ctx.fillStyle = color[0];
        ctx.shadowOffsetX = ofX;
        ctx.shadowOffsetY = ofY;
        ctx.shadowColor = color[1];
        ctx.shadowBlur = 20;
        ctx.fillRect(...params);
        ctx.restore();
    },

    colors: { sea: "#3771C8"}
}



const levelMap = [
    {
        number: 1,
        title: "The Genesis-AmsR",
        column: 20,
        row: 20,
        world: [
            [27,27,27,27,26,27,27,27,26,73,73,73,26,27,27,27,26,27,74,72],
            [27,71,71,71,71,71,71,71,71,96,96,28,71,71,27,71,71,71,74,72],
            [27,71,51,51,51,51,71,51,51,49,73,49,71,71,27,71,69,71,74,72],
            [26,71,51,71,71,96,71,27,27,49,73,49,71,96,71,71,71,71,74,72],
            [27,71,51,71,27,27,71,71,71,49,73,49,71,27,27,27,27,71,74,72],
            [27,96,51,71,27,121,97,97,122,49,73,49,71,71,71,96,71,71,74,72],
            [27,71,51,71,27,99,73,73,100,49,73,49,71,27,27,27,27,27,74,72],
            [26,51,51,71,96,99,73,73,100,71,71,71,71,71,71,71,71,71,74,72],
            [27,71,71,71,51,72,73,73,73,73,73,73,73,96,73,73,73,73,73,73],
            [27,71,51,73,51,71,71,71,71,71,71,71,71,71,71,71,71,71,74,72],
            [27,71,51,73,71,71,29,29,29,29,71,71,71,27,26,27,27,27,74,72],
            [26,71,51,73,71,71,29,29,29,29,71,27,27,27,26,27,27,27,74,72],
            [27,71,51,73,51,71,71,71,71,29,71,71,71,71,71,71,27,45,74,72],
            [27,71,71,73,73,73,73,73,71,29,71,27,96,27,27,27,27,71,74,72],
            [27,71,71,51,51,51,51,73,71,29,71,27,71,71,27,71,71,71,74,72],
            [26,71,71,71,96,71,71,73,71,29,29,29,29,71,27,71,27,27,74,72],
            [27,51,51,51,51,51,71,71,71,71,71,71,29,71,71,71,27,69,74,72],
            [27,27,27,27,26,27,27,73,26,27,27,27,26,27,27,27,26,72,72,72],
            [0,0,0,27,27,27,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
        ]
    },

    {
        number: 2,
        title: "Clueless Level-AmsR",
        column: 20,
        row: 20,
        world: [
            [73,73,73,73,73,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28],
            [73,71,73,73,73,71,71,71,71,71,71,71,71,28,71,71,71,71,71,28],
            [28,71,73,73,73,71,28,28,28,28,28,28,28,47,72,72,47,71,28,28],
            [28,71,71,71,96,96,71,71,28,71,71,71,47,72,45,72,47,71,71,28],
            [28,71,49,49,73,31,28,71,28,71,28,71,47,24,24,69,28,28,71,28],
            [28,71,71,71,73,71,71,71,28,71,28,71,71,71,71,71,71,71,71,28],
            [28,71,49,49,73,71,28,28,28,96,28,28,28,28,28,28,28,28,28,28],
            [28,71,71,71,73,71,28,47,49,71,71,71,71,71,71,49,71,71,71,28],
            [28,71,49,49,73,71,28,47,49,49,49,49,49,49,71,71,71,49,71,28],
            [28,71,71,71,73,71,28,28,28,71,71,71,49,71,71,49,49,49,71,28],
            [28,49,49,71,73,71,71,96,71,71,49,49,49,49,49,71,71,71,71,28],
            [28,71,71,71,73,71,28,71,28,71,71,71,71,71,49,49,96,49,49,28],
            [28,71,49,49,73,28,49,71,49,71,49,49,49,49,49,71,71,71,71,28],
            [28,71,71,96,71,71,71,71,71,71,49,71,71,71,49,49,49,71,49,28],
            [28,71,49,71,73,71,49,71,49,71,96,71,49,71,49,71,71,71,71,28],
            [28,71,49,71,73,71,49,71,49,49,49,49,49,71,49,49,49,49,71,28],
            [28,71,49,71,73,71,71,71,49,71,71,71,49,71,71,71,71,71,71,47],
            [28,71,71,71,73,71,49,71,71,71,49,71,71,71,72,72,72,72,72,47],
            [28,71,71,71,73,73,73,73,73,73,73,73,73,73,72,72,72,72,72,92],
            [28,28,28,28,73,73,73,28,28,28,28,28,28,73,91,91,91,91,91,91]
        ]
    },

    {
        number: 3,
        title: "for the LEGENDS-AmsR",
        column: 40,
        row: 40,
        world: [
            [92,92,47,135,135,135,135,135,135,135,135,135,135,32,32,32,32,32,73,73,73,73,73,73,52,52,52,52,52,52,52,52,52,52,52,52,52,52,52,32],
            [92,71,47,45,72,47,32,32,32,32,32,32,32,32,71,71,71,71,71,71,71,71,71,71,71,32,71,71,71,71,52,52,52,52,52,52,52,52,52,32],
            [32,71,47,72,72,71,71,71,71,71,71,71,71,32,71,73,73,73,73,73,73,73,73,73,71,32,107,129,106,71,52,52,52,52,96,96,96,71,71,32],
            [32,71,47,48,47,32,32,32,32,32,32,32,71,32,71,73,73,71,71,71,73,73,73,73,71,32,173,195,194,71,71,71,71,71,71,32,71,71,71,32],
            [32,71,32,24,25,32,32,71,71,71,71,32,71,32,71,73,73,71,32,71,71,71,71,71,96,32,71,71,71,71,81,37,71,32,32,32,71,32,71,32],
            [32,71,71,71,71,96,71,71,32,32,32,32,71,71,71,73,73,71,32,32,32,32,32,32,32,32,32,32,32,71,103,15,71,71,71,71,71,32,71,32],
            [32,71,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,71,32,71,71,71,71,71,71,71,71,71,71,71,81,59,71,73,73,73,71,71,71,32],
            [32,71,32,71,71,71,71,71,71,71,71,71,71,71,71,71,48,71,32,32,32,32,32,32,32,32,32,32,32,71,32,32,71,32,73,32,71,73,71,32],
            [32,71,32,71,32,32,32,32,32,32,32,71,32,71,32,32,32,71,71,71,71,71,96,71,71,71,71,71,71,71,71,71,71,32,73,32,71,73,71,32],
            [32,71,32,71,32,96,96,96,96,96,71,71,32,71,32,32,32,32,32,32,32,32,32,32,32,32,32,32,48,32,32,32,71,32,32,32,71,32,71,32],
            [32,71,71,71,32,32,32,32,71,32,32,32,32,71,32,32,32,32,71,71,71,71,32,71,71,71,71,71,71,32,71,32,71,71,71,71,71,32,71,32],
            [32,71,32,96,47,72,72,72,72,72,47,72,71,71,32,32,71,32,32,32,32,71,32,32,32,32,32,32,71,32,71,32,32,71,32,32,32,32,71,32],
            [32,71,32,96,47,72,72,46,72,72,47,72,71,71,32,32,71,32,71,71,71,71,71,71,71,71,71,96,71,32,71,32,32,71,32,71,71,32,71,32],
            [32,71,32,71,47,24,25,69,24,25,47,72,71,71,32,32,71,32,73,73,73,71,32,32,32,32,32,32,32,32,71,32,32,71,32,32,71,32,71,32],
            [32,71,32,71,71,71,32,71,71,71,71,71,71,71,32,32,71,32,73,73,73,71,32,71,71,71,71,71,71,96,71,71,32,71,32,71,71,71,71,32],
            [32,71,32,32,32,71,71,71,32,32,32,32,32,32,32,32,71,32,32,71,71,96,71,32,32,71,32,32,32,32,32,71,32,71,32,69,71,32,71,32],
            [32,71,71,71,71,32,32,32,32,32,32,32,32,32,71,71,71,71,71,71,32,32,71,71,71,71,71,71,71,71,71,32,32,71,71,71,71,32,71,32],
            [32,71,71,32,32,71,71,71,71,71,71,71,71,32,32,32,32,32,32,71,32,27,27,27,27,27,27,27,27,27,71,32,32,71,32,32,32,32,71,32],
            [32,32,71,71,71,71,32,32,32,32,32,32,32,32,32,32,32,32,32,71,32,27,71,71,71,71,71,71,27,27,71,32,32,71,32,32,71,71,71,32],
            [73,73,73,71,32,71,32,71,71,71,71,71,71,71,71,71,71,32,32,71,32,27,71,27,27,27,27,71,27,27,71,32,32,96,71,71,71,32,48,32],
            [73,73,73,71,71,71,71,71,32,32,32,71,32,32,32,32,32,32,32,71,32,27,71,71,71,71,27,71,27,27,71,32,32,32,32,32,71,32,71,32],
            [73,73,73,71,32,71,32,32,32,71,71,71,32,71,71,71,71,71,71,71,32,27,71,27,27,27,27,71,27,71,71,71,71,71,71,32,71,32,71,32],
            [73,73,73,71,69,71,71,71,71,71,32,32,32,71,32,32,32,32,32,32,32,27,71,71,71,71,27,71,27,27,71,71,71,71,32,32,71,32,71,32],
            [69,71,71,71,69,71,32,71,32,71,71,96,71,71,71,71,32,32,32,32,32,32,47,72,72,71,27,71,27,27,27,27,27,71,32,32,71,32,71,32],
            [69,69,69,69,69,71,32,71,32,71,32,32,32,32,32,71,32,32,32,32,71,32,47,72,72,71,27,71,71,71,71,71,71,71,71,32,71,32,71,32],
            [32,32,71,71,71,71,32,71,32,71,32,71,71,71,71,71,32,32,32,32,71,32,47,24,25,71,27,27,27,27,27,27,27,27,71,71,71,32,71,32],
            [32,71,32,71,32,71,32,71,32,71,32,71,32,32,32,71,32,32,32,32,71,32,32,32,32,71,71,71,71,71,71,71,71,71,71,32,32,32,71,32],
            [32,71,71,71,71,71,71,71,71,71,32,71,71,71,71,71,71,71,71,71,71,71,71,71,32,71,32,32,32,32,71,32,32,32,32,32,71,71,71,32],
            [32,32,32,32,32,71,32,32,32,32,32,96,32,32,71,32,71,32,71,32,71,32,32,32,32,71,32,32,32,32,71,32,71,71,71,71,71,32,71,32],
            [32,71,71,71,71,71,71,71,71,71,71,71,71,32,71,32,71,32,71,32,71,32,71,71,71,71,71,71,71,32,71,32,32,71,32,32,32,32,71,32],
            [32,71,32,32,71,32,32,32,32,32,32,32,71,32,71,32,71,32,71,32,32,32,71,32,32,32,32,32,71,71,71,32,32,32,32,32,32,32,71,32],
            [32,71,32,71,71,32,71,71,32,71,71,32,71,32,71,32,71,32,71,71,71,32,71,71,71,32,32,71,71,32,71,71,71,71,71,71,71,71,71,32],
            [32,71,32,71,32,32,71,71,71,71,71,32,71,32,32,32,71,32,71,96,32,32,71,32,32,32,32,32,32,32,71,32,71,32,32,71,69,71,69,32],
            [32,32,32,71,32,71,71,32,71,32,71,71,71,71,71,32,71,32,71,96,96,96,71,71,71,71,32,32,32,32,71,32,71,32,32,69,69,71,70,32],
            [32,71,71,71,71,71,71,96,71,32,71,32,32,32,71,32,71,32,71,32,32,32,71,32,32,71,71,71,71,71,71,71,71,71,32,71,69,69,69,32],
            [32,71,32,32,32,32,71,71,71,32,71,71,71,32,71,32,96,32,32,32,32,71,71,71,32,71,32,71,71,71,32,71,71,71,71,71,71,71,71,32],
            [32,71,32,71,71,71,71,32,71,71,71,32,32,32,71,32,71,71,71,71,71,71,96,71,71,71,32,32,32,32,32,71,32,32,32,32,71,69,71,32],
            [32,71,32,32,32,32,32,32,32,32,71,71,71,32,71,32,71,32,71,32,32,32,77,32,32,71,32,71,71,71,71,71,71,71,71,32,71,71,71,32],
            [32,71,71,71,71,71,32,71,71,71,71,96,71,32,71,32,71,32,71,71,71,71,77,71,71,71,71,71,72,72,72,72,72,72,72,71,71,32,71,32],
            [32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,75,75,75,75,75,75,77,75,75,75,75,75,75,93,93,93,93,93,93,32,32,32,32,32]
        ]
    }
]


const tile = {
    img: new Image(),
    src: "https://i.ibb.co/hDK9Qyz/defend.png",
    column: 22,
    row: 12,
    width: 32,
    height: 32,
    scaleWidth: 64,
    scaleHeight: 64
};



/**Update method
 * This is where the major update take place from maze rendering to
 * player's sprite animation
 */
const update = () => {
    if(ctx == null) return;

    /**Render the tile world */
    let cameraX_min = ~~(camera.x / tile.scaleWidth);
    let cameraY_min = ~~(camera.y / tile.scaleHeight);

    let cameraX_max = Math.ceil((camera.x + camera.width) / tile.scaleWidth);
    let cameraY_max = Math.ceil((camera.y + camera.height) / tile.scaleHeight);

    // sop finding index on the level world if any of these condition happens
    if(cameraX_min <= 0) cameraX_min = 0;
    else if(cameraX_max >= levelMap[level].column) 
        cameraX_max = levelMap[level].column;

    if(cameraY_min <= 0) cameraY_min = 0;
    else if(cameraY_max >= levelMap[level].row)
        cameraY_max = levelMap[level].row;

    for(let row = cameraY_min; row < cameraY_max; row++) {
        for(let col = cameraX_min; col < cameraX_max; col++) {
            // get the current game's world
            let index = levelMap[level].world[row][col];
            // set the position of each tile on the screen 
            let posX = (col * tile.scaleWidth) - camera.x;
            let posY = (row * tile.scaleHeight) - camera.y;
            if(index !== 0) {
                // get source of images by their number 
                let sourceX = ~~((index - 1) % tile.column) * tile.width;
                let sourceY = ~~((index - 1) / tile.column) * tile.height;
                // draw the actual tile
                ctx.drawImage(tile.img, sourceX, sourceY, tile.width, tile.height, 
                    posX, posY, tile.scaleWidth, tile.scaleHeight);
            } else {
                ctx.fillStyle = util.colors.sea;
                ctx.fillRect(posX, posY, tile.scaleWidth, tile.scaleHeight);
            }
        }
    }

    player.update();

    // increase gameOver time in each level
    if(Math.abs(new Date().getMinutes() - lastPlayed.getMinutes()) >= (4  * (level + 1))) {
        animation.endGame();
     }
    
    util.drawRect([0, 0, W, 50], ["rgba(0, 0, 0, .4)", "rgba(0, 0, 0, .4)"], 0, 0);
    let timeRemainder = new Text("You are given "+ Number(5 * (level + 1)) + " Minutes", 
        W/ 2, 30, "bold 15px Courier New", "lightgray");
    timeRemainder.draw();
};



// screen to be displayed when game is over
const mainScreen = () => {

    if(splashScreentimeOut < 150 && splashScreenLoaded === false) {
        splashScreentimeOut++;
    }
    else {
        splashScreentimeOut = 100;
        splashScreenLoaded = true;
    }

    // display the menu screen
    if(splashScreenLoaded) {
        ctx.fillStyle = util.colors.sea;
        util.drawRect([0, 0, W, H/2], ["lightgray", "rgba(0, 0, 0, .5)",
        4, 4]);

        let about = new Text("ABOUT", W/2, 50, "bold 40px Arial", "#222");
        about.draw();

        let aboutText = [
            "This game has 3 levels and there's a ",
            "hidden trophy in each........",
            "Find this trophy before the time runs out"
        ];

        let aboutArr = [];
        aboutText.forEach((text, index) => {
            
            aboutArr.push(new Text(text, W/2, 100 * (index + 1), "italic 15px Courier New", "#222"));
        });

        aboutArr.forEach(text => text.draw());

        util.drawRect([0, H - 65, W, 65], ["lightgray", "rgba(0, 0, 0, .5)"],
            4, 4);
        let startGame = new Text("Start", W / 2, H - 35, "bold 20px Courier New", "#222");
        startGame.draw();
    } 

    // display the splashscreen
    else {
        ctx.fillStyle = "#222";
        ctx.fillRect(0, 0, W, H);

        let title = new Text("Find the Trophy", W/2, (H/2) - 20, 
            "bold 30px Courier New", "lightgray");
        title.draw();

        let author = new Text("Mirielle's game", (W/2) + 40, (H/2) + 5, 
            "bold  15px Courier New", "yellow");
        author.draw();

        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.fillStyle = "lightgray";
        ctx.moveTo(W/2, (H / 2) + 35);
        ctx.lineTo((W / 2) - 50, (H / 2) + 100);
        ctx.lineTo((W / 2) + 50, (H / 2) + 100);
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.fillStyle = "#222";
        ctx.moveTo(W / 2, (H / 2) + 135);
        ctx.lineTo((W / 2) - 50, (H / 2) + 65);
        ctx.lineTo((W / 2) + 50, (H / 2) + 65);
        ctx.fill();
        ctx.closePath();
    }
}

/* 

    #############################################################
      
          @@@@@@@@@@    &&&&&&&&&&&&&&&&&&&    %%%%%%%%%%

(   By ~Aryan Maurya Mr.perfect https://amsrportfolio.netlify.app  )

          @@@@@@@@@@    &&&&&&&&&&&&&&&&&&&    %%%%%%%%%%

    #############################################################

*/
/**Animation
 * @method init initializes all animations
 * @method startGame to be called when starting a new game
 * @method endGame to be called when gameOver on failure
 * @method newLevel to be called when gameOver on sucess
 */
const animation = {
    init() {
        ctx.clearRect(0, 0, W, H);
        if(isPlaying)
            update();
        else mainScreen();
        requestAnimationFrame(animation.init);
    },

    startGame() {
        isPlaying = true;
        level = 0;
        lastPlayed = new Date();
        camera.x = -(W / 2);
        camera.y = -(H / 2);
        let title = levelMap[level].title;
        showInfos("level: "+ Number(level + 1) + "\n\n" + title, 2000)
    },

    endGame() {
        isPlaying = false;
        showInfos("GAME OVER")
        //alert("GAME OVER");
    },
    
    winGame() {
        isPlaying = false;
        level = 0;
        showInfos("CONGRATULATIONS..\n\nYou're now a pro in this game", 3000);
        //alert("CONGRATULATIONS..\n\nYou're now a pro in this game");
    },

    newLevel() {
        camera.x = -(W / 2);
        camera.y = -(H / 2);
        level++;
        if(level > maxLevel) {
            this.winGame();
        }
        else{
            let title = levelMap[level].title;
            showInfos("level: "+ Number(level + 1) + "\n\n" + title, 2000)
            //alert("level: "+ Number(level + 1) + "\n\n" + title);
        }
        lastPlayed = new Date();
    }
}

/* 

    #############################################################
      
          @@@@@@@@@@    &&&&&&&&&&&&&&&&&&&    %%%%%%%%%%

(   By ~Aryan Maurya Mr.perfect https://amsrportfolio.netlify.app  )

          @@@@@@@@@@    &&&&&&&&&&&&&&&&&&&    %%%%%%%%%%

    #############################################################

*/

/**EventHandler
 * events supported are click, swipe and keys
 * click for starting the game
 * swipe for controlling camera on touch devices
 * keys for controlling camera on keuboard devices
 */
const eventHandler = () => {
    // STARTGAME
    ctx.canvas.addEventListener("click", e => {
        if(!isPlaying) {
            if(e.clientY >= H - 65) {
                animation.startGame();
            }
        }
    });

    // SWIPE FOR TOUCH DEVICES 
    let touchStartX, touchStartY;
    ctx.canvas.addEventListener("touchstart", e => {
        touchStartX = e.changedTouches[0].clientX;
        touchStartY = e.changedTouches[0].clientY;
    });

    ctx.canvas.addEventListener("touchmove", e => {
        let diffX = Math.abs(touchStartX - e.changedTouches[0].clientX);
        let diffY = Math.abs(touchStartY - e.changedTouches[0].clientY);
        if(diffX > diffY) {
            // horizontal swipe
            if(e.changedTouches[0].clientX < touchStartX) canMove.west();
            else canMove.east();
        } else {
            // vertical swipe
            if(e.changedTouches[0].clientY < touchStartY) canMove.north();
            else canMove.south();
        }
        e.preventDefault();
    });

    ctx.canvas.addEventListener("touchend", () => {
        player.isMoving = false;
    });

    // KEYBOARDS 
    window.addEventListener("keydown", e => {
        if(e.keyCode === 37) 
            canMove.west();
        else if(e.keyCode === 39) 
            canMove.east();
        else if(e.keyCode === 38) 
            canMove.north();
        else if(e.keyCode === 40) 
            canMove.south();
    });

    window.addEventListener("keyup", () => {
        player.isMoving = false;
    });
}


/**canMove object has various methods to check if the camera and the player can 
 * move to various direction or if the next tile is moveable for the player
 * @param moveable is a list of all moveable tiles in the game
 */
const canMove = {
    moveable: [71, 72, 77, 121, 100, 99, 98, 97, 120, 119, 45, 96, 122],

    north() {
        let posX = player.x + camera.x;
        let posY = player.y - camera.speed + camera.y;
        let col = ~~(posX / tile.scaleWidth);
        let row = ~~(posY / tile.scaleHeight);
        let mazeIndex = levelMap[level].world[row][col];
        //console.table({pos:[posX, posY], coord:[col, row], index:mazeIndex});
        if(this.moveable.some(i => i === mazeIndex)) {
            player.setKeyDirection("north");
            player.isMoving = true;
            camera.y -= camera.speed;
        }
        if(mazeIndex === 45) 
            animation.newLevel();
    },

    south() {
        let posX = player.x + camera.x;
        let posY = player.y + camera.speed + camera.y - (tile.scaleHeight - player.scaleHeight);
        let col = ~~(posX / tile.scaleWidth);
        let row = Math.ceil(posY / tile.scaleHeight);
        let mazeIndex = levelMap[level].world[row][col];
        //console.table({pos:[posX, posY], coord:[col, row], index:levelMap[row][col]});
        if(this.moveable.some(i => i === mazeIndex)) {
            camera.y += camera.speed;
            player.setKeyDirection("south");
            player.isMoving = true;   
        }
        if(mazeIndex === 45) 
            animation.newLevel();
    },

    west() {
        let posX = player.x - camera.speed + camera.x;
        let posY = player.y + camera.y;
        let col = ~~(posX / tile.scaleWidth);
        let row = ~~(posY / tile.scaleHeight);
        let mazeIndex = levelMap[level].world[row][col];
        //console.table({pos:[posX, posY], coord:[row, col]});
        if(this.moveable.some(i => i === mazeIndex)) {
            camera.x -= camera.speed;
            player.setKeyDirection("west");
            player.isMoving = true;
        }
        if(mazeIndex === 45) 
            animation.newLevel();
    },

    east() {
        let posX = player.x + camera.speed + camera.x - (tile.scaleWidth - player.scaleWidth);
        let posY = player.y + camera.y;
        let col = Math.ceil(posX / tile.scaleWidth);
        let row = ~~(posY / tile.scaleHeight);
        let mazeIndex = levelMap[level].world[row][col];
        //console.table({pos:[posX, posY], coord:[row, col], index:mazeIndex});
        if(this.moveable.some(i => i === mazeIndex)) {
            camera.x += camera.speed;
            player.setKeyDirection("east");
            player.isMoving = true;
        }
        if(mazeIndex === 45)
            animation.newLevel();
    }
}



const init = () => {
    ctx = document.querySelector("#cvs").getContext("2d");
    W = ctx.canvas.width = innerWidth;
    H = ctx.canvas.height = innerHeight;
    camera = new Camera(-(W / 2), -(H / 2), W, H);
    player = new Player(64, 64);
    tile.img.src = tile.src;
    ctx.canvas.style.backgroundColor = util.colors.sea;

    requestAnimationFrame(animation.init);
    eventHandler();
}    

window.addEventListener("load", init);



/* 

    #############################################################
      
          @@@@@@@@@@    &&&&&&&&&&&&&&&&&&&    %%%%%%%%%%

(   By ~Aryan Maurya Mr.perfect https://amsrportfolio.netlify.app  )

          @@@@@@@@@@    &&&&&&&&&&&&&&&&&&&    %%%%%%%%%%

    #############################################################

*/