import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import { Menu, Typography } from "antd";
import { SettingOutlined } from "@ant-design/icons";
const { Text } = Typography;

const Navbar = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState("home");

  const items = [
    {
      key: "sub1",
      label: (
        <Text className="ml-6  text-white">
          <SettingOutlined /> {currentUser.username ?? ""}
        </Text>
      ),
      children: [
        {
          key: "1",
          label: <Text className="ml-6  text-white">💀 Logout</Text>,
        },
      ],
    },
  ];

  const onClick = (e) => {
    if (e.key === "1") {
      logout();
      navigate("/login");
    }
  };

  const handleItemClick = (key) => {
    setActiveItem(key);
  };

  return (
    <nav className="flex justify-between items-center h-16 bg-slate-900">
      <Link to="/" className="flex justify-center items-center">
        <img
          src={"https://lezzoo.com/images/Group.png"}
          alt="logo"
          className="h-12 ml-2"
        />
      </Link>

      <div className="flex justify-center items-center space-x-5">
        <Link
          to="/"
          onClick={() => handleItemClick("home")}
          className={`
          font-medium 
           p-4 
           no-underline text-white ${
             activeItem === "home"
               ? "border border-gray-100 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
               : ""
           }`}
        >
          Home
        </Link>
        <Link
          to="/gameRecord"
          onClick={() => handleItemClick("games-record")}
          className={`
          font-medium 
           p-4 
           no-underline text-white ${
             activeItem === "games-record"
               ? "border border-gray-100 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
               : ""
           }`}
        >
          Game-Record
        </Link>

        {currentUser ? (
          <Menu
            onClick={onClick}
            className="w-32"
            mode="horizontal"
            items={items}
            theme="dark"
          />
        ) : (
          <Link
            to="/login"
            onClick={() => handleItemClick("login")}
            className={`text-white ${
              activeItem === "login" ? "underline text-blue-500" : ""
            }`}
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
