import type {
  EagerCollection,
  Mapper,
  NonEmptyIterator,
  Resource,
} from "skip-wasm";
import type { InputCollection, ResourcesCollection } from "./social.service.js";
import type { ModifiedProfile } from "./users.js";

// types

export type Post = {
  id: string;
  title: string;
  author: string;
  content: string;
  created_at: string;
  author_id?: string;
};

export type ModifiedPost = Post & { author: string };

type OutputCollection = {
  friendsPosts: EagerCollection<string, ModifiedPost>;
  authorPosts: EagerCollection<string, Post>;
};

type PostsInputCollection = InputCollection & {
  friends: EagerCollection<string, ModifiedProfile>;
};

// mappers
class ZeroPostMapper implements Mapper<string, Post, string, Post> {
  mapEntry(
    key: string,
    values: NonEmptyIterator<Post>
  ): Iterable<[string, Post]> {
    console.assert(typeof key === "string");
    return [["0", values.getUnique()]];
  }
}

class SortedPostsMapper implements Mapper<string, Post, string, Post> {
  mapEntry(
    key: string,
    values: NonEmptyIterator<Post>
  ): Iterable<[string, Post]> {
    console.assert(typeof key === "string");

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
  mapEntry(
    key: string,
    values: NonEmptyIterator<Post>
  ): Iterable<[string, Post]> {
    console.assert(typeof key === "string");
    const post = values.getUnique();
    let authorId = post.author;
    if (authorId === undefined) {
      authorId = post.author_id as string;
    }

    console.log(`PostsMapper: key=${key}, post=${post}, profileId=${authorId}`);

    return [[authorId, post]];
  }
}

class FriendsPostsMapper
  implements Mapper<string, ModifiedProfile, string, ModifiedPost>
{
  constructor(private posts: EagerCollection<string, Post>) {}
  mapEntry(
    key: string,
    values: NonEmptyIterator<ModifiedProfile>
  ): Iterable<[string, ModifiedPost]> {
    console.assert(typeof key === "string");
    let result: [string, ModifiedPost][] = [];
    const friend = values.getUnique();
    const posts = this.posts.getArray(friend.id);

    for (const post of posts) {
      result.push([key, { ...post, author: friend.name }]);
    }
    return result;
  }
}

// resources

export class FriendsPostsResource implements Resource {
  constructor(private params: Record<string, string>) {}
  instantiate(
    collections: ResourcesCollection
  ): EagerCollection<string, ModifiedPost> {
    const profileId = this.params["profile_id"];
    if (profileId === undefined) {
      throw new Error("profile_id parameter is required");
    }

    return collections.friendsPosts.slice([profileId, profileId]).take(10);
  }
}

export class AuthorPostsResource implements Resource {
  constructor(private params: Record<string, string>) {}
  instantiate(collections: ResourcesCollection): EagerCollection<string, Post> {
    const profileId = this.params["profile_id"];
    if (profileId === undefined) {
      throw new Error("profile_id parameter is required");
    }

    return collections.authorPosts.slice([profileId, profileId]);
  }
}

// main function
export const createPostsCollections = (
  inputCollections: PostsInputCollection
): OutputCollection => {
  const authorPosts = inputCollections.posts
    .map(ZeroPostMapper)
    .map(SortedPostsMapper)
    .map(PostsMapper);
  const friendsPosts = inputCollections.friends.map(
    FriendsPostsMapper,
    authorPosts
  );
  return { friendsPosts, authorPosts };
};
