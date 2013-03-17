
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , mongoose = require('mongoose');

var port = process.env.PORT || 3000;

var app = module.exports = express.createServer();

//mongoose.connect('mongodb://localhost/todo_development')

function validatePresenceOf(value) {
  return value && value.length;
}

var Schema = mongoose.Schema;

var ObjectId = Schema.ObjectId;

var Task = new Schema({
  task : { type: String, validate: [validatePresenceOf, 'a task is required'] }
});


var Task = mongoose.model('Task', Task);

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.compiler({ src : __dirname + '/public', enable: ['less']}));
  app.use(express.cookieParser());
  app.use(express.session({ secret: "OZhCLfxlGp9TtzSXmJtq" }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  //app.use(express.cookieParser());
  //app.use(express.session({secret: "y68JJylxpxYPWvoahY6O"}));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Compatible

// Now less files with @import 'whatever.less' will work(https://github.com/senchalabs/connect/pull/174)
var TWITTER_BOOTSTRAP_PATH = './vendor/twitter/bootstrap/less';
express.compiler.compilers.less.compile = function(str, fn){
  try {
    var less = require('less');var parser = new less.Parser({paths: [TWITTER_BOOTSTRAP_PATH]});
    parser.parse(str, function(err, root){fn(err, root.toCSS());});
  } catch (err) {fn(err);}
}

// Routes

app.get('/', routes.index);

app.get('/tasks', function(req, res) {
    
  Task.find({}, function(err, docs) {
  res.render('tasks/index', {
    title: 'Todos index view',
    docs: docs,
    flash: req.flash()
    }); 
  });
});

app.get('/tasks/new', function(req, res) {
  res.render('tasks/new.jade', {
    title: 'New task',
    flash: req.flash()
  });
});

app.post('/tasks', function(req, res) {
  var task = new Task(req.body.task);
  task.save(function(err) {
    if(!err) {
      req.flash('info', 'Task created');
      res.redirect('/tasks');
    } else {
      req.flash('warning', err);
      res.redirect('/tasks/new');
    }
  });
});

app.get('/tasks/:id/edit', function(req, res) {

  Task.findById(req.params.id, function(err, doc) {
    res.render('tasks/edit', {
      title: 'Edit task view',
      task: doc
    });
  });
});


app.put('/tasks/:id', function(req, res) {
  Task.findById(req.params.id, function(err, doc) {
    doc.task = req.body.task.task;
    doc.save(function(err) {
      if(!err) {
        req.flash('info', 'Task updated');
        res.redirect('/tasks');
      } else {
        req.flash('warning', err);
        res.redirect('/tasks/' + req.params.id + '/edit');
      }
    });
  })
});


app.del('/tasks/:id', function(req, res) {
  Task.findById(req.params.id, function(err, doc) {
    if(!doc) {
      return next(new NotFound('Document not found'));
    } 
    doc.remove(function() {
      req.flash('info', 'Task deleted');
      res.redirect('/tasks');
    });
  });
});


app.listen(port, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});








