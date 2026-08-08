export interface IUser {
  id: string;
  _id?: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  interests: string[];
}

export interface INote {
  _id: string;
  title: string;
  content: string;
  owner: string | any;
  createdAt: string;
  updatedAt: string;
}

export interface IPost {
  _id: string;
  title: string;
  content: string;
  author: string | any;
  createdAt: string;
  updatedAt: string;
}
