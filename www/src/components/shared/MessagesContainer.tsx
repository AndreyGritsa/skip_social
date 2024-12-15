import {
  Paper,
  Typography,
  List,
  TextField,
  ListItem,
  InputAdornment,
  IconButton,
  Box,
} from "@mui/material";
import { useState } from "react";
import SendIcon from "@mui/icons-material/Send";
import { format } from "date-fns";
import { Message } from "../../features/channels/channelsSlice";

type MessageContainerProps = {
  messages: Message[];
  handleSendMessage: (messageInput: string) => void;
};

const MessagesContainer = (props: MessageContainerProps) => {
  const { messages, handleSendMessage } = props;
  const [messageInput, setMessageInput] = useState<string>("");

  const sendMessage = () => {
    if (!messageInput) return;
    handleSendMessage(messageInput);
    setMessageInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <Box
      sx={{
        p: 1,
        // TODO: couldn't figure out how to use 100% instead
        height: "95.3dvh",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <List
        sx={{
          flexDirection: "column-reverse",
          overflowY: "auto",
          overflowX: "clip",
          mt: 1,
          flexGrow: 1,
          overflowAnchor: "auto!important",
          display: "flex",
          scrollBehavior: "smooth",
        }}
      >
        {messages.map((message) => (
          <ListItem
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
            key={message.id}
          >
            <Paper sx={{ p: 1 }}>
              <Typography variant="body1">{message.content}</Typography>
              <Typography variant="caption" color="textSecondary">
                {message.author} -{" "}
                {format(new Date(message.created_at), "MMMM d, yyyy")}
              </Typography>
            </Paper>
          </ListItem>
        ))}
      </List>

      <TextField
        variant="outlined"
        margin="normal"
        fullWidth
        label="Message"
        value={messageInput}
        onChange={(e) => setMessageInput(e.target.value)}
        onKeyUp={handleKeyPress}
        sx={{
          flexShrink: 0,
          marginTop: "auto",
        }}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="start">
                <IconButton onClick={sendMessage}>
                  <SendIcon color="primary" />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
    </Box>
  );
};

export default MessagesContainer;
