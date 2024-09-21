type API_URL = string | undefined;

export default function getAPIURL(): API_URL {
  const defaultURL = "http://localhost:8000"; // Default URL

  if (process.env.NODE_ENV === "production") {
    return "test.com";
  } else if (process.env.NODE_ENV === "development") {
    return "http://localhost:8000";
  }
  return defaultURL;
}
