import api from "../api/axios";
import { useLoading } from "../context/LoadingContext";

export const useApi = () => {
  const { startLoading, stopLoading } = useLoading();

  const request = async (config) => {
    try {
      startLoading();
      const response = await api(config);
      stopLoading();
      return response;
    } catch (error) {
      stopLoading();
      throw error;
    }
  };

  return { request };
};
