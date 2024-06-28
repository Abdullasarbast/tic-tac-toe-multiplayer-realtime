import react,{ useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, Typography, Alert } from "antd";
import { AuthContext } from "../context/authContext";

const { Title, Text } = Typography;

const Login = () => {
  const [inputs, setInputs] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(inputs);
      navigate("/");
    } catch (err) {
      setError(err.response.data);
    }
  };

  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f0f2f5',
    },
    formWrapper: {
      width: '300px',
      padding: '20px',
      border: '1px solid #d9d9d9',
      borderRadius: '8px',
      backgroundColor: '#ffffff',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
    },
    error: {
      marginBottom: '16px',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.formWrapper}>
        <Title level={1}>Login</Title>
        <Form onSubmit={handleSubmit}>
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input
              placeholder="Username"
              name="username"
              onChange={handleChange}
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              placeholder="Password"
              name="password"
              onChange={handleChange}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" onClick={handleSubmit}>
              Login
            </Button>
          </Form.Item>
        </Form>
        {error && (
          <Alert message={error.message} type="error" showIcon style={styles.error} />
        )}
        <Text>
          Dont have an account? <Link to="/register">Register Now</Link>
        </Text>
      </div>
    </div>
  );
};

export default Login;
