import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { io, Socket } from "socket.io-client";

interface User {
  name: string;
  score: number;
}

interface ContextType {
  globalname: string;
  userDetail: User;
  leaderboard: User[];
  result: any[] | null;
  setResult: React.Dispatch<React.SetStateAction<any[] | null>>;
  data: any[] | null;
  setData: React.Dispatch<React.SetStateAction<any[] | null>>;
  socket: Socket | null;
}

export const allContext = createContext<ContextType>({
  globalname: "",
  userDetail: { name: "", score: 0 },
  leaderboard: [],
  result: null,
  setResult: () => {},
  data: null,
  setData: () => {},
  socket: null,
});

interface Props {
  children: React.ReactNode;
}

const Store: React.FC<Props> = ({ children }) => {
  const [globalname, setGlobalname] = useState<string>("");
  const [userDetail, setUserDetail] = useState<User>({ name: "", score: 0 });
  const [leaderboard, setLeaderboard] = useState<User[]>([]);

  //glocbal socket
  const [socket, setSocket] = useState<Socket | null>(null);

  const [result, setResult] = useState<any[] | null>(null);
  const [data, setData] = useState<any[] | null>(null);
  //   console.log("yai hai result",result);
  //   console.log("yai hai data",data);

  useEffect(() => {
    const auth = localStorage.getItem("auth");
    if (auth) {
      setGlobalname(auth);
    }
  }, []);

  useEffect(() => {
    const newSocket = io("https://multi-player-quiz.onrender.com");
    setSocket(newSocket);
    
    return () => {
      newSocket.disconnect();
    };
  }, []);

  async function handlerScore() {
    if (globalname) {
      const res = await axios.post(
        "https://multi-player-quiz.onrender.com/api/v1/user/detail",
        {
          name: globalname,
        }
      );
      setUserDetail(res.data.existingUser);
    }
  }

  async function getuser() {
    const res = await axios.get(
      "https://multi-player-quiz.onrender.com/api/v1/user/all"
    );
    setLeaderboard(res.data.data);
  }
  useEffect(() => {
    const intervalId = setInterval(() => {
      handlerScore();
      getuser();
    }, 1000);

    return () => clearInterval(intervalId);
  }, [globalname]);

  return (
    <allContext.Provider
      value={{
        globalname,
        userDetail,
        leaderboard,
        result,
        setResult,
        data,
        setData,
        socket,
      }}
    >
      {children}
    </allContext.Provider>
  );
};

export default Store;
