let handlebars;
let todoInventory;

(function() {
  function removeHandlebarsFromDOM() {
    handlebars.forEach(node => node.remove());
  }

  function registerPartials() {
    let partialHandlebars = handlebars.filter(node => {
      return node.getAttribute('data-type') === 'partial'
    });

    partialHandlebars.forEach(handlebar => {
      Handlebars.registerPartial(handlebar.id, handlebar.textContent)
    });
  }

  function renderMainHandlebar() {
    $(document.body).prepend((Handlebars.compile(handlebars[0].textContent)({})));
  }

  function findHandlebarById(id) {
    return handlebars.filter(handlebar => handlebar.id === id)[0];
  }

  function retrieveTodos() {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://localhost:3000/api/todos');
    xhr.send();
    xhr.onload =() => {
      todoInventory = JSON.parse(xhr.response)
      populateTodos();
    };
  }

  function populateTodos() {
    todoInventory.forEach(todo => {
      if (todo.month !== "" && todo.year !=="") {
        todo.due_date = todo.month + ' / ' + todo.year;
      } else {
        todo.due_date = 'No Due Date';
      }
    });

    let itemPartialHandlebar = findHandlebarById('item_partial').textContent;
    let itemHandlebarCompiler = Handlebars.compile(itemPartialHandlebar);
    todoInventory.forEach(todo => {
      $('tbody').append(itemHandlebarCompiler(todo));
    });
  }

  function assignHandlerForDelete() {
    document.querySelector('tbody').addEventListener('click', function(e) {
      if (e.target.classList.contains('delete') || e.target.alt === 'Delete') {
        let deleteId = e.target.closest('tr').getAttribute('data-id');
        let xhr = new XMLHttpRequest();
        xhr.open('DELETE', `http://localhost:3000/api/todos/${deleteId}`);
        xhr.send();
        e.target.closest('tr').remove();
      }
    })
  }

  function renderTitle(title) {
    let titleHandlebar = handlebars.filter(handlebar => {
      return handlebar.id === 'title_template';
    })[0];

    let titleData = {};
    titleData.title = title;
    titleData.data = 0;

    let titleHandlebarContent = titleHandlebar.textContent;
    let titleHandlerbarCompiler = Handlebars.compile(titleHandlebarContent);
    $('div#items header').html(titleHandlerbarCompiler({current_section: titleData}));
  }

  handlebars = 
  removeHandlebarsFromDOM();
  registerPartials();
  renderMainHandlebar();
  retrieveTodos();
  renderTitle('All Todos');
  assignHandlerForDelete();
  
})();