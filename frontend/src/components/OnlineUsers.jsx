import { useEffect, useState } from "react";
import { socket } from "../socket";

function OnlineUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const handlePresence = (list) => setUsers(list);

    socket.on("presence:update", handlePresence);

    return () => socket.off("presence:update", handlePresence);
  }, []);

  return (
    <div>
      <h3>Online Users</h3>
      <ul>
        {users.map((user, index) => (
          <li key={`${user.email}-${index}`}>
            {user.email} ({user.role})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default OnlineUsers;