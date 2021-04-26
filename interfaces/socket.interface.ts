export interface User {
  id: string;
  name: string;
}

export interface Room {
  id: string;
  users: User[];
}