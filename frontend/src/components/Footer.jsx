import { Layout } from "antd";
// import Logo from "../img/logo.png";

const { Footer: AntFooter } = Layout;

const Footer = () => {
  return (
    <AntFooter className="text-center bg-white h-10vh ">
      <img
        src={"https://lezzoo.com/images/Group.png"}
        alt="logo"
        className="h-10"
      />
      <p className="text-center text-gray-500 font-bold">We deliver</p>
    </AntFooter>
  );
};

export default Footer;
