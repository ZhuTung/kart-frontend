export interface PostAuthor {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  displayName: string;
}

export interface Post {
  id: number;
  userId: string;
  title: string;
  description: string | null;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  likeCount: number;
  likedByMe: boolean;
  author: PostAuthor;
  createdAt: string;
}

export interface PostResponse {
  message: string;
  post: Post;
}

export interface LikeResponse {
  liked: boolean;
  likeCount: number;
}
