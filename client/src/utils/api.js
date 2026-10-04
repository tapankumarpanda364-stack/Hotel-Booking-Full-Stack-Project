// Pulls the most useful message out of an axios error (server message first, then a friendly fallback).
export const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  (error?.request ? "Cannot reach the server. Is the backend running?" : error?.message) ||
  "Something went wrong";
