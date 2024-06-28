import express from "express";
import { Server } from "socket.io";
import http from "http";
import colors from "colors";
import db from "./db.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

let realTime = 3
let timeInSecond = realTime ;
let timers = {};
const startTimes = {}; // to store start times

let users = {};
let rooms = {};
let usersInGame = [];
let roomTurns = {};
let gameBoards = {};
let rematchRequests = {};
let leave = {};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  // reconnect user if they are already in game
  if (usersInGame.includes(userId)) {
    socket.emit("reconnect");
  }

  // if user start the game
  socket.on("StartGame", (userId) => handleStartGame(userId, socket));

  // if user make a move
  socket.on("MakeMove", (roomNo, index, userId) =>
    handleMakeMove(roomNo, index, userId)
  );

  // if user leave the match
  socket.on("LeaveMatch", (roomNo, userId) => handleLeaveMatch(roomNo, userId));

  socket.on("RequestRematch", (roomNo, userId) => handleRematchRequest(roomNo, userId, socket));

  socket.emit("leave",( isLeave, roomNo) => {
    leave[roomNo] = isLeave;
  });

  // if user disconnect
  socket.on("disconnect", () => handleDisconnect(userId));
  
});

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0,
          v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function handleRematchRequest(roomNo, userId, socket) {
  try {
    const room = await db('recordGame').where({ roomNo }).first();

    if (!room) {
      console.error(`Room ${roomNo} does not exist`);
      return;
    }
 
    // Check if the requesting user is in the room
    const isPlayer = room.player1_id == userId ? true : room.player2_id == userId ? true : false;

    if (!isPlayer ) {
      console.error(`User ${userId} is not part of room ${roomNo}`);
      return;
    }

    // Initialize rooms[roomNo] if it doesn't exist
    if (!rooms[roomNo]) {
      rooms[roomNo] = {};
    }

    // Initialize or get the rematch requests array for the room
    if (!rooms[roomNo].rematchRequests) {
      rooms[roomNo].rematchRequests = [];
    }

    // Add the requesting user to the rematch requests
    rooms[roomNo].rematchRequests.push(userId);
    const assignedRoom = `room-${Object.keys(rooms).length + 1 + generateUUID()} `;
    const player1 = room.player1_id;
    if (rooms[roomNo].rematchRequests.length === 1) {
      users[player1].room = assignedRoom;
      console.log(users[player1].room+"hjeloo")
      socket.join(assignedRoom);

    }

    // Check if both players have requested a rematch
    if (rooms[roomNo].rematchRequests.length === 2) {
      console.log(users[player1].room+"hjeloo")
      const player2 = room.player2_id;


      //create new room
    console.log("pass 6".bgMagenta);
    
    let newRoom = {
      room: users[player1].room,
      roomFull: true,
      roomActive: true,
      user1Id: player1,
      user2Id: player2,
      user1Online: true,
      user2Online: true,
    };
    if (!gameBoards[users[player1].room]) {
      gameBoards[users[player1].room] = Array(9).fill(null);
    }
    rooms[users[player1].room] = newRoom;
    roomTurns[users[player1].room] = player1;
    usersInGame.push(player1);
    usersInGame.push(player2);

  console.log("pass 7".bgMagenta);

  // console.log(`User ${userId} assigned to room ${assignedRoom}`.bgCyan);
  users[player2].room = users[player1].room;

  // console.log(assignedRoom)
  socket.join(users[player1].room);



  if (rooms[users[player1].room].roomFull) {

        let info = {
          room: users[player1].room,
          user1: {
            userId: player1,
            symbol: "X",
            username: "username1",
            online: true,
          },
          user2: {
            userId: player2,
            symbol: "O",
            username: "username2",
            online: true,
          },
        };
        const jsonInfo = JSON.stringify(info);
        io.to(users[player1].room).emit("GameInfo", jsonInfo);
        
          io.to(users[player1].room).emit(
            "TurnChange",
            roomTurns[users[player2].room],
            getElapsedTime(users[player2].room),
            realTime
          );

          startTimer(users[player1].room, player1);
        
        io.to(users[player1].room).emit("GameState", gameBoards[users[player1].room]);

        io.to(users[player1].room).emit("GameStarted");

  }

      rooms[roomNo].rematchRequests = [];
    }

  } catch (error) {
    console.error(`Error handling rematch request for room ${roomNo}:`, error);
  }
}

function resetGameForRematch(roomNo) {
  // Reset game boards and turn information for the rematch
  gameBoards[roomNo] = Array(9).fill(null);
  roomTurns[roomNo] = rooms[roomNo].user1_id; // Assuming user1_id is the starting turn
  delete rooms[roomNo].rematchRequests;

  // Notify clients about the rematch start
  io.to(roomNo).emit("RematchStart", gameBoards[roomNo], roomTurns[roomNo]);

  // Optionally, start the timer for the first turn of the rematch
  startTimer(roomNo, roomTurns[roomNo]);
}


function handleRematch(roomNo,userId){
console.log(roomNo, userId)
    }
    

function handleStartGame(userId, socket) {
  if (users[userId]) {
    users[userId].socketId = socket.id;
    if (users[userId].room ) {
      console.log("User already exists".bgGreen);
      const roomNo = users[userId].room;
      socket.join(roomNo);
      socket.emit("ServerRoom", roomNo);
      io.to(roomNo).emit("TurnChange", roomTurns[roomNo], timeInSecond, realTime );
      socket.emit("GameState", gameBoards[roomNo]);
      
    }
  } else {
    users[userId] = { socketId: socket.id, room: null };
    assignRoom(userId, socket);
  }
}



async function handleMakeMove(roomNo, index, userId) {
  const currentTurn = roomTurns[roomNo];
  if (currentTurn == userId) {
    console.log(currentTurn, userId)
    const board = gameBoards[roomNo];
    if (board[index] == null) {
      board[index] = currentTurn == rooms[roomNo].user1Id ? "X" : "O";
      io.to(roomNo).emit("GameState", board);

      if (checkWin(board)) {
        const winner = currentTurn;
        const loser =
          winner == rooms[roomNo].user1Id
            ? rooms[roomNo].user2Id
            : rooms[roomNo].user1Id;

        const loserSocketId = users[loser]?.socketId;
        const winnerSocketId = users[winner]?.socketId;
        
        await insertGameRecord(
          rooms[roomNo].user1Id,
          rooms[roomNo].user2Id,
          winner,
          "win",
          roomNo
        ).then(() => {
          if (leave) {
            resetGame(roomNo);
          }
        }); 

        if (loserSocketId) {
          io.to(loserSocketId).emit("GameEnded", false, "You lose the game!", roomNo);
        }

        if (winnerSocketId) {
          io.to(winnerSocketId).emit("GameEnded", true, "You win the game!", roomNo);
        }

      } else if (board.every((cell) => cell !== null)) {
        io.to(roomNo).emit("GameEnded", true, "It's a draw!");
        insertGameRecord(
          rooms[roomNo].user1Id,
          rooms[roomNo].user2Id,
          null,
          "draw"
        ).then(() => {
          if (leave) {
            resetGame(roomNo);
          }
        });
      } else {
        const nextTurn =
          rooms[roomNo].user1Id == userId
            ? rooms[roomNo].user2Id
            : rooms[roomNo].user1Id;
        roomTurns[roomNo] = nextTurn;
        io.to(roomNo).emit("TurnChange", nextTurn, timeInSecond, realTime);
        startTimer(roomNo, nextTurn); // Reset timer for the next turn
        // io.to(roomNo).emit("timerUpdate", 25,nextTurn); // Reset timer for the next turn
      }
    } else {
      console.log("Cell already filled".bgRed);
    }
  } else {
    console.log(`Not your turn, User ${userId}. Current turn: ${currentTurn}`);
  }
}


// Function to handle user leave match
function handleLeaveMatch(roomNo, userId) {
  console.log("leave match".bgYellow);
  clearTimeout(timers[roomNo]); // Clear the timer when a user leaves the match

  //if user leave the game before it start
  const room = users[userId]?.room;
  if (room && rooms[room] && !rooms[room].roomFull && !rooms[room].roomActive) {
    console.log("You cancel the game".bgYellow);
    resetGame(room);
    return;
  }

  if (rooms[roomNo] && rooms[roomNo].roomFull) {
    const looser = userId;
    const winner =
      looser === rooms[roomNo].user1Id
        ? rooms[roomNo].user2Id
        : rooms[roomNo].user1Id;

    const looserSocketId = users[looser]?.socketId;
    const winnerSocketId = users[winner]?.socketId;

    if (looserSocketId) {
      io.to(looserSocketId).emit(
        "GameEnded",
        false,
        "You leave the game! You loose!"
      );
    }
    if (winnerSocketId) {
      io.to(winnerSocketId).emit(
        "GameEnded",
        true,
        "Opponent leave the game! You win!"
      );
    }
    insertGameRecord(
      rooms[roomNo].user1Id,
      rooms[roomNo].user2Id,
      winner,
      "win"
    ).then(() => {
      resetGame(roomNo);
    });
  }
}

// Function to handle user disconnect
function handleDisconnect(userId) {
  if (userId && users[userId]) {
    let room = users[userId].room;
    if (room && rooms[room]) {
      if (rooms[room].user1Id == userId) {
        rooms[room].user1Online = false;
        const opponentSocketId = users[rooms[room].user2Id]?.socketId;
        if (opponentSocketId) {
          io.to(users[rooms[room].user2Id].socketId).emit(
            "OpponentDisconnected"
          );
        }
      }
      if (rooms[room].user2Id == userId) {
        rooms[room].user2Online = false;
        const opponentSocketId = users[rooms[room].user1Id]?.socketId;
        if (opponentSocketId) {
          io.to(users[rooms[room].user1Id].socketId).emit(
            "OpponentDisconnected"
          );
        }
      }
      rooms[room].roomActive = false;
    }
    delete users[userId];
    if (!rooms[room]?.user1Online && !rooms[room]?.user2Online) {
      console.log("Both players are left the game!".bgRed);
      io.to(room).emit("GameEnded", "Both players are left the game!");

      resetGame(room);
    }
  }

  console.log(`User disconnected from users: ${userId}`.red);
}

function assignRoom(userId, socket) {
  let isReconnectedUser = false;
  let assignedRoom = null;

  //it user assigned to already created room
  console.log("pass 3".bgMagenta);
  for (let room in rooms) {
    console.log("pass 4".bgMagenta);

    if (!rooms[room].roomFull && rooms[room].user1Id != userId) {
      console.log("pass 4.1".bgMagenta);
      assignedRoom = room;
      rooms[room].user2Id = userId;
      rooms[room].roomFull = true;
      rooms[room].roomActive = true;
      rooms[room].user2Online = true;
      usersInGame.push(userId);
      break;
    }

    //handle user reconnection to the same room
    //if just one user is online and still room is not full
    //and user want to reconnect to the same room

    if (rooms[room].user1Id == userId && !rooms[room].roomFull) {
      console.log("pass 4.1.1".bgMagenta);
      assignedRoom = room;
      rooms[room].user1Online = true;
      rooms[room].roomActive = false;
      isReconnectedUser = true;
      break;
    }
    //! Extra not needed, just added for extra check
    if (rooms[room].user2Id == userId && !rooms[room].roomFull) {
      console.log("pass 4.1.2".bgMagenta);
      assignedRoom = room;
      rooms[room].user2Online = true;
      rooms[room].roomActive = false;
      isReconnectedUser = true;
      break;
    }

    //handle user reconnection to the same room
    //if room is full and user want to reconnect to the same room
    if (rooms[room].roomFull && !rooms[room].roomActive) {
      console.log("pass 4.2".bgMagenta);

      if (
        rooms[room].user1Online &&
        !rooms[room].user2Online &&
        rooms[room].user2Id == userId
      ) {
        console.log("pass 4.2.1".bgMagenta);
        assignedRoom = room;
        rooms[room].user2Id = userId;
        rooms[room].user2Online = true;
        rooms[room].roomActive = true;
        isReconnectedUser = true;
        break;
      }

      if (
        rooms[room].user2Online &&
        !rooms[room].user1Online &&
        rooms[room].user1Id == userId
      ) {
        console.log("pass 4.2.2".bgMagenta);
        assignedRoom = room;
        rooms[room].user1Id = userId;
        rooms[room].user1Online = true;
        rooms[room].roomActive = true;
        isReconnectedUser = true;
        break;
      }

      //if both users are offline and room is not active
      //try to reconnect to the same room
      if (!rooms[room].user1Online && !rooms[room].user2Online) {
        console.log("pass 4.3".bgMagenta);

        if (rooms[room].user1Id == userId) {
          console.log("pass 4.3.1".bgMagenta);
          assignedRoom = room;
          rooms[room].user1Id = userId;
          rooms[room].user1Online = true;
          rooms[room].roomActive = false;
          isReconnectedUser = true;
          break;
        }

        if (rooms[room].user2Id == userId) {
          console.log("pass 4.3.2".bgMagenta);
          assignedRoom = room;
          rooms[room].user2Id = userId;
          rooms[room].user2Online = true;
          rooms[room].roomActive = false;
          isReconnectedUser = true;
          break;
        }
      }
    }
  }
  console.log("pass 5".bgMagenta);

  //create new room
  if (!assignedRoom) {
    console.log("pass 6".bgMagenta);
    assignedRoom = `room-${Object.keys(rooms).length + 1 + generateUUID()}`;
    let newRoom = {
      room: assignedRoom,
      roomFull: false,
      roomActive: false,
      user1Id: userId,
      user2Id: null,
      user1Online: true,
      user2Online: false,
    };
    if (!gameBoards[assignedRoom]) {
      gameBoards[assignedRoom] = Array(9).fill(null);
    }
    rooms[assignedRoom] = newRoom;
    roomTurns[assignedRoom] = userId;
    usersInGame.push(userId);
  }
  console.log("pass 7".bgMagenta);

  console.log(`User ${userId} assigned to room ${assignedRoom}`.bgCyan);

  users[userId].room = assignedRoom;
  socket.join(users[userId].room);

  if (rooms[assignedRoom].roomFull) {
    createInfoUser(assignedRoom, rooms)
      .then((info) => {
        //turn info object to json
        const jsonInfo = JSON.stringify(info);
        io.to(assignedRoom).emit("GameInfo", jsonInfo);

        if (isReconnectedUser) {
          io.to(assignedRoom).emit(
            "TurnChange",
            roomTurns[assignedRoom],
            getElapsedTime(assignedRoom),
            realTime
          );
        } else {
          io.to(assignedRoom).emit(
            "TurnChange",
            roomTurns[assignedRoom],
            timeInSecond,
            realTime
          );

          startTimer(assignedRoom, roomTurns[assignedRoom]); // Start timer for the first turn
        }
        io.to(assignedRoom).emit("GameState", gameBoards[users[userId].room]);

        io.to(assignedRoom).emit("GameStarted");
      })
      .catch((error) => {
        console.error(error);
      });
  }

  console.log("pass 8".bgMagenta);

  // -----------------------------------------
}

async function createInfoUser(assignedRoom, rooms) {
  if (rooms[assignedRoom].user1Id && rooms[assignedRoom].user2Id) {
    try {
      const username1 = await getUserInfo(rooms[assignedRoom].user1Id);
      const username2 = await getUserInfo(rooms[assignedRoom].user2Id);

    let info = {
      room: assignedRoom,
      user1: {
        userId: rooms[assignedRoom].user1Id,
        symbol: "X",
        username: username1,
        online: rooms[assignedRoom].user1Online,
      },
      user2: {
        userId: rooms[assignedRoom].user2Id,
        symbol: "O",
        username: username2,
        online: rooms[assignedRoom].user2Online,
      },
    };
    return info;
  } catch (error) {
    console.log(error);
  }
  } else {
    throw new Error("Both users must be assigned to the room.");
  }
}

async function getUserInfo(userId) {
  let username = await db("users")
    .where({ id: userId })
    .select("username")
    .first();
  return username["username"];
}



function checkWin(board) {
  const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  return winPatterns.some(
    (pattern) =>
      board[pattern[0]] &&
      board[pattern[0]] === board[pattern[1]] &&
      board[pattern[0]] === board[pattern[2]]
  );
}

function resetGame(roomNo) {
  // io.to(roomNo).emit("GameState", gameBoards[roomNo]);
  const user1 = rooms[roomNo]?.user1Id;
  const user2 = rooms[roomNo]?.user2Id;
  gameBoards[roomNo] = Array(9).fill(null);

  //remove room from rooms
  delete rooms[roomNo];
  //remove room from roomTurns
  delete roomTurns[roomNo];
  //remove  room from socket rooms
  io.socketsLeave(roomNo);
  //remove user from users
  // if (users[user1]) {
  //   delete users[user1];
  // }
  // if (users[user2]) {
  //   delete users[user2];
  // }

  //delete timer
  if (timers[roomNo]) {
    clearTimeout(timers[roomNo]);
    delete timers[roomNo];
    delete startTimes[roomNo];
  }

  //remove users from usersInGame
  const elementsToRemove = new Set([user1, user2]);
  for (let i = usersInGame.length - 1; i >= 0; i--) {
    if (elementsToRemove.has(usersInGame[i])) {
      usersInGame.splice(i, 1);
    }
  }
}

async function insertGameRecord(user1Id, user2Id, winnerId, gameResult, roomNo) {
  try {
    console.log(roomNo)
    const result = await db("recordGame").insert({
      roomNo:roomNo, // new column
      player1_id: user1Id, // ID of User 1
      player2_id: user2Id, // ID of User 2
      result: gameResult, // Result of the game
      winner_id: winnerId // ID of the winner (User 1)
    });
    console.log(result)
  } catch (error) {
    console.error("Error inserting game record:", error);
  }
}


function startTimer(roomNo, userId) {
  if (timers[roomNo]) {
    clearInterval(timers[roomNo]);
  }

  startTimes[roomNo] = Date.now();
  timers[roomNo] = setInterval(() => {
    handleTimerTick(roomNo, userId);
  }, 1000); // Update every second
}

function handleTimerTick(roomNo, userId) {
  const elapsedTime = (Date.now() - startTimes[roomNo]) / 1000; // in seconds
  const remainingTime = timeInSecond - elapsedTime;

  if (remainingTime <= 0) {
    handleTimerExpire(roomNo, userId);
    return;
  }
  
  io.to(roomNo).emit("timerUpdate", remainingTime); // Send remaining time to clients
}


function handleTimerExpire(roomNo, userId) {
  const currentTurn = roomTurns[roomNo];
  const board = gameBoards[roomNo];
  const nextTurn = rooms[roomNo].user1Id === userId ? rooms[roomNo].user2Id : rooms[roomNo].user1Id;

  // Automatically fill one unfilled index with the current user's symbol
  let symbol = currentTurn === rooms[roomNo].user1Id ? "X" : "O";
  let filled = false;
  while (!filled) {
      const rand = Math.floor(Math.random() * board.length);
      for (let i = 0; i < board.length; i++) {
          if (board[rand] === null) {
              board[rand] = symbol;
              filled = true;
              break;
          }
      }
  }
  
  
  if (filled) {
    io.to(roomNo).emit("GameState", board);

    if (checkWin(board)) {
      const winner = userId;
    const loser = winner === rooms[roomNo].user1Id ? rooms[roomNo].user2Id : rooms[roomNo].user1Id;

      const loserSocketId = users[loser]?.socketId;
      const winnerSocketId = users[winner]?.socketId;

      if (loserSocketId) {
        io.to(loserSocketId).emit("GameEnded", false, "Time's up! You lose!");
      }

      if (winnerSocketId) {
        io.to(winnerSocketId).emit("GameEnded", true, "Opponent's time ran out! You win!");
      }

      insertGameRecord(
        rooms[roomNo].user1Id,
        rooms[roomNo].user2Id,
        winner,
        "win",
        roomNo
      ).then(() => {
        resetGame(roomNo);
      });
    } else if (board.every((cell) => cell !== null)) {
      io.to(roomNo).emit("GameEnded", true, "It's a draw!");
      insertGameRecord(
        rooms[roomNo].user1Id,
        rooms[roomNo].user2Id,
        null,
        "draw"
      ).then(() => {
        resetGame(roomNo);
      });
    } else {
      // Change turn to the next user and start their timer
      roomTurns[roomNo] = nextTurn;
      io.to(roomNo).emit("TurnChange", nextTurn, timeInSecond, realTime);
      startTimer(roomNo, nextTurn); // Start timer for the next turn
    }
  } else {
    console.error("No unfilled cells found to fill.");
  }
}


function getElapsedTime(roomNo) {
  if (startTimes[roomNo]) {
    const elapsedTime = (Date.now() - startTimes[roomNo]) / 1000; // in seconds
    return (timeInSecond - elapsedTime).toFixed(0);
  }
  return null;
}

console.log(timeInSecond)
export { io, server, app };

