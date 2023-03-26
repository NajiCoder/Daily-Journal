require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const port = process.env.PORT;
// Load the full build of lodash
const _ = require('lodash');
const ejs = require("ejs");

const homeStartingContent = "Welcome to our journaling website! With our user-friendly interface, you can easily create and manage your personal journal. Write down your thoughts, reflections, and experiences with ease. Plus, you have the option to delete your journals whenever you want, ensuring your privacy and security. Click on Write to start journaling today!";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// Add connection to MongoDb Atlas
const dbConnectionString = process.env.Atlas_Journal_Connection;

// Initialize Mongoose
mongoose.connect(dbConnectionString + "JournalDB");

// Create a Schema
const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  date: String
})

// Create a Model/Collection
const Post = mongoose.model("post", postSchema);


const date = getDate();

// find the date
function getDate(){
  // weekday in options is not working, so I added the weekday manually
  let days = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];
  let today = new Date();
  let currentday = today.getDay();
  let options = {
      day : "numeric",
      month : "long", 
  }

  let day = today.toLocaleDateString("en-Us", options);
  let time = today.toLocaleTimeString();
  let date = days[currentday]+" , "+day;
  let dateTime = `${date}, ${time}`
  return dateTime
}



app.get("/", async function(req, res){
  try {
    const postsList = await Post.find({});
    res.render("home", {homeContent: homeStartingContent, posts: postsList,});
  } catch(err){
    console.log(err);
  }
  
})

app.get("/about", function(req, res){
  res.render("about", {aboutPage: aboutContent});
})

app.get("/contact", function(req, res){
  res.render("contact", {contactPage: contactContent});
})

app.get("/compose", function(req, res){
  res.render("compose");
})

app.get("/posts/:postId", async function(req, res){
  // Use loadash to turn string to lowercase
  const requestedPostId = req.params.postId;
  
  // Find the correspondand post when "read more" is clicked by Id
  const storedPostId = await Post.findById(requestedPostId) ;
  res.render("post", {postTitle : storedPostId.title, postContent: storedPostId.content, postDate: storedPostId.date});
})

app.post("/compose", function(req, res){
  const post = new Post({
    title: req.body.postTitle,
    content : req.body.postContent,
    date: date
  })
  post.save();
  res.redirect("/");
})

app.post("/delete", async function(req, res){
  const postId = req.body.PostId;
  try {
    const deletedPost = await Post.findByIdAndDelete(postId);
    console.log(deletedPost.title);
  } catch(err){
    console.log(err);
  }
})


app.listen(port, function() {
  console.log("Server started on port 3000");
});
