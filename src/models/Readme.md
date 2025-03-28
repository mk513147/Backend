# Understanding Model and Schema in Mongoose through the Video model

Mongoose is an Object Data Modeling (ODM) library for MongoDB, which helps manage and interact with MongoDB databases using JavaScript/TypeScript. In your code, two key concepts are used: **Schema** and **Model**. Let's break them down step by step.

---

## **Step 1: What is a Schema?**

A **Schema** in Mongoose defines the structure of documents within a collection. It acts as a blueprint for what data fields a document should have, along with their types and constraints.

### **Schema in Your Code**

```js
const videoSchema = new Schema(
  {
    videoFile: {
      type: String, // Cloudinary URL
      required: true,
    },
    thumbnail: {
      type: String, // Cloudinary URL
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);
```

We can imagine the schema as a column headers of an excel table as it defines the structure of the data.

### **Schema as an Excel Table Header**

If your `videoSchema` was an **Excel spreadsheet**, it would look something like this:

| videoFile                         | thumbnail                         | title          | description           | duration | views | isPublished | owner                    |
| --------------------------------- | --------------------------------- | -------------- | --------------------- | -------- | ----- | ----------- | ------------------------ |
| https://cloudinary.com/video1.mp4 | https://cloudinary.com/thumb1.jpg | "First Video"  | "Awesome video!"      | 120      | 500   | true        | 65c1b1e9cfe24a001c3b1234 |
| https://cloudinary.com/video2.mp4 | https://cloudinary.com/thumb2.jpg | "Second Video" | "Another great video" | 240      | 1500  | false       | 65c1b1e9cfe24a001c3b5678 |

Each **row** in the table represents an **actual video document (record)** stored in MongoDB.

### **Explanation**

- **`new Schema({...})`** → Defines the structure of the **Video** document.
- Each field in the schema represents a **property** of the document:
  - `videoFile`: A **String** that stores the Cloudinary URL of the video file (**required**).
  - `thumbnail`: A **String** that stores the Cloudinary URL of the video thumbnail (**required**).
  - `title`: A **String** that represents the video title (**required**).
  - `description`: A **String** that provides details about the video (**required**).
  - `duration`: A **Number** that stores the video length in seconds (**required**).
  - `views`: A **Number** that tracks how many times the video has been viewed (**default: 0**).
  - `isPublished`: A **Boolean** indicating whether the video is published (**default: true**).
  - `owner`: A **reference (`ref: "User"`)** to the **User** who uploaded the video (**ObjectId** from the User collection).
- **`timestamps: true`** → Automatically adds `createdAt` and `updatedAt` fields.

---

## **Step 2: What is a Model?**

A **Model** is a wrapper around a schema that allows interaction with the database. It provides methods to **create**, **read**, **update**, and **delete** (CRUD) documents.

### **Model in Your Code**

```js
export const Video = mongoose.model("Video", videoSchema);
```

### **Explanation**

- **`mongoose.model("Video", videoSchema)`**:
  - Creates a **Video** model using the **videoSchema**.
  - The **first argument** (`"Video"`) is the **collection name** (Mongoose will convert it to **videos** in MongoDB).
  - The **second argument** is the **schema** that defines the document structure.

Now, we can use the `Video` model to interact with MongoDB, such as:

```js
const newVideo = await Video.create({
  videoFile: "https://cloudinary.com/video.mp4",
  thumbnail: "https://cloudinary.com/thumbnail.jpg",
  title: "My First Video",
  description: "This is an awesome video!",
  duration: 120,
  owner: "65c1b1e9cfe24a001c3b1234", // A valid User ID
});
console.log(newVideo);
```

---

## **Step 3: What is `mongooseAggregatePaginate`?**

```js
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
```

- This is a **Mongoose plugin** that adds pagination support for aggregation queries.
- By applying this plugin:
  ```js
  videoSchema.plugin(mongooseAggregatePaginate);
  ```
  - It allows us to **fetch paginated results** when working with large datasets.

Example usage:

```js
const options = { page: 1, limit: 10 };
const paginatedVideos = await Video.aggregatePaginate(
  Video.aggregate(),
  options
);
console.log(paginatedVideos);
```

---

## **Step 4: Summary**

| Concept                                  | Explanation                                                                    |
| ---------------------------------------- | ------------------------------------------------------------------------------ |
| **Schema**                               | Defines the **structure** and **rules** for documents in a collection.         |
| **Model**                                | Provides an interface to interact with the MongoDB database (CRUD operations). |
| **Plugin (`mongooseAggregatePaginate`)** | Adds pagination support for complex queries.                                   |
