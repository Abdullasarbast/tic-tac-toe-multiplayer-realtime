// src/components/GameBoard.js
import PropTypes from "prop-types";

const GameBoard = ({ gameBoard, handleCellClick }) => {
  const renderCell = (index) => {
    return (
      <div
        className="bg-white border-none rounded-[10%] shadow-[0_0_8px_#bcb8b8] w-20 h-20 text-center text-6xl	 font-fredoka font-bold  m-2 flex justify-center items-center"
        onClick={() => handleCellClick(index)}
        key={index}
      >
        <span className={gameBoard[index] === "X" ? " text-red-500" : " text-blue-500"}>
          {gameBoard[index]}
        </span>
      </div>
    );
  };

  return (
    <div 
    className="grid place-items-center justify-center" style={{ gridTemplateColumns: 'repeat(3, 6rem)' }}
    >
      {gameBoard.map((_, index) => renderCell(index))}
    </div>
  );
};

GameBoard.propTypes = {
  gameBoard: PropTypes.array.isRequired,
  handleCellClick: PropTypes.func.isRequired,
};

export default GameBoard;
