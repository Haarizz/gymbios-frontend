const BASE_URL = "https://gymbios-backend.onrender.com/api/auth";

export const login = async (email, password) => {
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Invalid email or password");
  }

  const token = await response.text();
  localStorage.setItem("token", token);

  return token;
};
