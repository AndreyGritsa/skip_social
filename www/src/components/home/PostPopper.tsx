import * as React from "react";
import { IconButton, Box, Popper, Fade, Paper, Button } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDeletePostMutation } from "../../services/endpoints/posts";
import EditPostDialog from "./EditPostDialog";
import { Post } from "../../features/posts/postsSlice";

const PostPopper = ({ ...props }: Post) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const [open, setOpen] = React.useState<boolean>(false);
  const [triggerDeletePost] = useDeletePostMutation();

  const handleSettingClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen(!open);
  };

  const handleDelete = () => {
    triggerDeletePost(props.id)
      .unwrap()
      .catch((error) => console.error(error));
    setOpen(!open);
  };

  return (
    <Box>
      <Popper open={open} anchorEl={anchorEl} placement="top" transition>
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper
              sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}
            >
              <Button
                fullWidth
                variant="outlined"
                startIcon={<DeleteIcon />}
                onClick={handleDelete}
              >
                Delete
              </Button>
              <EditPostDialog post={props} setOpenPopper={setOpen} />
            </Paper>
          </Fade>
        )}
      </Popper>
      <IconButton onClick={handleSettingClick} aria-label="settings">
        <MoreVertIcon />
      </IconButton>
    </Box>
  );
};

export default PostPopper;
