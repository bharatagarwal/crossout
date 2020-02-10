let Render;
let TodoInventory;
let Application;

TodoInventory = {
  list: [],

  processDueDates: function() {
    this.list.forEach(todo => {
      if (todo.month !== '' && todo.year !== '') {
        todo.due_date = todo.month + '/' + todo.year;
      } else {
        todo.due_date = 'No Due Date';
      }
    });
  },

  getTodosByDate: function() {
    let todosByDate = {};

    this.list.forEach(todo => {
      todosByDate[todo.due_date] = todosByDate[todo.due_date] || [];
      todosByDate[todo.due_date].push(todo);
    });

    return todosByDate;
  },

  getDoneTodos: function() {
    return this.list.filter(todo => todo.completed === true);
  },

  getDoneTodosByDate: function() {
    let completedTodosByDate = {};

    this.getDoneTodos().forEach(todo => {
      completedTodosByDate[todo.due_date] = completedTodosByDate[todo.due_date] || [];
      completedTodosByDate[todo.due_date].push(todo);
    });

    return completedTodosByDate;
  },

  getTitleObject: function({ listType, dueDate }) {
    let obj = {};

    if (listType === 'all' && dueDate) {
      obj.title = dueDate;
      obj.data = this.list.filter(todo => todo.due_date === dueDate).length;
    } else if (listType === 'completed_items' && dueDate) {
      obj.title = dueDate;
      obj.data = this.getDoneTodos().filter(todo => todo.due_date === dueDate).length;
    } else if (listType === 'all' && !dueDate) {
      obj.title = 'All Todos'
      obj.data = this.list.length;
    } else {
      obj.title = 'Completed';
      obj.data = this.getDoneTodos().length;
    }

    return obj;
  },

  orderList: function(list) {
    let nonCompleted = list.filter(todo => todo.completed !== true);
    let completed = list.filter(todo => todo.completed);
    return nonCompleted.concat(completed);
  },

  filterList: function({ listType, dueDate }) {
    let relevantList;

    if (listType === 'all' && dueDate) {
      relevantList = this.list.filter(todo => todo.due_date === dueDate);
    } else if (listType === 'completed_items' && dueDate) {
      relevantList = this.getDoneTodos().filter(todo => todo.due_date === dueDate);
    } else if (listType === 'all' && !dueDate) {
      relevantList = this.list
    } else {
      relevantList = this.getDoneTodos();
    }

    return this.orderList(relevantList);
  },
};

Application = {
  bindEvents: function() {
    // delete
    $('tbody td.delete').on('click', (e) => {
      let deleteId = $(e.currentTarget).closest('tr').data('id');

      this.processCurrentListAndDueDate($('.active'));

      Request.deleteTodo(deleteId, this.listType, this.dueDate);
    });

    // new item
    $('main label[for=new_item]').on('click', (e) => {
      $('div#modal_layer').fadeIn(300);
      $('div#form_modal').css('top', '200px');
      $('div#form_modal').fadeIn(300);
      $('form').trigger('reset');

      this.task = 'create';

      $('input[type=submit]').on('click', (e) => {
        e.preventDefault();
        if ($('input#title').val().trim().length < 3) {
          alert('You must enter a title at least 3 characters long.');
          return;
        }

        let formData = this.formDataToJSON(new FormData($('form')[0]));
        this.prepareFormData(formData);
        Request.createTodo(formData);
      });
    });

    // complete -> new item or modify item
    $('button[name=complete]').on('click', (e) => {
      e.preventDefault();

      if (this.task === 'create') {
        alert('Cannot mark as complete as item has not been created yet!');
        return;
      }

      Request.updateTodo({ completed: true }, this.id, this.listType, this.dueDate);
    });

    // modify or toggle
    $('tbody td.list_item').on('click', (e) => {

      // modify
      if (e.target.tagName === 'LABEL') {
        e.preventDefault();
        this.task = 'update';
        this.id = parseInt(e.target.getAttribute('for').slice(5), 10);
        this.processCurrentListAndDueDate($('.active'));

        $('div#modal_layer').fadeIn(300);
        $('div#form_modal').css('top', '200px');
        $('div#form_modal').fadeIn(300);

        Request.getTodoForId(this.id);

        $('input[type=submit]').on('click', (e) => {
          e.preventDefault();
          
          if ($('input#title').val().trim().length < 3) {
            alert('You must enter a title at least 3 characters long.');
            return;
          }

          let formData = this.formDataToJSON(new FormData($('form')[0]));
          this.prepareFormData(formData);

          Request.updateTodo(formData, this.id, this.listType, this.dueDate);
        });

        // toggle
      } else {
        this.processCurrentListAndDueDate($('.active'));
        let id;

        if (e.target.tagName === 'SPAN') {
          id = parseInt($(e.target).closest('tr').data('id'), 10);
        } else {
          id = parseInt($(e.target).find('label').attr('for').slice(5));
        }
        
        let completionState = TodoInventory.list.filter(todo => todo.id === id)[0].completed;

        Request.updateTodo({ completed: !completionState }, id, this.listType, this.dueDate);
      }
    });

    // sidebar changes
    $('#sidebar').on('click', 'header, article dl', function(e) {
      let listType;
      let dueDate;

      if (this.tagName === 'HEADER') {
        listType = $(this).closest('section').attr('id');
        // 'completed_items' or 'all'
      } else {
        listType = $(this).closest('section').attr('id');
        dueDate = $(this).data('title');
      }

      Render.refreshMainTemplate({ listType: listType, dueDate: dueDate });
    });


    // exit modal on clicking outside
    $('div#modal_layer').on('click', function(e) {
      $('div#modal_layer').fadeOut(300);
      $('div#form_modal').fadeOut(300);
    });
  },

  formDataToJSON: function(formData) {
    var json = {};

    for (let pair of formData.entries()) {
      json[pair[0]] = pair[1];
    }

    return json;
  },

  prepareFormData(formDataJSON) {
    if (formDataJSON.due_day === 'Day') {
      delete formDataJSON.due_day;
    } else {
      let day = formDataJSON.due_day;
      delete formDataJSON.due_day;
      formDataJSON.day = day;
    }

    if (formDataJSON.due_month === 'Month') {
      delete formDataJSON.due_month;
    } else {
      let month = formDataJSON.due_month;
      delete formDataJSON.due_month;
      formDataJSON.month = month;
    }

    if (formDataJSON.due_year === 'Year') {
      delete formDataJSON.due_year;
    } else {
      let year = formDataJSON.due_year;
      delete formDataJSON.due_year;
      formDataJSON.year = year;
    }

    if (formDataJSON.description === '') delete formDataJSON.description;
  },

  updateValuesinModal(jsonObject) {
    $('#title').val(jsonObject.title);
    if (jsonObject.day.length > 0) $('#due_day').val(jsonObject.day);
    if (jsonObject.month.length > 0) $('#due_month').val(jsonObject.month);
    if (jsonObject.year.length > 0) $('#due_year').val(jsonObject.year);
    if (jsonObject.description.length > 0) $('[name=description]').val(jsonObject.description);
  },

  processCurrentListAndDueDate: function(jQueryNode) {
    if (jQueryNode[0].tagName === 'HEADER') {
      this.listType = jQueryNode.attr('id') === 'all_header' ? 'all' : 'completed_items';
    }

    if (jQueryNode[0].tagName === 'DL') {
      this.listType = jQueryNode.closest('article').attr('id') === 'all_lists' ? 'all' : 'completed_items';
      this.dueDate = jQueryNode.data('title');
    }
  },

  init: function() {
    Request.getTodos({ listType: 'all' });
  },
};

Request = {
  getTodos: function({ listType, dueDate }) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://localhost:3000/api/todos');

    xhr.responseType = 'json';
    xhr.send();

    xhr.addEventListener('load', (e) => {
      TodoInventory.list = xhr.response;
      TodoInventory.processDueDates();
      Render.refreshMainTemplate({ listType: listType, dueDate: dueDate });
    });
  },

  getTodoForId: function(id) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://localhost:3000/api/todos/' + id);
    xhr.send();
    xhr.responseType = 'json';
    xhr.addEventListener('load', (e) => {
      Application.updateValuesinModal(xhr.response);
    });
  },

  createTodo: function(jsObject) {
    let xhr = new XMLHttpRequest();
    let jsonObject = JSON.stringify(jsObject);

    xhr.open('POST', 'http://localhost:3000/api/todos');

    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.responseType = 'json';

    xhr.send(jsonObject);

    xhr.addEventListener('load', (e) => {
      this.getTodos({ listType: 'all' });
    });
  },

  updateTodo: function(jsObject, id, listType, dueDate) {
    let xhr = new XMLHttpRequest();
    let jsonObject = JSON.stringify(jsObject);

    xhr.open('PUT', 'http://localhost:3000/api/todos/' + id);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.responseType = 'json';

    xhr.send(jsonObject);

    xhr.addEventListener('load', (e) => {
      this.getTodos({ listType: listType, dueDate: dueDate });
    });
  },

  deleteTodo: function(todoId, listType, dueDate) {
    let xhr = new XMLHttpRequest();
    xhr.open('DELETE', `http://localhost:3000/api/todos/${todoId}`);
    xhr.send();
    xhr.addEventListener('load', () => {
      this.getTodos({ listType: listType, dueDate: dueDate });
    });
  },
};

Render = {
  gatherHandlebars: function() {
    this.handlebars = document.body.querySelectorAll(`[type='text/x-handlebars']`);
    this.handlebars = Array.from(this.handlebars);
  },

  removeHandlebarsFromDOM: function() {
    this.handlebars.forEach(node => node.remove());
  },

  registerPartials: function() {
    let partials = this.handlebars.filter(node => {
      return node.getAttribute('data-type') === 'partial';
    });

    partials.forEach(template => {
      Handlebars.registerPartial(template.id, template.textContent);
    });
  },

  findHandlebarById: function(givenId) {
    let found = this.handlebars.filter(handlebar => {
      return handlebar.id === givenId;
    });

    if (found.length === 1) {
      return found[0];
    } else {
      return null;
    }
  },

  clearTodoTable: function() {
    $('tbody').html('');
  },

  assignMainHandlebarCompiler: function() {
    let mainTemplate = this.findHandlebarById('main_template');
    this.mainHandlebarCompiler = Handlebars.compile(mainTemplate.textContent);
  },

  setActiveList: function({ listType, dueDate }) {
    $('.active').removeClass('active');

    if (listType === 'all' && dueDate) {
      $("article#all_lists dl[data-title='" + dueDate + "']").addClass('active');
    } else if (listType === 'completed_items' && dueDate) {
      $("article#completed_lists dl[data-title='" + dueDate + "']").addClass('active');
    } else if (listType === 'all' && !dueDate) {
      $("header#all_header").addClass('active');
    } else {
      $("header#all_done_header").addClass('active');
    }
  },

  refreshMainTemplate: function({ listType, dueDate }) {
    let passInData = {
      todos: TodoInventory.list,
      todos_by_date: TodoInventory.getTodosByDate(),
      done: TodoInventory.getDoneTodos(),
      done_todos_by_date: TodoInventory.getDoneTodosByDate(),
      current_section: TodoInventory.getTitleObject({ listType: listType, dueDate: dueDate }),
      selected: TodoInventory.filterList({ listType: listType, dueDate: dueDate }),
    };

    $('body').html(this.mainHandlebarCompiler(passInData));
    this.setActiveList({ listType: listType, dueDate: dueDate });
    Application.bindEvents();

  },

  init: function() {
    this.gatherHandlebars();
    this.removeHandlebarsFromDOM();
    this.registerPartials();
    this.assignMainHandlebarCompiler();
  }
};

Render.init(); // manages handlebars
Application.init();