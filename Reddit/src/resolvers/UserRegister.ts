import {
  InputType,
  Field
} from "type-graphql";


@InputType()
export class UserRegister {
  @Field()
  username: string;

  @Field()
  password: string;

  @Field()
  email: string;
}
