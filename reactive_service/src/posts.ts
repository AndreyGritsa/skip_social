import type {
  EagerCollection,
  Mapper,
  Values,
  Resource,
  Json,
} from "@skipruntime/api";
import type { InputCollection, ResourcesCollection } from "./social.service.js";
import type { ModifiedProfile } from "./users.js";

// types

export type Post = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  author_id: string;
  comments_amount: number;
  last_comment?: Comment;
};

export type ModifiedPost = Post & { author: string };

export type Comment = {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  post_id: string;
};

export type ModifiedComment = Comment & { author: string };

type OutputCollection = {
  friendsPosts: EagerCollection<string, ModifiedPost>;
  authorPosts: EagerCollection<string, Post>;
  comments: EagerCollection<string, Comment>;
};

type PostsInputCollection = InputCollection & {
  friends: EagerCollection<string, ModifiedProfile>;
  modifiedProfiles: EagerCollection<string, ModifiedProfile>;
};

// mappers
class ZeroPostMapper implements Mapper<string, Post, string, Post> {
  mapEntry(_key: string, values: Values<Post>): Iterable<[string, Post]> {
    return [["0", values.getUnique()]];
  }
}

class SortedPostsMapper implements Mapper<string, Post, string, Post> {
  mapEntry(_key: string, values: Values<Post>): Iterable<[string, Post]> {
    const postsArray = values.toArray();

    const sortedPosts = postsArray.sort((a, b) => {
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ); // Sort by created_at in descending order
    });

    return sortedPosts.map((post) => [post.id, post]);
  }
}

class PostsMapper implements Mapper<string, Post, string, Post> {
  constructor(private comments: EagerCollection<string, Comment>) {}
  mapEntry(key: string, values: Values<Post>): Iterable<[string, Post]> {
    const post: Post = values.getUnique();
    const comments = this.comments.getArray(key);
    const commentsAmount = comments.length;
    let lastComment;
    if (commentsAmount !== 0) {
      lastComment = comments[comments.length - 1];
    }

    return [
      [
        post.author_id,
        {
          ...post,
          comments_amount: commentsAmount,
          ...(lastComment && { last_comment: lastComment }),
        },
      ],
    ];
  }
}

class FriendsPostsMapper
  implements Mapper<string, ModifiedProfile, string, ModifiedPost>
{
  constructor(private posts: EagerCollection<string, Post>) {}

  mapEntry(
    key: string,
    values: Values<ModifiedProfile>
  ): Iterable<[string, ModifiedPost]> {
    const result: [string, ModifiedPost][] = [];
    const friends = values.toArray();
    for (const friend of friends) {
      const posts = this.posts.getArray(friend!.id);
      for (const post of posts) {
        result.push([
          key,
          {
            ...(post as Post),
            author: friend!.name,
          },
        ]);
      }
    }

    return result;
  }
}

class CommentMapper
  implements Mapper<string, Comment, string, ModifiedComment>
{
  constructor(private profiles: EagerCollection<string, ModifiedProfile>) {}
  mapEntry(
    _key: string,
    values: Values<Comment>
  ): Iterable<[string, ModifiedComment]> {
    const comment: Comment = values.getUnique();
    const authorName = this.profiles.getUnique(comment.author_id).name;
    return [[comment.post_id, { ...comment, author: authorName }]];
  }
}

// resources

export class FriendsPostsResource implements Resource {
  private profileId: string = "";
  constructor(params: Json) {
    if (typeof params === "string") this.profileId = params;
  }
  instantiate(
    collections: ResourcesCollection
  ): EagerCollection<string, ModifiedPost> {
    if (!this.profileId) {
      throw new Error("profile_id parameter is required");
    }

    return collections.friendsPosts
      .slice(this.profileId, this.profileId)
      .take(10);
  }
}

export class AuthorPostsResource implements Resource {
  private profileId: string = "";
  constructor(params: Json) {
    if (typeof params === "string") this.profileId = params;
  }
  instantiate(collections: ResourcesCollection): EagerCollection<string, Post> {
    if (!this.profileId) {
      throw new Error("profile_id parameter is required");
    }

    return collections.authorPosts.slice(this.profileId, this.profileId);
  }
}

export class CommentsResource implements Resource {
  private postId: string = "";
  constructor(params: Json) {
    if (typeof params === "string") this.postId = params;
  }
  instantiate(
    collections: ResourcesCollection
  ): EagerCollection<string, Comment> {
    if (!this.postId) {
      throw new Error("post_id parameter is required");
    }

    return collections.comments.slice(this.postId, this.postId);
  }
}

// main function
export const createPostsCollections = (
  inputCollections: PostsInputCollection
): OutputCollection => {
  const comments = inputCollections.comments.map(
    CommentMapper,
    inputCollections.modifiedProfiles
  );
  const authorPosts = inputCollections.posts
    .map(ZeroPostMapper)
    .map(SortedPostsMapper)
    .map(PostsMapper, comments);

  const friendsPosts = inputCollections.friends.map(
    FriendsPostsMapper,
    authorPosts
  );
  return { friendsPosts, authorPosts, comments };
};
