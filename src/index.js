const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  users.some((user) => user.username === username)
    ? next()
    : response.status(404).json({ error: "user not found!" });
} // DONE

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const user = {
    id: uuidv4(),
    name: name,
    username: username,
    todos: [],
  };

  if (users.some((user) => user.username === username)) {
    response.status(400).json({ error: "username already taken!" });
  } else {
    users.push(user);

    response.status(201).json(user);
  }
}); // DONE

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;

  const foundUser = users.find((user) => user.username === username);

  response.status(200).json(foundUser.todos);
}); // DONE

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { title, deadline } = request.body;

  const foundUser = users.find((user) => user.username === username);

  const todo = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  foundUser.todos.push(todo);

  response.status(201).send(todo);
}); // DONE

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { title, deadline } = request.body;

  const foundUser = users.find((user) => user.username === username);

  if (foundUser.todos.some((todo) => todo.id === request.params.id)) {
    const foundTodo = foundUser.todos.find(
      (todo) => todo.id === request.params.id
    );

    foundTodo.title = title;
    foundTodo.deadline = new Date(deadline);
    foundTodo.done = false;

    response.status(200).json(foundTodo);
  } else {
    response.status(404).json({ error: "todo not found!" });
  }
}); // DONE

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;

  const foundUser = users.find((user) => user.username === username);

  if (foundUser.todos.some((todo) => todo.id === request.params.id)) {
    const foundTodo = foundUser.todos.find(
      (todo) => todo.id === request.params.id
    );

    foundTodo.done = true;

    response.status(200).json(foundTodo);
  } else {
    response.status(404).json({ error: "todo not found!" });
  }
}); // DONE

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;

  const foundUser = users.find((user) => user.username === username);

  if (foundUser.todos.some((todo) => todo.id === request.params.id)) {
    const i = foundUser.todos.findIndex(
      (todo) => todo.id === request.params.id
    );

    foundUser.todos.splice(i, 1);

    response.status(204).send();
  } else {
    response.status(404).json({ error: "todo not found!" });
  }
}); // Done

module.exports = app;
