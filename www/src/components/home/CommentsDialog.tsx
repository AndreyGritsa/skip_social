import * as React from "react";
import {
  List,
  TextField,
  InputAdornment,
  IconButton,
  DialogTitle,
  DialogContentText,
  DialogContent,
  DialogActions,
  Dialog,
  Button,
} from "@mui/material";
import SingleComment from "./SingleComment";
import SendIcon from "@mui/icons-material/Send";
import { Comment } from "../../features/posts/postsSlice";

const CommentsDialog = ({
  comments,
  comment,
  setComment,
  handleSendComment,
}: {
  comments: Comment[];
  comment: string;
  setComment: Function;
  handleSendComment: (event: React.MouseEvent<HTMLButtonElement>) => void;
}) => {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => () => {
    setOpen(!open);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const descriptionElementRef = React.useRef<HTMLElement>(null);
  React.useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [open]);

  return (
    <React.Fragment>
      <Button size="small" onClick={handleClickOpen()}>
        Show more comments: {comments.length - 1} more
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
          <DialogContentText
            id="scroll-dialog-description"
            ref={descriptionElementRef}
            tabIndex={-1}
          >
            <List>
              {comments.map((comment, key) => {
                return <SingleComment key={key} {...comment} />;
              })}
            </List>
          </DialogContentText>
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
    </React.Fragment>
  );
};

export default CommentsDialog;
