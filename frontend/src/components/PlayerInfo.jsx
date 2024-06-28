import { UserOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";

const PlayerInfo = ({
  currentTurn,
  userId,
  xorO,
  gameInfo,
  collapsed,
  isOpponentOnline,
}) => {
  const { user1, user2 } = gameInfo;
  // Add prop validation
  PlayerInfo.propTypes = {
    currentTurn: PropTypes.string.isRequired,
    userId: PropTypes.string.isRequired,
    xorO: PropTypes.string.isRequired,
    gameInfo: PropTypes.object.isRequired,
    collapsed: PropTypes.bool.isRequired,
    isOpponentOnline: PropTypes.bool.isRequired,
  };
  return (
    <>
      <div className="flex justify-between items-center">
        {/* Player 1 */}
        <div className="flex items-center gap-2">
          <div
            className={`
            h-12
            w-1
            ${
              currentTurn === userId
                ? xorO === "X"
                  ? "bg-red-500"
                  : "bg-blue-500"
                : ""
            }
            rounded-md
            `}
          />
          {!collapsed && (
            <>
              <UserOutlined className="text-white text-2xl " />
              <span
                className={`${
                  user1["online"] ? "bg-green-500" : "bg-red-500"
                } h-2 w-2 rounded-full inline-block ml-2`}
              />
              <h4 className="text-white text-lg">You</h4>
            </>
          )}
        </div>
        <h4
          className={` t mr-2 text-2xl
         ${xorO === "X" ? "text-red-500" : "text-blue-500"}
        `}
        >
          {xorO}
        </h4>
      </div>

      {/* Player 2 */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div
            className={`
            h-12
            w-1
            ${
              currentTurn !== userId
                ? xorO === "X"
                  ? "bg-blue-500"
                  : "bg-red-500"
                : ""
            }
            rounded-md
            `}
          />
          {!collapsed && (
            <>
              <UserOutlined className="text-white text-2xl " />
              <span
                className={`${
                  isOpponentOnline ? "bg-green-500" : "bg-red-500"
                } h-2 w-2 rounded-full inline-block ml-2`}
              />
              <h4 className="text-white text-lg">{
                currentTurn === userId ? user2["username"] : user1["username"]
              }</h4>
            </>
          )}
        </div>
        <h4
          className={`text-2xl mr-2
          ${xorO === "X" ? "text-blue-500" : "text-red-500"}
        `}
        >
          {xorO === "X" ? "O" : "X"}
        </h4>
      </div>

      {!collapsed && (
        <p className="text-white text-lg text-center">
          {currentTurn === userId ? "Your turn" : "Waiting for your turn"}
        </p>
      )}
    </>
  );
};

export default PlayerInfo;
