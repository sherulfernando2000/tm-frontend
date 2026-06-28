import apiClient from "./apiClient";

export interface AddMemberPayload {
  name: string;
  email: string;
  password?: string;
}

export interface ChangePasswordPayload {
  currentPassword?: string;
  newPassword?: string;
}

export const getWorkspaceMembers = async () => {
  const response = await apiClient.get("/users/workspace-members");
  return response.data;
};

export const changePassword = async (payload: ChangePasswordPayload) => {
  const response = await apiClient.put("/users/change-password", payload);
  return response.data;
};

export const addMember = async (payload: AddMemberPayload) => {
  const response = await apiClient.post("/users/add-member", payload);
  return response.data;
};

export const removeMember = async (id: string) => {
  const response = await apiClient.delete(`/users/remove-member/${id}`);
  return response.data;
};
