import { MongoClient, ObjectId } from "mongodb";
import { dinosaurModel } from "./types.ts";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { fromModeltoDinosaur } from "./utils.ts";



// MongoDB Connection
const MONGO_URL = Deno.env.get("MONGO_URL");
if (!MONGO_URL) {
  console.log("Fallo url");
  Deno.exit(-1);
}

const client = new MongoClient(MONGO_URL);
await client.connect();
console.log("Conectado correctamente");

const db = client.db("DinoGraphQL");
const dinosaurCollection = db.collection<dinosaurModel>("dinosaurs");

// GraphQL Schema
const schemaGQL =`#graphql
  type Dinosaur {
    id: String
    name: String
    family: String
  }

  type Query {
    getDinosaurs: [Dinosaur]
    getDinosaur(id: String!): Dinosaur
  }

  type Mutation {
    createDinosaur(name: String!, family: String!): Dinosaur
    eliminateDinosaur(id:String!)
  }
`;

// Resolvers
const resolvers = {
  Query: {
    getDinosaurs: async () => {
        const dinosaurs = await dinosaurCollection.find().toArray();
        const dino = await Promise.all(dinosaurs.map((d)=> fromModeltoDinosaur(d)));
        return dino;
    },
    getDinosaur: async (_: unknown, {id}: { id: string }) => {
        const dino = await dinosaurCollection.findOne({ _id: new ObjectId(id) });
        if (!dino) {return null;}
        return fromModeltoDinosaur(dino);
    },
  },
  Mutation: {
    // Create a new dinosaur
    createDinosaur: async (_: unknown, { name, family }: { name: string; family: string }) => {
        const dino = await dinosaurCollection.insertOne({ name, family });
        return {
          id: dino.insertedId.toString(),
          name,
          family,
        };
    },
    eliminateDinosaur:async(_:unknown,{id}:{id:string})=>{
      const dino = await dinosaurCollection.deleteOne({_id:new ObjectId(id)});
      if(dino.deletedCount===0){
        return("No se encontro el dinosaurio")
      }
      return("Dinosaurio eliminado");
    },
  },
};

// Start Apollo Server
const server = new ApolloServer({ typeDefs: schemaGQL, resolvers });

const { url } = await startStandaloneServer(server, {
  listen: { port: 3000 },
});
console.log(`Server running on: ${url}`);
