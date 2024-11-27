import type {OptionalId} from 'mongodb'; 



export type dinosaur = {
    id:string,
    name:string,
    family:string
}

export type dinosaurModel = OptionalId<{
    name:string,
    family:string
}> 