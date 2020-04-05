const path = require('path')
const express = require('express')
const ejs = require('ejs')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const expressSanitizer = require('express-sanitizer')

const app = express()
var port = process.env.PORT || 3000

const publicDirectoryPath = path.join(__dirname, '../public')
console.log(publicDirectoryPath)

const viewPath = path.join(__dirname,'./views')

app.set('view engine', 'ejs')
app.set('views', viewPath)
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static(publicDirectoryPath))
app.use(methodOverride("_method"))
app.use(expressSanitizer())

mongoose.connect("mongodb://localhost/blog-post", {useNewUrlParser: true} )

const blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
})

var Blog = mongoose.model("Blog", blogSchema)

// Blog.create({
//     title: "Test Blog",
//     image: "https://images.unsplash.com/photo-1581309638082-877cb8132535?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=750&q=80",
//     body: "this is the test blog guys"
// })

app.get('/', (req, res) => {
    res.redirect('/blogs')
})


app.get('/blogs', (req, res) => {
    Blog.find({}, function(err, blogs){
        if(err){
            console.log(err)
        } else {
            res.render('index', {blogs: blogs})
        }
    })
    
})


app.get('/blogs/new',(req, res) => {
    res.render('new')
})

app.post('/blogs', function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body)
    Blog.create(req.body.blog, function(err, newBlog){
        if(err) {
            console.log(err)
        } else {
            res.redirect("/blogs")
        }
    })
})

app.get('/blogs/:id', (req, res) => {
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            console.log(err)
        } else {
            res.render('show', {blog: foundBlog})
        }
    })
})

app.get('/blogs/:id/edit', (req, res) => {
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect('/blogs')
        } else{
            res.render('edit', {blog: foundBlog})
        }
    })
    
})

app.put("/blogs/:id", (req, res) => {
    req.body.blog.body = req.sanitize(req.body.blog.body)
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err){
            res.redirect('/blogs')
        } else {
            res.redirect('/blogs/' +req.params.id)
        }
    })
})

app.delete('/blogs/:id', (req, res) => {
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect('/blogs')
        } else {
            res.redirect('/blogs')
        }
    })
})

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})