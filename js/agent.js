var GAMEBOARD = [];

var getXY = function (x, y) {
  var i = Math.floor((x - BUBBLES_X_START + BUBBLES_GAP / 2) / BUBBLES_GAP);
  var j = Math.floor((y - BUBBLES_Y_START + 9) / 17.75);

  return { x: i, y: j }
}

var buildGameboard = function () {
  GAMEBOARD = [];
  for (var i = 0; i < 26; i++) {
    GAMEBOARD.push([]);
    for (var j = 0; j < 29; j++) {
      GAMEBOARD[i].push({
        bubble: false,
        superBubble: false,
        inky: false,
        pinky: false,
        blinky: false,
        clyde: false,
        pacman: false,
        eaten: false
      });
    }
  }

  for (var i = 0; i < BUBBLES_ARRAY.length; i++) {
    var bubbleParams = BUBBLES_ARRAY[i].split(";");
    var y = parseInt(bubbleParams[1]) - 1;
    var x = parseInt(bubbleParams[2]) - 1;
    var type = bubbleParams[3];
    var eaten = parseInt(bubbleParams[4]);

    if (type === "b") {
      GAMEBOARD[x][y].bubble = true;
    } else {
      GAMEBOARD[x][y].superBubble = true;
    }
    if (eaten === 0) {
      GAMEBOARD[x][y].eaten = false;
    } else {
      GAMEBOARD[x][y].eaten = true;
    }
  }

  for (var i = 0; i < 26; i++) {
    for (var j = 0; j < 29; j++) {
      if (!GAMEBOARD[i][j].bubble && !GAMEBOARD[i][j].superBubble) {
        GAMEBOARD[i][j] = null;
      }
    }
  }

  for (var i = 0; i < 26; i++) {
    for (var j = 0; j < 29; j++) {
      if ((i === 0 && (j === 13)) ||
        (i === 1 && (j === 13)) ||
        (i === 2 && (j === 13)) ||
        (i === 3 && (j === 13)) ||
        (i === 4 && (j === 13)) ||
        (i === 6 && (j === 13)) ||
        (i === 7 && (j === 13)) ||
        (i === 8 && (j >= 10 && j <= 18)) ||
        (i === 9 && (j === 10 || j === 16)) ||
        (i === 10 && (j === 10 || j === 16)) ||
        (i === 11 && (((j >= 8) && (j <= 10)) || j === 16)) ||
        (i === 12 && (j === 10 || j === 16)) ||
        (i === 13 && (j === 10 || j === 16)) ||
        (i === 14 && (((j >= 8) && (j <= 10)) || j === 16)) ||
        (i === 15 && (j === 10 || j === 16)) ||
        (i === 16 && (j === 10 || j === 16)) ||
        (i === 17 && (j >= 10 && j <= 18)) ||
        (i === 18 && (j === 13)) ||
        (i === 19 && (j === 13)) ||
        (i === 21 && (j === 13)) ||
        (i === 22 && (j === 13)) ||
        (i === 23 && (j === 13)) ||
        (i === 24 && (j === 13)) ||
        (i === 25 && (j === 13))) {
        GAMEBOARD[i][j] = {
          bubble: false,
          superBubble: false,
          inky: false,
          pinky: false,
          blinky: false,
          clyde: false,
          pacman: false,
          eaten: false
        };
      }
    }
  }

  var p = getXY(GHOST_INKY_POSITION_X, GHOST_INKY_POSITION_Y);
  if (p.x >= 0 && p.x < 26 && GAMEBOARD[p.x][p.y]) GAMEBOARD[p.x][p.y].inky = true;
  p = getXY(GHOST_PINKY_POSITION_X, GHOST_PINKY_POSITION_Y);
  if (p.x >= 0 && p.x < 26 && GAMEBOARD[p.x][p.y]) GAMEBOARD[p.x][p.y].pinky = true;
  p = getXY(GHOST_BLINKY_POSITION_X, GHOST_BLINKY_POSITION_Y);
  if (p.x >= 0 && p.x < 26 && GAMEBOARD[p.x][p.y]) GAMEBOARD[p.x][p.y].blinky = true;
  p = getXY(GHOST_CLYDE_POSITION_X, GHOST_CLYDE_POSITION_Y);
  if (p.x >= 0 && p.x < 26 && GAMEBOARD[p.x][p.y]) GAMEBOARD[p.x][p.y].clyde = true;

  p = getXY(PACMAN_POSITION_X, PACMAN_POSITION_Y);
  if (p.x >= 0 && p.x < 26 && GAMEBOARD[p.x][p.y]) GAMEBOARD[p.x][p.y].pacman = true;

};

function drawRect(i, j) {
  var ctx = PACMAN_CANVAS_CONTEXT;
  var ygap = 17.75;
  var x = BUBBLES_X_START + i * BUBBLES_GAP - BUBBLES_GAP / 2;
  var y = BUBBLES_Y_START + j * ygap - 9;
  var w = BUBBLES_GAP;
  var h = ygap;

  if (GAMEBOARD && GAMEBOARD[0] && GAMEBOARD[i][j]) {
    ctx.strokeStyle = "green";
    ctx.rect(x, y, w, h);
    ctx.stroke();
  }
}

function drawDebug() {
  for (var i = 0; i < 26; i++) {
    for (var j = 0; j < 29; j++) {
      drawRect(i, j);
    }
  }
}

// Move four directions
var next_move = [[1,0,1],
[0,1,2],
[-1,0,3],
[0,-1,4]];

// A* implementation
var Node = function (parent, position, move) {
  this.parent = parent;
  this.position = position;
  this.move = move;
  this.f = 0;
  this.g = 0;
  this.h = 0;
}

/**
 * aStarSearch implementation
 * Mode : true -> escape mode
 *        false -> chase mode
 * @param {*} start 
 * @param {*} end 
 * @param {*} mode 
 */
function aStarSearch(start, end, mode) {
  var start_node = new Node(Node, [start[0],start[1]], 0);
  start_node.g, start_node.f, start_node.h = 0;
  var end_node = new Node(Node, [end[0],end[1]], 0);
  end_node.g, end_node.f, end_node.h = 0;

  var to_visit_list = [];
  var visited_list = [];

  to_visit_list.push(start_node);

  // Adding a stop condition. This is to avoid any infinite loop and stop execution after some reasonable number of steps
  var outer_iterations = 0
  var max_iterations = Math.floor(Math.floor(GAMEBOARD.length/2)*5);

  while (to_visit_list.length > 0) {
    outer_iterations += 1;
    var current_node = to_visit_list[0];
    var current_index = 0;

    for (const [index, item] of to_visit_list.entries()) {
      if (item.f < current_node.f) {
        current_node = item;
        current_index = index;
      }
    }
    
    // if we hit this point return the path such as it may be no solution or computation cost is too high
    if (outer_iterations > max_iterations) {
        console.log("giving up on pathfinding too many iterations");
        return movePath(current_node, 0)
    }

    to_visit_list.splice(current_index, 1);
    visited_list.push(current_node);
    
    if ((current_node.position[0] === end_node.position[0]) &&
    (current_node.position[1] === end_node.position[1])) {
      return movePath(current_node, 1)
    }

    var children = [];

    for (let move of next_move) {
        // Create new node
        var new_position = [current_node.position[0] + move[0],
                        current_node.position[1] + move[1]]
        var NEW_POSITION_X = new_position[0];
        var NEW_POSITION_Y = new_position[1];
        
        // Check if new_position is valid move in GAMEBOARD
        if (mode) {
          if (!isValidNewPosition(NEW_POSITION_X, NEW_POSITION_Y, true)) continue
        } else {
          if (!isValidNewPosition(NEW_POSITION_X, NEW_POSITION_Y, false)) continue
        }
        

        var new_node = new Node(current_node, new_position, move[2]);
        children.push(new_node);
    }

    for (let child of children) {
      var visited_child_filter = visited_list.filter(visited_child => ((visited_child.position[0] === child.position[0]) && 
                                                                        (visited_child.position[1] === child.position[1])));
      if (visited_child_filter.length > 0) continue
      
      child.g = current_node.g + 1;
      // child.h = (Math.pow((child.position[0] - end_node.position[0]), 2) + Math.pow((child.position[1] - end_node.position[1]), 2));
      child.h = Math.abs(child.position[0] - end_node.position[0]) + Math.abs(child.position[1] - end_node.position[1]);
      child.f = child.g + child.h;
      var child_filter = to_visit_list.filter(to_visit_child => ((to_visit_child.position[0] === child.position[0]) && 
                                                                  (to_visit_child.position[1] === child.position[1]) && 
                                                                  (child.g >= to_visit_child.g)));
      if (child_filter.length > 0) continue
      to_visit_list.push(child);

    }
    // console.log(' ');
  }
}

// Note: superBubble: [0,3],[25,3],[0,22],[25,22]
//        Cherry: [12,16][13,16]
// var check_point = [[25,22],[0,22],[0,3],[25,3]];
// var check_point = [[25,22],[14,7],[5,5],[8,13],[13,22],[20,22],[25,28],[0,28]];

// var check_point = [[25,28],[0,28]];
// var chase_ghosts = [];

var check_point_1 = [];
var check_point_2 = [];
var check_point_3 = [];
var check_point_4 = [];

function init() {
// Note: superBubble: [0,3],[25,3],[0,22],[25,22]
  for (var rows = 0; rows < 14; rows++) {
    for (var cols = 0; cols < 13; cols++) {
      if (GAMEBOARD[cols][rows] === null) continue
      if (GAMEBOARD[cols][rows].superBubble === true) continue
      if (GAMEBOARD[cols][rows].bubble === true && GAMEBOARD[cols][rows].eaten === false) {
        check_point_1.push([cols,rows]);
      }
    }
  }

  for (var rows = 0; rows < 14; rows++) {
    for (var cols = 13; cols < 26; cols++) {
      if (GAMEBOARD[cols][rows] === null) continue
      if (GAMEBOARD[cols][rows].superBubble === true) continue
      if (GAMEBOARD[cols][rows].bubble === true && GAMEBOARD[cols][rows].eaten === false) {
        check_point_2.push([cols,rows]);
      }
    }
  }

  for (var rows = 14; rows < 29; rows++) {
    for (var cols = 0; cols < 13; cols++) {
      if (GAMEBOARD[cols][rows] === null) continue
      if (GAMEBOARD[cols][rows].superBubble === true) continue
      if (GAMEBOARD[cols][rows].bubble === true && GAMEBOARD[cols][rows].eaten === false) {
        check_point_3.push([cols,rows]);
      }
    }
  }
  for (var rows = 14; rows < 29; rows++) {
    for (var cols = 13; cols < 26; cols++) {
      if (GAMEBOARD[cols][rows] === null) continue
      if (GAMEBOARD[cols][rows].superBubble === true) continue
      if (GAMEBOARD[cols][rows].bubble === true && GAMEBOARD[cols][rows].eaten === false) {
        check_point_4.push([cols,rows]);
      }
    }
  }
  if (GAMEBOARD[0][3].eaten === false) check_point_1.push([0,3])
  if (GAMEBOARD[25][3].eaten === false) check_point_2.push([25,3])
  if (GAMEBOARD[0][22].eaten === false) check_point_3.push([0,22])
  if (GAMEBOARD[25][22].eaten === false) check_point_4.push([25,22])
}

var check_point = [];
var one_time_loop = true;
function selectMove() {

  buildGameboard();
  // console.log(GAMEBOARD);
  if (!PACMAN_DEAD && !GAMEOVER) { // make sure the game is running
    var pm_position = getXY(PACMAN_POSITION_X, PACMAN_POSITION_Y); // [13][22]

    init();
    // // Eat important points
    // if (check_point.length > 0) {
    //     move_path = aStarSearch([pm_position.x,pm_position.y], check_point[check_point.length-1]);
    //   if (move_path.length < 1) {
    //     check_point.pop();
    //   }
    // }
    // if (one_time_loop === true) {
    //   for (var i = 0; i < 26; i++) {
    //     for (var j = 0; j < 28; j++) {
    //       if (GAMEBOARD[i][j] === null) continue
    //       if (GAMEBOARD[i][j].bubble === true && GAMEBOARD[i][j].eaten === false) {
    //         check_point.push([i,j]);
    //       }
    //     }
    //   }
    //   shuffle_array(check_point);
    //   one_time_loop = false;
    // }
    var move_path,status;
    if (check_point_4.length > 0) {
      if ((GHOST_BLINKY_STATE === 1)) {
        [move_path,status] = aStarSearch([pm_position.x,pm_position.y], check_point_4[check_point_4.length-1], false);
      } else {
        [move_path,status] = aStarSearch([pm_position.x,pm_position.y], check_point_4[check_point_4.length-1], true);
      }
      // if (status === 0) {
      //   check_point.unshift(check_point.pop())
      // }
      // else {
      //   if (move_path.length < 1) {
      //     check_point.pop();
      //   }        
      // } 
      movePacman(move_path.pop()); 
    } 
    
    else if (check_point_3.length > 0){
      if ((GHOST_BLINKY_STATE === 1)) {
        [move_path,status] = aStarSearch([pm_position.x,pm_position.y], check_point_3[check_point_3.length-1], false);
      } else {
        [move_path,status] = aStarSearch([pm_position.x,pm_position.y], check_point_3[check_point_3.length-1], true);
      }
      // if (status === 0) {
      //   check_point.unshift(check_point.pop())
      // }
      // else {
      //   if (move_path.length < 1) {
      //     check_point.pop();
      //   }        
      // }
      movePacman(move_path.pop()); 
    }

    else if (check_point_1.length > 0){
      if ((GHOST_BLINKY_STATE === 1)) {
        [move_path,status] = aStarSearch([pm_position.x,pm_position.y], check_point_1[check_point_1.length-1], false);
      } else {
        [move_path,status] = aStarSearch([pm_position.x,pm_position.y], check_point_1[check_point_1.length-1], true);
      }
      // if (status === 0) {
      //   check_point.unshift(check_point.pop())
      // }
      // else {
      //   if (move_path.length < 1) {
      //     check_point.pop();
      //   }        
      // }
      movePacman(move_path.pop()); 
    }

    else {
      if ((GHOST_BLINKY_STATE === 1)) {
        [move_path,status] = aStarSearch([pm_position.x,pm_position.y], check_point_2[check_point_2.length-1], false);
      } else {
        [move_path,status] = aStarSearch([pm_position.x,pm_position.y], check_point_2[check_point_2.length-1], true);
      }
      // if (status === 0) {
      //   check_point.unshift(check_point.pop())
      // }
      // else {
      //   if (move_path.length < 1) {
      //     check_point.pop();
      //   }        
      // }
      movePacman(move_path.pop()); 
    }

    check_point_1=[];
    check_point_2=[];
    check_point_3=[];
    check_point_4=[];

  }
};

/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */
function shuffle_array(a) {
  for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// setInterval(drawDebug, 1000/3);

/**
 * Helper method for aStarSearch
 * status: 1 -> found path
 *         0 -> not found path
 */
function movePath(current_node, status) {
  var path = [];
  var current = current_node;
  while (current != null) {
    path.push(current.move);
    current = current.parent;
  }
  path.pop();
  path.pop();
  return [path,status]

}

var safe_move = [[2,0,1],
[0,2,2],
[-2,0,3],
[0,-2,4]];
/**
 * 
 * @param {*} NEW_POSITION_X 
 * @param {*} NEW_POSITION_Y 
 * @param {Mode: true -> Escape mode       
 *               false -> Chase mode} mode 
 */
function isValidNewPosition(NEW_POSITION_X, NEW_POSITION_Y, mode) {
  if ((NEW_POSITION_X < 0 || NEW_POSITION_X > 25) ||
  (NEW_POSITION_Y < 0 || NEW_POSITION_Y > 28) ||
  (GAMEBOARD[NEW_POSITION_X][NEW_POSITION_Y] === null)) return false

  var safe_position = [];
  if (mode) {
     if ((GAMEBOARD[NEW_POSITION_X][NEW_POSITION_Y].blinky === true) ||
        (GAMEBOARD[NEW_POSITION_X][NEW_POSITION_Y].pinky === true) ||
        (GAMEBOARD[NEW_POSITION_X][NEW_POSITION_Y].inky === true) ||
        (GAMEBOARD[NEW_POSITION_X][NEW_POSITION_Y].clyde === true)) return false      
      // for (let move of safe_move) {
      //   var NEW_POSITION_X = NEW_POSITION_X + move[0];
      //   var NEW_POSITION_Y = NEW_POSITION_Y + move[1]; 
      //   if ((NEW_POSITION_X < 0 || NEW_POSITION_X > 25) ||
      //   (NEW_POSITION_Y < 0 || NEW_POSITION_Y > 28) ||
      //   (GAMEBOARD[NEW_POSITION_X][NEW_POSITION_Y] === null)) continue
      //   if ((GAMEBOARD[NEW_POSITION_X][NEW_POSITION_Y].blinky === true) ||
      //   (GAMEBOARD[NEW_POSITION_X][NEW_POSITION_Y].pinky === true) ||
      //   (GAMEBOARD[NEW_POSITION_X][NEW_POSITION_Y].inky === true) ||
      //   (GAMEBOARD[NEW_POSITION_X][NEW_POSITION_Y].clyde === true)) continue
      //   safe_position.push(move);
      // }
      // if (safe_position.length < 1) return false

  }


  // if ((NEW_POSITION_X === 0 && (NEW_POSITION_Y === 13)) ||
  // (NEW_POSITION_X === 1 && (NEW_POSITION_Y === 13)) ||
  // (NEW_POSITION_X === 2 && (NEW_POSITION_Y === 13)) ||
  // (NEW_POSITION_X === 3 && (NEW_POSITION_Y === 13)) ||
  // (NEW_POSITION_X === 4 && (NEW_POSITION_Y === 13)) ||
  // (NEW_POSITION_X === 6 && (NEW_POSITION_Y === 13)) ||
  // (NEW_POSITION_X === 7 && (NEW_POSITION_Y === 13)) ||
  // (NEW_POSITION_X === 8 && (NEW_POSITION_Y >= 10 && NEW_POSITION_Y <= 18)) ||
  // (NEW_POSITION_X === 9 && (NEW_POSITION_Y === 10 || NEW_POSITION_Y === 16)) ||
  // (NEW_POSITION_X === 10 && (NEW_POSITION_Y === 10 || NEW_POSITION_Y === 16)) ||
  // (NEW_POSITION_X === 11 && (((NEW_POSITION_Y >= 8) && (NEW_POSITION_Y <= 10)) || NEW_POSITION_Y === 16)) ||
  // (NEW_POSITION_X === 12 && (NEW_POSITION_Y === 10 || NEW_POSITION_Y === 16)) ||
  // (NEW_POSITION_X === 13 && (NEW_POSITION_Y === 10 || NEW_POSITION_Y === 16)) ||
  // (NEW_POSITION_X === 14 && (((NEW_POSITION_Y >= 8) && (NEW_POSITION_Y <= 10)) || NEW_POSITION_Y === 16)) ||
  // (NEW_POSITION_X === 15 && (NEW_POSITION_Y === 10 || NEW_POSITION_Y === 16)) ||
  // (NEW_POSITION_X === 16 && (NEW_POSITION_Y === 10 || NEW_POSITION_Y === 16)) ||
  // (NEW_POSITION_X === 17 && (NEW_POSITION_Y >= 10 && NEW_POSITION_Y <= 18)) ||
  // (NEW_POSITION_X === 18 && (NEW_POSITION_Y === 13)) ||
  // (NEW_POSITION_X === 19 && (NEW_POSITION_Y === 13)) ||
  // (NEW_POSITION_X === 21 && (NEW_POSITION_Y === 13)) ||
  // (NEW_POSITION_X === 22 && (NEW_POSITION_Y === 13)) ||
  // (NEW_POSITION_X === 23 && (NEW_POSITION_Y === 13)) ||
  // (NEW_POSITION_X === 24 && (NEW_POSITION_Y === 13)) ||
  // (NEW_POSITION_X === 25 && (NEW_POSITION_Y === 13))) return false

  return true
}
