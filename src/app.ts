import {Observable, Subject} from 'rxjs'
import {createTodoItem, mockHttpPost, mockToggle, search} from "./lib";
import {observable} from "rxjs/symbol/observable";
import {switchMap} from "rxjs/operator/switchMap";


const $input = <HTMLInputElement>document.querySelector('.todo-val');
const $list = <HTMLUListElement>document.querySelector('.list-group');
const $add = document.querySelector('.button-add');

const type$ = Observable.fromEvent<KeyboardEvent>($input,'keydown')
    .publish()
    .refCount();
const enter$ = type$
    .filter(r => r.keyCode === 13)
const clickAdd$ = Observable.fromEvent<MouseEvent>($add, 'click');
const input$ = enter$.merge(clickAdd$);

const clearInputSubject$ = new Subject<void>();
const item$ = input$
    .map(() => $input.value)
    .filter(r => r !== '')
    .distinct(null, clearInputSubject$)
    .switchMap(mockHttpPost)
    .map(createTodoItem)
    .do((ele: HTMLLIElement) => {
      $list.appendChild(ele);
      $input.value = '';
      clearInputSubject$.next()
    })
    .publishReplay(1)
    .refCount();
const toggle$ = item$
    .mergeMap($todoItem => {
      return Observable.fromEvent<MouseEvent>($todoItem, 'click')
          .debounceTime(300)
          .mapTo({
              data:{
                  _id: $todoItem.dataset['id'],
                  isDone: $todoItem.classList.contains('done')
              },$todoItem
          })
          .switchMap(result => {
              return mockToggle(result.data._id, result.data.isDone)
                  .mapTo(result.$todoItem)
          })
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

const search$ = type$
    .debounceTime(300)
    .filter(e => e.keyCode !== 13)
    .map(result => (<HTMLInputElement>result.target).value)
    .switchMap(search)
    .do((result: HttpResponse | null) => {
        const actived = document.querySelectorAll('.active')
        Array.prototype.forEach.call(actived, (item: HTMLElement) => {
            item.classList.remove('active')
        })
        if (result) {
            const item = document.querySelector(`.todo-item-${result._id}`)
            item.classList.add('active')
        }
    })
const app$ = toggle$.merge(remove$,search$)
app$.subscribe();
// app$.subscribe();
