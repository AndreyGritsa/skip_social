import { Server, Room, ServerMessage, ServerUser } from "./serversSlice";

const fakeUsers: ServerUser[] = [
  { id: "1", name: "Alice", role: "admin" },
  { id: "2", name: "Bob" },
  { id: "3", name: "Charlie" },
];

const fakeMessages: ServerMessage[] = [
  {
    id: "1",
    content: "Hello, world!",
    author: fakeUsers[0],
    timestamp: "2021-01-01T00:00:00Z",
  },
  {
    id: "2",
    content: "How are you?",
    author: fakeUsers[1],
    timestamp: "2021-01-01T00:01:00Z",
  },
  {
    id: "3",
    content: "Good morning!",
    author: fakeUsers[2],
    timestamp: "2021-01-01T00:02:00Z",
  },
];

const fakeRooms: Room[] = [
  {
    id: "1",
    name: "General",
    messages: [fakeMessages[0], fakeMessages[1]],
  },
  {
    id: "2",
    name: "Random",
    messages: [fakeMessages[2]],
  },
  {
    id: "3",
    name: "Secret",
    messages: [fakeMessages[2]],
  },
  {
    id: "4",
    name: "Private",
    messages: [fakeMessages[2]],
  },
];

const fakeServers: Server[] = [
  {
    id: "1",
    name: "Server 1",
    rooms: [fakeRooms[0], fakeRooms[1]],
    members: [fakeUsers[0], fakeUsers[1], fakeUsers[2]],
  },
  {
    id: "2",
    name: "Server 2",
    rooms: [fakeRooms[2], fakeRooms[3]],
    members: [fakeUsers[1], fakeUsers[2]],
  },
];

export default fakeServers;
