import { BaseModel } from "src/infra/db/prismaService";
import { base_repository_interface } from "../baseRepository";

export class base_repository implements base_repository_interface{

    public model:BaseModel<any>; 

    create(data: any): Promise<BaseModel<any>> {
        return this.model.create(data);
    }
    findById(id:string):Promise<BaseModel<any> | null>{
        return this.model.findById(id);
    };
    findAll():Promise<BaseModel<any>[]>{
        return this.model.findAll();
    };
    update(id:string, data:any):Promise<BaseModel<any>>{
        return this.update(id, data); 
    };
    delete(id:string):Promise<BaseModel<any>>{
        return this.model.delete(id);
    };
}