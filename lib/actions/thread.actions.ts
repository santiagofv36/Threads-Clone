"use server";

import { connectToDB } from "@/lib/mongoose";
import Thread from "@/lib/models/thread.model";
import User from "@/lib/models/user.model";
import { revalidatePath } from "next/cache";


interface IThread {
    text: string;
    author:string;
    communityId: string | null;
    path: string;
}

export const CreateThread = async ({
    text,
    author,
    communityId,
    path
}: IThread) => {

    try{

        connectToDB();
        const createThread = await Thread.create({
            text,
            author,
            community: null,
        });

        await User.findByIdAndUpdate(author, {
            $push: { threads: createThread._id },
        });

        revalidatePath(path);

    }catch(e:any){
        throw new Error(`Error Posting Thread: ${e.message}`)
    }

}