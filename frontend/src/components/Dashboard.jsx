import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { socket } from "../socket";
import OnlineUsers from "./OnlineUsers";

function Dashboard() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("role");

  useEffect(() => {
    // Get the logged-in user's info from localStorage
    const email = localStorage.getItem("email");
    const role = localStorage.getItem("role");

    // Tell the server this user is now online
    if (email) {
      socket.emit("user:join", { email, role });
    }

    // Listen for live notifications from the server
    const handleNotification = (notification) => {
      console.log(notification);
      // show toast or add to notification list
    };

    socket.on("notification:new", handleNotification);

    // Cleanup when Dashboard unmounts
    return () => {
      socket.off("notification:new", handleNotification);
    };
  }, []);

const logout = () => {
  const email = localStorage.getItem("email");

  if (email) {
    socket.emit("user:leave", { email });
  }

  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("email");
  navigate("/");
};

  const navItemStyle = {
    display: "block",
    padding: "15px 30px",
    margin: "10px 0",
    textDecoration: "none",
    color: "#007bff",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    textAlign: "center",
    fontSize: "18px",
    fontWeight: "500",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    border: "2px solid transparent",
  };

  const navItemHoverStyle = {
    transform: "scale(1.05)",
    backgroundColor: "#e9ecef",
    boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
    borderColor: "#007bff",
  };

  const logoutButtonStyle = {
    display: "block",
    padding: "15px 30px",
    margin: "10px 0",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "18px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    textAlign: "center",
  };

  const logoutButtonHoverStyle = {
    transform: "scale(1.05)",
    backgroundColor: "#c82333",
    boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          textAlign: "center",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          padding: "40px",
          borderRadius: "15px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          backdropFilter: "blur(10px)",
        }}
      >
        <h1
          style={{
            color: "#333",
            marginBottom: "30px",
            fontSize: "2.5em",
            fontWeight: "300",
            textShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          Dashboard
        </h1>

        <nav style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Link
            to="/projects"
            style={navItemStyle}
            onMouseEnter={(e) => Object.assign(e.target.style, navItemHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.target.style, navItemStyle)}
          >
            Projects
          </Link>

          <Link
            to="/timer"
            style={navItemStyle}
            onMouseEnter={(e) => Object.assign(e.target.style, navItemHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.target.style, navItemStyle)}
          >
            Timer
          </Link>

          <Link
            to="/logs"
            style={navItemStyle}
            onMouseEnter={(e) => Object.assign(e.target.style, navItemHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.target.style, navItemStyle)}
          >
            Logs
          </Link>

          <Link
            to="/uploaded-images"
            style={navItemStyle}
            onMouseEnter={(e) => Object.assign(e.target.style, navItemHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.target.style, navItemStyle)}
          >
            Media
          </Link>

          {userRole === "admin" && (
            <Link to="/admin" style={{ ...navItemStyle, borderColor: "#ffc107" }}>
              Admin Panel
            </Link>
          )}

          <button
            onClick={logout}
            style={logoutButtonStyle}
            onMouseEnter={(e) => Object.assign(e.target.style, logoutButtonHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.target.style, logoutButtonStyle)}
          >
            Logout
          </button>
          <OnlineUsers />
        </nav>
      </div>
    </div>
  );
}

export default Dashboard;