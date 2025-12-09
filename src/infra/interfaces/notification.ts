export enum notification_kind{
  SYSTEM="SYSTEM",
  PROMOTION="PROMOTION",
  BIRTHDATE="BIRTHDATE"
}
export interface notification{
  date:Date,
  message:string,
  read:boolean
  kind:notification_kind
}
