"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { threadSchema } from "@/lib/validations/thread";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { CreateThread } from "@/lib/actions/thread.actions";

const PostThread = ({ userId }: { userId: string }) => {
  const [files, setFiles] = useState<File[]>([]);
  //   const { startUpload } = useUploadThing("media");
  const pathname = usePathname();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(threadSchema),
    defaultValues: {
      thread: "",
      accountId: userId,
    },
  });

  const onSumbit = async (values: z.infer<typeof threadSchema>) => {
    await CreateThread({
      text: values.thread,
      author: userId,
      path: pathname,
      communityId: null,
    });
    router.push("/");
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSumbit)}
        className=" mt-10 flex flex-col justify-start space-y-8"
      >
        <FormField
          control={form.control}
          name="thread"
          render={({ field }) => (
            <FormItem className="flex flex-col w-full gap-3">
              <FormLabel className="text-base-semibold text-light-2">
                Content
              </FormLabel>
              <FormControl className="no-focus border boder-dark-4 bg-dark-3 text-light-1">
                <Textarea rows={15} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="bg-primary-500">
          Post Thread
        </Button>
      </form>
    </Form>
  );
};

export default PostThread;
