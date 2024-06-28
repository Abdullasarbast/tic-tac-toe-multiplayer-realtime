import { useEffect, useState, useContext } from "react";
import api from "../service/api";
import { Card, Spin, Tabs } from "antd";
import { CrownOutlined } from "@ant-design/icons";
import { AuthContext } from "../context/authContext";

const { TabPane } = Tabs;

const GameRecord = () => {
  const [gameRecord, setGameRecord] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("winners");
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchGameRecord = async () => {
      try {
        const response = await api.get("/records");
        setGameRecord(response.data);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };
    fetchGameRecord();
  }, []);

  const filteredRecords = gameRecord.filter((record) => {
    if (activeTab === "all") return true;
    if (activeTab === "winners") return record.winner_id == currentUser.id;
    if (activeTab === "losers")
      return record.winner_id !== currentUser.id && record.winner_id !== null;
    if (activeTab === "draws") return record.winner_id === null;
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-4 min-h-[70vh]">
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        centered
        className="mb-4"
      >
        <TabPane tab="All" key="all" />
        <TabPane tab="Winners" key="winners" />
        <TabPane tab="Losers" key="losers" />
        <TabPane tab="Draws" key="draws" />
      </Tabs>
      <div className="flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
          {filteredRecords.map((record, index) => (
            <Card
              key={index}
              className="mb-4 transition-transform transform hover:scale-105 w-96 shadow-md"
              hoverable
            >
              <div className="flex justify-between mt-2">
                <div
                  className={`text-2xl font-semibold ${
                    record.winner_id == null
                      ? "text-yellow-600"
                      : record.winner_id === record.player1_id
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {record.player1_name}
                </div>

                <span
                  className="text-2xl font-semibold  text-yellow-500
                flex justify-center items-center w-12 h-8 bg-gray-100 rounded-full"
                >
                  VS
                </span>

                <div
                  className={`text-2xl font-semibold ${
                    record.winner_id == null
                      ? "text-yellow-600"
                      : record.winner_id === record.player2_id
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {record.player2_name}
                </div>
              </div>
              <CrownOutlined
                className={`
                    text-yellow-600 text-2xl absolute top-2 ${
                      record.winner_id == null
                        ? "hidden"
                        : record.winner_id === record.player1_id
                        ? "left-2"
                        : "right-2"
                    }
                  `}
              />

              <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                <div className="text-gray-700 text-base text-center">
                  {record.winner_id !== null && " Winner:"}
                  <span className="font-bold ml-1">
                    {record.winner_id == null
                      ? "Draw"
                      : record.winner_id === record.player1_id
                      ? record.player1_name
                      : record.player2_name}
                  </span>
                </div>
              </div>
              <span className="absolute -bottom-2 -left-2 bg-gray-300 text-gray-600  w-7 h-7  flex justify-center items-center font-semibold rounded-full">
                {index + 1}
              </span>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameRecord;
