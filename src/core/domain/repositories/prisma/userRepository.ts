import { BaseModel } from "src/infra/db/prismaService";
import { base_repository } from "./baseRepository";
import { User } from "generated/prisma";
import { user_repository_interface } from "../userRepository";

export class userRepository extends base_repository implements user_repository_interface{
    public model: BaseModel<User>;
}