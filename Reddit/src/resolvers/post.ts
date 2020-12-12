import { Post } from "../entities/post";
import { MyContext } from "../types";
import { Resolver, Query, Ctx, Arg, Mutation } from "type-graphql";

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts(@Ctx() { em }: MyContext): Promise<Post[]> {
    return em.find(Post, {});
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("id") id: number, @Ctx() { em }: MyContext): Promise<Post | null> {
    return em.findOne(Post, { id });
  }

  @Mutation(() => Post)
  async createPost(
    @Arg("title") title: String,
    @Ctx() { em }: MyContext
  ): Promise<Post> {
    const post = em.create(Post, { title });
    await em.persistAndFlush(post);
    return post;
  }

  @Mutation(() => Post,{nullable: true})
  async updatePost(
    @Arg("id") id: number,
    @Arg("title",() => String,{nullable: true}) title: String,
    @Ctx() { em }: MyContext
  ): Promise<Post | null> {
    const findPost = await em.findOne(Post, { id });
    if (!findPost) {
      return null;
    }

    if (typeof title !== "undefined") {
      findPost.title = title;
      em.persistAndFlush(findPost);
    }
    return findPost;
  }

  @Mutation(() => String)
  async deletePost(
    @Arg("id") id: number,
    @Ctx() { em }: MyContext
  ): Promise<String> {
    if(await em.nativeDelete(Post, {id})) {
      return "Post Deleted";
    } else {
      return "Error Deleting";
    }
    
  }
}
