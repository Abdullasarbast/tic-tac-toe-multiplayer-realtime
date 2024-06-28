import { Button, Card, Modal } from "antd";
import PropTypes from "prop-types";
import { useState } from "react";

const GameHeader = ({ handleLeaveMatch, timer, percent, gameEnded }) => {
  GameHeader.propTypes = {
    handleLeaveMatch: PropTypes.func.isRequired,
    timer: PropTypes.number.isRequired,
    percent: PropTypes.number.isRequired,
    gameEnded: PropTypes.bool.isRequired,
  };
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleLeave = () => {
    console.log("Leave button clicked");
    handleLeaveMatch();
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    console.log("Cancel button clicked");
    setIsModalVisible(false);
  };

  return (
    <div className="w-full rounded-tr-lg rounded-br-lg shadow-md">
      <div className="flex justify-between items-center mb-2 ">
        <Card className="h-16 flex justify-center items-center w-32 ml-2 ">
          <p>
            {timer > 0 ? `${Math.ceil(timer)} seconds remaining` : "Time ended"}
          </p>
        </Card>
        {!gameEnded ? (
          <Button
            type="primary"
            danger
            onClick={showModal}
            className="h-16 w-32 text-lg"
          >
            Leave Match
          </Button>
        ) : (
          <Button
            type="primary"
            danger
            className="h-16 w-32 text-lg"
            onClick={() => (window.location.href = "/")}
          >
            Go Home
          </Button>
        )}
        <Modal
          title="Confirm"
          // visible={isModalVisible}
          open={isModalVisible}
          onOk={handleLeave}
          onCancel={handleCancel}
          footer={[
            <Button key="cancel" onClick={handleCancel}>
              Cancel
            </Button>,
            <Button key="leave" type="primary" danger onClick={handleLeave}>
              Leave
            </Button>,
          ]}
        >
          <p>Are you sure you want to leave?</p>
        </Modal>
      </div>

      <ProgressBar
        percent={percent}
        progressBarColor={
          percent < 20
            ? "bg-red-500"
            : percent < 50
            ? "bg-yellow-500"
            : "bg-blue-500"
        }
      />
    </div>
  );
};

export default GameHeader;

const ProgressBar = ({ percent, progressBarColor }) => {
  // Add prop validation
  ProgressBar.propTypes = {
    percent: PropTypes.number.isRequired,
    progressBarColor: PropTypes.string.isRequired,
  };
  return (
    <div className="relative w-full bg-white  h-1 ">
      <div
        className={` h-full  ${progressBarColor} `}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
};
