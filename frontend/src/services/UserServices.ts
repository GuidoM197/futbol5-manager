import { useMutation } from "@tanstack/react-query";
import { BASE_API_URL } from "@/config/app-query-client";
import { LoginRequest, LoginResponseSchema, SignupRequest } from "@/models/Login";
import { useToken } from "@/services/TokenContext";
import { UserProfile, UserProfileSchema } from "@/models/Login";

function decodeJwt(token: string): { role: string } {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
        atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return { role: "USER" };
  }
}

export function useLogin() {
  const [, setToken] = useToken();

  return useMutation({
    mutationFn: async (req: LoginRequest) => {
      const tokenData = await auth("/sessions/login/user", req);
      const decoded = decodeJwt(tokenData.accessToken);

      setToken({
        state: "LOGGED_IN",
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        role: decoded.role
      });

      localStorage.setItem("token", tokenData.accessToken);
    },
  });
}

export function useSignup() {
  const [, setToken] = useToken();

  return useMutation({
    mutationFn: async (req: { data: SignupRequest; photo: File }) => {
      const formData = new FormData();

      formData.append("photo", req.photo);
      formData.append(
          "data",
          new Blob([JSON.stringify(req.data)], { type: "application/json" })
      );

      const tokenData = await auth("/sessions/signup/user", formData);
      const decoded = decodeJwt(tokenData.accessToken);

      setToken({
        state: "LOGGED_IN",
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        role: decoded.role
      });

      localStorage.setItem("token", tokenData.accessToken);
    },
  });
}

async function auth(
    endpoint: string,
    data: FormData | LoginRequest | SignupRequest
) {
  const url = `${BASE_API_URL}${endpoint}`;
  console.log("Sending request to:", url, "with:", data);

  try {
    const response = await fetch(url, {
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
      headers: data instanceof FormData
          ? { Accept: "application/json" }
          : {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed with status ${response.status}: ${errorText}`);
    }

    return LoginResponseSchema.parse(await response.json());
  } catch (error) {
    console.error("Send request error:", error);
    throw error;
  }
}

export async function fetchMyPicture(): Promise<string | null> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const response = await fetch(`${BASE_API_URL}/users/picture`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error(`Could not fetch image: ${response.status}`);

  const blob = await response.blob();

  if (blob.size === 0) {
    return null;
  }

  return URL.createObjectURL(blob);
}

export async function getMyProfile(): Promise<UserProfile> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const response = await fetch(`${BASE_API_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error fetching profile: ${response.status}`);
  }

  const json = await response.json();
  return UserProfileSchema.parse(json);
}

export async function updateMyProfile(data: {
  name: string
  lastname: string
  age: string
  gender: string
  zone: string
}): Promise<UserProfile> {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("No token found")

  const response = await fetch(`${BASE_API_URL}/users/me/update`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to update profile: ${errorText}`)
  }

  const json = await response.json()
  return UserProfileSchema.parse(json)
}