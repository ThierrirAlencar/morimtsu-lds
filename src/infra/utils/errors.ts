export class baseError{
    public code:number;
    public description:string
    public http_status:number
}

export class entityAlreadyExistsError extends baseError{
    code = 1;
    description = "A sensitive class have the same unique value"
    http_status = 409
}

export class triedToUpdateForbidenValue extends baseError{
    code = 2;
    description = "Tried to update a sensitive value"
    http_status = 401
}

export class entityDoesNotExists extends baseError{
    code = 3;
    description = "Entity not found"
    http_status = 404
}

export class InvalidInformationProvided extends baseError{
    code=4;
    description:"some invalid or mismatched information was provided";
    http_status = 401
}