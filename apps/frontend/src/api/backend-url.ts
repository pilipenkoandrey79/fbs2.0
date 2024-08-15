const {
  VITE_BACKEND_HOST = "localhost",
  VITE_BACKEND_PORT = "3333",
  VITE_API_PREFIX,
  VITE_SSL,
} = import.meta.env;

console.log(import.meta.env.VITE_JWT_REFRESH_EXPIRATION_TIME);

export default `${
  VITE_SSL === "1" ? "https" : "http"
}://${VITE_BACKEND_HOST}:${VITE_BACKEND_PORT}${
  VITE_API_PREFIX ? `/${VITE_API_PREFIX}` : ""
}/`;
