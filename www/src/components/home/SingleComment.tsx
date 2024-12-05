import { Comment } from "../../features/posts/postsSlice";
import {
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
} from "@mui/material";
import React from "react";

const SingleComment = ({ ...props }: Comment) => {
  return (
    <ListItem alignItems="flex-start">
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
