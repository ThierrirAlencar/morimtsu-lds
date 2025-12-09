import { Role } from "generated/prisma";

export interface  safe_user {
  name: string;
  email: string;
}
export interface full_user{
  name:string,
  role:Role,
  email:string
}

