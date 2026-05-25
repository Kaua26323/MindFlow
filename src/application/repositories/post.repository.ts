export interface Post {
  id: string;
  text: string;
  user_id: string;
  createdAt: Date;
  updated_at: Date | null;
}

export interface CreatePostDTO {
  user_id: string;
  text: string;
}

export interface UpdatePostDTO {
  post_id: string;
  user_id: string;
  text: string;
}

export interface RemovePostDTO {
  post_id: string;
  user_id: string;
}

export interface PostWithUserName {
  id: string;
  text: string;
  userID: string;
  userName: string;
  createdAt: Date;
  isFavorite: boolean;
}

export interface SearchParams {
  page: number;
  search: string;
  order: 'ASC' | 'DESC';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
}

export interface PostRepository {
  create(postData: CreatePostDTO): Promise<Post | null>;
  remove(postID: string): Promise<Post | null>;
  getOneById(postID: string): Promise<Post | null>;
  update(postID: string, data: CreatePostDTO): Promise<Post | null>;
  getAllByUserId(userID: string, data: SearchParams): Promise<PaginatedResult<Post>>;
  getAll(
    data: SearchParams,
    userID?: string,
  ): Promise<PaginatedResult<PostWithUserName>>;
}
