import type { dinosaurModel } from "./types.ts";


export const fromModeltoDinosaur =(dinosaurs:dinosaurModel) => ({
    id:dinosaurs._id!.toString(),
    name:dinosaurs.name,
    family:dinosaurs.family
})