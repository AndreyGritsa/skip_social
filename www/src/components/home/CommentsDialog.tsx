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
import { useState, Fragment, useEffect } from "react";
import type { CommentQueryParams } from "../../services/endpoints/posts";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

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
  handleSendComment: (id: string, type: string) => void;
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
  const [commentQueryHistory, setCommentQueryHistory] = useState<
    CommentQueryParams[]
  >([]);

  useEffect(() => {
    if (
      commentQueryHistory.length === 0 ||
      JSON.stringify(commentQueryHistory[commentQueryHistory.length - 1]) !==
        JSON.stringify(commentQuery)
    ) {
      setCommentQueryHistory((prevHistory) => [...prevHistory, commentQuery]);
    }
  }, [commentQuery, commentQueryHistory]);

  useEffect(() => {
    if (data) {
      setComments(data as unknown as Comment[]);
    }
  }, [data]);

  useEffect(() => {
    if (open) refetch();
  }, [open, refetch]);

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

  const handleBack = () => {
    if (commentQueryHistory.length > 0) {
      const previousQuery = commentQueryHistory[commentQueryHistory.length - 2];
      setCommentQuery(previousQuery);
      setCommentQueryHistory(commentQueryHistory.slice(0, -2));
    }
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
        <DialogTitle id="scroll-dialog-title">
          {commentQuery.type !== "post" && (
            <IconButton onClick={handleBack}>
              <ArrowBackIosIcon />
            </IconButton>
          )}
          Comments
        </DialogTitle>
        <DialogContent dividers={true}>
          <List>
            {comments.map((comment, key) => {
              return (
                <SingleComment
                  key={key}
                  {...comment}
                  setCommentQuery={setCommentQuery}
                  commentQuery={commentQuery}
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
                    <IconButton
                      onClick={() =>
                        handleSendComment(commentQuery.id, commentQuery.type)
                      }
                    >
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
