import axiosInstance from "../lib/axios";

const get = async (url) => (await axiosInstance.get(url)).data;
const post = async (url, data) => (await axiosInstance.post(url, data)).data;
const patch = async (url, data) => (await axiosInstance.patch(url, data)).data;
const put = async (url, data) => (await axiosInstance.put(url, data)).data;
const remove = async (url) => (await axiosInstance.delete(url)).data;

export const sessionApi = {
  createSession: (data) => post("/sessions", data),
  getActiveSessions: () => get("/sessions/active"),
  getMyRecentSessions: () => get("/sessions/my-recent"),
  getHistory: () => get("/sessions/history"),
  getSessionById: (id) => get(`/sessions/${id}`),
  updateSession: ({ id, ...body }) => patch(`/sessions/${id}`, body),
  joinSession: (id) => post(`/sessions/${id}/join`),
  removeParticipant: (id) => post(`/sessions/${id}/remove-participant`),
  endSession: ({ id, ...body }) => post(`/sessions/${id}/end`, body),
  saveNotes: ({ id, notes }) => patch(`/sessions/${id}/notes`, { notes }),
  updateResult: ({ id, ...body }) => patch(`/sessions/${id}/result`, body),
  getStreamToken: () => get("/chat/token"),

  getQuiz: (id) => get(`/sessions/${id}/quiz`),
  submitQuiz: ({ id, answers }) => post(`/sessions/${id}/quiz`, { answers }),
  addQuestion: ({ id, ...body }) => post(`/sessions/${id}/quiz/questions`, body),
  updateQuestion: ({ id, questionId, ...body }) => put(`/sessions/${id}/quiz/questions/${questionId}`, body),
  deleteQuestion: ({ id, questionId }) => remove(`/sessions/${id}/quiz/questions/${questionId}`),

  getReport: (id) => get(`/sessions/${id}/report`),
  emailReport: (id) => post(`/sessions/${id}/report/email`),
  downloadReport: async (id) =>
    (await axiosInstance.get(`/sessions/${id}/report.pdf`, { responseType: "blob" })).data,
};

export const questionApi = {
  list: () => get("/questions"),
  create: (body) => post("/questions", body),
  update: ({ id, ...body }) => put(`/questions/${id}`, body),
  remove: (id) => remove(`/questions/${id}`),
};
