import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export interface Todo {
  id: number;
  todo: string;
  completed: boolean;
  userId: number;
}

export interface TodosResponse {
  todos: Todo[];
  total: number;
  skip: number;
  limit: number;
}

@Injectable({
  providedIn: 'root',
})
export class TodosService {
  private apiUrl = 'http://localhost:3000/todos';

  constructor() {}

  getTodos(limit = 10): Observable<TodosResponse> {
    return from(
      fetch(`${this.apiUrl}?_limit=${limit}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
        .then((res) => res.json())
        .then((todos) => ({
          todos: todos.map((todo: any) => ({
            ...todo,
            id: Number(todo.id),
          })),
          total: todos.length,
          skip: 0,
          limit: limit,
        }))
    );
  }

  getTodoById(id: number): Observable<Todo> {
    return from(
      fetch(`${this.apiUrl}/${Number(id)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((todo: any) => ({
          ...todo,
          id: Number(todo.id),
        }))
    );
  }

  updateTodo(id: number, completed: boolean): Observable<Todo> {
    return from(
      fetch(`${this.apiUrl}/${Number(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((todo: any) => ({
          ...todo,
          id: Number(todo.id),
        }))
    );
  }

  addTodo(todo: string, userId: number = 1, nextId?: number): Observable<Todo> {
    return from(
      fetch(`${this.apiUrl}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: Number(nextId),
          todo,
          completed: false,
          userId,
        }),
      })
        .then((res) => res.json())
        .then((newTodo: any) => ({
          ...newTodo,
          id: Number(newTodo.id),
        }))
    );
  }

  deleteTodo(id: number): Observable<Todo> {
    return from(
      fetch(`${this.apiUrl}/${Number(id)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((todo: any) => ({
          ...todo,
          id: Number(todo.id),
        }))
    );
  }
}
