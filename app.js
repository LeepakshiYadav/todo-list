//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
//const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const lodash = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set('strictQuery', false);
mongoose.connect('mongodb+srv://leepakshi:1@cluster0.1alvptg.mongodb.net/todolistDB');

const itemsSchema= new mongoose.Schema({ name: String});
const Item = mongoose.model('Item', itemsSchema);

const listSchema= new mongoose.Schema({name:String, items: [itemsSchema]});
const List= new mongoose.model("List",listSchema);

app.get("/", function(req, res) {

//const day = date.getDate();
Item.find(function(err,results){
  if(err)
  {
    console.log(err);
  }
  else{
    if(results.length==0)
    {
      const item1=new Item({name: "Buy Food"});
      const item2=new Item({name: "Cook Food"});
      const item3=new Item({name: "Eat Food"});

      Item.insertMany([item1,item2,item3],function(err){
        if(err){
          console.log(err);
        }
        else{
        }
      });
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: results});
    }
  }  
});
  
});

app.post("/", function(req, res){
  const list_name = req.body.list;
  const item = req.body.newItem;
  const task=new Item({name:item});

  if(list_name=="Today")
  {
    task.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:list_name},function(err,result){
      if(result){
        result.items.push(task);
        result.save();
        res.redirect("/"+list_name);
      }
    });
  }

});

app.post("/delete", function(req,res){
  const id=req.body.checkbox;
  const list_name = req.body.list;

  if(list_name=="Today")
  {
    Item.findByIdAndRemove(id,function(err){
      console.log(err);
    });
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name:list_name},{$pull:{items:{_id: id}}},function(err,foundList){
      if(!err)
      {
        res.redirect("/"+list_name);
      }
    });
  }
});

app.get("/:list", function(req,res){
  const list_name=lodash.capitalize(req.params.list);
  
  List.findOne({name:list_name},function(err,result){
      if(!result)
      {
        const my_list=new List({name:list_name});
        my_list.save();
        res.redirect("/"+list_name);
      }
      else
      {
        res.render("list",{listTitle: list_name,newListItems: result.items});
      }
  });
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
