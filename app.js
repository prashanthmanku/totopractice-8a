const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbpath = path.join(__dirname, "todoApplication.db");
const app = express();
app.use(express.json());

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () =>
      console.log(`server is Running at http://localhost:3001/`)
    );
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//get todos API 1
const hasPriorityAndStatusProperties = (requestQuery) => {
  return requestQuery.priority != undefined && requestQuery.status != undefined;
};
const hasPriorityProperty = (q) => q.priority != undefined;

const hasStatusPropertie = (q) => q.status != undefined;

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodoQuery = "";
  const { status, priority, search_q = "" } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      console.log("l11111");
      console.log(`${status}`);
      console.log(`${priority}`);
      getTodoQuery = `
                SELECT * 
                FROM 
                    todo
                WHERE todo LIKE '%${search_q}%'
                AND status='${status}'
                AND priority='${priority}';
            `;
      break;
    case hasPriorityProperty(request.query):
      console.log(`l22222`);
      getTodoQuery = `
                SELECT * 
                FROM todo
                WHERE todo LIKE '%${search_q}' 
                AND priority = '${priority}';
            `;
      break;
    case hasStatusPropertie(request.query):
      console.log("l33333");
      console.log(`${status}`);
      getTodoQuery = `
            SELECT *
            FROM todo 
            WHERE todo LIKE '%${search_q}'
            AND status = '${status}';
        `;
      break;
    default:
      console.log(`l44444444444`);
      getTodoQuery = `
            SELECT * 
            FROM todo
            WHERE todo LIKE '%${search_q}%';
        `;
  }

  data = await db.all(getTodoQuery);
  response.send(data);
});

//get specific todo API 1
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
        SELECT * FROM 
        todo
        WHERE id=${todoId};
    `;
  const todo = await db.get(getTodoQuery);
  response.send(todo);
});

// post todo API 3

app.post("/todos/", async (request, response) => {
  const todoDetails = request.body;
  const { id, todo, priority, status } = todoDetails;
  console.log(id, todo, priority, status);
  const postTodoQuery = `
        INSERT INTO todo
        (id,todo,priority,status)
        values
        (
            ${id},'${todo}','${priority}','${status}'
        );
        
    `;
  const to = await db.run(postTodoQuery);
  console.log(to);
  response.send("Todo Successfully Added");
});

//put todo based on id API 4
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, todo } = request.body;
  let data = null;
  let putTodoQuery = "";
  let s = `${status}`;
  console.log(s);
  let c1 = s != "undefined";
  console.log(`c1: ${c1}`);
  switch (true) {
    case c1:
      console.log("1 status");
      putTodoQuery = `
                UPDATE todo
                SET 
                  status='${status}'
                where id=${todoId};  
            `;
      await db.run(putTodoQuery);
      response.send("Status Updated");
      break;
    case `${priority}` != "undefined":
      console.log("2 priority");
      putTodoQuery = `
            UPDATE todo
             SET 
               priority='${priority}'
            WHERE id=${todoId};   
        `;
      await db.run(putTodoQuery);
      response.send("Priority Updated");
      break;

    case `${todo}` != undefined:
      console.log("3 todo");
      putTodoQuery = `
            UPDATE todo
            SET 
              todo='${todo}'
            WHERE id=${todoId};  
        `;
      await db.run(putTodoQuery);
      response.send("Todo Updated");
  }
});

//DELETE todo API 5
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deletetodoQuery = `
        DELETE FROM todo
        WHERE id=${todoId};
    `;
  await db.run(deletetodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
