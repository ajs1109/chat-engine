export interface ProfileResult {
  _id: string;
  name: string;
  email: string;
  pic: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface StoredProfile {
  result?: ProfileResult;
  token?: string;
}

export const getStoredProfile = (): StoredProfile => {
  const raw = localStorage.getItem("profile");
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as StoredProfile;
  } catch {
    return {};
  }
};
