import { Avatar, Badge } from "@mui/material";

interface CustomAvatarProps {
  src: string | undefined;
  alt: string;
  status?: string;
}

const getStatusColor = (status: string): "success" | "warning" => {
  switch (status) {
    case "online":
      return "success";
    case "away":
      return "warning";
    default:
      return "warning";
  }
};

const CustomAvatar = ({ src, alt, status }: CustomAvatarProps) => {
  return (
    <Badge
      color={status ? getStatusColor(status) : "default"}
      overlap="circular"
      variant="dot"
      anchorOrigin={{ vertical: "bottom" }}
    >
      <Avatar alt={alt} src={src ? src : "/"} />
    </Badge>
  );
};

export default CustomAvatar;
