import apiClient from "./apiClient";

export interface TaskPayload {
  title: string;
  description?: string;
  status: "Open" | "In Progress" | "Done";
  priority: "Low" | "Medium" | "High";
  dueDate: string;
  assignedTo: string;
}

export interface GetTasksParams {
  status?: string;
  priority?: string;
  search?: string;
}

export const getTasks = async (params?: GetTasksParams) => {
  const response = await apiClient.get("/tasks", { params });
  return response.data;
};

export const getTaskById = async (id: string) => {
  const response = await apiClient.get(`/tasks/${id}`);
  return response.data;
};

export const createTask = async (payload: TaskPayload) => {
  const response = await apiClient.post("/tasks", payload);
  return response.data;
};

export const updateTask = async (id: string, payload: Partial<TaskPayload>) => {
  const response = await apiClient.put(`/tasks/${id}`, payload);
  return response.data;
};

export const deleteTask = async (id: string) => {
  const response = await apiClient.delete(`/tasks/${id}`);
  return response.data;
};

export const getWorkspaceMembers = async () => {
  const response = await apiClient.get("/users/workspace-members");
  return response.data;
};
