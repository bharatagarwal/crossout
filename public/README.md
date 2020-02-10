Setting up the document structure
-----

- Referred to localhost:3000/doc for documentation, and sent a few `POST` requests via Postman in order to populate the todo list.

- Using the HTML/CSS provided by Launch School as a base for my application, placed script in the `public/javascripts` folder.

- The given HTML file's body consisted only of handlebars templates, this made me want to avoid putting the script at the end of the body tag, because the `main_template` handlebar consisted of almost the entire contents of what would be expected in the body tag.

- Inserted script into the `index/html` file inside the `<head>` section, adding the `defer`. Scripts with the `defer` attribute execute after the document is loaded and parsed, right before the `DOMContentLoaded` event fires.

Setting up the application
------


- Initiate the render process via `Render.init`. This collected all the handlebars from the `body` element, and stored them in a collection inside `Render.handlebars`.

- Since handlebars had been stored, removed them from DOM

- Identified the partials within the handlebars, and registered each via `Handlerbars.registerPartial`

- After groundwork for handlebars is done, initiate Application with `Application.init`. This will only consist of the task of getting the todos

- Upon a successful load of JSON response from server, store the values in the array at `TodoInventory.list`. Also, store `due_date` properties for each Todo item received, as this will be useful later.


- Render the main template with the given todos, and bind events for create, read, update and delete.

In order to render the template, we need to provide the following data for the following:

**Sidebar**:  
all_todos_template: 'todos': uses todos.length  
all_list_template: 'todos_by_date', which has a key of due_date and value of todos that have that due_date  
completed_todos_template: 'done', array of all done todos  
completed_list_template 'done_todos_by_date', key of due_date and value of completed todos that have that done date  

**Title**:  
title_template: 'current_section', object with keys 'title' and 'data'. 'title' will be either be based on listType ('All Todos'/'Completed') or dueDate(for completed or all todos), as well of count of the relevant array  

**List of Todos**:   
list_template: 'selected', takes an array of selected todo objects which have an id, completed, title and due_date. this will have non-completed todos first, and then completed todos. This responsibility can be delegated to the TodoInventory object.  

The latter two templates will need data about which list and what the completion state is, and I pass that along as listType and dueDate.

Application Details
-----

Four main objects that handle responsibilities: Application, TodoInventory, Render, Request.

**Application**  
takes care of binding events, formatting form data, removing placeholders from forms and so on.

**Request**  
takes care of making requests for the applaction.

**Render**  
takes care of the templates, and choosing the right information to render to the program.

**TodoInventory**  
 is used to process the todo information, and getting the relevant data for the handlebar templates.

Notes
----
Use of arrow functions has been invaluable in ensuring that context is maintained in the case of nested callbacks.
