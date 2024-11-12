import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import FavoriteIcon from "@mui/icons-material/Favorite";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Post } from "../../features/posts/postsSlice";
import { format } from "date-fns";

const SinglePost = ({ ...props }: Post) => {
  const formattedDate = format(new Date(props.timestamp), "MMMM d, yyyy");

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
      <CardActions disableSpacing>
        <IconButton aria-label="add to favorites">
          <FavoriteIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default SinglePost;
