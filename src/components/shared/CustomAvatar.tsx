import { Avatar, Badge } from "@mui/material";

interface CustomAvatarProps {
  src: string | undefined;
  alt: string;
  status: "online" | "away";
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
      color={getStatusColor(status)}
      overlap="circular"
      variant="dot"
      anchorOrigin={{ vertical: "bottom" }}
    >
      <Avatar alt={alt} src={src ? src : "/"} />
    </Badge>
  );
};

export default CustomAvatar;
