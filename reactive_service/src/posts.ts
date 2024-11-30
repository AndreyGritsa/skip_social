import type {
  EagerCollection,
  Mapper,
  NonEmptyIterator,
  Resource,
} from "skip-wasm";
import type { InputCollection, ResourcesCollection } from "./social.service.js";
import type { ModifiedProfile } from "./users.js";

// types

type Post = {
  id: string;
  title: string;
  author_id: string;
  content: string;
  created_at: string;
};

export type ModifiedPost = Post & { author: string };

type OutputCollection = {
  friendsPosts: EagerCollection<string, ModifiedPost>;
};

type PostsInputCollection = InputCollection & {
  friends: EagerCollection<string, ModifiedProfile>;
};

// mappers
class PostsMapper implements Mapper<string, Post, string, Post> {
  mapEntry(
    key: string,
    values: NonEmptyIterator<Post>
  ): Iterable<[string, Post]> {
    console.assert(typeof key === "string");
    const post = values.getUnique();
    const authorId = post.author_id;
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
  instantiate(collections: ResourcesCollection): EagerCollection<string, Post> {
    const profileId = this.params["profile_id"];
    if (profileId === undefined) {
      throw new Error("profile_id parameter is required");
    }

    return collections.friendsPosts.slice([profileId, profileId]).take(10);
  }
}

// main function
export const createPostsCollections = (
  inputCollections: PostsInputCollection
): OutputCollection => {
  const authorPosts = inputCollections.posts.map(PostsMapper);
  const friendsPosts = inputCollections.friends.map(
    FriendsPostsMapper,
    authorPosts
  );
  return { friendsPosts };
};
