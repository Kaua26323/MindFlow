export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
}

export interface UserLoginDTO {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface UserRepository {
  create(userData: CreateUserDTO): Promise<User | null>;
  remove(userID: string): Promise<User | null>;
  findById(userID: string): Promise<User | null>;
  findByName(name: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
}
