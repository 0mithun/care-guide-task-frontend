import axios, { AxiosRequestConfig } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

interface RequestOptions {
  method?: string;
  bodyData?: any;
  token?: string;
  headers?: Record<string, string>;
}

async function request(endpoint: string, options: RequestOptions = {}) {
  const { method = 'GET', bodyData, token, headers = {} } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers
  };

  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: AxiosRequestConfig = {
    url: `${BASE_URL}${endpoint}`,
    method,
    headers: requestHeaders,
    data: bodyData
  };

  try {
    const res = await axios(config);
    return res.data;
  } catch (error: any) {
    const errMsg = error.response?.data?.message || error.message || `Request failed with status ${error.response?.status}`;
    console.error(`API Error in ${endpoint}:`, errMsg);
    throw new Error(errMsg);
  }
}

export const apiService = {
  async register(body: any) {
    return request('/auth/register', {
      method: 'POST',
      bodyData: body
    });
  },


  notes: {
    async list(page: number, limit: number, token: string) {
      return request(`/notes?page=${page}&limit=${limit}`, {
        method: 'GET',
        token
      });
    },
    async getById(id: string, token: string) {
      return request(`/notes/${id}`, {
        method: 'GET',
        token
      });
    },
    async create(title: string, content: string, token: string) {
      return request('/notes', {
        method: 'POST',
        bodyData: { title, content },
        token
      });
    },
    async update(id: string, title: string, content: string, token: string) {
      return request(`/notes/${id}`, {
        method: 'PUT',
        bodyData: { title, content },
        token
      });
    },
    async delete(id: string, token: string) {
      return request(`/notes/${id}`, {
        method: 'DELETE',
        token
      });
    }
  },


  users: {
    async list(page: number, limit: number, token: string) {
      return request(`/users?page=${page}&limit=${limit}`, {
        method: 'GET',
        token
      });
    },
    async create(body: any, token: string) {
      return request('/users', {
        method: 'POST',
        bodyData: body,
        token
      });
    },
    async update(id: string, body: any, token: string) {
      return request(`/users/${id}`, {
        method: 'PUT',
        bodyData: body,
        token
      });
    },
    async delete(id: string, token: string) {
      return request(`/users/${id}`, {
        method: 'DELETE',
        token
      });
    },
    async groupByInterests(token: string) {
      return request('/users/by-interests', {
        method: 'GET',
        token
      });
    },
    async getUserPosts(id: string, token: string) {
      return request(`/users/${id}/posts`, {
        method: 'GET',
        token
      });
    }
  },


  posts: {
    async create(title: string, content: string, token: string) {
      return request('/posts', {
        method: 'POST',
        bodyData: { title, content },
        token
      });
    },
    async list(token: string, page: number = 1, limit: number = 8) {
      return request(`/posts?page=${page}&limit=${limit}`, {
        method: 'GET',
        token
      });
    },
    async update(id: string, title: string, content: string, token: string) {
      return request(`/posts/${id}`, {
        method: 'PUT',
        bodyData: { title, content },
        token
      });
    },
    async delete(id: string, token: string) {
      return request(`/posts/${id}`, {
        method: 'DELETE',
        token
      });
    }
  }
};
