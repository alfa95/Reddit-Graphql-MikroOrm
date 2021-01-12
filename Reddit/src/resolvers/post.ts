import { Post } from "../entities/post";
import {
  Resolver,
  Query,
  Arg,
  Mutation,
  InputType,
  Field,
  Ctx,
  UseMiddleware,
  Int,
  FieldResolver,
  Root,
  ObjectType,
} from "type-graphql";
import { MyContext } from "src/types";
import { isAuth } from "../middleware/isAuth";
import { getConnection } from "typeorm";

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];
  @Field()
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(()=> String)
  textSnippet(@Root() root:Post) {
    return root.text.slice(0,50);
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedPosts> {
    const maxLimit = Math.min(50, limit);
    const maxLimitPlusOne = maxLimit + 1;
    const qb = getConnection()
      .getRepository(Post)
      .createQueryBuilder("posts")
      .orderBy('"createdAt"', "DESC")
      .take(maxLimitPlusOne);

    if (cursor) {
      qb.where('"createdAt" < :cursor', { cursor: new Date(parseInt(cursor)) });
    }
    const posts = await qb.getMany();
    return {posts: posts.slice(0, maxLimit), hasMore: posts.length === maxLimitPlusOne};
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("id") id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("posts") PostsInput: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    return Post.create({
      ...PostsInput,
      creatorId: req.session.userId,
    }).save();
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id") id: number,
    @Arg("title", () => String, { nullable: true }) title: String
  ): Promise<Post | null> {
    const findPost = await Post.findOne(id);
    if (!findPost) {
      return null;
    }

    if (typeof title !== "undefined") {
      await Post.update({ id }, { title });
    }
    return findPost;
  }

  @Mutation(() => String)
  async deletePost(@Arg("id") id: number): Promise<boolean> {
    await Post.delete(id);
    return true;
  }
}
