const apiBaseFromEnv = import.meta.env.VITE_API_BASE_URL as string | undefined;
const socketFromEnv = import.meta.env.VITE_SOCKET_URL as string | undefined;

export const API_BASE_URL = apiBaseFromEnv || "http://localhost:3174";
export const SOCKET_URL = socketFromEnv || API_BASE_URL;

export const getProfileImageUrl = (pic?: string) => {
  if (!pic) {
    return "";
  }

  if (pic.startsWith("http://") || pic.startsWith("https://")) {
    return pic;
  }

  return `${API_BASE_URL}/uploads/profilePicture/${pic}`;
};
