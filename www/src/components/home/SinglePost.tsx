import FavoriteIcon from "@mui/icons-material/Favorite";
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
import { useAppSelector } from "../../app/hooks";
import CommentDialog from "./CommentsDialog";
import PostPopper from "./PostPopper";
import { useNewCommentMutation } from "../../services/endpoints/posts";

interface PostProps extends Post {
  editable?: boolean;
}

const SinglePost = ({ ...props }: PostProps) => {
  const formattedDate = format(new Date(props.created_at), "MMMM d, yyyy");
  const [comment, setComment] = useState<string>("");
  const [commentActive, setCommentActive] = useState<boolean>(false);
  const user = useAppSelector((state) => state.user);
  const [newComment] = useNewCommentMutation();

  const handleSendComment = () => {
    console.log("sending comment");
    if (!comment) {
      return;
    }
    newComment({
      content: comment,
      author: user.id,
      post: props.id,
    })
      .unwrap()
      .catch((error) => {
        console.error("Error sending comment:", error);
      });
    setComment("");
    setCommentActive(false);
  };

  return (
    <Card sx={{ maxWidth: 650 }}>
      <CardHeader
        avatar={
          <Avatar>
            {props.author ? props.author[0].toUpperCase() : user.name[0]}
          </Avatar>
        }
        action={props.editable && <PostPopper {...props} />}
        title={props.title}
        subheader={`${
          props.author ? props.author : user.name
        } - ${formattedDate}`}
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
      {props.last_comment || commentActive ? (
        <CardContent>
          {props.comments_amount > 1 && (
            <CommentDialog
              comments={Array.from(
                { length: props.comments_amount },
                (_) => props.last_comment!
              )}
              setComment={setComment}
              handleSendComment={handleSendComment}
              comment={comment}
            />
          )}
          {props.last_comment && (
            <List>
              <SingleComment {...props.last_comment} />
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
