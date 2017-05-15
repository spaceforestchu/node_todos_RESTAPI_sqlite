var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var app = express();
var PORT = process.env.PORT || 3000;

var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.send('Todo API ROOT')
});

app.get('/todos', function(req, res){

  var query = req.query;
  var where = {};

  if (query.hasOwnProperty('completed') && query.completed === 'true') {
    where.completed = true;
  } else if (query.hasOwnProperty('completed') && query.completed === 'false') {
    where.completed = false;
  }

  if (query.hasOwnProperty('q') && query.q.length > 0) {
    where.description = {
      $like: '%' + query.q + '%'
    };
  }

  db.todo.findAll( {where: where}).then(function (todos) {
    res.json(todos);
  }, function(e) {
    res.status(500).send();
  });


  // var filteredTodos = todos;
  //
  // if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
  //   filteredTodos = _.where(filteredTodos, {completed: true});
  // } else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
  //   filteredTodos = _.where(filteredTodos, {completed: false});
  // }
  //
  //
  // if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
  //   filteredTodos = _.filter(filteredTodos, function (todo) {
  //     return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
  //   });
  // }
  //
  //
  // res.json(filteredTodos);
});

app.get('/todos/:id', function(req, res){
  var todoId = parseInt(req.params.id, 10);

  db.todo.findById(todoId)
    .then(function (todo) {
      if (!!todo) {
        res.json(todo.toJSON());
      } else {
        res.status(404).send();
      }
    }, function(e){
      res.status(500).send();
    });

  // var matchedTodo = _.findWhere(todos, {id: todoId});
  //
  // if (matchedTodo) {
  //   res.json(matchedTodo);
  // } else {
  //   res.status(404).send();
  // }
});

app.post('/todos', function(req, res){
  var body = _.pick(req.body, 'description', 'completed');

  db.todo.create(body)
    .then(function(todo) {
      res.json(todo.toJSON());
    }, function(e) {
      res.status(400).json(e);
    });


  // if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
  //   return res.status(400).send();
  // }
  // body.description = body.description.trim();
  // body.id = todoNextId++;
  // todos.push(body);
  // res.json(body)
});

app.delete('/todos/:id', function(req, res) {
  var todoId = parseInt(req.params.id, 10);
  console.log(todoId);

  db.todo.findById(todoId).then(function(todo){
        if (todo)
            return todo.destroy();
        else
            res.status(404).send('Unable to delete');
    }).then(function(todo){
        res.json(todo);
    }).catch(function(err){
        console.log(err);
        res.status(500).send();
    });


  // var matchedTodo = _.findWhere(todos, {id: todoId});
  //
  // if(!matchedTodo) {
  //   res.status(404).json({"error": "no todo found with that id"});
  // } else {
  //   todos = _.without(todos, matchedTodo);
  //   res.json(matchedTodo);
  // }
});


app.put('/todos/:id', function(req, res){
  var todoId = parseInt(req.params.id, 10);
  //var matchedTodo = _.findWhere(todos, {id: todoId});
  var body = _.pick(req.body, 'description', 'completed');
  //var validAttributes = {};
  var attributes = {};

  if(body.hasOwnProperty('completed') ) {
    attributes.completed = body.completed;
  }

  if (body.hasOwnProperty('description') ) {
    attributes.description = body.description;
  }
  console.log(todoId);
  db.todo.findById(todoId)
    .then(function (todo) {
      if (todo) {
        return todo.update(attributes);
      } else {
        res.status(404).send();
      }
    }, function () {
      res.status(500).send();
    })
    .then( function (todo) {
      res.json(todo.toJSON());
    }, function(e){
      console.log(e);
      res.status(400).json(e);
    })


  // if(!matchedTodo) {
  //   return res.status(404).send();
  // }

  // if(body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
  //   validAttributes.completed = body.completed;
  // } else if (body.hasOwnProperty('completed')) {
  //   return res.status(400).send();
  // }
  //
  // if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
  //   validAttributes.description = body.description;
  // } else if (body.hasOwnProperty('description')) {
  //   return res.status(400).send();
  // }
  //
  //  _.extend(matchedTodo, validAttributes);
  //
  //  res.json(matchedTodo);
});

db.sequelize.sync()
  .then(function() {
    app.listen(PORT, function(){
      console.log('Express Listening on port ' + PORT + '!');
    });
  })
