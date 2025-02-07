import type {
  EagerCollection,
  Mapper,
  Values,
  Resource,
  Json,
  Context,
  LazyCompute,
  LazyCollection,
} from "@skipruntime/core";
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

export type ModifiedComment = Comment & {
  author: string;
  replies_count: number;
};

export type Reply = {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  content_type_id: "15" | "19"; // 15 - Comment, 19 - Reply
  object_id: string;
};

export type ModifiedReply = Reply & { author: string; replies_count?: number };

type OutputCollection = {
  friendsPosts: EagerCollection<string, ModifiedPost>;
  authorPosts: EagerCollection<string, Post>;
  comments: EagerCollection<string, Comment>;
  replies: EagerCollection<string, ModifiedReply>;
};

type PostsInputCollection = InputCollection & {
  friends: EagerCollection<string, ModifiedProfile>;
  modifiedProfiles: EagerCollection<string, ModifiedProfile>;
  context: Context;
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
  constructor(private comments: EagerCollection<string, ModifiedComment>) {}
  mapEntry(key: string, values: Values<Post>): Iterable<[string, Post]> {
    const post: Post = values.getUnique();
    const comments = this.comments.getArray(key);
    let commentsAmount = comments.length;
    let lastComment;
    if (commentsAmount !== 0) {
      lastComment = comments[comments.length - 1];
      for (const comment of comments) {
        commentsAmount += comment.replies_count;
      }
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
  constructor(
    private profiles: EagerCollection<string, ModifiedProfile>,
    private lazyRepliesCount: LazyCollection<string, number>
  ) {}
  mapEntry(
    _key: string,
    values: Values<Comment>
  ): Iterable<[string, ModifiedComment]> {
    const comment: Comment = values.getUnique();
    const authorName = this.profiles.getUnique(comment.author_id).name;
    let repliesCount = 0;

    const lazyCountArray = this.lazyRepliesCount.getArray(`${comment.id}/15`);
    if (lazyCountArray.length > 0) {
      repliesCount = lazyCountArray[0]!;
    }

    return [
      [
        comment.post_id,
        { ...comment, author: authorName, replies_count: repliesCount },
      ],
    ];
  }
}

class ReplyMapper implements Mapper<string, Reply, string, ModifiedReply> {
  constructor(private profiles: EagerCollection<string, ModifiedProfile>) {}

  mapEntry(
    _key: string,
    values: Values<Reply>
  ): Iterable<[string, ModifiedReply]> {
    const reply: Reply = values.getUnique();
    const profileName = this.profiles.getUnique(reply.author_id).name;
    return [
      [
        `${reply.object_id}/${reply.content_type_id}`,
        { ...reply, author: profileName },
      ],
    ];
  }
}

class ComputeRepliesCount implements LazyCompute<string, number> {
  constructor(private skall: EagerCollection<string, Reply>) {}

  compute(self: LazyCollection<string, number>, key: string): Iterable<number> {
    const repliesArray = this.skall.getArray(key);
    let count = repliesArray.length;
    for (const reply of repliesArray) {
      count += self.getArray(`${reply.object_id}/19`).length;
    }
    return [count];
  }
}

class RepliesWithCountMapper
  implements Mapper<string, ModifiedReply, string, ModifiedReply>
{
  constructor(private repliesCount: LazyCollection<string, number>) {}

  mapEntry(
    key: string,
    values: Values<Reply>
  ): Iterable<[string, ModifiedReply]> {
    const result: [string, ModifiedReply][] = [];
    const replies = values.toArray();

    for (const reply of replies) {
      let count = 0;

      const lazyCountArray = this.repliesCount.getArray(
        `${reply.object_id}/15`
      );
      if (lazyCountArray.length > 0) {
        count = lazyCountArray[0]!;
      }

      result.push([
        key,
        { ...(reply as unknown as ModifiedReply), replies_count: count },
      ]);
    }
    return result;
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
  input: PostsInputCollection
): OutputCollection => {
  const replies = input.replies.map(ReplyMapper, input.modifiedProfiles);
  const lazyRepliesCount = input.context.createLazyCollection(
    ComputeRepliesCount,
    replies
  );
  const repliesWithCount = replies.map(
    RepliesWithCountMapper,
    lazyRepliesCount
  );
  const comments = input.comments.map(
    CommentMapper,
    input.modifiedProfiles,
    lazyRepliesCount
  );
  const authorPosts = input.posts
    .map(ZeroPostMapper)
    .map(SortedPostsMapper)
    .map(PostsMapper, comments);

  const friendsPosts = input.friends.map(FriendsPostsMapper, authorPosts);
  return { friendsPosts, authorPosts, comments, replies: repliesWithCount };
};
