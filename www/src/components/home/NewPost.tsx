import { Paper, TextField, Button } from "@mui/material";
import { useState } from "react";
import { useNewPostMutation } from "../../services/endpoints/posts";
import { useAppSelector } from "../../app/hooks";

interface NewPostProps {
  setValue: React.Dispatch<React.SetStateAction<number>>;
}

const NewPost = ({ setValue }: NewPostProps) => {
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [newPost] = useNewPostMutation();
  const user = useAppSelector((state) => state.user);

  const handleNewPost = () => {
    if (!title || !content) return;
    console.log("Creating new post...");
    console.log("Title:", title);
    console.log("Content:", content);
    console.log("User:", user);

    newPost({ title, content, profile_id: user.id })
      .unwrap()
      .catch((e) => {
        console.error("Error creating new post:", e);
      });
    setTitle("");
    setContent("");
    setValue(1);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <TextField
        fullWidth
        sx={{ mb: 2 }}
        label="Title"
        onChange={(e) => setTitle(e.target.value)}
      />
      <TextField
        fullWidth
        label="Content"
        multiline
        rows={3}
        onChange={(e) => setContent(e.target.value)}
      />
      <Button
        variant="contained"
        sx={{ mt: 2 }}
        fullWidth
        onClick={handleNewPost}
      >
        Post
      </Button>
    </Paper>
  );
};

export default NewPost;
