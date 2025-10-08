import { BaseModel } from "src/infra/db/prismaService";
import { base_repository } from "./baseRepository";
import { User } from "generated/prisma";

export class userRepository extends base_repository implements userRepository{
    public model: BaseModel<User>;
}