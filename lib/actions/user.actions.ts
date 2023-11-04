"use server";

import { connectToDB } from "@/lib/mongoose";
import User from "@/lib/models/user.model";
import { revalidatePath } from "next/cache";
import Thread from "@/lib/models/thread.model";
import { FilterQuery, SortOrder } from "mongoose";

interface IUser {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
}
/**
 * Updates a user's information in the database.
 * @param {IUser} user - The user object containing the updated information.
 * @param {string} user.userId - The ID of the user.
 * @param {string} user.username - The username of the user.
 * @param {string} user.name - The name of the user.
 * @param {string} user.bio - The bio of the user.
 * @param {string} user.image - The image URL of the user.
 * @param {string} user.path - The path of the user.
 * @returns {Promise<void>} - A promise that resolves when the user is updated.
 */
export async function updateUser({
  userId,
  username,
  name,
  bio,
  image,
  path,
}: IUser): Promise<void> {
  connectToDB();
  try {
    await User.findOneAndUpdate(
      { id: userId },
      {
        username: username.toLowerCase(),
        name,
        bio,
        image,
        onboarded: true,
      },
      {
        upsert: true,
      }
    );

    if (path === "/profile/edit") {
      revalidatePath(path);
    }
  } catch (err: any) {
    throw new Error(`Failed to create/update user: ${err.message}`);
  }
}

/**
 * Fetches a user from the database.
 * @param {string} userId - The ID of the user to fetch.
 * @returns {Promise<User>} - A promise that resolves with the fetched user.
 * @throws {Error} - If there is an error fetching the user.
 */
export async function fetchUser(userId: string) {
  try {
    connectToDB();

    return await User.findOne({ id: userId });
    // .populate({
    //     path:'communities',
    //     model: Community,
    // });
  } catch (err: any) {
    throw new Error(`Failed to fetch user: ${err.message}`);
  }
}

/**
 * Fetches a user's posts from the database.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<User>} - A promise that resolves with the fetched user's posts.
 */
export async function fetchUserPosts(userId: string) {
  try {
    connectToDB();
    //TODO: Populate with community
    return await User.findOne({ id: userId }).populate({
      path: "threads",
      model: Thread,
      populate: {
        path: "children",
        model: Thread,
        populate: {
          path: "author",
          model: User,
          select: "name id image",
        },
      },
    });
  } catch (err: any) {
    throw new Error(`Failed to fetch user posts: ${err.message}`);
  }
}

interface IFetchUsers {
  userId: string;
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder;
}
/**
 * Fetches users from the database based on search criteria.
 * @param {IFetchUsers} options - The options for fetching users.
 * @param {string} options.userId - The ID of the user making the request.
 * @param {string} [options.searchString=""] - The search string to filter users by.
 * @param {number} [options.pageNumber=1] - The page number to fetch.
 * @param {number} [options.pageSize=20] - The number of users to fetch per page.
 * @param {SortOrder} [options.sortBy="desc"] - The sort order for the fetched users.
 * @returns {Promise<{ users: User[], isNext: boolean }>} - A promise that resolves with the fetched users and a flag indicating if there are more users to fetch.
 */
export async function fetchUsers({
  userId,
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc",
}: IFetchUsers) {
  try {
    connectToDB();

    const skipAmount = pageSize * (pageNumber - 1);

    const regex = new RegExp(searchString, "i");

    const query: FilterQuery<typeof User> = {
      id: { $ne: userId },
    };

    if (searchString.trim() !== "") {
      query.$or = [{ username: { $regex: regex }, name: { $regex: regex } }];
    }

    const sortOptions = { createdAt: sortBy };

    const usersQuery = User.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize);

    const totalUsersCount = await User.countDocuments(query);

    const users = await usersQuery.exec();

    const isNext = totalUsersCount > skipAmount + users.length;

    return {
      users,
      isNext,
    };
  } catch (err: any) {
    throw new Error(`Failed to fetch users: ${err.message}`);
  }
}

/**
 * Fetches the activity of a user from the database.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Thread[]>} - A promise that resolves with an array of threads representing the user's activity.
 * @throws {Error} - If there is an error fetching the activity.
 */
export async function getActivity(userId: string) {
  try {
    connectToDB();

    const userThreads = await Thread.find({ author: userId });

    // * Collect all the child thread ids (replies) from the 'children' field

    const childThreadIds = userThreads.reduce((acc, userThread) => {
      return acc.concat(userThread.children);
    }, []);

    return await Thread.find({
      _id: { $in: childThreadIds },
      author: { $ne: userId },
    }).populate({
      path: "author",
      model: User,
      select: "name image _id",
    });
  } catch (err: any) {
    throw new Error(`Failed to fetch activity: ${err.message}`);
  }
}
