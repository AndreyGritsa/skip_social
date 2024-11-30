import FavoriteIcon from "@mui/icons-material/Favorite";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SendIcon from "@mui/icons-material/Send";
import {
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  CardActions,
  Avatar,
  IconButton,
  Typography,
  TextField,
  InputAdornment,
  Button,
  List,
} from "@mui/material";
import { Post } from "../../features/posts/postsSlice";
import { format } from "date-fns";
import { useState } from "react";
import SingleComment from "./SingleComment";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { addComment } from "../../features/posts/postsSlice";
import { v4 as uuidv4 } from "uuid";
import CommentDialog from "./CommentsDialog";

const SinglePost = ({ ...props }: Post) => {
  const formattedDate = format(new Date(props.created_at), "MMMM d, yyyy");
  const [comment, setComment] = useState<string>("");
  const [commentActive, setCommentActive] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);

  const handleSendComment = () => {
    console.log("sending comment");
    if (!comment) {
      return;
    }
    dispatch(
      addComment({
        id: uuidv4(),
        postId: props.id,
        content: comment,
        author: { ...user },
      })
    );
    setComment("");
    setCommentActive(false);
  };

  return (
    <Card sx={{ maxWidth: 650 }}>
      <CardHeader
        avatar={<Avatar>{props.author[0].toUpperCase()}</Avatar>}
        action={
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        }
        title={props.title}
        subheader={`${props.author} - ${formattedDate}`}
      />
      <CardContent>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {props.content}
        </Typography>
      </CardContent>
      <CardMedia
        component="img"
        height="194"
        image="https://i0.wp.com/picjumbo.com/wp-content/uploads/beautiful-nature-mountain-scenery-with-flowers-free-photo.jpg?w=2210&quality=70"
        alt="alt"
      />
      <CardActions sx={{ m: 1 }}>
        <Button size="medium" startIcon={<FavoriteIcon />}>
          Like
        </Button>
        <Button
          size="medium"
          startIcon={<SendIcon />}
          onClick={() => {
            setCommentActive(!commentActive);
          }}
        >
          Comment
        </Button>
      </CardActions>
      {props.comments || commentActive ? (
        <CardContent>
          {props.comments && props.comments.length > 1 && (
            <CommentDialog
              comments={props.comments}
              setComment={setComment}
              handleSendComment={handleSendComment}
              comment={comment}
            />
          )}
          {props.comments && (
            <List>
              <SingleComment {...props.comments[props.comments.length - 1]} />
            </List>
          )}
          {commentActive && (
            <TextField
              size="small"
              label="Write a public comment"
              fullWidth
              multiline
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="start">
                      <IconButton onClick={handleSendComment}>
                        <SendIcon color="primary" />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
        </CardContent>
      ) : null}
    </Card>
  );
};

export default SinglePost;
