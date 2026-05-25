export interface FavoritePostDTO {
  user_id: string;
  post_id: string;
}

export interface FavoritePost {
  user_id: string;
  post_id: string;
  createdAt: Date;
}

export interface Result {
  text: string;
  user_id: string;
  post_id: string;
  createdAt: Date;
}

export interface SearchParams {
  page: number;
  order: 'DESC' | 'ASC';
}

export interface PaginatedFavorite<T> {
  data: T[];
  total: number;
}

export interface FavoritesPostsRepository {
  getFavoritesPosts(
    userID: string,
    data: SearchParams,
  ): Promise<PaginatedFavorite<Result>>;
  addPost(data: FavoritePostDTO): Promise<FavoritePost | null>;
  removePost(data: FavoritePostDTO): Promise<FavoritePost | null>;
}
