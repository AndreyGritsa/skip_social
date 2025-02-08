import {
  List,
  TextField,
  InputAdornment,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions,
  Dialog,
  Button,
} from "@mui/material";
import SingleComment from "./SingleComment";
import SendIcon from "@mui/icons-material/Send";
import type { Comment } from "../../features/posts/postsSlice";
import { useGetCommentsQuery } from "../../services/endpoints/posts";
import { useInvalidateCommentsMutation } from "../../services/endpoints/posts";
import { skipToken } from "@reduxjs/toolkit/query";
import { useState, Fragment, useEffect, MouseEvent } from "react";
import type { CommentQueryParams } from "../../services/endpoints/posts";

const CommentsDialog = ({
  comment,
  setComment,
  handleSendComment,
  commentsAmount,
  postId,
}: {
  commentsAmount: number;
  comment: string;
  setComment: Function;
  handleSendComment: (event: MouseEvent<HTMLButtonElement>) => void;
  postId: string;
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentQuery, setCommentQuery] = useState<CommentQueryParams>({
    type: "post",
    id: postId,
  });
  const { data, refetch } = useGetCommentsQuery(
    open ? commentQuery : skipToken
  );
  const [invalidateComments] = useInvalidateCommentsMutation();

  useEffect(() => {
    if (data) {
      setComments(data as unknown as Comment[]);
    }
  }, [data]);

  useEffect(() => {
    if (open) refetch();
  }, [open, refetch]);

  // useEffect(() => {
  //   refetch();
  // }, [commentQuery]);

  useEffect(() => {
    // close the event source when the component is unmounted
    return () => {
      invalidateComments();
    };
  }, [invalidateComments]);

  const handleClickOpen = () => () => {
    setOpen(!open);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Fragment>
      <Button size="small" onClick={handleClickOpen()}>
        Show more comments: {commentsAmount - 1} more
      </Button>
      <Dialog
        fullWidth
        maxWidth="sm"
        open={open}
        onClose={handleClose}
        scroll="paper"
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle id="scroll-dialog-title">Comments</DialogTitle>
        <DialogContent dividers={true}>
          <List>
            {comments.map((comment, key) => {
              return (
                <SingleComment
                  key={key}
                  {...comment}
                  setCommentQuery={setCommentQuery}
                />
              );
            })}
          </List>
        </DialogContent>
        <DialogActions>
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
        </DialogActions>
      </Dialog>
    </Fragment>
  );
};

export default CommentsDialog;
