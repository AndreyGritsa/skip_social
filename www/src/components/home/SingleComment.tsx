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
import { CommentQueryParams } from "../../services/endpoints/posts";

interface SingleCommentProps extends Comment {
  setCommentQuery?: React.Dispatch<React.SetStateAction<CommentQueryParams>>;
  commentQuery?: CommentQueryParams;
}

const SingleComment = ({
  setCommentQuery,
  commentQuery,
  ...props
}: SingleCommentProps) => {
  const handleClick = () => {
    if (setCommentQuery && commentQuery) {
      let type = "comment";
      if (commentQuery.type === "comment" || commentQuery.type === "reply") {
        type = "reply";
      }
      setCommentQuery({
        type: type as typeof commentQuery.type,
        id: props.id,
      });
    }
  };

  return (
    <ListItem
      alignItems="flex-start"
      secondaryAction={
        commentQuery && (
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
