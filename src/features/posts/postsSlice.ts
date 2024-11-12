import { createSlice } from "@reduxjs/toolkit";

export const fakePostsData = [
  {
    id: "1",
    title: "Exploring the Mountains",
    content:
      "Last weekend, I went hiking in the mountains. The view was breathtaking and the experience was unforgettable. I highly recommend it to anyone looking for an adventure.",
    author: "John Doe",
    timestamp: new Date("2023-10-01T10:30:00").toISOString(),
  },
  {
    id: "2",
    title: "A Day in the Life of a Software Engineer",
    content:
      "Being a software engineer is both challenging and rewarding. From coding to debugging, every day brings new opportunities to learn and grow. Here's a glimpse into my typical day.",
    author: "Jane Smith",
    timestamp: new Date("2023-10-02T14:45:00").toISOString(),
  },
  {
    id: "3",
    title: "The Future of Technology",
    content:
      "Technology is evolving at a rapid pace. From AI to blockchain, the future holds exciting possibilities. In this post, I explore some of the most promising trends and what they mean for us.",
    author: "Alice Smith",
    timestamp: new Date("2023-10-03T09:00:00").toISOString(),
  },
  {
    id: "4",
    title: "Healthy Eating Tips",
    content:
      "Maintaining a healthy diet is crucial for overall well-being. In this post, I share some tips and recipes that have helped me stay on track with my nutrition goals.",
    author: "Bob Johnson",
    timestamp: new Date("2023-10-04T12:00:00").toISOString(),
  },
  {
    id: "5",
    title: "Traveling the World",
    content:
      "Traveling opens up new perspectives and experiences. From the bustling streets of Tokyo to the serene beaches of Bali, here are some of my favorite travel destinations.",
    author: "Charlie Brown",
    timestamp: new Date("2023-10-05T16:30:00").toISOString(),
  },
  {
    id: "6",
    title: "The Importance of Mental Health",
    content:
      "Mental health is just as important as physical health. In this post, I discuss the importance of taking care of your mental well-being and share some strategies that have worked for me.",
    author: "Diana Prince",
    timestamp: new Date("2023-10-06T08:15:00").toISOString(),
  },
  {
    id: "7",
    title: "Learning a New Language",
    content:
      "Learning a new language can be challenging but incredibly rewarding. Here are some tips and resources that have helped me on my journey to becoming fluent in Spanish.",
    author: "Eve Adams",
    timestamp: new Date("2023-10-07T11:45:00").toISOString(),
  },
];

export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  timestamp: string;
}

export interface PostsState {
  posts: Post[];
}

// fake initial state, should be empty
const initialState: PostsState = {
  posts: fakePostsData,
};

export const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {},
});

export default postsSlice.reducer;
