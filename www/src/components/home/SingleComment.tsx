import { Comment } from "../../features/posts/postsSlice";
import {
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  Button,
} from "@mui/material";
import React from "react";

interface SingleCommentProps extends Comment {
  setCommentQuery?: React.Dispatch<React.SetStateAction<any>>;
}

const SingleComment = ({ setCommentQuery, ...props }: SingleCommentProps) => {

  const handleClick = () => {
    if (setCommentQuery) {
      setCommentQuery({
        type: "comment",
        id: props.id,
      });
    }
  };
  
  return (
    <ListItem
      alignItems="flex-start"
      secondaryAction={
        setCommentQuery && (
          <Button
            onClick={handleClick}
          >{`${props.replies_count} Replies`}</Button>
        )
      }
    >
      <ListItemAvatar>
        <Avatar alt={props.author} src="/" />
      </ListItemAvatar>
      <ListItemText
        primary={props.author}
        secondary={
          <React.Fragment>
            <Typography component="span" variant="body2" color="textPrimary">
              {props.content}
            </Typography>
          </React.Fragment>
        }
      />
    </ListItem>
  );
};

export default SingleComment;
