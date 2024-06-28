import { useEffect, useState, useContext, useRef } from "react";
import { AuthContext } from "../context/authContext";
import socketIOClient from "socket.io-client";
import { Button, Flex, Spin, Layout, Modal } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
const { Sider, Content } = Layout;
const { confirm } = Modal;
import GameBoard from "../components/GameBoard";
import PlayerInfo from "../components/PlayerInfo";
import GameHeader from "../components/GameHeader";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

function Home() {
  const { currentUser } = useContext(AuthContext);
  const [userId, setUserId] = useState(null);
  const [socket, setSocket] = useState(null);
  const [currentTurn, setCurrentTurn] = useState(null);
  const [gameBoard, setGameBoard] = useState(Array(9).fill(null));
  const [gameEnded, setGameEnded] = useState(false);
  const [gameInfo, setGameInfo] = useState(null);
  const [xorO, setXorO] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isOpponentOnline, setIsOpponentOnline] = useState(false);

  const [timer, setTimer] = useState(10);
  const [percent, setPercent] = useState(100);
  const [realTime, setRealTime] = useState(10);
  const intervalRef = useRef(null);
  const [rematchRequested, setRematchRequested] = useState(false);

  const handleResetTimeOut = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    const userId = currentUser.id.toString();
    setUserId(userId);

    const socket = socketIOClient("http://localhost:4000", {
      query: { userId: userId },
    });
    setSocket(socket);

    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("reconnect", () => {
      console.log("Reconnected to server");
      setLoading(true);
      socket.emit("StartGame", userId);
    });

    socket.on("OpponentDisconnected", () => {
      setIsOpponentOnline(false);
    });

    socket.on("timerUpdate", (remainingTime) => {
      setTimer(remainingTime);
      setPercent((remainingTime / realTime) * 100);
    });

    socket.on("TurnChange", (turnUserId, updatedTimer, realTime) => {
      setCurrentTurn(turnUserId);
      setTimer(updatedTimer);
      setRealTime(realTime);
      setPercent((updatedTimer / realTime) * 100);
    });

    socket.on("GameState", (board) => {
      setGameBoard(board);
    });

    socket.on("GameEnded", (isWinner, message, roomNo) => {
      setGameEnded(true);
      handleResetTimeOut();
      showConfirm(isWinner, message, roomNo, socket, userId)
    });

    socket.on("GameInfo", (GameInfo) => {
      setIsOpponentOnline(true);
      const info = JSON.parse(GameInfo);
      setGameInfo(info);
      const { user1, user2 } = info;
      if (userId != null) {
        if (user1["userId"] == userId) {
          setXorO(user1["symbol"]);
        } else {
          setXorO(user2["symbol"]);
        }
      }
    });

    socket.on("GameStarted", () => {
      setLoading(false);
      setGameStarted(true);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    socket.on("timerEnd", () => {
      handleLeaveMatch();
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUser.id]);

  const handleCellClick = (index) => {
    if (currentTurn == userId && gameBoard[index] == null) {
      console.log(gameInfo["room"],index,userId)
      socket.emit("MakeMove", gameInfo["room"], index, userId);
    }
  };

  const handleGameStart = () => {
    if (socket) {
      setLoading(true);
      socket.emit("StartGame", userId);
    }
  };

  const handleLeaveMatch = () => {
    if (socket && gameInfo && gameInfo.room) {
      socket.emit("LeaveMatch", gameInfo["room"], userId);
      return;
    }
    if (socket) {
      socket.emit("LeaveMatch", null, userId);
    }
  };

  const showConfirm = (isWinner, gameMessage, roomNo, socket, userId) => {
    Modal.confirm({
      title: gameMessage,
      icon: isWinner ? <CheckCircleOutlined style={{ color: 'green' }} /> : <CloseCircleOutlined style={{ color: 'red' }} />,
      content: 'Would you like to play with your opponent again?',
      onOk() {
        socket.emit('RequestRematch', roomNo, userId); 
        handleResetGame();
      },
      onCancel() {
        handleResetGame(); 
      },
      okText: 'Rematch',
      cancelText: 'No',
      okButtonProps: { type: 'primary', danger: true },
      cancelButtonProps: { type: 'default' },
    });
  };
  

  const handleResetGame = () => {
    handleResetTimeOut();
    setGameInfo(null);
    setGameStarted(false);
    setCurrentTurn("");
    setGameBoard(Array(9).fill(null));
    setGameEnded(false);
    setRematchRequested(false);
  };

  useEffect(() => {
    if (rematchRequested) {
      handleGameStart();
    }
  }, [rematchRequested]);
console.log(timer)
  return (
    <div className="h-[80vh] flex flex-col justify-center">
      <Flex align="center" justify="center" vertical={true}>
        {!gameStarted && (
          <Button onClick={handleGameStart} loading={loading}>
            {loading ? "Searching for player" : "Play Game"}
          </Button>
        )}
        {loading && (
          <div>
            <Spin className="flex justify-center items-center h-full" />
            <Button
              danger
              onClick={() => {
                handleLeaveMatch();
                setLoading(false);
              }}
              className="mt-4"
            >
              Cancel
            </Button>
          </div>
        )}
      </Flex>

      {gameStarted && (
        <Layout
          style={{
            marginTop: "30px",
          }}
        >
          <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            width={175}
            collapsedWidth={75}
            className="rounded-tr-lg rounded-br-lg"
          >
            <h2 className="text-center text-white">{gameInfo["room"]}</h2>

            <PlayerInfo
              currentTurn={currentTurn}
              userId={userId}
              xorO={xorO}
              gameInfo={gameInfo}
              collapsed={collapsed}
              isOpponentOnline={isOpponentOnline}
            />

            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-14 bg-slate-50 rounded-md flex justify-center">
              <Button
                type="text"
                className="w-14"
                icon={collapsed ? <RightOutlined /> : <LeftOutlined />}
                onClick={() => setCollapsed(!collapsed)}
              />
            </div>
          </Sider>
          <Layout>
            <div className="bg-white rounded-tr-lg rounded-br-lg p-0">
              <GameHeader
                handleLeaveMatch={handleLeaveMatch}
                gameEnded={gameEnded}
                timer={currentTurn == userId ? timer : realTime} 
                percent={currentTurn == userId ? percent : 100}
              />
            </div>
            <Content className="p-6 bg-white rounded-tl-lg rounded-bl-lg m-4">
              <GameBoard
                gameBoard={gameBoard}
                handleCellClick={handleCellClick}
              />
            </Content>
          </Layout>
        </Layout>
      )}
    </div>
  );
}

export default Home;
