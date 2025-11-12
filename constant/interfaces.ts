export default interface Blog {
  id: number;
  userId: number;
  content: string;
  User: {
    id: number;
    userName: string;
  };
  createdAt: string;
  updatedAt: string;
}
export interface Blogs {
  blogs: Blog[];
}

export interface ProfileResponse {
  success: boolean;
  user: User;
  blogs: Blog[];
}

export interface User {
  id: number;
  userName: string;
  createdAt: string;
  updatedAt: string;
}
