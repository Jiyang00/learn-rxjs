import { Observable} from 'rxjs'
import {createTodoItem} from "./lib";
import {observable} from "rxjs/symbol/observable";


const $input = <HTMLInputElement>document.querySelector('.todo-val');
const $list = <HTMLUListElement>document.querySelector('.list-group');
const $add = document.querySelector('.button-add');

const enter$ = Observable.fromEvent<KeyboardEvent>($input,'keydown')
    .filter(r => r.keyCode === 13)
const clickAdd$ = Observable.fromEvent<MouseEvent>($add, 'click');
const input$ = enter$.merge(clickAdd$);
const item$ = input$
    .map(() => $input.value)
    .filter(r => r !== '')
    .map(createTodoItem)
    .do((ele: HTMLLIElement) => {
      $list.appendChild(ele);
      $input.value = '';
    })
    .publish(1)
    .refCount();
const toggle$ = item$
    .mergeMap($todoItem => {
      return Observable.fromEvent<MouseEvent>($todoItem, 'click')
          .mapTo($todoItem)
    })
    .do(($todoItem: HTMLElement) => {
      $todoItem.classList.toggle('done')
    });
const remove$ = item$
    .mergeMap($todoItem => {
      const $remove = $todoItem.querySelector('.button-remove');
      return Observable.fromEvent<MouseEvent>($remove,'click')
          .mapTo($todoItem)
    })
    .do(($todoItem:HTMLElement) => {
      const $parent = $todoItem.parentNode
      $parent.removeChild($todoItem)
    });

const app$ = toggle$.merge(remove$)
    .do(e => console.log(e))
app$.subscribe();
// app$.subscribe();
