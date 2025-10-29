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
    description = "some invalid or mismatched information was provided";
    http_status = 401
}

export class InvalidPasswordError extends baseError{
    code=5;
    description= "The provided password is invalid";
    http_status = 409
}

export class prohibitedAction extends baseError{
    code=6;
    description = "Tried to execute a prohibited action."
    public http_status: number = 405;
}

export class FSMTPError extends baseError{
    code=7;
    description = "An non letal error ocurred while trying to send an email."
    public http_status: number = 504;
}